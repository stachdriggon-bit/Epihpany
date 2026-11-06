const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function normalizedTokens(sentence) {
  return String(sentence).toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort();
}

test('Sentence Scramble bank contains 72 unique reviewed challenges in three equal modes', () => {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(root, 'sentence-scramble-bank.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'sentence-scramble-bank.js' }));
  vm.runInNewContext(source, context);

  const bank = context.window.EPIPHANY_SENTENCE_SCRAMBLE_BANK;
  assert.ok(bank, 'bank should expose its public global');
  assert.equal(bank.schemaVersion, 1);
  assert.equal(bank.gameId, 'sentence-scramble');
  assert.equal(bank.totalChallenges, 72);

  const all = [];
  for (const [mode, prefix] of [['guided', 'SS-G-'], ['steady', 'SS-S-'], ['challenge', 'SS-C-']]) {
    assert.ok(Array.isArray(bank.modes[mode]), mode + ' should be an array');
    assert.equal(bank.modes[mode].length, 24, mode + ' should contain 24 challenges');
    for (const [index, item] of bank.modes[mode].entries()) {
      assert.equal(item.id, prefix + String(index + 1).padStart(3, '0'));
      assert.ok(item.sentence && item.sentence.trim(), item.id + ' needs a sentence');
      assert.ok(item.skill && item.skill.trim(), item.id + ' needs a skill note');
      assert.ok(item.explanation && item.explanation.trim(), item.id + ' needs an explanation field');
      assert.ok(item.prompt && item.prompt.trim(), item.id + ' needs a prompt');
      assert.ok(normalizedTokens(item.sentence).length > 0, item.id + ' must produce tiles');
      assert.ok(Array.isArray(item.acceptedAnswers), item.id + ' acceptedAnswers must be an array');
      for (const alternative of item.acceptedAnswers) {
        assert.notDeepEqual(normalizedTokens(alternative), normalizedTokens(item.sentence), item.id + ' must not repeat its canonical answer');
        assert.deepEqual(normalizedTokens(alternative), normalizedTokens(item.sentence), item.id + ' alternatives must use the same word multiset');
      }
      all.push(item);
    }
  }

  assert.equal(all.length, 72);
  assert.equal(new Set(all.map(item => item.id)).size, 72, 'IDs must be unique');
  const sentences = all.map(item => item.sentence.toLowerCase().replace(/\s+/g, ' ').trim());
  assert.equal(new Set(sentences).size, 72, 'sentences must not be duplicated');
});

test('Sentence Scramble is lazy-loaded before Think Lab and its session uses the full selected mode', () => {
  const lazy = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  const think = fs.readFileSync(path.join(root, 'think-lab.js'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

  assert.match(lazy, /sentence-scramble-bank\.js\?v=[^'"]+/);
  assert.match(lazy, /sentence-scramble-bank\.js[^']*think-lab\.js/);
  assert.match(worker, /'\.\/sentence-scramble-bank\.js'/);
  assert.match(think, /EPIPHANY_SENTENCE_SCRAMBLE_BANK/);
  assert.match(think, /mode === 'scramble'\) \? 24/);
  assert.match(think, /accepted=\[item\.sentence/);
  assert.doesNotMatch(think, /item\.options\[item\.answer\]/);
});
