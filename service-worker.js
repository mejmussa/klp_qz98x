// Manyangwa site service worker.
// Pages (HTML): network first, so visitors always get the latest version; cached copy only when offline.
// Static files (CSS, JS, fonts, images): served from cache instantly, refreshed in the background.
// Bump VERSION whenever you want every visitor's cache cleared.
const VERSION = "v7";
const CACHE = "manyangwa-" + VERSION;

const PRECACHE = [
  "/",
  "/index.html",
  "/sw-index.html",
  "/css/bootstrap.min.css",
  "/css/style.css",
  "/js/main.js",
  "/lib/jquery/jquery-3.7.1.min.js",
  "/lib/bootstrap/bootstrap.bundle.min.js",
  "/lib/fonts/open-sans.css",
  "/lib/fontawesome/css/all.min.css",
  "/img/logo.png",
  "/img/carousel-1.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // Cache what we can; one missing file must not break installation.
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let the form service etc. go straight to the network

  const isPage = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  if (isPage) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
