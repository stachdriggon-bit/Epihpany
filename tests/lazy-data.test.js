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
  const context = { window: {}, document, Promise, Map, Set, Object, Error };
  const source = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'lazy-data.js' }));
  vm.runInNewContext(source, context);
  assert.deepEqual(requested, []);

  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.deepEqual(requested, ['data-stories.js?v=6ba335cc']);
  await context.window.EPIPHANY_LAZY_LOAD('stories');
  assert.equal(requested.length, 1);

  await context.window.EPIPHANY_LAZY_LOAD('world');
  assert.deepEqual(requested.slice(1), [
    'data-world.js?v=e99f5bf6',
    'data-world-sprites.js?v=6fff0f70'
  ]);
});

test('initial HTML defers stories and World data and keeps loader in offline shell', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  assert.doesNotMatch(html, /<script[^>]+src="data-stories\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="data-world(?:-sprites)?\.js/);
  assert.match(html, /lazy-data\.js\?v=20261024l/);
  assert.match(sw, /'\.\/lazy-data\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-stories\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-world\.js'/);
  assert.doesNotMatch(sw, /'\.\/data-world-sprites\.js'/);
});
