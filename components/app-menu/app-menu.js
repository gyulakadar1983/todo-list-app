import { controlPanelEm } from '../control-panel/control-panel.js';
import { Modal } from '../modals/modals.js';
import { Accordion } from '../accordion/Accordion.js';
import { Tooltip } from '../tooltip/Tooltip.js';
import { TodoList } from '../todo-list/TodoList.js';

const appMenu = new Modal({
  content: document.querySelector('.js-app-menu'),
  toggleButton: controlPanelEm.querySelector('.js-app-menu-toggle-button')
});

new Tooltip(appMenu.toggleButton, 'App menu');

for (const em of appMenu.content.querySelectorAll('.js-accordion')) {
  new Accordion(em, true);
};

export { appMenu };