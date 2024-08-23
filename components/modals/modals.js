import { createRippleElement } from '../effects/effects.js';

class Modal {
  active = false;
  visible = false;
  onopen = null;
  onclose = null;
  relatedEmList = [];

  constructor(structure, options) {
    if (structure.nodeType) {
      this.content = structure;

    } else {
      this.content = structure.content;
    }
    
    this.modal = this.content.closest('.js-modal');
    this.modal.inert = true;
    this.container = this.modal.closest('.js-modal-container');
    this.toggleButton = this.container?.querySelector('.js-modal-toggle-button') || structure.toggleButton;
    this.closeButton = this.modal.querySelector('.js-modal-close-button');

    if (this.toggleButton) {
      this.modal.toggleButton = this.toggleButton;
      this.modal.toggleButton.modal = this.modal;

      this.toggleButton.addEventListener('mousedown', (e) => {
        createRippleElement(e.currentTarget, e, 'dk');
      });
  
      this.toggleButton.addEventListener('click', (e) => {
        if (!(this instanceof Select) || e.detail === 0) {
          this.toggle();
        }
      });
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('mousedown', (e) => {
        createRippleElement(e.currentTarget, e, 'dk');
      });
      
      this.closeButton.addEventListener('click', (e) => {
        this.close();
      });
    }

    if (options) {
      this.options = options;
      this.options.detached && this.modal.remove();
    }

    document.addEventListener('mousedown', (e) => {
      if (
        this.modal.classList.contains('is-visible') &&
        !this.toggleButton?.contains(e.target) &&
        !this.modal.contains(e.target) &&
        !this.modal.contains(e.target.closest('.js-modal')?.toggleButton) &&
        !this.relatedEmList.find(em => em.contains(e.target)) &&
        !e.target.closest('.js-toast')
      ) {
        this.close();
      };
    });
    
    const focusTriggers = [this.modal];
    if (this.container?.contains(this.modal)) focusTriggers.push(this.toggleButton);
    
    for (const em of focusTriggers) {
      em.addEventListener('focusout', (e) => {
        if (
          this.modal.classList.contains('is-visible') &&
          document.body.contains(e.relatedTarget) &&
          !this.toggleButton?.contains(e.relatedTarget) &&
          !this.modal.contains(e.relatedTarget) &&
          !this.modal.contains(e.relatedTarget.closest('.js-modal')?.toggleButton) &&
          !this.relatedEmList.find(em => em.contains(e.relatedTarget)) &&
          !e.relatedTarget.closest('.js-toast')
        ) {
          this.close();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (this.modal.classList.contains('is-hidden')) return;
      
      if (e.code === 'Escape') {
        for (const toggleButton of this.modal.querySelectorAll('.js-modal-toggle-button')) {
          if (!toggleButton.modal.inert) {
            return;
          }
        }

        for (const em of this.relatedEmList) {
          if (!em.closest('.js-modal').inert) {
            return;
          }
        }
        
        this.close();
      }
    });
  }

  open() {
    if (this.options?.detached) {
      if ([...document.body.children].includes(this.modal)) {
        return void this.modal.remove();
      }
  
      this.moveToBody();
  
      this.modal.style.transitionDuration = '';
    }

    this.modal.classList.replace('is-hidden', 'is-visible');
    this.toggleButton?.classList.replace('is-inactive', 'is-active');

    this.modal.getAnimations().find(t => t.transitionProperty === 'opacity')?.finished.then(() => {
      this.modal.inert = false;
      this.closeButton?.focus();
      this.onopen?.call();
    }).catch(() => {});
      
    this.active = true;
  }
  
  close() {
    this.modal.classList.replace('is-visible', 'is-hidden');
    this.toggleButton?.classList.replace('is-active', 'is-inactive');
    this.toggleButton?.focus();
    this.active = false;

    this.modal.getAnimations().find(t => t.transitionProperty === 'opacity')?.finished.then(() => {
      if (this.options?.detached) {
        this.removeFromBody();
      }
      this.modal.inert = true;
    }).catch(() => {});

    this.onclose?.call();
  }

  toggle() {
    !this.active ? this.open() : this.close();
  };
  
  moveToBody() {
    document.body.append(this.modal);

    this.buttonRect = this.toggleButton?.getBoundingClientRect();

    this.top = this.options?.top || this.buttonRect?.bottom || document.body.clientHeight / 2 - this.modal.clientHeight / 2;
    this.left = this.options?.left || this.buttonRect?.x || document.body.clientWidth / 2 - this.modal.clientWidth / 2;

    this.modal.style.transitionDuration = '0ms';
    this.modal.style.top = `${this.top - 0}px`;
    this.modal.style.left = `${this.left - 0}px`;
    this.modal.zIndex = document.body.querySelectorAll('& > .modal').length + 100;
    this.modal.style.zIndex = this.modal.zIndex;

    if (this instanceof Select) {
      this.modal.style.minWidth = `${this.toggleButton.clientWidth}px`;
      
      const modalRect = this.modal.getBoundingClientRect();
      const buttonRect = this.toggleButton.getBoundingClientRect();

      const distanceTop = buttonRect.y;
      const distanceBottom = document.documentElement.clientHeight - buttonRect.bottom;

      this.modal.style.maxHeight = `${Math.max(distanceTop, distanceBottom)}px`;

      if (modalRect.bottom + 10 > document.documentElement.clientHeight && distanceTop > distanceBottom) {
        this.modal.style.top = `${buttonRect.y - this.modal.clientHeight}px`;
        this.modal.classList.add('modal--offset-top');

      } else {
        this.modal.classList.remove('modal--offset-top');
      }
      
      if (modalRect.right > document.documentElement.clientWidth) {
        this.modal.style.left = `${this.left - this.modal.clientWidth}px`;
      }
    }
  }

  removeFromBody() {
    this.modal.style.top = '';
    this.modal.style.left = '';
    this.modal.style.zIndex = '';

    this.modal.remove();
  }
}

class Select extends Modal {
  constructor(element, itemFunctions, options) {
    super(element, {detached: true});

    this.type = options?.type;

    this.toggleButton.addEventListener('mousedown', (e) => {
      if (!this.active) {
        this.open();

      } else {
        this.toggleButton.addEventListener('mouseup', (e) => {
          this.close();
        }, {once: true});
      }
    });

    this.toggleButton.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp'].includes(e.code) && !this.active) {
        this.open();
      }
    });

    document.body.addEventListener('scroll', (e) => {
      if (
        this.modal.inert ||
        this.modal.classList.contains('is-hidden') ||
        this.modal.contains(e.target)
      ) {
        return;
      }
      
      this.close();
    }, true);

    if (itemFunctions) {
      this.items = {
        array: [...this.content.getElementsByTagName('li')],
        active: null,
        activeIndex: 0,
        keySearch: {
          key: null,
          indexCurrent: 0,
          indexTemp: 0,
          indexArray: [],
        },
      };
      
      new MutationObserver(() => {
        if (this.modal.classList.contains('is-visible')) {
          if (this.items.active) {
            this.items.active.button.focus();

          } else {
            this.items.array[0].button.focus();
          }

        } else {
          this.resetKeySearch();
        }
      }).observe(this.modal, {attributes: true});

      this.items.array.map(item => {
        item.button = item.querySelector('button');

        item.button.addEventListener('mousedown', (e) => {
          createRippleElement(e.currentTarget, e, 'dk');
        });

        item.button.addEventListener('mouseup', (e) => {
          this.close();
          
          if (this.type) {
            this.select(e.currentTarget);
            
          } else {
            e.currentTarget.function?.();
            this.defaultFunction?.();
          }
        });
        
        item.button.addEventListener('click', (e) => {
          if (e.detail > 0) return;
          
          this.close();
          
          if (this.type) {
            this.select(e.currentTarget);
    
          } else {
            e.currentTarget.function?.();
            this.defaultFunction?.();
          }
        });
      });

      if (this.type) {
        this.toggleButton.textEm = this.toggleButton.querySelector('.js-inner-text') || this.toggleButton;
        this.select(0, true);
      }

      itemFunctions.map(obj => {
        if (obj.button) {
          obj.button.function = obj.function;
        }
      });
      this.defaultFunction = itemFunctions.find(item => typeof(item) === 'function');

      document.addEventListener('keydown', (e) => {
        if (this.modal.inert) return;

        if (
          [
            'ArrowUp', 'ArrowDown', 'ArrowLeft',
            'ArrowRight', 'Home', 'End',
            'PageUp', 'PageDown'
          ].includes(e.key)
        ) {
          e.preventDefault();
          
          if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
            if (this.items.keySearch.indexCurrent >= 1) {
              this.items.keySearch.indexCurrent--;
  
            } else this.items.keySearch.indexCurrent = this.items.array.length - 1;
  
          } else if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
            if (this.items.keySearch.indexCurrent <= this.items.array.length - 2) {
              this.items.keySearch.indexCurrent++;
  
            } else this.items.keySearch.indexCurrent = 0;
  
          } else if (e.key === 'PageDown') {
            this.items.keySearch.indexCurrent = this.items.array.findLastIndex(item => item.offsetTop < this.content.scrollTop + this.modal.clientHeight - this.items.array[0].clientHeight);
            
          } else if (e.key === 'PageUp') {
            this.items.keySearch.indexCurrent = this.items.array.findIndex(item => item.offsetTop > this.content.scrollTop - this.modal.clientHeight + this.items.array[0].clientHeight);
            
          } else if (e.key === 'Home') {
            this.items.keySearch.indexCurrent = 0;
            
          } else if (e.key === 'End') {
            this.items.keySearch.indexCurrent = this.items.array.length - 1;
          }
          
          this.items.keySearch.indexTemp = -1;
          this.items.array[this.items.keySearch.indexCurrent].button.focus();
          this.items.array[this.items.keySearch.indexCurrent].button.scrollIntoView();
  
        } else {
          this.items.keySearch.indexArray.length = 0;
  
          this.items.array.forEach((item, index) => {
            if (item.innerText[0].toLowerCase() === e.key.toLowerCase()) {
              this.items.keySearch.indexArray.push(index);
            }
          });
  
          if (!this.items.keySearch.indexArray.length) return;
  
          if (this.items.keySearch.key === e.key.toLowerCase()) {
            this.items.array[this.items.keySearch
              .indexArray[++this.items.keySearch.indexTemp]
            ] || (this.items.keySearch.indexTemp = 0);
            this.items.keySearch.indexCurrent = this.items.keySearch
              .indexArray[this.items.keySearch.indexTemp];
  
          } else {
            this.items.keySearch.indexTemp = 0
            this.items.keySearch.indexCurrent = this.items.keySearch
              .indexArray[this.items.keySearch.indexTemp];
            this.items.keySearch.key = e.key.toLowerCase();
          }
  
          this.items.array[this.items.keySearch
            .indexArray[this.items.keySearch.indexTemp]
          ].button.focus();
          this.items.array[this.items.keySearch
            .indexArray[this.items.keySearch.indexTemp]
          ].button.scrollIntoView();
        }
      });
    }
  }

  select(item, classOnly) {
    this.items.active?.button.classList.remove('is-selected');
    this.items.active = this.items.array[item] || item.closest('li');
    this.items.active.button.classList.add('is-selected');
    this.items.activeIndex = this.items.array.indexOf(this.items.active);
    this.items.keySearch.indexCurrent = this.items.activeIndex;

    const itemContent = this.items.active.textContent.trim();
    this.toggleButton.textEm.textContent = itemContent;
    this.container.dataset.selectedOption = itemContent;

    if (classOnly) return;

    this.items.active.button.function?.();
    this.defaultFunction?.();
  }

  resetKeySearch() {
    this.items.keySearch.key = null;
    this.items.keySearch.indexCurrent = this.items.activeIndex;
    this.items.keySearch.indexTemp = 0;
    this.items.keySearch.indexArray = [];
  }
}

export { Modal, Select };