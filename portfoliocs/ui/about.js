const hoverSound = new Audio('../../public/sounds/click.mp3');
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


  const sections = document.querySelectorAll('.animate-fadeIn');

  sections.forEach((el, i) => {
    el.classList.add('opacity-0', 'translate-y-4');

    setTimeout(() => {
      el.classList.remove('opacity-0', 'translate-y-4');
      el.classList.add('transition-all', 'duration-700', 'opacity-100', 'translate-y-0');
    }, 300 + i * 200);
  });

const nameText = "NAME: Rochelle Lawson";
let i = 0;
function typeWriter() {
  if (i < nameText.length) {
    document.getElementById("typewriter-name").innerHTML += nameText.charAt(i);
    i++;
    setTimeout(typeWriter, 70);
  }
}
window.onload = typeWriter;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("opacity-100", "translate-y-0");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal-on-scroll").forEach(el => {
  observer.observe(el);
});






