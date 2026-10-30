// Generates one real HTML page per service: services/<slug>.html
// Edit data.js, then run:  node build.cjs
const fs = require('fs'), path = require('path');
const { SERVICES, CONTACT_EMAIL } = require('./data.js');
const num = i => String(i + 1).padStart(2, '0');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
fs.mkdirSync(path.join(__dirname, 'services'), { recursive: true });

SERVICES.forEach((p, i) => {
  const prev = SERVICES[(i + SERVICES.length - 1) % SERVICES.length], next = SERVICES[(i + 1) % SERVICES.length];
  const [first, ...rest] = p.title.split(' ');
  const isFilm = p.slug === 'film-making';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ecebe6">
<title>${esc(p.title)} — indie</title>
<meta name="description" content="${esc(p.what)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../site.css">
</head>
<body data-slug="${p.slug}">
<div class="curtain cover" id="curtain" aria-hidden="true"></div>
<div class="paper" aria-hidden="true"></div>

<header class="top">
  <a class="l" href="../index.html">← The reel</a>
  <a class="mark" href="../index.html" aria-label="indie, home">indie<i>.</i></a>
  <span class="r"><span>Service ${num(i)} / ${num(SERVICES.length - 1)}</span></span>
</header>

<main class="page">
  <section class="p-hero">
    <span class="eyebrow">Service ${num(i)} · ${esc(p.kind)}</span>
    <h1>${esc(first)}${rest.length ? ' <em>' + esc(rest.join(' ')) + '</em>' : ''}</h1>
    <p class="lede">${esc(p.what)}</p>
  </section>

  <div class="banner" role="img" aria-label="${esc(p.title)} artwork"><canvas id="banner"></canvas></div>

  <section class="cols">
    <div>
      <h2>What you get</h2>
      <p>${esc(p.get)}</p>
      <ol class="inc">
${p.includes.map(x => `        <li>${esc(x)}</li>`).join('\n')}
      </ol>
      <a class="cta" href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Project: ' + p.title)}">Start this project →</a>
    </div>
    <dl class="facts">
      <div><dt>Service</dt><dd>${esc(p.title)}</dd></div>
      <div><dt>Best for</dt><dd>${esc(p.best)}</dd></div>
      <div><dt>Formats</dt><dd>${esc(p.formats)}</dd></div>
      <div><dt>Made with</dt><dd>People + AI</dd></div>
    </dl>
  </section>
  <!-- CONCEPT SLOT: add this service's concept / case studies here -->
${isFilm ? '  <section class="sr-room" id="screening-room"></section>\n' : ''}
  <nav class="next" aria-label="More services">
    <a href="${prev.slug}.html"><small>← Previous</small><b>${esc(prev.title)}</b></a>
    <a class="nr" href="${next.slug}.html"><small>Next →</small><b>${esc(next.title)}</b></a>
  </nav>
</main>
${isFilm ? '<div class="theater" id="theater" role="dialog" aria-modal="true" aria-hidden="true"></div>\n' : ''}
<footer><span>© indie studios</span><span>Made with AI, directed by people.</span><a href="../index.html">Back to the reel ↑</a></footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="../data.js"></script>
<script src="../art.js"></script>
<script src="../page.js"></script>
${isFilm ? '<script src="../screening.js"></script>\n' : ''}</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, 'services', p.slug + '.html'), html);
  console.log('wrote services/' + p.slug + '.html');
});
