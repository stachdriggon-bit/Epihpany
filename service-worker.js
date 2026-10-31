const CACHE_NAME = 'epiphany-shell-contextual-guidance-empty-states-20261031-1';
const CARD_ART_CACHE = 'epiphany-card-art-cloud-only-20261030-1';
const VENDOR_CACHE = 'epiphany-vendor-20261024m';
const CORE_ASSETS = ['./', './index.html', './style.css', './guidance.css', './app.js', './guidance.js', './data.js', './data-expansion.js', './data-mistakes.js', './data-spot.js', './data-typing.js', './data-wotd.js', './data-aha.js', './data-minigames.js', './mini-games.css', './supabase-config.js', './account.js', './asset-manager.js', './asset-manager.css', './artwork-manager.js', './artwork-manager.css', './telemetry.js', './adaptive-engine.js', './lazy-data.js', './navigation-enhancements.js', './manifest.webmanifest', './icon.svg', './social-preview.svg', './wotd-card.html', './notifications.js', './data-cards.js', './data-character-profiles.js', './cards.js', './cards.css', './assets/cards/epiphany-portraits.svg', './assets/cards/card-ornaments.svg'];
// Allowlist of optional feature files eligible for on-demand offline caching.
const LAZY_ASSETS = ['./resonance.css', './life-skills.css', './data-stories-expansion.js', './data-stories.js', './data-world-registry.js', './data-world-events.js', './data-world-sprites.js', './data-world.js', './resonance.js', './life-skills.js', './practice-lab.js', './think-lab.js'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A single missing core asset must not prevent the whole app from installing offline.
    await Promise.all(CORE_ASSETS.map(async asset => {
      try { await cache.add(asset); } catch (error) { console.warn('[EPIPHANY] Could not pre-cache', asset, error); }
    }));
    await self.skipWaiting();
    // Optional feature files are cached only after the app actually requests them.
    // This avoids downloading every large section during installation.
  })());
});
function canWarmOptionalAssets() {
  const nav = self.navigator || {};
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
  const effectiveType = String(connection && connection.effectiveType || '').toLowerCase();
  const downlink = Number(connection && connection.downlink);
  const rtt = Number(connection && connection.rtt);
  const saveData = !!(connection && connection.saveData);
  const slowNetwork = saveData || effectiveType === 'slow-2g' || effectiveType === '2g' ||
    (Number.isFinite(downlink) && downlink > 0 && downlink < 0.8) ||
    (Number.isFinite(rtt) && rtt >= 800);
  const constrainedDevice =
    (Number.isFinite(Number(nav.deviceMemory)) && Number(nav.deviceMemory) > 0 && Number(nav.deviceMemory) <= 2) ||
    (Number.isFinite(Number(nav.hardwareConcurrency)) && Number(nav.hardwareConcurrency) > 0 && Number(nav.hardwareConcurrency) <= 2);
  return nav.onLine !== false && !slowNetwork && !constrainedDevice;
}

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'EPIPHANY_WARM_OPTIONAL_CACHE' || !canWarmOptionalAssets()) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Refresh only optional assets that were cached through real use or intent prefetch.
    // Never fetch an optional file merely because it appears in the allowlist.
    await Promise.all(LAZY_ASSETS.map(async asset => {
      try {
        const existing = await cache.match(asset, { ignoreSearch: true });
        if (!existing) return;
        const response = await fetch(asset, { cache: 'reload' });
        if (response && response.ok) await cache.put(asset, response.clone());
      } catch {}
    }));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('epiphany-shell-') && key !== CACHE_NAME) || (key.startsWith('epiphany-vendor-') && key !== VENDOR_CACHE) || (key.startsWith('epiphany-card-art-') && key !== CARD_ART_CACHE)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
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
  // Image assets use stale-while-revalidate: first paint can use the cached file while a fresh copy is fetched.
  if (sameOrigin && request.destination === 'image') {
    const cachePromise = caches.open(CARD_ART_CACHE);
    const refresh = fetch(request).then(response => {
      if (response && response.ok) return cachePromise.then(cache => cache.put(request, response.clone())).then(() => response);
      return response;
    }).catch(() => null);
    event.waitUntil(refresh.then(() => undefined));
    event.respondWith((async () => {
      const cache = await cachePromise;
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await refresh;
      return response || new Response('', {status:503, statusText:'Image unavailable offline'});
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