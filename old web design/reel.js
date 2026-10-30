/* Home: one continuous strip of film that runs forever. Each frame opens its own page. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = x => (reduce ? 0.01 : x);
  const N = SERVICES.length;
  const mod = (n, m) => ((n % m) + m) % m;
  const curtain = $('#curtain'), links = [...document.querySelectorAll('.idx a')];

  async function init() {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') throw new Error('libs');
    try { await Promise.race([Promise.all([document.fonts.load('italic 90px "Instrument Serif"'), document.fonts.load('700 14px "Inter Tight"')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}

    const canvas = $('#stage');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    /* atlas of all frames side by side; wraps so the reel loops seamlessly */
    const atlas = document.createElement('canvas'); atlas.width = CELL_W * N; atlas.height = CELL_H;
    const ag = atlas.getContext('2d');
    SERVICES.forEach((p, i) => ag.drawImage(makeCell(p, i), i * CELL_W, 0));
    const tex = new THREE.CanvasTexture(atlas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    /* one long ribbon, bent into a gentle S-curve that sweeps away at both ends */
    const FW = 2.4, L = FW * 8.4, H = FW * (CELL_H / CELL_W), REP = L / (N * FW), RR = 9;
    const geo = new THREE.PlaneGeometry(L, H, 280, 1), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), th = x / RR;
      pos.setXYZ(i, Math.sin(th) * RR, y + Math.sin(x * 0.28) * 0.3 + x * 0.05, (Math.cos(th) - 1) * RR * 0.9);
    }
    pos.needsUpdate = true; geo.computeBoundingSphere();
    const mat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.DoubleSide, depthWrite: false,
      uniforms: { uMap: { value: tex }, uOff: { value: 0 }, uHover: { value: -1 }, uFocus: { value: -1 }, uFocusAmt: { value: 0 }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec2 vUv;uniform sampler2D uMap;uniform float uOff,uHover,uFocus,uFocusAmt,uTime;
        void main(){
          float u=vUv.x*${REP.toFixed(5)}+uOff/${N}.;
          float cell=floor(fract(u)*${N}.);
          vec4 c=texture2D(uMap,vec2(u,vUv.y));
          float hv=step(abs(cell-uHover),.5);
          float fc=step(abs(cell-uFocus),.5);
          float k=mix(.9,1.07,hv);
          k*=1.+.012*sin(uTime*47.+cell*3.);
          k=mix(k,mix(.22,1.,fc),uFocusAmt);
          c.rgb*=k;
          float s=abs(vUv.x-.5)*2.;
          c.a*=smoothstep(1.,.8,s);
          gl_FragColor=c;}` });
    const strip = new THREE.Mesh(geo, mat); strip.rotation.z = -0.05; strip.rotation.x = 0.05; scene.add(strip);

    let zBase = 8, visFrames = 3.4;
    function resize() {
      const w = innerWidth, h = innerHeight, a = w / h;
      renderer.setSize(w, h, false); camera.aspect = a;
      visFrames = Math.max(1.3, Math.min(2.9, a * 1.5));
      zBase = (visFrames * FW) / (a * 2 * Math.tan((camera.fov * Math.PI) / 360));
      camera.updateProjectionMatrix();
    }
    resize(); addEventListener('resize', resize);

    /* motion: constant drift + wheel/drag velocity with inertia */
    const S = { off: -2.5, vel: 0, drift: reduce ? 0 : 0.08, zk: 1.6, leaving: false, hover: -1, intro: 0 };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false, cx: 0, cy: 0 };
    const ppf = () => innerWidth / visFrames;
    addEventListener('wheel', e => { if (S.leaving) return; S.vel += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.0016; }, { passive: true });
    addEventListener('keydown', e => {
      if (S.leaving) return;
      if (e.key === 'ArrowRight') S.vel += 1.2; else if (e.key === 'ArrowLeft') S.vel -= 1.2;
      else if (e.key === 'Enter' && S.hover >= 0) openService(S.hover);
    });
    let drag = null;
    canvas.addEventListener('pointerdown', e => { if (S.leaving) return; drag = { x: e.clientX, lx: e.clientX, moved: false, t: performance.now() }; canvas.setPointerCapture(e.pointerId); });
    addEventListener('pointermove', e => {
      mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; mouse.cx = e.clientX; mouse.cy = e.clientY; mouse.inside = true;
      if (!drag) return;
      const dx = e.clientX - drag.lx; drag.lx = e.clientX;
      if (Math.abs(e.clientX - drag.x) > 6) { drag.moved = true; canvas.classList.add('drag'); }
      if (drag.moved) { S.off -= dx / ppf(); S.vel = -dx / ppf() * 60 * 0.1; }
    });
    canvas.addEventListener('pointerup', e => {
      canvas.classList.remove('drag');
      if (drag && !drag.moved) { const c = pick(e.clientX, e.clientY); if (c >= 0) openService(c); }
      drag = null;
    });
    canvas.addEventListener('pointerleave', () => { mouse.inside = false; });

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pick(cx, cy) {
      ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(strip, false)[0];
      if (!hit) return -1;
      return Math.floor(mod(hit.uv.x * REP + S.off / N, 1) * N);
    }

    /* live label */
    const liveN = $('#liveN'), liveT = $('#liveT');
    let shown = -2;
    function setLive(i) {
      if (i === shown) return; shown = i;
      links.forEach(a => a.classList.toggle('on', +a.dataset.i === i));
      gsap.timeline().to(liveT, { yPercent: -110, duration: D(0.22), ease: 'power3.in' })
        .add(() => { liveN.textContent = i < 0 ? 'The reel' : 'Service ' + num(i) + ' · open page ↗'; liveT.textContent = i < 0 ? 'Ride it.' : SERVICES[i].title; })
        .fromTo(liveT, { yPercent: 110 }, { yPercent: 0, duration: D(0.7), ease: 'expo.out' });
    }
    links.forEach(a => {
      a.addEventListener('pointerenter', () => { S.hover = +a.dataset.i; });
      a.addEventListener('pointerleave', () => { S.hover = -1; });
      a.addEventListener('focus', () => { S.hover = +a.dataset.i; });
      a.addEventListener('click', e => { if (reduce) return; e.preventDefault(); openService(+a.dataset.i); });
    });

    /* leaving: the reel slides the chosen frame to centre, camera dollies in, then a curtain closes */
    function openService(i) {
      if (S.leaving) return; S.leaving = true; S.hover = i; mat.uniforms.uFocus.value = i;
      const href = 'services/' + SERVICES[i].slug + '.html';
      if (reduce) { location.href = href; return; }
      const centre = (i + 0.5) - 0.5 * REP * N;
      let d = mod(centre - S.off + N / 2, N) - N / 2;
      gsap.to(S, { off: S.off + d, vel: 0, drift: 0, duration: 1, ease: 'expo.inOut' });
      gsap.to(mat.uniforms.uFocusAmt, { value: 1, duration: 0.7 });
      gsap.to(S, { zk: 0.5, duration: 1.1, ease: 'expo.inOut' });
      curtain.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)';
      setTimeout(() => { curtain.classList.add('cover'); }, 650);
      setTimeout(() => { location.href = href; }, 1400);
    }

    /* loop */
    let last = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!drag || !drag.moved) { S.off += (S.drift + S.vel) * dt; S.vel *= Math.pow(0.06, dt); }
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
      if (!S.leaving && mouse.inside && !drag) { const c = pick(mouse.cx, mouse.cy); S.hover = c; canvas.classList.toggle('pointer', c >= 0); }
      const hv = S.hover;
      mat.uniforms.uOff.value = S.off; mat.uniforms.uHover.value = hv; mat.uniforms.uTime.value = now / 1000;
      setLive(hv);
      camera.position.set(mouse.x * 0.5, 0.35 - mouse.y * 0.25, zBase * S.zk * (1.35 - 0.35 * S.intro));
      camera.lookAt(mouse.x * 0.2, 0, 0);
      strip.position.y = (1 - S.intro) * -1.5;
      renderer.render(scene, camera);
    });

    /* intro: curtain lifts, the reel rolls in */
    curtain.style.transition = 'transform 1.1s cubic-bezier(.7,0,.2,1)';
    requestAnimationFrame(() => curtain.classList.remove('cover'));
    gsap.to(S, { intro: 1, off: 0, duration: D(2.4), ease: 'expo.out', delay: 0.2 });
    gsap.from('.top, .idx, .hint', { opacity: 0, duration: D(1), delay: D(0.8) });
  }

  init().catch(err => { console.warn(err); document.body.classList.add('nogl'); curtain.classList.remove('cover'); });
})();
