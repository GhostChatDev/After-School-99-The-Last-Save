const CACHE = 'after-school-99-chapter-one-v13';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './js/logic.js', './js/missions.js'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(FILES.map(url => fetch(new Request(url, { cache: 'reload' })).then(res => cache.put(url, res))))
    )
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('after-school-99-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request, { cache: 'no-cache' }).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(event.request)));
});
