(() => {
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
      {conceptId:'PICKUP',predicate:'unidentified resident picked up package',acceptedVariants:['unidentified resident picked up the package','resident in a green jacket took the package','unknown resident collected the package'],patterns:[{patternId:'p1',source:'(unidentified|unknown) resident.{0,45}(picked up|took|collected) (the )?package'},{patternId:'p2',source:'resident.{0,35}(green jacket|green coat|green-jacketed).{0,30}(picked up|took|collected)'},{patternId:'p3',source:'package.{0,25}(was picked up|was taken|was collected).{0,25}(unidentified|unknown) resident'},{patternId:'p4',source:'green-jacketed resident.{0,25}(picked up|took|collected) (the )?package'}],evidenceRefs:['E02'],criterionIds:['C1','C2'],epistemicStatus:'REPORTED_OBSERVATION',materiality:'CENTRAL'},
      {conceptId:'IDENTITY_UNKNOWN',predicate:'picker identity unknown',acceptedVariants:['we do not know who the resident was','the resident was not identified','their identity is unknown'],patterns:[{patternId:'i1',source:'(identity|who).{0,25}(unknown|unidentified|not known|not identified)'},{patternId:'i2',source:'(do not|don.t|cannot) know who',semanticPolarity:'AFFIRMED'},{patternId:'i3',source:'(cannot|can.t|could not|unable to) identify (the )?(resident|person|picker|them)',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E03'],criterionIds:['C1','C3'],materiality:'CENTRAL'},
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
      {conceptId:'CAUSE_UNRESOLVED',predicate:'cause remains unresolved',acceptedVariants:['the cause is unknown','we cannot establish what caused it','the source and cause remain unresolved'],patterns:[{patternId:'u1',source:'(cause|source).{0,30}(unknown|unresolved|unclear|not established|undetermined)'},{patternId:'u2',source:'cannot (establish|determine|identify).{0,25}(cause|source|what caused)',semanticPolarity:'AFFIRMED'},{patternId:'u3',source:'(cause|source).{0,30}cannot be established',semanticPolarity:'AFFIRMED'},{patternId:'u4',source:'(not proof of|does not establish|cannot prove).{0,20}(the )?(cause|source)',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E02'],criterionIds:['C1','C3'],materiality:'CENTRAL'},
      {conceptId:'EXTERNAL_HYPOTHESIS',predicate:'external source is possible',acceptedVariants:['an external source may have caused it','an external source is possible'],patterns:[{patternId:'e1',source:'external (source|event).{0,35}(may|might|could|possible|plausible|definitely|certainly|proven|proved)'},{patternId:'e2',source:'(may|might|could) have come from an external'},{patternId:'e3',source:'external event.{0,25}(proven|proved|certainly caused)'}],evidenceRefs:['E03'],criterionIds:['C3'],expectedModality:'POSSIBLE',materiality:'MATERIAL'},
      {conceptId:'FAULT_HYPOTHESIS',predicate:'receiver fault is possible',acceptedVariants:['a receiver fault is possible','R-4 may have malfunctioned'],patterns:[{patternId:'f1',source:'(receiver fault|R-4 fault|malfunction).{0,30}(may|might|could|possible|plausible)'},{patternId:'f2',source:'R-4 may have (failed|malfunctioned|had a fault)'},{patternId:'f3',source:'R-4 may have had a fault'}],evidenceRefs:['E04'],criterionIds:['C3'],expectedModality:'POSSIBLE',materiality:'MATERIAL'},
      {conceptId:'R7_NOT_CONTROL',predicate:'R-7 is not a direct control',acceptedVariants:['R-7 is not a direct control','R-7 cannot be used as a direct comparison'],patterns:[{patternId:'r7',source:'R-7.{0,35}(not|cannot|can.t).{0,25}(direct control|valid comparison|direct comparison)',semanticPolarity:'AFFIRMED'}],evidenceRefs:['E05'],criterionIds:['C2'],materiality:'MATERIAL'}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['ANOMALY_RECORDED','CAUSE_UNRESOLVED']},
      {criterionId:'C2',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['ANOMALY_RECORDED']},
      {criterionId:'C3',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['CAUSE_UNRESOLVED','EXTERNAL_HYPOTHESIS','FAULT_HYPOTHESIS']}
    ],feedbackResources:[]
  },
  'CASE-004': {
    caseId:'CASE-004',caseVersion:'draft-1',schemaVersion:'1.0',
    evidence:[
      {evidenceId:'E01',role:'ESSENTIAL',summary:'Mina says she had a blue scarf with a small silver star when she sat on the bench at Platform 2. It was missing when she boarded her train.',relation:'SUPPORTS',scope:'scarf description and last known possession',limitations:['Mina did not see where the scarf fell.']},
      {evidenceId:'E02',role:'ESSENTIAL',summary:'A cleaner found a blue scarf with a small silver star under the Platform 2 bench at 8:20 and took it to the lost-property desk.',relation:'SUPPORTS',scope:'matching scarf found and transferred',limitations:['The note does not name the owner.']},
      {evidenceId:'E03',role:'ESSENTIAL',summary:'At 8:25 the station list recorded one blue scarf with a small silver star received from Platform 2.',relation:'SUPPORTS',scope:'matching item received by lost property',limitations:['The list records the item, not the owner.']},
      {evidenceId:'E04',role:'ESSENTIAL',summary:'A station notice says lost property is kept at the ticket desk.',relation:'SUPPORTS',scope:'where lost property is kept',limitations:['The notice does not identify any particular lost item.']}
    ],
    concepts:[
      {conceptId:'SCARF_AT_DESK',predicate:'Mina scarf is at the lost-property or ticket desk',acceptedVariants:['the scarf is at the lost-property desk','the scarf is at the ticket desk','the scarf is with lost property','the station has the scarf at lost property'],patterns:[{patternId:'sd1',source:'scarf.{0,45}(at|in|with).{0,25}(lost.property|ticket desk)'},{patternId:'sd2',source:'(lost.property|ticket desk).{0,25}scarf'},{patternId:'sd3',source:'scarf.{0,20}(is|stays|remains).{0,15}(at|in).{0,15}(desk|lost property)'}],evidenceRefs:['E02','E03','E04'],criterionIds:['C1'],epistemicStatus:'ESTABLISHED_FACT',materiality:'CENTRAL'},
      {conceptId:'SCARF_FOUND',predicate:'matching scarf was found under the Platform 2 bench',acceptedVariants:['the cleaner found it under the bench','the scarf was found under the Platform 2 bench'],patterns:[{patternId:'sf1',source:'found.{0,25}(under|beneath).{0,18}bench'},{patternId:'sf2',source:'scarf.{0,35}(under|beneath).{0,18}bench'},{patternId:'sf3',source:'cleaner.{0,35}found'}],evidenceRefs:['E02'],criterionIds:['C2'],epistemicStatus:'REPORTED_OBSERVATION',materiality:'CENTRAL'},
      {conceptId:'SCARF_TRANSFERRED',predicate:'cleaner took the scarf to lost property',acceptedVariants:['the cleaner took it to lost property','the scarf was moved to the ticket desk','it was taken to the lost-property desk'],patterns:[{patternId:'st1',source:'(took|moved|brought).{0,35}(to )?(lost.property|ticket desk)'},{patternId:'st2',source:'(lost.property|ticket desk).{0,25}(received|has) the scarf'}],evidenceRefs:['E02','E03'],criterionIds:['C2'],epistemicStatus:'REPORTED_OBSERVATION',materiality:'CENTRAL'},
      {conceptId:'SCARF_MATCH',predicate:'the records describe the same scarf by its silver star',acceptedVariants:['the silver star matches Mina scarf','all records describe a scarf with a small silver star'],patterns:[{patternId:'sm1',source:'silver star'},{patternId:'sm2',source:'same scarf'}],evidenceRefs:['E01','E02','E03'],criterionIds:['C3'],epistemicStatus:'INFERENCE',materiality:'CENTRAL'},
      {conceptId:'SCARF_STOLEN',predicate:'the scarf was stolen',excludePatterns:['did not steal','was not stolen','no theft'],acceptedVariants:[],patterns:[{patternId:'ss1',source:'(cleaner|someone|person).{0,25}(stole|stolen).{0,15}(scarf|it)'},{patternId:'ss2',source:'(stole|stolen).{0,15}(the )?scarf'}],evidenceRefs:[],criterionIds:['C3'],epistemicStatus:'LEARNER_ASSERTION',materiality:'CENTRAL'}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['SCARF_AT_DESK']},
      {criterionId:'C2',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['SCARF_FOUND','SCARF_TRANSFERRED']}
    ],feedbackResources:[],
    presentation:null
  },
  'CASE-005': {
    caseId:'CASE-005',caseVersion:'draft-1',schemaVersion:'1.0',
    characters:[
      {characterId:'LINA',name:'Lina',role:'Passenger and claimant'},
      {characterId:'OMAR',name:'Omar',role:'Passenger and claimant'},
      {characterId:'NORA',name:'Nora',role:'Passenger and claimant'}
    ],
    statements:[
      {statementId:'S-LINA',characterId:'LINA',name:'Lina',text:'I waited near the timetable board. I had a green canvas bag, but I cannot remember where I put it.'},
      {statementId:'S-OMAR',characterId:'OMAR',name:'Omar',text:'I sat by the window. My bag is a black backpack with a laptop inside.'},
      {statementId:'S-NORA',characterId:'NORA',name:'Nora',text:'I waited near the door. I had a blue shopping bag with a scarf inside.'}
    ],
    evidence:[
      {evidenceId:'E01',role:'ESSENTIAL',title:'Waiting-room seating log',summary:'The station seating log places Lina at the bench beside the timetable board before 8:15. Omar was by the window and Nora was near the door.',relation:'SUPPORTS',scope:'where each passenger waited',limitations:['The log records seats, not ownership of any bag.']},
      {evidenceId:'E02',role:'ESSENTIAL',title:'Found-property report',summary:'At 8:32 a green canvas bag was found beside the bench near the timetable board. The report does not name its owner.',relation:'SUPPORTS',scope:'bag description and last recorded location',limitations:['The finder did not see who left the bag.']},
      {evidenceId:'E03',role:'ESSENTIAL',title:'Bag inventory',summary:'The green canvas bag contained a paperback book, a blue notebook and a red pencil case.',relation:'SUPPORTS',scope:'three items inside the bag',limitations:['The inventory does not identify the owner.']},
      {evidenceId:'E04',role:'ESSENTIAL',title:'Library borrowing record',summary:'The library record shows that Lina borrowed the same paperback book that morning.',relation:'SUPPORTS',scope:'independent link between Lina and one item in the bag',limitations:['The record does not prove that Lina owned the bag or the other items.']},
      {evidenceId:'E05',role:'OPTIONAL',title:'Kiosk receipt',summary:'A receipt records Lina buying tea at the station kiosk at 8:17.',relation:'CONTEXTUALIZES',scope:'Lina was away from the waiting room briefly',limitations:['The receipt does not show where her bag was or who owned it.'],requiredForConclusion:false}
    ],
    interviews:[{
      interviewId:'INT-LINA',characterId:'LINA',name:'Lina',
      questions:[{
        questionId:'Q-BAG-CONTENTS',prompt:'What was inside your green bag?',
        answer:'I had a paperback book, a blue notebook and a red pencil case inside it.',
        informationId:'INFO-LINA-CONTENTS',evidenceIds:['E03']
      }]
    }],
    concepts:[
      {conceptId:'BAG_BELONGS_LINA',predicate:'Lina is the best-supported owner of the green bag',acceptedVariants:['the bag most likely belongs to Lina','Lina is the best-supported owner','the green bag is probably Lina’s'],patterns:[{patternId:'owner1',source:'bag.{0,30}(belongs to Lina|is Lina.s)'},{patternId:'owner2',source:'Lina.{0,35}(owner|bag belongs|most likely owns|most likely owner)'},{patternId:'owner3',source:'(probably|most likely).{0,20}Lina.{0,20}(bag|owner)'}],evidenceRefs:['E01','E02','E03','E04'],informationRefs:['INFO-LINA-CONTENTS'],criterionIds:['C1'],epistemicStatus:'INFERENCE',materiality:'CENTRAL'},
      {conceptId:'BAG_CONTENTS_MATCH',predicate:'the inventory matches Lina’s account of the contents',acceptedVariants:['the contents match Lina’s description','the bag had the same three items Lina described'],patterns:[{patternId:'contents1',source:'(paperback|book).{0,55}blue notebook.{0,40}red pencil case'},{patternId:'contents2',source:'three items.{0,35}(match|same as).{0,25}Lina'},{patternId:'contents3',source:'blue notebook.{0,40}red pencil case'}],evidenceRefs:['E03'],informationRefs:['INFO-LINA-CONTENTS'],criterionIds:['C2'],epistemicStatus:'INFERENCE',materiality:'CENTRAL'},
      {conceptId:'LIBRARY_LINK',predicate:'Lina borrowed the paperback found in the bag',acceptedVariants:['Lina borrowed the same book that morning','the library record links Lina to the paperback'],patterns:[{patternId:'library1',source:'Lina.{0,35}(borrowed|checked out).{0,30}(same )?(paperback|book)'},{patternId:'library2',source:'library record.{0,35}Lina.{0,35}(book|paperback)'},{patternId:'library3',source:'(paperback|book).{0,35}(borrowed|checked out).{0,25}Lina'}],evidenceRefs:['E04'],criterionIds:['C2'],epistemicStatus:'ESTABLISHED_FACT',materiality:'CENTRAL'},
      {conceptId:'OWNERSHIP_NOT_CERTAIN',predicate:'the records support but do not absolutely prove ownership',acceptedVariants:['ownership is not proved with absolute certainty','the evidence does not prove ownership for certain','it is a strong match, but not absolute proof'],patterns:[{patternId:'limit1',source:'(does not|cannot|can.t).{0,35}(prove|confirm).{0,25}(ownership|owner|belongs)'},{patternId:'limit2',source:'(not|no).{0,15}(absolute|certain|complete) proof.{0,25}(ownership|owner|it)'},{patternId:'limit3',source:'strong evidence.{0,35}(not|but).{0,25}(prove|certain)'}],evidenceRefs:['E02','E03','E04'],criterionIds:['C3'],materiality:'MATERIAL'}
    ],
    criteria:[
      {criterionId:'C1',dimension:'CONCLUSION_ACCURACY',weight:1,conceptIds:['BAG_BELONGS_LINA']},
      {criterionId:'C2',dimension:'EVIDENCE_REASONING',weight:1,conceptIds:['BAG_CONTENTS_MATCH','LIBRARY_LINK']},
      {criterionId:'C3',dimension:'CRITICAL_THINKING',weight:1,conceptIds:['OWNERSHIP_NOT_CERTAIN']}
    ],
    feedbackResources:[],
    investigation:{conclusionPaths:[{evidenceIds:['E01','E02','E03','E04'],interviews:[{characterId:'LINA',questionId:'Q-BAG-CONTENTS'}]}]}
  }
};

const casePresentation = {
    'CASE-001': { title: 'The Missing Package', level: 'A2', cefr: 'A2', category: 'Everyday mystery', subtitle: 'A delivery disappears before its recipient arrives.', focus: 'Your task: identify what the witness actually saw, then separate that from what remains unknown about the person.', conclusionOptions: ['Nora took the package after she arrived.', 'An unidentified resident in a green jacket picked up the package; the resident’s identity remains unknown.', 'Adam collected the package while the driver was there.'], details: ['10:05 — The delivery record says the package was placed at reception; no recipient was recorded.', '10:00–10:15 — Adam was away and did not see the delivery.', '10:12 — Sara saw a resident wearing a green jacket take the package after the driver left it on the table. She did not see the resident’s face.', '10:20 — Nora arrived and the package was no longer there.', 'The optional label names Nora and Apartment 2B; it does not identify who picked up the package.'], questions: [{id:'q1',prompt:'Which account stays within what Sara witnessed?',options:['A resident left with the package after the driver stepped away.','Nora collected the package when she reached reception.','Adam handed the package to someone before leaving.'],answer:0,explain:'Sara witnessed a resident collect the package after the driver left; she did not identify the resident.'},{id:'q2',prompt:'Which statement about the person can the report support?',options:['The person was the resident listed on the optional label.','The person’s identity cannot be established from Sara’s account.','The person was someone who arrived after Nora.'],answer:1,explain:'The label does not identify the picker, and Sara did not see the person’s face.'}] },
    'CASE-002': { title: 'Conflicting Accounts', level: 'B1', cefr: 'B1', category: 'Case investigation', subtitle: 'An envelope vanishes, then appears in another room.', focus: 'Your task: explain where the envelope was found and decide what the timeline and access record can—and cannot—prove about who moved it.', conclusionOptions: ['The envelope was found in Room B, but the card log does not identify who used the card.', 'Lena definitely moved the envelope into Room B because her card opened the room.', 'Omar took the envelope after seeing Nadia near the exit.'], details: ['3:05 — Nadia placed the envelope of workshop recordings at library reception.', '3:20 — Omar saw a large envelope on the desk. Later, he saw Nadia carrying papers near the exit and assumed they were the envelope, but he did not identify them.', 'About 3:25 — Lena said she moved a group of papers to Room B; she was unsure whether she checked every sheet.', '3:22–3:41 — A card opened Room B and the room was later closed. The log does not establish who physically used the card or what was carried inside.', '3:45 — Nadia returned and found the envelope missing.', '4:10 — The envelope was found closed in Room B, with papers inside.'], questions: [{id:'q1',prompt:'Which claim is justified by the access record alone?',options:['Lena entered Room B during the recorded interval.','Someone used a card to open Room B; the user is not established.','The envelope was taken into Room B during that interval.'],answer:1,explain:'The record confirms a card event, but it does not identify the physical user or what entered the room.'},{id:'q2',prompt:'How should Omar’s later observation be described?',options:['Nadia carried the missing envelope towards the exit.','Nadia carried papers, but Omar could not confirm what they were.','Lena passed the envelope to Nadia near the exit.'],answer:1,explain:'Omar saw Nadia carrying papers, but he did not identify them as the envelope.'}] },
    'CASE-003': { title: 'The Uncertain Evidence', level: 'C1', cefr: 'C1', category: 'Evidence analysis', subtitle: 'An observatory receiver records an unusual signal.', focus: 'Your task: separate the recorded anomaly from its possible explanations. Decide whether the evidence identifies a cause or leaves competing hypotheses open.', conclusionOptions: ['An external event definitely caused the signal increase.', 'A temporary fault in R-4 is confirmed by the maintenance record.', 'R-4 recorded an unusual increase, but its cause remains unresolved; an external source or receiver fault is still possible.'], details: ['14 October, 21:43–21:47 — Receiver R-4 recorded an unusual signal-strength increase. The recovered recording is incomplete.', 'Analyst One: an external source is possible, but its identity cannot be established and equipment fault cannot be ruled out.', 'Analyst Two: a temporary R-4 fault is possible, but there is no diagnostic result proving it.', 'Maintenance records show unstable readings in September and a connection check before R-4 returned to service. There was no maintenance or diagnostic test on the night of 14 October.', 'R-7 did not record the increase, but its direction and sensitivity differed, so it is not a direct control.', 'A preliminary report suggested an external event before the original recording was recovered; it is not independent confirmation.', 'A technician’s note from two days earlier expresses concern that the problem may have returned; it is an impression, not a diagnosis.'], questions: [{id:'q1',prompt:'Which statement reports the instrument record without adding a cause?',options:['R-4 registered an unusual rise, although the recovered record is incomplete.','An outside source produced the rise recorded by R-4.','A fault in R-4 explains the rise in the recovered recording.'],answer:0,explain:'The recording establishes an unusual increase on R-4, not what produced it.'},{id:'q2',prompt:'What limits the comparison with R-7?',options:['R-7 had a different direction and sensitivity from R-4.','R-7 recorded the same increase as R-4.','R-7 was tested alongside R-4 during the event.'],answer:0,explain:'Because the instruments differed in direction and sensitivity, R-7 is not a direct control.'}] }
  ,
    'CASE-005': {
      title:'The Empty Seat', editorialId:'LD-A1-003', status:'IMPLEMENTED', level:'A1', cefr:'A1', category:'Everyday mystery',
      subtitle:'Three passengers claim a bag found in a quiet station waiting room.',
      focus:'Your task: decide whose bag is the best-supported match. Compare where each person waited, what was found inside the bag, and the independent library record. A strong match is not the same as absolute proof.',
      conclusionOptions:[
        'The green canvas bag most likely belongs to Lina.',
        'The green canvas bag belongs to Omar.',
        'The green canvas bag belongs to Nora.'
      ],
      details:[
        '8:00 — Lina waits at the bench beside the timetable board.',
        '8:05 — Omar waits by the window. Nora waits near the door a little later.',
        '8:32 — A green canvas bag is found beside the timetable bench. Its owner is not recorded.',
        'The bag inventory lists a paperback book, a blue notebook and a red pencil case.',
        'The library record shows that Lina borrowed the same paperback that morning.',
        'The seating log records where the three passengers waited, but it does not record who owned the bag.'
      ],
      questions:[
        {id:'q1',prompt:'What does the found-property report tell us?',options:['A green canvas bag was found by the timetable bench.','Lina collected the bag.','The bag belongs to the person by the window.'],answer:0,explain:'The report gives the bag’s description and location, but it does not name the owner.'},
        {id:'q2',prompt:'What does the library record add?',options:['It proves Lina owns every item in the bag.','It links Lina to the paperback found in the bag.','It shows Omar borrowed the book.'],answer:1,explain:'The library record links Lina to one item, but it does not prove ownership by itself.'}
      ]
    },
    'CASE-004': {
      title: 'The Blue Scarf', editorialId: 'LD-A1-002', status: 'IMPLEMENTED', level: 'A1', cefr: 'A1', category: 'Everyday mystery',
      subtitle: 'Mina loses her blue scarf at a small train station.',
      focus: 'Your task: find where Mina’s scarf is now. Use the short records to follow what happened.',
      conclusionOptions: [
        'The scarf is at the lost-property desk.',
        'The scarf is still under the bench on Platform 2.',
        'The scarf is on Mina’s train.'
      ],
      details: [
        '8:05 — Mina sits on a bench at Platform 2. She has a blue scarf with a small silver star.',
        '8:20 — A cleaner finds a blue scarf with a small silver star under the bench and takes it to the lost-property desk.',
        '8:25 — The station list records one blue scarf with a small silver star from Platform 2.',
        'A station notice says lost property is kept at the ticket desk.',
        'When Mina gets on her train, the scarf is no longer with her.'
      ],
      questions: [
        {id:'q1',prompt:'Where did the cleaner find the scarf?',options:['Under the bench on Platform 2.','On Mina’s train.','At the ticket desk.'],answer:0,explain:'The cleaning note says the scarf was under the bench on Platform 2.'},
        {id:'q2',prompt:'What happened after the cleaner found the scarf?',options:['The cleaner left it on the bench.','The cleaner took it to the lost-property desk.','Mina took it onto the train.'],answer:1,explain:'The cleaning note says the scarf was taken to lost property, and the station list confirms it was received.'}
      ]
    }
  };
for (const [id, info] of Object.entries(casePresentation)) {
  if (!cases[id]) throw new Error('Presentation references unknown case: ' + id);
  cases[id].presentation = Object.freeze(info);
}

function makeContext(caseId,trainingMode='STEADY',answerFormat='HELL'){
 const c=cases[caseId];
 return {caseId,caseVersion:c.caseVersion,evaluatorVersion:'0.1.0',schemaVersion:c.schemaVersion,cefr:c.presentation.cefr,trainingMode,answerFormat,locale:'en',attemptId:'attempt-fixture',responseId:'response-fixture'};
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
 ['CASE-003','An external event definitely caused the increase.','UNSUPPORTED'],
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
 ['CASE-003','The external event certainly caused the anomaly.','UNSUPPORTED']
];
ambiguity.forEach((x,i)=>fixtures.push(scenario('AMB-'+String(i+1).padStart(2,'0'),'ambiguity',...x)));
const mode=[
 ['CASE-001','An unidentified resident picked up the package.','PARTIAL'],
 ['CASE-001','The package was picked up by an unidentified resident.','PARTIAL'],
 ['CASE-002','Lena may have moved the envelope.','PARTIAL'],
 ['CASE-002','It is plausible that Lena moved the envelope.','PARTIAL'],
 ['CASE-003','R-4 registered an unusual rise; its cause remains undetermined.','PARTIAL'],
 ['CASE-003','The cause of the unusual R-4 reading cannot be established.','PARTIAL']
];
mode.forEach((x,i)=>fixtures.push(scenario('MODE-'+String(i+1).padStart(2,'0'),'mode',...x)));
const fairness=[
 ['CASE-001','A green-jacketed resident took the package; we cannot identify them.','PARTIAL'],
 ['CASE-001','The resident stole it to keep it.','UNSUPPORTED'],
 ['CASE-002','The envelope was later located in Room B.','PARTIAL'],
 ['CASE-002','Omar lied about seeing the envelope.','UNSUPPORTED'],
 ['CASE-003','R-7 did not record the rise, so an external event is proven.','UNSUPPORTED'],
 ['CASE-003','The reading is evidence of an anomaly, not proof of its cause.','PARTIAL']
];
fairness.forEach((x,i)=>fixtures.push(scenario('FAIR-'+String(i+1).padStart(2,'0'),'fairness',...x)));
if(fixtures.length!==57)throw new Error('Expected 57 fixtures, got '+fixtures.length);
const LanguageDetectiveFixtures = {cases,fixtures,makeContext};
if (typeof module !== 'undefined' && module.exports) module.exports = LanguageDetectiveFixtures;
else if (typeof window !== 'undefined') window.EPIPHANY_LANGUAGE_DETECTIVE_FIXTURES = LanguageDetectiveFixtures;

})();
