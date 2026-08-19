'use strict';

const icons = require('./icons');
const { CONTACTS } = require('./data');

/**
 * Блок заявки. Ставится в конец каждой страницы — на него ведут все кнопки
 * «Обсудить задачу» (якорь #lead).
 *
 * @param {string} title
 * @param {string} text
 */
function leadBlock(
  title = 'Обсудим вашу задачу',
  text = 'Пришлите чертёж, образец детали или короткое описание задачи — предложим решение и сориентируем по срокам.'
) {
  return `<section class="lead" id="lead">
    <div class="container lead__inner">
      <div class="lead__text reveal">
        <span class="kicker">Связаться</span>
        <h2 class="lead__title">${title}</h2>
        <p class="lead__desc">${text}</p>
        <ul class="lead__contacts">
          <li><a href="${CONTACTS.phoneHref}">${icons.phone}<span>${CONTACTS.phone}</span></a></li>
          <li><a href="${CONTACTS.emailHref}">${icons.mail}<span>${CONTACTS.email}</span></a></li>
          <li>${icons.pin}<span>${CONTACTS.address}</span></li>
        </ul>
      </div>

      <form class="lead__form reveal" data-lead-form novalidate>
        <div class="field">
          <label for="lead-name">Имя</label>
          <input type="text" id="lead-name" name="name" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="lead-phone">Телефон</label>
          <input type="tel" id="lead-phone" name="phone" autocomplete="tel" required />
        </div>
        <div class="field">
          <label for="lead-task">Задача</label>
          <textarea id="lead-task" name="task" rows="4" placeholder="Кратко опишите, что нужно изготовить или спроектировать"></textarea>
        </div>
        <button class="btn btn--primary btn--block" type="submit">Отправить заявку ${icons.arrowRight}</button>
        <p class="field__note">
          Нажимая кнопку, вы соглашаетесь с <a href="/policy/">политикой конфиденциальности</a>.
        </p>
        <p class="form-status" data-form-status role="status"></p>
      </form>
    </div>
  </section>`;
}

module.exports = leadBlock;
