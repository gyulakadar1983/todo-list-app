import { controlPanelEm } from '../control-panel.js';
import { createRippleElement } from '../../effects/effects.js';
import { Tooltip } from '../../tooltip/Tooltip.js';
import { Calendar } from '../../date/date.js';
import { Modal } from '../../modals/modals.js';
import { ListCollection } from '../../list-collection/ListCollection.js';
import { Todo } from '../../todo-list/Todo.js';
import { TodoList } from '../../todo-list/TodoList.js';
import { Form } from '../../form/Form.js';

const todoFormElement = controlPanelEm.querySelector('.js-todo-form');
const todoFormCalendar = new Calendar(todoFormElement.querySelector('.js-calendar'), new Date());
const todoFormObject = {
  form: todoFormElement,
  input: todoFormElement.querySelector('.js-todo-text-input'),
  calendar: todoFormCalendar,
  calendarModal: new Modal(todoFormCalendar.em),
  addButton: todoFormElement.querySelector('.js-add-todo-button'),
  submit() {
    const todoList = ListCollection.findCurrent().findCurrentList();
    
    todoList.addTodo(new Todo(
      this.input.value.trim(),
      this.calendar.selectedDate,
    )).prepend();
  
    this.reset();
  },
  reset() {
    this.input.value = '';
    
    if (!JSON.parse(localStorage.getItem('todoEditorDefaultDate'))) {
      this.calendar.clearDate();

    } else {
      this.calendar.setCurrent();
      this.calendar.saveDate();
    }
    
    this.input.focus();
  }
}

new Tooltip(todoFormElement.querySelector('.js-todo-input-kbd'), 'Press / to focus on a text field');

new Tooltip(todoFormObject.calendarModal.toggleButton, 'Pick a date');

todoFormObject.calendar.saveButton.addEventListener('click', () => {
  todoFormObject.calendarModal.close();
});

new Form(
  todoFormObject.input,
  todoFormObject.addButton,
  () => todoFormObject.submit(),
  {
    valueMissing: true,
    maxLength: Todo.maxContentLength,
  },
  () => todoFormObject.reset(),
);

new Tooltip(todoFormObject.addButton, 'Click or press Enter to add todo');

const inputAnchor = TodoList.emptyEm.querySelector('.js-todo-list-empty-input-anchor')

inputAnchor.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'lt');
});

inputAnchor.addEventListener('click', (e) => {
  todoFormObject.input.focus();
});

const todoFormInputContainer = todoFormElement.querySelector('.js-todo-form-input-container');

export { todoFormObject };