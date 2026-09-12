// This service worker previously loaded third-party (Monetag) ad/push code.
// That has been disabled. This version's only job is to remove itself and
// any caches it created from visitors who already had it installed, then
// stop running, so the site goes back to normal browser networking/caching.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
