class EditableContent {
  constructor(em, saveFn, options) {
    this.em = em;
    this.saveFn = saveFn;
    this.options = options;
    
    this.savedValue = this.em.textContent.trim();
    
    this.em.addEventListener('focus', (e) => {
      const range = document.createRange();
      range.selectNodeContents(this.em);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      this.savedValue = this.em.textContent.trim();
    });

    this.em.addEventListener('beforeinput', (e) => {
      const sel = window.getSelection();
      if (
        this.em.textContent.length >= this.options.maxLength &&
        e.inputType.includes('insert') &&
        this.em.contains(sel.anchorNode) &&
        Math.abs(sel.anchorOffset - sel.focusOffset) < 1
      ) {
        e.preventDefault();
      }
    });
    
    this.em.addEventListener('focusout', (e) => {
      if (this.em.textContent.trim() && this.em.textContent.trim() !== this.savedValue) {
        this.save();
      }

      this.reset();
    });

    this.em.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        this.save();
        this.reset();
        
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        
        this.reset();
      }
    });

    new MutationObserver((mList) => {
      for (const m of mList) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 3 && node.nodeName !== 'BR') {
            node.remove();
          }
        }
      }
    }).observe(this.em, { childList: true });
  }

  reset() {
    this.em.textContent = this.savedValue;
    this.em.scrollLeft = 0;
    this.em.blur();
    window.getSelection().removeAllRanges();

    if (this.options.autoDisable) {
      this.em.contentEditable = false;
    }
  }

  save() {
    const value = this.em.textContent.trim();
    
    if (value.length) {
      this.savedValue = value;
      this.saveFn();
      return true;

    } else {
      return false;
    }
  }
}

export { EditableContent };