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
