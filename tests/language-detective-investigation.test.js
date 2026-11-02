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
  assert.deepEqual(model.getAvailableEvidence(snapshot,started.session).map(item=>item.evidenceId),['E1']);
});

test('evidence is discovered only when available and can unlock through different investigation actions',()=>{
  const snapshot=sampleCase();
  let session=model.startSession(model.createSession(snapshot).session).session;
  const premature=model.discoverEvidence(snapshot,session,'E2');
  assert.equal(premature.ok,false);
  assert.equal(premature.error,'EVIDENCE_NOT_AVAILABLE');
  session=model.discoverEvidence(snapshot,session,'E1').session;
  assert.deepEqual(model.getAvailableEvidence(snapshot,session).map(item=>item.evidenceId),[]);
  const answer=model.askInterview(snapshot,session,'LINA','Q-TIME');
  assert.equal(answer.ok,true);
  session=answer.session;
  assert.equal(answer.answer,'I left after the train announcement.');
  assert.deepEqual(model.getAvailableEvidence(snapshot,session).map(item=>item.evidenceId),['E2']);
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
