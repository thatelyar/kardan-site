// Footer wordmark made of particles. They assemble on first view and
// scatter away from the pointer, then spring back.

export function createWordmark(canvas, { text = '', src = '', animate = true } = {}) {
  const ctx = canvas.getContext('2d');
  const fontFamily = getComputedStyle(document.body).fontFamily;
  let w = 0, h = 0, dpr = 1, parts = [];
  let raf = 0, visible = false, started = false;
  const mouse = { x: -9999, y: -9999 };

  // Prefer the logo artwork; fall back to live text if it cannot load.
  let art = null;
  if (src) {
    const img = new Image();
    img.onload = () => { art = img; if (started) { build(); kick(); } };
    img.src = src;
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);

    // Draw the word off-screen, then sample it on a grid.
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const o = off.getContext('2d');
    if (art && art.naturalWidth) {
      const k = Math.min(w / art.naturalWidth, h / art.naturalHeight);
      const dw = art.naturalWidth * k, dh = art.naturalHeight * k;
      o.drawImage(art, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      let size = 200;
      o.font = `700 ${size}px ${fontFamily}`;
      const measured = o.measureText(text).width || 1;
      size = Math.min((size * w) / measured, h * 1.25);
      o.font = `700 ${size}px ${fontFamily}`;
      o.textBaseline = 'middle';
      o.textAlign = 'center';
      o.fillStyle = '#fff';
      o.fillText(text, w / 2, h / 2 + size * 0.04);
    }

    const step = Math.max(3, Math.round(w / 300));
    const data = o.getImageData(0, 0, w, h).data;
    const old = parts;
    parts = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 128) {
          const prev = old[parts.length];
          parts.push({
            hx: x, hy: y,
            x: prev ? prev.x : Math.random() * w,
            y: prev ? prev.y : h + Math.random() * h * 2,
            vx: 0, vy: 0,
            hot: Math.random() < 0.05,
            size: step * 0.55,
          });
        }
      }
    }
    if (!animate) parts.forEach((p) => { p.x = p.hx; p.y = p.hy; });
  }

  function frame() {
    raf = 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const R = Math.max(70, w * 0.07), R2 = R * R;
    let moving = false;
    for (const p of parts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2 && d2 > 0.01) {
        const d = Math.sqrt(d2), f = (1 - d / R) * 3.2;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
      }
      p.vx += (p.hx - p.x) * 0.045; p.vy += (p.hy - p.y) * 0.045;
      p.vx *= 0.84; p.vy *= 0.84;
      p.x += p.vx; p.y += p.vy;
      if (Math.abs(p.vx) + Math.abs(p.vy) > 0.02) moving = true;
      ctx.fillStyle = p.hot ? '#ff4d00' : '#f5f1ec';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    if (visible && animate && (moving || mouse.x > -999)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    kick();
  };
  const onLeave = () => { mouse.x = mouse.y = -9999; kick(); };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); kick(); }, 150);
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      if (!started) { started = true; build(); }
      kick();
    }
  }, { threshold: 0.05 }).observe(canvas);
}
