import { ListCollection } from '../list-collection/ListCollection.js';
import { TodoList } from '../todo-list/TodoList.js';
import { Checkbox } from '../buttons/buttons.js';
import { createRippleElement } from '../effects/effects.js';
import { Toast } from '../toast/Toast.js';
import { Tooltip } from '../tooltip/Tooltip.js';

class Todo {
  static maxContentLength = 300;
  static emTemplate = document.querySelector('.js-todo-t');
  static addStreak = 0;
  static finishStreak = 0;
  
  constructor(content, dueDate = null, state = 'active', todoList = ListCollection.findCurrent().findCurrentList()) {
    if (typeof arguments[0] === 'object') {
      Object.assign(this, arguments[0]);

    } else {
      this.id = todoList.todoArray[0]?.id + 1 || 1;
      this.content = content;
      this.dueDate = dueDate;
      this.state = state;
      this.listId = todoList.id;
    }
  }

  prepend() {
    TodoList.em.prepend(Todo.createFragment(this));
    TodoList.em.scrollTo(0, 0);

    const em = TodoList.em.querySelector('.js-todo');

    const addTodoKeyframes = new KeyframeEffect(
      em,
      [
        {
          marginTop: `-${em.clientHeight}px`,
          opacity: 0,
        },
        {
          marginTop: 'calc(10px + var(--s-base))',
          opacity: 1,
          offset: .6,
        },
        {
          marginTop: 'var(--s-base)',
          opacity: 1,
        },
      ],
      {
        duration: 300,
        timingFunction: 'ease-in'
      },
    );

    const addTodoAnimation = new Animation(addTodoKeyframes);
    addTodoAnimation.play();
    
    Todo.addStreak++;

    const toastArray = Toast.trackEm.querySelectorAll('.js-toast--todo-added');
    
    if (toastArray.length > 0 && Todo.addStreak > 1) {
      toastArray[0].changeContent(Todo.addStreak + ' todos were added');

    } else {
      Todo.addStreak = 1;
      new Toast(
        '1 todo was added',
        {
          modificator: 'todo-added',
          closeFn() {
            Todo.addStreak = 0;
          }
        }
      );
    }
  }

  delete() {
    const currentListCollection = ListCollection.findCurrent();
    const todoList = currentListCollection.listArray.find(list => list.id === this.listId);
    
    if (TodoList.selectedTodoArray.includes(this)) {
      TodoList.selectedTodoArray.splice(TodoList.selectedTodoArray.indexOf(this), 1);
      TodoList.updateSelected();
    }
    todoList.todoArray.splice(todoList.todoArray.indexOf(this), 1);
    todoList.updateInfo();
    
    TodoList.deletedTodoArchive.push(this);

    if (todoList.id === TodoList.em.dataset.id) {
      const em = this.findElement();
      em.inert = true;

      const deleteTodoKeyframes = new KeyframeEffect(
        em,
        [
          {
            marginTop: '0px',
            opacity: 1,
          },
          {
            marginTop: `calc(-${em.clientHeight}px - 10px)`,
            opacity: 0,
            offset: .6,
          },
          {
            marginTop: `-${em.clientHeight}px`,
            opacity: 0,
          },
        ],
        {
          duration: 300,
          timingFunction: 'ease-in',
        },
      );

      const deleteTodoAnimation = new Animation(deleteTodoKeyframes);
      deleteTodoAnimation.play();
      deleteTodoAnimation.finished.then(() => {
        em.remove();
  
        const todoCountArray = TodoList.em.querySelectorAll('.js-todo-count');
        for (let i = 0; i < todoCountArray.length; i++) {
          todoCountArray[i].textContent = todoCountArray.length - i;
        }
      });
    }

    const toastArray = Toast.trackEm.querySelectorAll('.js-toast--todo-deleted');

    if (toastArray.length > 0) {
      toastArray[0].changeContent(TodoList.deletedTodoArchive.length + ' todos were deleted');
      
    } else {
      new Toast(
        '1 todo was deleted',
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
        }
      );
    }
  }

  toggleState() {
    const todoList = ListCollection.findCurrent().listArray.find(list => list.id === this.listId);
    
    if (this.state === 'active') {
      this.state = 'finished';

      if (todoList.id === TodoList.em.dataset.id) {
        const em = this.findElement();
        em.classList.replace('todo--active', 'todo--finished');
        em.finishButton.tooltip.changeContent('Unfinish todo');
        em.finishButton.replaceChildren(document.importNode(Todo.emTemplate.content.querySelector('.js-todo-unfinish-icon-t').content, true));
      }

      const todoLeft = todoList.todoArray.length - todoList.finishedCount;
      
      const toastArray = Toast.trackEm.querySelectorAll('.js-toast--todo-finished');
      Todo.finishStreak++;

      if (toastArray.length > 0 && Todo.finishStreak > 1) {
        toastArray[0].changeContent(
          Todo.finishStreak + ' todos were finished! ' +
          (todoLeft > 1 ? (todoLeft + ' todos left') :
          todoLeft === 1 ? '1 todo left' :
          todoLeft < 1 && 'All finished!')
        );

      } else {
        Todo.finishStreak = 1;
        
        new Toast(
          '1 todo was finished! ' +
          (todoLeft > 1 ? (todoLeft + ' todos left') :
          todoLeft === 1 ? '1 todo left' :
          todoLeft < 1 && 'All finished!'),
          {
            modificator: `todo-finished`,
            closeFn() {
              Todo.finishStreak = 0;
            },
          },
        );
      }
      
    } else {
      this.state = 'active';

      if (todoList.id === TodoList.em.dataset.id) {
        const em = this.findElement();
        em.classList.replace('todo--finished', 'todo--active');
        em.finishButton.tooltip.changeContent('Finish todo');
        em.finishButton.replaceChildren(document.importNode(Todo.emTemplate.content.querySelector('.js-todo-finish-icon-t').content, true));
      }

      const todoLeft = todoList.todoArray.length - todoList.finishedCount;
      
      const toastArray = Toast.trackEm.querySelectorAll('.js-toast--todo-unfinished');
      Todo.finishStreak--;

      if (toastArray.length > 0) {
        toastArray[0].changeContent(todoLeft > 1 ? (todoLeft + ' todos left') : '1 todo left');

      } else {
        new Toast(
          todoLeft > 1 ? (todoLeft + ' todos left') : '1 todo left',
          {modificator: 'todo-unfinished'},
        );
      }
    }

    todoList.updateInfo();
  }

  select() {
    if (TodoList.selectedTodoArray.includes(this)) {
      TodoList.selectedTodoArray.splice(TodoList.selectedTodoArray.indexOf(this), 1);

    } else {
      TodoList.selectedTodoArray.push(this);
    }
    
    TodoList.updateSelected();
  }

  findElement() {
    return TodoList.em.querySelector(`[data-todo-id="${this.id}"`);
  }

  static createFragment(todoObject) {
    const currentListCollection = ListCollection.findCurrent();
    const todoList = currentListCollection.listArray.find(list => list.id === todoObject.listId);
    
    const todoFragment = document.importNode(Todo.emTemplate.content, true);
    const todo = todoFragment.querySelector('.js-todo');
    todo.dataset.todoId = todoObject.id;
    todo.classList.add(`todo--${todoObject.state}`);

    todo.addEventListener('mousedown', (e) => {
      if (e.target.nodeName === 'BUTTON') {
        delete todo.dataset.pressed;
        return;
      }

      todo.dataset.pressed = true;
    });

    todo.addEventListener('mouseup', (e) => {
      if (!todo.dataset.pressed) return;

      toggleButtons(true);
      todo.focus();
    });

    todo.addEventListener('focusout', (e) => {
      if (todo.contains(e.relatedTarget)) return;

      toggleButtons(false);
    });

    todo.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (
          todo.checkbox.contains(e.target) ||
          closeButton.contains(e.target)
        ) {
          return;
        }

        if (deleteButton.contains(e.target)) {
          todoObject.delete();

        } else if (todo.finishButton.contains(e.target)) {
          todoObject.toggleState();
        }
        
        toggleButtons();
        todo.focus();

      } else if (e.code === 'Escape') {
        toggleButtons(false);
      }
    });

    todo.checkbox = todoFragment.querySelector('.js-checkbox');
    new Checkbox(todo.checkbox, () => { todoObject.select(); });
    new Tooltip(todo.checkbox, 'Select todo');

    const count = todoFragment.querySelector('.js-todo-count');
    if (todoList.contentFragment) {
      count.textContent = todoList.todoArray.length - todoList.contentFragment.childElementCount;

    } else {
      count.textContent = TodoList.em.childElementCount;
    }

    todo.content = todoFragment.querySelector('.js-todo-content');
    
    todo.content.text = todoFragment.querySelector('.js-todo-content-text');
    todo.content.text.textContent = todoObject.content;

    if (todoObject.dueDate) {
      todo.dueDate = todoFragment.querySelector('.js-todo-due-date');
      const formatter = new Intl.DateTimeFormat(navigator.language);
      const dateParts = formatter.formatToParts(todoObject.dueDate);
      todo.dueDate.dateTime = `${dateParts.find(part => part.type === 'year').value}-${dateParts.find(part => part.type === 'month').value}-${dateParts.find(part => part.type === 'day').value}`;
      todo.dueDate.textContent = formatter.format(todoObject.dueDate);
    }

    const buttonsContainer = todoFragment.querySelector('.js-todo-buttons');

    const deleteButton = todoFragment.querySelector('.js-todo-delete-button');
    deleteButton.addEventListener('mousedown', (e) => {
      createRippleElement(todo, e, 'todo-delete');
    });

    deleteButton.addEventListener('click', (e) => {
      if (e.detail < 1) return;

      todoObject.delete();
      toggleButtons(false);
      todo.focus();
    });

    new Tooltip(deleteButton, 'Delete todo');

    todo.finishButton = todoFragment.querySelector('.js-todo-finish-button');

    todo.finishButton.replaceChildren(
      document.importNode(
        todoFragment.querySelector(
          todoObject.state === 'active' ?
            '.js-todo-finish-icon-t' :
            '.js-todo-unfinish-icon-t'
        ).content, true
      )
    );

    todo.finishButton.addEventListener('mousedown', (e) => {
      if (todoObject.state === 'active') createRippleElement(todo, e, 'todo-finish');
    });
    
    todo.finishButton.addEventListener('click', (e) => {
      if (e.detail < 1) return;

      todoObject.toggleState();
      toggleButtons(false);
      todo.focus();
    });

    todo.finishButton.tooltip = new Tooltip(
      todo.finishButton,
      `${todoObject.state === 'active' ? 'Finish todo' : 'Unfinish todo'}`
    );

    const closeButton = todoFragment.querySelector('.js-todo-close-button')
    closeButton.addEventListener('mousedown', (e) => {
      createRippleElement(e.currentTarget, e, 'dk');
    });
    closeButton.addEventListener('click', (e) => {
      toggleButtons(false);
      todo.focus();
    });
    new Tooltip(closeButton, 'Hide buttons');

    const toggleButtons = (force = buttonsContainer.inert) => {
      buttonsContainer.inert = !force;
      todo.checkbox.inert = force;
      buttonsContainer.classList.toggle('is-hidden', !force);
      buttonsContainer.classList.toggle('is-visible', force);
    };

    return todo;
  }
}

export { Todo };