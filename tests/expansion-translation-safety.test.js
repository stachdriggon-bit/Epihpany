const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.resolve(__dirname, '..', 'data-expansion.js'),
  'utf8'
);

test('advanced Arabic prompts preserve grammar structures that reveal the answer when translated', () => {
  const cases = [
    ['The more closely the archive is examined, the less tenable the claim ___.', 'The more closely the archive is examined, the less tenable the claim ___.'],
    ['Not until the final chapter ___ the significance of the opening scene.', 'Not until the final chapter ___ the significance of the opening scene.'],
    ['Not until the final chapter ___ the full significance become apparent.', 'Not until the final chapter ___ the full significance become apparent.'],
    ['If I ___ enough money, I would buy a bicycle.', 'If I ___ enough money, I would buy a bicycle.'],
    ['If I ___ more time, I would learn Italian.', 'If I ___ more time, I would learn Italian.'],
    ['Neither of the answers ___ correct.', 'Neither of the answers ___ correct.']
  ];

  for (const [key, english] of cases) {
    const line = source.split('\n').find(row => row.includes("'" + key + "':"));
    assert.ok(line, 'question should exist: ' + key);
    assert.ok(
      line.includes('“' + english + '”'),
      'Arabic prompt should preserve the English grammar target: ' + key
    );
  }
});
