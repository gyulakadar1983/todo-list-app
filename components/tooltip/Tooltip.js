class Tooltip {
  static lastActive = null;
  
  constructor(em, content, anchor = em) {
    this.em = em;
    this.anchor = anchor;
    
    const tooltipFragment = document.importNode(document.querySelector('.js-tooltip-t').content, true);

    this.tooltip = tooltipFragment.querySelector('.js-tooltip');
    this.tooltip.content = tooltipFragment.querySelector('.js-tooltip-content');
    this.tooltip.content.append(content);

    this.hasFocus = false;
    this.hasHover = false;

    this.em.tooltipObject = this;

    this.ignoreFocus = false;
    this.disabled = false;

    this.showTimeoutId = null;
    this.hideTimeoutId = null;
    
    this.em.addEventListener('keyup', (e) => {
      if (this.disabled) return;
      if (document.body.contains(this.tooltip)) return;
      
      if (e.code === 'Tab') {
        this.moveToBody();
      }

    });

    this.em.addEventListener('focusout', (e) => {
      if (!document.body.contains(this.tooltip)) {
        return void clearTimeout(this.showTimeoutId);
      }

      clearTimeout(this.hideTimeoutId);
      this.tooltip.remove();
    });

    this.em.addEventListener('keydown', (e) => {
      if (!document.body.contains(this.tooltip)) {
        return void clearTimeout(this.showTimeoutId);
      }

      clearTimeout(this.hideTimeoutId);
      this.tooltip.remove();
    });

    this.em.addEventListener('mouseenter', (e) => {
      if (this.disabled) return;
      if (document.body.contains(this.tooltip)) {
        clearTimeout(this.hideTimeoutId);
        return;
      }
      
      this.showTimeoutId = setTimeout(() => {
        this.moveToBody();
      }, 250);
    });

    this.em.addEventListener('mouseleave', (e) => {
      if (!document.body.contains(this.tooltip)) {
        return void clearTimeout(this.showTimeoutId);
      }

      this.hideTimeoutId = setTimeout(() => {
        this.removeFromBody();
      }, 250);
    });

    document.addEventListener('keydown', (e) => {
      if (e.code !== 'Escape') return;
      
      if (document.body.contains(this.tooltip)) {
        clearTimeout(this.hideTimeoutId);
        this.removeFromBody();
        return;
      }

      clearTimeout(this.showTimeoutId);
    });

    document.addEventListener('mousedown', (e) => {
      if (document.body.contains(this.tooltip)) {
        clearTimeout(this.hideTimeoutId);
        this.removeFromBody();
        return;
      }

      clearTimeout(this.showTimeoutId);
    });
  }

  changeContent(content) {
    this.tooltip.textContent = content;
  }

  disable() {
    this.disabled = true;
    this.removeFromBody();
  }

  moveToBody() {
    document.body.append(this.tooltip);

    const anchorRect = this.anchor.getBoundingClientRect();
    this.tooltip.style.top = `${anchorRect.y - this.tooltip.clientHeight - 10}px`;
    this.tooltip.style.left = `${anchorRect.x - (this.tooltip.clientWidth / 2 - this.anchor.clientWidth / 2)}px`;

    const tooltipRect = this.tooltip.getBoundingClientRect();
    if (tooltipRect.right + 10 > document.documentElement.clientWidth) {
      this.tooltip.style.left = `${anchorRect.x - this.tooltip.clientWidth + this.anchor.clientWidth}px`;

    } else if (tooltipRect.left - 10 < 0) {
      this.tooltip.style.left = `${anchorRect.x}px`;
    }
    if (tooltipRect.top - 10 < 0) {
      this.tooltip.style.top = `${anchorRect.bottom + 10}px`;
    }
    
    this.tooltip.classList.add('is-visible');  
  }

  removeFromBody() {
    this.tooltip.classList.remove('is-visible');
    const t = [...this.tooltip.getAnimations()].find(t => t.transitionProperty === 'opacity');
    t?.finished
      .then(() => {
        this.tooltip.remove();
        this.tooltip.style.top = '';
        this.tooltip.style.left = '';
        this.tooltip.style.translate = '';
      })
      .catch(() => {});
  }
}

export { Tooltip };