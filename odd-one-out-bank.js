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
      {id:'A1-CAT-01',relationship:'category',words:['apple','pear','banana','pencil'],answer:3,explain:'Apple, pear and banana are fruits. A pencil is used for writing, not eaten.',challengeExplain:"Orange, grape and peach are fruits. A notebook is used for writing or drawing, not eaten.",hint:'Which three are foods?',context:'Everyday objects and food.'},
      {id:'A1-CAT-02',relationship:'category',words:['bus','train','bicycle','kitchen'],answer:3,explain:'A bus, train and bicycle are ways to travel. A kitchen is a room in a home.',challengeExplain:"A tram, coach and ferry are ways to travel. A bedroom is a room in a home.",hint:'Which three can help you travel?',context:'Getting from one place to another.'},
      {id:'A1-FUN-01',relationship:'function',words:['knife','scissors','saw','pillow'],answer:3,explain:'A knife, scissors and a saw are used for cutting. A pillow is used for resting your head.',challengeExplain:"A blade, shears and a chisel are tools used for cutting or shaping materials. A blanket keeps someone warm or covers a bed.",hint:'Think about what each object is used to do.',context:'Common household objects.'},
      {id:'A1-PW-01',relationship:'part-whole',words:['door','window','seat','car'],answer:3,explain:'A door, window and seat are parts of a car. Car names the complete vehicle.',challengeExplain:'A wheel, door and seat are parts of a car. A driver is the person who drives it, not a component.',hint:'Which three are parts of the same vehicle?',context:'Parts of a familiar car.'},
      {id:'A1-WC-01',relationship:'word-class',words:['run','walk','jump','happy'],answer:3,explain:'Run, walk and jump are verbs naming actions. Happy is an adjective describing a feeling.',challengeExplain:'Eat, drink and sleep are verbs naming actions. Kind is an adjective describing a person.',hint:'Which three words name actions?',context:'Everyday actions and feelings.'},
      {id:'A1-SYN-01',relationship:'synonyms-antonyms',words:['big','large','huge','small'],answer:3,explain:'Big, large and huge describe something of great size. Small describes something of little size.',challengeExplain:'Big, large and huge describe something of great size. Tiny describes something of very small size.',hint:'Which three describe size in a similar way?',context:'Basic size vocabulary.'},
      {id:'A1-FUN-02',relationship:'function',words:['key','password','code','plate'],answer:3,explain:'A key, password and code can all give access or unlock something. A plate is used for serving food.',challengeExplain:"A passcode, PIN and keycard can grant access to something. A bowl is used to hold or serve food.",hint:'Which three can help you open or access something?',context:'Simple everyday purposes.'},
      {id:'A1-CAT-03',relationship:'category',words:['Monday','Tuesday','Friday','summer'],answer:3,explain:'Monday, Tuesday and Friday are days of the week. Summer is a season.',challengeExplain:"Wednesday, Saturday and Sunday are days of the week. Winter is a season.",hint:'Which three belong to the same calendar group?',context:'Days and seasons.'},
      {id:'A1-CAT-04',relationship:'category',words:['shirt','trousers','shoes','orange'],answer:3,explain:'A shirt, trousers and shoes are things people wear. An orange is a fruit.',challengeExplain:'A jacket, socks and a skirt are things people wear. A banana is a fruit.',hint:'Which three can you wear?',context:'Clothes and everyday objects.'},
      {id:'A1-PW-02',relationship:'part-whole',words:['page','cover','chapter','reader'],answer:3,explain:'A page, cover and chapter are parts of a book. A reader is the person who reads it.',challengeExplain:'A title, page and cover are parts of a book. An author is the person who writes it.',hint:'Which three are parts of the same object?',context:'Parts of a familiar book.'},
      {id:'A1-CAT-05',relationship:'category',words:['red','blue','green','bread'],answer:3,explain:'Red, blue and green are colours. Bread is a food.',challengeExplain:'Yellow, black and white are colours. Cheese is a food.',hint:'Which three name colours?',context:'Basic colours and food.'},
      {id:'A1-COL-01',relationship:'collocations',words:['breakfast','lunch','dinner','homework'],answer:3,explain:'We commonly say “eat breakfast”, “eat lunch” and “eat dinner”. We say “do homework”, not “eat homework”.',challengeExplain:'“Eat breakfast”, “eat lunch” and “eat supper” are natural combinations. “Do homework” is the natural expression for schoolwork.',hint:'Which three words naturally follow the verb “eat”?',context:'Common verb and noun combinations.'}
    ],
    A2: [
      {id:'A2-CAT-01',relationship:'category',words:['chemist','baker','dentist','bakery'],answer:3,explain:'A chemist, baker and dentist are people or occupations. A bakery is a place.',challengeExplain:"A surgeon, carpenter and cashier are people with occupations. A clinic is a place where medical care is provided.",hint:'Separate people who do jobs from places.',context:'Work and places in a town.'},
      {id:'A2-FUN-01',relationship:'function',words:['thermometer','scale','ruler','suitcase'],answer:3,explain:'A thermometer measures temperature, a scale measures weight, and a ruler measures length. A suitcase carries belongings.',challengeExplain:"A barometer measures air pressure, a measuring tape measures length, and a stopwatch measures time. A backpack carries belongings.",hint:'What do the first three measure?',context:'Useful objects and their purposes.'},
      {id:'A2-SYN-01',relationship:'synonyms-antonyms',words:['begin','start','commence','finish'],answer:3,explain:'Begin, start and commence mean to do something at the beginning. Finish means to bring it to an end.',challengeExplain:"Commence, launch and initiate can mean to begin something. Conclude means to bring it to an end.",hint:'Three words share a meaning; one is the opposite.',context:'Common verbs with similar meanings.'},
      {id:'A2-PW-01',relationship:'part-whole',words:['chapter','cover','index','novel'],answer:3,explain:'A chapter, cover and index are parts of a book. A novel is a complete kind of book.',challengeExplain:"A preface, glossary and contents page are parts of a book. A library is a place or collection where books are kept.",hint:'Which three can be found inside or on a book?',context:'Parts of a book.'},
      {id:'A2-WC-01',relationship:'word-class',words:['decision','arrival','movement','decide'],answer:3,explain:'Decision, arrival and movement are nouns naming things or events. Decide is a verb.',challengeExplain:"Growth, refusal and approval are nouns naming processes or outcomes. Refuse is a verb.",hint:'Which word describes an action rather than naming it?',context:'Word families and grammar.'},
      {id:'A2-CTX-01',relationship:'contextual-meaning',words:['light','bright','luminous','heavy'],answer:3,explain:'Light, bright and luminous can all describe a place or object that gives or reflects plenty of light. Heavy describes weight.',challengeExplain:"Radiant, well-lit and glowing can describe something that gives or reflects light. Weighty refers to physical heaviness or importance.",hint:'Imagine the words describing a room with plenty of daylight.',context:'Words understood from a shared situation.'},
      {id:'A2-COL-01',relationship:'collocations',words:['make','reach','take','do'],answer:3,explain:'Make a decision, reach a decision and take a decision are established combinations. Do a decision is not a natural English expression.',challengeExplain:"Reach a decision, make a decision and take a decision are established combinations. Perform a decision is not a natural collocation; perform is used with actions or tasks.",hint:'Try the words before “a decision”, “homework” and “a break”.',context:'Common verb–noun partnerships.'},
      {id:'A2-REG-01',relationship:'register-tone',words:['kids','children','youngsters','furniture'],answer:3,explain:'Kids, children and youngsters can all refer to young people, with different levels of formality. Furniture is unrelated.',challengeExplain:"Youths, young people and adolescents all refer to young people. Equipment refers to tools or items needed for an activity.",hint:'Which three can refer to the same group of people?',context:'Everyday and more formal vocabulary.'},
      {id:'A2-CAT-02',relationship:'category',words:['violin','guitar','piano','concert'],answer:3,explain:'A violin, guitar and piano are musical instruments. A concert is an event where people perform music.',challengeExplain:'A flute, cello and trumpet are musical instruments. An orchestra is a group of musicians, not an instrument.',hint:'Which three are objects musicians play?',context:'Music, instruments and events.'},
      {id:'A2-CAUSE-01',relationship:'cause-effect',words:['icy roads','heavy rain','poor visibility','road closure'],answer:3,explain:'Icy roads, heavy rain and poor visibility are conditions that can cause a road to close. A road closure is the result, not a condition.',challengeExplain:'Black ice, dense fog and falling snow are hazardous conditions that can lead to a road being closed. A diversion is a route used after a closure, not a hazardous condition.',hint:'Which three are dangerous conditions, rather than a response to them?',context:'Weather conditions and their consequences.'},
      {id:'A2-CON-01',relationship:'connotation',words:['generous','kind','thoughtful','selfish'],answer:3,explain:'Generous, kind and thoughtful usually have positive associations when describing a person. Selfish has a negative association.',challengeExplain:'Considerate, caring and selfless usually suggest positive qualities. Greedy usually suggests a negative quality.',hint:'Which three usually praise someone’s behaviour?',context:'Positive and negative impressions of character.'},
      {id:'A2-FUN-02',relationship:'function',words:['key','password','code','door'],answer:3,explain:'A key, password and code can all be used to gain access. A door is the thing someone may need to open or pass through.',challengeExplain:'A passcode, access card and security token can all verify permission to enter a system or place. A gate is the barrier being opened, not proof of permission.',hint:'Which three can prove or provide permission to enter?',context:'Access and security.'}
    ],
    B1: [
      {id:'B1-CAUSE-01',relationship:'cause-effect',words:['drought','water shortage','crop failure','harvest festival'],answer:3,explain:'Drought and water shortage can lead to crop failure. A harvest festival is a celebration, not an effect of water scarcity.',challengeExplain:'Water scarcity, failed crops and reduced yields can all result from drought. A seasonal celebration is an event, not an environmental or agricultural consequence.',hint:'Follow the chain from a lack of rain to its likely result.',context:'Environment and consequences.'},
      {id:'B1-CTX-01',relationship:'contextual-meaning',words:['draft','outline','rough version','final copy'],answer:3,explain:'A draft, outline and rough version are stages or forms of work before completion. A final copy is the completed version.',challengeExplain:"A preliminary version, working draft and first outline are forms of work that are not yet final. A published edition is a completed version made available to readers.",hint:'Which three describe work that is not yet final?',context:'Preparing a written assignment.'},
      {id:'B1-COL-01',relationship:'collocations',words:['strong','heavy','pouring','bright'],answer:3,explain:'Strong wind, heavy rain and pouring rain are natural collocations. Bright does not normally describe wind or rain in these expressions.',challengeExplain:'Gusty wind, strong wind and howling wind are natural combinations. Vivid does not normally describe wind in this way.',hint:'Think of natural combinations with “wind” or “rain”.',context:'Weather collocations.'},
      {id:'B1-CTX-01B',relationship:'contextual-meaning',words:['although','whereas','while','because'],answer:3,explain:'Although, whereas and while can connect clauses that contrast two ideas. Because introduces a reason.',challengeExplain:"Even though, whereas and while can introduce contrast between ideas. Since usually introduces a reason or a point in time.",hint:'Three connect contrasting ideas; one gives a reason.',context:'Linking ideas in a sentence.'},
      {id:'B1-FUN-01',relationship:'function',words:['insulate','shield','protect','expose'],answer:3,explain:'Insulate, shield and protect describe keeping something safe or separated from harm. Expose means to leave it open to something.',challengeExplain:"Safeguard, insulate and defend can describe protecting something from harm or unwanted influence. Jeopardise means to put it at risk.",hint:'Which three help prevent contact or harm?',context:'Actions and their purposes.'},
      {id:'B1-SYN-01',relationship:'synonyms-antonyms',words:['reluctant','unwilling','hesitant','eager'],answer:3,explain:'Reluctant, unwilling and hesitant suggest not being ready or keen to act. Eager means strongly wanting to act.',challengeExplain:"Averse, disinclined and unenthusiastic all suggest unwillingness or a lack of eagerness. Willing expresses readiness to act.",hint:'Which word expresses the opposite attitude?',context:'Attitudes towards taking action.'},
      {id:'B1-PW-01',relationship:'part-whole',words:['paragraph','sentence','phrase','essay'],answer:3,explain:'A paragraph, sentence and phrase can be structural units within an essay. An essay is the larger complete text.',challengeExplain:"A subsection, paragraph and sentence can be structural parts of a larger publication. Publication names the complete work or act of making it available.",hint:'Which three can form parts of the larger piece of writing?',context:'Writing structure.'},
      {id:'B1-REG-01',relationship:'register-tone',words:['request','ask','inquire','demand'],answer:3,explain:'Request, ask and inquire can express seeking information or help, with different levels of formality. Demand adds force and authority, changing the tone.',challengeExplain:"Enquire, request and ask can be used to seek information or help. Insist expresses firm pressure or determination rather than a simple enquiry.",hint:'Compare the politeness and force of each verb.',context:'Choosing an appropriate tone.'},
      {id:'B1-CAT-02',relationship:'category',words:['novel','memoir','biography','publisher'],answer:3,explain:'A novel, memoir and biography are types of books or written works. A publisher is a person or company that produces and distributes them.',challengeExplain:'A short story, autobiography and novella are literary forms. An editor is a person who prepares or improves a text, not a literary form.',hint:'Which three are kinds of written work?',context:'Books and publishing.'},
      {id:'B1-COL-02',relationship:'collocations',words:['raise','reach','meet','strong'],answer:3,explain:'Raise awareness, reach an agreement and meet a deadline are established word partnerships. Strong does not form the same verb-plus-object pattern.',challengeExplain:'Heighten awareness, come to an agreement and fulfil a deadline are natural combinations. Vivid does not fit these collocations.',hint:'Look for verbs that commonly combine with a noun to form a phrase.',context:'Common verb-noun collocations.'},
      {id:'B1-CON-01',relationship:'connotation',words:['persistent','determined','resolute','stubborn'],answer:3,explain:'Persistent, determined and resolute usually praise someone’s continued effort. Stubborn often suggests an unreasonable refusal to change.',challengeExplain:'Tenacious, steadfast and persevering usually convey positive persistence. Obstinate often carries a negative suggestion of unreasonable inflexibility.',hint:'Which word often changes persistence from a strength into a criticism?',context:'Nuance in descriptions of character.'},
      {id:'B1-FUN-02',relationship:'function',words:['summarise','outline','recap','criticise'],answer:3,explain:'Summarise, outline and recap all present the main points of something. Criticise means to judge or point out faults.',challengeExplain:'Condense, encapsulate and recapitulate all mean to present the main points briefly. Disparage means to speak about something as if it were of little value.',hint:'Which three give the main points rather than evaluate something?',context:'Academic and communication purposes.'}
    ],
    B2: [
      {id:'B2-REG-01',relationship:'register-tone',words:['commence','begin','start','kick off'],answer:3,explain:'Commence, begin and start are neutral or formal ways to say that something begins. Kick off is more informal and often conversational.',challengeExplain:"Initiate, commence and begin are neutral or formal ways to say that something starts. Get going is more informal and conversational.",hint:'Which expression is noticeably more informal?',context:'A formal announcement about an event.'},
      {id:'B2-COL-01',relationship:'collocations',words:['reach','draw','arrive','make'],answer:3,explain:'Reach a conclusion, draw a conclusion and arrive at a conclusion are established combinations. Make a conclusion is not the usual expression; speakers normally say make a decision.',challengeExplain:"Reach a conclusion, draw a conclusion and come to a conclusion are established combinations. Manufacture a conclusion is not a natural collocation.",hint:'Which three verbs naturally combine with “a conclusion”?',context:'Precise verb–noun partnerships.'},
      {id:'B2-CON-01',relationship:'connotation',words:['slim','slender','lean','skinny'],answer:3,explain:'Slim, slender and lean can describe a thin shape neutrally or positively depending on context. Skinny often carries a more negative or critical implication.',challengeExplain:'Slender, svelte and willowy can describe a slim shape, often positively. Gaunt usually suggests an excessively thin or unhealthy appearance.',hint:'Which adjective is more likely to sound critical?',context:'Describing a person’s build.'},
      {id:'B2-CTX-01',relationship:'contextual-meaning',words:['reservation','booking','appointment','objection'],answer:3,explain:'In a travel or service context, a reservation, booking and appointment refer to arrangements made in advance. An objection is an expression of disagreement.',challengeExplain:"A booking, reservation and scheduled consultation are arrangements made in advance. A disagreement is a difference of opinion, not an appointment.",hint:'Imagine arranging a service or meeting in advance.',context:'Arranging a hotel stay or meeting.'},
      {id:'B2-SYN-01',relationship:'synonyms-antonyms',words:['mitigate','ease','alleviate','intensify'],answer:3,explain:'Mitigate, ease and alleviate mean to make a problem or effect less severe. Intensify means to make it stronger.',challengeExplain:"Lessen, alleviate and mitigate mean to reduce the severity or impact of something. Aggravate means to make it worse.",hint:'Three reduce severity; one increases it.',context:'Discussing the effects of a problem.'},
      {id:'B2-WC-01',relationship:'word-class',words:['economics','economical','historic','historical'],answer:0,explain:'Economical, historic and historical are adjectives. Economics is a noun naming a field of study.',challengeExplain:"Economics is a noun naming a field of study. Financial, cost-effective and historical are adjectives.",hint:'Compare the specific meaning, not only the grammatical form.',context:'A meaning distinction within adjectives.'},
      {id:'B2-CAUSE-01',relationship:'cause-effect',words:['overwork','fatigue','exhaustion','recovery'],answer:3,explain:'Overwork can cause fatigue, which may develop into exhaustion. Recovery is the process of returning to health or strength afterwards.',challengeExplain:"An excessive workload can lead to fatigue and burnout. Restoration refers to a process of recovery or returning something to a former condition.",hint:'Which word describes what happens after the negative effects?',context:'Workload and wellbeing.'},
      {id:'B2-PW-01',relationship:'part-whole',words:['premise','supporting point','counterargument','argument'],answer:3,explain:'A premise, supporting point and counterargument are components used to build an argument. Argument names the complete piece of reasoning.',challengeExplain:"A premise, rebuttal and supporting evidence are components of an argument. A reasoned case is the complete line of reasoning.",hint:'Which item normally comes at the end of an argument?',context:'The structure of an argument.'}
    ],
    C1: [
      {id:'C1-REG-01',relationship:'register-tone',words:['assert','maintain','contend','blurt'],answer:3,explain:'Assert, maintain and contend are verbs used to present or defend a position in formal or analytical discussion. Blurt suggests saying something suddenly and without care.',challengeExplain:'Aver, contend and assert are used to state or defend a position, often in formal discussion. Mutter describes speaking quietly or indistinctly rather than formally presenting a claim.',hint:'Which verb implies an uncontrolled or socially abrupt manner?',context:'Presenting a position in a debate.'},
      {id:'C1-CON-01',relationship:'connotation',words:['frugal','thrifty','economical','stingy'],answer:3,explain:'Frugal, thrifty and economical can praise careful use of resources. Stingy usually criticizes an unwillingness to spend or give.',challengeExplain:"Prudent, thrifty and frugal can describe careful, sensible use of money or resources. Miserly is more negative, suggesting an excessive unwillingness to spend or give.",hint:'Which word is most likely to criticize rather than praise?',context:'Describing someone’s approach to money.'},
      {id:'C1-COL-01',relationship:'collocations',words:['mount','lodge','harbour','file'],answer:3,explain:'Mount suspicion, lodge a complaint and harbour doubts are established combinations. File is natural with a complaint, but not with suspicion or doubts in these expressions.',challengeExplain:"Arouse suspicion, lodge a complaint and harbour doubts are established combinations. Compile does not naturally pair with these nouns in the same way.",hint:'Test each verb with “suspicion”, “a complaint” and “doubts”.',context:'Advanced abstract-noun collocations.'},
      {id:'C1-CTX-01',relationship:'contextual-meaning',words:['qualified','tentative','provisional','categorical'],answer:3,explain:'A qualified, tentative or provisional statement leaves room for limits or revision. A categorical statement is definite and unreserved.',challengeExplain:"Provisional, tentative and qualified all signal limits, uncertainty or room for revision. Unequivocal means clear and leaving no doubt.",hint:'Which adjective signals certainty rather than qualification?',context:'Evaluating the strength of a claim.'},
      {id:'C1-SYN-01',relationship:'synonyms-antonyms',words:['scrutinise','examine','inspect','overlook'],answer:3,explain:'Scrutinise, examine and inspect involve looking at something carefully. Overlook can mean to fail to notice it.',challengeExplain:"Peruse, scrutinise and inspect all involve examining or reading something carefully. Neglect means failing to give it proper attention.",hint:'Which verb can mean failing to notice?',context:'Careful analysis and attention.'},
      {id:'C1-CAUSE-01',relationship:'cause-effect',words:['precipitate','trigger','prompt','prevent'],answer:3,explain:'Precipitate, trigger and prompt can describe something that brings an event or response about. Prevent means to stop it from happening.',challengeExplain:"Engender, precipitate and trigger can describe bringing about an event or response. Avert means to prevent it.",hint:'Three can initiate an outcome; one blocks it.',context:'Describing how events are brought about.'},
      {id:'C1-CTX-01B',relationship:'contextual-meaning',words:['nevertheless','nonetheless','however','therefore'],answer:3,explain:'Nevertheless, nonetheless and however signal contrast or concession. Therefore signals a consequence or conclusion.',challengeExplain:"Conversely, nevertheless and nonetheless signal contrast or a counterpoint. Accordingly signals a result or consequence.",hint:'Which connector points to a result rather than a contrast?',context:'Academic discourse markers.'},
      {id:'C1-PW-01',relationship:'part-whole',words:['clause','subsection','chapter','monograph'],answer:3,explain:'A clause, subsection and chapter can be constituent parts of a longer written work. A monograph is the complete scholarly work.',challengeExplain:"A paragraph, subsection and chapter are parts of a larger written work. A book is the complete work, not one of its sections.",hint:'Which one names the whole publication rather than a section?',context:'Academic writing structures.'}
    ],
    C2: [
      {id:'C2-CON-01',relationship:'connotation',words:['discerning','meticulous','scrupulous','pedantic'],answer:3,explain:'Discerning, meticulous and scrupulous can praise good judgement, care or integrity. Pedantic is more often critical, suggesting excessive attention to minor rules or details.',challengeExplain:'Astute, scrupulous and meticulous can praise judgement, care or thoroughness. Finicky is more likely to criticize someone for being excessively particular about small details.',hint:'Which word most readily carries a mildly dismissive tone?',context:'Subtle evaluation of a person’s standards.'},
      {id:'C2-REG-01',relationship:'register-tone',words:['deceased','late','departed','dead'],answer:3,explain:'Deceased, late and departed are softened or euphemistic ways to refer to someone who has died. Dead is direct and can sound blunt in sensitive contexts.',challengeExplain:'Passed away, deceased and departed are softened or euphemistic expressions for death. Died is more direct and may sound blunt in especially sensitive contexts.',hint:'Which word is the most direct and least euphemistic?',context:'Sensitive formal communication.'},
      {id:'C2-COL-01',relationship:'collocations',words:['bitterly','deeply','profoundly','vehemently'],answer:3,explain:'Bitterly regret, deeply regret and profoundly regret are established combinations. Vehemently is more naturally paired with verbs such as deny or oppose.',challengeExplain:'Bitterly regret, deeply regret and profoundly regret are established combinations. Vociferously is more naturally used with verbs such as protest, object or complain.',hint:'Look for the most established adverb–verb pairings, not merely grammatical ones.',context:'Nuanced adverb–verb collocation.'},
      {id:'C2-CTX-01',relationship:'synonyms-antonyms',words:['prohibit','forbid','ban','permit'],answer:3,explain:'Prohibit, forbid and ban all mean to prevent something from being done. Permit means to allow it.',challengeExplain:"Outlaw, bar and proscribe all mean to prohibit or prevent something. Allow means to permit it.",hint:'Compare the direction of each verb: restriction or permission.',context:'Formal and everyday verbs for prohibition and permission.'},
      {id:'C2-SYN-01',relationship:'synonyms-antonyms',words:['intransigent','unyielding','obdurate','amenable'],answer:3,explain:'Intransigent, unyielding and obdurate describe someone unwilling to change their position. Amenable suggests willingness to agree or be influenced.',challengeExplain:"Obstinate, inflexible and intransigent describe an unwillingness to change one’s position. Compliant suggests willingness to obey or adapt.",hint:'Which adjective suggests openness to persuasion?',context:'Describing a person’s response to negotiation.'},
      {id:'C2-CAUSE-01',relationship:'cause-effect',words:['exacerbate','aggravate','compound','ameliorate'],answer:3,explain:'Exacerbate, aggravate and compound mean to make a problem or situation worse. Ameliorate means to improve it.',challengeExplain:"Worsen, intensify and magnify can increase the severity or scale of a problem. Alleviate means to reduce its severity.",hint:'Three worsen a situation; one improves it.',context:'Precise verbs for changes in a situation.'},
      {id:'C2-WC-01',relationship:'word-class',words:['albeit','though','although','despite'],answer:3,explain:'Albeit, though and although can introduce a concessive clause or idea. Despite is a preposition and is followed by a noun phrase or -ing form, not a finite clause.',challengeExplain:'Albeit, though and although can introduce a concessive clause. In spite of is a prepositional phrase followed by a noun phrase or an -ing form, not a finite clause.',hint:'Which word has a different grammatical pattern after it?',context:'Fine distinctions in clause structure.'},
      {id:'C2-SYN-02',relationship:'synonyms-antonyms',words:['rancour','resentment','animosity','reluctance'],answer:3,explain:'Rancour, resentment and animosity are forms of ill will or hostility. Reluctance is unwillingness to act and does not itself imply hostility.',challengeExplain:"Hostility, resentment and rancour all involve ill will or antagonism. Apathy is a lack of interest or emotional involvement.",hint:'Which noun describes hesitation rather than hostility?',context:'Fine shades among abstract nouns.'}
    ]
  };

  // Dedicated alternatives for Challenge. The odd-one-out index is preserved.
  const CHALLENGE_WORDS = {
    "A1-CAT-01": [
        "orange",
        "grape",
        "peach",
        "notebook"
    ],
    "A1-CAT-02": [
        "tram",
        "coach",
        "ferry",
        "bedroom"
    ],
    "A1-FUN-01": [
        "blade",
        "shears",
        "chisel",
        "blanket"
    ],
    "A1-PW-01": [
        "wheel",
        "door",
        "seat",
        "driver"
    ],
    "A1-WC-01": [
        "eat",
        "drink",
        "sleep",
        "kind"
    ],
    "A1-SYN-01": [
        "big",
        "large",
        "huge",
        "tiny"
    ],
    "A1-FUN-02": [
        "passcode",
        "PIN",
        "keycard",
        "bowl"
    ],
    "A1-CAT-03": [
        "Wednesday",
        "Saturday",
        "Sunday",
        "winter"
    ],
    "A1-CAT-04": [
        "jacket",
        "socks",
        "skirt",
        "banana"
    ],
    "A1-PW-02": [
        "title",
        "page",
        "cover",
        "author"
    ],
    "A1-CAT-05": [
        "yellow",
        "black",
        "white",
        "cheese"
    ],
    "A1-COL-01": [
        "breakfast",
        "lunch",
        "supper",
        "homework"
    ],
    "A2-CAT-01": [
        "surgeon",
        "carpenter",
        "cashier",
        "clinic"
    ],
    "A2-FUN-01": [
        "barometer",
        "measuring tape",
        "stopwatch",
        "backpack"
    ],
    "A2-SYN-01": [
        "commence",
        "launch",
        "initiate",
        "conclude"
    ],
    "A2-PW-01": [
        "preface",
        "glossary",
        "contents page",
        "library"
    ],
    "A2-WC-01": [
        "growth",
        "refusal",
        "approval",
        "refuse"
    ],
    "A2-CTX-01": [
        "radiant",
        "well-lit",
        "glowing",
        "weighty"
    ],
    "A2-COL-01": [
        "reach",
        "make",
        "take",
        "perform"
    ],
    "A2-REG-01": [
        "youths",
        "young people",
        "adolescents",
        "equipment"
    ],
    "A2-CAT-02": [
        "flute",
        "cello",
        "trumpet",
        "orchestra"
    ],
    "A2-CAUSE-01": [
        "black ice",
        "dense fog",
        "falling snow",
        "diversion"
    ],
    "A2-CON-01": [
        "considerate",
        "caring",
        "selfless",
        "greedy"
    ],
    "A2-FUN-02": [
        "passcode",
        "access card",
        "security token",
        "gate"
    ],
    "B1-CAUSE-01": [
        "water scarcity",
        "failed crops",
        "reduced yields",
        "seasonal celebration"
    ],
    "B1-CTX-01": [
        "preliminary version",
        "working draft",
        "first outline",
        "published edition"
    ],
    "B1-COL-01": [
        "gusty",
        "strong",
        "howling",
        "vivid"
    ],
    "B1-CTX-01B": [
        "even though",
        "whereas",
        "while",
        "since"
    ],
    "B1-FUN-01": [
        "safeguard",
        "insulate",
        "defend",
        "jeopardise"
    ],
    "B1-SYN-01": [
        "averse",
        "disinclined",
        "unenthusiastic",
        "willing"
    ],
    "B1-PW-01": [
        "subsection",
        "paragraph",
        "sentence",
        "publication"
    ],
    "B1-REG-01": [
        "enquire",
        "request",
        "ask",
        "insist"
    ],
    "B1-CAT-02": [
        "short story",
        "autobiography",
        "novella",
        "editor"
    ],
    "B1-COL-02": [
        "heighten",
        "come to",
        "fulfil",
        "vivid"
    ],
    "B1-CON-01": [
        "tenacious",
        "steadfast",
        "persevering",
        "obstinate"
    ],
    "B1-FUN-02": [
        "condense",
        "encapsulate",
        "recapitulate",
        "disparage"
    ],
    "B2-REG-01": [
        "initiate",
        "commence",
        "begin",
        "get going"
    ],
    "B2-COL-01": [
        "reach",
        "draw",
        "come to",
        "manufacture"
    ],
    "B2-CON-01": [
        "slender",
        "svelte",
        "willowy",
        "gaunt"
    ],
    "B2-CTX-01": [
        "booking",
        "reservation",
        "scheduled consultation",
        "disagreement"
    ],
    "B2-SYN-01": [
        "lessen",
        "alleviate",
        "mitigate",
        "aggravate"
    ],
    "B2-WC-01": [
        "economics",
        "financial",
        "cost-effective",
        "historical"
    ],
    "B2-CAUSE-01": [
        "excessive workload",
        "fatigue",
        "burnout",
        "restoration"
    ],
    "B2-PW-01": [
        "premise",
        "rebuttal",
        "supporting evidence",
        "reasoned case"
    ],
    "C1-REG-01": [
        "aver",
        "contend",
        "assert",
        "mutter"
    ],
    "C1-CON-01": [
        "prudent",
        "thrifty",
        "frugal",
        "miserly"
    ],
    "C1-COL-01": [
        "arouse",
        "lodge",
        "harbour",
        "compile"
    ],
    "C1-CTX-01": [
        "provisional",
        "tentative",
        "qualified",
        "unequivocal"
    ],
    "C1-SYN-01": [
        "peruse",
        "scrutinise",
        "inspect",
        "neglect"
    ],
    "C1-CAUSE-01": [
        "engender",
        "precipitate",
        "trigger",
        "avert"
    ],
    "C1-CTX-01B": [
        "conversely",
        "nevertheless",
        "nonetheless",
        "accordingly"
    ],
    "C1-PW-01": [
        "paragraph",
        "subsection",
        "chapter",
        "book"
    ],
    "C2-CON-01": [
        "astute",
        "scrupulous",
        "meticulous",
        "finicky"
    ],
    "C2-REG-01": [
        "passed away",
        "deceased",
        "departed",
        "died"
    ],
    "C2-COL-01": [
        "bitterly",
        "deeply",
        "profoundly",
        "vociferously"
    ],
    "C2-CTX-01": [
        "outlaw",
        "bar",
        "proscribe",
        "allow"
    ],
    "C2-SYN-01": [
        "obstinate",
        "inflexible",
        "intransigent",
        "compliant"
    ],
    "C2-CAUSE-01": [
        "worsen",
        "intensify",
        "magnify",
        "alleviate"
    ],
    "C2-WC-01": [
        "albeit",
        "though",
        "although",
        "in spite of"
    ],
    "C2-SYN-02": [
        "hostility",
        "resentment",
        "rancour",
        "apathy"
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

  const api = Object.freeze({relationships:RELATIONSHIPS,banks:BANKS,validateBank,selectRound});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.EPIPHANY_ODD_ONE_OUT_BANK = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
