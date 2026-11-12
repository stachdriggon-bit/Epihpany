const CACHE_NAME = 'epiphany-stability-gallery-identity-20261105-1-fluentia-banks-separated-20261109-1-sentence-scramble-server-only-20261112-1-think-lab-eleven-games-20261108-1-letter-grid-20261107-2-fluentia-session-20261107-1-fluentia-adapters-20261107-1-fluentia-content-20261107-1-progress-bridge-20261107-1-phase3-integration-20261107-4-phase4-mixed-20261107-1-phase5-fluentia-ui-20261107-1-fluentia-integration-20261108-1-offline-translation-20261108-1-world-adaptive-motion-20261108-1-practice-lab-lifecycle-20261108-1-fluentia-lifecycle-20261108-1-fluentia-lifecycle-20261108-2-fluentia-banks-lazy-20261108-1-directions-bank-lazy-20261108-1-writing-banks-lazy-20261108-1-expansion-per-game-20261108-1-diagnostics-20261108-2-developer-diagnostics-ui-20261108-1-think-lab-progression-20261109-1-think-lab-resume-20261109-1-think-lab-core-resume-20261109-1-think-lab-resume-checkpoints-20261109-1-think-lab-next-round-state-20261109-1-think-lab-multi-session-20261109-1-think-lab-recommendations-20261109-1-think-lab-daily-20261109-1-soundscape-picture-levels-20261109-1-fluentia-domain-refresh-20261109-2-legacy-audio-separation-20261109-1-fluentia-interactions-20261109-6-sound-picture-216-20261109-1-fluentia-canonical-home-activities-20261109-1-fluentia-sentence-bank-five-word-minimum-20261109-1-odd-one-out-server-only-20261110-1-account-wallet-isolation-20261111-1-auth-dialog-20261111-1-auth-session-gate-20261111-1-auth-dialog-guest-migration-20261111-2-word-forge-validator-20261111-1';
const CARD_ART_CACHE = 'epiphany-card-art-cloud-only-20261030-1-fluentia-picture-bank-20261109-1';
const VENDOR_CACHE = 'epiphany-vendor-20261024m';
const diagnosticClientIds = new Set();

function notifyDiagnostics(clientId, outcome, request) {
  if (!clientId || !diagnosticClientIds.has(clientId) || typeof clients.get !== 'function') return Promise.resolve();
  let asset = 'unknown';
  try { asset = new URL(request.url).pathname.split('/').pop() || 'unknown'; } catch {}
  return clients.get(clientId).then(client => {
    if (client && typeof client.postMessage === 'function') {
      client.postMessage({ type: 'EPIPHANY_DIAGNOSTIC_EVENT', event: { asset, outcome } });
    } else {
      diagnosticClientIds.delete(clientId);
    }
  }).catch(() => {
    diagnosticClientIds.delete(clientId);
  });
}
const CORE_ASSETS = ['./', './index.html', './style.css', './icon-system.js', './guidance.css', './help-center.css', './help-center.js', './app.js', './guidance.js', './data.js', './data-mistakes.js', './data-wotd.js', './data-aha.js', './supabase-config.js', './account.js', './asset-manager.js', './asset-manager.css', './artwork-manager.js', './artwork-manager.css', './telemetry.js', './diagnostics.js', './diagnostics.css', './adaptive-engine.js', './lazy-data.js', './fluentia-engine.js', './fluentia-adapters.js', './fluentia-progress-bridge.js', './fluentia-sound-picture-bank.js', './fluentia-ui.js', './fluentia-ui.css', './navigation-enhancements.js', './manifest.webmanifest', './icon.svg', './social-preview.svg', './wotd-card.html', './notifications.js', './data-cards.js', './data-character-profiles.js', './cards.js', './cards.css', './assets/cards/epiphany-portraits.svg', './assets/cards/card-ornaments.svg'];
// Allowlist of optional feature files eligible for on-demand offline caching.
const LAZY_ASSETS = ['./resonance.css', './life-skills.css', './language-detective.css', './data-translation-ar.js', './data-translation-ar-fill.js', './data-stories-expansion.js', './data-stories.js', './data-world-registry.js', './data-world-events.js', './data-world-sprites.js', './data-world.js', './resonance.js', './life-skills.js', './fluentia-practice-bank.js', './language-detective-investigation.js', './language-detective-assessment-schemas.js', './language-detective-cefr-patterns.js', './language-detective-assessment-engine.js', './language-detective-assessment-fixtures.js', './language-detective-ui.js', './sound-maze-bank.js', './sound-maze-content.js', './fluentia-textwise-bank.js', './fluentia-soundscape-bank.js', './word-connections-bank.js', './word-forge-bank.js', './think-lab-progression.js', './think-lab.js', './word-hunt-bank.js', './word-hunt.js', './word-hunt.css', './codebreaker-bank.js', './codebreaker.js', './codebreaker.css', './letter-grid-bank.js', './letter-grid.js', './letter-grid.css', './fluentia-directions-bank.js', './data-spot.js', './data-typing.js', './data-expansion-translations.js', './data-expansion-runtime.js', './data-expansion-wotd.js', './data-expansion-vocabulary.js', './data-expansion-spelling.js', './data-expansion-grammar.js', './data-expansion-story.js', './data-expansion-listening.js', './data-expansion-advanced.js'];
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
  const type = event.data && event.data.type;
  if (type === 'EPIPHANY_DIAGNOSTICS_START' && event.source && event.source.id) {
    diagnosticClientIds.add(event.source.id);
    return;
  }
  if (type === 'EPIPHANY_DIAGNOSTICS_STOP' && event.source && event.source.id) {
    diagnosticClientIds.delete(event.source.id);
    return;
  }
  if (type !== 'EPIPHANY_WARM_OPTIONAL_CACHE' || !canWarmOptionalAssets()) return;
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
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => ((key.startsWith('epiphany-shell-') || key.startsWith('epiphany-stability-gallery-identity-')) && key !== CACHE_NAME) || (key.startsWith('epiphany-vendor-') && key !== VENDOR_CACHE) || (key.startsWith('epiphany-card-art-') && key !== CARD_ART_CACHE)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
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
  // Same-origin app assets use network first so deployments update promptly.
  // Register the cache-write lifetime synchronously, before the fetch event ends.
  const networkRequest = fetch(request);
  const cacheWrite = networkRequest.then(response => {
    const diagnostic = notifyDiagnostics(event.clientId, response && response.ok ? 'network_success' : 'network_response', request);
    const write = response && response.ok
      ? caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
      : Promise.resolve();
    return Promise.all([diagnostic, write]);
  }).catch(() => {});
  event.waitUntil(cacheWrite);
  event.respondWith(networkRequest.catch(async () => {
    // Prefer the exact versioned URL. Falling back with ignoreSearch could
    // serve an older script under a newer ?v= cache-busting key.
    const cached = await caches.match(request);
    if (cached) {
      await notifyDiagnostics(event.clientId, 'cache_fallback_exact', request);
      return cached;
    }
    // Optional assets may also have been warmed under their unversioned path.
    const unversioned = await caches.match(url.origin + url.pathname);
    if (unversioned) {
      await notifyDiagnostics(event.clientId, 'cache_fallback_unversioned', request);
      return unversioned;
    }
    if (request.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    await notifyDiagnostics(event.clientId, 'offline_miss', request);
    return new Response('', {status: 503, statusText: 'Offline'});
  }));
});