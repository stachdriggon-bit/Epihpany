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
  let runtimePressure = false;
  let pressureTimer = null;
  let longTaskStarts = [];
  const LONG_TASK_WINDOW_MS = 10000;
  const LONG_TASK_THRESHOLD = 3;
  const PRESSURE_COOLDOWN_MS = 15000;

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
    const lowResources =
      (Number.isFinite(memory) && memory > 0 && memory <= 2);

    return Object.freeze({
      online: nav.onLine !== false,
      saveData,
      effectiveType,
      lowBandwidth,
      lowResources,
      reducedMotion,
      runtimePressure,
      visibility: document && document.visibilityState === 'hidden' ? 'hidden' : 'visible'
    });
  }

  function buildPolicy(capabilities) {
    const constrained = capabilities.lowBandwidth || capabilities.lowResources || capabilities.runtimePressure;
    return Object.freeze({
      allowSpeculativePreload: !constrained && capabilities.online,
      allowBackgroundWarmCache: !constrained && capabilities.online,
      maxConcurrentOptionalLoads: constrained ? 1 : 3,
      deferNonEssentialWork: constrained || capabilities.visibility === 'hidden',
      runtimePressure: capabilities.runtimePressure,
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
    // When connectivity returns, ask the service worker to refresh only optional files
    // already cached through use or intent prefetch. The worker rechecks device/network limits.
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

  function observeRuntimePressure() {
    const Observer = window.PerformanceObserver;
    if (typeof Observer !== 'function') return;
    try {
      const observer = new Observer(list => {
        const entries = list && typeof list.getEntries === 'function' ? list.getEntries() : [];
        let changed = false;
        entries.forEach(entry => {
          const duration = Number(entry && entry.duration);
          if (!Number.isFinite(duration) || duration < 50) return;
          const start = Number(entry.startTime);
          const now = Number.isFinite(start) ? start : Date.now();
          longTaskStarts.push(now);
          longTaskStarts = longTaskStarts.filter(value => now - value <= LONG_TASK_WINDOW_MS);
          if (longTaskStarts.length >= LONG_TASK_THRESHOLD) changed = true;
        });
        if (!changed) return;
        if (!runtimePressure) {
          runtimePressure = true;
          refresh();
        }
        try {
          if (pressureTimer !== null && typeof window.clearTimeout === 'function') window.clearTimeout(pressureTimer);
          if (typeof window.setTimeout === 'function') {
            pressureTimer = window.setTimeout(() => {
              pressureTimer = null;
              runtimePressure = false;
              longTaskStarts = [];
              refresh();
            }, PRESSURE_COOLDOWN_MS);
          }
        } catch {}
      });
      observer.observe({ type: 'longtask', buffered: true });
      cleanups.push(() => {
        try { observer.disconnect(); } catch {}
      });
    } catch {
      // Long-task timing is not supported in every browser; the adaptive engine remains optional.
    }
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

  refresh();

  // readCapabilities() creates the media query during the first refresh; attach its
  // change listener afterwards so OS motion-preference changes are observed.
  try {
    if (mediaQuery) cleanups.push(on(mediaQuery, 'change', refresh));
  } catch {}

  observeRuntimePressure();

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
      if (pressureTimer !== null && typeof window.clearTimeout === 'function') {
        try { window.clearTimeout(pressureTimer); } catch {}
      }
      pressureTimer = null;
      longTaskStarts = [];
      runtimePressure = false;
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
