/* Load sizeable feature data only when that feature is first opened. */
(() => {
  'use strict';
  const groups = {
    stories: ['data-stories.js?v=6ba335cc'],
    world: ['data-world.js?v=e99f5bf6', 'data-world-sprites.js?v=6fff0f70']
  };
  const pending = new Map();

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        reject(new Error('Unable to load feature data: ' + src.split('?')[0]));
      };
      document.head.appendChild(script);
    });
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
