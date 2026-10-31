const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('feature data loader does not request large datasets until requested', async () => {
  const requested = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'script');
      return { async: true, src: '', remove() {} };
    },
    head: {
      appendChild(script) {
        requested.push(script.src);
        queueMicrotask(() => script.onload());
      }
    }
  };
  const merged = [];
  const context = { window: { EPIPHANY_MERGE_AR_TRANSLATIONS: () => merged.push(true) }, document, Promise, Map, Set, Object, Error };
  const source = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'lazy-data.js' }));
  vm.runInNewContext(source, context);
  assert.deepEqual(requested, []);

  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['data-stories.js', 'data-stories-expansion.js']);
  assert.ok(requested.every(src => /\?v=.+/.test(src)), 'loaded scripts should have cache-busting versions');
  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.equal(requested.length, 2);

  await context.window.EPIPHANY_LAZY_LOAD('world');
  assert.deepEqual(requested.slice(2).map(src => src.split('?')[0]), [
    'data-world.js',
    'data-world-sprites.js'
  ]);
  assert.ok(requested.slice(2).every(src => /\?v=.+/.test(src)));
  await context.window.EPIPHANY_LAZY_LOAD('arcade');
  await context.window.EPIPHANY_LAZY_LOAD('thinklab');
  await context.window.EPIPHANY_LAZY_LOAD('lifeskills');
  assert.deepEqual(requested.slice(4).map(src => src.split('?')[0]), [
    'practice-lab.js',
    'think-lab.js',
    'life-skills.js'
  ]);
  assert.ok(requested.slice(4).every(src => /\?v=.+/.test(src)));
  await context.window.EPIPHANY_LAZY_LOAD('arabic');
  assert.deepEqual(requested.slice(7).map(src => src.split('?')[0]), [
    'data-translation-ar.js',
    'data-translation-ar-fill.js'
  ]);
  assert.ok(requested.slice(7).every(src => /\?v=.+/.test(src)));
  assert.deepEqual(merged, [true]);
  await context.window.EPIPHANY_LAZY_LOAD('chronicle');
  assert.deepEqual(requested.slice(9).map(src => src.split('?')[0]), ['data-world-registry.js', 'data-world-events.js']);
  assert.ok(requested.slice(9).every(src => /\?v=.+/.test(src)));
});

test('initial HTML defers stories and World data and keeps loader in offline shell', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const expansion = fs.readFileSync(path.join(root, 'data-expansion.js'), 'utf8');
  assert.doesNotMatch(expansion, /STORIES\.push\(/);
  assert.match(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), /data-stories-expansion\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-stories\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-world(?:-sprites)?\.js/);
  assert.match(html, /lazy-data\.js\?v=[^\"&]+/);
  assert.doesNotMatch(html, /href=\"(?:resonance|life-skills)\.css/);
  assert.match(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), /EPIPHANY_LAZY_STYLE/);
  assert.doesNotMatch(html, /<script[^>]+src="data-translation-ar\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="(?:think-lab|practice-lab|life-skills)\.js/);
  assert.match(sw, /'\.\/lazy-data\.js'/);
  const coreAssets = sw.match(/const CORE_ASSETS = \[([^\]]*)\];/)?.[1] || '';
  const lazyAssets = sw.match(/const LAZY_ASSETS = \[([^\]]*)\];/)?.[1] || '';
  assert.ok(coreAssets, 'service worker should define core offline assets');
  assert.ok(lazyAssets, 'service worker should define lazy offline assets');
  for (const asset of ['data-stories.js', 'data-world.js', 'data-world-sprites.js', 'think-lab.js', 'practice-lab.js', 'life-skills.js', 'data-translation-ar.js']) {
    assert.ok(!coreAssets.includes("'./" + asset + "'"), asset + ' should not be a core startup asset');
  }
  for (const asset of ['resonance.css', 'life-skills.css']) {
    assert.ok(!coreAssets.includes("'./" + asset + "'"), asset + ' must not be part of the core cache');
    assert.ok(lazyAssets.includes("'./" + asset + "'"), asset + ' should be cached as a lazy offline asset');
  }
  for (const asset of ['data-stories.js', 'data-world.js', 'data-world-registry.js', 'data-world-events.js', 'data-world-sprites.js', 'think-lab.js', 'practice-lab.js', 'life-skills.js']) {
    assert.ok(lazyAssets.includes("'./" + asset + "'"), asset + ' should be cached as a lazy offline asset');
  }
  assert.match(sw, /const cached = await cache\.match\(request\);\s*if \(cached\) return cached;/);
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(app, /window\.EPIPHANY_MERGE_AR_TRANSLATIONS = mergeArabicTranslationCatalog/);
  assert.doesNotMatch(app, /if \(state\.helpArabic \|\| state\.translationEnabled\) ensureArabicTranslationCatalog\(\)/);
  assert.match(app, /if \(state\.helpArabic\) ensureArabicTranslationCatalog\(\)/);
  assert.match(app, /if \(state\.helpArabic\) ensureArabicTranslationCatalog\(\)/);
  assert.doesNotMatch(sw, /'\.\/data-translation-ar\.js'/);
});


test('overlapping feature groups share one in-flight script request', async () => {
  const requested = [];
  const scripts = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'script');
      const script = { async: true, src: '', removed: false, remove() { this.removed = true; } };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const context = vm.createContext({ window: {}, document });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const thinkLab = context.window.EPIPHANY_LAZY_LOAD('thinklab');
  const lifeSkills = context.window.EPIPHANY_LAZY_LOAD('lifeskills');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'the shared Think Lab script should only be inserted once');
  assert.match(requested[0], /^think-lab\.js\?/);

  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);
  assert.match(requested[1], /^life-skills\.js\?/);
  scripts[1].onload();

  await Promise.all([thinkLab, lifeSkills]);
  assert.equal(requested.length, 2);
});

test('failed lazy scripts are removed and can be retried', async () => {
  const requested = [];
  const scripts = [];
  const document = {
    createElement() {
      const script = { async: true, src: '', removed: false, remove() { this.removed = true; } };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const context = vm.createContext({ window: {}, document });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const failed = context.window.EPIPHANY_LAZY_LOAD('stories');
  await new Promise(resolve => setImmediate(resolve));
  scripts[0].onerror();
  await assert.rejects(failed, /Unable to load feature data: data-stories\.js/);
  assert.equal(scripts[0].removed, true);

  const retry = context.window.EPIPHANY_LAZY_LOAD('stories');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3);
  scripts[2].onload();
  await retry;
});


test('feature styles load only when requested', async () => {
  const requested = [];
  const links = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'link');
      const link = { rel: '', href: '', remove() {} };
      links.push(link);
      return link;
    },
    head: { appendChild(link) { requested.push(link.href); } }
  };
  const context = vm.createContext({ window: {}, document });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  assert.deepEqual(requested, []);
  const first = context.window.EPIPHANY_LAZY_STYLE('resonance');
  const second = context.window.EPIPHANY_LAZY_STYLE('resonance');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1);
  assert.match(requested[0], /^resonance\.css\?v=/);
  links[0].onload();
  await Promise.all([first, second]);
  const life = context.window.EPIPHANY_LAZY_STYLE('lifeskills');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);
  assert.match(requested[1], /^life-skills\.css\?v=/);
  links[1].onload();
  await life;
});


test('navigation intent prefetches optional sections only when the adaptive policy allows it', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement(tag) {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const engine = { getPolicy: () => ({
    allowSpeculativePreload: true, deferNonEssentialWork: false
  }) };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: engine,
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  const target = { getAttribute: () => 'stories' };
  listeners['document:pointerover']({ type: 'pointerover', pointerType: 'mouse', target: { closest: () => target } });
  assert.equal(requested.length, 0, 'speculative work should wait for the short idle delay');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(requested[0], /^data-stories\.js\?/);
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2);

  const constrained = { ...engine, getPolicy: () => ({
    allowSpeculativePreload: false, deferNonEssentialWork: true
  }) };
  window.EPIPHANY_ADAPTIVE_ENGINE = constrained;
  listeners['document:pointerover']({ type: 'pointerover', pointerType: 'mouse', target: { closest: () => ({ getAttribute: () => 'world' }) } });
  assert.equal(requested.length, 2, 'constrained devices must not prefetch optional sections');
});


test('optional lazy loads respect the adaptive concurrency limit', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement(tag) {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const intent = group => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => group }) }
  });
  intent('arcade');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['practice-lab.js']);

  intent('thinklab');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'the second optional load must wait for the concurrency slot');

  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['practice-lab.js', 'think-lab.js']);
  scripts[1].onload();
});

test('explicit navigation bypasses and promotes queued optional loads', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const intent = group => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => group }) }
  });
  intent('arcade');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  intent('thinklab');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['practice-lab.js']);

  const explicit = context.window.EPIPHANY_LAZY_LOAD('thinklab');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['practice-lab.js', 'think-lab.js'],
    'an explicit request must promote its matching queued prefetch immediately');

  scripts[1].onload();
  await explicit;
  scripts[0].onload();
});


test('background optional loads pause while constrained, resume once, and never delay explicit navigation', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  let policy = { allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1 };
  const subscribers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: {
      getPolicy: () => policy,
      subscribe(fn) { subscribers.push(fn); return () => {}; }
    },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);
  const intent = group => listeners['document:pointerover']({
    type: 'pointerover', pointerType: 'mouse',
    target: { closest: () => ({ getAttribute: () => group }) }
  });

  intent('arcade');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['practice-lab.js']);

  intent('thinklab');
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'the second optional load should wait for the concurrency slot');

  policy = { ...policy, allowSpeculativePreload: false, deferNonEssentialWork: true };
  subscribers.forEach(fn => fn());
  scripts[0].onload();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'queued optional work must remain paused while constrained');

  policy = { ...policy, allowSpeculativePreload: true, deferNonEssentialWork: false };
  subscribers.forEach(fn => fn());
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requested.map(src => src.split('?')[0]), ['practice-lab.js', 'think-lab.js'],
    'queued optional work should resume when conditions improve');
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));

  policy = { ...policy, allowSpeculativePreload: false, deferNonEssentialWork: true };
  const explicit = context.window.EPIPHANY_LAZY_LOAD('world');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested[2].split('?')[0], 'data-world.js',
    'explicit navigation must bypass background deferral');
  scripts[2].onload();
  await new Promise(resolve => setImmediate(resolve));
  scripts[3].onload();
  await explicit;
});


test('failed feature recovery resumes the complete data group and clears after success', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const subscribers = [];
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const policy = { allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1 };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: {
      getPolicy: () => policy,
      subscribe(fn) { subscribers.push(fn); return () => {}; }
    },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const initial = context.window.EPIPHANY_LAZY_LOAD('stories');
  await new Promise(resolve => setImmediate(resolve));
  scripts[0].onerror();
  await assert.rejects(initial, /Unable to load feature data: data-stories\.js/);

  document.visibilityState = 'hidden';
  listeners['window:online']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 1, 'recovery must not run while the page is hidden');

  document.visibilityState = 'visible';
  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 1000, 'the first recovery should use a short initial backoff');
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'recovery should retry the failed first file');
  scripts[1].onload();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'recovery must continue with the remaining group files');
  scripts[2].onload();
  await new Promise(resolve => setImmediate(resolve));

  listeners['window:online']();
  subscribers.forEach(fn => fn());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'successful group recovery must clear its failure record');
});

test('failed feature styles recover as a complete style group', async () => {
  const requested = [];
  const links = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const link = { rel: '', href: '', remove() {} };
      links.push(link);
      return link;
    },
    head: { appendChild(link) { requested.push(link.href); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const initial = context.window.EPIPHANY_LAZY_STYLE('resonance');
  await new Promise(resolve => setImmediate(resolve));
  links[0].onerror();
  await assert.rejects(initial, /Unable to load feature styles: resonance\.css/);

  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1);
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'visibility recovery should retry the failed stylesheet');
  links[1].onload();
  await new Promise(resolve => setImmediate(resolve));

  listeners['window:online']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'successful style recovery must clear its failure record');
});

test('feature-group recovery is deduplicated and stops after two recovery attempts', async () => {
  const requested = [];
  const scripts = [];
  const listeners = {};
  const timers = [];
  const document = {
    visibilityState: 'visible',
    addEventListener(name, fn) { listeners['document:' + name] = fn; },
    createElement() {
      const script = { src: '', async: true, remove() {} };
      scripts.push(script);
      return script;
    },
    head: { appendChild(script) { requested.push(script.src); } }
  };
  const window = {
    EPIPHANY_ADAPTIVE_ENGINE: { getPolicy: () => ({
      allowSpeculativePreload: true, deferNonEssentialWork: false, maxConcurrentOptionalLoads: 1
    }) },
    navigator: { onLine: true },
    addEventListener(name, fn) { listeners['window:' + name] = fn; },
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {}
  };
  const context = vm.createContext({ window, document, Promise, Map, Set, Object, Error });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), context);

  const initial = context.window.EPIPHANY_LAZY_LOAD('world');
  await new Promise(resolve => setImmediate(resolve));
  scripts[0].onerror();
  await assert.rejects(initial, /Unable to load feature data/);

  listeners['window:online']();
  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1, 'multiple recovery signals should share one scheduled retry');
  assert.equal(timers[0].delay, 1000);
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 2, 'the first bounded recovery attempt should start once');
  scripts[1].onerror();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timers.length, 1, 'a failed retry should schedule the second attempt');
  assert.equal(timers[0].delay, 4000, 'the second recovery should use a longer backoff');

  listeners['window:online']();
  timers.shift().fn();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'one further group recovery attempt should be allowed');
  scripts[2].onerror();
  await new Promise(resolve => setImmediate(resolve));

  listeners['window:online']();
  listeners['document:visibilitychange']();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requested.length, 3, 'group recovery must stop after the bounded retry budget');
});
