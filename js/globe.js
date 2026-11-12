// Dotted globe for the hero. It turns slowly on its own, follows a drag
// (with inertia), and leans a little towards the pointer.
//   createGlobe(canvas, { host, grab, rtl, lang, animate }) -> { set({ scroll, mx, my }), destroy() }
// `grab` is an optional element kept exactly over the globe (used for the drag cursor).
import { LAND, LAND_W, LAND_H } from './land.js';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const BONE = '245,241,236';
const ACCENT = '255,77,0';

// Hub and destinations for the route arcs. Edit freely: these are examples.
const HUB = { lat: 35.69, lon: 51.39, en: 'Tehran', fa: 'تهران' };
const PLACES = [
  { lat: 25.2, lon: 55.27, en: 'Dubai', fa: 'دبی' },
  { lat: 41.01, lon: 28.98, en: 'Istanbul', fa: 'استانبول' },
  { lat: 53.55, lon: 9.99, en: 'Hamburg', fa: 'هامبورگ' },
  { lat: 55.75, lon: 37.62, en: 'Moscow', fa: 'مسکو' },
  { lat: 19.08, lon: 72.88, en: 'Mumbai', fa: 'بمبئی' },
  { lat: 31.23, lon: 121.47, en: 'Shanghai', fa: 'شانگهای' },
];

const vec = (lat, lon) => {
  const p = lat * DEG, l = lon * DEG;
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
};

function landPoints(step) {
  const bin = atob(LAND);
  const isLand = (lat, lon) => {
    const row = Math.min(LAND_H - 1, Math.max(0, Math.floor(90 - lat)));
    const col = ((Math.floor(lon + 180) % LAND_W) + LAND_W) % LAND_W;
    const i = row * LAND_W + col;
    return (bin.charCodeAt(i >> 3) >> (i & 7)) & 1;
  };
  const out = [];
  let rowIndex = 0;
  for (let lat = -86; lat <= 86; lat += step, rowIndex++) {
    const n = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / step));
    for (let k = 0; k < n; k++) {
      const lon = -180 + ((k + (rowIndex % 2) * 0.5) * 360) / n;
      if (isLand(lat, lon)) out.push(...vec(lat, lon));
    }
  }
  return new Float32Array(out);
}

// Great-circle arc from a to b, lifted off the surface in the middle.
function arcPoints(a, b, n = 56) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot), so = Math.sin(om) || 1e-6;
  const lift = 0.06 + om * 0.16;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so;
    const r = 1 + lift * Math.sin(Math.PI * t);
    pts.push([(a[0] * k1 + b[0] * k2) * r, (a[1] * k1 + b[1] * k2) * r, (a[2] * k1 + b[2] * k2) * r]);
  }
  return pts;
}

export function createGlobe(canvas, { host = canvas, grab = null, rtl = false, lang = 'en', animate = true } = {}) {
  const ctx = canvas.getContext('2d');
  const land = landPoints(1.55);
  const hub = vec(HUB.lat, HUB.lon);
  const places = PLACES.map((p) => ({ ...p, v: vec(p.lat, p.lon) }));
  const arcs = places.map((p, i) => ({ pts: arcPoints(hub, p.v), phase: i * 0.37 }));
  const stars = Array.from({ length: 170 }, (_, i) => {
    const r = (n) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
    return { x: r(1), y: r(2), s: 0.6 + r(3) * 1.3, a: 0.15 + r(4) * 0.5, ph: r(5) * TAU };
  });

  let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, R = 1;
  let yaw = -HUB.lon * DEG - 0.25, tilt = 0.36;      // start with the hub facing the viewer
  let vYaw = 0, vTilt = 0, dragging = false, lastX = 0, lastY = 0, lastMove = 0;
  const target = { scroll: 0, mx: 0.5, my: 0.5 }, cur = { scroll: 0, mx: 0.5, my: 0.5 };
  let raf = 0, visible = true, alive = true, last = performance.now(), grabKey = '';

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  }

  function layout() {
    const narrow = w < 820;
    R = narrow ? Math.min(w * 0.62, h * 0.36) : Math.min(w * 0.33, h * 0.47);
    R *= 1 + cur.scroll * 0.14;
    cx = narrow ? w * 0.5 : w * (rtl ? 0.27 : 0.73);
    cy = (narrow ? h * 0.33 : h * 0.47) - cur.scroll * h * 0.1;
    if (grab) {
      const key = `${Math.round(cx)}|${Math.round(cy)}|${Math.round(R)}`;
      if (key !== grabKey) {
        grabKey = key;
        grab.style.width = grab.style.height = `${Math.round(R * 2)}px`;
        grab.style.transform = `translate(${Math.round(cx - R)}px, ${Math.round(cy - R)}px)`;
      }
    }
  }

  function frame(now) {
    raf = 0;
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const time = now / 1000;

    cur.scroll += (target.scroll - cur.scroll) * 0.1;
    cur.mx += (target.mx - cur.mx) * 0.05;
    cur.my += (target.my - cur.my) * 0.05;
    if (!dragging) {
      // vYaw / vTilt are in radians per second and die away after a release.
      yaw += (vYaw + (animate ? 0.055 : 0)) * dt;
      tilt += vTilt * dt;
      const decay = Math.exp(-3.2 * dt);
      vYaw *= decay; vTilt *= decay;
      tilt += (0.36 - tilt) * Math.min(1, dt * 0.7);   // ease back to the resting tilt
    }
    tilt = Math.max(-1.15, Math.min(1.15, tilt));
    layout();

    const a = yaw + (cur.mx - 0.5) * 0.22, t = tilt + (cur.my - 0.5) * 0.14;
    const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(t), st = Math.sin(t);
    // returns [screenX, screenY, depth, planarRadius]
    const proj = (x, y, z) => {
      const x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
      const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
      return [cx + R * x1, cy - R * y2, z2, Math.hypot(x1, y2)];
    };

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Stars
    for (const s of stars) {
      ctx.fillStyle = `rgba(${BONE},${(s.a * (0.7 + 0.3 * Math.sin(time * 0.8 + s.ph))).toFixed(3)})`;
      ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
    }

    // Orbit rings: back halves first, front halves after the globe.
    const rings = [{ r: 1.2, tx: 1.22, tz: -0.42, sp: 0.05 }, { r: 1.34, tx: 1.36, tz: 0.5, sp: -0.035 }];
    const ringPath = (ring, front) => {
      const cxr = Math.cos(ring.tx), sxr = Math.sin(ring.tx), cz = Math.cos(ring.tz), sz = Math.sin(ring.tz);
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= 160; i++) {
        const th = (i / 160) * TAU + time * ring.sp;
        const x = ring.r * Math.cos(th), z0 = ring.r * Math.sin(th);
        const y1 = -z0 * sxr, z1 = z0 * cxr;
        const x2 = x * cz - y1 * sz, y2 = x * sz + y1 * cz;
        if ((z1 > 0) === front) { const px = cx + R * x2, py = cy - R * y2; pen ? ctx.lineTo(px, py) : ctx.moveTo(px, py); pen = true; } else pen = false;
      }
      ctx.strokeStyle = `rgba(${ACCENT},${front ? 0.55 : 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    rings.forEach((r) => ringPath(r, false));

    // Atmosphere glow behind the body
    let g = ctx.createRadialGradient(cx - R * 0.05, cy - R * 0.06, R * 0.92, cx - R * 0.05, cy - R * 0.06, R * 1.42);
    g.addColorStop(0, `rgba(${ACCENT},0.5)`); g.addColorStop(0.35, `rgba(${ACCENT},0.16)`); g.addColorStop(1, `rgba(${ACCENT},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, 0, TAU); ctx.fill();

    // Body
    g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#190d08'); g.addColorStop(0.6, '#0a0605'); g.addColorStop(1, '#030202');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

    // Rim light: hot on the upper side, a faint ember on the opposite edge
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    const lx = (rtl ? -1 : 1) * 0.2;
    g = ctx.createRadialGradient(cx + R * lx, cy + R * 0.27, R * 0.74, cx + R * lx, cy + R * 0.27, R * 1.36);
    g.addColorStop(0, `rgba(${ACCENT},0)`); g.addColorStop(0.5, `rgba(${ACCENT},0.2)`); g.addColorStop(0.84, 'rgba(255,132,60,0.72)'); g.addColorStop(1, 'rgba(255,222,186,0.98)');
    ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    g = ctx.createRadialGradient(cx - R * lx, cy - R * 0.3, R * 0.8, cx - R * lx, cy - R * 0.3, R * 1.4);
    g.addColorStop(0, 'rgba(150,26,0,0)'); g.addColorStop(1, 'rgba(190,40,0,0.5)');
    ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.restore();

    // Land dots, batched into three depth bands
    const size = Math.max(1.1, R * 0.0052);
    const bands = [[], [], []];
    for (let i = 0; i < land.length; i += 3) {
      const p = proj(land[i], land[i + 1], land[i + 2]);
      if (p[2] <= 0.03) continue;
      bands[p[2] < 0.32 ? 0 : p[2] < 0.66 ? 1 : 2].push(p);
    }
    const styles = ['rgba(255,186,140,0.6)', `rgba(${BONE},0.72)`, `rgba(${BONE},0.96)`];
    bands.forEach((band, b) => {
      ctx.fillStyle = styles[b];
      ctx.beginPath();
      for (const p of band) { const s = size * (0.5 + 0.5 * p[2]); ctx.rect(p[0] - s / 2, p[1] - s / 2, s, s); }
      ctx.fill();
    });

    // Route arcs with a pulse travelling along each one
    ctx.lineCap = 'round';
    for (const arc of arcs) {
      const pp = arc.pts.map((q) => proj(q[0], q[1], q[2]));
      const seen = (p) => p[2] > 0 || p[3] > 1;
      const stroke = (from, to, style, width) => {
        ctx.beginPath();
        let pen = false;
        for (let i = from; i <= to; i++) {
          if (seen(pp[i])) { pen ? ctx.lineTo(pp[i][0], pp[i][1]) : ctx.moveTo(pp[i][0], pp[i][1]); pen = true; } else pen = false;
        }
        ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
      };
      const n = pp.length - 1;
      stroke(0, n, `rgba(${ACCENT},0.62)`, 1.2);
      const head = ((time * 0.22 + arc.phase) % 1.5) * n;
      if (head < n + 10) {
        const hi = Math.min(n, Math.floor(head)), lo = Math.max(0, hi - 10);
        stroke(lo, hi, 'rgba(255,200,150,0.95)', 2);
        if (head <= n && seen(pp[hi])) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pp[hi][0], pp[hi][1], 2.4, 0, TAU); ctx.fill(); }
      }
    }

    // Markers and labels
    ctx.font = lang === 'fa' ? '500 12px Vazirmatn, sans-serif' : '500 10.5px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    ctx.direction = lang === 'fa' ? 'rtl' : 'ltr';
    ctx.textAlign = 'left';
    const mark = (v, label, isHub) => {
      const p = proj(v[0], v[1], v[2]);
      if (p[2] <= 0.12) return;
      const fade = Math.min(1, (p[2] - 0.12) / 0.2);
      const pulse = (time * 0.7 + v[0] * 3) % 1;
      ctx.strokeStyle = `rgba(${ACCENT},${((1 - pulse) * 0.8 * fade).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p[0], p[1], (isHub ? 6 : 4) + pulse * (isHub ? 16 : 10), 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(${ACCENT},${fade})`;
      ctx.beginPath(); ctx.arc(p[0], p[1], isHub ? 4.5 : 3, 0, TAU); ctx.fill();
      const text = lang === 'fa' ? label : label.toUpperCase();
      const tw = ctx.measureText(text).width, bw = tw + 16, bh = 22;
      const bx = p[0] + 10, by = p[1] - bh - 6;
      ctx.fillStyle = `rgba(14,10,8,${0.86 * fade})`;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = `rgba(${BONE},${0.16 * fade})`;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = `rgba(${BONE},${fade})`;
      ctx.fillText(text, lang === 'fa' ? bx + bw - 8 - tw : bx + 8, by + bh / 2 + 1);
    };
    places.forEach((p) => mark(p.v, p[lang] || p.en, false));
    mark(hub, HUB[lang] || HUB.en, true);

    rings.forEach((r) => ringPath(r, true));

    // Crisp edge on the lit side
    const edge = ctx.createLinearGradient(cx + R * lx * 4, cy - R, cx - R * lx * 4, cy + R);
    edge.addColorStop(0, 'rgba(255,214,178,0.9)'); edge.addColorStop(0.5, `rgba(${ACCENT},0.35)`); edge.addColorStop(1, 'rgba(120,20,0,0.15)');
    ctx.strokeStyle = edge; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

    const settling = Math.abs(vYaw) + Math.abs(vTilt) > 0.003 || Math.abs(tilt - 0.36) > 0.003 || Math.abs(target.scroll - cur.scroll) > 0.001;
    if (visible && (animate || dragging || settling)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && alive) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  // Drag to rotate. Links and buttons inside the host keep working normally.
  const down = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest('a, button, input, textarea')) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY; vYaw = vTilt = 0; lastMove = performance.now();
    host.classList.add('is-dragging');
    kick();
  };
  const move = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    const now = performance.now(), dtm = Math.max(8, now - lastMove) / 1000;
    lastMove = now;
    const ax = dx / R, ay = dy / R;
    yaw += ax; tilt += ay;
    // Smoothed pointer speed, capped so a fast flick cannot spin the globe wildly.
    const cap = (v) => Math.max(-3.2, Math.min(3.2, v));
    vYaw = cap(vYaw * 0.5 + (ax / dtm) * 0.5);
    vTilt = cap(vTilt * 0.5 + (ay / dtm) * 0.5);
    kick();
  };
  const up = () => {
    if (!dragging) return;
    dragging = false;
    if (performance.now() - lastMove > 90) vYaw = vTilt = 0;   // held still before letting go: no throw
    host.classList.remove('is-dragging');
    kick();
  };
  host.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);

  const onResize = () => { resize(); kick(); };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); });
  io.observe(canvas);
  window.addEventListener('resize', onResize);
  document.fonts?.ready.then(kick);
  resize();
  kick();

  return {
    set(v) { Object.assign(target, v); kick(); },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      host.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', onResize);
      host.classList.remove('is-dragging');
    },
  };
}
