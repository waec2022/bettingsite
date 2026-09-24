/* ============================================================
   Sure2OddToday — sw.js  (ACTIVE, VERSIONED, SAFE)

   STRATEGY
   - data.json: NEVER cached, NEVER served from Cache Storage.
     Every request goes straight to the network, no exceptions.
     This is the one rule that matters most for this site.
   - Navigation requests (the HTML page itself): network-first.
     Falls back to a cached copy ONLY if the network request
     genuinely fails (e.g. offline) — so the shell always
     revalidates against the server first when online.
   - Everything else same-origin (script.js?v=N, styles.css?v=N,
     images): cache-first. This is safe specifically BECAUSE
     script.js/styles.css are requested with a version query
     string (?v=N) — a new deploy uses a brand-new URL, so the
     old cached entry is simply never requested again, and gets
     swept away on the next activate() anyway.

   VERSIONING
   Bump CACHE_NAME on any deploy that changes what gets cached
   (i.e. whenever script.js/styles.css actually change). Every
   old-named cache is deleted automatically on activate.
   ============================================================ */

const CACHE_NAME = 'sure2oddtoday-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return; // ads/third-party pass through untouched

  // RULE 1 — prediction data: network only, always. Never written to
  // Cache Storage, never read from it. No fallback: a stale prediction is
  // worse than a clear network error here.
  if (url.pathname.endsWith('/data.json') || url.pathname.endsWith('data.json')) {
    event.respondWith(fetch(req, { cache: 'no-store' }));
    return;
  }

  // RULE 2 — the HTML page itself: network-first, cache as offline-only fallback.
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' ) {
    event.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // RULE 3 — versioned static assets (script.js?v=N, styles.css?v=N) and
  // images: cache-first, refreshing the cache in the background.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
