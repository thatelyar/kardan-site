// Isometric container yard that builds itself as progress goes 0 -> 1.

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const PALETTE = ['#ff4d00', '#f5f1ec', '#2a221f', '#3d3430', '#ff8a3c', '#57493f'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}

const ease = (t) => 1 - Math.pow(1 - t, 3);

export function createStack(canvas) {
  const ctx = canvas.getContext('2d');
  const NX = 3, NZ = 4, NY = 3;
  const L = 2.5, W = 1, H = 1.05, GAP = 0.14;
  const SX = L + GAP, SZ = W + GAP;
  const X = NX * SX - GAP, Z = NZ * SZ - GAP, Y = NY * H;

  // Build the yard: every box needs support below it.
  const rand = rng(11);
  const filled = new Set();
  const boxes = [];
  for (let y = 0; y < NY; y++) {
    for (let z = 0; z < NZ; z++) {
      for (let x = 0; x < NX; x++) {
        if (y > 0 && !filled.has(`${x},${y - 1},${z}`)) continue;
        if (y === 1 && rand() < 0.18) continue;
        if (y === 2 && rand() < 0.5) continue;
        filled.add(`${x},${y},${z}`);
        boxes.push({ x, y, z, color: PALETTE[Math.floor(rand() * PALETTE.length)] });
      }
    }
  }
  // Painter's order doubles as build order: layer by layer, back to front.
  boxes.sort((a, b) => a.y - b.y || (a.x + a.z) - (b.x + b.z) || a.x - b.x);
  boxes.forEach((b, i) => { b.t = (i / boxes.length) * 0.86; });

  let w = 0, h = 0, s = 1, ox = 0, oy = 0;
  let target = 0, cur = 0, raf = 0, visible = true, alive = true;

  const P = (x, y, z, dy = 0) => [ox + (x - z) * C * s, oy + (x + z) * S * s - y * s + dy];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s = Math.min((w * 0.84) / ((X + Z) * C), (h * 0.7) / ((X + Z) * S + Y));
    ox = w / 2 - ((X - Z) * C * s) / 2;
    oy = h / 2 - ((X + Z) * S * s - Y * s) / 2 + h * 0.04;
  }

  function poly(points, fill, stroke) {
    ctx.beginPath();
    points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function seg(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }

  function drawGround() {
    const m = 0.9;
    ctx.lineWidth = 1;
    poly([P(-m, 0, -m), P(X + m, 0, -m), P(X + m, 0, Z + m), P(-m, 0, Z + m)], 'rgba(245,241,236,0.03)', 'rgba(245,241,236,0.16)');
    ctx.strokeStyle = 'rgba(245,241,236,0.07)';
    for (let i = 0; i <= NX; i++) { const gx = i * SX - GAP / 2; seg(P(gx, 0, -m), P(gx, 0, Z + m)); }
    for (let j = 0; j <= NZ; j++) { const gz = j * SZ - GAP / 2; seg(P(-m, 0, gz), P(X + m, 0, gz)); }
  }

  function drawBox(b, k) {
    const e = ease(k);
    const dy = -(1 - e) * h * 0.55;
    const x0 = b.x * SX, x1 = x0 + L, z0 = b.z * SZ, z1 = z0 + W, y0 = b.y * H, y1 = y0 + H - 0.03;
    ctx.globalAlpha = Math.min(1, k * 3);
    ctx.lineWidth = 1;
    const edge = 'rgba(7,5,4,0.55)';

    // Hoist line while the box is still in the air.
    if (k < 1) {
      const top = P((x0 + x1) / 2, y1, (z0 + z1) / 2, dy);
      ctx.strokeStyle = 'rgba(245,241,236,0.35)';
      seg([top[0], 0], top);
    }

    poly([P(x0, y1, z0, dy), P(x1, y1, z0, dy), P(x1, y1, z1, dy), P(x0, y1, z1, dy)], shade(b.color, 1.12), edge);
    poly([P(x1, y0, z0, dy), P(x1, y0, z1, dy), P(x1, y1, z1, dy), P(x1, y1, z0, dy)], shade(b.color, 0.86), edge);
    poly([P(x0, y0, z1, dy), P(x1, y0, z1, dy), P(x1, y1, z1, dy), P(x0, y1, z1, dy)], shade(b.color, 0.66), edge);

    // Corrugation on the long side, doors on the short side.
    ctx.strokeStyle = 'rgba(7,5,4,0.22)';
    for (let i = 1; i < 12; i++) { const cx = x0 + (i * L) / 12; seg(P(cx, y0 + 0.06, z1, dy), P(cx, y1 - 0.06, z1, dy)); }
    ctx.strokeStyle = 'rgba(7,5,4,0.4)';
    const mz = (z0 + z1) / 2;
    seg(P(x1, y0 + 0.05, mz, dy), P(x1, y1 - 0.05, mz, dy));
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    drawGround();
    const p = cur * 1.02;
    for (const b of boxes) {
      const k = Math.max(0, Math.min(1, (p - b.t) / 0.14));
      if (k > 0) drawBox(b, k);
    }
  }

  function frame() {
    raf = 0;
    if (!alive) return;
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0004) cur = target;
    draw();
    if (visible && cur !== target) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && alive) raf = requestAnimationFrame(frame); };
  const onResize = () => { resize(); kick(); };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); });
  io.observe(canvas);
  window.addEventListener('resize', onResize);
  resize();
  kick();

  return {
    set(v) { target = Math.max(0, Math.min(1, v)); kick(); },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    },
  };
}
