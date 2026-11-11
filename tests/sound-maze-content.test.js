const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const soundMaze = require('../sound-maze-bank.js');

function loadReviewedBank() {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(__dirname, '..', 'sound-maze-content.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'sound-maze-content.js', timeout: 5000 });
  return context.window.EPIPHANY_SOUND_MAZE_BANK;
}

test('the reviewed Sound Maze release contains a valid 216-question bank', () => {
  const bank = loadReviewedBank();
  assert.equal(bank.status, 'reviewed_for_integration');
  assert.equal(bank.pronunciation_reference, 'General American');
  const result = soundMaze.validateBank(bank);
  assert.equal(result.valid, true, result.errors.join('\\n'));
  assert.equal(result.total, 216);
});

test('the reviewed Sound Maze release has no repeated IDs or target words', () => {
  const bank = loadReviewedBank();
  const ids = [];
  const targets = [];
  for (const level of soundMaze.LEVELS) {
    for (const mode of soundMaze.MODES) {
      for (const question of bank.levels[level][mode]) {
        ids.push(question.id);
        targets.push(question.target);
        assert.equal(question.answer, question.target, question.id + ' answer must match its spoken target');
        assert.equal(question.options.filter(option => option === question.target).length, 1, question.id + ' must contain one correct spelling');
        assert.ok(question.explain.trim(), question.id + ' needs educational feedback');
      }
    }
  }
  assert.equal(ids.length, 216);
  assert.equal(new Set(ids).size, 216, 'question IDs must be unique');
  assert.equal(targets.length, 216);
  assert.equal(new Set(targets).size, 216, 'target words must not repeat across the six CEFR levels and three modes');
});

test('every Sound Maze question has four distinct lowercase answer choices', () => {
  const bank = loadReviewedBank();
  for (const level of soundMaze.LEVELS) {
    for (const mode of soundMaze.MODES) {
      for (const question of bank.levels[level][mode]) {
        assert.equal(question.options.length, 4, question.id);
        assert.equal(new Set(question.options.map(option => option.toLocaleLowerCase('en'))).size, 4, question.id);
        assert.ok(question.options.every(option => option === option.toLocaleLowerCase('en')), question.id + ' options should be lowercase');
      }
    }
  }
});
