/* The indie city: your full-detail Toronto model, shown exactly as it was authored.
   No tinting, no fog, no tone-mapping, no material or texture changes. Neutral flat lighting so every surface shows its own colour.
   Scroll flies you between six buildings (six services); "Explore" lets you fly anywhere yourself.
   Model: assets/downtown_toronto_yonge_and_dundas.glb (full quality). ?lite=1, phones and low-memory devices use assets/3d/city.glb. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N_STOPS = 8;                                   // 0 hero, 1 belief, 2..7 the six buildings
const CENTRE = new THREE.Vector3(-47, 0, -18);
/* the six tallest, best-spread buildings (x, roof y, z) in model metres, in flying order */
const LM = [
  { x: -147.3, y: 272, z: -275.8 }, { x: 41.8, y: 96.3, z: -294.8 }, { x: 182.2, y: 103.4, z: 35.6 },
  { x: -25.3, y: 109.1, z: 169 }, { x: -196.1, y: 111, z: 111.9 }, { x: -257.1, y: 103.9, z: -167.7 }
];

const body = document.body, html = document.documentElement, stick = $('#stick'), flight = $('#top'), canvas = $('#city');
const loadEl = $('#cityLoad'), pctEl = $('#cityPct'), barEl = $('#cityBar'), loadTxt = $('#cityLoad span');

function fail(why) {
  console.warn('city fallback:', why); body.classList.add('nocity');
  const v = $('#hero-video'); v.hidden = false; canvas.hidden = true; v.src = 'assets/hero.mp4'; v.load(); v.play().catch(() => {});
  loadEl.remove();
}

const IS_PHONE = matchMedia('(pointer: coarse)').matches && innerWidth < 900;   // phones and small tablets get a lighter scene
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); } catch (e) { fail('no webgl'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, IS_PHONE ? 1.25 : 2));
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;   // colours go to the screen untouched
renderer.shadowMap.enabled = !IS_PHONE; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;   // the city never moves, so shadows are drawn once
const scene = new THREE.Scene();
/* plain sky behind the city (also what any glass in the model sees through it) */
scene.background = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#8db4de'); gr.addColorStop(1, '#e3eef8'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
/* Neutral white light only (no colour tint), set up like a proper model viewer: a sun with soft shadows, a sky/ground fill,
   and soft reflections. Materials keep their authored shininess, glass and normal maps, so the model looks as it was made. */
/* what glass and metal reflect: a bright daytime sky over a neutral ground (this is what makes facades look real instead of black) */
const envScene = new THREE.Scene();
{
  const geo = new THREE.SphereGeometry(100, 48, 24), p = geo.attributes.position, col = [], top = new THREE.Color('#c4d3e6'), hor = new THREE.Color('#f7f7f6'), bot = new THREE.Color('#acaca8');
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 100, c = y > 0 ? hor.clone().lerp(top, Math.pow(y, 0.55)) : hor.clone().lerp(bot, Math.min(1, -y * 2.2)); col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); envScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
}
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.02).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, Math.PI * 0.12));
const sun = new THREE.DirectionalLight(0xffffff, Math.PI * 0.72);
sun.position.set(CENTRE_X() - 380, 700, CENTRE_Z() + 430); sun.target.position.set(CENTRE_X(), 0, CENTRE_Z()); scene.add(sun, sun.target);
sun.castShadow = !IS_PHONE; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.9; sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, { left: -620, right: 620, top: 620, bottom: -620, near: 10, far: 2200 }); sun.shadow.camera.updateProjectionMatrix();
function CENTRE_X() { return -47; } function CENTRE_Z() { return -18; }
const camera = new THREE.PerspectiveCamera(42, 1, 0.8, 4000);

/* ---- camera path: an aerial opening, a dive down into the street, then a street-level tour past all six buildings ----
   The street route comes from the model itself (assets/3d/street_path.json): it only ever uses open street, keeping clear of walls. */
const V = (x, y, z) => new THREE.Vector3(x, y, z), P_INTRO = 0.2, sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let street = await fetch('assets/3d/street_path.json').then(r => r.json()).catch(() => null);
if (!street) street = { y: 120, pts: LM.map(l => [l.x - 60, l.z + 60]), arrive: [0, 1, 2, 3, 4, 5] };   // safety net: a simple loop over the roofs
const SY = street.y, sp = street.pts.map(([x, z]) => V(x, SY, z)), STREET_N = sp.length, ARR = street.arrive, arriveU = ARR.map(i => i / Math.max(1, STREET_N - 1));
/* where the camera looks: ahead down the street, turning up to face each building as we pass it */
const rawLook = sp.map((p, i) => {
  const dir = sp[Math.min(STREET_N - 1, i + 3)].clone().sub(sp[Math.max(0, i - 3)]); dir.y = 0; dir.normalize();
  let look = V(p.x + dir.x * 30, SY + 3, p.z + dir.z * 30), best = 0;
  LM.forEach((l, k) => { const w = 1 - sstep(25, 170, Math.abs(i - ARR[k]) * 6); if (w > best) { best = w; const hd = Math.hypot(l.x - p.x, l.z - p.z); look = V(p.x + dir.x * 30, SY + 3, p.z + dir.z * 30).lerp(V(l.x, Math.min(l.y * 0.62, SY + hd * 1.1), l.z), w); } });
  return look;
});
const sLookPts = rawLook.map((_, i) => { const o = V(0, 0, 0); let n = 0; for (let k = -4; k <= 4; k++) { o.add(rawLook[Math.min(STREET_N - 1, Math.max(0, i + k))]); n++; } return o.multiplyScalar(1 / n); });
const hero = V(CENTRE.x + 300, 360, CENTRE.z + 470), heroLook = V(CENTRE.x - 20, 30, CENTRE.z - 40), belief = V(CENTRE.x + 60, 85, CENTRE.z + 330), beliefLook = V(CENTRE.x - 30, 70, CENTRE.z - 120);
const towerLook = V(LM[0].x, LM[0].y * 0.5, LM[0].z);
const introCam = new THREE.CatmullRomCurve3([hero, belief, V(sp[0].x, 330, sp[0].z), V(sp[0].x, 190, sp[0].z), V(sp[0].x, 80, sp[0].z), sp[0]], false, 'centripetal', 0.5);   // the last three points drop straight down the open street
const introLook = new THREE.CatmullRomCurve3([heroLook, beliefLook, towerLook, towerLook, towerLook, sLookPts[0]], false, 'centripetal', 0.5);
const sCam = new THREE.CatmullRomCurve3(sp, false, 'centripetal', 0.5), sLook = new THREE.CatmullRomCurve3(sLookPts, false, 'centripetal', 0.5);
function flightAt(p, pos, look) {
  if (p < P_INTRO) { const f = Math.min(0.9999, Math.max(0, (p / P_INTRO - 0.1) / 0.9)), e = f * f * (3 - 2 * f) * 0.35 + f * 0.65; introCam.getPoint(e, pos); introLook.getPoint(e, look); }
  else { const u = Math.min(0.9999, (p - P_INTRO) / (1 - P_INTRO)); sCam.getPoint(u, pos); sLook.getPoint(u, look); }
}
const stopP = i => (i === 0 ? 0 : i === 1 ? 0.1 : P_INTRO + arriveU[i - 2] * (1 - P_INTRO));      // dot / pin / hash -> where that building is on the scroll
const stopFromP = p => { if (p < 0.06) return 0; if (p < 0.13) return 1; const u = (p - P_INTRO) / (1 - P_INTRO); if (u <= 0) return 2; let k = 0, bd = 9; arriveU.forEach((au, i) => { const d = Math.abs(u - au); if (d < bd) { bd = d; k = i; } }); return 2 + k; };

/* ---- load the model: full quality first, with the compact copy as a safety net ---- */
const params = new URLSearchParams(location.search);
const smallDevice = matchMedia('(pointer: coarse)').matches && innerWidth < 900;
const FULL = 'assets/downtown_toronto_yonge_and_dundas.glb', LITE = 'assets/3d/city.glb';
const wantLite = params.has('lite') || smallDevice || (navigator.deviceMemory && navigator.deviceMemory < 4);
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
let loaded = false, modelName = '';

/* thousands of tiny meshes -> one mesh per material: identical pixels, far fewer draw calls */
function mergeByMaterial(root) {
  root.updateMatrixWorld(true);
  const buckets = new Map(), dead = [];
  root.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); dead.push(o);
    if (o.matrixWorld.determinant() < 0 && g.index) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const a = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = a; } g.index.needsUpdate = true; }   // mirrored objects keep their faces facing outwards
    const key = o.material.uuid + '|' + Object.keys(g.attributes).sort().join(',') + '|' + (g.index ? 1 : 0);
    if (!buckets.has(key)) buckets.set(key, { mat: o.material, list: [] }); buckets.get(key).list.push(g);
  });
  const out = new THREE.Group();
  buckets.forEach(({ mat, list }) => { const m = mergeGeometries(list, false); list.forEach(g => g.dispose()); if (m) out.add(new THREE.Mesh(m, mat)); });
  dead.forEach(o => o.geometry.dispose());
  return out;
}
/* Materials are left exactly as the model's author made them: colours, textures, normal maps, shininess, glass and sidedness.
   Only the texture sharpness is raised (anisotropic filtering) and every surface can cast and receive the sun's shadows. */
function prepare(gltf) {
  let meshes = 0; gltf.scene.traverse(o => { if (o.isMesh) meshes++; });
  const root = meshes > 400 ? mergeByMaterial(gltf.scene) : gltf.scene;
  const seen = new Set(), maxAniso = renderer.capabilities.getMaxAnisotropy();
  root.traverse(o => {
    if (!o.isMesh) return; o.frustumCulled = meshes <= 400; o.castShadow = true; o.receiveShadow = true;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
      if (seen.has(m)) return; seen.add(m);
      m.envMapIntensity = 0.85;
      if (m.transmission > 0) m.thickness = m.thickness || 0.1;
      [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.emissiveMap, m.aoMap].forEach(t => { if (t) t.anisotropy = maxAniso; }); m.needsUpdate = true;
    });
  });
  return root;
}
function onLoaded(gltf, name) {
  const root = prepare(gltf); scene.add(root); loaded = true; modelName = name; renderer.shadowMap.needsUpdate = true; readScroll();   // now the Explore button can show
  loadEl.classList.add('done'); setTimeout(() => loadEl.remove(), 900); fit(); render(0, true);
  if (location.hash) goHash();
}
function loadModel(url, isFallback) {
  loadTxt.textContent = url === LITE ? 'Building the city (light version)' : 'Building the city in full detail';
  loader.load(url, g => onLoaded(g, url), xhr => { if (xhr.total) { const p = Math.round((xhr.loaded / xhr.total) * 100); pctEl.textContent = p + '%'; barEl.style.width = p + '%'; } },
    err => { if (!isFallback && url !== LITE) { console.warn('full model failed, using the light copy', err); loadModel(LITE, true); } else fail(err); });
}
if (wantLite) loadModel(LITE, true);
else fetch(FULL, { method: 'HEAD' }).then(r => (r.ok ? loadModel(FULL, false) : loadModel(LITE, true))).catch(() => loadModel(LITE, true));

/* ---- scroll -> stop position (with a dwell on every stop) ---- */
const eased = p => Math.min(0.99999, Math.max(0, p));   // scroll maps straight onto the path: every small scroll moves the camera
let prog = 0, progT = 0, t = 0, active = -1, flightVis = true, exploring = false;
const range = () => Math.max(1, flight.offsetHeight - innerHeight);
const readScroll = () => { const y = scrollY - flight.offsetTop; progT = Math.min(1, Math.max(0, y / range())); flightVis = y < flight.offsetHeight + innerHeight * 0.2; body.classList.toggle('in-city', flightVis); $('#exploreBtn').classList.toggle('hide', !flightVis || !loaded); };
addEventListener('scroll', readScroll, { passive: true });
const stopY = i => flight.offsetTop + stopP(i) * range();
function goTo(i) { const y = stopY(i); window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.8 }) : scrollTo({ top: y, behavior: 'smooth' }); }
function goHash() { const m = /^#stop-(\d)$/.exec(location.hash); if (m) { const y = stopY(+m[1]); scrollTo(0, y); readScroll(); prog = progT; } }
addEventListener('hashchange', goHash);

/* ---- UI: panels, pins, dots ---- */
const fpHero = $('#fpHero'), fpBelief = $('#fpBelief'), fpSvc = $('#fpSvc'), hud = $('#exploreHud');
const pins = $$('.pin'), dots = $('#flDots');
for (let i = 0; i < N_STOPS; i++) { const b = document.createElement('button'); b.setAttribute('aria-label', i === 0 ? 'The city' : i === 1 ? 'The belief' : SERVICES[i - 2].title); b.addEventListener('click', () => goTo(i)); dots.appendChild(b); }
const show = (el, on) => { gsap.to(el, { opacity: on ? 1 : 0, y: on ? 0 : 20, filter: on ? 'blur(0px)' : 'blur(10px)', duration: on ? 0.9 : 0.35, ease: on ? 'expo.out' : 'power2.in', overwrite: true, onStart() { if (on) el.style.visibility = 'visible'; }, onComplete() { if (!on) el.style.visibility = 'hidden'; } }); el.style.pointerEvents = on ? 'auto' : 'none'; };
function fillService(k) {
  const s = SERVICES[k]; fpSvc.classList.remove('left'); stick.style.setProperty('--acc', s.c[0]);
  { const hsl = {}; new THREE.Color(s.c[0]).getHSL(hsl); stick.style.setProperty('--accd', new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s), Math.min(hsl.l, 0.36)).getStyle()); }   // a deeper shade of the accent for text on the light card   // cards always sit on the right so the big Explore button stays clear
  $('#rwNum').textContent = String(k + 1).padStart(2, '0') + ' / 06'; $('#rwTitle').textContent = s.title; $('#rwTag').textContent = s.tag; $('#rwWhat').textContent = s.what;
  svcIdx = k; useCardVideo(s.slug); $('#cdScene').textContent = String(k + 1).padStart(2, '0'); $('#cdIco').setAttribute('d', s.icon);
  $('#rwInc').innerHTML = s.includes.map((x, j) => '<li><span>' + x + '</span><i></i><b>' + String(j + 1).padStart(2, '0') + '</b></li>').join(''); $('#rwLink').href = 'services/' + s.slug + '.html';
  gsap.fromTo('#fpSvc .cd-body > *', { y: 26, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.06, duration: 0.9, ease: 'expo.out', overwrite: true });
}
/* the card's little screen plays a live preview of the building's topic */
const cdCanvas = $('#cdPreview'), cdCtx = cdCanvas.getContext('2d'), cdTc = $('#cdTc'), cdVideo = $('#cdVideo'), vidOk = {}; let svcIdx = -1;
/* If you save a clip as assets/cards/<building>.mp4 it plays on that building's card instead of the animated preview. */
function useCardVideo(slug) {
  const url = 'assets/cards/' + slug + '.mp4';
  const apply = ok => {
    if (svcIdx < 0 || SERVICES[svcIdx].slug !== slug) return;
    cdVideo.hidden = !ok; cdCanvas.style.display = ok ? 'none' : 'block';
    if (ok) { if (cdVideo.getAttribute('src') !== url) { cdVideo.src = url; cdVideo.load(); } cdVideo.play().catch(() => {}); } else cdVideo.pause();
  };
  if (slug in vidOk) apply(vidOk[slug]);
  else fetch(url, { method: 'HEAD' }).then(r => { vidOk[slug] = r.ok && +(r.headers.get('content-length') || 0) > 1000; apply(vidOk[slug]); }).catch(() => { vidOk[slug] = false; apply(false); });
}
/* lively wallpaper behind the card: drifting colour, a soft dot grid and floating film elements, in the building's colours */
const wall = $('#cdWall'), wg = wall.getContext('2d');
const FLOAT = ['frame', 'play', 'ring', 'spark', 'clap', 'dot', 'plus'];
const floaters = Array.from({ length: 18 }, (_, i) => ({ x: ((i * 37) % 100) / 100, y: ((i * 53) % 100) / 100, s: 11 + ((i * 29) % 22), sp: 0.006 + ((i * 17) % 10) / 1400, ph: i * 1.7, type: FLOAT[i % FLOAT.length], k: i % 2 }));
function drawWall(tt) {
  const r = Math.min(devicePixelRatio || 1, 1.5), w = fpSvc.clientWidth, h = fpSvc.scrollHeight || fpSvc.clientHeight;
  if (wall.width !== Math.round(w * r) || wall.height !== Math.round(h * r)) { wall.width = Math.round(w * r); wall.height = Math.round(h * r); wall.style.height = h + 'px'; }
  const W = wall.width / r, H = wall.height / r, c = SERVICES[svcIdx].c, ink = 'rgba(20,17,13,';
  wg.setTransform(r, 0, 0, r, 0, 0); wg.clearRect(0, 0, W, H);
  [[0.15, 0.1, c[0], 1], [0.9, 0.5, c[1], 0.9], [0.25, 0.95, c[0], 0.8]].forEach(([bx, by, col, sc], i) => {
    const x = (bx + Math.sin(tt * 0.25 + i * 2) * 0.12) * W, y = (by + Math.cos(tt * 0.2 + i * 1.7) * 0.1) * H, rad = Math.max(W, H) * 0.5 * sc, g = wg.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col + '70'); g.addColorStop(1, col + '00'); wg.fillStyle = g; wg.fillRect(0, 0, W, H);
  });
  wg.fillStyle = ink + '.08)'; for (let x = 9; x < W; x += 18) for (let y = 9; y < H; y += 18) wg.fillRect(x, y, 1.5, 1.5);
  floaters.forEach(f => {
    const x = (f.x + Math.sin(tt * f.sp * 9 + f.ph) * 0.04) * W, y = ((((f.y - tt * f.sp * 2.2) % 1) + 1) % 1) * H, s = f.s, col = c[f.k];
    wg.save(); wg.translate(x, y); wg.rotate(Math.sin(tt * 0.5 + f.ph) * 0.45); wg.lineWidth = 1.6; wg.strokeStyle = ink + '.26)'; wg.fillStyle = col + '66';
    if (f.type === 'frame') { wg.beginPath(); wg.roundRect ? wg.roundRect(-s * 0.8, -s * 0.55, s * 1.6, s * 1.1, 3) : wg.rect(-s * 0.8, -s * 0.55, s * 1.6, s * 1.1); wg.fill(); wg.stroke(); for (let k = -2; k <= 2; k++) wg.fillRect(k * s * 0.3 - 1.5, -s * 0.5, 3, 3); }
    else if (f.type === 'play') { wg.beginPath(); wg.moveTo(-s * 0.4, -s * 0.5); wg.lineTo(s * 0.55, 0); wg.lineTo(-s * 0.4, s * 0.5); wg.closePath(); wg.fillStyle = col + '99'; wg.fill(); wg.stroke(); }
    else if (f.type === 'ring') { wg.beginPath(); wg.arc(0, 0, s * 0.55, 0, TAU); wg.stroke(); for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; wg.beginPath(); wg.moveTo(Math.cos(a) * s * 0.15, Math.sin(a) * s * 0.15); wg.lineTo(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55); wg.stroke(); } }
    else if (f.type === 'spark') { wg.fillStyle = col + 'bb'; wg.beginPath(); wg.moveTo(0, -s * 0.6); wg.quadraticCurveTo(0, 0, s * 0.6, 0); wg.quadraticCurveTo(0, 0, 0, s * 0.6); wg.quadraticCurveTo(0, 0, -s * 0.6, 0); wg.quadraticCurveTo(0, 0, 0, -s * 0.6); wg.fill(); }
    else if (f.type === 'clap') { wg.fillStyle = ink + '.7)'; wg.fillRect(-s * 0.6, -s * 0.15, s * 1.2, s * 0.7); wg.fillStyle = col + 'dd'; wg.fillRect(-s * 0.6, -s * 0.55, s * 1.2, s * 0.32); wg.fillStyle = ink + '.8)'; for (let k = 0; k < 3; k++) wg.fillRect(-s * 0.5 + k * s * 0.4, -s * 0.55, s * 0.16, s * 0.32); }
    else if (f.type === 'dot') { wg.beginPath(); wg.arc(0, 0, s * 0.28, 0, TAU); wg.fillStyle = col + 'aa'; wg.fill(); }
    else { wg.beginPath(); wg.moveTo(-s * 0.4, 0); wg.lineTo(s * 0.4, 0); wg.moveTo(0, -s * 0.4); wg.lineTo(0, s * 0.4); wg.stroke(); }
    wg.restore();
  });
}
function drawPreview(tt) {
  if (svcIdx < 0 || fpSvc.style.visibility === 'hidden' || +fpSvc.style.opacity < 0.05) return;
  drawWall(tt);
  if (cdCanvas.style.display !== 'none') drawSketch(svcIdx, cdCtx, cdCanvas.width, cdCanvas.height, tt);
  const f = Math.floor(tt * 24); cdTc.textContent = String(Math.floor(tt / 60) % 60).padStart(2, '0') + ':' + String(Math.floor(tt) % 60).padStart(2, '0') + ':' + String(f % 24).padStart(2, '0');
}
function setActive(i) {
  if (i === active) return; active = i;
  $$('#flDots button').forEach((b, k) => b.classList.toggle('on', k === i));
  show(fpHero, i === 0); show(fpBelief, i === 1); show(fpSvc, i >= 2); body.classList.toggle('has-card', i >= 2);
  let label = '01 · The city'; $('#flHint').style.opacity = i === 0 ? 1 : 0;
  if (i === 1) label = '02 · The belief';
  if (i >= 2) { fillService(i - 2); label = '0' + (i + 1) + ' · ' + SERVICES[i - 2].title; }
  pins.forEach((p, k) => p.classList.toggle('on', i >= 2 && k === i - 2));
  dispatchEvent(new CustomEvent('stopchange', { detail: { stop: i, label } }));
}
[fpBelief, fpSvc].forEach(el => { el.style.opacity = 0; el.style.visibility = 'hidden'; });

/* ---- free exploration ---- */
const layer = $('#exploreLayer'), controls = new OrbitControls(camera, layer);
controls.enabled = false; controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.497; controls.minDistance = 5; controls.maxDistance = 1400; controls.screenSpacePanning = false; controls.zoomSpeed = 1.1; controls.rotateSpeed = 0.7;
const keys = {}; addEventListener('keydown', e => { if (!exploring) { if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && flightVis && loaded) enterExplore(); return; } if (e.key === 'Escape') exitExplore(); keys[e.key.toLowerCase()] = true; });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
const blend = { v: 0 }, tmpV = new THREE.Vector3(); const exitPos = new THREE.Vector3(), exitTarget = new THREE.Vector3(), flightPos = new THREE.Vector3(), flightLook = new THREE.Vector3(), fwd = new THREE.Vector3(), rgt = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
function enterExplore() {
  if (exploring || !loaded) return; exploring = true; body.classList.add('exploring'); html.classList.add('noscroll'); window.__lenis && window.__lenis.stop();
  gsap.killTweensOf(blend); blend.v = 0; flightAt(eased(prog), flightPos, tmpV); controls.target.copy(tmpV); controls.enabled = true; controls.update();
  show(fpHero, false); show(fpBelief, false); show(fpSvc, false); gsap.fromTo(hud, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
}
function exitExplore() {
  if (!exploring) return; exploring = false; controls.enabled = false; body.classList.remove('exploring'); html.classList.remove('noscroll'); window.__lenis && window.__lenis.start();
  exitPos.copy(camera.position); exitTarget.copy(controls.target); blend.v = 1; gsap.to(blend, { v: 0, duration: 1.6, ease: 'power3.inOut' }); active = -1; prog = progT;
}
function flyToBuilding(k) {
  gsap.to(camera.position, { x: sCam.getPoint(arriveU[k]).x, y: SY, z: sCam.getPoint(arriveU[k]).z, duration: 2.2, ease: 'power3.inOut', overwrite: true });
  gsap.to(controls.target, { x: sLook.getPoint(arriveU[k]).x, y: sLook.getPoint(arriveU[k]).y, z: sLook.getPoint(arriveU[k]).z, duration: 2.2, ease: 'power3.inOut', overwrite: true, onComplete: () => { fillService(k); fpSvc.classList.remove('left'); show(fpSvc, true); } });
  show(fpSvc, false);
}
$('#exploreBtn').addEventListener('click', enterExplore); $('#exploreExit').addEventListener('click', exitExplore);
$$('#exploreHud [data-fly]').forEach(b => b.addEventListener('click', () => flyToBuilding(+b.dataset.fly)));
pins.forEach(p => p.addEventListener('click', e => { const k = +p.dataset.i; if (exploring) { e.preventDefault(); e.stopPropagation(); flyToBuilding(k); return; } if (active === k + 2) return; e.preventDefault(); e.stopPropagation(); goTo(k + 2); }));

/* ---- size ---- */
function fit() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 62 : 42; camera.updateProjectionMatrix(); }
fit(); addEventListener('resize', fit);

/* ---- render ---- */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 }; addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; });
let lastT = 0;
function projectPins() {
  pins.forEach((p, i) => {
    tmpV.set(LM[i].x, LM[i].y + 6, LM[i].z).project(camera);
    const vis = tmpV.z < 1 && Math.abs(tmpV.x) < 1.15 && Math.abs(tmpV.y) < 1.1, isActive = !exploring && active >= 2 && i === active - 2;
    p.style.opacity = vis ? (!exploring && active >= 2 && !isActive ? 0.55 : 1) : 0; p.style.pointerEvents = vis ? 'auto' : 'none';
    p.style.transform = `translate(${((tmpV.x + 1) / 2) * innerWidth}px, ${((1 - tmpV.y) / 2) * innerHeight}px)`;
  });
}
function render(time, force) {
  t = time / 1000; const dt = Math.min(0.05, t - lastT); lastT = t; drawPreview(t);
  if (exploring) {
    camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize(); rgt.crossVectors(fwd, up).normalize();
    const v = (keys['shift'] ? 170 : 60) * dt; let mx = 0, mz = 0, my = 0;
    if (keys['w'] || keys['arrowup']) mz += 1; if (keys['s'] || keys['arrowdown']) mz -= 1; if (keys['d'] || keys['arrowright']) mx += 1; if (keys['a'] || keys['arrowleft']) mx -= 1; if (keys['r']) my += 1; if (keys['f']) my -= 1;
    if (mx || mz || my) { tmpV.set(0, 0, 0).addScaledVector(fwd, mz * v).addScaledVector(rgt, mx * v); tmpV.y += my * v; camera.position.add(tmpV); controls.target.add(tmpV); }
    if (camera.position.y < 3) { controls.target.y += 3 - camera.position.y; camera.position.y = 3; }
    controls.update(); projectPins(); renderer.render(scene, camera); return;
  }
  if (!force) { if (!flightVis && blend.v === 0) return; prog += (progT - prog) * (reduce ? 1 : 0.11); }
  const u = eased(prog);
  mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
  flightAt(u, flightPos, flightLook);
  const sway = reduce ? 0 : 1; flightPos.x += (Math.sin(t * 0.21) * 3 + mouse.x * 14 + Math.sin(t * 7.3) * 0.14 + Math.sin(t * 12.9 + 1.7) * 0.08) * sway; flightPos.y += (Math.cos(t * 0.17) * 2 - mouse.y * 8 + Math.sin(t * 5.9 + 0.6) * 0.12) * sway; flightLook.y += Math.sin(t * 6.1) * 0.1 * sway;   // a breath of handheld camera
  if (blend.v > 0) { camera.position.lerpVectors(flightPos, exitPos, blend.v); tmpV.lerpVectors(flightLook, exitTarget, blend.v); } else { camera.position.copy(flightPos); tmpV.copy(flightLook); }
  camera.lookAt(tmpV); setActive(stopFromP(u)); projectPins(); renderer.render(scene, camera);
}
renderer.setAnimationLoop(time => { if (loaded) render(time); });
readScroll(); prog = progT; setActive(0);
window.__city = { camera, scene, goTo, THREE, renderer, controls, enterExplore, exitExplore, get model() { return modelName; }, previewCard(k) { fillService(k); show(fpSvc, true); body.classList.add('has-card'); }, get dbg() { return { prog, progT, active, flightVis, loaded, exploring, blend: blend.v, STREET_N, top: flight.offsetTop, range: range() }; } };
