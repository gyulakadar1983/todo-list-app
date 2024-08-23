import { Tooltip } from '../tooltip/Tooltip.js';

class Carousel {
  constructor(carouselEm, sliderConfig, options) {
    this.carousel = carouselEm,
    this.slider = carouselEm.querySelector('.js-carousel-slider'),
    this.slideCollection = this.slider.getElementsByTagName('LI');
    this.prevButton = carouselEm.querySelector('.js-carousel-prev-button'),
    this.nextButton = carouselEm.querySelector('.js-carousel-next-button'),
    new Tooltip(this.prevButton, 'Previous');
    new Tooltip(this.nextButton, 'Next');

    this.offset = 0;

    this.sliderConfig = sliderConfig;
    if (this.sliderConfig) {
      this.slider.classList.add('carousel__slider--auto-slide-generation');
      [...this.slideCollection][Math.floor(this.slideCollection.length / 2)].classList.add('is-current');
    };
    this.minOffset = options?.minOffset || 0;
    this.maxOffset = options?.maxOffset || 0;

    this.prevButton.addEventListener('click', () => {
      this.spin('left');
    });
    this.nextButton.addEventListener('click', () => {
      this.spin('right');
    });
  }

  spin(direction) {
    if (this.sliderConfig) {
      if (direction === 'right' && this.offset < this.maxOffset) {
        const slide = document.createElement('li');
        slide.classList.add('carousel__slide');
        slide.append(this.sliderConfig.createNextSlide());
        this.slider.append(slide);

        slide.classList.add('carousel__slide--spin-right');
        slide.getAnimations().find(a => a.animationName === 'carousel-spin-right').finished.then(() => slide.classList.remove('carousel__slide--spin-right')).catch(() => {});
        this.slideCollection[0].remove();

        this.offset++;
  
      } else if (direction === 'left' && this.offset > this.minOffset) {
        const slide = document.createElement('li');
        slide.classList.add('carousel__slide');
        slide.append(this.sliderConfig.createPrevSlide());
        this.slider.prepend(slide);

        slide.classList.add('carousel__slide--spin-left');
        slide.getAnimations().find(a => a.animationName === 'carousel-spin-left').finished.then(() => slide.classList.remove('carousel__slide--spin-left')).catch(() => {});
        this.slideCollection[this.slideCollection.length - 1].remove();

        this.offset--;
      }

      [...this.slideCollection].find(slide => slide.classList.contains('is-current')).classList.remove('is-current');
      [...this.slideCollection][Math.floor(this.slideCollection.length / 2)].classList.add('is-current');

      this.onSliderSpin?.call(this);

      if (this.offset === this.minOffset) {
        this.prevButton.classList.add('is-disabled');

      } else if (this.offset === this.maxOffset) {
        this.nextButton.classList.add('is-disabled');
        
      } else {
        this.nextButton.classList.remove('is-disabled');
        this.prevButton.classList.remove('is-disabled');
      }
    }
  }

  setSlide(slide) {
    this.offset = slide;

    if (this.offset === this.minOffset) {
      this.prevButton.classList.add('is-disabled');

    } else if (this.offset === this.maxOffset) {
      this.nextButton.classList.add('is-disabled');
      
    } else {
      this.nextButton.classList.remove('is-disabled');
      this.prevButton.classList.remove('is-disabled');
    }
  }
}

export { Carousel };