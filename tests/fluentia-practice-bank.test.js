const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const AdapterFactory = require('../fluentia-adapters.js');

test('Fluentia practice samples register independently of the retired Practice Lab interface', () => {
  let sources = null;
  const window = { EPIPHANY_FLUENTIA_REGISTER_SOURCES(value) { sources = value; } };
  const script = fs.readFileSync(path.join(__dirname, '..', 'fluentia-practice-bank.js'), 'utf8');
  vm.runInNewContext(script, { window, String });
  assert.ok(sources && Array.isArray(sources.practiceSamples));
  assert.equal(sources.practiceSamples.length, 8);
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
  const adapters = AdapterFactory.createAdapters({ practiceSamples: sources.practiceSamples });
  for (const id of ['soundscape-dictation','real-world-speaking-shadowing']) {
    const adapter = adapters.find(item => item.id === id);
    assert.ok(adapter, id);
    assert.equal(adapter.getItems({level:'A1'}).length, 2);
    const item = adapter.getItems({level:'A1'})[0];
    assert.equal(adapter.evaluate(item, item.text).correct, true);
    assert.equal(adapter.evaluate(item, 'unrelated words').correct, false);
  }
});
