import { footerEm } from '../footer.js';
import { EditableContent } from '../../editable-content/EditableContent.js';
import { TodoList } from '../../todo-list/TodoList.js';
import { ListCollection } from '../../list-collection/ListCollection.js';

const listInfoObject = {
  em: footerEm.querySelector('.js-list-info'),
  titleObject: new EditableContent(
    footerEm.querySelector('.js-list-title'),
    function() {
      const todoList = ListCollection.findCurrent().findCurrentList();
      todoList.setTitle(listInfoObject.titleObject.savedValue);
    },
    {
      maxLength: TodoList.maxTitleLength,
    }
  ),
  finishedCount: footerEm.querySelector('.js-list-finished-count'),
  itemCount: footerEm.querySelector('.js-list-item-count'),
  update() {
    const todoList = ListCollection.findCurrent().findCurrentList();
    this.finishedCount.innerText = todoList.finishedCount;
    this.itemCount.innerText = todoList.todoArray.length;
    this.titleObject.em.textContent = this.titleObject.em.title = todoList.title;
  },
};

TodoList.onupdate.push(() => {
  listInfoObject.update();
});

export { listInfoObject };