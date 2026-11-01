'use strict';

const cases = {
  'CASE-001': {
    caseId:'CASE-001',caseVersion:'draft-1',schemaVersion:'1.0',
    evidence:[
      {evidenceId:'E01',role:'ESSENTIAL',summary:'Delivery record: package placed at reception at 10:05.',relation:'SUPPORTS',scope:'delivery and time',limitations:['Does not name a recipient or picker.']},
      {evidenceId:'E02',role:'ESSENTIAL',summary:'Sara saw an unidentified resident in a green jacket pick up the package at 10:12.',relation:'SUPPORTS',scope:'observed pickup',limitations:['Sara did not see the resident face.']},
      {evidenceId:'E03',role:'ESSENTIAL',summary:'Sara did not identify the resident.',relation:'SUPPORTS',scope:'identity remains unknown',limitations:['Does not establish motive.']},
      {evidenceId:'E04',role:'CONTEXTUAL',summary:'Nora arrived later and the package was absent.',relation:'CONTEXTUALIZES',scope:'later absence',limitations:['Does not identify the picker.']}
    ],
    concepts:[
      {conceptId:'PACKAGE_PICKUP_EVENT',predicate:'package was picked up by a resident',acceptedVariants:['a resident picked up the package','the package was picked up by a resident','a resident took the package'],patterns:[{patternId:'pe1',source:'resident.{0,25}(picked up|pick up|took|take|takes|taking|collected|collect|collects|collecting) (the )?package'},{patternId:'pe2',source:'package.{0,20}(was picked up|was taken|was collected) by a resident'}],evidenceRefs:['E02'],criterionIds:['C1','C2'],epistemicStatus:'REPORTED_OBSERVATION',materiality:'CENTRAL'},
      {conceptId:'PICKUP',predicate:'unidentified resident picked up package',acceptedVariants:['unidentified resident picked up the package','resident in a green jacket took the package','unknown resident collected the package'],patterns:[{patternId:'p1',source:'(unidentified|unknown) resident.{0,45}(picked up|took|collected) (the )?package'},{patternId:'p2',source:'resident.{0,35}(green jacket|green coat|green-jacketed).{0,30}(picked up|took|collected)'},{patternId:'p3',source:'package.{0,25}(was picked up|was taken|was collected).{0,25}(unidentified|unknown) resident'}],evidenceRefs:['E02'],criterionIds:['C1','C2'],epistemicStatus:'REPORTED_OBSERVATION',materiality:'CENTRAL'},
      {conceptId:'IDENTITY_UNKNOWN',predicate:'picker identity unknown',acceptedVariants:['we do not know who the resident was','the resident was not identified','their identity is unknown'],patterns:[{patternId:'i1',source:'(identity|who).{0,25}(unknown|unidentified|not known|not identified)'},{patternId:'i2',source:'(do not|don.t|cannot) know who',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E03'],criterionIds:['C1','C3'],materiality:'CENTRAL'},
      {conceptId:'MOTIVE_UNKNOWN',predicate:'motive unknown',acceptedVariants:['the motive is unknown','we do not know why'],patterns:[{patternId:'m1',source:'(motive|reason|why).{0,25}(unknown|unclear|not known|cannot be determined)'},{patternId:'m2',source:'do not know why',semanticPolarity:'AFFIRMED'},{patternId:'m3',source:'do not know who.{0,40}or why',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E03'],criterionIds:['C1','C3'],materiality:'MATERIAL'},
      {conceptId:'THEFT_ASSERTED',predicate:'theft asserted as fact',acceptedVariants:['the resident stole the package'],patterns:[{patternId:'t1',source:'(resident|person).{0,25}(stole|stolen|theft)'}],evidenceRefs:[],criterionIds:['C3'],materiality:'CENTRAL'}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['PACKAGE_PICKUP_EVENT','IDENTITY_UNKNOWN']},
      {criterionId:'C2',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['PACKAGE_PICKUP_EVENT']},
      {criterionId:'C3',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['MOTIVE_UNKNOWN']}
    ],feedbackResources:[]
  },
  'CASE-002': {
    caseId:'CASE-002',caseVersion:'draft-1',schemaVersion:'1.0',
    evidence:[
      {evidenceId:'E01',role:'ESSENTIAL',summary:'The envelope was found in Room B at 4:10.',relation:'SUPPORTS',scope:'later location',limitations:['Does not identify who moved it.']},
      {evidenceId:'E02',role:'ESSENTIAL',summary:'Lena reported moving a group of papers to Room B.',relation:'SUPPORTS',scope:'reported movement of papers',limitations:['She did not recall checking every sheet.']},
      {evidenceId:'E03',role:'ESSENTIAL',summary:'Lena card opened Room B.',relation:'SUPPORTS',scope:'credential access event',limitations:['Does not prove Lena physically used the card.']},
      {evidenceId:'E04',role:'ESSENTIAL',summary:'The card log does not identify the physical user.',relation:'SUPPORTS',scope:'actor uncertainty',limitations:['No actor identity is established.']},
      {evidenceId:'E05',role:'CONTEXTUAL',summary:'Lena moving the envelope is plausible but not established.',relation:'CONSISTENT_WITH',scope:'plausible movement hypothesis',limitations:['The record does not identify the person who moved the envelope.']}
    ],
    concepts:[
      {conceptId:'ENVELOPE_ROOM_B',predicate:'envelope found in Room B',acceptedVariants:['the envelope was found in Room B','the envelope ended up in Room B','they found the envelope in Room B'],patterns:[{patternId:'r1',source:'(envelope|missing envelope).{0,30}(found|located|was) .{0,12}Room B'},{patternId:'r2',source:'envelope.{0,25}(ended up|was taken) in Room B'}],evidenceRefs:['E01'],criterionIds:['C1'],materiality:'CENTRAL'},
      {conceptId:'LENA_REPORTED_PAPERS',predicate:'Lena reported moving papers',acceptedVariants:['Lena said she moved some papers','Lena reported moving papers'],patterns:[{patternId:'l1',source:'Lena.{0,35}(said|reported|stated).{0,35}(move|moved|moving).{0,20}(papers|documents)'}],evidenceRefs:['E02'],criterionIds:['C2'],materiality:'CENTRAL'},
      {conceptId:'CARD_USED',predicate:'Lena card was used',excludePatterns:['does not prove.{0,25}used the card','cannot prove.{0,25}used the card'],acceptedVariants:['Lena card was used to open Room B','her access card opened Room B'],patterns:[{patternId:'c1',source:'(Lena.s|her) (access )?card.{0,25}(used|opened|accessed) Room B'},{patternId:'c2',source:'card log.{0,30}(Room B|opened)'},{patternId:'c3',source:'(used|opened|accessed).{0,12}(the )?(access )?card'},{patternId:'c4',source:'the (access )?card was (used|swiped|presented)'}],evidenceRefs:['E03'],criterionIds:['C2'],materiality:'CENTRAL'},
      {conceptId:'ACTOR_UNPROVEN',predicate:'card user identity unproven',acceptedVariants:['the log does not prove Lena used the card','we cannot tell who used the card','the card user is unknown'],patterns:[{patternId:'a1',source:'(does not|doesn.t|cannot|can.t).{0,30}(prove|show|identify).{0,35}(Lena|who|user|she.{0,20}used)',semanticPolarity:'AFFIRMED'},{patternId:'a2',source:'(unknown|unclear).{0,20}(card user|who used the card)',semanticPolarity:'AFFIRMED'},{patternId:'a3',source:'user is unknown',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E04'],criterionIds:['C3'],materiality:'CENTRAL'},
      {conceptId:'LENA_POSSIBLE_MOVE',predicate:'Lena possibly moved the envelope',acceptedVariants:['Lena may have moved the envelope','it is plausible that Lena moved the envelope','Lena could have moved it'],patterns:[{patternId:'lm1',source:'Lena.{0,30}(may|might|could|possibly|plausibly).{0,25}(move|moved|have moved).{0,25}(envelope|it)'},{patternId:'lm2',source:'plausible.{0,20}Lena.{0,20}moved.{0,15}(envelope|it)'}],evidenceRefs:['E05'],criterionIds:['C3'],expectedModality:'POSSIBLE',materiality:'MATERIAL'},
      {conceptId:'LENA_TAKEN_AS_FACT',predicate:'Lena personally moved envelope as fact',acceptedVariants:['Lena definitely took the envelope'],patterns:[{patternId:'x1',source:'Lena.{0,25}(definitely|certainly|proved).{0,25}(took|moved).{0,20}envelope'}],evidenceRefs:[],criterionIds:['C3'],materiality:'CENTRAL'}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['ENVELOPE_ROOM_B']},
      {criterionId:'C2',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['LENA_REPORTED_PAPERS','CARD_USED']},
      {criterionId:'C3',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['ACTOR_UNPROVEN']}
    ],feedbackResources:[]
  },
  'CASE-003': {
    caseId:'CASE-003',caseVersion:'draft-1',schemaVersion:'1.0',
    evidence:[
      {evidenceId:'E01',role:'ESSENTIAL',summary:'R-4 recorded an unusual signal increase.',relation:'SUPPORTS',scope:'recorded anomaly',limitations:['The record is incomplete.']},
      {evidenceId:'E02',role:'ESSENTIAL',summary:'Analysts could not establish the cause.',relation:'SUPPORTS',scope:'cause remains unresolved',limitations:['Neither proposed cause is confirmed.']},
      {evidenceId:'E03',role:'ESSENTIAL',summary:'External source is a possible hypothesis.',relation:'CONSISTENT_WITH',scope:'possible external explanation',limitations:['No source identified.']},
      {evidenceId:'E04',role:'ESSENTIAL',summary:'Temporary receiver fault is a possible hypothesis.',relation:'CONSISTENT_WITH',scope:'possible equipment explanation',limitations:['No diagnostic test confirms a fault.']},
      {evidenceId:'E05',role:'CONTEXTUAL',summary:'R-7 differs in direction and sensitivity.',relation:'DOES_NOT_ESTABLISH',scope:'instrument comparison',limitations:['Not a direct control.']}
    ],
    concepts:[
      {conceptId:'ANOMALY_RECORDED',expectedPolarity:'AFFIRMED',predicate:'R-4 recorded unusual increase',acceptedVariants:['R-4 recorded an unusual increase','there was an unusual signal reading on R-4','R-4 registered an abnormal signal rise'],patterns:[{patternId:'s1',source:'R-4.{0,45}(recorded|registered|showed).{0,30}(unusual|abnormal|unexpected).{0,20}(increase|rise|reading)'},{patternId:'s2',source:'(unusual|abnormal) signal (increase|rise|reading).{0,25}R-4'},{patternId:'s3',source:'(reading|signal).{0,20}(is|was|remains) (unusual|abnormal)'},{patternId:'s4',source:'(reading|signal).{0,30}evidence of an anomaly'}],evidenceRefs:['E01'],criterionIds:['C1','C2'],epistemicStatus:'ESTABLISHED_FACT',materiality:'CENTRAL'},
      {conceptId:'CAUSE_UNRESOLVED',predicate:'cause remains unresolved',acceptedVariants:['the cause is unknown','we cannot establish what caused it','the source and cause remain unresolved'],patterns:[{patternId:'u1',source:'(cause|source).{0,30}(unknown|unresolved|unclear|not established|undetermined)'},{patternId:'u2',source:'cannot (establish|determine|identify).{0,25}(cause|source|what caused)',semanticPolarity:'AFFIRMED'},{patternId:'u3',source:'(cause|source).{0,30}cannot be established',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E02'],criterionIds:['C1','C3'],materiality:'CENTRAL'},
      {conceptId:'EXTERNAL_HYPOTHESIS',predicate:'external source is possible',acceptedVariants:['an external source may have caused it','an external source is possible'],patterns:[{patternId:'e1',source:'external (source|event).{0,35}(may|might|could|possible|plausible|definitely|certainly|proven|proved)'},{patternId:'e2',source:'(may|might|could) have come from an external'},{patternId:'e3',source:'external event.{0,25}(proven|proved|certainly caused)'}],evidenceRefs:['E03'],criterionIds:['C3'],expectedModality:'POSSIBLE',materiality:'MATERIAL'},
      {conceptId:'FAULT_HYPOTHESIS',predicate:'receiver fault is possible',acceptedVariants:['a receiver fault is possible','R-4 may have malfunctioned'],patterns:[{patternId:'f1',source:'(receiver fault|R-4 fault|malfunction).{0,30}(may|might|could|possible|plausible)'},{patternId:'f2',source:'R-4 may have (failed|malfunctioned|had a fault)'},{patternId:'f3',source:'R-4 may have had a fault'}],evidenceRefs:['E04'],criterionIds:['C3'],expectedModality:'POSSIBLE',materiality:'MATERIAL'},
      {conceptId:'R7_NOT_CONTROL',predicate:'R-7 is not a direct control',acceptedVariants:['R-7 is not a direct control','R-7 cannot be used as a direct comparison'],patterns:[{patternId:'r7',source:'R-7.{0,35}(not|cannot|can.t).{0,25}(direct control|valid comparison|direct comparison)',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E05'],criterionIds:['C2'],materiality:'MATERIAL'}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['ANOMALY_RECORDED','CAUSE_UNRESOLVED']},
      {criterionId:'C2',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['ANOMALY_RECORDED']},
      {criterionId:'C3',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['CAUSE_UNRESOLVED','EXTERNAL_HYPOTHESIS','FAULT_HYPOTHESIS']}
    ],feedbackResources:[]
  }
};

function makeContext(caseId,trainingMode='STEADY',answerFormat='HELL'){
 const c=cases[caseId];
 return {caseId,caseVersion:c.caseVersion,evaluatorVersion:'0.1.0',schemaVersion:c.schemaVersion,cefr:caseId==='CASE-001'?'A2':caseId==='CASE-002'?'B1':'C1',trainingMode,answerFormat,locale:'en',attemptId:'attempt-fixture',responseId:'response-fixture'};
}
function scenario(id,group,caseId,response,expectedOutcome,extra={}){
 return {scenarioId:id,group,caseId,context:makeContext(caseId,extra.trainingMode,extra.answerFormat),response,expectedOutcome,hintsUsed:extra.hintsUsed||[],rationale:extra.rationale||'Protects a documented assessment invariant.',expected:extra.expected||{}};
}
const fixtures=[];
const core=[
 ['CASE-001','An unidentified resident in a green jacket picked up the package. We do not know who they were or why.','ACCEPTED'],
 ['CASE-002','The envelope was found in Room B. Lena reported moving papers. Her card opened Room B, but that does not prove she personally used it.','ACCEPTED'],
 ['CASE-003','R-4 recorded an unusual increase, but the cause remains unknown. An external source or a receiver fault is possible.','ACCEPTED']
];
let n=0;
for(const [caseId,response,outcome] of core)for(const trainingMode of ['GUIDED','STEADY','CHALLENGE'])for(const answerFormat of ['STANDARD','HELL'])fixtures.push(scenario('CORE-'+String(++n).padStart(2,'0'),'core',caseId,response,outcome,{trainingMode,answerFormat}));
for(let i=0;i<9;i++){const [caseId,response,outcome]=core[i%3];fixtures.push(scenario('HINT-'+String(i+1).padStart(2,'0'),'hint',caseId,response,outcome,{hintsUsed:[['DIRECTION'],['CONNECTION'],['REASONING']][i%3]}));}
const retry=[
 ['CASE-001','A resident picked up the package.','PARTIAL'],
 ['CASE-001','An unidentified resident picked up the package; identity is unknown.','PARTIAL'],
 ['CASE-002','Lena took the envelope.','UNSUPPORTED'],
 ['CASE-002','Lena may have moved it, but this is unproven.','PARTIAL'],
 ['CASE-002','The card was used, but the user is unknown.','PARTIAL'],
 ['CASE-003','An external event definitely caused the increase.','PARTIAL'],
 ['CASE-003','The reading is unusual; the cause is unresolved.','PARTIAL'],
 ['CASE-003','R-4 may have had a fault, but this is not confirmed.','PARTIAL']
];
retry.forEach((x,i)=>fixtures.push(scenario('RETRY-'+String(i+1).padStart(2,'0'),'retry',...x)));
const ambiguity=[
 ['CASE-001','They took it after they saw them.','NEEDS_CLARIFICATION'],
 ['CASE-001','The resident picked up the package; the identity is unclear.','PARTIAL'],
 ['CASE-001','Sara saw the resident take the package.','PARTIAL'],
 ['CASE-002','She moved it after the room was opened.','NEEDS_CLARIFICATION'],
 ['CASE-002','Lena may have moved the envelope.','PARTIAL'],
 ['CASE-002','The card was used, so Lena was there.','PARTIAL'],
 ['CASE-003','It caused the reading.','NEEDS_CLARIFICATION'],
 ['CASE-003','The cause cannot be established.','PARTIAL'],
 ['CASE-003','The signal increased, but its source is unknown.','PARTIAL'],
 ['CASE-003','The external event certainly caused the anomaly.','PARTIAL']
];
ambiguity.forEach((x,i)=>fixtures.push(scenario('AMB-'+String(i+1).padStart(2,'0'),'ambiguity',...x)));
const mode=[
 ['CASE-001','An unidentified resident picked up the package.','ACCEPTED'],
 ['CASE-001','The package was picked up by an unidentified resident.','ACCEPTED'],
 ['CASE-002','Lena may have moved the envelope.','PARTIAL'],
 ['CASE-002','It is plausible that Lena moved the envelope.','PARTIAL'],
 ['CASE-003','R-4 registered an unusual rise; its cause remains undetermined.','PARTIAL'],
 ['CASE-003','The cause of the unusual R-4 reading cannot be established.','PARTIAL']
];
mode.forEach((x,i)=>fixtures.push(scenario('MODE-'+String(i+1).padStart(2,'0'),'mode',...x)));
const fairness=[
 ['CASE-001','A green-jacketed resident took the package; we cannot identify them.','PARTIAL'],
 ['CASE-001','The resident stole it to keep it.','PARTIAL'],
 ['CASE-002','The envelope was later located in Room B.','PARTIAL'],
 ['CASE-002','Omar lied about seeing the envelope.','UNSUPPORTED'],
 ['CASE-003','R-7 did not record the rise, so an external event is proven.','PARTIAL'],
 ['CASE-003','The reading is evidence of an anomaly, not proof of its cause.','PARTIAL']
];
fairness.forEach((x,i)=>fixtures.push(scenario('FAIR-'+String(i+1).padStart(2,'0'),'fairness',...x)));
if(fixtures.length!==57)throw new Error('Expected 57 fixtures, got '+fixtures.length);
module.exports={cases,fixtures,makeContext};
