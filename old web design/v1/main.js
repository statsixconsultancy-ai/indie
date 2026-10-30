(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- shader background: a colour mood per chapter ---------- */
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=(uv-.5)*vec2(asp,1.)*2.;
  vec2 m=(uMouse-.5)*vec2(asp,1.)*2.;
  float t=uTime*.12;
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*1.3),fbm(p+3.*q+vec2(8.3,2.8)-t));
  float f=fbm(p+3.*r);
  f+=.45*exp(-length(p-m)*2.2);
  float s=uScroll*4.;
  vec3 c=vec3(1.,.23,.12);
  c=mix(c,vec3(.78,1.,.24),smoothstep(0.,1.,s));
  c=mix(c,vec3(.42,.2,1.),smoothstep(1.,2.,s));
  c=mix(c,vec3(.1,.85,1.),smoothstep(2.,3.,s));
  c=mix(c,vec3(1.,.2,.55),smoothstep(3.,4.,s));
  float inten=.55+.45*(1.-smoothstep(0.,.1,uScroll));
  vec3 col=mix(vec3(.04,.035,.03),c,smoothstep(.3,1.,f))*(.3+.9*f)*inten;
  col*=1.-.55*dot(uv-.5,uv-.5)*2.;
  gl_FragColor=vec4(col,1.);
}`;

  function initShader() {
    const canvas = $('#gl');
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.style.background = 'radial-gradient(circle at 30% 40%, #ff3b1f55, #0a0907 70%)'; return null; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return null; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = n => gl.getUniformLocation(prog, n);
    const U = { res: u('uRes'), time: u('uTime'), mouse: u('uMouse'), scroll: u('uScroll') };
    const resize = () => {
      const k = Math.min(devicePixelRatio || 1, 1.25) * 0.6; // render small, let CSS upscale
      canvas.width = Math.max(2, Math.floor(innerWidth * k));
      canvas.height = Math.max(2, Math.floor(innerHeight * k));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);
    return (time, mx, my, sc) => {
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, time);
      gl.uniform2f(U.mouse, mx, my);
      gl.uniform1f(U.scroll, sc);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  }
  const draw = initShader();

  /* ---------- split text into masked chars ---------- */
  function split(el) {
    const text = el.textContent.trim();
    el.innerHTML = text.split(/\s+/).map(w =>
      `<span class="w" aria-hidden="true">${[...w].map(c => `<i>${c}</i>`).join('')}</span>`).join(' ');
  }
  $$('[data-split]').forEach(split);

  const wordsEl = $('[data-words]');
  const hl = ['moments.', 'stick,', 'move,'];
  wordsEl.innerHTML = wordsEl.textContent.trim().split(/\s+/)
    .map(w => `<span class="mw${hl.includes(w.toLowerCase()) ? ' hl' : ''}">${w}</span>`).join(' ');

  /* ---------- fallback paths ---------- */
  if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    root.classList.add('reduce');
    if (draw) draw(2, .5, .5, 0);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- shader loop ---------- */
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; });
  let prog = 0, progT = 0;
  ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: s => { progT = s.progress; } });
  if (draw) gsap.ticker.add(t => {
    mouse.x += (mouse.tx - mouse.x) * .06;
    mouse.y += (mouse.ty - mouse.y) * .06;
    prog += (progT - prog) * .05;
    draw(t, mouse.x, mouse.y, prog);
  });

  /* ---------- cursor + magnetic ---------- */
  if (!touch) {
    const cur = $('.cursor'), lab = $('span', cur);
    const qx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    const qy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); });
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { lab.textContent = el.dataset.cursor; cur.classList.add('big'); });
      el.addEventListener('pointerleave', () => cur.classList.remove('big'));
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: 'power3' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ---------- intro: film leader countdown, then hero ---------- */
  const intro = gsap.timeline({ paused: true })
    .from('.nav > *', { y: -30, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out' }, 0)
    .from('.hero .line i', { yPercent: 115, rotate: 7, stagger: .03, duration: 1.1, ease: 'expo.out' }, 0)
    .from('.hero-meta span, .hero-sub', { y: 24, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out' }, .5)
    .from('.sticker', { scale: 0, duration: 1.3, ease: 'elastic.out(1,.55)' }, .7);

  const L = gsap.timeline({ onComplete: () => { intro.play(); lenis && lenis.start(); } });
  $$('#loader .count span').forEach((n, i) => {
    L.fromTo(n, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: .22, ease: 'power4.out' }, i * .5)
     .to(n, { opacity: 0, duration: .1 }, i * .5 + .4);
  });
  L.to('#loader .sweep', { rotation: 1080, duration: 1.5, ease: 'none' }, 0)
   .to('#loader', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, 1.55)
   .set('#loader', { display: 'none' });

  /* ---------- chapter 0: hero parallax ---------- */
  gsap.to('.hero-title', { yPercent: -18, scale: .88, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.sticker', { yPercent: 160, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- chapter 1: manifesto words light up ---------- */
  gsap.to('.mw', { opacity: 1, stagger: .12, ease: 'none',
    scrollTrigger: { trigger: '.manifesto', start: 'top 70%', end: 'bottom 80%', scrub: true } });

  /* ---------- chapter 2: horizontal work reel ---------- */
  const track = $('.h-track');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.services', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: s => gsap.set('.s-bar i', { scaleX: s.progress }) } });

  /* ---------- chapter 3: pinned process steps ---------- */
  const steps = $$('.step');
  gsap.set(steps.slice(1), { autoAlpha: 0, yPercent: 18 });
  gsap.set('.p-bar i', { scaleX: 1 / steps.length });
  const ptl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.process', start: 'top top', end: '+=300%', pin: true, scrub: .6 } });
  steps.forEach((s, i) => {
    if (i) {
      ptl.to(steps[i - 1], { autoAlpha: 0, yPercent: -18, duration: .5 })
         .to(s, { autoAlpha: 1, yPercent: 0, duration: .5 }, '<')
         .to('.p-bar i', { scaleX: (i + 1) / steps.length, duration: .5 }, '<');
    }
    ptl.to({}, { duration: .7 });
  });

  /* ---------- chapter 4: counters ---------- */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
  });
  gsap.from('.stat', { y: 80, opacity: 0, stagger: .15, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.stats', start: 'top 70%' } });

  /* ---------- marquee reacts to scroll speed ---------- */
  const mq = gsap.to('.m-inner', { xPercent: -50, repeat: -1, duration: 18, ease: 'none' });
  ScrollTrigger.create({ onUpdate: s => {
    gsap.timeline().to(mq, { timeScale: s.direction * (1 + Math.abs(s.getVelocity()) / 250), duration: .2, overwrite: true })
      .to(mq, { timeScale: s.direction, duration: 1 });
  } });

  /* ---------- final chapter ---------- */
  gsap.from('.cta .line i', { yPercent: 115, rotate: 7, stagger: .03, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.cta', start: 'top 60%' } });
  gsap.from('.big-btn', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 40%' } });
  if (!touch) {
    const chars = $$('.cta-title i');
    $('.cta-title').addEventListener('pointermove', e => chars.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      gsap.to(c, { scale: 1 + Math.max(0, 1 - d / 220) * .4, duration: .3, overwrite: 'auto' });
    }));
    $('.cta-title').addEventListener('pointerleave', () => gsap.to(chars, { scale: 1, duration: .6 }));
  }

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
