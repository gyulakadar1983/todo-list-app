import { Tooltip } from '../tooltip/Tooltip.js';
import { createRippleElement } from '../effects/effects.js';

class Form {
  constructor(input, submitButton, submitFunction, validityConfig, resetFunction, resetButton) {
    this.input = input;
    this.submitButton = submitButton;
    this.submit = submitFunction;
    this.validityConfig = validityConfig;
    this.resetButton = resetButton;
    this.reset = resetFunction;

    const inputContainer = this.input.closest('.js-input-container');
    const errorHintElement = document.importNode(document.querySelector('.js-input-error-hint-t').content, true).querySelector('.js-input-error-hint');
    this.errorTooltip = new Tooltip(errorHintElement);
    this.errorTooltip.disable();

    inputContainer.append(errorHintElement);
    
    this.input.addEventListener('input', (e) => {
      this.validate();
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        this.submitButton.click();
      }
    });

    this.input.addEventListener('blur', (e) => {
      this.release();
    });
    
    this.submitButton.addEventListener('mousedown', (e) => {
      if (!this.validate()) return;
      createRippleElement(e.currentTarget, e, 'lt');
    });

    this.submitButton.addEventListener('click', (e) => {
      if (!this.validate()) return;
      this.submit();
      this.reset();
    });

    this.resetButton?.addEventListener('mousedown', (e) => {
      createRippleElement(e.currentTarget, e, 'dk');
    });

    this.resetButton?.addEventListener('click', (e) => {
      this.reset();
    });
  }

  validate() {
    if (this.validityConfig.valueMissing && !this.input.value.trim().length) {
      this.errorTooltip.changeContent('Please enter some text.')
      this.warn();
      return false;

    } else if (this.validityConfig.maxLength && this.input.value.length > this.validityConfig.maxLength) {
      this.errorTooltip.changeContent(`The text should be no longer than ${this.validityConfig.maxLength} characters.`);
      this.warn();
      return false;

    } else {
      this.release();
      return true;
    }
  }

  warn() {
    this.errorTooltip.disabled = false;
    this.errorTooltip.moveToBody();
    this.input.classList.add('is-invalid');
    this.input.focus();
  }

  release() {
    this.input.classList.remove('is-invalid');
    this.errorTooltip.disable();
  }
}

export { Form };