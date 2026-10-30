/* The Zoom: one scroll-driven canvas film. Original indie sequence:
   1 tunnel of rings  ->  2 burst into a sunburst  ->  3 the reels (oval + pixel type)  ->  4 pick a reel.
   Everything is drawn from the scroll position p (0..1). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = $('c'), g = cv.getContext('2d'), curtain = $('curtain'), finale = $('finale');
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const seg = (a, b, x) => ease(clamp((x - a) / (b - a)));
  const backOut = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const lin = (a, b, x) => clamp((x - a) / (b - a));
  const INK = '#0a0504', YEL = '#ffe600', RED = '#ff3b1f', ORG = '#ff7a1a';
  const CHAPTERS = [[0, '01 · The tunnel'], [0.4, '02 · The burst'], [0.56, '03 · The reels'], [0.78, '04 · Pick a reel']];

  let W, H, DPR, S, noise, frameImg, titleBig, titleSmall, oval = {}, reelsTxt, stickerTxt, stars = [];

  /* chunky pixel type: draw small, scale up with smoothing off */
  function pixelText(txt, font, px, fill, shadow, pix) {
    const c = document.createElement('canvas'), x = c.getContext('2d'), size = px / pix;
    x.font = font.replace('{px}', size);
    const w = Math.ceil(x.measureText(txt).width) + 6, h = Math.ceil(size * 1.45);
    c.width = Math.max(1, w || 1); c.height = Math.max(1, h || 1); x.font = font.replace('{px}', size); x.textBaseline = 'middle'; x.textAlign = 'left';
    x.fillStyle = shadow; for (const [dx, dy] of [[2, 2], [1, 2], [2, 1], [3, 3], [2, 3], [3, 2]]) x.fillText(txt, 2 + dx, h / 2 + dy);
    x.fillStyle = fill; x.fillText(txt, 2, h / 2);
    return { c, w: w * pix, h: h * pix };
  }
  function star(x, y, r, col, rot = 0) {
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath(); g.moveTo(0, -r);
    g.quadraticCurveTo(0, 0, r, 0); g.quadraticCurveTo(0, 0, 0, r); g.quadraticCurveTo(0, 0, -r, 0); g.quadraticCurveTo(0, 0, 0, -r); g.fill(); g.restore();
  }

  function build() {
    DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth || 1280; H = innerHeight || 720; S = Math.min(W, H * 1.25);
    cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = document.createElement('canvas'); n.width = n.height = 200; const ng = n.getContext('2d');
    const id = ng.createImageData(200, 200);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    ng.putImageData(id, 0, 0); noise = g.createPattern(n, 'repeat');
    const fw = 150, fh = 112, fc = document.createElement('canvas'); fc.width = fw * 2; fc.height = fh * 2; const fg = fc.getContext('2d');
    fg.fillStyle = '#0e0d0b'; fg.fillRect(0, 0, fw * 2, fh * 2); drawWindow(fg, SERVICES[0], 0, 14, 14, fw * 2 - 28, fh * 2 - 28);
    fg.strokeStyle = '#f4efe6'; fg.lineWidth = 6; fg.strokeRect(3, 3, fw * 2 - 6, fh * 2 - 6); frameImg = fc;
    const pix = Math.max(3, Math.round(S / 190));
    titleBig = pixelText('INDIE STUDIOS', '800 {px}px "Inter Tight", sans-serif', S * 0.1, YEL, '#b3200f', pix);
    titleSmall = pixelText('presents', 'italic 400 {px}px "Instrument Serif", serif', S * 0.06, '#ffd9a0', '#7a1a0a', Math.max(2, pix - 1));
    oval.rx = Math.min(W * 0.4, S * 0.5); oval.ry = oval.rx * 0.5;
    reelsTxt = pixelText('REELS', '800 {px}px "Inter Tight", sans-serif', oval.ry * 0.9, RED, '#12100d', Math.max(3, Math.round(oval.ry / 30)));
    stickerTxt = pixelText('Scroll', 'italic 400 {px}px "Instrument Serif", serif', S * 0.05, '#12100d', 'rgba(0,0,0,0)', 1);
    stars = Array.from({ length: 16 }, (_, i) => { const r = ((i * 9301 + 49297) % 233280) / 233280, r2 = ((i * 4973 + 1523) % 233280) / 233280; return { x: ((r * 997) % 1), y: ((r2 * 613) % 1), s: 0.5 + ((r * 31) % 1), c: ['#fff6c8', '#ffe600', '#ffffff', '#ffb000'][i % 4], p: i }; });
  }

  /* ---- scene painters ---- */
  function tunnel(p, t) {
    const x = clamp(p / 0.46), ph = 10 * x, cx = W / 2, cy = H / 2, diag = Math.hypot(W, H);
    const rings = [];
    for (let j = -14; j <= 10; j++) { const r = S * 0.05 * Math.pow(1.72, j + ph); if (r > 2 && r < diag * 1.2) rings.push([r, j]); }
    g.fillStyle = INK; g.fillRect(0, 0, W, H);
    rings.sort((a, b) => b[0] - a[0]);
    for (const [r, j] of rings) {
      const odd = ((j % 2) + 2) % 2;
      if (odd) { g.fillStyle = INK; }
      else { const gr = g.createRadialGradient(cx, cy, r * 0.2, cx, cy, r); gr.addColorStop(0, ORG); gr.addColorStop(0.7, '#ff5a1f'); gr.addColorStop(1, RED); g.fillStyle = gr; }
      g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
    }
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, S * 0.9); glow.addColorStop(0, 'rgba(255,170,60,.28)'); glow.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    // the little film frame sits at the heart of the tunnel and swells as you fall in
    const k = (1 - seg(0.3, 0.42, p)) * (1 + Math.pow(ph, 1.6) * 0.32), fw = S * 0.1 * k;
    if (fw > 1) { g.save(); g.globalAlpha = 1 - seg(0.3, 0.42, p); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 24; g.drawImage(frameImg, cx - fw / 2, cy - fw * 0.38 + Math.sin(t * 1.4) * 3, fw, fw * 0.75); g.restore(); }
    // opening titles
    const ta = 1 - seg(0.04, 0.2, p);
    if (ta > 0.01) {
      g.save(); g.globalAlpha = ta; g.imageSmoothingEnabled = false;
      const sc = 1 + seg(0.04, 0.2, p) * 0.6, w = titleBig.w * sc, h = titleBig.h * sc, ty = H * 0.13 - seg(0.04, 0.2, p) * H * 0.12;
      g.translate(cx, ty); g.rotate(-0.025 + Math.sin(t * 0.9) * 0.008); g.drawImage(titleBig.c, -w / 2, -h / 2, w, h);
      g.drawImage(titleSmall.c, -titleSmall.w / 2, h * 0.5, titleSmall.w, titleSmall.h);
      g.restore();
    }
  }

  function sunburst(p, t, clipR, vis) {
    const cx = W / 2, cy = H / 2, diag = Math.hypot(W, H);
    g.save(); g.beginPath(); g.arc(cx, cy, clipR, 0, TAU); g.clip();
    g.fillStyle = '#ffb300'; g.fillRect(0, 0, W, H);
    const n = 30, rot = p * 0.9 + t * 0.04;
    for (let i = 0; i < n; i++) {
      if (i % 2) continue; const a = rot + (i / n) * TAU, b = rot + ((i + 1) / n) * TAU;
      g.fillStyle = '#ff9400'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * diag, cy + Math.sin(a) * diag); g.lineTo(cx + Math.cos(b) * diag, cy + Math.sin(b) * diag); g.fill();
    }
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, diag * 0.6); gr.addColorStop(0, 'rgba(255,90,0,.55)'); gr.addColorStop(0.5, 'rgba(255,170,0,0)'); gr.addColorStop(1, 'rgba(255,230,60,.25)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const hole = (1 - seg(0.5, 0.62, p)) * S * 0.2;
    if (hole > 1) { const hg = g.createRadialGradient(cx, cy, 0, cx, cy, hole); hg.addColorStop(0, 'rgba(10,5,4,1)'); hg.addColorStop(0.55, 'rgba(10,5,4,.9)'); hg.addColorStop(1, 'rgba(10,5,4,0)'); g.fillStyle = hg; g.fillRect(cx - hole, cy - hole, hole * 2, hole * 2); }
    stars.forEach(s => { const tw = 0.65 + 0.35 * Math.sin(t * 2.2 + s.p * 1.7); star(s.x * W, s.y * H, S * 0.03 * s.s * tw * vis, s.c, 0); });
    star(W * 0.9, H * 0.88, S * 0.1 * vis, '#fff2a0', 0.1); star(W * 0.1, H * 0.78, S * 0.05 * vis, '#fff2a0', 0);
    g.restore();
  }

  function ovalScene(p, t) {
    const a = backOut(clamp(lin(0.54, 0.66, p)));
    if (a <= 0.01) return;
    const settle = seg(0.76, 0.9, p), cx = W / 2, cy = H / 2 - settle * H * 0.16, sc = a * (1 - settle * 0.38);
    g.save(); g.translate(cx, cy); g.rotate(-0.16 + Math.sin(t * 0.8) * 0.01); g.scale(sc, sc);
    g.shadowColor = 'rgba(80,20,0,.45)'; g.shadowBlur = 40; g.shadowOffsetY = 18;
    g.beginPath(); g.ellipse(0, 0, oval.rx, oval.ry, 0, 0, TAU);
    const og = g.createLinearGradient(0, -oval.ry, 0, oval.ry); og.addColorStop(0, '#3f6bff'); og.addColorStop(1, '#1a36d6'); g.fillStyle = og; g.fill();
    g.shadowColor = 'transparent'; g.lineWidth = Math.max(6, S * 0.012); g.strokeStyle = '#fff'; g.stroke();
    g.beginPath(); g.ellipse(0, -oval.ry * 0.25, oval.rx * 0.82, oval.ry * 0.5, 0, Math.PI, TAU); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 4; g.stroke();
    g.imageSmoothingEnabled = false;
    const wob = Math.sin(t * 1.3) * 3; g.drawImage(reelsTxt.c, -reelsTxt.w / 2, -reelsTxt.h / 2 + wob, reelsTxt.w, reelsTxt.h);
    g.restore();
    // sticker
    const sa = seg(0.62, 0.7, p) * (1 - seg(0.74, 0.8, p));
    if (sa > 0.01) {
      g.save(); g.globalAlpha = sa; g.translate(cx + oval.rx * 0.62, cy + oval.ry * 0.95 + Math.sin(t * 2) * 4); g.rotate(-0.12);
      const sw = stickerTxt.w * 1.7, sh = stickerTxt.h * 1.5;
      g.fillStyle = '#c6ff3d'; g.beginPath(); g.ellipse(0, 0, sw / 2, sh / 2, 0, 0, TAU); g.fill(); g.strokeStyle = '#12100d'; g.lineWidth = 4; g.stroke();
      g.drawImage(stickerTxt.c, -stickerTxt.w / 2, -stickerTxt.h / 2, stickerTxt.w, stickerTxt.h); g.restore();
    }
  }

  function render(p, t) {
    tunnel(p, t);
    const burst = seg(0.4, 0.56, p), diag = Math.hypot(W, H);
    if (burst > 0.001) {
      const clipR = Math.pow(burst, 2.1) * diag * 0.78 + (p >= 0.56 ? diag : 0);
      sunburst(p, t, clipR, seg(0.5, 0.62, p));
      if (burst > 0.6 && burst < 1) { g.fillStyle = `rgba(255,250,220,${Math.sin((burst - 0.6) / 0.4 * Math.PI) * 0.55})`; g.fillRect(0, 0, W, H); }
    }
    ovalScene(p, t);
    g.save(); g.globalAlpha = 0.1; g.globalCompositeOperation = 'overlay'; g.translate((Math.random() * 200) | 0, (Math.random() * 200) | 0); g.fillStyle = noise; g.fillRect(-200, -200, W + 400, H + 400); g.restore();
  }

  /* ---- scroll -> p (smoothed) ---- */
  let target = 0, cur = 0, last = -1;
  const total = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const readScroll = () => { target = reduce ? 0.66 : clamp(scrollY / total()); };
  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', () => { build(); last = -1; readScroll(); });

  function frame(now) {
    cur += (target - cur) * (reduce ? 1 : 0.075);
    if (Math.abs(cur - target) < 0.00005) cur = target;
    render(cur, now / 1000);
    if (Math.abs(cur - last) > 0.0001 || true) {
      const ch = CHAPTERS.filter(c => cur >= c[0]).pop(); if ($('chapter').textContent !== ch[1]) $('chapter').textContent = ch[1];
      $('prog').style.transform = `scaleX(${cur})`;
      const fa = seg(0.8, 0.92, cur); finale.style.opacity = fa; finale.classList.toggle('on', fa > 0.5); finale.setAttribute('aria-hidden', fa > 0.5 ? 'false' : 'true');
      $('hint').style.opacity = 1 - seg(0.02, 0.08, cur);
      last = cur;
    }
    requestAnimationFrame(frame);
  }

  /* page transitions (real page changes behind a curtain) */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.origin !== location.origin || a.href.startsWith('mailto:') || reduce) return;
    e.preventDefault(); curtain.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)'; curtain.classList.add('cover');
    setTimeout(() => { location.href = a.href; }, 700);
  });
  addEventListener('pageshow', e => { if (e.persisted) curtain.classList.remove('cover'); });

  async function start() {
    if (reduce) document.documentElement.classList.add('reduce'), document.body.classList.add('reduce');
    try { await Promise.race([Promise.all([document.fonts.load('800 40px "Inter Tight"'), document.fonts.load('italic 40px "Instrument Serif"')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
    build(); readScroll(); cur = target;
    curtain.style.transition = 'transform 1s cubic-bezier(.7,0,.2,1)'; requestAnimationFrame(() => curtain.classList.remove('cover'));
    requestAnimationFrame(frame);
  }
  start();
})();
