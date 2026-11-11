const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const AdapterFactory = require('../fluentia-adapters.js');

test('Fluentia practice samples and sentence-builder prompts register from one canonical bank', () => {
  let sources = null;
  const window = { EPIPHANY_FLUENTIA_REGISTER_SOURCES(value) { sources = value; } };
  const script = fs.readFileSync(path.join(__dirname, '..', 'fluentia-practice-bank.js'), 'utf8');
  vm.runInNewContext(script, { window, String });
  assert.ok(sources && Array.isArray(sources.practiceSamples));
  assert.equal(sources.practiceSamples.length, 8);
  assert.ok(Array.isArray(sources.sentenceItems));
  assert.equal(sources.sentenceItems.length, 36);
  assert.deepEqual(Object.fromEntries(['A1','A2','B1','B2','C1','C2'].map(level => [level, sources.sentenceItems.filter(item => item.level === level).length])), {A1:6,A2:6,B1:6,B2:6,C1:6,C2:6});
  assert.equal(new Set(sources.sentenceItems.map(item => item.id)).size, 36);
  assert.ok(sources.sentenceItems.every(item => item.text.trim().length > 10 && /[.!?]$/.test(item.text) && /[ء-ي]/.test(item.ar)));
  assert.ok(sources.sentenceItems.filter(item => item.level === 'A1').every(item => item.text.trim().split(/\s+/).length >= 5), 'A1 sentence-builder prompts must provide at least five selectable word tiles');
  assert.deepEqual(
    Object.fromEntries(['A1','A2','B1','B2'].map(level => [level, sources.practiceSamples.filter(item => item.level === level).length])),
    {A1:2,A2:2,B1:2,B2:2}
  );
  assert.equal(new Set(sources.practiceSamples.map(item => item.id)).size, 8);
  assert.ok(sources.practiceSamples.every(item => item.text.trim().split(/\s+/).length >= 7));
});

test('Fluentia dictation and speaking adapters consume the extracted practice bank', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'fluentia-practice-bank.js'), 'utf8');
  let sources = null;
  vm.runInNewContext(script, { window: { EPIPHANY_FLUENTIA_REGISTER_SOURCES(value) { sources = value; } }, String });
  const adapters = AdapterFactory.createAdapters({ practiceSamples: sources.practiceSamples, sentenceItems: sources.sentenceItems });
  for (const id of ['soundscape-dictation','real-world-speaking-shadowing']) {
    const adapter = adapters.find(item => item.id === id);
    assert.ok(adapter, id);
    assert.equal(adapter.getItems({level:'A1'}).length, 2);
    const item = adapter.getItems({level:'A1'})[0];
    assert.equal(adapter.evaluate(item, item.text).correct, true);
    assert.equal(adapter.evaluate(item, 'unrelated words').correct, false);
  }
});

test('Fluentia Sentence Builder has authored prompts at every CEFR level', () => {
  let sources = null;
  const script = fs.readFileSync(path.join(__dirname, '..', 'fluentia-practice-bank.js'), 'utf8');
  vm.runInNewContext(script, { window: { EPIPHANY_FLUENTIA_REGISTER_SOURCES(value) { sources = value; } }, String });
  const builder = AdapterFactory.createAdapters({ sentenceItems: sources.sentenceItems }).find(item => item.id === 'sentence-studio-sentence-builder');
  assert.ok(builder);
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    const items = builder.getItems({level});
    assert.equal(items.length, 6, level);
    for (const item of items) {
      assert.equal(builder.evaluate(item, item.text).correct, true);
      assert.equal(builder.evaluate(item, item.text.split(' ').reverse()).correct, false);
    }
  }
});
