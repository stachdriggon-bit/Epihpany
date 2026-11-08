const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');

function createWorker(cachedAssets = [], navigatorOptions = {}) {
  const handlers = {};
  const added = [];
  const matched = [];
  const refreshed = [];
  const cacheEntries = new Set(cachedAssets);
  const cache = {
    async add(asset) { added.push(asset); cacheEntries.add(asset); },
    async match(asset) {
      matched.push(asset);
      return cacheEntries.has(asset) ? { cached: asset } : undefined;
    },
    async put(asset) { refreshed.push(asset); cacheEntries.add(asset); }
  };
  const worker = {
    navigator: { onLine: true, deviceMemory: 8, hardwareConcurrency: 8, ...navigatorOptions },
    skipWaiting: async () => {},
    addEventListener(name, handler) { handlers[name] = handler; }
  };
  const context = vm.createContext({
    self: worker,
    caches: { open: async () => cache, keys: async () => [], delete: async () => true },
    fetch: async asset => {
      refreshed.push('fetch:' + asset);
      return { ok: true, clone() { return { asset }; } };
    },
    Promise, Number, String, Object, URL, console,
    clients: { claim: async () => {} }
  });
  vm.runInContext(source, context);
  return { handlers, added, matched, refreshed, cacheEntries };
}

test('service worker install caches core assets but does not download every optional feature', async () => {
  const worker = createWorker();
  let wait;
  worker.handlers.install({ waitUntil(promise) { wait = promise; } });
  await wait;
  assert.ok(worker.added.includes('./index.html'));
  assert.ok(worker.added.includes('./app.js'));
  assert.equal(worker.added.some(asset => /(?:stories|world|think-lab|practice-lab|life-skills|resonance)/i.test(asset)), false);
});

test('reconnect refreshes only optional assets already cached from actual use', async () => {
  const worker = createWorker(['./data-stories.js', './resonance.css']);
  let wait;
  worker.handlers.message({
    data: { type: 'EPIPHANY_WARM_OPTIONAL_CACHE' },
    waitUntil(promise) { wait = promise; }
  });
  await wait;
  const fetched = worker.refreshed.filter(value => typeof value === 'string' && value.startsWith('fetch:'));
  assert.deepEqual(fetched.sort(), ['fetch:./data-stories.js', 'fetch:./resonance.css'].sort());
  assert.deepEqual(worker.refreshed.filter(value => !String(value).startsWith('fetch:')).sort(),
    ['./data-stories.js', './resonance.css'].sort());
  assert.equal(fetched.some(value => value.includes('data-world.js')), false);
});

test('reconnect does not warm optional assets on constrained devices or data-saver connections', async () => {
  for (const navigator of [
    { onLine: true, deviceMemory: 2, hardwareConcurrency: 8 },
    { onLine: true, deviceMemory: 8, hardwareConcurrency: 8, connection: { saveData: true } },
    { onLine: false, deviceMemory: 8, hardwareConcurrency: 8 }
  ]) {
    const worker = createWorker(['./data-stories.js'], navigator);
    let wait;
    worker.handlers.message({
      data: { type: 'EPIPHANY_WARM_OPTIONAL_CACHE' },
      waitUntil(promise) { wait = promise; }
    });
    await Promise.resolve(wait);
    assert.deepEqual(worker.refreshed, []);
  }
});


function createFetchWorker(options = {}) {
  const handlers = {};
  const entries = new Map();
  const cache = {
    async match(key) {
      const value = typeof key === 'string' ? key : key.url;
      return entries.get(value);
    },
    async put(key, response) {
      const value = typeof key === 'string' ? key : key.url;
      entries.set(value, response);
    },
    async add(asset) {
      entries.set(new URL(asset, 'https://epiphany.test').href, { url: asset, cached: true });
    }
  };
  const worker = {
    navigator: { onLine: true, deviceMemory: 8, hardwareConcurrency: 8 },
    location: { origin: 'https://epiphany.test' },
    skipWaiting: async () => {},
    addEventListener(name, handler) { handlers[name] = handler; }
  };
  let online = options.online !== false;
  const context = vm.createContext({
    self: worker,
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
      async match(key) {
        const value = typeof key === 'string' ? new URL(key, worker.location.origin).href : key.url;
        return entries.get(value);
      }
    },
    fetch: async request => {
      if (!online) throw new Error('offline');
      return { ok: true, url: request.url, clone() { return { ok: true, url: request.url, cached: true }; } };
    },
    Response: class Response {
      constructor(body, init = {}) { this.body = body; this.status = init.status || 200; this.statusText = init.statusText || ''; }
    },
    Promise, Number, String, Object, URL, console,
    clients: { claim: async () => {} }
  });
  vm.runInContext(source, context);
  return {
    handlers, entries,
    setOnline(value) { online = value; },
    async dispatch(url, mode = 'no-cors') {
      const waits = [];
      let responsePromise;
      const request = { method: 'GET', url, mode, destination: 'script' };
      handlers.fetch({
        request,
        respondWith(promise) { responsePromise = promise; },
        waitUntil(promise) { waits.push(promise); }
      });
      const response = await responsePromise;
      await Promise.all(waits);
      return response;
    }
  };
}

test('successful lazy requests are cached and remain available offline across query-version changes only via exact or unversioned keys', async () => {
  const worker = createFetchWorker();
  const current = 'https://epiphany.test/data-expansion-runtime.js?v=expansion-runtime-20261108-3';
  const onlineResponse = await worker.dispatch(current);
  assert.equal(onlineResponse.url, current);
  assert.ok(worker.entries.has(current), 'the exact versioned request should be cached');

  worker.setOnline(false);
  const offlineResponse = await worker.dispatch(current);
  assert.equal(offlineResponse.url, current, 'the exact cached version should be served offline');

  const newer = 'https://epiphany.test/data-expansion-runtime.js?v=expansion-runtime-20261108-4';
  const missingVersion = await worker.dispatch(newer);
  assert.equal(missingVersion.status, 503, 'a different version must not silently receive stale versioned code');
});

test('unversioned optional cache entries can serve versioned lazy requests offline', async () => {
  const worker = createFetchWorker({ online: false });
  const unversioned = 'https://epiphany.test/data-expansion-runtime.js';
  worker.entries.set(unversioned, { url: unversioned, cached: true });
  const response = await worker.dispatch('https://epiphany.test/data-expansion-runtime.js?v=expansion-runtime-20261108-3');
  assert.equal(response.url, unversioned);
  assert.equal(response.cached, true);
});

test('missing optional assets fail with a clear offline response instead of an empty success', async () => {
  const worker = createFetchWorker({ online: false });
  const response = await worker.dispatch('https://epiphany.test/data-expansion-grammar.js?v=expansion-grammar-20261108-1');
  assert.equal(response.status, 503);
  assert.equal(response.statusText, 'Offline');
});
