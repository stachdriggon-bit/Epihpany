const test = require('node:test');
const assert = require('node:assert/strict');
const soundMaze = require('../sound-maze-bank.js');

const levels = soundMaze.LEVELS;
const modes = soundMaze.MODES;

function makeFixture() {
  const bank = { levels: {} };
  for (const level of levels) {
    bank.levels[level] = {};
    for (const mode of modes) {
      bank.levels[level][mode] = [];
      for (let axis = 1; axis <= 4; axis++) {
        for (let item = 1; item <= 3; item++) {
          const target = level.toLowerCase() + mode[0] + axis + item;
          bank.levels[level][mode].push({
            id: level + '-' + mode.toUpperCase() + '-' + axis + '-' + item,
            axis: 'axis-' + axis,
            target,
            options: [target, target + 'x', target + 'y', target + 'z'],
            answer: target,
            explain: 'This test fixture explanation identifies the target spelling.'
          });
        }
      }
    }
  }
  return bank;
}

test('the Sound Maze bank contract covers 216 questions across six CEFR levels', () => {
  const bank = makeFixture();
  const result = soundMaze.validateBank(bank);
  assert.deepEqual(result, { valid: true, errors: [], total: 216 });
  assert.deepEqual(levels, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  assert.deepEqual(modes, ['guided', 'steady', 'challenge']);
});

test('each CEFR level and training mode contains four axes with three questions each', () => {
  const bank = makeFixture();
  for (const level of levels) {
    for (const mode of modes) {
      const items = bank.levels[level][mode];
      assert.equal(items.length, 12);
      const counts = items.reduce((map, item) => map.set(item.axis, (map.get(item.axis) || 0) + 1), new Map());
      assert.equal(counts.size, 4);
      assert.deepEqual([...counts.values()], [3, 3, 3, 3]);
    }
  }
});

test('validation rejects missing CEFR levels, modes and incorrect question counts', () => {
  const bank = makeFixture();
  delete bank.levels.C1;
  bank.levels.A1.guided.pop();
  delete bank.levels.B2.challenge;
  const result = soundMaze.validateBank(bank);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('C1: missing CEFR level')));
  assert.ok(result.errors.some(error => error.includes('A1/guided: expected 12 questions')));
  assert.ok(result.errors.some(error => error.includes('B2/challenge: questions must be an array')));
});

test('validation enforces four distinct options and exactly one target spelling', () => {
  const bank = makeFixture();
  const item = bank.levels.A1.guided[0];
  item.options = [item.target, item.target, 'other-a', 'other-b'];
  const result = soundMaze.validateBank(bank);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('four distinct spellings')));
});

test('validation rejects a missing or mismatched answer and empty explanation', () => {
  const bank = makeFixture();
  const item = bank.levels.A2.steady[0];
  item.answer = 'not-the-target';
  item.explain = '  ';
  const result = soundMaze.validateBank(bank);
  assert.ok(result.errors.some(error => error.includes('answer must equal the target spelling')));
  assert.ok(result.errors.some(error => error.includes('missing educational explanation')));
});

test('validation enforces the four-axis, three-question balance in every mode', () => {
  const bank = makeFixture();
  bank.levels.C2.challenge[0].axis = 'axis-2';
  const result = soundMaze.validateBank(bank);
  assert.ok(result.errors.some(error => error.includes('expected 3 questions, found 4')));
  assert.ok(result.errors.some(error => error.includes('expected 3 questions, found 2')));
});

test('round selection returns all 12 questions without repetition and keeps the CEFR/mode independent', () => {
  const bank = makeFixture();
  let seed = 0;
  const round = soundMaze.selectRound(bank, 'B2', 'challenge', () => ((seed++ * 37) % 100) / 100);
  assert.equal(round.level, 'B2');
  assert.equal(round.trainingMode, 'challenge');
  assert.equal(round.target, 12);
  assert.equal(round.questions.length, 12);
  assert.equal(new Set(round.questions.map(item => item.id)).size, 12);
  assert.ok(round.questions.every(item => item.cefrLevel === 'B2' && item.trainingMode === 'challenge'));
});

test('shuffled options preserve one correct answer and expose its new index', () => {
  const bank = makeFixture();
  let seed = 0;
  const round = soundMaze.selectRound(bank, 'C2', 'guided', () => ((seed++ * 29) % 100) / 100);
  for (const item of round.questions) {
    assert.equal(item.options.length, 4);
    assert.equal(item.options.filter(option => option === item.target).length, 1);
    assert.equal(item.options[item.answerIndex], item.target);
    assert.ok(item.answerIndex >= 0 && item.answerIndex < 4);
  }
  assert.ok(new Set(round.questions.map(item => item.answerIndex)).size > 1, 'answer positions should vary across the round');
});

test('round selection refuses incomplete banks and invalid selectors', () => {
  const bank = makeFixture();
  bank.levels.A1.guided.pop();
  assert.throws(() => soundMaze.selectRound(bank, 'A1', 'guided'), /invalid bank/i);
  const complete = makeFixture();
  assert.throws(() => soundMaze.selectRound(complete, 'D1', 'guided'), /Unknown Sound Maze CEFR level/);
  assert.throws(() => soundMaze.selectRound(complete, 'A1', 'adaptive'), /Unknown Sound Maze training mode/);
});
