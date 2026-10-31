/* EPIPHANY Adaptive Engine — phase 1.
   Reads coarse device/network capabilities and exposes a safe loading policy.
   No storage, telemetry, account access, progress access, or content changes. */
(() => {
  'use strict';

  if (typeof window === 'undefined') return;

  const listeners = new Set();
  let connection = null;
  let mediaQuery = null;
  let snapshot = null;
  let destroyed = false;

  function readCapabilities() {
    const nav = window.navigator || {};
    let reducedMotion = false;
    try {
      mediaQuery = mediaQuery || (typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null);
      reducedMotion = !!(mediaQuery && mediaQuery.matches);
    } catch {}

    const conn = nav.connection || nav.mozConnection || nav.webkitConnection || null;
    const effectiveType = conn && typeof conn.effectiveType === 'string'
      ? conn.effectiveType.toLowerCase() : 'unknown';
    const downlink = Number(conn && conn.downlink);
    const rtt = Number(conn && conn.rtt);
    const saveData = !!(conn && conn.saveData);
    const lowBandwidth = saveData ||
      effectiveType === 'slow-2g' || effectiveType === '2g' ||
      (Number.isFinite(downlink) && downlink > 0 && downlink < 0.8) ||
      (Number.isFinite(rtt) && rtt >= 800);
    const memory = Number(nav.deviceMemory);
    const cores = Number(nav.hardwareConcurrency);
    const lowResources =
      (Number.isFinite(memory) && memory > 0 && memory <= 2) ||
      (Number.isFinite(cores) && cores > 0 && cores <= 2);

    return Object.freeze({
      online: nav.onLine !== false,
      saveData,
      effectiveType,
      lowBandwidth,
      lowResources,
      reducedMotion,
      visibility: document && document.visibilityState === 'hidden' ? 'hidden' : 'visible'
    });
  }

  function buildPolicy(capabilities) {
    const constrained = capabilities.lowBandwidth || capabilities.lowResources;
    return Object.freeze({
      allowSpeculativePreload: !constrained && capabilities.online,
      allowBackgroundWarmCache: !constrained && capabilities.online,
      maxConcurrentOptionalLoads: constrained ? 1 : 3,
      deferNonEssentialWork: constrained || capabilities.visibility === 'hidden',
      respectReducedMotion: capabilities.reducedMotion
    });
  }

  function refresh() {
    if (destroyed) return;
    const next = readCapabilities();
    const previous = snapshot;
    snapshot = next;
    if (previous && Object.keys(next).every(key => next[key] === previous[key])) return;
    const policy = buildPolicy(next);
    // Reduce motion-heavy decoration on constrained devices, and follow the OS motion preference.
    try {
      const root = document && document.documentElement;
      if (root && root.classList && typeof root.classList.toggle === 'function') {
        root.classList.toggle('ep-adaptive-lite', next.lowResources || next.reducedMotion);
      }
    } catch {}
    // When connectivity returns, ask the service worker to resume optional offline warming.
    // This is a same-origin message only; the worker independently rechecks device/network limits.
    if (previous && !previous.online && next.online && policy.allowBackgroundWarmCache &&
        next.visibility === 'visible') {
      try {
        const controller = (window.navigator || {}).serviceWorker?.controller;
        if (controller && typeof controller.postMessage === 'function') {
          controller.postMessage({ type: 'EPIPHANY_WARM_OPTIONAL_CACHE' });
        }
      } catch {}
    }
    listeners.forEach(listener => {
      try { listener(next, policy); } catch (error) {
        try { console.warn('[EPIPHANY] Adaptive listener failed safely.', error); } catch {}
      }
    });
  }

  function on(target, event, handler) {
    try {
      if (target && typeof target.addEventListener === 'function') {
        target.addEventListener(event, handler);
        return () => {
          try { target.removeEventListener(event, handler); } catch {}
        };
      }
    } catch {}
    return () => {};
  }

  const cleanups = [];
  cleanups.push(on(window, 'online', refresh));
  cleanups.push(on(window, 'offline', refresh));
  cleanups.push(on(document, 'visibilitychange', refresh));

  try {
    connection = (window.navigator || {}).connection ||
      (window.navigator || {}).mozConnection ||
      (window.navigator || {}).webkitConnection || null;
    cleanups.push(on(connection, 'change', refresh));
  } catch {}

  try {
    if (mediaQuery) cleanups.push(on(mediaQuery, 'change', refresh));
  } catch {}

  refresh();

  const api = Object.freeze({
    version: '1.0.0',
    getSnapshot() {
      return snapshot || readCapabilities();
    },
    getPolicy() {
      return buildPolicy(snapshot || readCapabilities());
    },
    shouldPrefetch() {
      const policy = buildPolicy(snapshot || readCapabilities());
      return policy.allowSpeculativePreload;
    },
    subscribe(listener) {
      if (typeof listener !== 'function' || destroyed) return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanups.forEach(cleanup => cleanup());
      listeners.clear();
    }
  });

  try {
    if (!window.EPIPHANY_ADAPTIVE_ENGINE) {
      Object.defineProperty(window, 'EPIPHANY_ADAPTIVE_ENGINE', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: api
      });
    }
  } catch {
    // Adaptive enhancements are optional; the application remains independent.
  }
})();
