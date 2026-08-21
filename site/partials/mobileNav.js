'use strict';

const icons = require('./icons');
const { CONTACTS, SECTIONS } = require('./data');

/** Мобильное меню: разделы раскрываются в аккордеон, чтобы список не был бесконечным. */
function mobileNav() {
  const groups = SECTIONS.map(
    (section) => `<div class="mnav__group">
        <button type="button" class="mnav__group-head" aria-expanded="false">
          <span>${section.label}</span>${icons.chevronDown}
        </button>
        <div class="mnav__group-body">
          <a class="mnav__link mnav__link--all" href="/${section.slug}/">Все услуги раздела</a>
          ${section.items.map((i) => `<a class="mnav__link" href="${i.href}">${i.title}</a>`).join('\n          ')}
        </div>
      </div>`
  ).join('\n      ');

  return `<div class="mnav" id="mobile-nav" data-mobile-nav hidden>
    <div class="mnav__inner">
      ${groups}
      <a class="mnav__link mnav__link--top" href="/about/">О компании</a>
      <a class="mnav__link mnav__link--top" href="/contacts/">Контакты</a>

      <div class="mnav__contacts">
        <a href="${CONTACTS.phoneHref}">${icons.phone}<span>${CONTACTS.phone}</span></a>
        <a href="${CONTACTS.emailHref}">${icons.mail}<span>${CONTACTS.email}</span></a>
      </div>
      <a class="btn btn--primary btn--block" href="#lead">Обсудить задачу</a>
    </div>
  </div>`;
}

module.exports = mobileNav;
