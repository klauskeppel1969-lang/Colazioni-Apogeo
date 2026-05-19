// Service Worker base per installazione PWA
// Versione cache - aggiornare il numero per forzare refresh
const CACHE_NAME = 'colazioni-v1';

// File da mettere in cache per uso offline base
const CACHE_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './products.js',
  './firebase-config.js',
  './manifest.json'
];

// Installazione: mette in cache i file statici
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Attivazione: rimuove cache vecchie
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: prima cache, poi rete (cache-first per file statici)
self.addEventListener('fetch', event => {
  // Le richieste Firebase vanno sempre in rete
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
