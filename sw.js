const CACHE = 'after-school-99-chapter-one-v9';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './js/logic.js', './js/missions.js'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('after-school-99-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(event.request)));
});
