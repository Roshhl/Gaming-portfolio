const hoverSound = new Audio('/sounds/click.mp3');
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

document.addEventListener("DOMContentLoaded", function () {
  AOS.init({
    duration: 800,
    once: true,
  });
});
