/* Shared procedural artwork: every image on the site is drawn in code. Needs data.js first.
   Style: glossy mesh gradients, 3D jelly shapes, chrome, neon glow, iridescent glass, anamorphic light. */
const TAU = Math.PI * 2;
const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const glow = (g, color, blur) => { g.shadowColor = color; g.shadowBlur = blur; };
const noGlow = g => { g.shadowColor = 'transparent'; g.shadowBlur = 0; };
const radial = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const num = i => String(i + 1).padStart(2, '0');

/* ---- helpers ---- */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
/* soft overlapping colour clouds: the "mesh gradient" look */
function mesh(g, S, base, blobs) {
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  blobs.forEach(([x, y, r, c, a = 1]) => { g.globalAlpha = a; g.fillStyle = radial(g, x * S, y * S, 0, r, [[0, c], [1, c + '00']]); g.fillRect(0, 0, S, S); });
  g.globalAlpha = 1;
}
function spark(g, x, y, r, col) {
  g.save(); g.translate(x, y); g.fillStyle = col; g.beginPath(); g.moveTo(0, -r);
  g.quadraticCurveTo(0, 0, r, 0); g.quadraticCurveTo(0, 0, 0, r); g.quadraticCurveTo(0, 0, -r, 0); g.quadraticCurveTo(0, 0, 0, -r); g.fill(); g.restore();
}
function bokeh(g, R, S, n, cols, rmin, rmax, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = R() * S, y = R() * S * 0.9 + S * 0.05, r = rmin + R() * (rmax - rmin), c = cols[i % cols.length];
    g.globalAlpha = a * (0.4 + R() * 0.6); g.fillStyle = radial(g, x, y, r * 0.2, r, [[0, c + 'aa'], [0.85, c + '55'], [1, c + '00']]); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.strokeStyle = c + '66'; g.lineWidth = 2; g.stroke();
  }
  g.restore();
}
function streak(g, S, y, col, h, a = 0.9) {
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, 0, S, 0);
  gr.addColorStop(0, col + '00'); gr.addColorStop(0.5, col); gr.addColorStop(1, col + '00'); g.globalAlpha = a; g.fillStyle = gr;
  g.fillRect(0, y - h / 2, S, h); g.globalAlpha = a * 0.35; g.fillRect(0, y - h * 3, S, h * 6); g.restore();
}
/* lit 3D sphere */
function ball(g, x, y, r, col, shadow = true) {
  g.save();
  if (shadow) { g.fillStyle = 'rgba(30,10,60,.28)'; g.beginPath(); g.ellipse(x + r * 0.12, y + r * 1.04, r * 0.92, r * 0.17, 0, 0, TAU); g.fill(); }
  g.fillStyle = radial(g, x - r * 0.35, y - r * 0.4, r * 0.08, r * 1.15, [[0, '#ffffff'], [0.16, col], [0.75, shade(col, -0.35)], [1, shade(col, -0.62)]]);
  g.beginPath(); g.ellipse(x, y, r, r * 0.96, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = r * 0.05; g.beginPath(); g.arc(x, y, r * 0.93, 0.15, 1.15); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.52, r * 0.26, r * 0.12, -0.6, 0, TAU); g.fill();
  g.restore();
}
function jelly(g, x, y, r, col, look) {
  ball(g, x, y, r, col);
  g.save(); const ex = r * 0.34, ey = y - r * 0.05, er = r * 0.2;
  [-1, 1].forEach(s => {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + s * ex, ey, er, 0, TAU); g.fill();
    g.fillStyle = '#1a1140'; g.beginPath(); g.arc(x + s * ex + look * er * 0.35, ey + er * 0.1, er * 0.56, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + s * ex + look * er * 0.35 - er * 0.18, ey - er * 0.12, er * 0.17, 0, TAU); g.fill();
  });
  g.strokeStyle = '#1a1140'; g.lineWidth = Math.max(5, r * 0.055); g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * 0.18, r * 0.27, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.fillStyle = 'rgba(255,90,140,.45)'; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(x + s * r * 0.58, y + r * 0.2, r * 0.13, r * 0.08, 0, 0, TAU); g.fill(); });
  g.restore();
}
function chrome(g, cx, cy, r, w) {
  const gr = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ['#ffffff', '#9fb7c9', '#27323e', '#e8f2ff', '#5d7388', '#ffffff'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
  g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
}
function holoRing(g, cx, cy, r, w, rot = 0) {
  let gr;
  if (g.createConicGradient) { gr = g.createConicGradient(rot, cx, cy); ['#ff7ad9', '#7af0ff', '#c6ff7a', '#ffe27a', '#ff7ad9'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c)); }
  else { gr = g.createLinearGradient(cx - r, cy, cx + r, cy); gr.addColorStop(0, '#ff7ad9'); gr.addColorStop(1, '#7af0ff'); }
  g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
}

const MOTIFS = {
  /* Brand Films: golden-hour sun, haze, lens flare, bokeh */
  sun(g, p, R, S) {
    mesh(g, S, '#2a0b3d', [[0.15, 0.75, 760, '#ff3d6e'], [0.82, 0.3, 700, '#ff9a2e'], [0.1, 0.05, 560, '#7a2cff'], [0.6, 0.62, 520, '#ff5d8a', 0.8]]);
    const cx = S * 0.5, cy = S * 0.42;
    for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(255,236,190,${0.26 - k * 0.05})`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 210 + k * 62, 0, TAU); g.stroke(); }
    glow(g, '#ffb347', 150); g.fillStyle = radial(g, cx - 40, cy - 50, 10, 190, [[0, '#fffbe0'], [0.35, '#ffd27a'], [0.75, '#ff7a45'], [1, '#ff3d6e']]);
    g.beginPath(); g.arc(cx, cy, 175, 0, TAU); g.fill(); noGlow(g);
    bokeh(g, R, S, 14, ['#ffd27a', '#ff7ad9', '#ffffff'], 14, 54, 0.8);
    for (let L = 0; L < 3; L++) {
      const base = S * (0.62 + L * 0.08), gr = g.createLinearGradient(0, base - 150, 0, S);
      gr.addColorStop(0, ['rgba(120,40,110,.85)', 'rgba(70,16,80,.92)', 'rgba(24,4,36,.98)'][L]); gr.addColorStop(1, '#14031f');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, S);
      for (let x = 0; x <= S; x += 40) g.lineTo(x, base - Math.abs(Math.sin(x * 0.011 + L * 2)) * 70 - R() * 30);
      g.lineTo(S, S); g.fill();
    }
    g.fillStyle = radial(g, cx, S * 0.62, 0, 480, [[0, 'rgba(255,200,150,.35)'], [1, 'rgba(255,200,150,0)']]); g.fillRect(0, 0, S, S);
    streak(g, S, cy, '#ffe9b0', 5);
  },
  /* Ad Campaigns: neon glossy capsules on a reflective floor */
  bars(g, p, R, S) {
    mesh(g, S, '#12041f', [[0.1, 0.9, 700, '#ff2d9b'], [0.95, 0.15, 650, '#6a2cff'], [0.55, 0.45, 520, '#19d3ff', 0.55]]);
    const floor = S * 0.62; g.fillStyle = radial(g, S / 2, floor, 0, 520, [[0, 'rgba(255,45,155,.35)'], [1, 'rgba(255,45,155,0)']]); g.fillRect(0, floor - 20, S, S);
    const caps = 9, cw = 66, gap = 30, x0 = S / 2 - (caps * (cw + gap) - gap) / 2;
    for (let k = 0; k < caps; k++) {
      const h = 130 + Math.pow(R(), 0.8) * 330, x = x0 + k * (cw + gap), y = floor - h, a = k % 2 ? ['#ff6ec7', '#ff8a3d'] : ['#d6ff5a', '#19d3ff'];
      g.save(); g.globalAlpha = 0.28; g.translate(0, floor * 2); g.scale(1, -1); g.fillStyle = a[1]; g.beginPath(); g.roundRect ? g.roundRect(x, y, cw, h, cw / 2) : g.rect(x, y, cw, h); g.fill(); g.restore();
      glow(g, a[0], 50); const gr = g.createLinearGradient(0, y, 0, floor); gr.addColorStop(0, a[0]); gr.addColorStop(1, a[1]); g.fillStyle = gr;
      g.beginPath(); g.roundRect ? g.roundRect(x, y, cw, h, cw / 2) : g.rect(x, y, cw, h); g.fill(); noGlow(g);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.roundRect ? g.roundRect(x + 10, y + 14, 12, h - 56, 6) : g.rect(x + 10, y + 14, 12, h - 56); g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(0, floor, S, 2);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2;
    for (let i = 0; i < 18; i++) { const sx = R() * S, sy = R() * floor; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - 120 - R() * 160, sy + 40 + R() * 60); g.stroke(); } g.restore();
  },
  /* Animated Characters: glossy jelly mascots on a pastel cloud, confetti */
  mascot(g, p, R, S) {
    mesh(g, S, '#ffe6f6', [[0.15, 0.2, 640, '#b9a6ff'], [0.9, 0.35, 620, '#59e3ff'], [0.55, 0.95, 640, '#ffb199'], [0.8, 0.9, 420, '#ffe27a']]);
    g.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(R() * S, S * 0.15 + R() * S * 0.3, 90 + R() * 80, 26 + R() * 18, 0, 0, TAU); g.fill(); }
    jelly(g, S * 0.22, S * 0.5, 108, '#4fe3ff', 1); jelly(g, S * 0.78, S * 0.5, 112, '#ffd23f', -1); jelly(g, S * 0.5, S * 0.36, 175, '#ff6fc2', 0);
    ['#ffffff', '#ff6fc2', '#4fe3ff', '#ffd23f'].forEach((c, i) => { for (let k = 0; k < 6; k++) { if ((k + i) % 2) spark(g, R() * S, R() * S * 0.8 + 40, 8 + R() * 18, c); else { g.fillStyle = c; g.beginPath(); g.arc(R() * S, R() * S * 0.8 + 40, 4 + R() * 7, 0, TAU); g.fill(); } } });
  },
  /* Film Making: teal & orange anamorphic cinema, chrome lens rings, bokeh */
  aperture(g, p, R, S) {
    mesh(g, S, '#04141c', [[0.05, 0.5, 700, '#0fb5a8'], [0.98, 0.45, 700, '#ff7a2e'], [0.5, 0.05, 520, '#1a4bff', 0.6]]);
    const cx = S / 2, cy = S * 0.43;
    bokeh(g, R, S, 18, ['#ff9a4d', '#2de0d0', '#ffffff'], 16, 70, 0.7);
    for (let k = 0; k < 5; k++) { g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 24; chrome(g, cx, cy, 90 + k * 62, k % 2 ? 14 : 28); g.restore(); }
    g.fillStyle = radial(g, cx, cy, 0, 100, [[0, '#ffffff'], [0.3, '#ffd9a0'], [1, '#ff7a2e00']]); g.beginPath(); g.arc(cx, cy, 100, 0, TAU); g.fill();
    streak(g, S, cy, '#3de0ff', 9, 0.95); streak(g, S, cy + 2, '#ffb36b', 4, 0.8);
  },
  /* Product & Explainers: iridescent glass sphere, soft pebbles, orbit lines */
  orb(g, p, R, S) {
    mesh(g, S, '#eaf4ff', [[0.1, 0.2, 640, '#a8f0e0'], [0.92, 0.3, 640, '#d7b6ff'], [0.5, 0.95, 640, '#ffd0c2'], [0.2, 0.8, 380, '#fff3a8', 0.7]]);
    const cx = S / 2, cy = S * 0.42, r = 195;
    g.fillStyle = 'rgba(40,70,100,.18)'; g.beginPath(); g.ellipse(cx + 30, cy + r + 40, r * 1.05, 32, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(cx, cy, 300 + k * 70, 90 + k * 26, -0.3, 0, TAU); g.stroke(); }
    ball(g, S * 0.16, S * 0.58, 56, '#8ef0d0'); ball(g, S * 0.86, S * 0.3, 44, '#c9a6ff'); ball(g, S * 0.8, S * 0.68, 34, '#ffb199');
    g.fillStyle = radial(g, cx - 40, cy - 60, 10, r * 1.1, [[0, 'rgba(255,255,255,.55)'], [0.6, 'rgba(180,225,255,.28)'], [1, 'rgba(120,190,255,.6)']]);
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
    holoRing(g, cx, cy, r - 6, 18, 0.4);
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip(); g.fillStyle = radial(g, cx + 40, cy + r * 0.9, 0, r, [[0, 'rgba(120,255,240,.65)'], [1, 'rgba(120,255,240,0)']]); g.fillRect(cx - r, cy - r, r * 2, r * 2); g.restore();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(cx - r * 0.4, cy - r * 0.5, r * 0.3, r * 0.13, -0.6, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(cx + r * 0.45, cy + r * 0.45, r * 0.12, r * 0.06, -0.6, 0, TAU); g.fill();
  },
  /* Social Loops: y2k holographic rings and a spiral of chrome sparkles */
  loops(g, p, R, S) {
    mesh(g, S, '#14003d', [[0.1, 0.9, 700, '#ff2d9b'], [0.95, 0.2, 700, '#19d3ff'], [0.5, 0.45, 520, '#7a2cff']]);
    const cx = S / 2, cy = S * 0.42;
    g.save(); glow(g, '#7af0ff', 40); holoRing(g, cx, cy, 300, 34, 0.2); holoRing(g, cx, cy, 215, 18, 1.4); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 345, 0, TAU); g.stroke();
    for (let k = 0; k < 30; k++) {
      const a = k * 0.5, r = 60 + k * 11, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.82, s = 10 + (k % 5) * 6;
      glow(g, `hsl(${(k * 24) % 360},100%,70%)`, 24); spark(g, x, y, s, `hsl(${(k * 24 + 30) % 360},100%,86%)`);
    }
    noGlow(g); spark(g, S * 0.12, S * 0.22, 54, '#ffffff'); spark(g, S * 0.9, S * 0.62, 38, '#ffe600');
  }
};

/* paints a service's artwork cropped to any rectangle (the "film window") */
function drawWindow(g, p, idx, x, y, w, h) {
  const S = 1024, off = document.createElement('canvas'); off.width = off.height = S;
  const og = off.getContext('2d'), R = rng(idx * 977 + 13);
  MOTIFS[p.motif](og, p, R, S);
  og.globalCompositeOperation = 'screen'; og.fillStyle = radial(og, S * 0.1, S * 0.18, 0, 460, [[0, 'rgba(255,255,255,.28)'], [1, 'rgba(255,255,255,0)']]); og.fillRect(0, 0, S, S);
  og.globalCompositeOperation = 'source-over';
  const ch = Math.min(S, (S * h) / w), cw = ch * (w / h) > S ? S : ch * (w / h);
  const sy = Math.max(0, Math.min(S - ch, S * 0.42 - ch / 2)), sx = (S - cw) / 2;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  try { g.filter = 'saturate(1.3) contrast(1.08)'; } catch (e) {}
  g.drawImage(off, sx, sy, cw, ch, x, y, w, h);
  g.filter = 'none';
  g.fillStyle = radial(g, x + w / 2, y + h / 2, h * 0.35, w * 0.68, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.42)']]); g.fillRect(x, y, w, h);
  const R2 = rng(idx * 31 + 5);
  for (let i = 0; i < Math.floor((w * h) / 110); i++) { g.fillStyle = R2() > 0.5 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.045)'; g.fillRect(x + R2() * w, y + R2() * h, 2, 2); }
  g.restore();
}

/* one cell of the film strip: base, sprocket holes (transparent), edge print, framed art, title */
const CELL_W = 800, CELL_H = 560;
function makeCell(p, idx) {
  const c = document.createElement('canvas'); c.width = CELL_W; c.height = CELL_H;
  const g = c.getContext('2d');
  g.fillStyle = '#0e0d0b'; g.fillRect(0, 0, CELL_W, CELL_H);
  drawWindow(g, p, idx, 24, 70, CELL_W - 48, 420);
  g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, 0, CELL_W, 6); g.fillRect(0, CELL_H - 6, CELL_W, 6);
  g.globalCompositeOperation = 'destination-out';
  for (let x = 20; x < CELL_W; x += 72) for (const y of [14, CELL_H - 14 - 28]) { g.beginPath(); g.roundRect ? g.roundRect(x, y, 36, 28, 7) : g.rect(x, y, 36, 28); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  g.font = '700 12px "Inter Tight", sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,170,60,.85)';
  g.fillText('INDIE ▸ SAFETY FILM ▸ ' + (5060 + idx), 24, 56); g.textAlign = 'right'; g.fillText('▲ ' + num(idx) + 'A', CELL_W - 24, 56);
  g.textAlign = 'left'; g.fillStyle = 'rgba(255,170,60,.85)'; g.fillText('▸ ' + num(idx), 24, CELL_H - 56);
  g.fillStyle = p.ink; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18;
  g.font = '700 15px "Inter Tight", sans-serif'; g.fillText(num(idx) + '  /  ' + p.kind.toUpperCase(), 54, 106);
  let s = 96; do { g.font = `italic 400 ${s}px "Instrument Serif", Georgia, serif`; s -= 4; } while (g.measureText(p.title).width > CELL_W - 120 && s > 40);
  g.fillText(p.title, 54, 440);
  g.shadowBlur = 0;
  return c;
}
