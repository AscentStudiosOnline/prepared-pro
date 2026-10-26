// Prepared Pro service worker: keeps the app working offline.
// Bump CACHE when you upload a new version so people get the update.
const CACHE = 'preparedpro-v70';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/ascent-emblem.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'lib/docx.iife.js', 'lib/pptxgen.bundle.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Network first for the page so updates arrive; fall back to the cache when offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
