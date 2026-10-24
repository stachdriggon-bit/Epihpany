const CACHE_NAME = 'epiphany-shell-20261024j';
const CORE_ASSETS = ['./', './index.html', './style.css', './life-skills.css', './app.js', './think-lab.js', './practice-lab.js', './life-skills.js', './data.js', './data-expansion.js', './data-mistakes.js', './data-spot.js', './data-typing.js', './data-wotd.js', './data-aha.js', './data-stories.js', './data-world.js', './data-world-sprites.js', './data-minigames.js', './data-translation-ar.js', './mini-games.css', './supabase-config.js', './account.js', './manifest.webmanifest', './icon.svg', './notifications.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('push', event => {
  let payload = {title:'EPIPHANY', body:'A new challenge is waiting for you.', url:'./#progress-view'};
  try { if (event.data) payload = {...payload, ...event.data.json()}; } catch {}
  event.waitUntil(self.registration.showNotification(payload.title || 'EPIPHANY', {
    body: payload.body || 'A new challenge is waiting for you.',
    icon: './icon.svg', badge: './icon.svg',
    tag: payload.tag || 'epiphany-challenge',
    data: {url: payload.url || './#progress-view'}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './#progress-view', self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(windows => {
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        client.navigate(target);
        return client.focus();
      }
    }
    return clients.openWindow(target);
  }));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Network first so updates always show; the cache is only the offline fallback.
  event.respondWith(fetch(request).then(response => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request, {ignoreSearch:true}).then(cached => {
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html');
    return new Response('', {status: 503, statusText: 'Offline'});
  })));
});