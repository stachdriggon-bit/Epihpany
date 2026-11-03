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
  assert.equal(Object.keys(cases).length, 5);
  for (const [caseId, snapshot] of Object.entries(cases)) {
    assert.ok(snapshot.presentation, caseId + ' presentation metadata');
    assert.ok(['A1','A2','B1','B2','C1','C2'].includes(snapshot.presentation.cefr), caseId + ' CEFR');
    assert.equal(snapshot.presentation.conclusionOptions.length, 3, caseId + ' conclusion options');
    assert.ok(snapshot.presentation.questions.length >= 2, caseId + ' evidence checks');
  }
  assert.equal(cases['CASE-004'].presentation.cefr, 'A1');
  assert.equal(cases['CASE-004'].presentation.category, 'Everyday mystery');
  assert.equal(cases['CASE-004'].presentation.editorialId, 'LD-A1-002');
  assert.equal(cases['CASE-004'].presentation.status, 'IMPLEMENTED');
  assert.equal(cases['CASE-005'].presentation.cefr, 'A1');
  assert.equal(cases['CASE-005'].presentation.editorialId, 'LD-A1-003');
  assert.equal(cases['CASE-005'].presentation.status, 'IN_PROGRESS');
  assert.ok(ui.includes('Object.entries(fixtures.cases).map'));
});

test('CASEBOUND presents a case brief and requires an explicit Start Investigation action', () => {
  assert.match(ui, /CASEBOUND · EVERY CLUE HAS A STORY/);
  assert.match(ui, /function caseIntroduction\(\)/);
  assert.match(ui, /data-ld-start-investigation/);
  assert.match(ui, /state\.stage = 'case-intro'/);
  assert.match(ui, /caseIntroduction\(\)/);
});

test('case picker groups cases by authored CEFR and keeps evaluation level fixed',()=>{
 assert.ok(ui.includes("const CEFR_ORDER = ['A1','A2','B1','B2','C1','C2']"));
 assert.ok(ui.includes('data-ld-level-select'));
 assert.ok(ui.includes('state.selectedLevel'));
 assert.ok(ui.includes('ld-level-grid'));
 assert.ok(ui.includes('data-ld-level-back'));
 assert.ok(!ui.includes('data-ld-setting="cefr"'));
 assert.ok(!ui.includes('context.cefr = state.cefr'));
 assert.equal(makeContext('CASE-004').cefr,'A1');
 assert.equal(makeContext('CASE-001').cefr,'A2');
});
test('The Empty Seat is presented as a separate A1 everyday mystery',()=>{
 const item=cases['CASE-005'].presentation;
 assert.equal(item.title,'The Empty Seat');
 assert.equal(item.conclusionOptions.length,3);
 assert.match(item.focus,/independent library record/i);
 assert.ok(cases['CASE-005'].interviews.length);
});

test('The Blue Scarf preserves Standard and Hell answer contracts',()=>{
 const conclusion='The scarf is at the lost-property desk.';
 const reasoning='The cleaner found the scarf under the bench on Platform 2 and took the scarf to lost property. The silver star matches Mina’s scarf.';
 for(const format of ['STANDARD','HELL']){
  const result=assess('CASE-004',conclusion,reasoning,format);
  assert.equal(result.evaluation.primaryOutcome,'ACCEPTED');
  assert.equal(result.evaluation.weightedScore,100);
 }
});

test('Evidence checks test evidence boundaries rather than literal phrase matching', () => {
  const prompts = Object.values(cases).flatMap(snapshot => snapshot.presentation.questions.map(question => question.prompt));
  for (const prompt of [
    'Which account stays within what Sara witnessed?',
    'Which statement about the person can the report support?',
    'Which claim is justified by the access record alone?',
    'How should Omar’s later observation be described?',
    'Which statement reports the instrument record without adding a cause?',
    'What limits the comparison with R-7?',
    'Where did the cleaner find the scarf?',
    'What happened after the cleaner found the scarf?'
  ]) assert.ok(prompts.includes(prompt), prompt);
  assert.match(ui, /info\.questions\.map/);
  assert.ok(!ui.includes('What did Sara directly observe?'));
  assert.ok(!ui.includes('She recognized the resident’s face.'));
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

test('case picker requires a CEFR level selection before showing its cases',()=>{
 for(const level of ['A1','A2','B1','B2','C1','C2']) assert.ok(ui.includes(level + ' · '),level+' level label');
 assert.ok(ui.includes('data-ld-level-select'));
 assert.ok(ui.includes("filter(id => caseInfo[id].cefr === selectedLevel)"));
 assert.ok(ui.includes('data-ld-level-back'));
 assert.ok(ui.includes('There are no investigations at this level yet.'));
});

test('CASEBOUND workspace delegates evidence, interview, witness and notebook state to the session model',()=>{
  assert.match(ui,/EPIPHANY_CASEBOUND_INVESTIGATION/);
  assert.match(ui,/investigationModel\.createSession/);
  assert.match(ui,/investigationModel\.discoverEvidence/);
  assert.match(ui,/investigationModel\.askInterview/);
  assert.match(ui,/investigationModel\.selectWitness/);
  assert.match(ui,/investigationModel\.buildEvaluationSnapshot/);
  assert.match(ui,/investigationModel\.getNotebookEntries/);
  assert.match(ui,/data-ld-ask-interview/);
  assert.match(ui,/data-ld-select-witness/);
});

test('CASEBOUND workspace progressively reveals evidence and derives progress from discovered items', () => {
  assert.match(ui, /function investigation\(\)/);
  assert.match(ui, /state\.discoveredEvidence/);
  assert.match(ui, /data-ld-open-next/);
  assert.match(ui, /data-evidence-id=/);
  assert.match(ui, /aria-valuenow=/);
  assert.match(ui, /evidenceItems\.length \? Math\.round\(openedEvidence\.length \/ evidenceItems\.length \* 100\) : 100/);
  assert.match(ui, /Keep investigating before you conclude/);
  assert.match(ui, /state\.discoveredEvidence = \[\]/);
});

test('CASEBOUND notebook contains discovered evidence only and supports drawer accessibility', () => {
  assert.match(ui, /id="ld-case-notebook"/);
  assert.match(ui, /role="dialog" aria-modal="true"/);
  assert.match(ui, /openedEvidence\.map/);
  assert.match(ui, /Your notebook is empty/);
  assert.match(ui, /data-ld-notebook-open/);
  assert.match(ui, /data-ld-notebook-close/);
  assert.match(ui, /event\.key !== 'Escape'/);
  assert.match(ui, /aria-expanded/);
});

test('CASEBOUND centralises initial statements while interviews and witnesses follow available case data', () => {
  assert.match(ui, /Array\.isArray\(snapshot\.characters\) && snapshot\.characters\.length/);
  assert.match(ui, /selectedDossier = state\.selectedCharacterId \? investigationModel\.getCharacterDossier/);
  assert.match(ui, /selectedDossier && selectedDossier\.interview/);
  assert.match(ui, /visibleStatements = \(snapshot\.statements \|\| \[\]\)\.filter/);
  assert.match(ui, /visibleStatements\.map\(statement/);
  assert.match(ui, /Array\.isArray\(snapshot\.witnesses\) && snapshot\.witnesses\.length/);
  assert.doesNotMatch(ui, /No witnesses available/);
});
test('Guided evidence checks are optional and absent from other training modes', () => {
  assert.match(ui, /state\.trainingMode === 'GUIDED'/);
  assert.match(ui, /data-ld-toggle-checks/);
  assert.match(ui, /Optional practice/);
});


test('CASEBOUND shows the task and all available initial statements before character interviews',()=>{
  assert.match(ui,/ld-mission-panel/);
  assert.match(ui,/info\.focus/);
  assert.match(ui,/visibleStatements = \(snapshot\.statements \|\| \[\]\)\.filter/);
  assert.match(ui,/INITIAL ACCOUNTS/);
  assert.match(ui,/What everyone said/);
  assert.match(ui,/Who would you like to speak with\?/);
  assert.match(ui,/data-ld-select-character=/);
  assert.match(ui,/investigationModel\.getCharacterDossier/);
  assert.match(ui,/ld-conversation-prompts/);
  assert.match(ui,/selectedDossier\.interview\.availableQuestions\.map/);
  assert.doesNotMatch(ui,/Choose someone to review/);
});

test('CASEBOUND notebook renders distinct sections instead of one undifferentiated entry list',()=>{
  assert.match(ui,/investigationModel\.getNotebookSections/);
  assert.match(ui,/ld-notebook-section/);
  assert.match(ui,/section\.title/);
  assert.match(ui,/section\.description/);
});


test('CASEBOUND presents one investigation scene at a time with three clear stages', () => {
  assert.match(ui, /activeScene: 'people'/);
  assert.match(ui, /data-ld-scene=/);
  assert.match(ui, /aria-label="Investigation stages"/);
  assert.match(ui, /data-active-scene=/);
  assert.match(ui, /data-scene-panel="people"/);
  assert.match(ui, /data-scene-panel="evidence"/);
  assert.match(ui, /data-scene-panel="conclusion"/);
  assert.match(ui, /data-ld-scene-next/);
  assert.match(ui, /isConclusionReady\(fixtures\.cases\[state\.caseId\], state\.session\)/);
});


test('CASEBOUND keeps support and answer preferences inside compact settings and gates Hell Mode', () => {
  assert.match(ui, /ld-settings-disclosure/);
  assert.match(ui, /<summary><span aria-hidden="true">⚙<\/span> Settings<\/summary>/);
  assert.match(ui, /answerOptions = \[\['STANDARD','Standard'/);
  assert.match(ui, /if \(state\.completedCaseIds\.length\) answerOptions\.push\(\['HELL','Hell Mode'/);
  assert.match(ui, /completedCaseIds: \[\]/);
  assert.match(ui, /outcome === 'ACCEPTED'.*completedCaseIds\.push/);
});

test('CASEBOUND preserves the current reading position after workspace rerenders', () => {
  assert.match(ui, /const previousScrollY = window\.scrollY \|\| 0/);
  assert.match(ui, /window\.scrollTo\(\{top:previousScrollY,behavior:'auto'\}\)/);
});


test('CASEBOUND scene navigation uses native buttons and keeps the active scene explicit', () => {
  assert.match(ui, /class="ld-scene-step/);
  assert.match(ui, /aria-current="step"/);
  assert.match(ui, /state\.activeScene = scene/);
  assert.match(ui, /state\.activeScene = 'evidence'/);
  assert.match(ui, /state\.activeScene = 'conclusion'/);
});


test('CASE-005 statements, evidence and interviews expose contextual return links', () => {
  assert.match(ui, /case005Links = state\.caseId === 'CASE-005'/);
  assert.match(ui, /S-LINA.*E01.*E02/);
  assert.match(ui, /E04:\['S-LINA'\]/);
  assert.match(ui, /data-ld-source-evidence/);
  assert.match(ui, /data-ld-source-statement/);
  assert.match(ui, /data-ld-source-interview/);
  assert.match(ui, /data-evidence-id=/);
  assert.match(ui, /scrollIntoView/);
  assert.match(ui, /ld-statement-/);
  assert.match(ui, /ld-interview-/);
});

test('CASEBOUND contextual navigation preserves progressive evidence discovery', () => {
  assert.match(ui, /discoveredEvidenceForState/);
  assert.match(ui, /if \(!discoveredEvidenceForState\(id\)\) return/);
  assert.match(ui, /state\.activeScene = 'people'/);
  assert.match(ui, /state\.activeScene = 'evidence'/);
  assert.match(ui, /entry\.type === 'INTERVIEW'/);
  assert.match(ui, /entry\.type === 'STATEMENT'/);
});


test('CASEBOUND interviews render as a conversation with the original question and answer text', () => {
  assert.match(ui, /ld-conversation-thread/);
  assert.match(ui, /ld-chat-person/);
  assert.match(ui, /ld-chat-player/);
  assert.match(ui, /selectedInterviewSource\?\.questions\?\.find/);
  assert.match(ui, /selectedInitialStatement/);
  assert.match(ui, /ONE PER PERSON/);
  assert.match(ui, /data-ld-ask-interview/);
  assert.match(ui, /You have asked this person a question/);
});

test('CASEBOUND interview answers remain session-driven and return to the People scene', () => {
  assert.match(ui, /investigationModel\.askInterview/);
  assert.match(ui, /state\.activeScene = 'people'/);
  assert.match(ui, /Added to case notebook/);
  assert.match(ui, /ld-interview-/);
});


test('CASEBOUND people selection is presented as a focused interview contact roster', () => {
  assert.match(ui, /ld-contact-list/);
  assert.match(ui, /ld-contact-row/);
  assert.match(ui, /Available to question/);
  assert.match(ui, /Interview complete/);
  assert.match(ui, /Conversation open/);
  assert.match(ui, /data-ld-select-character/);
  assert.match(ui, /aria-pressed=/);
});


test('CASEBOUND Evidence scene separates examined records from statements and interview findings', () => {
  assert.match(ui, /ld-evidence-board/);
  assert.match(ui, /Records &amp; objects/);
  assert.match(ui, /People’s accounts/);
  assert.match(ui, /Initial statements/);
  assert.match(ui, /Interview notes/);
  assert.match(ui, /answer\.questionId/);
  assert.match(ui, /question\?\.prompt/);
  assert.match(ui, /item\.limitations/);
  assert.match(ui, /item\.scope/);
  assert.match(ui, /evidenceItems\.length - openedEvidence\.length/);
  assert.doesNotMatch(ui, /ld-evidence-ghost/);
});
