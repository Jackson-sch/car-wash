// WashMaster Pro - Service Worker PWA & Notificaciones Push

const CACHE_NAME = "washmaster-pwa-v1";
const DYNAMIC_ASSETS = ["/login", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(DYNAMIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
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

// Manejo de eventos de Notificaciones Push
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "WashMaster Pro";
    const options = {
      body: payload.body || "Actualización del estado de lavado",
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: payload.url || "/kiosco",
      vibrate: [200, 100, 200],
      tag: payload.tag || "washmaster-notification",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error al procesar push:", err);
  }
});

// Al hacer clic en la notificación emergente
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || "/kiosco";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
