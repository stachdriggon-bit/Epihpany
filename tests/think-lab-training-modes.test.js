const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bank = require('../odd-one-out-bank.js');
const soundMazeTools = require('../sound-maze-bank.js');
const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');
const connectionBankSource = fs.readFileSync(path.join(__dirname, '..', 'word-connections-bank.js'), 'utf8');
const sentenceScrambleBankSource = fs.readFileSync(path.join(__dirname, '..', 'sentence-scramble-bank.js'), 'utf8');
const wordForgeBankSource = fs.readFileSync(path.join(__dirname, '..', 'word-forge-bank.js'), 'utf8');

const gameIds = ['odd','translator','wordladder','maze','connections','scramble','forge','chain'];
const trainingModes = ['guided','steady','challenge'];

function makeSoundMazeFixture() {
  const result = {levels:{}};
  for (const level of soundMazeTools.LEVELS) {
    result.levels[level] = {};
    for (const mode of soundMazeTools.MODES) {
      result.levels[level][mode] = [];
      for (let axis = 1; axis <= 4; axis++) {
        for (let number = 1; number <= 3; number++) {
          const target = level.toLowerCase() + mode[0] + axis + number;
          result.levels[level][mode].push({
            id: level + '-' + mode + '-' + axis + '-' + number,
            axis:'axis-' + axis,
            target,
            options:[target,target+'x',target+'y',target+'z'],
            answer:target,
            explain:'The target spelling is preserved in the answer options.'
          });
        }
      }
    }
  }
  return result;
}

function createHarness(options = {}) {
  const connectionContext = vm.createContext({window:{}});
  vm.runInContext(connectionBankSource, connectionContext, {filename:'word-connections-bank.js',timeout:5000});
  const sentenceScrambleContext = vm.createContext({window:{}});
  vm.runInContext(sentenceScrambleBankSource, sentenceScrambleContext, {filename:'sentence-scramble-bank.js',timeout:5000});
  const wordForgeContext = vm.createContext({window:{}});
  vm.runInContext(wordForgeBankSource, wordForgeContext, {filename:'word-forge-bank.js',timeout:5000});
  const listeners = {};
  const root = {
    innerHTML: '',
    addEventListener(type, callback) { listeners[type] = callback; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  let savedMazeCEFR = options.savedMazeCEFR || null;
  const window = {
    EPIPHANY_ODD_ONE_OUT_BANK: bank,
    EPIPHANY_SOUND_MAZE_TOOLS: soundMazeTools,
    EPIPHANY_WORD_CONNECTIONS_BANK: connectionContext.window.EPIPHANY_WORD_CONNECTIONS_BANK,
    EPIPHANY_SENTENCE_SCRAMBLE_BANK: sentenceScrambleContext.window.EPIPHANY_SENTENCE_SCRAMBLE_BANK,
    EPIPHANY_WORD_FORGE_BANK: wordForgeContext.window.EPIPHANY_WORD_FORGE_BANK,
    ...(options.soundMazeBank ? {EPIPHANY_SOUND_MAZE_BANK:options.soundMazeBank} : {}),
    speechSynthesis: {cancel(){},speak(){}},
    EpiphanyThinkLab: {
      getCEFRLevel: () => 'A1',
      getSoundMazeCEFR: () => savedMazeCEFR,
      setSoundMazeCEFR: level => { savedMazeCEFR = level; return true; },
      getGameDifficulty: () => ({level:'challenge',hintLevel:2,attempts:0,accuracy:null}),
      getDifficulty: () => ({level:'challenge',hintLevel:2}),
      registerGame() {},
      recordResult() {}
    }
  };
  const document = {getElementById: id => id === 'think-lab-content' ? root : null};
  vm.runInNewContext(source, {window,document,console,Math,SpeechSynthesisUtterance:function SpeechSynthesisUtterance(text){this.text=text;}}, {filename:'think-lab.js',timeout:10000});
  function click(selector, dataset = {}) {
    const element = {dataset};
    assert.equal(typeof listeners.click, 'function', 'Think Lab click handler should be registered');
    listeners.click({target:{closest: candidate => candidate === selector ? element : null}});
  }
  return {root,click,getSavedMazeCEFR:()=>savedMazeCEFR};
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
      const harness = createHarness(gameId === 'maze' ? {soundMazeBank:makeSoundMazeFixture()} : {});
      harness.click('[data-think-game]', {thinkGame:gameId});
      harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:gameId});
      if (gameId === 'translator') {
        assert.match(harness.root.innerHTML, /CHOOSE YOUR ENGLISH LEVEL/);
        harness.click('[data-translator-level]', {translatorLevel:'A1'});
      } else if (gameId === 'maze') {
        assert.match(harness.root.innerHTML, /CHOOSE YOUR ENGLISH LEVEL/);
        harness.click('[data-sound-maze-level]', {soundMazeLevel:'A1'});
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


test('The Sound Maze asks for CEFR separately and persists the selected level', () => {
  const harness = createHarness({soundMazeBank:makeSoundMazeFixture()});
  harness.click('[data-think-game]', {thinkGame:'maze'});
  harness.click('[data-think-training-mode]', {thinkTrainingMode:'challenge',thinkTrainingGame:'maze'});
  assert.match(harness.root.innerHTML, /CHOOSE YOUR ENGLISH LEVEL/);
  harness.click('[data-sound-maze-level]', {soundMazeLevel:'C2'});
  assert.equal(harness.getSavedMazeCEFR(), 'C2');
  assert.match(harness.root.innerHTML, /LISTENING MAZE · C2/);
  assert.match(harness.root.innerHTML, /CHALLENGE/);
  assert.match(harness.root.innerHTML, /ROUND 1 OF 12/);
});

test('The Sound Maze never presents its temporary sample questions as the approved bank', () => {
  const harness = createHarness();
  harness.click('[data-think-game]', {thinkGame:'maze'});
  harness.click('[data-think-training-mode]', {thinkTrainingMode:'steady',thinkTrainingGame:'maze'});
  harness.click('[data-sound-maze-level]', {soundMazeLevel:'B2'});
  assert.equal(harness.getSavedMazeCEFR(), 'B2');
  assert.match(harness.root.innerHTML, /QUESTION BANK NOT READY/);
  assert.match(harness.root.innerHTML, /temporary sample questions are intentionally hidden/);
  assert.doesNotMatch(harness.root.innerHTML, /Target word:|bridge|market|window/);
});

test('Sound Maze CEFR is a saved and cross-device learner preference', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const account = fs.readFileSync(path.join(__dirname, '..', 'account.js'), 'utf8');
  assert.match(app, /soundMazeCEFR:null/);
  assert.match(app, /getSoundMazeCEFR\(\)/);
  assert.match(app, /setSoundMazeCEFR\(level\)/);
  assert.match(app, /state\.soundMazeCEFR = level/);
  assert.match(account, /PREFERENCE_KEYS = \[[^\]]*'soundMazeCEFR'/);
});


test('active game screen offers a direct Think Lab home route without removing difficulty back', () => {
  for (const gameId of gameIds) {
    const harness = createHarness(gameId === 'maze' ? {soundMazeBank:makeSoundMazeFixture()} : {});
    harness.click('[data-think-game]', {thinkGame:gameId});
    harness.click('[data-think-training-mode]', {thinkTrainingMode:'steady',thinkTrainingGame:gameId});
    if (gameId === 'translator') {
      harness.click('[data-translator-level]', {translatorLevel:'A1'});
    } else if (gameId === 'maze') {
      harness.click('[data-sound-maze-level]', {soundMazeLevel:'A1'});
    }
    assert.match(harness.root.innerHTML, /data-think-back/);
    assert.match(harness.root.innerHTML, /data-think-home/);
    harness.click('[data-think-home]');
    assert.match(harness.root.innerHTML, /Don’t just play/);
    assert.match(harness.root.innerHTML, /data-think-game=/);
  }
});


test('Word Connections loads 24 distinct challenges for each independently selected mode', () => {
  for (const trainingMode of trainingModes) {
    const harness = createHarness();
    harness.click('[data-think-game]', {thinkGame:'connections'});
    harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:'connections'});
    assert.ok(harness.root.innerHTML.includes('class="tl-level-tag">' + trainingMode.toUpperCase() + '</div>'));
    assert.match(harness.root.innerHTML, /ROUND 1 OF 24/);
    assert.equal((harness.root.innerHTML.match(/data-connection-tile=/g) || []).length, 16);
  }
});

test('Word Connections records incorrect complete-group attempts instead of tracking only wins', () => {
  assert.match(source, /recordResult\('vocabulary','connections',false,false\)/);
  assert.match(source, /bank\.matchGroup\(chosen,selectedTrainingMode\)/);
});

test('Word Forge loads exactly 24 approved challenges for each selected training mode', () => {
  for (const trainingMode of trainingModes) {
    const harness = createHarness();
    harness.click('[data-think-game]', {thinkGame:'forge'});
    harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:'forge'});
    assert.match(harness.root.innerHTML, /ROUND 1 OF 24/);
    assert.match(harness.root.innerHTML, /WORD CLUE/);
    assert.match(harness.root.innerHTML, /data-forge-tile=/);
    assert.match(harness.root.innerHTML, /data-forge-check/);
    assert.match(harness.root.innerHTML, new RegExp('<div class="tl-level-tag">' + trainingMode.toUpperCase() + '<\\\\/div>'));
  }
});

test('Word Forge uses the approved bank skill and records incorrect complete attempts', () => {
  assert.match(source, /bank\.selectRound\(trainingMode\)/);
  assert.match(source, /recordResult\('spelling','word-forge',false,false\)/);
  assert.match(source, /<strong>Complete the word first\.<\\/strong>/);
  assert.match(source, /<strong>Skill:<\\/strong>/);
  assert.doesNotMatch(source, /rounds\.forge\s*=/);
});
