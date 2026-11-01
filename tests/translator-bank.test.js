const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('The Bold Translator contains the reviewed A1 question-bank structure', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'think-lab.js'), 'utf8');
  assert.match(source, /const translatorBanks = \{/);
  assert.match(source, /guided: \[/);
  assert.match(source, /steady: \[/);
  assert.match(source, /challenge: \[/);
  assert.match(source, /const roundSize = \{guided:8,steady:10,challenge:12\}/);
  assert.match(source, /optionExplanations/);
  assert.match(source, /function showTranslatorLevelPicker\(\)/);
  assert.match(source, /selectedTranslatorCEFR === 'adaptive'/);
});
