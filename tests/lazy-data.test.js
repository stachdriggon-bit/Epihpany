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
  assert.equal(requested[7].split('?')[0], 'data-translation-ar.js');
  assert.match(requested[7], /\?v=.+/);
  assert.deepEqual(merged, [true]);
});

test('initial HTML defers stories and World data and keeps loader in offline shell', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const expansion = fs.readFileSync(path.join(root, 'data-expansion.js'), 'utf8');
  assert.doesNotMatch(expansion, /STORIES\.push\(/);
  assert.match(fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8'), /data-stories-expansion\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-stories\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-world(?:-sprites)?\.js/);
  assert.match(html, /lazy-data\.js\?v=20261024o/);
  assert.doesNotMatch(html, /<script[^>]+src="data-translation-ar\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="(?:think-lab|practice-lab|life-skills)\.js/);
  assert.match(sw, /'\.\/lazy-data\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-stories\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-world\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-world-sprites\.js'/);
  assert.doesNotMatch(sw, /'\.\/(?:think-lab|practice-lab|life-skills)\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-translation-ar\.js'/);
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
