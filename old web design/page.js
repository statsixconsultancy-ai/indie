/* Sub-page behaviour: curtain reveal, banner artwork, scroll reveals, curtain on leave. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const curtain = document.getElementById('curtain');
  const idx = SERVICES.findIndex(s => s.slug === document.body.dataset.slug);
  const p = SERVICES[idx];

  async function draw() {
    try { await Promise.race([Promise.all([document.fonts.load('italic 90px "Instrument Serif"')]), new Promise(r => setTimeout(r, 2000))]); } catch (e) {}
    const cv = document.getElementById('banner');
    if (!cv || !p) return;
    cv.width = 2100; cv.height = 900;
    const g = cv.getContext('2d');
    drawWindow(g, p, idx, 0, 0, cv.width, cv.height);
  }

  function reveal() {
    curtain.style.transition = 'transform 1s cubic-bezier(.7,0,.2,1)';
    requestAnimationFrame(() => curtain.classList.remove('cover'));
    if (typeof gsap === 'undefined' || reduce) return;
    gsap.from('.p-hero > *', { y: 50, opacity: 0, stagger: 0.09, duration: 1.1, ease: 'expo.out', delay: 0.5 });
    gsap.from('.banner', { clipPath: 'inset(0 0 100% 0)', duration: 1.4, ease: 'expo.inOut', delay: 0.6 });
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.cols > *, .inc li, .next a, .sr-room > *').forEach(el =>
        gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    }
  }

  /* real page changes, wrapped in a curtain */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.href.startsWith('mailto:') || a.origin !== location.origin || a.hash && a.pathname === location.pathname || reduce) return;
    e.preventDefault();
    curtain.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)';
    curtain.classList.add('cover');
    setTimeout(() => { location.href = a.href; }, 700);
  });
  addEventListener('pageshow', e => { if (e.persisted) curtain.classList.remove('cover'); });

  draw(); reveal();
})();
