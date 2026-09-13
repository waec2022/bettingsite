/* MatchForecast service worker
   - Caches only the static app shell (HTML/CSS/JS) for speed on slow connections.
   - NEVER caches data.json — that always goes to the network so visitors
     see new predictions the moment they're published, not stale ones.
   - Bump CACHE_VERSION whenever the app shell changes so old caches are
     dropped automatically.
*/

var CACHE_VERSION = "matchforecast-shell-v2";
var SHELL_FILES = [
  "./",
  "index.html",
  "styles.css",
  "styles-additions.css",
  "script.js"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(SHELL_FILES).catch(function () {
        /* Don't fail install if one optional asset 404s */
      });
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_VERSION; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var url = event.request.url;

  /* data.json (with or without a ?v= cache-busting query) always goes
     straight to the network — never served from the cache. */
  if (url.indexOf("data.json") !== -1) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(function () {
        return new Response("{}", { headers: { "Content-Type": "application/json" } });
      })
    );
    return;
  }

  /* Everything else: cache-first, falling back to network, so the shell
     still loads on a poor 2G connection. */
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
