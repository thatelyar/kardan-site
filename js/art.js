// Generative placeholder artwork for .media blocks. Each type draws an
// abstract composition so the layout reads well before real photos exist.
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
  ocean(c, w, h, r) {
    for (let i = 0; i < 30; i++) {
      const t = i / 29, y = h * (0.3 + t * 0.75);
      const amp = 4 + t * h * 0.045, f = 0.006 + r() * 0.01, ph = r() * 10;
      c.beginPath();
      for (let x = -10; x <= w + 10; x += 6) {
        const yy = y + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph * 2) * amp * 0.35;
        x < 0 ? c.moveTo(x, yy) : c.lineTo(x, yy);
      }
      c.strokeStyle = i === 9 ? ACCENT : BONE + (0.08 + t * 0.4) + ')';
      c.lineWidth = i === 9 ? 2 : 1;
      c.stroke();
    }
    c.beginPath(); c.arc(w * 0.74, h * 0.2, Math.min(w, h) * 0.085, 0, 7); c.fillStyle = ACCENT; c.fill();
  },

  air(c, w, h, r) {
    const gap = Math.max(18, w / 26);
    c.fillStyle = BONE + '0.16)';
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) c.fillRect(x, y, 1.5, 1.5);
    for (let i = 0; i < 7; i++) {
      const x0 = w * (0.05 + r() * 0.35), y0 = h * (0.45 + r() * 0.5);
      const x1 = w * (0.6 + r() * 0.35), y1 = h * (0.2 + r() * 0.6);
      const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - h * (0.18 + r() * 0.25);
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1);
      const hot = i === 2;
      c.strokeStyle = hot ? ACCENT : BONE + '0.38)'; c.lineWidth = hot ? 2 : 1;
      c.setLineDash(hot ? [] : [3, 6]); c.stroke(); c.setLineDash([]);
      c.fillStyle = hot ? ACCENT : BONE + '0.8)';
      for (const [px, py] of [[x0, y0], [x1, y1]]) { c.beginPath(); c.arc(px, py, hot ? 5 : 3, 0, 7); c.fill(); }
    }
  },

  road(c, w, h) {
    const vx = w * 0.56, vy = h * 0.3;
    c.strokeStyle = BONE + '0.28)'; c.lineWidth = 1;
    for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + i * w * 0.2, h + 20); c.stroke(); }
    for (let i = 0; i < 14; i++) {
      const y = vy + (h - vy) * Math.pow(i / 13, 2.2);
      c.strokeStyle = BONE + (0.06 + (i / 13) * 0.3) + ')';
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }
    c.strokeStyle = ACCENT; c.lineWidth = 3; c.setLineDash([h * 0.05, h * 0.045]);
    c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx - w * 0.04, h + 20); c.stroke(); c.setLineDash([]);
    c.strokeStyle = BONE + '0.45)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, vy); c.lineTo(w, vy); c.stroke();
  },

  customs(c, w, h, r) {
    const cx = w * 0.5, cy = h * 0.52, R = Math.min(w, h) * 0.4;
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.arc(cx, cy, R * (1 - i * 0.15), 0, 7);
      c.strokeStyle = i === 1 ? ACCENT : BONE + '0.35)'; c.lineWidth = i === 1 ? 2 : 1;
      c.setLineDash(i % 2 ? [2, 7] : []); c.stroke(); c.setLineDash([]);
    }
    c.strokeStyle = BONE + '0.5)';
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, r0 = R * 1.04, r1 = R * (i % 6 ? 1.08 : 1.14);
      c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
    }
    c.save(); c.translate(cx, cy); c.rotate(-0.16);
    c.strokeStyle = ACCENT; c.lineWidth = 2; c.strokeRect(-R * 0.62, -R * 0.2, R * 1.24, R * 0.4);
    c.fillStyle = ACCENT;
    for (let i = 0; i < 9; i++) c.fillRect(-R * 0.52 + i * R * 0.118, -R * 0.07, R * (0.03 + r() * 0.07), R * 0.14);
    c.restore();
  },

  boxes(c, w, h, r) {
    const cols = 6, rows = 7, gw = w / cols, gh = h / rows;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = r(), px = x * gw + 4, py = y * gh + 4, bw = gw - 8, bh = gh - 8;
        if (v < 0.12) { c.fillStyle = ACCENT; c.fillRect(px, py, bw, bh); }
        else if (v < 0.4) { c.fillStyle = BONE + '0.14)'; c.fillRect(px, py, bw, bh); }
        c.strokeStyle = BONE + '0.3)'; c.lineWidth = 1; c.strokeRect(px, py, bw, bh);
        c.strokeStyle = BONE + '0.12)';
        for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(px + (i * bw) / 6, py + 3); c.lineTo(px + (i * bw) / 6, py + bh - 3); c.stroke(); }
      }
    }
  },

  contour(c, w, h, r) {
    const cx = w * (0.4 + r() * 0.2), cy = h * (0.4 + r() * 0.2), ph = r() * 6;
    for (let i = 1; i <= 16; i++) {
      const R = (i / 16) * Math.max(w, h) * 0.7;
      c.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
        const k = 1 + Math.sin(a * 3 + ph) * 0.12 + Math.sin(a * 5 - ph * 2) * 0.07 + Math.sin(a * 2 + i * 0.4) * 0.05;
        const x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * R * k * 0.8;
        a === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.strokeStyle = i === 5 ? ACCENT : BONE + (0.42 - i * 0.02) + ')'; c.lineWidth = i === 5 ? 2 : 1; c.stroke();
    }
  },

  rail(c, w, h) {
    c.save(); c.translate(w / 2, h / 2); c.rotate(-0.5);
    const D = Math.max(w, h) * 1.5;
    for (let i = -4; i <= 4; i++) {
      const y = i * h * 0.16;
      c.strokeStyle = i === 0 ? ACCENT : BONE + '0.45)'; c.lineWidth = i === 0 ? 2 : 1;
      for (const o of [-7, 7]) { c.beginPath(); c.moveTo(-D, y + o); c.lineTo(D, y + o); c.stroke(); }
      c.strokeStyle = BONE + '0.18)'; c.lineWidth = 1;
      for (let x = -D; x < D; x += 16) { c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x, y + 12); c.stroke(); }
    }
    c.restore();
  },
};

export function paintArt(canvas, type = 'ocean', seed = 1) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const c = canvas.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const tone = TONES[type] || TONES.ocean;
  const g = c.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, tone[0]); g.addColorStop(1, tone[1]);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  (painters[type] || painters.ocean)(c, w, h, rng(seed * 7919 + type.length));
}
