// Service Worker — LCP Horizon International v7
const CACHE_VERSION = "lcp-horizon-v7";

const ASSETS_TO_CACHE = [
  "./index.html",
  "./reservation.html",
  "./mentions-legales.html",
  "./a-propos.html",
  "./faq.html",
  "./cgv.html",
  "./produits-naturels/index.html",
  "./admin/index.html",
  "./destinations/abidjan.html",
  "./destinations/dakar.html",
  "./destinations/casablanca.html",
  "./destinations/paris.html",
  "./destinations/dubai.html",
  "./destinations/istanbul.html",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/js/booking.js",
  "./assets/js/produits.js",
  "./assets/js/produits-data.js",
  "./assets/js/cart.js",
  "./assets/js/panier-ui.js",
  "./assets/js/firebase-config.js",
  "./assets/js/admin.js",
  "./assets/js/dest-prix.js",
  "./assets/js/emailjs-config.js",
  "./assets/js/toast.js",
  "./assets/images/lcp-horizon-logo.svg",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Ajouter un par un pour ne pas bloquer si un fichier manque
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[SW] Impossible de cacher :", url, err);
          })
        )
      );
    })
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

  // Jamais de cache pour Firebase
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
