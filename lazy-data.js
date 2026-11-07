/* Load sizeable feature data only when that feature is first opened. */
(() => {
  'use strict';
  const groups = {
    stories: ['data-stories.js?v=6ba335cc', 'data-stories-expansion.js?v=world-archive-pilot-1'],
    chronicle: ['data-world-registry.js?v=world-archive-registry-2', 'data-world-events.js?v=world-archive-registry-1'],
    resonance: ['resonance.js?v=resonance-chapters-2-5'],
    world: ['data-world.js?v=e99f5bf6', 'data-world-sprites.js?v=6fff0f70'],
    arcade: ['practice-lab.js?v=george-voice-unified-20261106-1'],
    thinklab: ['sound-maze-bank.js?v=sound-maze-contract-1', 'sound-maze-content.js?v=sound-maze-content-20261106-1', 'odd-one-out-bank.js?v=odd-one-out-bank-2', 'word-connections-bank.js?v=word-connections-72-20261106-1', 'sentence-scramble-bank.js?v=sentence-scramble-72-20261106-1', 'word-forge-bank.js?v=word-forge-72-20261107-1', 'chain-reaction-bank.js?v=chain-reaction-72-20261107-1', 'word-hunt-bank.js?v=word-hunt-bank-20261107-3', 'think-lab.js?v=word-hunt-card-20261107-4', 'word-hunt.js?v=word-hunt-engine-20261107-6'],
    languageDetective: ['language-detective-assessment-schemas.js?v=casebound-foundation-1', 'language-detective-investigation.js?v=casebound-investigation-model-1', 'language-detective-cefr-patterns.js?v=casebound-foundation-1', 'language-detective-assessment-engine.js?v=casebound-foundation-1', 'language-detective-assessment-fixtures.js?v=casebound-foundation-1', 'language-detective-ui.js?v=casebound-skin-2'],
    lifeskills: ['sound-maze-bank.js?v=sound-maze-contract-1', 'sound-maze-content.js?v=sound-maze-content-20261106-1', 'odd-one-out-bank.js?v=odd-one-out-bank-2', 'word-connections-bank.js?v=word-connections-72-20261106-1', 'sentence-scramble-bank.js?v=sentence-scramble-72-20261106-1', 'word-forge-bank.js?v=word-forge-72-20261107-1', 'chain-reaction-bank.js?v=chain-reaction-72-20261107-1', 'word-hunt-bank.js?v=word-hunt-bank-20261107-3', 'think-lab.js?v=word-hunt-card-20261107-4', 'word-hunt.js?v=word-hunt-engine-20261107-6', 'life-skills.js?v=c0ba2ab9'],
    arabic: ['data-translation-ar.js?v=question-context-20261026-20', 'data-translation-ar-fill.js?v=fill-4']
  };
  const styleGroups = {
    thinklab: ['word-hunt.css?v=word-hunt-ui-20261107-2'],
    languageDetective: ['language-detective.css?v=casebound-skin-2'],
    resonance: ['resonance.css?v=mobile-hotspots-20261031-2'],
    lifeskills: ['life-skills.css?v=calm-studio-20261025']
  };
  const pendingStyles = new Map();
  const loadedStyles = new Set();
  const loadingStyles = new Map();
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
    // Release the concurrency slot before resolving the job promise. The next
    // file in a sequential feature group can then enter the queue immediately,
    // without racing the caller's promise continuation against queue pumping.
    const finish = () => {
      if (!asUser) activeOptionalLoads = Math.max(0, activeOptionalLoads - 1);
      if (job.key) queuedOptionalLoads.delete(job.key);
      pumpOptionalQueue();
    };
    Promise.resolve().then(job.run).then(value => {
      finish();
      job.resolve(value);
    }, error => {
      finish();
      job.reject(error);
    });
  }

  function optionalWorkAllowed() {
    const policy = currentAdaptivePolicy();
    return !!policy && !policy.deferNonEssentialWork &&
      document.visibilityState !== 'hidden' &&
      !(window.navigator && window.navigator.onLine === false);
  }

  // Remember failed optional groups so recovery can resume the complete feature,
  // not merely retry one file and leave the rest of the group unloaded.
  // Retries are bounded and continue to use the normal optional-load scheduler.
  const failedOptionalLoads = new Map();
  const recoveringOptionalLoads = new Set();
  const scheduledRecoveries = new Map();
  const MAX_OPTIONAL_RECOVERY_ATTEMPTS = 2;
  const OPTIONAL_RECOVERY_DELAYS = [1000, 4000];

  function rememberFailedOptionalLoad(key, retry) {
    const previous = failedOptionalLoads.get(key);
    failedOptionalLoads.set(key, {
      attempts: previous ? previous.attempts : 0,
      retry
    });
    recoverFailedOptionalLoads();
  }

  function clearFailedOptionalLoad(key) {
    const timer = scheduledRecoveries.get(key);
    if (timer !== undefined) {
      try { window.clearTimeout(timer); } catch {}
      scheduledRecoveries.delete(key);
    }
    failedOptionalLoads.delete(key);
  }

  function scheduleOptionalRecovery(key, entry) {
    if (scheduledRecoveries.has(key) || recoveringOptionalLoads.has(key) ||
        entry.attempts >= MAX_OPTIONAL_RECOVERY_ATTEMPTS ||
        typeof window.setTimeout !== 'function') return;
    const delay = OPTIONAL_RECOVERY_DELAYS[entry.attempts] || OPTIONAL_RECOVERY_DELAYS[OPTIONAL_RECOVERY_DELAYS.length - 1];
    const timer = window.setTimeout(() => {
      scheduledRecoveries.delete(key);
      if (failedOptionalLoads.get(key) !== entry || !optionalWorkAllowed()) return;
      entry.attempts++;
      recoveringOptionalLoads.add(key);
      Promise.resolve().then(entry.retry).catch(() => {}).finally(() => {
        recoveringOptionalLoads.delete(key);
        if (failedOptionalLoads.has(key)) recoverFailedOptionalLoads();
      });
    }, delay);
    scheduledRecoveries.set(key, timer);
  }

  function recoverFailedOptionalLoads() {
    if (!optionalWorkAllowed()) return;
    failedOptionalLoads.forEach((entry, key) => {
      scheduleOptionalRecovery(key, entry);
    });
  }

  function pumpOptionalQueue() {
    // Keep speculative/background work queued while the page or device is constrained.
    // Explicit user-priority requests bypass this gate in runWithPriority().
    if (!optionalWorkAllowed()) return;
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
    const job = { key, run, resolve: null, reject: null, started: false, promise: null };
    job.promise = new Promise((resolve, reject) => {
      job.resolve = resolve;
      job.reject = reject;
    });
    if (key) queuedOptionalLoads.set(key, job);
    optionalQueue.push(job);
    pumpOptionalQueue();
    return job.promise;
  }
  function loadStyle(href, priority) {
    if (loadedStyles.has(href)) return Promise.resolve();
    if (loadingStyles.has(href)) {
      if (priority === 'user') runWithPriority('user', () => Promise.resolve(), href);
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
    let job = pendingStyles.get(group);
    if (job) {
      if (priority === 'user') {
        job.priority = 'user';
        styleGroups[group].forEach(href => runWithPriority('user', () => Promise.resolve(), href));
      }
      return job.promise;
    }
    job = { priority, promise: null };
    job.promise = styleGroups[group].reduce((chain, href) => chain.then(() => loadStyle(href, job.priority)), Promise.resolve())
      .then(() => clearFailedOptionalLoad('style-group:' + group), error => {
        pendingStyles.delete(group);
        rememberFailedOptionalLoad('style-group:' + group, () => loadStyleGroup(group, 'optional'));
        throw error;
      });
    pendingStyles.set(group, job);
    return job.promise;
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
      else {
        recoverFailedOptionalLoads();
        if (lastIntentGroup) schedulePrefetch(lastIntentGroup);
      }
    });
  }
  if (window && typeof window.addEventListener === 'function') {
    window.addEventListener('offline', cancelScheduledPrefetch);
    window.addEventListener('online', () => {
      recoverFailedOptionalLoads();
      if (lastIntentGroup) schedulePrefetch(lastIntentGroup);
    });
  }

  function loadScript(src, priority) {
    if (loaded.has(src)) return Promise.resolve();
    if (loadingScripts.has(src)) {
      if (priority === 'user') runWithPriority('user', () => Promise.resolve(), src);
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
    let job = pending.get(group);
    if (job) {
      if (priority === 'user') {
        job.priority = 'user';
        groups[group].forEach(src => runWithPriority('user', () => Promise.resolve(), src));
      }
      return job.promise;
    }
    job = { priority, promise: null };
    job.promise = groups[group].reduce((chain, src) => chain.then(() => loadScript(src, job.priority)), Promise.resolve())
      .then(() => {
        if (group === 'languageDetective') {
          const schemas = window.EPIPHANY_LANGUAGE_DETECTIVE_SCHEMAS;
          const cefr = window.EPIPHANY_LANGUAGE_DETECTIVE_CEFR;
          const engine = window.EPIPHANY_LANGUAGE_DETECTIVE_ENGINE;
          const fixtures = window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES;
          const ui = window.EPIPHANY_LANGUAGE_DETECTIVE;
          const ready = schemas && typeof schemas.validateEvaluationRequest === 'function' &&
            cefr && typeof cefr.getCefrProfile === 'function' &&
            engine && typeof engine.evaluate === 'function' &&
            fixtures && fixtures.cases && Object.keys(fixtures.cases).length > 0 &&
            ui && ui.available === true && typeof ui.mount === 'function';
          if (!ready) {
            // A script's load event can fire even when its execution throws.
            // Clear the group cache so an explicit retry can fetch and execute it again.
            groups[group].forEach(src => {
              loaded.delete(src);
              const file = src.split('?')[0];
              if (typeof document.querySelectorAll === 'function') document.querySelectorAll('script').forEach(node => {
                if ((node.getAttribute('src') || '').split('?')[0].endsWith(file)) node.remove();
              });
            });
            pending.delete(group);
            throw new Error('The Language Detective files loaded, but one or more required modules did not initialize.');
          }
        }
        clearFailedOptionalLoad('data-group:' + group);
      }, error => {
        pending.delete(group);
        if (group === 'languageDetective') {
          groups[group].forEach(src => {
            loaded.delete(src);
            const file = src.split('?')[0];
            document.querySelectorAll('script').forEach(node => {
              if ((node.getAttribute('src') || '').split('?')[0].endsWith(file)) node.remove();
            });
          });
        }
        rememberFailedOptionalLoad('data-group:' + group, () => loadGroup(group, 'optional'));
        throw error;
      });
    pending.set(group, job);
    return job.promise;
  }

  window.EPIPHANY_LAZY_LOAD = group => loadGroup(group, 'user');

  try {
    const engine = window.EPIPHANY_ADAPTIVE_ENGINE;
    if (engine && typeof engine.subscribe === 'function') engine.subscribe(() => {
      const policy = currentAdaptivePolicy();
      if (!policy || policy.deferNonEssentialWork ||
          document.visibilityState === 'hidden' ||
          (window.navigator && window.navigator.onLine === false)) {
        cancelScheduledPrefetch();
        return;
      }
      pumpOptionalQueue();
      recoverFailedOptionalLoads();
      if (lastIntentGroup) schedulePrefetch(lastIntentGroup);
    });
  } catch {}
})();