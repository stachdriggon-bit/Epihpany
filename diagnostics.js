/* EPIPHANY Diagnostics — developer-only, in-memory runtime diagnostics.
   Explicitly started by an authorized developer. Never persists or transmits logs. */
(() => {
  'use strict';

  const MAX_EVENTS = 200;
  const ALLOWED_TYPES = new Set([
    'session_started', 'session_stopped', 'load_queued', 'load_started',
    'load_succeeded', 'load_failed', 'retry_scheduled', 'retry_started',
    'adaptive_policy', 'cache_result'
  ]);
  const ALLOWED_FIELDS = new Set([
    'group', 'asset', 'priority', 'durationMs', 'waitMs', 'activeLoads',
    'limit', 'attempt', 'outcome', 'online', 'lowResources',
    'lowBandwidth', 'runtimePressure', 'deferNonEssentialWork',
    'allowSpeculativePreload'
  ]);

  let active = false;
  let events = [];
  let nextId = 1;
  let startedAt = null;
  const listeners = new Set();

  function authorized() {
    try {
      return !!(window.EpiphanyAuth &&
        typeof window.EpiphanyAuth.isDeveloper === 'function' &&
        window.EpiphanyAuth.isDeveloper());
    } catch { return false; }
  }

  function safeText(value, max = 64) {
    return String(value == null ? '' : value)
      .replace(/[^a-zA-Z0-9_.:-]/g, '')
      .slice(0, max);
  }

  function safeAsset(value) {
    const raw = String(value == null ? '' : value).split('?')[0].split('#')[0];
    const name = raw.split('/').pop() || 'unknown';
    return safeText(name, 80) || 'unknown';
  }

  function safeDetails(details) {
    const safe = {};
    if (!details || typeof details !== 'object') return safe;
    Object.keys(details).forEach(key => {
      if (!ALLOWED_FIELDS.has(key)) return;
      const value = details[key];
      if (key === 'asset') safe.asset = safeAsset(value);
      else if (key === 'group' || key === 'priority' || key === 'outcome') safe[key] = safeText(value);
      else if (typeof value === 'boolean') safe[key] = value;
      else if (Number.isFinite(Number(value)) && value !== '') safe[key] = Math.max(0, Math.min(3600000, Number(value)));
    });
    return safe;
  }

  function publish() {
    const snapshot = getSnapshot();
    listeners.forEach(listener => {
      try { listener(snapshot); } catch {}
    });
  }

  function record(type, details = {}) {
    if (!active || !ALLOWED_TYPES.has(type)) return false;
    if (!authorized()) {
      active = false;
      sendWorkerState('EPIPHANY_DIAGNOSTICS_STOP');
      publish();
      return false;
    }
    try {
      const event = Object.freeze({
        id: nextId++,
        time: new Date().toISOString(),
        type,
        ...safeDetails(details)
      });
      events.push(event);
      if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
      publish();
      return true;
    } catch { return false; }
  }

  function sendWorkerState(type) {
    try {
      const controller = window.navigator && window.navigator.serviceWorker &&
        window.navigator.serviceWorker.controller;
      if (controller && typeof controller.postMessage === 'function') controller.postMessage({ type });
    } catch {}
  }

  function start() {
    if (!authorized()) return false;
    if (active) return true;
    active = true;
    startedAt = Date.now();
    sendWorkerState('EPIPHANY_DIAGNOSTICS_START');
    record('session_started');
    try {
      const engine = window.EPIPHANY_ADAPTIVE_ENGINE;
      if (engine && typeof engine.getSnapshot === 'function' && typeof engine.getPolicy === 'function') {
        const snapshot = engine.getSnapshot();
        const policy = engine.getPolicy();
        record('adaptive_policy', {
          online: snapshot.online,
          lowResources: snapshot.lowResources,
          lowBandwidth: snapshot.lowBandwidth,
          runtimePressure: snapshot.runtimePressure,
          deferNonEssentialWork: policy.deferNonEssentialWork,
          allowSpeculativePreload: policy.allowSpeculativePreload,
          limit: policy.maxConcurrentOptionalLoads
        });
      }
    } catch {}
    publish();
    return true;
  }

  function stop() {
    if (!active) return false;
    record('session_stopped');
    active = false;
    sendWorkerState('EPIPHANY_DIAGNOSTICS_STOP');
    publish();
    return true;
  }

  function clear() {
    if (!authorized()) return false;
    events = [];
    nextId = 1;
    publish();
    return true;
  }

  function getSnapshot() {
    return Object.freeze({
      active,
      startedAt,
      count: events.length,
      events: events.slice()
    });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function exportJson() {
    if (!authorized() || !events.length || typeof Blob !== 'function' ||
        !window.URL || typeof window.URL.createObjectURL !== 'function') return false;
    try {
      const blob = new Blob([JSON.stringify({
        product: 'EPIPHANY',
        exportedAt: new Date().toISOString(),
        eventCount: events.length,
        events
      }, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'epiphany-diagnostics-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch { return false; }
  }

  const serviceWorker = window.navigator && window.navigator.serviceWorker;
  if (serviceWorker && typeof serviceWorker.addEventListener === 'function') {
    serviceWorker.addEventListener('message', event => {
      if (!active || !authorized()) return;
      const data = event && event.data;
      if (!data || data.type !== 'EPIPHANY_DIAGNOSTIC_EVENT' || !data.event) return;
      record('cache_result', data.event);
    });
  }

  window.addEventListener('pagehide', stop);

  const api = Object.freeze({
    version: '1.0.0',
    start,
    stop,
    clear,
    record,
    subscribe,
    getSnapshot,
    exportJson,
    isActive: () => active
  });

  try {
    Object.defineProperty(window, 'EPIPHANY_DIAGNOSTICS', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: api
    });
  } catch {}
})();
