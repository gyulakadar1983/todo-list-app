import { getWeekStartByLocale } from 'weekstart';
import { Select } from '../modals/modals.js';
import { Carousel } from '../carousel/Carousel.js';
import { Tooltip } from '../tooltip/Tooltip.js';
import { createRippleElement } from '../effects/effects.js';

class DateFieldset {
  ondaychange = null;
  onmonthchange = null;
  onyearchange = null;

  constructor(fieldsetElement) {
    this.fieldset = fieldsetElement;
    this.date = new Date();
    this.lang = navigator.language;
    this.dateFormatParts = new Intl.DateTimeFormat(this.lang).formatToParts();

    this.dayInput = fieldsetElement.querySelector('.js-date-input');
    this.dayInput.value = this.dateFormatParts.find(part => part.type === 'day').value;
    this.dayInput.placeholder = 'dd';
    this.dayInput.maxLength = 2;
    Object.defineProperty(this.dayInput, 'max', {
      get: () => {
        return new Date(Number(this.yearInput.value), Number(this.monthInput.value), 0).getDate();
      }
    });

    this.monthInput = fieldsetElement.querySelector('.js-month-input');
    this.monthInput.value = this.dateFormatParts.find(part => part.type === 'month').value;
    this.monthInput.placeholder = 'mm';
    this.monthInput.maxLength = 2;
    this.monthInput.max = 12;

    this.yearInput = fieldsetElement.querySelector('.js-year-input');
    this.yearInput.value = this.dateFormatParts.find(part => part.type === 'year').value;
    this.yearInput.placeholder = 'yyyy';
    this.yearInput.maxLength = 4;
    this.yearInput.max = 9999;
    
    this.inputArray = [
      this[`${this.dateFormatParts[0].type}Input`],
      this[`${this.dateFormatParts[2].type}Input`],
      this[`${this.dateFormatParts[4].type}Input`]
    ];
    this.inputArray[0].id = 'date-fieldset__first-input';
    
    this.inputArray.forEach((em, index) => {
      em.min = 1;
      em.style.width = `${em.value.length + .5}ch`;
      
      em.addEventListener('focus', () => {
        em.select();
        em.onbeforeinput = (e) => {if (e.data === '0') e.preventDefault()};
      });
    
      em.addEventListener('click', () => {
        em.select();
      });

      em.addEventListener('beforeinput', (e) => {
        if (e.data === ' ' || isNaN(Number(e.data))) {
          e.preventDefault();
        }
      });

      em.addEventListener('input', (e) => {
        em.style.width = `${em.value.length + .5}ch`;
        
        if (Number(em.value) > Number(em.max)) {
          em.value = Number(em.max);
        }
        this.set(em);

        if (em.value.length >= Number(em.maxLength)) {
          this.inputArray[index + 1]?.focus();
          
        } else {
          em.onbeforeinput = null;
        }
        
        if (em === this.dayInput) {
          if (Number(em.value[0]) > 4) {
            this.inputArray[index + 1]?.focus();
          }
          
        } else if (em === this.monthInput) {
          if (Number(em.value[0]) > 1) {
            this.inputArray[index + 1]?.focus();
          }
    
        } else if (em === this.yearInput) {
          if (em.value.length > 3) {
            em.blur();
          }
        }
      });

      em.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          em.blur();

        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          em.value = '';

        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.inputArray[index + 1]?.focus();
          
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.inputArray[index + 1]?.focus();
          
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.inputArray[index - 1]?.focus();

        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          em.value = Math.min(Number(em.value) + 1, Number(em.max));
          this.set(em);
          em.select();

        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          em.value = Math.max(Number(em.value) - 1, Number(em.min));
          this.set(em);
          em.select();
        }
      });
    });

    this.literal = document.createElement('span');
    this.literal.classList.add('date-fieldset__literal');
    this.literal.textContent = this.dateFormatParts.find(part => part.type === 'literal').value;

    this.updateDateFieldsetFormat();

    this.resetButton = this.fieldset.querySelector('.js-date-fieldset-reset-button');
    this.resetButton.addEventListener('mousedown', (e) => {
      createRippleElement(e.currentTarget, e, 'dk');
    });
    this.resetButton.addEventListener('click', (e) => {
      this.setCurrent();
    });
    new Tooltip(this.resetButton, 'Reset date');
  }

  set(em) {
    if (em === this.dayInput) {
      this.date.setDate(Number(em.value));
      this.ondaychange?.();
      
    } else if (em === this.monthInput) {
      const nextLastDay = new Date(this.date.getFullYear(), Number(em.value) - 1 + 1, 0).getDate();
      if (this.date.getDate() >= nextLastDay) {
        this.date.setDate(nextLastDay);
        this.dayInput.value = this.date.getDate();
      }
      this.date.setMonth(Number(em.value) - 1);
      this.onmonthchange?.();
      
    } else if (em === this.yearInput) {
      const nextLastDay = new Date(Number(em.value), this.date.getMonth() + 1, 0).getDate();
      if (this.date.getDate() >= nextLastDay) {
        this.date.setDate(nextLastDay);
        this.dayInput.value = this.date.getDate();
      }
      this.date.setFullYear(Number(em.value));
      this.onyearchange?.();
    }

    em.style.width = `${em.value.length + .5}ch`;
  }

  updateValues() {
    this.dayInput.value = this.date.getDate();
    this.monthInput.value = this.date.getMonth() + 1;
    this.yearInput.value = this.date.getFullYear();
    this.inputArray.map(input => input.style.width = `${input.value.length + .5}ch`);
  }

  setCurrent() {
    this.date = new Date();
    this.onyearchange?.();
    this.onmonthchange?.();
    this.ondaychange?.();
    this.updateValues();
  }

  updateDateFieldsetFormat() {
    this.inputArray[0].after(
      this.literal,
      this.inputArray[1],
      this.literal.cloneNode(true),
      this.inputArray[2],
    );
  }

  get maxDays() {
    return new Date(Number(this.yearInput.value), Number(this.monthInput.value), 0).getDate();
  }

  getString() {
    return new Intl.DateTimeFormat(this.lang).format(this.date);
  }
}

class Calendar extends DateFieldset {
  selectedDate = null;
  
  constructor(calendarElement) {
    super(calendarElement.querySelector('.js-calendar-fieldset'));
    
    this.em = calendarElement;

    this.dateContainer = this.em.querySelector('.js-calendar-date-container');

    this.monthSelect = new Select(
      this.em.querySelector('.js-calendar-month-select'),
      [
        () => this.selectMonth(this.monthSelect.items.activeIndex),
      ],
      {
        type: 'single',
      },
    );
    new Tooltip(this.monthSelect.toggleButton, 'Select month');
    this.monthCarousel = new Carousel(
      this.em.querySelector('.js-calendar-month-carousel'),
      {
        createNextSlide: () => {
          const slideContent = document.createElement('span');
          slideContent.classList.add('js-inner-text');
          slideContent.textContent = new Intl.DateTimeFormat(this.lang, {month: 'long'}).format(
            new Date(
              this.date.getFullYear(),
              this.date.getMonth() + 2,
              this.date.getDate()
            )
          );
          return slideContent;
        },
        createPrevSlide: () => {
          const slideContent = document.createElement('span');
          slideContent.classList.add('js-inner-text');
          slideContent.textContent = new Intl.DateTimeFormat(this.lang, {month: 'long'}).format(
            new Date(
              this.date.getFullYear(),
              this.date.getMonth() - 2,
              this.date.getDate()
            )
          );
          return slideContent;
        },
      },
      {
        minOffset: -(12 - (12 - this.date.getMonth())) * (this.date.getFullYear() - new Date(0)),
        maxOffset: (12 - this.date.getMonth()) * new Date(9999, 12, 0) - this.date.getFullYear(),
      }
    );
    this.monthCarousel.nextButton.addEventListener('click', () => {
      this.selectMonth(this.date.getMonth() + 1);
    });
    this.monthCarousel.prevButton.addEventListener('click', () => {
      this.selectMonth(this.date.getMonth() - 1);
    });

    this.yearCarousel = new Carousel(
      this.em.querySelector('.js-calendar-year-carousel'),
      {
        createNextSlide: () => {
          return new Intl.DateTimeFormat(this.lang, {year: 'numeric'}).format(new Date(
            this.date.getFullYear() + 2,
            this.date.getMonth(),
            this.date.getDate()
          ));
        },
        createPrevSlide: () => {
          return new Intl.DateTimeFormat(this.lang, {year: 'numeric'}).format(new Date(
            this.date.getFullYear() - 2,
            this.date.getMonth(),
            this.date.getDate()
          ));
        }
      },
      {
        minOffset: -this.date.getFullYear(),
        maxOffset: new Date(10000, 0, 0) - this.date.getFullYear(),
      }
    );
    this.yearCarousel.nextButton.addEventListener('click', () => {
      this.selectYear(this.date.getFullYear() + 1);
    });
    this.yearCarousel.prevButton.addEventListener('click', () => {
      this.selectYear(this.date.getFullYear() - 1);
    });

    this.updateCalendarFormat();
    
    this.onyearchange = () => this.updateYear();
    this.onmonthchange = () => this.updateMonth();
    this.ondaychange = () => this.updateDays(true);
    
    if (this.clearButton = this.em.querySelector('.js-calendar-clear-button')) {
      this.clearButton.addEventListener('mousedown', (e) => {
        createRippleElement(e.currentTarget, e, 'dk');
      });
      this.clearButton.addEventListener('click', (e) => {
        this.clearDate();
      });
    }
    
    if (this.saveButton = this.em.querySelector('.js-calendar-save-button')) {
      this.saveButton.addEventListener('mousedown', (e) => {
        createRippleElement(e.currentTarget, e, 'lt');
      });
      this.saveButton.addEventListener('click', (e) => {
        this.saveDate();
      });
    }
  }

  updateDays(stylesOnly) {
    if (stylesOnly) {
      const elementArray = [...this.dateContainer.querySelectorAll('.js-calendar-date:not(.is-disabled)')];
      
      elementArray.find(em => em.classList.contains('is-selected')).classList.remove('is-selected');
      
      elementArray.find(em => Number(em.textContent.trim()) === this.date.getDate()).classList.add('is-selected');

      return;
    }
    
    const weekStart = getWeekStartByLocale(this.lang);
    let startIndex = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay() - weekStart;
    if (startIndex < 0) startIndex += 7;

    const maxDays = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    const maxDaysPrev = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();

    const dateContainerFragment = document.createDocumentFragment();
    const cells = 35 >= (startIndex + maxDays) ? 35 : 42;
    for (let i = 1; i <= cells; i++) {
      const dateFragment = document.importNode(this.em.querySelector('.js-calendar-date-t').content, true);
      const dateElement = dateFragment.querySelector('.js-calendar-date');
      
      if (i > startIndex && i <= startIndex + maxDays) {
        dateElement.textContent = i - startIndex;
        if (i - startIndex === new Date().getDate()) {
          dateElement.classList.add('is-current');
        }
        if (i - startIndex === this.date.getDate()) {
          dateElement.classList.add('is-selected');
        }

        dateElement.addEventListener('click', () => {
          this.selectDay(i - startIndex);
        });
        
      } else if (i <= startIndex) {
        dateElement.textContent = maxDaysPrev - (startIndex - i);
        dateElement.classList.add('is-disabled');
        dateElement.disabled = true;
        
      } else if (i > startIndex + maxDays) {
        dateElement.textContent = i - (startIndex + maxDays);
        dateElement.classList.add('is-disabled');
        dateElement.disabled = true;
      }

      dateContainerFragment.append(dateElement);
    }

    this.dateContainer.replaceChildren(dateContainerFragment);
  }

  selectDay(date) {
    this.date.setDate(date);
    this.updateValues();
    this.updateDays(true);
  }

  updateMonth() {
    [...this.monthCarousel.slideCollection].forEach((em, index) => {
      em.textContent = new Intl.DateTimeFormat(this.lang, {month: 'long'}).format(
        new Date(
          this.date.getFullYear(),
          index === 0 ? this.date.getMonth() - 1:
          index === 1 ? this.date.getMonth() :
          index === 2 && this.date.getMonth() + 1,
          this.date.getDate()
        )
      );
    });

    this.monthSelect.select(this.date.getMonth(), true);
    this.updateYear();
  }
  
  selectMonth(month) {
    const nextLastDay = new Date(this.date.getFullYear(), month + 1, 0).getDate();
    if (this.date.getDate() >= nextLastDay) {
      this.date.setDate(nextLastDay);
      this.dayInput.value = this.date.getDate();
    }
    this.date.setMonth(month);
    this.updateValues();
    this.updateMonth();
  }

  updateYear() {
    [...this.yearCarousel.slideCollection].forEach((em, index) => {
      em.textContent = new Intl.DateTimeFormat(this.lang, {year: 'numeric'}).format(
        new Date(
          index === 0 ? this.date.getFullYear() - 1:
          index === 1 ? this.date.getFullYear() :
          index === 2 && this.date.getFullYear() + 1,
          this.date.getMonth(),
          this.date.getDate()
        )
      );
    });

    this.updateDays();
  }

  selectYear(year) {
    const nextLastDay = new Date(year, this.date.getMonth() + 1, 0).getDate();
    if (this.date.getDate() >= nextLastDay) {
      this.date.setDate(nextLastDay);
      this.dayInput.value = this.date.getDate();
    }
    this.date.setFullYear(year);
    this.updateValues();
    this.updateYear();
  }

  updateCalendarFormat() {

    /**
     * Weekdays
     */

    const weekStart = getWeekStartByLocale(this.lang);
    const startIndex = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay() - weekStart;
    const maxDaysPrev = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();

    const weekDaysContainer = this.em.querySelector('.js-calendar-weekdays');
    const weekDaysArray = weekDaysContainer.querySelectorAll('.js-calendar-weekday');
    for (let i = 1; i <= 7; i++) {
      weekDaysArray[i - 1].textContent = new Intl.DateTimeFormat(this.lang, {weekday: 'narrow'}).format(
        i <= startIndex ? 
          new Date(this.date.getFullYear(), this.date.getMonth() - 1, maxDaysPrev - (startIndex - i)) : 
          new Date(this.date.getFullYear(), this.date.getMonth(), i - startIndex)
      );
    }

    /**
     * Month. year & days.
     */

    this.monthSelect.items.array.forEach((item, index) => {
      item.button.textContent = new Intl.DateTimeFormat(this.lang, {month: 'long'}).format(new Date(
        this.date.getFullYear(),
        index,
        this.date.getDate(),
      )
    )});
    this.monthSelect.items.array[this.date.getMonth()].button.classList.add('is-current');
    this.updateMonth();
  }

  clearDate() {
    this.setCurrent();
    this.selectedDate = null;
    delete this.em.dataset.selectedDate;
    this.clearButton.classList.add('is-disabled');
    this.clearButton.disabled = true;
  }

  saveDate() {
    this.selectedDate = Date.parse(this.date);
    this.em.dataset.selectedDate = this.getString();
    this.clearButton.classList.remove('is-disabled');
    this.clearButton.disabled = false;
  }
}

Date.compare = function(firstDate, secondDate) {
  if (!firstDate && !secondDate) return 0;
  if (!firstDate) return 1;
  if (!secondDate) return -1;

  if (typeof(firstDate) === 'number') {
    firstDate = new Date(firstDate);
  }
  if (typeof(secondDate) === 'number') {
    secondDate = new Date(secondDate);
  }
  
  if (
    (firstDate.getFullYear() > secondDate.getFullYear()) ||
    (firstDate.getFullYear() === secondDate.getFullYear()) &&
    (firstDate.getMonth() > secondDate.getMonth()) ||
    (firstDate.getFullYear() === secondDate.getFullYear()) &&
    (firstDate.getMonth() === secondDate.getMonth()) &&
    (firstDate.getDate() > secondDate.getDate())
  ) {
    return 1;

  } else if (
    (firstDate.getFullYear() === secondDate.getFullYear()) &&
    (firstDate.getMonth() === secondDate.getMonth()) &&
    (firstDate.getDate() === secondDate.getDate()))
  {
    return 0;

  } else {
    return -1;
  }
}

class DateDisplay {
  constructor(em) {
    this.lang = navigator.language;
    this.options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    if (em.children.length) {
      if (this.time = em.querySelector('.js-date-display-time')) {
        this.timeOptions = {
          timeStyle: 'medium'
        };
      }
      if (this.date = em.querySelector('.js-date-display-date')) {
        this.dateOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          weekday: 'long'
        };
      }

      this.time.textContent = Intl.DateTimeFormat(this.lang, this.timeOptions).format(new Date());
      this.date.textContent = Intl.DateTimeFormat(this.lang, this.dateOptions).format(new Date());
      
      setInterval(() => {
        this.time.textContent = Intl.DateTimeFormat(this.lang, this.timeOptions).format(new Date());
        this.date.textContent = Intl.DateTimeFormat(this.lang, this.dateOptions).format(new Date());
      }, 1000);

    } else {
      em.textContent = Intl.DateTimeFormat(this.lang, this.options).format(new Date());
      
      setInterval(() => {
        em.textContent = Intl.DateTimeFormat(this.lang, this.options).format(new Date());
      }, 1000);
    }
  }
}

export { DateFieldset, Calendar, DateDisplay };