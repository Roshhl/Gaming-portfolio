document.addEventListener('keydown', function (e) {
  if (e.key.toLowerCase() === 'a') {
    window.location.href = './loading.html';
  }
});

// Add touch support for mobile
document.addEventListener('touchstart', function (e) {
  window.location.href = './loading.html';
});