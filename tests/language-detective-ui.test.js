'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../language-detective-assessment-engine');
const { cases, fixtures, makeContext } = require('../language-detective-assessment-fixtures');

const ui = fs.readFileSync(path.join(__dirname, '..', 'language-detective-ui.js'), 'utf8');

function assess(caseId, conclusion, reasoning, answerFormat = 'STANDARD') {
  const context = makeContext(caseId, 'GUIDED', answerFormat);
  context.responseId = 'ui-contract-' + caseId + '-' + answerFormat;
  return engine.evaluate({
    context,
    caseSnapshot: cases[caseId],
    response: 'Conclusion: ' + conclusion + '\nReasoning: ' + reasoning,
    hintsUsed: []
  });
}

test('Standard mode shows locked conclusion slots and unlocks them only after reasoning submission', () => {
  assert.match(ui, /name="ld-standard-reasoning"/);
  assert.match(ui, /data-ld-conclusion-choices/);
  assert.match(ui, /Conclusion choices · /);
  assert.match(ui, /ld-conclusion-locked/);
  assert.match(ui, /data-ld-submit-reasoning/);
  assert.match(ui, /state\.standardReasoningSubmitted = true/);
  assert.match(ui, /state\.standardReasoningSubmitted \? info\.conclusionOptions\.map/);
  assert.doesNotMatch(ui, /choices\.hidden = !hasReasoning/);
  assert.match(ui, /readonly aria-readonly="true"/);
  assert.match(ui, /Assess my answer/);
});

test('every registered investigation case has presentation metadata and three conclusion choices', () => {
  assert.equal(Object.keys(cases).length, 4);
  for (const [caseId, snapshot] of Object.entries(cases)) {
    assert.ok(snapshot.presentation, caseId + ' presentation metadata');
    assert.ok(['A1','A2','B1','B2','C1','C2'].includes(snapshot.presentation.cefr), caseId + ' CEFR');
    assert.equal(snapshot.presentation.conclusionOptions.length, 3, caseId + ' conclusion options');
    assert.ok(snapshot.presentation.questions.length >= 2, caseId + ' evidence checks');
  }
  assert.equal(cases['CASE-004'].presentation.cefr, 'A1');
  assert.equal(cases['CASE-004'].presentation.category, 'Everyday mystery');
  assert.match(ui, /fixtures\.cases\)\.map/);
});

test('Evidence checks test evidence boundaries rather than literal phrase matching', () => {
  const prompts = [
    'Which account stays within what Sara witnessed?',
    'Which statement about the person can the report support?',
    'Which claim is justified by the access record alone?',
    'How should Omar’s later observation be described?',
    'Which statement reports the instrument record without adding a cause?',
    'What limits the comparison with R-7?'
  ];
  for (const prompt of prompts) assert.ok(ui.includes(prompt), prompt);
  assert.doesNotMatch(ui, /What did Sara directly observe\\?/);
  assert.doesNotMatch(ui, /She recognized the resident’s face\\./);
});

test('Hell Mode keeps separate free-text Conclusion and Reasoning fields without conclusion choices', () => {
  assert.match(ui, /name="ld-conclusion"/);
  assert.match(ui, /name="ld-reasoning"/);
  assert.match(ui, /state\.answerFormat === 'HELL'/);
  assert.match(ui, /Two-part response/);
});

test('Standard mode assesses the selected conclusion together with the player reasoning', () => {
  const responses = [
    ['CASE-001',
      'An unidentified resident in a green jacket picked up the package; the resident’s identity remains unknown.',
      'Sara saw a resident wearing a green jacket pick up the package, but she did not see the person’s face. We do not know who the resident was or why.'],
    ['CASE-002',
      'The envelope was found in Room B, but the card log does not identify who used the card.',
      'Lena reported moving papers to Room B. The card log records that the card opened Room B, but it does not identify who used it or prove Lena moved the envelope.'],
    ['CASE-003',
      'R-4 recorded an unusual increase, but its cause remains unresolved; an external source or receiver fault is still possible.',
      'The recording is incomplete. An external source is possible, and a temporary R-4 fault is also possible. Neither explanation is confirmed.']
  ];
  for (const [caseId, conclusion, reasoning] of responses) {
    const result = assess(caseId, conclusion, reasoning);
    assert.equal(result.evaluation.primaryOutcome, 'ACCEPTED', caseId);
    assert.equal(result.evaluation.weightedScore, 100, caseId);
  }
});

test('a correct evidence explanation cannot rescue a conclusion that contradicts the record', () => {
  const result = assess(
    'CASE-001',
    'Nora took the package after she arrived.',
    'Sara did not see the resident’s face, so we cannot identify who picked up the package.'
  );
  assert.notEqual(result.evaluation.primaryOutcome, 'ACCEPTED');
});
