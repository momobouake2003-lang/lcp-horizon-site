// LCP Horizon International — Interactions premium

document.addEventListener('DOMContentLoaded', () => {

  // ── Header scroll effect ──
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Hero slideshow ──
  const slideshow = document.getElementById('hero-slideshow');
  if (slideshow) {
    const slides = slideshow.querySelectorAll('.hero-slide');
    let current = 0;
    const interval = 5000;

    function nextSlide() {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }

    setInterval(nextSlide, interval);
  }

  // ── Scroll reveal animations ──
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));

  // ── Service Worker registration ──
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  }

  // ── Mobile menu toggle (basic) ──
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.style.display === 'flex';
      mainNav.style.display = isOpen ? 'none' : 'flex';
      mainNav.style.position = 'absolute';
      mainNav.style.top = '76px';
      mainNav.style.left = '0';
      mainNav.style.right = '0';
      mainNav.style.flexDirection = 'column';
      mainNav.style.background = 'rgba(250,250,248,0.98)';
      mainNav.style.backdropFilter = 'blur(20px)';
      mainNav.style.padding = '24px';
      mainNav.style.gap = '20px';
      mainNav.style.borderBottom = '1px solid var(--border)';
      mainNav.style.boxShadow = 'var(--shadow)';
    });
  }

  // ── Widget de recherche du hero (accueil) ──
  // Redirige vers la réservation avec destination, dates et passagers pré-remplis.
  const heroSearch = document.getElementById('hero-search');
  if (heroSearch) {
    const dateAllerInput = document.getElementById('hsw-date-aller');
    if (dateAllerInput) dateAllerInput.setAttribute('min', new Date().toISOString().split('T')[0]);

    heroSearch.addEventListener('submit', (e) => {
      e.preventDefault();
      const depart = document.getElementById('hsw-depart').value.trim();
      const arrivee = document.getElementById('hsw-arrivee').value.trim();
      const dateAller = document.getElementById('hsw-date-aller').value;
      const dateRetour = document.getElementById('hsw-date-retour').value;
      const passagers = document.getElementById('hsw-passagers').value || '1';

      const params = new URLSearchParams();
      if (arrivee) params.set('destination', arrivee);
      if (depart) params.set('depart', depart);
      if (dateAller) params.set('dateAller', dateAller);
      if (dateRetour) params.set('dateRetour', dateRetour);
      if (passagers) params.set('passagers', passagers);

      window.location.href = 'reservation.html?' + params.toString();
    });
  }
});
