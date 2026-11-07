const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadBank() {
  const context = vm.createContext({ window: {} });
  const source = fs.readFileSync(path.join(__dirname, '..', 'crossword-quest-bank.js'), 'utf8');
  vm.runInContext(source, context, { filename: 'crossword-quest-bank.js', timeout: 5000 });
  return context.window.EPIPHANY_CROSSWORD_QUEST_BANK;
}

test('Crossword Quest declares four independent levels with 24 puzzles each', () => {
  const bank = loadBank();
  assert.deepEqual(Object.keys(bank.levels), ['easy', 'medium', 'hard', 'expert']);
  for (const level of Object.values(bank.levels)) assert.equal(level.count, 24);
  assert.equal(JSON.stringify(bank.validateBank().counts), JSON.stringify({ easy: 0, medium: 0, hard: 0, expert: 0 }));
  assert.equal(bank.validateBank().valid, false, 'an empty draft bank must never be treated as playable');
});

test('Crossword Quest validator accepts a complete, correctly numbered 3x3 crossing fixture', () => {
  const bank = loadBank();
  const puzzle = {
    id: 'fixture-3x3',
    size: 3,
    layout: ['...', '...', '...'],
    solution: ['CAT', 'ARE', 'TEN'],
    entries: [
      { number: 1, direction: 'across', row: 0, col: 0, answer: 'CAT', clue: 'A small domesticated feline' },
      { number: 1, direction: 'down', row: 0, col: 0, answer: 'CAT', clue: 'A pet that may purr' },
      { number: 2, direction: 'down', row: 0, col: 1, answer: 'ARE', clue: 'Second-person form of “be”' },
      { number: 3, direction: 'down', row: 0, col: 2, answer: 'TEN', clue: 'Twice five' },
      { number: 4, direction: 'across', row: 1, col: 0, answer: 'ARE', clue: 'Plural present of “be”' },
      { number: 5, direction: 'across', row: 2, col: 0, answer: 'TEN', clue: 'The number after nine' }
    ]
  };
  const result = bank.validatePuzzle(puzzle, 3);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(result.errors.length, 0);
});

test('Crossword Quest validator rejects inconsistent crossings and missing clues', () => {
  const bank = loadBank();
  const puzzle = {
    id: 'fixture-invalid',
    size: 3,
    layout: ['...', '...', '...'],
    solution: ['CAT', 'ARE', 'TEN'],
    entries: [
      { number: 1, direction: 'across', row: 0, col: 0, answer: 'CAR', clue: 'A vehicle' },
      { number: 1, direction: 'down', row: 0, col: 0, answer: 'CAT', clue: 'A pet' },
      { number: 2, direction: 'down', row: 0, col: 1, answer: 'ARE', clue: '' },
      { number: 3, direction: 'down', row: 0, col: 2, answer: 'TEN', clue: 'Twice five' },
      { number: 4, direction: 'across', row: 1, col: 0, answer: 'ARE', clue: 'Plural present of be' },
      { number: 5, direction: 'across', row: 2, col: 0, answer: 'TEN', clue: 'Number after nine' }
    ]
  };
  const result = bank.validatePuzzle(puzzle, 3);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => /does not match the solution/.test(error)));
  assert.ok(result.errors.some(error => /has no clue/.test(error)));
});

test('Crossword Quest Easy lexicon covers all eight approved themes with distinct common entries', () => {
  const bank = loadBank();
  assert.equal(bank.easyLexicon.length, 8);
  const allWords = bank.easyLexicon.flatMap(group => group.words);
  assert.equal(allWords.length, 144);
  assert.equal(new Set(allWords.map(item => item.answer)).size, 80, 'candidate answers must be unique');
  for (const group of bank.easyLexicon) {
    assert.equal(group.words.length, 18, group.theme);
    for (const item of group.words) {
      assert.match(item.answer, /^[A-Z]{3,7}$/);
      assert.ok(item.clue.length >= 12, item.answer + ' needs a useful clue');
    }
  }
});

test('Crossword Quest short-word expansion adds 96 distinct 3–6 letter candidates across the eight approved themes', () => {
  const bank = loadBank();
  assert.equal(bank.easyShortLexicon.length, 8);
  const expanded = bank.easyShortLexicon.flatMap(group => group.words);
  assert.equal(expanded.length, 96);
  assert.equal(new Set(expanded.map(item => item.answer)).size, 96, 'short candidate answers must be unique');
  for (const group of bank.easyShortLexicon) {
    assert.equal(group.words.length, 12, group.theme);
    for (const item of group.words) {
      assert.match(item.answer, /^[A-Z]{3,6}$/);
      assert.ok(item.clue.length >= 12, item.answer + ' needs a useful clue');
    }
  }
});


test('Crossword Quest allows common two-letter answers in Easy while retaining the three-letter minimum elsewhere', () => {
  const bank = loadBank();
  const puzzle = {
    id: 'fixture-two-letter-easy', size: 3,
    layout: ['..#', '...', '#..'],
    solution: ['IN#', 'NOD', '#TO'],
    entries: [
      { number: 1, direction: 'across', row: 0, col: 0, answer: 'IN', clue: 'Contained by or within' },
      { number: 2, direction: 'down', row: 0, col: 0, answer: 'IN', clue: 'The opposite of out' },
      { number: 3, direction: 'down', row: 0, col: 1, answer: 'NOT', clue: 'Used to make a statement negative' },
      { number: 4, direction: 'across', row: 1, col: 0, answer: 'NOD', clue: 'A small movement of the head' },
      { number: 5, direction: 'down', row: 1, col: 2, answer: 'DO', clue: 'To perform an action' },
      { number: 5, direction: 'across', row: 2, col: 1, answer: 'TO', clue: 'A word showing direction or destination' }
    ]
  };
  assert.equal(bank.validatePuzzle(puzzle, 3, 2).valid, true);
  const strict = bank.validatePuzzle(puzzle, 3, 3);
  assert.equal(strict.valid, false);
  assert.ok(strict.errors.some(error => /at least 3 letters/.test(error)));
});

test('Crossword Quest validator rejects disconnected grids and repeated clues', () => {
  const bank = loadBank();
  const disconnected = {
    id: 'fixture-disconnected', size: 7,
    layout: ['...####','...####','...####','####...','####...','####...','####...'],
    solution: ['CAT####','ARE####','TEN####','####DOG','####OWL','####PIG','#######'],
    entries: []
  };
  const result = bank.validatePuzzle(disconnected, 7);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => /connected crossword grid/.test(error)));

  const duplicateClues = {
    id: 'fixture-duplicate-clues', size: 3,
    layout: ['...', '...', '...'],
    solution: ['CAT', 'ARE', 'TEN'],
    entries: [
      { number: 1, direction: 'across', row: 0, col: 0, answer: 'CAT', clue: 'A pet that may purr' },
      { number: 1, direction: 'down', row: 0, col: 0, answer: 'CAT', clue: 'A pet that may purr' },
      { number: 2, direction: 'down', row: 0, col: 1, answer: 'ARE', clue: 'Second-person form of be' },
      { number: 3, direction: 'down', row: 0, col: 2, answer: 'TEN', clue: 'Twice five' },
      { number: 4, direction: 'across', row: 1, col: 0, answer: 'ARE', clue: 'Plural present of be' },
      { number: 5, direction: 'across', row: 2, col: 0, answer: 'TEN', clue: 'Number after nine' }
    ]
  };
  const clueResult = bank.validatePuzzle(duplicateClues, 3);
  assert.ok(clueResult.errors.some(error => /Clues must be distinct/.test(error)));
});

