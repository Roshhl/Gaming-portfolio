const hoverSound = new Audio('/sounds/Click.mp3');
hoverSound.volume = 0.6;

// Select all tiles with class 'tile'
const back = document.querySelectorAll('.back');

// Play sound on hover
back.forEach(back => {
  back.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const cvButton = document.getElementById('cvButton');

  if (cvButton) {
    cvButton.addEventListener('mouseenter', () => {
      hoverSound.currentTime = 0;
      hoverSound.play().catch(error => {
        console.log('CV button sound play failed:', error);
      });
    });
cvButton.addEventListener('click', () => {
  hoverSound.currentTime = 0;
  hoverSound.play().catch(error => {
    console.log('CV button click sound play failed:', error);
  });
});
  }
});
