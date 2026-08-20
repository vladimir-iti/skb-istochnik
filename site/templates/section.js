'use strict';

const icons = require('../partials/icons');
const leadBlock = require('../partials/leadBlock');
const { SECTIONS } = require('../partials/data');

/**
 * Шаблон страницы раздела. Один и тот же для «Инжиниринга», «Продукции»,
 * «Металлообработки» и «Автоматизации» — меняются только данные.
 *
 * @param {object} section - элемент SECTIONS из partials/data.js
 */
function renderSection(section) {
  const cards = section.items
    .map((item, index) => {
      const href = `/${section.slug}/${item.slug}/`;
      // Чертёж нельзя кадрировать под карточку — он должен быть виден целиком.
      const isDoc = item.image && item.image.includes('/drawings/');
      const media = item.image
        ? `<div class="card__media${isDoc ? ' card__media--doc' : ''}"><img src="${item.image}" alt="${item.title}" loading="lazy" /></div>`
        : '';

      return `<a class="card${item.image ? ' card--media' : ''} reveal" href="${href}" style="--i:${index}">
          ${media}
          <div class="card__body">
            <span class="card__num">${String(index + 1).padStart(2, '0')}</span>
            <h3 class="card__title">${item.title}</h3>
            <p class="card__text">${item.short}</p>
            <span class="card__more">Подробнее ${icons.arrowRight}</span>
          </div>
        </a>`;
    })
    .join('\n        ');

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
        ${cards}
      </div>
    </div>
  </section>

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

module.exports = renderSection;
