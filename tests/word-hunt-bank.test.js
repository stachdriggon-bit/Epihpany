const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','word-hunt-bank.js'),'utf8'),context,{filename:'word-hunt-bank.js',timeout:5000});
const bank = context.window.EPIPHANY_WORD_HUNT_BANK;

test('Word Hunt ships four independent levels with twelve fixed puzzles each', () => {
  assert.deepEqual(Object.keys(bank.levels), ['easy','medium','hard','expert']);
  for (const [id,level] of Object.entries(bank.levels)) {
    assert.equal(level.count,12,id);
    assert.equal(bank.puzzles[id].length,12,id);
    assert.equal(new Set(bank.puzzles[id].map(p => p.id)).size,12,id + ' ids');
  }
  assert.equal(bank.validateBank().valid,true,bank.validateBank().errors.join('\n'));
});

test('all 48 Word Hunt grids contain the exact number of unique target words', () => {
  const total = Object.values(bank.puzzles).flat();
  assert.equal(total.length,48);
  assert.equal(total.reduce((sum,p) => sum + p.words.length,0),432);
  for (const [level,config] of Object.entries(bank.levels)) {
    for (const puzzle of bank.puzzles[level]) {
      assert.equal(puzzle.grid.length,config.size,puzzle.id);
      assert.ok(puzzle.grid.every(row => row.length === config.size && /^[A-Z]+$/.test(row)),puzzle.id);
      assert.equal(puzzle.words.length,config.wordsPerPuzzle,puzzle.id);
      assert.equal(new Set(puzzle.words).size,puzzle.words.length,puzzle.id);
      for (const word of puzzle.words) {
        assert.equal(bank.occurrences(puzzle.grid,word).length,1,puzzle.id + ' ' + word);
      }
    }
  }
});

test('Word Hunt direction progression is enforced by the content validator', () => {
  const easy = bank.puzzles.easy[0];
  const easyResult = bank.validatePuzzle({...easy,grid:easy.grid.map(row=>row.split('').reverse().join(''))},'easy');
  assert.equal(easyResult.valid,false,'reversing the grid must invalidate at least the forward-only Easy placements');
  const medium = bank.puzzles.medium[0];
  assert.equal(bank.validatePuzzle(medium,'medium').valid,true);
  const hard = bank.puzzles.hard[0];
  assert.equal(bank.validatePuzzle(hard,'hard').valid,true);
  const expert = bank.puzzles.expert[0];
  assert.equal(bank.validatePuzzle(expert,'expert').valid,true);
});

test('Word Hunt rejects missing, duplicated, and malformed target entries', () => {
  const original = bank.puzzles.easy[0];
  assert.equal(bank.validatePuzzle({...original,words:original.words.slice(1)},'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,words:[...original.words.slice(1),original.words[0]]},'easy').valid,true);
  assert.equal(bank.validatePuzzle({...original,words:[...original.words.slice(0,5),original.words[0]]},'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,grid:['BAD']},'easy').valid,false);
});
