const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'word-forge-bank.js'), 'utf8');
const context = vm.createContext({window:{}});
vm.runInContext(source, context, {filename:'word-forge-bank.js',timeout:5000});
const bank = context.window.EPIPHANY_WORD_FORGE_BANK;

function sortedLetters(value) {
  return String(value).toUpperCase().split('').sort().join('');
}
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('Word Forge bank exposes the approved schema and validates all 72 challenges', () => {
  assert.equal(bank.schemaVersion, 1);
  assert.equal(bank.gameId, 'word-forge');
  assert.deepEqual(Array.from(bank.modes), ['guided','steady','challenge']);
  const result = bank.validateBank();
  assert.equal(result.valid, true, result.errors.join('; '));
  assert.equal(result.totalChallenges, 72);
  assert.deepEqual(Array.from(result.errors), []);
});

test('each Word Forge mode contains 24 complete, uniquely identified challenges', () => {
  const allIds = new Set();
  for (const mode of bank.modes) {
    const rounds = bank.getRounds(mode);
    assert.equal(rounds.length, 24, mode + ' must contain 24 challenges');
    for (const item of rounds) {
      assert.ok(item.id.startsWith('WF-' + mode[0].toUpperCase() + '-'));
      assert.equal(allIds.has(item.id), false, item.id + ' must be unique across the full bank');
      allIds.add(item.id);
      assert.ok(item.clue.trim(), item.id + ' needs a clue');
      assert.ok(item.explain.trim(), item.id + ' needs an explanation');
      assert.ok(item.skill.trim(), item.id + ' needs a skill label');
      assert.equal(sortedLetters(item.letters), sortedLetters(item.answerWord), item.id + ' letters must exactly match its answer');
      assert.equal(item.prompt, 'Forge the word from the letter tiles.');
    }
  }
  assert.equal(allIds.size, 72);
});

test('selectRound returns every challenge once from only the requested mode', () => {
  for (const mode of bank.modes) {
    const rounds = bank.selectRound(mode, seeded(mode.length * 73));
    assert.equal(rounds.length, 24);
    assert.equal(new Set(rounds.map(item => item.id)).size, 24);
    assert.ok(rounds.every(item => item.id.startsWith('WF-' + mode[0].toUpperCase() + '-')));
  }
});

test('invalid modes return no questions and do not fall back to another bank', () => {
  assert.deepEqual(Array.from(bank.getRounds('unknown')), []);
  assert.deepEqual(Array.from(bank.selectRound('unknown')), []);
});
