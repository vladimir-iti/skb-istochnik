'use strict';

/**
 * Скрипты сайта СКБ «Источник». Без библиотек: появление блоков при скролле,
 * компактная шапка, мобильное меню и проверка формы заявки.
 */

(function () {
  /* --- Появление блоков при скролле -------------------------------------- */

  const revealables = document.querySelectorAll('.reveal:not(.hero .reveal)');

  if ('IntersectionObserver' in window && revealables.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* --- Компактная шапка при скролле -------------------------------------- */

  const header = document.querySelector('[data-header]');

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Мобильное меню ----------------------------------------------------- */

  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      mobileNav.hidden = !open;
      document.body.classList.toggle('is-locked', open);
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

    mobileNav.addEventListener('click', (event) => {
      const groupHead = event.target.closest('.mnav__group-head');
      if (groupHead) {
        const open = groupHead.getAttribute('aria-expanded') === 'true';
        groupHead.setAttribute('aria-expanded', String(!open));
        return;
      }
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileNav.hidden) setOpen(false);
    });

    // При переходе на десктоп меню не должно оставаться открытым.
    window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* --- Форма заявки -------------------------------------------------------
     Реальная отправка появится вместе с бэкендом. Пока форма валидируется
     на клиенте и показывает подтверждение, чтобы страница вела себя честно.
     ----------------------------------------------------------------------- */

  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    const status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const required = [...form.querySelectorAll('[required]')];
      let valid = true;

      for (const field of required) {
        const empty = !field.value.trim();
        field.classList.toggle('is-error', empty);
        if (empty) valid = false;
      }

      if (!valid) {
        status.textContent = 'Заполните имя и телефон.';
        status.classList.add('is-error');
        return;
      }

      status.classList.remove('is-error');
      status.textContent = 'Заявка отправлена. Мы свяжемся с вами в рабочее время.';
      form.reset();
    });

    form.addEventListener('input', (event) => {
      event.target.classList.remove('is-error');
    });
  });
})();
