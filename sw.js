const CACHE_NAME = 'titan-v8';

// On install, skip waiting to ensure the new service worker takes over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy for a more "live" feel, falling back to cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});