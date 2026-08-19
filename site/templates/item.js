'use strict';

const icons = require('../partials/icons');
const leadBlock = require('../partials/leadBlock');

/**
 * Шаблон страницы услуги или изделия. Один на все ~23 позиции каталога:
 * необязательные блоки (галерея, принцип работы, характеристики, комплектация)
 * выводятся, только если они заполнены в partials/data.js.
 *
 * @param {object} section
 * @param {object} item
 */
function renderItem(section, item) {
  const benefits = (item.benefits || [])
    .map(
      ([title, text], i) => `<div class="feature reveal" style="--i:${i}">
            <span class="feature__num">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="feature__title">${title}</h3>
            <p class="feature__text">${text}</p>
          </div>`
    )
    .join('\n          ');

  const applications = (item.applications || [])
    .map((line) => `<li>${icons.check}<span>${line}</span></li>`)
    .join('\n            ');

  const gallery = (item.gallery || [])
    .map((src) => `<figure class="gallery__item reveal"><img src="${src}" alt="${item.title}" loading="lazy" /></figure>`)
    .join('\n          ');

  const specs = (item.specs || [])
    .map(([name, value]) => `<tr><th>${name}</th><td>${value}</td></tr>`)
    .join('\n              ');

  const kit = (item.kit || []).map((line) => `<li>${icons.check}<span>${line}</span></li>`).join('\n            ');

  const hero = item.image
    ? `<div class="item-hero__media reveal"><img src="${item.image}" alt="${item.title}" /></div>`
    : '';

  return `<section class="page-head page-head--item">
    <div class="container">
      <nav class="crumbs" aria-label="Хлебные крошки">
        <a href="/">Главная</a><span>/</span>
        <a href="/${section.slug}/">${section.label}</a><span>/</span>
        <span>${item.title}</span>
      </nav>
      <div class="item-hero">
        <div class="item-hero__text">
          <span class="kicker">${section.kicker}</span>
          <h1 class="page-head__title">${item.title}</h1>
          <p class="page-head__lead">${item.lead}</p>
          <a class="btn btn--primary" href="#lead">Обсудить задачу ${icons.arrowRight}</a>
        </div>
        ${hero}
      </div>
    </div>
  </section>

  ${benefits
      ? `<section class="section">
    <div class="container">
      <h2 class="section__title reveal">Что вы получаете</h2>
      <div class="features">
          ${benefits}
      </div>
    </div>
  </section>`
      : ''}

  ${item.howItWorks
      ? `<section class="section section--muted">
    <div class="container narrow">
      <h2 class="section__title reveal">Принцип работы</h2>
      <p class="prose reveal">${item.howItWorks}</p>
    </div>
  </section>`
      : ''}

  ${specs
      ? `<section class="section">
    <div class="container narrow">
      <h2 class="section__title reveal">Характеристики</h2>
      <div class="table-wrap reveal">
        <table class="specs">
          <tbody>
              ${specs}
          </tbody>
        </table>
      </div>
      ${item.note ? `<p class="note reveal">${item.note}</p>` : ''}
    </div>
  </section>`
      : ''}

  ${kit
      ? `<section class="section section--muted">
    <div class="container narrow">
      <h2 class="section__title reveal">Базовая комплектация</h2>
      <ul class="checklist reveal">
            ${kit}
      </ul>
    </div>
  </section>`
      : ''}

  ${gallery
      ? `<section class="section">
    <div class="container">
      <h2 class="section__title reveal">Галерея</h2>
      <div class="gallery">
          ${gallery}
      </div>
    </div>
  </section>`
      : ''}

  ${applications
      ? `<section class="section${gallery ? ' section--muted' : ''}">
    <div class="container narrow">
      <h2 class="section__title reveal">Где применяется</h2>
      <ul class="checklist reveal">
            ${applications}
      </ul>
    </div>
  </section>`
      : ''}

  <section class="section">
    <div class="container">
      <h2 class="section__title reveal">Другие услуги раздела</h2>
      <div class="tiles">
          ${section.items
            .filter((i) => i.slug !== item.slug)
            .slice(0, 6)
            .map(
              (i) => `<a class="tile reveal" href="/${section.slug}/${i.slug}/">
            <span class="tile__kicker">${section.label}</span>
            <span class="tile__title">${i.title}</span>
            ${icons.arrowUpRight}
          </a>`
            )
            .join('\n          ')}
      </div>
    </div>
  </section>

${leadBlock()}`;
}

module.exports = renderItem;
