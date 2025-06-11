const hoverSound = new Audio('/sounds/Click.mp3');
hoverSound.volume = 0.6;

// Select all tiles with class 'tile'
const back = document.querySelectorAll('.back');

// Play sound on hover and click
back.forEach(back => {
  back.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
  
  back.addEventListener('click', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
});

const sections = document.querySelectorAll('.animate-fadeIn');

sections.forEach((el, i) => {
  el.classList.add('opacity-0', 'translate-y-4');

  setTimeout(() => {
    el.classList.remove('opacity-0', 'translate-y-4');
    el.classList.add('transition-all', 'duration-700', 'opacity-100', 'translate-y-0');
  }, 300 + i * 200);
});

const enter = document.querySelectorAll('.enterprojects');
enter.forEach(tile => {
  tile.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
  
  tile.addEventListener('click', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
});

const save = document.querySelectorAll('.savecv');
save.forEach(tile => {
  tile.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
  
  tile.addEventListener('click', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
});