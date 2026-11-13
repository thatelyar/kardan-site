import { createGlobe } from './globe.js';
import { createStack } from './stack.js';
import { createWordmark } from './wordmark.js';
import { paintArt } from './art.js';
import { createNetwork } from './network.js';
import { createIso } from './iso.js';

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;
const rtl = root.dir === 'rtl';

const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

/* ------------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------------ */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------------
   Persistent UI: cursor, nav, menu, buttons
------------------------------------------------------------------ */
function initCursor() {
  const el = $('.cursor');
  if (!el || !fine) return;
  const dot = $('.cursor__dot', el), ring = $('.cursor__ring', el), label = $('.cursor__label', el);
  const r = { x: pointer.x, y: pointer.y };
  addEventListener('pointermove', () => el.classList.add('is-ready'), { once: true });
  gsap.ticker.add(() => {
    r.x += (pointer.x - r.x) * 0.17; r.y += (pointer.y - r.y) * 0.17;
    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    ring.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
  });
  document.addEventListener('pointerover', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const link = t?.closest('a, button, input, textarea, .footer__mark');
    let labelled = t?.closest('[data-cursor]');
    if (labelled && link && labelled.contains(link)) labelled = null;   // links inside a labelled area keep the link state
    el.dataset.state = labelled ? 'label' : link ? 'link' : '';
    label.textContent = labelled ? labelled.dataset.cursor : '';
  });
}

function initNav() {
  const nav = $('.nav'), toggle = $('.nav__toggle'), bar = $('.progress i');
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('nav--solid', y > 40);
    if (bar) { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; }
    nav.classList.toggle('nav--hidden', y > last && y > 320 && !root.classList.contains('menu-open'));
    last = y;
  }, { passive: true });
  toggle?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
}

function setMenu(open) {
  root.classList.toggle('menu-open', open);
  const toggle = $('.nav__toggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(open));
    const s = $('.roll span', toggle);
    const openLabel = toggle.dataset.open || 'Menu', closeLabel = toggle.dataset.close || 'Close';
    s.textContent = open ? closeLabel : openLabel;
    s.dataset.text = open ? openLabel : closeLabel;
  }
  open ? lenis?.stop() : lenis?.start();
}

function setActiveNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === here));
}

function initButtons() {
  // Fill grows from the point where the pointer entered the button.
  document.addEventListener('pointerover', (e) => {
    const b = e.target instanceof Element ? e.target.closest('.btn') : null;
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--x', `${e.clientX - r.left}px`);
    b.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
}

function magnetic(scope) {
  if (!fine) return () => {};
  const offs = $$('[data-magnetic]', scope).map((el) => {
    const move = (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.killTweensOf(el); };
  });
  return () => offs.forEach((f) => f());
}

/* ------------------------------------------------------------------
   Per-page setup / teardown
------------------------------------------------------------------ */
let page = null;

function setup(main) {
  const disposers = [];
  const onTick = (fn) => { gsap.ticker.add(fn); disposers.push(() => gsap.ticker.remove(fn)); };

  // Generative artwork, repainted about 30 times a second while it is on screen
  const arts = $$('.media[data-art]', main).map((m, i) => {
    const holder = $('.media__in', m);
    if (!holder || $('img', holder)) return null;
    const cv = document.createElement('canvas');
    holder.appendChild(cv);
    return { cv, type: m.dataset.art, seed: i + 1, on: false };
  }).filter(Boolean);
  const paintAll = () => arts.forEach((a) => paintArt(a.cv, a.type, a.seed, 0));
  paintAll();
  const artIO = new IntersectionObserver((entries) => entries.forEach((e) => { const a = arts.find((x) => x.cv === e.target); if (a) a.on = e.isIntersecting; }), { rootMargin: '10%' });
  arts.forEach((a) => artIO.observe(a.cv));
  disposers.push(() => artIO.disconnect());
  let artFrame = 0;
  onTick((time) => { if (reduce || ++artFrame % 2) return; for (const a of arts) if (a.on) paintArt(a.cv, a.type, a.seed, time); });
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(paintAll, 200); };
  addEventListener('resize', onResize);
  disposers.push(() => removeEventListener('resize', onResize));

  // Light-path canvases (converging routes, radiating call-to-action backdrop)
  $$('canvas[data-fx]', main).forEach((cv) => {
    const fx = createNetwork(cv, { mode: cv.dataset.fx, rtl, animate: !reduce });
    disposers.push(() => fx.destroy());
  });

  // Isometric and 3D container scenes
  $$('canvas[data-iso]', main).forEach((cv) => {
    const sc = createIso(cv, { scene: cv.dataset.iso, animate: !reduce });
    disposers.push(() => sc.destroy());
  });

  // Cards lean towards the pointer
  if (fine && !reduce) {
    $$('.card .media', main).forEach((el) => {
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotationY: nx * 9, rotationX: -ny * 9, transformPerspective: 900, duration: 0.5, ease: 'power3.out' });
      };
      const leave = () => gsap.to(el, { rotationY: 0, rotationX: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      disposers.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.killTweensOf(el); });
    });
  }

  // Split paragraphs into words for the scrubbed reveal
  $$('[data-words]', main).forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      el.append(s, i < words.length - 1 ? ' ' : '');
    });
  });

  disposers.push(magnetic(main));

  // Intro (played once the loader or the transition has cleared)
  const intro = gsap.timeline({ paused: true });
  const introLines = $$('[data-intro] .line__in', main);
  const introFades = $$('[data-intro-fade]', main);
  if (introLines.length) intro.from(introLines, { yPercent: 118, duration: 1.3, ease: 'expo.out', stagger: 0.1 }, 0);
  if (introFades.length) intro.from(introFades, { opacity: 0, y: 26, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.35);

  const ctx = gsap.context(() => {
    /* Hero globe ------------------------------------------------ */
    const hero = $('.hero', main);
    if (hero) {
      const scene = createGlobe($('.hero__globe', hero), { host: hero, grab: $('.hero__grab', hero), rtl, lang: root.lang || 'en', animate: !reduce });
      disposers.push(() => scene.destroy());
      intro.add(() => scene.set({ on: 1 }), 0.05);          // the globe arrives with the headline
      const move = () => scene.set({ mx: pointer.x / innerWidth, my: pointer.y / innerHeight });
      addEventListener('pointermove', move, { passive: true });
      disposers.push(() => removeEventListener('pointermove', move));
      gsap.to($('.hero__content', hero), {
        yPercent: -18, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => scene.set({ scroll: s.progress }) },
      });
    }

    /* Clock ----------------------------------------------------- */
    const clock = $('[data-clock]', main);
    if (clock) {
      const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB'); };
      tick();
      const id = setInterval(tick, 1000);
      disposers.push(() => clearInterval(id));
    }

    /* Horizontal services --------------------------------------- */
    const hs = matchMedia('(min-width: 900px)').matches ? $('.hscroll', main) : null;
    const setupHscroll = () => {
      const track = $('.hscroll__track', hs), bar = $('.hscroll__bar i', hs);
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => (rtl ? dist() : -dist()), ease: 'none',
        scrollTrigger: {
          trigger: hs, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (s) => { if (bar) bar.style.transform = `scaleX(${s.progress})`; },
        },
      });
      $$('.card', hs).forEach((card) => {
        const inner = $('.media__in', card);
        if (inner) gsap.fromTo(inner, { xPercent: rtl ? 9 : -9 }, { xPercent: rtl ? -9 : 9, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: rtl ? 'right left' : 'left right', end: rtl ? 'left right' : 'right left', scrub: true } });
      });
    };

    /* Pinned container stack ------------------------------------ */
    const flow = $('.flow', main);
    const setupFlow = () => {
      const stack = createStack($('.flow__canvas', flow));
      disposers.push(() => stack.destroy());
      const steps = $$('.flow__step', flow), bar = $('.flow__bar i', flow);
      ScrollTrigger.create({
        trigger: flow, start: 'top top', end: '+=260%', pin: true,
        onUpdate: (s) => {
          stack.set(s.progress);
          const i = Math.min(steps.length - 1, Math.floor(s.progress * steps.length));
          steps.forEach((st, k) => st.classList.toggle('is-on', k === i));
          if (bar) bar.style.transform = `scaleX(${s.progress})`;
        },
      });
    };

    /* Pinned sections add scroll length, so they must be created in the
       order they appear on the page, and before anything that follows them. */
    [[hs, setupHscroll], [flow, setupFlow]]
      .filter(([el]) => el)
      .sort(([x], [y]) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .forEach(([, create]) => create());

    /* Generic scroll reveals ------------------------------------ */
    $$('[data-reveal="lines"]', main).forEach((el) => {
      gsap.from($$('.line__in', el), { yPercent: 118, duration: 1.2, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('[data-reveal="fade"]', main).forEach((el) => {
      gsap.from(el, { opacity: 0, y: 34, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    $$('.ico', main).forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => el.classList.add('is-in') });
    });
    $$('[data-reveal="media"]', main).forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      const inner = $('.media__in', el);
      if (inner) gsap.fromTo(inner, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-words]', main).forEach((el) => {
      gsap.fromTo(el.children, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true } });
    });

    /* Counters -------------------------------------------------- */
    $$('[data-count]', main).forEach((el) => {
      const o = { v: 0 }, end = Number(el.dataset.count);
      gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en'); } });
    });
  }, main);

  /* Industry list with a preview that trails the pointer --------- */
  const list = $('.ind__list', main), pv = $('.preview', main);
  if (list && pv && fine) {
    const cv = $('canvas', pv);
    const p = { x: pointer.x, y: pointer.y, r: 0 };
    onTick(() => {
      const dx = pointer.x - p.x;
      p.x += dx * 0.12; p.y += (pointer.y - p.y) * 0.12;
      p.r += (clamp(dx * 0.08, -14, 14) - p.r) * 0.15;
      pv.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(${rtl ? '-118%' : '18%'}, -58%) rotate(${p.r.toFixed(2)}deg)`;
    });
    $$('.ind__row', list).forEach((row, i) => {
      row.addEventListener('pointerenter', () => { paintArt(cv, row.dataset.art, i + 20); pv.classList.add('is-on'); });
    });
    list.addEventListener('pointerleave', () => pv.classList.remove('is-on'));
  }

  /* Marquee that reacts to scroll speed and direction ------------ */
  $$('.marquee__track', main).forEach((track) => {
    track.innerHTML += track.innerHTML;
    let x = 0, last = scrollY, vel = 0, dir = -1;
    onTick(() => {
      const y = scrollY, d = y - last; last = y;
      vel += (d - vel) * 0.1;
      if (Math.abs(d) > 0.5) dir = d > 0 ? -1 : 1;
      x += dir * (reduce ? 0 : 1.1 + Math.abs(vel) * 0.4);
      const half = track.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px, 0, 0) skewX(${clamp(vel * 0.25, -9, 9).toFixed(2)}deg)`;
    });
  });

  /* Contact form (demo only: connect it to your own backend) ------ */
  const form = $('.form', main);
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = $('.form__note', form);
      if (note) { note.textContent = form.dataset.note || 'Demo form — nothing was sent. Connect it to your backend.'; gsap.from(note, { opacity: 0, y: 10, duration: 0.6 }); }
    });
  }

  ScrollTrigger.sort();
  page = { ctx, disposers, intro };
}

function teardown() {
  if (!page) return;
  page.intro.kill();
  page.disposers.forEach((f) => f());
  page.ctx.revert();
  page = null;
}

/* ------------------------------------------------------------------
   Loader
------------------------------------------------------------------ */
function runLoader(ready) {
  const el = $('.loader');
  if (!el) return ready;
  return new Promise((resolve) => {
    const num = $('.loader__num i', el), o = { v: 0 };
    let fast = reduce;
    try { if (sessionStorage.getItem('kardan-fast')) { fast = true; sessionStorage.removeItem('kardan-fast'); } } catch (_) {}
    const span = fast ? 0.45 : 1.9;
    const count = gsap.timeline();
    count
      .from($$('.loader__word span', el), { yPercent: 110, duration: 0.7, ease: 'expo.out', stagger: 0.04 }, 0)
      .to(o, { v: 100, duration: span, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0)
      .to($('.loader__bar i', el), { scaleX: 1, duration: span, ease: 'power2.inOut' }, 0);
    Promise.all([count.then(), ready]).then(() => {
      gsap.timeline({ onComplete: () => el.remove() })
        .to($$('.loader__word span', el), { yPercent: -110, duration: 0.5, ease: 'power3.in', stagger: 0.03 }, 0)
        .to(num, { yPercent: -110, duration: 0.55, ease: 'power3.in' }, 0)
        .to($('.loader__bar', el), { opacity: 0, duration: 0.3 }, 0.3)
        .add(() => resolve(), 0.55)
        .to($$('.loader__panel', el), { scaleY: 0, duration: 1.1, ease: 'expo.inOut' }, 0.45);
    });
  });
}

/* ------------------------------------------------------------------
   Page transitions (fetch + swap <main>)
------------------------------------------------------------------ */
let busy = false;
const cols = () => $$('.transition i');
const tLabel = () => $('.transition__label span');

function cover(name) {
  tLabel().textContent = name || '';
  return gsap.timeline()
    .set(tLabel(), { visibility: 'visible', yPercent: 120 })
    .set(cols(), { transformOrigin: '50% 100%' })
    .to(cols(), { scaleY: 1, duration: 0.7, ease: 'expo.inOut', stagger: 0.06 })
    .fromTo(tLabel(), { yPercent: 120 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' }, 0.45)
    .then();
}

function uncover() {
  return gsap.timeline()
    .to(tLabel(), { yPercent: -120, duration: 0.45, ease: 'power3.in' }, 0.15)
    .set(cols(), { transformOrigin: '50% 0%' }, 0.5)
    .to(cols(), { scaleY: 0, duration: 0.8, ease: 'expo.inOut', stagger: 0.06 }, 0.5)
    .set(tLabel(), { visibility: 'hidden' })
    .then();
}

async function go(url, { push = true } = {}) {
  if (busy) return;
  busy = true;
  setMenu(false);
  lenis?.stop();
  try {
    const request = fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); });
    const guess = $(`[data-nav][href="${url.split('/').pop() || 'index.html'}"]`)?.dataset.nav;
    const [html] = await Promise.all([request, cover(guess)]);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const next = doc.querySelector('main');
    if (!next) throw new Error('no <main> in response');

    teardown();
    $('main').replaceWith(next);
    document.title = doc.title;
    if (push) history.pushState({}, '', url);
    setActiveNav();
    lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
    setup(next);
    ScrollTrigger.refresh();
    setTimeout(() => page?.intro.play(), 650);
    await uncover();
  } catch (err) {
    console.warn('[transition] falling back to a normal navigation', err);
    location.href = url;
    return;
  }
  lenis?.start();
  busy = false;
}

function initLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (a.hasAttribute('data-reload')) {
      // Language switch: a full page load, with a shortened loader on arrival.
      try { sessionStorage.setItem('kardan-fast', '1'); } catch (_) {}
      return;
    }
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    if (url.pathname === location.pathname) { lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }); setMenu(false); return; }
    go(url.pathname + url.search);
  });
  addEventListener('popstate', () => go(location.pathname + location.search, { push: false }));
}

/* ------------------------------------------------------------------
   Boot
------------------------------------------------------------------ */
async function boot() {
  history.scrollRestoration = 'manual';
  initCursor();
  initNav();
  initButtons();
  initLinks();
  setActiveNav();
  magnetic($('.nav'));
  lenis?.stop();

  const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  const ready = fonts.then(() => {
    setup($('main'));
    const mark = $('.footer__mark');
    if (mark) createWordmark(mark, { text: mark.dataset.text, src: mark.dataset.src, animate: !reduce });
    ScrollTrigger.refresh();
  });

  await runLoader(ready);
  lenis?.start();
  page?.intro.play();
}

boot();
