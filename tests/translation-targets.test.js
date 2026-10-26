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
    'We are looking forward to hear from you.',
    'I look forward see you.',
    'I look forward for seeing you.',
    'I’m looking forward to see you.'
  ]) {
    assert.ok(phrases[english], 'missing Arabic prompt for: ' + english);
    assert.ok(
      phrases[english].includes(english),
      'Arabic prompt must preserve the original sentence for error analysis: ' + english
    );
  }
});

test('sentence-level distractor translations preserve the English target instead of revealing the error', () => {
  const phrases = translations();
  for (const english of [
    'Where does you live?',
    'Where are you live?',
    'She is good in draw.',
    'She good at to draw.',
    'You are apology.',
    'He told that he busy.',
    'Little did realise she the risk.',
    'Can I borrowing your pen?',
    'I am appreciating you help.',
    'Thanks for your helps.',
    'Good night yesterday.',
    'What you said yesterday?',
    'The findings call in question to the assumption.',
    'The findings call question into assumption.',
    'The findings call upon question the assumption.',
    'Notwithstanding of the delay, the team finished.',
    'Notwithstanding the delay but the team finished.',
    'Notwithstanding to delay, team finished.',
    'The evidence falls short to establish causation.',
    'The evidence falls short for establishing causation.',
    'The evidence falls short establish causation.',
    'She cans swim.',
    'She can to swim.',
    'She is can swim.',
    'I already have finish my homework.',
    'I have finish already my homework.',
    'I has already finished my homework.',
    'Notwithstanding of the objections, the committee upheld its decision.',
    'Notwithstanding the objections, the committee has uphold its decision.',
    'Notwithstanding to the objections, the committee upheld its decision.',
    'By no means this establishes causation.',
    'By no means does this established causation.',
    'By no means this do establish causation.',
    'I never have went to Spain.',
    'I have never went to Spain.',
    'I never been to Spain.'
  ]) {
    assert.ok(phrases[english], 'missing Arabic prompt for: ' + english);
    assert.ok(phrases[english].includes(english), 'translation must preserve the original distractor: ' + english);
    assert.ok(!phrases[english].includes('صياغة غير صحيحة'), 'translation must not reveal that the option is incorrect: ' + english);
  }
});
