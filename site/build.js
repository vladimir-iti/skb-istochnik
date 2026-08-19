#!/usr/bin/env node
'use strict';

/**
 * Статический сборщик сайта СКБ «Источник».
 *
 * Без фреймворков и зависимостей. Берёт шаблоны из pages/, подставляет общие
 * partial'ы (шапка, подвал, мобильное меню, блок заявки) и данные из
 * partials/data.js, копирует статику и пишет готовый сайт в dist/ —
 * обычный набор HTML/CSS/JS для загрузки на любой хостинг.
 *
 *   node build.js          — собрать
 *   node build.js --serve  — собрать и поднять локальный сервер на :4173
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const PAGES_DIR = path.join(ROOT, 'pages');
const DIST = path.join(ROOT, 'dist');

const header = require('./partials/header');
const footer = require('./partials/footer');
const mobileNav = require('./partials/mobileNav');
const leadBlock = require('./partials/leadBlock');
const icons = require('./partials/icons');
const { SITE, CONTACTS, SECTIONS, ALL_ITEMS } = require('./partials/data');

const renderSection = require('./templates/section');
const renderItem = require('./templates/item');
const blocks = require('./templates/blocks');

// ---------------------------------------------------------------------------
// Список страниц: обычные (свой файл в pages/) + генерируемые по шаблону.
// ---------------------------------------------------------------------------

/** @type {{out: string, file?: string, html?: string, title: string, description: string, active: string}[]} */
const PAGES = [
  {
    out: 'index.html',
    file: 'index.html',
    active: 'home',
    title: `${SITE.nameFull} — инжиниринг, металлообработка и автоматизация в Ростове-на-Дону`,
    description:
      'СКБ «Источник» — проектирование, 3D-сканирование и моделирование, металлообработка, ' +
      'производство защитных ограждений и промышленная автоматизация. Полный цикл от чертежа до готового изделия.',
  },
  {
    out: 'about/index.html',
    file: 'about.html',
    active: 'about',
    title: `О компании — ${SITE.name}`,
    description:
      'СКБ «Источник» — команда инженеров-конструкторов и технологов. Проектируем, изготавливаем ' +
      'и внедряем инженерные решения для промышленных предприятий.',
  },
  {
    out: 'contacts/index.html',
    file: 'contacts.html',
    active: 'contacts',
    title: `Контакты — ${SITE.name}`,
    description: `Телефоны, почта и адрес СКБ «Источник»: ${CONTACTS.address}.`,
  },
  {
    out: 'policy/index.html',
    file: 'policy.html',
    active: '',
    title: `Политика конфиденциальности — ${SITE.name}`,
    description: 'Политика обработки персональных данных на сайте СКБ «Источник».',
  },
];

// Страницы разделов и позиций собираются из одних и тех же шаблонов.
for (const section of SECTIONS) {
  PAGES.push({
    out: `${section.slug}/index.html`,
    html: renderSection(section),
    active: section.key,
    title: `${section.title} — ${SITE.name}`,
    description: section.lead,
  });

  for (const item of section.items) {
    PAGES.push({
      out: `${section.slug}/${item.slug}/index.html`,
      html: renderItem(section, item),
      active: section.key,
      title: `${item.title} — ${SITE.name}`,
      description: item.short,
    });
  }
}

// ---------------------------------------------------------------------------
// Шаблон документа
// ---------------------------------------------------------------------------

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  legalName: SITE.nameFull,
  url: SITE.origin,
  logo: `${SITE.origin}/images/logo/logo.png`,
  telephone: CONTACTS.phone,
  email: CONTACTS.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Каширская, зд. 5',
    addressLocality: 'Ростов-на-Дону',
    addressCountry: 'RU',
  },
};

function document(page, body) {
  const canonical = `${SITE.origin}/${page.out.replace(/index\.html$/, '')}`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${page.title}</title>
<meta name="description" content="${page.description}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${page.title}" />
<meta property="og:description" content="${page.description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE.origin}/images/logo/logo.png" />
<meta property="og:locale" content="ru_RU" />
<meta name="theme-color" content="#04295A" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preload" href="/css/tokens.css" as="style" />
<link rel="stylesheet" href="/css/tokens.css" />
<link rel="stylesheet" href="/css/base.css" />
<link rel="stylesheet" href="/css/components.css" />
<link rel="stylesheet" href="/css/header-footer.css" />
<link rel="stylesheet" href="/css/pages.css" />
<script type="application/ld+json">${JSON.stringify(ORG_SCHEMA)}</script>
</head>
<body>
<a class="skip-link" href="#main">К основному содержанию</a>
${header(page.active)}
${mobileNav()}
<main id="main">
${body}
</main>
${footer()}
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Сборка
// ---------------------------------------------------------------------------

/** Токены, которые можно писать прямо в HTML-шаблонах страниц. */
const TOKENS = {
  '{{LEAD}}': () => leadBlock(),
  '{{DIRECTIONS}}': () => blocks.directions(),
  '{{PROCESS}}': () => blocks.process(),
  '{{INDUSTRIES}}': () => blocks.industries(),
  '{{ADVANTAGES}}': () => blocks.advantages(),
  '{{PRODUCTION}}': () => blocks.production(),
  '{{FEATURED}}': () => blocks.featured(),
  '{{ICON_ARROW}}': () => icons.arrowRight,
  '{{ICON_ARROW_UP}}': () => icons.arrowUpRight,
  '{{ICON_CHECK}}': () => icons.check,
  '{{ICON_PHONE}}': () => icons.phone,
  '{{ICON_MAIL}}': () => icons.mail,
  '{{ICON_PIN}}': () => icons.pin,
  '{{ICON_CLOCK}}': () => icons.clock,
  '{{PHONE}}': () => CONTACTS.phone,
  '{{PHONE_HREF}}': () => CONTACTS.phoneHref,
  '{{PHONE2}}': () => CONTACTS.phoneSecond,
  '{{PHONE2_HREF}}': () => CONTACTS.phoneSecondHref,
  '{{EMAIL}}': () => CONTACTS.email,
  '{{EMAIL_HREF}}': () => CONTACTS.emailHref,
  '{{ADDRESS}}': () => CONTACTS.address,
  '{{HOURS}}': () => CONTACTS.hours,
};

function applyTokens(html) {
  let out = html;
  for (const [token, value] of Object.entries(TOKENS)) {
    if (out.includes(token)) out = out.split(token).join(value());
  }
  return out;
}

function rmrf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function writeFile(relative, content) {
  const target = path.join(DIST, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function buildSitemap() {
  const urls = PAGES.map((p) => `${SITE.origin}/${p.out.replace(/index\.html$/, '')}`);
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    '\n</urlset>\n'
  );
}

function build() {
  const started = Date.now();
  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  for (const dir of ['css', 'js', 'images', 'fonts']) {
    copyDir(path.join(SRC, dir), path.join(DIST, dir));
  }

  for (const page of PAGES) {
    const raw = page.html !== undefined ? page.html : fs.readFileSync(path.join(PAGES_DIR, page.file), 'utf8');
    writeFile(page.out, document(page, applyTokens(raw)));
  }

  writeFile('sitemap.xml', buildSitemap());
  writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE.origin}/sitemap.xml\n`);
  writeFile(
    'favicon.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#04295A"/>` +
      `<g fill="none" stroke="#fff" stroke-width="1.6"><circle cx="16" cy="16" r="9"/>` +
      `<ellipse cx="16" cy="16" rx="9" ry="3.6"/><ellipse cx="16" cy="16" rx="9" ry="3.6" transform="rotate(60 16 16)"/>` +
      `<ellipse cx="16" cy="16" rx="9" ry="3.6" transform="rotate(-60 16 16)"/></g><circle cx="16" cy="16" r="2.4" fill="#fff"/></svg>`
  );

  console.log(`✓ Сборка готова: ${PAGES.length} страниц, ${ALL_ITEMS.length} позиций каталога, ${Date.now() - started} мс`);
  console.log(`  → ${DIST}`);
}

function serve(port = 4173) {
  const http = require('http');
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.xml': 'application/xml',
    '.txt': 'text/plain; charset=utf-8',
  };

  http
    .createServer((req, res) => {
      let rel = decodeURIComponent(req.url.split('?')[0]);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(DIST, rel);
      if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404</h1>');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    })
    .listen(port, () => console.log(`  → http://localhost:${port}`));
}

build();
if (process.argv.includes('--serve')) serve();
