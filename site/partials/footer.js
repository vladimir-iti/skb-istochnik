'use strict';

const icons = require('./icons');
const { SITE, CONTACTS, SECTIONS } = require('./data');

/** Подвал сайта: карта разделов, контакты и правовая строка. */
function footer() {
  const year = new Date().getFullYear();

  const columns = SECTIONS.map(
    (section) => `<div class="footer__col">
          <a class="footer__col-title" href="/${section.slug}/">${section.label}</a>
          <ul class="footer__list">
            ${section.items
              .slice(0, 6)
              .map((i) => `<li><a href="/${section.slug}/${i.slug}/">${i.title}</a></li>`)
              .join('\n            ')}
          </ul>
        </div>`
  ).join('\n        ');

  return `<footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="logo logo--footer" href="/" aria-label="${SITE.name} — на главную">
            <img src="/images/logo/logo.png" width="1036" height="241" alt="${SITE.name}" />
          </a>
          <p class="footer__about">${SITE.tagline}. Проектируем, изготавливаем и внедряем решения полного цикла.</p>
          <ul class="footer__contacts">
            <li><a href="${CONTACTS.phoneHref}">${icons.phone}<span>${CONTACTS.phone}</span></a></li>
            <li><a href="${CONTACTS.phoneSecondHref}">${icons.phone}<span>${CONTACTS.phoneSecond}</span></a></li>
            <li><a href="${CONTACTS.emailHref}">${icons.mail}<span>${CONTACTS.email}</span></a></li>
            <li>${icons.pin}<span>${CONTACTS.address}</span></li>
            <li>${icons.clock}<span>${CONTACTS.hours}</span></li>
          </ul>
        </div>

        <nav class="footer__nav" aria-label="Карта сайта">
        ${columns}
          <div class="footer__col">
            <span class="footer__col-title">Компания</span>
            <ul class="footer__list">
              <li><a href="/about/">О компании</a></li>
              <li><a href="/contacts/">Контакты</a></li>
              <li><a href="/policy/">Политика конфиденциальности</a></li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <span>© ${year} ${SITE.nameFull}</span>
        <a href="/policy/">Политика конфиденциальности</a>
      </div>
    </div>
  </footer>`;
}

module.exports = footer;
