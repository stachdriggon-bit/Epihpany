const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');
const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function harnessBankQuestion(harness, level, mode, arabicPrompt) {
  return harness.__translatorBanks[level][mode].find(question => question.ar === arabicPrompt);
}

function loadHarness(options = {}) {
  const root = { innerHTML: '', addEventListener() {} };
  const window = {
    EpiphanyThinkLab: {
      getCEFRLevel: () => options.cefrLevel || 'A1',
      getGameDifficulty: () => ({ level: 'guided', hintLevel: 1 })
    }
  };
  const document = { getElementById: id => id === 'think-lab-content' ? root : null };
  const instrumented = source.replace(
    /  landing\(\);\s*\}\)\(\);\s*$/,
    '  window.__translatorBanks = translatorBanks;\n' +
    '  window.__translatorPool = (level, mode) => { selectedTranslatorCEFR = level; return getRoundPool("translator", mode); };\n' +
    '  landing();\n})();'
  );
  assert.notEqual(instrumented, source, 'test hook must be inserted before the Think Lab IIFE closes');
  new vm.Script(instrumented, { filename: 'think-lab.js' });
  const math = Object.assign(Object.create(Math), options.math || {});
  vm.runInNewContext(instrumented, { window, document, console, Math: math }, { filename: 'think-lab.js', timeout: 5000 });
  return window;
}

test('The Bold Translator A1, A2, B1, B2, C1 and C2 banks each have 42 complete questions with three explained options', () => {
  const harness = loadHarness();
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    const bank = harness.__translatorBanks[level];
    assert.ok(bank, `${level} bank is missing`);
    assert.equal(bank.guided.length, 12, `${level} guided count`);
    assert.equal(bank.steady.length, 15, `${level} steady count`);
    assert.equal(bank.challenge.length, 15, `${level} challenge count`);

    for (const [mode, questions] of Object.entries(bank)) {
      for (const [index, question] of questions.entries()) {
        const where = `${level}.${mode}[${index}]`;
      assert.ok(question.ar.trim(), `${where}: missing Arabic prompt`);
      assert.equal(question.options.length, 3, `${where}: expected three answer options`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 3, `${where}: invalid correct-answer index`);
      assert.ok(question.hint.trim(), `${where}: missing hint`);
      assert.equal(question.optionExplanations.length, 3, `${where}: every option needs an explanation`);
      assert.ok(question.optionExplanations.every(explanation => explanation.trim()), `${where}: an option explanation is empty`);
      if (level === 'C1' || level === 'C2') {
        const correctExplanationIndexes = question.optionExplanations
          .map((explanation, optionIndex) => /^Correct:/i.test(explanation.trim()) ? optionIndex : -1)
          .filter(optionIndex => optionIndex >= 0);
        assert.equal(correctExplanationIndexes.join(','), String(question.answer), `${where}: the answer key must match the explanation marked Correct`);
      }
        assert.equal(new Set(question.options.map(option => option.trim().toLowerCase())).size, 3, `${where}: duplicate options`);
      }
    }
  }
});

test('The Bold Translator round sizes are 8, 10 and 12 questions', () => {
  const harness = loadHarness();
  for (const [mode, expected] of [['guided', 8], ['steady', 10], ['challenge', 12]]) {
    const pool = harness.__translatorPool('A1', mode);
    assert.equal(pool.length, expected);
    assert.ok(pool.every(question => question.cefrLevel === 'A1' && question.trainingMode === mode));
  for (const level of ['A2', 'B1', 'B2', 'C1', 'C2']) {
    const pool = harness.__translatorPool(level, mode);
    assert.equal(pool.length, expected);
    assert.ok(pool.every(question => question.cefrLevel === level && question.trainingMode === mode));
  }
  }
});

test('The Bold Translator balances correct answer positions in every round and keeps explanations attached', () => {
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    for (const mode of ['guided', 'steady', 'challenge']) {
      const harness = loadHarness({ math: { random: Math.random } });
      const pool = harness.__translatorPool(level, mode);
      const positions = pool.map(question => question.answer);
      const counts = [0, 1, 2].map(position => positions.filter(answer => answer === position).length);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${level}.${mode}: correct answers should be balanced across A, B and C`);
      assert.ok(positions.every((position, index) => index === 0 || position !== positions[index - 1]), `${level}.${mode}: correct positions should not repeat consecutively`);
      for (const question of pool) {
        const original = harnessBankQuestion(harness, level, mode, question.ar);
        assert.equal(question.options[question.answer], original.options[original.answer], `${level}.${mode}: correct option text must be preserved`);
        assert.equal(question.optionExplanations[question.answer], original.optionExplanations[original.answer], `${level}.${mode}: correct explanation must follow the correct option`);
        assert.equal(question.options.length, 3);
        assert.equal(question.optionExplanations.length, 3);
      }
    }
  }
});

test('The Bold Translator defaults to adaptive CEFR and keeps manual practice separate', () => {
  assert.match(source, /let selectedTranslatorCEFR = 'adaptive'/);
  assert.match(source, /selectedTranslatorCEFR === 'adaptive' \? adaptiveLevel : selectedTranslatorCEFR/);
  assert.match(source, /selectedTranslatorCEFR='adaptive';showTranslatorLevelPicker\(\)/);
  assert.match(source, /Manual practice does not change your adaptive level/);
  assert.match(source, /data-translator-level="adaptive"/);
  assert.match(source, /data-translator-level="'\+level\+'"/);
  assert.match(source, /translatorBanks\[level\] \? '' : 'disabled'/);
  assert.match(source, /A1, A2, B1, B2, C1 and C2 are available for practice/);
  assert.ok(loadHarness().__translatorBanks.A2, 'A2 should become selectable only after its bank exists');
  assert.ok(loadHarness().__translatorBanks.B1, 'B1 should become selectable only after its bank exists');
  assert.ok(loadHarness().__translatorBanks.B2, 'B2 should become selectable only after its bank exists');
  assert.ok(loadHarness().__translatorBanks.C1, 'C1 should become selectable only after its bank exists');
  assert.ok(loadHarness().__translatorBanks.C2, 'C2 should become selectable only after its bank exists');
  for (const level of ['C1', 'C2']) {
    const bank = loadHarness().__translatorBanks[level];
    const answers = ['guided', 'steady', 'challenge'].flatMap(mode => bank[mode].map(question => question.answer));
    assert.deepEqual([0, 1, 2].map(index => answers.filter(answer => answer === index).length), [14, 14, 14], `${level} correct answers should be evenly distributed across the three option positions`);
    if (level === 'C2') {
      assert.notDeepEqual(answers, answers.map((_, index) => index % 3), 'C2 answer positions must not follow an obvious repeating cycle');
    }
  }
});


test('The Bold Translator selects distinct questions and clearly marks an adaptive fallback', () => {
  const harness = loadHarness({ cefrLevel: 'C3', math: { random: () => 0, floor: Math.floor } });
  const pool = harness.__translatorPool('adaptive', 'steady');
  assert.equal(pool.length, 10, 'steady rounds contain ten questions');
  assert.ok(pool.every(question => question.cefrLevel === 'A1'), 'an unavailable future level temporarily falls back to A1');
  assert.ok(pool.every(question => question.adaptiveFallback === true), 'fallback state is attached to every selected question');
  assert.ok(pool.every(question => question.requestedCEFRLevel === 'C3'), 'the requested adaptive level is preserved');
  assert.equal(new Set(pool.map(question => question.ar)).size, 10, 'a round must not repeat questions');
  assert.match(source, /Your current level is '\+esc\(item\.requestedCEFRLevel\)/, 'the fallback must be disclosed in the round UI');
});

test('Manual C1 practice does not trigger the adaptive fallback notice', () => {
  const harness = loadHarness({ cefrLevel: 'C3', math: { random: () => 0 } });
  const pool = harness.__translatorPool('C1', 'challenge');
  assert.equal(pool.length, 12);
  assert.ok(pool.every(question => question.cefrLevel === 'C1'));
  assert.ok(pool.every(question => question.adaptiveFallback === false));
  assert.ok(pool.every(question => question.requestedCEFRLevel === 'C1'));
});


test('Manual Bold Translator practice keeps rewards but does not update adaptive signals', () => {
  assert.match(source, /trackAdaptive:mode !== 'translator' \|\| selectedTranslatorCEFR === 'adaptive'/);
  assert.match(appSource, /recordResult\(skill, topic, correct, completed = false, options = \{\}\)/);
  assert.match(appSource, /if \(options\.trackAdaptive !== false\)\s*\{\s*recordAdaptiveResult\(/);
  assert.match(appSource, /const gain = correct \? 3 : 1/);
});


test('Manual C2 practice is available and does not trigger the adaptive fallback notice', () => {
  const harness = loadHarness({ cefrLevel: 'A1', math: { random: () => 0 } });
  const pool = harness.__translatorPool('C2', 'challenge');
  assert.equal(pool.length, 12);
  assert.ok(pool.every(question => question.cefrLevel === 'C2'));
  assert.ok(pool.every(question => question.adaptiveFallback === false));
  assert.ok(pool.every(question => question.requestedCEFRLevel === 'C2'));
});


test('Adaptive C2 practice uses the C2 bank without falling back to A1', () => {
  const harness = loadHarness({ cefrLevel: 'C2', math: { random: () => 0 } });
  const pool = harness.__translatorPool('adaptive', 'challenge');
  assert.equal(pool.length, 12);
  assert.ok(pool.every(question => question.cefrLevel === 'C2'));
  assert.ok(pool.every(question => question.adaptiveFallback === false));
  assert.ok(pool.every(question => question.requestedCEFRLevel === 'C2'));
});
