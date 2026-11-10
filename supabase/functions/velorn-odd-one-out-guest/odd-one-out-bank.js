/* ODD ONE OUT — CEFR content bank.
   Four-choice, relationship-first questions. Training approach is deliberately
   separate from CEFR level; round selection never pads with repeated/weak items. */
(function (root) {
  'use strict';
  const RELATIONSHIPS = Object.freeze([
    'category','function','synonyms-antonyms','part-whole','word-class',
    'cause-effect','contextual-meaning','collocations','register-tone','connotation'
  ]);
  const BANKS = {
    A1: [
      {id:'A1-CAT-01',relationship:'category',words:['apple','pear','banana','hammer'],answer:3,explain:'Apple, pear and banana are fruits. A hammer is used for writing, not eaten.',challengeExplain:"Orange, grape and peach are fruits. A screwdriver is used for writing or drawing, not eaten.",hint:'Which three are foods?',context:'Everyday objects and food.'},
      {id:'A1-CAT-02',relationship:'category',words:['bus','train','bicycle','bathroom'],answer:3,explain:'A bus, train and bicycle are ways to travel. A bathroom is a room in a home.',challengeExplain:"A tram, coach and ferry are ways to travel. A garage is a room in a home.",hint:'Which three can help you travel?',context:'Getting from one place to another.'},
      {id:'A1-FUN-01',relationship:'function',words:['knife','scissors','saw','mattress'],answer:3,explain:'A mattress is used for sleeping or resting; it is not a cutting tool.',challengeExplain:"A duvet keeps someone warm in bed; it is not a cutting tool.",hint:'Think about what each object is used to do.',context:'Common household objects.'},
      {id:'A1-PW-01',relationship:'part-whole',words:['door','window','seat','minibus'],answer:3,explain:'A minibus is a complete vehicle; a door, window and seat are components of it.',challengeExplain:'A mechanic is a person who repairs vehicles, not a component of one.',hint:'Which three are parts of the same vehicle?',context:'Parts of a familiar minibus.'},
      {id:'A1-WC-01',relationship:'word-class',words:['run','walk','jump','curious'],answer:3,explain:'Run, walk and jump are verbs naming actions. Curious is an adjective describing a feeling.',challengeExplain:'Eat, drink and sleep are verbs naming actions. Gentle is an adjective describing a person.',hint:'Which three words name actions?',context:'Everyday actions and feelings.'},
      {id:'A1-SYN-01',relationship:'synonyms-antonyms',words:['big','large','huge','little'],answer:3,explain:'Big, large and huge describe something of great size. Little describes something of little size.',challengeExplain:'Mini means very small or compact, contrasting with big, large and huge.',hint:'Which three describe size in a similar way?',context:'Basic size vocabulary.'},
      {id:'A1-FUN-02',relationship:'function',words:['key','password','code','spoon'],answer:3,explain:'A key, password and code can all give access or unlock something. A spoon is used for serving food.',challengeExplain:"A passcode, PIN and keycard can grant access to something. A saucepan is used to hold or serve food.",hint:'Which three can help you open or access something?',context:'Simple everyday purposes.'},
      {id:'A1-CAT-03',relationship:'category',words:['Monday','Tuesday','Friday','autumn'],answer:3,explain:'Monday, Tuesday and Friday are days of the week. Autumn is a season.',challengeExplain:"Wednesday, Saturday and Sunday are days of the week. Spring is a season.",hint:'Which three belong to the same calendar group?',context:'Days and seasons.'},
      {id:'A1-CAT-04',relationship:'category',words:['shirt','trousers','shoes','plum'],answer:3,explain:'A shirt, trousers and shoes are things people wear. An plum is a fruit.',challengeExplain:'A jacket, socks and a skirt are things people wear. A apricot is a fruit.',hint:'Which three can you wear?',context:'Clothes and everyday objects.'},
      {id:'A1-PW-02',relationship:'part-whole',words:['page','cover','chapter','illustrator'],answer:3,explain:'An illustrator is a person who creates pictures for a book, not a part of the book.',challengeExplain:'A cartoonist is a person who creates cartoons, not a part of a book.',hint:'Which three are parts of the same object?',context:'Parts of a familiar book.'},
      {id:'A1-CAT-05',relationship:'category',words:['red','blue','green','rice'],answer:3,explain:'Red, blue and green are colours. Rice is a food.',challengeExplain:'Yellow, black and white are colours. Soup is a food.',hint:'Which three name colours?',context:'Basic colours and food.'},
      {id:'A1-COL-01',relationship:'collocations',words:['breakfast','lunch','dinner','assignment'],answer:3,explain:'We say eat breakfast, lunch and dinner. An assignment is something we do, not eat.',challengeExplain:'We say eat breakfast, lunch and supper. Laundry is something we do, not eat.',hint:'Which three words naturally follow the verb “eat”?',context:'Common verb and noun combinations.'}
    ],
    A2: [
      {id:'A2-CAT-01',relationship:'category',words:['chemist','baker','dentist','school'],answer:3,explain:'A chemist, baker and dentist are people or occupations. A school is a place.',challengeExplain:"A surgeon, carpenter and cashier are people with occupations. A garage is a place where medical care is provided.",hint:'Separate people who do jobs from places.',context:'Work and places in a town.'},
      {id:'A2-FUN-01',relationship:'function',words:['thermometer','scale','ruler','rucksack'],answer:3,explain:'A thermometer measures temperature, a scale measures weight, and a ruler measures length. A rucksack carries belongings.',challengeExplain:"A barometer measures air pressure, a measuring tape measures length, and a stopwatch measures time. A duffel bag carries belongings.",hint:'What do the first three measure?',context:'Useful objects and their purposes.'},
      {id:'A2-SYN-01',relationship:'synonyms-antonyms',words:['begin','start','commence','terminate'],answer:3,explain:'Begin, start and commence mean to do something at the beginning. Terminate means to bring it to an end.',challengeExplain:"Commence, launch and initiate can mean to begin something. End means to bring it to an end.",hint:'Three words share a meaning; one is the opposite.',context:'Common verbs with similar meanings.'},
      {id:'A2-PW-01',relationship:'part-whole',words:['chapter','cover','index','textbook'],answer:3,explain:'A chapter, cover and index are parts of a book. A textbook is a complete kind of book.',challengeExplain:"An archive is a collection or place where documents are kept, not a component of a book.",hint:'Which three can be found inside or on a book?',context:'Parts of a book.'},
      {id:'A2-WC-01',relationship:'word-class',words:['decision','arrival','movement','approve'],answer:3,explain:'Decision, arrival and movement are nouns naming things or events. Approve is a verb.',challengeExplain:"Growth, refusal and approval are nouns naming processes or outcomes. Suggest is a verb.",hint:'Which word describes an action rather than naming it?',context:'Word families and grammar.'},
      {id:'A2-CTX-01',relationship:'contextual-meaning',words:['light','bright','luminous','dense'],answer:3,explain:'Light, bright and luminous can all describe a place or object that gives or reflects plenty of light. Dense describes weight.',challengeExplain:"Radiant, well-lit and glowing can describe something that gives or reflects light. Bulky refers to physical heaviness or importance.",hint:'Imagine the words describing a room with plenty of daylight.',context:'Words understood from a shared situation.'},
      {id:'A2-COL-01',relationship:'collocations',words:['make','reach','take','fabricate'],answer:3,explain:'A decision is commonly made, reached or taken; fabricate a decision is not a natural collocation.',challengeExplain:"We reach, make or take a decision; assemble a decision is not a natural collocation.",hint:'Try the words before “a decision”, “homework” and “a break”.',context:'Common verb–noun partnerships.'},
      {id:'A2-REG-01',relationship:'register-tone',words:['kids','children','youngsters','appliances'],answer:3,explain:'Kids, children and youngsters can all refer to young people, with different levels of formality. Appliances is unrelated.',challengeExplain:"Youths, young people and adolescents all refer to young people. Machinery refers to tools or items needed for an activity.",hint:'Which three can refer to the same group of people?',context:'Everyday and more formal vocabulary.'},
      {id:'A2-CAT-02',relationship:'category',words:['violin','guitar','piano','recital'],answer:3,explain:'A violin, guitar and piano are musical instruments. A recital is an event where people perform music.',challengeExplain:'A flute, cello and trumpet are musical instruments. An audience is a group of musicians, not an instrument.',hint:'Which three are objects musicians play?',context:'Music, instruments and events.'},
      {id:'A2-CAUSE-01',relationship:'cause-effect',words:['icy roads','heavy rain','poor visibility','traffic jam'],answer:3,explain:'Icy roads, heavy rain and poor visibility are conditions that can cause a road to close. A traffic jam is the result, not a condition.',challengeExplain:'Black ice, dense fog and falling snow are hazardous conditions. Traffic rerouting is a response to them, not a hazardous condition.',hint:'Which three are dangerous conditions, rather than a response to them?',context:'Weather conditions and their consequences.'},
      {id:'A2-CON-01',relationship:'connotation',words:['generous','kind','thoughtful','callous'],answer:3,explain:'Generous, kind and thoughtful usually have positive associations when describing a person. Callous has a negative association.',challengeExplain:'Considerate, caring and selfless usually suggest positive qualities. Cruel usually suggests a negative quality.',hint:'Which three usually praise someone’s behaviour?',context:'Positive and negative impressions of character.'},
      {id:'A2-FUN-02',relationship:'function',words:['key','password','code','turnstile'],answer:3,explain:'A turnstile controls entry; it is not a credential such as a key, password or code.',challengeExplain:'A barrier controls or blocks access; it is not an access credential.',hint:'Which three can prove or provide permission to enter?',context:'Access and security.'}
    ],
    B1: [
      {id:'B1-CAUSE-01',relationship:'cause-effect',words:['drought','water shortage','crop failure','wedding reception'],answer:3,explain:'Drought and water shortage can lead to crop failure. A wedding reception is a celebration, not an effect of water scarcity.',challengeExplain:'Water scarcity, failed crops and reduced yields can all result from drought. A community concert is an event, not an environmental or agricultural consequence.',hint:'Follow the chain from a lack of rain to its likely result.',context:'Environment and consequences.'},
      {id:'B1-CTX-01',relationship:'contextual-meaning',words:['draft','outline','rough version','final manuscript'],answer:3,explain:'A draft, outline and rough version are stages or forms of work before completion. A final manuscript is the completed version.',challengeExplain:"A preliminary version, working draft and first outline are forms of work that are not yet final. A completed report is a completed version made available to readers.",hint:'Which three describe work that is not yet final?',context:'Preparing a written assignment.'},
      {id:'B1-COL-01',relationship:'collocations',words:['strong','heavy','pouring','colourful'],answer:3,explain:'Strong wind, heavy rain and pouring rain are natural collocations. Colourful does not normally describe wind or rain in these expressions.',challengeExplain:'Gusty wind, strong wind and howling wind are natural combinations. Fragrant does not normally describe wind in this way.',hint:'Think of natural combinations with “wind” or “rain”.',context:'Weather collocations.'},
      {id:'B1-CTX-01B',relationship:'contextual-meaning',words:['although','whereas','while','consequently'],answer:3,explain:'Although, whereas and while introduce contrast; consequently signals a result.',challengeExplain:"Even though, whereas and while introduce contrast; as a result signals a consequence.",hint:'Three connect contrasting ideas; one gives a reason.',context:'Linking ideas in a sentence.'},
      {id:'B1-FUN-01',relationship:'function',words:['insulate','shield','protect','endanger'],answer:3,explain:'Insulate, shield and protect keep something safe; endanger puts it at risk.',challengeExplain:"Safeguard, insulate and defend can describe protecting something from harm or unwanted influence. Compromise means to put it at risk.",hint:'Which three help prevent contact or harm?',context:'Actions and their purposes.'},
      {id:'B1-SYN-01',relationship:'synonyms-antonyms',words:['reluctant','unwilling','hesitant','enthusiastic'],answer:3,explain:'Reluctant, unwilling and hesitant suggest not being ready or keen to act. Enthusiastic means strongly wanting to act.',challengeExplain:"Averse, disinclined and unenthusiastic all suggest unwillingness or a lack of eagerness. Keen expresses readiness to act.",hint:'Which word expresses the opposite attitude?',context:'Attitudes towards taking action.'},
      {id:'B1-PW-01',relationship:'part-whole',words:['paragraph','sentence','phrase','dissertation'],answer:3,explain:'A paragraph, sentence and phrase can be structural units within an dissertation. An dissertation is the larger complete text.',challengeExplain:"A subsection, paragraph and sentence can be structural parts of a larger thesis. Thesis names the complete work or act of making it available.",hint:'Which three can form parts of the larger piece of writing?',context:'Writing structure.'},
      {id:'B1-REG-01',relationship:'register-tone',words:['request','ask','inquire','command'],answer:3,explain:'Request, ask and inquire can express seeking information or help, with different levels of formality. Command adds force and authority, changing the tone.',challengeExplain:"Enquire, request and ask can be used to seek information or help. Order expresses firm pressure or determination rather than a simple enquiry.",hint:'Compare the politeness and force of each verb.',context:'Choosing an appropriate tone.'},
      {id:'B1-CAT-02',relationship:'category',words:['novel','memoir','biography','illustrator'],answer:3,explain:'An illustrator creates pictures for books; it is a person, not a written literary work.',challengeExplain:'A librarian manages books; it is a person, not a literary form.',hint:'Which three are kinds of written work?',context:'Books and publishing.'},
      {id:'B1-COL-02',relationship:'collocations',words:['raise','reach','meet','unusual'],answer:3,explain:'Raise awareness, reach an agreement and meet a deadline are established word partnerships. Unusual does not form the same verb-plus-object pattern.',challengeExplain:'Heighten awareness, come to an agreement and honour a commitment are natural combinations. Delightful does not fit these collocations.',hint:'Look for verbs that commonly combine with a noun to form a phrase.',context:'Common verb-noun collocations.'},
      {id:'B1-CON-01',relationship:'connotation',words:['persistent','determined','resolute','pigheaded'],answer:3,explain:'Persistent, determined and resolute usually praise someone’s continued effort. Pigheaded often suggests an unreasonable refusal to change.',challengeExplain:'Tenacious, steadfast and persevering usually convey positive persistence. Headstrong often carries a negative suggestion of unreasonable inflexibility.',hint:'Which word often changes persistence from a strength into a criticism?',context:'Nuance in descriptions of character.'},
      {id:'B1-FUN-02',relationship:'function',words:['summarise','outline','recap','condemn'],answer:3,explain:'Summarise, outline and recap all present the main points of something. Condemn means to judge or point out faults.',challengeExplain:'Condense, encapsulate and recapitulate all mean to present the main points briefly. Discredit means to speak about something as if it were of little value.',hint:'Which three give the main points rather than evaluate something?',context:'Academic and communication purposes.'}
    ],
    B2: [
      {id:'B2-REG-01',relationship:'register-tone',words:['commence','begin','start','get cracking'],answer:3,explain:'Commence, begin and start are neutral or formal ways to say that something begins. Get cracking is more informal and often conversational.',challengeExplain:"Initiate, commence and begin are neutral or formal ways to say that something starts. Get moving is more informal and conversational.",hint:'Which expression is noticeably more informal?',context:'A formal announcement about an event.'},
      {id:'B2-COL-01',relationship:'collocations',words:['reach','draw','arrive','fabricate'],answer:3,explain:'Reach, draw or arrive at a conclusion are natural collocations; fabricate a conclusion is not.',challengeExplain:"Reach, draw or come to a conclusion are natural collocations; construct a conclusion is not.",hint:'Which three verbs naturally combine with “a conclusion”?',context:'Precise verb–noun partnerships.'},
      {id:'B2-CON-01',relationship:'connotation',words:['slim','slender','lean','skeletal'],answer:3,explain:'Slim, slender and lean can describe a thin shape neutrally or positively depending on context. Skeletal often carries a more negative or critical implication.',challengeExplain:'Slender, svelte and willowy can describe a slim shape, often positively. Emaciated usually suggests an excessively thin or unhealthy appearance.',hint:'Which adjective is more likely to sound critical?',context:'Describing a person’s build.'},
      {id:'B2-CTX-01',relationship:'contextual-meaning',words:['reservation','booking','appointment','complaint'],answer:3,explain:'In a travel or service context, a reservation, booking and appointment refer to arrangements made in advance. An complaint is an expression of disagreement.',challengeExplain:"A booking, reservation and scheduled consultation are arrangements made in advance. A protest is a difference of opinion, not an appointment.",hint:'Imagine arranging a service or meeting in advance.',context:'Arranging a hotel stay or meeting.'},
      {id:'B2-SYN-01',relationship:'synonyms-antonyms',words:['mitigate','ease','alleviate','deteriorate'],answer:3,explain:'Mitigate, ease and alleviate mean to make a problem or effect less severe. Deteriorate means to make it stronger.',challengeExplain:"Lessen, alleviate and mitigate mean to reduce the severity or impact of something. Deepen means to make it worse.",hint:'Three reduce severity; one increases it.',context:'Discussing the effects of a problem.'},
      {id:'B2-WC-01',relationship:'word-class',words:['commerce','economical','historic','historical'],answer:0,explain:'Economical, historic and historical are adjectives. Commerce is a noun naming a field of study.',challengeExplain:"Finance is a noun naming a field of study. Financial, cost-effective and historical are adjectives.",hint:'Compare the specific meaning, not only the grammatical form.',context:'A meaning distinction within adjectives.'},
      {id:'B2-CAUSE-01',relationship:'cause-effect',words:['overwork','fatigue','exhaustion','renewal'],answer:3,explain:'Overwork can cause fatigue, which may develop into exhaustion. Renewal is the process of returning to health or strength afterwards.',challengeExplain:"An excessive workload can lead to fatigue and burnout. Rejuvenation refers to a process of recovery or returning something to a former condition.",hint:'Which word describes what happens after the negative effects?',context:'Workload and wellbeing.'},
      {id:'B2-PW-01',relationship:'part-whole',words:['premise','supporting point','counterargument','case'],answer:3,explain:'A premise, supporting point and counterargument are components used to build an case. Case names the complete piece of reasoning.',challengeExplain:"A premise, rebuttal and supporting evidence are components of an argument. A position paper is the complete line of reasoning.",hint:'Which item normally comes at the end of an case?',context:'The structure of an case.'},
      {id:'B2-CAT-02',relationship:'category',words:['violin','viola','cello','ensemble'],answer:3,explain:'A violin, viola and cello are instruments; an ensemble is a group of performers.',challengeExplain:'A trumpet, trombone and tuba are brass instruments; a wind band is a group of musicians.',hint:'Which option names a group of performers rather than one instrument?',context:'Distinguishing instruments from the ensembles that perform with them.'},
      {id:'B2-FUN-02',relationship:'function',words:['thermostat','dimmer','valve','monitor'],answer:3,explain:'A thermostat, dimmer and valve regulate or adjust a system. A monitor detects or measures a condition rather than controlling it.',challengeExplain:'A governor, rheostat and regulator control or adjust a system. A probe identifies the presence of something instead.',hint:'Which device detects information instead of regulating a system?',context:'The different functions of control devices and detection devices.'},
      {id:'B2-WC-02',relationship:'word-class',words:['comprehensive','exhaustive','thorough','rigorously'],answer:3,explain:'Comprehensive, exhaustive and thorough are adjectives describing the quality or extent of work. Rigorously is an adverb describing how an action is done.',challengeExplain:'Meticulous, rigorous and extensive are adjectives. Systematically is an adverb describing the manner in which something is done.',hint:'Which word describes how an action is performed rather than describing a noun?',context:'Distinguishing evaluative adjectives from adverbs in formal writing.'},
      {id:'B2-CAUSE-02',relationship:'cause-effect',words:['trigger','precipitate','provoke','relieve'],answer:3,explain:'Trigger, precipitate and provoke mean to cause or bring about an event or reaction. Relieve means to make a problem or its effects less severe.',challengeExplain:'Instigate, engender and spark can mean to cause or set something in motion. Moderate means to make its impact less severe.',hint:'Three verbs bring something about; which one reduces its severity?',context:'Verbs describing causes compared with verbs describing the reduction of effects.'}
    ],
    C1: [
      {id:'C1-REG-01',relationship:'register-tone',words:['assert','maintain','contend','babble'],answer:3,explain:'Assert, maintain and contend are verbs used to present or defend a position in formal or analytical discussion. Babble suggests saying something suddenly and without care.',challengeExplain:'Aver, contend and assert are used to state or defend a position, often in formal discussion. Yell describes speaking quietly or indistinctly rather than formally presenting a claim.',hint:'Which verb implies an uncontrolled or socially abrupt manner?',context:'Presenting a position in a debate.'},
      {id:'C1-CON-01',relationship:'connotation',words:['frugal','thrifty','economical','tightfisted'],answer:3,explain:'Frugal, thrifty and economical can praise careful use of resources. Tightfisted usually criticizes an unwillingness to spend or give.',challengeExplain:"Prudent, thrifty and frugal can describe careful, sensible use of money or resources. Parsimonious is more negative, suggesting an excessive unwillingness to spend or give.",hint:'Which word is most likely to criticize rather than praise?',context:'Describing someone’s approach to money.'},
      {id:'C1-COL-01',relationship:'collocations',words:['raise','lodge','voice','execute'],answer:3,explain:'Raise, lodge or voice an objection are natural collocations; execute an objection is not.',challengeExplain:'Register, file or voice an objection are natural collocations; compose an objection is not.',hint:'Which verb does not naturally combine with “an objection”?',context:'Formal ways of expressing disagreement.'},
      {id:'C1-CTX-01',relationship:'contextual-meaning',words:['qualified','tentative','provisional','definitive'],answer:3,explain:'A qualified, tentative or provisional statement leaves room for limits or revision. A definitive statement is definite and unreserved.',challengeExplain:"Provisional, tentative and qualified all signal limits, uncertainty or room for revision. Unconditional means clear and leaving no doubt.",hint:'Which adjective signals certainty rather than qualification?',context:'Evaluating the strength of a claim.'},
      {id:'C1-SYN-01',relationship:'synonyms-antonyms',words:['scrutinise','examine','inspect','disregard'],answer:3,explain:'Scrutinise, examine and inspect involve looking at something carefully. Disregard can mean to fail to notice it.',challengeExplain:"Peruse, scrutinise and inspect all involve examining or reading something carefully. Ignore means failing to give it proper attention.",hint:'Which verb can mean failing to notice?',context:'Careful analysis and attention.'},
      {id:'C1-CAUSE-01',relationship:'cause-effect',words:['precipitate','trigger','prompt','block'],answer:3,explain:'Precipitate, trigger and prompt can describe something that brings an event or response about. Block means to stop it from happening.',challengeExplain:"Engender, precipitate and trigger can describe bringing about an event or response. Forestall means to prevent it.",hint:'Three can initiate an outcome; one blocks it.',context:'Describing how events are brought about.'},
      {id:'C1-CTX-01B',relationship:'contextual-meaning',words:['nevertheless','nonetheless','however','hence'],answer:3,explain:'Nevertheless, nonetheless and however signal contrast or concession. Hence signals a consequence or conclusion.',challengeExplain:"Conversely, nevertheless and nonetheless signal contrast or a counterpoint. Thus signals a result or consequence.",hint:'Which connector points to a result rather than a contrast?',context:'Academic discourse markers.'},
      {id:'C1-PW-01',relationship:'part-whole',words:['preface','appendix','index','treatise'],answer:3,explain:'A preface, appendix and index are components of a treatise. A treatise is the complete scholarly work.',challengeExplain:'A paragraph, subsection and chapter are parts of a larger written work. A volume is the complete work, not one of its sections.',hint:'Which word names the complete scholarly work rather than one of its components?',context:'The structure of a scholarly publication.'},
      {id:'C1-CAT-02',relationship:'category',words:['sonnet','elegy','ode','compilation'],answer:3,explain:'A sonnet, elegy and ode are forms or kinds of poem. An compilation is a collection of selected works, not a poetic form.',challengeExplain:'A haiku, limerick and villanelle are poetic forms. A poetry volume is a group of works gathered together, not a form of poem.',hint:'Which word describes a poetry volume of works rather than a poetic form?',context:'Literary forms and collections.'},
      {id:'C1-FUN-02',relationship:'function',words:['barometer','hygrometer','anemometer','forecaster'],answer:3,explain:'A barometer, hygrometer and anemometer are instruments used to measure atmospheric conditions. A forecaster is a person who studies the weather.',challengeExplain:'A seismograph, thermometer and altimeter are instruments that record or measure physical conditions. A scientist is a scientist, not a measuring instrument.',hint:'Which three are instruments rather than people?',context:'Scientific instruments and professions.'},
      {id:'C1-WC-02',relationship:'word-class',words:['ambiguous','equivocal','obscure','subtly'],answer:3,explain:'Ambiguous, equivocal and obscure are adjectives. Subtly is an adverb describing how something is expressed or understood.',challengeExplain:'Implicit, ambivalent and indeterminate are adjectives. Vaguely is an adverb describing how something is suggested or understood.',hint:'Which word modifies a verb or adjective rather than describing a noun?',context:'Precise academic vocabulary and word forms.'},
      {id:'C1-CAUSE-02',relationship:'cause-effect',words:['exacerbate','aggravate','compound','reduce'],answer:3,explain:'Exacerbate, aggravate and compound make a problem worse; reduce makes it less severe.',challengeExplain:'Intensify, compound and heighten make something stronger or worse; temper moderates it.',hint:'Which verb describes improving a bad situation rather than making it worse?',context:'Describing changes in the severity of a problem.'}
    ],
    C2: [
      {id:'C2-CON-01',relationship:'connotation',words:['discerning','meticulous','scrupulous','nitpicky'],answer:3,explain:'Discerning, meticulous and scrupulous can praise good judgement, care or integrity. Nitpicky is more often critical, suggesting excessive attention to minor rules or details.',challengeExplain:'Astute, scrupulous and meticulous can praise judgement, care or thoroughness. Fussy is more likely to criticize someone for being excessively particular about small details.',hint:'Which word most readily carries a mildly dismissive tone?',context:'Subtle evaluation of a person’s standards.'},
      {id:'C2-REG-01',relationship:'register-tone',words:['deceased','late','departed','perished'],answer:3,explain:'Deceased, late and departed are softened expressions; perished is more direct.',challengeExplain:'Passed away, deceased and departed are softened expressions; perished is more direct.',hint:'Which word is the most direct and least euphemistic?',context:'Sensitive formal communication.'},
      {id:'C2-COL-01',relationship:'collocations',words:['bitterly regret','deeply regret','profoundly regret','loudly regret'],answer:3,explain:'Bitterly, deeply and profoundly naturally modify regret; loudly regret is not a natural collocation.',challengeExplain:'Bitterly, deeply and profoundly naturally modify regret; happily regret is not a natural collocation.',hint:'Compare the complete phrases: each option contains the verb “regret”.',context:'Nuanced adverb–verb collocation.'},
      {id:'C2-CTX-01',relationship:'synonyms-antonyms',words:['prohibit','forbid','ban','authorize'],answer:3,explain:'Prohibit, forbid and ban mean to stop something; authorize gives official approval.',challengeExplain:"Outlaw, bar and proscribe mean to prohibit; approve expresses the opposite meaning.",hint:'Compare the direction of each verb: restriction or permission.',context:'Formal and everyday verbs for prohibition and permission.'},
      {id:'C2-SYN-01',relationship:'synonyms-antonyms',words:['intransigent','unyielding','obdurate','receptive'],answer:3,explain:'Intransigent, unyielding and obdurate describe someone unwilling to change their position. Receptive suggests willingness to agree or be influenced.',challengeExplain:"Obstinate, inflexible and intransigent describe an unwillingness to change one’s position. Flexible suggests willingness to obey or adapt.",hint:'Which adjective suggests openness to persuasion?',context:'Describing a person’s response to negotiation.'},
      {id:'C2-CAUSE-01',relationship:'cause-effect',words:['exacerbate','aggravate','compound','improve'],answer:3,explain:'Exacerbate, aggravate and compound mean to make a problem or situation worse. Improve means to improve it.',challengeExplain:"Worsen, intensify and magnify can increase the severity or scale of a problem. Moderate means to reduce its severity.",hint:'Three worsen a situation; one improves it.',context:'Precise verbs for changes in a situation.'},
      {id:'C2-WC-01',relationship:'word-class',words:['although','though','even though','notwithstanding'],answer:3,explain:'Although, though and even though are subordinating conjunctions followed by a clause with a subject and verb. Notwithstanding is a preposition followed by a noun phrase or an -ing form.',challengeExplain:'Whereas, while and even if introduce clauses. Regardless of is a prepositional phrase followed by a noun phrase or an -ing form.',hint:'Which option is followed by a noun phrase or an -ing form rather than a finite clause?',context:'Fine distinctions in clause structure.'},
      {id:'C2-SYN-02',relationship:'synonyms-antonyms',words:['rancour','resentment','animosity','hesitation'],answer:3,explain:'Rancour, resentment and animosity are forms of ill will or hostility. Hesitation is unwillingness to act and does not itself imply hostility.',challengeExplain:"Hostility, resentment and rancour all involve ill will or antagonism. Indifference is a lack of interest or emotional involvement.",hint:'Which noun describes hesitation rather than hostility?',context:'Fine shades among abstract nouns.'},
      {id:'C2-CAT-02',relationship:'category',words:['epigram','aphorism','maxim','catalogue'],answer:3,explain:'An epigram, aphorism and maxim are short sayings; a catalogue is a list or reference collection.',challengeExplain:'A proverb, adage and dictum are short sayings; a reference work is used to look up information.',hint:'Which three are concise statements rather than collections of material?',context:'Literary forms and reference works.'},
      {id:'C2-FUN-02',relationship:'function',words:['spectrometer','photometer','calorimeter','electrician'],answer:3,explain:'A spectrometer, photometer and calorimeter are instruments; an electrician is a person.',challengeExplain:'A dosimeter, manometer and tensiometer are measuring instruments; an engineer is a person.',hint:'Which three are measuring devices rather than people?',context:'Scientific instruments and their purpose.'},
      {id:'C2-PW-02',relationship:'part-whole',words:['clause','proviso','subsection','deed'],answer:3,explain:'A clause, proviso and subsection are parts of a legal document; a deed is a complete legal instrument.',challengeExplain:'An article, schedule and annex are components of a legal document; a lease is a complete legal document.',hint:'Which three can be sections or components within the complete legal document?',context:'The structure of formal legal agreements.'},
      {id:'C2-CTX-02',relationship:'contextual-meaning',words:['material','pertinent','germane','corporeal'],answer:3,explain:'Material, pertinent and germane mean relevant; corporeal refers to physical or bodily matters.',challengeExplain:'Salient, relevant and germane mean relevant; somatic refers to the body, not relevance.',hint:'Read “material” in the context of evidence presented in court.',context:'Interpreting a word whose meaning depends on a legal context.'}
    ]
  };

  // Dedicated alternatives for Challenge. The odd-one-out index is preserved.
  const CHALLENGE_WORDS = {
    "A1-CAT-01": [
        "orange",
        "grape",
        "peach",
        "screwdriver"
    ],
    "A1-CAT-02": [
        "tram",
        "coach",
        "ferry",
        "garage"
    ],
    "A1-FUN-01": [
        "blade",
        "shears",
        "chisel",
        "duvet"
    ],
    "A1-PW-01": [
        "wheel",
        "door",
        "seat",
        "mechanic"
    ],
    "A1-WC-01": [
        "eat",
        "drink",
        "sleep",
        "gentle"
    ],
    "A1-SYN-01": [
        "big",
        "large",
        "huge",
        "mini"
    ],
    "A1-FUN-02": [
        "passcode",
        "PIN",
        "keycard",
        "saucepan"
    ],
    "A1-CAT-03": [
        "Wednesday",
        "Saturday",
        "Sunday",
        "spring"
    ],
    "A1-CAT-04": [
        "jacket",
        "socks",
        "skirt",
        "apricot"
    ],
    "A1-PW-02": [
        "title",
        "page",
        "cover",
        "cartoonist"
    ],
    "A1-CAT-05": [
        "yellow",
        "black",
        "white",
        "soup"
    ],
    "A1-COL-01": [
        "breakfast",
        "lunch",
        "supper",
        "laundry"
    ],
    "A2-CAT-01": [
        "surgeon",
        "carpenter",
        "cashier",
        "garage"
    ],
    "A2-FUN-01": [
        "barometer",
        "measuring tape",
        "stopwatch",
        "duffel bag"
    ],
    "A2-SYN-01": [
        "commence",
        "launch",
        "initiate",
        "end"
    ],
    "A2-PW-01": [
        "preface",
        "glossary",
        "contents page",
        "archive"
    ],
    "A2-WC-01": [
        "growth",
        "refusal",
        "approval",
        "suggest"
    ],
    "A2-CTX-01": [
        "radiant",
        "well-lit",
        "glowing",
        "bulky"
    ],
    "A2-COL-01": [
        "reach",
        "make",
        "take",
        "assemble"
    ],
    "A2-REG-01": [
        "youths",
        "young people",
        "adolescents",
        "machinery"
    ],
    "A2-CAT-02": [
        "flute",
        "cello",
        "trumpet",
        "audience"
    ],
    "A2-CAUSE-01": [
        "black ice",
        "dense fog",
        "falling snow",
        "traffic rerouting"
    ],
    "A2-CON-01": [
        "considerate",
        "caring",
        "selfless",
        "cruel"
    ],
    "A2-FUN-02": [
        "passcode",
        "access card",
        "security token",
        "barrier"
    ],
    "B1-CAUSE-01": [
        "water scarcity",
        "failed crops",
        "reduced yields",
        "community concert"
    ],
    "B1-CTX-01": [
        "preliminary version",
        "working draft",
        "first outline",
        "completed report"
    ],
    "B1-COL-01": [
        "gusty",
        "strong",
        "howling",
        "fragrant"
    ],
    "B1-CTX-01B": [
        "even though",
        "whereas",
        "while",
        "as a result"
    ],
    "B1-FUN-01": [
        "safeguard",
        "insulate",
        "defend",
        "compromise"
    ],
    "B1-SYN-01": [
        "averse",
        "disinclined",
        "unenthusiastic",
        "keen"
    ],
    "B1-PW-01": [
        "subsection",
        "paragraph",
        "sentence",
        "thesis"
    ],
    "B1-REG-01": [
        "enquire",
        "request",
        "ask",
        "order"
    ],
    "B1-CAT-02": [
        "short story",
        "autobiography",
        "novella",
        "librarian"
    ],
    "B1-COL-02": [
        "heighten",
        "come to",
        "honour",
        "delightful"
    ],
    "B1-CON-01": [
        "tenacious",
        "steadfast",
        "persevering",
        "headstrong"
    ],
    "B1-FUN-02": [
        "condense",
        "encapsulate",
        "recapitulate",
        "discredit"
    ],
    "B2-REG-01": [
        "initiate",
        "commence",
        "begin",
        "get moving"
    ],
    "B2-COL-01": [
        "reach",
        "draw",
        "come to",
        "construct"
    ],
    "B2-CON-01": [
        "slender",
        "svelte",
        "willowy",
        "emaciated"
    ],
    "B2-CTX-01": [
        "booking",
        "reservation",
        "scheduled consultation",
        "protest"
    ],
    "B2-SYN-01": [
        "lessen",
        "alleviate",
        "mitigate",
        "deepen"
    ],
    "B2-WC-01": [
        "finance",
        "financial",
        "cost-effective",
        "historical"
    ],
    "B2-CAUSE-01": [
        "excessive workload",
        "fatigue",
        "burnout",
        "rejuvenation"
    ],
    "B2-PW-01": [
        "premise",
        "rebuttal",
        "supporting evidence",
        "position paper"
    ],
    "C1-REG-01": [
        "aver",
        "contend",
        "assert",
        "yell"
    ],
    "C1-CON-01": [
        "prudent",
        "thrifty",
        "frugal",
        "parsimonious"
    ],
    "C1-COL-01": [
        "register",
        "file",
        "voice",
        "compose"
    ],
    "C1-CTX-01": [
        "provisional",
        "tentative",
        "qualified",
        "unconditional"
    ],
    "C1-SYN-01": [
        "peruse",
        "scrutinise",
        "inspect",
        "ignore"
    ],
    "C1-CAUSE-01": [
        "engender",
        "precipitate",
        "trigger",
        "forestall"
    ],
    "C1-CTX-01B": [
        "conversely",
        "nevertheless",
        "nonetheless",
        "thus"
    ],
    "C1-PW-01": [
        "paragraph",
        "subsection",
        "chapter",
        "volume"
    ],
    "C1-CAT-02": [
        "haiku",
        "limerick",
        "villanelle",
        "poetry volume"
    ],
    "C1-FUN-02": [
        "seismograph",
        "thermometer",
        "altimeter",
        "scientist"
    ],
    "C1-WC-02": [
        "implicit",
        "ambivalent",
        "indeterminate",
        "vaguely"
    ],
    "C1-CAUSE-02": [
        "intensify",
        "compound",
        "heighten",
        "temper"
    ],
    "C2-CON-01": [
        "astute",
        "scrupulous",
        "meticulous",
        "fussy"
    ],
    "C2-REG-01": [
        "passed away",
        "deceased",
        "departed",
        "perished"
    ],
    "C2-COL-01": [
        "bitterly regret",
        "deeply regret",
        "profoundly regret",
        "happily regret"
    ],
    "C2-CTX-01": [
        "outlaw",
        "bar",
        "proscribe",
        "approve"
    ],
    "C2-SYN-01": [
        "obstinate",
        "inflexible",
        "intransigent",
        "flexible"
    ],
    "C2-CAUSE-01": [
        "worsen",
        "intensify",
        "magnify",
        "moderate"
    ],
    "C2-WC-01": [
        "whereas",
        "while",
        "even if",
        "regardless of"
    ],
    "C2-SYN-02": [
        "hostility",
        "resentment",
        "rancour",
        "indifference"
    ],
    "B2-CAT-02": [
        "trumpet",
        "trombone",
        "tuba",
        "wind band"
    ],
    "B2-FUN-02": [
        "governor",
        "rheostat",
        "regulator",
        "probe"
    ],
    "B2-WC-02": [
        "meticulous",
        "rigorous",
        "extensive",
        "systematically"
    ],
    "B2-CAUSE-02": [
        "instigate",
        "engender",
        "spark",
        "moderate"
    ],
    "C2-CTX-02": [
        "salient",
        "relevant",
        "germane",
        "somatic"
    ],
    "C2-CAT-02": [
        "proverb",
        "adage",
        "dictum",
        "reference work"
    ],
    "C2-FUN-02": [
        "dosimeter",
        "manometer",
        "tensiometer",
        "engineer"
    ],
    "C2-PW-02": [
        "article",
        "schedule",
        "annex",
        "lease"
    ]
};

  function validateBank(banks = BANKS) {
    const errors = [];
    const ids = new Set();
    const sets = new Set();
    for (const level of ['A1','A2','B1','B2','C1','C2']) {
      const items = banks[level];
      if (!Array.isArray(items) || !items.length) { errors.push(level + ': missing bank'); continue; }
      for (const item of items) {
        if (!item || typeof item.id !== 'string' || !item.id.startsWith(level + '-')) errors.push(level + ': invalid id');
        if (ids.has(item.id)) errors.push('duplicate id: ' + item.id);
        ids.add(item.id);
        if (!RELATIONSHIPS.includes(item.relationship)) errors.push(item.id + ': invalid relationship');
        if (!Array.isArray(item.words) || item.words.length !== 4 || item.words.some(w => typeof w !== 'string' || !w.trim())) errors.push(item.id + ': needs four words');
        if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3) errors.push(item.id + ': invalid answer index');
        if (typeof item.explain !== 'string' || item.explain.trim().length < 35) errors.push(item.id + ': explanation too short');
        if (typeof item.challengeExplain !== 'string' || item.challengeExplain.trim().length < 35) errors.push(item.id + ': Challenge explanation missing or too short');
        const challengeWords = CHALLENGE_WORDS[item.id];
        if (!Array.isArray(challengeWords) || challengeWords.length !== 4 || challengeWords.some(w => typeof w !== 'string' || !w.trim())) errors.push(item.id + ': needs four challenge words');
        else {
          const normalizedChallenge = challengeWords.map(w => w.toLowerCase().trim());
          if (new Set(normalizedChallenge).size !== 4) errors.push(item.id + ': duplicate challenge words');
          if (normalizedChallenge.slice().sort().join('|') === item.words.map(w => w.toLowerCase().trim()).sort().join('|')) errors.push(item.id + ': challenge set must differ from base set');
        }
        const wordSet = Array.isArray(item.words) ? item.words.map(w => w.toLowerCase().trim()).sort().join('|') : '';
        const uniqueSet = level + ':' + wordSet;
        if (sets.has(uniqueSet)) errors.push(item.id + ': duplicate word set in level');
        sets.add(uniqueSet);
      }
    }
    return {valid: errors.length === 0, errors};
  }

  function selectRound(level, trainingMode = 'steady', recentIds = [], random = Math.random) {
    const safeLevel = BANKS[level] ? level : 'A1';
    const targets = {guided:8,steady:10,challenge:12};
    const target = targets[trainingMode] || targets.steady;
    const recent = new Set(Array.isArray(recentIds) ? recentIds : []);
    const candidates = BANKS[safeLevel].filter(item => !recent.has(item.id));
    const pool = candidates.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.max(0, Math.min(i, Math.floor((Number(random()) || 0) * (i + 1))));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const chosen = [];
    const relationships = new Set();
    while (pool.length && chosen.length < target) {
      let bestIndex = 0, bestScore = -Infinity;
      pool.forEach((item, index) => {
        const score = (relationships.has(item.relationship) ? 0 : 10) + (index === 0 ? 1 : 0);
        if (score > bestScore) { bestScore = score; bestIndex = index; }
      });
      const [item] = pool.splice(bestIndex, 1);
      const sourceWords = trainingMode === 'challenge' ? CHALLENGE_WORDS[item.id] : item.words;
      const words = sourceWords.slice();
      const correctWord = words[item.answer];
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.max(0, Math.min(i, Math.floor((Number(random()) || 0) * (i + 1))));
        [words[i], words[j]] = [words[j], words[i]];
      }
      chosen.push({...item, explain:trainingMode === 'challenge' && item.challengeExplain ? item.challengeExplain : item.explain, words, answer:words.indexOf(correctWord)});
      relationships.add(item.relationship);
    }
    return {level:safeLevel,trainingMode:targets[trainingMode] ? trainingMode : 'steady',target,questions:chosen,shortened:chosen.length < target,available:candidates.length};
  }

  const api = Object.freeze({version:'odd-one-out-rotated-20261110-v2',relationships:RELATIONSHIPS,banks:BANKS,validateBank,selectRound});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.EPIPHANY_ODD_ONE_OUT_BANK = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
