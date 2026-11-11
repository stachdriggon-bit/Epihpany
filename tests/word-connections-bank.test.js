const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'word-connections-bank.js'), 'utf8');
const context = vm.createContext({window:{}});
vm.runInContext(source, context, {filename:'word-connections-bank.js',timeout:5000});
const bank = context.window.EPIPHANY_WORD_CONNECTIONS_BANK;
function seeded(seed) {
  let state=seed>>>0;
  return () => { state=(state*1664525+1013904223)>>>0; return state/4294967296; };
}

test('Word Connections bank contains exactly 24 complete groups in each mode', () => {
  assert.deepEqual(Array.from(bank.modes),['guided','steady','challenge']);
  const validation=bank.validateBank();
  assert.equal(validation.valid,true);
  assert.deepEqual(Array.from(validation.errors),[]);
  for(const mode of bank.modes) {
    const rounds=bank.getRounds(mode);
    assert.equal(rounds.length,24,mode+' should contain 24 rounds');
    assert.equal(new Set(rounds.map(round=>round.id)).size,24);
    for(const round of rounds) { assert.equal(round.words.length,4); assert.ok(round.explain.trim()); }
  }
});

test('each mode selects all 24 challenges once and independently', () => {
  for(const mode of bank.modes) {
    const rounds=bank.selectRound(mode,seeded(mode.length*31));
    assert.equal(rounds.length,24);
    assert.equal(new Set(rounds.map(round=>round.id)).size,24);
    assert.ok(rounds.every(round=>round.id.startsWith(mode+'-')));
  }
});

test('every generated 16-tile board contains its target and no complete alternative bank group', () => {
  let seed=7;
  for(const mode of bank.modes) for(const round of bank.getRounds(mode)) {
    const board=bank.createBoard(round,mode,seeded(seed++));
    assert.equal(board.length,16,round.id+' should render 16 tiles');
    assert.equal(new Set(board.map(word=>word.toLowerCase())).size,16,round.id+' should not duplicate tiles');
    for(const word of round.words) assert.ok(board.includes(word),round.id+' must include every target word');
    assert.equal(Array.from(bank.findCompleteGroups(board,mode),group=>group.id).join(','),round.id,round.id+' must be the only complete bank group');
    for(const other of bank.getRounds(mode).filter(group=>group.id!==round.id)) {
      const overlap=other.words.filter(word=>board.includes(word));
      assert.ok(overlap.length<=2,round.id+' must not expose three or four words from '+other.id);
    }
  }
});

test('group validation accepts only an exact reviewed four-word group', () => {
  const guided=bank.getRounds('guided');
  assert.equal(bank.matchGroup(guided[0].words,'guided').id,guided[0].id);
  assert.equal(bank.matchGroup(guided[0].words.slice(0,3),'guided'),null);
  assert.equal(bank.matchGroup(guided[0].words.concat(guided[0].words[0]),'guided'),null);
  assert.equal(bank.matchGroup(['apple','banana','orange','chair'],'guided'),null);
});
