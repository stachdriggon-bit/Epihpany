const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'chain-reaction-bank.js'), 'utf8');
const context = vm.createContext({window:{}});
vm.runInContext(source, context, {filename:'chain-reaction-bank.js',timeout:5000});
const bank = context.window.EPIPHANY_CHAIN_REACTION_BANK;

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('Chain Reaction bank exposes schema v1 and validates all 72 challenges and 216 links', () => {
  assert.equal(bank.schemaVersion, 1);
  assert.equal(bank.gameId, 'chain-reaction');
  assert.deepEqual(Array.from(bank.modes), ['guided','steady','challenge']);
  const result = bank.validateBank();
  assert.equal(result.valid, true, result.errors.join('; '));
  assert.equal(result.totalChallenges, 72);
  assert.equal(result.totalLinks, 216);
  assert.deepEqual(Array.from(result.errors), []);
});

test('each training mode contains 24 distinct three-link challenges', () => {
  const ids = new Set();
  for (const mode of bank.modes) {
    const rounds = bank.getRounds(mode);
    assert.equal(rounds.length, 24);
    for (const item of rounds) {
      assert.ok(item.id.startsWith('CR-' + mode[0].toUpperCase() + '-'));
      assert.equal(ids.has(item.id), false, item.id + ' must be unique');
      ids.add(item.id);
      assert.ok(item.title.trim());
      assert.ok(item.start.trim());
      assert.equal(item.links.length, 3);
      let previous = item.start;
      for (const link of item.links) {
        assert.equal(link.from, previous);
        assert.equal(link.options.length, 3);
        assert.equal(new Set(link.options).size, 3);
        assert.equal(link.options.filter(option => option === link.to).length, 1);
        assert.ok(link.explanation.trim());
        previous = link.to;
      }
    }
  }
  assert.equal(ids.size, 72);
});

test('selectRound shuffles challenges and options without changing canonical answers or continuity', () => {
  for (const mode of bank.modes) {
    const original = bank.getRounds(mode);
    const selected = bank.selectRound(mode, seeded(mode.length * 101));
    assert.equal(selected.length, 24);
    assert.equal(new Set(selected.map(item => item.id)).size, 24);
    for (const item of selected) {
      const approved = original.find(candidate => candidate.id === item.id);
      assert.ok(approved);
      for (let i = 0; i < item.links.length; i++) {
        const link = item.links[i];
        assert.deepEqual(Array.from(link.options).sort(), Array.from(approved.links[i].options).sort());
        assert.equal(link.options[link.answer], link.to);
        assert.equal(link.from, i === 0 ? item.start : item.links[i - 1].to);
      }
    }
  }
});

test('invalid modes return no challenges and never fall back to another mode', () => {
  assert.deepEqual(Array.from(bank.getRounds('unknown')), []);
  assert.deepEqual(Array.from(bank.selectRound('unknown')), []);
});
