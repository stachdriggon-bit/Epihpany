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
      {id:'A1-CAT-01',relationship:'category',words:['apple','pear','banana','pencil'],answer:3,explain:'Apple, pear and banana are fruits. A pencil is used for writing, not eaten.',hint:'Which three are foods?',context:'Everyday objects and food.'},
      {id:'A1-CAT-02',relationship:'category',words:['bus','train','bicycle','kitchen'],answer:3,explain:'A bus, train and bicycle are ways to travel. A kitchen is a room in a home.',hint:'Which three can help you travel?',context:'Getting from one place to another.'},
      {id:'A1-FUN-01',relationship:'function',words:['knife','scissors','saw','pillow'],answer:3,explain:'A knife, scissors and a saw are used for cutting. A pillow is used for resting your head.',hint:'Think about what each object is used to do.',context:'Common household objects.'},
      {id:'A1-PW-01',relationship:'part-whole',words:['handlebar','pedal','wheel','bicycle'],answer:3,explain:'A handlebar, pedal and wheel are parts of a bicycle. Bicycle names the complete vehicle.',hint:'Which three can be parts of the same thing?',context:'Parts of a familiar vehicle.'},
      {id:'A1-WC-01',relationship:'word-class',words:['quickly','slowly','carefully','careful'],answer:3,explain:'Quickly, slowly and carefully are adverbs describing how an action happens. Careful is an adjective.',hint:'Look at how each word is formed and used.',context:'Simple descriptions of actions.'},
      {id:'A1-SYN-01',relationship:'synonyms-antonyms',words:['big','large','huge','short'],answer:3,explain:'Big, large and huge have similar meanings about size. Short describes a small length or height and is not a synonym.',hint:'Which three describe size in a similar way?',context:'Basic size vocabulary.'},
      {id:'A1-FUN-02',relationship:'function',words:['key','password','code','plate'],answer:3,explain:'A key, password and code can all give access or unlock something. A plate is used for serving food.',hint:'Which three can help you open or access something?',context:'Simple everyday purposes.'},
      {id:'A1-CAT-03',relationship:'category',words:['Monday','Tuesday','Friday','summer'],answer:3,explain:'Monday, Tuesday and Friday are days of the week. Summer is a season.',hint:'Which three belong to the same calendar group?',context:'Days and seasons.'}
    ],
    A2: [
      {id:'A2-CAT-01',relationship:'category',words:['chemist','baker','dentist','bakery'],answer:3,explain:'A chemist, baker and dentist are people or occupations. A bakery is a place.',hint:'Separate people who do jobs from places.',context:'Work and places in a town.'},
      {id:'A2-FUN-01',relationship:'function',words:['thermometer','scale','ruler','suitcase'],answer:3,explain:'A thermometer measures temperature, a scale measures weight, and a ruler measures length. A suitcase carries belongings.',hint:'What do the first three measure?',context:'Useful objects and their purposes.'},
      {id:'A2-SYN-01',relationship:'synonyms-antonyms',words:['begin','start','commence','finish'],answer:3,explain:'Begin, start and commence mean to do something at the beginning. Finish means to bring it to an end.',hint:'Three words share a meaning; one is the opposite.',context:'Common verbs with similar meanings.'},
      {id:'A2-PW-01',relationship:'part-whole',words:['chapter','cover','index','novel'],answer:3,explain:'A chapter, cover and index are parts of a book. A novel is a complete kind of book.',hint:'Which three can be found inside or on a book?',context:'Parts of a book.'},
      {id:'A2-WC-01',relationship:'word-class',words:['decision','arrival','movement','decide'],answer:3,explain:'Decision, arrival and movement are nouns naming things or events. Decide is a verb.',hint:'Which word describes an action rather than naming it?',context:'Word families and grammar.'},
      {id:'A2-CTX-01',relationship:'contextual-meaning',words:['light','bright','sunny','heavy'],answer:3,explain:'In a description of a well-lit room, light, bright and sunny relate to illumination. Heavy describes weight.',hint:'Imagine the words describing a room with plenty of daylight.',context:'Words understood from a shared situation.'},
      {id:'A2-COL-01',relationship:'collocations',words:['make','reach','take','do'],answer:3,explain:'Make a decision, reach a decision and take a decision are established combinations. Do a decision is not a natural English expression.',hint:'Try the words before “a decision”, “homework” and “a break”.',context:'Common verb–noun partnerships.'},
      {id:'A2-REG-01',relationship:'register-tone',words:['kids','children','youngsters','furniture'],answer:3,explain:'Kids, children and youngsters can all refer to young people, with different levels of formality. Furniture is unrelated.',hint:'Which three can refer to the same group of people?',context:'Everyday and more formal vocabulary.'}
    ],
    B1: [
      {id:'B1-CAUSE-01',relationship:'cause-effect',words:['drought','water shortage','crop failure','harvest festival'],answer:3,explain:'Drought and water shortage can lead to crop failure. A harvest festival is a celebration, not an effect of water scarcity.',hint:'Follow the chain from a lack of rain to its likely result.',context:'Environment and consequences.'},
      {id:'B1-CTX-01',relationship:'contextual-meaning',words:['draft','outline','rough version','final copy'],answer:3,explain:'A draft, outline and rough version are stages or forms of work before completion. A final copy is the completed version.',hint:'Which three describe work that is not yet final?',context:'Preparing a written assignment.'},
      {id:'B1-COL-01',relationship:'collocations',words:['strong','heavy','pouring','bright'],answer:3,explain:'Strong wind, heavy rain and pouring rain are natural collocations. Bright does not normally describe wind or rain in these expressions.',hint:'Think of natural combinations with “wind” or “rain”.',context:'Weather collocations.'},
      {id:'B1-CTX-01B',relationship:'contextual-meaning',words:['although','despite','whereas','because'],answer:3,explain:'Although, despite and whereas introduce contrast or concession. Because introduces a reason, not a contrast.',hint:'Three connect contrasting ideas; one gives a reason.',context:'Linking ideas in a sentence.'},
      {id:'B1-FUN-01',relationship:'function',words:['insulate','shield','protect','expose'],answer:3,explain:'Insulate, shield and protect describe keeping something safe or separated from harm. Expose means to leave it open to something.',hint:'Which three help prevent contact or harm?',context:'Actions and their purposes.'},
      {id:'B1-SYN-01',relationship:'synonyms-antonyms',words:['reluctant','unwilling','hesitant','eager'],answer:3,explain:'Reluctant, unwilling and hesitant suggest not being ready or keen to act. Eager means strongly wanting to act.',hint:'Which word expresses the opposite attitude?',context:'Attitudes towards taking action.'},
      {id:'B1-PW-01',relationship:'part-whole',words:['paragraph','sentence','phrase','essay'],answer:3,explain:'A paragraph, sentence and phrase can be structural units within an essay. An essay is the larger complete text.',hint:'Which three can form parts of the larger piece of writing?',context:'Writing structure.'},
      {id:'B1-REG-01',relationship:'register-tone',words:['request','ask','inquire','demand'],answer:3,explain:'Request, ask and inquire can express seeking information or help, with different levels of formality. Demand adds force and authority, changing the tone.',hint:'Compare the politeness and force of each verb.',context:'Choosing an appropriate tone.'}
    ],
    B2: [
      {id:'B2-REG-01',relationship:'register-tone',words:['commence','begin','start','kick off'],answer:3,explain:'Commence, begin and start are neutral or formal ways to say that something begins. Kick off is more informal and often conversational.',hint:'Which expression is noticeably more informal?',context:'A formal announcement about an event.'},
      {id:'B2-COL-01',relationship:'collocations',words:['reach','draw','arrive','make'],answer:3,explain:'Reach a conclusion, draw a conclusion and arrive at a conclusion are established combinations. Make a conclusion is not the usual expression; speakers normally say make a decision.',hint:'Check which verbs naturally pair with “a question”, “a concern” and “an issue”.',context:'Precise verb–noun partnerships.'},
      {id:'B2-CON-01',relationship:'connotation',words:['slim','slender','lean','skinny'],answer:3,explain:'Slim, slender and lean can describe a thin shape neutrally or positively depending on context. Skinny often carries a more negative or critical implication.',hint:'Which adjective is more likely to sound critical?',context:'Describing a person’s build.'},
      {id:'B2-CTX-01',relationship:'contextual-meaning',words:['reservation','booking','appointment','objection'],answer:3,explain:'In a travel or service context, a reservation, booking and appointment refer to arrangements made in advance. An objection is an expression of disagreement.',hint:'Imagine arranging a service or meeting in advance.',context:'Arranging a hotel stay or meeting.'},
      {id:'B2-SYN-01',relationship:'synonyms-antonyms',words:['mitigate','ease','alleviate','intensify'],answer:3,explain:'Mitigate, ease and alleviate mean to make a problem or effect less severe. Intensify means to make it stronger.',hint:'Three reduce severity; one increases it.',context:'Discussing the effects of a problem.'},
      {id:'B2-WC-01',relationship:'word-class',words:['economics','economical','historic','historical'],answer:0,explain:'Economical, historic and historical are adjectives. Economics is a noun naming a field of study.',hint:'Compare the specific meaning, not only the grammatical form.',context:'A meaning distinction within adjectives.'},
      {id:'B2-CAUSE-01',relationship:'cause-effect',words:['overwork','fatigue','exhaustion','recovery'],answer:3,explain:'Overwork can cause fatigue, which may develop into exhaustion. Recovery is the process of returning to health or strength afterwards.',hint:'Which word describes what happens after the negative effects?',context:'Workload and wellbeing.'},
      {id:'B2-PW-01',relationship:'part-whole',words:['premise','supporting point','counterargument','argument'],answer:3,explain:'A premise, supporting point and counterargument are components used to build an argument. Argument names the complete piece of reasoning.',hint:'Which item normally comes at the end of an argument?',context:'The structure of an argument.'}
    ],
    C1: [
      {id:'C1-REG-01',relationship:'register-tone',words:['assert','maintain','contend','blurt'],answer:3,explain:'Assert, maintain and contend are verbs used to present or defend a position in formal or analytical discussion. Blurt suggests saying something suddenly and without care.',hint:'Which verb implies an uncontrolled or socially abrupt manner?',context:'Presenting a position in a debate.'},
      {id:'C1-CON-01',relationship:'connotation',words:['frugal','thrifty','economical','stingy'],answer:3,explain:'Frugal, thrifty and economical can praise careful use of resources. Stingy usually criticizes an unwillingness to spend or give.',hint:'Which word is most likely to criticize rather than praise?',context:'Describing someone’s approach to money.'},
      {id:'C1-COL-01',relationship:'collocations',words:['mount','lodge','harbour','nurture'],answer:3,explain:'Mount suspicion, lodge a complaint and harbour doubts are established combinations. Nurture is not normally used with those abstract nouns.',hint:'Test each verb with “suspicion”, “a complaint” and “doubts”.',context:'Advanced abstract-noun collocations.'},
      {id:'C1-CTX-01',relationship:'contextual-meaning',words:['qualified','tentative','provisional','categorical'],answer:3,explain:'A qualified, tentative or provisional statement leaves room for limits or revision. A categorical statement is definite and unreserved.',hint:'Which adjective signals certainty rather than qualification?',context:'Evaluating the strength of a claim.'},
      {id:'C1-SYN-01',relationship:'synonyms-antonyms',words:['scrutinise','examine','inspect','overlook'],answer:3,explain:'Scrutinise, examine and inspect involve looking at something carefully. Overlook can mean to fail to notice it.',hint:'Which verb can mean failing to notice?',context:'Careful analysis and attention.'},
      {id:'C1-CAUSE-01',relationship:'cause-effect',words:['precipitate','trigger','prompt','prevent'],answer:3,explain:'Precipitate, trigger and prompt can describe something that brings an event or response about. Prevent means to stop it from happening.',hint:'Three can initiate an outcome; one blocks it.',context:'Describing how events are brought about.'},
      {id:'C1-CTX-01B',relationship:'contextual-meaning',words:['nevertheless','nonetheless','however','therefore'],answer:3,explain:'Nevertheless, nonetheless and however signal contrast or concession. Therefore signals a consequence or conclusion.',hint:'Which connector points to a result rather than a contrast?',context:'Academic discourse markers.'},
      {id:'C1-PW-01',relationship:'part-whole',words:['clause','subsection','chapter','monograph'],answer:3,explain:'A clause, subsection and chapter can be constituent parts of a longer written work. A monograph is the complete scholarly work.',hint:'Which one names the whole publication rather than a section?',context:'Academic writing structures.'}
    ],
    C2: [
      {id:'C2-CON-01',relationship:'connotation',words:['discerning','meticulous','scrupulous','pedantic'],answer:3,explain:'Discerning, meticulous and scrupulous can praise good judgement, care or integrity. Pedantic is more often critical, suggesting excessive attention to minor rules or details.',hint:'Which word most readily carries a mildly dismissive tone?',context:'Subtle evaluation of a person’s standards.'},
      {id:'C2-REG-01',relationship:'register-tone',words:['deceased','late','departed','dead'],answer:3,explain:'Deceased, late and departed are softened or euphemistic ways to refer to someone who has died. Dead is direct and can sound blunt in sensitive contexts.',hint:'Which word is the most direct and least euphemistic?',context:'Sensitive formal communication.'},
      {id:'C2-COL-01',relationship:'collocations',words:['bitterly','deeply','profoundly','vehemently'],answer:3,explain:'Bitterly regret, deeply regret and profoundly regret are established combinations. Vehemently is more naturally paired with verbs such as deny or oppose.',hint:'Look for the most established adverb–verb pairings, not merely grammatical ones.',context:'Nuanced adverb–verb collocation.'},
      {id:'C2-CTX-01',relationship:'contextual-meaning',words:['sanction','approve','authorise','prohibit'],answer:0,explain:'Approve, authorise and prohibit are distinct but clear actions about permission or restriction; sanction is the outsider here because it can mean either officially approve or impose a penalty, making it context-dependent and potentially ambiguous.',hint:'Which word has two contrasting established meanings?',context:'A word whose meaning depends strongly on context.'},
      {id:'C2-SYN-01',relationship:'synonyms-antonyms',words:['intransigent','unyielding','obdurate','amenable'],answer:3,explain:'Intransigent, unyielding and obdurate describe someone unwilling to change their position. Amenable suggests willingness to agree or be influenced.',hint:'Which adjective suggests openness to persuasion?',context:'Describing a person’s response to negotiation.'},
      {id:'C2-CAUSE-01',relationship:'cause-effect',words:['exacerbate','aggravate','compound','ameliorate'],answer:3,explain:'Exacerbate, aggravate and compound mean to make a problem or situation worse. Ameliorate means to improve it.',hint:'Three worsen a situation; one improves it.',context:'Precise verbs for changes in a situation.'},
      {id:'C2-WC-01',relationship:'word-class',words:['albeit','though','although','despite'],answer:3,explain:'Albeit, though and although can introduce a concessive clause or idea. Despite is a preposition and is followed by a noun phrase or -ing form, not a finite clause.',hint:'Which word has a different grammatical pattern after it?',context:'Fine distinctions in clause structure.'},
      {id:'C2-SYN-02',relationship:'synonyms-antonyms',words:['rancour','resentment','animosity','reluctance'],answer:3,explain:'Rancour, resentment and animosity are forms of ill will or hostility. Reluctance is unwillingness to act and does not itself imply hostility.',hint:'Which noun describes hesitation rather than hostility?',context:'Fine shades among abstract nouns.'}
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
      chosen.push(item);
      relationships.add(item.relationship);
    }
    return {level:safeLevel,trainingMode:targets[trainingMode] ? trainingMode : 'steady',target,questions:chosen,shortened:chosen.length < target,available:candidates.length};
  }

  const api = Object.freeze({relationships:RELATIONSHIPS,banks:BANKS,validateBank,selectRound});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.EPIPHANY_ODD_ONE_OUT_BANK = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
