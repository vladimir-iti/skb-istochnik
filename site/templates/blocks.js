'use strict';

const icons = require('../partials/icons');
const { SECTIONS, PROCESS, INDUSTRIES, PRODUCTION_PHOTOS, ALL_ITEMS, ADVANTAGES } = require('../partials/data');

/**
 * Блоки, которые собираются из данных и вставляются в HTML-шаблоны страниц
 * токенами вида {{DIRECTIONS}}. Так тексты остаются в data.js, а разметка
 * страниц — читаемой.
 */

/** Четыре направления работы — крупная сетка на главной. */
function directions() {
  return SECTIONS.map(
    (section, i) => `<a class="dir reveal" href="/${section.slug}/" style="--i:${i}">
          <span class="dir__num">${String(i + 1).padStart(2, '0')} / ${section.kicker}</span>
          <h3 class="dir__title">${section.label}</h3>
          <p class="dir__text">${section.lead}</p>
          <div class="dir__list">
            ${section.items.slice(0, 6).map((item) => `<span>${item.title}</span>`).join('\n            ')}
          </div>
          <span class="dir__more">Перейти в раздел ${icons.arrowRight}</span>
        </a>`
  ).join('\n        ');
}

/** Этапы работы. */
function process() {
  return PROCESS.map(
    ([title, text], i) => `<div class="step reveal" style="--i:${i}">
          <span class="step__num">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="step__title">${title}</h3>
          <p class="step__text">${text}</p>
        </div>`
  ).join('\n        ');
}

/** Отрасли, с которыми работаем. */
function industries() {
  return INDUSTRIES.map(
    ([title, text], i) => `<div class="industry reveal" style="--i:${i}">
          <h3 class="industry__title">${title}</h3>
          <p class="industry__text">${text}</p>
        </div>`
  ).join('\n        ');
}

/** Преимущества бюро. */
function advantages() {
  return ADVANTAGES.map(
    ([title, text], i) => `<div class="feature reveal" style="--i:${i}">
          <span class="feature__num">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="feature__title">${title}</h3>
          <p class="feature__text">${text}</p>
        </div>`
  ).join('\n        ');
}

/** Лента фотографий производства. */
function production() {
  return PRODUCTION_PHOTOS.map(
    (src, i) => `<figure class="reveal" style="--i:${i}"><img src="${src}" alt="Производство СКБ «Источник»" loading="lazy" /></figure>`
  ).join('\n        ');
}

/** Избранные изделия — карточки с фото. */
function featured() {
  return ALL_ITEMS.filter((item) => item.featured || item.gallery)
    .slice(0, 4)
    .map(
      (item, i) => `<a class="card card--media reveal" href="${item.href}" style="--i:${i}">
          <div class="card__media"><img src="${item.image}" alt="${item.title}" loading="lazy" /></div>
          <div class="card__body">
            <span class="card__num">${item.sectionLabel}</span>
            <h3 class="card__title">${item.title}</h3>
            <p class="card__text">${item.short}</p>
            <span class="card__more">Подробнее ${icons.arrowRight}</span>
          </div>
        </a>`
    )
    .join('\n        ');
}

module.exports = { directions, process, industries, advantages, production, featured };
