// Service Worker — LCP Horizon International
// IMPORTANT : incrémenter CACHE_VERSION à chaque modification de CSS/JS/HTML
const CACHE_VERSION = "lcp-horizon-v3";
const ASSETS_TO_CACHE = [
  "./index.html",
  "./reservation.html",
  "./produits-naturels/index.html",
  "./mentions-legales.html",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/js/booking.js",
  "./assets/js/produits.js",
  "./assets/js/produits-data.js",
  "./assets/js/cart.js",
  "./assets/js/panier-ui.js",
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
  const url = event.request.url;

  // Jamais de cache pour Firebase (données toujours fraîches)
  if (url.includes("firestore.googleapis.com") || url.includes("identitytoolkit")) {
    return;
  }

  // Pages HTML, CSS, JS : réseau en priorité, cache seulement en secours hors-ligne
  const isCodeOuPage = event.request.mode === "navigate" ||
    url.endsWith(".html") || url.endsWith(".css") || url.endsWith(".js");

  if (isCodeOuPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Images et autres ressources statiques : cache en priorité (plus rapide)
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});