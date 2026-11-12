# Kardan website

Static, bilingual (English and Persian) site. No build step is needed to view it.

- English: `index.html`  ·  Persian: `fa/index.html`
- Pages are generated from `_src/content.mjs` with `node _src/build.mjs`
- Local preview: `python3 _src/serve.py` then open http://localhost:4173

Third-party code is loaded from CDNs: GSAP and ScrollTrigger, Lenis, and the Vazirmatn,
Bricolage Grotesque and JetBrains Mono fonts. Land outlines in `js/land.js` come from
Natural Earth (public domain).
