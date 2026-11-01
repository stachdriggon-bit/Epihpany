const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');

function loadHarness() {
  const root = { innerHTML: '', addEventListener() {} };
  const window = {
    EpiphanyThinkLab: {
      getCEFRLevel: () => 'A1',
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
  vm.runInNewContext(instrumented, { window, document, console, Math }, { filename: 'think-lab.js', timeout: 5000 });
  return window;
}

test('The Bold Translator A1 and A2 banks each have 42 complete questions with three explained options', () => {
  const harness = loadHarness();
  for (const level of ['A1', 'A2']) {
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
  const a2Pool = harness.__translatorPool('A2', mode);
  assert.equal(a2Pool.length, expected);
  assert.ok(a2Pool.every(question => question.cefrLevel === 'A2' && question.trainingMode === mode));
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
  assert.match(source, /A1 and A2 are available for practice/);
  assert.ok(loadHarness().__translatorBanks.A2, 'A2 should become selectable only after its bank exists');
});
