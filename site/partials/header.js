'use strict';

const icons = require('./icons');
const { SITE, CONTACTS, SECTIONS } = require('./data');

/**
 * Шапка сайта — одна на всех страницах.
 *
 * Две строки, как принято на промышленных сайтах:
 *   1) светлая — логотип, адрес, телефон и кнопка заявки;
 *   2) синяя — основное меню; разделы каталога раскрываются мегаменю.
 * На мобильных вторая строка скрывается, меню уходит в бургер.
 *
 * @param {string} activeKey - ключ активного раздела ('home' | 'engineering' | ... | 'contacts')
 */
function header(activeKey = '') {
  const isActive = (key) => (key === activeKey ? ' is-active' : '');

  const catalogNav = SECTIONS.map((section) => {
    const links = section.items
      .map((item) => `<a class="mega__link" href="/${section.slug}/${item.slug}/">${item.title}</a>`)
      .join('\n              ');

    return `<div class="nav-item has-mega">
            <a class="nav-link${isActive(section.key)}" href="/${section.slug}/">${section.label} ${icons.chevronDown}</a>
            <div class="mega">
              <div class="mega__inner">
                <a class="mega__head" href="/${section.slug}/">
                  <span class="mega__kicker">${section.kicker}</span>
                  <span class="mega__title">${section.title}</span>
                  <span class="mega__all">Все услуги раздела ${icons.arrowRight}</span>
                </a>
                <div class="mega__links">
              ${links}
                </div>
              </div>
            </div>
          </div>`;
  }).join('\n          ');

  return `<header class="header" data-header>
    <div class="header__main">
      <div class="container header__main-inner">
        <a class="logo" href="/" aria-label="${SITE.name} — на главную">
          <img src="/images/logo/logo.png" width="1036" height="241" alt="${SITE.name}" />
        </a>

        <span class="header__slogan">${SITE.tagline}</span>

        <div class="header__info">
          <span class="header__addr">${icons.pin}<span>${CONTACTS.addressShort}</span></span>
          <a class="header__mail" href="${CONTACTS.emailHref}">${icons.mail}<span>${CONTACTS.email}</span></a>
        </div>

        <div class="header__actions">
          <a class="header__phone" href="${CONTACTS.phoneHref}">${icons.phone}<span>${CONTACTS.phone}</span></a>
          <a class="btn btn--outline btn--sm" href="#lead">Обсудить задачу</a>
          <button type="button" class="burger" data-nav-toggle aria-label="Меню" aria-expanded="false" aria-controls="mobile-nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>

    <div class="header__bar">
      <div class="container">
        <nav class="nav" aria-label="Основная навигация">
          ${catalogNav}
          <div class="nav-item">
            <a class="nav-link${isActive('about')}" href="/about/">О компании</a>
          </div>
          <div class="nav-item">
            <a class="nav-link${isActive('contacts')}" href="/contacts/">Контакты</a>
          </div>
        </nav>
      </div>
    </div>
  </header>`;
}

module.exports = header;
