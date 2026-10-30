// Generates one real HTML page per building: services/<slug>.html
// Edit data.js, then run:  node build.cjs
const fs = require('fs'), path = require('path');
const { SERVICES, CONTACT_EMAIL } = require('./data.js');
const num = i => String(i + 1).padStart(2, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dir = path.join(__dirname, 'services');
fs.mkdirSync(dir, { recursive: true });
fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => fs.unlinkSync(path.join(dir, f)));   // drop pages from earlier names

SERVICES.forEach((p, i) => {
  const prev = SERVICES[(i + SERVICES.length - 1) % SERVICES.length], next = SERVICES[(i + 1) % SERVICES.length];
  const words = p.title.split(' '), first = words.shift();
  const hasScreening = p.slug === 'films-we-appreciate';
  const facts = p.facts || [['Building', p.title], ['Best for', p.best], ['Formats', p.formats], ['Made with', 'People + AI']];
  const list = p.steps
    ? `<ol class="inc steps">\n${p.steps.map(([a, b]) => `        <li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('\n')}\n      </ol>`
    : `<ol class="inc">\n${p.includes.map(x => `        <li>${esc(x)}</li>`).join('\n')}\n      </ol>`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#07090c">
<title>${esc(p.title)} — indie</title>
<meta name="description" content="${esc(p.what)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Syne:wght@500;700;800&family=Space+Mono:wght@400;700&family=Inter+Tight:wght@400;500;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
</head>
<body class="sub" data-slug="${p.slug}">
<div class="wipe cover" id="wipe" aria-hidden="true"><span class="wipe-t" id="wipeT"></span></div>
<div class="cine" aria-hidden="true"><i class="bar t"></i><i class="bar b"></i><i class="grain"></i><i class="vig"></i></div>

<header class="nav">
  <a class="logo" href="../index.html" aria-label="indie, home">indie<i>.</i></a>
  <nav aria-label="Main"><a href="../index.html#stop-${i + 2}">← Back to the city</a><a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Project: ' + p.title)}" class="pill">Start a project</a></nav>
</header>

<main>
  <section class="s-hero">
    <canvas id="banner" aria-hidden="true"></canvas>
    <span class="eyebrow">Scene ${num(i)} / ${num(SERVICES.length - 1)} · ${esc(p.kind)}</span>
    <h1>${esc(first)}${words.length ? ' <em style="color:' + p.c[0] + '">' + esc(words.join(' ')) + '</em>' : ''}</h1>
    <p class="lede">${esc(p.what)}</p>
  </section>

  <section class="s-body">
    <div>
      <h2>${p.steps ? 'The five steps' : 'What you get'}</h2>
      <p>${esc(p.get)}</p>
      ${list}
      <a class="cta-btn" href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Project: ' + p.title)}">Start a project →</a>
    </div>
    <dl class="facts">
${facts.map(([a, b]) => `      <div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('\n')}
    </dl>
  </section>
  <!-- CONCEPT SLOT: add this building's concept / case studies here -->
${hasScreening ? '  <section class="sr-room" id="screening-room"></section>\n' : ''}
  <nav class="next" aria-label="More buildings">
    <a href="${prev.slug}.html"><small>← Previous</small><b>${esc(prev.title)}</b></a>
    <a class="nr" href="${next.slug}.html"><small>Next →</small><b>${esc(next.title)}</b></a>
  </nav>
</main>
${hasScreening ? '<div class="theater" id="theater" role="dialog" aria-modal="true" aria-hidden="true"></div>\n' : ''}
<footer class="credits" aria-label="Credits">
  <p class="cr-the">The End</p>
  <p class="cr-title">A film by <em>indie</em></p>
  <ul class="cr-list"><li><span>Directed by</span><b>People</b></li><li><span>Powered by</span><b>AI</b></li><li><span>This scene</span><b>${esc(p.title)}</b></li></ul>
  <div class="cr-row"><span>© indie studios</span><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><a href="../index.html#stop-${i + 2}">Back to the city ↑</a></div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="../data.js"></script>
<script src="../sketches.js"></script>
<script src="../page.js"></script>
${hasScreening ? '<script src="../screening.js"></script>\n' : ''}</body>
</html>
`;
  fs.writeFileSync(path.join(dir, p.slug + '.html'), html);
  console.log('wrote services/' + p.slug + '.html');
});
