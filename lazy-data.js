/* Load sizeable feature data only when that feature is first opened. */
(() => {
  'use strict';
  const groups = {
    stories: ['data-stories.js?v=6ba335cc', 'data-stories-expansion.js?v=world-archive-pilot-1'],
    chronicle: ['data-world-registry.js?v=world-archive-registry-2', 'data-world-events.js?v=world-archive-registry-1'],
    resonance: ['resonance.js?v=resonance-chapters-2-5'],
    world: ['data-world.js?v=e99f5bf6', 'data-world-sprites.js?v=6fff0f70'],
    fluentia: ['fluentia-directions-bank.js?v=fluentia-directions-map-20261109-3', 'sound-maze-bank.js?v=sound-maze-contract-1', 'sound-maze-content.js?v=fluentia-source-registration-20261107-1', 'fluentia-textwise-bank.js?v=textwise-independent-sequencing-20261107-1', 'fluentia-soundscape-bank.js?v=soundscape-dictation-20261107-1', 'fluentia-practice-bank.js?v=fluentia-practice-bank-20261109-3'],
    thinklab: ['sound-maze-bank.js?v=sound-maze-contract-1', 'sound-maze-content.js?v=fluentia-source-registration-20261107-1', 'word-connections-bank.js?v=word-connections-72-20261106-1', 'word-forge-bank.js?v=word-forge-prompt-only-20261111-1', 'word-hunt-bank.js?v=word-hunt-bank-20261109-1', 'think-lab-progression.js?v=think-lab-daily-20261109-1', 'think-lab.js?v=sentence-scramble-unified-validator-20261112-1', 'word-hunt.js?v=word-hunt-engine-20261109-2', 'codebreaker-bank.js?v=codebreaker-bank-20261109-1', 'codebreaker.js?v=codebreaker-engine-20261109-2', 'letter-grid-bank.js?v=letter-grid-bank-20261109-1', 'letter-grid.js?v=letter-grid-engine-20261109-2'],
    languageDetective: ['language-detective-assessment-schemas.js?v=casebound-foundation-1', 'language-detective-investigation.js?v=casebound-investigation-model-1', 'language-detective-cefr-patterns.js?v=casebound-foundation-1', 'language-detective-assessment-engine.js?v=casebound-foundation-1', 'language-detective-assessment-fixtures.js?v=casebound-foundation-1', 'language-detective-ui.js?v=casebound-skin-2'],
    lifeskills: ['life-skills.js?v=life-skills-standalone-20261108-1'],
    expansionShared: ['data-expansion-translations.js?v=expansion-translations-20261108-1', 'data-expansion-runtime.js?v=expansion-runtime-20261108-3', 'data-expansion-wotd.js?v=expansion-wotd-20261108-1'],
    expansionVocabulary: ['data-expansion-vocabulary.js?v=expansion-vocabulary-20261108-1'], expansionSpelling: ['data-expansion-spelling.js?v=expansion-spelling-20261108-1'], expansionGrammar: ['data-expansion-grammar.js?v=expansion-grammar-20261108-1'], expansionStory: ['data-expansion-story.js?v=expansion-story-20261108-1'], expansionListening: ['data-expansion-listening.js?v=expansion-listening-20261108-1'], expansionAdvanced: ['data-expansion-advanced.js?v=expansion-advanced-20261108-1'],
    spot: ['data-spot.js?v=spot-bank-lazy-20261108-1'],
    typing: ['data-typing.js?v=typing-bank-lazy-20261108-1'],
    arabic: ['data-translation-ar.js?v=question-context-20261026-20', 'data-translation-ar-fill.js?v=fill-4']
  };
  const styleGroups = {
    thinklab: ['word-hunt.css?v=word-hunt-ui-20261107-2', 'codebreaker.css?v=codebreaker-ui-20261107-1', 'letter-grid.css?v=letter-grid-ui-20261107-1'],
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

  function diagnosticRecord(type, details) {
    try {
      const diagnostics = window.EPIPHANY_DIAGNOSTICS;
      if (diagnostics && typeof diagnostics.record === 'function') diagnostics.record(type, details);
    } catch {}
  }

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
    const startedAt = Date.now();
    diagnosticRecord('load_started', {
      asset: job.key || 'optional',
      priority: asUser ? 'user' : 'optional',
      waitMs: job.queuedAt ? startedAt - job.queuedAt : 0,
      activeLoads: activeOptionalLoads,
      limit: optionalLoadLimit()
    });
    // Release the concurrency slot before resolving the job promise. The next
    // file in a sequential feature group can then enter the queue immediately,
    // without racing the caller's promise continuation against queue pumping.
    const finish = () => {
      if (!asUser) activeOptionalLoads = Math.max(0, activeOptionalLoads - 1);
      if (job.key) queuedOptionalLoads.delete(job.key);
      pumpOptionalQueue();
    };
    Promise.resolve().then(job.run).then(value => {
      diagnosticRecord('load_succeeded', { asset: job.key || 'optional', durationMs: Date.now() - startedAt });
      finish();
      job.resolve(value);
    }, error => {
      diagnosticRecord('load_failed', { asset: job.key || 'optional', durationMs: Date.now() - startedAt });
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
    diagnosticRecord('retry_scheduled', { group: key, attempt: previous ? previous.attempts : 0 });
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
      diagnosticRecord('retry_started', { group: key, attempt: entry.attempts });
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
    const job = { key, run, resolve: null, reject: null, started: false, promise: null, queuedAt: Date.now() };
    diagnosticRecord('load_queued', { asset: key || 'optional', priority: 'optional' });
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
    const groupStartedAt = Date.now();
    diagnosticRecord('load_queued', { group: 'style:' + group, priority });
    job.promise = styleGroups[group].reduce((chain, href) => chain.then(() => loadStyle(href, job.priority)), Promise.resolve())
      .then(() => {
        diagnosticRecord('load_succeeded', { group: 'style:' + group, durationMs: Date.now() - groupStartedAt });
        clearFailedOptionalLoad('style-group:' + group);
      }, error => {
        diagnosticRecord('load_failed', { group: 'style:' + group, durationMs: Date.now() - groupStartedAt });
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

  function cancelScheduledPrefetch(keepGroup = null) {
    scheduledPrefetch.forEach((task, group) => {
      if (keepGroup && group === keepGroup) return;
      try {
        if (task.kind === 'idle' && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(task.id);
        else if (task.kind === 'timer' && typeof window.clearTimeout === 'function') window.clearTimeout(task.id);
      } catch {}
      scheduledPrefetch.delete(group);
    });
  }

  function schedulePrefetch(group) {
    const policy = currentAdaptivePolicy();
    if (!policy || !policy.allowSpeculativePreload || policy.deferNonEssentialWork ||
        document.visibilityState === 'hidden' || (window.navigator && window.navigator.onLine === false) ||
        !Object.prototype.hasOwnProperty.call(groups, group)) return false;

    // A navigation hint is speculative, not a request to preload every section
    // the pointer crosses. Keep only the latest pending intent.
    cancelScheduledPrefetch(group);
    lastIntentGroup = group;
    if (pending.has(group) || scheduledPrefetch.has(group)) return false;
    const task = { kind: 'pending', id: null };
    scheduledPrefetch.set(group, task);
    const run = () => {
      // A cancelled callback can already be queued by the browser. Ignore it
      // unless this exact intent is still the current scheduled task.
      if (scheduledPrefetch.get(group) !== task) return;
      scheduledPrefetch.delete(group);
      const current = currentAdaptivePolicy();
      if (!current || !current.allowSpeculativePreload || current.deferNonEssentialWork ||
          document.visibilityState === 'hidden' || (window.navigator && window.navigator.onLine === false)) return;
      const tasks = [loadGroup(group, 'optional')];
      if (Object.prototype.hasOwnProperty.call(styleGroups, group)) tasks.push(loadStyleGroup(group, 'optional'));
      Promise.all(tasks).catch(() => {});
    };
    if (typeof window.requestIdleCallback === 'function') {
      task.kind = 'idle';
      task.id = window.requestIdleCallback(run, { timeout: 1600 });
    } else if (typeof window.setTimeout === 'function') {
      task.kind = 'timer';
      task.id = window.setTimeout(run, 350);
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

  function loadGroupAssets(group, priority) {
    if (!Object.prototype.hasOwnProperty.call(groups, group)) {
      return Promise.reject(new Error('Unknown feature data group'));
    }
    let job = pending.get(group);
    if (job) {
      if (priority === 'user' && job.priority !== 'user') {
        job.priority = 'user';
        // Promote only assets that are actually waiting in the optional queue.
        // Calling runWithPriority for every asset in an already-loaded group
        // creates needless promise work and can amplify repeated navigation.
        groups[group].forEach(src => {
          if (queuedOptionalLoads.has(src)) runWithPriority('user', () => Promise.resolve(), src);
        });
      }
      return job.promise;
    }
    job = { priority, promise: null };
    const groupStartedAt = Date.now();
    diagnosticRecord('load_queued', { group, priority });
    job.promise = groups[group].reduce((chain, src) => chain.then(() => loadScript(src, job.priority)), Promise.resolve())
      .then(() => {
        diagnosticRecord('load_succeeded', { group, durationMs: Date.now() - groupStartedAt });
        if (group === 'expansionShared') {
          const ready=typeof window.EPIPHANY_REGISTER_EXPANSION_BANK==='function' && window.EPIPHANY_EXPANSION_TRANSLATIONS && typeof window.EPIPHANY_EXPANSION_TRANSLATIONS==='object' && typeof WOTD_WORDS!=='undefined' && Array.isArray(WOTD_WORDS);
          if(!ready){groups[group].forEach(src=>{loaded.delete(src);const file=src.split('?')[0];if(typeof document.querySelectorAll==='function')document.querySelectorAll('script').forEach(node=>{if((node.getAttribute('src')||'').split('?')[0].endsWith(file))node.remove();});});pending.delete(group);throw new Error('Shared expansion data did not initialize.');}
        }
        if(group.startsWith('expansion')&&group!=='expansionShared'){
          const game=group.slice('expansion'.length).toLowerCase();
          const ready=window.EPIPHANY_EXPANSION_BANKS&&window.EPIPHANY_EXPANSION_BANKS[game]===true&&typeof GAMES!=='undefined'&&GAMES[game]&&Array.isArray(GAMES[game].questions)&&GAMES[game].questions.some(q=>q&&q.id&&q.id.startsWith('exp-'));
          if(!ready){groups[group].forEach(src=>{loaded.delete(src);const file=src.split('?')[0];if(typeof document.querySelectorAll==='function')document.querySelectorAll('script').forEach(node=>{if((node.getAttribute('src')||'').split('?')[0].endsWith(file))node.remove();});});pending.delete(group);throw new Error('The '+game+' expansion bank loaded, but its questions did not register.');}
          if(typeof window.EPIPHANY_FLUENTIA_REGISTER_SOURCES==='function')window.EPIPHANY_FLUENTIA_REGISTER_SOURCES();
        }
        if (group === 'directions' && typeof window.EPIPHANY_FLUENTIA_REGISTER_SOURCES === 'function') {
          window.EPIPHANY_FLUENTIA_REGISTER_SOURCES();
        }
        if (group === 'fluentia') {
          if (typeof window.EPIPHANY_FLUENTIA_REGISTER_SOURCES === 'function') {
            window.EPIPHANY_FLUENTIA_REGISTER_SOURCES();
          }
          const engine = window.EPIPHANY_FLUENTIA_SESSION_ENGINE;
          const ready = engine && typeof engine.getActivity === 'function' &&
            engine.getActivity('soundscape-sound-maze') &&
            engine.getActivity('soundscape-dictation') &&
            engine.getActivity('textwise-sequence') &&
            engine.getActivity('soundscape-dictation-bank') &&
            engine.getActivity('real-world-speaking-shadowing');
          if (!ready) {
            groups[group].forEach(src => {
              loaded.delete(src);
              const file = src.split('?')[0];
              if (typeof document.querySelectorAll === 'function') document.querySelectorAll('script').forEach(node => {
                if ((node.getAttribute('src') || '').split('?')[0].endsWith(file)) node.remove();
              });
            });
            pending.delete(group);
            throw new Error('Fluentia source files loaded, but one or more practice banks did not register.');
          }
        }
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
        diagnosticRecord('load_failed', { group, durationMs: Date.now() - groupStartedAt });
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

  function loadGroup(group, priority) {
    if (!Object.prototype.hasOwnProperty.call(groups, group)) {
      return Promise.reject(new Error('Unknown feature data group'));
    }
    // Expansion game banks depend on the shared translation/runtime/WOTD
    // layer. Call the asset loader directly after that dependency resolves;
    // routing back through this wrapper would recursively request the shared
    // layer forever.
    if (group.startsWith('expansion') && group !== 'expansionShared') {
      return loadGroupAssets('expansionShared', priority)
        .then(() => loadGroupAssets(group, priority));
    }
    return loadGroupAssets(group, priority);
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