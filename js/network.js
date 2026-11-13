// Light paths that either converge on one decision point or radiate from it.
//   createNetwork(canvas, { mode: 'converge' | 'radiate', rtl, animate }) -> { destroy() }
// converge: many scattered routes are examined, some fade out, the rest meet at one bright node.
// radiate:  the same node sends light outward, with a slow pulse.

const TAU = Math.PI * 2;
const ACCENT = '255,77,0';
const WARM = '255,196,150';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};

export function createNetwork(canvas, { mode = 'converge', rtl = false, animate = true } = {}) {
  const ctx = canvas.getContext('2d');
  const SAMPLES = 64;
  let w = 0, h = 0, dpr = 1, paths = [], focus = [0, 0];
  let raf = 0, visible = false, alive = true, energy = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const r = rng(mode === 'converge' ? 21 : 34);
    const flip = (x) => (rtl ? w - x : x);
    paths = [];

    if (mode === 'converge') {
      focus = [flip(w * 0.8), h * 0.5];
      const count = Math.round(Math.min(30, Math.max(14, w / 46)));
      for (let i = 0; i < count; i++) {
        // about 70% of the flow comes from the far side, the rest from above and below
        const side = r();
        let start;
        if (side < 0.7) start = [flip(-20), h * (0.04 + r() * 0.92)];
        else if (side < 0.85) start = [flip(w * (0.1 + r() * 0.5)), -20];
        else start = [flip(w * (0.1 + r() * 0.5)), h + 20];
        const fx = rtl ? w - focus[0] : focus[0];
        const sx = rtl ? w - start[0] : start[0];
        const c1 = [flip(sx + (fx - sx) * (0.25 + r() * 0.2)), start[1] + (r() - 0.5) * h * 0.5];
        const c2 = [flip(sx + (fx - sx) * (0.62 + r() * 0.2)), focus[1] + (r() - 0.5) * h * 0.22];
        const dropped = r() < 0.3;                       // routes that are examined and then set aside
        const pts = [];
        for (let k = 0; k <= SAMPLES; k++) pts.push(bez(start, c1, c2, focus, k / SAMPLES));
        paths.push({ pts, end: dropped ? 0.38 + r() * 0.25 : 1, dropped, speed: 0.1 + r() * 0.12, t: r(), node: 0.3 + r() * 0.3, glow: 0, width: dropped ? 0.8 : 1 + r() * 0.8 });
      }
      // a few routes carry on past the decision point
      for (let i = 0; i < 4; i++) {
        const end = [flip(w + 20), h * (0.2 + r() * 0.6)];
        const c1 = [focus[0] + (end[0] - focus[0]) * 0.3, focus[1] + (r() - 0.5) * h * 0.1];
        const c2 = [focus[0] + (end[0] - focus[0]) * 0.7, end[1] + (r() - 0.5) * h * 0.2];
        const pts = [];
        for (let k = 0; k <= SAMPLES; k++) pts.push(bez(focus, c1, c2, end, k / SAMPLES));
        paths.push({ pts, end: 1, dropped: false, after: true, speed: 0.16 + r() * 0.1, t: r(), node: 2, glow: 0, width: 1.4 });
      }
    } else {
      focus = [w * 0.5, h * 0.5];
      const count = Math.round(Math.min(34, Math.max(16, w / 44)));
      const reach = Math.hypot(w, h) * 0.6;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * TAU + (r() - 0.5) * 0.3;
        const end = [focus[0] + Math.cos(ang) * reach, focus[1] + Math.sin(ang) * reach];
        const bend = (r() - 0.5) * 0.9;
        const c1 = [focus[0] + Math.cos(ang + bend) * reach * 0.3, focus[1] + Math.sin(ang + bend) * reach * 0.3];
        const c2 = [focus[0] + Math.cos(ang - bend * 0.6) * reach * 0.7, focus[1] + Math.sin(ang - bend * 0.6) * reach * 0.7];
        const pts = [];
        for (let k = 0; k <= SAMPLES; k++) pts.push(bez(focus, c1, c2, end, k / SAMPLES));
        paths.push({ pts, end: 1, dropped: false, after: true, speed: 0.07 + r() * 0.08, t: r(), node: 0.35 + r() * 0.35, glow: 0, width: 1 + r() * 0.7 });
      }
    }
  }

  const at = (p, t) => p.pts[Math.max(0, Math.min(SAMPLES, Math.round(t * SAMPLES)))];

  function strokeRange(p, from, to, style, width) {
    const a = Math.max(0, Math.floor(from * SAMPLES)), b = Math.min(SAMPLES, Math.ceil(to * SAMPLES));
    if (b <= a) return;
    ctx.beginPath();
    ctx.moveTo(p.pts[a][0], p.pts[a][1]);
    for (let k = a + 1; k <= b; k++) ctx.lineTo(p.pts[k][0], p.pts[k][1]);
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
  }

  let last = performance.now();
  function frame(now) {
    raf = 0;
    if (!alive || !w) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const time = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    const quiet = mode === 'radiate' ? Math.min(w, h) * 0.34 : 0;     // keep the centre calm for text

    for (const p of paths) {
      // resting line
      const base = p.dropped ? 0.07 : 0.16;
      if (p.dropped) {
        ctx.setLineDash([2, 6]);
        strokeRange(p, 0, p.end, `rgba(${ACCENT},${base})`, p.width);
        ctx.setLineDash([]);
      } else if (mode === 'radiate') {
        strokeRange(p, 0.16, 1, `rgba(${ACCENT},${base})`, p.width);
      } else {
        strokeRange(p, 0, 1, `rgba(${ACCENT},${base})`, p.width);
      }

      // travelling pulse
      if (animate) p.t += p.speed * dt;
      if (p.t > p.end + 0.25) { p.t = -Math.random() * 0.5; }
      const head = p.t;
      if (head > 0 && head < p.end + 0.2) {
        const hEnd = Math.min(head, p.end);
        const fade = p.dropped ? Math.max(0, 1 - head / p.end) : 1;
        for (let s = 0; s < 4; s++) {
          const from = hEnd - 0.16 + s * 0.04, to = hEnd - 0.12 + s * 0.04;
          if (to > 0) strokeRange(p, Math.max(0, from), to, `rgba(${WARM},${(0.12 + s * 0.26) * fade})`, p.width + s * 0.35);
        }
        if (head <= p.end) {
          const q = at(p, head);
          const far = quiet ? Math.min(1, Math.hypot(q[0] - focus[0], q[1] - focus[1]) / quiet) : 1;
          ctx.fillStyle = `rgba(255,236,214,${0.95 * fade * far})`;
          ctx.beginPath(); ctx.arc(q[0], q[1], 1.9, 0, TAU); ctx.fill();
          if (!p.dropped && !p.after && head > p.end - 0.02) energy = Math.min(1, energy + 0.5);   // arrival feeds the node
          if (Math.abs(head - p.node) < 0.02) p.glow = 1;
        }
      }

      // checkpoint on the route lights up as the pulse passes it
      if (p.node < p.end) {
        const n = at(p, p.node);
        p.glow *= 0.965;
        ctx.strokeStyle = `rgba(${p.glow > 0.05 ? WARM : ACCENT},${0.22 + p.glow * 0.7})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n[0], n[1], 3 + p.glow * 2.5, 0, TAU); ctx.stroke();
        if (p.dropped) {       // small cross where a route is set aside
          const e = at(p, p.end);
          ctx.strokeStyle = `rgba(${ACCENT},0.3)`;
          ctx.beginPath(); ctx.moveTo(e[0] - 3, e[1] - 3); ctx.lineTo(e[0] + 3, e[1] + 3); ctx.moveTo(e[0] + 3, e[1] - 3); ctx.lineTo(e[0] - 3, e[1] + 3); ctx.stroke();
        }
      }
    }

    // the decision point
    energy *= 0.985;
    const breathe = mode === 'radiate' ? 0.5 + 0.5 * Math.sin(time * 0.52) : 0.3 + energy * 0.7;
    const R = Math.min(w, h) * (mode === 'radiate' ? 0.3 : 0.26) * (0.75 + breathe * 0.35);
    let g = ctx.createRadialGradient(focus[0], focus[1], 0, focus[0], focus[1], R);
    g.addColorStop(0, `rgba(255,214,178,${mode === 'radiate' ? 0.16 : 0.5 + breathe * 0.3})`);
    g.addColorStop(0.18, `rgba(${ACCENT},${mode === 'radiate' ? 0.12 : 0.34})`);
    g.addColorStop(1, `rgba(${ACCENT},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(focus[0], focus[1], R, 0, TAU); ctx.fill();
    if (mode === 'converge') {
      ctx.fillStyle = '#fff3e6';
      ctx.beginPath(); ctx.arc(focus[0], focus[1], 4.5 + breathe * 2, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(${WARM},${0.35 + breathe * 0.4})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(focus[0], focus[1], 14 + breathe * 6, 0, TAU); ctx.stroke();
    } else {
      // a slow ring travelling outward
      const ring = (time * 0.09) % 1;
      ctx.strokeStyle = `rgba(${ACCENT},${(1 - ring) * 0.3})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(focus[0], focus[1], quiet * 0.6 + ring * Math.hypot(w, h) * 0.5, 0, TAU); ctx.stroke();
    }

    if (visible && animate) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && alive) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  let timer = 0;
  const onResize = () => { clearTimeout(timer); timer = setTimeout(() => { build(); kick(); }, 150); };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); }, { rootMargin: '10%' });
  io.observe(canvas);
  window.addEventListener('resize', onResize);
  build();
  kick();

  return {
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io.disconnect();
      window.removeEventListener('resize', onResize);
    },
  };
}
