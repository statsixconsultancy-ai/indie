/* Light-leak trail: the cursor paints warm, glowing smears over the hero footage that slowly burn away. */
(() => {
  'use strict';
  const c = document.getElementById('trail');
  if (!c || matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const g = c.getContext('2d'); let w = 0, h = 0; const pts = [];
  const fit = () => { c.width = w = innerWidth; c.height = h = innerHeight; };
  fit(); addEventListener('resize', fit);
  let last = null;
  addEventListener('pointermove', e => {
    if (scrollY > innerHeight * 0.9) return;
    const p = { x: e.clientX, y: e.clientY, l: 1, k: pts.length % 2 };
    if (last) { const n = Math.min(6, Math.floor(Math.hypot(p.x - last.x, p.y - last.y) / 18)); for (let i = 1; i <= n; i++) pts.push({ x: last.x + ((p.x - last.x) * i) / (n + 1), y: last.y + ((p.y - last.y) * i) / (n + 1), l: 1, k: (pts.length + i) % 2 }); }
    pts.push(p); last = p; if (pts.length > 140) pts.splice(0, pts.length - 140);
  });
  (function loop() {
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 0, w, h);
    if (pts.length && scrollY < innerHeight * 1.1) {
      g.globalCompositeOperation = 'lighter';
      for (const p of pts) {
        p.l *= 0.955; const r = 40 + 130 * p.l, a = 0.2 * p.l, rgb = p.k ? '255,90,31' : '212,255,58';
        const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
      }
      while (pts.length && pts[0].l < 0.03) pts.shift();
    }
    requestAnimationFrame(loop);
  })();
})();
