import { footerEm } from '../footer.js';
import { listInfoObject } from '../footer-list-info/footer-list-info.js';
import { ListCollection } from '../../list-collection/ListCollection.js';
import { listFormObject } from '../../list-form/list-form.js';
import { Select } from '../../modals/modals.js';
import { Tooltip } from '../../tooltip/Tooltip.js';

const footerListMenu = new Select(
  footerEm.querySelector('.js-list-menu'),
  [
    {
      button: footerEm.querySelector('.js-create-list-btn'),
      function() {
        listFormObject.modal.open();
      },
    },
    {
      button: footerEm.querySelector('.js-change-title-list-btn'),
      function() {
        listInfoObject.titleObject.em.focus();
      }
    },
    {
      button: footerEm.querySelector('.js-delete-list-btn'),
      function() {
        ListCollection.findCurrent().findCurrentList().delete();
      },
    },
  ]
);

new Tooltip(footerListMenu.toggleButton, 'List options');

export { footerListMenu };