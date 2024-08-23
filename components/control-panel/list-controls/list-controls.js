import { controlPanelEm } from '../control-panel.js';
import { createRippleElement } from '../../effects/effects.js';
import { Select } from '../../modals/modals.js';
import { TodoList } from '../../todo-list/TodoList.js';
import { ListCollection } from '../../list-collection/ListCollection.js';
import { Tooltip } from '../../tooltip/Tooltip.js';

const listControlsElement = controlPanelEm.querySelector('.js-list-controls');
const listControlsObject = {
  customArray: [],
  activeListId: null,
  activeFilter: 'all',
  activeSort: 'addDate',
  resetButton: listControlsElement.querySelector('.js-list-controls-reset-button'),
  submit() {
    const todoList = ListCollection.findCurrent().findCurrentList();
    this.activeListId = todoList.id;

    this.customArray = TodoList.filter(todoList.todoArray, this.activeFilter);
    this.customArray = TodoList.sort(this.customArray, this.activeSort);

    todoList.render(this.customArray);
    
    if (this.activeFilter === 'all' && this.activeSort === 'addDate') {
      this.resetButton.disabled = true;
      
    } else {
      this.resetButton.disabled = false;
    }
  },
  filter: new Select(
    listControlsElement.querySelector('.js-filter-menu'),
    [
      {
        button: listControlsElement.querySelector('.js-filter--all'),
        function: () => {
          listControlsObject.activeFilter = 'all';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-filter--this-day'),
        function: () => {
          listControlsObject.activeFilter = 'thisDay';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-filter--this-week'),
        function: () => {
          listControlsObject.activeFilter = 'thisWeek';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-filter--this-month'),
        function: () => {
          listControlsObject.activeFilter = 'thisMonth';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-filter--this-year'),
        function: () => {
          listControlsObject.activeFilter = 'thisYear';
          listControlsObject.submit();
        },
      },
    ],
    {
      type: 'single',
    },
  ),
  sort: new Select(
    listControlsElement.querySelector('.js-sort-menu'),
    [
      {
        button: listControlsElement.querySelector('.js-sort--add-date'),
         function: () => {
          listControlsObject.activeSort = 'addDate';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-sort--due-date'),
         function: () => {
          listControlsObject.activeSort = 'dueDate';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-sort--active-first'),
         function: () => {
          listControlsObject.activeSort = 'activeFirst';
          listControlsObject.submit();
        },
      },
      {
        button: listControlsElement.querySelector('.js-sort--finished-first'),
         function: () => {
          listControlsObject.activeSort = 'finishedFirst';
          listControlsObject.submit();
        },
      },
    ],
    {
      type: 'single',
    },
  ),
  manage: new Select(
    listControlsElement.querySelector('.js-list-options-menu'),
    [
      {
        button: listControlsElement.querySelector('.js-manage--delete-finished'),
        function () {
          const todoList = ListCollection.findCurrent().findCurrentList();
          todoList.deleteFinished();
        },
      },
      {
        button: listControlsElement.querySelector('.js-manage--finish-all'),
        function () {
          const todoList = ListCollection.findCurrent().findCurrentList();
          todoList.finishAll();
        },
      },
      {
        button: listControlsElement.querySelector('.js-manage--delete-all'),
        function () {
          const todoList = ListCollection.findCurrent().findCurrentList();
          todoList.deleteAll();
        },
      },
    ]
  ),
  selection: {
    deleteButton: listControlsElement.querySelector('.js-todo-selection-delete'),
    finishButton: listControlsElement.querySelector('.js-todo-selection-finish'),
    closeButton: listControlsElement.querySelector('.js-todo-selection-reset'),
  },
  reset() {
    listControlsObject.activeFilter = 'all';
    listControlsObject.activeSort = 'addDate';
    [this.filter, this.sort].map(menu => menu.select(0, true));
  },
};
listControlsObject.resetButton.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'dk');
});
listControlsObject.resetButton.addEventListener('click', (e) => {
  listControlsObject.reset();
  listControlsObject.submit();
});
new Tooltip(listControlsObject.filter.toggleButton, 'Select filtering option');
new Tooltip(listControlsObject.sort.toggleButton, 'Select sorting option');
new Tooltip(listControlsObject.resetButton, 'Reset to default');
new Tooltip(listControlsObject.manage.toggleButton, 'More options');
new Tooltip(listControlsObject.selection.deleteButton, 'Delete selected');
new Tooltip(listControlsObject.selection.finishButton, 'Finish selected');
new Tooltip(listControlsObject.selection.closeButton, 'Cancel');
listControlsObject.selection.deleteButton.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'dk');
});
listControlsObject.selection.deleteButton.addEventListener('click', (e) => {
  const todoList = ListCollection.findCurrent().findCurrentList();
  todoList.deleteTodos(TodoList.selectedTodoArray);

  TodoList.clearSelection();
});
listControlsObject.selection.finishButton.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'dk');
});
listControlsObject.selection.finishButton.addEventListener('click', (e) => {
  const todoList = ListCollection.findCurrent().findCurrentList();
  todoList.finishTodos(TodoList.selectedTodoArray);

  TodoList.clearSelection();
});
listControlsObject.selection.closeButton.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'dk');
});
listControlsObject.selection.closeButton.addEventListener('click', (e) => {
  TodoList.clearSelection();
});

TodoList.onswitch.push(() => {
  listControlsObject.reset();
  listControlsObject.resetButton.disabled = true;
});

export { listControlsObject };