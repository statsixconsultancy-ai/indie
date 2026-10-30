/* Sub-page behaviour: live generative banner, reveals, wipe transition. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wipe = document.getElementById('wipe');
  const idx = SERVICES.findIndex(s => s.slug === document.body.dataset.slug);

  const cv = document.getElementById('banner');
  if (cv && idx >= 0) {
    const g = cv.getContext('2d');
    const fit = () => { const k = Math.min(devicePixelRatio || 1, 1.5); cv.width = cv.clientWidth * k; cv.height = cv.clientHeight * k; };
    fit(); addEventListener('resize', fit);
    const loop = now => { drawSketch(idx, g, cv.width, cv.height, reduce ? 2 : now / 1000); if (!reduce) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  wipe.style.transition = 'transform 1s cubic-bezier(.7,0,.2,1)';
  requestAnimationFrame(() => wipe.classList.remove('cover'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.href.startsWith('mailto:') || a.origin !== location.origin || a.hash && a.pathname === location.pathname || reduce) return;
    e.preventDefault(); wipe.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)'; wipe.classList.add('cover');
    setTimeout(() => { location.href = a.href; }, 700);
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
