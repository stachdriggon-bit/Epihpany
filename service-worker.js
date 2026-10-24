const CACHE_NAME = 'epiphany-shell-20261024ab';
const VENDOR_CACHE = 'epiphany-vendor-20261024m';
const CORE_ASSETS = ['./', './index.html', './style.css', './life-skills.css', './app.js', './data.js', './data-expansion.js', './data-mistakes.js', './data-spot.js', './data-typing.js', './data-wotd.js', './data-aha.js', './data-minigames.js', './mini-games.css', './supabase-config.js', './account.js', './telemetry.js', './lazy-data.js', './manifest.webmanifest', './icon.svg', './social-preview.svg', './wotd-card.html', './notifications.js'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A single missing optional asset must not prevent the whole app from installing offline.
    await Promise.all(CORE_ASSETS.map(async asset => {
      try { await cache.add(asset); } catch (error) { console.warn('[EPIPHANY] Could not pre-cache', asset, error); }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('epiphany-shell-') && key !== CACHE_NAME) || (key.startsWith('epiphany-vendor-') && key !== VENDOR_CACHE)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
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
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const approvedVendor = url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' || url.origin === 'https://cdn.jsdelivr.net';
  if (!sameOrigin && !approvedVendor) return;
  // Vendor assets are cached after first successful use, then served from cache offline.
  if (approvedVendor) {
    event.respondWith((async () => {
      const cache = await caches.open(VENDOR_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          await cache.put(request, response.clone());
          return response;
        }
        return response;
      } catch (error) {
        return new Response('', {status: 503, statusText: 'Vendor asset unavailable offline'});
      }
    })());
    return;
  }
  // Same-origin app assets use network first so deployments update promptly; cache is offline fallback.
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