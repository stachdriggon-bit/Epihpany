const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadWordHunt() {
  const listeners = {};
  const root = {
    innerHTML: '',
    addEventListener(type, callback) { listeners[type] = callback; },
    contains() { return true; },
    dispatchEvent() {}
  };
  const window = { EPIPHANY_WORD_HUNT_BANK: null, EpiphanyThinkLab: { recordResult() {} } };
  const document = { getElementById(id) { return id === 'think-lab-content' ? root : null; } };
  const context = vm.createContext({ window, document, CustomEvent: function CustomEvent(type) { this.type = type; } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'word-hunt-bank.js'), 'utf8'), context, { filename: 'word-hunt-bank.js', timeout: 5000 });
  window.EPIPHANY_WORD_HUNT_BANK = context.window.EPIPHANY_WORD_HUNT_BANK;
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'word-hunt.js'), 'utf8'), context, { filename: 'word-hunt.js', timeout: 5000 });
  function click(attributes, dataset = {}) {
    const target = {
      dataset,
      hasAttribute(name) { return Object.prototype.hasOwnProperty.call(attributes, name); },
      closest() { return this; }
    };
    listeners.click({ target });
  }
  return { root, window: context.window, click };
}

test('Word Hunt keeps the first letter selected after a failed endpoint so the player can retry', () => {
  const { root, window, click } = loadWordHunt();
  const puzzle = window.EPIPHANY_WORD_HUNT_BANK.puzzles.easy[0];
  const match = window.EPIPHANY_WORD_HUNT_BANK.occurrences(puzzle.grid, puzzle.words[0])[0];
  const end = { row: match.row + match.dr * (puzzle.words[0].length - 1), col: match.col + match.dc * (puzzle.words[0].length - 1) };
  const wrongEnd = { row: match.row + match.dr, col: match.col + match.dc };
  const nonLinearEnd = puzzle.grid.flatMap((row, r) => row.map((_, c) => ({row:r,col:c})))
    .find(cell => Math.abs(cell.row - match.row) > 0 &&
      Math.abs(cell.col - match.col) > 0 &&
      Math.abs(cell.row - match.row) !== Math.abs(cell.col - match.col));

  window.EPIPHANY_WORD_HUNT.open();
  click({ 'data-wh-level': true }, { whLevel: 'easy' });
  click({ 'data-wh-cell': true }, { whCell: match.row + '-' + match.col });
  assert.match(root.innerHTML, /class="wh-cell is-selected"/, 'the first tap should remain visibly selected');

  assert.ok(nonLinearEnd, 'the puzzle should contain a non-linear endpoint for this regression case');
  click({ 'data-wh-cell': true }, { whCell: nonLinearEnd.row + '-' + nonLinearEnd.col });
  assert.match(root.innerHTML, /class="wh-cell is-selected"/, 'a non-linear tap must not replace the original starting cell');
  assert.match(root.innerHTML, /starting letter is still selected/, 'the player should be told the original start remains selected');

  click({ 'data-wh-cell': true }, { whCell: wrongEnd.row + '-' + wrongEnd.col });
  assert.match(root.innerHTML, /class="wh-cell is-selected"/, 'a failed word attempt must not discard the starting cell');
  assert.match(root.innerHTML, /starting letter is still selected/, 'the feedback should explain that the player can retry');

  click({ 'data-wh-cell': true }, { whCell: end.row + '-' + end.col });
  assert.match(root.innerHTML, /1 <span>\/ 6 found<\/span>/, 'the original start cell should still complete the intended word');
  assert.doesNotMatch(root.innerHTML, /class="wh-cell is-selected"/, 'a successful word should clear the selection');
});
