const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'adaptive-engine.js'), 'utf8');

function createEngine({ connection = {}, deviceMemory = 8, hardwareConcurrency = 8, reducedMotion = false, onLine = true } = {}) {
  const events = {};
  const warnings = [];
  const media = {
    matches: reducedMotion,
    addEventListener(name, fn) { events['media:' + name] = fn; },
    removeEventListener(name) { delete events['media:' + name]; }
  };
  const navConnection = {
    ...connection,
    addEventListener(name, fn) { events['connection:' + name] = fn; },
    removeEventListener(name) { delete events['connection:' + name]; }
  };
  const messages = [];
  const observers = [];
  const timers = [];
  const nav = {
    connection: navConnection, deviceMemory, hardwareConcurrency, onLine,
    serviceWorker: { controller: { postMessage(message) { messages.push(message); } } }
  };
  const classes = new Set();
  const document = {
    documentElement: { classList: {
      toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
      contains(name) { return classes.has(name); }
    } },
    visibilityState: 'visible',
    addEventListener(name, fn) { events['document:' + name] = fn; },
    removeEventListener(name) { delete events['document:' + name]; }
  };
  const window = {
    navigator: nav,
    addEventListener(name, fn) { events['window:' + name] = fn; },
    removeEventListener(name) { delete events['window:' + name]; },
    matchMedia() { return media; },
    PerformanceObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(options) { this.options = options; }
      disconnect() { this.disconnected = true; }
    },
    setTimeout(fn, delay) { const timer = { fn, delay, cleared: false }; timers.push(timer); return timer; },
    clearTimeout(timer) { if (timer) timer.cleared = true; }
  };
  vm.runInNewContext(source, { window, document, Object, Number, Set, console: { warn: (...args) => warnings.push(args) } });
  return { api: window.EPIPHANY_ADAPTIVE_ENGINE, events, window, document, media, navConnection, messages, nav, classes, warnings, observers, timers };
}

test('adaptive engine exposes conservative defaults and does not persist or transmit data', () => {
  const { api, window } = createEngine();
  assert.ok(api);
  assert.equal(api.shouldPrefetch(), true);
  assert.equal(api.getPolicy().maxConcurrentOptionalLoads, 3);
  assert.equal(Object.prototype.propertyIsEnumerable.call(window, 'EPIPHANY_ADAPTIVE_ENGINE'), false);
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|sendBeacon|supabase)\b/i);
});

test('data saver, slow networks, and constrained devices reduce optional work', () => {
  for (const options of [
    { connection: { saveData: true } },
    { connection: { effectiveType: '2g' } },
    { connection: { downlink: 0.4 } },
    { connection: { rtt: 1200 } },
    { deviceMemory: 2 },
    { hardwareConcurrency: 2 }
  ]) {
    const { api } = createEngine(options);
    assert.equal(api.shouldPrefetch(), false);
    assert.equal(api.getPolicy().allowBackgroundWarmCache, false);
    assert.equal(api.getPolicy().maxConcurrentOptionalLoads, 1);
    assert.equal(api.getPolicy().deferNonEssentialWork, true);
  }
});

test('offline state and reduced-motion preference are respected independently', () => {
  const offline = createEngine({ onLine: false }).api;
  assert.equal(offline.shouldPrefetch(), false);
  const motion = createEngine({ reducedMotion: true }).api;
  assert.equal(motion.getPolicy().respectReducedMotion, true);
  assert.equal(motion.getPolicy().allowSpeculativePreload, true);
});

test('capability changes notify subscribers and unsubscribe cleanly', () => {
  const { api, events, navConnection } = createEngine();
  const updates = [];
  const unsubscribe = api.subscribe((snapshot, policy) => updates.push({ snapshot, policy }));
  navConnection.saveData = true;
  events['connection:change']();
  assert.equal(updates.length, 1);
  assert.equal(updates[0].policy.allowSpeculativePreload, false);
  unsubscribe();
  navConnection.saveData = false;
  events['connection:change']();
  assert.equal(updates.length, 1);
  api.destroy();
});

test('engine tolerates missing browser capability APIs and listener failures', () => {
  const context = {
    window: { navigator: {}, addEventListener() {}, removeEventListener() {} },
    document: { visibilityState: 'visible' },
    Object, Number, Set, console
  };
  assert.doesNotThrow(() => vm.runInNewContext(source, context));
  assert.equal(context.window.EPIPHANY_ADAPTIVE_ENGINE.shouldPrefetch(), true);
  const { api, navConnection, warnings } = createEngine();
  const unsubscribe = api.subscribe(() => { throw new Error('consumer failure'); });
  navConnection.saveData = true;
  assert.doesNotThrow(() => api.refresh());
  assert.equal(warnings.length, 1, 'listener failures should be isolated and reported once');
  unsubscribe();
});


test('adaptive engine asks the service worker to resume optional caching when connectivity returns', () => {
  const { events, nav, messages } = createEngine({ onLine: false });
  assert.equal(messages.length, 0);
  nav.onLine = true;
  events['window:online']();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, 'EPIPHANY_WARM_OPTIONAL_CACHE');
});


test('adaptive engine enables lightweight motion only for constrained devices or reduced-motion users', () => {
  const low = createEngine({ deviceMemory: 2 });
  assert.equal(low.classes.has('ep-adaptive-lite'), true);
  const capable = createEngine();
  assert.equal(capable.classes.has('ep-adaptive-lite'), false);
  const motion = createEngine({ reducedMotion: true });
  assert.equal(motion.classes.has('ep-adaptive-lite'), true);
  motion.media.matches = false;
  motion.events['media:change']();
  assert.equal(motion.classes.has('ep-adaptive-lite'), false);
});


test('runtime long-task pressure pauses optional work and resumes after a quiet cooldown', () => {
  const { api, observers, timers, classes } = createEngine();
  const updates = [];
  const unsubscribe = api.subscribe((snapshot, policy) => updates.push({ snapshot, policy }));
  assert.equal(observers.length, 1, 'long-task monitoring should be installed when supported');
  assert.equal(observers[0].options.type, 'longtask');
  assert.equal(observers[0].options.buffered, true);
  observers[0].callback({ getEntries: () => [
    { duration: 90, startTime: 1000 },
    { duration: 120, startTime: 3000 }
  ] });
  assert.equal(api.getPolicy().runtimePressure, false, 'isolated long tasks should not throttle the app');
  observers[0].callback({ getEntries: () => [{ duration: 80, startTime: 5000 }] });
  assert.equal(api.getSnapshot().runtimePressure, true);
  assert.equal(api.getPolicy().allowSpeculativePreload, false);
  assert.equal(api.getPolicy().allowBackgroundWarmCache, false);
  assert.equal(api.getPolicy().maxConcurrentOptionalLoads, 1);
  assert.equal(api.getPolicy().deferNonEssentialWork, true);
  assert.equal(updates.length, 1, 'entering pressure should notify the loading scheduler');
  assert.equal(timers.at(-1).delay, 15000, 'recovery should wait for a quiet period');
  timers.at(-1).fn();
  assert.equal(api.getSnapshot().runtimePressure, false);
  assert.equal(api.getPolicy().allowSpeculativePreload, true);
  assert.equal(api.getPolicy().maxConcurrentOptionalLoads, 3);
  assert.equal(updates.length, 2, 'recovery should resume optional work');
  unsubscribe();
  api.destroy();
  assert.equal(observers[0].disconnected, true);
});

test('runtime pressure cooldown is extended by continuing long tasks and cleaned up on destroy', () => {
  const { api, observers, timers } = createEngine();
  observers[0].callback({ getEntries: () => [
    { duration: 70, startTime: 100 },
    { duration: 75, startTime: 200 },
    { duration: 90, startTime: 300 }
  ] });
  const firstTimer = timers.at(-1);
  observers[0].callback({ getEntries: () => [{ duration: 100, startTime: 9000 }] });
  const secondTimer = timers.at(-1);
  assert.equal(firstTimer.cleared, true, 'new pressure should extend the quiet-period deadline');
  assert.notEqual(firstTimer, secondTimer);
  api.destroy();
  assert.equal(secondTimer.cleared, true, 'destroy should cancel pending recovery timers');
});

test('runtime pressure monitoring is optional when PerformanceObserver is unavailable', () => {
  const context = {
    window: { navigator: {}, addEventListener() {}, removeEventListener() {}, matchMedia() { return { matches: false }; } },
    document: { visibilityState: 'visible' },
    Object, Number, Set, console
  };
  assert.doesNotThrow(() => vm.runInNewContext(source, context));
  assert.equal(context.window.EPIPHANY_ADAPTIVE_ENGINE.getPolicy().runtimePressure, false);
});
