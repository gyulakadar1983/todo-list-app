import { ListCollection } from '../list-collection/ListCollection.js';
import { Todo } from './Todo.js';
import { nanoid } from 'nanoid';
import { Select } from '../modals/modals.js';
import { EditableContent } from '../editable-content/EditableContent.js';
import { createRippleElement } from '../effects/effects.js';
import { Toast } from '../toast/Toast.js';
import { Tooltip } from '../tooltip/Tooltip.js';
import { getWeekStartByLocale } from 'weekstart';
import { Checkbox } from '../buttons/buttons.js';
import { appMenu } from '../app-menu/app-menu.js';

class TodoList {
  static maxTitleLength = 50;
  
  static loaderEm = document.querySelector('.js-todo-list-loader');
  static deleteProcessEm = document.querySelector('.js-todo-list-loader-delete-process-t').content;
  static emTemplate = document.querySelector('.js-list-t');
  static em = document.querySelector('.js-todo-list');
  static emptyEm = document.querySelector('.js-todo-list-empty');
  static selectedCounterEm = document.querySelector('.js-todo-selection-counter');
  static selectAllCheckbox = document.querySelector('.js-todo-select-all-checkbox');
  
  static deletedTodoArchive = [];
  static selectedTodoArray = [];
  
  static onupdate = [];
  static onrender = [];
  static onswitch = [];
  
  constructor(title = 'Untitled', id = nanoid(10), imageURL = null, current = false, todoArray = []) {
    if (typeof arguments[0] === 'object') {
      Object.assign(this, arguments[0]);

    } else {
      this.title = title;
      this.id = id;
      this.imageURL = imageURL;
      this.current = current;
      this.todoArray = todoArray;
    }
  }

  render(customTodoArray) {
    const todoArray = customTodoArray || this.todoArray;
    
    this.contentFragment = document.createDocumentFragment();
    
    todoArray.forEach((todoObject) => {
      this.contentFragment.append(Todo.createFragment(todoObject));
    });
    
    TodoList.em.replaceChildren(this.contentFragment, TodoList.emptyEm);
    TodoList.em.dataset.id = this.id;
    
    delete this.contentFragment;

    for (const fn of [...TodoList.onrender, ...TodoList.onupdate]) {
      fn();
    }
    TodoList.selectedTodoArray.length = 0;
    TodoList.updateSelected();
  }

  get finishedCount() {
    let finishedCount = 0;
    for (let i = 0; i < this.todoArray.length; i++) {
      if (this.todoArray[i].state === 'finished') {
        finishedCount++;
      }
    }
    return finishedCount;
  }

  prepend() {
    const newList = TodoList.createFragment(this);
    ListCollection.createListButton.after(newList);

    const listTitleEm = document.createElement('i');
    listTitleEm.textContent = `"${this.title}"`;
    const toastContent = document.createDocumentFragment();
    toastContent.append(listTitleEm, ' was added')
    new Toast(
      toastContent,
    );
  }

  addTodo(todoObject) {
    this.todoArray.unshift(todoObject);
    this.updateInfo();

    return todoObject;
  }

  setTitle(title) {
    this.title = title;

    const em = this.findElement();
    em.titleObject.em.textContent =  em.titleObject.em.title = title;
    
    for (const fn of TodoList.onupdate) {
      fn();
    }

    new Toast(
      'Your changes are saved successfully!',
      {
        modificator: 'list-title-changed',
        type: 'success',
      },
    );
  }

  updateInfo() {
    const em = this.findElement();

    const infoObject = {
      itemCount: this.todoArray.length,
      finishedCount: this.finishedCount,
    };

    em.itemCountEm.textContent = infoObject.itemCount;
    em.finishedCountEm.textContent = infoObject.finishedCount;

    for (const fn of TodoList.onupdate) {
      fn();
    }

    return infoObject;
  }

  delete() {
    const currentListCollection = ListCollection.findCurrent();
    
    const lastOpenedId = TodoList.em.dataset.id;

    if (this.current) {
      currentListCollection.switchList()?.render();
    }

    currentListCollection.listArray.splice(currentListCollection.listArray.indexOf(this), 1);
    ListCollection.deletedListArchive.push(this);
    this.findElement().remove();

    const toastArray = Toast.trackEm.querySelectorAll('.js-toast--list-deleted');

    if (toastArray.length > 0) {
      toastArray[0].changeContent(ListCollection.deletedListArchive.length + ' lists were deleted');

    } else {
      new Toast(
        '1 list was deleted',
        {
          buttonText: 'Undo',
          buttonFn: () => {
            for (let i = ListCollection.deletedListArchive.length - 1; i >= 0; i--) {
              const list = currentListCollection.addList(new TodoList(ListCollection.deletedListArchive[i]));
              list.prepend();
            }

            if (lastOpenedId === ListCollection.deletedListArchive[0].id || !this.todoArray.length) {
              currentListCollection.switchList(currentListCollection.listArray[0]).render();
            }
          },
          closeFn: () => {
            ListCollection.deletedListArchive.length = 0;
          },
          modificator: 'list-deleted',
        }
      );
    }
  }

  deleteImage() {
    delete this.imageURL;
    const listEm = this.findElement();
    listEm.style.backgroundImage = '';
    listEm.classList.remove('list--has-image');
  }

  deleteTodos(todoArray) {
    if (!todoArray || !todoArray.length) return;
    
    if (todoArray.length < 50) {
      const loop = () => {
        /**
         * delete() uses splice, so the todoArray indices
         * are updated immediately, hence just
         * the iteration is needed.
         */
        todoArray[0].delete();
  
        if (todoArray.length) {
          setTimeout(loop);
        }
      };
      
      loop();

    } else {
      TodoList.loaderEm.replaceChildren(TodoList.deleteProcessEm.cloneNode(true));
      TodoList.loaderEm.classList.replace('is-hidden', 'is-visible');
      TodoList.loaderEm.inert = false;

      let i = 0;
      const updatedArray = [];

      const loop = () => {
        const j = Math.min(i + 1000, this.todoArray.length);
        while (i < j) {
          if (!todoArray.includes(this.todoArray[i])) {
            updatedArray.push(this.todoArray[i]);
            
          } else {
            TodoList.deletedTodoArchive.push(todoArray[i]);
          }

          i++;
        }
  
        if (i < todoArray.length) {
          setTimeout(loop);

        } else {
          this.todoArray = updatedArray;
          this.render();
          
          TodoList.loaderEm.inert = true;
          TodoList.loaderEm.classList.replace('is-visible', 'is-hidden');
          
          const currentListCollection = ListCollection.findCurrent();
          new Toast(
            TodoList.deletedTodoArchive.length + ' todos were deleted.',
            {
              buttonText: 'Undo',
              buttonFn: () => {
                TodoList.deletedTodoArchive.forEach(todoObject => {
                  const todoList = currentListCollection.listArray.find(list => list.id === todoObject.listId);
    
                  if (!todoList) return;
    
                  todoObject.id = todoList.todoArray[0]?.id + 1 || 1;
                  const todo = todoList.addTodo(todoObject);
    
                  if (todoList.id === TodoList.em.dataset.id) todo.prepend();
                });
              },
              closeFn: () => {
                TodoList.deletedTodoArchive.length = 0;
              },
              modificator: 'todo-deleted',
            },
          );
        }
      }
      
      /**
       * Timeout for the animation to show for a little.
       */
      setTimeout(loop, 500);
    }
  }

  deleteAll() {
    this.deleteTodos(this.todoArray);
  }
  
  deleteFinished() {
    this.deleteTodos(this.todoArray.filter(todoObject => todoObject.state === 'finished'));
  }

  finishTodos(todoArray) {
    if (!todoArray.length) return;
    
    for (let i = 0; i < todoArray.length; i++) {
      todoArray[i].toggleState();
    }
  }
  
  finishAll() {
    this.finishTodos(this.todoArray.filter(todoObject => todoObject.state !== 'finished'))
  }

  findElement() {
    return ListCollection.em.querySelector(`[data-list-id="${this.id}"]`);
  }

  static updateCounts() {
    const todoCountArray = TodoList.em.querySelectorAll('.js-todo-count');
    for (let i = 0; i < todoCountArray.length; i++) {
      todoCountArray[i].textContent = todoCountArray.length - i;
    }
  }

  static clearSelection() {
    [...TodoList.em.querySelectorAll('.js-checkbox.is-active')].map(checkbox => checkbox.toggle());

    TodoList.selectedTodoArray.length = 0;
    
    delete TodoList.selectedCounterEm.dataset.todoSelected;
    TodoList.selectAllCheckbox.classList.replace('is-active', 'is-inactive');
  }

  static selectAll() {
    [...TodoList.em.querySelectorAll('.js-checkbox.is-inactive')].map(checkbox => checkbox.toggle());
  }
  
  static updateSelected() {
    TodoList.selectedCounterEm.dataset.todoSelected = TodoList.selectedTodoArray.length;
    
    if (TodoList.selectedTodoArray.length === TodoList.em.querySelectorAll('.js-todo').length) {
      TodoList.selectAllCheckbox.classList.replace('is-inactive', 'is-active');
    }

    if (!TodoList.selectedTodoArray.length) {
      delete TodoList.selectedCounterEm.dataset.todoSelected;
      TodoList.selectAllCheckbox.classList.replace('is-active', 'is-inactive');
    }
  }

  static filter(todoArray, option = 'all') {
    if (option === 'all') {
      return [...todoArray];

    } else if (option === 'thisDay') {
      return todoArray.filter(todo => Date.compare(todo.dueDate, new Date()) === 0);

    } else if (option === 'thisWeek') {
      const lang = navigator.language;
      const currentDate = new Date();
      const weekStartOffset = getWeekStartByLocale(lang);
      const weekStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - currentDate.getDay() - weekStartOffset
      );
      const weekEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - currentDate.getDay() + 6 - weekStartOffset
      );

      return todoArray.filter(todo => 
        Date.compare(todo.dueDate, weekStart) >= 0 &&
        Date.compare(todo.dueDate, weekEnd) <= 0
      );
      
    } else if (option === 'thisMonth') {
      const currentDate = new Date();
      
      return todoArray.filter(todo =>
        new Date(todo.dueDate).getMonth() === currentDate.getMonth() &&
        new Date(todo.dueDate).getFullYear() === currentDate.getFullYear()
      );

    } else if (option === 'thisYear') {
      return todoArray.filter(todo => new Date(todo.dueDate).getFullYear() === new Date().getFullYear());
    }
  }

  static sort(todoArray, option = 'addDate', quickSortParams = {left: 0, right: todoArray.length - 1}) {
    if (option === 'addDate') {
      if (!todoArray) return;
      if (todoArray.length <= 1) return todoArray;
      
      let i = quickSortParams.left, j = quickSortParams.right;
      let pIndex = Math.floor((i + j) / 2);
      const p = todoArray[pIndex].id;

      while (i <= j) {
        while (todoArray[i].id > p) i++;
        while (todoArray[j].id < p) j--;

        if (i <= j) {
          const temp = todoArray[i];
          todoArray[i] = todoArray[j];
          todoArray[j] = temp;

          i++, j--;
        }
      }

      pIndex = i;

      if (quickSortParams.left < pIndex - 1) {
        TodoList.sort(todoArray, 'addDate', {left: quickSortParams.left, right: pIndex - 1});
      }

      if (pIndex < quickSortParams.right) {
        TodoList.sort(todoArray, 'addDate', {left: pIndex, right: quickSortParams.right});
      }

      return todoArray;

    } else if (option === 'dueDate') {
      if (!todoArray) return;
      if (todoArray.length <= 1) return todoArray;

      let i = quickSortParams.left, j = quickSortParams.right;
      let pIndex = Math.floor((i + j) / 2);
      const p = todoArray[pIndex];

      while (i <= j) {
        while (
          todoArray[i].dueDate < p.dueDate ||
          Date.compare(todoArray[i].dueDate, p.dueDate) === 0 && todoArray[i].id > p.id
        ) i++;
        while (
          todoArray[j].dueDate > p.dueDate ||
          Date.compare(todoArray[j].dueDate, p.dueDate) === 0 && todoArray[j].id < p.id
        ) j--;

        if (i <= j) {
          const temp = todoArray[i];
          todoArray[i] = todoArray[j];
          todoArray[j] = temp;

          i++, j--;
        }
      }

      pIndex = i;

      if (quickSortParams.left < pIndex - 1) {
        TodoList.sort(todoArray, 'dueDate', {left: quickSortParams.left, right: pIndex - 1});
      }

      if (pIndex < quickSortParams.right) {
        TodoList.sort(todoArray, 'dueDate', {left: pIndex, right: quickSortParams.right});
      }

      return todoArray;

    } else if (option === 'activeFirst') {
      if (!todoArray) return;
      if (todoArray.length <= 1) return todoArray;

      let i = quickSortParams.left, j = quickSortParams.right;
      let pIndex = Math.floor((i + j) / 2);
      const p = todoArray[pIndex];

      while (i <= j) {
        while(
          todoArray[i].state === 'active' && p.state === 'finished' ||
          todoArray[i].state === p.state && todoArray[i].id > p.id
        ) i++;
        while(
          todoArray[j].state === 'finished' && p.state === 'active' ||
          todoArray[j].state === p.state && todoArray[j].id < p.id
        ) j--;

        if (i <= j) {
          const temp = todoArray[j];
          todoArray[j] = todoArray[i];
          todoArray[i] = temp;

          i++, j--;
        }
      }

      pIndex = i;

      if (quickSortParams.left < pIndex - 1) {
        TodoList.sort(todoArray, 'activeFirst', {left: quickSortParams.left, right: pIndex - 1});
      }

      if (pIndex < quickSortParams.right) {
        TodoList.sort(todoArray, 'activeFirst', {left: pIndex, right: quickSortParams.right});
      }

      return todoArray;
      
    } else if (option === 'finishedFirst') {
      if (!todoArray) return;
      if (todoArray.length <= 1) return todoArray;

      let i = quickSortParams.left, j = quickSortParams.right;
      let pIndex = Math.floor((i + j) / 2);
      const p = todoArray[pIndex];

      while (i <= j) {
        while(
          todoArray[i].state === 'finished' && p.state === 'active' ||
          todoArray[i].state === p.state && todoArray[i].id > p.id
        ) i++;
        while(
          todoArray[j].state === 'active' && p.state === 'finished' ||
          todoArray[j].state === p.state && todoArray[j].id < p.id
        ) j--;

        if (i <= j) {
          const temp = todoArray[j];
          todoArray[j] = todoArray[i];
          todoArray[i] = temp;

          i++, j--;
        }
      }

      pIndex = i;

      if (quickSortParams.left < pIndex - 1) {
        TodoList.sort(todoArray, 'finishedFirst', {left: quickSortParams.left, right: pIndex - 1});
      }

      if (pIndex < quickSortParams.right) {
        TodoList.sort(todoArray, 'finishedFirst', {left: pIndex, right: quickSortParams.right});
      }

      return todoArray;
    }
  }

  static createFragment(listObject) {
    const currentListCollection = ListCollection.findCurrent();
    
    const listFragment = document.importNode(TodoList.emTemplate.content, true);
  
    const listEm = listFragment.querySelector('.js-list');
    if (listObject.imageURL) {
      listEm.style.backgroundImage = `url(${listObject.imageURL})`;
      listEm.classList.add('list--has-image');
    };
    listEm.dataset.listId = listObject.id;

    listEm.addEventListener('mousedown', (e) => {
      if (
        listEm.menu.toggleButton.contains(e.target) ||
        listEm.titleObject.em.contains(e.target) && listEm.titleObject.em.isContentEditable
      ) {
        delete listEm.dataset.pressed;
        return;
      }
      
      createRippleElement(listEm, e, listObject.imageURL ? 'lt' : 'dk');

      listEm.dataset.pressed = true;
    });

    listEm.addEventListener('mouseup', (e) => {
      if (!listEm.dataset.pressed) return;
      
      appMenu.close();

      currentListCollection.switchList(listObject).render();
    });

    listEm.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (
          listEm.menu.toggleButton.contains(e.target) ||
          listEm.titleObject.em.contains(e.target)
        ) return;
        
        appMenu.close();

        currentListCollection.switchList(listObject).render();
      }
    });
    
    listEm.addEventListener('dragenter', (e) => {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.classList.add('list--image-hint');
    });

    listEm.addEventListener('dragover', (e) => {
      e.stopPropagation();
      e.preventDefault();
    });
    
    listEm.addEventListener('dragleave', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.currentTarget.contains(e.relatedTarget)) return;
      e.currentTarget.classList.remove('list--image-hint');
    });

    listEm.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      e.currentTarget.classList.remove('list--image-hint');

      let file = e.dataTransfer.files[e.dataTransfer.files.length - 1];
      
      if (!file.type.includes('image')) return;

      postImage(file);
    });
    
    listEm.imageInput = listFragment.querySelector('.js-list-image-input');
    listEm.imageInput.addEventListener('change', function() {
      postImage(this.files[0]);
    });
  
    async function postImage(image) {
      const data = new FormData();
      data.append('image', image);
      data.append('key', '019e70ddcce1687f1f1fa8f51a55163f');
      
      fetch('https://api.imgbb.com/1/upload', {
        method: 'post',
        body: data,
      })
        .then(res => res.json())
        .then(json => {
          listObject.imageURL = json.data.url;
          listEm.style.backgroundImage = `url(${listObject.imageURL})`;
          listEm.classList.add('list--has-image');
        })
        .catch(error => console.log(error));
    }
  
    listEm.finishedCountEm = listFragment.querySelector('.js-list-finished-count');
    listEm.finishedCountEm.textContent = listObject.todoArray.filter(todoObject => todoObject.state === 'finished').length;
    
    listEm.itemCountEm = listFragment.querySelector('.js-list-item-count');
    listEm.itemCountEm.textContent = listObject.todoArray.length;
  
    listEm.menu = new Select(
      listFragment.querySelector('.js-list-menu'),
      [
        {
          button: listFragment.querySelector('.js-change-title-list-btn'),
          function() {
            listEm.titleObject.em.contentEditable = true;
            listEm.titleObject.em.focus();
          },
        },
        {
          button: listFragment.querySelector('.js-delete-list-btn'),
          function() {
            listObject.delete();
          },
        },
        {
       
          button: listFragment.querySelector('.js-finish-all-btn'),
          function() {
            listObject.finishAll();
          },
        },
        {
          button: listFragment.querySelector('.js-delete-finished-btn'),
          function() {
            listObject.deleteFinished();
          },
        },
        {
          button: listFragment.querySelector('.js-delete-all-btn'),
          function() {
            listObject.deleteAll()
          },
        },
        {
          button: listFragment.querySelector('.js-change-img-btn'),
          function() {
            listEm.imageInput.click();
          },
        },
        {
          button: listFragment.querySelector('.js-delete-img-btn'),
          function() {
            listObject.deleteImage();
          },
        },
      ]
    );
    
    listEm.tooltip = new Tooltip(listEm.menu.toggleButton, 'See options');
  
    listEm.menu.toggleButton.onmousedown = (e) => {
      createRippleElement(e.currentTarget, e, 'dk');
    };
  
    listEm.titleObject = new EditableContent(
      listFragment.querySelector('.js-list-title'), 
      () => {
        listObject.setTitle(listEm.titleObject.savedValue);
        listEm.titleObject.em.contentEditable = false;
        listEm.focus();
      },
      {
        maxLength: TodoList.maxTitleLength,
        autoDisable: true,
      },
    );
    listEm.titleObject.em.title = listEm.titleObject.em.textContent = listObject.title;
  
    return listEm;
  }
}

new Checkbox(
  TodoList.selectAllCheckbox,
  () => TodoList.selectAll(),
  () => TodoList.clearSelection()
);

export { TodoList };