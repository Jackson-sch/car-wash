const CACHE_NAME = 'washmaster-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local navigation/assets
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Exclude API, authentication endpoints and Hot Module Reload (HMR) or Turbopack websockets
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('webpack') ||
    url.pathname.includes('turbopack')
  ) {
    return;
  }

  // Check if it's a page navigation request
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // Cache-first for static assets (images, icons, fonts, CSS files, JS files)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache dynamic assets if they are from our origin
        if (
          response &&
          response.status === 200 &&
          url.origin === self.location.origin
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});
