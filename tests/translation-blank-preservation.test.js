const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
  path.resolve(__dirname, '..', 'data-translation-ar.js'),
  'utf8'
);
const window = {};
vm.runInNewContext(source, { window }, { filename: 'data-translation-ar.js', timeout: 5000 });
const phrases = window.EPIPHANY_AR_TRANSLATION_PHRASES;

test('Arabic translation hints preserve every English grammar blank', () => {
  const blankPrompts = Object.entries(phrases).filter(([key]) => /_{3,}/.test(key));
  assert.ok(blankPrompts.length >= 4, 'expected grammar fill-in prompts to be present');

  for (const [key, translation] of blankPrompts) {
    assert.match(
      translation,
      /_{3,}/,
      'translation must preserve the blank instead of revealing the answer: ' + key
    );
  }
});
