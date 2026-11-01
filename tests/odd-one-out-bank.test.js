const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../odd-one-out-bank.js');

test('Odd One Out has independent banks for all six CEFR levels', () => {
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    assert.ok(Array.isArray(bank.banks[level]));
    assert.equal(bank.banks[level].length, 8);
    assert.ok(bank.banks[level].every(item => item.id.startsWith(level + '-')));
  }
});

test('every item has four options, one indexed answer and useful explanation', () => {
  const result = bank.validateBank();
  assert.deepEqual(result, {valid:true,errors:[]});
  for (const items of Object.values(bank.banks)) {
    for (const item of items) {
      assert.equal(item.words.length,4);
      assert.equal(new Set(item.words.map(w=>w.toLowerCase())).size,4);
      assert.ok(item.explain.includes(item.words[item.answer]) || item.explain.length >= 35);
    }
  }
});

test('the ten planned relationship types are represented across the six banks', () => {
  const used = new Set(Object.values(bank.banks).flat().map(item=>item.relationship));
  assert.deepEqual([...bank.relationships].filter(type=>!used.has(type)), []);
});

test('round targets are adaptive and never pad a short bank with repeats', () => {
  const guided = bank.selectRound('A1','guided',[],()=>0.25);
  const steady = bank.selectRound('A1','steady',[],()=>0.25);
  const challenge = bank.selectRound('A1','challenge',[],()=>0.25);
  assert.equal(guided.target,8);
  assert.equal(steady.target,10);
  assert.equal(challenge.target,12);
  assert.equal(guided.questions.length,8);
  assert.equal(steady.questions.length,8);
  assert.equal(challenge.questions.length,8);
  assert.equal(guided.shortened,false);
  assert.equal(steady.shortened,true);
  assert.equal(challenge.shortened,true);
  for (const round of [guided,steady,challenge]) {
    assert.equal(new Set(round.questions.map(q=>q.id)).size,round.questions.length);
  }
});

test('recently seen questions are excluded when enough unseen material remains', () => {
  const recent = bank.banks.B1.slice(0,3).map(item=>item.id);
  const round = bank.selectRound('B1','guided',recent,()=>0.5);
  assert.equal(round.questions.length,5);
  assert.ok(round.questions.every(item=>!recent.includes(item.id)));
  assert.equal(round.shortened,true);
});

test('selection falls back safely for invalid level or training mode', () => {
  const round = bank.selectRound('unknown','unexpected',[],()=>0.2);
  assert.equal(round.level,'A1');
  assert.equal(round.trainingMode,'steady');
});
