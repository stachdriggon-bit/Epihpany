const CACHE_NAME = 'epiphany-shell-v4';
const CORE_ASSETS = ['./', './index.html', './style.css', './app.js', './data.js', './data-mistakes.js', './data-spot.js', './data-typing.js', './data-wotd.js', './data-aha.js', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => {
      if (request.mode === 'navigate') return caches.match('./index.html');
      return new Response('', {status: 503, statusText: 'Offline'});
    });
  }));
});