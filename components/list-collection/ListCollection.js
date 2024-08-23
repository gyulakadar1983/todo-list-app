import { TodoList } from '../todo-list/TodoList.js';
import { Tooltip } from '../tooltip/Tooltip.js';
import { createRippleElement } from '../effects/effects.js';
import { listFormObject } from '../list-form/list-form.js';

const appEm = document.querySelector('.js-app');

class ListCollection {
  static em = document.querySelector('.js-list-collection');
  static emptyEm = document.querySelector('.js-list-collection-empty');
  static createListButton = document.querySelector('.js-list-collection-create-button');
  static deletedListArchive = [];

  constructor() {
    this.listArray = [];
  }

  addList(listObject) {
    this.listArray.unshift(listObject);

    return listObject;
  }
  
  render() {
    if (!this.listArray.length) {
      ListCollection.toggleEmpty(true);
      
      return;
    }
    
    this.contentFragment = document.createDocumentFragment();

    this.listArray.forEach((listObject) => {
      this.contentFragment.append(TodoList.createFragment(listObject));
    });
    
    ListCollection.em.replaceChildren(ListCollection.createListButton, this.contentFragment);

    delete this.contentFragment;
  }

  switchList(listObject) {
    const currentListIndex = this.findCurrentList(true);
    if (currentListIndex > -1) {
      this.listArray[currentListIndex].current = false;
    }
    const newCurrentList = listObject || this.listArray[currentListIndex + 1] || this.listArray[currentListIndex - 1];

    if (newCurrentList) {
      newCurrentList.current = true;
      ListCollection.toggleEmpty(false);

      for (const fn of TodoList.onswitch) {
        fn();
      }
      
      return newCurrentList;
      
    } else {
      ListCollection.toggleEmpty(true);
      return null;
    }
  }

  findCurrentList(index) {
    if (this.listArray) {
      if (index) {
        return this.listArray.findIndex(list => list.current);
        
      } else {
        return this.listArray.find(list => list.current);
      }
    }
  }

  static findCurrent() {
    return currentListCollection;
  }

  static toggleEmpty(force) {
    ListCollection.emptyEm.classList.toggle('is-visible', force);
    ListCollection.emptyEm.inert = !force;
    appEm.inert = force;
  }

  static saveToStorage() {
    localStorage.setItem('listCollection', JSON.stringify(ListCollection.findCurrent()));
  }
}

new Tooltip(ListCollection.createListButton, 'Create list');

ListCollection.createListButton.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'dk');
});

ListCollection.createListButton.addEventListener('click', (e) => {
  listFormObject.modal.open();
});

ListCollection.emptyEm.createUntitledBtn = ListCollection.emptyEm.querySelector('.js-list-collection-empty-create-untitled-btn');
ListCollection.emptyEm.createBtn = ListCollection.emptyEm.querySelector('.js-list-collection-empty-create-btn');

ListCollection.emptyEm.createUntitledBtn.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'dk');
});

ListCollection.emptyEm.createUntitledBtn.addEventListener('click', (e) => {
  const currentListCollection = ListCollection.findCurrent();
  const list = currentListCollection.addList(new TodoList('Untitled'));
  currentListCollection.switchList(list);
  list.render();
  list.prepend();
});

ListCollection.emptyEm.createBtn.addEventListener('mousedown', (e) => {
  createRippleElement(e.currentTarget, e, 'lt');
});

ListCollection.emptyEm.createBtn.addEventListener('click', (e) => {
  listFormObject.modal.open();
});

const currentListCollection = new ListCollection();

export { ListCollection };