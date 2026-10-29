// Network-first for pages, cache-first for built assets; works offline after the first visit.
const CACHE = 'physics-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './practicals.html', './join.html', './manifest.webmanifest', './icons/icon.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((r) => {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return r;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('./'))),
    );
    return;
  }
  e.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((r) => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return r;
        }),
    ),
  );
});
