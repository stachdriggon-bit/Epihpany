const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
  path.resolve(__dirname, '..', 'data-translation-ar-fill.js'),
  'utf8'
);
const window = {};
vm.runInNewContext(source, { window }, { filename: 'data-translation-ar-fill.js', timeout: 5000 });
const phrases = window.EPIPHANY_AR_TRANSLATION_PHRASES;

test('comprehension translations preserve the English phrase being interpreted', () => {
  const targets = [
    'An email states, “We have yet to receive your confirmation.” They…',
    'A report says, “The figures are preliminary and should be treated with caution.” You should…',
    'A policy states, “Exceptions may be granted at the discretion of management.” This means…',
    'An email says, “This message supersedes all previous versions.” What should you use?',
    'A notice says, “The service may be intermittently unavailable.” What is likely?',
    'A contract says payment is “due upon receipt.” When is payment expected?',
    'A report says a result “cannot be ruled out.” This means it…',
    'A memo says, “The recommendation is contingent on funding.” It applies…',
    'A report describes a correlation as “not in itself evidence of causation.” The author warns that…',
    'A statement says, “The findings are broadly consistent, albeit with notable exceptions.” This means…',
    'An editor says a claim is “not borne out by the evidence.” The evidence…',
    'A policy is described as “without prejudice to existing rights.” It…',
    'A legal notice says, “For the avoidance of doubt…” The phrase is used to…',
    'A paper says the result is “conditional upon the validity of the model.” The result…',
    'A reviewer says the argument “begs the question.” In logic, this often means it…',
    'A statement is “true only insofar as the categories remain stable.” This means…',
    'A conclusion is described as “epistemically underdetermined.” The evidence…'
  ];

  for (const key of targets) {
    assert.ok(phrases[key], 'Arabic translation should exist: ' + key);
    const target = (key.match(/[“]([^”]+)[”]/) || key.match(/“([^”]+)”/) || [])[1];
    assert.ok(target, 'target phrase should be identifiable: ' + key);
    const targetText = target.replace(/[.!?…]+$/, '');
    assert.ok(
      phrases[key].includes(targetText),
      'translation must preserve the English phrase being interpreted: ' + key
    );
  }
});

test('dialogue meaning questions keep the spoken English phrase visible in translation mode', () => {
  const entries = Object.entries(phrases).filter(([key]) => key.startsWith('Someone says: ““'));
  assert.ok(entries.length >= 30, 'expected the dialogue meaning question set to be present');
  for (const [key, translation] of entries) {
    const match = key.match(/^Someone says: ““(.*)””$/);
    assert.ok(match, 'spoken phrase should be identifiable: ' + key);
    assert.ok(
      translation.includes(match[1]),
      'translation must not reveal the meaning of the spoken phrase: ' + key
    );
  }
});
