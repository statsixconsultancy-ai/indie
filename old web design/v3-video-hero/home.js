/* Home interactions: rack-focus type, lens-selector previews, scrubbable edit timeline, velocity marquee, slate CTA. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, touch = matchMedia('(hover: none)').matches;
  const wipe = $('#wipe');
  $('#yr').textContent = new Date().getFullYear();

  /* ---- type helpers ---- */
  const splitChars = el => { const t = el.textContent.trim(); el.setAttribute('aria-hidden', 'true'); el.innerHTML = t.split(/\s+/).map(w => `<span class="w">${[...w].map(c => `<i>${c}</i>`).join('')}</span>`).join(' '); };
  $$('[data-split]').forEach(splitChars);

  /* ---- timecode ---- */
  const tcEl = $('#tc'), t0 = performance.now(), pad = (n, l = 2) => String(n).padStart(l, '0');
  const tcFmt = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * 24))}`;
  setInterval(() => { tcEl.textContent = tcFmt((performance.now() - t0) / 1000); }, 41);

  /* ---- page wipe ---- */
  wipe.style.transition = 'transform 1s cubic-bezier(.7,0,.2,1)';
  requestAnimationFrame(() => wipe.classList.remove('cover'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.origin !== location.origin || a.hash && a.pathname === location.pathname || a.href.startsWith('mailto:') || reduce) return;
    e.preventDefault(); wipe.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)'; wipe.classList.add('cover');
    setTimeout(() => { location.href = a.href; }, 700);
  });
  addEventListener('pageshow', e => { if (e.persisted) wipe.classList.remove('cover'); });

  if (reduce || typeof gsap === 'undefined') { $$('.fw').forEach(w => (w.style.filter = 'none')); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---- smooth scroll ---- */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1 }); lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: 'smooth' }); } }));

  /* ---- cursor ---- */
  if (!touch) {
    const cur = $('#cursor'), qx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); });
    $$('a, button').forEach(el => { el.addEventListener('pointerenter', () => cur.classList.add('big')); el.addEventListener('pointerleave', () => cur.classList.remove('big')); });
  }

  /* ---- hero intro: pull focus on each letter ---- */
  gsap.from('.hero-title .w i', { yPercent: 110, filter: 'blur(18px)', opacity: 0, stagger: 0.035, duration: 1.4, ease: 'expo.out', delay: 0.9 });
  gsap.from('.nav, .hud, .vf i, .hero-sub, .cue', { opacity: 0, y: -10, stagger: 0.06, duration: 1, delay: 1.3 });
  gsap.to('.hero-title', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---- manifesto: your cursor is the lens that pulls focus ---- */
  (() => {
    const lens = $('#lens'), ring = $('#lensRing'); let tx = 0.3, ty = 0.5, cx = 0.3, cy = 0.5, hover = false;
    lens.addEventListener('pointermove', e => { const r = lens.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; hover = true; });
    lens.addEventListener('pointerleave', () => { hover = false; });
    gsap.ticker.add(t => {
      const r = lens.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (!hover) { tx = 0.5 + 0.36 * Math.sin(t * 0.45); ty = 0.5 + 0.34 * Math.sin(t * 0.31 + 1); }
      cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09;
      const px = cx * r.width, py = cy * r.height; lens.style.setProperty('--mx', px + 'px'); lens.style.setProperty('--my', py + 'px');
      ring.style.transform = 'translate(' + px + 'px,' + py + 'px) translate(-50%,-50%)';
    });
  })();

  /* ---- services: a giant film reel that spins as you scroll ---- */
  (() => {
    const sec = $('#work'), stick = $('.rw-stick'), cv = $('#rw'), g = cv.getContext('2d'), N = SERVICES.length, STEP = TAU / N;
    let W, H, DPR, cx, cy, R, cw, ch, base, u = 0, uT = 0, vis = false, active = -1;
    const cells = SERVICES.map(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 264; return c; }), cg = cells.map(c => c.getContext('2d'));
    const plateau = f => (f < 0.3 ? 0 : f > 0.7 ? 1 : (x => x * x * (3 - 2 * x))((f - 0.3) / 0.4));
    const eased = p => { const x = p * (N - 1), k = Math.min(N - 2, Math.floor(x)); return k + plateau(x - k); };
    function size() {
      DPR = Math.min(devicePixelRatio || 1, 1.75); W = sec.clientWidth; H = innerHeight;
      cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (W < 820) { R = Math.min(H * 0.42, W * 0.95); cw = Math.min(W * 0.74, R * 1.05); ch = cw * 0.66; cx = W / 2; cy = -R * 0.12; base = Math.PI / 2; }
      else { R = H * 0.64; cw = H * 0.5; ch = cw * 0.66; cx = W * 0.02; cy = H / 2; base = 0; }
    }
    const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); };
    function cellGeom(i) { const off = i - u, a = base + off * STEP, k = Math.min(Math.abs(off), 1); return { off, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), tilt: off * 0.12, sc: 1 - k * 0.22, al: Math.max(0, 1 - Math.min(Math.abs(off), 1.3) * 0.5) }; }
    function draw(t) {
      g.clearRect(0, 0, W, H);
      const rot = -u * STEP;
      g.save(); g.translate(cx, cy); g.rotate(rot);
      const body = g.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.45); body.addColorStop(0, '#0f1923'); body.addColorStop(1, '#080c11');
      g.fillStyle = body; g.beginPath(); g.arc(0, 0, R * 1.42, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(239,233,220,.24)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, R * 1.42, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, R * 1.3, 0, TAU); g.stroke();
      for (let k = 0; k < 144; k++) { const a = (k / 144) * TAU, L = k % 6 === 0 ? R * 0.07 : R * 0.03; g.strokeStyle = k % 6 === 0 ? 'rgba(239,233,220,.55)' : 'rgba(239,233,220,.2)'; g.beginPath(); g.moveTo(Math.cos(a) * R * 1.42, Math.sin(a) * R * 1.42); g.lineTo(Math.cos(a) * (R * 1.42 - L), Math.sin(a) * (R * 1.42 - L)); g.stroke(); }
      g.strokeStyle = '#0b0d10'; g.lineWidth = ch * 1.34; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
      g.fillStyle = 'rgba(239,233,220,.42)';
      for (let k = 0; k < 130; k++) { const a = (k / 130) * TAU; for (const s of [-1, 1]) { const r2 = R + s * ch * 0.6; g.save(); g.translate(Math.cos(a) * r2, Math.sin(a) * r2); g.rotate(a); rr(-4, -9, 8, 18, 2); g.fill(); g.restore(); } }
      g.strokeStyle = 'rgba(239,233,220,.1)'; g.lineWidth = 2;
      for (let i = 0; i < N; i++) { const a = (i + 0.5) * STEP; g.beginPath(); g.moveTo(Math.cos(a) * R * 0.26, Math.sin(a) * R * 0.26); g.lineTo(Math.cos(a) * (R - ch * 0.75), Math.sin(a) * (R - ch * 0.75)); g.stroke(); }
      g.fillStyle = '#0b1118'; g.strokeStyle = 'rgba(239,233,220,.3)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 0.24, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.16, 0, TAU); g.stroke();
      g.beginPath(); g.moveTo(-R * 0.09, 0); g.lineTo(R * 0.09, 0); g.moveTo(0, -R * 0.09); g.lineTo(0, R * 0.09); g.stroke();
      g.restore();
      for (let i = 0; i < N; i++) {
        const o = cellGeom(i); if (Math.abs(o.off) > 1.6) continue;
        drawSketch(i, cg[i], 400, 264, t);
        g.save(); g.translate(o.x, o.y); g.rotate(o.tilt); g.scale(o.sc, o.sc); g.globalAlpha = o.al;
        g.shadowColor = SERVICES[i].c[0] + '99'; g.shadowBlur = 70 * (1 - Math.min(Math.abs(o.off), 1)); g.fillStyle = '#000'; rr(-cw / 2, -ch / 2, cw, ch, 14); g.fill(); g.shadowBlur = 0;
        rr(-cw / 2, -ch / 2, cw, ch, 14); g.clip(); g.drawImage(cells[i], -cw / 2, -ch / 2, cw, ch);
        g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '700 12px "Space Mono", monospace'; g.fillText(String(i + 1).padStart(2, '0') + ' ▸ ' + SERVICES[i].kind.toUpperCase(), -cw / 2 + 14, -ch / 2 + 24);
        g.restore();
        g.save(); g.translate(o.x, o.y); g.rotate(o.tilt); g.scale(o.sc, o.sc); g.globalAlpha = o.al; g.strokeStyle = 'rgba(239,233,220,.85)'; g.lineWidth = 2; rr(-cw / 2, -ch / 2, cw, ch, 14); g.stroke(); g.restore();
      }
    }
    /* info panel */
    const dots = $('#rwDots'); SERVICES.forEach((s, i) => { const b = document.createElement('button'); b.textContent = String(i + 1).padStart(2, '0'); b.setAttribute('aria-label', s.title); b.addEventListener('click', () => goTo(i)); dots.appendChild(b); });
    function setActive(i) {
      if (i === active) return; active = i; const s = SERVICES[i];
      stick.style.setProperty('--acc', s.c[0]);
      $$('#rwDots button').forEach((b, k) => b.classList.toggle('on', k === i));
      $('#rwNum').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
      $('#rwTitle').textContent = s.title; $('#rwTag').textContent = s.tag; $('#rwWhat').textContent = s.what;
      $('#rwInc').innerHTML = s.includes.map(x => '<li>' + x + '</li>').join(''); $('#rwLink').href = 'services/' + s.slug + '.html';
      gsap.fromTo('#rwInfo > *', { y: 36, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.06, duration: 0.9, ease: 'expo.out', overwrite: true });
    }
    function goTo(i) { const range = sec.offsetHeight - innerHeight, y = sec.offsetTop + (i / (N - 1)) * range; lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }); }
    cv.addEventListener('pointerup', e => {
      const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      for (let i = 0; i < N; i++) { const o = cellGeom(i); if (Math.abs(o.off) > 1.3) continue; if (Math.abs(px - o.x) < (cw * o.sc) / 2 && Math.abs(py - o.y) < (ch * o.sc) / 2) { if (Math.round(u) === i) $('#rwLink').click(); else goTo(i); return; } }
    });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => { uT = s.progress; } });
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: s => { vis = s.isActive; } });
    size(); addEventListener('resize', () => { size(); ScrollTrigger.refresh(); }); setActive(0);
    gsap.ticker.add(time => { if (!vis) return; u += (eased(uT) - u) * 0.12; draw(time); setActive(Math.max(0, Math.min(N - 1, Math.round(u)))); });
  })();

  /* ---- timeline: scroll plays it, dragging the playhead scrubs it ---- */
  const STEPS = [
    ['Brief', 'You tell us the vibe. We listen like directors, not vendors.', 0],
    ['Script & boards', 'Ideas become frames. Every shot, beat and cut is planned before a pixel moves.', 0.18],
    ['Generate', 'AI crews, human taste. We direct hundreds of takes and keep only the ones with a pulse.', 0.38],
    ['Cut & sound', 'Edit, score, voice and grade, until every frame earns its place.', 0.7],
    ['Ship', 'Delivered in every format your brand lives in, ready to roll.', 0.88]
  ];
  const TOTAL = 30, ui = $('#tlUi'), ruler = $('#ruler');
  for (let s = 0; s <= TOTAL; s += 5) { const sp = document.createElement('span'); sp.style.left = (s / TOTAL) * 100 + '%'; sp.textContent = '00:' + pad(s); ruler.appendChild(sp); }
  let step = -1, tlStage = 0;
  const st = ScrollTrigger.create({ trigger: '.tl', start: 'top top', end: 'bottom bottom', onUpdate: s => {
    const p = s.progress; ui.style.setProperty('--p', p.toFixed(4)); $('#phTc').textContent = '00:' + pad(Math.round(p * TOTAL));
    let i = 0; STEPS.forEach((x, k) => { if (p >= x[2]) i = k; });
    if (i !== step) { step = i; tlStage = i; $('#tlStep').textContent = pad(i + 1) + ' / ' + pad(STEPS.length); const T = $('#tlTitle'), P = $('#tlText');
      gsap.fromTo([T, P], { y: 30, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.08, ease: 'expo.out' }); T.textContent = STEPS[i][0]; P.textContent = STEPS[i][1]; }
  } });
  let scrubbing = false;
  const scrubTo = e => { const r = ui.getBoundingClientRect(), lane0 = r.left + 56, p = Math.max(0, Math.min(1, (e.clientX - lane0) / (r.width - 56))); const y = st.start + p * (st.end - st.start); lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); };
  ui.addEventListener('pointerdown', e => { scrubbing = true; ui.setPointerCapture(e.pointerId); scrubTo(e); });
  ui.addEventListener('pointermove', e => { if (scrubbing) scrubTo(e); });
  ui.addEventListener('pointerup', () => { scrubbing = false; });

  /* ---- program monitor shows the stage you are on ---- */
  const pgc = $('#pgm'), pgg = pgc.getContext('2d'), PGM = [4, 0, 2, 1, 5]; let pgVis = false;
  ScrollTrigger.create({ trigger: '.tl', start: 'top bottom', end: 'bottom top', onToggle: s => { pgVis = s.isActive; } });
  gsap.ticker.add(t => { if (pgVis && pgc.offsetParent) drawSketch(PGM[tlStage], pgg, pgc.width, pgc.height, t); });

  /* ---- marquee reacts to scroll speed ---- */
  const m1 = gsap.to('#m1', { xPercent: -50, repeat: -1, duration: 24, ease: 'none' });
  const m2 = gsap.fromTo('#m2', { xPercent: -50 }, { xPercent: 0, repeat: -1, duration: 28, ease: 'none' });
  ScrollTrigger.create({ onUpdate: s => { const v = s.getVelocity(); [m1, m2].forEach(m => gsap.to(m, { timeScale: 1 + Math.abs(v) / 260, duration: 0.2, overwrite: true, onComplete: () => gsap.to(m, { timeScale: 1, duration: 1 }) })); gsap.to('.marq', { skewX: gsap.utils.clamp(-6, 6, v / -300), duration: 0.4, overwrite: 'auto' }); } });

  /* ---- CTA: the slate ---- */
  gsap.from('.cta-title .w i', { yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 60%' } });
  const top = $('#clapTop'), take = $('#take'); let n = 1;
  const slam = () => { gsap.timeline().to(top, { rotation: -26, duration: 0.25, ease: 'power2.out' }).to(top, { rotation: 0, duration: 0.14, ease: 'power4.in' }).to('.clap-body', { y: 4, duration: 0.05, yoyo: true, repeat: 1 }).add(() => { n++; take.textContent = pad(n); }); };
  $('#clap').addEventListener('click', slam);
  $('#clap').addEventListener('pointerenter', () => gsap.to(top, { rotation: -26, duration: 0.5, ease: 'expo.out' }));
  $('#clap').addEventListener('pointerleave', () => gsap.to(top, { rotation: -16, duration: 0.5, ease: 'expo.out' }));
  $('#action').addEventListener('click', e => { e.preventDefault(); slam(); setTimeout(() => { location.href = $('#action').href; }, 600); });


  /* ---- hero title splits into red/cyan fringes as the camera moves ---- */
  addEventListener('pointermove', e => { const t = $('.hero-title'); t.style.setProperty('--dx', ((e.clientX / innerWidth - 0.5) * 18).toFixed(2)); t.style.setProperty('--dy', ((e.clientY / innerHeight - 0.5) * 8).toFixed(2)); });

  /* ---- CTA letters swell and glow near the cursor ---- */
  if (!touch) {
    const letters = $$('.cta-title .w i'), cta = $('.cta');
    cta.addEventListener('pointermove', e => letters.forEach(l => { const r = l.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)), k = Math.max(0, 1 - d / 300);
      gsap.to(l, { scale: 1 + k * 0.38, y: -k * 22, color: k > 0.55 ? '#d4ff3a' : '#efe9dc', duration: 0.35, overwrite: 'auto' }); }));
    cta.addEventListener('pointerleave', () => gsap.to(letters, { scale: 1, y: 0, color: '#efe9dc', duration: 0.6 }));
  }

  /* ---- fixed film counter: scene name, frame number and running time follow the scroll ---- */
  (() => {
    const SCENES = [['top', '01 · Opening'], ['manifesto', '02 · The belief'], ['work', '03 · The reel'], ['process', '04 · The edit'], ['contact', '05 · Final take']];
    const sc = $('#scene'), fr = $('#frameNo'), tcx = $('#pageTc'); let cur = '';
    const upd = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), f = Math.round((scrollY / max) * 4800), s = f / 24;
      fr.textContent = 'F' + String(f).padStart(4, '0'); tcx.textContent = pad(Math.floor(s / 60)) + ':' + pad(Math.floor(s) % 60) + ':' + pad(Math.floor((s % 1) * 24));
      let name = SCENES[0][1]; SCENES.forEach(([id, label]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * 0.5) name = label; });
      if (name !== cur) { cur = name; sc.textContent = name; }
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  })();

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
