class SwitchButton {
  onstatetoggle = null;

  constructor(button, fnStateOn, fnStateOff, state) {

    this.button = {
      em: button,
      rectX: null,
    };

    this.bar = {
      em: button.querySelector('.js-button-switch__bar'),
      rectX: null,
      translateX: null,
      offset: null,
      offsetInitial: null,
      offsetMin: null,
      offsetMax: null,
      lastEvent: null,
      controller: new AbortController(),
    }
    
    this.bar.offsetInitial = this.bar.em.offsetLeft;
    this.bar.offsetStateOff = this.bar.offsetInitial;
    this.bar.offsetStateOn = this.button.em.clientWidth
                            - this.bar.em.clientWidth
                            - this.bar.offsetInitial;
    this.bar.offsetMin = this.bar.offsetInitial - 1;
    this.bar.offsetMax = this.bar.offsetStateOn + 1;
    
    this.fnStateOn = fnStateOn;
    this.fnStateOff = fnStateOff;

    this.state = state || false;
    this.setState(state);

    this.bar.em.addEventListener('pointerdown', (e) => {
      this.bar.em.setPointerCapture(e.pointerId);

      this.bar.rectX = this.bar.em.getBoundingClientRect().x;
      this.bar.translateX = e.clientX - this.bar.rectX;

      this.button.rectX = this.button.em.getBoundingClientRect().x;

      this.bar.em.addEventListener('pointermove', (e) => {
        this.bar.em.classList.add('is-dragging');
        
        if (e.movementX) this.lastEvent = e.type;
        
        this.bar.offset = e.clientX - this.button.rectX - this.bar.translateX;
        
        if (this.bar.offset > this.bar.offsetMax) {
          this.bar.em.style.left = `${this.bar.offsetMax}px`;

        } else if (this.bar.offset < this.bar.offsetMin) {
          this.bar.em.style.left = `${this.bar.offsetMin}px`;

        } else {
          this.bar.em.style.left = `${this.bar.offset}px`;
        }
      }, {signal: this.bar.controller.signal});
    });
    
    for (const label of this.button.em.labels) {
      label.addEventListener('pointerdown', (e) => {
        this.lastEvent = e.type;
      });
    }

    this.button.em.addEventListener('pointerdown', (e) =>{
      this.lastEvent = e.type;
    });

    this.button.em.addEventListener('click', (e) => {
      if (this.lastEvent !== 'lostpointercapture' && this.lastEvent !== 'pointermove') {
        this.setState(!this.state);
      }
    });

    this.bar.em.addEventListener('lostpointercapture', (e) => {
      this.bar.em.classList.remove('is-dragging');

      this.bar.controller.abort();
      this.bar.controller = new AbortController();
      
      if (this.lastEvent !== 'pointermove') return;

      if (
        this.bar.em.getBoundingClientRect().x +
        this.bar.em.clientWidth / 2 >=
        this.button.rectX +
        this.button.em.clientWidth / 2
      ) {
        if (!this.state) {
          this.setState(true);
          
        } else {
          this.bar.em.style.left = `${this.bar.offsetStateOn}px`;
        }
        
      } else {
        if (this.state) {
          this.setState(false);

        } else {
          this.bar.em.style.left = `${this.bar.offsetStateOff}px`;
        }
      }
    });
  }

  setState(state) {
    this.state = state;
    
    if (state) {
      this.fnStateOn();
      this.button.em.classList.replace('is-inactive', 'is-active');
      this.bar.em.style.left = `${this.bar.offsetStateOn}px`;

    } else {
      this.fnStateOff();
      this.button.em.classList.replace('is-active', 'is-inactive');
      this.bar.em.style.left = `${this.bar.offsetStateOff}px`;
    }

    this.onstatetoggle?.();
  }
}

class Checkbox {
  constructor(em, onStateOn, onStateOff) {
    this.em = em;
    this.onStateOn = onStateOn;
    this.onStateOff = onStateOff;
    
    this.em.addEventListener('click', (e) => {
      if (e.detail > 0) return;
      
      this.em.toggle();
    });
    
    this.em.addEventListener('mousedown', (e) => {
      this.em.toggle();
    });
    
    this.em.toggle = () => {
      if (this.onStateOn && this.onStateOff) {
        if (this.em.classList.replace('is-inactive', 'is-active')) {
          this.onStateOn();

        } else if (this.em.classList.replace('is-active', 'is-inactive')) {
          this.onStateOff();
        }

      } else if (this.onStateOn) {
        this.em.classList.toggle('is-inactive');
        this.em.classList.toggle('is-active');
        this.onStateOn();
      }
    }
  }
}

export { SwitchButton, Checkbox };