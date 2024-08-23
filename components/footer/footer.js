import { DateDisplay } from '../date/date.js';

const em = document.querySelector('.js-footer');
new DateDisplay(em.querySelector('.js-date-display'));

export { em as footerEm };