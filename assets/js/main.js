// Ombre légère sur le header au scroll
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 8px 20px rgba(7,17,32,0.25)'
      : 'none';
  });
}

// Enregistrement du service worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service worker non enregistré :', err);
    });
  });
}
