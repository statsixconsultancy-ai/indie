/* Sub-page behaviour: live generative banner, reveals, wipe transition. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wipe = document.getElementById('wipe');
  const idx = SERVICES.findIndex(s => s.slug === document.body.dataset.slug), p = SERVICES[idx];

  /* the building's clip is the cover banner behind the title */
  const cover = document.getElementById('cover');
  if (cover) { cover.addEventListener('error', () => { cover.style.display = 'none'; }); const go = () => cover.play().catch(() => {}); cover.addEventListener('loadeddata', go, { once: true }); go(); }

  const wipeT = document.getElementById('wipeT'); if (wipeT && p) wipeT.textContent = 'Scene 0' + (idx + 1) + ' · ' + p.title; wipe.style.transition = 'transform 1.1s cubic-bezier(.7,0,.2,1)';
  requestAnimationFrame(() => wipe.classList.remove('cover'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.href.startsWith('mailto:') || a.origin !== location.origin || a.hash && a.pathname === location.pathname || reduce) return;
    e.preventDefault(); const sv = SERVICES.find(s => a.pathname.endsWith('/' + s.slug + '.html')); if (wipeT) wipeT.textContent = sv ? 'Scene 0' + (SERVICES.indexOf(sv) + 1) + ' · ' + sv.title : (/index\.html|\/$/.test(a.pathname) ? 'The city' : ''); wipe.style.transition = 'transform .8s cubic-bezier(.7,0,.2,1)'; wipe.classList.add('cover'); setTimeout(() => { location.href = a.href; }, 1100);
  });
  addEventListener('pageshow', e => { if (e.persisted) wipe.classList.remove('cover'); });

  if (typeof gsap !== 'undefined' && !reduce) {
    gsap.from('.s-hero h1, .s-hero .eyebrow, .s-hero .lede', { y: 50, opacity: 0, filter: 'blur(12px)', stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.5 });
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.s-body > *, .inc li, .next a, .sr-room > *').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    }
  }
})();
