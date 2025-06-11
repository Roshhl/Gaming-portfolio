// src/ui/menu.js

// Preload the hover sound
const hoverSound = new Audio('/sounds/Click.mp3');
hoverSound.volume = 0.6;

// Select all tiles with class 'tile'
const tiles = document.querySelectorAll('.tile');

// Play sound on hover
tiles.forEach(tile => {
  tile.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play();
  });
});

// Navigation click (optional page logic)
tiles.forEach(tile => {
  tile.addEventListener('click', () => {
    const page = tile.dataset.page; // requires: data-page="about" etc.
    if (page) window.location.href = `./${page}.html`;
  });
});

