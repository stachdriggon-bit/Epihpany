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
      assert.ok(puzzle.words.every(word=>word.length>=config.minWordLength),puzzle.id + ' minimum word length');
      assert.equal(new Set(puzzle.words).size,puzzle.words.length,puzzle.id);
      for (const word of puzzle.words) {
        assert.equal(bank.occurrences(puzzle.grid,word).length,1,puzzle.id + ' ' + word);
      }
    }
  }
});

test('Word Hunt direction progression is enforced by the content validator', () => {
  const easy = bank.puzzles.easy[1];
  const easyResult = bank.validatePuzzle({...easy,grid:easy.grid.map(row=>row.split('').reverse().join(''))},'easy');
  assert.equal(easyResult.valid,false,'reversing the grid must invalidate at least the forward-only Easy placements');
  for (const medium of bank.puzzles.medium) {
    assert.equal(bank.validatePuzzle(medium,'medium').valid,true,medium.id);
    const directions=medium.words.map(word=>bank.occurrences(medium.grid,word)[0]).map(({dr,dc})=>dr+','+dc);
    assert.ok(directions.filter(d=>d==='0,1').length>=2,medium.id+' across variety');
    assert.ok(directions.filter(d=>d==='1,0').length>=2,medium.id+' down variety');
    assert.ok(directions.filter(d=>d==='1,1'||d==='1,-1').length>=4,medium.id+' diagonal variety');
  }
  for (const level of ['hard','expert']) for (const puzzle of bank.puzzles[level]) {
    assert.equal(bank.validatePuzzle(puzzle,level).valid,true,puzzle.id);
    const directions=new Set(puzzle.words.map(word=>bank.occurrences(puzzle.grid,word)[0]).map(({dr,dc})=>dr+','+dc));
    assert.equal(directions.size,8,puzzle.id+' must use every direction');
  }
});

test('Word Hunt bank validation reports malformed records without throwing', () => {
  const malformed = {...bank.puzzles, easy:[null, ...bank.puzzles.easy.slice(1)]};
  assert.equal(bank.validateBank(malformed).valid,false);
  const malformedPuzzle = {...bank.puzzles.easy[0], words:[null, ...bank.puzzles.easy[0].words.slice(1)]};
  assert.equal(bank.validatePuzzle(malformedPuzzle,'easy').valid,false);
});

test('Word Hunt rejects missing, duplicated, and malformed target entries', () => {
  const original = bank.puzzles.easy[0];
  assert.equal(bank.validatePuzzle({...original,words:original.words.slice(1)},'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,words:[...original.words.slice(1),original.words[0]]},'easy').valid,true);
  assert.equal(bank.validatePuzzle({...original,words:[...original.words.slice(0,5),original.words[0]]},'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,grid:['BAD']},'easy').valid,false);
});
