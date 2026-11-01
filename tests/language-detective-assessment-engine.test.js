'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const schemas=require('../language-detective-assessment-schemas');
const cefr=require('../language-detective-cefr-patterns');
const engine=require('../language-detective-assessment-engine');
const {cases,fixtures,makeContext}=require('../language-detective-assessment-fixtures');

function request(caseId,response,overrides={}){
 const context=makeContext(caseId,overrides.trainingMode||'STEADY',overrides.answerFormat||'HELL');
 context.responseId=overrides.responseId||'test-response';
 return {context,caseSnapshot:cases[caseId],response,hintsUsed:overrides.hintsUsed||[]};
}

test('runtime context schema rejects missing identifiers and invalid CEFR values',()=>{
 assert.ok(schemas.validateEvaluationContext({caseId:'x',cefr:'C7'}).length>0);
 assert.equal(schemas.validateEvaluationContext(makeContext('CASE-001')).length,0);
});

test('case schema validates stable unique IDs and evidence references',()=>{
 assert.equal(schemas.validateCaseSnapshot(cases['CASE-001']).length,0);
 const broken=structuredClone(cases['CASE-001']);broken.concepts[0].evidenceRefs=['MISSING'];
 assert.ok(schemas.validateCaseSnapshot(broken).some(x=>x.code==='UNKNOWN_EVIDENCE'));
 const invalid=structuredClone(cases['CASE-001']);invalid.concepts[0].patterns[0].source='(';assert.ok(schemas.validateCaseSnapshot(invalid).some(x=>x.code==='INVALID_PATTERN'));
});

test('all six CEFR profiles define operators and feedback register without changing scoring',()=>{
 for(const level of cefr.CEFR_ORDER){const p=cefr.getCefrProfile(level);assert.ok(p);assert.ok(p.negation.length);assert.ok(p.modality.length);assert.ok(p.feedbackRegister);assert.ok(cefr.CEFR_CONSTRUCTION_PATTERNS[level].length);for(const item of cefr.CEFR_CONSTRUCTION_PATTERNS[level])assert.doesNotThrow(()=>new RegExp(item.pattern));}
 assert.equal(engine.DIMENSION_WEIGHTS.CONCLUSION_ACCURACY,35);
});

test('normalizer preserves negation, uncertainty, attribution and causal markers',()=>{
 const result=engine.normalizeText('The report indicates R-4 may not have failed because the record is incomplete.');
 assert.match(result.normalizedText,/may not/i);
 assert.match(result.normalizedText,/because/i);
 assert.ok(result.clauses[0].operators.negation.length);
 assert.ok(result.clauses[0].operators.modality.length);
 assert.ok(result.clauses[0].operators.attribution.length);
});

test('SemanticMatcher recognizes a supported paraphrase and does not collapse witness into actor',()=>{
 const good=engine.evaluate(request('CASE-001','An unknown resident in a green jacket collected the package. We cannot identify them.'));
 assert.ok(good.modules);
 assert.ok(good.interpreted.conceptMatches.some(x=>x.conceptId==='PICKUP'));
 const trap=engine.evaluate(request('CASE-001','Sara picked up the package because she saw the resident.'));
 assert.ok(!trap.interpreted.conceptMatches.some(x=>x.conceptId==='PICKUP'));
});

test('evidence reasoning keeps credential use separate from the physical actor',()=>{
 const result=engine.evaluate(request('CASE-002','Lena may have moved the envelope, but the card log does not prove she used the card.'));
 assert.ok(result.modules);
 const card= result.evidence.propositionAssessments.find(x=>x.conceptId==='CARD_USED');
 assert.equal(card,undefined,'The engine must not infer card use from a denial that the log proves Lena used it.');
});


test('negation changes the proposition outcome instead of being discarded as wording',()=>{
 const result=engine.evaluate(request('CASE-003','R-4 recorded no unusual increase.'));
 const anomaly=result.evidence.propositionAssessments.find(x=>x.conceptId==='ANOMALY_RECORDED');
 assert.equal(anomaly.supportState,'CONTRADICTED');
 assert.ok(result.claims.materialContradictions.some(x=>x.conceptId==='ANOMALY_RECORDED'));
});

test('C1 causal uncertainty is not upgraded to a confirmed external event',()=>{
 const result=engine.evaluate(request('CASE-003','R-4 recorded an unusual increase, but the cause remains unresolved. An external source is possible.'));
 assert.ok(result.modules);
 const cause=result.interpreted.propositions.find(x=>x.conceptId==='CAUSE_UNRESOLVED');
 assert.ok(cause);
 const external=result.interpreted.propositions.find(x=>x.conceptId==='EXTERNAL_HYPOTHESIS');
 assert.ok(external);
 assert.equal(external.modality,'POSSIBLE');
});


test('different English constructions can express the same supported event',()=>{
 const active=engine.evaluate(request('CASE-001','An unidentified resident picked up the package.'));
 const passive=engine.evaluate(request('CASE-001','The package was picked up by an unidentified resident.'));
 assert.ok(active.interpreted.conceptMatches.some(x=>x.conceptId==='PICKUP'));
 assert.ok(passive.interpreted.conceptMatches.some(x=>x.conceptId==='PICKUP'));
});
test('unresolved pronouns trigger a focused clarification state',()=>{
 const result=engine.evaluate(request('CASE-002','She moved it after the room was opened.'));
 assert.equal(result.evaluation.primaryOutcome,'NEEDS_CLARIFICATION');
 assert.equal(result.evaluation.awardedGrade,undefined);
});
test('Standard and Hell Mode converge on the same academic result for equivalent meaning',()=>{
 const response='An unidentified resident in a green jacket picked up the package. We do not know who they were or why.';
 const standard=engine.evaluate(request('CASE-001',response,{answerFormat:'STANDARD'}));
 const hell=engine.evaluate(request('CASE-001',response,{answerFormat:'HELL'}));
 assert.deepEqual(standard.evaluation.criterionResults,hell.evaluation.criterionResults);
 assert.deepEqual(standard.evaluation.dimensionResults,hell.evaluation.dimensionResults);
});

test('hint use changes Independence only, not academic criterion or dimension scores',()=>{
 const plain=engine.evaluate(request('CASE-001','An unidentified resident in a green jacket picked up the package. We do not know who they were or why.'));
 const assisted=engine.evaluate(request('CASE-001','An unidentified resident in a green jacket picked up the package. We do not know who they were or why.',{hintsUsed:['REASONING']}));
 assert.deepEqual(plain.evaluation.criterionResults,assisted.evaluation.criterionResults);
 assert.deepEqual(plain.evaluation.dimensionResults,assisted.evaluation.dimensionResults);
 assert.equal(plain.evaluation.independence,'HIGH');
 assert.equal(assisted.evaluation.independence,'ASSISTED');
});

test('Guided grade cap does not alter the numeric score',()=>{
 const response='An unidentified resident in a green jacket picked up the package. We do not know who they were or why.';
 const guided=engine.evaluate(request('CASE-001',response,{trainingMode:'GUIDED'}));
 const steady=engine.evaluate(request('CASE-001',response,{trainingMode:'STEADY'}));
 assert.equal(guided.evaluation.weightedScore,steady.evaluation.weightedScore);
 assert.notEqual(guided.evaluation.awardedGrade,'S');
});

test('same versioned request produces deterministic semantic output',()=>{
 const req=request('CASE-001','An unidentified resident picked up the package; their identity is unknown.');
 const a=engine.evaluate(req),b=engine.evaluate(req);
 assert.deepEqual(a,b);
});

test('all 57 approved simulation entries are represented as executable fixture records',()=>{
 assert.equal(fixtures.length,57);
 assert.equal(new Set(fixtures.map(x=>x.scenarioId)).size,57);
 for(const fixture of fixtures){
  assert.ok(fixture.context.caseId);
  assert.ok(fixture.response);
  assert.ok(['ACCEPTED','PARTIAL','NEEDS_CLARIFICATION','UNSUPPORTED','CONTRADICTION'].includes(fixture.expectedOutcome));
  assert.ok(cases[fixture.caseId]);
 }
});

test('all 57 fixtures pass request validation and traverse the pipeline without schema crashes',()=>{
 const outcomes=[];
 for(const fixture of fixtures){
  const result=engine.evaluate({context:{...fixture.context,responseId:fixture.scenarioId},caseSnapshot:cases[fixture.caseId],response:fixture.response,hintsUsed:fixture.hintsUsed});
  assert.notEqual(result.status,'CONFIGURATION_ERROR',fixture.scenarioId+': '+JSON.stringify(result.errors||[]));
  outcomes.push(result.status);
  assert.equal(result.evaluation.primaryOutcome,fixture.expectedOutcome,fixture.scenarioId+' expected '+fixture.expectedOutcome+' but received '+result.evaluation.primaryOutcome+'; diagnostics='+JSON.stringify(result.claims?.findings||[]));
 }
 assert.equal(outcomes.length,57);
});

test('module-level pipeline exposes all six independently testable stages',()=>{
 const result=engine.evaluate(request('CASE-001','An unidentified resident picked up the package. Their identity is unknown.'));
 assert.deepEqual(result.modules.map(x=>x.moduleName),['TextNormalizer','SemanticMatcher','EvidenceReasoner','ClaimValidator','EvaluationResolver','FeedbackBuilder']);
 for(const module of result.modules)assert.deepEqual(schemas.validateModuleEnvelope(module),[]);
});

test('version mismatch fails closed before evaluation',()=>{
 const req=request('CASE-001','An unidentified resident picked up the package.');
 req.context.caseVersion='draft-2';
 assert.equal(engine.evaluate(req).status,'CONFIGURATION_ERROR');
});
