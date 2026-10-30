/* Six live generative sketches, one per service. drawSketch(i, ctx, w, h, seconds). */
const TAU = Math.PI * 2;
const SKETCHES = [
  /* 0 sunrise */
  (g, w, h, t, c) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a0b3d'); gr.addColorStop(0.6, '#ff3d6e'); gr.addColorStop(1, c[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const sy = h * (0.72 - 0.2 * (0.5 + 0.5 * Math.sin(t * 0.8))), r = h * 0.2;
    g.fillStyle = 'rgba(255,255,255,.12)';
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + t * 0.15; g.beginPath(); g.moveTo(w / 2, sy); g.arc(w / 2, sy, w, a, a + 0.1); g.fill(); }
    g.save(); g.shadowColor = c[1]; g.shadowBlur = h * 0.3; g.fillStyle = '#fff3c9'; g.beginPath(); g.arc(w / 2, sy, r, 0, TAU); g.fill(); g.restore();
    g.fillStyle = '#14031f'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += w / 28) g.lineTo(x, h * 0.84 - Math.abs(Math.sin(x * 0.02)) * h * 0.12); g.lineTo(w, h); g.fill();
  },
  /* 1 equalizer capsules */
  (g, w, h, t, c) => {
    g.fillStyle = '#0b0414'; g.fillRect(0, 0, w, h);
    const n = 9, cw = Math.min(w / (n * 1.8), h * 0.14);
    for (let i = 0; i < n; i++) {
      const hh = h * (0.18 + 0.55 * Math.abs(Math.sin(t * 1.6 + i * 0.8) * Math.cos(t * 0.7 + i))), x = w / 2 + (i - (n - 1) / 2) * cw * 1.8 - cw / 2;
      const gr = g.createLinearGradient(0, h / 2 - hh / 2, 0, h / 2 + hh / 2); gr.addColorStop(0, c[i % 2]); gr.addColorStop(1, c[(i + 1) % 2]);
      g.save(); g.shadowColor = c[i % 2]; g.shadowBlur = 30; g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(x, h / 2 - hh / 2, cw, hh, cw / 2) : g.rect(x, h / 2 - hh / 2, cw, hh); g.fill(); g.restore();
    }
  },
  /* 2 bouncing jellies */
  (g, w, h, t, c) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ffe6f6'); gr.addColorStop(1, '#cfe9ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const cols = [c[0], c[1], '#ffd23f'];
    for (let i = 0; i < 3; i++) {
      const r = h * (0.17 + (i === 1 ? 0.06 : 0)), x = w * (0.22 + 0.28 * i), b = Math.abs(Math.sin(t * 2 + i * 1.3)), y = h * 0.66 - b * h * 0.28, sq = 1 + 0.14 * Math.cos(t * 4 + i * 1.3);
      g.fillStyle = 'rgba(40,10,80,.18)'; g.beginPath(); g.ellipse(x, h * 0.84, r * (0.8 + 0.2 * (1 - b)), r * 0.15, 0, 0, TAU); g.fill();
      const bg = g.createRadialGradient(x - r * 0.3, y - r * 0.4, 4, x, y, r * 1.2); bg.addColorStop(0, '#fff'); bg.addColorStop(0.2, cols[i]); bg.addColorStop(1, '#3a2a7a');
      g.fillStyle = bg; g.beginPath(); g.ellipse(x, y, r / sq, r * sq, 0, 0, TAU); g.fill();
      [-1, 1].forEach(s => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x + s * r * 0.34, y - r * 0.1, r * 0.2, 0, TAU); g.fill(); g.fillStyle = '#1a1140'; g.beginPath(); g.arc(x + s * r * 0.34, y - r * 0.06, r * 0.1, 0, TAU); g.fill(); });
    }
  },
  /* 3 camera iris */
  (g, w, h, t, c) => {
    g.fillStyle = '#04141c'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44, open = 0.5 + 0.5 * Math.sin(t * 0.9), hole = R * (0.14 + 0.5 * open);
    g.fillStyle = `rgba(${15},${181},${168},.2)`; g.beginPath(); g.arc(cx, cy, R * 1.1, 0, TAU); g.fill();
    const core = g.createRadialGradient(cx, cy, 0, cx, cy, hole * 1.3); core.addColorStop(0, '#fff'); core.addColorStop(0.5, c[1]); core.addColorStop(1, 'rgba(255,122,46,0)'); g.fillStyle = core; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU + open * 0.5; g.fillStyle = k % 2 ? '#0b2b36' : '#123c4a';
      g.beginPath(); g.moveTo(cx + Math.cos(a) * hole, cy + Math.sin(a) * hole); g.lineTo(cx + Math.cos(a - 0.5) * R, cy + Math.sin(a - 0.5) * R); g.lineTo(cx + Math.cos(a + 0.5) * R, cy + Math.sin(a + 0.5) * R); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
    }
    g.strokeStyle = '#cfd8dc'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
    g.save(); g.globalCompositeOperation = 'lighter'; const st = g.createLinearGradient(0, 0, w, 0); st.addColorStop(0, 'rgba(60,224,255,0)'); st.addColorStop(0.5, 'rgba(60,224,255,.85)'); st.addColorStop(1, 'rgba(60,224,255,0)'); g.fillStyle = st; g.fillRect(0, cy - 2, w, 4); g.restore();
  },
  /* 4 orbiting sphere */
  (g, w, h, t, c) => {
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0d2a2b'); bg.addColorStop(1, '#0a1620'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.17;
    for (let k = 0; k < 3; k++) {
      const rx = r * (2.2 + k * 0.9), ry = r * (0.8 + k * 0.32), rot = -0.35 + k * 0.4; g.strokeStyle = 'rgba(168,240,224,.28)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, rx, ry, rot, 0, TAU); g.stroke();
      const a = t * (0.9 - k * 0.2) + k * 2, px = Math.cos(a) * rx, py = Math.sin(a) * ry, X = cx + px * Math.cos(rot) - py * Math.sin(rot), Y = cy + px * Math.sin(rot) + py * Math.cos(rot);
      g.save(); g.shadowColor = c[k % 2]; g.shadowBlur = 24; g.fillStyle = c[k % 2]; g.beginPath(); g.arc(X, Y, r * 0.16, 0, TAU); g.fill(); g.restore();
    }
    const sp = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 4, cx, cy, r * 1.1); sp.addColorStop(0, '#fff'); sp.addColorStop(0.25, c[0]); sp.addColorStop(1, '#1b4b52');
    g.save(); g.shadowColor = c[0]; g.shadowBlur = r * 0.9; g.fillStyle = sp; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.restore();
  },
  /* 5 looping chevrons */
  (g, w, h, t, c) => {
    const bg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7); bg.addColorStop(0, '#2a0f7a'); bg.addColorStop(1, '#0a0330'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, m = Math.min(w, h);
    [[0.16, 16, 1], [0.26, 24, -1], [0.36, 32, 1]].forEach(([rr, n, d], j) => {
      g.save(); g.shadowColor = c[j % 2]; g.shadowBlur = 16; g.fillStyle = c[j % 2];
      for (let k = 0; k < n; k++) { const a = (k / n) * TAU + t * 0.6 * d, x = cx + Math.cos(a) * m * rr, y = cy + Math.sin(a) * m * rr; g.save(); g.translate(x, y); g.rotate(a + (d > 0 ? Math.PI / 2 : -Math.PI / 2)); g.beginPath(); g.moveTo(0, -m * 0.022); g.lineTo(m * 0.016, m * 0.016); g.lineTo(-m * 0.016, m * 0.016); g.closePath(); g.fill(); g.restore(); }
      g.restore();
    });
  }
];
function drawSketch(i, g, w, h, t) { g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip(); SKETCHES[i](g, w, h, t, SERVICES[i].c); g.restore(); }
