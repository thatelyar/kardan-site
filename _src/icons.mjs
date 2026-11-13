// Line icons drawn for this site. Every shape carries pathLength="1" so the
// stylesheet can draw it on with a single dash animation.
const P = 'pathLength="1"';
const c = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${P}/>`;
const p = (d) => `<path d="${d}" ${P}/>`;
const r = (x, y, w, h, rx = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${P}/>`;

export const ICONS = {
  // how Kardan thinks
  focus: [c(24, 24, 14), c(24, 24, 5), p('M24 3v7M24 38v7M3 24h7M38 24h7')],
  shield: [p('M24 5l15 6v12c0 10-7 17-15 20C16 40 9 33 9 23V11z'), p('M17 21h14M17 28h9')],
  routes: [p('M5 10c13 0 17 14 29 14'), p('M5 24h29'), p('M5 38c13 0 17-14 29-14'), c(38.5, 24, 4.5)],
  node: [c(24, 24, 6), p('M24 5v9M24 34v9M5 24h9M34 24h9'), p('M11 11l6 6M31 31l6 6M37 11l-6 6M17 31l-6 6')],
  // ways to get in touch
  phone: [r(15, 5, 18, 38, 4), p('M21 37h6')],
  chat: [p('M8 9h32v23H23l-9 8v-8H8z'), p('M15 18h18M15 24h11')],
  mail: [r(6, 11, 36, 26), p('M6 13l18 14 18-14')],
  form: [r(10, 6, 28, 36), p('M16 16h16M16 24h16M16 32h9')],
  // fields of experience
  molecule: [c(14, 16, 5), c(35, 14, 4), c(26, 35, 6), p('M19 15.5l12-1M15.8 20.7l7 9.2M33.6 17.8l-5 11.6')],
  signal: [c(24, 31, 3), p('M15 23a12 12 0 0 1 18 0'), p('M9 16a21 21 0 0 1 30 0'), p('M24 34v9')],
  car: [p('M4 31h40'), p('M8 31c1-8 5-13 13-13h8c6 0 10 5 12 13'), c(15, 33, 4), c(34, 33, 4)],
  circuit: [r(14, 14, 20, 20), c(24, 24, 3), p('M20 14V5M28 14V5M20 34v9M28 34v9M14 20H5M14 28H5M34 20h9M34 28h9')],
  gear: [c(24, 24, 7), c(24, 24, 14), p('M24 5v5M24 38v5M5 24h5M38 24h5M10.6 10.6l3.5 3.5M33.9 33.9l3.5 3.5M37.4 10.6l-3.5 3.5M14.1 33.9l-3.5 3.5')],
  crystal: [p('M24 5l16 9v20l-16 9-16-9V14z'), p('M24 5v38M8 14l16 10 16-10')],
  lattice: [p('M24 8l14 8v16l-14 8-14-8V16z'), p('M24 24V8M24 24l14 8M24 24l-14 8'), c(24, 8, 2.5), c(38, 32, 2.5), c(10, 32, 2.5), c(24, 24, 3)],
  health: [c(24, 24, 18), p('M21 13h6v8h8v6h-8v8h-6v-8h-8v-6h8z')],
};

export const icon = (name) => (ICONS[name] ? `<svg class="ico" viewBox="0 0 48 48" aria-hidden="true">${ICONS[name].join('')}</svg>` : '');
