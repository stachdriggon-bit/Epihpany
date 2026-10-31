/* Load sizeable feature data only when that feature is first opened. */
(() => {
  'use strict';
  const groups = {
    stories: ['data-stories.js?v=6ba335cc', 'data-stories-expansion.js?v=world-archive-pilot-1'],
    chronicle: ['data-world-registry.js?v=world-archive-registry-2', 'data-world-events.js?v=world-archive-registry-1'],
    resonance: ['resonance.js?v=resonance-chapters-2-5'],
    world: ['data-world.js?v=e99f5bf6', 'data-world-sprites.js?v=6fff0f70'],
    arcade: ['practice-lab.js?v=0f7e5c76'],
    thinklab: ['think-lab.js?v=72d8145c'],
    lifeskills: ['think-lab.js?v=72d8145c', 'life-skills.js?v=c0ba2ab9'],
    arabic: ['data-translation-ar.js?v=question-context-20261026-20', 'data-translation-ar-fill.js?v=fill-4']
  };
  const styleGroups = {
    resonance: ['resonance.css?v=mobile-hotspots-20261031-2'],
    lifeskills: ['life-skills.css?v=calm-studio-20261025']
  };
  const pendingStyles = new Map();
  const optionalQueue = [];
  const queuedOptionalLoads = new Map();
  let activeOptionalLoads = 0;

  function optionalLoadLimit() {
    try {
      const policy = window.EPIPHANY_ADAPTIVE_ENGINE?.getPolicy?.();
      const limit = Number(policy && policy.maxConcurrentOptionalLoads);
      return Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : 1;
    } catch { return 1; }
  }

  function startOptionalJob(job, asUser) {
    if (job.started) return;
    job.started = true;
    if (job.key) queuedOptionalLoads.delete(job.key);
    if (!asUser) activeOptionalLoads++;
    Promise.resolve().then(job.run).then(job.resolve, job.reject).finally(() => {
      if (!asUser) activeOptionalLoads = Math.max(0, activeOptionalLoads - 1);
      if (job.key) queuedOptionalLoads.delete(job.key);
      pumpOptionalQueue();
    });
  }

  function pumpOptionalQueue() {
    while (activeOptionalLoads < optionalLoadLimit() && optionalQueue.length) {
      const job = optionalQueue.shift();
      if (!job.started) startOptionalJob(job, false);
    }
  }

  function runWithPriority(priority, run, key) {
    if (priority !== 'optional') {
      const queued = key && queuedOptionalLoads.get(key);
      if (queued) {
        const index = optionalQueue.indexOf(queued);
        if (index !== -1) optionalQueue.splice(index, 1);
        startOptionalJob(queued, true);
        return queued.promise;
      }
      return Promise.resolve().then(run);
    }
    return new Promise((resolve, reject) => {
      const job = { key, run, resolve, reject, started: false, promise: null };
      job.promise = new Promise((done, fail) => { job.resolve = done; job.reject = fail; });
      if (key) queuedOptionalLoads.set(key, job);
      optionalQueue.push(job);
      pumpOptionalQueue();
      resolve = null;
    });
  }
  function loadStyle(href, priority) {
    if (loadedStyles.has(href)) return Promise.resolve();
    if (loadingStyles.has(href)) {
      if (priority === 'user') return runWithPriority('user', () => Promise.resolve(), href).then(() => loadingStyles.get(href));
      return loadingStyles.get(href);
    }
    const promise = runWithPriority(priority, () => new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => { loadedStyles.add(href); resolve(); };
      link.onerror = () => {
        link.remove();
        reject(new Error('Unable to load feature styles: ' + href.split('?')[0]));
      };
      document.head.appendChild(link);
    }), href).finally(() => loadingStyles.delete(href));
    loadingStyles.set(href, promise);
    return promise;
  }

  function loadStyleGroup(group, priority) {
    if (!Object.prototype.hasOwnProperty.call(styleGroups, group)) {
      return Promise.reject(new Error('Unknown feature style group'));
    }
    if (!pendingStyles.has(group)) {
      const promise = styleGroups[group].reduce((chain, href) => chain.then(() => loadStyle(href, priority)), Promise.resolve())
        .catch(error => { pendingStyles.delete(group); throw error; });
      pendingStyles.set(group, promise);
    }
    return pendingStyles.get(group);
  }

  window.EPIPHANY_LAZY_STYLE = group => loadStyleGroup(group, 'user');

  const pending = new Map();
  const loaded = new Set();
  const loadingScripts = new Map();
  const viewGroups = Object.freeze({
    stories: 'stories',
    chronicle: 'chronicle',
    resonance: 'resonance',
    world: 'world',
    arcade: 'arcade',
    thinklab: 'thinklab',
    lifeskills: 'lifeskills'
  });
  const scheduledPrefetch = new Map();
  let lastIntentGroup = '';

  function currentAdaptivePolicy() {
    try {
      const engine = window.EPIPHANY_ADAPTIVE_ENGINE;
      return engine && typeof engine.getPolicy === 'function' ? engine.getPolicy() : null;
    } catch { return null; }
  }

  function cancelScheduledPrefetch() {
    scheduledPrefetch.forEach(task => {
      try {
        if (task.kind === 'idle' && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(task.id);
        else if (task.kind === 'timer' && typeof window.clearTimeout === 'function') window.clearTimeout(task.id);
      } catch {}
    });
    scheduledPrefetch.clear();
  }

  function schedulePrefetch(group) {
    const policy = currentAdaptivePolicy();
    if (!policy || !policy.allowSpeculativePreload || policy.deferNonEssentialWork ||
        document.visibilityState === 'hidden' || (window.navigator && window.navigator.onLine === false)) return false;
    if (!Object.prototype.hasOwnProperty.call(groups, group) || pending.has(group) || scheduledPrefetch.has(group)) return false;
    lastIntentGroup = group;
    const run = () => {
      scheduledPrefetch.delete(group);
      const current = currentAdaptivePolicy();
      if (!current || !current.allowSpeculativePreload || current.deferNonEssentialWork ||
          document.visibilityState === 'hidden' || (window.navigator && window.navigator.onLine === false)) return;
      const tasks = [loadGroup(group, 'optional')];
      if (Object.prototype.hasOwnProperty.call(styleGroups, group)) tasks.push(loadStyleGroup(group, 'optional'));
      Promise.all(tasks).catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') {
      scheduledPrefetch.set(group, { kind: 'idle', id: window.requestIdleCallback(run, { timeout: 1600 }) });
    } else if (typeof window.setTimeout === 'function') {
      scheduledPrefetch.set(group, { kind: 'timer', id: window.setTimeout(run, 350) });
    } else {
      Promise.resolve().then(run);
    }
    return true;
  }

  function handleNavigationIntent(event) {
    if (event.type === 'pointerover' && event.pointerType === 'touch') return;
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-view]') : null;
    const view = target && target.getAttribute('data-view');
    const group = viewGroups[view];
    if (group) schedulePrefetch(group);
  }

  if (document && typeof document.addEventListener === 'function') {
    document.addEventListener('pointerover', handleNavigationIntent, { passive: true });
    document.addEventListener('focusin', handleNavigationIntent);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') cancelScheduledPrefetch();
      else if (lastIntentGroup) schedulePrefetch(lastIntentGroup);
    });
  }
  if (window && typeof window.addEventListener === 'function') {
    window.addEventListener('offline', cancelScheduledPrefetch);
    window.addEventListener('online', () => {
      if (lastIntentGroup) schedulePrefetch(lastIntentGroup);
    });
  }

  function loadScript(src, priority) {
    if (loaded.has(src)) return Promise.resolve();
    if (loadingScripts.has(src)) {
      if (priority === 'user') return runWithPriority('user', () => Promise.resolve(), src).then(() => loadingScripts.get(src));
      return loadingScripts.get(src);
    }
    const promise = runWithPriority(priority, () => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => {
        loaded.add(src);
        if (src.startsWith('data-translation-ar-fill.js') && typeof window.EPIPHANY_MERGE_AR_TRANSLATIONS === 'function') {
          try { window.EPIPHANY_MERGE_AR_TRANSLATIONS(); }
          catch (error) { reject(error); return; }
        }
        resolve();
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('Unable to load feature data: ' + src.split('?')[0]));
      };
      document.head.appendChild(script);
    }), src).finally(() => loadingScripts.delete(src));
    loadingScripts.set(src, promise);
    return promise;
  }

  function loadGroup(group, priority) {
    if (!Object.prototype.hasOwnProperty.call(groups, group)) {
      return Promise.reject(new Error('Unknown feature data group'));
    }
    if (!pending.has(group)) {
      const promise = groups[group].reduce((chain, src) => chain.then(() => loadScript(src, priority)), Promise.resolve())
        .catch(error => { pending.delete(group); throw error; });
      pending.set(group, promise);
    }
    return pending.get(group);
  }

  window.EPIPHANY_LAZY_LOAD = group => loadGroup(group, 'user');

  try {
    const engine = window.EPIPHANY_ADAPTIVE_ENGINE;
    if (engine && typeof engine.subscribe === 'function') engine.subscribe(() => pumpOptionalQueue());
  } catch {}
})();
