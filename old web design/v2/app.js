(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = x => (reduce ? 0.01 : x);
  const TAU = Math.PI * 2;
  const MAIL = 'hello@indie.studio'; // placeholder: replace with the real address

  /* One disc per service. Each can later open into its own sub-page. */
  const SERVICES = [
    { title: 'Brand Films', kind: 'Story', short: 'Films', tag: 'YOUR STORY, IN MOTION', motif: 'sun',
      pal: ['#ff8a1f', '#ff2d6f', '#ffe27a', '#3a0a24'], ink: '#fff6e8',
      what: 'A cinematic AI-animated film that tells who your brand is and why it matters.',
      get: 'Script, storyboard, animation, sound and grade, ready for web, social and screens.',
      best: 'Launches, About pages, campaigns', formats: '16:9 · 9:16 · 1:1',
      includes: ['Script & storyboard', 'AI animation', 'Sound design', 'Colour grade'] },
    { title: 'Ad Campaigns', kind: 'Ads', short: 'Ads', tag: 'BUILT TO STOP THE SCROLL', motif: 'bars',
      pal: ['#0d0d0d', '#25103a', '#c6ff3d', '#ff2d6f'], ink: '#f4efe6',
      what: 'Short ads that stop thumbs, made once and remixed for every format and audience.',
      get: 'Hook-first scripts, many creative variants, platform-ready cuts and captions.',
      best: 'Paid social, TV, product launches', formats: '6s · 15s · 30s · 60s',
      includes: ['Concept & hooks', 'Spot production', 'Variant cuts', 'Captions & formats'] },
    { title: 'Animated Characters', kind: 'Characters', short: 'Characters', tag: 'MASCOTS WITH A PULSE', motif: 'mascot',
      pal: ['#b9a6ff', '#59e3ff', '#ffd23f', '#2a1a6b'], ink: '#1a1140',
      what: 'Original characters and mascots that give your brand a face and a voice.',
      get: 'Character design, personality, animation loops and a reusable character kit.',
      best: 'Consumer brands, apps, kids', formats: 'Video · Loops · Stickers',
      includes: ['Character design', 'Voice & personality', 'Animation loops', 'Reusable kit'] },
    { title: 'Film Making', kind: 'Film', short: 'Cinema', tag: 'SHORTS · TRAILERS · MUSIC VIDEOS', motif: 'aperture', sub: 'screening',
      pal: ['#6b0f12', '#150405', '#f4d9b0', '#0b0b0b'], ink: '#f4d9b0',
      what: 'Directed short films, trailers and music videos, made by a crew of people and AI.',
      get: 'Development, direction, edit, score and finishing for festivals or feeds.',
      best: 'Artists, studios, festivals', formats: 'Cinema · Web · Festival',
      includes: ['Development', 'Direction', 'Edit & score', 'Finishing'] },
    { title: 'Product & Explainers', kind: 'Explainers', short: 'Explain', tag: 'MAKE THE COMPLEX FEEL SIMPLE', motif: 'orb',
      pal: ['#dfe6e4', '#7fd6c0', '#ffffff', '#1f3b36'], ink: '#10231f',
      what: 'Product films and explainers that show how it works and why it matters.',
      get: 'Clear scripts, polished 3D-style visuals, voiceover and subtitles.',
      best: 'Apps, hardware, startups', formats: 'Web · Sales decks · Social',
      includes: ['Script & voiceover', 'Product visuals', 'Motion graphics', 'Subtitles'] },
    { title: 'Social Loops', kind: 'Social', short: 'Loops', tag: 'ENDLESS, REMIXABLE MOTION', motif: 'loops',
      pal: ['#5a2bff', '#19d3ff', '#ffffff', '#ff2d6f'], ink: '#ffffff',
      what: 'A library of short loops and motion pieces built for feeds, stories and shorts.',
      get: 'A motion system, templates and a batch of ready-to-post clips.',
      best: 'Always-on social, creators', formats: '9:16 · 1:1 · GIF',
      includes: ['Motion system', 'Batch of clips', 'Templates', 'Posting kit'] }
  ];
  const N = SERVICES.length;
  const num = i => String(i + 1).padStart(2, '0');
  const mod = (n, m = N) => ((n % m) + m) % m;
  const wrapOff = (i, p) => { let o = mod(i - p); if (o > N / 2) o -= N; return o; };

  /* ---------- artwork: layered, cinematic, drawn in code ---------- */
  const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const glow = (g, color, blur) => { g.shadowColor = color; g.shadowBlur = blur; };
  const noGlow = g => { g.shadowColor = 'transparent'; g.shadowBlur = 0; };
  const radial = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };

  const MOTIFS = {
    sun(g, p, R, S) {
      const cx = S / 2, cy = S * 0.4;
      g.fillStyle = radial(g, cx, cy, 0, 520, [[0, p.pal[2] + 'ff'], [0.35, p.pal[0] + '99'], [1, p.pal[3] + '00']]); g.fillRect(0, 0, S, S);
      g.fillStyle = p.pal[2] + '40';
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * TAU, b = ((i + 0.5) / 40) * TAU;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900); g.lineTo(cx + Math.cos(b) * 900, cy + Math.sin(b) * 900); g.fill();
      }
      glow(g, p.pal[2], 60); g.strokeStyle = p.pal[2]; g.lineWidth = 12; g.beginPath(); g.arc(cx, cy, 200, 0, TAU); g.stroke();
      g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 250, 0, TAU); g.stroke(); noGlow(g);
      for (let L = 0; L < 3; L++) {                       // layered ridgelines
        g.fillStyle = p.pal[3] + ['55', '99', 'dd'][L]; g.beginPath(); g.moveTo(0, S);
        for (let x = 0; x <= S; x += 48) g.lineTo(x, S * (0.62 + L * 0.07) - R() * 70);
        g.lineTo(S, S); g.fill();
      }
    },
    bars(g, p, R, S) {
      g.fillStyle = radial(g, S / 2, S * 0.4, 0, 420, [[0, p.pal[1]], [1, p.pal[0]]]); g.fillRect(0, 0, S, S);
      for (let x = 64, k = 0; x < S - 50; x += 36, k++) {
        const h = 50 + Math.pow(R(), 0.7) * 480, y = S * 0.4 - h / 2, col = k % 3 === 0 ? p.pal[3] : p.pal[2];
        glow(g, col, 34); g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(x, y, 20, h, 10) : g.rect(x, y, 20, h); g.fill();
      }
      noGlow(g); g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 0; y < S; y += 6) g.fillRect(0, y, S, 1);   // scanlines
    },
    mascot(g, p, R, S) {
      g.fillStyle = radial(g, S / 2, S * 0.4, 0, 560, [[0, '#ffffff66'], [1, p.pal[3] + '55']]); g.fillRect(0, 0, S, S);
      const blob = (x, y, r, col, look) => {
        g.save(); glow(g, 'rgba(20,10,60,.35)', 30); g.fillStyle = col; g.beginPath(); g.ellipse(x, y, r, r * 0.92, 0, 0, TAU); g.fill(); noGlow(g);
        g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.45, r * 0.3, r * 0.14, -0.5, 0, TAU); g.fill();
        const ex = r * 0.34, ey = y - r * 0.1, er = r * 0.2;
        [-1, 1].forEach(s => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x + s * ex, ey, er, 0, TAU); g.fill();
          g.fillStyle = '#1a1140'; g.beginPath(); g.arc(x + s * ex + look * er * 0.4, ey + er * 0.1, er * 0.5, 0, TAU); g.fill(); });
        g.strokeStyle = '#1a1140'; g.lineWidth = Math.max(4, r * 0.05); g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * 0.12, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); g.restore();
      };
      blob(S * 0.2, S * 0.5, 100, p.pal[1], 1); blob(S * 0.8, S * 0.5, 100, p.pal[2], -1);
      blob(S * 0.5, S * 0.3, 165, p.pal[0] === '#b9a6ff' ? '#ff7ac8' : p.pal[0], 0);
      g.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { g.globalAlpha = 0.5; g.beginPath(); g.arc(R() * S, R() * S * 0.7, 3 + R() * 6, 0, TAU); g.fill(); } g.globalAlpha = 1;
    },
    aperture(g, p, R, S) {
      const cx = S / 2, cy = S * 0.43;
      g.fillStyle = radial(g, cx, cy, 0, 560, [[0, p.pal[0]], [1, p.pal[1]]]); g.fillRect(0, 0, S, S);
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * TAU;
        g.fillStyle = k % 2 ? p.pal[3] + 'dd' : p.pal[2] + '22'; g.beginPath(); g.moveTo(cx + Math.cos(a + 0.5) * 150, cy + Math.sin(a + 0.5) * 150);
        g.lineTo(cx + Math.cos(a) * 540, cy + Math.sin(a) * 540); g.lineTo(cx + Math.cos(a + TAU / 9) * 540, cy + Math.sin(a + TAU / 9) * 540); g.closePath(); g.fill();
        g.strokeStyle = p.pal[2] + '55'; g.lineWidth = 2; g.stroke();
      }
      g.globalCompositeOperation = 'screen'; g.fillStyle = radial(g, cx, cy, 0, 200, [[0, p.pal[2] + 'aa'], [1, p.pal[2] + '00']]); g.fillRect(0, 0, S, S);
      const st = g.createLinearGradient(0, 0, S, 0); st.addColorStop(0, 'rgba(255,200,150,0)'); st.addColorStop(0.5, 'rgba(255,220,180,.9)'); st.addColorStop(1, 'rgba(255,200,150,0)');
      g.fillStyle = st; g.fillRect(0, cy - 3, S, 6); g.globalCompositeOperation = 'source-over';
    },
    orb(g, p, R, S) {
      g.fillStyle = radial(g, S * 0.5, S * 0.4, 0, 620, [[0, '#ffffff'], [1, p.pal[1] + 'aa']]); g.fillRect(0, 0, S, S);
      g.lineWidth = 3;
      for (let k = 0; k < 4; k++) { g.strokeStyle = p.pal[3] + (k % 2 ? '33' : '66'); g.beginPath(); g.ellipse(S / 2, S * 0.33, 250 + k * 60, 80 + k * 22, -0.35, 0, TAU); g.stroke(); }
      glow(g, 'rgba(15,60,50,.45)', 50); g.fillStyle = radial(g, S * 0.44, S * 0.26, 10, 230, [[0, '#ffffff'], [0.35, p.pal[1]], [1, p.pal[3]]]);
      g.beginPath(); g.arc(S / 2, S * 0.33, 205, 0, TAU); g.fill(); noGlow(g);
      for (let k = 0; k < 3; k++) { g.fillStyle = [p.pal[1], p.pal[3], '#fff'][k]; g.beginPath(); g.arc(S * (0.18 + 0.32 * k + R() * 0.1), S * (0.14 + 0.3 * R()), 14 + R() * 18, 0, TAU); g.fill(); }
    },
    loops(g, p, R, S) {
      g.fillStyle = radial(g, S / 2, S * 0.42, 0, 600, [[0, p.pal[1]], [1, p.pal[0]]]); g.fillRect(0, 0, S, S);
      [[250, p.pal[2], 1, 20], [330, p.pal[3], -1, 28], [410, p.pal[2], 1, 36]].forEach(([r, col, dir, n]) => {
        glow(g, col, 20); g.fillStyle = col;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * TAU, x = S / 2 + Math.cos(a) * r, y = S * 0.42 + Math.sin(a) * r, t = a + (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
          g.save(); g.translate(x, y); g.rotate(t); g.beginPath(); g.moveTo(0, -16); g.lineTo(11, 12); g.lineTo(-11, 12); g.closePath(); g.fill(); g.restore();
        }
      });
      noGlow(g);
    }
  };

  function hub(g, S) {
    const c = S / 2, gr = g.createRadialGradient(c - 20, c - 20, 6, c, c, S * 0.16);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#d9d9de'); gr.addColorStop(1, '#a4a4ad');
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, S * 0.15, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.beginPath(); g.arc(c, c, S * 0.15, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.arc(c, c, S * 0.115, 0, TAU); g.stroke();
  }
  function fitText(g, text, x, y, maxW, font, size) {
    let s = size; do { g.font = font.replace('{s}', s); s -= 4; } while (g.measureText(text).width > maxW && s > 30);
    g.fillText(text, x, y);
  }
  /* text bent along the rim; bottom=true reads upright along the lower arc */
  function arcText(g, text, r, centerAngle, bottom, tracking) {
    g.font = '700 21px "Inter Tight", sans-serif'; g.textAlign = 'center';
    const widths = [...text].map(ch => g.measureText(ch).width + tracking), total = widths.reduce((a, b) => a + b, 0);
    let a = centerAngle + (bottom ? total / r / 2 : -total / r / 2);
    [...text].forEach((ch, i) => {
      const step = widths[i] / r, mid = bottom ? a - step / 2 : a + step / 2;
      g.save(); g.translate(512 + Math.cos(mid) * r, 512 + Math.sin(mid) * r); g.rotate(bottom ? mid - Math.PI / 2 : mid + Math.PI / 2); g.fillText(ch, 0, 0); g.restore();
      a += bottom ? -step : step;
    });
  }
  function perfRing(g, S) {
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, TAU); g.arc(S / 2, S / 2, 466, 0, TAU, true); g.fill();
    g.fillStyle = 'rgba(255,255,255,.6)';
    for (let k = 0; k < 72; k++) { g.save(); g.translate(S / 2, S / 2); g.rotate((k / 72) * TAU); g.beginPath(); g.roundRect ? g.roundRect(-8, -500, 16, 22, 4) : g.rect(-8, -500, 16, 22); g.fill(); g.restore(); }
  }
  function makeFront(p, idx) {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), R = rng(idx * 977 + 13);
    const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, p.pal[0]); gr.addColorStop(1, p.pal[1]);
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    MOTIFS[p.motif](g, p, R, S);
    // light leak + vignette give the film-print depth
    g.globalCompositeOperation = 'screen'; g.fillStyle = radial(g, S * 0.12, S * 0.2, 0, 480, [[0, p.pal[2] + '77'], [1, p.pal[2] + '00']]); g.fillRect(0, 0, S, S);
    g.fillStyle = radial(g, S * 0.9, S * 0.9, 0, 380, [[0, p.pal[3] === '#0b0b0b' ? '#c04a2866' : '#ffffff44'], [1, '#ffffff00']]); g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = radial(g, S / 2, S / 2, 260, 530, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.5)']]); g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2;
    for (let r = 160; r < 466; r += 14) { g.beginPath(); g.arc(S / 2, S / 2, r, 0, TAU); g.stroke(); }
    perfRing(g, S);
    g.fillStyle = 'rgba(255,255,255,.85)'; arcText(g, 'INDIE  ✦  AI ANIMATION STUDIO  ✦  ' + num(idx) + ' / ' + String(N).padStart(2, '0'), 436, Math.PI / 2, true, 6);
    arcText(g, p.tag, 436, -Math.PI / 2, false, 6);
    // typography
    g.textAlign = 'center'; g.fillStyle = p.ink; glow(g, 'rgba(0,0,0,.35)', 18);
    g.font = '700 24px "Inter Tight", sans-serif'; g.letterSpacing = '8px'; g.fillText('SERVICE ' + num(idx), S / 2 + 4, 704); g.letterSpacing = '0px';
    fitText(g, p.title, S / 2, 805, 720, 'italic 400 {s}px "Instrument Serif", Georgia, serif', 132);
    noGlow(g);
    for (let i = 0; i < 9000; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(R() * S, R() * S, 2, 2); }
    hub(g, S);
    return c;
  }
  function makeBack(p) {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    let gr;
    if (g.createConicGradient) {
      gr = g.createConicGradient(0.6, S / 2, S / 2);
      ['#dfe3ea', '#c9b8ff', '#b8f0ff', '#f6ffd0', '#ffd6e4', '#dfe3ea'].forEach((col, i, a) => gr.addColorStop(i / (a.length - 1), col));
    } else { gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, '#dfe3ea'); gr.addColorStop(1, '#c9b8ff'); }
    g.fillStyle = gr; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 2;
    for (let r = 160; r < 512; r += 5) { g.beginPath(); g.arc(S / 2, S / 2, r, 0, TAU); g.stroke(); }
    g.textAlign = 'center'; g.fillStyle = '#121212';
    g.font = '700 24px "Inter Tight", sans-serif'; g.letterSpacing = '8px'; g.fillText("SIDE B — WHAT'S INSIDE", S / 2 + 4, 700); g.letterSpacing = '0px';
    g.font = 'italic 400 54px "Instrument Serif", Georgia, serif';
    p.includes.forEach((ch, i) => g.fillText(`${num(i)}  ${ch}`, S / 2, 770 + i * 58));
    hub(g, S);
    return c;
  }
  function shadowTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(0,0,0,.34)'); gr.addColorStop(0.6, 'rgba(0,0,0,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c;
  }

  /* ---------- Screening Room: film reference library ----------
     Credits and awards are facts. To play a clip, add an official upload to a film:
     embed: { yt: 'VIDEO_ID' }  or  embed: { vimeo: 'VIDEO_ID' }.
     Stills below are indie's own abstract studies, not frames from these films. */
  const FILMS = [
    { title: '1917', year: 2019, dir: 'Sam Mendes', dp: 'Roger Deakins', kind: 'cine', award: 'Academy Award, Best Cinematography (2020)', embed: { yt: 'qi78h-kwhKo' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'The Revenant', year: 2015, dir: 'Alejandro G. Iñárritu', dp: 'Emmanuel Lubezki', kind: 'cine', award: 'Academy Award, Best Cinematography (2016)', embed: { yt: 'qt7yWolzqZo' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'Oppenheimer', year: 2023, dir: 'Christopher Nolan', dp: 'Hoyte van Hoytema', kind: 'cine', award: 'Academy Award, Best Cinematography (2024)', embed: { yt: 'O_hKC3gRvzw' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'Dune', year: 2021, dir: 'Denis Villeneuve', dp: 'Greig Fraser', kind: 'cine', award: 'Academy Award, Best Cinematography (2022)', embed: { yt: 'b1b4Wbhv0E0' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'Blade Runner 2049', year: 2017, dir: 'Denis Villeneuve', dp: 'Roger Deakins', kind: 'cine', award: 'Academy Award, Best Cinematography (2018)', embed: { yt: '5Gt-mHvv-yw' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'An Irish Goodbye', year: 2022, dir: 'Tom Berkeley & Ross White', kind: 'short', award: 'Academy Award, Best Live Action Short (2023)', embed: { yt: 'Ch-vxzXDh7o' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'The Silent Child', year: 2017, dir: 'Chris Overton', kind: 'short', award: 'Academy Award, Best Live Action Short (2018)', embed: { yt: '2GbxFIVQv8c' }, note: 'Full film · official NITVShorts channel' },
    { title: 'Two Distant Strangers', year: 2020, dir: 'Travon Free & Martin Desmond Roe', kind: 'short', award: 'Academy Award, Best Live Action Short (2021)', embed: { yt: 'ZwFIULE46SU' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'Skin', year: 2018, dir: 'Guy Nattiv', kind: 'short', award: 'Academy Award, Best Live Action Short (2019)', embed: { yt: 'x-fsRO3CbW8' }, note: 'Oscars win clip · official Oscars channel' },
    { title: 'Stutterer', year: 2015, dir: 'Benjamin Cleary', kind: 'short', award: 'Academy Award, Best Live Action Short (2016)', embed: { yt: 'fmmYUUPzvNg' }, note: 'Oscars win clip · official Oscars channel' }
  ];
  const embedUrl = e => !e ? '' : e.yt ? `https://www.youtube-nocookie.com/embed/${e.yt}?autoplay=1&rel=0` : e.vimeo ? `https://player.vimeo.com/video/${e.vimeo}?autoplay=1` : '';
  const STILL_PALS = [['#1c2a3a', '#d6a35a', '#f2e6cf'], ['#10181f', '#8fb3c9', '#e8f1f5'], ['#2a1810', '#e0763a', '#ffe3b8'], ['#241a10', '#c9a45c', '#f5e6c0'], ['#1a1030', '#7a5cff', '#e6ddff']];
  function makeStill(i) {
    const W = 960, H = 540, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), R = rng(i * 131 + 7), p = STILL_PALS[i % STILL_PALS.length];
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, p[0]); bg.addColorStop(1, p[1]); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const s = i % 4;
    if (s === 0) {
      g.fillStyle = radial(g, W * 0.62, H * 0.55, 0, 260, [[0, p[2] + 'ff'], [0.3, p[1] + 'aa'], [1, p[1] + '00']]); g.fillRect(0, 0, W, H);
      g.fillStyle = p[0] + 'ee'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40) g.lineTo(x, H * 0.7 - R() * 50); g.lineTo(W, H); g.fill();
    } else if (s === 1) {
      g.strokeStyle = p[2] + '66'; g.lineWidth = 2;
      for (let k = -10; k <= 10; k++) { g.beginPath(); g.moveTo(W / 2, H * 0.45); g.lineTo(W / 2 + k * 140, H); g.stroke(); }
      for (let k = 0; k < 8; k++) { const y = H * 0.45 + Math.pow(k / 8, 2) * H * 0.55; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = radial(g, W / 2, H * 0.45, 0, 160, [[0, p[2] + 'cc'], [1, p[2] + '00']]); g.fillRect(0, 0, W, H);
    } else if (s === 2) {
      for (let k = 0; k < 90; k++) { g.fillStyle = 'rgba(255,255,255,' + (0.2 + R() * 0.6) + ')'; g.fillRect(R() * W, R() * H * 0.8, 1.6, 1.6); }
      g.fillStyle = radial(g, W * 0.3, H * 0.38, 10, 110, [[0, '#fff'], [0.4, p[2]], [1, p[1]]]); g.beginPath(); g.arc(W * 0.3, H * 0.38, 95, 0, TAU); g.fill();
      g.fillStyle = 'rgba(0,0,0,.65)'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 60) g.lineTo(x, H * 0.78 - R() * 40); g.lineTo(W, H); g.fill();
    } else {
      for (let L = 0; L < 4; L++) { g.fillStyle = (L % 2 ? p[0] : p[1]) + ['66', '88', 'aa', 'dd'][L]; g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W; x += 48) g.lineTo(x, H * (0.45 + L * 0.12) - Math.sin(x * 0.01 + L * 2) * 40 - R() * 14); g.lineTo(W, H); g.fill(); }
    }
    g.fillStyle = radial(g, W / 2, H / 2, H * 0.3, W * 0.65, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.55)']]); g.fillRect(0, 0, W, H);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, 52); g.fillRect(0, H - 52, W, 52);
    for (let k = 0; k < 5000; k++) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(R() * W, R() * H, 2, 2); }
    return c;
  }
  let screeningBuilt = false;
  function buildScreening(openTheater) {
    if (screeningBuilt) return; screeningBuilt = true;
    $('#screening').innerHTML = `
      <header class="sc-top"><span class="sc-mark">indie<i>.</i></span><button class="txt-btn" id="scClose">Close ×</button></header>
      <div class="sc-hero">
        <p class="sc-eyebrow">Film Making · Reference library</p>
        <h2>The Screening <em>Room.</em></h2>
        <p class="sc-lede">Studies in light. Award-winning cinematography and short films that shape how we make ours.</p>
        <div class="sc-filters" role="group" aria-label="Filter">
          <button class="chip on" data-f="all">All</button><button class="chip" data-f="cine">Cinematography</button><button class="chip" data-f="short">Short films</button>
        </div>
      </div>
      <div class="sc-grid" id="scGrid"></div>
      <p class="sc-note">Credits and awards are public record. The stills here are indie's own abstract studies, not frames from these films. Videos are embedded from the official Oscars channel and the filmmakers' own channel; they play from their original sources.</p>`;
    const grid = $('#scGrid');
    FILMS.forEach((f, i) => {
      const b = document.createElement('button'); b.className = 'film'; b.dataset.kind = f.kind;
      const frame = document.createElement('span'); frame.className = 'f-frame'; frame.appendChild(makeStill(i)); b.appendChild(frame);
      b.insertAdjacentHTML('beforeend', `<span class="f-meta"><b>${f.title}</b><i>${f.year}</i></span><span class="f-sub">${f.dp ? 'Cinematography · ' + f.dp : 'Directed by ' + f.dir}</span><span class="f-award">${f.award}</span><span class="f-play">▶ ${f.note && f.note.startsWith('Full') ? 'Watch full film' : 'Watch win clip'}</span>`);
      b.addEventListener('click', () => openTheater(f)); grid.appendChild(b);
    });
    document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === ch));
      const keep = ch.dataset.f;
      grid.querySelectorAll('.film').forEach(fl => { const show = keep === 'all' || fl.dataset.kind === keep; fl.hidden = !show; });
      gsap.fromTo('.film:not([hidden])', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: D(0.7), ease: 'expo.out' });
    }));
  }

  /* ---------- UI helpers ---------- */
  const digits = $('#digits');
  const cols = [0, 1].map(() => {
    const col = document.createElement('span'); col.className = 'col';
    const strip = document.createElement('span'); strip.className = 'strip';
    for (let i = 0; i < 60; i++) { const s = document.createElement('span'); s.textContent = i % 10; strip.appendChild(s); }
    col.appendChild(strip); digits.appendChild(col);
    return { strip, idx: 20, digit: 0 };
  });
  const renderCol = c => { c.strip.style.transform = `translate3d(0,${-c.idx}em,0)`; };
  cols.forEach(renderCol);
  function setCol(c, d, dir, delay) {
    c.idx -= 10 * Math.floor((c.idx - 20) / 10);
    const old = c.digit; c.digit = d;
    if (d === old && !dir) return;
    const fwd = dir >= 0;
    const delta = fwd ? ((d - old + 10) % 10) + 10 : -(((old - d + 10) % 10) + 10);
    gsap.to(c, { idx: c.idx + delta, duration: D(1.5), delay, ease: 'expo.out', overwrite: true,
      onUpdate: () => renderCol(c), onComplete: () => { c.idx = 20 + d; renderCol(c); } });
  }
  function setNumber(n, dir) {
    const v = String(n).padStart(2, '0');
    setCol(cols[0], +v[0], dir, 0); setCol(cols[1], +v[1], dir, 0.05);
  }
  $('#of').textContent = `of ${String(N).padStart(2, '0')}`;

  const titleEl = $('#title'), kindEl = $('#kind'), yearEl = $('#year'), live = $('#live');
  function setLabel(p, dir, instant) {
    const apply = () => { titleEl.textContent = p.title; kindEl.textContent = 'Service ' + num(SERVICES.indexOf(p)) + ' · ' + p.kind; yearEl.textContent = p.short; };
    live.textContent = `Service ${SERVICES.indexOf(p) + 1} of ${N}: ${p.title}`;
    if (instant) { apply(); return; }
    gsap.timeline().to(titleEl, { yPercent: -115 * (dir || 1), duration: D(0.3), ease: 'power3.in' })
      .add(apply).fromTo(titleEl, { yPercent: 115 * (dir || 1) }, { yPercent: 0, duration: D(0.9), ease: 'expo.out' });
    gsap.fromTo(kindEl, { opacity: 0 }, { opacity: 1, duration: D(0.8), delay: 0.2 });
  }

  /* ---------- main ---------- */
  const pct = $('#pct');
  async function init() {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') throw new Error('libs');
    const canvas = $('#stage');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(3, 4, 6); scene.add(sun);

    try { await Promise.race([Promise.all([
      document.fonts.load('italic 100px "Instrument Serif"'), document.fonts.load('700 20px "Inter Tight"')]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}

    const RAD = 1.55, aniso = renderer.capabilities.getMaxAnisotropy();
    const ringGeo = new THREE.RingGeometry(RAD * 0.17, RAD, 128, 1);
    const edgeOut = new THREE.CylinderGeometry(RAD, RAD, 0.024, 128, 1, true).rotateX(Math.PI / 2);
    const edgeIn = new THREE.CylinderGeometry(RAD * 0.17, RAD * 0.17, 0.024, 48, 1, true).rotateX(Math.PI / 2);
    const metal = new THREE.MeshStandardMaterial({ color: 0xd2d6dc, metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide });
    const sheenMat = () => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uA: { value: 0 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec2 vUv;uniform float uA;
        void main(){vec2 d=vUv-.5;float r=length(d);float a=atan(d.y,d.x);
          float band=pow(.5+.5*sin(a*2.+uA*5.),4.);
          vec3 rb=.5+.5*cos(6.2832*(r*1.4+a/12.566+uA+vec3(0.,.33,.67)));
          float m=smoothstep(.15,.3,r)*(1.-smoothstep(.46,.5,r));
          gl_FragColor=vec4(rb*(.05+.38*band),1.)*m;}` });
    const shTex = new THREE.CanvasTexture(shadowTex());

    const items = [];
    for (let i = 0; i < N; i++) {
      const p = SERVICES[i];
      const fTex = new THREE.CanvasTexture(makeFront(p, i)), bTex = new THREE.CanvasTexture(makeBack(p));
      [fTex, bTex].forEach(t => { t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso; });
      const root = new THREE.Group(), tilt = new THREE.Group(), flip = new THREE.Group(), spin = new THREE.Group();
      const front = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: fTex })); front.position.z = 0.0125;
      const back = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: bTex })); back.position.z = -0.0125; back.rotation.y = Math.PI;
      spin.add(front, back, new THREE.Mesh(edgeOut, metal), new THREE.Mesh(edgeIn, metal));
      const sF = new THREE.Mesh(ringGeo, sheenMat()); sF.position.z = 0.0145;
      const sB = new THREE.Mesh(ringGeo, sheenMat()); sB.position.z = -0.0145; sB.rotation.y = Math.PI;
      flip.add(spin, sF, sB); tilt.add(flip); root.add(tilt);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(RAD * 2.8, RAD * 2.1), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
      shadow.position.set(RAD * 0.12, -RAD * 0.62, -0.6); root.add(shadow);
      scene.add(root);
      items.push({ i, root, tilt, flip, spin, front, back, sF, sB, shadow, spinA: i * 1.7, intro: 0 });
      pct.textContent = String(Math.round(((i + 1) / N) * 100)).padStart(3, '0');
      await new Promise(r => setTimeout(r, 16));
    }

    /* layout */
    let spacing = 5.3;
    function resize() {
      const w = innerWidth, h = innerHeight, aspect = w / h;
      renderer.setSize(w, h, false);
      camera.aspect = aspect;
      const need = Math.max((RAD * 2) / 0.56, (RAD * 2) / (0.86 * aspect));
      camera.position.z = need / (2 * Math.tan((camera.fov * Math.PI) / 360));
      spacing = Math.max(RAD * 2.5, need * aspect * 0.5 * 1.02);
      camera.updateProjectionMatrix();
    }
    resize(); addEventListener('resize', resize);

    /* state */
    const S = { target: 0, pos: 0, detail: 0, flipped: false, mode: 'browse', studio: false };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    addEventListener('pointermove', e => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; });

    const cur = () => items[mod(S.target)];
    function go(n) {
      if (S.mode !== 'browse' || S.studio) return;
      if (S.flipped) setFlip(false);
      const dir = Math.sign(n - S.target) || 1;
      S.target = n;
      gsap.to(S, { pos: n, duration: D(1.5), ease: 'expo.out', overwrite: 'auto' });
      setNumber(mod(n) + 1, dir); setLabel(SERVICES[mod(n)], dir);
    }
    function setFlip(on) {
      if (S.studio) return;
      S.flipped = on;
      gsap.to(cur().flip.rotation, { y: on ? Math.PI : 0, duration: D(1.2), ease: 'expo.inOut' });
    }
    function fillDetail() {
      const p = SERVICES[mod(S.target)];
      $('#credits').innerHTML = `<h3>${p.title}</h3>` + [
        ['Service', p.kind], ['Best for', p.best], ['Formats', p.formats], ['Made with', 'People + AI'], ['Includes', p.includes.length + ' parts']]
        .map(r => `<div class="row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('') +
        `<a class="txt-btn start" href="mailto:${MAIL}?subject=${encodeURIComponent('Project: ' + p.title)}">Start this project →</a>` +
        (p.sub ? '<button class="txt-btn enter" id="enter">Enter the screening room →</button>' : '') +
        '<button class="txt-btn back" id="back">← Back to the reel</button>';
      if (p.sub) $('#enter').addEventListener('click', () => setScreening(true));
      $('#ideas').innerHTML = `<div><small>What it is</small><p>${p.what}</p></div><div><small>What you get</small><p>${p.get}</p></div>`;
      $('#back').addEventListener('click', closeDetail);
    }
    function openDetail() {
      if (S.mode !== 'browse' || S.studio) return;
      S.mode = 'detail'; fillDetail(); document.body.classList.add('detail'); $('#detail').setAttribute('aria-hidden', 'false');
      gsap.to(S, { detail: 1, duration: D(1.3), ease: 'expo.inOut' });
      gsap.to('#credits', { opacity: 1, duration: D(0.6), delay: D(0.5) });
      gsap.fromTo('#credits .row', { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: D(0.8), delay: D(0.55), ease: 'expo.out' });
      gsap.fromTo('#ideas div', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: D(1), delay: D(0.7), ease: 'expo.out' });
    }
    function closeDetail() {
      if (S.mode !== 'detail') return;
      S.mode = 'browse'; document.body.classList.remove('detail'); $('#detail').setAttribute('aria-hidden', 'true');
      gsap.to(S, { detail: 0, duration: D(1.1), ease: 'expo.inOut' });
      gsap.to(['#credits', '#ideas div'], { opacity: 0, duration: D(0.35) });
    }

    /* studio overlay */
    const studio = $('#studio');
    function setStudio(on) {
      S.studio = on; studio.setAttribute('aria-hidden', String(!on)); $('#studioBtn').setAttribute('aria-expanded', String(on));
      if (on) {
        gsap.set(studio, { visibility: 'visible' });
        gsap.to(studio, { clipPath: 'inset(0 0 0% 0)', duration: D(1), ease: 'expo.inOut' });
        gsap.fromTo('.st-inner > *, .st-list li', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: D(1), delay: D(0.5), ease: 'expo.out' });
        $('#studioClose').focus();
      } else {
        gsap.to(studio, { clipPath: 'inset(0 0 100% 0)', duration: D(0.9), ease: 'expo.inOut', onComplete: () => gsap.set(studio, { visibility: 'hidden' }) });
        $('#studioBtn').focus();
      }
    }
    $('#studioBtn').addEventListener('click', () => setStudio(true));
    $('#studioClose').addEventListener('click', () => setStudio(false));
    /* screening room sub-page + theatre */
    const screening = $('#screening'), theater = $('#theater');
    function closeTheater() { theater.classList.remove('on'); theater.setAttribute('aria-hidden', 'true'); setTimeout(() => { if (!theater.classList.contains('on')) theater.innerHTML = ''; }, 500); }
    function openTheater(f) {
      const url = embedUrl(f.embed);
      theater.innerHTML = `<button class="txt-btn th-close" id="thClose">Close ×</button>
        <div class="th-frame">${url ? `<iframe src="${url}" title="${f.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>` : `<div class="th-empty"><p>${f.title}</p><small>Clip coming soon</small></div>`}</div>
        <div class="th-meta"><h3>${f.title}</h3><p>${f.dir} · ${f.year}</p>${f.dp ? `<p>Cinematography — ${f.dp}</p>` : ''}<p>${f.award}</p>${f.embed && f.note ? `<p class="th-note">${f.note}</p>` : ''}</div>`;
      theater.classList.add('on'); theater.setAttribute('aria-hidden', 'false');
      $('#thClose').addEventListener('click', closeTheater); $('#thClose').focus();
    }
    function setScreening(on) {
      if (on) buildScreening(openTheater);
      S.studio = S.sub = on; screening.setAttribute('aria-hidden', String(!on));
      if (on) {
        screening.scrollTop = 0; gsap.set(screening, { visibility: 'visible' });
        gsap.to(screening, { clipPath: 'inset(0 0 0% 0)', duration: D(1.1), ease: 'expo.inOut' });
        gsap.fromTo('.sc-hero > *, .film', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: D(1), delay: D(0.6), ease: 'expo.out' });
        $('#scClose').addEventListener('click', () => setScreening(false)); $('#scClose').focus();
      } else {
        closeTheater();
        gsap.to(screening, { clipPath: 'inset(0 0 100% 0)', duration: D(0.9), ease: 'expo.inOut', onComplete: () => gsap.set(screening, { visibility: 'hidden' }) });
      }
    }
    document.querySelectorAll('.st-list li').forEach((li, i) => li.addEventListener('click', () => {
      setStudio(false); if (S.mode === 'detail') closeDetail(); setTimeout(() => go(S.target + Math.round(wrapOff(i, S.target))), 500);
    }));

    /* input */
    addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (theater.classList.contains('on')) closeTheater();
        else if (S.sub) setScreening(false);
        else if (S.studio) setStudio(false); else closeDetail();
        return;
      }
      if (S.studio) return;
      if (e.key === 'ArrowRight') go(S.target + 1);
      else if (e.key === 'ArrowLeft') go(S.target - 1);
      else if (e.key === 'Enter' && document.activeElement === document.body) openDetail();
      else if (e.key === ' ' && document.activeElement === document.body) { e.preventDefault(); setFlip(!S.flipped); }
    });
    $('#prev').addEventListener('click', () => go(S.target - 1));
    $('#next').addEventListener('click', () => go(S.target + 1));
    $('#flip').addEventListener('click', () => setFlip(!S.flipped));
    $('#open').addEventListener('click', openDetail);
    $('.mark').addEventListener('click', e => { e.preventDefault(); if (S.studio) setStudio(false); closeDetail(); });

    let wheelAcc = 0, wheelLock = false;
    addEventListener('wheel', e => {
      if (S.mode !== 'browse' || S.studio || wheelLock) return;
      wheelAcc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(wheelAcc) > 50) { go(S.target + Math.sign(wheelAcc)); wheelAcc = 0; wheelLock = true; setTimeout(() => (wheelLock = false), 650); }
    }, { passive: true });

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const hitMeshes = items.flatMap(it => [it.front, it.back]);
    function pick(cx, cy) {
      ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(hitMeshes, false)[0];
      if (!hit) return;
      const it = items.find(x => x.front === hit.object || x.back === hit.object);
      const off = Math.round(wrapOff(it.i, S.target));
      if (S.mode !== 'browse') return;
      off ? go(S.target + off) : openDetail();
    }
    let drag = null;
    canvas.addEventListener('pointerdown', e => { if (S.mode !== 'browse' || S.studio) return; drag = { x: e.clientX, y: e.clientY, p: S.pos, moved: false, lastX: e.clientX }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) { drag.moved = true; canvas.classList.add('drag'); }
      if (drag.moved) { gsap.killTweensOf(S, 'pos'); S.pos = drag.p - dx / (innerWidth * 0.3); drag.v = (e.clientX - drag.lastX); drag.lastX = e.clientX; }
    });
    const endDrag = e => {
      if (!drag) return; canvas.classList.remove('drag');
      if (drag.moved) go(Math.round(S.pos - (drag.v || 0) * 0.04));
      else pick(e.clientX, e.clientY);
      drag = null;
    };
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', () => { drag = null; canvas.classList.remove('drag'); });

    /* render loop */
    let last = performance.now(), prevPos = 0, vel = 0;
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = now / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
      vel += (((S.pos - prevPos) / Math.max(dt, 0.001)) - vel) * 0.15; prevPos = S.pos;
      const dm = S.detail;
      items.forEach(it => {
        const off = wrapOff(it.i, S.pos), a = Math.abs(off);
        const sc = (1 - Math.min(a, 2) * 0.1) * (1 - dm * 0.08 * (a < 0.5 ? 1 : 0)) * (0.35 + 0.65 * it.intro);
        it.root.scale.setScalar(sc);
        it.root.position.set(off * spacing * (1 + dm * 1.1), 0.32 - Math.sin(t * 0.9 + it.i) * 0.05 - a * 0.1 - dm * 0.1 * (a < 0.5 ? 1 : 0) - (1 - it.intro) * 7, -a * 0.35);
        it.tilt.rotation.set(-0.75 + dm * 0.14 + mouse.y * 0.1, mouse.x * 0.16 - off * 0.22, 0.38 + off * 0.12 - mouse.x * 0.04);
        it.spinA += dt * (a < 0.5 ? 0.07 : 0.03) + vel * dt * 0.9;
        it.spin.rotation.z = it.spinA;
        const ang = it.tilt.rotation.x * 0.6 + it.tilt.rotation.y * 1.4 + t * 0.03;
        it.sF.material.uniforms.uA.value = ang; it.sB.material.uniforms.uA.value = ang + 0.5;
      });
      renderer.render(scene, camera);
    });

    /* intro */
    setNumber(1, 0); setLabel(SERVICES[0], 0, true);
    const order = [...items].sort((a, b) => Math.abs(wrapOff(a.i, 0)) - Math.abs(wrapOff(b.i, 0)));
    const tl = gsap.timeline({ delay: D(0.25) });
    tl.to('#loader', { yPercent: -100, duration: D(1.1), ease: 'expo.inOut' })
      .to(order, { intro: 1, duration: D(1.8), stagger: 0.09, ease: 'expo.out' }, D(0.45))
      .fromTo('.roller, .top, .edge', { opacity: 0 }, { opacity: 1, duration: D(1), stagger: 0.05 }, D(0.9))
      .fromTo('#titleWrap', { opacity: 0 }, { opacity: 1, duration: D(1) }, D(1))
      .fromTo(titleEl, { yPercent: 115 }, { yPercent: 0, duration: D(1.1), ease: 'expo.out' }, D(1))
      .fromTo('#bar', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: D(0.9) }, D(1.2))
      .set('#loader', { display: 'none' });
    gsap.set('.roller, .top, .edge, #titleWrap, #bar', { opacity: 0 });
  }

  init().catch(err => {
    console.warn(err);
    $('#loader .ld-row span:first-child').textContent = 'Your browser could not start the 3D reel.';
    $('#loader').style.cursor = 'pointer';
  });
})();
