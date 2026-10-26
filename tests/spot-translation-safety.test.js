const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'data-spot.js'), 'utf8');

test('Spot the Mistake Arabic prompts instruct learners without revealing corrected sentences', () => {
  const context = {};
  vm.runInNewContext(source + '\\nglobalThis.__spotQuestions = SPOT_QUESTIONS;', context, { filename: 'data-spot.js', timeout: 5000 });
  const questions = context.__spotQuestions;
  assert.ok(Array.isArray(questions), 'Spot the Mistake question bank should load');
  assert.equal(questions.length, 120, 'all 120 questions should remain available');

  for (const question of questions) {
    assert.equal(
      question.q_ar,
      'اقرأ الجملة الإنجليزية وحدد الخطأ فيها دون تصحيحها.',
      'Arabic prompt must not provide a corrected translation: ' + question.id
    );
    assert.ok(question.text, 'English error sentence should remain: ' + question.id);
    assert.ok(question.fix, 'corrective answer should remain available after the attempt: ' + question.id);
  }
});
