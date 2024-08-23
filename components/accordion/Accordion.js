import { createRippleElement } from '../effects/effects.js';

class Accordion {
  active = false;

  constructor(container, state) {
    this.container = container;
    this.body = container.querySelector('.js-accordion__body');
    this.toggleButton = container.querySelector('.js-accordion__button-toggle');

    this.toggleButton.addEventListener('mousedown', (e) => {
      createRippleElement(e.currentTarget, e, 'dk');
    });
    this.toggleButton.addEventListener('click', () => {
      this.toggle();
    });

    new MutationObserver(() => {
      if (!this.active) return;

      this.body.style.maxHeight = `${this.body.scrollHeight}px`;
    }).observe(this.body, {childList: true});

    this.body.addEventListener('transitionend', (e) => {
      if (!this.active && e.propertyName === 'max-height') {
        this.body.style.overflow = 'hidden';
      }
    });

    if (this.active = state || false) {
      this.open();

    } else {
      this.close();
    }

    // this.body.style.maxHeight = `${this.body.scrollHeight}px`;
  }

  open() {
    this.container.classList.remove('is-collapsed');
    this.body.style.maxHeight = `${this.body.scrollHeight}px`;
    this.body.style.overflow = '';
    this.body.inert = false;

    this.active = true;
  }

  close() {
    this.container.classList.add('is-collapsed');
    this.body.style.maxHeight = `0px`;
    this.body.inert = true;

    this.active = false;
  }

  toggle() {!this.active ? this.open() : this.close()};
}

export { Accordion };