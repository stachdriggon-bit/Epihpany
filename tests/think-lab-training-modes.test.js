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
  let chainPrivateRound = [];
  let sentencePrivateRound = [];
  const validatorClient = {functions:{async invoke(_name,{body}={}) {
    if (body?.action === 'start' && body.gameId === 'sentence_scramble') {
      const bank = sentenceScrambleContext.window.EPIPHANY_SENTENCE_SCRAMBLE_BANK;
      sentencePrivateRound = bank.modes[body.trainingMode].map(item => {
        const words = item.sentence.trim().split(' ');
        for (let i = words.length - 1; i > 0; i--) [words[i], words[0]] = [words[0], words[i]];
        return { ...item, words };
      });
      if (body.daily === true) sentencePrivateRound = sentencePrivateRound.slice(0, 1);
      return {error:null,data:{
        sessionId:'123e4567-e89b-42d3-a456-426614174002',
        guestToken:'d'.repeat(64),
        validatorVersion:'sentence-scramble-72-20261112-v1',
        trainingMode:body.trainingMode,
        daily:body.daily === true,
        questions:sentencePrivateRound.map(question=>({id:question.id,prompt:question.prompt,words:question.words.slice()}))
      }};
    }
    if (body?.action === 'start' && body.gameId === 'chain_reaction') {
      chainPrivateRound = chainReactionContext.window.EPIPHANY_CHAIN_REACTION_BANK.selectRound(body.trainingMode,()=>0);
      return {error:null,data:{
        sessionId:'123e4567-e89b-42d3-a456-426614174001',
        guestToken:'c'.repeat(64),
        validatorVersion:'chain-reaction-72-20261112-v1',
        trainingMode:body.trainingMode,
        daily:false,
        questions:chainPrivateRound.map(question=>({
          id:question.id,title:question.title,start:question.start,
          links:question.links.map(link=>({from:link.from,options:link.options.slice()}))
        }))
      }};
    }
    if (body?.action === 'start') return {error:null,data:{
      sessionId:'123e4567-e89b-42d3-a456-426614174000',
      guestToken:'a'.repeat(64),
      questions:Array.from({length:24},(_,index)=>({id:'WF-G-'+String(index+1).padStart(3,'0'),clue:'A reviewed word clue number '+(index+1)+'.',letters:'APPLE',prompt:'Forge the word from the letter tiles.'}))
    }};
    if (body?.action === 'answer' && body.gameId === 'sentence_scramble') {
      const question = sentencePrivateRound[body.questionIndex];
      const attempt = body.tileOrder.map(tile => question.words[tile]).join(' ');
      const normalize = value => {
        const slash = String.fromCharCode(92);
        return String(value).toLowerCase()
          .replace(new RegExp("[^" + slash + "p{L}" + slash + "p{N}" + slash + "s]","gu"),"")
          .replace(new RegExp(slash + "s+","g")," ").trim();
      };
      const correct = [question.sentence,...question.acceptedAnswers].some(answer => normalize(answer) === normalize(attempt));
      return {error:null,data:{
        correct,questionIndex:body.questionIndex,nextIndex:body.questionIndex+(correct?1:0),
        completed:correct&&body.questionIndex===sentencePrivateRound.length-1,
        ...(correct?{sentence:question.sentence,explanation:question.explanation,skill:question.skill}:{})
      }};
    }
    if (body?.action === 'answer' && body.gameId === 'chain_reaction') {
      const question=chainPrivateRound[body.questionIndex],link=question.links[body.linkIndex];
      const correct=body.selectedIndex===link.answer,finalLink=body.linkIndex===2;
      return {error:null,data:{
        correct,questionIndex:body.questionIndex,linkIndex:body.linkIndex,
        nextLinkIndex:correct?(finalLink?0:body.linkIndex+1):body.linkIndex,
        nextIndex:body.questionIndex+(correct&&finalLink?1:0),
        challengeCompleted:correct&&finalLink,
        completed:correct&&finalLink&&body.questionIndex===23,
        ...(correct?{nextWord:link.to,explanation:link.explanation}:{})
      }};
    }
    if (body?.action === 'answer') return {error:null,data:{correct:false,advance:true,attemptsRemaining:0,correctAnswer:'apple',explanation:'A complete server-verified answer.',skill:'Spelling'}};
    return {error:{message:'unexpected action'},data:null};
  }}};
  const window = {
    EpiphanyAuth: {isDeveloper: () => true, whenReady:()=>Promise.resolve(), isSignedIn:()=>false, getGuestValidatorClient:()=>validatorClient},
    EPIPHANY_SOUND_MAZE_TOOLS: soundMazeTools,
    EPIPHANY_WORD_CONNECTIONS_BANK: connectionContext.window.EPIPHANY_WORD_CONNECTIONS_BANK,
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
    return listeners.click({target:{closest: candidate => candidate === selector ? element : null}});
  }
  return {root,click,getSavedMazeCEFR:()=>savedMazeCEFR,chainBank:window.EPIPHANY_CHAIN_REACTION_BANK,getChainRound:()=>chainPrivateRound,getSentenceRound:()=>sentencePrivateRound,feedback,recordedResults,getCrosswordOpened:()=>crosswordOpened,getWordHuntOpened:()=>wordHuntOpened,getCodebreakerOpened:()=>codebreakerOpened,getLetterGridOpened:()=>letterGridOpened,savedSnapshots};
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

test('each training mode is passed into the selected game instead of the adaptive default', async () => {
  for (const gameId of gameIds) {
    if (gameId === 'odd') continue; // Server-backed guest sessions are covered by the validator contract tests.
    for (const trainingMode of trainingModes) {
      const harness = createHarness(gameId === 'maze' ? {soundMazeBank:makeSoundMazeFixture()} : {});
      harness.click('[data-think-game]', {thinkGame:gameId});
      await harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:gameId});
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


test('active game screen offers a direct Think Lab home route without removing difficulty back', async () => {
  for (const gameId of gameIds) {
    if (gameId === 'odd') continue; // Odd One Out now requires a live server validator.
    const harness = createHarness(gameId === 'maze' ? {soundMazeBank:makeSoundMazeFixture()} : {});
    harness.click('[data-think-game]', {thinkGame:gameId});
    await harness.click('[data-think-training-mode]', {thinkTrainingMode:'steady',thinkTrainingGame:gameId});
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

test('Word Forge loads exactly 24 server-approved challenges for each selected training mode', async () => {
  for (const trainingMode of trainingModes) {
    const harness = createHarness();
    harness.click('[data-think-game]', {thinkGame:'forge'});
    await harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:'forge'});
    assert.match(harness.root.innerHTML, /ROUND 1 OF 24/);
    assert.match(harness.root.innerHTML, /WORD CLUE/);
    assert.match(harness.root.innerHTML, /data-forge-tile=/);
    assert.match(harness.root.innerHTML, /data-forge-check/);
    assert.match(harness.root.innerHTML, new RegExp('<div class="tl-level-tag">' + trainingMode.toUpperCase() + '</div>'));
  }
});

test('Word Forge keeps answer keys and skills server-side and records verified outcomes', () => {
  const serverBank = fs.readFileSync(path.join(__dirname,'..','supabase','functions','velorn-word-forge','word-forge-bank.js'),'utf8');
  assert.match(source, /recordResult\('spelling','word-forge',data\.correct,index===pool\.length-1\)/);
  assert.match(source, /Complete the word first/);
  assert.match(source, /data\.skill/);
  assert.match(source, /functions\.invoke\('velorn-think-lab-validator',\{body:\{action:'start',gameId:'word_forge'/);
  assert.match(source, /action:'answer',gameId:'word_forge'/);
  assert.doesNotMatch(wordForgeBankSource, /answerWord|explain|skill/);
  assert.match(serverBank, /answerWord/);
  assert.match(serverBank, /skill:/);
  assert.doesNotMatch(source, /rounds\.forge\s*=/);
});


test('Chain Reaction loads 24 distinct approved challenges for each training mode', async () => {
  for (const trainingMode of trainingModes) {
    const harness = createHarness();
    harness.click('[data-think-game]', {thinkGame:'chain'});
    await harness.click('[data-think-training-mode]', {thinkTrainingMode:trainingMode,thinkTrainingGame:'chain'});
    assert.match(harness.root.innerHTML, /ROUND 1 OF 24/);
    assert.match(harness.root.innerHTML, /LINK 1 OF 3/);
    assert.match(harness.root.innerHTML, new RegExp('<div class="tl-level-tag">' + trainingMode.toUpperCase() + '<\\/div>'));
    assert.equal((harness.root.innerHTML.match(/data-chain-answer=/g) || []).length, 3);
    const title = harness.root.innerHTML.match(/<h2>([^<]+)<\/h2>/)?.[1];
    assert.ok(harness.chainBank.getRounds(trainingMode).some(item => item.title === title), 'the displayed challenge must belong to the selected mode bank');
  }
});

test('Chain Reaction uses explicit multi-word starts and reveals every link explanation', async () => {
  const harness = createHarness();
  const challenge = harness.chainBank.getRounds('challenge').find(item => item.id === 'CR-C-007');
  assert.equal(challenge.start, 'REFRACTING TELESCOPE');
  assert.equal(challenge.links[0].from, challenge.start);
  harness.click('[data-think-game]', {thinkGame:'chain'});
  await harness.click('[data-think-training-mode]', {thinkTrainingMode:'challenge',thinkTrainingGame:'chain'});
  const title = harness.root.innerHTML.match(/<h2>([^<]+)<\/h2>/);
  const item = harness.getChainRound().find(entry => entry.title === (title && title[1]));
  assert.ok(item, 'the rendered challenge title should map to an approved bank entry');
  for (let step = 0; step < 3; step++) {
    const current = item.links[step];
    const optionMatches = [...harness.root.innerHTML.matchAll(/data-chain-answer="(\d+)"[\s\S]*?<strong>([^<]+)<\/strong>/g)];
    const correct = optionMatches.find(match => match[2] === current.to);
    assert.ok(correct, 'the canonical answer should appear in the rendered choices');
    await harness.click('[data-chain-answer]', {chainAnswer:correct[1]});
    assert.ok(harness.feedback.innerHTML.includes(current.explanation), 'the accepted link should reveal its explanation');
    if (step < 2) assert.match(harness.root.innerHTML, new RegExp('LINK ' + (step + 2) + ' OF 3'));
  }
  assert.match(harness.feedback.innerHTML, /Chain complete!/);
  for (const link of item.links) assert.ok(harness.feedback.innerHTML.includes(link.explanation));
});

test('Chain Reaction does not show an empty Challenge hint and records wrong links', async () => {
  const harness = createHarness();
  harness.click('[data-think-game]', {thinkGame:'chain'});
  await harness.click('[data-think-training-mode]', {thinkTrainingMode:'challenge',thinkTrainingGame:'chain'});
  const firstChallenge = harness.getChainRound()[0];
  const wrongOption = (firstChallenge.links[0].answer + 1) % 3;
  for (let attempt = 0; attempt < 2; attempt++) await harness.click('[data-chain-answer]', {chainAnswer:String(wrongOption)});
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
  assert.match(source,/const functionName = 'velorn-think-lab-validator';[\s\S]*?validatorClient\.functions\.invoke\(functionName,\{body:\{action:'start',gameId:'odd_one_out'/);
  assert.match(source,/action:'answer',gameId:'odd_one_out'/);
  assert.match(source,/validatorGuestToken/);
  assert.match(source,/if \(validatorSessionId \|\| restoringInternalSession/);
  assert.doesNotMatch(source,/localStorage\.setItem\([^)]*(?:guestToken|validatorGuestToken)/);
});

test('Sentence Scramble verifies tile order on the server and does not persist browser answer snapshots',async()=>{
  const harness=createHarness();
  harness.click('[data-think-game]',{thinkGame:'scramble'});
  await harness.click('[data-think-training-mode]',{thinkTrainingMode:'steady',thinkTrainingGame:'scramble'});
  const round=harness.getSentenceRound();
  assert.equal(round.length,24);
  assert.doesNotMatch(source,/EPIPHANY_SENTENCE_SCRAMBLE_BANK/);
  const question=round[0];
  const remaining=question.words.map((_,index)=>index);
  const correctOrder=question.sentence.split(' ').map(word=>{
    const found=remaining.find(index=>question.words[index]===word);
    assert.notEqual(found,undefined,'every canonical sentence token must have a matching tile');
    remaining.splice(remaining.indexOf(found),1);
    return found;
  });
  const wrongOrder=correctOrder.slice().reverse();
  for(const tile of wrongOrder)await harness.click('[data-scramble-tile]',{scrambleTile:String(tile)});
  assert.equal(harness.savedSnapshots.scramble,undefined,'server-backed sessions must not save browser tile snapshots');
  await harness.click('[data-scramble-check]');
  assert.equal(harness.feedback.className,'tl-feedback is-wrong');
  assert.equal(harness.feedback.innerHTML.includes(question.sentence),false,'wrong answers must not reveal the canonical sentence');
  await harness.click('[data-scramble-reset]');
  for(const tile of correctOrder)await harness.click('[data-scramble-tile]',{scrambleTile:String(tile)});
  await harness.click('[data-scramble-check]');
  assert.equal(harness.feedback.className,'tl-feedback is-correct');
  assert.equal(harness.feedback.innerHTML.includes(question.sentence),true);
  assert.equal(harness.savedSnapshots.scramble,undefined);
  assert.ok(harness.recordedResults.some(result=>result[0]==='grammar'&&result[1]==='sentence-scramble'&&result[2]===true));
});

test('Word Forge secure guest sessions do not persist bearer tokens or browser answer snapshots',async()=>{
  const forge=createHarness();
  forge.click('[data-think-game]',{thinkGame:'forge'});
  await forge.click('[data-think-training-mode]',{thinkTrainingMode:'steady',thinkTrainingGame:'forge'});
  forge.click('[data-forge-tile]',{forgeTile:'0'});
  assert.equal(forge.savedSnapshots.forge,undefined,'server-backed guest sessions must not persist their bearer token or an unusable local snapshot');
});
