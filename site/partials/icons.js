'use strict';

/**
 * Инлайновые SVG-иконки. Штриховые, 1.5px, наследуют currentColor —
 * чтобы не тянуть иконочный шрифт и не плодить сетевые запросы.
 */

const wrap = (body, extra = '') =>
  `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;

module.exports = {
  arrowRight: wrap('<path d="M4 12h15M13 6l6 6-6 6"/>'),
  arrowUpRight: wrap('<path d="M7 17 17 7M8 7h9v9"/>'),
  chevronDown: wrap('<path d="m6 9 6 6 6-6"/>'),
  phone: wrap('<path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4h1.5Z"/>'),
  mail: wrap('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
  pin: wrap('<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
  clock: wrap('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  check: wrap('<path d="m4 12.5 5 5L20 6.5"/>'),
  cube: wrap('<path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z"/><path d="M3.5 7 12 11.7 20.5 7M12 11.7v9.8"/>'),
  gear: wrap('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>'),
  shield: wrap('<path d="M12 2.8 19.5 6v6c0 4.4-3.1 8.1-7.5 9.2C7.6 20.1 4.5 16.4 4.5 12V6L12 2.8Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  chip: wrap('<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>'),
  spark: wrap('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3 9 9M15 15l2.7 2.7M17.7 6.3 15 9M9 15l-2.7 2.7"/>'),
  doc: wrap('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h5"/>'),
  flame: wrap('<path d="M12 21c3.6 0 6-2.4 6-5.6 0-4-3.4-6-4.6-9.4-2 1.4-2.6 3.2-2.4 5C9.8 10 9 8.7 9 7.2 7.2 8.6 6 11 6 13.6 6 17.2 8.4 21 12 21Z"/>'),
};
