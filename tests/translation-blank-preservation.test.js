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

test('Arabic translations preserve blanks in grammar prompts', () => {
  const blankPrompts = Object.entries(phrases).filter(([key]) =>
    /^If I ___|^Not until midnight ___|^Choose the correct phrase:.*___/.test(key)
  );
  assert.ok(blankPrompts.length >= 5, 'expected the grammar fill-in prompts to be present');

  for (const [key, translation] of blankPrompts) {
    assert.match(
      translation,
      /_{3,}/,
      'translation must preserve the grammar blank instead of revealing the answer: ' + key
    );
  }
});
