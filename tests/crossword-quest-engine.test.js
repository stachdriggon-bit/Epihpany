const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'crossword-quest.js'), 'utf8');

test('Crossword Quest uses its own four-level flow and never invokes the shared training-mode picker', () => {
  assert.match(source, /function renderLevels\(\)/);
  assert.match(source, /data-cq-level=/);
  assert.doesNotMatch(source, /guided|steady|challenge/i);
});

test('Crossword Quest reveals the selected clue only after the player requests it', () => {
  assert.match(source, /data-cq-clue/);
  assert.match(source, /if \(event\.target\.closest\('\[data-cq-clue\]'\)\)/);
  assert.match(source, /clueVisible = true/);
  assert.match(source, /Select a word, then choose Show Clue when you need it/);
});

test('Crossword Quest has no timer and does not reveal answers after an incorrect check', () => {
  assert.doesNotMatch(source, /setInterval|setTimeout/);
  assert.match(source, /Some letters still need another look\. Your answers are not revealed\./);
  assert.doesNotMatch(source, /Your answer was:|Correct answer:/);
});

test('Crossword Quest supports correction and clear actions without exposing the solution', () => {
  assert.match(source, /data-cq-clear/);
  assert.match(source, /values = puzzle\.layout\.map/);
  assert.match(source, /maxlength="1"/);
  assert.match(source, /data-cq-cell/);
});
