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

test('listening prompt translations preserve quoted English targets', () => {
  const relevant = Object.entries(phrases).filter(([key]) =>
    /^Someone says(?::|,)/i.test(key) ||
    /^(?:A sign says|A bus display says|An email says|A booking email says|A message says|A notice says|A speaker says|A shop sign says|An announcement says|A notice reads|The person says|You are almost there\\. You hear)/i.test(key) ||\n    /^(?:“[^”]+”)\\s+(?:Who may enter|What should|When can|When must|What is expected|What does|This means|What do they mean)/i.test(key)
  );
  assert.ok(relevant.length >= 25, 'expected the contextual listening prompt set to be present');

  for (const [key, translation] of relevant) {
    const match = key.match(/““(.*?)””/) || key.match(/[“"]([^”"]+)[”"]/);
    assert.ok(match, 'quoted target should be identifiable: ' + key);
    assert.ok(
      translation.includes(match[1]),
      'translation should preserve the English target instead of revealing its meaning: ' + key
    );
  }
});
