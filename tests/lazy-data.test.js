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
  assert.deepEqual(requested, ['data-stories.js?v=6ba335cc', 'data-stories-expansion.js?v=20261024p']);
  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.equal(requested.length, 2);

  await context.window.EPIPHANY_LAZY_LOAD('world');
  assert.deepEqual(requested.slice(2), [
    'data-world.js?v=e99f5bf6',
    'data-world-sprites.js?v=6fff0f70'
  ]);
  await context.window.EPIPHANY_LAZY_LOAD('arcade');
  await context.window.EPIPHANY_LAZY_LOAD('thinklab');
  await context.window.EPIPHANY_LAZY_LOAD('lifeskills');
  assert.deepEqual(requested.slice(4), [
    'practice-lab.js?v=0f7e5c76',
    'think-lab.js?v=72d8145c',
    'life-skills.js?v=c0ba2ab9'
  ]);
  await context.window.EPIPHANY_LAZY_LOAD('arabic');
  assert.equal(requested[7], 'data-translation-ar.js?v=74c3f4b5');
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
  assert.match(html, /lazy-data\.js\?v=20261024n/);
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
  assert.match(app, /if \(state\.helpArabic \|\| state\.translationEnabled\) ensureArabicTranslationCatalog\(\)/);
  assert.match(app, /if \(state\.helpArabic\) ensureArabicTranslationCatalog\(\)/);
  assert.doesNotMatch(sw, /'\.\/data-translation-ar\.js'/);
});
