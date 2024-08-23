import './index.css';
import { listFormObject } from '../components/list-form/list-form.js';
import { ListCollection } from '../components/list-collection/ListCollection.js';
import { TodoList } from '../components/todo-list/TodoList.js';
import { Todo } from '../components/todo-list/Todo.js';
import { appMenu } from '../components/app-menu/app-menu.js';
import { appSettingsObject, changeAppTheme } from '../components/app-menu/app-settings/app-settings.js';
import { footerEm } from '../components/footer/footer.js';
import { listInfoObject } from '../components/footer/footer-list-info/footer-list-info.js';
import { footerListMenu } from '../components/footer/footer-list-menu/footer-list-menu.js';
import { controlPanelEm } from '../components/control-panel/control-panel.js';
import { todoFormObject } from '../components/control-panel/todo-form/todo-form.js';
import { listControlsObject } from '../components/control-panel/list-controls/list-controls.js';
import { Accordion } from '../components/accordion/Accordion.js';
import { Checkbox, SwitchButton } from '../components/buttons/buttons.js';
import { Carousel } from '../components/carousel/Carousel.js';
import { DateFieldset, Calendar } from '../components/date/date.js';
import { Modal, Select } from '../components/modals/modals.js';
import { EditableContent } from '../components/editable-content/EditableContent.js';
import { CharLimiter } from '../components/char-limiter/CharLimiter.js';
import { Tooltip } from '../components/tooltip/Tooltip.js';
import { Toast } from '../components/toast/Toast.js';
import { createRippleElement } from '../components/effects/effects.js';

const theme = localStorage.getItem('theme');
changeAppTheme(theme ? theme : 'auto');

function restart() {
  const currentListCollection = ListCollection.findCurrent();

  const savedCollection = JSON.parse(localStorage.getItem('listCollection'));

  if (localStorage.getItem('user')) {
    Object.assign(currentListCollection, savedCollection);

    for (let i = 0; i < currentListCollection.listArray.length; i++) {
      currentListCollection.listArray[i] = new TodoList(currentListCollection.listArray[i]);
    
      const todoArray = currentListCollection.listArray[i].todoArray;
      for (let i = 0; i < todoArray.length; i++) {
        todoArray[i] = new Todo({...todoArray[i]});
      }
    }

  } else {
    const firstList = new TodoList();
    firstList.current = true;

    const firstTodo = new Todo({
      id: 1,
      content: 'Make your first todo!',
      dueDate: null,
      state: 'active',
      listId: firstList.id,
    });
    firstList.todoArray.push(firstTodo);
    
    currentListCollection.listArray.push(firstList);

    localStorage.setItem('user', true);
  }

  currentListCollection.render();
  currentListCollection.findCurrentList()?.render();
}

restart();

window.addEventListener('beforeunload', (e) => {
  ListCollection.saveToStorage();
});

document.addEventListener('DOMContentLoaded', (e) => {
  if (ListCollection.findCurrent().findCurrentList()) {
    document.forms[document.forms.length - 1][0].focus();
  }
});

document.onkeydown = (e) => {
  if (e.key === '/') {
    if (!document.activeElement.isContentEditable) {
      e.preventDefault();
      document.forms[document.forms.length - 1][0].focus();
    }
  }
};

TodoList.onswitch.push(() => {
  document.forms[document.forms.length - 1][0].focus();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') {
    e.preventDefault();

    e.target.addEventListener('keyup', (e) => {
      if (e.code !== 'Enter') return;

      e.target.click();
    }, {once: true});
  }
});