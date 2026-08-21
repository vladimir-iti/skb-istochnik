'use strict';

const icons = require('../partials/icons');
const leadBlock = require('../partials/leadBlock');
const { SECTIONS } = require('../partials/data');

/**
 * Раздел «Автоматизация» — единственный раздел каталога, собранный на одной
 * странице целиком, а не на странице-списке с 4 отдельными URL услуг.
 * Причина: 4 услуги маленькие и близкие по смыслу, отдельные страницы под
 * каждую только дробили путь пользователя. Здесь все услуги идут подряд
 * с якорями (#slug); в шапке, подвале и мобильном меню ссылки на них ведут
 * на якоря этой же страницы — см. item.href в partials/data.js.
 *
 * @param {object} section - элемент SECTIONS с key === 'automation'
 */
function renderAutomationPage(section) {
  const quickNav = section.items
    .map(
      (item, i) => `<a class="card card--media reveal" href="#${item.slug}" style="--i:${i}">
          <div class="card__media"><img src="${item.image}" alt="${item.title}" loading="lazy" /></div>
          <div class="card__body">
            <span class="card__num">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="card__title">${item.title}</h3>
            <p class="card__text">${item.short}</p>
            <span class="card__more card__more--down">Подробнее ${icons.chevronDown}</span>
          </div>
        </a>`
    )
    .join('\n        ');

  const serviceBlocks = section.items
    .map((item, i) => {
      const benefits = (item.benefits || [])
        .map(
          ([title, text], b) => `<div class="feature reveal" style="--i:${b}">
            <span class="feature__num">${String(b + 1).padStart(2, '0')}</span>
            <h3 class="feature__title">${title}</h3>
            <p class="feature__text">${text}</p>
          </div>`
        )
        .join('\n          ');

      const applications = (item.applications || [])
        .map((line) => `<li>${icons.check}<span>${line}</span></li>`)
        .join('\n            ');

      return `<section class="section section--muted" id="${item.slug}">
    <div class="container">
      <div class="item-hero">
        <div class="item-hero__text">
          <span class="kicker">${section.kicker} · ${String(i + 1).padStart(2, '0')}</span>
          <h2 class="section__title reveal" style="margin-bottom:16px">${item.title}</h2>
          <p class="page-head__lead reveal">${item.lead}</p>
          <a class="btn btn--primary" href="#lead">Обсудить задачу ${icons.arrowRight}</a>
        </div>
        <div class="item-hero__media reveal"><img src="${item.image}" alt="${item.title}" /></div>
      </div>
    </div>
  </section>

  ${benefits
      ? `<section class="section">
    <div class="container">
      <h3 class="section__title reveal" style="font-size:var(--fs-h3)">Что вы получаете</h3>
      <div class="features">
          ${benefits}
      </div>
    </div>
  </section>`
      : ''}

  ${applications
      ? `<section class="section">
    <div class="container narrow">
      <h3 class="section__title reveal" style="font-size:var(--fs-h3)">Где применяется</h3>
      <ul class="checklist reveal">
            ${applications}
      </ul>
    </div>
  </section>`
      : ''}`;
    })
    .join('\n\n  ');

  const others = SECTIONS.filter((s) => s.key !== section.key)
    .map(
      (s) => `<a class="tile reveal" href="/${s.slug}/">
            <span class="tile__kicker">${s.kicker}</span>
            <span class="tile__title">${s.label}</span>
            ${icons.arrowUpRight}
          </a>`
    )
    .join('\n          ');

  return `<section class="page-head">
    <div class="container">
      <nav class="crumbs" aria-label="Хлебные крошки">
        <a href="/">Главная</a><span>/</span><span>${section.label}</span>
      </nav>
      <span class="kicker">${section.kicker}</span>
      <h1 class="page-head__title">${section.title}</h1>
      <p class="page-head__lead">${section.lead}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cards">
        ${quickNav}
      </div>
    </div>
  </section>

  ${serviceBlocks}

  <section class="section section--muted">
    <div class="container">
      <h2 class="section__title reveal">Другие направления</h2>
      <div class="tiles">
          ${others}
      </div>
    </div>
  </section>

${leadBlock()}`;
}

module.exports = renderAutomationPage;
