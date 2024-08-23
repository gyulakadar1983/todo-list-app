import { appMenu } from '../app-menu/app-menu.js';
import { Modal } from '../modals/modals.js';
import { CharLimiter } from '../char-limiter/CharLimiter.js';
import { ListCollection } from '../list-collection/ListCollection.js';
import { TodoList } from '../todo-list/TodoList.js';
import { todoFormObject } from '../control-panel/todo-form/todo-form.js';
import { Form } from '../form/Form.js';

const listFormElement = document.querySelector('.js-list-form');
const listFormObject = {
  input: listFormElement.querySelector('.js-list-form-input'),
  modal: new Modal(listFormElement, { detached: true }),
  cancelButton: listFormElement.querySelector('.js-list-form-button-cancel'),
  createButton: listFormElement.querySelector('.js-list-form-button-create'),
  submit() {
    const currentListCollection = ListCollection.findCurrent();
    const newList = ListCollection.findCurrent().addList(new TodoList(listFormObject.input.value.trim()));
    currentListCollection.switchList(newList);
    newList.prepend();
    newList.render();

    listFormObject.reset();
  },
  reset() {
    this.input.value = '';
    listCharLimiter.reset();
  },
};

new Form(
  listFormObject.input,
  listFormObject.createButton,
  () => {
    listFormObject.modal.close();
    listFormObject.submit();
  },
  {
    valueMissing: true,
    maxLength: TodoList.maxTitleLength,
  },
  () => {
    listFormObject.modal.close();
    listFormObject.reset();
  },
  listFormObject.cancelButton,
);

const listCharLimiter = new CharLimiter(listFormObject.input, listFormElement.querySelector('.js-list-form-char-limiter'), TodoList.maxTitleLength);

appMenu.relatedEmList.push(listFormObject.modal.modal);

listFormObject.modal.onopen = () => {
  document.forms[document.forms.length - 1][0].focus();
};

listFormObject.modal.onclose = () => {
  if (appMenu.active) {
    ListCollection.createListButton.focus();
    return;
  }
  
  if (ListCollection.findCurrent().findCurrentList()) {
    document.forms[0][0].focus();
  }
};

export { listFormObject };