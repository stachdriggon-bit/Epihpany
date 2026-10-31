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
  const loadedStyles = new Set();
  const loadingStyles = new Map();

  function loadStyle(href) {
    if (loadedStyles.has(href)) return Promise.resolve();
    if (loadingStyles.has(href)) return loadingStyles.get(href);
    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        loadedStyles.add(href);
        loadingStyles.delete(href);
        resolve();
      };
      link.onerror = () => {
        link.remove();
        loadingStyles.delete(href);
        reject(new Error('Unable to load feature styles: ' + href.split('?')[0]));
      };
      document.head.appendChild(link);
    });
    loadingStyles.set(href, promise);
    return promise;
  }

  window.EPIPHANY_LAZY_STYLE = function (group) {
    if (!Object.prototype.hasOwnProperty.call(styleGroups, group)) {
      return Promise.reject(new Error('Unknown feature style group'));
    }
    if (!pendingStyles.has(group)) {
      const promise = styleGroups[group].reduce((chain, href) => chain.then(() => loadStyle(href)), Promise.resolve())
        .catch(error => {
          pendingStyles.delete(group);
          throw error;
        });
      pendingStyles.set(group, promise);
    }
    return pendingStyles.get(group);
  };

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
      const tasks = [window.EPIPHANY_LAZY_LOAD(group)];
      if (Object.prototype.hasOwnProperty.call(styleGroups, group)) tasks.push(window.EPIPHANY_LAZY_STYLE(group));
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

  function loadScript(src) {
    if (loaded.has(src)) return Promise.resolve();
    if (loadingScripts.has(src)) return loadingScripts.get(src);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => {
        loaded.add(src);
        loadingScripts.delete(src);
        if (src.startsWith('data-translation-ar-fill.js') && typeof window.EPIPHANY_MERGE_AR_TRANSLATIONS === 'function') {
          try { window.EPIPHANY_MERGE_AR_TRANSLATIONS(); }
          catch (error) { reject(error); return; }
        }
        resolve();
      };
      script.onerror = () => {
        script.remove();
        loadingScripts.delete(src);
        reject(new Error('Unable to load feature data: ' + src.split('?')[0]));
      };
      document.head.appendChild(script);
    });
    loadingScripts.set(src, promise);
    return promise;
  }

  window.EPIPHANY_LAZY_LOAD = function (group) {
    if (!Object.prototype.hasOwnProperty.call(groups, group)) {
      return Promise.reject(new Error('Unknown feature data group'));
    }
    if (!pending.has(group)) {
      const promise = groups[group].reduce((chain, src) => chain.then(() => loadScript(src)), Promise.resolve())
        .catch(error => {
          pending.delete(group);
          throw error;
        });
      pending.set(group, promise);
    }
    return pending.get(group);
  };
})();
