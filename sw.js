// Service Worker — LCP Horizon International Premium
const CACHE_VERSION = "lcp-horizon-v5";
const ASSETS_TO_CACHE = [
  "./index.html",
  "./reservation.html",
  "./mentions-legales.html",
  "./produits-naturels/index.html",
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

  if (url.includes("firestore.googleapis.com") || url.includes("identitytoolkit")) {
    return;
  }

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

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});