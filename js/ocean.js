// Ember-lit night ocean rendered in a single fragment shader (plain WebGL, no library).
// set({ scroll, mx, my }) steers the camera and the sun.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// Layered ridged noise: sharp crests, wide troughs.
float sea(vec2 p) {
  float h = 0.0, a = 0.55;
  vec2 drift = vec2(uTime * 0.26, uTime * 0.17);
  for (int i = 0; i < 5; i++) {
    float n = vnoise(p + drift);
    n = 1.0 - abs(2.0 * n - 1.0);
    h += a * n * n;
    p = mat2(1.6, -1.2, 1.2, 1.6) * p;
    drift *= 1.35;
    a *= 0.48;
  }
  return h;
}

vec3 sky(vec3 rd, vec3 sun) {
  float t = clamp(rd.y, 0.0, 1.0);
  vec3 horizon = vec3(1.0, 0.3, 0.02);
  vec3 mid = vec3(0.3, 0.035, 0.008);
  vec3 top = vec3(0.012, 0.004, 0.003);
  vec3 c = mix(horizon, mid, smoothstep(0.0, 0.2, t));
  c = mix(c, top, smoothstep(0.12, 0.75, t));
  float s = max(dot(rd, sun), 0.0);
  c += vec3(1.0, 0.36, 0.06) * pow(s, 18.0) * 0.55;
  c += vec3(1.0, 0.8, 0.55) * pow(s, 700.0) * 5.0;
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float pitch = -0.085 - uScroll * 0.5;
  float camH = 1.5 + uScroll * 3.5;
  vec3 ro = vec3(0.0, camH, 0.0);
  vec3 rd = normalize(vec3(uv.x, uv.y, 1.35));
  float cp = cos(pitch), sp = sin(pitch);
  rd = vec3(rd.x, rd.y * cp + rd.z * sp, -rd.y * sp + rd.z * cp);

  vec3 sun = normalize(vec3((uMouse.x - 0.5) * 0.7, 0.065 + (0.5 - uMouse.y) * 0.05, 1.0));
  vec3 col;

  if (rd.y < -0.0005) {
    float dist = -ro.y / rd.y;
    vec2 p = ro.xz + rd.xz * dist;
    p.y += uTime * 0.6;                       // slow forward travel
    vec2 q = p * 0.34;
    float e = 0.012 + dist * 0.004;
    float h = sea(q);
    float gx = (sea(q + vec2(e, 0.0)) - sea(q - vec2(e, 0.0))) / (2.0 * e);
    float gz = (sea(q + vec2(0.0, e)) - sea(q - vec2(0.0, e))) / (2.0 * e);
    float amp = 0.3 / (1.0 + dist * 0.05);
    vec3 n = normalize(vec3(-gx * amp, 1.0, -gz * amp));

    float fres = 0.03 + 0.97 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 r = reflect(rd, n);
    r.y = abs(r.y) + 0.002;
    vec3 refl = sky(normalize(r), sun);
    vec3 deep = vec3(0.018, 0.006, 0.004) + vec3(0.06, 0.014, 0.0) * h;
    col = mix(deep, refl, fres);

    vec3 haze = sky(normalize(vec3(rd.x, 0.004, rd.z)), sun);
    col = mix(col, haze, 1.0 - exp(-dist * 0.011));
  } else {
    col = sky(rd, sun);
  }

  vec2 v = gl_FragCoord.xy / uRes - 0.5;
  col *= 1.0 - dot(v, v) * 0.75;
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.025;
  col = pow(max(col, 0.0), vec3(0.9));
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

export function createOcean(canvas, { animate = true } = {}) {
  const noop = { set() {}, destroy() {} };
  let gl;
  try {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (_) { gl = null; }
  if (!gl) { canvas.classList.add('is-fallback'); return noop; }

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (err) {
    console.warn('[ocean] shader failed, using CSS fallback', err);
    canvas.classList.add('is-fallback');
    return noop;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(program, 'uRes'),
    time: gl.getUniformLocation(program, 'uTime'),
    mouse: gl.getUniformLocation(program, 'uMouse'),
    scroll: gl.getUniformLocation(program, 'uScroll'),
  };

  const target = { scroll: 0, mx: 0.5, my: 0.5 };
  const cur = { scroll: 0, mx: 0.5, my: 0.5 };
  let raf = 0, visible = true, alive = true;
  const t0 = performance.now();

  function resize() {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.8;
    const w = Math.max(2, Math.round(canvas.clientWidth * scale));
    const h = Math.max(2, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function frame() {
    if (!alive) return;
    raf = 0;
    cur.scroll += (target.scroll - cur.scroll) * 0.1;
    cur.mx += (target.mx - cur.mx) * 0.04;
    cur.my += (target.my - cur.my) * 0.04;
    resize();
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, animate ? (performance.now() - t0) / 1000 : 4.0);
    gl.uniform2f(u.mouse, cur.mx, cur.my);
    gl.uniform1f(u.scroll, cur.scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && animate) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && alive) raf = requestAnimationFrame(frame); };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); });
  io.observe(canvas);
  window.addEventListener('resize', kick);
  kick();

  return {
    set(v) { Object.assign(target, v); kick(); },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', kick);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
