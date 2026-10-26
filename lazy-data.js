/* Load sizeable feature data only when that feature is first opened. */
(() => {
  'use strict';
  const groups = {
    stories: ['data-stories.js?v=6ba335cc', 'data-stories-expansion.js?v=d1afc773'],
    world: ['data-world.js?v=e99f5bf6', 'data-world-sprites.js?v=6fff0f70'],
    arcade: ['practice-lab.js?v=0f7e5c76'],
    thinklab: ['think-lab.js?v=72d8145c'],
    lifeskills: ['think-lab.js?v=72d8145c', 'life-skills.js?v=c0ba2ab9'],
    arabic: ['data-translation-ar.js?v=74c3f4b6', 'data-translation-ar-fill.js?v=fill-1']
  };
  const pending = new Map();
  const loaded = new Set();
  const loadingScripts = new Map();

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
