const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bank = require('../odd-one-out-bank.js');
const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');

const gameIds = ['odd','translator','wordladder','maze','connections','scramble','forge','chain'];
const trainingModes = ['guided','steady','challenge'];

function createHarness() {
  const listeners = {};
  const root = {
    innerHTML: '',
    addEventListener(type, callback) { listeners[type] = callback; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  const window = {
    EPIPHANY_ODD_ONE_OUT_BANK: bank,
    EpiphanyThinkLab: {
      getCEFRLevel: () => 'A1',
      getGameDifficulty: () => ({level:'challenge',hintLevel:2,attempts:0,accuracy:null}),
      getDifficulty: () => ({level:'challenge',hintLevel:2}),
      registerGame() {},
      recordResult() {}
    }
  };
  const document = {getElementById: id => id === 'think-lab-content' ? root : null};
  vm.runInNewContext(source, {window,document,console,Math}, {filename:'think-lab.js',timeout:10000});
  function click(selector, dataset = {}) {
    const element = {dataset};
    assert.equal(typeof listeners.click, 'function', 'Think Lab click handler should be registered');
    listeners.click({target:{closest: candidate => candidate === selector ? element : null}});
  }
  return {root,click};
}

test('every Think Lab game opens the shared three-mode picker before play', () => {
  for (const gameId of gameIds) {
    const harness = createHarness();
    harness.click('[data-think-game]', {thinkGame:gameId});
    assert.match(harness.root.innerHTML, /How would you like to play\?/);
    for (const mode of trainingModes) {
      assert.match(harness.root.innerHTML, new RegExp('data-think-training-mode="' + mode + '"'));
    }
    assert.match(harness.root.innerHTML, new RegExp('data-think-training-game="' + gameId + '"'));
  }
});

test('each training mode is passed into the selected game instead of the adaptive default', () => {
  for (const gameId of gameIds) {
    for (const trainingMode of trainingModes) {
      const harness = createHarness();
      harness.click('[data-think-game]', {thinkGame:gameId});
      harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:gameId});
      if (gameId === 'translator') {
        assert.match(harness.root.innerHTML, /CHOOSE YOUR ENGLISH LEVEL/);
        harness.click('[data-translator-level]', {translatorLevel:'A1'});
      }
      assert.match(
        harness.root.innerHTML,
        new RegExp('<div class="tl-level-tag">' + trainingMode.toUpperCase() + '<\\/div>'),
        gameId + ' should launch in ' + trainingMode + ' mode'
      );
    }
  }
});

test('training modes control hint support and do not overwrite the CEFR level', () => {
  assert.match(source, /const hintLevel = selectedTrainingMode === 'guided' \? 2 : selectedTrainingMode === 'steady' \? 1 : 0/);
  assert.match(source, /level:selectedTrainingMode,hintLevel/);
  assert.match(source, /selectedMode = \['guided','steady','challenge'\]/);
  assert.match(source, /selectedTrainingMode = \['guided','steady','challenge'\]/);
  assert.match(source, /data-translator-level="adaptive"/);
});
