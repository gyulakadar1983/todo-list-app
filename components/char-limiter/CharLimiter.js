class CharLimiter {
  constructor(input, em, maxLength) {
    this.currentEm = em.querySelector('.js-char-limiter-current');
    this.maxEm = em.querySelector('.js-char-limiter-max');;

    this.currentEm.textContent = 0;
    this.maxEm.textContent = maxLength;
    
    input.addEventListener('input', () => {
      em.classList.toggle('is-inactive', input.value.length < maxLength);
      em.classList.toggle('is-active', input.value.length > maxLength);

      this.currentEm.textContent = input.value.length;
    });

    input.onblur = () => {if (!input.value) this.reset()};
  }

  reset() {
    this.currentEm.textContent = 0
  }
}

export { CharLimiter };