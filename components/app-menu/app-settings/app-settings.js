import { appMenu } from '../app-menu.js';
import { Select } from '../../modals/modals.js';
import { SwitchButton } from '../../buttons/buttons.js';
import { Toast } from '../../toast/Toast.js';
import { todoFormObject } from '../../control-panel/todo-form/todo-form.js';

const appSettingsObject = {
  theme: new Select(
    appMenu.content.querySelector('.js-theme-menu'),
    [
      {
        button: appMenu.content.querySelector('.js-theme-auto'),
        function: () => {
          changeAppTheme('auto');
        },
      },
      {
        button: appMenu.content.querySelector('.js-theme-dark'),
        function: () => {
          changeAppTheme('dark');
        },
      },
      {
        button: appMenu.content.querySelector('.js-theme-light'),
        function: () => {
          changeAppTheme('light');
        },
      },
      () => {
        new Toast(
          'Your changes are saved successfully!',
          {
            modificator: 'app-settings-saved',
            type: 'success',
          },
        );
      },
    ],
    {
      type: 'single',
    },
  ),
  defaultDate: new SwitchButton( 
    appMenu.content.querySelector('#default-date-switch'),
    function() {
      localStorage.setItem('todoEditorDefaultDate', true);
      if (!todoFormObject.calendar.selectedDate) {
        todoFormObject.calendar.saveDate();
      };
    },
    function() {
      localStorage.setItem('todoEditorDefaultDate', false);
    },
    JSON.parse(localStorage.getItem('todoEditorDefaultDate')),
  ),
};

appSettingsObject.theme.toggleButton.labelIcon = appMenu.content.querySelector('.js-settings-label-icon');

function changeAppTheme(theme) {
  if (theme === 'auto') {
    window.matchMedia('(prefers-color-scheme: dark)').matches ?
      changeAppTheme('dark') :
      changeAppTheme('light');
    localStorage.setItem('theme', theme);

  } else {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }

  appSettingsObject.theme.select(appSettingsObject.theme.items.array.find(item => item.button.classList.contains(`js-theme-${theme}`)), true);

  const useSVGEm = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  useSVGEm.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 
    theme === 'auto' ?
      '#svg-circle-half-fill' :
    theme === 'dark' ?
      '#svg-moon-stars-fill' :
    theme === 'light' &&
      '#svg-sun-fill'
  );
  
  appSettingsObject.theme.toggleButton.labelIcon.replaceChildren(useSVGEm);
}

appSettingsObject.defaultDate.onstatetoggle = () => {
  new Toast(
    'Your changes are saved successfully!',
    {
      modificator: 'app-settings-saved',
      type: 'success',
    },
  );
};

export { appSettingsObject, changeAppTheme };