/* ============================================================
   MatchForecast — sw.js (self-removing)
   Service workers turned out to be more trouble than they were
   worth here — inconsistent update behavior across browsers is
   exactly what caused "sometimes it updates, sometimes it
   doesn't." This version's only job is to REMOVE itself and
   wipe any caches a previous version left behind, so every
   visitor's browser goes back to talking to the network
   directly with no caching layer in between.
   Deploy this once, then it can eventually be deleted — once
   every visitor's browser has picked it up and unregistered.
   ============================================================ */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});
