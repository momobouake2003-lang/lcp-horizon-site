// Service Worker — LCP Horizon International
// IMPORTANT : incrémenter CACHE_VERSION à chaque modification de CSS/JS
const CACHE_VERSION = "lcp-horizon-v1";
const ASSETS_TO_CACHE = [
  "./index.html",
  "./reservation.html",
  "./produits-naturels/index.html",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/js/booking.js",
  "./assets/js/produits.js",
  "./assets/js/produits-data.js",
  "./assets/js/firebase-config.js",
  "./assets/images/lcp-horizon-logo.svg",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Réseau d'abord pour les appels Firebase, cache d'abord pour le reste
  if (event.request.url.includes("firestore.googleapis.com") ||
      event.request.url.includes("identitytoolkit")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
