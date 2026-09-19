/* ============================================================
   MatchForecast — sw.js
   Fixes the "old predictions stuck for hours" problem:
   - data.json is ALWAYS fetched from the network first. Cache
     is only used as a fallback if the network request fails
     (e.g. visitor briefly offline).
   - Everything else (HTML/CSS/JS/images) is cache-first for
     speed, with the cache refreshed in the background on every
     visit, and a versioned cache name so old caches get cleaned
     up automatically when you deploy new static files.
   Replace your existing sw.js with this file, then bump
   CACHE_VERSION any time you change script.js/styles.css so
   old visitors pick up the new static files quickly.
   ============================================================ */

const CACHE_VERSION = 'mf-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for the daily data file — never serve a stale prediction.
  if (url.pathname.endsWith('data.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first (stale-while-revalidate) for everything else same-origin.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const network = fetch(event.request).then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});
