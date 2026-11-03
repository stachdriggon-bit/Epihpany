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
 assert.equal(result.evaluation.primaryOutcome,'CONTRADICTION');
});

test('UNSUPPORTED and CONTRADICTION remain distinct assessment outcomes',()=>{
 const unsupported=engine.evaluate(request('CASE-004','The cleaner stole the scarf.'));
 const contradiction=engine.evaluate(request('CASE-003','R-4 recorded no unusual increase.'));
 assert.equal(unsupported.evaluation.primaryOutcome,'UNSUPPORTED');
 assert.equal(contradiction.evaluation.primaryOutcome,'CONTRADICTION');
 assert.equal(unsupported.evaluation.weightedScore,undefined);
 assert.equal(contradiction.evaluation.weightedScore,undefined);
 assert.ok(unsupported.claims.unsupportedMaterialClaims.length>0);
 assert.ok(contradiction.claims.materialContradictions.length>0);
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
test('a pronoun without a preceding antecedent requests clarification but impersonal it does not',()=>{
 const ambiguous=engine.evaluate(request('CASE-003','It caused the reading.'));
 assert.equal(ambiguous.evaluation.primaryOutcome,'NEEDS_CLARIFICATION');
 const impersonal=engine.evaluate(request('CASE-002','It is plausible that Lena moved the envelope.'));
 assert.notEqual(impersonal.evaluation.primaryOutcome,'NEEDS_CLARIFICATION');
});

test('a material unsupported claim alone is UNSUPPORTED, not partial',()=>{
 const theft=engine.evaluate(request('CASE-001','The resident stole it to keep it.'));
 assert.equal(theft.evaluation.primaryOutcome,'UNSUPPORTED');
 const overclaim=engine.evaluate(request('CASE-003','An external event definitely caused the increase.'));
 assert.equal(overclaim.evaluation.primaryOutcome,'UNSUPPORTED');
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

test('The Empty Seat accepts clear A1 wording and a minor tense error without changing meaning',()=>{
 const response="I think the green bag is Lina's. Lina borrow the same book that morning. We are not sure the bag is hers.";
 const result=engine.evaluate({context:{...makeContext('CASE-005','STEADY','HELL'),responseId:'empty-seat-a1-fairness'},caseSnapshot:cases['CASE-005'],response,hintsUsed:[]});
 assert.ok(result.interpreted.conceptMatches.some(item=>item.conceptId==='BAG_BELONGS_LINA'));
 assert.ok(result.interpreted.conceptMatches.some(item=>item.conceptId==='LIBRARY_LINK'));
 assert.ok(result.interpreted.conceptMatches.some(item=>item.conceptId==='OWNERSHIP_NOT_CERTAIN'));
 assert.equal(result.evaluation.primaryOutcome,'ACCEPTED');
 assert.equal(result.evaluation.weightedScore,100);
});


test('negative contractions cannot turn a denied fact into a supported positive claim',()=>{
 const ownership=engine.evaluate({context:{...makeContext('CASE-005','STEADY','HELL'),responseId:'empty-seat-negated-owner'},caseSnapshot:cases['CASE-005'],response:"The green bag isn't Lina's.",hintsUsed:[]});
 const owner=ownership.claims.findings.find(x=>x.conceptId==='BAG_BELONGS_LINA');
 // This wording is correctly rejected before a positive ownership finding is created.
 assert.equal(owner,undefined);

 assert.equal(ownership.evaluation.primaryOutcome,'UNSUPPORTED');
 const library=engine.evaluate({context:{...makeContext('CASE-005','STEADY','HELL'),responseId:'empty-seat-negated-library'},caseSnapshot:cases['CASE-005'],response:"Lina hasn't borrowed the paperback in the bag.",hintsUsed:[]});
 const link=library.claims.findings.find(x=>x.conceptId==='LIBRARY_LINK');
 assert.equal(link.state,'UNSUPPORTED');
 assert.equal(library.evaluation.primaryOutcome,'UNSUPPORTED');
});

test('a negated sentence does not erase a separate supported positive sentence',()=>{
 const response="The green bag probably belongs to Lina. Lina hasn't borrowed a different book.";
 const result=engine.evaluate({context:{...makeContext('CASE-005','STEADY','HELL'),responseId:'empty-seat-negation-scope'},caseSnapshot:cases['CASE-005'],response,hintsUsed:[]});
 assert.ok(result.interpreted.conceptMatches.some(x=>x.conceptId==='BAG_BELONGS_LINA'));
 assert.equal(result.claims.findings.find(x=>x.conceptId==='BAG_BELONGS_LINA').state,'SUPPORTED');
});

test('The Empty Seat is a valid A1 case and evaluates a multi-source ownership inference',()=>{
 const snapshot=cases['CASE-005'];
 assert.ok(snapshot);
 assert.equal(makeContext('CASE-005').cefr,'A1');
 assert.deepEqual(schemas.validateCaseSnapshot(snapshot),[]);
 const response='The green canvas bag most likely belongs to Lina. The inventory lists a paperback book, a blue notebook and a red pencil case. Lina’s library record shows she borrowed the same paperback that morning. This is strong evidence, but it does not prove ownership with absolute certainty.';
 const result=engine.evaluate({context:{...makeContext('CASE-005','STEADY','HELL'),responseId:'empty-seat-multi-source'},caseSnapshot:snapshot,response,hintsUsed:[]});
 assert.ok(result.interpreted.conceptMatches.some(item=>item.conceptId==='BAG_BELONGS_LINA'));
 assert.ok(result.interpreted.conceptMatches.some(item=>item.conceptId==='LIBRARY_LINK'));
 assert.ok(result.interpreted.conceptMatches.some(item=>item.conceptId==='OWNERSHIP_NOT_CERTAIN'));
 assert.equal(result.evaluation.primaryOutcome,'ACCEPTED');
});

test('The Blue Scarf is a valid A1 case and accepts clear simple paraphrases',()=>{
 const snapshot=cases['CASE-004'];
 assert.ok(snapshot);
 assert.equal(makeContext('CASE-004').cefr,'A1');
 assert.deepEqual(schemas.validateCaseSnapshot(snapshot),[]);
 const responses=[
  'Conclusion: The scarf is at the lost-property desk.\nReasoning: The cleaner found it under the bench on Platform 2 and took it to lost property. The silver star matches Mina’s scarf.',
  'Conclusion: The blue scarf is at the ticket desk with lost property.\nReasoning: A cleaner found a scarf under the bench and took the scarf to lost property. Mina’s scarf and the found scarf both have a small silver star.'
 ];
 for(const response of responses){
  const result=engine.evaluate({context:{...makeContext('CASE-004','STEADY','HELL'),responseId:'blue-scarf-'+responses.indexOf(response)},caseSnapshot:snapshot,response,hintsUsed:[]});
  assert.equal(result.evaluation.primaryOutcome,'ACCEPTED',JSON.stringify(result.claims?.findings||[]));
  assert.equal(result.evaluation.weightedScore,100);
 }
});

test('The Blue Scarf gives a fair partial grade when the correct location is stated without full evidence reasoning',()=>{
 const result=engine.evaluate({context:{...makeContext('CASE-004'),responseId:'blue-scarf-location-only'},caseSnapshot:cases['CASE-004'],response:'The scarf is at the lost-property desk.',hintsUsed:[]});
 assert.equal(result.evaluation.primaryOutcome,'PARTIAL');
 assert.ok(result.evaluation.weightedScore>=40,'a correct central conclusion must not receive an F solely because higher-level reasoning is absent');
 assert.equal(result.evaluation.awardedGrade,'D');
 assert.deepEqual(result.evaluation.dimensionResults.map(x=>x.dimension),['CONCLUSION_ACCURACY','EVIDENCE_REASONING']);
});

test('The Blue Scarf awards full credit for a simple A1 explanation of the transfer',()=>{
 const result=engine.evaluate({context:{...makeContext('CASE-004'),responseId:'blue-scarf-simple-explanation'},caseSnapshot:cases['CASE-004'],response:'The scarf is at the lost-property desk. The cleaner found it under the bench and took it to lost property.',hintsUsed:[]});
 assert.equal(result.evaluation.primaryOutcome,'ACCEPTED');
 assert.equal(result.evaluation.weightedScore,100);
});

test('The Blue Scarf distinguishes the discovery place from its current location',()=>{
 const result=engine.evaluate({context:{...makeContext('CASE-004'),responseId:'blue-scarf-bench-only'},caseSnapshot:cases['CASE-004'],response:'The scarf is under the bench.',hintsUsed:[]});
 assert.equal(result.evaluation.primaryOutcome,'PARTIAL');
});

test('The Blue Scarf does not accept an unsupported theft accusation',()=>{
 const result=engine.evaluate({context:{...makeContext('CASE-004'),responseId:'blue-scarf-theft'},caseSnapshot:cases['CASE-004'],response:'The cleaner stole the scarf.',hintsUsed:[]});
 assert.equal(result.evaluation.primaryOutcome,'UNSUPPORTED');
});

test('semantic operators preserve qualification without misclassifying it as factual negation',()=>{
 assert.equal(engine.polarity('This is not necessarily the cause.'),'AFFIRMED');
 assert.equal(engine.modality('This is not necessarily the cause.'),'UNCERTAIN');
 assert.equal(engine.polarity('The possibility cannot be ruled out.'),'AFFIRMED');
 assert.equal(engine.modality('The possibility cannot be ruled out.'),'POSSIBLE');
 assert.equal(engine.polarity('It is not only possible but likely.'),'AFFIRMED');
});

test('semantic scope is taken from the matched clause, not the first clause in the response',()=>{
 const response="The green bag probably belongs to Lina. Lina hasn't borrowed a different book.";
 const result=engine.evaluate({context:{...makeContext('CASE-005','STEADY','HELL'),responseId:'clause-scoped-negation'},caseSnapshot:cases['CASE-005'],response,hintsUsed:[]});
 const owner=result.claims.findings.find(x=>x.conceptId==='BAG_BELONGS_LINA');
 const library=result.claims.findings.find(x=>x.conceptId==='LIBRARY_LINK');
 assert.equal(owner.state,'SUPPORTED');
 assert.equal(library.state,'UNSUPPORTED');
 const ownerProp=result.interpreted.propositions.find(x=>x.conceptId==='BAG_BELONGS_LINA');
 const libraryProp=result.interpreted.propositions.find(x=>x.conceptId==='LIBRARY_LINK');
 assert.equal(ownerProp.polarity,'AFFIRMED');
 assert.equal(libraryProp.polarity,'NEGATED');
 assert.notEqual(ownerProp.clauseId,libraryProp.clauseId);
});

test('semantic modality is read from the complete matched clause',()=>{
 const response='An external source definitely caused the increase.';
 const result=engine.evaluate(request('CASE-003',response));
 const proposition=result.interpreted.propositions.find(x=>x.conceptId==='EXTERNAL_HYPOTHESIS');
 assert.ok(proposition);
 assert.equal(proposition.modality,'CERTAIN');
 assert.equal(result.claims.findings.find(x=>x.conceptId==='EXTERNAL_HYPOTHESIS').state,'OVERCLAIMED');
});

test('reported wording remains attributed instead of being rewritten as the learner own observation',()=>{
 const result=engine.evaluate(request('CASE-001','The report says an unidentified resident picked up the package.'));
 const proposition=result.interpreted.propositions.find(x=>x.conceptId==='PICKUP');
 assert.ok(proposition);
 assert.equal(proposition.source.kind,'UNRESOLVED_ATTRIBUTION');
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


test('fair A1 paraphrases are recognized across the first four cases without weakening evidence boundaries',()=>{
 const casesToCheck=[
  ['CASE-001','Someone in a green coat picked the package up. We do not know who it was or why.',['PICKUP','PACKAGE_PICKUP_EVENT','IDENTITY_UNKNOWN','MOTIVE_UNKNOWN']],
  ['CASE-002','The envelope ended up in Room B. Lena said she moved some documents. We cannot tell who used the card.',['ENVELOPE_ROOM_B','LENA_REPORTED_PAPERS','ACTOR_UNPROVEN']],
  ['CASE-003','The signal increased on R-4. Nobody knows what caused it.',['ANOMALY_RECORDED','CAUSE_UNRESOLVED']],
  ['CASE-004','The cleaner found it below the bench and handed it in to the lost-property desk.',['SCARF_FOUND','SCARF_TRANSFERRED']]
 ];
 for(const [caseId,response,expected] of casesToCheck){
  const result=engine.evaluate(request(caseId,response));
  for(const conceptId of expected)assert.ok(result.interpreted.conceptMatches.some(x=>x.conceptId===conceptId),caseId+' should recognize '+conceptId+'; matched='+JSON.stringify(result.interpreted.conceptMatches.map(x=>x.conceptId)));
 }
});


test('The envelope case does not confuse a credential event with proof that Lena physically used the card',()=>{
 const result=engine.evaluate(request('CASE-002','Lena used the card to open Room B.'));
 assert.ok(!result.interpreted.conceptMatches.some(x=>x.conceptId==='CARD_USED'));
 assert.equal(result.evaluation.primaryOutcome,'UNSUPPORTED');
});

test('The envelope case rejects a definite personal-movement claim when the evidence only makes it plausible',()=>{
 const result=engine.evaluate(request('CASE-002','Lena definitely moved the envelope.'));
 assert.ok(result.claims.findings.some(x=>x.conceptId==='LENA_TAKEN_AS_FACT'&&x.state==='UNSUPPORTED'));
 assert.equal(result.evaluation.primaryOutcome,'UNSUPPORTED');
});

test('The signal case does not turn a possible explanation into an established cause',()=>{
 const result=engine.evaluate(request('CASE-003','An external source definitely caused the signal.'));
 assert.ok(result.claims.findings.some(x=>x.conceptId==='EXTERNAL_HYPOTHESIS'&&x.state==='OVERCLAIMED'));
 assert.equal(result.evaluation.primaryOutcome,'UNSUPPORTED');
});


test('The Blue Scarf does not treat another object under the bench as the scarf',()=>{
 const response='The cleaner found a wallet under the bench. The scarf is at the ticket desk.';
 const result=engine.evaluate({context:{...makeContext('CASE-004'),responseId:'blue-scarf-wrong-object-found'},caseSnapshot:cases['CASE-004'],response,hintsUsed:[]});
 assert.ok(!result.interpreted.conceptMatches.some(x=>x.conceptId==='SCARF_FOUND'));
});

test('The Blue Scarf does not treat another object sent to lost property as the scarf',()=>{
 const response='The cleaner took a wallet to lost property. The scarf is at the ticket desk.';
 const result=engine.evaluate({context:{...makeContext('CASE-004'),responseId:'blue-scarf-wrong-object-transfer'},caseSnapshot:cases['CASE-004'],response,hintsUsed:[]});
 assert.ok(!result.interpreted.conceptMatches.some(x=>x.conceptId==='SCARF_TRANSFERRED'));
});
