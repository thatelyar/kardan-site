// Looping container scenes in the same isometric style as the yard in stack.js,
// plus one true-3D container that turns with the pointer.
//   createIso(canvas, { scene: 'crane' | 'convoy' | 'sort' | 'spin', animate }) -> { destroy() }

const C = Math.cos(Math.PI / 6), S = 0.5, TAU = Math.PI * 2;
const PAL = ['#ff4d00', '#f5f1ec', '#2a221f', '#3d3430', '#ff8a3c', '#57493f'];
const EDGE = 'rgba(7,5,4,0.55)';
const LINE = 'rgba(245,241,236,';

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const seg = (t, a, b) => smooth((t - a) / (b - a));       // eased progress of t through [a, b]
const pick = (i) => PAL[((i % PAL.length) + PAL.length) % PAL.length];

// The part of each scene that must stay in frame; everything else may run off the edges.
const FOCUS = {
  crane: { x: [-1.6, 6.6], z: [-1.2, 7], y: 6.2 },
  convoy: { x: [-5, 5], z: [-5, 2.6], y: 3.4 },
  sort: { x: [-5, 4.4], z: [-1.2, 5], y: 3.2 },
};

export function createIso(canvas, { scene = 'crane', animate = true } = {}) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, s = 1, ox = 0, oy = 0;
  let raf = 0, visible = false, alive = true;
  const ptr = { x: 0.5, y: 0.5, cx: 0.5, cy: 0.5 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const f = FOCUS[scene];
    if (!f) return;
    const [xa, xb] = f.x, [za, zb] = f.z;
    const sw = (xb - xa + zb - za) * C, sh = (xb - xa + zb - za) * S + f.y;
    s = Math.min((w * 0.94) / sw, (h * 0.86) / sh);
    ox = w / 2 - (s * C * (xa - zb + xb - za)) / 2;
    oy = h / 2 - (s * ((xa + za) * S - f.y + (xb + zb) * S)) / 2;
  }

  /* ---------------------------------------------------------- isometric kit */
  const P = (x, y, z) => [ox + (x - z) * C * s, oy + (x + z) * S * s - y * s];
  function poly(pts, fill, stroke) {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function line(a, b, style, width = 1) { ctx.strokeStyle = style; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }

  // A box seen from the usual corner: top, the face towards +x and the face towards +z.
  function box(x0, y0, z0, L, H, W, color, o = {}) {
    const x1 = x0 + L, y1 = y0 + H, z1 = z0 + W;
    ctx.globalAlpha = o.alpha ?? 1;
    poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], shade(color, 1.12), EDGE);
    poly([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)], shade(color, 0.86), EDGE);
    poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], shade(color, 0.66), EDGE);
    if (o.ribs) {
      ctx.strokeStyle = 'rgba(7,5,4,0.22)'; ctx.lineWidth = 1;
      ctx.beginPath();
      if (o.ribs === 'x') {          // long side runs along x: ribs on the +z face, doors on the +x face
        const n = Math.max(4, Math.round(L * 4.6));
        for (let i = 1; i < n; i++) { const cx = x0 + (i * L) / n, a = P(cx, y0 + 0.06, z1), b = P(cx, y1 - 0.06, z1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
        line(P(x1, y0 + 0.05, (z0 + z1) / 2), P(x1, y1 - 0.05, (z0 + z1) / 2), 'rgba(7,5,4,0.4)');
      } else {                       // long side runs along z
        const n = Math.max(4, Math.round(W * 4.6));
        for (let i = 1; i < n; i++) { const cz = z0 + (i * W) / n, a = P(x1, y0 + 0.06, cz), b = P(x1, y1 - 0.06, cz); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
        line(P((x0 + x1) / 2, y0 + 0.05, z1), P((x0 + x1) / 2, y1 - 0.05, z1), 'rgba(7,5,4,0.4)');
      }
    }
    ctx.globalAlpha = 1;
  }
  const container = (x0, y0, z0, color, o = {}) => box(x0, y0, z0, 2.5, 1.05, 1, color, { ...o, ribs: 'x' });

  function ground(xa, xb, za, zb, stepX, stepZ) {
    poly([P(xa, 0, za), P(xb, 0, za), P(xb, 0, zb), P(xa, 0, zb)], 'rgba(245,241,236,0.025)', null);
    ctx.strokeStyle = LINE + '0.06)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = xa; x <= xb + 0.01; x += stepX) { const a = P(x, 0, za), b = P(x, 0, zb); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (let z = za; z <= zb + 0.01; z += stepZ) { const a = P(xa, 0, z), b = P(xb, 0, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
  }

  // A truck heading towards +x. x0 is the back of the bed, z0 the far edge of the lane.
  function truck(x0, z0, color, load, alpha = 1) {
    box(x0, 0.3, z0 + 0.05, 3.5, 0.22, 0.9, '#2a221f', { alpha });
    for (const wx of [x0 + 0.2, x0 + 0.8, x0 + 2.85]) box(wx, 0, z0 + 0.72, 0.44, 0.34, 0.22, '#120e0d', { alpha });
    if (load) container(x0 + 0.1, 0.52, z0, load, { alpha });
    const cx0 = x0 + 2.72;
    box(cx0, 0.52, z0 + 0.03, 0.8, 1.08, 0.94, color, { alpha });
    ctx.globalAlpha = alpha;
    poly([P(cx0 + 0.8, 1.02, z0 + 0.13), P(cx0 + 0.8, 1.02, z0 + 0.87), P(cx0 + 0.8, 1.46, z0 + 0.87), P(cx0 + 0.8, 1.46, z0 + 0.13)], 'rgba(245,241,236,0.28)', null);
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------ crane
     A gantry lifts the top box off a stack, carries it across and sets it on a
     waiting truck. The truck leaves, another arrives, the stack is topped up. */
  function crane(time) {
    const T = 11, t = time % T;
    const zS = 2.3, zT = 4.65, yHigh = 4.6, yStack = 3.24, yTruck = 1.57, LH = 1.08;
    const tz = zS + (zT - zS) * (seg(t, 3.4, 5.2) - seg(t, 8.4, 10));
    const ySp = yHigh - (yHigh - yStack) * (seg(t, 0, 1.6) - seg(t, 2, 3.4)) - (yHigh - yTruck) * (seg(t, 5.2, 6.8) - seg(t, 7.2, 8.4));
    const held = t >= 1.8 && t < 6.9, loaded = t >= 6.9 && t < 9;
    let off = 0;
    if (t >= 7.5 && t < 9) off = 16 * Math.pow((t - 7.5) / 1.5, 2);
    else if (t >= 9) off = -16 * Math.pow(1 - (t - 9) / 2, 2);

    ground(-22, 26, -7, 9, 2.7, 1.15);
    line(P(-22, 0, 4.5), P(26, 0, 4.5), LINE + '0.16)');
    line(P(-22, 0, 5.85), P(26, 0, 5.85), LINE + '0.16)');

    // yard further back
    [[-9.1, [2, 1, 2]], [-6.2, [1, 2, 2]], [-3.3, [2, 3, 1]]].forEach(([x0, heights], col) => {
      heights.forEach((n, j) => { for (let l = 0; l < n; l++) container(x0, l * LH, j * 1.15, pick(col * 2 + j * 3 + l + 2)); });
    });

    // far side of the gantry
    box(0.6, 0, -0.6, 0.24, 5.4, 0.24, '#57493f');
    box(4.6, 0, -0.6, 0.24, 5.4, 0.24, '#57493f');
    box(0.6, 5.4, -0.6, 0.24, 0.32, 7.14, '#3d3430');
    box(0.6, 5.4, -0.6, 4.24, 0.2, 0.2, '#3d3430');

    // the stack being worked
    [3, 2, 2].forEach((n, j) => { for (let l = 0; l < n; l++) container(1.35, l * LH, j * 1.15, pick(j * 2 + l + 3)); });
    if (t < 1.8) container(1.35, 2 * LH, zS, PAL[0]);
    else if (t >= 9.6) { const a = clamp01((t - 9.6) / 1.2); container(1.35, 2 * LH + (1 - smooth(a)) * 0.7, zS, PAL[0], { alpha: a }); }

    // more of the yard on the near side (the truck lane passes in front of it)
    [[7.4, [2, 3, 2]], [10.3, [1, 2, 3]], [13.2, [2, 1, 1]], [16.1, [1, 2, 2]]].forEach(([x0, heights], col) => {
      heights.forEach((n, j) => { for (let l = 0; l < n; l++) container(x0, l * LH, j * 1.15, pick(col * 3 + j * 2 + l + 1)); });
    });

    truck(1.25 + off, zT, PAL[1], loaded ? PAL[0] : null);
    box(0.6, 0, 6.3, 0.24, 5.4, 0.24, '#57493f');

    // hoist: cables, spreader and the box in flight
    for (const cx of [1.65, 3.55]) for (const cz of [tz + 0.25, tz + 0.75]) line(P(cx, 5.72, cz), P(cx, ySp + 0.14, cz), LINE + '0.5)');
    if (held) container(1.35, ySp - 1.05, tz, PAL[0]);
    box(1.45, ySp, tz + 0.05, 2.3, 0.14, 0.9, '#f5f1ec');

    // near side of the gantry and the trolley
    box(4.6, 5.4, -0.6, 0.24, 0.32, 7.14, '#3d3430');
    box(0.6, 5.72, tz + 0.3, 4.24, 0.26, 0.4, '#ff8a3c');
    box(2.2, 5.98, tz + 0.25, 0.8, 0.42, 0.5, '#f5f1ec');
    box(0.6, 5.4, 6.3, 4.24, 0.2, 0.2, '#3d3430');
    box(4.6, 0, 6.3, 0.24, 5.4, 0.24, '#57493f');
  }

  /* ----------------------------------------------------------------- convoy
     Trucks on a road, a container train on the line behind it, a yard beyond. */
  function convoy(time) {
    ground(-40, 40, -8, 5, 3.1, 1.15);

    for (let i = -8; i <= 8; i++) {
      const x0 = i * 3.1 - 1, n = 1 + (((i * 7 + 13) % 3) + 3) % 3;
      for (let l = 0; l < n; l++) container(x0, l * 1.08, -4.75, pick(i * 3 + l * 5));
      if (i % 3) container(x0, 0, -3.55, pick(i * 5 + 1));
    }

    // railway and train (runs towards -x)
    box(-40, 0, -1.9, 80, 0.07, 1.2, '#15100e');
    line(P(-40, 0.08, -1.62), P(40, 0.08, -1.62), LINE + '0.35)');
    line(P(-40, 0.08, -0.98), P(40, 0.08, -0.98), LINE + '0.35)');
    const dist = time * 1.5, gap = 3.2, first = Math.floor(dist / gap);
    for (let k = -8; k <= 9; k++) {
      const id = k + first, x0 = k * gap - (dist % gap);
      box(x0, 0.12, -1.72, 2.95, 0.2, 0.86, '#2a221f');
      for (const wx of [x0 + 0.25, x0 + 2.3]) box(wx, 0, -1.02, 0.4, 0.26, 0.16, '#120e0d');
      if (id % 5 !== 0) container(x0 + 0.22, 0.32, -1.79, pick(id * 2 + 1));
    }

    // road and trucks (run towards +x)
    box(-40, 0, 0.55, 80, 0.03, 1.9, '#17110f');
    ctx.setLineDash([s * 0.5, s * 0.5]);
    line(P(-40, 0.04, 1.5), P(40, 0.04, 1.5), LINE + '0.22)');
    ctx.setLineDash([]);
    const span = 48, trucks = [];
    for (let i = 0; i < 6; i++) trucks.push({ x: ((i * 8 + (i % 2) * 1.6 + time * 2.4) % span) - span / 2, i });
    trucks.sort((a, b) => a.x - b.x).forEach(({ x, i }) => truck(x, 0.72, i % 2 ? PAL[1] : PAL[4], i % 4 === 3 ? null : pick(i * 3)));
  }

  /* ------------------------------------------------------------------- sort
     Boxes ride a belt through a scanning gate. Most carry on; every third one
     is flagged and moved onto a side belt for a closer look. */
  function sort(time) {
    ground(-22, 22, -5, 12, 1.6, 1.6);
    const GATE = -1.2, TURN = 1.75, speed = 1.3, gap = 2.6;

    box(-22, 0.42, 0, 44, 0.24, 1.1, '#241c19');                 // main belt
    box(1.5, 0.42, 1.1, 1.1, 0.24, 12, '#241c19');               // side belt
    for (let x = -22; x < 22; x += 2.2) box(x, 0, 0.45, 0.16, 0.42, 0.16, '#3d3430');
    box(GATE - 0.1, 0, -0.3, 0.2, 2.7, 0.2, '#57493f');          // far post of the gate

    const dist = time * speed, first = Math.floor(dist / gap), items = [];
    for (let k = -9; k <= 9; k++) {
      const id = first - k, flagged = ((id % 3) + 3) % 3 === 0, long = ((id % 2) + 2) % 2 === 0;
      let x = k * gap + (dist % gap), z = long ? 0.15 : 0.2;
      const L = long ? 1.6 : 0.8;
      if (flagged && x > TURN - L / 2) { z += x - (TURN - L / 2); x = TURN - L / 2; }
      items.push({ x, z, L, id, flagged, long });
    }
    items.sort((a, b) => a.x + a.z - (b.x + b.z)).forEach((it) => {
      const color = it.long ? pick(it.id * 2) : (it.id % 4 ? '#8a6a4a' : '#f5f1ec');
      box(it.x, 0.66, it.z, it.L, it.long ? 0.72 : 0.66, it.long ? 0.8 : 0.7, color, it.long ? { ribs: 'x' } : {});
      const past = it.x + it.L / 2 - GATE;                       // how far the item is beyond the gate
      if (past > 0 && past < 2.4 + (it.flagged ? 6 : 0)) {
        const top = P(it.x + it.L / 2, 2.05, it.z + 0.4), a = clamp01(past * 3) * clamp01(it.flagged ? 1 : (2.4 - past) * 2);
        ctx.globalAlpha = a;
        if (it.flagged) {                                        // flagged: orange diamond
          poly([[top[0], top[1] - 9], [top[0] + 9, top[1]], [top[0], top[1] + 9], [top[0] - 9, top[1]]], null, PAL[0]);
          ctx.fillStyle = PAL[0]; ctx.beginPath(); ctx.arc(top[0], top[1], 2.4, 0, TAU); ctx.fill();
        } else {                                                 // cleared: ring with a tick
          ctx.strokeStyle = LINE + '0.9)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(top[0], top[1], 8, 0, TAU); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(top[0] - 4, top[1]); ctx.lineTo(top[0] - 1, top[1] + 3.5); ctx.lineTo(top[0] + 4.5, top[1] - 3.5); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    });

    // scanning light between the posts, brighter while something is under it
    let glow = 0;
    for (const it of items) glow = Math.max(glow, 1 - Math.min(1, Math.abs(it.x + it.L / 2 - GATE) / 0.9));
    poly([P(GATE, 0.66, -0.2), P(GATE, 0.66, 1.3), P(GATE, 2.6, 1.3), P(GATE, 2.6, -0.2)], `rgba(255,77,0,${0.07 + glow * 0.3})`, `rgba(255,77,0,${0.25 + glow * 0.6})`);
    const sweep = 0.66 + (0.5 + 0.5 * Math.sin(time * 3.2)) * 1.94;
    line(P(GATE, sweep, -0.2), P(GATE, sweep, 1.3), `rgba(255,214,178,${0.5 + glow * 0.5})`, 1.6);

    box(GATE - 0.1, 0, 1.3, 0.2, 2.7, 0.2, '#57493f');           // near post and the bar across the top
    box(GATE - 0.1, 2.7, -0.3, 0.2, 0.2, 1.8, '#3d3430');
  }

  /* ------------------------------------------------------------------- spin
     One container in real perspective. It turns on its own and leans towards
     the pointer. */
  function spin(time) {
    const yaw = time * 0.3 + (ptr.cx - 0.5) * 2.2, pitch = -(0.34 + (ptr.cy - 0.5) * 0.5);
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const f = Math.min(w * 1.25, h * 2.7), d = 7.2, cx = w / 2, cy = h * 0.5;
    const R = (x, y, z) => { const x1 = x * cyw + z * syw, z1 = -x * syw + z * cyw; return [x1, y * cp - z1 * sp, y * sp + z1 * cp]; };
    const Q = (x, y, z) => { const v = R(x, y, z), k = f / (v[2] + d); return [cx + v[0] * k, cy - v[1] * k]; };
    const hx = 1.3, hy = 0.55, hz = 0.52, floor = -hy - 0.02;

    // floor grid and shadow turn with the box
    ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) {
      const a = 0.11 - Math.abs(i) * 0.014;
      line(Q(i * 0.62, floor, -3.7), Q(i * 0.62, floor, 3.7), LINE + a + ')');
      line(Q(-3.7, floor, i * 0.62), Q(3.7, floor, i * 0.62), LINE + a + ')');
    }
    poly([Q(-hx * 1.08, floor, -hz * 1.25), Q(hx * 1.08, floor, -hz * 1.25), Q(hx * 1.08, floor, hz * 1.25), Q(-hx * 1.08, floor, hz * 1.25)], 'rgba(0,0,0,0.6)', null);

    const light = [-0.42, 0.78, -0.46];
    const faces = [
      { n: [0, 1, 0], c: [[-hx, hy, -hz], [hx, hy, -hz], [hx, hy, hz], [-hx, hy, hz]], kind: 'top' },
      { n: [0, 0, 1], c: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]], kind: 'side', z: hz },
      { n: [0, 0, -1], c: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz]], kind: 'side', z: -hz },
      { n: [1, 0, 0], c: [[hx, -hy, -hz], [hx, -hy, hz], [hx, hy, hz], [hx, hy, -hz]], kind: 'doors' },
      { n: [-1, 0, 0], c: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]], kind: 'end' },
    ];
    for (const face of faces) {
      const n = R(...face.n), mid = R(...face.c[0].map((v, i) => (v + face.c[2][i]) / 2));
      if (n[0] * mid[0] + n[1] * mid[1] + n[2] * (mid[2] + d) >= 0) continue;        // facing away
      const lit = 0.4 + 0.74 * Math.max(0, n[0] * light[0] + n[1] * light[1] + n[2] * light[2]);
      poly(face.c.map((p) => Q(...p)), shade(PAL[0], lit), 'rgba(7,5,4,0.7)');
      const rib = 'rgba(7,5,4,0.28)';
      if (face.kind === 'side') {
        for (let i = 1; i < 14; i++) { const x = -hx + (i * 2 * hx) / 14; line(Q(x, -hy + 0.06, face.z), Q(x, hy - 0.06, face.z), rib); }
        // plain label panel
        const dir = face.z > 0 ? 1 : -1;
        poly([Q(-0.95 * dir, -0.08, face.z), Q(-0.2 * dir, -0.08, face.z), Q(-0.2 * dir, 0.3, face.z), Q(-0.95 * dir, 0.3, face.z)], shade('#f5f1ec', lit), null);
      } else if (face.kind === 'doors') {
        line(Q(hx, -hy + 0.04, 0), Q(hx, hy - 0.04, 0), 'rgba(7,5,4,0.6)', 1.4);
        for (const z of [-0.36, -0.15, 0.15, 0.36]) line(Q(hx, -hy + 0.07, z), Q(hx, hy - 0.07, z), 'rgba(245,241,236,0.55)');
        for (const z of [-0.15, 0.15]) line(Q(hx, -0.05, z - 0.07), Q(hx, -0.05, z + 0.07), 'rgba(245,241,236,0.8)', 2);
      } else if (face.kind === 'end') {
        for (let i = 1; i < 6; i++) { const z = -hz + (i * 2 * hz) / 6; line(Q(-hx, -hy + 0.06, z), Q(-hx, hy - 0.06, z), rib); }
      } else {
        for (let i = 1; i < 9; i++) { const x = -hx + (i * 2 * hx) / 9; line(Q(x, hy, -hz + 0.05), Q(x, hy, hz - 0.05), 'rgba(7,5,4,0.16)'); }
      }
    }
  }

  const scenes = { crane, convoy, sort, spin };

  /* ------------------------------------------------------------------- loop */
  let last = performance.now(), clock = 0, still = null;
  function frame(now) {
    raf = 0;
    if (!alive || !w) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    clock += dt;                                   // scene time only advances while it is on screen
    const k = 1 - Math.exp(-dt * 5);
    ptr.cx += (ptr.x - ptr.cx) * k; ptr.cy += (ptr.y - ptr.cy) * k;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineJoin = 'round';
    (scenes[scene] || crane)(still ?? (animate ? clock : 3.2));
    if (visible && animate && still === null) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && alive) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = clamp01((e.clientX - r.left) / r.width); ptr.y = clamp01((e.clientY - r.top) / r.height);
    if (!animate) kick();
  };
  const onResize = () => { resize(); kick(); };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); }, { rootMargin: '10%' });
  io.observe(canvas);
  if (scene === 'spin') window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', onResize);
  resize();
  kick();

  return {
    // Show one fixed moment of the loop (seconds); pass null to resume playing.
    draw(t) { still = t; kick(); },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
    },
  };
}
