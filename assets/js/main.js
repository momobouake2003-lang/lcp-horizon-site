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

  // ── Menu mobile : drawer animé depuis la droite ──
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (menuToggle && mainNav) {
    // Overlay créé dynamiquement une seule fois (évite de le dupliquer sur chaque page)
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      document.body.appendChild(overlay);
    }

    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');

    function ouvrirMenu() {
      mainNav.classList.add('ouvert');
      overlay.classList.add('ouvert');
      menuToggle.classList.add('ouvert');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Fermer le menu');
      document.body.classList.add('menu-ouvert');
    }

    function fermerMenu() {
      mainNav.classList.remove('ouvert');
      overlay.classList.remove('ouvert');
      menuToggle.classList.remove('ouvert');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('menu-ouvert');
    }

    menuToggle.addEventListener('click', () => {
      mainNav.classList.contains('ouvert') ? fermerMenu() : ouvrirMenu();
    });

    // Clic sur l'overlay sombre = fermeture
    overlay.addEventListener('click', fermerMenu);

    // Clic sur un lien du menu = fermeture (navigation ou ancre)
    mainNav.querySelectorAll('a').forEach(lien => lien.addEventListener('click', fermerMenu));

    // Touche Échap = fermeture
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fermerMenu();
    });

    // Repasser en nav desktop (redimensionnement) = fermeture propre du drawer
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) fermerMenu();
    });
  }

  // ── Thème clair / sombre ──
  const CLE_THEME = 'lcp-theme';
  const themeToggle = document.getElementById('theme-toggle');
  const mediaSombre = window.matchMedia('(prefers-color-scheme: dark)');

  function appliquerTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'
      );
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const themeActuel = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const nouveauTheme = themeActuel === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(CLE_THEME, nouveauTheme); } catch (e) {}
      appliquerTheme(nouveauTheme);
    });

    // Reflète l'état déjà appliqué par le script anti-flash dans le <head>
    appliquerTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }

  // Si l'utilisateur n'a jamais choisi explicitement, on suit la préférence système en direct
  mediaSombre.addEventListener('change', (e) => {
    let choixExplicite = null;
    try { choixExplicite = localStorage.getItem(CLE_THEME); } catch (err) {}
    if (!choixExplicite) appliquerTheme(e.matches ? 'dark' : 'light');
  });

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
