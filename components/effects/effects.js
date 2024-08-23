function createRippleElement(parentElement, e, modificator) {
  if (!parentElement.querySelector('& > .js-ripple-wrapper')) {
    parentElement.rippleWrapper = document.createElement('div');
    parentElement.rippleWrapper.classList.add('ripple-wrapper', 'js-ripple-wrapper');
    parentElement.append(parentElement.rippleWrapper);
  }

  const parentRect = parentElement.getBoundingClientRect();
  const rippleElement = document.createElement('span');
  rippleElement.style.left = `${e.clientX - parentRect.x}px`;
  rippleElement.style.top = `${e.clientY - parentRect.y}px`;

  const sideX = e.clientX - parentRect.x > parentRect.right - e.clientX ? parentRect.x : parentRect.right;
  const sideY = e.clientY - parentRect.y > parentRect.bottom - e.clientY ?
  parentRect.y : parentRect.bottom;
  const size = Math.sqrt(
    Math.pow(
      e.clientX - sideX, 2
    ) +
    Math.pow(
      e.clientY - sideY, 2
    )
  ) * 2;

  rippleElement.style.width = `${size}px`;
  rippleElement.classList.add('ripple-click', `ripple-click--${modificator}`, 'ripple-click--fade-in');
  parentElement.rippleWrapper.append(rippleElement);

  /* console.log(
    'parentRect.x: ' + parentRect.x,
    '\nevent.clientX: ' + e.clientX +
    '\nevent.offsetX: ' + e.offsetX +
    '\nparent.clientWidth / 2: ' + (parentElement.clientWidth / 2)
  ); */

  const currentAnimation = [...rippleElement.getAnimations()].find((animation) => 
    animation.animationName === 'ripple-click__animation--fade-in'
  );

  currentAnimation.finished.then(() => {currentAnimation.commitStyles()}).catch(() => {rippleElement.remove()});

  function removeRipple() {
    rippleElement.classList.replace('ripple-click--fade-in', 'ripple-click--fade-out');
    [...rippleElement.getAnimations()].find((animation) => 
      animation.animationName === 'ripple-click__animation--fade-out'
    ).finished.then(() => {
      rippleElement.remove();
    }).catch(() => {rippleElement.remove()}); // In case the element with the ripple gets removed.
  }

  parentElement.addEventListener('mouseup', () => {
    currentAnimation.finished.then(() => {
      removeRipple();
    }).catch(() => {rippleElement.remove()});
  });

  parentElement.addEventListener('mouseleave', (e) => {
    currentAnimation.finished.then(() => {
      removeRipple();
    }).catch(() => {rippleElement.remove()});
  });
}

export { createRippleElement };