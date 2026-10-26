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

test('advanced vocabulary prompts do not translate the target word into the answer', () => {
  const cases = [
    ['Her explanation was “ambiguous”, so readers ___.', 'في الجملة الإنجليزية، ما النتيجة التي يصفها النص لكلمة “ambiguous”؟'],
    ['A “feasible” plan is one that is ___.', 'ما المقصود بكلمة “feasible” في السؤال الإنجليزي؟'],
    ['A “pervasive” influence is one that ___.', 'ما المقصود بكلمة “pervasive” في السؤال الإنجليزي؟'],
    ['Her argument was “cogent”. It was ___.', 'ما الوصف الذي يطلبه السؤال الإنجليزي للحجة التي وُصفت بأنها “cogent”؟'],
    ['To “mitigate” a risk is to ___.', 'ما المقصود بالفعل “mitigate” في السؤال الإنجليزي؟'],
    ['A “trenchant” critique is ___.', 'ما الوصف الذي يطلبه السؤال الإنجليزي للنقد الموصوف بأنه “trenchant”؟'],
    ['A “perfunctory” apology is made ___.', 'ما المقصود بكلمة “perfunctory” في السؤال الإنجليزي؟'],
    ['If a conclusion is “inexorable”, it is ___.', 'ما المقصود بكلمة “inexorable” في السؤال الإنجليزي؟'],
    ['The proposal, ___ details were published yesterday, has drawn criticism.', 'أكمل الجملة الإنجليزية: “The proposal, ___ details were published yesterday, has drawn criticism.”']
  ];

  for (const [key, expectedPrompt] of cases) {
    const line = source.split('\\n').find(row => row.includes("'" + key + "':"));
    assert.ok(line, 'question should exist: ' + key);
    assert.ok(line.includes(expectedPrompt), 'Arabic prompt should not disclose the answer: ' + key);
  }
});
