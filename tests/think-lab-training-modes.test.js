const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const soundMazeTools = require('../sound-maze-bank.js');
const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');
const progressionSource = fs.readFileSync(path.join(__dirname, '..', 'think-lab-progression.js'), 'utf8');
const connectionBankSource = fs.readFileSync(path.join(__dirname, '..', 'word-connections-bank.js'), 'utf8');
const sentenceScrambleBankSource = fs.readFileSync(path.join(__dirname, '..', 'sentence-scramble-bank.js'), 'utf8');
const wordForgeBankSource = fs.readFileSync(path.join(__dirname, '..', 'word-forge-bank.js'), 'utf8');
const chainReactionBankSource = fs.readFileSync(path.join(__dirname, '..', 'chain-reaction-bank.js'), 'utf8');

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
  const chainReactionContext = vm.createContext({window:{}});
  vm.runInContext(chainReactionBankSource, chainReactionContext, {filename:'chain-reaction-bank.js',timeout:5000});
  const listeners = {};
  const feedback = {hidden:true,className:'',innerHTML:'',textContent:''};
  const recordedResults = [];
  const savedSnapshots = options.savedSnapshots || {};
  const root = {
    innerHTML: '',
    addEventListener(type, callback) { listeners[type] = callback; },
    querySelector(selector) { return selector === '#tl-feedback' ? feedback : null; },
    querySelectorAll() { return []; }
  };
  let savedMazeCEFR = options.savedMazeCEFR || null;
  let crosswordOpened = 0;
  let wordHuntOpened = 0;
  let codebreakerOpened = 0;
  let letterGridOpened = 0;
  const window = {
    EpiphanyAuth: {isDeveloper: () => true},
    EPIPHANY_SOUND_MAZE_TOOLS: soundMazeTools,
    EPIPHANY_WORD_CONNECTIONS_BANK: connectionContext.window.EPIPHANY_WORD_CONNECTIONS_BANK,
    EPIPHANY_SENTENCE_SCRAMBLE_BANK: sentenceScrambleContext.window.EPIPHANY_SENTENCE_SCRAMBLE_BANK,
    EPIPHANY_WORD_FORGE_BANK: wordForgeContext.window.EPIPHANY_WORD_FORGE_BANK,
    EPIPHANY_CHAIN_REACTION_BANK: chainReactionContext.window.EPIPHANY_CHAIN_REACTION_BANK,
    EPIPHANY_CROSSWORD_QUEST: { open() { crosswordOpened++; root.innerHTML = 'crossword-level-picker'; } },
    EPIPHANY_WORD_HUNT: { open() { wordHuntOpened++; root.innerHTML = 'word-hunt-level-picker'; } },
    EPIPHANY_CODEBREAKER: { open() { codebreakerOpened++; root.innerHTML = 'codebreaker-level-picker'; } },
    EPIPHANY_LETTER_GRID: { open() { letterGridOpened++; root.innerHTML = 'letter-grid-level-picker'; } },
    ...(options.soundMazeBank ? {EPIPHANY_SOUND_MAZE_BANK:options.soundMazeBank} : {}),
    speechSynthesis: {cancel(){},speak(){}},
    EpiphanyThinkLab: {
      getCEFRLevel: () => 'A1',
      getSoundMazeCEFR: () => savedMazeCEFR,
      setSoundMazeCEFR: level => { savedMazeCEFR = level; return true; },
      getGameDifficulty: () => ({level:'challenge',hintLevel:2,attempts:0,accuracy:null}),
      getDifficulty: () => ({level:'challenge',hintLevel:2}),
      registerGame() {},
      recordResult(...args) { recordedResults.push(args); },
      recordGameStart() {},
      recordGameCompletion() {},
      saveGameSnapshot(gameId,snapshot) { savedSnapshots[gameId]={...snapshot,gameId,schemaVersion:1}; return {saved:true}; },
      getGameSnapshot(gameId,expected={}) { const value=savedSnapshots[gameId]; if(!value)return null; if(expected.bankVersion&&value.bankVersion!==expected.bankVersion)return null; return value; },
      clearGameSnapshot(gameId) { delete savedSnapshots[gameId]; return true; },
      getGameHistory() { return {games:{},recentGames:Object.keys(savedSnapshots)}; }
    }
  };
  const document = {getElementById: id => id === 'think-lab-content' ? root : null};
  vm.runInNewContext(progressionSource, {window,module:undefined}, {filename:'think-lab-progression.js',timeout:5000});
  vm.runInNewContext(source, {window,document,console,Math,SpeechSynthesisUtterance:function SpeechSynthesisUtterance(text){this.text=text;}}, {filename:'think-lab.js',timeout:10000});
  function click(selector, dataset = {}) {
    const element = {dataset};
    assert.equal(typeof listeners.click, 'function', 'Think Lab click handler should be registered');
    listeners.click({target:{closest: candidate => candidate === selector ? element : null}});
  }
  return {root,click,getSavedMazeCEFR:()=>savedMazeCEFR,chainBank:window.EPIPHANY_CHAIN_REACTION_BANK,feedback,recordedResults,getCrosswordOpened:()=>crosswordOpened,getWordHuntOpened:()=>wordHuntOpened,getCodebreakerOpened:()=>codebreakerOpened,getLetterGridOpened:()=>letterGridOpened,savedSnapshots};
}

test('existing mode-based Think Lab games open the shared three-mode picker before play', () => {
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


test('paused Crossword Quest is not exposed as a playable Think Lab entry', () => {
  const harness = createHarness();
  harness.click('[data-think-game]', {thinkGame:'crossword'});
  assert.equal(harness.getCrosswordOpened(), 0);
  assert.match(harness.root.innerHTML, /This game is paused/);
  assert.doesNotMatch(harness.root.innerHTML, /How would you like to play/);
  assert.doesNotMatch(source, /id:'crossword',num:/);
});

test('Word Hunt has a dedicated icon in the shared Think Lab outline system', () => {
  const icons = fs.readFileSync(path.join(__dirname, '..', 'icon-system.js'), 'utf8');
  assert.match(icons, /'word-hunt':/);
  assert.match(icons, /wordhunt:'word-hunt'/);
});

test('Word Hunt opens its own level picker instead of the shared training-mode picker', () => {
  const harness = createHarness();
  harness.click('[data-think-game]', {thinkGame:'wordhunt'});
  assert.equal(harness.getWordHuntOpened(), 1);
  assert.equal(harness.root.innerHTML, 'word-hunt-level-picker');
  assert.doesNotMatch(harness.root.innerHTML, /How would you like to play/);
});

test('each training mode is passed into the selected game instead of the adaptive default', () => {
  for (const gameId of gameIds) {
    if (gameId === 'odd') continue; // Server-backed guest sessions are covered by the validator contract tests.
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
    assert.match(harness.root.innerHTML, new RegExp('<div class="tl-level-tag">' + trainingMode.toUpperCase() + '</div>'));
  }
});

test('Word Forge uses the approved bank skill and records incorrect complete attempts', () => {
  assert.match(source, /bank\.selectRound\(trainingMode\)/);
  assert.match(source, /recordResult\('spelling','word-forge',false,false\)/);
  assert.match(source, /Complete the word first/);
  assert.match(source, /Skill:/);
  assert.doesNotMatch(source, /rounds\.forge\s*=/);
});


test('Chain Reaction loads 24 distinct approved challenges for each training mode', () => {
  for (const trainingMode of trainingModes) {
    const harness = createHarness();
    harness.click('[data-think-game]', {thinkGame:'chain'});
    harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:'chain'});
    assert.match(harness.root.innerHTML, /ROUND 1 OF 24/);
    assert.match(harness.root.innerHTML, /LINK 1 OF 3/);
    assert.match(harness.root.innerHTML, new RegExp('<div class="tl-level-tag">' + trainingMode.toUpperCase() + '<\\/div>'));
    assert.equal((harness.root.innerHTML.match(/data-chain-answer=/g) || []).length, 3);
    const title = harness.root.innerHTML.match(/<h2>([^<]+)<\/h2>/)?.[1];
    assert.ok(harness.chainBank.getRounds(trainingMode).some(item => item.title === title), 'the displayed challenge must belong to the selected mode bank');
  }
});

test('Chain Reaction uses explicit multi-word starts and reveals every link explanation', () => {
  const harness = createHarness();
  const challenge = harness.chainBank.getRounds('challenge').find(item => item.id === 'CR-C-007');
  assert.equal(challenge.start, 'REFRACTING TELESCOPE');
  assert.equal(challenge.links[0].from, challenge.start);
  harness.click('[data-think-game]', {thinkGame:'chain'});
  harness.click('[data-think-training-mode]', {thinkTrainingMode:'challenge',thinkTrainingGame:'chain'});
  const title = harness.root.innerHTML.match(/<h2>([^<]+)<\/h2>/);
  const item = harness.chainBank.getRounds('challenge').find(entry => entry.title === (title && title[1]));
  assert.ok(item, 'the rendered challenge title should map to an approved bank entry');
  for (let step = 0; step < 3; step++) {
    const current = item.links[step];
    const optionMatches = [...harness.root.innerHTML.matchAll(/data-chain-answer="(\d+)"[\s\S]*?<strong>([^<]+)<\/strong>/g)];
    const correct = optionMatches.find(match => match[2] === current.to);
    assert.ok(correct, 'the canonical answer should appear in the rendered choices');
    harness.click('[data-chain-answer]', {chainAnswer:correct[1]});
    assert.ok(harness.feedback.innerHTML.includes(current.explanation), 'the accepted link should reveal its explanation');
    if (step < 2) assert.match(harness.root.innerHTML, new RegExp('LINK ' + (step + 2) + ' OF 3'));
  }
  assert.match(harness.feedback.innerHTML, /Chain complete!/);
  for (const link of item.links) assert.ok(harness.feedback.innerHTML.includes(link.explanation));
});

test('Chain Reaction does not show an empty Challenge hint and records wrong links', () => {
  const harness = createHarness();
  harness.click('[data-think-game]', {thinkGame:'chain'});
  harness.click('[data-think-training-mode]', {thinkTrainingMode:'challenge',thinkTrainingGame:'chain'});
  for (let attempt = 0; attempt < 2; attempt++) harness.click('[data-chain-answer]', {chainAnswer:'99'});
  assert.doesNotMatch(harness.feedback.innerHTML, /<p><\/p>/);
  assert.equal(harness.recordedResults.filter(result => result[0] === 'vocabulary' && result[1] === 'chain' && result[2] === false).length, 2);
  assert.doesNotMatch(source, /rounds\.chain\s*=/);
  assert.doesNotMatch(source, /function chainSteps\(item\)/);
});


test('Codebreaker has a dedicated Think Lab card, icon, and independent level picker',()=>{
  const harness=createHarness();
  assert.match(source,/id:'codebreaker',num:'10'/);
  const icons=fs.readFileSync(path.join(__dirname,'..','icon-system.js'),'utf8');
  assert.match(icons,/'codebreaker':/);
  assert.match(icons,/codebreaker:'codebreaker'/);
  harness.click('[data-think-game]',{thinkGame:'codebreaker'});
  assert.equal(harness.getCodebreakerOpened(),1);
  assert.equal(harness.root.innerHTML,'codebreaker-level-picker');
  assert.doesNotMatch(harness.root.innerHTML,/How would you like to play/);
});


test('Letter Grid has a dedicated Think Lab card, icon, and independent level picker',()=>{
  const harness=createHarness();
  assert.match(source,/id:'lettergrid',num:'11'/);
  const icons=fs.readFileSync(path.join(__dirname,'..','icon-system.js'),'utf8');
  assert.match(icons,/'letter-grid':/);
  assert.match(icons,/lettergrid:'letter-grid'/);
  harness.click('[data-think-game]',{thinkGame:'lettergrid'});
  assert.equal(harness.getLetterGridOpened(),1);
  assert.equal(harness.root.innerHTML,'letter-grid-level-picker');
  assert.doesNotMatch(harness.root.innerHTML,/How would you like to play/);
});

test('Think Lab game skill registration is sourced from the canonical progression registry', () => {
  const harness = createHarness();
  const registry = require('../think-lab-progression.js').getRegistry();
  assert.equal(registry.length, 11);
  for (const game of registry) assert.ok(game.id && game.skill);
  assert.match(source, /progressionRegistry\.getRegistry\(\)\.reduce/);
  assert.doesNotMatch(source, /const gameSkills = \{odd:/);
});

test('server-validated Odd One Out does not persist guest bearer tokens or browser round snapshots',()=>{
  assert.match(source,/velorn-odd-one-out-guest/);
  assert.match(source,/validatorGuestToken/);
  assert.match(source,/if \(validatorSessionId \|\| restoringInternalSession/);
  assert.doesNotMatch(source,/localStorage\.setItem\([^)]*(?:guestToken|validatorGuestToken)/);
});

test('multiple internal games keep independent resumable sessions and restore tile placement',()=>{
  const first=createHarness();
  first.click('[data-think-game]',{thinkGame:'forge'});
  first.click('[data-think-training-mode]',{thinkTrainingMode:'steady',thinkTrainingGame:'forge'});
  first.click('[data-forge-tile]',{forgeTile:'0'});
  assert.equal(first.savedSnapshots.forge.payload.forgePlaced[0],0);
  const resumed=createHarness({savedSnapshots:first.savedSnapshots});
  assert.match(resumed.root.innerHTML,/data-think-resume="forge"/);
  resumed.click('[data-think-resume]',{thinkResume:'forge'});
  assert.equal(resumed.savedSnapshots.forge.payload.forgePlaced[0],0);
  assert.equal(resumed.recordedResults.length,0);
});
