class Toast {
  static emTemplate = document.querySelector('.js-toast-t');
  static trackEm = document.querySelector('.js-toast-track');
  
  constructor(content, options) {
    this.options = options;
    
    this.toastFragment = document.importNode(Toast.emTemplate.content, true);

    this.toast = this.toastFragment.querySelector('.js-toast');

    this.toast.content = this.toast.querySelector('.js-toast-content')

    this.toast.content.text = this.toast.querySelector('.js-toast-text');
    this.toast.content.text.append(content);

    if (this.options?.type) {
      this.toast.classList.add(`toast--${this.options.type}`);

      if (this.options.type === 'error') {
        this.toast.content.before(document.importNode(Toast.emTemplate.content.querySelector('.js-toast-error-icon-t').content, true));
        
      } else if (this.options.type === 'success') {
        this.toast.content.before(document.importNode(Toast.emTemplate.content.querySelector('.js-toast-success-icon-t').content, true));
      }
    }

    const closeButton = this.toast.querySelector('.js-toast-close-button');
    closeButton.addEventListener('mousedown', (e) => {
      fadeInAnimation.finish();
    });

    if (this.options?.buttonText) {
      const button = document.createElement('button');
      button.classList.add('toast__action-button', 'js-toast-action-button');
      button.textContent = this.options.buttonText;
      button.onclick = () => {
        this.options.buttonFn();
        fadeInAnimation.finish();
      };
  
      this.toast.content.append(button);
    }
    
    const toastArray = Toast.trackEm.querySelectorAll('.js-toast');
    if (toastArray.length + 1 > 3) {
      toastArray[0].delete();
    }
    
    if (this.options?.modificator) {
      this.toast.classList.add(`js-toast--${this.options.modificator}`);
      const filteredArray = [...toastArray].filter(toast => toast.className.includes(this.options.modificator));
      
      if (filteredArray.length + 1 > 1) {
        filteredArray.map(toast => toast.delete()); 
      }
    }
  
    Toast.trackEm.append(this.toast);

    const fadeInKeyframes = new KeyframeEffect(
      this.toast,
      [
        {
          marginBottom: `${-this.toast.clientHeight}px`,
          opacity: 0,
        },
        {
          marginBottom: 'calc(var(--s-sm) + 5px)',
          opacity: .5,
          offset: .05,
        },
        {
          marginBottom: 'var(--s-sm)',
          opacity: 1,
          offset: .1,
        },
        {
          marginBottom: 'var(--s-sm)',
          opacity: 1,
          offset: 1,
        },
      ],
      {
        duration: 3000,
        timingFunction: 'ease-in'
      },
    )

    const fadeOutKeyframes = new KeyframeEffect(
      this.toast,
      [
        {
          marginBottom: `${-this.toast.clientHeight}px`,
          opacity: 0,
        },
      ],
      {
        duration: 100,
        timingFunction: 'ease-in',
      },
    );
    
    const fadeInAnimation = new Animation(fadeInKeyframes);
    fadeInAnimation.play();
    fadeInAnimation.finished.then(() => {
      this.toast.delete();
    }).catch(() => {});

    this.delayTimeoutId = null;
    this.toast.changeContent = (newContent) => {
      this.toast.content.text.replaceChildren(newContent);
      
      const duration = fadeInAnimation.effect.getTiming().duration;
      if (fadeInAnimation.currentTime > duration / 2) {
        fadeInAnimation.pause();
        clearTimeout(this.delayTimeoutId);
        this.delayTimeoutId = setTimeout(() => {
          fadeInAnimation.finish();
        }, duration / 2);
      }
    };
    
    this.toast.delete = () => {
      this.toast.inert = true;
      const fadeOutAnimation = new Animation(fadeOutKeyframes);
      fadeOutAnimation.play();
      fadeOutAnimation.finished.then(() => {
        this.options?.closeFn?.();
        this.toast.remove();
      });
    };
  }
}

export { Toast };