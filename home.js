/* Home interactions around the city flight: type, cursor, edit timeline, marquee, slate, film counter. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, touch = matchMedia('(hover: none)').matches;
  const wipe = $('#wipe'), pad = (n, l = 2) => String(n).padStart(l, '0');
  $('#yr').textContent = new Date().getFullYear();

  const splitChars = el => { const tx = el.textContent.trim(); el.setAttribute('aria-hidden', 'true'); el.innerHTML = tx.split(/\s+/).map(w => `<span class="w">${[...w].map(c => `<i>${c}</i>`).join('')}</span>`).join(' '); };
  $$('[data-split]').forEach(splitChars);

  /* recording timecode in the hero */
  const tcEl = $('#tc'), t0 = performance.now(), tcFmt = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(Math.floor(s) % 60)}:${pad(Math.floor((s % 1) * 24))}`;
  setInterval(() => { tcEl.textContent = tcFmt((performance.now() - t0) / 1000); }, 41);

  /* page wipe between real pages */
  const wipeT = $('#wipeT'); wipeT.textContent = 'indie'; wipe.style.transition = 'transform 1.1s cubic-bezier(.7,0,.2,1)'; requestAnimationFrame(() => wipe.classList.remove('cover'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.origin !== location.origin || (a.hash && a.pathname === location.pathname) || a.href.startsWith('mailto:') || e.defaultPrevented || reduce) return;
    e.preventDefault(); const sv = SERVICES.find(s => a.pathname.endsWith('/' + s.slug + '.html')); wipeT.textContent = sv ? 'Scene 0' + (SERVICES.indexOf(sv) + 1) + ' · ' + sv.title : ''; wipe.style.transition = 'transform .8s cubic-bezier(.7,0,.2,1)'; wipe.classList.add('cover'); window.cineSound && window.cineSound.whoosh(); setTimeout(() => { location.href = a.href; }, 1100);
  });
  addEventListener('pageshow', e => { if (e.persisted) wipe.classList.remove('cover'); });

  /* film counter: frame, time and scene name follow the scroll */
  let flightLabel = '01 · The city';
  addEventListener('stopchange', e => { flightLabel = e.detail.label; upd(); });
  function upd() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), f = Math.round((scrollY / max) * 4800), s = f / 24;
    $('#frameNo').textContent = 'F' + String(f).padStart(4, '0'); $('#pageTc').textContent = pad(Math.floor(s / 60)) + ':' + pad(Math.floor(s) % 60) + ':' + pad(Math.floor((s % 1) * 24));
    let name = flightLabel; [['process', '09 · The takes'], ['contact', '10 · Final take']].forEach(([id, label]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * 0.5) name = label; });
    if ($('#scene').textContent !== name) $('#scene').textContent = name;
  }
  addEventListener('scroll', upd, { passive: true }); upd();

  if (reduce || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll (the city reads window scroll, so it works with this) */
  let lenis = null;
  if (typeof Lenis !== 'undefined') { lenis = new Lenis({ lerp: 0.09 }); window.__lenis = lenis; lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (/^#stop-/.test(id)) return; const t = $(id); if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: 'smooth' }); } }));

  /* cursor */
  if (!touch) {
    const cur = $('#cursor'), qx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY); });
    document.addEventListener('pointerover', e => { cur.classList.toggle('big', !!e.target.closest('a, button')); });
  }

  /* hero: letters pull into focus; the title fringes red and cyan as the camera moves */
  gsap.from('.hero-title .w i', { yPercent: 110, filter: 'blur(18px)', opacity: 0, stagger: 0.035, duration: 1.4, ease: 'expo.out', delay: 0.9 });
  gsap.from('.nav, .hud, .vf i, .hero-sub', { opacity: 0, y: -10, stagger: 0.06, duration: 1, delay: 1.3 });
  addEventListener('pointermove', e => { const t = $('.hero-title'); t.style.setProperty('--dx', ((e.clientX / innerWidth - 0.5) * 18).toFixed(2)); t.style.setProperty('--dy', ((e.clientY / innerHeight - 0.5) * 8).toFixed(2)); });

  /* how it's made: the big number, a widescreen clip and a subtitle change with each take */
  (() => {
    const steps = $$('.tk-step'), numEl = $('#tkNum'), cvs = $('#tkCanvas'), g = cvs.getContext('2d'), sec = $('.takes'), vids = $$('.tk-vid'), cap = $('#tkCap'), tkTk = $('#tkTk');
    const MAP = [4, 0, 5, 1, 2], CAPS = ['You tell us the vibe.', 'Every shot, planned.', 'Hundreds of takes, one keeper.', 'Cut, score, grade.', 'Ready to roll.'], ok = [false, false, false, false, false], tried = [];
    let cur = 0, vis = false;
    const load = i => { if (i > 4 || tried[i]) return; tried[i] = true; const v = vids[i]; v.addEventListener('loadeddata', () => { ok[i] = true; if (cur === i) show(i); }, { once: true }); v.addEventListener('error', () => { ok[i] = false; }, { once: true }); v.src = 'assets/takes/take-' + (i + 1) + '.mp4'; v.load(); };
    function show(i) { vids.forEach((v, k) => { const on = k === i && ok[k]; v.classList.toggle('on', on); if (on) v.play().catch(() => {}); else v.pause(); }); cvs.style.display = 'none'; }
    steps.forEach((el, i) => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: s => {
      if (!s.isActive) return; cur = i; load(i); load(i + 1); show(i); sec.style.setProperty('--tk', SERVICES[MAP[i]].c[0]); numEl.textContent = pad(i + 1); tkTk.textContent = pad(i + 1);
      gsap.fromTo(numEl, { yPercent: 25, opacity: 0, filter: 'blur(14px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out', overwrite: true });
      gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', onStart: () => { cap.textContent = CAPS[i]; } });
    } }));
    $$('.tk-step > *').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: s => { vis = s.isActive; if (s.isActive) { load(cur); } else vids.forEach(v => v.pause()); } });
    
  })();

  /* chapter title cards: the letters open up as each one arrives */
  $$('.chapter').forEach(c => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 70%' } });
    tl.from(c.querySelector('.ch-kicker'), { opacity: 0, y: 14, duration: 0.8, ease: 'expo.out' })
      .from(c.querySelector('.ch-title'), { opacity: 0, letterSpacing: '0.4em', filter: 'blur(14px)', duration: 1.8, ease: 'expo.out' }, 0.1)
      .from(c.querySelector('.ch-sub'), { opacity: 0, duration: 1 }, 0.9).from(c.querySelector('.ch-line'), { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.6);
  });

  /* marquee speeds up and skews with scroll velocity */
  const m1 = gsap.to('#m1', { xPercent: -50, repeat: -1, duration: 24, ease: 'none' }), m2 = gsap.fromTo('#m2', { xPercent: -50 }, { xPercent: 0, repeat: -1, duration: 28, ease: 'none' });
  ScrollTrigger.create({ onUpdate: s => { const v = s.getVelocity(); [m1, m2].forEach(m => gsap.to(m, { timeScale: 1 + Math.abs(v) / 260, duration: 0.2, overwrite: true, onComplete: () => gsap.to(m, { timeScale: 1, duration: 1 }) })); gsap.to('.marq', { skewX: gsap.utils.clamp(-6, 6, v / -300), duration: 0.4, overwrite: 'auto' }); } });

  /* the slate: letters swell near the cursor; clapping bumps the take number */
  gsap.from('.cta-title .w i', { yPercent: 110, stagger: 0.04, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 60%' } });
  const top = $('#clapTop'), take = $('#take'); let n = 1;
  const slam = () => { window.cineSound && window.cineSound.clap(); gsap.timeline().to(top, { rotation: -26, duration: 0.25, ease: 'power2.out' }).to(top, { rotation: 0, duration: 0.14, ease: 'power4.in' }).to('.clap-body', { y: 4, duration: 0.05, yoyo: true, repeat: 1 }).add(() => { n++; take.textContent = pad(n); }); };
  $('#clap').addEventListener('click', slam);
  $('#clap').addEventListener('pointerenter', () => gsap.to(top, { rotation: -26, duration: 0.5, ease: 'expo.out' }));
  $('#clap').addEventListener('pointerleave', () => gsap.to(top, { rotation: -16, duration: 0.5, ease: 'expo.out' }));
  $('#action').addEventListener('click', e => { e.preventDefault(); slam(); setTimeout(() => { location.href = $('#action').href; }, 600); });
  if (!touch) {
    const letters = $$('.cta-title .w i'), cta = $('.cta');
    cta.addEventListener('pointermove', e => letters.forEach(l => { const r = l.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)), k = Math.max(0, 1 - d / 300); gsap.to(l, { scale: 1 + k * 0.38, y: -k * 22, color: k > 0.55 ? '#d4ff3a' : '#efe9dc', duration: 0.35, overwrite: 'auto' }); }));
    cta.addEventListener('pointerleave', () => gsap.to(letters, { scale: 1, y: 0, color: '#efe9dc', duration: 0.6 }));
  }
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
