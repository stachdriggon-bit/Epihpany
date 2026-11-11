const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../supabase/functions/velorn-odd-one-out/odd-one-out-bank.js');
assert.equal(bank.version, 'odd-one-out-rotated-20261110-v2');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const thinkLabSource = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');
const progressionSource = fs.readFileSync(path.join(__dirname, '..', 'think-lab-progression.js'), 'utf8');
const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('Odd One Out has independent banks for all six CEFR levels', () => {
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    assert.ok(Array.isArray(bank.banks[level]));
    assert.equal(bank.banks[level].length, ['A1','A2','B1','B2','C1','C2'].includes(level) ? 12 : 8);
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
  assert.equal(steady.questions.length,10);
  assert.equal(challenge.questions.length,12);
  assert.equal(guided.shortened,false);
  assert.equal(steady.shortened,false);
  assert.equal(challenge.shortened,false);
  for (const round of [guided,steady,challenge]) {
    assert.equal(new Set(round.questions.map(q=>q.id)).size,round.questions.length);
  }
});

function loadThinkLabHarness(cefrLevel = 'A1') {
  const root = {innerHTML:'',addEventListener(){}};
  const window = {
    EPIPHANY_ODD_ONE_OUT_BANK: bank,
    EpiphanyThinkLab: {
      getCEFRLevel: () => cefrLevel,
      getGameDifficulty: () => ({level:'guided',hintLevel:1}),
      registerGame() {}
    }
  };
  const document = {getElementById: id => id === 'think-lab-content' ? root : null};
  vm.runInNewContext(progressionSource, {window,module:undefined}, {filename:'think-lab-progression.js',timeout:5000});
  const instrumented = thinkLabSource.replace(
    '  landing();\n})();',
    '  window.__oddPool = trainingMode => getRoundPool("odd", trainingMode);\n  landing();\n})();'
  );
  assert.notEqual(instrumented, thinkLabSource, 'test hook must be inserted before the Think Lab IIFE closes');
  new vm.Script(instrumented, {filename:'think-lab.js'});
  vm.runInNewContext(instrumented, {window,document,console,Math}, {filename:'think-lab.js',timeout:5000});
  return window;
}

test('Think Lab never falls back to a browser-side Odd One Out bank', () => {
  const harness = loadThinkLabHarness('A1');
  for (const mode of ['guided','steady','challenge']) assert.equal(harness.__oddPool(mode).length, 0);
  assert.doesNotMatch(thinkLabSource, /EPIPHANY_ODD_ONE_OUT_BANK/);
});

test('all 18 CEFR and training-mode combinations select the intended distinct questions', () => {
  const levels = ['A1','A2','B1','B2','C1','C2'];
  const modes = [['guided',8],['steady',10],['challenge',12]];
  for (const level of levels) {
    for (const [mode,target] of modes) {
      const round = bank.selectRound(level,mode,[],()=>0.37);
      assert.equal(round.level,level,level + ' ' + mode + ' should retain its CEFR bank');
      assert.equal(round.trainingMode,mode);
      assert.equal(round.target,target);
      const available=bank.banks[level].length;
      assert.equal(round.available,available);
      assert.equal(round.questions.length,Math.min(target,available),level + ' ' + mode + ' should use all available quality-approved items up to its target');
      assert.equal(round.shortened,target>available,level + ' ' + mode + ' should disclose only the rounds shorter than target');
      assert.equal(new Set(round.questions.map(question=>question.id)).size,Math.min(target,available));
      for (const question of round.questions) {
        const source = bank.banks[level].find(item=>item.id===question.id);
        assert.ok(source);
        assert.equal(question.words[question.answer] !== undefined,true);
        assert.equal(question.words.length,4);
        if (mode==='challenge') {
          assert.ok(source.challengeExplain);
          assert.equal(question.explain,source.challengeExplain);
        } else {
          assert.equal(question.explain,source.explain);
        }
      }
    }
  }
});

test('recently seen questions are excluded while an expanded bank can still fill the round', () => {
  const recent = bank.banks.B1.slice(0,3).map(item=>item.id);
  const round = bank.selectRound('B1','guided',recent,()=>0.5);
  assert.equal(round.available,9);
  assert.equal(round.questions.length,8);
  assert.ok(round.questions.every(item=>!recent.includes(item.id)));
  assert.equal(round.shortened,false);
});

test('selection falls back safely for invalid level or training mode', () => {
  const round = bank.selectRound('unknown','unexpected',[],()=>0.2);
  assert.equal(round.level,'A1');
  assert.equal(round.trainingMode,'steady');
});

test('shuffled options preserve the correct word while varying its position', () => {
  const source = bank.banks.A1[0];
  const round = bank.selectRound('A1','guided',[],()=>0.37);
  const selected = round.questions.find(item=>item.id===source.id);
  assert.ok(selected);
  assert.equal(selected.words[selected.answer],source.words[source.answer]);
  assert.equal(new Set(selected.words).size,4);
});


test('all Odd One Out questions provide a distinct four-option Challenge set', () => {
  const result = bank.validateBank();
  assert.deepEqual(result, {valid:true,errors:[]});
  for (const items of Object.values(bank.banks)) {
    for (const item of items) {
      const challenge = bank.selectRound(item.id.slice(0,2),'challenge',[],()=>0.31)
        .questions.find(question => question.id === item.id);
      assert.ok(challenge, item.id + ' should be selectable in Challenge');
      assert.equal(challenge.words.length,4);
      assert.equal(new Set(challenge.words.map(word=>word.toLowerCase())).size,4);
      assert.notDeepEqual(
        challenge.words.map(word=>word.toLowerCase()).sort(),
        item.words.map(word=>word.toLowerCase()).sort(),
        item.id + ' should use dedicated Challenge options'
      );
    }
  }
});

test('Guided and Steady retain the original option sets', () => {
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    for (const mode of ['guided','steady']) {
      const round = bank.selectRound(level,mode,[],()=>0.29);
      for (const question of round.questions) {
        const source = bank.banks[level].find(item=>item.id===question.id);
        assert.deepEqual(
          question.words.map(word=>word.toLowerCase()).sort(),
          source.words.map(word=>word.toLowerCase()).sort(),
          question.id + ' must not receive Challenge options in ' + mode
        );
      }
    }
  }
});

test('Challenge uses option-matched explanations when a question defines one', () => {
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    for (const source of bank.banks[level]) {
      const selected = bank.selectRound(level,'challenge',[],()=>0.31)
        .questions.find(question => question.id === source.id);
      assert.ok(selected);
      assert.equal(
        selected.explain,
        source.challengeExplain || source.explain,
        source.id + ' should show an explanation appropriate to its selected options'
      );
    }
  }
});

test('Challenge shuffling keeps the selected answer index valid', () => {
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    const round = bank.selectRound(level,'challenge',[],()=>0.43);
    for (const question of round.questions) {
      assert.ok(Number.isInteger(question.answer));
      assert.ok(question.answer >= 0 && question.answer < 4);
      assert.equal(new Set(question.words).size,4);
    }
  }
});


test('B1 expansion provides 12 distinct questions and full target-sized rounds', () => {
  assert.equal(bank.banks.B1.length,12);
  for (const [mode,target] of [['guided',8],['steady',10],['challenge',12]]) {
    const round=bank.selectRound('B1',mode,[],()=>0.37);
    assert.equal(round.questions.length,target);
    assert.equal(round.shortened,false);
    assert.equal(new Set(round.questions.map(question=>question.id)).size,target);
  }
  for (const id of ['B1-CAT-02','B1-COL-02','B1-CON-01','B1-FUN-02']) {
    const item=bank.banks.B1.find(question=>question.id===id);
    assert.ok(item, id + ' should be in the B1 bank');
    assert.ok(item.challengeExplain);
    const challenge=bank.selectRound('B1','challenge',[],()=>0.31).questions.find(question=>question.id===id);
    assert.ok(challenge);
    assert.notDeepEqual(challenge.words.slice().sort(),item.words.slice().sort());
  }
});

test('A2 expansion provides 12 distinct questions and full target-sized rounds', () => {
  assert.equal(bank.banks.A2.length,12);
  for (const [mode,target] of [['guided',8],['steady',10],['challenge',12]]) {
    const round=bank.selectRound('A2',mode,[],()=>0.37);
    assert.equal(round.questions.length,target);
    assert.equal(round.shortened,false);
    assert.equal(new Set(round.questions.map(question=>question.id)).size,target);
  }
  for (const id of ['A2-CAT-02','A2-CAUSE-01','A2-CON-01','A2-FUN-02']) {
    const item=bank.banks.A2.find(question=>question.id===id);
    assert.ok(item, id + ' should be in the A2 bank');
    assert.ok(item.challengeExplain);
    const challenge=bank.selectRound('A2','challenge',[],()=>0.31).questions.find(question=>question.id===id);
    assert.ok(challenge);
    assert.notDeepEqual(challenge.words.slice().sort(),item.words.slice().sort());
  }
});

test('B2 expansion provides 12 distinct questions and full target-sized rounds', () => {
  assert.equal(bank.banks.B2.length,12);
  for (const [mode,target] of [['guided',8],['steady',10],['challenge',12]]) {
    const round=bank.selectRound('B2',mode,[],()=>0.37);
    assert.equal(round.questions.length,target);
    assert.equal(round.shortened,false);
    assert.equal(new Set(round.questions.map(question=>question.id)).size,target);
  }
  for (const id of ['B2-CAT-02','B2-FUN-02','B2-WC-02','B2-CAUSE-02']) {
    const item=bank.banks.B2.find(question=>question.id===id);
    assert.ok(item, id + ' should be in the B2 bank');
    assert.ok(item.challengeExplain);
    const challenge=bank.selectRound('B2','challenge',[],()=>0.31).questions.find(question=>question.id===id);
    assert.ok(challenge);
    assert.notDeepEqual(challenge.words.slice().sort(),item.words.slice().sort());
    assert.equal(challenge.explain,item.challengeExplain);
    const expectedOutsiders = {
      'B2-CAT-02':'wind band',
      'B2-FUN-02':'probe',
      'B2-WC-02':'systematically',
      'B2-CAUSE-02':'moderate'
    };
    assert.equal(challenge.words[challenge.answer],expectedOutsiders[id]);
  }
});

test('C1 expansion provides 12 distinct questions and full target-sized rounds', () => {
  assert.equal(bank.banks.C1.length,12);
  for (const [mode,target] of [['guided',8],['steady',10],['challenge',12]]) {
    const round=bank.selectRound('C1',mode,[],()=>0.37);
    assert.equal(round.questions.length,target);
    assert.equal(round.shortened,false);
    assert.equal(new Set(round.questions.map(question=>question.id)).size,target);
  }
  const expectedOutsiders = {
    'C1-CAT-02':'poetry volume',
    'C1-FUN-02':'scientist',
    'C1-WC-02':'vaguely',
    'C1-CAUSE-02':'temper'
  };
  for (const [id,outsider] of Object.entries(expectedOutsiders)) {
    const item=bank.banks.C1.find(question=>question.id===id);
    assert.ok(item,id+' should be in the C1 bank');
    assert.ok(item.challengeExplain);
    const challenge=bank.selectRound('C1','challenge',[],()=>0.31).questions.find(question=>question.id===id);
    assert.ok(challenge);
    assert.notDeepEqual(challenge.words.slice().sort(),item.words.slice().sort());
    assert.equal(challenge.words[challenge.answer],outsider);
    assert.equal(challenge.explain,item.challengeExplain);
  }
});

test('C2 expansion provides 12 distinct questions and full target-sized rounds', () => {
  assert.equal(bank.banks.C2.length,12);
  for (const [mode,target] of [['guided',8],['steady',10],['challenge',12]]) {
    const round=bank.selectRound('C2',mode,[],()=>0.37);
    assert.equal(round.questions.length,target);
    assert.equal(round.shortened,false);
    assert.equal(new Set(round.questions.map(question=>question.id)).size,target);
  }
  const expectedOutsiders = {
    'C2-CAT-02':'reference work',
    'C2-FUN-02':'engineer',
    'C2-PW-02':'lease',
    'C2-CTX-02':'somatic'
  };
  for (const [id,outsider] of Object.entries(expectedOutsiders)) {
    const item=bank.banks.C2.find(question=>question.id===id);
    assert.ok(item,id+' should be in the C2 bank');
    assert.ok(item.challengeExplain);
    const challenge=bank.selectRound('C2','challenge',[],()=>0.31).questions.find(question=>question.id===id);
    assert.ok(challenge);
    assert.notDeepEqual(challenge.words.slice().sort(),item.words.slice().sort());
    assert.equal(challenge.words[challenge.answer],outsider);
    assert.equal(challenge.explain,item.challengeExplain);
  }
});

test('C2 grammar, collocation and contextual questions use precise classifications and prompts', () => {
  const contextual=bank.banks.C2.find(question=>question.id==='C2-CTX-01');
  assert.equal(contextual.relationship,'synonyms-antonyms');
  const contextualMeaning=bank.banks.C2.find(question=>question.id==='C2-CTX-02');
  assert.equal(contextualMeaning.relationship,'contextual-meaning');
  assert.match(contextualMeaning.hint,/court/i);
  const grammar=bank.banks.C2.find(question=>question.id==='C2-WC-01');
  assert.deepEqual(grammar.words,['although','though','even though','notwithstanding']);
  assert.match(grammar.explain,/subordinating conjunctions/i);
  const collocation=bank.banks.C2.find(question=>question.id==='C2-COL-01');
  assert.ok(collocation.words.every(word=>/regret$/.test(word)));
  const challenge=bank.selectRound('C2','challenge',[],()=>0.31).questions.find(question=>question.id==='C2-COL-01');
  assert.ok(challenge.words.every(word=>/regret$/.test(word)));
  assert.equal(challenge.words[challenge.answer],'happily regret');
});

test('C1 collocation and part-whole questions avoid ambiguous groupings', () => {
  const collocation=bank.banks.C1.find(question=>question.id==='C1-COL-01');
  assert.deepEqual(collocation.words,['raise','lodge','voice','execute']);
  assert.equal(collocation.words[collocation.answer],'execute');
  const collocationChallenge=bank.selectRound('C1','challenge',[],()=>0.31).questions.find(q=>q.id==='C1-COL-01');
  assert.equal(collocationChallenge.words[collocationChallenge.answer],'compose');
  const partWhole=bank.banks.C1.find(question=>question.id==='C1-PW-01');
  assert.deepEqual(partWhole.words,['preface','appendix','index','treatise']);
  assert.equal(partWhole.words[partWhole.answer],'treatise');
});

test('A1-SYN-01 uses beginner-friendly vocabulary in both modes', () => {
  const item = bank.banks.A1.find(question => question.id === 'A1-SYN-01');
  assert.deepEqual(item.words, ['big','large','huge','little']);
  assert.equal(item.answer, 3);
  const challenge = bank.selectRound('A1','challenge',[],()=>0.31).questions.find(q=>q.id==='A1-SYN-01');
  assert.deepEqual(challenge.words.map(word=>word.toLowerCase()).sort(), ['big','huge','large','mini'].sort());
  assert.equal(challenge.words[challenge.answer], 'mini');
});

test('B2-COL-01 hint matches the tested collocation', () => {
  const item = bank.banks.B2.find(question => question.id === 'B2-COL-01');
  assert.match(item.hint, /a conclusion/i);
  assert.doesNotMatch(item.hint, /a question|a concern|an issue/i);
});

test('C1-PW-01 Challenge uses the complete work as the outsider', () => {
  const item = bank.selectRound('C1','challenge',[],()=>0.31).questions.find(q=>q.id==='C1-PW-01');
  assert.ok(item);
  assert.equal(item.words[item.answer], 'volume');
  assert.match(item.explain, /complete work/i);
});


test('Odd One Out replay rewards are idempotent while adaptive attempts remain trackable', () => {
  assert.match(appSource, /ledger\['answer:' \+ rewardKey\]/);
  assert.match(appSource, /ledger\['round:' \+ completionKey\]/);
  assert.match(appSource, /if \(options\.trackAdaptive !== false\)/);
  assert.match(appSource, /thinkLabRewardKeys/);
});
