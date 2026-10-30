/* Film Making page: reference library of award-winning films with official embeds.
   Credits and awards are public record. Stills are indie's own abstract studies, not frames from these films.
   Videos play from the official Oscars channel and the filmmakers' own channel. */
(() => {
  'use strict';
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
  const PALS = [['#1c2a3a', '#d6a35a', '#f2e6cf'], ['#10181f', '#8fb3c9', '#e8f1f5'], ['#2a1810', '#e0763a', '#ffe3b8'], ['#241a10', '#c9a45c', '#f5e6c0'], ['#1a1030', '#7a5cff', '#e6ddff']];

  function makeStill(i) {
    const W = 960, H = 540, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), R = rng(i * 131 + 7), p = PALS[i % PALS.length];
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

  const root = document.getElementById('screening-room'), theater = document.getElementById('theater');
  if (!root || !theater) return;
  root.innerHTML = `
    <p class="eyebrow">Reference library</p>
    <h2>The Screening <em>Room.</em></h2>
    <p class="sc-lede">Studies in light. Award-winning cinematography and short films that shape how we make ours.</p>
    <div class="sc-filters" role="group" aria-label="Filter"><button class="chip on" data-f="all">All</button><button class="chip" data-f="cine">Cinematography</button><button class="chip" data-f="short">Short films</button></div>
    <div class="sc-grid" id="scGrid"></div>
    <p class="sc-note">Credits and awards are public record. The stills here are indie's own abstract studies, not frames from these films. Videos are embedded from the official Oscars channel and the filmmakers' own channel; they play from their original sources.</p>`;
  const grid = document.getElementById('scGrid');
  function close() { theater.classList.remove('on'); theater.setAttribute('aria-hidden', 'true'); setTimeout(() => { if (!theater.classList.contains('on')) theater.innerHTML = ''; }, 500); }
  function open(f) {
    const url = embedUrl(f.embed);
    theater.innerHTML = `<button class="th-close" id="thClose">Close ×</button>
      <div class="th-frame">${url ? `<iframe src="${url}" title="${f.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>` : ''}</div>
      <div class="th-meta"><h3>${f.title}</h3><p>${f.dir} · ${f.year}</p>${f.dp ? `<p>Cinematography — ${f.dp}</p>` : ''}<p>${f.award}</p>${f.note ? `<p class="th-note">${f.note}</p>` : ''}</div>`;
    theater.classList.add('on'); theater.setAttribute('aria-hidden', 'false');
    document.getElementById('thClose').addEventListener('click', close); document.getElementById('thClose').focus();
  }
  FILMS.forEach((f, i) => {
    const b = document.createElement('button'); b.className = 'film'; b.dataset.kind = f.kind;
    const frame = document.createElement('span'); frame.className = 'f-frame'; frame.appendChild(makeStill(i)); b.appendChild(frame);
    b.insertAdjacentHTML('beforeend', `<span class="f-meta"><b>${f.title}</b><i>${f.year}</i></span><span class="f-sub">${f.dp ? 'Cinematography · ' + f.dp : 'Directed by ' + f.dir}</span><span class="f-award">${f.award}</span><span class="f-play">▶ ${f.note && f.note.startsWith('Full') ? 'Watch full film' : 'Watch win clip'}</span>`);
    b.addEventListener('click', () => open(f)); grid.appendChild(b);
  });
  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === ch));
    grid.querySelectorAll('.film').forEach(fl => { fl.hidden = !(ch.dataset.f === 'all' || fl.dataset.kind === ch.dataset.f); });
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
