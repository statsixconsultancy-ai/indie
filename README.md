# indie — AI animation studio

A cinematic, scroll-driven website. You fly through a 3D downtown by scrolling: six buildings are six pages
(AI Filmmaking, AI Ads, Cinematography, Films We Appreciate, How We Work, About Us).

## Run it

It is a static site, no build step needed to view it.

```bash
npx http-server . -p 5173
```

Then open http://localhost:5173.

## Edit the content

The six buildings are defined in `data.js`. After changing it, regenerate their pages:

```bash
node build.cjs
```

## The 3D city

- `assets/3d/city.glb` — a light (12 MB) version of the city. Phones and low-memory devices use it, and it is the fallback.
- `assets/3d/city-hd.glb` (47 MB) is the high-detail city used on desktop: full geometry and 2048 px textures, re-compressed so it fits on GitHub. `assets/3d/city.glb` (12 MB) is the light copy for phones.
  The original 200 MB model stays on your computer only (it is git-ignored).
  (Git LFS or separate hosting both work if you want it versioned.)
- `assets/3d/street_path.json` — the street-level camera route, computed from the model so the camera stays on open streets.

## Videos

Clips for the building cards live in `assets/cards/` (named after each building) and for the "how it's made" section in `assets/takes/`.
Replace them with footage you own or are licensed to use before launching publicly.

## Structure

| Path | What it is |
|---|---|
| `index.html`, `city.js`, `home.js`, `styles.css` | the home page and the 3D flight |
| `services/` | the six generated building pages |
| `sketches.js`, `sound.js`, `screening.js` | live animations, the synthesized score, the film library |
| `old web design/` | earlier versions of the site, kept for reference |
