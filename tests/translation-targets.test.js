const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function translations() {
  const window = {};
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'data-translation-ar.js'), 'utf8'),
    { window },
    { filename: 'data-translation-ar.js', timeout: 5000 }
  );
  return window.EPIPHANY_AR_TRANSLATION_PHRASES || {};
}

test('Arabic prompts preserve English grammar targets in gerund questions', () => {
  const phrases = translations();
  const expected = [
    ['I look forward to ___ you.', 'I look forward to ___ you.'],
    ['He suggested ___ a taxi.', 'He suggested ___ a taxi.'],
    ["I'm used to ___ early.", "I'm used to ___ early."],
    ['She suggested ___ a taxi.', 'She suggested ___ a taxi.'],
    ['She suggested ___ (take) the earlier train.', 'She suggested ___ the earlier train.'],
    ['She suggested ___ a taxi. (take)', 'She suggested ___ a taxi.'],
    ['I look forward to ___ from you. (hear)', 'I look forward to ___ from you.'],
    ['I look forward to ___ from you.', 'I look forward to ___ from you.'],
    ['Despite ___ exhausted, she finished the report. (be)', 'Despite ___ exhausted, she finished the report.'],
    ['Despite ___ exhausted, she finished the report.', 'Despite ___ exhausted, she finished the report.']
  ];
  for (const [key, preserved] of expected) {
    assert.ok(phrases[key], 'missing Arabic prompt for: ' + key);
    assert.ok(
      phrases[key].includes(preserved),
      'Arabic prompt should retain the English target sentence: ' + key
    );
  }
});

test('incorrect look-forward-to examples are not translated into corrected Arabic sentences', () => {
  const phrases = translations();
  for (const english of [
    'I look forward to meet you.',
    'I look forward to hear from you.',
    'We are looking forward to hear from you.'
  ]) {
    assert.ok(phrases[english], 'missing Arabic prompt for: ' + english);
    assert.ok(
      phrases[english].includes(english),
      'Arabic prompt must preserve the original sentence for error analysis: ' + english
    );
  }
});
