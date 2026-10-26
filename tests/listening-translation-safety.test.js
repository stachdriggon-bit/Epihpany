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

test('listening and interpretation translations preserve the English target', () => {
  const relevant = Object.entries(phrases).filter(([key]) =>
    /^Someone says(?::|,)/i.test(key) ||
    /^(?:A sign says|A bus display says|An email says|A booking email says|A message says|A notice says|A speaker says|A shop sign says|An announcement says|A notice reads|The person says|You are almost there\. You hear|A colleague says|A text says|A delivery update says|A colleague writes|Message:)/i.test(key) ||
    /^(?:“[^”]+”)\s+(?:Who may enter|What should|When can|When must|What is expected|What does|This means|What do they mean|When is it now|What happened|What is implied|What is requested|What is the condition|What is the speaker asking for|What is the speaker doing|The speaker is asking you to|The premise is…|It may…|What is the objection|What is the key distinction)/i.test(key) ||
    /^“(?:Could you help me\?|Maybe|I think so|I didn’t mean to interrupt|That sounds reasonable|Actually, I was hoping for something quieter|That said, we should be careful)”\s+(?:is…|shows…|expresses…|is used to…|signals…)/i.test(key)
  );
  assert.ok(relevant.length >= 60, 'expected contextual listening and interpretation prompts to be present');

  for (const [key, translation] of relevant) {
    const match = key.match(/““(.*?)””/) || key.match(/[“"]([^”"]+)[”"]/);
    assert.ok(match, 'quoted target should be identifiable: ' + key);
    assert.ok(
      translation.includes(match[1]),
      'translation should preserve the English target instead of revealing its meaning: ' + key
    );
  }
});
