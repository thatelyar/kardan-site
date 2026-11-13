// Generative artwork for .media blocks. Each type draws an abstract, slowly
// moving composition. Pass a time (seconds) to animate; 0 gives a still frame.
// To use a photo instead, put an <img> inside .media__in and it is skipped.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BONE = 'rgba(245,241,236,';
const ACCENT = '#ff4d00';
const TAU = Math.PI * 2;

const TONES = {
  ocean: ['#3a0f04', '#070504'],
  air: ['#2a1a14', '#080605'],
  road: ['#33150a', '#090605'],
  customs: ['#241c18', '#070504'],
  boxes: ['#2e1508', '#080504'],
  contour: ['#26201d', '#070504'],
  rail: ['#2b1810', '#080504'],
};

const painters = {
  // layered swells drifting sideways
  ocean(c, w, h, r, t) {
    for (let i = 0; i < 30; i++) {
      const k = i / 29, y = h * (0.3 + k * 0.75);
      const amp = 4 + k * h * 0.045, f = 0.006 + r() * 0.01, ph = r() * 10 + t * (0.25 + k * 0.5);
      c.beginPath();
      for (let x = -10; x <= w + 10; x += 6) {
        const yy = y + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph * 2) * amp * 0.35;
        x < 0 ? c.moveTo(x, yy) : c.lineTo(x, yy);
      }
      c.strokeStyle = i === 9 ? ACCENT : BONE + (0.08 + k * 0.4) + ')';
      c.lineWidth = i === 9 ? 2 : 1;
      c.stroke();
    }
    const R = Math.min(w, h) * 0.085;
    c.beginPath(); c.arc(w * 0.74, h * 0.2, R, 0, TAU); c.fillStyle = ACCENT; c.fill();
    c.beginPath(); c.arc(w * 0.74, h * 0.2, R * (1.5 + 0.25 * Math.sin(t * 0.9)), 0, TAU); c.strokeStyle = 'rgba(255,77,0,0.35)'; c.lineWidth = 1; c.stroke();
  },

  // routes over a dot grid, each with a light travelling along it
  air(c, w, h, r, t) {
    const gap = Math.max(18, w / 26);
    c.fillStyle = BONE + '0.16)';
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) c.fillRect(x, y, 1.5, 1.5);
    for (let i = 0; i < 7; i++) {
      const x0 = w * (0.05 + r() * 0.35), y0 = h * (0.45 + r() * 0.5);
      const x1 = w * (0.6 + r() * 0.35), y1 = h * (0.2 + r() * 0.6);
      const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - h * (0.18 + r() * 0.25);
      const hot = i === 2, speed = 0.1 + r() * 0.12, off = r();
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1);
      c.strokeStyle = hot ? ACCENT : BONE + '0.38)'; c.lineWidth = hot ? 2 : 1;
      c.setLineDash(hot ? [] : [3, 6]); c.stroke(); c.setLineDash([]);
      c.fillStyle = hot ? ACCENT : BONE + '0.8)';
      for (const [px, py] of [[x0, y0], [x1, y1]]) { c.beginPath(); c.arc(px, py, hot ? 5 : 3, 0, TAU); c.fill(); }
      const k = (t * speed + off) % 1, u = 1 - k;
      const px = u * u * x0 + 2 * u * k * cx + k * k * x1, py = u * u * y0 + 2 * u * k * cy + k * k * y1;
      c.fillStyle = hot ? '#ffd9c2' : BONE + '0.95)';
      c.beginPath(); c.arc(px, py, hot ? 3.2 : 2, 0, TAU); c.fill();
    }
  },

  // a road running to the horizon, the ground sliding towards the viewer
  road(c, w, h, _r, t) {
    const vx = w * 0.56, vy = h * 0.3;
    c.strokeStyle = BONE + '0.28)'; c.lineWidth = 1;
    for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + i * w * 0.2, h + 20); c.stroke(); }
    const shift = (t * 0.12) % (1 / 13);
    for (let i = 0; i < 15; i++) {
      const k = Math.min(1.05, i / 13 + shift);
      const y = vy + (h - vy) * Math.pow(k, 2.2);
      c.strokeStyle = BONE + (0.06 + Math.min(1, k) * 0.3) + ')';
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }
    c.strokeStyle = ACCENT; c.lineWidth = 3; c.setLineDash([h * 0.05, h * 0.045]);
    c.lineDashOffset = -t * h * 0.09;
    c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx - w * 0.04, h + 20); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
    c.strokeStyle = BONE + '0.45)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, vy); c.lineTo(w, vy); c.stroke();
  },

  // rings and tick marks turning slowly around a stamp
  customs(c, w, h, r, t) {
    const cx = w * 0.5, cy = h * 0.52, R = Math.min(w, h) * 0.4;
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.arc(cx, cy, R * (1 - i * 0.15), 0, TAU);
      c.strokeStyle = i === 1 ? ACCENT : BONE + '0.35)'; c.lineWidth = i === 1 ? 2 : 1;
      c.setLineDash(i % 2 ? [2, 7] : []); c.lineDashOffset = i % 2 ? t * (i % 4 === 1 ? 6 : -6) : 0; c.stroke(); c.setLineDash([]);
    }
    c.lineDashOffset = 0;
    c.strokeStyle = BONE + '0.5)';
    const spin = t * 0.05;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU + spin, r0 = R * 1.04, r1 = R * (i % 6 ? 1.08 : 1.14);
      c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
    }
    // sweeping scan line
    const sa = t * 0.5;
    c.strokeStyle = 'rgba(255,77,0,0.55)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(sa) * R, cy + Math.sin(sa) * R); c.stroke();
    c.save(); c.translate(cx, cy); c.rotate(-0.16);
    c.strokeStyle = ACCENT; c.lineWidth = 2; c.strokeRect(-R * 0.62, -R * 0.2, R * 1.24, R * 0.4);
    c.fillStyle = ACCENT;
    for (let i = 0; i < 9; i++) c.fillRect(-R * 0.52 + i * R * 0.118, -R * 0.07, R * (0.03 + r() * 0.07), R * 0.14);
    c.restore();
  },

  // a grid of cells, a few of them lighting up in turn
  boxes(c, w, h, r, t) {
    const cols = 6, rows = 7, gw = w / cols, gh = h / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = r(), px = x * gw + 4, py = y * gh + 4, bw = gw - 8, bh = gh - 8;
        const beat = 0.5 + 0.5 * Math.sin(t * 0.8 + v * 40);
        if (v < 0.12) { c.fillStyle = `rgba(255,77,0,${0.45 + beat * 0.55})`; c.fillRect(px, py, bw, bh); }
        else if (v < 0.4) { c.fillStyle = BONE + (0.06 + beat * 0.12) + ')'; c.fillRect(px, py, bw, bh); }
        c.strokeStyle = BONE + '0.3)'; c.lineWidth = 1; c.strokeRect(px, py, bw, bh);
        c.strokeStyle = BONE + '0.12)';
        for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(px + (i * bw) / 6, py + 3); c.lineTo(px + (i * bw) / 6, py + bh - 3); c.stroke(); }
      }
    }
  },

  // contour lines that breathe
  contour(c, w, h, r, t) {
    const cx = w * (0.4 + r() * 0.2), cy = h * (0.4 + r() * 0.2), ph = r() * 6 + t * 0.22;
    const hot = 3 + Math.floor(((t * 0.35) % 1) * 12);       // one contour is highlighted, moving outward
    for (let i = 1; i <= 16; i++) {
      const R = (i / 16) * Math.max(w, h) * 0.7;
      c.beginPath();
      for (let a = 0; a <= TAU + 0.05; a += 0.05) {
        const k = 1 + Math.sin(a * 3 + ph) * 0.12 + Math.sin(a * 5 - ph * 2) * 0.07 + Math.sin(a * 2 + i * 0.4) * 0.05;
        const x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * R * k * 0.8;
        a === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.strokeStyle = i === hot ? ACCENT : BONE + (0.42 - i * 0.02) + ')'; c.lineWidth = i === hot ? 2 : 1; c.stroke();
    }
  },

  // parallel tracks with sleepers sliding past
  rail(c, w, h, _r, t) {
    c.save(); c.translate(w / 2, h / 2); c.rotate(-0.5);
    const D = Math.max(w, h) * 1.5, slide = (t * 14) % 16;
    for (let i = -4; i <= 4; i++) {
      const y = i * h * 0.16;
      c.strokeStyle = i === 0 ? ACCENT : BONE + '0.45)'; c.lineWidth = i === 0 ? 2 : 1;
      for (const o of [-7, 7]) { c.beginPath(); c.moveTo(-D, y + o); c.lineTo(D, y + o); c.stroke(); }
      c.strokeStyle = BONE + '0.18)'; c.lineWidth = 1;
      const dir = i % 2 ? -1 : 1;
      for (let x = -D; x < D; x += 16) { const sx = x + slide * dir; c.beginPath(); c.moveTo(sx, y - 12); c.lineTo(sx, y + 12); c.stroke(); }
    }
    c.restore();
  },
};

export function paintArt(canvas, type = 'ocean', seed = 1, time = 0) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }   // resizing clears, so only when needed
  const c = canvas.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const tone = TONES[type] || TONES.ocean;
  const g = c.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, tone[0]); g.addColorStop(1, tone[1]);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  (painters[type] || painters.ocean)(c, w, h, rng(seed * 7919 + type.length), time);
}
