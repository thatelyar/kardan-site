// Generates every page in both languages from content.mjs.
//   node _src/build.mjs
// English pages land in the site root, Persian pages in /fa.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from './content.mjs';
import { icon } from './icons.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const VERSION = Date.now().toString(36);   // cache-busts the stylesheet and script on every build

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hl = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, '<span class="accent">$1</span>');

function page(lang) {
  const rtl = lang === 'fa';
  const base = rtl ? '../' : '';
  const t = (v) => (v && typeof v === 'object' && 'fa' in v ? v[lang] : v);
  const num = (n) => { const s = String(n).padStart(2, '0'); return rtl ? s.replace(/\d/g, (d) => FA_DIGITS[d]) : s; };
  const arrow = `<span class="btn__arrow">${rtl ? '←' : '→'}</span>`;
  const tag = (n, label) => `( ${num(n)} ) ${esc(t(label))}`;
  const lines = (arr) => t(arr).map((l) => `<span class="line"><span class="line__in">${hl(l)}</span></span>`).join('\n          ');
  const btn = (label, href, cls = '') => `<a class="btn ${cls}" href="${href}" data-magnetic>${esc(t(label))} ${arrow}</a>`;

  /* ---------------------------------------------------------------- blocks */
  const shead = (n, label, heading, lead, intro) => `
    <section class="shead">
      <p class="mono muted" data-reveal="fade">${tag(n, label)}</p>
      <div class="shead__body">
        <h2 class="h2" data-reveal="lines">
          ${lines(heading)}
        </h2>
        ${lead ? `<p class="shead__lead" data-reveal="fade">${esc(t(lead))}</p>` : ''}
        ${intro ? `<p data-reveal="fade">${esc(t(intro))}</p>` : ''}
      </div>
    </section>`;

  const statement = (n, label, text, more) => `
    <section class="statement">
      <p class="mono muted" data-reveal="fade">${tag(n, label)}</p>
      <div>
        <p class="statement__text" data-words>${esc(t(text))}</p>
        ${more ? `<p class="statement__more" data-reveal="fade">${esc(t(more))}</p>` : ''}
      </div>
    </section>`;

  const cells = (items, cls = '') => `
    <section class="stats ${cls}">
      ${items.map((it, i) => `<div class="stat" data-reveal="fade">${it.ico ? icon(it.ico) : ''}<span class="mono muted">${num(i + 1)}</span><h3 class="h3">${esc(t(it.t ?? it))}</h3>${it.d ? `<p>${esc(t(it.d))}</p>` : ''}</div>`).join('\n      ')}
    </section>`;

  const ARTS = ['contour', 'air', 'road', 'customs', 'boxes', 'rail', 'ocean'];
  const rows = (items, { href = '', foot = '', compact = true, preview = true } = {}) => `
    <section class="ind ${compact ? 'ind--compact' : ''} ${items.some((it) => it.ico) ? 'ind--ico' : ''}">
      <div class="ind__list">
        ${items.map((it, i) => {
          const el = href ? 'a' : 'div';
          const art = it.art || ARTS[i % ARTS.length];
          return `<${el} class="ind__row"${href ? ` href="${href}"` : ''} data-art="${art}"><span class="ind__lead"><span class="mono muted">${num(i + 1)}</span>${it.ico ? icon(it.ico) : ''}</span><span class="ind__name">${esc(t(it.name ?? it))}</span>${it.desc ? `<span class="ind__desc">${esc(t(it.desc))}</span>` : '<span></span>'}</${el}>`;
        }).join('\n        ')}
      </div>
      ${foot}
      ${preview ? '<div class="preview" aria-hidden="true"><div class="preview__in"><canvas></canvas></div></div>' : ''}
    </section>`;

  const phero = (p, long = false) => `
    <section class="phero">
      <p class="hero__eyebrow mono" data-intro-fade>${esc(t(p.eyebrow))}</p>
      <h1 class="display${long ? ' display--long' : ''}" data-intro>
          ${lines(p.lines)}
      </h1>
      <div class="phero__foot">
        <p data-intro-fade>${esc(t(p.sub))}</p>
        <p class="mono muted" data-intro-fade>${esc(t(p.aside))}</p>
      </div>
    </section>`;

  const cta = (n, label, heading, button, href = 'contact.html', headingClass = 'display') => `
    <section class="cta">
      <canvas class="cta__fx" data-fx="radiate"></canvas>
      <p class="mono muted" data-reveal="fade">${tag(n, label)}</p>
      <h2 class="${headingClass}" data-reveal="lines">
          ${lines(heading)}
      </h2>
      <div data-reveal="fade">${btn(button, href, 'btn--solid')}</div>
    </section>`;

  const marquee = (items) => `
    <section class="marquee" aria-hidden="true">
      <div class="marquee__track">${items.map((c) => `<span>${esc(t(c))}</span>`).join('')}</div>
    </section>`;

  /* ----------------------------------------------------------------- pages */
  const H = C.home;
  const home = `
    <section class="hero">
      <canvas class="hero__globe"></canvas>
      <div class="hero__grab"></div>
      <div class="hero__shade"></div>
      <div class="hero__content">
        <p class="hero__eyebrow mono" data-intro-fade>${esc(t(C.ui.tagline))}</p>
        <h1 class="display display--long" data-intro>
          ${lines(H.hero.lines)}
        </h1>
        <div class="hero__foot">
          <p class="hero__sub" data-intro-fade>${esc(t(H.hero.sub))}</p>
          <div class="hero__actions" data-intro-fade>
            ${btn(C.ui.cta, 'contact.html', 'btn--solid')}
            <a class="btn" href="about.html" data-magnetic>${esc(t(H.hero.secondary))}</a>
          </div>
          <div class="hero__scroll mono" data-intro-fade><i></i>${esc(t(C.ui.scroll))}</div>
        </div>
      </div>
    </section>
${statement(1, H.talk.label, H.talk.statement, H.talk.more)}
${cells(H.talk.cards)}
    <section class="viz" data-reveal="media">
      <canvas data-fx="converge"></canvas>
      <p class="viz__cap mono">${esc(t(C.ui.vizCap))}</p>
    </section>
${shead(2, H.domains.label, H.domains.lines, H.domains.lead, H.domains.intro)}
${rows(C.domains, { href: 'domains.html', foot: `<div class="ind__foot" data-reveal="fade"><p class="h3">${esc(t(H.domains.foot))}</p>${btn(H.domains.button, 'contact.html')}</div>` })}

    <section class="flow">
      <div class="flow__left">
        <p class="mono muted">${tag(3, H.flow.label)}</p>
        <p class="flow__sub">${esc(t(H.flow.sub))}</p>
        <div class="flow__steps">
          ${H.flow.steps.map((s, i, a) => `<div class="flow__step${i === 0 ? ' is-on' : ''}"><div class="flow__num">${num(i + 1)}</div><h3 class="h3">${esc(t(s.t))}</h3><p>${esc(t(s.d))}</p>${i === a.length - 1 ? btn(C.ui.start, 'contact.html') : ''}</div>`).join('\n          ')}
        </div>
        <div class="flow__bar"><i></i></div>
      </div>
      <canvas class="flow__canvas"></canvas>
    </section>

    <section class="hscroll">
      <div class="hscroll__track">
        <div class="hscroll__intro">
          <p class="mono muted">${tag(4, H.why.label)}</p>
          <h2 class="h2" data-reveal="lines">
            ${lines(H.why.lines)}
          </h2>
          <p>${esc(t(H.why.sub))}</p>
        </div>
        ${H.why.pillars.map((p, i) => `<div class="card">
          <div class="media media--x" data-art="${p.art}"><span class="media__tag mono">${num(i + 1)}</span><div class="media__in"></div></div>
          <div class="card__row"><h3 class="h3 card__title">${esc(t(p.t))}</h3></div>
          <p>${esc(t(p.d))}</p>
        </div>`).join('\n        ')}
        <div class="hscroll__end">
          <p class="h3">${esc(t(H.why.summary))}</p>
          ${btn(H.why.button, 'contact.html')}
        </div>
      </div>
      <div class="hscroll__bar"><i></i></div>
    </section>
${shead(5, H.cases.label, H.cases.lines, H.cases.lead)}
    <section class="case" id="cases">
      <div class="case__meta" data-reveal="fade">
        <span class="mono muted">${esc(t(H.cases.sampleLabel))}</span>
        <h3 class="h3">${esc(t(H.cases.field))}</h3>
      </div>
      <ul class="deflist">
        ${H.cases.rows.map(([k, v]) => `<li data-reveal="fade"><span class="mono muted">${esc(t(k))}</span><p>${esc(t(v))}</p></li>`).join('\n        ')}
      </ul>
    </section>
${shead(6, H.insights.label, H.insights.lines, H.insights.lead)}
${marquee(C.categories)}
${rows(C.articles.map((a) => ({ name: a.title, desc: a.cat })), { href: 'insights.html', preview: false, foot: `<div class="ind__foot" data-reveal="fade"><span></span>${btn(H.insights.button, 'insights.html')}</div>` }).replace('class="ind ind--compact"', 'class="ind ind--compact" style="padding-top:clamp(40px,8vh,90px)"')}
${shead(7, H.contact.label, H.contact.lines, H.contact.lead)}
${cells(H.contact.cards)}
    <section class="cta">
      <canvas class="cta__fx" data-fx="radiate"></canvas>
      <p class="cta__q" data-words>${esc(t(C.question))}</p>
      <div data-reveal="fade">${btn(C.ui.start, 'contact.html', 'btn--solid')}</div>
    </section>`;

  const S = C.solutions;
  const solutions = `${phero(S)}
    <div class="media strip" data-art="contour" data-reveal="media"><div class="media__in"></div></div>
${shead(1, S.map.label, S.map.lines, S.map.lead)}
${rows(S.stages.map((s) => ({ name: s })))}
${statement(2, S.problem.label, S.problem.statement, S.problem.more)}
${cta(3, C.ui.cta, S.cta.lines, C.ui.start)}`;

  const D = C.domainsPage;
  const domains = `${phero({ ...D, sub: C.home.domains.lead }, false)}
${statement(1, D.eyebrow, C.home.domains.intro)}
    <section class="svc" style="padding-top:0">
      ${C.domains.map((d, i) => `<article class="svc__row">
        <div class="media" data-art="${d.art}" data-reveal="media"><span class="media__tag mono">${num(i + 1)}</span><div class="media__in"></div></div>
        <div class="svc__body">
          ${icon(d.ico)}
          <h2 class="h2 h2--sm" data-reveal="fade">${esc(t(d.name))}</h2>
          <p data-reveal="fade">${esc(t(d.desc))}</p>
        </div>
      </article>`).join('\n      ')}
    </section>
${cta(2, C.ui.cta, D.cta.lines, C.home.domains.button, 'contact.html', 'display display--long')}`;

  const A = C.about;
  const about = `${phero(A)}
    <div class="media strip" data-art="air" data-reveal="media"><div class="media__in"></div></div>
${statement(1, A.story.label, A.story.statement, A.story.more)}
${shead(2, A.philosophy.label, L2(['فلسفه', '[[کاردان]]'], ['Kardan’s', '[[philosophy]]']))}
${cells(A.philosophy.items, 'stats--3')}
${shead(3, A.values.label, A.values.lines)}
${rows(A.values.items.map((v) => ({ name: v })), { preview: false, compact: false })}
${shead(4, A.thinking.label, L2(['روش', '[[فکر کردن]]'], ['How we', '[[think]]']), A.thinking.lead)}
${cells(A.thinking.steps)}
${shead(5, A.future.label, L2(['مسیر', '[[آینده]]'], ['The road', '[[ahead]]']), A.future.lead)}
${rows(A.future.items.map((v) => ({ name: v })), { preview: false })}
${cta(6, C.ui.cta, A.cta.lines, C.ui.start, 'contact.html', 'h2')}`;

  const I = C.insights;
  const insights = `${phero(I, true)}
    <div class="media strip" data-art="ocean" data-reveal="media"><div class="media__in"></div></div>
${shead(1, I.topics.label, I.topics.lines)}
${rows(C.categories.map((c) => ({ name: c })))}
${shead(2, I.selected.label, I.selected.lines)}
${rows(C.articles.map((a) => ({ name: a.title, desc: a.cat })), { preview: false })}
${shead(3, I.principles.label, L2(['اصول', '[[تولید محتوا]]'], ['Editorial', '[[principles]]']))}
${cells(I.principles.items, 'stats--3')}
    <section class="cta">
      <canvas class="cta__fx" data-fx="radiate"></canvas>
      <p class="cta__q" data-words>${esc(t(I.subscribe.text))}</p>
      <div data-reveal="fade">${btn(I.subscribe.button, 'contact.html', 'btn--solid')}</div>
    </section>`;

  const K = C.contact;
  const field = (id, label, type = 'text', auto = '') => `<div class="field" data-reveal="fade"><input id="f-${id}" name="${id}" type="${type}" placeholder=" "${auto ? ` autocomplete="${auto}"` : ''}><label for="f-${id}">${esc(t(label))}</label></div>`;
  const contact = `${phero(K)}
    <section class="contact">
      <form class="form" novalidate data-note="${esc(t(C.ui.formNote))}">
        ${field('name', K.fields.name, 'text', 'name')}
        ${field('company', K.fields.company, 'text', 'organization')}
        ${field('reach', K.fields.reach)}
        ${field('subject', K.fields.subject)}
        <div class="field" data-reveal="fade"><textarea id="f-project" name="project" rows="2" placeholder=" "></textarea><label for="f-project">${esc(t(K.fields.project))}</label></div>
        <div class="field field--q" data-reveal="fade"><label for="f-question">${esc(t(C.question))}</label><textarea id="f-question" name="question" rows="4" placeholder=" "></textarea></div>
        <div data-reveal="fade"><button class="btn btn--solid" type="submit" data-magnetic>${esc(t(C.ui.start))} ${arrow}</button></div>
        <p class="form__note mono" role="status"></p>
      </form>
      <aside class="contact__side">
        <div class="media" data-art="contour" data-reveal="media"><div class="media__in"></div></div>
        ${K.methods.map((m) => `<div class="contact__item" data-reveal="fade"><span class="mono muted">${esc(t(m.t))}</span>${m.v ? `<strong dir="ltr">${esc(m.v)}</strong>` : ''}<p>${esc(t(m.d))}</p></div>`).join('\n        ')}
        <div class="contact__item" data-reveal="fade"><span class="mono muted">${esc(t(C.ui.address))}</span><p>—</p></div>
      </aside>
    </section>`;

  function L2(fa, en) { return { fa, en }; }

  const pages = {
    'index.html': { meta: H, main: home, id: 'home' },
    'solutions.html': { meta: S, main: solutions, id: 'solutions' },
    'domains.html': { meta: D, main: domains, id: 'domains' },
    'about.html': { meta: A, main: about, id: 'about' },
    'insights.html': { meta: I, main: insights, id: 'insights' },
    'contact.html': { meta: K, main: contact, id: 'contact' },
  };

  /* ----------------------------------------------------------------- shell */
  const fonts = rtl
    ? 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300..900&family=JetBrains+Mono:wght@400;500&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=JetBrains+Mono:wght@400;500&display=swap';

  const langSwitch = (file) => rtl
    ? `<div class="lang mono"><a href="../${file}" data-reload hreflang="en" lang="en" aria-label="English">EN</a><i>/</i><a class="is-active" aria-current="true">FA</a></div>`
    : `<div class="lang mono"><a class="is-active" aria-current="true">EN</a><i>/</i><a href="fa/${file}" data-reload hreflang="fa" lang="fa" aria-label="فارسی">FA</a></div>`;

  const shell = (file, p) => `<!doctype html>
<html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(t(p.meta.title))}</title>
  <meta name="description" content="${esc(t(p.meta.desc))}">
  <link rel="alternate" hreflang="en" href="${rtl ? '../' : ''}${file}">
  <link rel="alternate" hreflang="fa" href="${rtl ? '' : 'fa/'}${file}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fonts}" rel="stylesheet">
  <link rel="icon" href="${base}img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}css/style.css?v=${VERSION}">
</head>
<body>

  <div class="loader" aria-hidden="true">
    <div class="loader__panel"></div><div class="loader__panel"></div>
    <div class="loader__bar"><i></i></div>
    <div class="loader__word"><span><img src="${base}img/kardan-logo.svg" alt=""></span></div>
    <div class="loader__num" dir="ltr"><i>000</i></div>
  </div>
  <div class="transition" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><div class="transition__label"><span></span></div></div>
  <div class="cursor" aria-hidden="true"><div class="cursor__ring"><span class="cursor__label"></span></div><div class="cursor__dot"></div></div>
  <div class="progress" aria-hidden="true"><i></i></div>
  <div class="grain" aria-hidden="true"></div>

  <header class="nav">
    <a class="nav__logo" href="index.html" data-magnetic aria-label="${esc(t(C.brand))} — ${esc(t(C.ui.home))}"><img class="nav__mark" src="${base}img/kardan-mark.svg" alt=""><img class="nav__word" src="${base}img/kardan-word.svg" alt="Kardan"></a>
    <nav class="nav__links mono">
      ${C.nav.map((n) => `<a href="${n.file}" data-nav="${esc(t(n.label))}"><span class="roll"><span data-text="${esc(t(n.label))}">${esc(t(n.label))}</span></span></a>`).join('\n      ')}
    </nav>
    <div class="nav__side">
      ${langSwitch(file)}
      <a class="btn btn--sm nav__cta" href="contact.html" data-magnetic>${esc(t(C.ui.cta))}</a>
      <button class="nav__toggle mono" aria-expanded="false" aria-controls="menu" data-open="${esc(t(C.ui.menu))}" data-close="${esc(t(C.ui.close))}"><span class="roll"><span data-text="${esc(t(C.ui.close))}">${esc(t(C.ui.menu))}</span></span></button>
    </div>
  </header>
  <div class="menu" id="menu">
    ${C.nav.map((n, i) => `<a href="${n.file}" data-nav="${esc(t(n.label))}" style="--i:${i}"><span>${esc(t(n.label))}</span></a>`).join('\n    ')}
    <div class="menu__foot">
      ${langSwitch(file)}
      <a class="btn btn--sm" href="contact.html">${esc(t(C.ui.cta))}</a>
    </div>
  </div>

  <main data-page="${p.id}">
${p.main}

  </main>

  <footer class="footer">
    <div class="footer__top">
      <div class="footer__col">
        <p class="h3">${esc(t(C.ui.closing))}</p>
        <span class="muted">${esc(t(C.ui.tagline))}</span>
      </div>
      <div class="footer__col mono">
        <span class="muted">${esc(t(C.ui.quick))}</span>
        ${C.nav.map((n) => `<a href="${n.file}"><span class="roll"><span data-text="${esc(t(n.label))}">${esc(t(n.label))}</span></span></a>`).join('\n        ')}
      </div>
      <div class="footer__col mono">
        <span class="muted">${esc(t(C.ui.contactInfo))}</span>
        <a href="mailto:hello@example.com" dir="ltr"><span class="roll"><span data-text="hello@example.com">hello@example.com</span></span></a>
        <span dir="ltr">+00 000 000 000</span>
        <span>${esc(t(C.ui.address))}</span>
      </div>
      <div class="footer__col">
        <span class="mono muted">${esc(t(C.ui.latest))}</span>
        ${C.articles.map((a) => `<a href="insights.html">${esc(t(a.title))}</a>`).join('\n        ')}
      </div>
    </div>
    <canvas class="footer__mark" data-src="${base}img/kardan-logo.svg" data-text="KARDAN" role="img" aria-label="Kardan"></canvas>
    <div class="footer__bottom mono">
      <span>© ${rtl ? '۲۰۲۶' : '2026'} ${esc(t(C.brand))}</span>
      <span>${esc(t(C.ui.hint))}</span>
    </div>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
  <script type="module" src="${base}js/app.js?v=${VERSION}"></script>
</body>
</html>
`;

  const outDir = rtl ? join(ROOT, 'fa') : ROOT;
  mkdirSync(outDir, { recursive: true });
  for (const [file, p] of Object.entries(pages)) {
    writeFileSync(join(outDir, file), shell(file, p));
  }
  return Object.keys(pages).length;
}

const n = page('en') + page('fa');
console.log(`built ${n} pages`);
