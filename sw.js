/* ============================================================
   MatchForecast — sw.js
   Fixes "I updated it but it still shows the old version":
   - HTML, CSS, JS and data.json are ALWAYS fetched from the
     network first. The cache is only used as a fallback if the
     device is briefly offline. This means the very next refresh
     after you publish shows the change — no second reload
     needed, no waiting for a background cache update.
   - Only images/fonts stay cache-first, since those rarely
     change and don't need to be instant-fresh — this keeps the
     site fast on slow connections.
   - skipWaiting() + clients.claim() make a new service worker
     take over immediately instead of waiting for every open tab
     to be closed first, which is what caused updates to silently
     never apply for browsers that were "stuck on the old page".

   IMPORTANT: if you ever had an older sw.js deployed before this
   one, THIS FILE is what needs to replace it for the fix to take
   effect — the browser only picks up the new strategy once this
   exact file is what's being served.
   ============================================================ */

const CACHE_VERSION = 'mf-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf)$/i;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // let ad/third-party requests pass through untouched

  const isImage = IMAGE_EXT.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const network = fetch(event.request).then(res => {
          if (res && res.ok) caches.open(STATIC_CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(res => {
        if (res && res.ok) caches.open(STATIC_CACHE).then(c => c.put(event.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
