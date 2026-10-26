const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.resolve(__dirname, '..', 'data-mistakes.js'),
  'utf8'
);

test('Arabic translations do not complete English fill-in-the-blank questions', () => {
  const cases = [
    ['trap-b1-extra-02', 'If I ___ more time, I would learn Japanese.'],
    ['trap-c1-extra-01', 'Only after the review ___ the error discovered.'],
    ['trap-a2-bank-03', 'We ___ our grandparents yesterday.'],
    ['trap-b2-bank-03', 'Not until midnight ___ home.'],
    ['trap-b2-bank-04', 'He admitted ___ the mistake.'],
    ['trap-b2-bank-06', 'I wish I ___ more time yesterday.'],
    ['trap-b2-bank-08', 'I had my laptop ___ yesterday.'],
    ['trap-b2-bank-10', 'She denied ___ the confidential email.'],
    ['trap-c1-bank-08', 'The proposal, ___ merits remain disputed, was approved.'],
    ['trap-c1-bank-11', 'Only after the audit ___ the discrepancy discovered.'],
    ['trap-c2-bank-08', 'The evidence, together with the appendices, ___ been reviewed.']
  ];

  for (const [id, english] of cases) {
    const start = source.indexOf('"id": "' + id + '"');
    assert.notEqual(start, -1, 'question should exist: ' + id);
    const end = source.indexOf('\n  },', start);
    assert.notEqual(end, -1, 'question object should end: ' + id);
    const item = source.slice(start, end);
    assert.ok(item.includes('"prompt": "' + english + '"'), 'English prompt changed: ' + id);
    assert.ok(
      item.includes('“' + english + '”'),
      'Arabic prompt should preserve the English blank and not reveal its answer: ' + id
    );
  }
});
