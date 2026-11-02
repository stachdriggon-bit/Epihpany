'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../language-detective-investigation');

function sampleCase() {
  return {
    caseId:'CASE-TEST',caseVersion:'1',schemaVersion:'1',
    characters:[{characterId:'LINA',name:'Lina'},{characterId:'NORA',name:'Nora'},{characterId:'WORKER',name:'Station worker'}],
    statements:[
      {statementId:'S-LINA',characterId:'LINA',name:'Lina',text:'I was at the station.'},
      {statementId:'S-NORA',characterId:'NORA',name:'Nora',text:'I saw a bag.'}
    ],
    evidence:[
      {evidenceId:'E1',role:'ESSENTIAL',summary:'A record shows the bag was left at the station.'},
      {evidenceId:'E2',role:'ESSENTIAL',summary:'A second record links the bag to a separate detail.',unlock:{requiresInterview:{characterId:'LINA',questionId:'Q-TIME'}}},
      {evidenceId:'E3',role:'OPTIONAL',summary:'A contextual note.'}
    ],
    interviews:[{
      interviewId:'INT-LINA',characterId:'LINA',questions:[
        {questionId:'Q-TIME',prompt:'When did you leave?',answer:'I left after the train announcement.',informationId:'INFO-LINA-TIME',evidenceIds:['E1']},
        {questionId:'Q-PLACE',prompt:'Where were you waiting?',answer:'I waited near the timetable.'}
      ]
    }],
    witnesses:[{witnessId:'W1',characterId:'WORKER',name:'Station worker',statement:'I found the bag.'},{witnessId:'W2',name:'Passenger',statement:'I saw the platform.'}],
    concepts:[
      {conceptId:'VISIBLE',predicate:'visible fact',evidenceRefs:['E1','E2'],patterns:[],acceptedVariants:[]},
      {conceptId:'HIDDEN',predicate:'hidden fact',evidenceRefs:['E2'],patterns:[],acceptedVariants:[]},
      {conceptId:'GENERAL',predicate:'unsupported assertion',evidenceRefs:[],patterns:[],acceptedVariants:[]}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['VISIBLE','HIDDEN']},
      {criterionId:'C2',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['GENERAL']}
    ],
    investigation:{conclusionPaths:[{evidenceIds:['E1','E2'],interviews:[{characterId:'LINA',questionId:'Q-TIME'}]}]}
  };
}

test('case validation checks optional investigation data and stable references',()=>{
  const snapshot=sampleCase();
  assert.deepEqual(model.validateInvestigation(snapshot),[]);
  snapshot.interviews[0].questions[0].evidenceIds=['MISSING'];
  assert.ok(model.validateInvestigation(snapshot).some(error=>error.code==='UNKNOWN_EVIDENCE'));
});

test('session begins with only initial statements and does not reveal evidence before start',()=>{
  const snapshot=sampleCase();
  const created=model.createSession(snapshot);
  assert.equal(created.ok,true);
  assert.equal(created.session.status,'BRIEF');
  assert.deepEqual(created.session.revealedStatementIds,['S-LINA','S-NORA']);
  assert.deepEqual(model.getAvailableEvidence(snapshot,created.session),[]);
  const started=model.startSession(created.session);
  assert.equal(started.ok,true);
  assert.deepEqual(model.getAvailableEvidence(snapshot,started.session).map(item=>item.evidenceId),['E1','E3']);
});

test('evidence is discovered only when available and can unlock through different investigation actions',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  const premature=model.discoverEvidence(snapshot,session,'E2');
  assert.equal(premature.ok,false);
  assert.equal(premature.error,'EVIDENCE_NOT_AVAILABLE');
  session=model.discoverEvidence(snapshot,session,'E1').session;
  assert.deepEqual(model.getAvailableEvidence(snapshot,session).map(item=>item.evidenceId),['E3']);
  const answer=model.askInterview(snapshot,session,'LINA','Q-TIME');
  assert.equal(answer.ok,true);
  session=answer.session;
  assert.equal(answer.answer,'I left after the train announcement.');
  assert.deepEqual(model.getAvailableEvidence(snapshot,session).map(item=>item.evidenceId),['E2','E3']);
  session=model.discoverEvidence(snapshot,session,'E2').session;
  assert.deepEqual(session.discoveredEvidenceIds,['E1','E2']);
});

test('interviews reveal one selected answer per character by default and preserve alternatives for other characters',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  assert.equal(model.getAvailableInterviews(snapshot,session).length,1);
  const answer=model.askInterview(snapshot,session,'LINA','Q-PLACE');
  assert.equal(answer.ok,true);
  assert.equal(model.getAvailableInterviews(snapshot,answer.session).length,0);
  const second=model.askInterview(snapshot,answer.session,'LINA','Q-TIME');
  assert.equal(second.ok,false);
  assert.equal(second.error,'INTERVIEW_LIMIT_REACHED');
  assert.deepEqual(model.getNotebookEntries(snapshot,answer.session).filter(item=>item.type==='INTERVIEW').map(item=>item.content),['I waited near the timetable.']);
});

test('one question per character is a hard rule, while other characters and the witness remain independent choices',()=>{
  const snapshot=sampleCase();
  snapshot.interviews.push(
    {interviewId:'INT-NORA',characterId:'NORA',questions:[{questionId:'Q-NORA',prompt:'What did you notice?',answer:'I noticed the station clock.'}]}
  );
  let session=model.startSession(model.createSession(snapshot).session).session;
  const lina=model.askInterview(snapshot,session,'LINA','Q-PLACE');
  assert.equal(lina.ok,true);
  session=lina.session;
  assert.equal(model.getAvailableInterviews(snapshot,session).some(item=>item.characterId==='LINA'),false);
  assert.equal(model.getAvailableInterviews(snapshot,session).some(item=>item.characterId==='NORA'),true);
  const nora=model.askInterview(snapshot,session,'NORA','Q-NORA');
  assert.equal(nora.ok,true);
  session=nora.session;
  assert.equal(model.getAvailableInterviews(snapshot,session).length,0);
  const witness=model.selectWitness(snapshot,session,'W2');
  assert.equal(witness.ok,true);
  session=witness.session;
  assert.equal(session.interviewResponses.length,2);
  assert.equal(session.selectedWitnessId,'W2');
  assert.equal(model.askInterview(snapshot,session,'LINA','Q-TIME').error,'INTERVIEW_LIMIT_REACHED');
  assert.equal(model.selectWitness(snapshot,session,'W1').error,'WITNESS_ALREADY_SELECTED');
});

test('interview configuration cannot raise the one-question-per-character limit',()=>{
  const snapshot=sampleCase();
  snapshot.interviews[0].maxQuestionsPerAttempt=2;
  assert.ok(model.validateInvestigation(snapshot).some(error=>error.code==='ONE_QUESTION_PER_CHARACTER'));
});

test('one witness can be selected and the notebook records only that selected witness',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  session=model.selectWitness(snapshot,session,'W2').session;
  const second=model.selectWitness(snapshot,session,'W1');
  assert.equal(second.ok,false);
  assert.equal(second.error,'WITNESS_ALREADY_SELECTED');
  const entries=model.getNotebookEntries(snapshot,session);
  assert.equal(entries.filter(item=>item.type==='WITNESS').length,1);
  assert.equal(entries.find(item=>item.type==='WITNESS').id,'W2');
});

test('conclusion readiness supports alternative authored paths rather than fixed stages',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  session=model.discoverEvidence(snapshot,session,'E1').session;
  assert.equal(model.isConclusionReady(snapshot,session).ready,false);
  session=model.askInterview(snapshot,session,'LINA','Q-TIME').session;
  session=model.discoverEvidence(snapshot,session,'E2').session;
  assert.equal(model.isConclusionReady(snapshot,session).ready,true);
  const simple=snapshot;
  delete simple.investigation;
  assert.equal(model.isConclusionReady(simple,session).ready,true);
});

test('evaluation snapshot excludes concepts that depend on undiscovered evidence and drops inaccessible rubric requirements',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  session=model.discoverEvidence(snapshot,session,'E1').session;
  const partial=model.buildEvaluationSnapshot(snapshot,session);
  assert.deepEqual(partial.evidence.map(item=>item.evidenceId),['E1']);
  assert.deepEqual(partial.concepts.map(item=>item.conceptId),['GENERAL']);
  assert.deepEqual(partial.criteria.map(item=>item.criterionId),['C2']);
  session=model.askInterview(snapshot,session,'LINA','Q-TIME').session;
  session=model.discoverEvidence(snapshot,session,'E2').session;
  const complete=model.buildEvaluationSnapshot(snapshot,session);
  assert.deepEqual(complete.concepts.map(item=>item.conceptId),['VISIBLE','HIDDEN','GENERAL']);
  assert.deepEqual(complete.criteria.map(item=>item.criterionId),['C1','C2']);
});

test('interview and witness knowledge can independently unlock assessment concepts',()=>{
  const snapshot=sampleCase();
  snapshot.concepts.push(
    {conceptId:'INTERVIEW_ONLY',predicate:'interview detail',evidenceRefs:[],informationRefs:['INFO-LINA-TIME'],patterns:[],acceptedVariants:[]},
    {conceptId:'WITNESS_ONLY',predicate:'witness detail',evidenceRefs:[],witnessRefs:['W2'],patterns:[],acceptedVariants:[]}
  );
  snapshot.criteria.push(
    {criterionId:'C3',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['INTERVIEW_ONLY']},
    {criterionId:'C4',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['WITNESS_ONLY']}
  );
  assert.deepEqual(model.validateInvestigation(snapshot),[]);
  let session=model.startSession(model.createSession(snapshot).session).session;
  let evaluation=model.buildEvaluationSnapshot(snapshot,session);
  assert.ok(!evaluation.concepts.some(item=>item.conceptId==='INTERVIEW_ONLY'));
  assert.ok(!evaluation.concepts.some(item=>item.conceptId==='WITNESS_ONLY'));
  session=model.askInterview(snapshot,session,'LINA','Q-TIME').session;
  evaluation=model.buildEvaluationSnapshot(snapshot,session);
  assert.ok(evaluation.concepts.some(item=>item.conceptId==='INTERVIEW_ONLY'));
  assert.ok(!evaluation.concepts.some(item=>item.conceptId==='WITNESS_ONLY'));
  session=model.selectWitness(snapshot,session,'W2').session;
  evaluation=model.buildEvaluationSnapshot(snapshot,session);
  assert.ok(evaluation.concepts.some(item=>item.conceptId==='WITNESS_ONLY'));
});

test('The Empty Seat has a reachable evidence path and keeps optional interview information reviewable',()=>{
 const snapshot=require('../language-detective-assessment-fixtures').cases['CASE-005'];
 assert.deepEqual(model.validateInvestigation(snapshot),[]);
 let session=model.startSession(model.createSession(snapshot).session).session;
 for(const evidenceId of ['E01','E02','E03','E04']) {
  const found=model.discoverEvidence(snapshot,session,evidenceId);
  assert.equal(found.ok,true,evidenceId);
  session=found.session;
 }
 assert.equal(model.isConclusionReady(snapshot,session).ready,true);
 const answer=model.askInterview(snapshot,session,'LINA','Q-LINA-BAG-LAST');
 assert.equal(answer.ok,true);
 session=answer.session;
 assert.ok(model.getNotebookEntries(snapshot,session).some(entry=>entry.type==='INTERVIEW'&&/timetable board/.test(entry.content)));
 const evaluation=model.buildEvaluationSnapshot(snapshot,session);
 assert.ok(evaluation.concepts.some(item=>item.conceptId==='BAG_BELONGS_LINA'));
 assert.ok(evaluation.concepts.some(item=>item.conceptId==='INFO-LINA-BAG-LAST'));
});

test('The Empty Seat offers exactly three approved questions per character and records only the selected answers',()=>{
 const snapshot=require('../language-detective-assessment-fixtures').cases['CASE-005'];
 assert.deepEqual(model.validateInvestigation(snapshot),[]);
 let session=model.startSession(model.createSession(snapshot).session).session;
 const available=model.getAvailableInterviews(snapshot,session);
 assert.deepEqual(available.map(item=>item.characterId),['LINA','OMAR','NORA']);
 assert.deepEqual(available.map(item=>item.questions.length),[3,3,3]);
 const lina=model.askInterview(snapshot,session,'LINA','Q-LINA-TIME');
 assert.equal(lina.ok,true);
 session=lina.session;
 assert.equal(model.getAvailableInterviews(snapshot,session).some(item=>item.characterId==='LINA'),false);
 assert.equal(model.getAvailableInterviews(snapshot,session).some(item=>item.characterId==='OMAR'),true);
 assert.equal(model.getAvailableInterviews(snapshot,session).some(item=>item.characterId==='NORA'),true);
 const omar=model.askInterview(snapshot,session,'OMAR','Q-OMAR-VIEW');
 assert.equal(omar.ok,true);
 session=omar.session;
 const nora=model.askInterview(snapshot,session,'NORA','Q-NORA-BAG');
 assert.equal(nora.ok,true);
 session=nora.session;
 assert.equal(session.interviewResponses.length,3);
 assert.equal(session.discoveredInformationIds.length,3);
 assert.equal(model.askInterview(snapshot,session,'LINA','Q-LINA-BOOK').error,'INTERVIEW_LIMIT_REACHED');
 assert.equal(model.askInterview(snapshot,session,'OMAR','Q-OMAR-LEFT').error,'INTERVIEW_LIMIT_REACHED');
 assert.equal(model.askInterview(snapshot,session,'NORA','Q-NORA-VIEW').error,'INTERVIEW_LIMIT_REACHED');
 const notebook=model.getNotebookEntries(snapshot,session).filter(item=>item.type==='INTERVIEW');
 assert.equal(notebook.length,3);
 assert.ok(notebook.some(item=>item.content.includes('8:17')));
 assert.ok(notebook.some(item=>item.content.includes('Not clearly')));
 assert.ok(notebook.some(item=>item.content.includes('did not see who left it')));
 const evaluation=model.buildEvaluationSnapshot(snapshot,session);
 for(const id of ['INFO-LINA-TIME','INFO-OMAR-VIEW','INFO-NORA-BAG']) assert.ok(evaluation.concepts.some(item=>item.conceptId===id));
 for(const id of ['INFO-LINA-BOOK','INFO-LINA-BAG-LAST','INFO-OMAR-LEFT','INFO-NORA-VIEW']) assert.ok(!evaluation.concepts.some(item=>item.conceptId===id));
});

test('progress reports independent discoveries without imposing a fixed stage count',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  session=model.discoverEvidence(snapshot,session,'E1').session;
  session=model.askInterview(snapshot,session,'LINA','Q-TIME').session;
  const progress=model.getProgress(snapshot,session);
  assert.equal(progress.discoveredEvidence,1);
  assert.equal(progress.totalEvidence,3);
  assert.equal(progress.interviewsAnswered,1);
  assert.equal(progress.witnessSelected,false);
  assert.equal(progress.activityCount,2);
});


test('character dossier exposes only that character’s revealed statements and interview state',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  const lina=model.getCharacterDossier(snapshot,session,'LINA');
  assert.ok(lina);
  assert.equal(lina.character.characterId,'LINA');
  assert.ok(lina.statements.every(item=>(item.characterId||item.speakerId)==='LINA'));
  assert.ok(lina.interview);
  assert.equal(lina.interview.availableQuestions.length,2);
  assert.ok(lina.interview.availableQuestions.some(item=>item.questionId==='Q-TIME'));
  const answer=model.askInterview(snapshot,session,'LINA','Q-TIME');
  const updated=model.getCharacterDossier(snapshot,answer.session,'LINA');
  assert.equal(updated.interview.answers.length,1);
  assert.equal(updated.interview.availableQuestions.length,0);
  assert.equal(model.getCharacterDossier(snapshot,session,'UNKNOWN'),null);
});

test('notebook sections group discoveries without losing the flat-entry compatibility API',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  session=model.discoverEvidence(snapshot,session,'E1').session;
  session=model.askInterview(snapshot,session,'LINA','Q-TIME').session;
  const sections=model.getNotebookSections(snapshot,session);
  assert.deepEqual(sections.map(section=>section.id),['EVIDENCE','STATEMENTS','INTERVIEWS']);
  assert.ok(sections.find(section=>section.id==='EVIDENCE').entries.some(entry=>entry.id==='E1'));
  assert.ok(model.getNotebookEntries(snapshot,session).some(entry=>entry.type==='INTERVIEW'));
});

test('CASE-005 reaches an accepted assessment in Standard and Hell without optional interviews',()=>{
  const {cases,makeContext}=require('../language-detective-assessment-fixtures');
  const engine=require('../language-detective-assessment-engine');
  const snapshot=cases['CASE-005'];
  let session=model.startSession(model.createSession(snapshot).session).session;
  for(const evidenceId of ['E01','E02','E03','E04']){
    const discovered=model.discoverEvidence(snapshot,session,evidenceId);
    assert.equal(discovered.ok,true,evidenceId);
    session=discovered.session;
  }
  assert.equal(model.isConclusionReady(snapshot,session).ready,true);
  assert.equal(session.interviewResponses.length,0);
  const evaluationSnapshot=model.buildEvaluationSnapshot(snapshot,session);
  assert.deepEqual(evaluationSnapshot.evidence.map(item=>item.evidenceId),['E01','E02','E03','E04']);
  assert.ok(evaluationSnapshot.concepts.some(item=>item.conceptId==='BAG_BELONGS_LINA'));
  assert.ok(evaluationSnapshot.concepts.some(item=>item.conceptId==='LIBRARY_LINK'));
  assert.ok(evaluationSnapshot.concepts.some(item=>item.conceptId==='OWNERSHIP_NOT_CERTAIN'));
  assert.ok(!evaluationSnapshot.concepts.some(item=>item.conceptId.startsWith('INFO-')));
  const response='Conclusion: The green canvas bag most likely belongs to Lina.\\nReasoning: The inventory lists a paperback book, a blue notebook and a red pencil case. Lina’s library record shows she borrowed the same paperback that morning. This is strong evidence, but it does not prove ownership with absolute certainty.';
  for(const format of ['STANDARD','HELL']){
    const result=engine.evaluate({
      context:{...makeContext('CASE-005','GUIDED',format),responseId:'casebound-full-path-'+format},
      caseSnapshot:evaluationSnapshot,
      response,
      hintsUsed:[]
    });
    assert.notEqual(result.status,'CONFIGURATION_ERROR',format);
    assert.equal(result.evaluation.primaryOutcome,'ACCEPTED',format);
  }
});
