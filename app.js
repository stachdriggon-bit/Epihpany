/* Epiphany app logic. Lesson content lives in data.js (LEVELS, GAMES, AR_EXPLANATIONS).
   Saved progress keeps the same localStorage key and shape as the first prototype. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ic = n => '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  if(!document.querySelector('link[href*="mini-games.css"]')) { const miniStyle=document.createElement('link'); miniStyle.rel='stylesheet'; miniStyle.href='mini-games.css?v=mini-games-20261024'; document.head.appendChild(miniStyle); }
  const dayKey = (d = new Date()) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  const weekKey = (d = new Date()) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); };
  const DAILY_QUESTS = [
    {title:'Finish one quest',desc:'Play any game from start to results.',target:1,kind:'quests',reward:15},
    {title:'Earn 25 XP today',desc:'Keep learning and collect 25 XP today.',target:25,kind:'xp',reward:15},
    {title:'Get 4 answers right',desc:'Answer 4 questions correctly on your first try.',target:4,kind:'correct',reward:15}
  ];

  /* ---------- state ---------- */
  const defaults = () => ({xp:0, quests:0, words:[], review:[], adaptiveOffset:0, adaptiveStreak:0, adaptiveSignals:{}, learningActivity:{days:{}}, dailyChallengeDate:null, dailyChallengeResult:null, dailySessionDate:null, dailySessionStep:'review', dailySessionDone:false, oneLifeBest:0, translationEnabled:true, storyReaderSettings:{fontScale:1,lineSpacing:1.75,nightMode:false}, placementDone:false, assessedLevel:'A1', placementResult:null, xpAtLevelStart:null, promotionHistory:[], promotionAttempts:{}, lastPromotionResult:null, completed:[], streak:0, lastDay:null, daily:0, level:'A1', sound:true, helpArabic:false, theme:'light', streakFreezes:1, dailyQuestDate:null, dailyQuestProgress:0, dailyQuestClaimed:false, dailyCorrect:0, dailyXp:0, weeklyKey:null, weeklyProgress:0, weeklyClaimed:false, mistakeTrapErrors:{}, mistakeQuestionErrors:{}, mistakeTrapCorrect:{}, mistakeQuestionCorrect:{}, mistakeTrapSrs:{}, modes:{}, weakTraps:{}, recentQuestions:{}, stories:{}, world:{done:[],stars:{}}});
  let state;
  try { state = {...defaults(), ...JSON.parse(localStorage.getItem('epiphany-progress') || '{}')}; } catch { state = defaults(); }
  if (!LEVELS.some(level => level.id === state.assessedLevel)) { state.assessedLevel = 'A1'; state.placementDone = false; state.placementResult = null; }
  if (!Number.isFinite(state.xpAtLevelStart)) state.xpAtLevelStart = Number(state.xp) || 0; // Existing players start the new promotion cycle from their current XP.
  if (!Array.isArray(state.promotionHistory)) state.promotionHistory = [];
  if (!state.promotionAttempts || typeof state.promotionAttempts !== 'object' || Array.isArray(state.promotionAttempts)) state.promotionAttempts = {};
  if (!Array.isArray(state.review)) state.review = [];
  if (!state.adaptiveSignals || typeof state.adaptiveSignals !== 'object' || Array.isArray(state.adaptiveSignals)) state.adaptiveSignals = {};
  if (!state.learningActivity || typeof state.learningActivity !== 'object' || Array.isArray(state.learningActivity)) state.learningActivity = {days:{}};
  if (!state.learningActivity.days || typeof state.learningActivity.days !== 'object' || Array.isArray(state.learningActivity.days)) state.learningActivity.days = {};
  if (!state.mistakeTrapErrors || typeof state.mistakeTrapErrors !== 'object' || Array.isArray(state.mistakeTrapErrors)) state.mistakeTrapErrors = {};
  if (!state.mistakeQuestionErrors || typeof state.mistakeQuestionErrors !== 'object' || Array.isArray(state.mistakeQuestionErrors)) state.mistakeQuestionErrors = {};
  if (!state.mistakeTrapCorrect || typeof state.mistakeTrapCorrect !== 'object' || Array.isArray(state.mistakeTrapCorrect)) state.mistakeTrapCorrect = {};
  if (!state.mistakeTrapSrs || typeof state.mistakeTrapSrs !== 'object' || Array.isArray(state.mistakeTrapSrs)) state.mistakeTrapSrs = {};
  if (!state.mistakeQuestionCorrect || typeof state.mistakeQuestionCorrect !== 'object' || Array.isArray(state.mistakeQuestionCorrect)) state.mistakeQuestionCorrect = {};
  if (!state.modes || typeof state.modes !== 'object' || Array.isArray(state.modes)) state.modes = {};
  if (!state.weakTraps || typeof state.weakTraps !== 'object' || Array.isArray(state.weakTraps)) state.weakTraps = {};
  if (!state.recentQuestions || typeof state.recentQuestions !== 'object' || Array.isArray(state.recentQuestions)) state.recentQuestions = {};
  if (!state.stories || typeof state.stories !== 'object' || Array.isArray(state.stories)) state.stories = {};
  if (!state.world || typeof state.world !== 'object' || Array.isArray(state.world)) state.world = {done:[],stars:{}};
  if (!Array.isArray(state.world.done)) state.world.done = [];
  if (!state.world.stars || typeof state.world.stars !== 'object' || Array.isArray(state.world.stars)) state.world.stars = {};
  if (!Number.isFinite(state.streakFreezes)) state.streakFreezes = 1;
  if (!state.storyReaderSettings || typeof state.storyReaderSettings !== 'object') state.storyReaderSettings = {fontScale:1,lineSpacing:1.75,nightMode:false};
  state.storyReaderSettings.fontScale = Math.max(0.85, Math.min(1.35, Number(state.storyReaderSettings.fontScale) || 1));
  state.storyReaderSettings.lineSpacing = Math.max(1.45, Math.min(2.25, Number(state.storyReaderSettings.lineSpacing) || 1.75));
  state.storyReaderSettings.nightMode = !!state.storyReaderSettings.nightMode;
  if (!Number.isFinite(state.adaptiveOffset)) state.adaptiveOffset = 0;
  state.adaptiveOffset = Math.max(-2, Math.min(2, Math.round(state.adaptiveOffset)));
  if (!Number.isFinite(state.adaptiveStreak)) state.adaptiveStreak = 0;
  if (!Number.isFinite(state.oneLifeBest)) state.oneLifeBest = 0;
  if (state.lastDay !== dayKey()) state.daily = 0;
  if (state.dailyQuestDate !== dayKey()) {
    const hadDailyQuest = !!state.dailyQuestDate;
    state.dailyQuestDate = dayKey(); state.dailyQuestProgress = 0; state.dailyQuestClaimed = false; state.dailyCorrect = 0; state.dailyXp = 0;
    if (hadDailyQuest) window.EpiphanyNotifications?.dailyReset(state.dailyQuestDate);
  }
  if (state.weeklyKey !== weekKey()) {
    const hadWeeklyChallenge = !!state.weeklyKey;
    state.weeklyKey = weekKey(); state.weeklyProgress = 0; state.weeklyClaimed = false;
    if (hadWeeklyChallenge) window.EpiphanyNotifications?.weeklyReset(state.weeklyKey);
  }
  let saveWarned = false;
  function save() {
    if (DEV_MODE.active && hasDeveloperAccess()) return;
    try { localStorage.setItem('epiphany-progress', JSON.stringify(state)); }
    catch { if (!saveWarned) { saveWarned = true; toast('Progress can’t be saved in this browser. It will last for this visit only.'); } }
    if (window.EpiphanyAuth && typeof window.EpiphanyAuth.queueSave === 'function') {
      window.EpiphanyAuth.queueSave(state);
    }
  }

  /* ---------- game metadata (look & feel per game) ---------- */
  const META = {
    vocabulary:{label:'Vocabulary',   tone:'violet', glyph:'Aa',   time:3, blurb:'Grow your vocabulary in context.'},
    grammar:   {label:'Grammar',      tone:'coral',  glyph:'S+V',  time:4, blurb:'Build accurate, natural sentences.'},
    story:     {label:'Real life',    tone:'mint',   icon:'chat',   time:5, blurb:'Make choices in everyday conversations.'},
    listening: {label:'Comprehension',tone:'sky',    icon:'search', time:4, blurb:'Understand messages, tone and intent.'},
    spelling:  {label:'Spelling',     tone:'pink',   glyph:'abc',  time:3, blurb:'Sharpen spelling and word recognition.'},
    advanced:  {label:'Advanced',     tone:'ink',    icon:'spark',  time:6, blurb:'Explore precise language and subtle meaning.'},
    mistakes:  {label:'Common mistakes', tone:'coral', glyph:'?!', time:4, blurb:'Learn from common English mistakes.'},
    personalized:{label:'Your weak spots',tone:'coral',glyph:'↻',time:4,blurb:'Practice the mistake patterns you personally repeat.'},
    spot:      {label:'Spot the Mistake', tone:'coral', glyph:'?!', time:4, blurb:'Tap the one incorrect word.'},
    typing:    {label:'Type It', tone:'sky', glyph:'Aa', time:4, blurb:'Write the missing word from memory.'}
  };
  const ORDER = ['vocabulary', 'spelling', 'grammar', 'story', 'listening', 'advanced', 'mistakes', 'typing'];
  const UNLOCK = {vocabulary:0, spelling:0, grammar:1, story:2, listening:3, advanced:4, mistakes:0, spot:0, typing:0};
  GAMES.mistakes = {title:'Common Mistakes', category:'GRAMMAR', xp:40, desc:'Understand common mistakes made by English learners.', questions:MISTAKE_QUESTIONS.map(q=>({q:q.prompt,sub:q.sub,answers:q.options,correct:q.answer,explain:q.why_en,word:null,level:q.level,ar:q.arabic_hint,id:q.id,trap:q.trap,why_ar:q.why_ar,arabic_hint:q.arabic_hint,aha:null}))};
  GAMES.personalized = {title:'Your Weak Spots',category:'PERSONAL REVIEW',xp:45,desc:'A short practice set built from the mistake patterns you have missed before.',questions:GAMES.mistakes.questions.slice()};
  // Assign a topic only when the prompt or its explanation provides a clear grammar signal.
  // These tags let writing and error-spotting rounds share the same review history as grammar.
  function inferGrammarTrap(q) {
    const text = [q.prompt,q.text,q.why_en,q.why_ar,q.hint,q.answer,q.fix].filter(Boolean).join(' ').toLowerCase();
    const has = re => re.test(text);
    const prompt = String(q.prompt || q.text || '').toLowerCase();
    const hint = String(q.hint || '').toLowerCase().trim();
    const why = String(q.why_en || '').toLowerCase();
    // Prefer the question's explicit hint and sentence structure over incidental words in explanations.
    // High-priority distinctions: these sentence patterns should win over generic collocation words in explanations.
    if (/\b(?:little did .* (?:know|knew|realise|realised)|not only did .* miss(?:ed)?|only when .* did .* (?:emerge|emerged)|after did)\b/.test(prompt)) return 'past-simple';
    if (/\b(?:it is high time|high time we|high time he|high time she)\b/.test(prompt)) return 'past-time';
    if (/\b(?:data (?:shows|indicates)|implications has|each of the proposals have|neither of the options are|neither answer are)\b/.test(prompt)) return 'be-verbs';

    if (/\b(?:look forward to|used to|suggest(?:ed)? .*ing|denied .*ing|avoid .*ing|enjoy .*ing|insist(?:ed)? on .*ing|needs? testing|needs? revising|suggested him to|suggested to applying)\b/.test(prompt)) return 'verb-patterns';
    if (/\b(?:no sooner|hardly .* when|hardly i arrived|little did .*|not only did .*|only when .* did|rarely .* reached|not until .* did|scarcely .* when)\b/.test(prompt)) return 'inversion';
    if (/\b(?:despite of|in spite the|although .* but|not so much .* than|much as .* admire|despite .* exhausted)\b/.test(prompt)) return 'concession';
    if (/\b(?:he has visited .* last year|has visited .* last year|has .* yesterday|have .* last week)\b/.test(prompt)) return 'past-time';
    if (/\b(?:can you give me an advice|a good news|less books|much people|there are much people|the news are|data (?:shows|indicates)|implications has)\b/.test(prompt)) return 'countable-uncountable';
    if (/\b(?:is agree|am agree|are agree)\b/.test(prompt)) return 'verb-patterns';
    if (/\b(?:if i will see her|if i would have|if i knew .* i will|as if .* but .* started last year|as though)\b/.test(prompt)) return 'conditionals';

    if (/\b(he|she|it) (?:go|live|play|work)\b|\b(?:every day|on fridays)\b/.test(prompt) && /\b(?:go|live|play|work|study)\b/.test(prompt)) return 'present-simple';
    if (/\bi am agree\b|\bremove am\b/.test(prompt+' '+why)) return 'verb-patterns';
    if (/\b(?:they|we|you|i|he|she|it) (?:is|are|am|was|were)\b|\b(?:this are|those is|there is many|there are a cat|friends is|we was|they is|he are|i is)\b/.test(prompt)) return 'am-is-are';
    if (/\b(?:despite of|in spite the|although .* but)\b/.test(prompt)) return 'concession';
    if (/\btoo scant to warrants?\b/.test(prompt)) return 'infinitives';
    if (/\b(?:last year|yesterday|two days ago|last week)\b/.test(prompt) && /\b(?:has|have|had)\b/.test(prompt)) return 'past-time';
    if (/\b(?:needs ___|needs to be|needs .* before publication|device needs)\b/.test(prompt)) return 'verb-patterns';
    if (/\b(?:less books|much people|many books|a good news|an advice|some advice)\b/.test(prompt) || /\b(advice is uncountable|use fewer with countable|use many with countable|news looks plural|data is often treated as plural|data is often treated as a plural)\b/.test(why)) return 'countable-uncountable';
    if (/\b(?:doesn't|does not|didn't|did not|after did|after doesn't|after didn’t)\b/.test(prompt) || /\bafter (?:doesn't|does not|did|didn't|didn’t)\b/.test(why)) return 'past-simple';
    if (/\b(?:since|for)\b/.test(prompt) && /\b(?:2022|may|five years|two hours|three hours|period continuing|marks a period)\b/.test(prompt+' '+why)) return 'since-for';
    if (/\b(?:look forward to|interested in|consistent with|responsible of|responsible for|at odds|contingent|give rise|lend credence|predicated|depend of|depend on|liable of|liable to|cast doubt|open to interpretation|alludes to|interested on|good in mathematics|explained me|explained the problem me|comprises of|comprised of|mutually exclusive|borne out|insofar|scarcely|no sooner|hardly had)\b/.test(prompt)) return 'formal-collocations';
    if (hint === 'present perfect' || /\b(present perfect uses have\/has|present perfect|since may marks a period continuing|have already|has went|has visited .* last year)\b/.test(prompt+' '+why)) return 'present-perfect';
    if (hint === 'past continuous' || /\b(past continuous|was watching|were watching|action was in progress|when another past event)\b/.test(prompt+' '+why)) return 'past-time';
    if (hint === 'present continuous' || /\b(present continuous|be \+ verb-ing)\b/.test(hint+' '+why)) return 'verb-patterns';
    if (hint === 'third conditional' || /\bthird conditional|would have \+ past participle|past counterfactual result\b/.test(hint+' '+why) || /\bwould have\b/.test(prompt)) return 'conditionals';
    if (/\b(recommended that|demanded that|insisted that|board insisted that|suggested that he revise|mandative subjunctive)\b/.test(prompt+' '+why)) return 'subjunctive';
    if (/\b(no sooner|scarcely|hardly had|little did|not only did|only when .* did|fronted for emphasis|invert the auxiliary and subject)\b/.test(prompt+' '+why)) return 'inversion';
    if (hint === 'preposition') {
      if (/\b(monday|fridays|2022|since|for five years|for two hours|in the morning|at night|on monday)\b/.test(prompt)) return 'in-on-at';
      return 'formal-collocations';
    }
    if (hint === 'past participle') {
      if (/\b(would have|had i known|were it not|if i had|if i had studied)\b/.test(prompt)) return 'conditionals';
      if (/\b(could be|to be .* independently|remain to be|was .* implemented|were .* analysed|be .* out)\b/.test(prompt)) return 'verb-patterns';
      if (/\b(have|has|had) already\b/.test(prompt)) return 'present-perfect';
    }
    if (hint === 'auxiliary' && /\bimplications\b/.test(prompt)) return 'be-verbs';
    if (hint === 'be' && /\bthere\b/.test(prompt)) return 'be-verbs';
    if (hint === 'plural' && /\bchilds\b/.test(prompt)) return 'plurals';
    if (hint === 'adverb' || hint === 'adjective') return 'word-choice';
    if (hint === 'comparative') return 'comparatives';
    if (hint === 'result') return 'linking-words';
    if (has(/\b(device needs|needs testing|denied .*document|insist(?:ed)? on .*leave|insist on \+ noun|followed by an? -ing)\b/)) return 'verb-patterns';
    if (has(/\b(results, together with|together with the appendix|head of the subject|subject-verb agreement|agreement with the subject)\b/)) return 'be-verbs';
    if (has(/\b(passive construction|past participle|could be .* out|could be ruled out)\b/)) return 'verb-patterns';
    if (has(/\b(too .* to warrant|after the infinitive marker to|after to use the base form|infinitive marker to|infinitive form is required)\b/)) return 'infinitives';
    if (has(/\b(use were with we|were with we|was with i|was with he|was\/were|was and were)\b/)) return 'am-is-are';
    // High-confidence patterns for writing and error-spotting items with generic explanations.
    if (has(/\b(present continuous|be \+ verb-ing|verb-ing|verb ending in -ing)\b|\b(are|is|am) go(ing)? to\b/)) return 'verb-patterns';
    if (has(/\b(recommended that|insisted that|essential that|demand that|mandative subjunctive|base-form subjunctive)\b/)) return 'subjunctive';
    if (has(/\b(denied|suggested|insisted on|needs?)(?: \w+){0,3}\b(ing|taking|signing|testing|leaving)\b|\b(followed by an? -ing|followed by -ing|gerund)\b/)) return 'verb-patterns';
    if (has(/\b(sc(ar|arcely)|scarcely|no sooner|hardly had|scarcely.*than|scarcely.*when)\b|\b(fronted for emphasis|subject-auxiliary inversion|negative fronted phrase|inversion)\b/)) return 'inversion';
    if (has(/\b(not so much|insofar than|insofar as|much as .* admire|although|despite|concession|concessive clause|contrastive construction)\b/)) return 'concession';
    if (has(/\b(borne out|give rise to|gives rise for|lend credence|at odds|mutually exclusive|contingent on|predicated on|fixed phrase|fixed expression|standard collocation|standard phrase|paired construction|usual paired construction|collocation is|phrase is)\b/)) return 'formal-collocations';
    if (has(/\b(more interesting|the more .* the|the more you|better than|comparative adjective|comparative form|comparative)\b/)) return 'comparatives';
    if (has(/\b(so introduces the result|result of being|therefore|result clause|linking word|linking words|conjunction)\b/)) return 'linking-words';
    if (has(/\b(adverb form|adjective form|adjective describes|describes the thing|causes a feeling|imperceptible|conclusive|consistent|word means|means sufficient|word choice|choose the correct word)\b/)) return 'word-choice';
    if (has(/\b(any rather than some|any is commonly used|negative sentences|negative statements|isn't .* some|there isn't .* some)\b/)) return 'quantifiers';
    if (has(/\b(singular demonstrative|this are|each of the proposals|head of the subject is each|singular verb|singular noun phrase|subject takes a singular verb|takes a singular verb)\b/)) return 'be-verbs';
    if (has(/\b(agree is a verb|i am agree|remove am)\b/)) return 'verb-patterns';
    if (has(/\b(after the auxiliary did|after did|use the base form|base form of the verb|after did or didn't)\b/)) return 'past-simple';
    if (has(/\b(he, use the present-simple|present-simple form ending in -s|use has with he|third-person singular|third person singular)\b/)) return 'present-simple';
    if (has(/\b(as though|as if|unreal comparison|would have|past counterfactual|past unreal condition)\b/)) return 'conditionals';
    if (has(/\b(news is uncountable|uncountable noun|uncountable in english|countable noun|countability)\b/)) return 'countable-uncountable';
    if (has(/\b(so \+ adjective|fronted for emphasis|invert the auxiliary and subject)\b/)) return 'inversion';
    if (has(/\b(am|is|are) with (i|you|we|they|he|she|it)\b|subject pronoun.*\b(am|is|are)\b|\bbe verb\b|\bbe-verbs?\b|\bwas and were\b|\bwas\/were\b|\b(is|are|am)\b.*\b(subject|pronoun)\b/)) return 'am-is-are';
    if (has(/\b(can|could|should|must|might|may|would)\b.*\b(base form|base verb|bare infinitive)\b|after can|modal verb/)) return 'modals';
    if (has(/\bcan\b/)) return 'can';
    if (has(/\b(present perfect|have\/has|has or have|since and for|since\/for)\b/)) return has(/\bsince\b|\bfor\b.*\bduration\b/) ? 'since-for' : 'present-perfect';
    if (has(/\bsince\b.*\bfor\b|\bfor\b.*\bsince\b/)) return 'since-for';
    if (has(/\b(article|a or an|a\/an|use an before|use a before|the before|definite article|indefinite article)\b|\ba apple\b|\ban (?:university|hour)\b/)) return 'articles';
    if (has(/\b(plural|plurals|plural noun|plural form|ends in s|add s to the noun|irregular plural)\b/)) return 'plurals';
    if (has(/\b(past simple|simple past|past tense|past form|irregular verb|yesterday|last week|ago)\b/)) return 'past-simple';
    if (has(/\b(present simple|simple present|he\/she\/it|third person|adds? -s|add -s|verb ending in -s|every day)\b/)) return 'present-simple';
    if (has(/\b(preposition|prepositions|in, on, at|in\/on\/at|at the weekend|on monday|in the morning|preposition of time|preposition of place)\b/)) return 'in-on-at';
    if (has(/\b(comparative|superlative|than me|-er than|more .* than|the most|the best|better than)\b/)) return 'comparatives';
    if (has(/\b(possessive|possessive adjective|my, your|his, her|their|whose)\b/)) return 'possessives';
    if (has(/\b(pronoun|subject pronoun|object pronoun|he, she, it|me and him|they and them)\b/)) return 'pronouns';
    if (has(/\b(gerund|verb\+ing|verb followed by -ing|enjoy .*ing|avoid .*ing)\b/)) return 'gerunds';
    if (has(/\b(infinitive|to + verb|to-infinitive|verb followed by to)\b/)) return 'infinitives';
    if (has(/\b(conditionals?|if clause|if .* will|would have|second conditional|third conditional)\b/)) return 'conditionals';
    if (has(/\b(relative clause|who, which|that refers to|whose refers)\b/)) return 'relative-clauses';
    if (has(/\b(countable|uncountable|much or many|much vs many|countable noun|uncountable noun)\b/)) return 'countable-uncountable';
    if (has(/\b(much, many|few, little|a few|a little|quantifier|some or any|some\/any)\b/)) return 'quantifiers';
    if (has(/\b(word order|order of words|sentence order|adverb position|place the adverb)\b/)) return 'word-order';
    if (has(/\b(adjective order|order of adjectives|adjectives before nouns)\b/)) return 'adjective-order';
    if (has(/\b(word choice|choose the correct word|confusing words|collocation|fixed expression|standard expression|say .+ not)\b/)) return 'word-choice';
    if (has(/\b(doesn't|does not|after does|after doesn't|base form of the verb|base verb)\b/)) return 'present-simple';
    if (has(/\b(past continuous|was \+ verb-ing|were \+ verb-ing|action was in progress|when another past event)\b/)) return 'past-time';
    if (has(/\b(wish i|i wish|wish he|wish she|if i .* i'd|second conditional|if clause)\b/)) return 'wish';
    if (has(/\b(suggested|look forward to|used to|followed by .*ing|followed by a noun or an -ing|enjoy|avoid)\b/)) return 'verb-patterns';
    if (has(/\b(past perfect|by the time|had arrived|had already|earlier past action)\b/)) return 'past-time';
    if (has(/\b(neither .* nor|neither answer|subject-verb agreement|agrees with the subject|agreement with the subject)\b/)) return 'be-verbs';
    if (has(/\b(asked me where|reported speech|indirect question|reported question)\b/)) return 'reported-speech';
    if (has(/\b(explain something to someone|married to|comprises? .*without of|despite .*of|in spite of|look forward to|no sooner .* than|although .* but|concession|contrast)\b/)) return 'formal-collocations';
    if (has(/\b(demand that|subjunctive|base-form subjunctive|formal english often uses the base)\b/)) return 'subjunctive';
    if (has(/\b(inversion|no sooner|not only .* but also|hardly had|rarely do)\b/)) return 'inversion';
    if (has(/\b(use on with days|days of the week|on monday|in monday|at monday)\b/)) return 'in-on-at';
    if (has(/\b(use the base verb with i|base verb with i for a regular habit|regular habit|verb after does stays)\b/)) return 'present-simple';
    return null;
  }
  GAMES.spot = {title:'Spot the Mistake',category:'GRAMMAR',xp:40,desc:'Tap the one incorrect word in a short text.',questions:SPOT_QUESTIONS.map(q=>({...q,q:q.text,sub:'Tap the one incorrect word.',answers:[q.fix],correct:q.wrongIndex,explain:q.why_en,trap:inferGrammarTrap(q),aha:null,mode:'spot'}))};
  GAMES.typing = {title:'Type It',category:'WRITING',xp:45,desc:'Write the missing word without multiple-choice hints.',questions:TYPING_QUESTIONS.map(q=>({...q,q:q.prompt,sub:'Hint: '+q.hint,answers:q.accept,correct:0,explain:q.why_en,trap:inferGrammarTrap(q),aha:null,mode:'typing'}))};
  const AHA_BY_QUESTION = Object.fromEntries(AHA_NOTES.map(note=>[note.questionId,note]));
  Object.values(GAMES).forEach(game=>(game.questions||[]).forEach(item=>{const note=AHA_BY_QUESTION[item.id];if(note)item.aha={en:note.en,ar:note.ar};}));   // level index that suggests each game
  const LEVEL_GAME = ['vocabulary', 'grammar', 'story', 'listening', 'advanced', 'advanced']; // same mapping the world map used
  const glyph = g => META[g].icon ? ic(META[g].icon) : META[g].glyph;

  /* ---------- derived values ---------- */
  // CEFR is determined by the placement assessment, never by XP earned in games.
  const hasDeveloperAccess = () => !!(window.EpiphanyAuth && typeof window.EpiphanyAuth.isDeveloper === 'function' && window.EpiphanyAuth.isDeveloper());
  const DEV_MODE = {active:false, level:'A1', snapshot:null};
  const levelIndex = () => DEV_MODE.active && hasDeveloperAccess() ? Math.max(0, LEVELS.findIndex(level => level.id === DEV_MODE.level)) : Math.max(0, LEVELS.findIndex(level => level.id === state.assessedLevel));
  const currentLevel = () => LEVELS[levelIndex()];
  const liveStreak = () => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return state.lastDay === dayKey() || state.lastDay === dayKey(y) || (state.lastDay === dayKey(twoDaysAgo) && state.streakFreezes > 0) ? (state.streak || 0) : 0;
  };
  const GRAMMAR_SRS_DAYS = [1, 3, 7, 14, 30];
  function updateGrammarSrs(q, correct) {
    if (!q || !q.trap || !q.id) return;
    const today = dayKey(), old = state.mistakeTrapSrs[q.trap] || {};
    const next = {...old, attempts:(Number(old.attempts)||0)+1, correct:(Number(old.correct)||0)+(correct?1:0), errors:(Number(old.errors)||0)+(correct?0:1), lastResult:correct?'correct':'wrong', lastSeen:today};
    if (!correct) {
      next.box = 0; next.streak = 0; next.due = today;
    } else {
      next.streak = (Number(old.streak)||0)+1;
      next.box = Math.min(GRAMMAR_SRS_DAYS.length, (Number(old.box)||0) + 1);
      const dueDate = new Date(today + 'T12:00:00');
      dueDate.setDate(dueDate.getDate() + GRAMMAR_SRS_DAYS[next.box - 1]);
      next.due = dayKey(dueDate);
    }
    state.mistakeTrapSrs[q.trap] = next;
  }
  function grammarQuestionWeight(q) {
    const topic = state.mistakeTrapSrs[q.trap] || {}, errors = Number(state.mistakeTrapErrors[q.trap])||0, correct = Number(state.mistakeTrapCorrect[q.trap])||0;
    const qErrors = Number(state.mistakeQuestionErrors[q.id])||0, qCorrect = Number(state.mistakeQuestionCorrect[q.id])||0;
    const due = !!topic.due && topic.due <= dayKey(), overdueDays = due ? Math.max(0, Math.floor((new Date(dayKey()+'T12:00:00') - new Date(topic.due+'T12:00:00')) / 86400000)) : 0;
    const box = Number(topic.box)||0, attempts = Number(topic.attempts)||0, accuracy = attempts ? (Number(topic.correct)||0)/attempts : (errors+correct ? correct/(errors+correct) : 0);
    const unresolved = Math.max(0, errors - correct * .6);
    let weight = 1 + Math.min(9, unresolved * 1.4) + Math.min(5, qErrors * 1.5) + Math.min(5, qErrors - qCorrect > 0 ? (qErrors-qCorrect)*1.2 : 0);
    if (due) weight += 7 + Math.min(6, overdueDays);
    if (attempts >= 5 && accuracy >= .8 && box >= 3 && !due) weight *= .35;
    return Math.max(.25, weight);
  }
  function weightedGrammarPick(pool, count) {
    const remaining = pool.slice(), chosen = [];
    while (chosen.length < Math.min(count, remaining.length) && remaining.length) {
      const weights = remaining.map(grammarQuestionWeight), total = weights.reduce((sum,w)=>sum+w,0);
      let roll = Math.random()*total, at = 0;
      for (; at < weights.length-1; at++) { roll -= weights[at]; if (roll < 0) break; }
      chosen.push(remaining.splice(at,1)[0]);
    }
    return chosen;
  }
  function pickNext() {
    const rotation = ['vocabulary', 'spelling', 'grammar', 'story', 'listening', 'advanced', 'mistakes', 'spot', 'typing'];
    const ok = rotation.filter(g => UNLOCK[g] <= levelIndex());
    return ok[state.quests % ok.length];
  }

  // Daily-session practice deliberately targets the learner's own error history.
  // It reuses existing adaptive signals and game pools instead of creating a second
  // progress system or changing the normal home-page rotation.
  function pickDailySessionGame() {
    const rotation = ['vocabulary', 'spelling', 'grammar', 'listening', 'mistakes', 'spot', 'typing', 'advanced'];
    const available = rotation.filter(g => GAMES[g] && UNLOCK[g] <= levelIndex());
    const skillGames = {
      grammar: ['grammar', 'mistakes', 'spot'],
      vocabulary: ['vocabulary', 'spelling'],
      listening: ['listening'],
      conversation: ['advanced', 'story'],
      sentence: ['typing']
    };
    const signals = state.adaptiveSignals && typeof state.adaptiveSignals === 'object' ? state.adaptiveSignals : {};
    const weakest = Object.entries(signals)
      .map(([skill, data]) => {
        const attempts = Math.max(0, Number(data && data.attempts) || 0);
        const errors = Math.max(0, Number(data && data.errors) || 0);
        return {skill, attempts, errors, rate: attempts ? errors / attempts : 0};
      })
      .filter(x => x.attempts >= 2 && x.errors > 0)
      .sort((a, b) => (b.rate - a.rate) || (b.errors - a.errors) || (b.attempts - a.attempts));
    for (const signal of weakest) {
      const candidates = skillGames[signal.skill] || (available.includes(signal.skill) ? [signal.skill] : []);
      const chosen = candidates.find(game => available.includes(game) && game !== 'story');
      if (chosen) return chosen;
    }
    // If there is no reliable error history yet, use the existing level-aware rotation.
    const fallback = pickNext();
    return GAMES[fallback] && fallback !== 'story' ? fallback : (available[0] || 'vocabulary');
  }

  /* ---------- rendering: header + home ---------- */
  function renderHeader() {
    $('#chip-streak').textContent = liveStreak();
    const homeStreak = $('#home-streak'); if (homeStreak) homeStreak.textContent = liveStreak();
    $('#chip-xp').textContent = state.xp >= 10000 ? (state.xp / 1000).toFixed(state.xp >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k' : state.xp;$('#chip-xp').title = String(state.xp);
  }

  function renderChallenges() {
    const today = new Date(), task = DAILY_QUESTS[(today.getDate() - 1) % DAILY_QUESTS.length];
    const progress = task.kind === 'quests' ? state.daily : task.kind === 'xp' ? state.dailyXp : state.dailyCorrect;
    const done = state.dailyQuestClaimed || progress >= task.target;
    $('#daily-date').textContent = today.toLocaleDateString('en', {month:'short', day:'numeric'});
    $('#daily-title').textContent = task.title; $('#daily-desc').textContent = task.desc;
    $('#daily-progress-label').textContent = Math.min(progress, task.target) + '/' + task.target;
    $('#daily-bar').style.width = Math.min(100, progress / task.target * 100) + '%';
    $('#daily-reward').textContent = done ? 'Reward claimed · +' + task.reward + ' XP' : 'Reward: +' + task.reward + ' bonus XP';
    $('#daily-status').textContent = done ? '✓ Challenge complete' : 'You’ve got this!'; $('#daily-status').classList.toggle('is-done', done);
    const dailyNo = $('#daily-challenge-number'), dailyModeStatus = $('#daily-challenge-status'), dailyModeButton = $('#daily-challenge-start');
    if (dailyNo) dailyNo.textContent = dailyChallengeNumber(today);
    const dailyDone = state.dailyChallengeDate === todayForChallenge(today) && !!state.dailyChallengeResult;
    if (dailyModeStatus) dailyModeStatus.textContent = dailyDone ? '✓ Completed today · ' + state.dailyChallengeResult.score + '/' + state.dailyChallengeResult.total : 'One attempt per day · New challenge tomorrow';
    if (dailyModeButton) { dailyModeButton.disabled = dailyDone; dailyModeButton.textContent = dailyDone ? 'Completed today' : 'Play today’s challenge'; }
    const best = $('#one-life-best'); if (best) best.textContent = Number(state.oneLifeBest) || 0;
    const count = Math.min(state.weeklyProgress || 0, 5), weeklyDone = !!state.weeklyClaimed;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate()); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
    $('#weekly-dates').textContent = monday.toLocaleDateString('en',{month:'short',day:'numeric'}) + '–' + sunday.toLocaleDateString('en',{month:'short',day:'numeric'});
    $('#weekly-progress-label').textContent = count + '/5'; $('#weekly-bar').style.width = (count / 5 * 100) + '%';
    $('#weekly-reward').textContent = weeklyDone ? 'Reward claimed · +60 XP' : 'Reward: +60 bonus XP';
    $('#weekly-status').textContent = weeklyDone ? '✓ Weekly challenge complete' : 'One quest at a time.'; $('#weekly-status').classList.toggle('is-done', weeklyDone);
    $('#freeze-count').textContent = Math.max(0, state.streakFreezes || 0);
    $('#freeze-note').textContent = state.streakFreezes > 0 ? 'Your streak has a little safety net.' : 'No freezes left right now. Keep your streak going!';
  }

  function recordLearningActivity({minutes=0,words=0,attempts=0}={}) {
    if (DEV_MODE.active && hasDeveloperAccess()) return;
    if (!state.learningActivity || typeof state.learningActivity !== 'object') state.learningActivity={days:{}};
    if (!state.learningActivity.days || typeof state.learningActivity.days !== 'object') state.learningActivity.days={};
    const today=dayKey(), day=state.learningActivity.days[today]||(state.learningActivity.days[today]={minutes:0,words:0,attempts:0});
    day.minutes=(Number(day.minutes)||0)+Math.max(0,Number(minutes)||0);
    day.words=(Number(day.words)||0)+Math.max(0,Number(words)||0);
    day.attempts=(Number(day.attempts)||0)+Math.max(0,Number(attempts)||0);
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-370);const minKey=dayKey(cutoff);
    Object.keys(state.learningActivity.days).forEach(key=>{if(key<minKey)delete state.learningActivity.days[key];});
  }
  function recordAdaptiveResult(skill, topic, correct) {
    if (DEV_MODE.active && hasDeveloperAccess()) return;
    if (!state.adaptiveSignals || typeof state.adaptiveSignals !== 'object') state.adaptiveSignals = {};
    const bucket = state.adaptiveSignals[skill] || (state.adaptiveSignals[skill] = {attempts:0,errors:0,correct:0,topics:{}});
    bucket.attempts=(Number(bucket.attempts)||0)+1;
    if(correct)bucket.correct=(Number(bucket.correct)||0)+1;else bucket.errors=(Number(bucket.errors)||0)+1;
    if(!bucket.topics||typeof bucket.topics!=='object')bucket.topics={};
    const key=String(topic||skill).slice(0,120), item=bucket.topics[key]||(bucket.topics[key]={attempts:0,errors:0,correct:0});
    item.attempts=(Number(item.attempts)||0)+1;
    if(correct)item.correct=(Number(item.correct)||0)+1;else item.errors=(Number(item.errors)||0)+1;
    bucket.lastAt=Date.now();
    const attempts=Number(bucket.attempts)||0;recordLearningActivity({attempts:1,minutes:attempts%5===1?1:0});save();
  }
  function adaptiveRecommendation(){
    const signals=state.adaptiveSignals||{},review=(state.review||[]).filter(w=>w&&w.word);
    const hard=review.filter(w=>(Number(w.errors)||0)>=2).sort((a,b)=>(Number(b.errors)||0)-(Number(a.errors)||0));
    const traps=Object.entries(state.mistakeTrapErrors||{}).map(([key,errors])=>({key,errors:Number(errors)||0,correct:Number((state.mistakeTrapCorrect||{})[key])||0})).filter(x=>x.errors>0).sort((a,b)=>(b.errors-Math.floor(b.correct/2))-(a.errors-Math.floor(a.correct/2)));
    const sig=skill=>{const b=signals[skill]||{},topics=Object.entries(b.topics||{}).map(([key,v])=>({key,errors:Number(v.errors)||0,correct:Number(v.correct)||0}));topics.sort((a,b)=>(b.errors-Math.floor(b.correct/2))-(a.errors-Math.floor(a.correct/2)));return{errors:Number(b.errors)||0,correct:Number(b.correct)||0,topic:topics[0]};};
    const c=[];
    if(traps[0]&&traps[0].errors>=2)c.push({priority:traps[0].errors-Math.floor(traps[0].correct/2),game:'personalized',title:'Your grammar weak spots',reason:'You have missed this grammar pattern more than once. This short review prioritises patterns you find difficult.',detail:traps[0].key.replace(/[-_]+/g,' '),kind:'grammar'});
    const v=sig('vocabulary');if(hard.length||v.errors>=2)c.push({priority:Math.max(hard.length?Number(hard[0].errors)||0:0,v.errors),game:'speed',title:'Review your difficult words',reason:'Speed Round gives extra attention to saved words and words you have missed before.',detail:hard.length?hard.slice(0,3).map(w=>w.word).join(', '):(v.topic&&v.topic.key)||'vocabulary',kind:'vocabulary'});
    const l=sig('listening');if(l.errors>=2)c.push({priority:l.errors-Math.floor(l.correct/2),game:'audioImage',title:'Train listening recognition',reason:'You have missed several sound-to-word matches. Practise hearing a word and connecting it to its meaning.',detail:(l.topic&&l.topic.key)||'sound and meaning',kind:'listening'});
    const s=sig('sentence');if(s.errors>=2)c.push({priority:s.errors-Math.floor(s.correct/2),game:'sentenceOrder',title:'Build sentences with confidence',reason:'Sentence Builder gives you another chance to practise word order and natural sentence structure.',detail:'sentence order',kind:'sentence'});
    const d=sig('conversation');if(d.errors>=2)c.push({priority:d.errors-Math.floor(d.correct/2),game:'story',title:'Practise real-life choices',reason:'Some choices in World conversations have been tricky. Try a real-life dialogue and review the context before choosing.',detail:(d.topic&&d.topic.key)||'conversation choices',kind:'conversation'});
    c.sort((a,b)=>b.priority-a.priority);if(c.length)return c[0];
    if(review.length)return{priority:0,game:'speed',title:'Keep your vocabulary active',reason:'Use a quick round to revisit saved words. As you practise, EPIPHANY will learn which words need more review.',detail:review.slice(0,3).map(w=>w.word).join(', '),kind:'vocabulary'};
    return{priority:0,game:'speed',title:'Start with a quick word round',reason:'Play a short round to begin building your personal learning signals. Repeated mistakes will help EPIPHANY recommend more targeted practice.',detail:'60-second Speed Round',kind:'starter'};
  }
  function preparePersonalizedGame(){
    const all=(GAMES.mistakes&&GAMES.mistakes.questions||[]).slice();if(!all.length||!GAMES.personalized)return;
    const errors=state.mistakeTrapErrors||{},qErrors=state.mistakeQuestionErrors||{};
    const ranked=all.map((q,i)=>({q,i,weight:(Number(errors[q.trap])||0)*4+(Number(qErrors[q.id])||0)*3})).sort((a,b)=>b.weight-a.weight||a.i-b.i);
    const focus=ranked.filter(x=>x.weight>0).map(x=>x.q),fallback=SHUF(all.filter(q=>!focus.includes(q)));
    GAMES.personalized.questions=SHUF(focus.concat(fallback).slice(0,5));
  }

  function renderWeaknessPanel() {
    const panel = $('#weakness-panel');
    if (!panel) return;
    const labels = {
      'am-is-are':'Be verbs (am / is / are)',
      'in-on-at':'Prepositions (in / on / at)',
      'adjective-order':'Adjective order',
      'present-perfect-vs-past':'Present perfect vs past simple',
      'countable-uncountable':'Countable and uncountable nouns',
      'verb-patterns':'Verb patterns'
    };
    const counts = Object.entries(state.mistakeTrapErrors || {})
      .map(([key,value])=>({key,count:Number(value)||0,label:labels[key] || String(key).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}))
      .filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
    const repeated = counts.filter(x=>x.count>=2);
    const total = counts.reduce((sum,x)=>sum+x.count,0);
    const list = (repeated.length ? repeated : counts).slice(0,3);
    const insight = list.length
      ? '<ul class="weakness-list">'+list.map(x=>'<li><span>'+esc(x.label)+'</span><b>'+x.count+' '+(x.count===1?'miss':'misses')+'</b></li>').join('')+'</ul>'
      : '<p class="weakness-note">Your pattern report will appear after you practise a few common-mistake questions. It is not a grade — it helps choose what to practise next.</p>';
    const markup = '<section class="review-panel weakness-panel"><div class="review-head"><div><p class="kicker">PERSONAL PRACTICE</p><h2>'+(repeated.length?'Let’s work on your patterns':'Build your learning profile')+'</h2></div><span class="review-count">'+(repeated.length?repeated.length+' focus':'Adaptive')+'</span></div><p class="review-note">'+(repeated.length?'These patterns have tripped you up more than once. Your next practice gives them extra weight.':total?'We’ve started tracking the patterns you miss. A few more answers will help personalise practice.':'Practice normally and Epiphany will learn which patterns need more attention.')+'</p>'+insight+'<button type="button" class="btn '+(repeated.length?'':'btn-ghost')+'" data-game="personalized">'+(repeated.length?'Practise my weak spots':'Try a personal review')+' · 5 questions</button></section>';
    panel.innerHTML=markup;const profilePanel=$('#profile-weakness-panel');if(profilePanel)profilePanel.innerHTML=markup;
  }

  function renderArcade() {
    const recommendation=adaptiveRecommendation(), recommendationRoot=$('#arcade-recommendation');
    if(recommendationRoot){const label=recommendation.kind==='starter'?'A good place to begin':'Chosen from your practice history';recommendationRoot.innerHTML='<article class="adaptive-recommendation"><div class="adaptive-rec-top"><span class="adaptive-rec-icon" aria-hidden="true">✦</span><div><p class="kicker">YOUR NEXT BEST PRACTICE</p><h2>'+esc(recommendation.title)+'</h2></div><span class="adaptive-rec-tag">'+esc(label)+'</span></div><p>'+esc(recommendation.reason)+'</p>'+(recommendation.detail?'<p class="adaptive-rec-detail"><strong>Focus:</strong> '+esc(recommendation.detail)+'</p>':'')+'<button type="button" class="btn" data-game="'+esc(recommendation.game)+'">Start recommended practice '+ic('arrow')+'</button></article>';}
    const miniRoot = $('#arcade-mini-games');
    const libraryRoot = $('#arcade-library');
    if (!miniRoot || !libraryRoot) return;
    const miniIds = ['speed','audioImage','sentenceOrder','match','order','directions'];
    miniRoot.innerHTML = miniIds.map(id => {
      const m = META[id];
      if (!m) return '';
      const copy = m.blurb || m.desc || 'A quick English practice game.';
      const xp = Number(m.xp || (GAMES[id] && GAMES[id].xp) || 25);
      return '<article class="arcade-game-card t-' + esc(m.tone || 'mint') + '">' +
        '<div class="arcade-game-mark" aria-hidden="true">' + glyph(id) + '</div>' +
        '<div class="arcade-game-copy"><h3>' + esc(m.label) + '</h3><p>' + esc(copy) + '</p>' +
        '<div class="arcade-game-meta"><span>' + Number(m.time || 3) + ' min</span><span>+' + xp + ' XP</span></div></div>' +
        '<button class="btn arcade-play" type="button" data-game="' + esc(id) + '">Play now ' + ic('arrow') + '</button></article>';
    }).join('');
    const cats = window.__gameCategories || [];
    libraryRoot.innerHTML = cats.filter(cat => cat.id !== 'minigames').map(cat => {
      const games = cat.games.filter(([id]) => !miniIds.includes(id));
      if (!games.length) return '';
      return '<section class="arcade-skill-group" aria-label="' + esc(cat.title) + '">' +
        '<header class="arcade-skill-head"><span class="arcade-skill-icon">' + esc(cat.icon) + '</span><div><h3>' + esc(cat.title) + '</h3><p>' + esc(cat.desc) + '</p></div></header>' +
        '<div class="arcade-skill-games">' + games.map(([id,label]) => {
          const meta = META[id] || {};
          const game = GAMES[id] || {};
          return '<button class="arcade-skill-game t-' + esc(meta.tone || cat.tone || 'violet') + '" type="button" data-game="' + esc(id) + '">' +
            '<span class="arcade-skill-glyph">' + glyph(id) + '</span><span class="arcade-skill-copy"><strong>' + esc(label) + '</strong><small>' + Number(meta.time || 3) + ' min · +' + Number(game.xp || meta.xp || 25) + ' XP</small></span>' +
            '<span class="arcade-skill-arrow" aria-hidden="true">→</span></button>';
        }).join('') + '</div></section>';
    }).join('');
  }

  function resetDailySessionIfNeeded() {
    const today = dayKey();
    if (state.dailySessionDate !== today) { state.dailySessionDate = today; state.dailySessionStep = 'review'; state.dailySessionDone = false; save(); }
    if (!['review','lesson','story','done'].includes(state.dailySessionStep)) state.dailySessionStep = 'review';
  }
  function renderDailySessionCard() {
    const button = $('#daily-session-start'), title = $('#daily-session-title'), copy = $('.daily-session-copy > p:not(.kicker)');
    if (!button || !title || !copy) return;
    resetDailySessionIfNeeded();
    const steps = {review:['Start with your due words'],lesson:['Practise one skill'],story:['Finish with a short story'],done:['Today’s session complete']};
    title.textContent = steps[state.dailySessionStep][0];
    button.textContent = state.dailySessionStep === 'done' ? 'Session completed ✓' : state.dailySessionStep === 'review' ? 'Start session' : 'Continue session →';
    button.disabled = state.dailySessionStep === 'done';
    copy.textContent = state.dailySessionStep === 'done' ? 'Today you checked your due-word review, practised one skill, and finished a short story. Current streak: '+Number(state.streak||0)+' day'+(Number(state.streak||0)===1?'':'s')+' · Total XP: '+Number(state.xp||0)+'. Tomorrow: review the next words due, then try a fresh skill and story.' : 'A short guided path: review words due today, practise one skill, then read a short story. Your place is saved as you go.';
    const badges = $('.daily-session-steps');
    if (badges) badges.innerHTML = [['review','Review · 3 min'],['lesson','Lesson · 4 min'],['story','Story · 3 min']].map(([id,label],i)=>'<span class="'+(state.dailySessionStep===id?'is-current':(['review','lesson','story','done'].indexOf(state.dailySessionStep)>i?'is-complete':''))+'"><b>'+(state.dailySessionStep==='done'?'✓':i+1)+'</b> '+label+'</span>').join('');
  }
  function startDailySession() {
    resetDailySessionIfNeeded();
    if (state.dailySessionStep === 'done') { toast('Today’s session is complete. Come back tomorrow!'); return; }
    if (state.dailySessionStep === 'review') {
      const due = (state.review || []).filter(w => !w.due || w.due <= dayKey());
      if (due.length) { openView('words'); toast('Complete today’s due-word review, then return here to continue.'); return; }
      state.dailySessionStep = 'lesson'; save();
    }
    if (state.dailySessionStep === 'lesson') {
      const game = pickDailySessionGame();
      renderDailySessionCard();
      startGame(game);
      toast('Personalised practice started. Finish the activity to unlock your short story.');
      return;
    }
    if (state.dailySessionStep === 'story') {
      const available = (typeof STORIES !== 'undefined' ? STORIES : []).filter(s => storyLevelIndex(s.level) <= storyLevelIndex(currentLevel().id));
      const chosen = available.find(s => !(state.stories[s.id] && state.stories[s.id].done) && (Number(s.minutes)||0) <= 5) || available.find(s => !(state.stories[s.id] && state.stories[s.id].done)) || available[0];
      if (!chosen) { toast('No suitable story is available right now. Your session is saved — please try again shortly.'); return; }
      openView('stories');
      startStory(chosen.id);
      toast('Read the story to complete today’s session.');
    }
  }

  function renderHome() {
    const h = new Date().getHours();
    $('#greeting').textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

    renderChallenges();
    renderDailySessionCard();
    const g = pickNext(), game = GAMES[g], m = META[g];
    $('#next-card').className = 'next t-' + m.tone;
    $('#next-cat').textContent = m.label;
    $('#next-title').textContent = game.title;
    $('#next-desc').textContent = game.desc;
    $('#next-count').textContent = '5-question quest · ' + game.questions.length + ' in bank';
    $('#next-time').textContent = m.time + ' min';
    $('#next-xp').textContent = '+' + game.xp + ' XP';
    $('#next-art').innerHTML = '<div class="glyph">' + glyph(g) + '</div>';
    $('#next-start').dataset.game = g;
    renderWeaknessPanel();
    renderDeveloperLab();

    const done = Math.min(state.daily, 2);
    $('#ring-text').textContent = done + '/2';
    $('#ring').setAttribute('aria-label', 'Daily goal: ' + done + ' of 2 quests');
    $('#ring-fg').style.strokeDashoffset = (207.35 * (1 - done / 2)).toFixed(2);
    $('#ring-note').textContent = done >= 2 ? 'Goal complete. Your streak is safe today.'
      : done === 1 ? 'One more quest keeps your streak alive.' : 'Finish 2 quests to keep your streak alive.';

    const idx = levelIndex(), lv = LEVELS[idx], nx = LEVELS[idx + 1];
    $('#lv-name').textContent = 'Estimated CEFR · ' + lv.id;
    const homeLevel = $('#home-level'); if (homeLevel) homeLevel.textContent = lv.id;
    $('#lv-next').textContent = nx ? 'A level check is needed to update your estimate' : 'Highest CEFR band assessed';
    $('#lv-bar').style.width = '100%';
    $('#lv-bar-wrap').setAttribute('aria-valuenow', 100);

    const track = $('#track');
    track.style.setProperty('--prog', (idx / (LEVELS.length - 1)).toFixed(3));
    track.innerHTML = LEVELS.map((l, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'current' : 'locked';
      const dot = i < idx ? ic('check') : i > idx ? ic('lock') : l.id;
      const sub = i < idx ? 'Passed in assessment' : i === idx ? 'Estimated level' : 'Not assessed yet';
      return '<li><button class="node ' + cls + '" data-level="' + i + '" aria-label="' + l.id + ', ' + l.name + (cls === 'locked' ? ', not yet assessed' : '') + '">' +
        '<span class="node-dot">' + dot + '</span><span class="node-name">' + l.name + '</span><span class="node-sub">' + sub + '</span></button></li>';
    }).join('');
    const promotion = promotionStatus();
    $('#track-note').innerHTML = '<strong>Current CEFR: ' + lv.id + ' · ' + esc(lv.title) + '</strong> ' + esc(lv.desc) + '<p class="level-note">XP opens a promotion test; only passing the test changes your CEFR level.</p>' + (nx ? '<p class="level-note">Promotion progress: ' + promotion.earned + ' / ' + promotion.required + ' XP</p>' + (promotion.unlocked ? '<button type="button" class="btn" data-promotion-start>Take the ' + nx.id + ' promotion test</button>' : '<p class="level-note">Earn ' + Math.max(0, promotion.required - promotion.earned) + ' more XP to unlock the test.</p>') : '<p class="level-note">You have reached the highest CEFR level. Keep practising to maintain your skills.</p>') + (state.lastPromotionResult ? '<p class="level-note">Last promotion test: ' + esc(state.lastPromotionResult.score + '/' + state.lastPromotionResult.total) + (state.lastPromotionResult.passed ? ' · Passed' : ' · Not passed yet') + '</p>' : '');

    const gameCategories = [
      {id:'words',title:'Words',desc:'Build your vocabulary and recognise words.',icon:'Aa',tone:'violet',games:[['vocabulary','Word collector'],['spelling','Word detective'],['match','Word Match']]},
      {id:'grammar',title:'Grammar',desc:'Make sentences clearer and more accurate.',icon:'S+V',tone:'coral',games:[['grammar','Sentence shaper'],['mistakes','Common mistakes'],['spot','Spot the mistake'],['typing','Type It']]},
      {id:'reading',title:'Reading & Listening',desc:'Understand stories, messages and meaning.',icon:'◖',tone:'sky',games:[['story','Lost in London'],['listening','Meaning detective'],['order','Order the Story'],['directions','Directions']]},
      {id:'challenge',title:'Challenge',desc:'Train your ear for nuance and precise meaning.',icon:'✦',tone:'ink',games:[['advanced','Nuance navigator']]},
      {id:'minigames',title:'Mini-games',desc:'Quick, playful rounds that adapt to what you need to practise.',icon:'⚡',tone:'mint',games:[['speed','60-second Speed Round'],['audioImage','Sound & Picture Match'],['sentenceOrder','Sentence Builder']]}
    ];
    window.__gameCategories = gameCategories;
    $('#games').innerHTML = gameCategories.map(cat =>
      '<button class="category-card t-' + cat.tone + '" type="button" data-category="' + cat.id + '" aria-haspopup="dialog">' +
        '<span class="category-icon">' + cat.icon + '</span><span class="category-copy"><strong>' + cat.title + '</strong><small>' + cat.desc + '</small><em>' + cat.games.length + (cat.games.length===1?' activity':' activities') + '</em></span><span class="category-arrow" aria-hidden="true">→</span></button>'
    ).join('');
  }

  /* ---------- rendering: words + trophies ---------- */
  let speechRequest = 0;
  let speechVoices = [];
  let voicePref = {name:'', rate:0.92};
  try { voicePref = {...voicePref, ...JSON.parse(localStorage.getItem('epiphany-voice') || '{}')}; } catch {}
  function saveVoicePref() { try { localStorage.setItem('epiphany-voice', JSON.stringify(voicePref)); } catch {} }
  const isEnglishVoice = v => /^en([-_]|$)/i.test(v.lang || '') || /english/i.test(v.name || '');
  function voiceScore(v) {
    const n = (v.name || '') + ' ' + (v.voiceURI || ''), lang = String(v.lang || '').replace('_', '-');
    let s = 0;
    if (/^en-US$/i.test(lang)) s += 30; else if (/^en-GB$/i.test(lang)) s += 22; else if (/^en-(AU|CA|IE|IN|ZA)$/i.test(lang)) s += 12;
    if (/premium|enhanced|neural|natural|online|wavenet/i.test(n)) s += 60;
    if (/google/i.test(n)) s += 35;
    if (/samantha|ava|allison|susan|zoe|serena|karen|daniel|aria|jenny|guy|libby|sonia|siri/i.test(n)) s += 25;
    if (/network|-x-.*-network|-x-(iob|iol|iom|sfg|tpc|tpd|tpf)/i.test(n)) s += 20;
    if (/compact|espeak|robot|novelty|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|pipe organ|trinoids|whisper|zarvox|albert|fred|junior|kathy|ralph|organ/i.test(n)) s -= 80;
    if (v.localService === false) s += 10;
    return s;
  }
  function refreshSpeechVoices() {
    const synth = window.speechSynthesis;
    if (synth && typeof synth.getVoices === 'function') {
      const available = synth.getVoices();
      if (available && available.length) speechVoices = available.slice();
    }
    return speechVoices;
  }
  function englishVoices() { return refreshSpeechVoices().filter(isEnglishVoice).sort((a, b) => voiceScore(b) - voiceScore(a)); }
  function pickVoice() {
    const list = englishVoices();
    if (voicePref.name) { const chosen = list.find(v => v.name === voicePref.name); if (chosen) return chosen; }
    return list[0] || null;
  }
  if (window.speechSynthesis) {
    refreshSpeechVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshSpeechVoices);
  }
  function speechChunks(phrase) {
    const parts = phrase.match(/[^.!?;:]+[.!?;:]*/g) || [phrase], out = [];
    parts.forEach(p => { p = p.trim(); if (!p) return; const last = out[out.length - 1]; if (last && last.length < 28) out[out.length - 1] = last + ' ' + p; else out.push(p); });
    return out.length ? out : [phrase];
  }
  let naturalAudioPlayer = null;
  const naturalAudioMemory = new Map();
  function openSpeechDb() {
    return new Promise(resolve => {
      if (!('indexedDB' in window)) return resolve(null);
      let req;
      try { req = indexedDB.open('epiphany-speech-cache', 1); } catch { return resolve(null); }
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('audio')) req.result.createObjectStore('audio'); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }
  async function cachedNaturalAudio(key) {
    if (naturalAudioMemory.has(key)) return naturalAudioMemory.get(key);
    const db = await openSpeechDb();
    if (!db) return null;
    return new Promise(resolve => {
      try {
        const req = db.transaction('audio', 'readonly').objectStore('audio').get(key);
        req.onsuccess = () => { const value = req.result || null; if (value) naturalAudioMemory.set(key, value); resolve(value); };
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }
  async function saveNaturalAudio(key, blob) {
    naturalAudioMemory.set(key, blob);
    const db = await openSpeechDb();
    if (!db) return;
    try { db.transaction('audio', 'readwrite').objectStore('audio').put(blob, key); } catch {}
  }
  async function playNaturalSpeech(phrase, rate, request) {
    if (phrase.length > 1800 || !navigator.onLine) return false;
    const key = 'elevenlabs-george|' + rate.toFixed(2) + '|' + phrase.toLowerCase();
    let blob = await cachedNaturalAudio(key);
    if (request !== speechRequest) return true;
    if (!blob) {
      let response;
      try {
        response = await fetch('/api/tts', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({text:phrase, rate:Math.max(0.75, Math.min(1.05, rate))})
        });
      } catch { return false; }
      if (!response.ok) return false;
      try { blob = await response.blob(); } catch { return false; }
      if (!blob || !blob.size || request !== speechRequest) return request !== speechRequest;
      await saveNaturalAudio(key, blob);
    }
    if (request !== speechRequest) return true;
    try {
      if (naturalAudioPlayer) { naturalAudioPlayer.pause(); naturalAudioPlayer.src = ''; }
      const url = URL.createObjectURL(blob);
      const player = new Audio(url);
      naturalAudioPlayer = player;
      player.onended = () => { URL.revokeObjectURL(url); if (naturalAudioPlayer === player) naturalAudioPlayer = null; };
      player.onerror = () => URL.revokeObjectURL(url);
      await player.play();
      return true;
    } catch { return false; }
  }
  function speak(text, opts) {
    const synth = window.speechSynthesis;
    const phrase = String(text == null ? '' : text).replace(/\\s+/g, ' ').trim();
    if (!phrase) { toast('There is no word to pronounce.'); return; }
    const request = ++speechRequest, rate = (opts && opts.rate) || voicePref.rate || 0.92;
    try { if (synth) synth.cancel(); } catch {}
    if (naturalAudioPlayer) { try { naturalAudioPlayer.pause(); naturalAudioPlayer.src = ''; } catch {} naturalAudioPlayer = null; }
    const runNative = () => {
      if (!synth || !('SpeechSynthesisUtterance' in window)) {
        toast('Speech playback is not supported in this browser.');
        return;
      }
      const run = tries => {
        if (request !== speechRequest) return;
        const voice = pickVoice();
        if (!voice && tries < 6 && !refreshSpeechVoices().length) { setTimeout(() => run(tries + 1), 120); return; }
        const chunks = speechChunks(phrase);
        chunks.forEach((chunk, i) => {
          const u = new SpeechSynthesisUtterance(chunk);
          u.lang = voice ? String(voice.lang || 'en-US').replace('_', '-') : 'en-US';
          if (voice) u.voice = voice;
          u.rate = chunk.split(' ').length <= 2 ? Math.min(rate, 0.85) : rate;
          u.pitch = 1;
          u.volume = 1;
          u.onerror = event => {
            if (request === speechRequest && event.error !== 'canceled' && event.error !== 'interrupted' && i === 0) toast('Could not play this pronunciation. Try another voice from ⚙ → Voice.');
          };
          try { synth.speak(u); } catch { if (i === 0) toast('Could not play this pronunciation. Try again.'); }
        });
        try { if (synth.paused) synth.resume(); } catch {}
      };
      setTimeout(() => run(0), 60);
    };
    playNaturalSpeech(phrase, rate, request).then(played => {
      if (request !== speechRequest) return;
      if (!played) runNative();
    }).catch(runNative);
  }
  function openVoiceSheet() {
    const list = englishVoices(), current = pickVoice();
    const opts = list.length
      ? list.map(v => '<option value="' + esc(v.name) + '"' + (current && v.name === current.name ? ' selected' : '') + '>' + esc(v.name) + ' (' + esc(String(v.lang).replace('_', '-')) + ')</option>').join('')
      : '<option value="">No English voice found on this device</option>';
    let m=$('#voice-modal');if(!m){m=document.createElement('div');m.id='voice-modal';m.className='voice-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');document.body.appendChild(m);}m.hidden=false;m.innerHTML=('<div class="voice-sheet"><h2>🔊 Reader voice</h2><p class="voice-note">Natural voice is used online when available. The device voice below is the offline fallback. On Android install “Speech Services by Google” and download English (US); on iPhone add an Enhanced voice in Settings → Accessibility → Spoken Content → Voices.</p><label>Device fallback voice<select id="voice-select">' + opts + '</select></label><label>Speed <output id="voice-rate-out">' + Number(voicePref.rate).toFixed(2) + '×</output><input id="voice-rate" type="range" min="0.6" max="1.2" step="0.05" value="' + voicePref.rate + '"></label><div class="voice-actions"><button class="btn" id="voice-test" type="button">▶ Test voice</button><button class="btn btn-ghost" id="voice-close" type="button">Done</button></div></div>');
  }
  document.addEventListener('change', e => {
    if (e.target.id === 'voice-select') { voicePref.name = e.target.value; saveVoicePref(); speak('Hello! This is how I sound.'); }
    if (e.target.id === 'voice-rate') { voicePref.rate = Number(e.target.value); saveVoicePref(); const o = $('#voice-rate-out'); if (o) o.textContent = voicePref.rate.toFixed(2) + '×'; }
  });
  document.addEventListener('input', e => {
    if(e.target&&e.target.matches('[data-writer-part]')){CREATE_STORY.lastPart=e.target.dataset.writerPart;CREATE_STORY.drafts[CREATE_STORY.lastPart]=e.target.value;updateWriterFeedback();return;}
 if (e.target.id === 'voice-rate') { const o = $('#voice-rate-out'); if (o) o.textContent = Number(e.target.value).toFixed(2) + '×'; } });
  document.addEventListener('click', e => {
    if (e.target.closest('#open-voice')) { const d = $('.tools-menu'); if (d) d.open = false; openVoiceSheet(); }
    else if (e.target.closest('#voice-test')) speak('Hello! Let us practise English together. Where is the bakery?');
    else if (e.target.closest('#voice-close') || e.target.id === 'voice-modal') { const m = $('#voice-modal'); if (m) m.hidden = true; }
  });
  function wordParts(raw, fallback) {
    if (Array.isArray(raw)) return {word:String(raw[0]||''),meaning:String(raw[1]||fallback||'Review this word in context.'),level:String(raw[2]||currentLevel().id)};
    if (typeof raw==='string'&&raw.trim()) return {word:raw.trim(),meaning:String(fallback||'Review this word in context.'),level:currentLevel().id};
    return null;
  }
  const REVIEW_INTERVALS=[1,3,7,14,30];
  const WORD_COLLOCATIONS={
    decision:['make a decision','a difficult decision','decision-making'], improve:['improve your skills','improve performance','greatly improve'],
    take:['take a break','take responsibility','take your time'], make:['make a mistake','make progress','make a difference'],
    do:['do your homework','do your best','do research'], effort:['make an effort','put effort into','a great effort'],
    advice:['give advice','ask for advice','a piece of advice'], experience:['gain experience','a valuable experience','work experience'],
    opportunity:['seize an opportunity','a great opportunity','opportunity to learn'], achieve:['achieve a goal','achieve success','achieve results'],
    curious:['curious about something','a curious person','curiosity about'], notice:['notice a difference','notice a change','barely notice'],
    journey:['go on a journey','a long journey','learning journey'], confident:['feel confident','confident about','build confidence']
  };
  function wordContext(word,meaning){
    const key=String(word||'').toLowerCase();
    const daily=typeof WOTD_WORDS!=='undefined'&&WOTD_WORDS.find(x=>x.word.toLowerCase()===key);
    const examples=daily?[daily.example, 'I learned the word '+word+' by using it in a real situation.']:[
      'I used “'+word+'” while talking about '+(meaning||'everyday life')+'.',
      'Try to use “'+word+'” in a conversation today.'
    ];
    return {examples,collocations:WORD_COLLOCATIONS[key]||['use '+key+' naturally','learn the word in context','a common use of '+key]};
  }
  function addReview(raw,fallback) {
    const p=wordParts(raw,fallback); if(!p)return;
    const key=p.word.toLowerCase();
    const old=state.review.find(x=>x.word.toLowerCase()===key);
    if(old){old.due=dayKey();old.box=1;old.interval=0;old.streak=0;old.exerciseStage=0;old.meaning=p.meaning||old.meaning;old.errors=Number(old.errors)||0;old.errors++;}
    else state.review.push({...p,due:dayKey(),box:1,interval:0,streak:0,attempts:0,errors:1,exerciseStage:0,mastered:false});
    save();
  }
  function renderReview() {
    const today=dayKey(), due=state.review.filter(w=>!w.due||w.due<=today);
    const hard=state.review.filter(w=>(Number(w.errors)||0)>=2);
    const head='<div class="review-head"><div><p class="kicker">SPACED REPETITION</p><h2>Daily word review</h2></div><span class="review-count">'+due.length+' due</span></div>';
    const hardPanel='<section class="hard-words"><div class="review-head"><div><p class="kicker">PERSONAL WORD LIST</p><h2>My difficult words</h2></div><span class="review-count">'+hard.length+'</span></div>'+(hard.length?'<div class="hard-word-list">'+hard.slice().sort((a,b)=>(b.errors||0)-(a.errors||0)).slice(0,8).map(x=>'<article class="hard-word"><b>'+esc(x.word)+'</b><span>'+esc(x.meaning)+'</span><small>'+Number(x.errors||0)+' mistakes</small><button class="btn btn-ghost" data-hard-review="'+esc(x.word)+'">Practise</button></article>').join('')+'</div>':'<p class="review-note">Words you miss twice or more will appear here automatically.</p>')+'</section>';
    if(!due.length)return '<section class="review-panel">'+head+'<p class="review-note">You’re all caught up. Your next review is scheduled automatically.</p></section>'+hardPanel;
    const w=due[0], ctx=wordContext(w.word,w.meaning), stage=Math.max(0,Math.min(3,Number(w.exerciseStage)||0));
    const stageNames=['Recall the meaning','Understand it in context','Write it from listening','Use it in a sentence'];
    let exercise='';
    if(stage===0)exercise='<p class="review-note">First, recall the meaning without looking. Then reveal it and rate your answer.</p><p id="review-meaning" hidden>'+esc(w.meaning)+'</p><button class="btn btn-ghost" id="reveal-review">Reveal meaning</button>';
    if(stage===1)exercise='<p class="review-note">Read the examples and collocations. Can you explain how the word is used?</p><div class="word-examples">'+ctx.examples.map((x,i)=>'<p><b>Example '+(i+1)+':</b> '+esc(x)+'</p>').join('')+'</div><p class="word-collocations"><b>Common combinations:</b> '+ctx.collocations.map(esc).join(' · ')+'</p><button class="btn" data-review-stage-success="'+esc(w.word)+'">I understand the context</button>';
    if(stage===2)exercise='<p class="review-note">Listen to the word, then type exactly what you hear.</p><button class="btn btn-ghost" data-speak="'+esc(w.word)+'">'+ic('sound')+' Play word</button><form class="word-dictation" data-word-dictation="'+esc(w.word)+'"><input name="typedWord" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type the word you heard" required><button class="btn" type="submit">Check spelling</button></form>';
    if(stage===3)exercise='<p class="review-note">Write your own sentence using the word. The goal is meaningful use, not memorising a definition.</p><textarea class="word-own-sentence" data-own-sentence="'+esc(w.word)+'" rows="2" placeholder="Write a sentence with '+esc(w.word)+'…"></textarea><button class="btn" data-review-sentence="'+esc(w.word)+'">Check my sentence</button><p class="review-note">Self-check: is the sentence understandable and is the word used correctly?</p>';
    const box=Math.max(1,Math.min(5,Number(w.box)||1));
    return '<section class="review-panel">'+head+'<p class="review-note">Box '+box+' of 5 · Next interval: '+REVIEW_INTERVALS[box-1]+' day'+(REVIEW_INTERVALS[box-1]===1?'':'s')+' · Exercise '+(stage+1)+' of 4</p><article class="review-card"><div class="review-word"><b>'+esc(w.word)+'</b><button class="listen-btn" data-speak="'+esc(w.word)+'" aria-label="Listen to '+esc(w.word)+'">'+ic('sound')+' Listen</button></div><p class="review-stage-title">'+stageNames[stage]+'</p>'+exercise+((stage===0)?'<div class="review-actions" id="review-actions" hidden><button class="btn btn-ghost" data-review="again" data-word="'+esc(w.word)+'">I need more practice</button><button class="btn" data-review="known" data-word="'+esc(w.word)+'">I recalled it</button></div>':'')+'</article></section>'+hardPanel;
  }
  function renderWotd() {
    const box=$('#wotd-card'); if(!box) return;
    const levelOrder=LEVELS.map(x=>x.id), current=currentLevel().id;
    let pool=WOTD_WORDS.filter(w=>w.level===current);
    if(!pool.length){const idx=levelOrder.indexOf(current);pool=WOTD_WORDS.filter(w=>levelOrder.indexOf(w.level)<=idx);if(!pool.length)pool=WOTD_WORDS.slice();}
    const now=new Date(), dayNumber=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
    const w=pool[dayNumber%pool.length];
    const speech=!!(window.speechSynthesis&&('SpeechSynthesisUtterance' in window));
    const saved=state.words.some(x=>String(x[0]).toLowerCase()===w.word.toLowerCase());
    box.innerHTML='<div class="wotd-top"><span class="kicker">EPIPHANY OF THE DAY</span><span class="pill">'+esc(w.level)+'</span></div><h2 id="wotd-title" class="wotd-word">'+esc(w.word)+'</h2><p class="wotd-pronunciation">'+esc(w.pronunciation||'')+'</p><div class="wotd-meanings"><p><strong>Meaning:</strong> '+esc(w.meaning)+'</p><p class="arabic" lang="ar" dir="rtl"><strong>المعنى:</strong> '+esc(w.meaning_ar)+'</p></div><p class="wotd-example">“'+esc(w.example)+'”</p>'+(w.example_ar?'<p class="arabic" lang="ar" dir="rtl">'+esc(w.example_ar)+'</p>':'')+'<p class="wotd-origin">'+esc(w.origin)+'</p>'+(w.origin_ar?'<p class="arabic wotd-origin-ar" lang="ar" dir="rtl">'+esc(w.origin_ar)+'</p>':'')+'<div class="wotd-actions">'+(speech?'<button type="button" class="btn btn-ghost" data-speak="'+esc(w.word)+'">Listen</button>':'')+'<button type="button" class="btn" id="wotd-save" '+(saved?'disabled':'')+'>'+(saved?'Saved to Words':'Save word')+'</button></div>';
    box.dataset.word=w.word;
  }
  function exportPersonalDictionary(format) {
    const rows = (state.words || []).map(w => ({word:String(w[0]||''),meaning:String(w[1]||''),level:String(w[2]||'')})).filter(w => w.word);
    if (!rows.length) { toast('Save some words first, then export your dictionary.'); return; }
    const clean = value => String(value).replaceAll(String.fromCharCode(9),' ').replaceAll(String.fromCharCode(10),' ').replaceAll(String.fromCharCode(13),' ').replace(/^[=+@-]/,value => "'" + value);
    const quote = value => '"' + clean(value).replace(/"/g,'""') + '"';
    const tab = String.fromCharCode(9), newline = String.fromCharCode(10), crlf = String.fromCharCode(13) + newline;
    const content = format === 'anki'
      ? rows.map(w => [clean(w.word), clean(w.meaning) + (w.level ? ' (' + clean(w.level) + ')' : '')].join(tab)).join(newline)
      : String.fromCharCode(0xFEFF) + [['Word','Meaning','CEFR level'], ...rows.map(w => [w.word,w.meaning,w.level])].map(row => row.map(quote).join(',')).join(crlf);
    const blob = new Blob([content], {type:format==='anki'?'text/tab-separated-values;charset=utf-8':'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = format==='anki' ? 'epiphany-dictionary-anki.txt' : 'epiphany-dictionary.csv';
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast(rows.length + ' words exported.');
  }
  function renderWords() {
    resetDailySessionIfNeeded();
    if (state.dailySessionStep === 'review' && !(state.review || []).some(w => !w.due || w.due <= dayKey())) { state.dailySessionStep = 'lesson'; save(); }
    renderWotd();
    const n=state.words.length, due=state.review.filter(w=>!w.due||w.due<=dayKey()).length;
    $('#words-count').textContent=n+(n===1?' word':' words')+' · '+due+' to review';
    const vault=!n?'<div class="empty"><div class="empty-ic">'+ic('book')+'</div><h2>Your vault is empty, for now.</h2><p>Answer vocabulary questions correctly to collect useful words.</p><button class="btn" data-game="vocabulary">'+ic('play')+'Find your first word</button></div>':
      '<div class="vault">'+state.words.slice().reverse().map(w=>{const info=wordContext(w[0],w[1]);return '<article class="word"><div class="word-title"><b>'+esc(w[0])+'</b><button class="listen-btn" data-speak="'+esc(w[0])+'" aria-label="Listen to '+esc(w[0])+'">'+ic('sound')+' Listen</button></div><span>'+esc(w[1])+'</span><em>'+esc(w[2]||'A1')+'</em><div class="word-examples">'+info.examples.map((x,i)=>'<p><b>Example '+(i+1)+':</b> '+esc(x)+'</p>').join('')+'</div><p class="word-collocations"><b>Common combinations:</b> '+info.collocations.map(esc).join(' · ')+'</p></article>';}).join('')+'</div>';
    const dailyContinue = ['lesson','story'].includes(state.dailySessionStep)
      ? '<section class="review-panel daily-session-return"><p class="kicker">YOUR DAILY PATH</p><h2>'+(state.dailySessionStep==='lesson'?'Word review complete':'Practice complete')+'</h2><p class="review-note">'+(state.dailySessionStep==='lesson'?'You’re ready for the personalised practice activity.':'Your short story is ready whenever you are.')+'</p><button type="button" class="btn" data-daily-session-continue>'+(state.dailySessionStep==='lesson'?'Continue to practice':'Continue daily session')+' '+ic('arrow')+'</button></section>'
      : '';
    $('#words-body').innerHTML=dailyContinue+renderReview()+'<div class="dictionary-tools"><div><h2 class="vault-heading">Your collected words</h2><p>Export your personal dictionary to a spreadsheet or Anki.</p></div><div class="dictionary-export-actions"><button type="button" class="btn btn-ghost" data-dictionary-export="csv">Export CSV</button><button type="button" class="btn" data-dictionary-export="anki">Export for Anki</button></div></div>'+vault;
    const reveal=$('#reveal-review'); if(reveal)reveal.addEventListener('click',()=>{$('#review-meaning').hidden=false;$('#review-actions').hidden=false;reveal.hidden=true;});
  }

  function renderTrophies() {
    const idx = levelIndex();
    const masteredWords=(state.review||[]).filter(w=>w&&w.mastered).length;
    const all = [
      ['spark','First Quest','Finish your first learning quest.',Math.min(state.quests,1),1],
      ['book','Word Collector','Save 25 useful words to your word vault.',Math.min(state.words.length,25),25],
      ['book','100 Words Learned','Collect 100 words in your personal word vault.',Math.min(state.words.length,100),100],
      ['check-circle','Word Master','Master 25 words through review.',Math.min(masteredWords,25),25],
      ['flame','3-Day Streak','Practise on 3 consecutive days.',Math.min(state.streak||0,3),3],
      ['flame','7-Day Streak','Practise on 7 consecutive days.',Math.min(state.streak||0,7),7],
      ['globe','World Explorer','Reach B1 in your English journey.',Math.min(idx,2),2],
      ['crown','Advanced Learner','Reach C1 in your English journey.',Math.min(idx,4),4],
      ['search','Mistake Detective','Complete 10 Common Mistakes or Spot the Mistake quests.',Math.min((state.modes.mistakes||0)+(state.modes.spot||0),10),10],
      ['pencil','Confident Writer','Complete 10 Type It quests.',Math.min(state.modes.typing||0,10),10]
    ];
    const got = all.filter(a => a[3] >= a[4]).length;
    $('#trophies-count').textContent = got + ' of ' + all.length + ' unlocked';
    $('#trophies').innerHTML = all.map(a => {
      const on = a[3] >= a[4];
      return '<article class="trophy' + (on ? ' on' : '') + '"><div class="trophy-ic">' + ic(a[0]) + '</div><div style="flex:1;min-width:0"><h3>' + a[1] + '</h3><p>' + a[2] + '</p>' +
        '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + a[4] + '" aria-valuenow="' + a[3] + '" aria-label="' + a[1] + ' progress"><i style="width:' + Math.round(a[3] / a[4] * 100) + '%"></i></div></div></article>';
    }).join('');
  }

  function renderDeveloperLab() {
    const panel = $('#developer-lab');
    if (!panel) return;
    const allowed = hasDeveloperAccess();
    panel.hidden = !allowed;
    if (!allowed) return;
    const levelSelect = $('#developer-level');
    if (levelSelect) {
      const previous = DEV_MODE.active ? DEV_MODE.level : levelSelect.value;
      levelSelect.innerHTML = LEVELS.map(l => '<option value="'+esc(l.id)+'" '+(l.id===previous?'selected':'')+'>'+esc(l.id+' · '+l.name)+'</option>').join('');
      if (previous && LEVELS.some(l=>l.id===previous)) levelSelect.value=previous;
      levelSelect.disabled = DEV_MODE.active;
    }
    const activitySelect = $('#developer-activity');
    if (activitySelect) {
      const previous = activitySelect.value;
      const items = Object.keys(GAMES).map(k => ({value:k,label:(META[k]&&META[k].label?META[k].label+' — ':'')+GAMES[k].title}))
        .concat(Object.keys(MINI).map(k=>({value:k,label:(META[k]&&META[k].label?META[k].label+' — ':'')+(META[k]&&META[k].label||k)})))
        .concat([{value:'__story',label:'Stories — choose any story'},{value:'__world',label:'World — all regions and missions'}]);
      activitySelect.innerHTML = items.map(item=>'<option value="'+esc(item.value)+'">'+esc(item.label)+'</option>').join('');
      if (items.some(item=>item.value===previous)) activitySelect.value=previous;
      activitySelect.disabled = !DEV_MODE.active;
    }
    const storySelect = $('#developer-story');
    if (storySelect && typeof STORIES !== 'undefined') {
      const previous = storySelect.value;
      storySelect.innerHTML = STORIES.slice().sort((a,b)=>storyLevelIndex(a.level)-storyLevelIndex(b.level)||a.title.localeCompare(b.title)).map(s=>'<option value="'+esc(s.id)+'">'+esc(s.level+' · '+s.title)+'</option>').join('');
      if (previous && STORIES.some(s=>s.id===previous)) storySelect.value=previous;
      storySelect.disabled = !DEV_MODE.active;
    }
    const start = $('#developer-start');
    if (start) start.disabled = !DEV_MODE.active;
    const toggle = $('#developer-session-toggle');
    if (toggle) { toggle.textContent = DEV_MODE.active ? 'End test session and restore progress' : 'Start safe test session'; toggle.classList.toggle('btn-ghost', DEV_MODE.active); }
    const status = $('#developer-session-status');
    if (status) status.textContent = DEV_MODE.active ? 'Test session active · '+DEV_MODE.level+' · XP, streaks, achievements, words and progress are temporary and will be discarded when you end the session.' : 'Choose a level, then start a safe test session. Your normal CEFR level and saved progress will not be changed.';
  }

  function startDeveloperSession() {
    if (!hasDeveloperAccess()) return;
    const selected = $('#developer-level');
    DEV_MODE.level = LEVELS.some(l=>l.id===(selected&&selected.value)) ? selected.value : 'A1';
    DEV_MODE.snapshot = JSON.parse(JSON.stringify(state));
    DEV_MODE.active = true;
    renderAll();
    toast('Safe test session started · '+DEV_MODE.level+' · no progress or rewards will be saved.');
  }

  function endDeveloperSession() {
    if (!hasDeveloperAccess() || !DEV_MODE.active) return;
    if (WORLD && WORLD.raf) cancelAnimationFrame(WORLD.raf);
    if (DEV_MODE.snapshot) state = DEV_MODE.snapshot;
    DEV_MODE.snapshot = null;
    DEV_MODE.active = false;
    DEV_MODE.level = 'A1';
    if (WORLD) { WORLD = null; $('#world-game').hidden = true; }
    if ($('#game')) $('#game').hidden = true;
    if ($('#placement')) $('#placement').hidden = true;
    lockPage(false);
    renderAll();
    toast('Test session ended · your original progress has been restored.');
  }

  function launchDeveloperActivity() {
    if (!hasDeveloperAccess() || !DEV_MODE.active) return;
    const selected = $('#developer-activity');
    if (!selected) return;
    if (selected.value === '__story') {
      const story = $('#developer-story');
      if (story && story.value) { openView('stories'); startStory(story.value); }
      return;
    }
    if (selected.value === '__world') { openView('home'); startWorld(); return; }
    if (GAMES[selected.value] || MINI[selected.value]) { openView('home'); startGame(selected.value); }
  }

  function renderLearningInsights(){
    const root=$('#learning-insights'),profileRoot=$('#profile-learning-insights');if(!root&&!profileRoot)return;
    const days=state.learningActivity?.days||{},now=new Date(),week=[];
    for(let offset=6;offset>=0;offset--){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-offset),key=dayKey(d),row=days[key]||{};week.push({key,label:d.toLocaleDateString('en',{weekday:'short'}),date:d.toLocaleDateString('en',{month:'short',day:'numeric'}),minutes:Number(row.minutes)||0,words:Number(row.words)||0});}
    const totalMinutes=week.reduce((n,d)=>n+d.minutes,0),totalWords=week.reduce((n,d)=>n+d.words,0),maxMinutes=Math.max(1,...week.map(d=>d.minutes)),maxWords=Math.max(1,...week.map(d=>d.words));
    const markup='<section class="block learning-insights"><div class="block-head"><div><p class="kicker">YOUR LAST 7 DAYS</p><h2>Learning rhythm</h2><p>Estimated practice minutes and newly saved words.</p></div><span class="activity-total">'+totalMinutes+' min · '+totalWords+' words</span></div><div class="weekly-bars"><div class="weekly-chart"><h3>Minutes</h3><div class="weekly-bar-list">'+week.map(d=>'<div class="weekly-bar-col" title="'+d.date+': '+d.minutes+' minutes"><span>'+d.minutes+'</span><i style="height:'+Math.max(d.minutes?8:2,d.minutes/maxMinutes*100)+'%"></i><small>'+d.label+'</small></div>').join('')+'</div></div><div class="weekly-chart"><h3>Words learned</h3><div class="weekly-bar-list">'+week.map(d=>'<div class="weekly-bar-col words" title="'+d.date+': '+d.words+' words"><span>'+d.words+'</span><i style="height:'+Math.max(d.words?8:2,d.words/maxWords*100)+'%"></i><small>'+d.label+'</small></div>').join('')+'</div></div></div><div class="activity-heat-wrap"><div class="activity-head"><h3>Activity map</h3><span>Last 12 weeks</span></div><div class="activity-heatmap" role="img" aria-label="Daily learning activity over the last 12 weeks">'+Array.from({length:84},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-(83-i)),key=dayKey(d),row=days[key]||{},score=(Number(row.minutes)||0)+(Number(row.words)||0)+(Number(row.attempts)||0);return '<span class="activity-cell level-'+(score===0?0:score<3?1:score<8?2:score<16?3:4)+'" title="'+key+': '+(Number(row.minutes)||0)+' min, '+(Number(row.words)||0)+' words"></span>';}).join('')+'</div><div class="activity-legend"><span>Less</span><i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i><span>More</span></div></div></section>';
    if(root)root.innerHTML=markup;if(profileRoot)profileRoot.innerHTML=markup;
  }
  function renderAll() { renderHeader(); renderHome(); renderArcade(); renderStories(); renderWords(); renderTrophies(); renderWeaknessPanel(); renderLearningInsights(); const grammarInsight=$('#grammar-progress-insight'); if(grammarInsight) grammarInsight.innerHTML=renderGrammarMap(); syncSettings(); }
  document.addEventListener('epiphany-auth-changed', () => { renderAll(); if (WORLD && WORLD.mode === 'regions') worldShowRegions(); });


  const STORY_WORDS={
  a:'one; a single thing','an':'one; used before a vowel sound',the:'used to point to a specific thing',is:'be; describes a person or thing',are:'be; describes more than one',was:'be in the past',were:'be in the past for you or more than one',be:'to exist or happen',been:'existed or happened before',being:'existing or happening',and:'joins words or ideas',or:'shows a choice',but:'shows a contrast',if:'on the condition that',so:'for that reason',because:'for the reason that',when:'at the time that',while:'during the time that',before:'earlier than',after:'later than',by:'near; no later than',at:'in a place or time',in:'inside',on:'on top of or touching',under:'below',near:'close to',beside:'next to',to:'toward a place or person',from:'starting at a place or source',with:'together with',without:'not having',of:'shows connection or belonging',for:'intended for; because of',about:'concerning a subject',up:'toward a higher place',down:'toward a lower place',back:'to an earlier place or position',into:'from outside to inside',out:'away from the inside',over:'above or across',already:'before now or then',just:'only; a very short time ago',not:'used to make a statement negative',no:'not any',yes:'a positive answer',all:'every one or everything',one:'the number 1',two:'the number 2',first:'before all others',last:'after all others',every:'each one in a group',some:'an amount or number that is not exact',any:'one or more, no matter which',more:'a greater amount',only:'no more than; alone',very:'to a high degree',too:'more than needed; also',quite:'to some degree',really:'in fact; truly',always:'at every time',never:'at no time',often:'many times',sometimes:'on some occasions',finally:'at the end',again:'one more time',then:'at that time; next',now:'at this time',here:'in this place',there:'in that place',where:'in what place',why:'for what reason',how:'in what way',what:'asks about a thing or information',who:'asks about a person',which:'asks to choose from options',he:'a male person',she:'a female person',they:'more than one person or thing',we:'the speaker and others',i:'the person speaking',you:'the person being spoken to',it:'a thing or animal',his:'belonging to him',her:'belonging to her; a female person',their:'belonging to them',my:'belonging to me',your:'belonging to you',our:'belonging to us',this:'the thing close by or being discussed',that:'the thing farther away or already mentioned',these:'more than one thing close by',those:'things farther away',someone:'an unknown or unnamed person',everyone:'all people',something:'an unknown or unnamed thing',nothing:'not anything',thing:'an object or idea',person:'a human being',people:'human beings',man:'an adult male person',woman:'an adult female person',older:'having lived longer; more old',little:'small in size',small:'not large',large:'big in size',big:'large in size',good:'pleasant or of high quality',bad:'not good',warm:'slightly hot',cold:'having a low temperature',hot:'having a high temperature',dry:'not wet',wet:'covered with water or another liquid',dark:'with little light',bright:'giving or reflecting much light',blue:'the colour of a clear daytime sky',old:'having existed for a long time',new:'recently made or found',strange:'unusual or unfamiliar',quiet:'making little noise',early:'before the usual time',late:'after the expected time',long:'having great length or duration',short:'not long',smallest:'the least large',only:'no more than; alone',home:'the place where someone lives',house:'a building where people live',school:'a place where children learn',park:'a public green place for rest and play',garden:'an area where plants grow',door:'a movable panel used to enter or leave a room',key:'a small object used to open a lock',bag:'a container for carrying things',chair:'a seat for one person',table:'a piece of furniture with a flat top',room:'a part of a building enclosed by walls',kitchen:'a room used for cooking',food:'things people eat',bread:'food made from flour and baked',apple:'a round fruit',juice:'a drink made from fruit or vegetables',water:'the clear liquid people drink',drink:'a liquid that you swallow',coffee:'a hot drink made from roasted beans',cafe:'a place where people buy drinks and light meals',tree:'a tall plant with a trunk and branches',flower:'the colourful part of a plant',dog:'a common animal kept as a pet',cat:'a small animal often kept as a pet',sister:'a female sibling',brother:'a male sibling',family:'a group of related people',friend:'a person you like and trust',name:'the word used to identify someone or something',morning:'the early part of the day',night:'the dark part of each day',day:'a period of 24 hours',week:'seven days',month:'one of the twelve parts of a year',year:'twelve months',time:'the measured passing of moments',minute:'sixty seconds',sunset:'the time when the sun goes below the horizon',sky:'the space above the earth',cloud:'a mass of water droplets in the sky',rain:'water that falls from clouds',train:'a series of connected rail vehicles',station:'a place where trains stop',bus:'a large road vehicle for passengers',taxi:'a car that carries passengers for payment',ticket:'a paper or digital pass for travel or entry',bench:'a long seat for several people',suitcase:'a case used to carry clothes when travelling',desk:'a table used for work or study',sensor:'a device that detects changes or measures something',lab:'a room for scientific work',science:'the study of the natural world',school:'a place where people learn',team:'a group working together',manager:'a person responsible for running a team or activity',meeting:'a gathering of people to talk or work',idea:'a thought or suggestion',chance:'an opportunity for something to happen',contest:'a competition',voice:'the sound made when speaking',word:'a unit of language with meaning',story:'an account of events, real or imagined',question:'a sentence asking for information',answer:'a response to a question',meaning:'what a word or action expresses',help:'to make something easier for someone',find:'to discover where something is',look:'to direct your eyes toward something',see:'to notice with your eyes',watch:'to look at something for a period of time',hear:'to notice a sound',listen:'to pay attention to sound',say:'to speak words',tell:'to give information in words',ask:'to say something to get information',speak:'to use your voice to communicate',talk:'to speak with someone',call:'to contact someone by phone or shout',go:'to move to another place',come:'to move toward a place or person',run:'to move quickly on foot',walk:'to move on foot at a regular pace',sit:'to rest on a seat',stand:'to be upright on your feet',take:'to get or carry something',give:'to hand something to someone',put:'to place something somewhere',get:'to receive, obtain, or become',make:'to create or cause something',do:'to perform an action',use:'to do something with a tool or object',open:'to move something so it is no longer closed',close:'to shut something',start:'to begin',begin:'to start',stop:'to end an action or movement',wait:'to stay until something happens',leave:'to go away from a place',arrive:'to reach a place',reach:'to arrive at or touch something',return:'to come or go back',follow:'to go after someone or something',remember:'to bring something back into your mind',forget:'to fail to remember',think:'to use your mind to consider something',know:'to have information in your mind',understand:'to know the meaning of something',feel:'to experience an emotion or physical sensation',seem:'to appear to be',become:'to begin to be',keep:'to continue to have or do something',try:'to make an effort',need:'to require something',want:'to wish to have or do something',like:'to enjoy or prefer something',love:'to care for someone or something deeply',thank:'to express gratitude',thankful:'feeling grateful',laugh:'to make sounds showing amusement',smile:'to make a happy expression with your mouth',cry:'to produce tears',helped:'gave assistance',found:'discovered where something was',bought:'paid money to get something',brought:'carried something to a place',left:'went away; or did not take something',said:'spoke words',asked:'requested information',looked:'directed the eyes toward something',saw:'noticed with the eyes',went:'moved to another place',came:'moved toward a place',ran:'moved quickly on foot',sat:'rested on a seat',took:'got or carried something',putting:'placing something somewhere',waiting:'staying until something happens',feeling:'experiencing an emotion',speaking:'using the voice to communicate',reading:'looking at and understanding written words',writing:'forming words with letters',missing:'not present; lost',lost:'unable to be found',shiny:'bright because light reflects from it',delayed:'happening later than planned',polished:'made smooth or refined; presented neatly',unproductive:'not producing useful results',promising:'showing signs of future success',routinely:'in a regular or repeated way',inherited:'received from someone before you',rarely:'not often',spoke:'used words to communicate',swept:'moved or hid something with sweeping',frozen:'unable to move because of fear or cold',froze:'became unable to move suddenly',convinced:'strongly believed something was true',blown:'ruined or wasted, in the phrase “blown a chance”',halfway:'at the middle point',opening:'the beginning part of something',public:'for everyone to see or use',prepared:'made ready in advance',months:'periods of about thirty days',weeks:'periods of seven days',equipment:'tools or machines needed for a task',broken:'damaged and not working',readings:'measurements shown by an instrument',assumed:'believed something without being certain',sensor:'a device that detects or measures',kept:'continued to have or do',giving:'providing or handing over',odd:'unusual or strange',mystery:'something difficult to explain or understand',slice:'a thin flat piece cut from something',blamed:'said someone was responsible for a problem',denied:'said that something was not true',taking:'carrying or removing something',hid:'put something where it could not be seen',behind:'at the back of something',quietly:'without making much noise',notebook:'a book of blank pages for writing',hand:'the body part at the end of an arm',suitcase:'a case used for carrying clothes while travelling',hurried:'moved or acted quickly',exactly:'in a precise or correct way',described:'said what something or someone was like',boarded:'got onto a train, bus, or plane',glad:'happy or pleased',detail:'a small piece of information',someone:'an unknown person',cyclist:'a person who rides a bicycle',slowed:'moved less quickly',beside:'next to',halfway:'at the middle point',contest:'a competition',chance:'an opportunity',only:'no more than; alone'
  };
  Object.assign(STORY_WORDS,{
    sam:'a boy’s name in the story',picnic:'a meal eaten outdoors, often in a park',pack:'to put items into a bag before a trip',apples:'round fruits that can be red, green, or yellow',cover:'to lie over or spread across something',fall:'to move down toward the ground; rain falls from clouds',share:'to use or enjoy something together',caf:'part of the word café; see café for the full word'
  });
  Object.assign(STORY_WORDS,{
    ability:'the skill or power to do something',affecting:'having an effect on something',afterward:'later; after an event',amina:'a girl’s name in the story',anonymously:'without showing who you are',approached:'came nearer to a person or place',approval:'agreement that something is good or acceptable',became:'started to be',becoming:'starting to be',began:'started',blunt:'very direct, sometimes in a way that can sound rude',box:'a container with flat sides',busiest:'having the most activity or people',calmer:'more relaxed and less worried',can:'to be able to do something',cannot:'to be unable to do something',changed:'became different',checked:'looked at something to make sure it was correct',choices:'things you can choose from',coach:'a person who trains or guides others',coat:'a piece of clothing worn over other clothes',comments:'things people say or write about something',concern:'a worry or something important to someone',confirmed:'showed that something was true',conversations:'talks between two or more people',corner:'the place where two edges or streets meet',counter:'a long flat surface in a shop or café',daniel:'a boy’s name in the story',decided:'made a choice',decision:'a choice made after thinking',defensive:'acting as if you need to protect yourself from criticism',define:'to explain the meaning of a word or idea',delivered:'brought something to a person or place',did:'past form of “do”',difficult:'not easy to do or understand',disaster:'a very bad event',earlier:'before the present time or another event',event:'something that happens',experience:'knowledge or skill gained by doing something',feedback:'comments that help someone improve',few:'a small number',floor:'the surface you walk on inside a building',flourish:'to grow or develop successfully',front:'the part that faces forward',gradually:'slowly, over a period of time',had:'past form of “have”',hidden:'kept out of sight',him:'used to refer to a male person as an object',holding:'keeping something in your hand or arms',imposing:'impressive in size or appearance; sometimes intimidating',instrument:'a tool or device used for a particular task',invited:'asked someone to come or take part',jumped:'pushed off the ground into the air',learned:'gained knowledge or a skill',leo:'a boy’s name in the story',listeners:'people who listen',made:'created or caused something',measurements:'results found by measuring something',mia:'a girl’s name in the story',mistake:'something that is not correct',neighbourhood:'the area around where people live',nevertheless:'despite what was just said',next:'coming immediately after this',noticed:'became aware of something',pause:'a short stop before continuing',performance:'how well someone does an activity',picks:'chooses or lifts something up',place:'a location or position',pointed:'showed a direction or indicated something',practised:'repeated an activity to improve a skill',praised:'said that someone did something well',preparing:'getting ready for something',process:'a series of steps to do something',pulled:'moved something toward yourself',rafi:'a boy’s name in the story',rather:'instead; or to a certain degree',recording:'a saved sound or video, or the act of saving it',refused:'said no to something',reminded:'helped someone remember',replacing:'putting something new where another thing was',required:'needed or necessary',result:'what happens because of an action',reviewed:'looked at something again to check or improve it',river:'a natural stream of flowing water',road:'a path for vehicles to travel on',routine:'a regular way of doing things',rug:'a piece of thick material used to cover part of a floor',rules:'instructions about what is allowed',saturday:'the day of the week after Friday',sealed:'closed tightly so nothing can enter or escape',seconds:'units of time; one minute has sixty',several:'more than two but not many',six:'the number 6',speech:'a talk given to an audience',spent:'used time or money',stable:'steady and not likely to change suddenly',stopped:'ended an action or movement',sugar:'a sweet substance used in food and drinks',suggested:'offered an idea or possible plan',teacher:'a person who helps others learn',test:'an activity used to check knowledge or function',testing:'checking whether something works or is correct',than:'used to compare two things',through:'from one side to the other; during a whole period',tired:'needing rest',together:'with each other',toward:'in the direction of something',track:'a path or a way to follow progress',treating:'behaving toward someone in a particular way',turned:'changed direction or became',turning:'changing direction or position',useful:'helpful for a purpose',whenever:'at any time that',whether:'if one thing is true or another is true',win:'to be the successful person or team',window:'an opening in a wall with glass to let in light',woke:'stopped sleeping',wrong:'not correct',yet:'until now; or despite that'
  });

  /* ---------- Stories ---------- */
  let ST=null;
  let STORY_MODE='library';
  let STORY_FILTER={level:'current',query:'',length:'all',status:'all'};
  let CREATE_STORY={topic:'mystery',mode:'setup',story:null,answer:'',name:'Robin',friend:'Maya',time:'today',place:'a small town'};
  const storyLevelIndex=level=>LEVELS.findIndex(l=>l.id===level);
  const CREATE_STORY_TOPICS={
    mystery:{label:'A small mystery',emoji:'🔎',target:'bridge',definition:'A structure built over a river, road, or other gap so people can cross from one side to the other.',clue:'Notice what connects the two riverbanks and lets people reach the other side without walking through the water.',hints:['Think about how people cross a river when the water is too deep.','It is a structure people can walk or drive across.'],featureGroups:[['cross','across','crossing','walk across','get across'],['river','water','bank','stream','gap'],['connect','join','link','both sides','between'],['structure','path','way','route']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' reached a river near '+p+'. Heavy rain had made the water rise, and the usual path ended at the opposite bank.',f+' noticed a strong wooden bridge connecting both sides. People could walk across it without stepping into the deep water.','Halfway across, they found a small bag. A note inside showed that it belonged to a cyclist waiting on the other side.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' visited an old village beside '+p+'. A storm had damaged the only safe way across the stream.','A worker explained that the bridge joined the two riverbanks. One loose board had to be repaired before anyone could cross safely.',n+' and '+f+' waited for the repair to finish, then crossed and delivered medicine to a neighbour.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' followed a walking trail near '+p+'. They could see their destination, but a narrow river was between them and the village.','They found a stone bridge above the water. It carried the path from one side of the river to the other.','After crossing, they met a farmer who showed them a shorter path back to town.']}
    ]},
    adventure:{label:'An unexpected adventure',emoji:'🧭',target:'compass',definition:'A small instrument that helps you find directions, often with a needle that points north.',clue:'The characters are lost at a fork in the trail. They need a tool that helps them choose which direction to travel.',hints:['Think of a tool used for navigation when signs or phone signals are missing.','It often has a needle that points north and helps you find directions.'],featureGroups:[['direction','north','south','east','west','way'],['needle','instrument','tool','device'],['navigate','navigation','guide','find','find your way','orientation','travel','use']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' explored a forest near '+p+'. Their map showed three paths, but the signs had fallen down.',f+' took a small compass from the backpack. Its needle pointed north, helping them work out which direction to follow.','They compared the direction with the map and chose the eastern path. Soon, they found a waterfall and a safe route home.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' sailed in a small boat near '+p+'. Thick fog covered the coast, and they could no longer see the lighthouse.',n+' checked a compass, a navigation tool with a needle that points north. It helped them keep the boat moving in the right direction.','When the fog cleared, the lighthouse appeared ahead. They reached the harbour safely and told the harbour worker about the fog.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' found an old treasure map in '+p+'. The map had no street names, only lines and a mark at the top.','A compass helped them identify north and compare the map with the land around them. They could finally tell which path led east.','Following the right direction, they found a box of old photographs instead of gold. The photographs helped the town learn about its history.']}
    ]},
    everyday:{label:'A day-to-day surprise',emoji:'🧾',target:'receipt',definition:'A paper or digital record showing what you bought, the prices, and how much you paid.',clue:'After shopping, the characters need to check the items, prices, and total amount they paid.',hints:['Think about the paper or digital message a shop gives you after you pay.','It lists the things you bought, their prices, and the total cost.'],featureGroups:[['paper','record','proof','document','digital'],['price','cost','total','paid','payment','money','amount'],['list','item','bought','purchase','shop','spending']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' bought a notebook and a bottle of water at a shop in '+p+'. At home, they noticed the total seemed too high.','The receipt listed each item, its price, and the amount paid. When they checked it, they saw that the notebook had been charged twice.',n+' returned to the shop with the paper. The assistant corrected the mistake and returned the extra money.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' bought a gift in '+p+'. The shop assistant asked if they wanted proof of the purchase.','The assistant printed a receipt. It showed the gift, its price, the date, and the total payment.','Later, the gift did not work. Because they kept the paper, the shop could find the purchase and help them exchange it.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' planned a small picnic in '+p+'. They bought fruit, bread, and juice but wanted to stay within their budget.','They checked the receipt to see the price of every item and the total cost. One item was more expensive than they expected.','They changed their shopping list for next time and learned to check the total before leaving the shop.']}
    ]},
    nature:{label:'Nature and discovery',emoji:'🌿',target:'shelter',definition:'A place or structure that protects people from danger or bad weather.',clue:'The weather becomes dangerous. The hikers need a place where they can stay protected from rain and wind.',hints:['Think of a safe place to wait when the weather becomes bad.','It protects people from rain, wind, or danger; it may have a roof and walls.'],featureGroups:[['protect','protection','safe','safety','keep safe'],['rain','wind','weather','storm','cold'],['roof','cover','walls','dry','covered','building','place']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' were walking in the hills near '+p+'. Dark clouds appeared, and the wind became stronger.','They found a small shelter under the rocks. Its roof and three walls kept the hikers dry while the storm passed.','When the rain stopped, they checked the path and continued their walk in safer weather.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' explored a beach near '+p+'. The wind grew cold, and heavy rain started before they could return.','A wooden shelter stood beside the path. It gave them a covered place away from the wind and rain.','They waited there, shared their snacks, and left when the weather became calm.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' were observing birds near '+p+'. A sudden storm began, and the small birds needed somewhere safe.','The park had a shelter with a roof and solid sides. It protected visitors from the rain while they waited for the storm to pass.','After the clouds moved away, the birds returned to the trees and the friends finished their nature walk.']}
    ]},
    communication:{label:'A message misunderstood',emoji:'💬',target:'apology',definition:'Something you say or write to show that you are sorry for a mistake or for hurting someone.',clue:'A message caused a misunderstanding. One character wants to repair the friendship by admitting the mistake and showing regret.',hints:['Think of the words people use after they have upset someone or made a mistake.','It is a way to say you are sorry and try to make things right.'],featureGroups:[['sorry','regret','regretful','feel bad','take responsibility'],['mistake','wrong','hurt','upset','offend'],['say','words','message','express','admit'],['repair','fix','make things right','forgive','friendship']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' sent '+f+' a short message about their plans in '+p+'. The message sounded rude, although that was not what '+n+' meant.',n+' realised the mistake and wrote an apology. The message explained the misunderstanding and showed that '+n+' was sorry for the hurtful words.','After they talked, '+f+' understood the intention. They agreed to ask questions before making assumptions next time.']},
      {pages:(n,f,p,t)=>[t+', '+n+' borrowed '+f+'’s notebook in '+p+' and accidentally left it in the rain. The pages became wet, and '+f+' felt upset.',n+' offered to replace the notebook and gave a sincere apology. It was not just an excuse; '+n+' accepted responsibility for the mistake.','They made a plan to copy the damaged notes together. Their honest conversation helped rebuild trust.']},
      {pages:(n,f,p,t)=>[t+', '+n+' forgot an important meeting with '+f+' in '+p+'. At first, '+f+' thought the meeting did not matter to '+n+'.',n+' sent an apology, explained the reason without making excuses, and suggested a new time. The message showed respect for '+f+'’s time.','They met the next day and added a reminder to their calendars. A sincere message helped them move forward.']}
    ]},
    technology:{label:'A device stops working',emoji:'🔋',target:'battery',definition:'A device that stores energy and supplies electrical power to a phone, toy, or other equipment.',clue:'A handheld device suddenly turns off even though it was working a moment ago. The characters check the part that stores the energy needed to run it.',hints:['Think about the part inside a phone or remote control that provides power.','It stores energy and lets an electronic device work without being plugged in all the time.'],featureGroups:[['power','energy','electricity','charge','supplies'],['store','stores','holds','keeps'],['device','phone','remote','toy','equipment'],['run','work','operate','turn on']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' were using a small radio during a trip near '+p+'. Suddenly, the sound stopped and the screen went dark.',f+' checked the battery, the part that stores energy and supplies power to the radio. Its charge was almost empty, so they replaced it with a charged one.','The radio worked again. They learned to check the power supply before deciding that a device was broken.']},
      {pages:(n,f,p,t)=>[t+', '+n+' wanted to take a photo of an unusual bird in '+p+'. Just as the bird landed, the phone switched off.',n+' checked the battery, a power source that stores energy for the phone. Its charge level had been very low, so the phone could not stay on.','They used '+f+'’s phone to take the picture and charged '+n+'’s phone later. Next time, they planned to check the charge before leaving.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' built a small toy car for a school project in '+p+'. The wheels turned briefly, then stopped.','The car’s battery supplied the electrical energy for its motor. They checked the contacts and discovered that one connection was loose.',n+' fixed the connection, and the toy car moved again. The pair learned that a device needs both a power source and a good connection.']}
    ]},
    investigation:{label:'The case of the missing object',emoji:'🕵️',target:'evidence',definition:'Facts, objects, or information that help show whether an explanation or claim is true.',clue:'The characters have different guesses about what happened. Instead of choosing a guess, they collect details that can support or disprove each explanation.',hints:['Think of information that helps you decide what really happened.','It can be a fact, a mark, a message, or an object that supports an explanation.'],featureGroups:[['fact','detail','information','clue','object','mark'],['support','show','prove','confirm','disprove'],['explanation','claim','idea','theory','what happened'],['observe','check','collect','compare','inspect']],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' noticed that a class project had disappeared from a room in '+p+'. Each person had a different idea about where it might be.','They looked for evidence: a note showing who had borrowed the project, a mark near the storage shelf, and a message from the caretaker.',n+' and '+f+' compared the details and found that the project had been moved safely to another room. They learned to check facts before blaming anyone.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' heard a loud noise outside their home in '+p+'. One person thought a window had broken, while the other suspected a bin had fallen over.','They gathered evidence before deciding: they checked the window, looked for broken glass, and noticed fresh wheel marks beside a fallen bin.','The details showed what had happened. They learned that careful observations are more useful than guesses.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' were trying to discover why a plant in '+p+' had stopped growing. They had several possible explanations.','They checked the soil, compared the plant with a healthy one, and read the notes about watering. These facts were evidence they could use to test their ideas.','They found that the plant had received too little water. By checking the facts, they solved the problem and knew what to change.']}
    ]}
,
    planning:{label:'The picnic budget',emoji:'🧾',target:'budget',definition:'A plan for how much money you can spend and how you will use it.',clue:'The friends have limited money for a class picnic. They compare prices and decide what they can afford before buying anything.',hints:['Think of a money plan that helps you avoid spending too much.','It sets how much you can spend and helps you plan where the money will go.'],featureGroups:[['plan','planning','list','decide'],['money','cost','price','spend','pay'],['limit','amount','how much','afford','within'],['use','manage','control','save','careful']],featureLabels:['that it is a plan','money and spending','a limit on how much can be spent','how the money is managed'],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' were organising a class picnic in '+p+'. They had saved some money, but they still needed food, drinks, and bus tickets.',n+' made a budget, a plan showing how much money they could spend on each item. They compared prices and chose things they could afford.',f+' checked the total before they paid. They had enough for the picnic and kept a little money for emergencies.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' wanted to buy supplies for a school project in '+p+'. They wrote down the items they needed, but the first shopping list cost too much.',n+' created a budget to set a spending limit for each item. They checked prices, removed extras, and chose materials that fit the amount they had.',f+' added the prices together before going to the shop. The plan helped them finish the project without running out of money.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' planned a small birthday party in '+p+'. They wanted decorations and snacks without using all their savings.',n+' set a budget and gave each part of the party a spending limit. They looked at cheaper options and removed things they did not really need.',f+' checked the prices against the plan at the shop. They stayed within the limit and still had a lovely party.']}
    ]},
    emotions:{label:'A worry turns out well',emoji:'🌤️',target:'relieved',definition:'Feeling relaxed and happy because something difficult or worrying has ended or turned out well.',clue:'One character has been worried about an important result. When they learn that things are okay, the worry begins to disappear.',hints:['Think about the feeling you have when a problem is over and you can stop worrying.','You may breathe out, relax, and feel better because the result is good.'],featureGroups:[['worry','worried','fear','stress','anxious','nervous'],['relax','calm','peace','breathe','tension'],['problem','danger','difficulty','result','news'],['feeling','feel','emotion','happy','glad','better']],featureLabels:['the worry or fear beforehand','feeling calm afterward','a problem or concern ending','the emotion someone experiences'],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' waited outside a classroom in '+p+'. They had taken an important exam and were afraid they had made too many mistakes.', 'When the teacher returned, '+n+' learned that the result was better than expected. '+n+' felt relieved and finally stopped worrying about the exam.', 'Later, '+f+' reminded '+n+' that preparing carefully had helped. They celebrated with a walk and planned how to study for the next test.']},
      {pages:(n,f,p,t)=>[t+', '+n+' could not find a wallet after travelling across '+p+'. They checked every pocket and retraced the route, becoming more worried each minute.', 'A bus driver called to say the wallet had been found and was safe. When '+n+' collected it, '+n+' felt relieved because the money and cards were still there.', 'The friends thanked the driver and agreed to check their belongings before leaving the bus next time.']},
      {pages:(n,f,p,t)=>[t+', '+n+' was waiting for news about a friend who had been caught in heavy rain near '+p+'. The phone had no signal, so '+n+' imagined the worst.', 'At last, the friend arrived safely, wet but smiling. '+n+' felt relieved when the danger was over and they could talk face to face.', 'They went inside, made a warm drink, and decided to share their travel plans next time.']}
    ]},
    problemSolving:{label:'Finding a way forward',emoji:'🧩',target:'solution',definition:'An answer or method that solves a problem or helps make a difficult situation better.',clue:'The characters have a problem and several ideas. They test one idea, learn what works, and choose a way to fix the situation.',hints:['Think of the answer people find after thinking carefully about a problem.','It is a way to solve the difficulty or make the situation work better.'],featureGroups:[['answer','way','method','idea','plan'],['solve','fix','deal with','work out','overcome'],['problem','difficulty','challenge','trouble','issue'],['help','improve','work','resolve','result']],featureLabels:['an answer or method','solving or fixing something','the problem being addressed','how the result helps'],variants:[
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' were building a model for a school project in '+p+'. The model kept falling over whenever they moved it.', 'They discussed several ideas and tested a wider base. This solution made the model stable because its weight was spread more evenly.', 'They wrote down what had worked so they could explain the result to their classmates and use the same idea on the next model.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' discovered that the class website would not load during a presentation in '+p+'. They had only a few minutes before the audience arrived.', 'They tried another browser and checked the internet connection. Their solution was to open a saved offline copy of the presentation while the connection was repaired.', 'The presentation continued on time. Afterward, they made a backup plan for future technical problems.']},
      {pages:(n,f,p,t)=>[t+', '+n+' and '+f+' noticed that their group was running out of time to finish a community garden in '+p+'. Everyone was doing the same small tasks, while other jobs were waiting.', 'They listed the remaining work and divided it according to each person’s strengths. This solution helped the group work in parallel instead of waiting for one another.', 'They finished before sunset and agreed to assign clear roles at the start of their next project.']}
    ]}
  };
  
  const CREATE_STORY_FEATURE_LABELS={
    mystery:['crossing a gap','what the structure connects','how people use it','what kind of structure it is'],
    adventure:['finding directions','a navigation tool','how it guides someone'],
    everyday:['a record or proof of purchase','prices and total cost','items purchased'],
    nature:['protection or safety','bad weather or danger','cover or a protected place'],
    communication:['showing regret','a mistake or hurt','expressing that you are sorry','repairing the relationship'],
    technology:['power or energy','storing energy','electronic devices','making equipment work'],
    investigation:['facts or information','supporting or disproving an idea','an explanation or claim','observing and checking details'],
    planning:['that it is a plan','money and spending','a limit on how much can be spent','how the money is managed'],
    emotions:['the worry or fear beforehand','feeling calm afterward','a problem or concern ending','the emotion someone experiences'],
    problemSolving:['an answer or method','solving or fixing something','the problem being addressed','how the result helps']
  };
  const CREATE_STORY_FINAL_HINTS={
    mystery:'Look for a structure that lets people cross from one bank to the other.',
    adventure:'A small tool with a magnetised needle can help you find north.',
    everyday:'It is often printed or emailed after payment and can help with returns.',
    nature:'You can wait inside it until the storm passes.',
    communication:'It names the act of expressing regret and accepting responsibility.',
    technology:'It may need charging or replacing when its stored energy runs low.',
    investigation:'Investigators gather it before deciding what happened.',
    planning:'It helps compare spending with the money available.',
    emotions:'It describes feeling better once the worry has passed.',
    problemSolving:'It is the answer you choose after testing ways to fix the problem.'
  };
  Object.entries(CREATE_STORY_TOPICS).forEach(([key,topic])=>{
    topic.featureLabels=CREATE_STORY_FEATURE_LABELS[key]||[];
    topic.hints.push(CREATE_STORY_FINAL_HINTS[key]||'Think about what it does and why it matters in this situation.');
  });
const CREATE_STORY_TIMES={today:'Today',past:'A few years ago',future:'One day'};
  const CREATE_STORY_PLACES=['a small town','a coastal village','a mountain village','a busy city','a quiet forest'];
  function writerWordBank(){const topicPools={mystery:['clue','evidence','suspect','notice','investigate','missing','carefully','discover','hidden','solve'],adventure:['compass','trail','explore','journey','brave','survive','distant','suddenly','rescue','discover'],everyday:['receipt','budget','change','borrow','return','polite','explain','carefully','promise','solve'],nature:['shelter','storm','branch','wildlife','protect','quietly','observe','discover','survive','fresh'],communication:['apology','explain','misunderstanding','honest','promise','listen','kindly','forgive','respect','reply'],technology:['battery','charge','device','repair','power','connect','carefully','signal','switch','test'],investigation:['evidence','witness','clue','inspect','compare','suspect','honest','record','confirm','solve']};const levelPools={'A1':['help','look','find','small','happy','go','see','safe','friend','home'],'A2':['notice','decide','carefully','suddenly','search','promise','worried','return','explain','quietly'],'B1':['investigate','discover','relieved','mysterious','evidence','consider','although','realise','solution','respond'],'B2':['consequence','hesitate','persuade','reliable','eventually','recognise','determine','despite','approach','resolve'],'C1':['uncover','uncertain','subtle','confront','significant','conclude','interpret','reluctant','convincing','complicated']};if(CREATE_STORY.challengeWords&&CREATE_STORY.challengeWords.length)return CREATE_STORY.challengeWords;return [...new Set([...(topicPools[CREATE_STORY.topic]||topicPools.mystery),...(levelPools[CREATE_STORY.writerLevel||currentLevel().id]||levelPools.A1)])].slice(0,10);}
  function renderCreateStory(){
    const box=$('#create-story-panel');if(!box)return;
    const unlocked=true; // Creative writing is available at every CEFR level; scaffolding adapts below.

    if(CREATE_STORY.mode==='writer'){
      const level=String(CREATE_STORY.writerLevel||currentLevel().id),idx=storyLevelIndex(level),a1=idx<=0,a2=idx===1,b1=idx===2;
      const parts=[
        {key:'opening',title:'1 · The beginning',starter:'One morning, '+CREATE_STORY.name,help:'Introduce your character and where they are.'},
        {key:'problem',title:'2 · The problem',starter:'Suddenly,',help:'Show the problem: '+CREATE_STORY.problemLabel+'.'},
        {key:'attempt',title:'3 · The attempt',starter:'First, '+CREATE_STORY.name+' tried to',help:'What did they try? What went wrong?'},
        {key:'climax',title:'4 · The big moment',starter:'Finally,',help:'Describe the important choice or turning point.'},
        {key:'ending',title:'5 · The ending',starter:'In the end,',help:'Explain how things finished and how the characters felt.'}
      ];
      const banks=writerWordBank();
      const text=parts.map(p=>CREATE_STORY.drafts[p.key]||'').join(' ');
      const used=banks.filter(w=>new Set((text.toLowerCase().match(/[a-z']+/g)||[])).has(w.toLowerCase()));
      const checks=[];
      if(text.trim().length){if(!/[.!?]$/.test(text.trim()))checks.push('Try ending your latest sentence with punctuation.');if((text.match(/\band then\b/gi)||[]).length>=3)checks.push('You use “and then” several times. Try “later”, “after that”, or “as a result”.');if(/\b(yesterday|last night|last week|ago)\b/i.test(text)&&! /\b(was|were|had|went|saw|found|tried|said|felt|came|made|took|decided|looked|walked|ran|helped|discovered)\b/i.test(text))checks.push('Your story sounds like the past. Check whether a verb needs to be in the past tense.');if(text.split(/[.!?]+/).some(s=>s.trim().split(/\s+/).filter(Boolean).length>28))checks.push('One sentence is long. Try splitting it into two.');const sentences=text.split(/[.!?]+/).map(x=>x.trim()).filter(x=>x.length>8),pastCues=/\b(yesterday|last night|last week|ago|was|were|had|went|saw|found|tried|said|felt|came|made|took|decided|looked|walked|ran|helped|discovered)\b/i,presentCues=/\b(every day|usually|often|always|now|today|is|are|does|do|goes|go|says|feels|looks|walks|helps)\b/i;if(pastCues.test(text)&&sentences.some(x=>presentCues.test(x))&&sentences.some(x=>pastCues.test(x)))checks.push('Check tense consistency: some sentences sound past-tense while others sound present-tense. Mixing is fine when the time changes, but make the change clear.');const freq={};(text.toLowerCase().match(/[a-z']{3,}/g)||[]).forEach(w=>{if(!/^(the|and|for|but|with|was|were|then|they|their|this|that|from|into|have|has|had|you|your|she|her|him|his|are|not|one)$/.test(w))freq[w]=(freq[w]||0)+1;});const repeated=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];if(repeated&&repeated[1]>=4)checks.push('The word “'+repeated[0]+'” appears '+repeated[1]+' times. Try a pronoun, a synonym, or a different sentence structure.');if(sentences.some(x=>/^[a-z]/.test(x)))checks.push('Some sentences begin with a lowercase letter. Start each sentence with a capital letter.');}
      const starterBlock=p=>a1?'<p class="writer-scaffold">Complete this idea. You can keep the starter and add your own words.</p>':a2?'<div class="writer-pieces"><button type="button" data-writer-piece="At first,">At first,</button><button type="button" data-writer-piece="because">because</button><button type="button" data-writer-piece="but">but</button><button type="button" data-writer-piece="so">so</button><button type="button" data-writer-piece="after that">after that</button></div>':b1?'<p class="writer-scaffold">Use the starter as a guide, then make the sentence your own.</p>':'<p class="writer-scaffold">Write a full paragraph. You can ignore the starter if you have a stronger opening.</p>';
      box.innerHTML='<div class="create-story-writer"><div class="writer-top"><div><p class="kicker">STAGE 2 · YOUR STORY, YOUR WORDS</p><h3>Write the five moments</h3><p>Level '+esc(level)+' support · '+(a1?'guided fill-in':a2?'sentence-building pieces':b1?'sentence starters':'free paragraph writing')+'</p></div><button type="button" class="btn btn-ghost" id="writer-back">← Edit plan</button></div><aside class="writer-story-card"><p class="kicker">YOUR STORY CARD</p><div class="writer-story-tags"><span>'+esc(CREATE_STORY.genreLabel)+'</span><span>'+esc(CREATE_STORY.place)+'</span><span>'+esc(CREATE_STORY.problemLabel)+'</span></div><strong>'+esc(CREATE_STORY.name)+' &amp; '+esc(CREATE_STORY.friend)+'</strong><p>Goal: solve the problem together. Keep this card in view while writing.</p></aside><div class="writer-bank"><div><p class="kicker">WORD BANK · USE ANY THAT FIT</p><p class="writer-bank-note">Words you use light up as you write.</p></div><div class="writer-word-list">'+banks.map(w=>'<button type="button" data-writer-word="'+esc(w)+'" class="'+(used.includes(w)?'is-used':'')+'">'+esc(w)+(used.includes(w)?' ✓':'')+'</button>').join('')+'</div></div><div class="writer-parts">'+parts.map(p=>'<section class="writer-part"><div class="writer-part-head"><span class="writer-part-number">'+p.key.slice(0,1).toUpperCase()+'</span><div><h4>'+p.title+'</h4><p>'+esc(p.help)+'</p></div></div>'+starterBlock(p)+'<label class="sr-only" for="writer-'+p.key+'">'+p.title+'</label><textarea id="writer-'+p.key+'" data-writer-part="'+p.key+'" rows="'+(idx>=3?4:2)+'" maxlength="1800" placeholder="'+esc(p.starter+(a1?' …': ' continue your idea…'))+'">'+esc(CREATE_STORY.drafts[p.key]||'')+'</textarea>'+(idx>=3?'<p class="writer-scaffold">Try adding a detail about what the character noticed, thought, or felt.</p>':'')+'</section>').join('')+'</div><section class="writer-feedback" aria-live="polite"><div class="writer-feedback-head"><strong>Gentle writing coach</strong><span id="writer-word-count">'+text.trim().split(/\s+/).filter(Boolean).length+' words</span></div><div id="writer-checks">'+(checks.length?checks.map(x=>'<p>'+esc(x)+'</p>').join(''):'<p>Keep going — your story does not need to be perfect on the first try.</p>')+'</div><p id="writer-bank-count">'+used.length+' of '+banks.length+' word-bank words used</p></section><section class="writer-upgrade"><div><strong>Make a word more vivid</strong><p>Choose a simple word in your writing, then pick a richer alternative.</p></div><div class="writer-upgrade-actions">'+[['big','huge','enormous'],['good','excellent','wonderful'],['said','whispered','announced'],['happy','delighted','thrilled'],['bad','awful','terrible'],['walked','hurried','strolled']].map(row=>'<button type="button" data-writer-upgrade="'+row[0]+'" data-writer-options="'+row.slice(1).join('|')+'">'+row[0]+' → '+row[1]+' / '+row[2]+'</button>').join('')+'</div></section><div class="writer-footer"><button type="button" class="btn btn-ghost" id="writer-three-words">🎲 Give me a 3-word challenge</button><button type="button" class="btn" id="writer-finish">Turn my writing into a story →</button></div></div>';return;
    }
    if(CREATE_STORY.mode==='exchange'){
      const source=CREATE_STORY.exchangeStory||{},pages=Array.isArray(source.pages)?source.pages:[];
      box.innerHTML='<div class="create-story-writer"><div class="writer-top"><div><p class="kicker">STORY EXCHANGE · YOUR TURN</p><h3>Continue “'+esc(source.title||'a community story')+'”</h3><p>Keep the original story intact. Add a new scene in your own words; your continuation will be a separate story linked to the original.</p></div><button type="button" class="btn btn-ghost" id="writer-exchange-back">← Back to my story</button></div><div class="writer-reader-pages">'+pages.map((p,i)=>'<article class="writer-reader-page"><span>ORIGINAL · '+(i+1)+'</span><p>'+esc(p)+'</p></article>').join('')+'</div><label for="writer-exchange-text"><strong>Your continuation</strong></label><textarea id="writer-exchange-text" rows="6" maxlength="1800" placeholder="The next day, something unexpected happened…">'+esc(CREATE_STORY.exchangeText||'')+'</textarea><p class="writer-privacy-note">Your continuation stays private unless you explicitly choose to share it.</p><div class="writer-footer"><button type="button" class="btn" id="writer-save-exchange">🔒 Save continuation privately</button><button type="button" class="btn btn-ghost" id="writer-publish-exchange">🌍 Share continuation</button></div><p id="writer-exchange-status" role="status" aria-live="polite"></p></div>';return;
    }
    if(CREATE_STORY.mode==='published'){
      const pages=CREATE_STORY.publishedPages||[],all=pages.join(' '),words=all.trim().split(/\s+/).filter(Boolean),bank=writerWordBank(),tokens=new Set((all.toLowerCase().match(/[a-z']+/g)||[])),used=bank.filter(w=>tokens.has(w.toLowerCase())),best=pages.slice().sort((x,y)=>y.split(/\s+/).length-x.split(/\s+/).length)[0]||'';
      box.innerHTML='<div class="create-story-published"><div class="writer-top"><div><p class="kicker">STAGE 3 · YOUR STORY IS READY</p><h3>'+esc(CREATE_STORY.savedTitle||((CREATE_STORY.name||'My')+'’s story'))+'</h3><p>You made something of your own. Read it aloud, revise it, or save it to your local library.</p></div><button type="button" class="btn btn-ghost" id="writer-edit">Edit story</button></div><div class="writer-reader-pages">'+pages.map((p,i)=>'<article class="writer-reader-page"><span>PAGE '+(i+1)+'</span><p>'+esc(p)+'</p></article>').join('')+'</div><div class="writer-result-stats"><div><strong>'+words.length+'</strong><span>words</span></div><div><strong>'+used.length+'</strong><span>word-bank words</span></div><div><strong>'+pages.length+'</strong><span>story pages</span></div></div><section class="writer-best-line"><p class="kicker">A LINE TO BE PROUD OF</p><p>'+esc(best)+'</p></section><div class="writer-footer"><button type="button" class="btn" id="writer-read-aloud">🔊 Read my story</button><button type="button" class="btn" id="writer-save-story">♡ Save to My Library</button><button type="button" class="btn" id="writer-cloud-save">🔒 Save privately to my account</button><button type="button" class="btn btn-ghost" id="writer-publish-story">🌍 Publish to community</button><button type="button" class="btn btn-ghost" id="writer-new-story">Create another story</button></div><p class="writer-privacy-note">Account copies are private by default. Only “Publish to community” makes a story visible to other learners.</p><section class="writer-library"><h4>My story library · this device</h4><div id="writer-library-list"></div><div class="writer-cloud-library"><div class="writer-exchange-head"><div><h4>Stories saved to your account</h4><p>These stories follow you when you sign in on another device.</p></div><button type="button" class="btn btn-ghost" id="writer-load-cloud-library">Refresh account stories</button></div><div id="writer-cloud-library-list"><p class="create-story-note">Sign in to view stories saved to your account.</p></div></div></section><section class="writer-exchange"><div class="writer-exchange-head"><div><h4>Story exchange</h4><p>Read a story shared by another learner, then write your own continuation.</p></div><button type="button" class="btn btn-ghost" id="writer-load-community">Explore community stories</button></div><div id="writer-community-list"><p class="create-story-note">Sign in to explore stories shared by learners.</p></div></section><div class="writer-optional-challenge"><p class="kicker">OPTIONAL · OLD CHALLENGE</p><p>Want to practise explaining a word from a ready-made story? The hidden-word challenge is still available.</p><button type="button" class="btn btn-ghost" id="writer-hidden-word">Try the hidden-word challenge</button></div></div>';
      renderCreatedStoryLibrary();loadMyCloudStoryLibrary();return;
    }
    if(CREATE_STORY.mode==='setup'){
      box.innerHTML='<div class="create-story-setup"><div class="create-story-intro"><span class="create-story-icon">✨</span><div><p class="kicker">YOUR CHOICES · YOUR STORY</p><h3>Build a story in seconds</h3><p>Choose a theme, two characters, a time and a place. Then read the story and explain a hidden word in your own English.</p></div></div><form id="create-story-form" class="create-story-form"><label for="create-topic">Story idea</label><select id="create-topic" name="topic">'+Object.entries(CREATE_STORY_TOPICS).map(([id,t])=>'<option value="'+id+'" '+(CREATE_STORY.topic===id?'selected':'')+'>'+t.emoji+' '+t.label+'</option>').join('')+'</select><div class="create-story-two"><div><label for="create-name">Main character</label><input id="create-name" name="name" maxlength="24" value="'+esc(CREATE_STORY.name)+'" required></div><div><label for="create-friend">Friend / partner</label><input id="create-friend" name="friend" maxlength="24" value="'+esc(CREATE_STORY.friend)+'" required></div></div><label for="create-time">When does it happen?</label><select id="create-time" name="time"><option value="today" '+(CREATE_STORY.time==='today'?'selected':'')+'>Today</option><option value="past" '+(CREATE_STORY.time==='past'?'selected':'')+'>A few years ago</option><option value="future" '+(CREATE_STORY.time==='future'?'selected':'')+'>One day</option></select><label for="create-place">Where does it happen?</label><select id="create-place" name="place">'+CREATE_STORY_PLACES.map(p=>'<option value="'+esc(p)+'" '+(p===CREATE_STORY.place?'selected':'')+'>'+p+'</option>').join('')+'</select><label for="create-problem">What goes wrong?</label><select id="create-problem" name="problem"><option value="lost">Something important goes missing</option><option value="storm">A sudden storm changes the plan</option><option value="secret">A surprising secret is discovered</option><option value="late">They are running out of time</option><option value="help">Someone needs help</option><option value="mixup">A funny misunderstanding happens</option></select><div class="create-story-setup-actions"><button class="btn" type="button" id="create-story-start-writing">Plan &amp; write my story →</button><button class="btn btn-ghost" type="submit">Try the hidden-word challenge instead</button></div><p class="create-story-note">Writing is open from A1. The activity will offer simpler sentence frames or more freedom depending on your level.</p></form></div>';return;
    }
    const s=CREATE_STORY.story;if(!s)return;
    if(CREATE_STORY.mode==='story'){
      const hintLevel=CREATE_STORY.hintLevel||0;
      const hintBlock='<div class="create-story-hints"><div class="create-story-hint-head"><strong>Need a hint?</strong><span>'+(hintLevel===0?'No hints used':hintLevel+' of 3 hints revealed')+'</span></div>'+(hintLevel>0?'<p class="create-story-hint">'+esc(s.hints[0])+'</p>':'')+(hintLevel>1?'<p class="create-story-hint">'+esc(s.hints[1])+'</p>':'')+(hintLevel>2?'<p class="create-story-hint">'+esc(s.hints[2])+'</p>':'')+(hintLevel<3?'<button type="button" class="btn btn-ghost" data-create-hint>Reveal '+(['first','stronger','final'][hintLevel])+' hint</button>':'<p class="create-story-note">You have seen all three hints. Use them to explain the idea in your own words.</p>')+'</div>';
      const storyPages=s.pages.map((p,i)=>'<p class="create-story-paragraph"><span>'+String(i+1).padStart(2,'0')+'</span>'+String(p).split(s.target).map(esc).join('<span class="hidden-word" aria-label="hidden word">________</span>')+'</p>').join('');
      box.innerHTML='<div class="create-story-reader"><div class="create-story-story-head"><span class="create-story-icon">'+s.emoji+'</span><div><p class="kicker">YOUR STORY · '+esc(currentLevel().id)+'</p><h3>'+esc(s.label)+'</h3><p>Read the whole story. One important word is hidden inside the text.</p></div></div>'+storyPages+'<div class="create-story-gap"><p class="kicker">THINK FROM CONTEXT</p><p>'+esc(s.clue)+'</p>'+hintBlock+'<p class="create-story-instruction">Explain the missing word in English. Describe its purpose or meaning without writing the word itself.</p><form id="create-story-answer-form"><label for="create-story-answer">Your explanation</label><textarea id="create-story-answer" name="answer" rows="3" maxlength="500" required placeholder="It is a thing / place that…">'+esc(CREATE_STORY.answer)+'</textarea><button class="btn" type="submit">Check my explanation</button></form></div></div>';return;
    }
    const assessment=CREATE_STORY.assessment||{title:'Keep exploring the meaning',message:'Compare your idea with the meaning below. A different wording can still be correct.',hits:0};
    box.innerHTML='<div class="create-story-feedback"><p class="kicker">THINK · EXPLAIN · REMEMBER</p><h3>'+esc(assessment.title)+'</h3><p class="create-story-assessment">'+esc(assessment.message)+'</p><div class="create-story-scoreline"><span>Meaning clues noticed</span><strong>'+Number(assessment.hits||0)+' / '+Number(assessment.total||0)+'</strong><div class="create-story-scorebar"><span style="width:'+Math.round(100*(Number(assessment.hits||0)/Math.max(1,Number(assessment.total||0))))+'%"></span></div></div>'+(CREATE_STORY.selfRate==='practice'?'<p class="create-story-self-rate">You chose to practise this skill again. Try a new story and look for context clues.</p>':CREATE_STORY.selfRate==='good'?'<p class="create-story-self-rate">You marked your explanation as clear. Keep building confidence with another word.</p>':'')+'<div class="create-story-your-answer"><strong>Your explanation</strong><p>'+esc(CREATE_STORY.answer)+'</p></div><div class="create-story-model"><strong>One possible meaning</strong><p>'+esc(s.definition)+'</p></div><p class="create-story-note">This is a light clue-based check, not a strict grade. Good explanations can use different words, so use the feedback as guidance rather than a final judgement.</p><div class="create-story-rating"><button class="btn btn-ghost" data-create-rate="practice">I want more practice</button><button class="btn" data-create-rate="good">I explained it clearly</button></div><button class="btn btn-ghost" data-create-next>Make another story →</button></div>';
  }
  function assessCreateStoryAnswer(answer,story){
    const lower=String(answer||'').toLowerCase().replace(/[’]/g,"'");
    const groups=story.featureGroups||[];
    const coveredIndices=[];
    const hasTerm=term=>{
      const forms=[term];
      if(term.length>3){
        if(term.endsWith('y'))forms.push(term.slice(0,-1)+'ies',term.slice(0,-1)+'ied');
        else if(term.endsWith('e'))forms.push(term+'s',term+'d',term.slice(0,-1)+'ing');
        else forms.push(term+'s',term+'es',term+'ed',term+'ing');
      }
      return forms.some(form=>{
        const escaped=form.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
        return new RegExp('\\b'+escaped+'\\b','i').test(lower);
      });
    };
    groups.forEach((group,index)=>{if(group.some(hasTerm))coveredIndices.push(index);});
    const details=coveredIndices.length;
    const missing=(story.featureLabels||['its main purpose','what it is or does','how it is used','why it matters']).filter((_,index)=>!coveredIndices.includes(index));
    const nextClue=missing.length?' Try adding a clue about '+missing[0]+'.':'';
    if(details>=3)return {hits:details,total:groups.length,title:'You explained the meaning clearly!',message:'Your explanation includes '+details+' useful meaning clues. Compare it with the example definition and see whether you can make it even more precise.'};
    if(details===2)return {hits:details,total:groups.length,title:'You have the main idea',message:'You included two useful clues.'+nextClue+' Different wording can still be correct.'};
    if(details===1)return {hits:details,total:groups.length,title:'You have part of the idea',message:'You mentioned one useful part of the meaning.'+nextClue+' Add another detail in your own words.'};
    return {hits:0,total:groups.length,title:'Good start — add a clearer clue',message:'The checker did not recognise enough specific meaning clues yet.'+nextClue+' Use the story and hints to explain what it does or why it matters; different wording can still be correct.'};
  }

  const STORY_PROBLEMS={lost:'something important goes missing',storm:'a sudden storm changes the plan',secret:'a surprising secret is discovered',late:'they are running out of time',help:'someone needs help',mixup:'a funny misunderstanding happens'};
  function startGuidedStory(form){
    if(!form)return;
    const data=new FormData(form),topic=String(data.get('topic')||'mystery'),name=String(data.get('name')||'Robin').trim().slice(0,24)||'Robin',friend=String(data.get('friend')||'Maya').trim().slice(0,24)||'Maya',place=String(data.get('place')||CREATE_STORY_PLACES[0]),problem=String(data.get('problem')||'lost'),t=CREATE_STORY_TOPICS[topic]||CREATE_STORY_TOPICS.mystery;
    CREATE_STORY={...CREATE_STORY,topic,genreLabel:t.label,name,friend,place,problem,problemLabel:STORY_PROBLEMS[problem]||STORY_PROBLEMS.lost,writerLevel:currentLevel().id,mode:'writer',drafts:{},challengeWords:[],lastPart:'opening',story:null,answer:''};
    renderCreateStory();
  }
  function updateWriterFeedback(){
    const box=$('#create-story-panel');if(!box||CREATE_STORY.mode!=='writer')return;
    const drafts=CREATE_STORY.drafts||{},all=['opening','problem','attempt','climax','ending'].map(k=>drafts[k]||'').join(' '),words=all.trim().split(/\s+/).filter(Boolean),bank=writerWordBank(),tokens=new Set((all.toLowerCase().match(/[a-z']+/g)||[])),used=bank.filter(w=>tokens.has(w.toLowerCase())),checks=[];
    if(all.trim()){if(!/[.!?]$/.test(all.trim()))checks.push('Try ending your latest sentence with punctuation.');if((all.match(/\band then\b/gi)||[]).length>=3)checks.push('“And then” appears several times. Try “later”, “after that”, or “as a result”.');if(/\b(yesterday|last night|last week|ago)\b/i.test(all)&&! /\b(was|were|had|went|saw|found|tried|said|felt|came|made|took|decided|looked|walked|ran|helped|discovered)\b/i.test(all))checks.push('This sounds like the past. Check whether you need a past-tense verb.');if(all.split(/[.!?]+/).some(s=>s.trim().split(/\s+/).filter(Boolean).length>28))checks.push('One sentence is long. Could you split it into two?');if(/\b(they|we|you)\s+was\b/i.test(all))checks.push('Check “was”: with they / we / you we usually say “were”.');if(/\b(he|she|it)\s+were\b/i.test(all))checks.push('Check “were”: with he / she / it we usually say “was”.');if(/\b(did not|didn['’]t)\s+(found|saw|went|took|made|came|had|said|knew|got)\b/i.test(all)||/\b(they|we|he|she|it|i)\s+not\s+(found|saw|went|took|made|came|had|said|knew|got)\b/i.test(all))checks.push('For a past negative, use “did not” + the base verb (did not find), or “was / were not”.');}
    const wc=$('#writer-word-count');if(wc)wc.textContent=words.length+' words';const cc=$('#writer-checks');if(cc)cc.innerHTML=(checks.length?checks.map(x=>'<p>'+esc(x)+'</p>').join(''):'<p>Keep going — this is a friendly coach, not a strict grammar exam.</p>')+(CREATE_STORY.lastRevision?'<section class="writer-before-after"><strong>Before and after</strong><p><span>Original</span>'+esc(CREATE_STORY.lastRevision.before)+'</p><p><span>Improved</span>'+esc(CREATE_STORY.lastRevision.after)+'</p></section>':'');const bc=$('#writer-bank-count');if(bc)bc.textContent=used.length+' of '+bank.length+' word-bank words used';
    const bankRoot=$('.writer-word-list');if(bankRoot)bankRoot.innerHTML=bank.map(w=>'<button type="button" data-writer-word="'+esc(w)+'" class="'+(used.includes(w)?'is-used':'')+'">'+esc(w)+(used.includes(w)?' ✓':'')+'</button>').join('');
  }
  function finishGuidedStory(){
    const keys=['opening','problem','attempt','climax','ending'],drafts=CREATE_STORY.drafts||{},complete=keys.map(k=>String(drafts[k]||'').trim());
    const missing=keys.filter(k=>!String(drafts[k]||'').trim());
    if(missing.length){const labels={opening:'the beginning',problem:'the problem',attempt:'the attempt',climax:'the big moment',ending:'the ending'};toast('Write '+labels[missing[0]]+' before finishing. All five moments are required.');const field=$('[data-writer-part="'+missing[0]+'"]');if(field)field.focus();return;}
    if(complete.some(page=>page.split(/\s+/).filter(Boolean).length<4)){toast('Each story moment needs at least four words. Add a little more detail.');return;}
    CREATE_STORY.publishedPages=complete;CREATE_STORY.mode='published';CREATE_STORY.publishedAt=new Date().toISOString();renderCreateStory();
  }
  function readCreatedStories(){try{const x=JSON.parse(localStorage.getItem('epiphany-created-stories')||'[]');return Array.isArray(x)?x:[];}catch{return[];}}
  function renderCreatedStoryLibrary(){
    const box=$('#writer-library-list');if(!box)return;const items=readCreatedStories();
    box.innerHTML=items.length?items.slice(0,8).map((s,i)=>'<article class="writer-saved-item"><div><strong>'+esc(s.title||'My story')+'</strong><small>'+Number(s.wordCount||0)+' words · '+esc((s.savedAt||'').slice(0,10))+'</small></div><button type="button" data-speak="'+esc((s.pages||[]).join(' ').slice(0,1800))+'" aria-label="Listen to saved story">🔊</button></article>').join(''):'<p class="create-story-note">Your saved stories will appear here on this device.</p>';
  }
  function createdStoryEntry(){
    const pages=CREATE_STORY.publishedPages||[],full=pages.join(' '),items=readCreatedStories(),existing=items.find(s=>s.id===CREATE_STORY.localStoryId);
    return {...(existing||{}),id:existing?existing.id:'story-'+Date.now(),cloudId:CREATE_STORY.cloudStoryId||(existing&&existing.cloudId)||null,title:CREATE_STORY.savedTitle||(CREATE_STORY.name||'My')+' and '+(CREATE_STORY.friend||'a friend'),genre:CREATE_STORY.genreLabel||'adventure',level:CREATE_STORY.writerLevel||currentLevel().id,pages,wordCount:full.trim().split(/\s+/).filter(Boolean).length,savedAt:new Date().toISOString(),problem:CREATE_STORY.problem||''};
  }
  function saveCreatedStory(){
    const entry=createdStoryEntry(),items=readCreatedStories();
    try{CREATE_STORY.localStoryId=entry.id;localStorage.setItem('epiphany-created-stories',JSON.stringify([entry,...items.filter(s=>s.id!==entry.id)].slice(0,30)));toast('Saved to My Story Library on this device.');renderCreatedStoryLibrary();}catch{toast('Could not save on this device. Check your browser storage settings.');}
  }
  async function saveCreatedStoryToAccount(visibility='private'){
    if(!window.EpiphanyAuth||!window.EpiphanyAuth.saveStory){toast('Account service is unavailable.');return;}
    try{const entry=createdStoryEntry(),cloudId=await window.EpiphanyAuth.saveStory(entry,visibility);CREATE_STORY.cloudStoryId=cloudId;CREATE_STORY.localStoryId=entry.id;entry.cloudId=cloudId;entry.visibility=visibility;const items=readCreatedStories();localStorage.setItem('epiphany-created-stories',JSON.stringify([entry,...items.filter(s=>s.id!==entry.id)].slice(0,30)));toast(visibility==='public'?'Story shared with the community.':'Story saved privately to your account.');renderCreatedStoryLibrary();}catch(error){toast(error.message||'Could not save story to account.');}
  }
  async function loadMyCloudStoryLibrary(){
    const list=$('#writer-cloud-library-list');if(!list)return;
    if(!window.EpiphanyAuth||!window.EpiphanyAuth.listMyStories){list.innerHTML='<p>Account service is unavailable.</p>';return;}
    list.innerHTML='<p>Loading your account stories…</p>';
    try{const stories=await window.EpiphanyAuth.listMyStories();window.__epiphanyMyCloudStories=Object.fromEntries(stories.map(s=>[s.id,s]));list.innerHTML=stories.length?stories.map(s=>'<article class="writer-community-item"><div><strong>'+esc(s.title||'My story')+'</strong><small>'+esc(s.level||'A1')+' · '+esc(s.visibility==='public'?'Public':'Private')+' · '+Number(s.word_count||0)+' words</small><p>'+esc((Array.isArray(s.pages)?s.pages:[]).join(' ').slice(0,180))+'</p></div><button type="button" class="btn btn-ghost" data-open-cloud-story="'+esc(s.id)+'">Open story</button></article>').join(''):'<p>No stories saved to your account yet.</p>';}catch(error){list.innerHTML='<p>'+esc(error.message||'Could not load account stories. Sign in and try again.')+'</p>';}
  }
  async function loadCommunityStoryExchange(){
    const list=$('#writer-community-list');if(!list)return;
    if(!window.EpiphanyAuth||!window.EpiphanyAuth.listPublicStories){list.innerHTML='<p>Account service is unavailable.</p>';return;}
    list.innerHTML='<p>Loading community stories…</p>';
    try{const stories=await window.EpiphanyAuth.listPublicStories();window.__epiphanyCommunityStories=Object.fromEntries(stories.map(s=>[s.id,s]));list.innerHTML=stories.length?stories.map(s=>'<article class="writer-community-item"><div><strong>'+esc(s.title||'A learner’s story')+'</strong><small>'+esc(s.level||'A1')+' · '+esc(s.genre||'adventure')+' · '+Number(s.word_count||0)+' words</small><p>'+esc((Array.isArray(s.pages)?s.pages:[]).join(' ').slice(0,240))+'</p></div><button type="button" class="btn btn-ghost" data-exchange-story="'+esc(s.id)+'">Continue this story →</button></article>').join(''):'<p>No public stories yet. Be the first to share one if you wish.</p>';}catch(error){list.innerHTML='<p>'+esc(error.message||'Could not load community stories. Sign in and try again.')+'</p>';}
  }
  async function saveStoryExchange(visibility='private'){
    const source=CREATE_STORY.exchangeStory||{},text=String($('#writer-exchange-text')?.value||'').trim(),status=$('#writer-exchange-status');
    if(text.length<12){if(status)status.textContent='Write at least a short sentence before saving.';return;}
    if(!window.EpiphanyAuth||!window.EpiphanyAuth.saveStory){if(status)status.textContent='Sign in to save a continuation.';return;}
    const pages=[...(Array.isArray(source.pages)?source.pages:[]),text],full=pages.join(' '),entry={title:'Continuation: '+String(source.title||'Community story').slice(0,75),genre:source.genre||'adventure',level:source.level||currentLevel().id,pages,wordCount:full.trim().split(/\s+/).filter(Boolean).length,problem:'Story exchange continuation',replyTo:source.id};
    try{await window.EpiphanyAuth.saveStory(entry,visibility);if(status)status.textContent=visibility==='public'?'Your continuation is shared with the community.':'Your continuation is saved privately to your account.';toast(visibility==='public'?'Continuation shared.':'Continuation saved privately.');}catch(error){if(status)status.textContent=error.message||'Could not save the continuation.';}
  }
  function createStorySubmit(form){
    const data=new FormData(form),topic=String(data.get('topic')||'mystery'),name=String(data.get('name')||'Robin').trim().slice(0,24)||'Robin',friend=String(data.get('friend')||'Maya').trim().slice(0,24)||'Maya',time=String(data.get('time')||'today'),place=String(data.get('place')||CREATE_STORY_PLACES[0]),t=CREATE_STORY_TOPICS[topic]||CREATE_STORY_TOPICS.mystery;
    const timePhrase=CREATE_STORY_TIMES[time]||'Today',variant=t.variants[Math.floor(Math.random()*t.variants.length)];
    const pages=variant.pages(name,friend,place,timePhrase);
    CREATE_STORY={...CREATE_STORY,topic,mode:'story',name,friend,time,place,answer:'',selfRate:null,hintLevel:0,assessment:null,story:{...t,pages}};
    renderCreateStory();
  }
  function submitCreateStoryAnswer(form){
    if(!CREATE_STORY.story)return;
    const answer=String(new FormData(form).get('answer')||'').trim();
    if(answer.length<12){toast('Try to explain the idea in a little more detail.');return;}
    if(new RegExp('\\b'+CREATE_STORY.story.target+'\\b','i').test(answer)){toast('Try describing the meaning without using the hidden word itself.');return;}
    CREATE_STORY.answer=answer;CREATE_STORY.assessment=assessCreateStoryAnswer(answer,CREATE_STORY.story);CREATE_STORY.mode='feedback';CREATE_STORY.selfRate=null;renderCreateStory();
  }
  
  const storyIsSaved=word=>state.words.some(w=>String(w[0]).toLowerCase()===String(word).toLowerCase());
  function renderStories(){
    const root=$('#stories-content');if(!root||typeof STORIES==='undefined')return;
    const unlocked=hasDeveloperAccess()?LEVELS.length-1:storyLevelIndex(currentLevel().id),ordered=STORIES.slice().sort((a,b)=>storyLevelIndex(a.level)-storyLevelIndex(b.level)||a.title.localeCompare(b.title));
    const featured=ordered.find(s=>!s.season&&storyLevelIndex(s.level)<=unlocked&&!(state.stories[s.id]&&state.stories[s.id].done))||ordered.find(s=>!s.season&&storyLevelIndex(s.level)<=unlocked)||ordered.find(s=>storyLevelIndex(s.level)<=unlocked)||ordered[0];
    const filtered=ordered.filter(s=>{const saved=state.stories[s.id]||{},done=!!saved.done,reading=!done&&Number.isInteger(saved.lastPage)&&saved.lastPage>=0&&!!saved.readerSession;const query=STORY_FILTER.query.trim().toLowerCase();return (!query||(s.title+' '+s.level+' '+(s.description||'')+' '+(s.pages||[]).map(p=>p.text||'').join(' ')).toLowerCase().includes(query))&&(STORY_FILTER.level==='all'||s.level===(STORY_FILTER.level==='current'?currentLevel().id:STORY_FILTER.level))&&(STORY_FILTER.length==='all'||(STORY_FILTER.length==='short'?(s.minutes||0)<=5:(s.minutes||0)>5))&&(STORY_FILTER.status==='all'||(STORY_FILTER.status==='unread'&&!reading&&!done)||(STORY_FILTER.status==='reading'&&reading)||(STORY_FILTER.status==='done'&&done));});
    const visibleFeatured=filtered.includes(featured)?featured:(filtered.find(s=>!s.season)||filtered[0]||null);
    const resumeStory=ordered.filter(s=>{const saved=state.stories[s.id]||{};return !saved.done&&saved.readerSession&&Number.isInteger(saved.lastPage)&&saved.lastPage>=0;}).sort((a,b)=>String((state.stories[b.id]||{}).lastOpenedAt||'').localeCompare(String((state.stories[a.id]||{}).lastOpenedAt||'')))[0]||null;
    const resumeSaved=resumeStory?(state.stories[resumeStory.id]||{}):null;
    const card=(s,large)=>{const saved=state.stories[s.id]||{},locked=storyLevelIndex(s.level)>unlocked,done=!!saved.done,reading=!done&&Number.isInteger(saved.lastPage)&&saved.lastPage>=0&&!!saved.readerSession&&saved.lastPage<(saved.readerSession.pages?saved.readerSession.pages.length:s.pages.length);return '<button type="button" class="story-card '+(large?'story-featured ':'')+(locked?'is-locked ':'')+(done?'is-done':'')+'" data-story-open="'+esc(s.id)+'" '+(locked?'aria-disabled="true"':'')+'><span class="story-art" style="--story-tone:'+esc(s.tone)+'"><span>'+esc(s.emoji)+'</span>'+(locked?'<b>🔒</b>':'')+'</span><span class="story-card-info"><span class="story-card-meta"><em>'+esc(s.level)+'</em><small>'+(s.season?'S1 · EP '+s.season.episode:s.minutes+' min')+'</small></span><strong>'+esc(s.title)+'</strong><small>'+(locked?'Unlock at '+esc(s.level):reading?'Continue · Page '+(saved.lastPage+1)+' of '+(saved.readerSession&&saved.readerSession.pages?saved.readerSession.pages.length:s.pages.length):done?'✓ Completed · '+saved.score+'/3':'Read this story')+'</small></span></button>';};
    root.innerHTML=(hasDeveloperAccess()?'<p class="developer-access-note">🛠 Developer access active · all CEFR stories unlocked for testing</p>':'')+'<div class="story-mode-switch" role="tablist" aria-label="Story modes"><button type="button" role="tab" aria-selected="'+(STORY_MODE==='library')+'" class="'+(STORY_MODE==='library'?'is-active':'')+'" data-story-mode="library"><span>📚</span><strong>Story Library</strong><small>Read and choose</small></button><button type="button" role="tab" aria-selected="'+(STORY_MODE==='create')+'" class="'+(STORY_MODE==='create'?'is-active':'')+'" data-story-mode="create"><span>✨</span><strong>Create Your Story</strong><small>Read · infer · explain</small></button></div>'+(STORY_MODE==='library'&&resumeStory?'<section class="story-continue-card"><div><p class="kicker">PICK UP WHERE YOU LEFT OFF</p><h2>'+esc(resumeStory.title)+'</h2><p>Page '+(resumeSaved.lastPage+1)+' of '+(resumeSaved.readerSession.pages?resumeSaved.readerSession.pages.length:resumeStory.pages.length)+' · '+esc(resumeStory.level)+'</p></div><button type="button" class="btn" data-story-open="'+esc(resumeStory.id)+'">Continue reading →</button></section>':'')+(STORY_MODE==='create'?'<section class="create-story-shell"><div id="create-story-panel"></div></section>':'')+'<div class="story-library-content" '+(STORY_MODE==='library'?'':'hidden')+'><section class="story-filters" aria-label="Find a story"><div class="story-level-tabs" role="group" aria-label="Filter stories by level"><button type="button" data-story-level-tab="current" class="'+(STORY_FILTER.level==='current'?'is-active':'')+'">My level · '+esc(currentLevel().id)+'</button><button type="button" data-story-level-tab="all" class="'+(STORY_FILTER.level==='all'?'is-active':'')+'">All</button>'+LEVELS.map(l=>'<button type="button" data-story-level-tab="'+l.id+'" class="'+(STORY_FILTER.level===l.id?'is-active':'')+'">'+l.id+'</button>').join('')+'</div><label class="story-search"><span>Search stories</span><input type="search" id="story-search-input" value="'+esc(STORY_FILTER.query)+'" placeholder="Title, topic, or level…" autocomplete="off"></label><details class="story-advanced-filters"><summary>Filters <span>Length · Status</span></summary><div class="story-filter-row"><label>Length<select id="story-length-filter"><option value="all" '+(STORY_FILTER.length==='all'?'selected':'')+'>Any length</option><option value="short" '+(STORY_FILTER.length==='short'?'selected':'')+'>Short · up to 5 min</option><option value="long" '+(STORY_FILTER.length==='long'?'selected':'')+'>Long · over 5 min</option></select></label><label>Status<select id="story-status-filter"><option value="all" '+(STORY_FILTER.status==='all'?'selected':'')+'>All stories</option><option value="unread" '+(STORY_FILTER.status==='unread'?'selected':'')+'>Not read yet</option><option value="reading" '+(STORY_FILTER.status==='reading'?'selected':'')+'>In progress</option><option value="done" '+(STORY_FILTER.status==='done'?'selected':'')+'>Completed</option></select></label></div></details><p class="story-results-count" id="story-results-count">'+filtered.length+' stories found</p></section>'+(filtered.some(s=>s.season&&s.season.id==='riverside-season-1')?'<section class="story-season"><div class="block-head"><p class="kicker">SEASON 1 · SIX CONNECTED EPISODES</p><h2>The Riverside Club</h2><p>Meet the same neighbourhood friends across six episodes. Their small choices build toward a community open day.</p></div><div class="story-grid">'+filtered.filter(s=>s.season&&s.season.id==='riverside-season-1').sort((a,b)=>a.season.episode-b.season.episode).map(s=>card(s,false)).join('')+'</div></section>':'')+(visibleFeatured&&!visibleFeatured.season?'<section class="story-feature-section"><div class="block-head"><h2>Recommended story</h2><p>One small story, a little more English.</p></div>'+card(visibleFeatured,true)+'</section>':'')+LEVELS.map(item=>item.id).filter(level=>filtered.some(s=>s.level===level&&!s.season)).map(level=>'<section class="story-level"><div class="block-head"><h2>'+level+' stories</h2><p>'+(storyLevelIndex(level)<=unlocked?'Ready to read':'Reach '+level+' to unlock these stories')+'</p></div><div class="story-grid">'+filtered.filter(s=>s.level===level&&!s.season&&(!visibleFeatured||s.id!==visibleFeatured.id)).map(s=>card(s,false)).join('')+'</div></section>').join('')+(filtered.length?'':'<section class="story-filters story-empty-state"><h2>No stories match these filters</h2><p>Try adjusting Level, Length, Status, or your search.</p><button type="button" class="btn" data-story-reset-filters>Clear filters</button></section>')+'</div>';
    if(STORY_MODE==='create')renderCreateStory();
    const search=$('#story-search-input');if(search&&document.activeElement!==search&&STORY_FILTER.query)search.value=STORY_FILTER.query;
  }
  function prepareStoryQuestions(story){
    const questions=(story.questions||[]).map(q=>({...q,answers:[...(q.answers||[])]}));
    const positionPools={};
    let previousByCount={};
    for(const q of questions){
      if(!q.answers.length)continue;
      const correctText=q.answers[q.correct];
      const distractors=q.answers.filter((_,i)=>i!==q.correct);
      for(let i=distractors.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[distractors[i],distractors[j]]=[distractors[j],distractors[i]];}
      const count=q.answers.length;
      if(!positionPools[count]||positionPools[count].length===0){
        positionPools[count]=Array.from({length:count},(_,i)=>i);
        for(let i=count-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[positionPools[count][i],positionPools[count][j]]=[positionPools[count][j],positionPools[count][i]];}
        if(count>1&&positionPools[count][0]===previousByCount[count]){const j=1+Math.floor(Math.random()*(count-1));[positionPools[count][0],positionPools[count][j]]=[positionPools[count][j],positionPools[count][0]];}
      }
      const target=positionPools[count].shift();
      previousByCount[count]=target;
      distractors.splice(target,0,correctText);
      q.answers=distractors;
      q.correct=target;
    }
    return {...story,questions};
  }
  function normalizeStoryPage(page){return Array.isArray(page)?{scene:page[0]||'',text:page[1]||'',ar:page[2]||''}:page&&typeof page==='object'?{scene:page.scene||page.emoji||'',text:page.text||'',ar:page.ar||''}:{scene:'',text:String(page||''),ar:''};}
  function startStory(id){const source=STORIES.find(s=>s.id===id);if(!source)return;if(!hasDeveloperAccess()&&storyLevelIndex(source.level)>storyLevelIndex(currentLevel().id)){toast('Reach '+source.level+' to unlock this story.');return;}const saved=state.stories[id]||{},session=!saved.done&&saved.readerSession||null;const story={...source,pages:(session&&Array.isArray(session.pages)?session.pages:source.pages).map(normalizeStoryPage),questions:prepareStoryQuestions(source).questions};ST={story,page:saved.done?0:Math.max(0,Math.min(story.pages.length-1,Number.isInteger(saved.lastPage)?saved.lastPage:0)),mode:'read',qi:0,score:0,results:[],savedDuring:[],answered:false,decisionDone:!!(session&&session.decisionDone),decisionChoice:session&&Number.isInteger(session.decisionChoice)?session.decisionChoice:null,decisionResumePage:session&&Number.isInteger(session.decisionResumePage)?session.decisionResumePage:null,audioRate:1,textHidden:false,dictationActive:false,dictationChecked:false,dictationAnswer:'',dictationCorrect:false,comprehensionOnly:false};G=null;$('#game').className='game t-story';$('#game').hidden=false;lockPage(true);hideSheet();renderStoryPage();}
  function storyTextTokens(text){let offset=0;return (String(text||'').match(/[\p{L}]+(?:['’][\p{L}]+)*|[^\p{L}]+/gu)||[]).map(part=>{const start=offset;offset+=part.length;if(!/^[\p{L}]+(?:['’][\p{L}]+)*$/u.test(part))return esc(part);const bare=part.toLowerCase().normalize('NFD').replace(/[\p{Diacritic}]/gu,'');const known=storyLookup(bare);return '<button type="button" class="story-word '+(known?'is-vocab ':'')+(storyIsSaved(bare)?'is-saved':'')+'" data-story-start="'+start+'" data-story-end="'+offset+'" data-story-word="'+esc(bare)+'" data-story-display="'+esc(part)+'" aria-label="Learn the word '+esc(bare)+'">'+esc(part)+'</button>';}).join('');}
  function storyLookup(key){const all=(typeof STORIES!=='undefined'?STORIES:[]);for(const story of all){const found=Object.entries(story.vocab||{}).find(([k])=>k.toLowerCase()===key);if(found){const v=found[1];return Array.isArray(v)?{meaning:v[0],ar:v[1],pronunciation:v[2],example:v[3]}:{meaning:v.meaning||'',ar:v.ar||v.meaning_ar||'',pronunciation:v.pronunciation||key,example:v.example||''};}}const global=(typeof WOTD_WORDS!=='undefined'?WOTD_WORDS:[]).find(w=>w.word.toLowerCase()===key);if(global)return {meaning:global.meaning,ar:global.meaning_ar,pronunciation:global.pronunciation,example:global.example};const saved=state.words.find(w=>String(w[0]).toLowerCase()===key);if(saved)return {meaning:saved[1],ar:'معنى محفوظ سابقًا',pronunciation:key,example:''};const fallback=STORY_WORDS[key]||STORY_WORDS[storyWordBase(key)]||null;if(fallback){return {meaning:fallback,ar:STORY_WORDS_AR[key]||STORY_WORDS_AR[storyWordBase(key)]||'المعنى بالعربية غير متوفر بعد',pronunciation:key,example:''};}return null;}
  function storyWordBase(word){if(STORY_WORDS[word])return word;let w=word;if(w.endsWith('ies')&&w.length>4)w=w.slice(0,-3)+'y';else if(w.endsWith('es')&&w.length>4)w=w.slice(0,-2);else if(w.endsWith('s')&&w.length>3)w=w.slice(0,-1);if(STORY_WORDS[w])return w;const candidates=[word.slice(0,-1),word.slice(0,-2),word.replace(/ies$/,'y'),word.replace(/ied$/,'y'),word.replace(/ed$/,''),word.replace(/ing$/,'')];for(const candidate of candidates){if(candidate!==word&&STORY_WORDS[candidate])return candidate;}return word;}
  const STORY_WORDS_AR={sam:'سام',his:'له / خاصته',sister:'أخت',picnic:'نزهة',they:'هم',take:'يأخذ',apples:'تفاح',apple:'تفاحة',bread:'خبز',juice:'عصير',park:'حديقة عامة',sit:'يجلس',tree:'شجرة',dark:'داكن',cloud:'سحابة',clouds:'غيوم',cover:'يغطي',sky:'سماء',cold:'بارد',rain:'مطر',begins:'يبدأ',begin:'يبدأ',fall:'يسقط / يهطل',puts:'يضع',put:'يضع',food:'طعام',bag:'حقيبة',run:'يركض',small:'صغير',cafe:'مقهى',near:'قريب من',warm:'دافئ',dry:'جاف',share:'يتقاسم',laugh:'يضحك',about:'عن / بشأن',and:'و',to:'إلى',the:'الـ',a:'أداة تنكير',an:'أداة تنكير',in:'في',under:'تحت',at:'في / عند',is:'يكون',are:'يكونون',was:'كان',were:'كانوا',not:'ليس / لا',her:'لها / ـها',he:'هو',she:'هي',it:'هو / هي لغير العاقل',we:'نحن',you:'أنت / أنتم',his:'له / ـه',my:'لي / ـي',your:'لك / ـك',their:'لهم / ـهم',our:'لنا / ـنا',this:'هذا / هذه',that:'ذلك / تلك',with:'مع',from:'من',for:'من أجل',on:'على',of:'من / لـ',but:'لكن',so:'لذلك',when:'عندما',because:'لأن',then:'ثم',now:'الآن',here:'هنا',there:'هناك',can:'يستطيع',cannot:'لا يستطيع',look:'ينظر',looks:'ينظر',see:'يرى',sees:'يرى',find:'يعثر على',found:'عثر على',go:'يذهب',went:'ذهب',come:'يأتي',came:'أتى',say:'يقول',says:'يقول',said:'قال',make:'يصنع / يجعل',made:'صنع / جعل',get:'يحصل على',got:'حصل على',give:'يعطي',gave:'أعطى',help:'يساعد',helped:'ساعد',follow:'يتبع',followed:'تبع',open:'يفتح',opens:'يفتح',close:'يغلق',closed:'أغلق',start:'يبدأ',started:'بدأ',stop:'يتوقف',stopped:'توقف',wait:'ينتظر',waited:'انتظر',leave:'يغادر',left:'غادر',arrive:'يصل',arrived:'وصل',reach:'يصل إلى',reached:'وصل إلى',think:'يفكر',thought:'فكر',know:'يعرف',knew:'عرف',feel:'يشعر',felt:'شعر',want:'يريد',need:'يحتاج',try:'يحاول',tried:'حاول',remember:'يتذكر',remembered:'تذكر',ask:'يسأل',asked:'سأل',tell:'يخبر',told:'أخبر',speak:'يتحدث',spoke:'تحدث',talk:'يتكلم',walk:'يمشي',run:'يركض',ran:'ركض',sit:'يجلس',sat:'جلس',stand:'يقف',stood:'وقف',looked:'نظر',saw:'رأى',went:'ذهب',came:'أتى',took:'أخذ',put:'يضع',warm:'دافئ',cold:'بارد',good:'جيد',bad:'سيئ',new:'جديد',old:'قديم',little:'صغير / قليل',big:'كبير',long:'طويل',short:'قصير',first:'الأول',last:'الأخير',next:'التالي',same:'نفس / ذاته',another:'آخر',every:'كل',some:'بعض',all:'كل',more:'أكثر',only:'فقط',very:'جداً',too:'أيضاً / أكثر من اللازم',again:'مرة أخرى',before:'قبل',after:'بعد',during:'أثناء',already:'بالفعل',just:'فقط / للتو',soon:'قريباً',finally:'أخيراً',together:'معاً',quickly:'بسرعة',slowly:'ببطء',quietly:'بهدوء',happily:'بسعادة',sad:'حزين',happy:'سعيد',afraid:'خائف',tired:'متعب',easy:'سهل',difficult:'صعب',important:'مهم',different:'مختلف',beautiful:'جميل',strange:'غريب',idea:'فكرة',problem:'مشكلة',question:'سؤال',answer:'إجابة',story:'قصة',word:'كلمة',person:'شخص',people:'ناس / أشخاص',friend:'صديق',family:'عائلة',home:'منزل',house:'بيت',room:'غرفة',school:'مدرسة',teacher:'معلم',book:'كتاب',time:'وقت',day:'يوم',night:'ليل',morning:'صباح',today:'اليوم',tomorrow:'غداً',yesterday:'أمس',place:'مكان',road:'طريق',street:'شارع',city:'مدينة',town:'بلدة',door:'باب',window:'نافذة',chair:'كرسي',table:'طاولة',water:'ماء',drink:'مشروب / يشرب',coffee:'قهوة',tea:'شاي',milk:'حليب',fruit:'فاكهة',orange:'برتقالة',banana:'موزة',rainy:'ممطر',sun:'شمس',sunny:'مشمس',weather:'طقس',cloudy:'غائم',sky:'سماء',flower:'زهرة',garden:'حديقة',dog:'كلب',cat:'قط',train:'قطار',bus:'حافلة',station:'محطة',ticket:'تذكرة',taxi:'سيارة أجرة',bike:'دراجة',bag:'حقيبة',coat:'معطف',key:'مفتاح',money:'مال',work:'عمل',job:'وظيفة',team:'فريق',meeting:'اجتماع',manager:'مدير',lab:'مختبر',science:'علوم',test:'اختبار',result:'نتيجة',change:'تغيير',learn:'يتعلم',learned:'تعلم',listen:'يستمع',heard:'سمع',hear:'يسمع',write:'يكتب',read:'يقرأ',reading:'قراءة',writing:'كتابة',think:'يفكر',thought:'فكر',because:'لأن',although:'على الرغم من',however:'مع ذلك',yet:'ومع ذلك / حتى الآن',whether:'ما إذا',within:'داخل / خلال',toward:'باتجاه',through:'عبر / من خلال',around:'حول',behind:'خلف',beside:'بجانب',between:'بين',across:'عبر',over:'فوق',up:'إلى الأعلى',down:'إلى الأسفل',out:'إلى الخارج',into:'إلى الداخل',back:'إلى الخلف',away:'بعيداً',someone:'شخص ما',everyone:'الجميع',nothing:'لا شيء',something:'شيء ما',anything:'أي شيء',everything:'كل شيء',who:'من',what:'ماذا / ما',where:'أين',when:'متى / عندما',why:'لماذا',how:'كيف',which:'أيّ',whose:'لمن',please:'من فضلك',thank:'يشكر',thanks:'شكراً',sorry:'آسف',yes:'نعم',no:'لا',maybe:'ربما',perhaps:'ربما',really:'حقاً',actually:'في الواقع',almost:'تقريباً',enough:'كافٍ',less:'أقل',least:'الأقل',best:'الأفضل',better:'أفضل',worse:'أسوأ',wrong:'خاطئ',right:'صحيح / يمين',true:'صحيح',false:'خاطئ',possible:'ممكن',able:'قادر',cannot:'لا يستطيع',must:'يجب',should:'ينبغي',would:'سوف / كان سي',could:'استطاع / يمكنه',will:'سوف',might:'قد',may:'قد',did:'فعل / أداة للماضي',does:'يفعل',do:'يفعل',done:'منجز / فعل',has:'لديه',have:'لديه',had:'كان لديه',be:'يكون',been:'كان',being:'كونه / يجري',am:'أكون',were:'كانوا',are:'يكونون',was:'كان',is:'يكون',are:'يكونون',and:'و',or:'أو',but:'لكن',if:'إذا',as:'كما / بصفته',than:'من (للمقارنة)',while:'بينما',until:'حتى',since:'منذ / بما أن',for:'لـ / من أجل',from:'من',of:'من / لـ',by:'بواسطة / بجانب',at:'في / عند',in:'في',on:'على',to:'إلى',with:'مع',without:'بدون',about:'عن',against:'ضد',among:'بين',per:'لكل',each:'كل واحد',both:'كلاهما',few:'قليل',several:'عدة',many:'كثير',much:'كثير',most:'معظم',other:'آخر',others:'آخرون',such:'مثل هذا',own:'خاص',same:'نفس',different:'مختلف',another:'آخر',either:'أيّ منهما',neither:'لا هذا ولا ذاك',nor:'ولا',also:'أيضاً',especially:'خصوصاً',instead:'بدلاً من ذلك',rather:'بدلاً من / نوعاً ما',otherwise:'وإلا',therefore:'لذلك',thus:'وبالتالي',still:'ما زال',once:'مرة واحدة',twice:'مرتين',often:'غالباً',sometimes:'أحياناً',always:'دائماً',never:'أبداً',usually:'عادةً',rarely:'نادراً',recently:'مؤخراً',gradually:'تدريجياً',suddenly:'فجأة',immediately:'فوراً',carefully:'بحذر',easily:'بسهولة',slowly:'ببطء',quickly:'بسرعة',clearly:'بوضوح',probably:'على الأرجح',certainly:'بالتأكيد',exactly:'بالضبط',especially:'خصوصاً',generally:'عموماً',simply:'ببساطة',completely:'تماماً',partly:'جزئياً',nearly:'تقريباً',enjoy:'يستمتع',enjoyed:'استمتع',share:'يتقاسم',shared:'تقاسم',laugh:'يضحك',laughed:'ضحك',smile:'يبتسم',smiled:'ابتسم',cry:'يبكي',cried:'بكى',jump:'يقفز',jumped:'قفز',pick:'يلتقط / يختار',picked:'التقط',carry:'يحمل',carried:'حمل',bring:'يجلب',brought:'أحضر',buy:'يشتري',bought:'اشترى',pay:'يدفع',paid:'دفع',eat:'يأكل',ate:'أكل',drink:'يشرب',drank:'شرب',sleep:'ينام',slept:'نام',wake:'يستيقظ',woke:'استيقظ',begin:'يبدأ',began:'بدأ',begun:'بدأ',fall:'يسقط',fell:'سقط',fallen:'سقط',grow:'ينمو',grew:'نما',grown:'نما',build:'يبني',built:'بنى',break:'يكسر',broke:'كسر',broken:'مكسور',choose:'يختار',chose:'اختار',chosen:'مختار',change:'يغير',changed:'غيّر',move:'يتحرك',moved:'تحرك',turn:'يدور / ينعطف',turned:'دار / انعطف',follow:'يتبع',followed:'تبع',decide:'يقرر',decided:'قرر',plan:'يخطط',planned:'خطط',prepare:'يحضّر',prepared:'حضّر',finish:'ينهي',finished:'أنهى',complete:'يكمل',completed:'أكمل',continue:'يواصل',continued:'واصل',return:'يعود',returned:'عاد',arrive:'يصل',arrived:'وصل',travel:'يسافر',travelled:'سافر',visit:'يزور',visited:'زار',happen:'يحدث',happened:'حدث',seem:'يبدو',seemed:'بدا',appear:'يظهر',appeared:'ظهر',become:'يصبح',became:'أصبح',stay:'يبقى',stayed:'بقي',keep:'يحتفظ / يستمر',kept:'احتفظ / استمر',hold:'يمسك',held:'أمسك',catch:'يمسك / يلحق',caught:'أمسك',throw:'يرمي',threw:'رمى',hit:'يضرب',hurt:'يؤلم / يؤذي',win:'يفوز',won:'فاز',lose:'يخسر',lost:'خسر / ضائع',meet:'يقابل',met:'قابل',agree:'يوافق',agreed:'وافق',believe:'يعتقد',believed:'اعتقد',hope:'يأمل',hoped:'أمل',promise:'يعد',promised:'وعد',explain:'يشرح',explained:'شرح',describe:'يصف',described:'وصف',suggest:'يقترح',suggested:'اقترح',offer:'يعرض',offered:'عرض',refuse:'يرفض',refused:'رفض',accept:'يقبل',accepted:'قبل',allow:'يسمح',allowed:'سمح',require:'يتطلب',required:'تطلب',provide:'يوفر',provided:'وفّر',support:'يدعم',supported:'دعم',improve:'يحسّن',improved:'حسّن',create:'ينشئ',created:'أنشأ',develop:'يطوّر',developed:'طوّر',build:'يبني',built:'بنى',check:'يفحص',checked:'فحص',test:'يختبر',tested:'اختبر',measure:'يقيس',measured:'قاس',record:'يسجل',recorded:'سجل',notice:'يلاحظ',noticed:'لاحظ',realize:'يدرك',realized:'أدرك',discover:'يكتشف',discovered:'اكتشف',solve:'يحل',solved:'حل',fix:'يصلح',fixed:'أصلح',repair:'يصلح',repaired:'أصلح',replace:'يستبدل',replaced:'استبدل',remove:'يزيل',removed:'أزال',add:'يضيف',added:'أضاف',save:'يحفظ',saved:'حفظ',send:'يرسل',sent:'أرسل',receive:'يستلم',received:'استلم',return:'يعيد / يعود',returned:'عاد',borrow:'يستعير',borrowed:'استعار',lend:'يعير',lent:'أعار',teach:'يدرّس',taught:'درّس',study:'يدرس',studied:'درس',practice:'يتدرّب',practised:'تدرّب',train:'يدرّب / قطار',trained:'تدرّب',learn:'يتعلم',learned:'تعلم',understand:'يفهم',understood:'فهم',remember:'يتذكر',remembered:'تذكر',forget:'ينسى',forgot:'نسي',forgive:'يسامح',forgave:'سامح',thank:'يشكر',thanked:'شكر',praise:'يمدح',praised:'مدح',blame:'يلوم',blamed:'لام',deny:'ينكر',denied:'أنكر',admit:'يعترف',admitted:'اعترف',apologize:'يعتذر',apologized:'اعتذر',discuss:'يناقش',discussed:'ناقش',argue:'يجادل',argued:'جادل',communicate:'يتواصل',communicated:'تواصل',connect:'يربط',connected:'ربط',invite:'يدعو',invited:'دعا',join:'ينضم',joined:'انضم',lead:'يقود',led:'قاد',manage:'يدير',managed:'أدار',work:'يعمل',worked:'عمل',play:'يلعب',played:'لعب',live:'يعيش',lived:'عاش',die:'يموت',died:'مات',wait:'ينتظر',waited:'انتظر',watch:'يشاهد',watched:'شاهد',listen:'يستمع',listened:'استمع',hear:'يسمع',heard:'سمع',sound:'صوت / يبدو',sounded:'بدا / أصدر صوتاً',voice:'صوت',speech:'خطاب',contest:'مسابقة',chance:'فرصة',ability:'قدرة',experience:'تجربة / خبرة',decision:'قرار',mistake:'خطأ',feedback:'ملاحظات',comment:'تعليق',comments:'تعليقات',conversation:'محادثة',conversations:'محادثات',concern:'قلق / شأن',approval:'موافقة',choice:'اختيار',choices:'خيارات',rule:'قاعدة',rules:'قواعد',process:'عملية',result:'نتيجة',measurement:'قياس',measurements:'قياسات',instrument:'أداة / جهاز',equipment:'معدات',sensor:'مستشعر',reading:'قراءة',readings:'قراءات',science:'علم',scientific:'علمي',lab:'مختبر',school:'مدرسة',manager:'مدير',team:'فريق',meeting:'اجتماع',meetings:'اجتماعات',idea:'فكرة',ideas:'أفكار',suggestion:'اقتراح',suggestions:'اقتراحات',problem:'مشكلة',solution:'حل',success:'نجاح',failure:'فشل',performance:'أداء',routine:'روتين',event:'حدث',public:'عام',private:'خاص',anonymous:'مجهول الهوية',anonymously:'بشكل مجهول',approach:'يقترب / نهج',approached:'اقترب',affect:'يؤثر',affecting:'مؤثّر / يؤثر في',afterward:'بعد ذلك',blunt:'صريح بحدة',box:'صندوق',busiest:'الأكثر ازدحاماً',calm:'هادئ',calmer:'أكثر هدوءاً',catch:'يمسك / يلحق',closed:'مغلق',coach:'مدرب',corner:'زاوية',counter:'منضدة / عدّاد',defensive:'دفاعي',define:'يعرّف',disaster:'كارثة',earlier:'في وقت سابق',floor:'أرضية / طابق',flourish:'يزدهر',front:'أمام',gradually:'تدريجياً',hidden:'مخفي',holding:'يمسك',imposing:'مهيب / يفرض',instrument:'جهاز / أداة',invited:'دعا',jumped:'قفز',listened:'استمع',listeners:'مستمعون',looking:'ينظر',measurements:'قياسات',mistake:'خطأ',nevertheless:'مع ذلك',notes:'ملاحظات',noticed:'لاحظ',onto:'إلى أعلى / على',pause:'توقف مؤقت',performance:'أداء',pointed:'أشار',preparing:'يحضّر',process:'عملية',pulled:'سحب',rather:'بدلاً من / نوعاً ما',recording:'تسجيل',replacing:'استبدال',reviewed:'راجع',river:'نهر',road:'طريق',rug:'سجادة',sealed:'مختوم',seconds:'ثوانٍ',seeing:'رؤية',seen:'شوهد / رأى',several:'عدة',six:'ستة',speech:'خطاب',spent:'قضى / أنفق',stable:'مستقر',sugar:'سكر',teacher:'معلم',testing:'اختبار / يجري اختباراً',things:'أشياء',through:'عبر',tired:'متعب',toy:'لعبة',track:'مسار / يتتبع',treating:'يعامل / يعالج',turned:'استدار / أصبح',useful:'مفيد',whether:'ما إذا',within:'داخل / خلال',window:'نافذة',woke:'استيقظ',wrong:'خاطئ',yet:'ومع ذلك / حتى الآن',aminA:'أمينة',daniel:'دانيال',leo:'ليو',mia:'ميا',nora:'نورا',rafi:'رافي'};
  function persistStoryReaderProgress(){if(!ST||!ST.story||(DEV_MODE.active&&hasDeveloperAccess()))return;const old=state.stories[ST.story.id]||{done:false,score:0};state.stories[ST.story.id]={...old,lastPage:ST.page,lastOpenedAt:new Date().toISOString(),readerSession:{pages:ST.story.pages.map(p=>({scene:p.scene,text:p.text,ar:p.ar})),decisionDone:!!ST.decisionDone,decisionChoice:Number.isInteger(ST.decisionChoice)?ST.decisionChoice:null,decisionResumePage:Number.isInteger(ST.decisionResumePage)?ST.decisionResumePage:null}};save();}
  function renderStoryPage(){const scrollRoot=$('#game-scroll'),oldAnchor=$('#story-page-text')||$('.story-reader-actions')||$('.story-reader-title'),oldAnchorTop=oldAnchor?oldAnchor.getBoundingClientRect().top:null;const s=ST.story,p=s.pages[ST.page],hidden=!!ST.textHidden,dictating=!!ST.dictationActive,prefs=state.storyReaderSettings||{};persistStoryReaderProgress();$('#steps').innerHTML=s.pages.map((_,i)=>'<span class="step '+(i<ST.page?'ok':i===ST.page?'current':'')+'"></span>').join('');$('#game-body').innerHTML='<div class="story-reader '+(prefs.nightMode?'story-reader-night':'')+'" style="--story-font-scale:'+Number(prefs.fontScale||1)+';--story-line-height:'+Number(prefs.lineSpacing||1.75)+'"><div class="q-meta"><span class="pill">'+esc(s.level)+' · Reading & Listening</span><span class="q-count">Page '+(ST.page+1)+' of '+s.pages.length+'</span></div><div class="story-progress-dots">'+s.pages.map((_,i)=>'<span class="'+(i<=ST.page?'active':'')+'"></span>').join('')+'</div><div class="story-scene" style="--story-tone:'+esc(s.tone)+'" aria-hidden="true">'+esc(p.scene)+'</div><h2 class="story-reader-title">'+esc(s.title)+'</h2><div class="story-audio-tools"><span>Text size</span><button type="button" class="story-speed" data-story-setting="font-down" aria-label="Decrease text size">A−</button><button type="button" class="story-speed" data-story-setting="font-up" aria-label="Increase text size">A+</button><span>Line spacing</span><button type="button" class="story-speed" data-story-setting="line-down" aria-label="Decrease line spacing">↕−</button><button type="button" class="story-speed" data-story-setting="line-up" aria-label="Increase line spacing">↕+</button><button type="button" class="btn btn-ghost" data-story-setting="night">'+(prefs.nightMode?'☀ Light reader':'☾ Night reader')+'</button><span>Playback speed</span>'+[0.75,1,1.25].map(rate=>'<button type="button" class="story-speed '+(ST.audioRate===rate?'is-active':'')+'" data-story-rate="'+rate+'" aria-pressed="'+(ST.audioRate===rate)+'">'+rate+'×</button>').join('')+'<button type="button" class="btn btn-ghost" data-story-action="listen-page">▶ Listen</button><button type="button" class="btn btn-ghost" data-story-action="toggle-text">'+(hidden?'Show text':'Hide text')+'</button><button type="button" class="btn btn-ghost" data-story-action="dictation">'+(dictating?'Cancel dictation':'✍ Dictation')+'</button></div>'+(hidden?'<div class="story-hidden-note">🔒 Text hidden. Listen first, then reveal it when you are ready.</div>':'<div class="story-text" id="story-page-text">'+storyTextTokens(p.text)+'</div>')+(dictating?'<form class="story-dictation-form" id="story-dictation-form"><label for="story-dictation-answer">Write the sentence you hear</label><textarea id="story-dictation-answer" rows="3" required placeholder="Type what you heard…">'+esc(ST.dictationAnswer||'')+'</textarea><button class="btn" type="submit">Check dictation</button>'+(ST.dictationChecked?'<p class="story-dictation-feedback '+(ST.dictationCorrect?'is-correct':'is-wrong')+'">'+(ST.dictationCorrect?'✓ Great listening!':'Not quite yet. Listen again and compare with the sentence.')+'</p><p class="story-dictation-model"><strong>Sentence:</strong> '+esc(p.text)+'</p>':'')+'</form>':'')+(state.helpArabic&&!hidden?'<p class="story-page-ar arabic" lang="ar" dir="rtl">'+esc(p.ar)+'</p>':'')+'<div class="story-reader-actions"><button class="btn btn-ghost" data-story-action="prev" '+(ST.page===0?'disabled':'')+'>← Previous</button><button class="btn" data-story-action="next">'+(ST.page===s.pages.length-1?'Questions':'Next →')+'</button>'+(ST.page===s.pages.length-1?'<button class="btn btn-ghost" data-story-action="comprehension">🎧 Challenge without text</button>':'')+'</div><p class="story-help-note">Tap any word for its meaning, then save it to your review list. Words highlight as the audio reads them.</p><div class="story-word-card" id="story-word-card" hidden aria-live="polite"></div></div>';if(scrollRoot&&oldAnchorTop!==null){const newAnchor=$('#story-page-text')||$('.story-reader-actions')||$('.story-reader-title');if(newAnchor){const delta=newAnchor.getBoundingClientRect().top-oldAnchorTop;if(Math.abs(delta)>0.5)scrollRoot.scrollTop+=delta;}}}
  function speakStoryPage(){if(!ST||!ST.story)return;const phrase=String(ST.story.pages[ST.page].text||'');const synth=window.speechSynthesis;if(!synth||!('SpeechSynthesisUtterance' in window)){toast('Audio playback is not supported in this browser.');return;}const request=++speechRequest;try{synth.cancel();}catch{}if(naturalAudioPlayer){try{naturalAudioPlayer.pause();naturalAudioPlayer.src='';}catch{}naturalAudioPlayer=null;}const voice=pickVoice(),utterance=new SpeechSynthesisUtterance(phrase);utterance.lang=voice?String(voice.lang||'en-US').replace('_','-'):'en-US';if(voice)utterance.voice=voice;utterance.rate=Number(ST.audioRate)||1;utterance.pitch=1;utterance.volume=1;utterance.onboundary=e=>{if(request!==speechRequest||!ST||ST.mode!=='read')return;const words=$$('#story-page-text [data-story-start]');let active=null;for(const word of words){const start=Number(word.dataset.storyStart),end=Number(word.dataset.storyEnd);word.classList.toggle('is-speaking',e.charIndex>=start&&e.charIndex<end);if(e.charIndex>=start&&e.charIndex<end)active=word;}if(active&&active.getBoundingClientRect().top<0)active.scrollIntoView({block:'nearest',behavior:'auto'});};utterance.onend=()=>{$$('#story-page-text .is-speaking').forEach(el=>el.classList.remove('is-speaking'));};utterance.onerror=()=>{$$('#story-page-text .is-speaking').forEach(el=>el.classList.remove('is-speaking'));if(request===speechRequest)toast('Could not play this page. Try again.');};try{synth.speak(utterance);}catch{toast('Could not start audio playback.');}}
  function normalizeDictationText(value){return String(value||'').toLowerCase().normalize('NFC').replace(/[’']/g,'').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
  function checkStoryDictation(form){if(!ST||!form)return;ST.dictationAnswer=$('#story-dictation-answer')?.value||'';const typed=normalizeDictationText(ST.dictationAnswer),target=normalizeDictationText(ST.story.pages[ST.page].text);ST.dictationChecked=true;ST.dictationCorrect=typed===target;if(ST.dictationCorrect)toast('Excellent — your dictation matches the sentence.');renderStoryPage();}
  function openStoryWord(raw,display){const key=String(raw||'').toLowerCase(),entry=storyLookup(key);const meaning=entry?entry.meaning:'No explanation has been added for this word yet.',arabic=entry?entry.ar:'لم نضف شرحاً لهذه الكلمة بعد',pron=entry?entry.pronunciation:key,example=entry?entry.example:'';const card=$('#story-word-card');if(!card)return;card.hidden=false;card.innerHTML='<button class="story-card-close" data-story-action="close-word" aria-label="Close word card">×</button><p class="kicker">WORD IN CONTEXT</p><h3>'+esc(display||key)+'</h3><p class="story-pronunciation">'+esc(pron||key)+'</p><p>'+esc(meaning)+'</p><p class="arabic story-word-ar" lang="ar" dir="rtl">'+esc(arabic)+'</p>'+(example?'<p class="story-example">“'+esc(example)+'”</p>':'')+'<div class="story-word-actions"><button class="btn btn-ghost" data-story-action="listen-word" data-value="'+esc(key)+'">🔊 Listen</button><button class="btn" data-story-action="save-word" data-value="'+esc(key)+'" data-meaning="'+esc(meaning)+'" '+(storyIsSaved(key)?'disabled':'')+'>'+(storyIsSaved(key)?'✓ Saved':'Save word')+'</button></div>';}
  function saveStoryWord(word,meaning){const key=word.toLowerCase(),level=ST?.story?.level||currentLevel().id,definition=meaning||'No explanation has been added for this word yet.';if(!storyIsSaved(key)){state.words.push([word,definition,level]);recordLearningActivity({words:1});}if(!state.review.some(item=>String(item.word).toLowerCase()===key))state.review.push({word,meaning:definition,level,due:dayKey(),box:1,interval:0,streak:0,attempts:0,errors:0,exerciseStage:0,mastered:false});if(ST&&!ST.savedDuring.some(w=>w.toLowerCase()===key))ST.savedDuring.push(word);save();renderWords();renderHeader();toast('Word saved to Words and daily review.');}
  function storyNext(){if(ST.story.decision&&!ST.decisionDone&&ST.page===ST.story.decision.afterPage){ST.mode='decision';ST.decisionResumePage=ST.page+1;renderStoryDecision();return;}if(ST.page<ST.story.pages.length-1){ST.page++;renderStoryPage();return;}ST.mode='quiz';ST.qi=0;ST.score=0;ST.results=[];ST.answered=false;renderStoryQuestion();}
  function renderStoryDecision(){const d=ST.story.decision;if(!d)return;$('#steps').innerHTML=ST.story.pages.map((_,i)=>'<span class="step '+(i<=ST.page?'ok':'')+'"></span>').join('');$('#game-body').innerHTML='<div class="story-reader story-decision"><div class="q-meta"><span class="pill">Your turn</span><span class="q-count">Story choice</span></div><div class="story-scene" style="--story-tone:'+esc(ST.story.tone)+'" aria-hidden="true">💭</div><h2 class="story-reader-title">'+esc(d.prompt)+'</h2>'+(state.helpArabic&&d.prompt_ar?'<p class="story-page-ar arabic" lang="ar" dir="rtl">'+esc(d.prompt_ar)+'</p>':'')+'<p class="story-decision-intro">Choose how you would respond. There is no score penalty for exploring a different approach.</p><div class="story-decision-options" role="group" aria-label="Choose what to do next">'+d.options.map((o,i)=>'<button type="button" class="story-decision-option" data-story-decision="'+i+'"><span class="story-decision-letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(o.text)+'</span>'+(state.helpArabic&&o.text_ar?'<span class="story-option-ar arabic" lang="ar" dir="rtl">'+esc(o.text_ar)+'</span>':'')+'</button>').join('')+'</div>'+(state.helpArabic?'<p class="story-page-ar arabic" lang="ar" dir="rtl">اختر ما ستفعله في هذا الموقف، ثم اقرأ أثر اختيارك.</p>':'')+'</div>';$('#game-scroll').scrollTop=0;}
  function answerStoryDecision(index){if(!ST||ST.mode!=='decision'||ST.decisionDone)return;const d=ST.story.decision,o=d&&d.options[index];if(!o)return;ST.decisionDone=true;ST.decisionChoice=index;if(o.branchPage&&ST.decisionResumePage!==null){ST.story.pages.splice(ST.decisionResumePage,0,normalizeStoryPage(o.branchPage));if(o.endingPage)ST.story.pages[ST.story.pages.length-1]=normalizeStoryPage(o.endingPage);}persistStoryReaderProgress();ST.mode='decision-feedback';showSheet(true,'<h3><span class="sheet-mark">'+ic('git-branch')+'</span>Your choice shapes the story</h3><p><strong>'+esc(o.text)+'</strong></p><p>'+esc(o.response)+'</p>'+(state.helpArabic&&o.response_ar?'<p class="story-page-ar arabic" lang="ar" dir="rtl">'+esc(o.response_ar)+'</p>':'')+'<p class="story-choice-impact">There is no right or wrong choice here. Each option leads to a different path.</p><div class="sheet-actions"><button class="btn" id="story-decision-next">Continue story '+ic('arrow')+'</button></div>');$('#sheet').classList.add('story-choice-sheet');}
  function renderStoryQuestion(){const q=ST.story.questions[ST.qi];$('#steps').innerHTML=ST.story.questions.map((_,i)=>'<span class="step '+(i<ST.qi?'ok':i===ST.qi?'current':'')+'"></span>').join('');$('#game-body').innerHTML='<div class="story-reader story-comprehension-quiz"><div class="q-meta"><span class="pill">'+(ST.comprehensionOnly?'🎧 Listening comprehension':'Story questions')+'</span><span class="q-count">Question '+(ST.qi+1)+' of '+ST.story.questions.length+'</span></div>'+(ST.comprehensionOnly?'<p class="story-hidden-note">The passage is hidden. Answer from what you remember hearing or reading.</p>':'')+'<h2 class="q-text" id="story-q-title">'+esc(q.q)+'</h2><p class="q-sub">Choose the best answer.</p><div class="answers" id="story-answers" role="group" aria-labelledby="story-q-title">'+q.answers.map((v,i)=>'<button class="answer" data-story-answer="'+i+'"><span class="key">'+(i+1)+'</span><span>'+esc(v)+'</span></button>').join('')+'</div>'+(ST.comprehensionOnly?'':'<button class="btn btn-ghost story-back-reading" data-story-action="back-reading">← Back to story</button>')+'</div>';$('#game-scroll').scrollTop=0;}
  function answerStoryQuestion(choice){if(!ST||ST.mode!=='quiz'||ST.answered)return;const q=ST.story.questions[ST.qi],ok=choice===q.correct;ST.answered=true;if(ok)ST.score++;else if(q.reviewWord){addReview(q.reviewWord,q.explain);save();}ST.results[ST.qi]={status:ok?'ok':'no',chosen:choice,correct:q.correct,question:q.q,explain:q.explain};$$('#story-answers .answer').forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===choice)b.classList.add('wrong');});showSheet(ok,'<h3><span class="sheet-mark">'+ic(ok?'check':'x')+'</span>'+(ok?'Exactly right!':'Good try — keep learning.')+'</h3>'+(ok?'':'<p>Correct answer: <b>'+esc(q.answers[q.correct])+'</b></p>')+'<p>'+esc(q.explain)+'</p><div class="sheet-actions"><button class="btn" id="go-next">'+(ST.qi===ST.story.questions.length-1?'See story results':'Continue')+ic('arrow')+'</button></div>');}
  function renderStoryLearningReview(story){const vocab=Object.entries(story.vocab||{}).slice(0,8);const missed=(ST.results||[]).filter(r=>r&&r.status==='no');return '<section class="story-learning-review"><div class="story-review-heading"><span class="kicker">LEARN & REMEMBER</span><h3>Words from this story</h3><p>Review useful words in context before you leave.</p></div><div class="story-review-vocab">'+(vocab.length?vocab.map(([word,v])=>'<article class="story-review-word"><div class="story-review-word-top"><strong>'+esc(word)+'</strong><span>'+esc(v.pronunciation||'')+'</span></div><p>'+esc(v.meaning||'')+'</p><p class="arabic" lang="ar" dir="rtl">'+esc(v.ar||'')+'</p><small>Example: “'+esc(v.example||'')+'”</small><button type="button" class="btn btn-ghost story-review-listen" data-story-action="listen-word" data-value="'+esc(word)+'">🔊 Listen</button></article>').join(''):'<p>No vocabulary notes have been added yet.</p>')+'</div>'+(missed.length?'<div class="story-review-missed"><h3>Questions to revisit</h3>'+missed.map(r=>'<article><p><strong>'+esc(r.question)+'</strong></p><p>'+esc(r.explain||'Read the story again and look for evidence.')+'</p></article>').join('')+'</div>':'<p class="story-review-perfect">Great work — you answered every question correctly.</p>')+'</section>';}
  function finishStory(){if(!DEV_MODE.active&&state.dailySessionStep==='story'){state.dailySessionStep='done';state.dailySessionDone=true;}const s=ST.story,score=ST.score,old=state.stories[s.id]||{done:false,score:0},previousBest=Number(old.score)||0,firstCompletion=!DEV_MODE.active&&!old.done,newBest=!DEV_MODE.active&&score>previousBest;let bonus=DEV_MODE.active?'Developer test session · no rewards or progress saved.':'';const chosenOption=s.decision&&ST.decisionChoice!==null?s.decision.options[ST.decisionChoice]:null;if(!DEV_MODE.active){state.stories[s.id]={...old,done:true,score:Math.max(previousBest,score),lastDecision:chosenOption?chosenOption.text:null,lastResponse:chosenOption?chosenOption.response:null,lastConsequence:chosenOption&&chosenOption.branchPage?chosenOption.branchPage[1]:null,lastEnding:chosenOption&&chosenOption.endingPage?chosenOption.endingPage[1]:null};if(firstCompletion){state.xp+=30;state.quests++;state.daily=Math.min(2,state.daily+1);const today=dayKey();if(state.dailyQuestDate!==today){state.dailyQuestDate=today;state.dailyQuestProgress=0;state.dailyQuestClaimed=false;state.dailyCorrect=0;state.dailyXp=0;}if(state.weeklyKey!==weekKey()){state.weeklyKey=weekKey();state.weeklyProgress=0;state.weeklyClaimed=false;}state.dailyXp+=30;state.dailyCorrect+=score;state.dailyQuestProgress=state.daily;state.weeklyProgress=(state.weeklyProgress||0)+1;const task=DAILY_QUESTS[(new Date().getDate()-1)%DAILY_QUESTS.length],progress=task.kind==='quests'?state.daily:task.kind==='xp'?state.dailyXp:state.dailyCorrect;if(!state.dailyQuestClaimed&&progress>=task.target){state.dailyQuestClaimed=true;state.xp+=task.reward;bonus=' Daily bonus +'+task.reward+' XP!';}if(!state.weeklyClaimed&&state.weeklyProgress>=5){state.weeklyClaimed=true;state.xp+=60;bonus+=' Weekly bonus +60 XP!';}if(state.lastDay!==today){const y=new Date();y.setDate(y.getDate()-1);const two=new Date();two.setDate(two.getDate()-2);if(state.lastDay===dayKey(y))state.streak=(state.streak||0)+1;else if(state.lastDay===dayKey(two)&&state.streakFreezes>0){state.streakFreezes--;state.streak=(state.streak||0)+1;bonus+=' Streak freeze protected your streak.';}else state.streak=1;state.lastDay=today;}if(!state.completed.includes(currentLevel().id))state.completed.push(currentLevel().id);}save();renderAll();}hideSheet();$('#steps').innerHTML=s.questions.map(()=>'<span class="step ok"></span>').join('');const ratio=s.questions.length?score/s.questions.length:0,stars=ratio>=.85?'★★★':ratio>=.6?'★★☆':ratio>0?'★☆☆':'☆☆☆';$('#game-body').innerHTML='<div class="result story-result"><div class="burst">📚</div><p class="kicker">STORY COMPLETE</p><h2>'+esc(s.title)+'</h2><div class="story-stars">'+stars+'</div><div class="stats3"><div class="stat"><b>'+(firstCompletion?'+30':'+0')+'</b><span>'+(firstCompletion?'XP earned':'XP · replay')+'</span></div><div class="stat"><b>'+score+'/'+s.questions.length+'</b><span>Correct answers</span></div><div class="stat"><b>'+ST.savedDuring.length+'</b><span>Words saved</span></div></div>'+(newBest&&old.done?'<p class="challenge-bonus">🏆 New personal best! Your best is now '+score+'/'+s.questions.length+'.</p>':'')+(bonus?'<p class="challenge-bonus">'+esc(bonus.trim())+'</p>':'')+(ST.savedDuring.length?'<div class="found"><div class="found-title">Words you saved</div>'+ST.savedDuring.map(w=>'<span class="w">'+esc(w)+'</span>').join('')+'</div>':'')+(s.decision&&ST.decisionChoice!==null?'<div class="story-choice-recap"><strong>How your decision shaped the story</strong><p class="story-impact-choice"><b>You chose:</b> '+esc(s.decision.options[ST.decisionChoice].text)+'</p><p>'+esc(s.decision.options[ST.decisionChoice].response)+'</p>'+(s.decision.options[ST.decisionChoice].branchPage?'<div class="story-impact-step"><small>THE IMMEDIATE CONSEQUENCE</small><p>'+esc(s.decision.options[ST.decisionChoice].branchPage[1])+'</p></div>':'')+(s.decision.options[ST.decisionChoice].endingPage?'<div class="story-impact-step"><small>HOW THIS PATH ENDED</small><p>'+esc(s.decision.options[ST.decisionChoice].endingPage[1])+'</p></div>':'')+'<p class="story-impact-replay">Want to discover another outcome? Replay this story and choose a different response. Your XP and quest rewards are still awarded only on your first completion.</p></div>':'')+renderStoryLearningReview(s)+(s.followUp?'<div class="follow-up-card"><p><b>Take the story into the village</b></p><p>Use the words you just read in a real task.</p><button class="btn" data-story-follow-up="'+esc(s.followUp.taskId)+'">'+esc(s.followUp.label||'Continue in the village')+' →</button></div>':'')+'<div class="result-actions"><button class="btn" data-story-action="another">Read another story</button><button class="btn btn-ghost" data-story-action="words">Open Words</button><button class="btn btn-ghost" data-story-action="close">Back to Stories</button></div></div>';$('#game-scroll').scrollTop=0;ST.mode='result';}

  /* ---------- navigation ---------- */
  function closeDockMore() {
    const panel = $('#dock-more-panel'), toggle = $('#dock-more-toggle');
    if (panel) panel.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  let categoryReturnFocus = null;
  function closeCategoryPicker(restoreFocus = true) {
    const picker = $('#category-picker');
    if (picker) picker.hidden = true;
    if (restoreFocus && categoryReturnFocus && categoryReturnFocus.isConnected) categoryReturnFocus.focus({preventScroll:true});
    categoryReturnFocus = null;
  }
  function openView(name) {
    closeCategoryPicker(false);
    closeDockMore();
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === name + '-view'));
    $$('[data-view]').forEach(b => b.setAttribute('aria-current', b.dataset.view === name ? 'page' : 'false'));
    if (name === 'home') renderHome();
    if (name === 'arcade') renderArcade();
    if (name === 'progress' || name === 'profile') { renderWeaknessPanel(); renderLearningInsights(); }
    const more = $('#dock-more-toggle');
    if (more) more.setAttribute('aria-current', ['words','trophies','stories'].includes(name) ? 'page' : 'false');
    window.scrollTo(0, 0);
    const h = $('#' + name + '-title'); if (h) h.focus({preventScroll: true});
  }

  /* ---------- unified, offline Arabic translation ---------- */
  const AR_TRANSLATION_WORDS = {
    what:'ما',why:'لماذا',how:'كيف',when:'متى',where:'أين',who:'من',which:'أي',does:'يفعل',do:'يفعل',did:'فعل',is:'هو',are:'هم',was:'كان',were:'كانوا',the:'الـ',a:'',an:'',and:'و',or:'أو',but:'لكن',because:'لأن',so:'لذلك',if:'إذا',then:'ثم',to:'إلى',of:'من',for:'لـ',with:'مع',without:'بدون',in:'في',on:'على',at:'في',from:'من',this:'هذا',that:'ذلك',these:'هذه',those:'تلك',it:'هو',he:'هو',she:'هي',they:'هم',we:'نحن',you:'أنت',my:'ـي',your:'ـك',their:'ـهم',
    choose:'اختر',select:'اختر',tap:'اضغط',click:'انقر',read:'اقرأ',listen:'استمع',write:'اكتب',type:'اكتب',answer:'إجابة',answers:'إجابات',question:'سؤال',correct:'صحيح',incorrect:'خاطئ',wrong:'خاطئ',best:'أفضل',closest:'الأقرب',meaning:'المعنى',mean:'يعني',means:'تعني',word:'كلمة',words:'كلمات',sentence:'جملة',complete:'أكمل',fill:'املأ',blank:'الفراغ',missing:'الناقص',only:'فقط',one:'واحد',more:'أكثر',again:'مجدّدًا',practice:'تدرّب',try:'حاول',explain:'اشرح',
    not:'لا',never:'أبدًا',always:'دائمًا',often:'غالبًا',sometimes:'أحيانًا',take:'يأخذ',takes:'يأخذ',took:'أخذ',go:'يذهب',goes:'يذهب',went:'ذهب',come:'يأتي',came:'جاء',have:'لديه',has:'لديه',had:'كان لديه',want:'يريد',wants:'يريد',need:'يحتاج',needs:'يحتاج',make:'يصنع',makes:'يصنع',made:'صنع',get:'يحصل على',give:'يعطي',find:'يجد',found:'وجد',use:'يستخدم',help:'يساعد',like:'يحب',know:'يعرف',think:'يعتقد',feel:'يشعر',say:'يقول',said:'قال',see:'يرى',saw:'رأى',friend:'صديق',friends:'أصدقاء',family:'العائلة',people:'الناس',happy:'سعيد',sad:'حزين',tired:'متعب',hungry:'جائع',rain:'مطر',raining:'تمطر',umbrella:'مظلة',house:'منزل',home:'المنزل',school:'مدرسة',work:'عمل',water:'ماء',food:'طعام',book:'كتاب',day:'يوم',today:'اليوم',yesterday:'أمس',tomorrow:'غدًا',time:'وقت',early:'مبكرًا',late:'متأخرًا',before:'قبل',after:'بعد',first:'أول',last:'أخير',new:'جديد',old:'قديم',small:'صغير',big:'كبير',large:'كبير',long:'طويل',short:'قصير',fast:'سريع',slow:'بطيء',good:'جيد',bad:'سيئ',easy:'سهل',difficult:'صعب',important:'مهم',different:'مختلف',borrow:'يستعير',buy:'يشتري',bought:'اشترى',sell:'يبيع',return:'يعيد',delighted:'سعيد للغاية',happening:'يحدث',happened:'حدث',absolutely:'تمامًا',very:'جدًا',extremely:'للغاية',confused:'مرتبك',worried:'قلق',pleased:'مسرور',glad:'سعيد',clear:'واضح',instructions:'تعليمات',instruction:'تعليمات',option:'خيار',options:'خيارات'
  };
  Object.assign(AR_TRANSLATION_WORDS, window.EPIPHANY_AR_TRANSLATION_WORDS || {});

  function normalizeTranslationKey(value) {
    return String(value||'').toLowerCase().replace(/[“”]/g,'\"').replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?…,:;]+$/,'').trim();
  }
  const AR_TRANSLATION_PHRASES = Object.fromEntries(Object.entries({
    'Tap the incorrect word':'اضغط على الكلمة غير الصحيحة.',
    'Choose the word that completes the sentence.':'اختر الكلمة التي تُكمل الجملة.',
    'Choose the word that best completes the sentence.':'اختر الكلمة الأنسب لإكمال الجملة.',
    'Choose the sentence with the correct grammar.':'اختر الجملة الصحيحة نحويًا.',
    'Choose the sentence that sounds natural.':'اختر الجملة الأكثر طبيعية في الإنجليزية.',
    'Find the mistake.':'اعثر على الخطأ.',
    'Spot the mistake':'اكتشف الخطأ.',
    'Type the missing word.':'اكتب الكلمة الناقصة.',
    'Type the word you hear.':'اكتب الكلمة التي تسمعها.',
    'Listen and choose the correct answer.':'استمع واختر الإجابة الصحيحة.',
    'Read the sentence and choose the best answer.':'اقرأ الجملة واختر الإجابة الأنسب.',
    'Choose the correct meaning of the word.':'اختر المعنى الصحيح للكلمة.',
    'Choose the word with the opposite meaning.':'اختر الكلمة ذات المعنى المضاد.',
    'Which sentence is grammatically correct?':'أي جملة صحيحة من الناحية النحوية؟',
    'Which sentence is incorrect?':'أي جملة غير صحيحة؟',
    'Select the natural response.':'اختر الرد الطبيعي المناسب للموقف.',
    'What would you say in this situation?':'ماذا ستقول في هذا الموقف؟',
    'Read the clues and infer the missing word.':'اقرأ القرائن واستنتج الكلمة الناقصة.',
    'Use the context to work out the meaning.':'استعن بسياق النص لاستنتاج المعنى.',
    'Choose the best word for the gap.':'اختر الكلمة الأنسب للفراغ.',
    'Complete the dialogue.':'أكمل الحوار.',
    'Put the words in the correct order.':'رتّب الكلمات ترتيبًا صحيحًا.',
    'Choose the correct preposition.':'اختر حرف الجر الصحيح.',
    'Choose the correct tense.':'اختر الزمن الصحيح.',
    'Which word fits the context best?':'أي كلمة تناسب سياق النص أكثر؟',
    'Read carefully before you answer.':'اقرأ بعناية قبل الإجابة.',
    'Try again and look for a clue.':'حاول مرة أخرى وابحث عن قرينة.',
    'Not quite. Check the meaning of the whole sentence.':'ليست صحيحة تمامًا. راجع معنى الجملة كاملةً.',
    'Correct! You used the context well.':'صحيح! أحسنت استخدام سياق النص.',
    'Correct answer':'الإجابة الصحيحة',
    'Incorrect answer':'إجابة غير صحيحة',
    'Show hint':'أظهر تلميحًا',
    'Hide hint':'أخفِ التلميح',
    'Choose the correct question.':'اختر السؤال الصحيح.',
    'Select the standard form.':'اختر الصيغة القياسية الصحيحة.',
    'Choose the natural sentence.':'اختر الجملة الطبيعية في الإنجليزية.',
    'Complete the expression.':'أكمل التعبير.',
    'Choose the idiomatic phrase.':'اختر التعبير الاصطلاحي الصحيح.',
    'Which sounds most natural?':'أي صياغة تبدو أكثر طبيعية في الإنجليزية؟',
    'Complete the phrase.':'أكمل العبارة.',
    'Choose the best phrase for a report.':'اختر العبارة الأنسب لتقرير.',
    'Select the natural description.':'اختر الوصف الطبيعي في الإنجليزية.',
    'Choose the most idiomatic phrase.':'اختر التعبير الاصطلاحي الأكثر ملاءمة.',
    'Choose the most natural noun phrase.':'اختر المركّب الاسمي الأكثر طبيعية.',
    'Use “have been” to describe experience without a finished past time.':'استخدم “have been” للتعبير عن تجربة دون تحديد وقت ماضٍ منتهٍ.',
    'Choose the correct sentence about life experience.':'اختر الجملة الصحيحة للتحدث عن تجربة في الحياة.',
    'Complete the sentence naturally.':'أكمل الجملة بصياغة طبيعية.',
    'Choose the precise option.':'اختر الخيار الأدق.',
    'Choose the formal sentence.':'اختر الجملة المناسبة للأسلوب الرسمي.',
    'Choose the correct option.':'اختر الخيار الصحيح.',
    'Choose the best option.':'اختر الخيار الأنسب.',
    'Choose the correct phrase.':'اختر العبارة الصحيحة.',
    'Choose the correct form.':'اختر الصيغة الصحيحة.',
    'Choose the correct preposition.':'اختر حرف الجر الصحيح.',
    'Choose the correct sentence.':'اختر الجملة الصحيحة.',
    'Complete the sentence.':'أكمل الجملة.',
    'Which sentence is correct?':'أي جملة صحيحة؟',
    'Choose the natural response.':'اختر الرد الطبيعي المناسب.',
    'Where does the route end?':'إلى أين ينتهي المسار؟',
    'Tap the building on the map.':'اضغط على المبنى في الخريطة.',
    'Match each word with its meaning':'صِل كل كلمة بمعناها.',
    'Flip two cards. A word and its meaning make a pair.':'اقلب بطاقتين. تتكوّن كل مطابقة من كلمة ومعناها.',
    'Start at the dot and face the arrow.':'ابدأ من النقطة ووجّه نفسك في اتجاه السهم.',
    'Walk straight for one block.':'سر مباشرةً لمسافة كتلة واحدة.',
    'Then walk two blocks.':'ثم سر لمسافتين.',
    'Turn left.':'انعطف يسارًا.',
    'Turn right.':'انعطف يمينًا.',
    'The place is on your left.':'المكان على يسارك.',
    'The place is on your right.':'المكان على يمينك.',
    'Exactly right!':'إجابة صحيحة تمامًا!',
    'Not quite.':'ليس تمامًا.',
    'Continue':'تابع',
    'See results':'عرض النتائج',
    'Complete the sentence':'أكمل الجملة.',
    'Choose the closest meaning':'اختر المعنى الأقرب.',
    'Choose the best answer':'اختر أفضل إجابة.',
    'Choose the correct answer':'اختر الإجابة الصحيحة.',
    'Read the whole text first':'اقرأ النص كاملًا أولًا.',
    'Only one word is wrong. Read the whole text first':'توجد كلمة واحدة غير صحيحة فقط. اقرأ النص كاملًا أولًا.',
    'Your answer':'إجابتك','Check answer':'تحقّق من الإجابة',
    'What does “borrow” mean?':'ما معنى كلمة «borrow»؟',
    'She was absolutely delighted.':'كانت سعيدة للغاية.',
    'Which word means “happening often”?':'أي كلمة تعني «يحدث كثيرًا»؟',
    '“I need to figure it out.” What does it mean?':'«أحتاج إلى فهم الأمر». ماذا تعني هذه العبارة؟',
    'Choose the best word: The instructions were so ___ that nobody was confused.':'اختر الكلمة الأنسب: كانت التعليمات ___ لدرجة أن لا أحد شعر بالارتباك.',
    'She ___ to school every day.':'هي ___ إلى المدرسة كل يوم.',
    'They ___ dinner when I arrived.':'كانوا ___ العشاء عندما وصلت.',
    'If I ___ more time, I would learn Italian.':'لو كان لديّ وقت أكثر، لتعلّمت الإيطالية.',
    'Neither of the answers ___ correct.':'لا واحدة من الإجابتين ___ صحيحة.',
    'By next June, she ___ her degree.':'بحلول يونيو المقبل، ستكون قد ___ شهادتها.',
    'You need to find the train station. What do you ask?':'تريد العثور على محطة القطار. ماذا تسأل؟',
    'The person says, “It’s just around the corner.” What do they mean?':'يقول الشخص: «إنه قريب جدًا، بعد الزاوية». ماذا يقصد؟',
    'You did not hear the directions clearly. You say…':'لم تسمع الاتجاهات بوضوح. ماذا تقول؟',
    'The person helps you. What is a natural response?':'يساعدك الشخص. ما الرد الطبيعي المناسب؟',
    'You are almost there. You hear, “You can’t miss it.” This means…':'أنت على وشك الوصول، وتسمع: «لن يصعب عليك العثور عليه». ماذا تعني العبارة؟',
    'Message: “The meeting has been pushed back to half past three.” When is it now?':'رسالة: «تم تأجيل الاجتماع إلى الثالثة والنصف». ما موعده الآن؟',
    '“Although it was raining, we decided to go hiking.” What happened?':'«على الرغم من هطول المطر، قررنا الذهاب للتنزه سيرًا». ماذا حدث؟',
    'A notice says: “No later than Friday.” What is the deadline?':'تقول الملاحظة: «في موعد أقصاه يوم الجمعة». ما الموعد النهائي؟',
    '“I’d rather you didn’t mention it.” The speaker is asking you to…':'«أفضل ألّا تذكر الأمر». ماذا يطلب منك المتحدث؟',
    '“The proposal was rejected on the grounds that it was too costly.” Why was it rejected?':'«رُفض الاقتراح بسبب ارتفاع تكلفته». لماذا رُفض؟',
    'Which spelling is correct?':'أي تهجئة صحيحة؟',
    'Choose the correct word.':'اختر الكلمة الصحيحة.',
    'Which is the correct form?':'ما الصيغة الصحيحة؟',
    'Choose the correct spelling.':'اختر التهجئة الصحيحة.',
    'Which word is correct?':'أي كلمة صحيحة؟',
    '“Her explanation was plausible, but not entirely convincing.” This means it was…':'«كان تفسيرها معقولًا، لكنه لم يكن مقنعًا تمامًا». هذا يعني أنه كان…',
    'Choose the best connector: “The evidence was limited; ___, the conclusion was tentative.”':'اختر أداة الربط الأنسب: «كانت الأدلة محدودة؛ ___، كان الاستنتاج مبدئيًا».',
    '“He was reluctant to endorse the proposal.” He was…':'«كان مترددًا في تأييد الاقتراح». كان…',
    'Which phrase most clearly signals a concession?':'أي عبارة تدل بوضوح أكبر على التسليم بنقطة أو الإقرار بها؟',
    '“The findings are inconclusive.” This means the findings…':'«النتائج غير حاسمة». هذا يعني أن النتائج…',
    'Choose the closest meaning':'اختر المعنى الأقرب.',
    'What does “delighted” mean?':'ما معنى كلمة «delighted»؟',
    'Choose the best word':'اختر الكلمة الأنسب.',
    'Understand the expression':'افهم التعبير.',
    'Complete the sentence':'أكمل الجملة.',
    'Choose the correct form':'اختر الصيغة الصحيحة.',
    'Choose the best tense':'اختر الزمن الأنسب.',
    'Complete the second conditional':'أكمل جملة الشرط من النوع الثاني.',
    'Choose the standard form':'اختر الصيغة القياسية.',
    'Choose the future perfect':'اختر صيغة المستقبل التام.',
    'A stranger is walking past':'يمرّ شخص غريب بجانبك.',
    'Understand the direction':'افهم الاتجاه.',
    'Keep the conversation friendly':'حافظ على ودّية المحادثة.',
    'Choose a friendly reply':'اختر ردًا ودودًا.',
    'Read carefully':'اقرأ بعناية.',
    'Notice the contrast':'انتبه إلى التباين.',
    'Interpret the phrase':'فسّر العبارة.',
    'Understand the intention':'افهم المقصود.',
    'Find the reason':'حدّد السبب.',
    'Choose carefully':'اختر بعناية.',
    'Something that can be trusted is…':'شيء يمكن الوثوق به هو…',
    'A strong feeling of certainty':'شعور قوي بالثقة واليقين.',
    'To make something better':'أن تجعل شيئًا أفضل.',
    'A difficult situation or problem':'موقف صعب أو مشكلة.',
    'Read for nuance':'اقرأ مع الانتباه للفروق الدقيقة.',
    'Show a logical result':'اختر ما يعبّر عن نتيجة منطقية.',
    'Infer the attitude':'استنتج الموقف أو الشعور.',
    'Choose the most precise transition':'اختر أداة الانتقال الأكثر دقة.',
    'Choose the exact meaning':'اختر المعنى الدقيق.',
    'To give something away':'أن تمنح شيئًا لشخص آخر دون استعادته.',
    'To take something for a while and return it':'أن تستعير شيئًا مدةً ثم تعيده.',
    'To buy something new':'أن تشتري شيئًا جديدًا.',
    'To lose something':'أن تفقد شيئًا.',
    'Very pleased and happy':'مسرور وسعيد جدًا.',
    'A little confused':'مرتبك قليلًا.',
    'Extremely tired':'متعب للغاية.',
    'Quite worried':'قلق إلى حدّ ما.',
    'Rare':'نادر.',
    'Frequent':'متكرر؛ يحدث كثيرًا.',
    'Unlikely':'غير مرجّح.',
    'Brief':'قصير أو موجز.',
    'Draw a picture':'أن ترسم صورة.',
    'Find an answer or understand something':'أن تجد إجابة أو تفهم شيئًا.',
    'Forget about it':'أن تنسى الأمر.',
    'Explain it loudly':'أن تشرحه بصوت مرتفع.',
    'vague':'غامضة.',
    'clear':'واضحة.',
    'scarce':'نادرة أو شحيحة.',
    'reluctant':'متردد.',
    'go':'أذهب.',
    'goes':'تذهب.',
    'going':'ذاهب.',
    'gone':'ذهب.',
    'have':'لديّ.',
    'were having':'كانوا يتناولون.',
    'are having':'يتناولون الآن.',
    'had have':'صيغة غير صحيحة.',
    'will have':'سوف أملك.',
    'had':'كان لديّ.',
    'would have':'كنت سأملك.',
    'are':'يكونون.',
    'were':'كانوا.',
    'is':'يكون.',
    'be':'يكون.',
    'will finish':'ستنهي.',
    'will have finished':'ستكون قد أنهت.',
    'has finished':'أنهت بالفعل.',
    'finishes':'تنهي.',
    'Where train station?':'أين محطة القطار؟',
    'Could you tell me how to get to the train station?':'هل يمكنك أن تخبرني كيف أصل إلى محطة القطار؟',
    'You tell station now.':'أخبرني بالمحطة الآن.',
    'How I am station?':'كيف أكون محطة؟',
    'It is very far away':'إنه بعيد جدًا.',
    'It is nearby, after turning at the next corner':'إنه قريب، بعد تجاوز الزاوية التالية.',
    'It is upstairs':'إنه في الطابق العلوي.',
    'It is closed today':'إنه مغلق اليوم.',
    'Say it again!':'قل ذلك مرة أخرى!',
    'What?':'ماذا؟',
    'Sorry, would you mind repeating that?':'عذرًا، هل تمانع في تكرار ذلك؟',
    'You are wrong.':'أنت مخطئ.',
    'I appreciate your help, thank you.':'أقدّر مساعدتك، شكرًا لك.',
    'I am appreciating you help.':'صياغة غير طبيعية: أنا أقدّر مساعدتك.',
    'Thanks for your helps.':'شكرًا على مساعداتك.',
    'I thank you much.':'أشكرك كثيرًا.',
    'You must not go there':'يجب ألّا تذهب إلى هناك.',
    'It is easy to see or find':'من السهل رؤيته أو العثور عليه.',
    'You have lost your ticket':'لقد أضعت تذكرتك.',
    'It is already closed':'إنه مغلق بالفعل.',
    '3:00':'الثالثة تمامًا.',
    '3:15':'الثالثة والربع.',
    '3:30':'الثالثة والنصف.',
    '4:30':'الرابعة والنصف.',
    'They stayed home because of rain':'بقوا في المنزل بسبب المطر.',
    'They went hiking despite the rain':'ذهبوا للتنزه سيرًا رغم المطر.',
    'The rain stopped before they left':'توقف المطر قبل مغادرتهم.',
    'They planned to go another day':'خططوا للذهاب في يوم آخر.',
    'After Friday':'بعد يوم الجمعة.',
    'Any time next week':'في أي وقت من الأسبوع المقبل.',
    'Friday at the latest':'يوم الجمعة على أبعد تقدير.',
    'Only before Monday':'قبل يوم الاثنين فقط.',
    'Tell everyone':'أخبر الجميع.',
    'Avoid talking about it':'تجنّب الحديث عن الأمر.',
    'Write it down':'دوّنه كتابةً.',
    'Explain it again':'اشرحه مرة أخرى.',
    'It was too complicated':'كان معقدًا جدًا.',
    'It was too expensive':'كان باهظ الثمن.',
    'It arrived too late':'وصل متأخرًا جدًا.',
    'It was incomplete':'كان غير مكتمل.',
    'Definately':'بالتأكيد.',
    'Definitely':'بالتأكيد.',
    'Definitly':'بالتأكيد.',
    'Definetely':'بالتأكيد.',
    'reliable':'جدير بالثقة.',
    'relyable':'جدير بالثقة.',
    'reliabel':'جدير بالثقة.',
    'relyible':'جدير بالثقة.',
    'Confidance':'الثقة أو اليقين.',
    'Confidence':'الثقة أو اليقين.',
    'Confidense':'الثقة أو اليقين.',
    'Improve':'يحسّن؛ وهذه هي التهجئة الصحيحة.',
    'Impruve':'يجعل الشيء أفضل.',
    'Improvve':'يجعل الشيء أفضل.',
    'Improv':'يجعل الشيء أفضل.',
    'Challange':'تحدٍّ أو موقف صعب.',
    'Challenge':'تحدٍّ أو موقف صعب.',
    'Chalenge':'تحدٍّ أو موقف صعب.',
    'Challeng':'تحدٍّ أو موقف صعب.',
    'Obviously false':'خاطئ بوضوح.',
    'Seemingly reasonable, but not fully persuasive':'يبدو معقولًا، لكنه غير مقنع تمامًا.',
    'Completely proven':'مثبت تمامًا.',
    'Impossible to understand':'من المستحيل فهمه.',
    'nevertheless':'مع ذلك.',
    'consequently':'وبالتالي؛ نتيجةً لذلك.',
    'whereas':'بينما.',
    'meanwhile':'في أثناء ذلك.',
    'Eager to support it':'متحمس لتأييده.',
    'Hesitant or unwilling to support it':'متردد أو غير راغب في تأييده.',
    'Unable to understand it':'غير قادر على فهمه.',
    'Certain to reject it publicly':'متأكد من رفضه علنًا.',
    'In addition':'بالإضافة إلى ذلك.',
    'For instance':'على سبيل المثال.',
    'Admittedly':'من المسلّم به؛ أو إقرارًا بذلك.',
    'As a result':'نتيجةً لذلك.',
    'Prove the hypothesis':'تثبت الفرضية.',
    'Do not lead to a definite conclusion':'لا تؤدي إلى استنتاج حاسم.',
    'Are irrelevant':'غير ذات صلة.',
    'Have been disproved':'ثبت خطؤها.',
    'Read the situation and choose the best answer':'اقرأ الموقف واختر أفضل إجابة.',
    'Choose the most accurate answer in context':'اختر الإجابة الأدق وفقًا للسياق.',
    'Choose the most precise answer':'اختر الإجابة الأكثر دقة.',
    'Read for precise meaning and usage':'اقرأ للتركيز على المعنى الدقيق وطريقة الاستخدام.',
    'Choose the most exact interpretation':'اختر التفسير الأدق.',
    'Choose the most helpful response':'اختر الرد الأكثر فائدة.',
    'Choose a natural response':'اختر ردًا طبيعيًا.',
    'What do they mean?':'ماذا يقصدون؟',
    'What is the speaker implying?':'ما الذي يلمّح إليه المتحدث؟',
    'Understand the idiom':'افهم التعبير الاصطلاحي.',
    'Keep the tone constructive':'حافظ على نبرة بنّاءة.',
    'Read the message carefully':'اقرأ الرسالة بعناية.',
    'Interpret the announcement':'فسّر الإعلان.',
    'Understand formal language':'افهم اللغة الرسمية.',
    'Choose the natural collocation':'اختر الكلمات التي تأتي معًا بصورة طبيعية.',
    'Interpret the understatement':'فسّر العبارة التي تقلّل من أهمية الأمر.',
    'Understand academic phrasing':'افهم الصياغة الأكاديمية.',
    'Meaning “needed or required”':'المعنى: «مطلوب أو ضروري».',
    'Meaning “to keep apart”':'المعنى: «إبقاء الأشياء منفصلة».',
    'A person or thing that receives something':'شخص أو شيء يتلقى شيئًا.',
    'C2: concession and qualification':'C2: الإقرار بنقطة مع تقييدها أو توضيح حدودها.',
    'Choose the intended meaning, not a literal word-for-word translation':'اختر المعنى المقصود، وليس ترجمة حرفية كلمة بكلمة.',
    'Choose the correct quantifier':'اختر أداة الكمية الصحيحة.',
    'Choose the correct time word':'اختر كلمة الزمن الصحيحة.',
    'Choose the correct reported question':'اختر صيغة السؤال المنقول الصحيحة.',
    'Which verb fits':'أي فعل يناسب؟',
    'Choose the most helpful response':'اختر الرد الأكثر فائدة.',
    'Choose the natural response':'اختر الرد الطبيعي.',
    'What is the speaker implying':'ما الذي يلمّح إليه المتحدث؟',
    'What do they mean':'ماذا يقصدون؟',
    'Choose the intended meaning, not a literal word-for-word translation':'اختر المعنى المقصود، لا الترجمة الحرفية كلمةً بكلمة.',
    'Choose the natural phrase':'اختر التعبير الطبيعي.',
    'Choose the natural collocation':'اختر الكلمات التي تُستخدم معًا بصورة طبيعية.',
    'Understand formal language':'افهم اللغة الرسمية.',
    'Interpret the understatement':'افهم التلميح أو التقليل من أهمية الأمر.',
    'C2: concession and qualification':'C2: الإقرار بنقطة مع توضيح حدودها أو تقييدها.',
    'Too expensive':'باهظ الثمن جدًا.','Reasonably priced':'سعره معقول.','Hard to find':'يصعب العثور عليه.','Free of charge':'مجانًا.',
    'Very tired':'متعب جدًا.','Very excited':'متحمس جدًا.','Slightly hungry':'جائع قليلًا.','Quite surprised':'متفاجئ إلى حدّ ما.',
    'Needing a drink':'بحاجة إلى شراب.','Needing sleep':'بحاجة إلى النوم.','Feeling cold':'يشعر بالبرد.','Feeling angry':'يشعر بالغضب.',
    'Lives near you':'يسكن بالقرب منك.','Teaches you':'يدرّسك.','Works in a hospital':'يعمل في مستشفى.','Travels with you':'يسافر معك.',
    'One time':'مرة واحدة.','Most of the time':'في معظم الأوقات.','Very quickly':'بسرعة كبيرة.',
    'make a photo':'يلتقط صورة.','take a photo':'يلتقط صورة.','do a photo':'يلتقط صورة.',
    'do':'يفعل.','does':'يفعل.','did':'فعل.','put':'يضع.','make':'يصنع.','take':'يأخذ.','go':'يذهب.','goes':'يذهب.',
    'have':'لديه.','has':'لديه.','am':'أكون.','is':'يكون.','are':'يكونون.','was':'كان.','were':'كانوا.','be':'يكون.',
    'quiet':'هادئ.','necessary':'ضروري.','tiny':'ضئيل جدًا.','expensive':'باهظ الثمن.','small':'صغير.','empty':'فارغ.',
    'early':'مبكر.','easy':'سهل.','crowded':'مزدحم.','narrow':'ضيق.','hungry':'جائع.','late':'متأخر.','huge':'ضخم.','heavy':'ثقيل.',
    'friend':'صديق.','people':'الناس.','different':'مختلف.','comfortable':'مريح.','beautiful':'جميل.','tomorrow':'غدًا.','yesterday':'أمس.',
    'environment':'البيئة.','convenient':'ملائم.','occasion':'مناسبة.','recommend':'يوصي.','maintenance':'صيانة.','embarrass':'يحرج.',
    'occurrence':'حدوث.','confidence':'الثقة.','improve':'يحسّن.','challenge':'تحدٍّ.','definitely':'بالتأكيد.','separate':'منفصل.',
    'beginning':'البداية.','privilege':'امتياز.','independent':'مستقل.','entrepreneur':'رائد أعمال.','mischievous':'مشاغب.',
    'acquaintance':'معرفة / شخص تعرفه.','borrow':'يستعير.','thirsty':'عطشان.','usually':'عادةً.','cheap':'رخيص.','arrive':'يصل.',
    'ticket':'تذكرة.','appointment':'موعد.','receipt':'إيصال.','lend':'يُقرض / يُعير.','weather':'الطقس.','available':'متاح.',
    'return':'يعيد / يعود.','advice':'نصيحة.','afford':'يستطيع تحمّل التكلفة.','evidence':'دليل.','delay':'تأخير.',
    'contribute':'يساهم.','maintain':'يحافظ على.','opportunity':'فرصة.','prevent':'يمنع.','hesitate':'يتردد.',
    'substantial':'كبير / جوهري.','undermine':'يُضعف.','reluctant':'متردد.','ambiguous':'ملتبس.','feasible':'قابل للتنفيذ.',
    'convey':'ينقل / يعبّر عن.','allocate':'يخصّص.','compelling':'مقنع.','inevitable':'حتمي.','scrutinise':'يدقّق في.',
    'mitigate':'يخفّف.','plausible':'معقول أو محتمل.','succinct':'موجز.','tentative':'مبدئي.','coherent':'مترابط.',
    'infer':'يستنتج.','robust':'متين / قوي.','nuanced':'دقيق الفروق.','equivocal':'ملتبس أو غير واضح.',
    'intransigent':'متصلّب في الرأي.','salient':'بارز / مهم.','ostensible':'ظاهري.','inchoate':'غير مكتمل التشكّل.',
    'parsimonious':'مقتصد جدًا.','perfunctory':'شكلي / بلا عناية.','invidious':'ينطوي على تمييز أو ظلم.','recondite':'غامض وصعب الفهم.',
    'Check every letter carefully':'تحقّق من كل حرف بعناية.',
    'Too expensive':'باهظ الثمن جدًا.','Reasonably priced':'سعره معقول.','Hard to find':'يصعب العثور عليه.','Free of charge':'مجانًا.',
    'Very tired':'متعب جدًا.','Very excited':'متحمس جدًا.','Slightly hungry':'جائع قليلًا.','Quite surprised':'متفاجئ إلى حدّ ما.',
    'Needing a drink':'بحاجة إلى شراب.','Needing sleep':'بحاجة إلى النوم.','Feeling cold':'يشعر بالبرد.','Feeling angry':'يشعر بالغضب.',
    'Lives near you':'يسكن بالقرب منك.','Teaches you':'يدرّسك.','Works in a hospital':'يعمل في مستشفى.','Travels with you':'يسافر معك.',
    'One time':'مرة واحدة.','Most of the time':'في معظم الأوقات.','Very quickly':'بسرعة كبيرة.',
    'Can buy things there now':'يمكنك شراء الأشياء هناك الآن.',
    'Cannot enter to shop now':'لا يمكنك دخول المتجر الآن.',
    'Must pay less':'يجب أن تدفع مبلغًا أقل.','Can only use cash':'يمكنك استخدام النقود الورقية فقط.',
    'Buy more milk':'اشترِ المزيد من الحليب.','Have no milk left':'لم يتبقَّ أي حليب.',
    'Spill the milk':'يسكب الحليب.','Drink milk quickly':'يشرب الحليب بسرعة.',
    'Can I wear it to see if it fits?':'هل يمكنني ارتداؤه لأرى إن كان مناسبًا؟',
    'Can I take it home for free?':'هل يمكنني أخذه إلى المنزل مجانًا؟',
    'Can I repair it?':'هل يمكنني إصلاحه؟','Can I exchange money?':'هل يمكنني صرف العملة؟',
    'A shopping list':'قائمة مشتريات.','Proof of payment':'إثبات الدفع.','A discount card':'بطاقة خصم.',
    'make up':'يؤلف أو يختلق؛ ويعتمد المعنى على السياق.',
    'A “neighbour” is someone who…':'كلمة neighbour تصف شخصًا…',
    'If a shop is “closed”, you…':'إذا كان المتجر مغلقًا، فأنت…',
    '“Could I try this on?” means…':'ما معنى العبارة «Could I try this on?»؟'
  }).map(([key,value])=>[normalizeTranslationKey(key),value]));
  // Reviewed Arabic translations for authored reading-comprehension questions and their options.
  Object.assign(AR_TRANSLATION_PHRASES, Object.fromEntries([
    ["What does Lina offer to do?","ماذا تعرض لينا أن تفعل؟"],
    ["Why does the family thank Lina?","لماذا تشكر العائلة لينا؟"],
    ["What happens at the end?","ماذا يحدث في النهاية؟"],
    ["Why does Yanis need another train?","لماذا يحتاج يانيس إلى قطار آخر؟"],
    ["How long must he wait?","كم من الوقت عليه أن ينتظر؟"],
    ["How does Yanis use the waiting time?","كيف يستغل يانيس وقت الانتظار؟"],
    ["What caused the delay?","ما الذي تسبب في التأخير؟"],
    ["Why was Mina’s message important?","لماذا كانت رسالة مينا مهمة؟"],
    ["What does the story suggest about trust?","ماذا توحي به القصة بشأن الثقة؟"],
    ["Why did the council run a trial?","لماذا أجرى المجلس تجربةً؟"],
    ["What concern did shop owners raise?","ما المخاوف التي عبّر عنها أصحاب المتاجر؟"],
    ["What was the final decision?","ما القرار النهائي؟"],
    ["Why did Salma examine the letters carefully?","لماذا فحصت سلمى الرسائل بعناية؟"],
    ["How did Salma present her conclusion?","كيف عرضت سلمى استنتاجها؟"],
    ["What quality does Salma demonstrate?","ما الصفة التي تُظهرها سلمى؟"],
    ["What is the distinction between coherence and causation in the passage?","ما الفرق بين الترابط والسببية في النص؟"],
    ["Why was the original article criticised?","لماذا تعرّض المقال الأصلي للانتقاد؟"],
    ["What is the reviewer’s final position?","ما الموقف النهائي للمراجع؟"],
    ["Why does Lina carry a basket?","لماذا تحمل لينا سلّة؟"],
    ["What does Lina ask the seller?","ماذا تسأل لينا البائع؟"],
    ["How do we know Lina is organised?","كيف نعرف أن لينا منظّمة؟"],
    ["What caused Youssef to miss the first bus?","ما الذي جعل يوسف يفوّت الحافلة الأولى؟"],
    ["Why did he call his classmate?","لماذا اتصل بزميله في الدراسة؟"],
    ["What helped Youssef when he arrived?","ما الذي ساعد يوسف عندما وصل؟"],
    ["Why did Amira consider throwing the lamp away?","لماذا فكّرت أميرة في التخلّص من المصباح؟"],
    ["What was the actual problem?","ما المشكلة الحقيقية؟"],
    ["What broader lesson did Amira learn?","ما الدرس الأعمّ الذي تعلّمته أميرة؟"],
    ["What trade-off appeared during the trial?","ما المفاضلة التي ظهرت أثناء التجربة؟"],
    ["Why did the company introduce shared hours?","لماذا اعتمدت الشركة ساعات عمل مشتركة؟"],
    ["What does “trade-off” best describe here?","ما المعنى الذي يعبّر عنه مصطلح «trade-off» هنا بأفضل صورة؟"],
    ["Why did the researchers compare several kinds of data?","لماذا قارن الباحثون أنواعًا متعددة من البيانات؟"],
    ["What does the report imply about the measures?","إلى ماذا يشير التقرير بشأن التدابير؟"],
    ["Why is longer monitoring necessary?","لماذا تلزم المراقبة لمدة أطول؟"],
    ["What weakens the paper’s claim of decisive success?","ما الذي يضعف ادعاء الدراسة بتحقيق نجاح حاسم؟"],
    ["Does the passage conclude that the programme failed?","هل يستنتج النص أن البرنامج قد فشل؟"],
    ["Which evaluation would strengthen the evidence?","أي تقييم من شأنه تعزيز الأدلة؟"],
    ["What did the first meeting reveal, despite all the ideas?","ما الذي كشفه الاجتماع الأول رغم كثرة الأفكار؟"],
    ["Why did the group choose hardy herbs and a rainwater barrel?","لماذا اختارت المجموعة أعشابًا قوية التحمل وبرميلًا لمياه الأمطار؟"],
    ["What is implied by the phrase “the discussion had hidden” the problem?","ما الذي توحي به عبارة «النقاش أخفى المشكلة»؟"],
    ["What is the author’s main point in the final paragraph?","ما الفكرة الرئيسية للكاتب في الفقرة الأخيرة؟"],
    ["Why did the company limit the number of meetings?","لماذا حدّت الشركة من عدد الاجتماعات؟"],
    ["What weakness did the first review expose?","ما موطن الضعف الذي كشفته المراجعة الأولى؟"],
    ["What is the tone of the final paragraph?","ما نبرة الفقرة الأخيرة؟"],
    ["What does the final sentence challenge?","ما الفكرة التي تشكّك فيها الجملة الأخيرة؟"],
    ["Why does the writer mention the report’s appendix?","لماذا يذكر الكاتب ملحق التقرير؟"],
    ["What does the range from four to twelve per cent demonstrate?","ماذا يوضّح النطاق الممتد من أربعة إلى اثني عشر بالمئة؟"],
    ["Which claim does the researcher explicitly avoid making?","أي ادعاء يتجنّب الباحث التصريح به بوضوح؟"],
    ["What is the author’s attitude toward revising the city’s statement?","ما موقف الكاتب من مراجعة تصريح المدينة؟"],
    ["What is the central flaw in giving each statement equal space?","ما العيب الأساسي في تخصيص مساحة متساوية لكل تصريح؟"],
    ["Why do the critics reject replacing neutrality with a new formula?","لماذا يرفض النقّاد استبدال الحياد بمعادلة جديدة؟"],
    ["What is implied by “a calm sentence can still mislead”?","ما الذي توحي به عبارة «قد تكون الجملة الهادئة مضلّلة أيضًا»؟"],
    ["Which best captures the author’s view of neutrality?","أي خيار يعبّر بأفضل صورة عن رأي الكاتب في الحياد؟"],
    ["Choose the best answer.","اختر أفضل إجابة."],
    ["Help carry a box","المساعدة في حمل صندوق."],
    ["Paint the house","طلاء المنزل."],
    ["Buy a car","شراء سيارة."],
    ["She offers help","إنها تعرض المساعدة."],
    ["She takes their boxes","إنها تأخذ صناديقهم."],
    ["She leaves the street","إنها تغادر الشارع."],
    ["Lina makes a new friend","تكوّن لينا صداقة جديدة."],
    ["The family moves away","تنتقل العائلة إلى مكان آخر."],
    ["The cookies disappear in a shop","تختفي قطع البسكويت في متجر."],
    ["He arrived after his train left","وصل بعد مغادرة قطاره."],
    ["He lost his cousin","أضاع ابن عمّه."],
    ["The station is closed","المحطة مغلقة."],
    ["Forty minutes","أربعون دقيقة."],
    ["Ten hours","عشر ساعات."],
    ["Two days","يومان."],
    ["He reads in a café","يقرأ في مقهى."],
    ["He returns home immediately","يعود إلى المنزل فورًا."],
    ["He repairs the train","يصلح القطار."],
    ["An unexpected work task","مهمة عمل غير متوقعة."],
    ["A broken presentation screen","شاشة عرض معطّلة."],
    ["A cancelled meeting","اجتماع أُلغي."],
    ["It explained the delay and offered a new plan","شرحت سبب التأخير واقترحت خطة جديدة."],
    ["It blamed her colleague","ألقت اللوم على زميلها."],
    ["It cancelled the promise permanently","ألغت الوعد نهائيًا."],
    ["Honest communication can help preserve it","يمكن للتواصل الصريح أن يساعد في الحفاظ عليها."],
    ["A delay always destroys it","التأخير يدمّرها دائمًا."],
    ["Promises never matter at work","الوعود لا أهمية لها أبدًا في العمل."],
    ["To test the proposal before making a final plan","اختبار المقترح قبل وضع خطة نهائية."],
    ["To close every shop permanently","إغلاق جميع المتاجر نهائيًا."],
    ["To avoid collecting public feedback","تجنّب جمع آراء الجمهور."],
    ["They might lose customers","قد يخسرون زبائن."],
    ["Cyclists would buy too much food","سيشتري راكبو الدراجات الكثير من الطعام."],
    ["The street was too quiet at night","كان الشارع هادئًا جدًا ليلًا."],
    ["Keep the safer route and schedule deliveries","الإبقاء على المسار الأكثر أمانًا وتنظيم مواعيد التوصيل."],
    ["Cancel all changes","إلغاء جميع التغييرات."],
    ["Ban deliveries completely","حظر عمليات التوصيل تمامًا."],
    ["Their dates raised questions about their reliability","أثارت تواريخها تساؤلات حول مدى موثوقيتها."],
    ["She wanted to change the colour of the ink","أرادت تغيير لون الحبر."],
    ["The archive had no other documents","لم يكن في الأرشيف أي مستندات أخرى."],
    ["As a reason to reconsider specific claims, not as total replacement","كسبب لإعادة النظر في ادعاءات محددة، لا لاستبدالها بالكامل."],
    ["As unquestionable proof of every rumour","كدليل لا يقبل الشك على كل شائعة."],
    ["As a decision to stop researching","كقرار بوقف البحث."],
    ["Careful evaluation of evidence","التقييم الدقيق للأدلة."],
    ["A preference for dramatic claims","تفضيل الادعاءات المثيرة."],
    ["Disinterest in conflicting details","عدم الاهتمام بالتفاصيل المتعارضة."],
    ["A plausible story does not by itself prove that one event caused another","كون الرواية معقولة لا يثبت وحده أن حدثًا تسبب في حدث آخر."],
    ["A coherent account is always false","الرواية المترابطة خاطئة دائمًا."],
    ["Causation can be established without evidence","يمكن إثبات السببية دون أدلة."],
    ["Alternative explanations should never be considered","يجب ألّا تؤخذ التفسيرات البديلة في الحسبان أبدًا."],
    ["It selected supportive facts while neglecting counterexamples","اختار الحقائق المؤيدة وأهمل الأمثلة المضادة."],
    ["It included too many alternative explanations","تضمّن عددًا كبيرًا جدًا من التفسيرات البديلة."],
    ["It refused to make any claim","رفض تقديم أي ادعاء."],
    ["It was too short to be coherent","كان قصيرًا جدًا بحيث تعذّر أن يكون مترابطًا."],
    ["The evidence does not justify the article’s level of certainty","الأدلة لا تبرّر درجة اليقين التي عبّر عنها المقال."],
    ["The allegation has been conclusively proven","ثبت الادعاء بصورة قاطعة."],
    ["The allegation is certainly false","الادعاء خاطئ بالتأكيد."],
    ["No conclusion about evidence is ever possible","لا يمكن أبدًا استخلاص أي استنتاج من الأدلة."],
    ["To help carry the shopping","المساعدة في حمل المشتريات."],
    ["To feed the birds","إطعام الطيور."],
    ["To collect rain","جمع مياه الأمطار."],
    ["The price of the oranges","سعر البرتقال."],
    ["The way to school","الطريق إلى المدرسة."],
    ["The time of the train","موعد القطار."],
    ["She checks the shopping list","تراجع قائمة المشتريات."],
    ["She leaves the food behind","تترك الطعام خلفها."],
    ["She buys things at random","تشتري الأشياء عشوائيًا."],
    ["He left home late while looking for his notebook","غادر المنزل متأخرًا بينما كان يبحث عن دفتره."],
    ["The bus route changed","تغيّر مسار الحافلة."],
    ["He forgot where the stop was","نسي مكان موقف الحافلة."],
    ["To warn them he might be late","لإخبارهم بأنه قد يتأخر."],
    ["To cancel the lesson","لإلغاء الدرس."],
    ["To ask for a new bus","لطلب حافلة أخرى."],
    ["His classmate saved a seat and shared notes","احتفظ زميله بمقعد له وشاركه الملاحظات."],
    ["The teacher repeated the whole course","أعاد المعلّم شرح المقرر كاملًا."],
    ["The bus driver gave him a notebook","أعطاه سائق الحافلة دفترًا."],
    ["It had stopped working","توقّف عن العمل."],
    ["She wanted a brighter room","أرادت غرفة أكثر إضاءةً."],
    ["The library asked her to","طلبت منها المكتبة ذلك."],
    ["A loose connection","وصلة كهربائية مرتخية."],
    ["A broken bulb","مصباح تالف."],
    ["An empty battery","بطارية فارغة."],
    ["Try safe repairs before replacing items","جرّب الإصلاحات الآمنة قبل استبدال الأشياء."],
    ["Never ask anyone for help","لا تطلب المساعدة من أي شخص أبدًا."],
    ["Every electrical fault is easy to fix","كل عطل كهربائي سهل الإصلاح."],
    ["Fewer commuting problems but harder meeting coordination","مشكلات أقل في التنقّل، لكن تنسيق الاجتماعات يصبح أصعب."],
    ["Higher costs and no employee benefit","تكاليف أعلى دون فائدة للموظفين."],
    ["More meetings and longer commutes","اجتماعات أكثر وتنقّلات أطول."],
    ["To make collaboration easier while keeping flexibility","لتسهيل التعاون مع الحفاظ على المرونة."],
    ["To remove all individual choice","لإلغاء جميع الخيارات الفردية."],
    ["To require everyone to commute daily","لإلزام الجميع بالتنقّل يوميًا."],
    ["A benefit gained alongside a difficulty","فائدة تتحقق بالتزامن مع صعوبة أو تنازل."],
    ["A result with no disadvantages","نتيجة بلا سلبيات."],
    ["A decision made without evidence","قرار اتُّخذ دون أدلة."],
    ["To avoid assigning the improvement to one cause too quickly","لتجنّب إرجاع التحسّن إلى سبب واحد على عجل."],
    ["To prove rainfall was the only factor","لإثبات أن الأمطار كانت العامل الوحيد."],
    ["To ignore changes in land use","لتجاهل التغيّرات في استخدام الأراضي."],
    ["Several may have contributed, but their separate effects remain uncertain","ربما أسهمت عدة عوامل، لكن أثر كل منها على حدة لا يزال غير مؤكد."],
    ["None had any possible effect","لم يكن لأي منها أي تأثير محتمل."],
    ["One measure was conclusively responsible","كان أحد التدابير مسؤولًا بصورة قاطعة."],
    ["To estimate each measure’s impact more reliably","لتقدير أثر كل تدبير بموثوقية أكبر."],
    ["To stop collecting evidence","لإيقاف جمع الأدلة."],
    ["To make the report shorter","لجعل التقرير أقصر."],
    ["The comparison used an unusual month and lacked a control group","استُخدمت للمقارنة فترة شهر غير اعتيادية ولم تتضمن مجموعة ضابطة."],
    ["The programme lasted several years","استمر البرنامج عدة سنوات."],
    ["Participation was measured more than once","قيس مستوى المشاركة أكثر من مرة."],
    ["No; it says the programme may help, but the evidence is limited","لا؛ بل يقول إن البرنامج قد يكون مفيدًا، لكن الأدلة محدودة."],
    ["Yes; it proves the programme caused harm","نعم؛ إذ يثبت أن البرنامج تسبب في ضرر."],
    ["Yes; it says participation never changed","نعم؛ إذ يقول إن المشاركة لم تتغيّر قط."],
    ["Compare similar groups over a longer period","مقارنة مجموعات متشابهة على مدى فترة أطول."],
    ["Use only the most successful month","استخدام الشهر الأكثر نجاحًا فقط."],
    ["Remove all comparison data","حذف جميع بيانات المقارنة."],
    ["People had not yet agreed who would organise the work","لم يتفق الناس بعد على من سينظّم العمل."],
    ["Residents disliked the idea of a garden","لم تعجب السكان فكرة إنشاء حديقة."],
    ["The council had already sold the land","كان المجلس قد باع الأرض بالفعل."],
    ["To work around the lack of weekday watering and use available water","للتعامل مع عدم توفر من يسقي النباتات خلال أيام الأسبوع والاستفادة من المياه المتاحة."],
    ["Because residents wanted to remove every plant","لأن السكان أرادوا إزالة جميع النباتات."],
    ["To make the garden more expensive","لجعل الحديقة أكثر تكلفة."],
    ["The group’s enthusiasm distracted them from practical details","شغل حماس المجموعة انتباههم عن التفاصيل العملية."],
    ["Someone deliberately lied about the rota","كذب شخص عمدًا بشأن جدول المناوبة."],
    ["The residents had already solved the problem","كان السكان قد حلّوا المشكلة بالفعل."],
    ["The garden’s social value became more important than its perfect appearance","أصبحت القيمة الاجتماعية للحديقة أهم من مظهرها المثالي."],
    ["The garden succeeded because every original plan was completed","نجحت الحديقة لأن جميع الخطط الأصلية نُفذت."],
    ["The residents stopped cooperating by summer","توقف السكان عن التعاون بحلول الصيف."],
    ["To reduce interruptions and protect focused work time","لتقليل المقاطعات وحماية وقت العمل المركّز."],
    ["To prevent employees from talking to clients","لمنع الموظفين من التحدث إلى العملاء."],
    ["To make the trial appear more successful","لجعل التجربة تبدو أكثر نجاحًا."],
    ["Customer service coverage had not been planned well enough","لم يُخطط لتغطية خدمة العملاء على نحو كافٍ."],
    ["Employees refused to take part","رفض الموظفون المشاركة."],
    ["The company reduced salaries","خفضت الشركة الرواتب."],
    ["Cautiously constructive: the idea may work with adjustments","بنّاءة بحذر: قد تنجح الفكرة بعد إجراء تعديلات."],
    ["Triumphant and certain that every company should copy it","انتصارية وتؤكد أن على كل شركة تقليدها."],
    ["Sarcastic and dismissive of all experiments","ساخرة وترفض جميع التجارب باستخفاف."],
    ["The assumption that fewer hours automatically mean less work","الافتراض بأن تقليل ساعات العمل يعني تلقائيًا إنجاز عمل أقل."],
    ["The idea that customers need responses","فكرة أن العملاء يحتاجون إلى ردود."],
    ["The use of any measurements","استخدام أي قياسات."],
    ["To show that important limitations were present but easy to overlook","لإظهار وجود قيود مهمة كان من السهل إغفالها."],
    ["To prove the entire report was fabricated","لإثبات أن التقرير بأكمله مختلق."],
    ["To suggest that appendices are never useful","للإيحاء بأن الملاحق لا تكون مفيدة أبدًا."],
    ["The result depends meaningfully on assumptions about missing readings","تعتمد النتيجة بدرجة ملحوظة على الافتراضات المتعلقة بالقراءات المفقودة."],
    ["The policy definitely increased congestion","زادت السياسة الازدحام بالتأكيد."],
    ["All estimates are equally reliable","جميع التقديرات متساوية في الموثوقية."],
    ["That uncertainty proves the policy was ineffective","أن عدم اليقين يثبت عدم فعالية السياسة."],
    ["That the original figure was perfectly certain","أن الرقم الأصلي كان مؤكدًا تمامًا."],
    ["That the monitoring system had no gaps","أن نظام المراقبة لم تكن فيه أي فجوات."],
    ["It is responsible when the evidence does not support certainty","تُعدّ المراجعة مسؤولة عندما لا تدعم الأدلة اليقين."],
    ["It is always a sign of incompetence","إنها علامة على عدم الكفاءة دائمًا."],
    ["It should be avoided to protect public confidence","ينبغي تجنّبها لحماية ثقة الجمهور."],
    ["It can imply equal credibility despite unequal supporting evidence","قد توحي بتساوي المصداقية رغم تفاوت الأدلة الداعمة."],
    ["It guarantees that readers will reject the report","إنها تضمن أن القرّاء سيرفضون التقرير."],
    ["It prevents companies from commenting","إنها تمنع الشركات من التعليق."],
    ["Because journalists must evaluate evidence rather than decide in advance who is right","لأن على الصحفيين تقييم الأدلة بدلًا من تقرير من المحق مسبقًا."],
    ["Because every claim should be accepted without checking","لأن كل ادعاء يجب قبوله دون تحقق."],
    ["Because context should never be included","لأنه يجب ألّا يُذكر السياق أبدًا."],
    ["A neutral tone does not guarantee a fair or accurate representation","النبرة المحايدة لا تضمن عرضًا منصفًا أو دقيقًا."],
    ["Emotional language is always more accurate","اللغة العاطفية أكثر دقة دائمًا."],
    ["Readers should ignore writing style entirely","ينبغي للقراء تجاهل أسلوب الكتابة تمامًا."],
    ["It requires careful judgement about evidence, not mechanical balance","يتطلب حكمًا دقيقًا على الأدلة، لا توازنًا آليًا."],
    ["It means never questioning either side","يعني عدم التشكيك في أي طرف مطلقًا."],
    ["It is achieved by using equally long quotations","يتحقق باستخدام اقتباسات متساوية الطول."]
  ].map(([en,ar])=>[normalizeTranslationKey(en),ar])));
  Object.assign(AR_TRANSLATION_PHRASES, Object.fromEntries(Object.entries(window.EPIPHANY_AR_TRANSLATION_PHRASES || {}).map(([en,ar])=>[normalizeTranslationKey(en),ar])));

  function translateKnownPhrase(source) {
    const lower=normalizeTranslationKey(source);
    if(AR_TRANSLATION_PHRASES[lower])return AR_TRANSLATION_PHRASES[lower];
    return source.replace(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g,token=>{
      const key=token.toLowerCase();
      if(Object.prototype.hasOwnProperty.call(AR_TRANSLATION_WORDS,key))return AR_TRANSLATION_WORDS[key];
      if(typeof STORY_WORDS_AR!=='undefined'&&STORY_WORDS_AR[key])return STORY_WORDS_AR[key];
      if(typeof W_AR!=='undefined'&&W_AR[key])return W_AR[key];
      return token;
    }).replace(/\?/g,'؟');
  }
  function translateToArabic(raw) {
    const source=String(raw||'').replace(/\s+/g,' ').trim();
    if(!source)return {text:'لا يوجد نص لترجمته.',exact:true};
    const key=normalizeTranslationKey(source);
    const exact=AR_TRANSLATION_PHRASES[key];
    if(exact)return {text:exact,exact:true};
    const commonPrompts = {
      'what does "borrow" mean':'ما معنى كلمة «borrow»؟',
      'what does "affordable" mean':'ما معنى كلمة «affordable»؟',
      'what does "exhausted" mean':'ما معنى كلمة «exhausted»؟',
      'what does "thirsty" mean':'ما معنى كلمة «thirsty»؟',
      'what does "usually" mean':'ما معنى كلمة «usually»؟',
      'which verb fits':'أي فعل يناسب؟',
      'choose the correct word':'اختر الكلمة الصحيحة.',
      'choose the correct spelling':'اختر التهجئة الصحيحة.',
      'which spelling is correct':'أي تهجئة صحيحة؟',
      'which word is correct':'أي كلمة صحيحة؟',
      'which is the correct form':'ما الصيغة الصحيحة؟',
      'which is correct':'أيّها صحيح؟',
      'which is the correct question':'أي سؤال صيغته صحيحة؟',
      'choose the best word':'اختر الكلمة الأنسب.',
      'choose the best answer':'اختر أفضل إجابة.',
      'what is the opposite of "cheap"':'ما عكس كلمة «cheap»؟',
      'a "neighbour" is someone who':'الجار هو شخص…',
      'if a shop is "closed", you':'إذا كان المتجر «مغلقًا»، فأنت…',
      'which sentence is grammatically correct':'أي جملة صحيحة نحويًا؟',
      'complete the sentence':'أكمل الجملة.',
      'complete the dialogue':'أكمل الحوار.',
      'read the situation and choose the best answer':'اقرأ الموقف واختر أفضل إجابة.',
      'read the clues and infer the missing word':'اقرأ القرائن واستنتج الكلمة الناقصة.',
      'choose the natural phrase':'اختر التعبير الطبيعي في الإنجليزية.',
      'choose the correct phrase':'اختر العبارة الصحيحة.',
      'choose the correct question':'اختر السؤال الصحيح.',
      'which sentence is correct':'أي جملة صحيحة؟',
      'choose the natural response':'اختر الرد الطبيعي المناسب.',
      'what would you say in this situation':'ماذا ستقول في هذا الموقف؟',
      'read carefully':'اقرأ بعناية.',
      'choose the best option':'اختر الخيار الأنسب.',
      'choose the correct option':'اختر الخيار الصحيح.'
    };
    if(commonPrompts[key])return {text:commonPrompts[key],exact:true};
    let templateMatch=source.match(/^Level\s+(A1|A2|B1|B2|C1|C2)\s*[·•-]\s*choose the best answer\.?$/i);
    if(templateMatch)return {text:'المستوى '+templateMatch[1]+' · اختر أفضل إجابة.',exact:true};
    if(/^Start at the dot and face the arrow\./i.test(source)){
      const parts=source.match(/Start at the dot and face the arrow\.|(?:Then )?walk (?:straight for )?(one|two|three|four|five|six|seven|eight|nine|ten) blocks?\.|Turn (left|right)\.|The place is on your (left|right)\./gi)||[];
      const nums={one:'كتلة واحدة',two:'كتلتين',three:'ثلاث كتل',four:'أربع كتل',five:'خمس كتل',six:'ست كتل',seven:'سبع كتل',eight:'ثماني كتل',nine:'تسع كتل',ten:'عشر كتل'};
      const translated=parts.map(part=>{
        if(/^Start at the dot/i.test(part))return 'ابدأ من النقطة ووجّه نفسك في اتجاه السهم.';
        const walk=part.match(/^(?:Then )?walk (?:straight for )?(one|two|three|four|five|six|seven|eight|nine|ten) blocks?\.$/i);
        if(walk)return (/^Then /i.test(part)?'ثم سر لمسافة ':'سر مباشرةً لمسافة ')+nums[walk[1].toLowerCase()]+'.';
        const turn=part.match(/^Turn (left|right)\.$/i);
        if(turn)return 'انعطف '+(turn[1].toLowerCase()==='left'?'يسارًا.':'يمينًا.');
        const side=part.match(/^The place is on your (left|right)\.$/i);
        if(side)return 'المكان على '+(side[1].toLowerCase()==='left'?'يسارك.':'يمينك.');
        return '';
      }).filter(Boolean);
      if(translated.length===parts.length&&parts.length>1)return {text:translated.join(' '),exact:true};
    }
    templateMatch=source.match(/^Focus:\s*(.+?)\.?$/i);
    if(templateMatch)return {text:'ركّز على كلمة «'+templateMatch[1]+'».',exact:true};
    templateMatch=source.match(/^Hint:\s*(.+?)\.?$/i);
    if(templateMatch)return {text:'تلميح: «'+templateMatch[1]+'».',exact:true};
    templateMatch=source.match(/^What is the opposite of\s+[“"']?(.+?)[”"']?\??$/i);
    if(templateMatch)return {text:'ما عكس «'+templateMatch[1].replace(/[“”"']/g,'')+'»؟',exact:true};
    templateMatch=source.match(/^The opposite of\s+[“"']?(.+?)[”"']?\s+is\s+_{2,}\.?$/i);
    if(templateMatch)return {text:'عكس «'+templateMatch[1].replace(/[“”"']/g,'')+'» هو ___ .',exact:true};
    templateMatch=source.match(/^What is a\s+[“"']?(.+?)[”"']?\??$/i);
    if(templateMatch)return {text:'ما المقصود بـ «'+templateMatch[1].replace(/[“”"']/g,'')+'»؟',exact:true};
    templateMatch=source.match(/^Choose the (natural phrase|correct phrase|correct word|best word|correct spelling|correct form|word):?\s*(.*)$/i);
    if(templateMatch)return {text:({'natural phrase':'اختر التعبير الطبيعي:','correct phrase':'اختر العبارة الصحيحة:','correct word':'اختر الكلمة الصحيحة:','best word':'اختر الكلمة الأنسب:','correct spelling':'اختر التهجئة الصحيحة:','correct form':'اختر الصيغة الصحيحة:','word':'اختر الكلمة:'})[templateMatch[1].toLowerCase()]+(templateMatch[2]?' '+templateMatch[2].replace(/[“”]/g,'"'):'') ,exact:!templateMatch[2]};
    templateMatch=source.match(/^Which verb fits\??$/i);
    if(templateMatch)return {text:'أي فعل يناسب؟',exact:true};
    let m=source.match(/^What does\s+[“"']?(.+?)[”"']?\s+mean\??$/i);
    if(m)return {text:'ما معنى كلمة «'+m[1].replace(/[“”"']/g,'')+'»؟',exact:true};
    m=source.match(/^Which word means\s+[“"']?(.+?)[”"']?\??$/i);
    if(m)return {text:'أي كلمة تعني «'+translateKnownPhrase(m[1].replace(/[“”"']/g,''))+'»؟',exact:true};
    templateMatch=source.match(/^A\s+[“"']?(.+?)[”"']?\s+is someone who(?:…|\.{3})?$/i);
    if(templateMatch)return {text:'الـ«'+templateMatch[1].replace(/[“”"']/g,'')+'» هو شخص…',exact:true};
    templateMatch=source.match(/^A\s+[“"']?(.+?)[”"']?\s+is(?:…|\.{3})?$/i);
    if(templateMatch)return {text:'ما المقصود بـ «'+templateMatch[1].replace(/[“”"']/g,'')+'»؟',exact:true};
    templateMatch=source.match(/^If someone is\s+[“"']?(.+?)[”"']?,?\s+they(?:…|\.{3})?$/i);
    if(templateMatch)return {text:'إذا كان الشخص «'+templateMatch[1].replace(/[“”"']/g,'')+'»، فهو…',exact:true};
    templateMatch=source.match(/^If a (?:description|message|claim|argument|conclusion|plan|reason|influence|account|assessment|review|apology|improvement)\s+is\s+[“"']?(.+?)[”"']?,?\s+(?:it|they)(?:…|\.{3})?$/i);
    if(templateMatch)return {text:'إذا كان الوصف أو الشيء المقصود «'+templateMatch[1].replace(/[“”"']/g,'')+'»، فهذا يعني أنه…',exact:true};
    templateMatch=source.match(/^To\s+[“"']?(.+?)[”"']?\s+(?:a problem|a risk|an allegation|a point|two accounts)\s+is to(?:…|\.{3})?$/i);
    if(templateMatch)return {text:'يعني «'+templateMatch[1].replace(/[“”"']/g,'')+'» '+({'mitigate':'تخفيف','substantiate':'تدعيم بالأدلة','obfuscate':'تعقيد أو إخفاء','reconcile':'التوفيق بين'}[templateMatch[1].replace(/[“”"']/g,'').toLowerCase()]||'التعامل مع')+' الأمر…',exact:true};
    templateMatch=source.match(/^What does\s+[“"']?(.+?)[”"']?\s+(refer to|suggest|express)\??$/i);
    if(templateMatch)return {text:({'refer to':'إلى ماذا تشير عبارة','suggest':'ماذا توحي به عبارة','express':'ماذا تعبّر عنه عبارة'})[templateMatch[2].toLowerCase()]+' «'+templateMatch[1].replace(/[“”"']/g,'')+'»؟',exact:true};
    templateMatch=source.match(/^What happens when\s+(.+?)\??$/i);
    if(templateMatch)return {text:'ماذا يحدث عندما '+templateMatch[1]+'؟',exact:false};
    templateMatch=source.match(/^What should you do(?: in this situation)?\??$/i);
    if(templateMatch)return {text:'ماذا ينبغي أن تفعل؟',exact:true};
    templateMatch=source.match(/^What happens next\??$/i);
    if(templateMatch)return {text:'ماذا يحدث بعد ذلك؟',exact:true};
    templateMatch=source.match(/^What is the main idea\??$/i);
    if(templateMatch)return {text:'ما الفكرة الرئيسية؟',exact:true};
    templateMatch=source.match(/^Choose the (natural phrase|best word|correct word|best response|correct answer|best answer|best option):\s*(.+)$/i);
    if(templateMatch)return {text:({'natural phrase':'اختر التعبير الطبيعي:','best word':'اختر الكلمة الأنسب:','correct word':'اختر الكلمة الصحيحة:','best response':'اختر أفضل رد:','correct answer':'اختر الإجابة الصحيحة:','best answer':'اختر أفضل إجابة:','best option':'اختر الخيار الأنسب:'})[templateMatch[1].toLowerCase()]+' '+templateMatch[2],exact:false};
    const translated=translateKnownPhrase(source);
    const unavailable={text:'لم تتوفر ترجمة موثوقة لهذا النص بعد. يمكنك متابعة النص بالإنجليزية أو تجربة سؤال آخر.',exact:false,unavailable:true};
    const untranslated=(translated.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[]);
    if(untranslated.length)return unavailable;
    const tokens=source.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[];
    const unknown=tokens.filter(token=>!AR_TRANSLATION_WORDS[token.toLowerCase()]&&!(typeof STORY_WORDS_AR!=='undefined'&&STORY_WORDS_AR[token.toLowerCase()])&&!(typeof W_AR!=='undefined'&&W_AR[token.toLowerCase()]));
    if(tokens.length>0&&unknown.length/tokens.length>0.3)return unavailable;
    // Word-by-word substitution is not a reliable sentence translation. Keep long,
    // unrecognised sentences in English rather than showing misleading Arabic.
    if(tokens.length>3)return unavailable;
    return {text:translated,exact:false};
  }
  let translationControlId=0;
  function addTranslationControl(target,kind) {
    if(!target||target.dataset.translationEnhanced==='1')return;
    target.dataset.translationEnhanced='1';
    if(!target.id)target.id='translation-source-'+(++translationControlId);
    const output=document.createElement('div');output.className='translation-result';output.hidden=true;output.id=target.id+'-arabic';output.lang='ar';output.dir='rtl';
    const button=document.createElement('button');button.type='button';button.className='translate-btn';button.dataset.translateTarget=target.id;button.setAttribute('aria-expanded','false');const label=kind==='answer'?'الإجابة':target.closest('.sheet')?'التفسير':target.classList.contains('q-sub')?'التوجيه':target.classList.contains('mg-route')?'التعليمات':target.classList.contains('spot-text')?'النص':target.classList.contains('typing-prompt')?'الجملة':'السؤال';button.dataset.translationLabel=label;button.innerHTML='<span aria-hidden="true">ع</span> ترجمة '+label;button.hidden=!state.translationEnabled;
    if(kind==='answer'&&!target.classList.contains('story-decision-option')){const row=document.createElement('div');const mini=target.classList.contains('mg-card')||target.classList.contains('mg-tile');row.className='answer-translation-row'+(mini?' mini-answer-translation-row':'');target.parentNode.insertBefore(row,target);row.appendChild(target);row.appendChild(button);row.appendChild(output);}
    else if(target.classList.contains('story-decision-option')){const row=document.createElement('div');row.className='story-option-translation-row';target.parentNode.insertBefore(row,target);row.appendChild(target);row.appendChild(button);row.appendChild(output);}
    else{target.insertAdjacentElement('afterend',button);button.insertAdjacentElement('afterend',output);}
  }
  function enhanceTranslationControls(root) {
    if(!root||!state.translationEnabled)return;
    root.querySelectorAll('.q-text,.q-sub,.typing-prompt,.spot-text,.mg-route,.answer,.mg-card,.mg-tile,.question-text,.prompt-text,.instruction-text,.story-prompt,.story-response,.story-option,.story-decision-option,.story-text,.story-reader-title,.story-help-note,.story-pronunciation,.story-example,.world-instruction,.world-dialogue,.wotd-definition,.aha-note,.sheet p:not(.arabic),.sheet h3').forEach(el=>{
      // Story/World/WOTD elements are included only through explicit semantic selectors above.
      if(el.classList.contains('mg-route')&&el.nextElementSibling&&el.nextElementSibling.classList.contains('mg-route-ar'))return;
      addTranslationControl(el,(el.classList.contains('answer')||el.classList.contains('mg-card')||el.classList.contains('mg-tile')||el.classList.contains('story-decision-option'))?'answer':'question');
    });
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-translate-target]');if(!button)return;
    e.preventDefault();e.stopPropagation();
    const target=document.getElementById(button.dataset.translateTarget),output=document.getElementById(button.dataset.translateTarget+'-arabic');if(!target||!output)return;
    if(output.hidden){if(target.classList.contains('answer')&&typeof G!=='undefined'&&G&&G.type==='spelling'){output.textContent='في تحدّي التهجئة، الخيارات تهجئات مختلفة للكلمة نفسها؛ ركّز على ترتيب الحروف. نعرض هذه الملاحظة بدل ترجمة قد تكشف الخيار الصحيح.';output.classList.remove('translation-approximate');output.title='مساعدة تحافظ على عدالة سؤال التهجئة';output.hidden=false;button.setAttribute('aria-expanded','true');button.innerHTML='<span aria-hidden="true">ع</span> إخفاء الترجمة';return;}const answerText=target.querySelector(':scope > span:not(.key)');const cardText=target.querySelector(':scope > span');const storyChoiceText=target.classList.contains('story-decision-option')?[...target.children].find(el=>!el.classList.contains('story-decision-letter')&&!el.classList.contains('story-option-ar')):null;const sourceText=target.classList.contains('story-decision-option')?(storyChoiceText||target).textContent:(target.classList.contains('answer')||target.classList.contains('mg-card')||target.classList.contains('mg-tile'))?(answerText||cardText||target).textContent:target.textContent;const result=translateToArabic(sourceText);output.textContent=result.text;output.classList.toggle('translation-approximate',!result.exact&&!result.unavailable);output.title=result.exact?'ترجمة محلية':result.unavailable?'لا توجد ترجمة موثوقة لهذا النص بعد':'ترجمة مساعدة محلية؛ قد تبقى بعض الكلمات الإنجليزية دون ترجمة';output.hidden=false;button.setAttribute('aria-expanded','true');button.innerHTML='<span aria-hidden="true">ع</span> إخفاء الترجمة';}
    else{output.hidden=true;button.setAttribute('aria-expanded','false');button.innerHTML='<span aria-hidden="true">ع</span> ترجمة '+(button.dataset.translationLabel|| (target.classList.contains('answer')?'الإجابة':'السؤال'));}
  });
  const translationObserver=new MutationObserver(()=>{enhanceTranslationControls($('#game-body'));enhanceTranslationControls($('#world-game'));});
  if($('#game-body'))translationObserver.observe($('#game-body'),{childList:true,subtree:true});
  if($('#world-game'))translationObserver.observe($('#world-game'),{childList:true,subtree:true});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-translate-world]');if(!b||!WORLD||!state.translationEnabled)return;
    const output=$('#world-translation'),task=worldTask();if(!output||!task)return;
    if(output.hidden){const result=task.ar?{text:task.ar,exact:true}:translateToArabic(task.instruction);output.textContent=result.text;output.hidden=false;output.classList.toggle('translation-approximate',!result.exact);b.setAttribute('aria-expanded','true');b.textContent='ع إخفاء الترجمة';}
    else{output.hidden=true;b.setAttribute('aria-expanded','false');b.textContent='ع ترجمة التعليمات';}
  });

  /* ---------- settings: Arabic help + sound ---------- */
  function syncSettings() {
    document.body.classList.toggle('translation-off', !state.translationEnabled);
    if(state.translationEnabled){enhanceTranslationControls($('#game-body'));enhanceTranslationControls($('#world-game'));enhanceTranslationControls($('#sheet'));}
    const translationToggle = $('#translation-toggle');
    if (translationToggle) { translationToggle.setAttribute('aria-pressed', String(!!state.translationEnabled)); const label=translationToggle.querySelector('span'); if(label) label.textContent = state.translationEnabled ? 'Arabic translation: On' : 'Arabic translation: Off'; }
    document.body.classList.toggle('ar-on', !!state.helpArabic);
    document.documentElement.dir = state.helpArabic ? 'rtl' : 'ltr';
    document.body.dir = state.helpArabic ? 'rtl' : 'ltr';
    $$('#ar-toggle, #game-ar').forEach(b => b.setAttribute('aria-pressed', String(!!state.helpArabic)));
    const s = $('#sound-toggle');
    s.setAttribute('aria-pressed', String(!!state.sound));
    s.setAttribute('aria-label', state.sound ? 'Turn sound effects off' : 'Turn sound effects on');
    s.title = state.sound ? 'Sound effects on' : 'Sound effects off';
    s.innerHTML = ic(state.sound ? 'sound' : 'mute');
    const dark = state.theme === 'dark';
    document.body.dataset.theme = dark ? 'dark' : 'light';
    const theme = $('#theme-toggle');
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', dark ? 'Turn off dark mode' : 'Turn on dark mode');
    theme.title = dark ? 'Light mode' : 'Dark mode';
    theme.innerHTML = dark ? '☼ <span>Light mode</span>' : '◐ <span>Dark mode</span>';
    const meta = $('#theme-color-meta');
    if (meta) meta.content = dark ? '#111522' : '#F5F6FC';
  }
  function toggleArabic() {
    state.helpArabic = !state.helpArabic; save(); syncSettings();
    if (G) { if (G.answered) setSheetSpace(); } else toast(state.helpArabic ? 'Arabic help is on' : 'Arabic help is off');
  }
  // Capture the theme action before the settings popover closes.
  document.addEventListener('submit', e => {
    if(e.target && e.target.matches('[data-word-dictation]')){
      e.preventDefault();
      const form=e.target, word=form.dataset.wordDictation, item=state.review.find(w=>w.word===word), input=form.querySelector('[name="typedWord"]');
      if(!item||!input)return;
      item.attempts=(item.attempts||0)+1;
      if(input.value.trim().toLowerCase()===item.word.toLowerCase()){
        item.exerciseStage=3;save();renderWords();toast('Correct spelling! Now use the word in your own sentence.');
      }else{
        item.errors=(Number(item.errors)||0)+1;item.box=1;item.interval=0;item.streak=0;item.exerciseStage=0;item.mastered=false;item.due=dayKey();
        save();renderWords();toast('Not quite. The word returned to Box 1 for extra practice.');
      }
      return;
    }
    if(e.target && e.target.matches('[data-grammar-own-form]')){e.preventDefault();const txt=e.target.elements.ownSentence.value.trim(),tokens=txt.split(/\s+/).filter(Boolean);if(tokens.length<6||!/[.!?]$/.test(txt)){toast('Write at least six words and finish with punctuation before reviewing your sentence.');return;}showSheet(true,'<h3>Review your sentence</h3><p>Your sentence has '+tokens.length+' words. Length and punctuation alone cannot prove that its grammar is correct.</p><p>Model sentence: <b>'+esc(G.questions[G.i].q.q.replace(/_{3,}/,G.questions[G.i].q.answers[G.questions[G.i].q.correct]))+'</b></p><p>'+esc(G.questions[G.i].q.explain)+'</p><div class="sheet-actions"><button class="btn" data-own-rating="yes">I used the rule correctly</button><button class="btn btn-ghost" data-own-rating="no">I need more practice</button></div>');return;}
    if(e.target && e.target.id==='typing-form'){e.preventDefault();checkTyping();return;}
    if(e.target && e.target.id==='create-story-form'){e.preventDefault();createStorySubmit(e.target);return;}
    if(e.target && e.target.id==='create-writer-form'){e.preventDefault();startGuidedStory(e.target);return;}
    if(e.target && e.target.id==='create-story-answer-form'){e.preventDefault();submitCreateStoryAnswer(e.target);return;}
  });
  document.addEventListener('change', e => {
    const storyFilter=e.target.closest('#story-level-filter,#story-length-filter,#story-status-filter');
    if(!storyFilter)return;
    if(storyFilter.id==='story-level-filter')STORY_FILTER.level=storyFilter.value;
    else if(storyFilter.id==='story-length-filter')STORY_FILTER.length=storyFilter.value;
    else STORY_FILTER.status=storyFilter.value;
    renderStories();
  });
  document.addEventListener('input', e => {
    if(e.target&&e.target.id==='story-search-input'){STORY_FILTER.query=e.target.value;if(STORY_FILTER.query.trim()&&STORY_FILTER.level!=='all'){STORY_FILTER.level='all';renderStories();const si=$('#story-search-input');if(si){si.focus();const n=si.value.length;try{si.setSelectionRange(n,n);}catch{}}return;}const q=STORY_FILTER.query.trim().toLowerCase();let count=0;$$('.story-card').forEach(card=>{const match=(card.textContent||'').toLowerCase().includes(q);card.hidden=!match;if(match)count++;});$$('.story-level,.story-season,.story-feature-section').forEach(section=>{section.hidden=!section.querySelector('.story-card:not([hidden])');});const out=$('#story-results-count');if(out)out.textContent=count+' stories found';}
  });
  document.addEventListener('click', e => {
    if (MG && miniClick(e)) return;
    if(e.target.closest('[data-story-reset-filters]')){STORY_FILTER={...STORY_FILTER,query:'',level:'all',length:'all',status:'all'};renderStories();return;}
    const storyMode=e.target.closest('[data-story-mode]');if(storyMode){STORY_MODE=storyMode.dataset.storyMode;renderStories();return;}
    const storyLevelTab=e.target.closest('[data-story-level-tab]');if(storyLevelTab){STORY_FILTER.level=storyLevelTab.dataset.storyLevelTab;renderStories();return;}

    if(e.target.closest('#create-story-start-writing')){startGuidedStory($('#create-story-form'));return;}
    if(e.target.closest('#writer-back')){CREATE_STORY.mode='setup';renderCreateStory();return;}
    const writerWord=e.target.closest('[data-writer-word]');if(writerWord){const word=writerWord.dataset.writerWord,field=$('[data-writer-part="'+(CREATE_STORY.lastPart||'opening')+'"]');if(field){const start=field.selectionStart,end=field.selectionEnd,insert=(start!==end?field.value.slice(0,start)+' '+word+' '+field.value.slice(end):field.value+(field.value.trim()?' ':'')+word);field.value=insert;field.focus();field.setSelectionRange(insert.length,insert.length);updateWriterFeedback();}return;}
    const writerPiece=e.target.closest('[data-writer-piece]');if(writerPiece){const field=$('[data-writer-part="'+(CREATE_STORY.lastPart||'opening')+'"]');if(field){field.value+=(field.value.trim()?' ':'')+writerPiece.dataset.writerPiece+' ';field.focus();updateWriterFeedback();}return;}
    const writerUpgrade=e.target.closest('[data-writer-upgrade]');if(writerUpgrade){const from=writerUpgrade.dataset.writerUpgrade,options=writerUpgrade.dataset.writerOptions.split('|'),field=$('[data-writer-part="'+(CREATE_STORY.lastPart||'opening')+'"]');if(!field){toast('Choose a sentence first, then try a richer word.');return;}const re=new RegExp('\\\\b'+from+'\\\\b','i');if(!re.test(field.value)){toast('Use “'+from+'” in one of your sentences first.');return;}const original=field.value;field.value=field.value.replace(re,options[0]);CREATE_STORY.lastRevision={before:original,after:field.value};field.focus();updateWriterFeedback();toast('Try “'+options[0]+'” — compare the original and improved text below.');return;}
    if(e.target.closest('#writer-three-words')){const level=CREATE_STORY.writerLevel||currentLevel().id,topicPools={mystery:['clue','evidence','suspect','notice','investigate','missing','carefully','discover','hidden','solve'],adventure:['compass','trail','explore','journey','brave','survive','distant','suddenly','rescue','discover'],everyday:['receipt','budget','change','borrow','return','polite','explain','carefully','promise','solve'],nature:['shelter','storm','branch','wildlife','protect','quietly','observe','discover','survive','fresh'],communication:['apology','explain','misunderstanding','honest','promise','listen','kindly','forgive','respect','reply'],technology:['battery','charge','device','repair','power','connect','carefully','signal','switch','test'],investigation:['evidence','witness','clue','inspect','compare','suspect','honest','record','confirm','solve']};const levelPools={'A1':['help','look','find','small','happy','go','see','safe','friend','home'],'A2':['notice','decide','carefully','suddenly','search','promise','worried','return','explain','quietly'],'B1':['investigate','discover','relieved','mysterious','evidence','consider','although','realise','solution','respond'],'B2':['consequence','hesitate','persuade','reliable','eventually','recognise','determine','despite','approach','resolve'],'C1':['uncover','uncertain','subtle','confront','significant','conclude','interpret','reluctant','convincing','complicated']};const pool=[...(topicPools[CREATE_STORY.topic]||topicPools.mystery),...(levelPools[level]||levelPools.A1)];CREATE_STORY.challengeWords=[];while(CREATE_STORY.challengeWords.length<3){const w=pool[Math.floor(Math.random()*pool.length)];if(!CREATE_STORY.challengeWords.includes(w))CREATE_STORY.challengeWords.push(w);}toast('New challenge: '+CREATE_STORY.challengeWords.join(' · '));renderCreateStory();return;}
    if(e.target.closest('#writer-finish')){finishGuidedStory();return;}
    if(e.target.closest('#writer-edit')){CREATE_STORY.mode='writer';renderCreateStory();return;}
    if(e.target.closest('#writer-read-aloud')){const text=(CREATE_STORY.publishedPages||[]).join(' ');if(!('speechSynthesis'in window)){toast('Speech is not available in this browser.');return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.88;window.speechSynthesis.speak(u);return;}
    if(e.target.closest('#writer-save-story')){saveCreatedStory();return;}
    if(e.target.closest('#writer-cloud-save')){saveCreatedStoryToAccount('private');return;}
    if(e.target.closest('#writer-publish-story')){if(window.confirm('Publish this story so other signed-in learners can read it?'))saveCreatedStoryToAccount('public');return;}
    if(e.target.closest('#writer-load-cloud-library')){loadMyCloudStoryLibrary();return;}
    const cloudStoryPick=e.target.closest('[data-open-cloud-story]');if(cloudStoryPick){const story=(window.__epiphanyMyCloudStories||{})[cloudStoryPick.dataset.openCloudStory];if(story){CREATE_STORY.publishedPages=Array.isArray(story.pages)?story.pages:[];CREATE_STORY.drafts={opening:story.pages?.[0]||'',problem:story.pages?.[1]||'',attempt:story.pages?.[2]||'',climax:story.pages?.[3]||'',ending:story.pages?.[4]||''};CREATE_STORY.cloudStoryId=story.id;CREATE_STORY.savedTitle=story.title;CREATE_STORY.genreLabel=story.genre;CREATE_STORY.writerLevel=story.level;CREATE_STORY.mode='published';renderCreateStory();}return;}
    if(e.target.closest('#writer-load-community')){loadCommunityStoryExchange();return;}
    const exchangePick=e.target.closest('[data-exchange-story]');if(exchangePick){const source=(window.__epiphanyCommunityStories||{})[exchangePick.dataset.exchangeStory];if(source){CREATE_STORY.exchangeStory=source;CREATE_STORY.exchangeText='';CREATE_STORY.mode='exchange';renderCreateStory();}return;}
    if(e.target.closest('#writer-exchange-back')){CREATE_STORY.mode='published';renderCreateStory();return;}
    if(e.target.closest('#writer-save-exchange')){saveStoryExchange('private');return;}
    if(e.target.closest('#writer-publish-exchange')){if(window.confirm('Share this continuation with the community?'))saveStoryExchange('public');return;}
    if(e.target.closest('#writer-new-story')){CREATE_STORY={topic:'mystery',mode:'setup',story:null,answer:'',name:'Robin',friend:'Maya',time:'today',place:'a small town',problem:'lost',drafts:{},challengeWords:[]};renderCreateStory();return;}
    if(e.target.closest('#writer-hidden-word')){CREATE_STORY.mode='setup';renderCreateStory();return;}
    const createHint=e.target.closest('[data-create-hint]');if(createHint&&CREATE_STORY.mode==='story'){CREATE_STORY.hintLevel=Math.min(3,(CREATE_STORY.hintLevel||0)+1);renderCreateStory();return;}
    const createRate=e.target.closest('[data-create-rate]');if(createRate&&CREATE_STORY.mode==='feedback'){CREATE_STORY.selfRate=createRate.dataset.createRate;renderCreateStory();return;}
    if(e.target.closest('[data-create-next]')){CREATE_STORY={...CREATE_STORY,mode:'setup',story:null,answer:'',selfRate:null};renderCreateStory();return;}
    const so=e.target.closest('[data-story-open]');if(so){startStory(so.dataset.storyOpen);return;}
    const sa=e.target.closest('[data-story-answer]');if(sa){answerStoryQuestion(Number(sa.dataset.storyAnswer));return;}
    const sd=e.target.closest('[data-story-decision]');if(sd){answerStoryDecision(Number(sd.dataset.storyDecision));return;}
    if(e.target.closest('#story-decision-next')&&ST&&ST.mode==='decision-feedback'){hideSheet();$('#sheet').classList.remove('story-choice-sheet');ST.mode='read';ST.page=ST.decisionResumePage;renderStoryPage();return;}
    const sw=e.target.closest('[data-story-word]');if(sw&&ST&&ST.mode==='read'){openStoryWord(sw.dataset.storyWord,sw.dataset.storyDisplay);return;}
    const setting=e.target.closest('[data-story-setting]');if(setting&&ST){const prefs=state.storyReaderSettings||(state.storyReaderSettings={fontScale:1,lineSpacing:1.75,nightMode:false});const key=setting.dataset.storySetting;if(key==='font-up')prefs.fontScale=Math.min(1.35,Math.round((prefs.fontScale+0.1)*100)/100);if(key==='font-down')prefs.fontScale=Math.max(0.85,Math.round((prefs.fontScale-0.1)*100)/100);if(key==='line-up')prefs.lineSpacing=Math.min(2.25,Math.round((prefs.lineSpacing+0.1)*100)/100);if(key==='line-down')prefs.lineSpacing=Math.max(1.45,Math.round((prefs.lineSpacing-0.1)*100)/100);if(key==='night')prefs.nightMode=!prefs.nightMode;save();renderStoryPage();return;}
    const act=e.target.closest('[data-story-action]');
    const speed=e.target.closest('[data-story-rate]');if(speed&&ST){const draft=$('#story-dictation-answer');if(draft&&ST.dictationActive)ST.dictationAnswer=draft.value;ST.audioRate=Number(speed.dataset.storyRate);renderStoryPage();return;}if(act&&ST){const action=act.dataset.storyAction;if(action==='next'){persistStoryReaderProgress();storyNext();return;}if(action==='prev'&&ST.page>0){ST.page--;ST.textHidden=false;ST.dictationActive=false;ST.dictationChecked=false;persistStoryReaderProgress();renderStoryPage();return;}if(action==='listen-page'){speakStoryPage();return;}if(action==='toggle-text'){ST.textHidden=!ST.textHidden;ST.dictationActive=false;renderStoryPage();return;}if(action==='dictation'){ST.dictationActive=!ST.dictationActive;ST.textHidden=ST.dictationActive;ST.dictationChecked=false;ST.dictationAnswer='';renderStoryPage();if(ST.dictationActive)speakStoryPage();return;}if(action==='comprehension'){ST.comprehensionOnly=true;ST.textHidden=true;ST.dictationActive=false;ST.mode='quiz';ST.qi=0;ST.score=0;ST.results=[];ST.answered=false;try{window.speechSynthesis?.cancel();}catch{}renderStoryQuestion();return;}if(action==='listen-word'){speak(act.dataset.value);return;}if(action==='save-word'){saveStoryWord(act.dataset.value,act.dataset.meaning);openStoryWord(act.dataset.value,act.dataset.value);return;}if(action==='close-word'){const card=$('#story-word-card');if(card)card.hidden=true;return;}if(action==='back-reading'){ST.mode='read';ST.comprehensionOnly=false;ST.page=ST.story.pages.length-1;hideSheet();renderStoryPage();return;}if(action==='another'){const old=ST.story.id;ST=null;const next=STORIES.find(s=>s.id!==old&&storyLevelIndex(s.level)<=storyLevelIndex(currentLevel().id));startStory((next||STORIES[0]).id);return;}if(action==='words'){ST=null;closeGame();openView('words');return;}if(action==='close'){ST=null;closeGame();openView('stories');return;}}
    if(ST&&ST.mode==='quiz'&&e.target.closest('#go-next')){hideSheet();if(ST.qi<2){ST.qi++;ST.answered=false;renderStoryQuestion();}else finishStory();return;}
    if(e.target.closest('#wotd-save')){const box=$('#wotd-card'),w=WOTD_WORDS.find(x=>x.word===box.dataset.word);if(w&&!state.words.some(x=>String(x[0]).toLowerCase()===w.word.toLowerCase())){state.words.push([w.word,w.meaning,w.level]);recordLearningActivity({words:1});addReview([w.word,w.meaning,w.level],w.meaning);save();renderAll();toast('Word saved to your vault and daily review.');}return;}
    const themeButton = e.target.closest('#theme-toggle');
    if (!themeButton) return;
    e.preventDefault();
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = state.theme;
    save();
    syncSettings();
  }, true);

  function exportProgress() {
    const backup = {app:'Epiphany', formatVersion:1, exportedAt:new Date().toISOString(), progress:state};
    const blob = new Blob([JSON.stringify(backup,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'epiphany-progress-' + dayKey() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('Progress backup exported. Keep the file somewhere safe.');
  }
  $('#export-progress').addEventListener('click', exportProgress);
  $('#import-progress').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('This backup file is too large.');
      const parsed = JSON.parse(await file.text());
      const incoming = parsed && parsed.app === 'Epiphany' && parsed.formatVersion === 1 ? parsed.progress : null;
      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming) ||
          !Number.isFinite(incoming.xp) || incoming.xp < 0 ||
          !Array.isArray(incoming.words) || !Array.isArray(incoming.review) ||
          !Number.isFinite(incoming.quests) || incoming.quests < 0) {
        throw new Error('This does not look like a valid Epiphany progress backup.');
      }
      const merged = {...defaults(), ...incoming};
      if (!Array.isArray(merged.completed) || !Number.isFinite(merged.streakFreezes)) throw new Error('The backup data is incomplete.');
      if (!confirm('Import this backup and replace the progress saved on this device? Export your current progress first if you want to keep it.')) return;
      state = merged;
      save();
      toast('Backup imported. Reloading your progress…');
      window.setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast(err && err.message ? err.message : 'Could not import this backup file.');
    } finally {
      e.target.value = '';
    }
  });

  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    $('#install-app').hidden = false;
  });
  $('#install-app').addEventListener('click', async () => {
    if (!installPrompt) { toast('Use your browser menu and choose “Install app” or “Add to Home Screen”.'); return; }
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $('#install-app').hidden = true;
  });
  window.addEventListener('appinstalled', () => {
    $('#install-app').hidden = true;
    toast('Epiphany was installed successfully.');
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {
      toast('Offline mode could not be enabled in this browser.');
    }));
  }

  $('#ar-toggle').addEventListener('click', toggleArabic);
  $('#game-ar').addEventListener('click', toggleArabic);
  const translationToggle = $('#translation-toggle');
  if (translationToggle) translationToggle.addEventListener('click', () => { state.translationEnabled = !state.translationEnabled; save(); syncSettings(); enhanceTranslationControls($('#game-body')); document.querySelectorAll('.translate-btn').forEach(b => { b.hidden = !state.translationEnabled; }); document.querySelectorAll('.translation-result').forEach(el => { if (!state.translationEnabled) el.hidden = true; }); toast(state.translationEnabled ? 'Arabic translation is on' : 'Arabic translation is off'); });
  $('#sound-toggle').addEventListener('click', () => {
    state.sound = !state.sound; save(); syncSettings();
    toast(state.sound ? 'Sound is on' : 'Sound is off');
    if (state.sound) sfx('ok');
  });

  let ac;
  function tone(f, t, d, type, v) {
    const o = ac.createOscillator(), g = ac.createGain(), at = ac.currentTime + t;
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(v || 0.12, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    o.connect(g); g.connect(ac.destination); o.start(at); o.stop(at + d + 0.05);
  }
  function epiphanyHaptic(kind) {
    if (!navigator.vibrate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try { navigator.vibrate(kind === 'ok' ? 18 : kind === 'no' ? [22, 35, 22] : 10); } catch {}
  }
  function sfx(kind) {
    epiphanyHaptic(kind);

    if (!state.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const seq = {ok:[[659, 0, .12], [880, .1, .22]], no:[[262, 0, .18, 'triangle'], [196, .15, .24, 'triangle']],
        done:[[523, 0, .14], [659, .12, .14], [784, .24, .14], [1047, .36, .34]]}[kind];
      seq.forEach(a => tone(a[0], a[1], a[2], a[3]));
    } catch { /* audio is optional */ }
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- quest ---------- */
  let G = null;
  const guidance = {
    vocabulary:'اختر المعنى الأقرب للكلمة أو العبارة الإنجليزية.',
    grammar:'اختر الصيغة التي تجعل الجملة صحيحة وطبيعية.',
    story:'تخيّل أنك في هذا الموقف الحقيقي واختر الرد الأنسب والأكثر تهذيبًا.',
    listening:'اقرأ الرسالة بعناية وابحث عن معناها أو المعلومة الأساسية.',
    spelling:'اختر الكلمة المكتوبة بطريقة صحيحة.',
    advanced:'ركّز على الفروق الدقيقة في المعنى والمنطق بين الخيارات.',
    typing:'اكتب الكلمة الناقصة بنفسك، واستفد من التلميح دون خيارات جاهزة.',
    spot:'اضغط على الكلمة الوحيدة الخاطئة في النص القصير.'
  };
  Object.assign(STORY_WORDS_AR,{
    ability:'قدرة',affecting:'يؤثر في',afterward:'بعد ذلك',amina:'أمينة',anonymously:'دون الكشف عن الهوية',approached:'اقترب',approval:'موافقة',became:'أصبح',becoming:'يصبح / يتحول إلى',began:'بدأ',blunt:'صريح بحدة',box:'صندوق',busiest:'الأكثر ازدحاماً',calmer:'أكثر هدوءاً',can:'يستطيع',cannot:'لا يستطيع',changed:'تغيّر',checked:'تحقّق من',choices:'خيارات',coach:'مدرّب',coat:'معطف',comments:'تعليقات',concern:'قلق / أمر مهم',confirmed:'أكّد',conversations:'محادثات',corner:'زاوية',counter:'منضدة',daniel:'دانيال',decided:'قرّر',decision:'قرار',defensive:'دفاعي',define:'يعرّف',delivered:'سلّم / أوصل',did:'فعل / أداة للماضي',difficult:'صعب',disaster:'كارثة',earlier:'سابقاً',event:'حدث',experience:'تجربة / خبرة',feedback:'ملاحظات للتطوير',few:'قليل',floor:'أرضية / طابق',flourish:'يزدهر',front:'الأمام',gradually:'تدريجياً',had:'كان لديه',hidden:'مخفي',him:'إياه / له',holding:'يمسك',imposing:'مهيب / مخيف',instrument:'أداة / جهاز',invited:'دعا',jumped:'قفز',learned:'تعلّم',leo:'ليو',listeners:'مستمعون',made:'صنع / جعل',measurements:'قياسات',mia:'ميا',mistake:'خطأ',neighbourhood:'حيّ',nevertheless:'مع ذلك',next:'التالي',noticed:'لاحظ',pause:'توقف مؤقت',performance:'أداء',picks:'يلتقط / يختار',place:'مكان',pointed:'أشار',practised:'تدرّب',praised:'مدح',preparing:'يحضّر',process:'عملية',pulled:'سحب',rafi:'رافي',rather:'بدلاً من / نوعاً ما',recording:'تسجيل',refused:'رفض',reminded:'ذكّر',replacing:'استبدال',required:'مطلوب / ضروري',result:'نتيجة',reviewed:'راجع',river:'نهر',road:'طريق',routine:'روتين',rug:'سجادة',rules:'قواعد',saturday:'يوم السبت',sealed:'محكم الإغلاق',seconds:'ثوانٍ',several:'عدة',six:'ستة',speech:'خطاب',spent:'قضى / أنفق',stable:'مستقر',stopped:'توقف',sugar:'سكر',suggested:'اقترح',teacher:'معلّم',test:'اختبار',testing:'اختبار / فحص',than:'من (للمقارنة)',through:'عبر / خلال',tired:'متعب',together:'معاً',toward:'باتجاه',track:'مسار / يتتبّع',treating:'يعامل / يعالج',turned:'استدار / أصبح',turning:'الاستدارة / يتحوّل',useful:'مفيد',whenever:'كلما / في أي وقت',whether:'ما إذا',win:'يفوز',window:'نافذة',woke:'استيقظ',wrong:'خاطئ',yet:'حتى الآن / ومع ذلك'
  });

  function lockPage(on) {
    ['.top', 'main', '.dock'].forEach(s => { const el = $(s); if (el) el.inert = on; });
    document.body.classList.toggle('no-scroll', on);
  }

  function todayForChallenge(date = new Date()) { return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, '0'), String(date.getUTCDate()).padStart(2, '0')].join('-'); }
  function dailyChallengeNumber(date = new Date()) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 1);
    return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000) + 1;
  }
  function stableHash(value) { let h = 2166136261; for (const ch of String(value)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function startDailyChallenge() {
    const today = todayForChallenge();
    if (state.dailyChallengeDate === today && state.dailyChallengeResult) { toast('You have completed today’s Daily Challenge. Come back tomorrow!'); return; }
    const eligible = ORDER.filter(type => GAMES[type] && (GAMES[type].questions || []).filter(q => Number.isInteger(q.correct) && q.answers && q.answers.length > 1).length >= 5);
    if (!eligible.length) { toast('Daily Challenge is not available right now.'); return; }
    startGame(eligible[stableHash('epiphany-game-' + today) % eligible.length], 'daily');
  }
  function startOneLife() { const type = pickNext(); startGame(GAMES[type] ? type : 'vocabulary', 'oneLife'); }

  function startGame(type, challengeMode = '') {
    if (MINI[type]) { startMini(type); return; }
    const game = GAMES[type]; if (!game) return;
    const level = currentLevel().id;
    const levelIds = LEVELS.map(l => l.id);
    const currentIndex = Math.max(0, levelIds.indexOf(level));
    const targetIndex = Math.max(0, Math.min(levelIds.length - 1, currentIndex + (challengeMode ? 0 : state.adaptiveOffset)));
    let targetLevel = levelIds[targetIndex] || level;
    let levelPool = game.questions.filter(q => q.level === targetLevel);
    // Only move to an adjacent CEFR band when the game has enough questions there.
    if (targetLevel !== level && levelPool.length < 5) {
      targetLevel = level;
      levelPool = game.questions.filter(q => q.level === level);
    }
    const generalPool = game.questions.filter(q => !q.level);
    const shuffle = list => {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
      return copy;
    };
    // Use five questions from the learner's current CEFR level whenever possible.
    let selected;
    if (challengeMode === 'daily') {
      const pool = game.questions.filter(q => Number.isInteger(q.correct) && Array.isArray(q.answers) && q.answers.length > 1);
      selected = pool.slice().sort((a,b) => stableHash(todayForChallenge() + '|' + String(a.id || a.q || a.text)) - stableHash(todayForChallenge() + '|' + String(b.id || b.q || b.text))).slice(0, 5);
    } else if (['personalized','grammar','spot','typing'].includes(type) && game.questions.some(q=>q.trap&&q.id)) {
      // Keep adaptive practice at the learner's CEFR level when the bank has enough items.
      // If that level is small, widen only as much as needed instead of mixing every level by default.
      let adaptivePool = levelPool.slice();
      if (adaptivePool.length < 5) {
        const levels = LEVELS.map(l=>l.id), center = levels.indexOf(level);
        const nearby = game.questions.filter(q => !q.level || Math.abs(levels.indexOf(q.level) - center) <= 1);
        adaptivePool = nearby.length ? nearby : adaptivePool;
      }
      // Prioritise due topics and repeated errors while keeping a little variety.
      selected = shuffle(weightedGrammarPick(adaptivePool, 5));
    } else if (type === 'mistakes') {
      const levels = LEVELS.map(l=>l.id), center = levels.indexOf(level);
      let pool = game.questions.filter(q => Math.abs(levels.indexOf(q.level) - center) <= 1);
      if (pool.length < 5) pool = pool.length ? pool : levelPool;
      selected = shuffle(weightedGrammarPick(pool, 5));
    } else {
      // Never silently mix easier or harder CEFR levels into a normal round.
      // Use up to five unique questions from the player's own level only.
      selected = shuffle(levelPool).slice(0, 5);
    }
    // Avoid showing the same questions in consecutive rounds of the same game and CEFR level.
    // Keep a bounded recent history; when enough unseen questions exist, replace a repeat-heavy draw.
    const recentKey = type + ':' + level;
    const questionKey = q => String(q.id || q.q || q.text || '');
    const recentList = Array.isArray(state.recentQuestions[recentKey]) ? state.recentQuestions[recentKey] : [];
    const recentIds = new Set(recentList);
    let freshPool;
    if (['personalized','grammar','spot','typing'].includes(type)) {
      // Keep the no-repeat replacement inside the same level window as the initial draw.
      let eligible = levelPool.slice();
      if (eligible.length < 5) {
        const levels = LEVELS.map(l => l.id), center = levels.indexOf(level);
        const nearby = game.questions.filter(q => !q.level || Math.abs(levels.indexOf(q.level) - center) <= 1);
        if (nearby.length) eligible = nearby;
      }
      freshPool = eligible.filter(q => !recentIds.has(questionKey(q)));
    } else if (type === 'mistakes') {
      const levels = LEVELS.map(l => l.id), center = levels.indexOf(level);
      let pool = game.questions.filter(q => Math.abs(levels.indexOf(q.level) - center) <= 1);
      if (pool.length < 5) pool = pool.length ? pool : levelPool;
      freshPool = pool.filter(q => !recentIds.has(questionKey(q)));
    } else {
      freshPool = levelPool.filter(q => !recentIds.has(questionKey(q)));
    }
    if (challengeMode !== 'daily' && selected.some(q => recentIds.has(questionKey(q))) && freshPool.length >= selected.length) {
      selected = ['personalized','mistakes','grammar'].includes(type) && freshPool.some(q=>q.trap&&q.id) ? shuffle(weightedGrammarPick(freshPool, selected.length)) : shuffle(freshPool).slice(0, selected.length);
    }
    state.recentQuestions[recentKey] = [...recentList, ...selected.map(questionKey)].filter(Boolean).slice(-12);
    save();
    const paired = (challengeMode === 'daily' ? selected.slice() : shuffle(selected)).map(source => {
      const q = {...source, answers:[...(source.answers||[])]};
      // Randomise answer positions while keeping the answer key aligned.
      // Spot-the-mistake and typing modes use different answer semantics.
      if (challengeMode !== 'daily' && !['spot','typing'].includes(type) && Number.isInteger(q.correct) && q.answers.length > 1) {
        const correctText=q.answers[q.correct], distractors=q.answers.filter((_,i)=>i!==q.correct);
        const shuffleAnswers=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
        shuffleAnswers(distractors);
        const target=Math.floor(Math.random()*q.answers.length);
        distractors.splice(target,0,correctText);
        q.answers=distractors;q.correct=target;
      }
      return {q, ar: q.ar || 'راجع معنى الإجابة الصحيحة وحاول تذكّرها في سياق جديد.'};
    });
    G = {type, mode:challengeMode, questions: paired, i:0, score:0, words:[], answered:false, results:[], originalMode:type, adaptiveTargetLevel:targetLevel};
    const el = $('#game'); el.className = 'game t-' + META[type].tone; el.hidden = false;
    lockPage(true);
    if(type==='grammar' && !challengeMode){G.grammarMode='mcq';renderGrammarIntro();return;}
    renderQuestion();
  }

  const GRAMMAR_LESSONS=[
    {match:/present simple|goes|he, she, or it/i,title:'Present simple',rule:'Use the base verb with I/you/we/they. Add -s or -es with he/she/it.',examples:['She goes to school every day.','They go to school every day.']},
    {match:/past continuous|action in progress/i,title:'Past continuous',rule:'Use was/were + verb-ing for an action in progress at a past moment.',examples:['They were having dinner when I arrived.','I was reading when the phone rang.']},
    {match:/second conditional|if \+ past simple/i,title:'Second conditional',rule:'Use if + past simple, then would + base verb for an unreal or imagined situation.',examples:['If I had more time, I would learn Italian.','If she lived nearby, she would walk here.']},
    {match:/neither|singular here/i,title:'Neither / nor',rule:'In formal English, neither is generally treated as singular when it stands alone.',examples:['Neither answer is correct.','Neither of them is ready.']},
    {match:/future perfect|will have/i,title:'Future perfect',rule:'Use will have + past participle for an action completed before a future point.',examples:['By June, she will have finished.','They will have arrived by noon.']}
  ];
  function grammarLesson(q){const found=GRAMMAR_LESSONS.find(x=>x.match.test(q.explain+' '+q.q));if(found)return found;return {title:'Grammar focus',rule:(q.explain||'Check the grammatical pattern and the meaning of the whole sentence.').split(/[.!?]/)[0]+'.',examples:[q.q.replace(/_{3,}/g,q.answers[q.correct]),'Read the sentence aloud and notice how the form fits its meaning.']};}
  function renderGrammarMap(){
    const source=typeof MISTAKE_QUESTIONS!=='undefined'?MISTAKE_QUESTIONS:[],topics=[...new Set(source.map(q=>q.trap).filter(Boolean))],label=x=>x.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    const rows=topics.map(topic=>{const total=source.filter(q=>q.trap===topic).length,errors=Number(state.mistakeTrapErrors[topic])||0,correct=Number(state.mistakeTrapCorrect[topic])||0,attempts=errors+correct,srs=state.mistakeTrapSrs[topic]||{},due=!!srs.due&&srs.due<=dayKey(),status=attempts===0?'not-started':errors>=3&&errors>correct?'needs-practice':attempts>=5&&correct/attempts>=0.8&&Number(srs.box)>=3&&!due?'mastered':'in-progress';return {topic,label:label(topic),total,errors,correct,attempts,status,due,box:Number(srs.box)||0,accuracy:attempts?correct/attempts:0};});
    const mastered=rows.filter(x=>x.status==='mastered').length,needs=rows.filter(x=>x.status==='needs-practice').length,active=rows.filter(x=>x.status==='in-progress').length,untouched=rows.filter(x=>x.status==='not-started').length;
    const priority=rows.filter(x=>x.attempts>0&&x.status!=='mastered').sort((a,b)=>(Number(b.due)-Number(a.due))||((b.errors-b.correct*.35)-(a.errors-a.correct*.35))||a.accuracy-b.accuracy)[0];
    const recommendation=priority&&priority.due
      ? '<strong>'+esc(priority.label)+' · Review due</strong><p>This topic is ready for spaced review. A short practice now helps strengthen recall.</p>'
      : priority&&priority.errors>priority.correct
        ? '<strong>'+esc(priority.label)+'</strong><p>You have missed this pattern '+priority.errors+' time'+(priority.errors===1?'':'s')+'. A little targeted practice here may help most.</p>'
      : priority
        ? '<strong>'+esc(priority.label)+'</strong><p>Keep practising this pattern to build a more reliable result.</p>'
        : '<strong>Keep building your profile</strong><p>As you answer more grammar questions, Epiphany will spot recurring mistakes and suggest what to practise next.</p>';
    return '<section class="grammar-map"><div class="review-head"><div><p class="kicker">PERSONALISED LEARNING INSIGHT</p><h2>My grammar progress</h2></div><span class="review-count">'+topics.length+' topics tracked</span></div><p class="review-note">This overview learns from your answers and helps identify where extra practice may be useful. You do not need to select anything here.</p><div class="grammar-insight-recommendation"><span class="grammar-insight-label">SUGGESTED FOCUS</span>'+recommendation+'</div><div class="grammar-insight-stats"><div><strong>'+mastered+'</strong><span>Mastered</span></div><div><strong>'+needs+'</strong><span>Needs practice</span></div><div><strong>'+active+'</strong><span>In progress</span></div><div><strong>'+untouched+'</strong><span>Not practised</span></div></div><div class="grammar-tree">'+rows.map(item=>'<div class="grammar-node '+item.status+'"><span class="grammar-node-dot"></span><b>'+esc(item.label)+'</b><small>'+(item.due&&item.status!=='mastered'?'Review due':item.status==='not-started'?'Not practised yet':item.status==='mastered'?'Mastered':item.status==='needs-practice'?'Needs practice':'In progress')+'</small><span class="grammar-node-count">'+item.correct+' correct · '+item.errors+' errors · '+item.total+' questions in bank</span></div>').join('')+'</div></section>';
  }
  function renderGrammarIntro(){
    const q=G.questions[0].q,lesson=grammarLesson(q);$('#steps').innerHTML='';
    $('#game-body').innerHTML='<div class="grammar-intro"><div class="q-meta"><span class="pill">GRAMMAR LAB</span><span class="q-count">'+G.questions.length+' questions</span></div><p class="kicker">BEFORE YOU PRACTISE</p><h2 class="q-text">'+esc(lesson.title)+'</h2><div class="grammar-rule-card"><p>'+esc(lesson.rule)+'</p><p>Pay attention to the subject, tense, and meaning of the whole sentence.</p><p>Use the rule in context instead of translating word for word.</p></div><h3>Examples</h3><div class="grammar-examples">'+lesson.examples.map((x,i)=>'<p><b>'+(i+1)+'.</b> '+esc(x)+'</p>').join('')+'</div><p class="review-note">Choose how you want to practise.</p><div class="grammar-mode-grid"><button class="btn" data-grammar-mode="mcq">Multiple choice</button><button class="btn btn-ghost" data-grammar-mode="fix">Correct the sentence</button><button class="btn btn-ghost" data-grammar-mode="order">Arrange the words</button><button class="btn btn-ghost" data-grammar-mode="own">Complete in your own words</button></div></div>';$('#game-scroll').scrollTop=0;
  }
  function renderGrammarModeQuestion(){
    if(G.grammarMode==='mcq'){renderQuestion();return;}
    const item=G.questions[G.i],q=item.q,correct=q.answers[q.correct],sentence=q.q.replace(/_{3,}/,correct);G.answered=false;hideSheet();renderSteps();
    const meta='<div class="q-meta"><span class="pill">Grammar · '+({fix:'Correct the sentence',order:'Arrange the words',own:'Your own answer'}[G.grammarMode]||'Practice')+'</span><span class="q-count">Question '+(G.i+1)+' of '+G.questions.length+'</span></div>';
    if(G.grammarMode==='fix'){const wrong=q.answers.find((x,i)=>i!==q.correct)||correct,broken=q.q.replace(/_{3,}/,wrong);$('#game-body').innerHTML='<div>'+meta+'<h2 class="q-text">'+esc(broken)+'</h2><p class="q-sub">Choose the correct form to repair the sentence.</p><div class="answers" id="answers">'+q.answers.map((a,i)=>'<button class="answer" data-i="'+i+'">'+esc(a)+'</button>').join('')+'</div></div>';}
    else if(G.grammarMode==='order'){const words=sentence.replace(/[.!?]$/,'').split(/\s+/),shuffled=words.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}if(shuffled.length>1&&shuffled.every((w,i)=>w===words[i]))[shuffled[0],shuffled[1]]=[shuffled[1],shuffled[0]];G.orderTarget=words.join(' ').toLowerCase();G.orderPicked=[];G.orderWords=shuffled;$('#game-body').innerHTML='<div>'+meta+'<h2 class="q-text">Arrange the words into a correct sentence</h2><p class="q-sub">'+esc(q.sub||'Build the sentence.')+'</p><div class="grammar-word-bank">'+shuffled.map((w,i)=>'<button type="button" class="grammar-word-chip" data-order-word="'+i+'">'+esc(w)+'</button>').join('')+'</div><div class="grammar-order-answer" id="grammar-order-answer" aria-live="polite">Your sentence will appear here.</div><button class="btn" data-order-check>Check sentence</button><button class="btn btn-ghost" data-order-reset>Start again</button></div>';}
    else $('#game-body').innerHTML='<div>'+meta+'<h2 class="q-text">Use the same grammar pattern</h2><p class="q-sub">Write your own complete sentence using this grammar rule. Include at least six words.</p><form data-grammar-own-form><textarea name="ownSentence" rows="3" required placeholder="Write your sentence here…"></textarea><button class="btn" type="submit">Check my sentence</button></form><p class="review-note">This checks completeness, then shows a model sentence and the rule for self-review.</p></div>';
    $('#game-scroll').scrollTop=0;
  }

  function renderSteps(full) {
    const n = G.questions.length;
    $('#steps').innerHTML = Array.from({length:n}, (_, k) =>
      '<span class="step ' + (full ? (G.results[k] || 'ok') : G.results[k] || (k === G.i ? 'current' : '')) + '"></span>').join('');
  }

  function hideSheet() {
    const s = $('#sheet'); s.classList.remove('show');
    $('#game').style.setProperty('--sheet-h', '0px');
  }
  function setSheetSpace() { $('#game').style.setProperty('--sheet-h', $('#sheet').offsetHeight + 'px'); }
  function showSheet(ok, html) {
    const s = $('#sheet'); s.className = 'sheet' + (ok ? '' : ' bad');
    s.innerHTML = '<div class="sheet-in">' + html + '</div>';
    enhanceTranslationControls(s);
    requestAnimationFrame(() => {
      s.classList.add('show'); setSheetSpace();
      const sel = $('#answers .correct'); if (sel) sel.scrollIntoView({block:'nearest', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      const b = $('#go-next'); if (b) b.focus({preventScroll: true});
    });
  }

  function renderQuestion() {
    const game = GAMES[G.type], q = G.questions[G.i].q, m = META[G.type];
    G.answered = false; hideSheet(); renderSteps();
    if (G.type === 'spot') {
      $('#game-body').innerHTML = '<div class="q-meta"><span class="pill">Common mistakes · Spot it</span><span class="q-count">Question '+(G.i+1)+' of '+G.questions.length+'</span></div><h2 class="q-text" id="q-text" tabindex="-1">Tap the incorrect word</h2><p class="q-sub">Only one word is wrong. Read the whole text first.</p><div class="spot-text" id="spot-text" role="group" aria-label="Tap the incorrect word">'+q.text.split(/\s+/).map((word,i)=>'<button type="button" class="spot-word" data-spot-index="'+i+'" aria-label="Word '+(i+1)+': '+esc(word)+'">'+esc(word)+'</button>').join(' ')+'</div><p class="ar-only arabic" lang="ar" dir="rtl">اضغط على الكلمة الخاطئة الوحيدة.</p>';
      $('#game-scroll').scrollTop=0; $('#q-text').focus({preventScroll:true}); return;
    }
    if (G.type === 'typing') {
      G.typingRetry = false;
      $('#game-body').innerHTML = '<div class="q-meta"><span class="pill">Type It</span><span class="q-count">Question '+(G.i+1)+' of '+G.questions.length+'</span></div><h2 class="q-text" id="q-text" tabindex="-1">Complete the sentence</h2><p class="typing-prompt">'+esc(q.q.replace(/_{3,}/g,'________'))+'</p><p class="q-sub">'+esc(q.sub)+'</p><form id="typing-form" class="typing-form"><label for="typing-answer">Your answer</label><input id="typing-answer" name="answer" autocomplete="off" autocapitalize="none" spellcheck="false" required aria-describedby="typing-feedback"><p id="typing-feedback" class="typing-feedback" aria-live="polite"></p><button class="btn" type="submit">Check answer</button></form><p class="ar-only arabic" lang="ar" dir="rtl">اكتب الكلمة أو العبارة الناقصة ثم اضغط تحقق.</p>';
      $('#game-scroll').scrollTop=0; $('#q-text').focus({preventScroll:true}); const input=$('#typing-answer'); input.addEventListener('focus',()=>setTimeout(()=>input.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}),180)); return;
    }
    const modeLabel = G.mode === 'daily' ? 'Daily #' + dailyChallengeNumber() : G.mode === 'oneLife' ? 'ONE LIFE · No retries' : (G.reviewMode ? 'Practice again' : m.label);
    $('#game-body').innerHTML =
      '<div class="q-meta"><span class="pill">' + modeLabel + '</span><span class="q-count">Question ' + (G.i + 1) + ' of ' + G.questions.length + '</span></div>' +
      '<h2 class="q-text" id="q-text" tabindex="-1">' + esc(q.q) + '</h2>' + (state.helpArabic && G.questions[G.i].q_ar ? '<p class="arabic question-ar" lang="ar" dir="rtl">' + esc(G.questions[G.i].q_ar) + '</p>' : '') + (q.word ? '<button class="listen-btn question-listen" data-speak="' + esc(wordParts(q.word, q.explain).word) + '">' + ic('sound') + ' Listen to word</button>' : '') + '<p class="q-sub">' + esc(q.sub) + '</p>' + (state.helpArabic && G.questions[G.i].sub_ar ? '<p class="arabic" lang="ar" dir="rtl">' + esc(G.questions[G.i].sub_ar) + '</p>' : '') +
      '<p class="ar-only ar-guide arabic" lang="ar" dir="rtl">' + guidance[G.type] + '</p>' +
      '<div class="answers" id="answers" role="group" aria-labelledby="q-text">' +
      q.answers.map((a, i) => '<button class="answer" data-i="' + i + '"><span class="key">' + (i + 1) + '</span><span>' + esc(a) + '</span>' + (state.helpArabic && G.questions[G.i].answers_ar && G.questions[G.i].answers_ar[i] ? '<span class="answer-ar arabic" lang="ar" dir="rtl">' + esc(G.questions[G.i].answers_ar[i]) + '</span>' : '') + '</button>').join('') + '</div>';
    $('#game-scroll').scrollTop = 0;
    $('#q-text').focus({preventScroll: true});
  }

  function selectAnswer(choice) {
    if (!G || G.answered) return;
    G.answered = true;
    const game = GAMES[G.type], item = G.questions[G.i], q = item.q, ok = choice === q.correct;
    recordAdaptiveResult(['spot','grammar','mistakes','personalized'].includes(G.type)?'grammar':G.type==='listening'?'listening':G.type==='story'?'conversation':'vocabulary',q.trap||q.id||G.type,ok);
    if (ok) { G.score++; const wp=wordParts(q.word,q.explain); if(wp)G.words.push([wp.word,wp.meaning,wp.level]); if(!G.reviewMode&&q.trap&&q.id){state.mistakeTrapCorrect[q.trap]=(Number(state.mistakeTrapCorrect[q.trap])||0)+1;state.mistakeQuestionCorrect[q.id]=(Number(state.mistakeQuestionCorrect[q.id])||0)+1;updateGrammarSrs(q,true);save();} }
    else if (!G.reviewMode) {
      addReview(q.word,q.explain);
      if (q.trap && q.id) {
        state.mistakeTrapErrors[q.trap] = (Number(state.mistakeTrapErrors[q.trap]) || 0) + 1;
        state.mistakeQuestionErrors[q.id] = (Number(state.mistakeQuestionErrors[q.id]) || 0) + 1;
        updateGrammarSrs(q,false);
      }
      const weakKey = q.trap || (G.type === 'spot' ? 'spot-' + q.level : G.type);
      state.weakTraps[weakKey] = (Number(state.weakTraps[weakKey]) || 0) + 1;
      save();
    }
    G.results[G.i] = ok ? 'ok' : 'no';
    if (!G.mode && !G.reviewMode) {
      if (ok) { state.adaptiveStreak = (Number(state.adaptiveStreak) || 0) + 1; if (state.adaptiveStreak >= 3) { state.adaptiveOffset = Math.min(2, (Number(state.adaptiveOffset) || 0) + 1); state.adaptiveStreak = 0; G.adaptiveMessage = 'Three correct answers in a row — the next round will be a little harder.'; } }
      else { state.adaptiveStreak = 0; state.adaptiveOffset = Math.max(-2, (Number(state.adaptiveOffset) || 0) - 1); G.adaptiveMessage = 'Let’s adjust the next round to a more comfortable level.'; }
      save();
    }
    $$('#answers .answer').forEach((b, k) => { b.disabled = true; if (k === q.correct) b.classList.add('correct'); else if (k === choice) b.classList.add('wrong'); });
    $('#answers').classList.add('done');
    renderSteps(); sfx(ok ? 'ok' : 'no');
    const last = G.i === game.questions.length - 1;
    if(G.type==='grammar'&&G.grammarMode==='fix'){showSheet(ok,'<h3>'+(ok?'Sentence repaired!':'Not quite.')+'</h3><p>'+(ok?'You chose the correct form.':'Correct form: <b>'+esc(q.answers[q.correct])+'</b>')+'</p><p>'+esc(q.explain)+'</p><div class="sheet-actions"><button class="btn" id="go-next">'+(last?'See results':'Continue')+ic('arrow')+'</button></div>');return;}
    showSheet(ok,
      '<h3><span class="sheet-mark">' + ic(ok ? 'check' : 'x') + '</span>' + (ok ? 'Exactly right!' : 'Not quite — and that’s okay.') + '</h3>' +
      (ok ? '' : '<p>Correct answer: <b>' + esc(q.answers[q.correct]) + '</b></p>') +
      '<p>' + esc(q.explain) + '</p>' + (state.helpArabic && G.questions[G.i].explain_ar ? '<p class="arabic" lang="ar" dir="rtl">' + esc(G.questions[G.i].explain_ar) + '</p>' : '') +
      (!ok && G.type === 'mistakes' ? '<section class="trap-explanation" aria-label="Why Arabic speakers make this mistake"><h4>Why do Arabic speakers make this mistake?</h4><p class="arabic" lang="ar" dir="rtl">' + esc(q.why_ar || q.ar) + '</p><p class="trap-hint arabic" lang="ar" dir="rtl">' + esc(q.arabic_hint || '') + '</p></section>' : '') +
      (!ok && q.aha ? '<aside class="aha-note"><span aria-hidden="true">💡</span><div><strong>Aha moment</strong><p>'+esc(q.aha.en)+'</p><p class="arabic ar-only" lang="ar" dir="rtl">'+esc(q.aha.ar)+'</p></div></aside>' : '') +
      (ok && q.word ? '<div class="newword"><span>New word</span><b>' + esc(q.word[0]) + '</b><span>' + esc(q.word[1]) + '</span></div>' : '') +
      '<p class="ar-only arabic" lang="ar" dir="rtl"><strong>' + (ok ? 'أحسنت!' : 'معلومة للتعلّم') + '</strong> ' + esc(item.ar) + '</p>' +
      (G.adaptiveMessage && !G.mode ? '<p class="adaptive-note">' + esc(G.adaptiveMessage) + '</p>' : '') +
      '<div class="sheet-actions"><button class="btn" id="go-next">' + (G.mode === 'oneLife' && !ok ? 'End run & see results' : last ? 'See results' : 'Continue') + ic('arrow') + '</button></div>');
  }

  function selectSpot(index) {
    if(!G||G.answered||G.type!=='spot')return;
    const item=G.questions[G.i],q=item.q,ok=index===q.wrongIndex;G.answered=true;
    if(ok)G.score++;
    else {const key='spot-'+q.level;state.weakTraps[key]=(Number(state.weakTraps[key])||0)+1;save();}
    G.results[G.i]=ok?'ok':'no';
    $$('#spot-text .spot-word').forEach((b,i)=>{b.disabled=true;if(i===q.wrongIndex)b.classList.add('wrong');});
    const words=q.text.split(/\s+/);let corrected;
    if(/^remove\s/i.test(q.fix)){corrected=words.filter((_,i)=>i!==q.wrongIndex).join(' ');}
    else {words[q.wrongIndex]=q.fix;corrected=words.join(' ');}
    const correctDisplay=corrected;
    showSheet(ok,'<h3><span class="sheet-mark">'+ic(ok?'check':'x')+'</span>'+(ok?'Exactly right!':'Good try — spot the pattern.')+'</h3><p><strong>Corrected sentence:</strong></p><p class="spot-corrected">'+esc(correctDisplay)+'</p>'+(!ok?'<p class="spot-reveal">You selected: <span class="spot-wrong-word">'+esc(words[index]||'')+'</span></p>':'')+'<p>'+esc(q.why_en)+'</p><p class="arabic ar-only" lang="ar" dir="rtl">'+esc(q.why_ar)+'</p>'+( !ok&&q.aha?'<aside class="aha-note"><span aria-hidden="true">💡</span><div><strong>Aha moment</strong><p>'+esc(q.aha.en)+'</p><p class="arabic ar-only" lang="ar" dir="rtl">'+esc(q.aha.ar)+'</p></div></aside>':'')+'<div class="sheet-actions"><button class="btn" id="go-next">'+(G.i===G.questions.length-1?'See results':'Continue')+ic('arrow')+'</button></div>');
    renderSteps();sfx(ok?'ok':'no');
  }
  function editDistanceOne(a,b) {
    a=String(a);b=String(b);if(a===b)return false;if(Math.abs(a.length-b.length)>1)return false;
    let i=0,j=0,edits=0;
    while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}edits++;if(edits>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}}
    if(i<a.length||j<b.length)edits++;return edits===1;
  }
  function checkTyping() {
    if(!G||G.type!=='typing'||G.answered)return;
    const input=$('#typing-answer'),feedback=$('#typing-feedback');if(!input)return;
    const q=G.questions[G.i].q,answer=input.value.trim().replace(/\s+/g,' ').toLowerCase();
    if(!answer){feedback.textContent='Type an answer first.';feedback.className='typing-feedback bad';input.focus();return;}
    const accepted=q.accept.map(x=>String(x).trim().replace(/\s+/g,' ').toLowerCase());
    if(accepted.includes(answer)){finishTyping(true);return;}
    if(!G.typingRetry&&accepted.some(x=>editDistanceOne(answer,x))){G.typingRetry=true;feedback.textContent='Very close! Check the spelling and try once more — no stars lost.';feedback.className='typing-feedback near';input.select();return;}
    finishTyping(false);
  }
  function finishTyping(ok) {
    const item=G.questions[G.i],q=item.q;G.answered=true;
    if(ok)G.score++;else{const key='typing-'+q.level;state.weakTraps[key]=(Number(state.weakTraps[key])||0)+1;save();}
    G.results[G.i]=ok?'ok':'no';renderSteps();sfx(ok?'ok':'no');
    showSheet(ok,'<h3><span class="sheet-mark">'+ic(ok?'check':'x')+'</span>'+(ok?'Exactly right!':'Not quite — keep going.')+'</h3>'+(!ok?'<p><strong>Accepted answer:</strong> '+esc(q.accept.join(' / '))+'</p>':'')+'<p>'+esc(q.why_en)+'</p><p class="arabic ar-only" lang="ar" dir="rtl">'+esc(q.why_ar)+'</p>'+(!ok&&q.aha?'<aside class="aha-note"><span aria-hidden="true">💡</span><div><strong>Aha moment</strong><p>'+esc(q.aha.en)+'</p><p class="arabic ar-only" lang="ar" dir="rtl">'+esc(q.aha.ar)+'</p></div></aside>':'')+'<div class="sheet-actions"><button class="btn" id="go-next">'+(G.i===G.questions.length-1?'See results':'Continue')+ic('arrow')+'</button></div>');
  }

  function next() {
    if (!G || !G.answered) return;
    if (G.mode === 'oneLife' && G.results[G.i] === 'no') { showResults(); return; }
    if (G.i < G.questions.length - 1) { G.i++; if(G.type==='grammar'&&!G.reviewMode&&!G.mode)renderGrammarModeQuestion();else renderQuestion(); }
    else if (G.mode) { showResults(); return; }
    else if (!G.reviewMode && G.questions.some((item,i)=>G.results[i]==='no')) {
      G.originalQuestions=G.questions.slice(); G.originalResults=G.results.slice(); G.originalScore=G.score; G.originalTotal=G.questions.length;
      G.questions=G.originalQuestions.filter((item,i)=>G.originalResults[i]==='no'); G.reviewMode=true; G.i=0; G.score=0; G.results=[]; G.answered=false;
      renderQuestion(); $('#game-body').insertAdjacentHTML('afterbegin','<div class="review-banner">Let’s practise the questions you missed — no extra pressure.</div>');
    } else showResults();
  }

  function showResults() {
    if (!DEV_MODE.active && state.dailySessionStep === 'lesson' && G && !G.mode) { state.dailySessionStep = 'story'; save(); }
    const game = GAMES[G.type], total = G.originalTotal || G.questions.length;
    const finalScore = G.originalScore == null ? G.score : G.originalScore;
    if (G.mode === 'daily' || G.mode === 'oneLife') { showChallengeResults(finalScore, total); return; }
    if (DEV_MODE.active && hasDeveloperAccess()) {
      const testType = G.type;
      hideSheet(); renderSteps(true); sfx('done');
      $('#game-body').innerHTML = '<div class="result"><div class="burst">'+ic('spark')+'</div><p class="kicker" style="margin:6px 0 0">DEVELOPER TEST · NO REWARDS</p><h2>Practice run complete</h2><p>You got '+G.score+' out of '+total+'. This test did not change XP, achievements, words or saved progression.</p><div class="stats3"><div class="stat"><b>'+finalScore+'/'+total+'</b><span>Correct first try</span></div><div class="stat"><b>0</b><span>XP awarded</span></div><div class="stat"><b>'+G.words.length+'</b><span>Words explored</span></div></div><div class="result-actions"><button class="btn" id="dev-res-again">Try again</button><button class="btn btn-ghost" id="dev-res-home">Back to Developer Mode</button></div></div>';
      $('#game-scroll').scrollTop = 0;
      $('#dev-res-again').addEventListener('click', () => startGame(testType));
      $('#dev-res-home').addEventListener('click', () => { closeGame(); openView('home'); });
      return;
    }
    const earned = Math.round(game.xp * (.35 + .65 * finalScore / total));
    const before = currentLevel();
    state.xp += earned; state.quests++; state.daily = Math.min(2, state.daily + 1);
    const today = dayKey();
    if (state.dailyQuestDate !== today) { state.dailyQuestDate = today; state.dailyQuestProgress = 0; state.dailyQuestClaimed = false; state.dailyCorrect = 0; state.dailyXp = 0; }
    if (state.weeklyKey !== weekKey()) { state.weeklyKey = weekKey(); state.weeklyProgress = 0; state.weeklyClaimed = false; }
    state.dailyCorrect += finalScore; state.dailyXp += earned; state.dailyQuestProgress = state.daily;
    state.weeklyProgress = (state.weeklyProgress || 0) + 1;
    state.modes[G.type] = (Number(state.modes[G.type]) || 0) + 1;
    const task = DAILY_QUESTS[(new Date().getDate() - 1) % DAILY_QUESTS.length];
    const taskProgress = task.kind === 'quests' ? state.daily : task.kind === 'xp' ? state.dailyXp : state.dailyCorrect;
    let bonusMessage = '';
    if (!state.dailyQuestClaimed && taskProgress >= task.target) { state.dailyQuestClaimed = true; state.xp += task.reward; bonusMessage = 'Daily quest bonus: +' + task.reward + ' XP!'; }
    if (!state.weeklyClaimed && state.weeklyProgress >= 5) { state.weeklyClaimed = true; state.xp += 60; bonusMessage += ' Weekly challenge complete: +60 XP!'; }
    if (state.lastDay !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1); const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      if (state.lastDay === dayKey(y)) state.streak = (state.streak || 0) + 1;
      else if (state.lastDay === dayKey(twoDaysAgo) && state.streakFreezes > 0) { state.streakFreezes -= 1; state.streak = (state.streak || 0) + 1; bonusMessage += ' Streak freeze used to protect your streak.'; }
      else state.streak = 1;
      state.lastDay = today;
    }
    if (!state.completed.includes(before.id)) state.completed.push(before.id);
    const after = currentLevel();
    G.words.forEach(w => {
      if (!state.words.some(e => e[0].toLowerCase() === w[0].toLowerCase())) { state.words.push([w[0], w[1], w[2] || after.id]); recordLearningActivity({words:1}); }
      if (!state.review.some(e => e.word.toLowerCase() === String(w[0]).toLowerCase())) state.review.push({word:String(w[0]),meaning:String(w[1]||'Review this word in context.'),level:w[2]||after.id,due:dayKey(),box:1,interval:0,streak:0,attempts:0,errors:0,exerciseStage:0,mastered:false});
    });
    save(); renderAll();

    hideSheet(); renderSteps(true); sfx('done');
    const perfect = finalScore === total, nxt = pickNext();
    $('#game-body').innerHTML =
      '<div class="result"><div class="burst">' + ic('spark') + '</div>' +
      '<p class="kicker" style="margin:6px 0 0">Quest complete</p>' +
      '<h2>' + (perfect ? 'Brilliant work!' : G.score >= 3 ? 'Look at you, growing!' : 'Every try teaches you something.') + '</h2>' +
      '<p>You got ' + G.score + ' out of ' + total + '. ' + (perfect ? 'A perfect round. Enjoy that feeling.' : 'Check the words below and play again when you’re ready.') + '</p>' +
      '<div class="stats3"><div class="stat"><b>+' + earned + '</b><span>XP earned</span></div><div class="stat"><b>' + finalScore + '/' + total + '</b><span>Correct first try</span></div><div class="stat"><b>' + G.words.length + '</b><span>New words</span></div></div>' +
      (bonusMessage ? '<p class="challenge-bonus">' + esc(bonusMessage.trim()) + '</p>' : '') +
      (after.id !== before.id ? '<div class="levelup"><b>You reached ' + after.id + '!</b>' + after.name + ' · ' + esc(after.title) + '</div>' : '') +
      (G.words.length ? '<div class="found"><div class="found-title">Added to your vault</div>' + G.words.map(w => '<span class="w">' + esc(w[0]) + '</span>').join('') + '</div>' : '') + (G.originalQuestions ? '<p class="review-complete">You also reviewed ' + G.originalQuestions.filter((item,i)=>G.originalResults[i]==='no').length + ' missed question(s).</p>' : '') +
      '<div class="result-actions"><button class="btn" id="res-share">' + ic('spark') + 'Share result card</button>' +
      '<button class="btn btn-ghost" id="res-download">Download result image</button>' +
      (state.dailySessionStep === 'story' ? '<button class="btn" id="res-daily-session">Continue daily session · read your story ' + ic('arrow') + '</button>' : '') +
      '<button class="btn" id="res-next">' + ic('play') + 'Next: ' + esc(GAMES[nxt].title) + '</button>' +
      '<button class="btn btn-ghost" id="res-home">Back to home</button>' +
      '<button class="btn btn-link" id="res-again">Play this quest again</button></div></div>';
    $('#game-scroll').scrollTop = 0;
    const type = G.type;
    const shareData = {game: game.title, score: finalScore, total, xp: earned, level: after.id, streak: liveStreak()};
    $('#res-share').addEventListener('click', () => shareResult(shareData));
    $('#res-download').addEventListener('click', () => shareResult(shareData, true));
    $('#res-next').addEventListener('click', () => startGame(nxt));
    $('#res-home').addEventListener('click', () => { closeGame(); openView('home'); });
    $('#res-again').addEventListener('click', () => startGame(type));
    const dailySessionResult = $('#res-daily-session');
    if (dailySessionResult) dailySessionResult.addEventListener('click', () => { closeGame(); openView('home'); startDailySession(); });
    $('#res-next').focus({preventScroll: true});
  }

  function showChallengeResults(score, total) {
    const mode = G.mode, dailyNo = dailyChallengeNumber(), results = G.results.slice(), isDaily = mode === 'daily';
    if (isDaily) { state.dailyChallengeDate = todayForChallenge(); state.dailyChallengeResult = {score, total, results, date:todayForChallenge()}; } else state.oneLifeBest = Math.max(Number(state.oneLifeBest) || 0, score);
    save(); hideSheet(); renderSteps(true); sfx('done');
    const squares = results.map(r => r === 'ok' ? '🟩' : '🟥').join(' ');
    const shareData = {game:isDaily?'Daily #'+dailyNo:'One Life Challenge',score,total,xp:0,level:currentLevel().id,streak:liveStreak(),challengeMode:mode,results,dailyNo};
    $('#game-body').innerHTML = '<div class="result challenge-result"><div class="burst">'+ic('spark')+'</div><p class="kicker">'+(isDaily?'DAILY CHALLENGE #'+dailyNo:'ONE LIFE MODE')+'</p><h2>'+(score===total?'Flawless run!':score>=Math.ceil(total*.6)?'Strong effort!':'Every attempt builds skill.')+'</h2><p>You got <b>'+score+' / '+total+'</b> on the first try.'+(isDaily?' Everyone gets the same questions today.':' One mistake ends the run — your best score is '+state.oneLifeBest+'.')+'</p>'+(isDaily?'<div class="daily-score-grid" aria-label="Question results">'+results.map((r,i)=>'<span class="daily-score-cell '+(r==='ok'?'is-correct':'is-wrong')+'" title="Question '+(i+1)+'">'+(r==='ok'?'✓':'×')+'</span>').join('')+'</div><p class="daily-share-text">'+squares+'</p>':'<p class="one-life-note">Best score: '+state.oneLifeBest+' / '+total+'</p>')+'<div class="stats3"><div class="stat"><b>'+score+'/'+total+'</b><span>First-try score</span></div><div class="stat"><b>'+(isDaily?'#'+dailyNo:'1 life')+'</b><span>'+(isDaily?'Today’s challenge':'Challenge mode')+'</span></div><div class="stat"><b>'+state.adaptiveOffset+'</b><span>Practice adjustment</span></div></div><div class="result-actions"><button class="btn" id="challenge-share">'+ic('spark')+'Share result card</button><button class="btn btn-ghost" id="challenge-home">Back to home</button>'+(isDaily?'':'<button class="btn btn-link" id="challenge-again">Try One Life again</button>')+'</div></div>';
    $('#game-scroll').scrollTop = 0;
    $('#challenge-share').addEventListener('click', () => shareResult(shareData));
    $('#challenge-home').addEventListener('click', () => { closeGame(); openView('home'); });
    const again = $('#challenge-again'); if (again) again.addEventListener('click', startOneLife);
  }

  async function shareResult(data, downloadOnly = false) {
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext('2d'); if (!ctx) { toast('Could not create the result card in this browser.'); return; }
    const bg = ctx.createLinearGradient(0, 0, 1080, 1080); bg.addColorStop(0, '#F7F3FF'); bg.addColorStop(1, '#E7F6EE'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#FFC531'; ctx.beginPath(); ctx.arc(900, 160, 150, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D9CBFF'; ctx.beginPath(); ctx.arc(160, 900, 180, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#121A3A'; ctx.font = '800 62px Arial'; ctx.fillText('epiphany', 90, 125);
    ctx.font = '700 26px Arial'; ctx.fillStyle = '#655F7D'; ctx.fillText('A LITTLE ENGLISH. A BIG STEP.', 94, 175);
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#121A3A'; ctx.lineWidth = 5; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(70, 240, 940, 590, 42); else ctx.rect(70, 240, 940, 590); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#6552A3'; ctx.font = '800 30px Arial'; ctx.fillText(data.challengeMode === 'daily' ? 'DAILY #' + data.dailyNo : data.challengeMode === 'oneLife' ? 'ONE LIFE CHALLENGE' : 'QUEST COMPLETE', 540, 315);
    ctx.fillStyle = '#121A3A'; ctx.font = '800 58px Arial'; const words = String(data.game || 'English quest').split(' '); let lines = [], line = '';
    words.forEach(word => { const test = line ? line + ' ' + word : word; if (ctx.measureText(test).width > 820 && line) { lines.push(line); line = word; } else line = test; }); if (line) lines.push(line); lines.slice(0,2).forEach((l,i) => ctx.fillText(l, 540, 390 + i * 65));
    ctx.fillStyle = '#655F7D'; ctx.font = '600 28px Arial'; ctx.fillText('FIRST-TRY SCORE', 540, 515);
    ctx.fillStyle = '#121A3A'; ctx.font = '800 100px Arial'; ctx.fillText(data.score + ' / ' + data.total, 540, 625);
    if (data.challengeMode === 'daily') {
      const cells = (data.results || []).slice(0, 10), cell = 58, gap = 14, totalWidth = cells.length * cell + Math.max(0, cells.length - 1) * gap, startX = (1080 - totalWidth) / 2;
      cells.forEach((result, i) => { ctx.fillStyle = result === 'ok' ? '#25A56A' : '#E45D5D'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(startX + i * (cell + gap), 655, cell, cell, 12); else ctx.rect(startX + i * (cell + gap), 655, cell, cell); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial'; ctx.textAlign = 'center'; ctx.fillText(result === 'ok' ? '✓' : '×', startX + i * (cell + gap) + cell / 2, 696); });
      ctx.fillStyle = '#655F7D'; ctx.font = '600 25px Arial'; ctx.textAlign = 'center'; ctx.fillText('Same questions for everyone today', 540, 745);
    } else { ctx.fillStyle = '#6552A3'; ctx.font = '800 40px Arial'; ctx.fillText('+' + data.xp + ' XP', 540, 700); }
    ctx.fillStyle = '#121A3A'; ctx.font = '700 28px Arial'; ctx.fillText(data.level + ' LEVEL   •   ' + data.streak + ' DAY STREAK', 540, 770);
    ctx.textAlign = 'left'; ctx.fillStyle = '#121A3A'; ctx.font = '700 28px Arial'; ctx.fillText('Keep your spark going!', 95, 910);
    ctx.fillStyle = '#655F7D'; ctx.font = '500 22px Arial'; ctx.fillText('Learn a little every day · Epiphany', 95, 955);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) { toast('Could not export the image. Try Download result image again.'); return; }
    const file = new File([blob], 'epiphany-result.png', {type:'image/png'});
    if (!downloadOnly && navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))) {
      try { await navigator.share({title:'My Epiphany result', text:'I’m learning English with Epiphany!', files:[file]}); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'epiphany-result.png'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500); toast(downloadOnly ? 'Result card downloaded.' : 'Result card downloaded — you can now share it.');
  }

  /* ---------- mini-games: Order the Story · Word Match · Directions ---------- */
  let MG = null;
  const MINI = {
    order:     {label:'Order the Story', tone:'mint',   glyph:'1·2·3', time:4, blurb:'Put the events of a story in order.', xp:30},
    match:     {label:'Word Match',      tone:'violet', glyph:'⇄',     time:3, blurb:'Match each word with its meaning.',   xp:25},
    directions:{label:'Directions',      tone:'sky',    glyph:'↱',     time:4, blurb:'Follow directions on a town map.',    xp:35},
    speed:{label:'Speed Round',tone:'coral',glyph:'⚡',time:1,blurb:'A 60-second sprint focused on your weak words.',xp:45},
    audioImage:{label:'Sound & Picture Match',tone:'sky',glyph:'🔊',time:3,blurb:'Listen to a word and choose the matching picture.',xp:30},
    sentenceOrder:{label:'Sentence Builder',tone:'mint',glyph:'↔',time:3,blurb:'Arrange shuffled words and hear the sentence when correct.',xp:35}
  };
  Object.assign(META, MINI); Object.keys(MINI).forEach(k => { UNLOCK[k] = 0; });
  const NUM_WORDS = ['zero','one','two','three','four'];
  const AR_NUM = ['صفر','واحدة','اثنتين','ثلاث','أربع'];
  const SHUF = list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function awardActivity(xpGain, correct) {
    if (DEV_MODE.active && hasDeveloperAccess()) return 'Developer test session · no XP, rewards or progress saved.';
    state.xp += xpGain; state.quests++; state.daily = Math.min(2, state.daily + 1);
    const today = dayKey();
    if (state.dailyQuestDate !== today) { state.dailyQuestDate = today; state.dailyQuestProgress = 0; state.dailyQuestClaimed = false; state.dailyCorrect = 0; state.dailyXp = 0; }
    if (state.weeklyKey !== weekKey()) { state.weeklyKey = weekKey(); state.weeklyProgress = 0; state.weeklyClaimed = false; }
    state.dailyXp += xpGain; state.dailyCorrect += correct; state.dailyQuestProgress = state.daily; state.weeklyProgress = (state.weeklyProgress || 0) + 1;
    const task = DAILY_QUESTS[(new Date().getDate() - 1) % DAILY_QUESTS.length];
    const progress = task.kind === 'quests' ? state.daily : task.kind === 'xp' ? state.dailyXp : state.dailyCorrect;
    let bonus = '';
    if (!state.dailyQuestClaimed && progress >= task.target) { state.dailyQuestClaimed = true; state.xp += task.reward; bonus = ' Daily bonus +' + task.reward + ' XP!'; }
    if (!state.weeklyClaimed && state.weeklyProgress >= 5) { state.weeklyClaimed = true; state.xp += 60; bonus += ' Weekly bonus +60 XP!'; }
    if (state.lastDay !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1); const two = new Date(); two.setDate(two.getDate() - 2);
      if (state.lastDay === dayKey(y)) state.streak = (state.streak || 0) + 1;
      else if (state.lastDay === dayKey(two) && state.streakFreezes > 0) { state.streakFreezes--; state.streak = (state.streak || 0) + 1; bonus += ' Streak freeze protected your streak.'; }
      else state.streak = 1;
      state.lastDay = today;
    }
    if (!state.completed.includes(currentLevel().id)) state.completed.push(currentLevel().id);
    save(); renderAll();
    return bonus.trim();
  }

  function startMini(type) {
    G = null; ST = null;
    MG = {type, i: 0, score: 0, total: 0, answered: false, results: []};
    const m = META[type];
    $('#game').className = 'game t-' + m.tone; $('#game').hidden = false; lockPage(true); hideSheet();
    if (type === 'order') miniOrderSetup();
    else if (type === 'match') miniMatchSetup();
    else if (type === 'directions') miniDirSetup();
    else if (type === 'speed') miniSpeedSetup();
    else if (type === 'audioImage') miniAudioImageSetup();
    else if (type === 'sentenceOrder') miniSentenceSetup();
  }
  let miniTimer = null;
  function miniWeakWordPool() {
    const items=[],seen=new Set();
    const add=(word,meaning,icon)=>{const w=String(word||'').trim(),m=String(meaning||'').trim(),key=w.toLowerCase();if(!w||!m||seen.has(key))return;seen.add(key);items.push({word:w,meaning:m,icon:icon||'🔤'});};
    (state.review||[]).slice().sort((a,b)=>(Number(b.errors)||0)-(Number(a.errors)||0)).forEach(x=>{if(x&&x.word)add(x.word,x.meaning||x.translation||'Review this word in context.');});
    (state.words||[]).forEach(x=>{if(Array.isArray(x))add(x[0],x[1]);else if(x&&x.word)add(x.word,x.meaning);});
    (WOTD_WORDS||[]).forEach(x=>add(x.word,x.meaning));
    return items;
  }
  function miniSpeech(text) {
    const synth=window.speechSynthesis;
    if(!synth||!('SpeechSynthesisUtterance' in window)){toast('Audio is not supported in this browser.');return;}
    try{synth.cancel();const u=new SpeechSynthesisUtterance(String(text));const v=pickVoice();u.lang=v?String(v.lang||'en-US').replace('_','-'):'en-US';if(v)u.voice=v;u.rate=.92;synth.speak(u);}catch{toast('Could not play the audio.');}
  }
  function miniSpeedSetup() {
    if(miniTimer){clearInterval(miniTimer);miniTimer=null;}
    const pool=miniWeakWordPool();
    const defaults=[
      {word:'borrow',meaning:'to take something and return it later'},{word:'careful',meaning:'giving attention to avoid mistakes'},
      {word:'improve',meaning:'to become or make something better'},{word:'choose',meaning:'to select from possibilities'},
      {word:'journey',meaning:'travel from one place to another'},{word:'quiet',meaning:'making little or no noise'}
    ];
    const extras=SHUF(defaults.filter(x=>!pool.some(p=>p.word.toLowerCase()===x.word.toLowerCase())));
    MG.pool=pool.length>=4?pool:pool.concat(extras.slice(0,Math.max(4-pool.length,0)));
    MG.seconds=60;MG.total=0;MG.score=0;MG.answered=false;MG.current=null;miniSpeedRender();
    miniTimer=setInterval(()=>{if(!MG||MG.type!=='speed'){clearInterval(miniTimer);miniTimer=null;return;}MG.seconds--;const t=$('#mini-speed-time');if(t)t.textContent=MG.seconds+'s';const bar=$('.mini-speed-meter span');if(bar)bar.style.width=Math.max(0,MG.seconds/60*100)+'%';if(MG.seconds<=0){clearInterval(miniTimer);miniTimer=null;miniFinish('60 seconds');}},1000);
  }
  function miniSpeedRender() {
    const pool=MG.pool;let q=pool[Math.floor(Math.random()*pool.length)];if(pool.length>1&&MG.current&&q.word===MG.current.word)q=pool[(pool.indexOf(q)+1)%pool.length];MG.current=q;MG.answered=false;
    const opts=SHUF([q,...SHUF(pool.filter(x=>x.word!==q.word)).slice(0,3)]);
    $('#game-body').innerHTML='<div class="q-meta"><span class="pill">⚡ Speed Round</span><span class="q-count" id="mini-speed-time">'+MG.seconds+'s</span></div><div class="mini-speed-meter"><span style="width:'+Math.max(0,MG.seconds/60*100)+'%"></span></div><p class="q-sub">Choose the meaning. Saved and difficult words are prioritised when available.</p><h2 class="mini-target-word">'+esc(q.word)+'</h2><div class="mini-choice-grid">'+opts.map(o=>'<button type="button" class="mini-choice" data-mini-speed-answer="'+encodeURIComponent(o.word)+'">'+esc(o.meaning)+'</button>').join('')+'</div><p class="mini-live-score">Correct: <b>'+MG.score+'</b> · Answered: <b>'+MG.total+'</b></p>';
  }
  const MINI_AUDIO_ITEMS=[{word:'apple',meaning:'a round fruit',icon:'🍎'},{word:'book',meaning:'something you read',icon:'📘'},{word:'umbrella',meaning:'keeps you dry in rain',icon:'☂️'},{word:'key',meaning:'opens a lock',icon:'🔑'},{word:'train',meaning:'a vehicle that runs on rails',icon:'🚆'},{word:'bread',meaning:'food made from flour',icon:'🍞'},{word:'clock',meaning:'shows the time',icon:'🕒'},{word:'lamp',meaning:'gives light',icon:'💡'},{word:'chair',meaning:'a seat for one person',icon:'🪑'},{word:'phone',meaning:'a device for calls',icon:'📱'},{word:'tree',meaning:'a tall plant with a trunk',icon:'🌳'},{word:'water',meaning:'a drink we need',icon:'💧'}];
  function miniAudioImageSetup(){MG.pool=SHUF(MINI_AUDIO_ITEMS);MG.total=10;MG.i=0;MG.score=0;MG.answered=false;miniAudioImageRender();}
  function miniAudioImageRender(){const q=MG.pool[MG.i%MG.pool.length],opts=SHUF([q,...SHUF(MINI_AUDIO_ITEMS.filter(x=>x.word!==q.word)).slice(0,3)]);MG.current=q;MG.answered=false;miniSteps();$('#game-body').innerHTML='<div class="q-meta"><span class="pill">🔊 Sound & Picture</span><span class="q-count">'+(MG.i+1)+' of '+MG.total+'</span></div><h2 class="q-text" id="q-text" tabindex="-1">Listen, then choose the picture</h2><button type="button" class="mini-listen-button" data-mini-audio-play>🔊 Play word</button><div class="mini-picture-grid">'+opts.map(o=>'<button type="button" class="mini-picture" data-mini-audio-answer="'+o.word+'" aria-label="Picture: '+esc(o.word)+'"><span class="mini-picture-art" aria-hidden="true">'+o.icon+'</span><span>'+esc(o.word)+'</span></button>').join('')+'</div>'+(state.helpArabic?'<p class="q-sub arabic" lang="ar" dir="rtl">استمع إلى الكلمة الإنجليزية ثم اختر الصورة المناسبة.</p>':'');}
  const MINI_SENTENCES=[{text:'I drink water every morning.',ar:'أشرب الماء كل صباح.'},{text:'She is reading a book.',ar:'هي تقرأ كتابًا.'},{text:'We are going to school.',ar:'نحن ذاهبون إلى المدرسة.'},{text:'He bought a new phone.',ar:'اشترى هاتفًا جديدًا.'},{text:'Please open the window.',ar:'من فضلك افتح النافذة.'},{text:'They play football after school.',ar:'يلعبون كرة القدم بعد المدرسة.'},{text:'I would like a cup of tea.',ar:'أود كوبًا من الشاي.'},{text:'The train arrives at six.',ar:'يصل القطار عند السادسة.'},{text:'My friend lives near the park.',ar:'يعيش صديقي بالقرب من الحديقة.'},{text:'Could you help me, please?',ar:'هل يمكنك مساعدتي من فضلك؟'}];
  function miniSentenceSetup(){MG.pool=SHUF(MINI_SENTENCES);MG.total=8;MG.i=0;MG.score=0;MG.answered=false;miniSentenceRender();}
  function miniSentenceRender(){const q=MG.pool[MG.i%MG.pool.length];MG.current=q;MG.tokens=SHUF(q.text.replace(/[.!?]$/,'').split(/\s+/).map((word,id)=>({word,id})));MG.placed=[];MG.answered=false;miniSteps();$('#game-body').innerHTML='<div class="q-meta"><span class="pill">↔ Sentence Builder</span><span class="q-count">'+(MG.i+1)+' of '+MG.total+'</span></div><h2 class="q-text" id="q-text" tabindex="-1">Put the words in the right order</h2>'+(state.helpArabic?'<p class="q-sub arabic" lang="ar" dir="rtl">'+esc(q.ar)+'</p>':'<p class="q-sub">Tap words below to build a natural sentence.</p>')+'<div class="mini-sentence-answer" aria-live="polite">'+(MG.placed.length?MG.placed.map((t,i)=>'<button type="button" class="mini-word-token" data-mini-sentence-remove="'+i+'">'+esc(t.word)+'</button>').join(' '):'<span>Tap words to build the sentence…</span>')+'</div><div class="mini-sentence-bank">'+MG.tokens.filter(t=>!MG.placed.some(p=>p.id===t.id)).map(t=>'<button type="button" class="mini-word-token" data-mini-sentence-word="'+t.id+'">'+esc(t.word)+'</button>').join(' ')+'</div><div class="mini-sentence-actions"><button type="button" class="btn" data-mini-sentence-check>Check sentence</button><button type="button" class="btn btn-ghost" data-mini-sentence-reset>Reset</button></div>'+(MG.feedback?'<p class="mini-feedback">'+esc(MG.feedback)+'</p>':'');MG.feedback='';}

  function miniSteps(done) {
    $('#steps').innerHTML = Array.from({length: MG.total}, (_, i) => '<span class="step ' + (MG.results[i] === 'ok' ? 'ok' : MG.results[i] === 'no' ? 'no' : (i === MG.i && !done ? 'current' : '')) + '"></span>').join('');
  }
  function miniFinish(note) {
    if(miniTimer){clearInterval(miniTimer);miniTimer=null;}
    const m = META[MG.type];
    let ratio = MG.type==='speed' ? Math.max(0,Math.min(1,MG.score/Math.max(1,MG.total))) : MG.total ? MG.score / MG.total : 1;
    if (MG.type === 'match') ratio = Math.max(.4, Math.min(1, MG.total * 1.6 / Math.max(1, MG.attempts)));
    const gain = DEV_MODE.active ? 0 : Math.max(8, Math.round(m.xp * (.4 + .6 * ratio)));
    const bonus = awardActivity(gain, MG.score);
    const stars = ratio >= .9 ? '★★★' : ratio >= .6 ? '★★☆' : '★☆☆';
    miniSteps(true); hideSheet();
    const type = MG.type;
    $('#game-body').innerHTML = '<div class="result story-result"><div class="burst">' + (type === 'speed' ? '⚡' : type === 'audioImage' ? '🔊' : type === 'sentenceOrder' ? '↔' : type === 'order' ? '📚' : type === 'match' ? '🧩' : '🧭') + '</div><p class="kicker">' + esc(m.label.toUpperCase()) + ' COMPLETE</p><h2>' + (ratio >= .9 ? 'Brilliant work!' : ratio >= .6 ? 'Nicely done!' : 'Good practice!') + '</h2><div class="story-stars">' + stars + '</div>' +
      '<div class="stats3"><div class="stat"><b>+' + gain + '</b><span>XP earned</span></div><div class="stat"><b>' + MG.score + '/' + MG.total + '</b><span>' + (type === 'match' ? 'Pairs' : 'Correct') + '</span></div><div class="stat"><b>' + esc(note || '') + '</b><span>' + (type === 'match' ? 'Attempts' : 'Rounds') + '</span></div></div>' +
      (bonus ? '<p class="challenge-bonus">' + esc(bonus) + '</p>' : '') +
      '<div class="result-actions"><button class="btn" data-mini-again="' + type + '">Play again</button><button class="btn btn-ghost" data-mini-close>Back to Play</button></div></div>';
    $('#game-scroll').scrollTop = 0; MG.done = true; sfx('done');
  }

  /* Order the Story */
  function miniOrderSetup() {
    const idx = levelIndex();
    let pool = STORIES.filter(s => storyLevelIndex(s.level) <= idx);
    if (!pool.length) pool = STORIES.slice();
    const picked = SHUF(pool).slice(0, 3);
    MG.rounds = picked.map(s => {
      const n = Math.min(4, s.pages.length), start = Math.floor(Math.random() * (s.pages.length - n + 1));
      const items = s.pages.slice(start, start + n).map((p, k) => ({k, text: String(p.text).split(/(?<=[.!?”"])\s+/)[0] || p.text, ar: p.ar}));
      let order = SHUF(items.map(x => x.k)), tries = 0;
      while (order.every((v, p) => v === p) && tries++ < 10) order = SHUF(order);
      return {title: s.title, items, pool: order, placed: []};
    });
    MG.total = MG.rounds.length; MG.i = 0; miniOrderRender();
  }
  function miniOrderRender() {
    const r = MG.rounds[MG.i]; MG.answered = false; hideSheet(); miniSteps();
    const textOf = k => r.items.find(x => x.k === k).text;
    $('#game-body').innerHTML = '<div class="q-meta"><span class="pill">Order the Story</span><span class="q-count">Story ' + (MG.i + 1) + ' of ' + MG.total + '</span></div>' +
      '<h2 class="q-text" id="q-text" tabindex="-1">Put the events in order</h2><p class="q-sub">From “' + esc(r.title) + '”. Tap the sentences in the order they happened.</p>' +
      '<ol class="mg-slots" aria-label="Your order">' + r.items.map((_, p) => '<li class="mg-slot' + (r.placed[p] !== undefined ? ' is-filled' : '') + '">' + (r.placed[p] !== undefined ? '<button type="button" class="mg-card is-placed" data-mg-unplace="' + p + '"><b>' + (p + 1) + '</b><span>' + esc(textOf(r.placed[p])) + '</span></button>' : '<span class="mg-empty">' + (p + 1) + '</span>') + '</li>').join('') + '</ol>' +
      '<div class="mg-pool" role="group" aria-label="Sentences to place">' + r.pool.map(k => '<button type="button" class="mg-card" data-mg-place="' + k + '"><span>' + esc(textOf(k)) + '</span></button>').join('') + '</div>' +
      '<div class="mg-actions"><button class="btn" id="mg-check" ' + (r.pool.length ? 'disabled' : '') + '>Check order</button></div>';
    $('#game-scroll').scrollTop = 0; const h = $('#q-text'); if (h) h.focus({preventScroll: true});
  }
  function miniOrderCheck() {
    const r = MG.rounds[MG.i]; if (MG.answered || r.pool.length) return;
    MG.answered = true; const correct = r.placed.filter((k, p) => k === p).length, ok = correct === r.items.length;
    if (ok) MG.score++; MG.results[MG.i] = ok ? 'ok' : 'no'; miniSteps();
    $$('.mg-slots .mg-card').forEach((b, p) => { b.disabled = true; b.classList.add(r.placed[p] === p ? 'is-right' : 'is-wrong'); });
    $('#mg-check').disabled = true; sfx(ok ? 'ok' : 'no');
    showSheet(ok, '<h3><span class="sheet-mark">' + ic(ok ? 'check' : 'x') + '</span>' + (ok ? 'Perfect order!' : correct + ' of ' + r.items.length + ' in the right place') + '</h3>' +
      (ok ? '' : '<p>Correct order:</p><ol class="mg-answer">' + r.items.map(x => '<li>' + esc(x.text) + '</li>').join('') + '</ol>') +
      '<div class="sheet-actions"><button class="btn" id="go-next">' + (MG.i === MG.total - 1 ? 'See results' : 'Next story') + ic('arrow') + '</button></div>');
  }

  /* Word Match (memory pairs) */
  function miniShort(text) { const t = String(text || '').replace(/^to /, '').split(/[;,(]/)[0].trim(); return t.length > 34 ? t.slice(0, 32).trim() + '…' : t; }
  function miniMatchSetup() {
    const idx = levelIndex(), lvIds = LEVELS.map(l => l.id);
    const seen = new Set(), pairs = [];
    const add = (w, m) => { const key = String(w).toLowerCase(); if (!w || !m || seen.has(key) || /^معنى/.test(m)) return; seen.add(key); pairs.push({w: String(w), m: miniShort(m)}); };
    SHUF(state.words.filter(x => x[1] && x[1] !== 'No explanation has been added for this word yet.')).slice(0, 3).forEach(x => add(x[0], x[1]));
    const wl = WOTD_WORDS.filter(x => lvIds.indexOf(x.level) <= idx + 1);
    SHUF(wl.length >= 6 ? wl : WOTD_WORDS).forEach(x => { if (pairs.length < 6) add(x.word, x.meaning); });
    const cards = SHUF(pairs.flatMap((p, n) => [{id: 'w' + n, n, text: p.w, kind: 'word'}, {id: 'm' + n, n, text: p.m, kind: 'meaning'}]));
    MG.pairs = pairs; MG.cards = cards; MG.open = []; MG.matched = new Set(); MG.attempts = 0; MG.total = pairs.length; MG.lock = false;
    miniMatchRender();
  }
  function miniMatchRender() {
    miniSteps();
    $('#game-body').innerHTML = '<div class="q-meta"><span class="pill">Word Match</span><span class="q-count">' + MG.matched.size + ' of ' + MG.total + ' pairs</span></div><h2 class="q-text" id="q-text" tabindex="-1">Match each word with its meaning</h2><p class="q-sub">Flip two cards. A word and its meaning make a pair.</p>' +
      '<div class="mg-grid" role="group" aria-label="Memory cards">' + MG.cards.map((c, i) => {
        const open = MG.open.includes(i), done = MG.matched.has(c.n);
        return '<button type="button" class="mg-tile ' + (done ? 'is-done ' : open ? 'is-open ' : '') + 'mg-' + c.kind + '" data-mg-flip="' + i + '" ' + (done ? 'disabled' : '') + ' aria-label="' + (open || done ? esc(c.text) : 'Hidden card') + '"><span>' + (open || done ? esc(c.text) : '?') + '</span></button>';
      }).join('') + '</div>';
    for (let i = 0; i < MG.total; i++) { MG.results[i] = MG.matched.size > i ? 'ok' : ''; } miniSteps();
  }
  function miniFlip(i) {
    if (MG.lock || MG.open.includes(i) || MG.matched.has(MG.cards[i].n)) return;
    MG.open.push(i); sfx('ok');
    if (MG.open.length < 2) { miniMatchRender(); return; }
    MG.attempts++; const [a, b] = MG.open.map(k => MG.cards[k]);
    if (a.n === b.n && a.kind !== b.kind) { MG.matched.add(a.n); MG.open = []; MG.score = MG.matched.size; miniMatchRender(); if (MG.matched.size === MG.total) setTimeout(() => { if (MG && MG.type === 'match') miniFinish(String(MG.attempts)); }, 700); return; }
    MG.lock = true; miniMatchRender(); sfx('no');
    setTimeout(() => { if (!MG) return; MG.open = []; MG.lock = false; miniMatchRender(); }, 950);
  }

  /* Directions */
  const DIR_V = {N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0]}, DIR_L = {N: 'W', W: 'S', S: 'E', E: 'N'}, DIR_R = {W: 'N', S: 'W', E: 'S', N: 'E'};
  function dirPath(it) {
    let [x, y] = it.start, d = it.dir; const pts = [[x, y]];
    for (const s of it.steps) { if (s[0] === 'go') { for (let k = 0; k < s[1]; k++) { x += DIR_V[d][0]; y += DIR_V[d][1]; pts.push([x, y]); } } else d = s[1] === 'left' ? DIR_L[d] : DIR_R[d]; }
    return pts;
  }
  function dirText(it) {
    const en = ['Start at the dot and face the arrow.'], ar = ['ابدأ من النقطة وواجه السهم.'];
    it.steps.forEach((s, i) => {
      if (s[0] === 'go') { en.push((i === 0 ? 'Walk straight for ' : 'Then walk ') + NUM_WORDS[s[1]] + (s[1] === 1 ? ' block.' : ' blocks.')); ar.push('امشِ ' + AR_NUM[s[1]] + (s[1] === 1 ? ' كتلة.' : ' كتل.')); }
      else { en.push('Turn ' + s[1] + '.'); ar.push('انعطف ' + (s[1] === 'left' ? 'يسارًا.' : 'يمينًا.')); }
    });
    en.push('The place is on your ' + it.side + '.'); ar.push('المكان على ' + (it.side === 'left' ? 'يسارك.' : 'يمينك.'));
    return {en: en.join(' '), ar: ar.join(' ')};
  }
  function miniDirSetup() {
    const idx = levelIndex(), pool = DIRECTION_ITEMS.filter(it => storyLevelIndex(it.level) <= idx);
    MG.items = SHUF(pool.length >= 5 ? pool : DIRECTION_ITEMS).slice(0, 5); MG.total = MG.items.length; MG.i = 0; miniDirRender();
  }
  function dirMapSvg(it, reveal, chosen) {
    const C = 76, P = 28, W = 4 * C + 2 * P, H = 3 * C + 2 * P, px = x => P + x * C, py = y => P + y * C;
    let s = '<svg class="mg-map" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Town map"><rect width="' + W + '" height="' + H + '" rx="18" fill="#dfe8c8"/>';
    for (let y = 0; y <= 3; y++) s += '<line x1="' + px(0) + '" y1="' + py(y) + '" x2="' + px(4) + '" y2="' + py(y) + '" stroke="#c4c8d4" stroke-width="12" stroke-linecap="round"/>';
    for (let x = 0; x <= 4; x++) s += '<line x1="' + px(x) + '" y1="' + py(0) + '" x2="' + px(x) + '" y2="' + py(3) + '" stroke="#c4c8d4" stroke-width="12" stroke-linecap="round"/>';
    DIRECTION_BLOCKS.forEach((row, cy) => row.forEach((b, cx) => {
      const isAns = it.answer[0] === cx && it.answer[1] === cy, isCh = chosen && chosen[0] === cx && chosen[1] === cy;
      const cls = reveal ? (isAns ? ' is-right' : isCh ? ' is-wrong' : '') : '';
      s += '<g class="mg-block' + cls + '" data-mg-block="' + cx + ',' + cy + '" tabindex="0" role="button" aria-label="' + esc(b[1]) + '"><rect x="' + (px(cx) + 12) + '" y="' + (py(cy) + 12) + '" width="' + (C - 24) + '" height="' + (C - 24) + '" rx="12"/><text x="' + (px(cx) + C / 2) + '" y="' + (py(cy) + C / 2 - 2) + '" font-size="22" text-anchor="middle">' + b[0] + '</text><text x="' + (px(cx) + C / 2) + '" y="' + (py(cy) + C / 2 + 17) + '" font-size="10.5" font-weight="700" text-anchor="middle">' + esc(state.helpArabic && b[2] ? b[2] : b[1]) + '</text></g>';
    }));
    if (reveal) { const pts = dirPath(it); s += '<polyline points="' + pts.map(p => px(p[0]) + ',' + py(p[1])).join(' ') + '" fill="none" stroke="#7C6CFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 9"/>'; }
    const sx = px(it.start[0]), sy = py(it.start[1]), v = DIR_V[it.dir], ang = Math.atan2(v[1], v[0]) * 180 / Math.PI;
    s += '<g transform="translate(' + sx + ' ' + sy + ')"><circle r="11" fill="#FFC531" stroke="#121A3A" stroke-width="3"/><g transform="rotate(' + ang + ')"><path d="M14 0 L24 0 M19 -6 L25 0 L19 6" fill="none" stroke="#121A3A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></g></svg>';
    return s;
  }
  function miniDirRender() {
    const it = MG.items[MG.i]; MG.answered = false; hideSheet(); miniSteps(); const t = dirText(it);
    $('#game-body').innerHTML = '<div class="q-meta"><span class="pill">Directions</span><span class="q-count">Question ' + (MG.i + 1) + ' of ' + MG.total + '</span></div><h2 class="q-text" id="q-text" tabindex="-1">Where does the route end?</h2><p class="mg-route">' + esc(t.en) + '</p>' + (state.helpArabic ? '<p class="mg-route-ar arabic" lang="ar" dir="rtl">' + esc(t.ar) + '</p>' : '') +
      '<div class="mg-actions mg-actions-top"><button class="btn btn-ghost" data-mg-listen>🔊 Listen</button></div><p class="q-sub">Tap the building on the map.</p><div class="mg-map-wrap">' + dirMapSvg(it, false) + '</div>';
    $('#game-scroll').scrollTop = 0; const h = $('#q-text'); if (h) h.focus({preventScroll: true});
  }
  function miniDirAnswer(cx, cy) {
    if (MG.answered) return; const it = MG.items[MG.i]; MG.answered = true;
    const ok = it.answer[0] === cx && it.answer[1] === cy; if (ok) MG.score++; MG.results[MG.i] = ok ? 'ok' : 'no';
    $('.mg-map-wrap').innerHTML = dirMapSvg(it, true, [cx, cy]); miniSteps(); sfx(ok ? 'ok' : 'no');
    const right = DIRECTION_BLOCKS[it.answer[1]][it.answer[0]];
    showSheet(ok, '<h3><span class="sheet-mark">' + ic(ok ? 'check' : 'x') + '</span>' + (ok ? 'Exactly right!' : 'Not quite.') + '</h3><p>' + (ok ? 'You followed the route to the ' : 'The route ends at the ') + '<b>' + esc(right[1]) + '</b>. The dotted line shows the way.</p><div class="sheet-actions"><button class="btn" id="go-next">' + (MG.i === MG.total - 1 ? 'See results' : 'Continue') + ic('arrow') + '</button></div>');
  }

  function miniNext() {
    if (!MG) return; hideSheet();
    if (MG.i < MG.total - 1) { MG.i++; MG.answered = false; if (MG.type === 'order') miniOrderRender(); else if (MG.type === 'directions') miniDirRender(); else if (MG.type === 'audioImage') miniAudioImageRender(); else if (MG.type === 'sentenceOrder') miniSentenceRender(); }
    else miniFinish(String(MG.total));
  }
  function miniClick(e) {
    const el = e.target;
    const close = el.closest('[data-mini-close]'); if (close) { closeGame(); openView('home'); return true; }
    const again = el.closest('[data-mini-again]'); if (again) { startMini(again.dataset.miniAgain); return true; }
    if (MG.done) return false;
    const speedAnswer=el.closest('[data-mini-speed-answer]');if(speedAnswer&&MG.type==='speed'){if(MG.answered)return true;MG.total++;const picked=decodeURIComponent(speedAnswer.dataset.miniSpeedAnswer);const ok=picked===MG.current.word;if(ok)MG.score++;recordAdaptiveResult('vocabulary',MG.current.word,ok);if(!ok)addReview(MG.current.word,MG.current.meaning);sfx(ok?'ok':'no');miniSpeedRender();return true;}
    if(el.closest('[data-mini-audio-play]')&&MG.type==='audioImage'){miniSpeech(MG.current.word);return true;}
    const audioAnswer=el.closest('[data-mini-audio-answer]');if(audioAnswer&&MG.type==='audioImage'){if(MG.answered)return true;MG.answered=true;const ok=audioAnswer.dataset.miniAudioAnswer===MG.current.word;if(ok)MG.score++;recordAdaptiveResult('listening',MG.current.word,ok);if(!ok)addReview(MG.current.word,MG.current.meaning);MG.results[MG.i]=ok?'ok':'no';sfx(ok?'ok':'no');$('.mini-picture-grid').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.dataset.miniAudioAnswer===MG.current.word)b.classList.add('is-right');else if(b===audioAnswer)b.classList.add('is-wrong');});showSheet(ok,'<h3>'+(ok?'That’s it!':'Not quite')+'</h3><p>The word is <b>'+esc(MG.current.word)+'</b> — '+esc(MG.current.meaning)+'.</p><div class="sheet-actions"><button class="btn" id="go-next">'+(MG.i===MG.total-1?'See results':'Next word')+ic('arrow')+'</button></div>');return true;}
    const sentenceWord=el.closest('[data-mini-sentence-word]');if(sentenceWord&&MG.type==='sentenceOrder'&&!MG.answered){const token=MG.tokens.find(t=>t.id===Number(sentenceWord.dataset.miniSentenceWord));if(token)MG.placed.push(token);miniSentenceRender();return true;}
    const sentenceRemove=el.closest('[data-mini-sentence-remove]');if(sentenceRemove&&MG.type==='sentenceOrder'&&!MG.answered){MG.placed.splice(Number(sentenceRemove.dataset.miniSentenceRemove),1);miniSentenceRender();return true;}
    if(el.closest('[data-mini-sentence-reset]')&&MG.type==='sentenceOrder'){MG.placed=[];MG.feedback='';miniSentenceRender();return true;}
    if(el.closest('[data-mini-sentence-check]')&&MG.type==='sentenceOrder'){if(MG.answered)return true;const expected=MG.current.text.replace(/[.!?]$/,'').toLowerCase();const actual=MG.placed.map(t=>t.word).join(' ').toLowerCase();if(actual===expected){recordAdaptiveResult('sentence',MG.current.text,true);MG.answered=true;MG.score++;MG.results[MG.i]='ok';sfx('ok');miniSpeech(MG.current.text);showSheet(true,'<h3>Perfect sentence!</h3><p>'+esc(MG.current.text)+'</p><div class="sheet-actions"><button class="btn" id="go-next">'+(MG.i===MG.total-1?'See results':'Next sentence')+ic('arrow')+'</button></div>');}else{recordAdaptiveResult('sentence',MG.current.text,false);MG.feedback='Not quite yet. Rearrange the words and try again.';sfx('no');miniSentenceRender();}return true;}
    if (el.closest('#go-next')) { miniNext(); return true; }
    const place = el.closest('[data-mg-place]');
    if (place && MG.type === 'order') { const r = MG.rounds[MG.i]; if (MG.answered) return true; const k = Number(place.dataset.mgPlace); r.pool = r.pool.filter(v => v !== k); r.placed.push(k); miniOrderRender(); return true; }
    const un = el.closest('[data-mg-unplace]');
    if (un && MG.type === 'order') { const r = MG.rounds[MG.i]; if (MG.answered) return true; const p = Number(un.dataset.mgUnplace), moved = r.placed.splice(p); r.pool.push(...moved); miniOrderRender(); return true; }
    if (el.closest('#mg-check')) { miniOrderCheck(); return true; }
    const flip = el.closest('[data-mg-flip]'); if (flip && MG.type === 'match') { miniFlip(Number(flip.dataset.mgFlip)); return true; }
    const blk = el.closest('[data-mg-block]'); if (blk && MG.type === 'directions') { const [cx, cy] = blk.dataset.mgBlock.split(',').map(Number); miniDirAnswer(cx, cy); return true; }
    if (el.closest('[data-mg-listen]') && MG.type === 'directions') { speak(dirText(MG.items[MG.i]).en); return true; }
    return false;
  }

  function closeGame() {
    if(miniTimer){clearInterval(miniTimer);miniTimer=null;} try{window.speechSynthesis?.cancel();}catch{} $('#game').hidden = true; hideSheet(); G = null; ST = null; MG = null;
    lockPage(false); renderAll();
    const h = $('.view.is-active h1'); if (h) h.focus({preventScroll: true});
  }


  /* ---------- World: tiny top-down village ---------- */
  let WORLD=null;
  function worldTask(){return WORLD&&WORLD.tasks[WORLD.index];}
  function worldObj(id){return WORLD&&WORLD.objects.find(o=>o.id===id);}
  // Shared world rules: object footprint, walkability, reach and interaction.
  // Maps may override these defaults per object without changing movement code.
  function worldFootprint(o){
    if(!o)return [];
    if(Array.isArray(o.footprint)&&o.footprint.length)return o.footprint.map(p=>({x:o.x+p.x,y:o.y+p.y}));
    if(o.id==="bridge")return [-2,-1,0,1,2].map(dx=>({x:o.x+dx,y:o.y}));
    return [{x:o.x,y:o.y}];
  }
  function worldDist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
  function worldObjectBlocks(o,x,y){
    if(!o||o.solid===false)return false;
    return worldFootprint(o).some(p=>p.x===x&&p.y===y);
  }
  function worldWalkable(x,y){
    if(!WORLD||x<0||y<0||x>=WORLD_DATA.width||y>=WORLD_DATA.height)return false;
    const ch=(WORLD.map[y]||'')[x];
    if('WH'.includes(ch))return false;
    return !WORLD.objects.some(o=>worldObjectBlocks(o,x,y));
  }
  function worldReachableFromPlayer(o,range){
    if(!o)return false;
    const radius=range==null?(o.interactionRange==null?1:o.interactionRange):range;
    return worldFootprint(o).some(cell=>worldDist(WORLD.player,cell)<=radius);
  }
  function worldNear(id){return worldReachableFromPlayer(worldObj(id));}
  function worldCheck(c){
    if(!c)return false;
    if(c.type==='sequence')return WORLD.step>=c.steps.length;
    if(c.type==='dialogue')return !!WORLD.dialogueComplete;
    if(c.type==='near'||c.type==='interact')return worldNear(c.object);
    if(c.type==='at'){const o=worldObj(c.object);return !!o&&worldFootprint(o).some(p=>p.x===WORLD.player.x&&p.y===WORLD.player.y);}
    if(c.type==='under'||c.type==='behind'){
      const o=worldObj(c.object);if(!o)return false;
      const cells=worldFootprint(o);
      return cells.some(p=>c.type==='under'
        ? WORLD.player.x===p.x&&WORLD.player.y===p.y+1
        : WORLD.player.y===p.y&&WORLD.player.x===p.x+1);
    }
    if(c.type==='on'){const o=worldObj(c.object);return !!o&&worldFootprint(o).some(p=>p.x===WORLD.player.x&&p.y===WORLD.player.y);}
    if(c.type==='between'){const a=worldObj(c.objects[0]),b=worldObj(c.objects[1]);return !!a&&!!b&&WORLD.player.y===a.y&&WORLD.player.y===b.y&&WORLD.player.x>Math.min(a.x,b.x)&&WORLD.player.x<Math.max(a.x,b.x);}
    if(c.type==='rel'){const o=worldObj(c.object);if(!o)return false;const d={left:[-1,0],right:[1,0],above:[0,-1],below:[0,1]}[c.rel];return worldFootprint(o).some(p=>WORLD.player.x===p.x+d[0]&&WORLD.player.y===p.y+d[1]);}
    if(c.type==='offset'){const s0=WORLD.taskStart||WORLD.player;return WORLD.player.x===s0.x+c.dx&&WORLD.player.y===s0.y+c.dy;}
    if(c.type==='pickup')return WORLD.carried===c.object||WORLD.picked.has(c.object);
    if(c.type==='give')return WORLD.given.has(c.item);
    return false;
  }
  function worldStep(){const t=worldTask();return t?(t.check.type==='sequence'?t.check.steps[WORLD.step]:t.check):null;}
  function worldHelpTarget(c,o){
    if(c&&c.target)return {x:c.target.x,y:c.target.y};
    if(c&&c.type==='between'&&c.objects){
      const a=worldObj(c.objects[0]),b=worldObj(c.objects[1]);
      if(a&&b)return {x:Math.round((a.x+b.x)/2),y:a.y};
    }
    if(o){
      const p=worldFootprint(o)[0]||o;
      if(c&&c.type==='under')return {x:p.x,y:p.y+1};
      if(c&&c.type==='behind')return {x:p.x+1,y:p.y};
      if(c&&c.type==='rel'){
        const d={left:[-1,0],right:[1,0],above:[0,-1],below:[0,1]}[c.rel];
        if(d)return {x:p.x+d[0],y:p.y+d[1]};
      }
      return {x:o.x,y:o.y};
    }
    return {x:WORLD.player.x,y:WORLD.player.y};
  }
  function worldEval(){
    const t=worldTask();if(!t)return false;
    if(t.check.type==='sequence'){while(WORLD.step<t.check.steps.length&&worldCheck(t.check.steps[WORLD.step]))WORLD.step++;return WORLD.step>=t.check.steps.length;}
    return worldCheck(t.check);
  }
  function worldPass(x,y){return worldWalkable(x,y);}
  function worldFeedback(message){
    let note=$('#world-feedback');
    if(!note){note=document.createElement('p');note.id='world-feedback';note.className='world-feedback';note.setAttribute('role','status');const stage=$('.world-stage');if(stage)stage.insertBefore(note,stage.firstChild);}
    note.textContent=message;note.classList.remove('is-visible');void note.offsetWidth;note.classList.add('is-visible');
  }
  function worldMove(k){
    if(!WORLD||WORLD.mode!=='play')return;let dx=0,dy=0;
    if(k==='ArrowUp'||k.toLowerCase()==='w')dy=-1;else if(k==='ArrowDown'||k.toLowerCase()==='s')dy=1;else if(k==='ArrowLeft'||k.toLowerCase()==='a')dx=-1;else if(k==='ArrowRight'||k.toLowerCase()==='d')dx=1;
    const p=WORLD.player;
    const moving=Math.min(1,(performance.now()-(p.moveAt||0))/160);
    if(p.moveAt&&moving<1){p.queuedKey=k;return;}
    const x=p.x+dx,y=p.y+dy;
    if(!worldPass(x,y)){p.queuedKey=null;WORLD.bump=performance.now()+120;worldFeedback('That way is blocked. Look for an open path.');worldDraw();return;}
    if(dx)WORLD.facing=dx;p.fromX=p.x;p.fromY=p.y;p.x=x;p.y=y;p.moveAt=performance.now();p.queuedKey=null;WORLD.tries++;WORLD.moves++;
    const here=WORLD.objects.find(o=>o.id==='blue-house'&&worldReachableFromPlayer(o));
    const red=WORLD.objects.find(o=>o.id==='red-house'&&worldReachableFromPlayer(o));
    const task=worldTask();
    if(task&&task.feedback&&here&&task.check.object==='red-house')worldFeedback('That is the blue house, not the red one. Look for the red door.');
    else if(task&&task.feedback&&red&&task.check.object==='blue-house')worldFeedback('That is the red house, not the blue one. Look for the blue door.');
    if(task&&task.negObject&&!worldEval()){const n=worldObj(task.negObject);if(n&&worldReachableFromPlayer(n))worldFeedback('That is the '+task.negName+', not the '+task.goalName+'. Look again.');}
    if(WORLD.needLeave){const s0=worldStep();if(s0&&!worldCheck(s0))WORLD.needLeave=false;worldDraw();return;}
    worldDraw();if(worldEval())worldComplete();
  }
  function worldOpenConversation(task,person){
    if(!WORLD||!task||!task.conversation)return;
    WORLD.conversationOpen=true;WORLD.dialogueComplete=false;
    const old=$('#world-conversation');if(old)old.remove();
    const options=task.conversation.options||[];
    const panel=document.createElement('section');panel.id='world-conversation';panel.className='world-conversation';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','world-conversation-title');
    panel.innerHTML='<div class="world-conversation-card"><p class="world-kicker">'+esc(person.name)+'</p><h2 id="world-conversation-title">'+esc(task.conversation.prompt||'Choose your response')+'</h2><div class="world-conversation-options">'+options.map((o,i)=>'<button type="button" data-world-dialog-choice="'+i+'">'+esc(o.text)+'</button>').join('')+'</div><p class="world-conversation-feedback" aria-live="polite"></p><button type="button" class="world-secondary" data-world-dialog-close>Back to exploring</button></div>';
    $('#world-game').appendChild(panel);
  }
  function worldInteract(){
    if(!WORLD||WORLD.mode!=='play')return;const step=worldStep();if(!step)return;
    if(step.type!=='pickup'&&step.type!=='give'){const person=WORLD.objects.find(o=>o.person&&worldReachableFromPlayer(o));if(person){const activeTask=worldTask();if(activeTask&&activeTask.conversation&&activeTask.check.object===person.id){worldOpenConversation(activeTask,person);return;}const lines={'baker':'Hello! Could you help me with my bakery today?','market-vendor':'Welcome! What would you like to buy today?','market-customer':'Excuse me, can you help me find the right stall?','station-clerk':'Hello! Where would you like to travel today?','traveller':'I am looking for my platform. Can you help me?','family':'Welcome home! Could you help us find a few things?'};const line=lines[person.id]||'Hello there! Can you help me with something?';worldFeedback(line);speak(line);return;}}
    if(step.type==='pickup'){
      const o=worldObj(step.object);
      if(o&&worldReachableFromPlayer(o)){WORLD.carried=o.id;WORLD.picked.add(o.id);WORLD.objects=WORLD.objects.filter(v=>v.id!==o.id);if(worldEval())worldComplete();else worldStatus();worldDraw();return;}
    }
    if(step.type==='give'){
      const o=worldObj(step.person);
      if(WORLD.carried===step.item&&o&&worldReachableFromPlayer(o)){WORLD.given.add(step.item);WORLD.carried=null;if(worldEval())worldComplete();else worldStatus();worldDraw();return;}
    }
    toast('Move next to the item or person, then press Space.');
  }
  /* ---------- World practice runs: randomised layout + generated missions ---------- */
  const W_AR = {umbrella:'المظلة',rain:'المطر', 'airport agent':'موظف المطار','check-in desk':'مكتب تسجيل الوصول',gate:'البوابة','departure board':'لوحة المغادرة',suitcase:'حقيبة السفر',nurse:'الممرضة',doctor:'الطبيب','reception desk':'مكتب الاستقبال',medicine:'الدواء','hospital bed':'سرير المستشفى',receptionist:'موظف الاستقبال',manager:'المدير',calendar:'التقويم',computer:'الحاسوب',document:'الوثيقة',tree:'الشجرة','red house':'البيت الأحمر','blue house':'البيت الأزرق',well:'البئر',baker:'الخبّاز',bakery:'المخبز','fruit stall':'كشك الفاكهة','bread stall':'كشك الخبز',vendor:'البائع',customer:'الزبون',apples:'التفاح',bread:'الخبز','ticket desk':'شباك التذاكر',clerk:'الموظف',traveller:'المسافر',ticket:'التذكرة',sofa:'الأريكة',table:'الطاولة',family:'العائلة',lamp:'المصباح',book:'الكتاب',key:'المفتاح',basket:'السلة',pond:'البركة',bench:'المقعد',swing:'الأرجوحة',slide:'المنزلقة','ice-cream seller':'بائع المثلجات',child:'الطفل',ball:'الكرة',kite:'الطائرة الورقية',board:'السبّورة',teacher:'المعلّم',bookshelf:'رف الكتب',clock:'الساعة','front desk':'المكتب الأمامي','back desk':'المكتب الخلفي',student:'الطالب',bag:'الحقيبة',pencil:'القلم'};
  const W_MEAN = {tree:'a tall plant with a trunk',well:'a deep hole for water',baker:'a person who makes bread',bakery:'a shop that sells bread',vendor:'a person who sells things',customer:'a person who buys things',apples:'round fruit, red or green',bread:'food made from flour',ticket:'a paper that lets you travel',sofa:'a long soft seat',table:'furniture with a flat top',family:'parents, children and relatives',lamp:'a light you can switch on',book:'pages joined together for reading',key:'a small tool for opening locks',basket:'a container made of woven strips',pond:'a small area of still water',bench:'a long seat for several people',swing:'a seat that moves back and forth',child:'a young person',ball:'a round object used in games',kite:'a toy that flies in the wind',board:'a flat surface to write on',teacher:'a person who helps you learn',bookshelf:'furniture for books',clock:'a device that shows the time',student:'a person who studies',bag:'a container for carrying things',pencil:'a thin tool for writing',clerk:'a person who works at a desk',traveller:'a person on a journey',seller:'a person who sells things'};
  const W_ARN = ['صفر','خطوة واحدة','خطوتين','ثلاث خطوات','أربع خطوات'];
  const W_NUM = ['zero','one','two','three','four'];
  const wArName = o => W_AR[o.name] || o.name;
  function wCompass(from, to) { const dy = to.y - from.y, dx = to.x - from.x; const v = Math.abs(dy) < 2 ? '' : dy < 0 ? 'north' : 'south', h = Math.abs(dx) < 2 ? '' : dx < 0 ? 'west' : 'east'; return v && h ? v + '-' + h : v || h || 'very close'; }
  function wReachable() {
    const seen = new Set(), q = [[WORLD.player.x, WORLD.player.y]], key = (x, y) => x + ',' + y; seen.add(key(q[0][0], q[0][1]));
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!seen.has(key(nx, ny)) && worldWalkable(nx, ny)) { seen.add(key(nx, ny)); q.push([nx, ny]); } } }
    return seen;
  }
  function wRandomiseLayout() {
    // Move people and pick-up items to new free cells so every run looks different.
    const sd = WORLD.player, taken = [{x: sd.x, y: sd.y}];
    const movable = WORLD.objects.filter(o => (o.person || o.pickup) && o.id !== 'bridge');
    movable.forEach(o => { o.x = -99; o.y = -99; });
    const reach = [...wReachable()].map(s => s.split(',').map(Number)).filter(([x, y]) => y >= 2 && y <= 12 && x >= 1 && x <= 18);
    movable.forEach(o => {
      const cands = SHUF(reach).filter(([x, y]) => taken.every(t => Math.abs(t.x - x) + Math.abs(t.y - y) >= 3) && !WORLD.objects.some(p => p !== o && worldFootprint(p).some(c => c.x === x && c.y === y)));
      const pick = cands[0] || reach[Math.floor(Math.random() * reach.length)]; o.x = pick[0]; o.y = pick[1]; taken.push({x: o.x, y: o.y});
    });
  }
  function wGenerate(count) {
    const reach = wReachable(), lvl = levelIndex();
    const uniqueName = o => WORLD.objects.filter(p => p.name === o.name).length === 1;
    const near = o => worldFootprint(o).some(c => [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].some(([dx, dy]) => reach.has((c.x + dx) + ',' + (c.y + dy))));
    const places = WORLD.objects.filter(o => !o.person && !o.pickup && o.name && uniqueName(o) && near(o) && !['river', 'bridge', 'door'].includes(o.id));
    const people = WORLD.objects.filter(o => o.person && uniqueName(o) && near(o));
    let items = WORLD.objects.filter(o => o.pickup && uniqueName(o) && near(o));
    const usedPick = new Set(), tasks = [], N = n => W_NUM[n];
    const nm = o => o.name, art = o => 'the ' + o.name;
    const mean = o => W_MEAN[o.name] ? [o.name, W_MEAN[o.name], 'A1'] : null;
    const stepNear = o => ({type: 'near', object: o.id, target: {x: o.x, y: o.y}});
    const T = [];
    const push = (kind, instruction, ar, check, extra) => T.push(Object.assign({id: 'world-gen-' + WORLD.region + '-' + kind, region: WORLD.region, level: 'A1', instruction, ar, check, generated: true}, extra));
    const any = list => list[Math.floor(Math.random() * list.length)];
    const makers = [];
    const addMaker = (minLevel, run) => makers.push({minLevel, run});
    if (places.length) addMaker(0, () => { const o = any(places); push('goto', any(['Go to ', 'Find ', 'Walk to ']) + art(o) + '.', 'اذهب إلى ' + wArName(o) + '.', stepNear(o), {hint: 'Look to the ' + wCompass(WORLD.player, o) + '.', words: [mean(o)].filter(Boolean)}); });
    if (people.length) addMaker(0, () => { const o = any(people); push('speak', 'Go and speak to the ' + nm(o) + '.', 'اذهب وتحدّث مع ' + wArName(o) + '.', stepNear(o), {hint: 'Look to the ' + wCompass(WORLD.player, o) + '.', words: [mean(o)].filter(Boolean)}); });
    addMaker(0, () => { const dirs = [['right', 1, 0, 'يمينًا'], ['left', -1, 0, 'يسارًا'], ['up', 0, -1, 'للأعلى'], ['down', 0, 1, 'للأسفل']]; for (let k = 0; k < 20; k++) { const d = any(dirs), n = 2 + Math.floor(Math.random() * 3), tx = WORLD.player.x + d[1] * n, ty = WORLD.player.y + d[2] * n; let ok = true; for (let s = 1; s <= n; s++) if (!worldWalkable(WORLD.player.x + d[1] * s, WORLD.player.y + d[2] * s)) ok = false; if (ok) { push('steps', 'Walk ' + N(n) + ' steps ' + d[0] + '.', 'امشِ ' + AR_NUM_STEPS(n) + ' ' + d[3] + '.', {type: 'offset', n, flex: true, dx: d[1] * n, dy: d[2] * n, target: {x: tx, y: ty}}, {hint: 'Count your steps: ' + n + ' ' + d[0] + '.', words: [[d[0], d[0] === 'up' ? 'towards the top' : d[0] === 'down' ? 'towards the bottom' : 'in that direction', 'A1'], ['step', 'one movement of your foot', 'A1']]}); return; } } });
    if (items.length) addMaker(0, () => { const o = any(items); if (usedPick.has(o.id)) return; usedPick.add(o.id); push('pick', 'Pick up the ' + nm(o) + '.', 'التقط ' + wArName(o) + '.', {type: 'pickup', object: o.id, target: {x: o.x, y: o.y}}, {hint: 'Look to the ' + wCompass(WORLD.player, o) + '.', words: [mean(o), ['pick up', 'lift something', 'A2']].filter(Boolean)}); });
    if (items.length && people.length) addMaker(1, () => { const o = any(items), p = any(people); if (usedPick.has(o.id)) return; usedPick.add(o.id); push('fetch', 'Pick up the ' + nm(o) + ' and give it to the ' + nm(p) + '.', 'التقط ' + wArName(o) + ' وأعطه إلى ' + wArName(p) + '.', {type: 'sequence', steps: [{type: 'pickup', object: o.id, target: {x: o.x, y: o.y}}, {type: 'give', item: o.id, person: p.id, target: {x: p.x, y: p.y}}]}, {level: 'A2', hint: 'First the ' + nm(o) + ' (' + wCompass(WORLD.player, o) + '), then the ' + nm(p) + '.', words: [mean(o), mean(p), ['give', 'hand something to someone', 'A1']].filter(Boolean)}); });
    if (places.length + people.length >= 2) addMaker(1, () => { const pool = places.concat(people); const a = any(pool); let b = any(pool); for (let k = 0; k < 8 && b === a; k++) b = any(pool); if (a === b) return; push('two', 'Go to the ' + nm(a) + ', then go to the ' + nm(b) + '.', 'اذهب إلى ' + wArName(a) + '، ثم إلى ' + wArName(b) + '.', {type: 'sequence', steps: [stepNear(a), stepNear(b)]}, {level: 'A2', hint: 'First look ' + wCompass(WORLD.player, a) + '.', words: [mean(a), mean(b), ['then', 'after that', 'A1']].filter(Boolean)}); });
    if (places.length >= 2) addMaker(2, () => { const a = any(places); let b = any(places); for (let k = 0; k < 8 && b === a; k++) b = any(places); if (a === b) return; push('not', 'Go to the ' + nm(a) + ', not the ' + nm(b) + '.', 'اذهب إلى ' + wArName(a) + ' وليس ' + wArName(b) + '.', stepNear(a), {level: 'B1', negObject: b.id, negName: nm(b), goalName: nm(a), hint: 'The ' + nm(a) + ' is to the ' + wCompass(WORLD.player, a) + '.', words: [mean(a), mean(b), ['not', 'used to say no', 'A1']].filter(Boolean)}); });
    if (places.length) addMaker(2, () => { for (let k = 0; k < 12; k++) { const o = any(places), s = any([['left', -1, 0, 'يسار'], ['right', 1, 0, 'يمين'], ['above', 0, -1, 'أعلى'], ['below', 0, 1, 'أسفل']]); const c = worldFootprint(o)[0], tx = c.x + s[1], ty = c.y + s[2]; if (worldWalkable(tx, ty) && reach.has(tx + ',' + ty)) { push('side', 'Stand ' + (s[0] === 'above' || s[0] === 'below' ? '' : 'on the ') + s[0] + (s[0] === 'above' || s[0] === 'below' ? ' ' : ' side of ') + 'the ' + nm(o) + '.', 'قف ' + (s[0] === 'above' ? 'فوق ' : s[0] === 'below' ? 'تحت ' : 'على ' + s[3] + ' ') + wArName(o) + '.', {type: 'rel', object: o.id, rel: s[0], target: {x: tx, y: ty}}, {level: 'B1', hint: 'Stand ' + s[0] + ' the ' + nm(o) + ' (' + wCompass(WORLD.player, o) + ' of you).', words: [mean(o), [s[0], 'a position relative to something', 'A2']].filter(Boolean)}); return; } } });
    if (items.length && people.length && places.length) addMaker(3, () => { const o = any(items), p = any(people), pl = any(places); if (usedPick.has(o.id)) return; usedPick.add(o.id); push('three', 'First go to the ' + nm(pl) + ', then pick up the ' + nm(o) + ', and finally give it to the ' + nm(p) + '.', 'أولًا اذهب إلى ' + wArName(pl) + '، ثم التقط ' + wArName(o) + '، وأخيرًا أعطه إلى ' + wArName(p) + '.', {type: 'sequence', steps: [stepNear(pl), {type: 'pickup', object: o.id, target: {x: o.x, y: o.y}}, {type: 'give', item: o.id, person: p.id, target: {x: p.x, y: p.y}}]}, {level: 'B2', hint: 'Three stops: ' + nm(pl) + ' → ' + nm(o) + ' → ' + nm(p) + '.', words: [mean(pl), mean(o), mean(p), ['finally', 'as the last step', 'B1']].filter(Boolean)}); });
    // Build a varied run: avoid repeating the same objective, and cap each mission pattern
    // before allowing a third variant. Rejected attempts must not consume a pickup item.
    const order = SHUF(makers.map((m, i) => i)).filter(i => makers[i].minLevel <= lvl);
    const signature = t => {
      const check = c => !c ? '' : c.type === 'sequence'
        ? 'sequence(' + c.steps.map(check).join('>') + ')'
        : [c.type, c.object || '', c.item || '', c.person || '', c.rel || '',
           c.n || '', c.dx || '', c.dy || '', (c.objects || []).join(',')].join(':');
      return check(t.check) + '|' + (t.negObject || '');
    };
    const kindCounts = new Map(), signatures = new Set();
    let guard = 0;
    while (T.length < count && guard++ < 180 && order.length) {
      const maker = makers[order[(guard - 1) % order.length]];
      const maxPerKind = T.length < count - 2 ? 2 : 3;
      const before = T.length, oldPicks = new Set(usedPick);
      maker.run();
      if (T.length === before) continue;
      const task = T[T.length - 1], sig = signature(task), kind = task.id;
      const sameKind = kindCounts.get(kind) || 0;
      if (signatures.has(sig) || sameKind >= maxPerKind) {
        T.pop();
        usedPick.clear(); oldPicks.forEach(id => usedPick.add(id));
        continue;
      }
      signatures.add(sig); kindCounts.set(kind, sameKind + 1);
    }
    // Fill a rare short run only with a fresh objective; never repeat an identical target.
    while (T.length < count && guard++ < 260 && order.length) {
      const maker = makers[order[(guard - 1) % order.length]], before = T.length, oldPicks = new Set(usedPick);
      maker.run();
      if (T.length === before) continue;
      const task = T[T.length - 1], sig = signature(task), kind = task.id, sameKind = kindCounts.get(kind) || 0;
      if (signatures.has(sig) || sameKind >= 3) {
        T.pop(); usedPick.clear(); oldPicks.forEach(id => usedPick.add(id)); continue;
      }
      signatures.add(sig); kindCounts.set(kind, sameKind + 1);
    }
    return SHUF(T.slice(0, count)).map((t, i) => Object.assign(t, {id: t.id + '-' + i}));
  }
  function wFixOffset(t) {
    const c = t && t.check; if (!c || c.type !== 'offset' || !c.flex) return;
    const n = c.n, px = WORLD.player.x, py = WORLD.player.y;
    const dirs = [['right', 1, 0, 'يمينًا'], ['left', -1, 0, 'يسارًا'], ['up', 0, -1, 'للأعلى'], ['down', 0, 1, 'للأسفل']];
    const ok = d => { for (let s = 1; s <= n; s++) if (!worldWalkable(px + d[1] * s, py + d[2] * s)) return false; return true; };
    const d = SHUF(dirs).find(ok); if (!d) return;
    c.dx = d[1] * n; c.dy = d[2] * n; c.target = {x: px + c.dx, y: py + c.dy};
    t.instruction = 'Walk ' + W_NUM[n] + ' steps ' + d[0] + '.'; t.ar = 'امشِ ' + AR_NUM_STEPS(n) + ' ' + d[3] + '.'; t.hint = 'Count your steps: ' + n + ' ' + d[0] + '.';
    t.words = [[d[0], d[0] === 'up' ? 'towards the top' : d[0] === 'down' ? 'towards the bottom' : 'in that direction', 'A1'], ['step', 'one movement of your foot', 'A1']];
  }
  function AR_NUM_STEPS(n) { return W_ARN[n] || (n + ' خطوات'); }
  function worldAwardPractice(stars, t) {
    if (DEV_MODE.active && hasDeveloperAccess()) return 0;
    const gain = stars * 3; state.xp += gain;
    (t.words || []).forEach(w => { if (!state.words.some(v => String(v[0]).toLowerCase() === String(w[0]).toLowerCase())) { state.words.push(w); recordLearningActivity({words:1}); } });
    state.world.runs = state.world.runs || 0; save(); renderHeader(); renderWords(); return gain;
  }
  function worldAward(stars,t){
    if(DEV_MODE.active&&hasDeveloperAccess())return 0;
    const old=Number(state.world.stars[t.id]||0),first=!state.world.done.includes(t.id),earned=Math.max(0,stars-old)*5;
    const today=dayKey();
    // Reset daily/weekly counters before counting this first-time completion.
    if(first&&state.dailyQuestDate!==today){state.dailyQuestDate=today;state.dailyQuestProgress=0;state.dailyQuestClaimed=false;state.dailyCorrect=0;state.dailyXp=0;state.daily=0;}
    if(first&&state.weeklyKey!==weekKey()){state.weeklyKey=weekKey();state.weeklyProgress=0;state.weeklyClaimed=false;}
    if(first){
      state.world.done.push(t.id);state.quests++;state.daily=Math.min(2,(Number(state.daily)||0)+1);state.dailyQuestProgress=state.daily;
      state.weeklyProgress=(Number(state.weeklyProgress)||0)+1;
      if(state.lastDay!==today){const y=new Date();y.setDate(y.getDate()-1);const two=new Date();two.setDate(two.getDate()-2);
        if(state.lastDay===dayKey(y))state.streak=(state.streak||0)+1;
        else if(state.lastDay===dayKey(two)&&state.streakFreezes>0){state.streakFreezes--;state.streak=(state.streak||0)+1;}
        else state.streak=1;state.lastDay=today;
      }
    }
    if(stars>old)state.world.stars[t.id]=stars;
    state.xp+=earned;
    if(first){
      state.dailyXp=(Number(state.dailyXp)||0)+earned;
      const dailyTask=DAILY_QUESTS[(new Date().getDate()-1)%DAILY_QUESTS.length];
      const progress=dailyTask.kind==='quests'?state.daily:dailyTask.kind==='xp'?state.dailyXp:state.dailyCorrect;
      if(!state.dailyQuestClaimed&&progress>=dailyTask.target){state.dailyQuestClaimed=true;state.xp+=dailyTask.reward;}
      if(!state.weeklyClaimed&&state.weeklyProgress>=5){state.weeklyClaimed=true;state.xp+=60;}
      const lvl=currentLevel();if(!state.completed.includes(lvl.id))state.completed.push(lvl.id);
    }
    (t.words||[]).forEach(w=>{if(!state.words.some(v=>String(v[0]).toLowerCase()===String(w[0]).toLowerCase())){state.words.push(w);recordLearningActivity({words:1});}});
    save();renderHeader();renderWords();renderTrophies();return earned;
  }
  function worldShell(inner){const t=worldTask(),progress=WORLD&&WORLD.tasks.length?Math.round(((WORLD.index+(WORLD.mode==='success'?1:0))/WORLD.tasks.length)*100):0;return '<div class="world-top"><div class="world-task-count">Task <b>'+(WORLD.index+1)+'</b> / '+WORLD.tasks.length+'<span class="world-progress-track" role="progressbar" aria-label="Mission progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'"><span style="width:'+progress+'%"></span></span></div>'+(t&&t.dialogue?'<div class="world-dialogue">'+esc(t.dialogue)+'</div>':'')+'<div class="world-instruction"><strong>'+esc(t?t.instruction:'Adventure complete!')+'</strong><span>Explore the map and follow the instruction.</span>'+(t&&WORLD&&WORLD.mode==='play'?'<button type="button" class="translate-btn" data-translate-world aria-expanded="false">ع ترجمة التعليمات</button><p id="world-translation" class="translation-result" lang="ar" dir="rtl" hidden></p>':'')+'</div><div class="world-top-actions"><button type="button" class="world-home" data-world-home>⌂ Home</button><button class="world-exit" data-world-exit aria-label="Exit World">✕</button></div></div>'+inner;}
  function worldDraw(){
    if(!WORLD||WORLD.mode!=='play')return;if(WORLD.idle){clearTimeout(WORLD.idle);WORLD.idle=0;}const c=$('#world-canvas');if(!c)return;const r=c.getBoundingClientRect(),d=Math.max(1,Math.min(2,devicePixelRatio||1));if(!r.width||!r.height)return;
    if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);}
    const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,r.width,r.height);x.fillStyle=({market:'#d9c9a2',station:'#cfd3da',home:'#8a6d52',school:'#8a6d52',park:'#94c57d',village:'#8cba77'})[WORLD.region]||'#8fbe7a';x.fillRect(0,0,r.width,r.height);
    const MW=(WORLD.map[0]||'').length||20,MH=WORLD.map.length||14,fit=Math.min(r.width/MW,r.height/MH),tile=Math.max(fit,Math.min(38,Math.max(30,r.height/8.5)));
    // Camera: when the map is larger than the screen (phones), follow the player instead of shrinking everything.
    const pp=WORLD.player,el=Math.min(1,(performance.now()-(pp.moveAt||0))/160),ee=el*el*(3-2*el),pcx=(pp.fromX+(pp.x-pp.fromX)*ee+.5)*tile,pcy=(pp.fromY+(pp.y-pp.fromY)*ee+.5)*tile;
    const ox=tile*MW<=r.width?(r.width-tile*MW)/2:Math.min(0,Math.max(r.width-tile*MW,r.width/2-pcx)),oy=tile*MH<=r.height?(r.height-tile*MH)/2:Math.min(0,Math.max(r.height-tile*MH,r.height/2-pcy));WORLD.tile=tile;WORLD.ox=ox;WORLD.oy=oy;
    const theme=WORLD.region||'village';
    // Soft, cohesive top-down village art: layered terrain, curved paths and hand-drawn landmarks.
    const seeded=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
    const grass=['#8dbd78','#91c27b','#96c780','#89b975'];
    const roundRect=(ctx,rx,ry,rw,rh,rr,fill,stroke)=>{ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,rr);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}};
    const pathColor={R:'#d6bd8b',B:'#876044',W:'#4e9ea8',T:'#426f4d',H:'#d5b38a'};
    function drawTheme(t){
      const W=MW*tile,H=MH*tile;
      if(t==='market'){
        x.fillStyle='#d9c9a2';x.fillRect(ox,oy,W,H);
        for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){const px=ox+gx*tile,py=oy+gy*tile,sd=seeded(gx,gy);x.fillStyle=sd>.5?'rgba(150,120,80,.12)':'rgba(255,248,225,.14)';x.beginPath();x.roundRect(px+tile*.06,py+tile*.06,tile*.88,tile*.88,tile*.12);x.fill();}
        for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){if((WORLD.map[gy]||'')[gx]==='R'){const px=ox+gx*tile,py=oy+gy*tile;x.fillStyle='#ecdcb4';x.fillRect(px,py,tile+.4,tile+.4);}}
        // Small planted corners frame the plaza without narrowing the walking lanes.
        for(const [gx,gy] of [[1,1],[18,1],[1,12],[18,12]]){drawTree(ox+(gx+.5)*tile,oy+(gy+.5)*tile);}
        function marketPlanter(gx,gy,flip=false){
          const px=ox+gx*tile,py=oy+gy*tile;
          x.fillStyle='rgba(65,70,48,.18)';x.beginPath();x.ellipse(px+tile*.5,py+tile*.72,tile*.38,tile*.13,0,0,Math.PI*2);x.fill();
          roundRect(x,px+tile*.16,py+tile*.3,tile*.68,tile*.38,tile*.1,'#b77e52','#80563b');
          x.fillStyle='#6c9a58';x.beginPath();x.ellipse(px+tile*.5,py+tile*.3,tile*.31,tile*.2,0,0,Math.PI*2);x.fill();
          for(let n=0;n<3;n++){x.fillStyle=(n+gx)%2?'#f4d58a':'#e98b83';x.beginPath();x.arc(px+tile*(.32+n*.17),py+tile*(.25+(n%2)*.08),tile*.055,0,Math.PI*2);x.fill();}
        }
        for(const [gx,gy,flip] of [[3,2,false],[16,2,true],[3,11,false],[16,11,true]])marketPlanter(gx,gy,flip);
        // A small timber welcome sign makes the market entrance legible at a glance.
        const sgx=10,sgy=2,scx=ox+(sgx+.5)*tile,scy=oy+(sgy+.5)*tile;
        x.fillStyle='#765039';x.fillRect(scx-tile*.045,scy-tile*.08,tile*.09,tile*.42);
        roundRect(x,scx-tile*.38,scy-tile*.22,tile*.76,tile*.22,tile*.045,'#a96d45','#70482f');
        x.fillStyle='#fff0c8';x.font='bold '+Math.max(6,tile*.12)+'px sans-serif';x.textAlign='center';x.fillText('MARKET',scx,scy-tile*.075);
      }else if(t==='station'){
        x.fillStyle='#cfd3da';x.fillRect(ox,oy,W,H);
        for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){if((gx+gy)%2===0){x.fillStyle='rgba(255,255,255,.18)';x.fillRect(ox+gx*tile,oy+gy*tile,tile,tile);}}
        // two railway lines
        for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){if((WORLD.map[gy]||'')[gx]==='B'){const px=ox+gx*tile,py=oy+gy*tile;x.fillStyle='#8a7a68';x.fillRect(px,py+tile*.12,tile+.4,tile*.76);x.fillStyle='#5b4a3b';for(let k=0;k<3;k++)x.fillRect(px+tile*(.1+k*.33),py+tile*.08,tile*.12,tile*.84);x.fillStyle='#4b5563';x.fillRect(px,py+tile*.28,tile+.4,tile*.08);x.fillRect(px,py+tile*.64,tile+.4,tile*.08);}}
        // platform edge strips
        x.fillStyle='#f4c94a';for(const row of [4,6,8])x.fillRect(ox,oy+row*tile+tile*.9,W,tile*.08);
      }else if(t==='park'){
        for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){const ch=(WORLD.map[gy]||'')[gx],px=ox+gx*tile,py=oy+gy*tile;
          if(ch==='R'){x.fillStyle='#dcc799';x.fillRect(px,py,tile+.4,tile+.4);}
          }
         {let x0=99,y0=99,x1=-1,y1=-1;for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++)if((WORLD.map[gy]||'')[gx]==='W'){x0=Math.min(x0,gx);y0=Math.min(y0,gy);x1=Math.max(x1,gx);y1=Math.max(y1,gy);}
           if(x1>=0){const bx=ox+x0*tile,by=oy+y0*tile,bw=(x1-x0+1)*tile,bh=(y1-y0+1)*tile,rr=Math.min(bw,bh)*.42;
             x.fillStyle='rgba(40,70,45,.18)';x.beginPath();x.roundRect(bx-tile*.1,by+tile*.12,bw+tile*.2,bh+tile*.12,rr+tile*.1);x.fill();
             roundRect(x,bx-tile*.14,by-tile*.14,bw+tile*.28,bh+tile*.28,rr+tile*.12,'#d9cba3','#b9a77b');
             const gr=x.createLinearGradient(bx,by,bx,by+bh);gr.addColorStop(0,'#7cc6d6');gr.addColorStop(1,'#4f9fb8');
             x.beginPath();x.roundRect(bx,by,bw,bh,rr);x.fillStyle=gr;x.fill();
             x.strokeStyle='rgba(235,250,248,.55)';x.lineWidth=Math.max(1,tile*.04);x.lineCap='round';
             for(let k=0;k<5;k++){const rx=bx+bw*(.18+seeded(k,3)*.55),ry=by+bh*(.2+seeded(3,k)*.6);x.beginPath();x.ellipse(rx,ry,tile*.3,tile*.09,0,.2,Math.PI*1.6);x.stroke();}
             for(let k=0;k<3;k++){const rx=bx+bw*(.2+seeded(k,9)*.6),ry=by+bh*(.25+seeded(9,k)*.5);x.fillStyle='#4f9a5c';x.beginPath();x.arc(rx,ry,tile*.14,.3,Math.PI*2-.3);x.lineTo(rx,ry);x.fill();if(k===1){x.fillStyle='#f6c6d8';x.beginPath();x.arc(rx+tile*.02,ry-tile*.02,tile*.05,0,Math.PI*2);x.fill();}}
           }}
        for(const [gx,gy] of [[0,0],[3,1],[18,0],[1,6],[18,11],[10,12],[6,13],[12,1]]){drawTree(ox+(gx+.5)*tile,oy+(gy+.5)*tile);}
      }else if(t==='school'){
        x.fillStyle='#e8dcc4';x.fillRect(ox,oy,W,H);
        for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){if((gx+gy)%2===0){x.fillStyle='rgba(120,100,70,.08)';x.fillRect(ox+gx*tile,oy+gy*tile,tile,tile);}}
        // Schoolyard: a welcoming path, planted borders and a proper front-facing school.
        x.fillStyle='#8a6d52';x.fillRect(ox,oy,W,tile*.45);x.fillRect(ox,oy+H-tile*.45,W,tile*.45);x.fillRect(ox,oy,tile*.45,H);x.fillRect(ox+W-tile*.45,oy,tile*.45,H);
        // Curving-looking stepping-stone approach from the gate to the entrance.
        for(let n=0;n<6;n++){const px=ox+tile*(9.1+(n%2)*.28),py=oy+tile*(4.1+n*.43);roundRect(x,px,py,tile*.48,tile*.27,tile*.08,n%2?'#d5c6a7':'#e3d6bd','rgba(120,98,69,.22)');}
        // Low hedges and flower beds stay at the yard edges.
        for(const [gx,gy] of [[2,2],[4,2],[15,2],[17,2],[2,10],[17,10]]){
          const px=ox+gx*tile,py=oy+gy*tile;
          x.fillStyle='rgba(54,88,51,.18)';x.beginPath();x.ellipse(px+tile*.5,py+tile*.58,tile*.42,tile*.16,0,0,Math.PI*2);x.fill();
          roundRect(x,px+tile*.08,py+tile*.25,tile*.84,tile*.45,tile*.12,'#719b61','#537b4a');
          for(let k=0;k<3;k++){x.fillStyle=k%2?'#f2c6a7':'#f6e1a1';x.beginPath();x.arc(px+tile*(.25+k*.24),py+tile*.27,tile*.045,0,Math.PI*2);x.fill();}
        }
        // Main building has a roof, shaded side wall, tall windows and a clear doorway.
        const bx=ox+tile*6.5,by=oy+tile*.95,bw=tile*7,bh=tile*2.65;
        x.fillStyle='rgba(63,59,47,.22)';x.beginPath();x.ellipse(bx+bw*.52,by+bh+tile*.12,bw*.52,tile*.18,0,0,Math.PI*2);x.fill();
        x.fillStyle='#a6b69d';x.beginPath();x.moveTo(bx+bw,by+tile*.2);x.lineTo(bx+bw+tile*.35,by+tile*.42);x.lineTo(bx+bw+tile*.35,by+bh);x.lineTo(bx+bw,by+bh);x.closePath();x.fill();
        roundRect(x,bx,by,bw,bh,tile*.06,'#e8dfc8','#927b5d');
        x.fillStyle='#b96f52';x.beginPath();x.moveTo(bx-tile*.25,by+tile*.12);x.lineTo(bx+bw*.5,by-tile*.62);x.lineTo(bx+bw+tile*.25,by+tile*.12);x.closePath();x.fill();
        x.strokeStyle='#e6b08a';x.lineWidth=tile*.055;x.beginPath();x.moveTo(bx-tile*.18,by+tile*.12);x.lineTo(bx+bw*.5,by-tile*.52);x.lineTo(bx+bw+tile*.18,by+tile*.12);x.stroke();
        for(const wx of [7.35,8.65,12.35,13.65]){
          roundRect(x,ox+tile*wx,by+tile*.62,tile*.78,tile*.9,tile*.045,'#f7e9c8','#9b7958');
          roundRect(x,ox+tile*(wx+.09),by+tile*.71,tile*.6,tile*.7,tile*.025,'#91c9d5','#6b8d91');
          x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(1,tile*.025);x.beginPath();x.moveTo(ox+tile*(wx+.39),by+tile*.72);x.lineTo(ox+tile*(wx+.39),by+tile*1.39);x.stroke();
        }
        roundRect(x,bx+bw*.43,by+tile*1.55,bw*.14,tile*1.08,tile*.035,'#76533d','#5b4030');
        x.fillStyle='#e6c078';x.beginPath();x.arc(bx+bw*.535,by+tile*2.08,tile*.035,0,Math.PI*2);x.fill();
        // School plaque and broad entrance steps.
        roundRect(x,bx+bw*.31,by+tile*.2,bw*.38,tile*.27,tile*.035,'#f3e6c9','#a78a62');
        x.fillStyle='#5d7357';x.font='bold '+Math.max(7,tile*.15)+'px sans-serif';x.textAlign='center';x.fillText('SCHOOL',bx+bw*.5,by+tile*.39);
        x.fillStyle='#b7a58a';x.fillRect(bx+bw*.35,by+bh-tile*.04,bw*.3,tile*.1);x.fillStyle='#d0bea0';x.fillRect(bx+bw*.31,by+bh+tile*.06,bw*.38,tile*.11);
      }else if(t==='home'){
        x.fillStyle='#e0c496';x.fillRect(ox,oy,W,H);
        for(let gy=0;gy<MH*2;gy++){x.fillStyle=gy%2?'rgba(140,100,60,.10)':'rgba(255,240,210,.12)';x.fillRect(ox,oy+gy*tile/2,W,tile/2);}
        x.strokeStyle='rgba(120,84,48,.18)';x.lineWidth=1;for(let gy=0;gy<MH*2;gy++){x.beginPath();x.moveTo(ox,oy+gy*tile/2);x.lineTo(ox+W,oy+gy*tile/2);x.stroke();}
        // rug
        x.fillStyle='#b4535a';x.beginPath();x.roundRect(ox+tile*6,oy+tile*6.2,tile*8,tile*4.6,tile*.5);x.fill();x.strokeStyle='#f1d5a8';x.lineWidth=tile*.12;x.setLineDash([tile*.25,tile*.2]);x.beginPath();x.roundRect(ox+tile*6.3,oy+tile*6.5,tile*7.4,tile*4,tile*.4);x.stroke();x.setLineDash([]);
        // walls
        x.fillStyle='#8a6d52';x.fillRect(ox,oy,W,tile*.5);x.fillRect(ox,oy+H-tile*.5,W,tile*.5);x.fillRect(ox,oy,tile*.5,H);x.fillRect(ox+W-tile*.5,oy,tile*.5,H);
        x.fillStyle='#cfe3ee';for(const wx of [4,10,16]){x.fillRect(ox+wx*tile,oy+tile*.08,tile*1.6,tile*.34);}
      }
    }
    const SCENE=window.WORLD_SPRITES&&WORLD_SPRITES.scene(theme);
    if(SCENE){x.drawImage(SCENE.img,ox,oy,tile*MW,tile*MH);SCENE.trees.forEach(([tx,ty])=>drawTree(ox+tx*tile,oy+ty*tile));}else{
    // Base grass with subtle, non-grid texture.
    x.fillStyle='#8fbe7a';x.fillRect(ox,oy,tile*MW,tile*MH);
    for(let gy=0;gy<MH;gy++)for(let gx=0;gx<MW;gx++){
      const px=ox+gx*tile,py=oy+gy*tile,seed=seeded(gx,gy);
      x.fillStyle=grass[Math.floor(seed*grass.length)];x.globalAlpha=.22;
      x.beginPath();x.ellipse(px+tile*(.2+seed*.6),py+tile*(.2+seeded(gy,gx)*.6),tile*.12,tile*.055,seed*2,0,Math.PI*2);x.fill();x.globalAlpha=1;
      if(seed>.72){
        x.strokeStyle='rgba(52,105,57,.28)';x.lineWidth=Math.max(1,tile*.028);x.lineCap='round';
        x.beginPath();x.moveTo(px+tile*(.48+seed*.12),py+tile*.68);x.quadraticCurveTo(px+tile*.43,py+tile*.48,px+tile*.38,py+tile*.45);x.moveTo(px+tile*(.48+seed*.12),py+tile*.68);x.quadraticCurveTo(px+tile*.58,py+tile*.49,px+tile*.66,py+tile*.47);x.stroke();
        if(seed>.91){x.fillStyle=seeded(gy,gx)>.5?'#fff1c7':'#f6d4e2';x.beginPath();x.arc(px+tile*.72,py+tile*.25,tile*.045,0,Math.PI*2);x.fill();x.fillStyle='#e9b94f';x.beginPath();x.arc(px+tile*.72,py+tile*.25,tile*.018,0,Math.PI*2);x.fill();}
      }
    }
    if(theme==='village'){
    // Woodland corners are organic patches, not flat square blocks.
    for(const [gx,gy] of [[2,1],[16,1],[2,12],[16,12]]){
      const px=ox+gx*tile,py=oy+gy*tile;
      x.fillStyle='#6e9c64';x.beginPath();x.ellipse(px+tile,py+tile,tile*1.35,tile*1.12,0,0,Math.PI*2);x.fill();
      x.fillStyle='rgba(44,92,57,.16)';x.beginPath();x.ellipse(px+tile,py+tile*1.13,tile*.95,tile*.48,0,0,Math.PI*2);x.fill();
    }
    // Sand village lane with softened edges and fine pebble detail.
    for(let gy=4;gy<=10;gy++)for(let gx=6;gx<=13;gx++){
      const ch=(WORLD.map[gy]||'')[gx];if(ch==='R'){
        const px=ox+gx*tile,py=oy+gy*tile;
        x.fillStyle='#d9c18f';x.fillRect(px,py,tile+.4,tile+.4);
        x.fillStyle='rgba(255,247,215,.20)';x.fillRect(px+tile*.08,py+tile*.1,tile*.84,tile*.8);
        if(seeded(gx,gy)>.65){x.fillStyle='rgba(146,117,74,.22)';x.beginPath();x.ellipse(px+tile*.3,py+tile*.68,tile*.07,tile*.035,.2,0,Math.PI*2);x.fill();}
      }
    }
    // Small cottage gardens, stepping stones and wildflowers give the village a lived-in feel.
    for(const [gx,gy] of [[4,3],[15,3],[4,11],[15,11]]){
      const px=ox+gx*tile,py=oy+gy*tile;
      x.fillStyle='rgba(45,76,47,.15)';x.beginPath();x.ellipse(px+tile*.5,py+tile*.72,tile*.4,tile*.14,0,0,Math.PI*2);x.fill();
      roundRect(x,px+tile*.1,py+tile*.28,tile*.8,tile*.43,tile*.09,'#759c60','#5a824e');
      for(let n=0;n<4;n++){x.fillStyle=(n+gx)%2?'#f4d2a2':'#eaa4a0';x.beginPath();x.arc(px+tile*(.22+n*.18),py+tile*(.34+(n%2)*.1),tile*.045,0,Math.PI*2);x.fill();}
    }
    // Low timber fence sections frame garden edges while leaving routes open.
    for(const [gx,gy,len] of [[3,3,2],[16,3,2],[3,11,2],[16,11,2]]){
      const fx=ox+gx*tile,fy=oy+gy*tile;
      x.strokeStyle='#9b744c';x.lineWidth=Math.max(2,tile*.045);
      x.beginPath();x.moveTo(fx,fy+tile*.78);x.lineTo(fx+tile*len,fy+tile*.78);x.moveTo(fx,fy+tile*.64);x.lineTo(fx+tile*len,fy+tile*.64);x.stroke();
      for(let n=0;n<=len;n++){x.beginPath();x.moveTo(fx+tile*n,fy+tile*.56);x.lineTo(fx+tile*n,fy+tile*.86);x.stroke();}
    }
    // Stream and timber bridge.
    for(let gy=6;gy<=6;gy++)for(let gx=8;gx<=10;gx++){
      const px=ox+gx*tile,py=oy+gy*tile;
      x.fillStyle='#6bb7c1';x.fillRect(px,py,tile,tile);
      x.strokeStyle='rgba(232,250,246,.48)';x.lineWidth=Math.max(1,tile*.035);
      x.beginPath();x.moveTo(px+tile*.12,py+tile*.34);x.bezierCurveTo(px+tile*.35,py+tile*.2,px+tile*.58,py+tile*.48,px+tile*.86,py+tile*.31);x.stroke();
    }
    // Bridge deck painted as one coherent structure across its tiles.
    const bx=ox+8*tile,by=oy+7*tile;
    roundRect(x,bx+tile*.04,by+tile*.12,tile*3-tile*.08,tile*.78,tile*.08,'#81583e','#5d402e');
    for(let n=0;n<12;n++){x.strokeStyle=n%3===0?'#c69b6c':'#a77a51';x.lineWidth=Math.max(1,tile*.035);x.beginPath();x.moveTo(bx+tile*(.13+n*.23),by+tile*.17);x.lineTo(bx+tile*(.13+n*.23),by+tile*.84);x.stroke();}
    }
    if(theme!=='village')drawTheme(theme);
    }
    // Soft tree silhouettes and layered foliage.
    function drawTree(cx,cy){
      {const sp=window.WORLD_SPRITES&&WORLD_SPRITES.get('tree');if(sp){const sz=sp.size*tile,gy=cy+tile*.44,sw=WORLD.anim!==false?Math.sin(performance.now()/1000*1.1+cx*.013)*.022:0;x.save();x.translate(cx,gy);x.rotate(sw);x.drawImage(sp.img,-sz/2,-sz*(58/64),sz,sz);x.restore();return;}}
      // Soft layered canopy with highlights, leaf clusters and a grounded trunk.
      x.fillStyle='rgba(35,63,40,.22)';x.beginPath();x.ellipse(cx,cy+tile*.31,tile*.36,tile*.13,0,0,Math.PI*2);x.fill();
      roundRect(x,cx-tile*.075,cy+tile*.015,tile*.15,tile*.34,tile*.035,'#795039','#63412e');
      const leaves=[
        [-.16,-.02,.22,'#3f7e50'],[.12,-.09,.25,'#4d9058'],[-.02,-.2,.25,'#5da267'],
        [-.19,-.19,.17,'#70b477'],[.17,.045,.17,'#438451'],[.02,.005,.22,'#579b60']
      ];
      leaves.forEach(([dx,dy,r,col],i)=>{
        x.fillStyle=col;x.beginPath();x.arc(cx+tile*dx,cy+tile*dy,tile*r,0,Math.PI*2);x.fill();
        x.fillStyle='rgba(225,248,186,.2)';x.beginPath();x.ellipse(cx+tile*(dx-.045),cy+tile*(dy-.065),tile*r*.42,tile*r*.22,-.5,0,Math.PI*2);x.fill();
      });
      x.strokeStyle='rgba(29,82,45,.32)';x.lineWidth=Math.max(1,tile*.022);x.beginPath();x.arc(cx,cy-tile*.11,tile*.22,.15,Math.PI*1.8);x.stroke();
    }
    // More architectural detail: layered roof, eaves, framed windows, stone foundation and a readable entrance.
    function drawHouse(cx,cy,blue=false,bakery=false){
      const wall=bakery?'#f4e5bf':blue?'#dce9e8':'#f0d8bb';
      const side=bakery?'#c6a36e':blue?'#a9c5c8':'#c99b75';
      const roof=bakery?'#a95743':blue?'#527486':'#a95446';
      const roofLight=bakery?'#c9795b':blue?'#779aa7':'#c97962';
      const left=cx-tile*.38, top=cy-tile*.055, bw=tile*.76, bh=tile*.49;
      x.fillStyle='rgba(42,58,43,.25)';x.beginPath();x.ellipse(cx,cy+tile*.34,tile*.46,tile*.16,0,0,Math.PI*2);x.fill();
      // Foundation and visible side plane.
      x.fillStyle='#a58b70';x.beginPath();x.moveTo(left,top+bh-tile*.035);x.lineTo(cx+tile*.28,top+bh-tile*.035);x.lineTo(cx+tile*.42,top+bh+tile*.015);x.lineTo(cx-tile*.2,top+bh+tile*.015);x.closePath();x.fill();
      x.fillStyle=side;x.beginPath();x.moveTo(cx+tile*.25,top+tile*.025);x.lineTo(cx+tile*.4,top+tile*.105);x.lineTo(cx+tile*.4,top+bh);x.lineTo(cx+tile*.25,top+bh-tile*.015);x.closePath();x.fill();
      roundRect(x,left,top,bw,bh,tile*.025,wall,'rgba(95,68,48,.35)');
      // Subtle wall boards and lower trim.
      x.strokeStyle='rgba(125,91,59,.16)';x.lineWidth=Math.max(1,tile*.018);
      for(let k=1;k<=2;k++){x.beginPath();x.moveTo(left+tile*.035,top+bh*k/3);x.lineTo(left+bw-tile*.035,top+bh*k/3);x.stroke();}
      x.fillStyle=bakery?'#d6b47c':blue?'#8faeb4':'#d0aa83';x.fillRect(left,top+bh-tile*.055,bw,tile*.055);
      // Roof has a dark underside, bright front plane and overlapping roof tiles.
      // Chimney, deep roof fascia and a larger layered roof silhouette.
      x.fillStyle='#8d6b58';x.fillRect(cx+tile*.19,cy-tile*.39,tile*.12,tile*.25);
      x.fillStyle='#c58b72';x.fillRect(cx+tile*.17,cy-tile*.41,tile*.16,tile*.055);
      x.fillStyle='#70453b';x.beginPath();x.moveTo(cx-tile*.49,cy+tile*.035);x.lineTo(cx-tile*.04,cy-tile*.51);x.lineTo(cx+tile*.48,cy+tile*.035);x.closePath();x.fill();
      x.fillStyle=roof;x.beginPath();x.moveTo(cx-tile*.46,cy+tile*.005);x.lineTo(cx-tile*.04,cy-tile*.49);x.lineTo(cx+tile*.43,cy+tile*.005);x.closePath();x.fill();
      x.fillStyle=roofLight;x.beginPath();x.moveTo(cx-tile*.37,cy+tile*.002);x.lineTo(cx-tile*.04,cy-tile*.395);x.lineTo(cx+tile*.16,cy+tile*.002);x.closePath();x.fill();
      // Roof seams make the roof read as overlapping hand-painted shingles.
      x.strokeStyle='rgba(75,43,39,.32)';x.lineWidth=Math.max(1,tile*.018);
      for(let k=1;k<=4;k++){const yy=cy-tile*(.39-k*.075),half=tile*(.35-k*.075);x.beginPath();x.moveTo(cx-tile*.04-half,yy);x.lineTo(cx-tile*.04+half,yy);x.stroke();}
      x.strokeStyle='rgba(255,230,196,.42)';x.lineWidth=Math.max(1,tile*.024);x.beginPath();x.moveTo(cx-tile*.43,cy+tile*.005);x.lineTo(cx-tile*.04,cy-tile*.46);x.lineTo(cx+tile*.4,cy+tile*.005);x.stroke();
      x.strokeStyle='rgba(255,230,196,.38)';x.lineWidth=Math.max(1,tile*.022);
      for(let k=0;k<3;k++){x.beginPath();x.moveTo(cx-tile*(.31-k*.015),cy+tile*(.005-k*.09));x.lineTo(cx-tile*.04,cy-tile*(.35-k*.055));x.stroke();}
      // Window frames and glass reflections.
      for(const wx of [cx-tile*.25,cx+tile*.12]){
        roundRect(x,wx-tile*.065,cy+tile*.075,tile*.13,tile*.13,tile*.018,'#f8e7c9','#8b684c');
        roundRect(x,wx-tile*.047,cy+tile*.092,tile*.094,tile*.096,tile*.012,blue?'#8fc7d3':'#a9d5d7');
        x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(1,tile*.018);x.beginPath();x.moveTo(wx,cy+tile*.095);x.lineTo(wx,cy+tile*.185);x.moveTo(wx-tile*.045,cy+tile*.14);x.lineTo(wx+tile*.045,cy+tile*.14);x.stroke();
      }
      // Door, step and warm brass handle.
      roundRect(x,cx-tile*.075,cy+tile*.19,tile*.15,tile*.22,tile*.018,'#74503a','#e1c59b');
      x.fillStyle='#d9b86e';x.beginPath();x.arc(cx+tile*.035,cy+tile*.3,tile*.018,0,Math.PI*2);x.fill();
      x.fillStyle='#d5c09a';x.fillRect(cx-tile*.13,cy+tile*.465,tile*.26,tile*.045);
      // Small wall lantern adds depth and makes the entrance easy to spot.
      x.fillStyle='#7b573b';roundRect(x,cx+tile*.14,cy+tile*.21,tile*.075,tile*.09,tile*.018,'#79513a','#e0c08a');
      x.fillStyle='#ffe6a0';x.beginPath();x.arc(cx+tile*.177,cy+tile*.25,tile*.025,0,Math.PI*2);x.fill();
      if(!bakery){roundRect(x,cx-tile*.25,cy-tile*.015,tile*.5,tile*.07,tile*.018,blue?'#e7f0ec':'#f6e6cc','rgba(92,70,51,.35)');x.fillStyle=blue?'#476d7d':'#87513e';x.font='bold '+Math.max(5,tile*.09)+'px sans-serif';x.textAlign='center';x.fillText(blue?'HOME':'HOME',cx,cy+tile*.035);}
      if(bakery){
        roundRect(x,cx-tile*.29,cy-tile*.055,tile*.5,tile*.09,tile*.025,'#e8bc69','#9a6840');
        x.fillStyle='#68452f';x.font='bold '+Math.max(6,tile*.115)+'px sans-serif';x.textAlign='center';x.fillText('BAKERY',cx-tile*.04,cy+tile*.005);
        // Small bread display outside the shop.
        x.fillStyle='#d89b4d';x.beginPath();x.ellipse(cx+tile*.31,cy+tile*.29,tile*.09,tile*.055,-.25,0,Math.PI*2);x.fill();
        x.strokeStyle='#f7d89a';x.lineWidth=Math.max(1,tile*.018);x.beginPath();x.moveTo(cx+tile*.26,cy+tile*.28);x.lineTo(cx+tile*.34,cy+tile*.3);x.stroke();
      }
    }
    function drawWell(cx,cy){
      x.fillStyle='rgba(36,63,45,.2)';x.beginPath();x.ellipse(cx,cy+tile*.26,tile*.39,tile*.13,0,0,Math.PI*2);x.fill();
      // Stone ring with individual blocks and dark water.
      x.fillStyle='#7e8580';x.beginPath();x.ellipse(cx,cy+tile*.065,tile*.35,tile*.25,0,0,Math.PI*2);x.fill();
      x.fillStyle='#367d8a';x.beginPath();x.ellipse(cx,cy+tile*.035,tile*.245,tile*.16,0,0,Math.PI*2);x.fill();
      x.strokeStyle='rgba(180,224,223,.65)';x.lineWidth=Math.max(1,tile*.025);x.beginPath();x.ellipse(cx-tile*.035,cy+tile*.015,tile*.13,tile*.055,-.2,0,Math.PI*2);x.stroke();
      x.strokeStyle='#d2d3c5';x.lineWidth=tile*.065;x.beginPath();x.ellipse(cx,cy+tile*.065,tile*.35,tile*.25,0,0,Math.PI*2);x.stroke();
      x.strokeStyle='#765039';x.lineWidth=tile*.06;x.beginPath();x.moveTo(cx-tile*.25,cy-tile*.1);x.lineTo(cx-tile*.25,cy-tile*.37);x.lineTo(cx+tile*.25,cy-tile*.37);x.lineTo(cx+tile*.25,cy-tile*.1);x.stroke();
      x.strokeStyle='#c99a5d';x.lineWidth=tile*.025;x.beginPath();x.moveTo(cx-tile*.19,cy-tile*.31);x.lineTo(cx+tile*.19,cy-tile*.31);x.stroke();
    }
    function worldOverlayObjects(){
      const tag=(txt,cx,cy)=>{const fs=Math.max(9,Math.round(tile*.27));x.font='700 '+fs+'px DM Sans, system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';const w=x.measureText(txt).width+fs*.9,h=fs*1.45;roundRect(x,cx-w/2,cy-h/2,w,h,h/2,'rgba(255,255,255,.92)','rgba(23,32,61,.25)');x.fillStyle='#17203d';x.fillText(txt,cx,cy+fs*.04);x.textBaseline='alphabetic';};
      const step=worldStep();
      WORLD.objects.forEach(o=>{
        if(o.id==='river'||o.id==='bridge')return;
        const cx=ox+(o.x+.5)*tile,cy=oy+(o.y+.5)*tile,reach=worldReachableFromPlayer(o);
        if(WORLD.labels){const nm=String(o.name||o.id||'').replace(/-/g,' ');if(nm)tag(nm,cx,cy+tile*(o.person?.52:.66));}
        if(o.person&&reach&&!(step&&(step.type==='pickup'||step.type==='give'))){const by=cy-tile*.62+Math.sin(performance.now()/260)*tile*.03;roundRect(x,cx-tile*.2,by-tile*.15,tile*.4,tile*.3,tile*.12,'#fff','rgba(23,32,61,.35)');x.fillStyle='#17203d';[-.1,0,.1].forEach(dx=>{x.beginPath();x.arc(cx+tile*dx,by,tile*.03,0,Math.PI*2);x.fill();});}
        if(!o.person&&reach&&step&&step.type==='pickup'&&step.object===o.id){x.fillStyle='#ffc531';x.beginPath();x.arc(cx,cy-tile*.5,tile*.15,0,Math.PI*2);x.fill();x.fillStyle='#17203d';x.font='800 '+Math.round(tile*.22)+'px sans-serif';x.textAlign='center';x.fillText('!',cx,cy-tile*.43);}
      });
      if(WORLD.tapMark&&WORLD.tapMark.until>performance.now()){const tm=WORLD.tapMark;x.strokeStyle='rgba(255,197,49,.9)';x.lineWidth=3;x.beginPath();x.arc(ox+(tm.x+.5)*tile,oy+(tm.y+.5)*tile,tile*.28,0,Math.PI*2);x.stroke();}
    }
    const anim=WORLD.anim!==false,T=performance.now()/1000;
    const phaseOf=id=>{let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))%997;return h/997*6.28;};
    function drawSprite(spr,cx,cy,o){
      const size=(spr.size||(o&&o.person?1.3:1.2))*tile,img=spr.img,gy=cy+tile*.44;
      let sy=1,sx=1,rot=0,dy=0,ax=cx,ay=gy;
      if(anim&&o){
        const ph=phaseOf(o.id),id=o.id;
        if(o.person){
          const br=Math.sin(T*2.1+ph);sy=1+br*.022;sx=1-br*.012;
          if(id==='child'||id==='student'||id==='family'){dy=-Math.max(0,Math.sin(T*3.2+ph))*tile*.045;}
          if(id==='baker'||id==='market-vendor'||id==='seller'){rot=Math.sin(T*1.3+ph)*.03;}
        }else if(/tree/.test(id)){rot=Math.sin(T*1.1+ph)*.022;}
        else if(id==='swing'){rot=Math.sin(T*1.7)*.09;ay=gy-size*(50/64);}
        else if(id==='kite'){dy=Math.sin(T*1.8+ph)*tile*.07;rot=Math.sin(T*1.3)*.12;ay=gy-size*.2;}
        else if(id==='lamp'){}
      }
      x.save();x.translate(ax,ay);if(rot)x.rotate(rot);x.scale(sx,sy);
      x.drawImage(img,cx-ax-size/2,(gy-ay)-size*(58/64)+dy,size,size);
      x.restore();
    }
    WORLD.objects.forEach(o=>{
      const cx=ox+(o.x+.5)*tile,cy=oy+(o.y+.5)*tile;
      const spr=window.WORLD_SPRITES&&WORLD_SPRITES.get(o.id);
      if(spr){drawSprite(spr,cx,cy,o);return;}
      if(o.id==='tree-north'||o.id==='tree-west'||o.id==='tree-east'||o.id==='north-tree'){drawTree(cx,cy);return;}
      if(o.id==='red-house'){drawHouse(cx,cy,false,false);return;}
      if(o.id==='blue-house'){drawHouse(cx,cy,true,false);return;}
      if(o.id==='bakery'){drawHouse(cx,cy,false,true);return;}
      if(o.id==='well'){drawWell(cx,cy);return;}
      if(o.id==='river'||o.id==='bridge')return;
      if(o.id==='door'){
        x.fillStyle='#76503b';roundRect(x,cx-tile*.14,cy-tile*.25,tile*.28,tile*.48,tile*.03,'#76503b','#e4c39a');
        x.fillStyle='#f4d17a';x.beginPath();x.arc(cx+tile*.075,cy+tile*.02,tile*.025,0,Math.PI*2);x.fill();return;
      }
      if(o.person){
        const role=o.id||o.name||'villager';
        const coat=role.includes('vendor')?'#df765e':role.includes('clerk')?'#477ca8':role.includes('teacher')?'#6c65b8':role.includes('student')?'#5c9b78':role.includes('child')?'#e6b84f':role.includes('traveller')?'#5b83c5':role.includes('family')?'#8d6bba':role.includes('seller')?'#e58b59':role==='baker'?'#f2eee2':'#579b83';
        const skin=role.includes('child')?'#dba77e':role.includes('teacher')?'#b97855':'#d49a70';
        const hair=role.includes('teacher')?'#4d4038':role.includes('student')?'#382f2d':role.includes('child')?'#754b32':role.includes('traveller')?'#4b3a31':'#513b32';
        x.fillStyle='rgba(38,58,43,.22)';x.beginPath();x.ellipse(cx,cy+tile*.31,tile*.29,tile*.105,0,0,Math.PI*2);x.fill();
        roundRect(x,cx-tile*.16,cy+tile*.16,tile*.12,tile*.19,tile*.045,'#425064');roundRect(x,cx+tile*.04,cy+tile*.16,tile*.12,tile*.19,tile*.045,'#425064');
        roundRect(x,cx-tile*.27,cy+tile*.005,tile*.12,tile*.25,tile*.055,skin);roundRect(x,cx+tile*.15,cy+tile*.005,tile*.12,tile*.25,tile*.055,skin);
        roundRect(x,cx-tile*.22,cy-tile*.015,tile*.44,tile*.31,tile*.09,coat,'rgba(52,57,54,.28)');
        x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.moveTo(cx-tile*.07,cy);x.lineTo(cx,cy+tile*.075);x.lineTo(cx+tile*.07,cy);x.closePath();x.fill();
        if(role==='baker'||role.includes('seller')){roundRect(x,cx-tile*.17,cy+tile*.105,tile*.34,tile*.12,tile*.035,'#fff1d8','#d7c6a7');}
        roundRect(x,cx-tile*.065,cy-tile*.13,tile*.13,tile*.15,tile*.04,skin);
        x.fillStyle=skin;x.beginPath();x.ellipse(cx,cy-tile*.17,tile*.17,tile*.2,0,0,Math.PI*2);x.fill();
        x.fillStyle=hair;x.beginPath();x.ellipse(cx,cy-tile*.255,tile*.18,tile*.115,0,Math.PI,Math.PI*2);x.fill();x.beginPath();x.ellipse(cx-tile*.145,cy-tile*.19,tile*.055,tile*.12,0,0,Math.PI*2);x.fill();
        x.fillStyle='#342d2a';x.beginPath();x.arc(cx-tile*.055,cy-tile*.17,tile*.018,0,Math.PI*2);x.arc(cx+tile*.055,cy-tile*.17,tile*.018,0,Math.PI*2);x.fill();
        x.fillStyle='rgba(210,104,91,.45)';x.beginPath();x.arc(cx-tile*.105,cy-tile*.115,tile*.025,0,Math.PI*2);x.arc(cx+tile*.105,cy-tile*.115,tile*.025,0,Math.PI*2);x.fill();
        x.strokeStyle='#8c5141';x.lineWidth=tile*.018;x.beginPath();x.arc(cx,cy-tile*.125,tile*.045,.15,Math.PI-.3);x.stroke();
        if(role.includes('traveller')){roundRect(x,cx+tile*.18,cy+tile*.12,tile*.14,tile*.19,tile*.035,'#b98b52','#805c38');x.strokeStyle='#e6c58b';x.lineWidth=tile*.02;x.beginPath();x.arc(cx+tile*.25,cy+tile*.12,tile*.055,Math.PI,0);x.stroke();}
        return;
      }
      // Pickups rendered as small illustrated objects, not emoji.
      if(o.id==='key'){
        x.strokeStyle='#e2b84d';x.lineWidth=tile*.1;x.beginPath();x.arc(cx-tile*.1,cy-tile*.03,tile*.12,0,Math.PI*2);x.stroke();
        x.beginPath();x.moveTo(cx,cy+tile*.05);x.lineTo(cx+tile*.24,cy+tile*.27);x.lineTo(cx+tile*.18,cy+tile*.31);x.moveTo(cx+tile*.12,cy+tile*.19);x.lineTo(cx+tile*.07,cy+tile*.24);x.stroke();return;
      }
      if(o.id==='basket'){
        x.fillStyle='#b98b52';roundRect(x,cx-tile*.22,cy-tile*.08,tile*.44,tile*.29,tile*.04,'#b98b52','#815a38');
        x.strokeStyle='#e4c58b';x.lineWidth=tile*.04;for(let n=0;n<4;n++){x.beginPath();x.moveTo(cx-tile*.16+n*tile*.1,cy-tile*.06);x.lineTo(cx-tile*.16+n*tile*.1,cy+tile*.18);x.stroke();}
        x.beginPath();x.arc(cx,cy-tile*.02,tile*.18,Math.PI,0);x.stroke();return;
      }
      if(o.id==='fruit-stall'||o.id==='bread-stall'||o.id==='ticket-desk'){
        const c1=o.id==='fruit-stall'?'#d9534f':o.id==='bread-stall'?'#e0a030':'#3478d4';
        x.fillStyle='rgba(50,40,30,.2)';x.beginPath();x.ellipse(cx,cy+tile*.36,tile*.5,tile*.12,0,0,Math.PI*2);x.fill();
        roundRect(x,cx-tile*.44,cy-tile*.02,tile*.88,tile*.4,tile*.05,'#a67c52','#6e4f33');
        for(let k=0;k<6;k++){x.fillStyle=k%2?'#fff7e6':c1;x.fillRect(cx-tile*.45+k*tile*.15,cy-tile*.4,tile*.15,tile*.4);}
        x.fillStyle=c1;x.beginPath();x.moveTo(cx-tile*.45,cy-tile*.4);x.lineTo(cx+tile*.45,cy-tile*.4);x.lineTo(cx+tile*.5,cy-tile*.48);x.lineTo(cx-tile*.5,cy-tile*.48);x.closePath();x.fill();
        if(o.id==='fruit-stall'){
          for(const [dx,dy,col] of [[-.22,.12,'#e65e50'],[-.06,.09,'#f0b93f'],[.1,.13,'#e65e50'],[.25,.1,'#78a85c']]){x.fillStyle=col;x.beginPath();x.arc(cx+tile*dx,cy+tile*dy,tile*.065,0,Math.PI*2);x.fill();x.fillStyle='#4d8750';x.fillRect(cx+tile*dx-tile*.012,cy+tile*(dy-.09),tile*.025,tile*.04);}
        }else if(o.id==='bread-stall'){
          for(let k=0;k<3;k++){const bx=cx+tile*(-.24+k*.22);x.fillStyle='#e8b96c';x.beginPath();x.ellipse(bx,cy+tile*.13,tile*.09,tile*.055,-.2,0,Math.PI*2);x.fill();x.strokeStyle='#c18a45';x.lineWidth=tile*.018;x.stroke();}
        }else{roundRect(x,cx-tile*.12,cy+tile*.07,tile*.24,tile*.18,tile*.025,'#f7f5e9','#8e9bb0');x.fillStyle='#3478d4';x.fillRect(cx-tile*.12,cy+tile*.07,tile*.24,tile*.045);x.fillStyle='#48566a';x.fillRect(cx-tile*.07,cy+tile*.14,tile*.14,tile*.018);}return;
      }
      if(o.id==='sofa'){
        roundRect(x,cx-tile*.45,cy-tile*.3,tile*.9,tile*.62,tile*.14,'#4f86c6','#2f5a8c');
        roundRect(x,cx-tile*.34,cy-tile*.08,tile*.31,tile*.32,tile*.08,'#6a9ddb');roundRect(x,cx+tile*.03,cy-tile*.08,tile*.31,tile*.32,tile*.08,'#6a9ddb');return;
      }
      if(o.id==='table'){
        x.fillStyle='rgba(50,40,30,.2)';x.beginPath();x.ellipse(cx,cy+tile*.3,tile*.42,tile*.1,0,0,Math.PI*2);x.fill();
        x.fillStyle='#9a6b3f';x.beginPath();x.ellipse(cx,cy,tile*.42,tile*.3,0,0,Math.PI*2);x.fill();x.strokeStyle='#6e4a2a';x.lineWidth=tile*.04;x.stroke();
        x.fillStyle='#f6efe0';x.beginPath();x.arc(cx,cy-tile*.03,tile*.1,0,Math.PI*2);x.fill();return;
      }
      if(/pond/.test(((o.id||'')+' '+(o.name||'')).toLowerCase()))return;
      x.save();x.translate(cx,cy);x.scale(1.4,1.4);x.translate(-cx,-cy);
      x.fillStyle='rgba(35,49,42,.18)';x.beginPath();x.ellipse(cx,cy+tile*.25,tile*.29,tile*.09,0,0,Math.PI*2);x.fill();
      const label=((o.id||'')+' '+(o.name||'')).toLowerCase();
      if(/pond/.test(label)){}else if(/apple|fruit|ball/.test(label)){const col=label.includes('ball')?'#f4f0e6':label.includes('pond')?'#62b8c9':'#e85d50';x.fillStyle=col;x.beginPath();x.arc(cx,cy,tile*.19,0,Math.PI*2);x.fill();x.strokeStyle='rgba(64,69,58,.25)';x.lineWidth=tile*.025;x.stroke();if(label.includes('apple')||label.includes('fruit')){x.fillStyle='#4f8950';x.beginPath();x.ellipse(cx+tile*.06,cy-tile*.19,tile*.09,tile*.045,-.6,0,Math.PI*2);x.fill();x.strokeStyle='#6d4b32';x.lineWidth=tile*.03;x.beginPath();x.moveTo(cx,cy-tile*.15);x.lineTo(cx+tile*.015,cy-tile*.23);x.stroke();}if(label.includes('ball')){x.strokeStyle='#5b7caa';x.lineWidth=tile*.035;x.beginPath();x.arc(cx,cy,tile*.12,.3,2.7);x.stroke();}}
      else if(/bread/.test(label)){x.fillStyle='#e7b568';x.beginPath();x.ellipse(cx,cy,tile*.24,tile*.14,-.12,0,Math.PI*2);x.fill();x.strokeStyle='#c18a45';x.lineWidth=tile*.035;x.stroke();for(let k=-1;k<=1;k++){x.strokeStyle='#fff0c8';x.lineWidth=tile*.025;x.beginPath();x.moveTo(cx+tile*k*.1,cy-tile*.055);x.lineTo(cx+tile*k*.1+tile*.035,cy+tile*.015);x.stroke();}}
      else if(/ticket/.test(label)){roundRect(x,cx-tile*.2,cy-tile*.13,tile*.4,tile*.26,tile*.04,'#f8f3df','#6886a8');x.fillStyle='#447ab0';x.fillRect(cx-tile*.2,cy-tile*.13,tile*.4,tile*.07);x.strokeStyle='#9ba7b1';x.lineWidth=tile*.02;x.setLineDash([tile*.035,tile*.035]);x.beginPath();x.moveTo(cx,cy-tile*.02);x.lineTo(cx,cy+tile*.12);x.stroke();x.setLineDash([]);}
      else if(/pencil/.test(label)){x.save();x.translate(cx,cy);x.rotate(-.65);roundRect(x,-tile*.06,-tile*.25,tile*.12,tile*.5,tile*.025,'#e6bf48','#ad8732');x.fillStyle='#e9a6a5';x.fillRect(-tile*.06,-tile*.25,tile*.12,tile*.07);x.restore();}
      else if(/book/.test(label)){roundRect(x,cx-tile*.2,cy-tile*.23,tile*.4,tile*.46,tile*.04,'#477da8','#2c587e');x.fillStyle='#e7dfc4';x.fillRect(cx-tile*.14,cy-tile*.16,tile*.28,tile*.32);x.strokeStyle='#b9ad8b';x.lineWidth=tile*.02;x.beginPath();x.moveTo(cx,cy-tile*.15);x.lineTo(cx,cy+tile*.15);x.stroke();}
      else if(/lamp|light|clock/.test(label)){x.fillStyle='#e9bd52';x.beginPath();x.arc(cx,cy-tile*.06,tile*.15,Math.PI,Math.PI*2);x.lineTo(cx+tile*.15,cy+tile*.04);x.lineTo(cx-tile*.15,cy+tile*.04);x.closePath();x.fill();x.strokeStyle='#a57b3d';x.lineWidth=tile*.035;x.stroke();x.fillStyle='#8b704c';x.fillRect(cx-tile*.035,cy+tile*.04,tile*.07,tile*.2);x.fillRect(cx-tile*.12,cy+tile*.22,tile*.24,tile*.04);}
      else if(/swing/.test(label)){x.strokeStyle='#a97848';x.lineWidth=tile*.045;x.beginPath();x.moveTo(cx-tile*.2,cy-tile*.24);x.lineTo(cx-tile*.12,cy+tile*.12);x.moveTo(cx+tile*.2,cy-tile*.24);x.lineTo(cx+tile*.12,cy+tile*.12);x.stroke();roundRect(x,cx-tile*.18,cy+tile*.1,tile*.36,tile*.08,tile*.025,'#d58c4d','#8c633c');}
      else if(/slide/.test(label)){x.fillStyle='#6e91d0';x.beginPath();x.moveTo(cx-tile*.17,cy-tile*.22);x.lineTo(cx+tile*.08,cy-tile*.22);x.lineTo(cx+tile*.23,cy+tile*.2);x.lineTo(cx+tile*.06,cy+tile*.2);x.closePath();x.fill();x.strokeStyle='#4c6eaa';x.lineWidth=tile*.04;x.stroke();}
      else if(/bench|desk|board|shelf|chair/.test(label)){roundRect(x,cx-tile*.25,cy-tile*.12,tile*.5,tile*.14,tile*.035,'#b98754','#805b38');x.fillStyle='#805b38';x.fillRect(cx-tile*.19,cy+tile*.02,tile*.055,tile*.22);x.fillRect(cx+tile*.135,cy+tile*.02,tile*.055,tile*.22);}
      else{roundRect(x,cx-tile*.22,cy-tile*.18,tile*.44,tile*.36,tile*.06,'#d9e3d2','#82957d');x.strokeStyle='#82957d';x.lineWidth=tile*.03;x.stroke();}
      x.restore();
    });
    worldOverlayObjects();
        const p=WORLD.player,elapsed=Math.min(1,(performance.now()-(p.moveAt||0))/160),e=elapsed*elapsed*(3-2*elapsed),px=ox+(p.fromX+(p.x-p.fromX)*e+.5)*tile,py=oy+(p.fromY+(p.y-p.fromY)*e+.5)*tile;
    x.strokeStyle='rgba(255,197,49,.95)';x.lineWidth=Math.max(2,tile*.06);x.beginPath();x.ellipse(px,py+tile*.3,tile*.36,tile*.14,0,0,Math.PI*2);x.stroke();x.fillStyle='rgba(255,197,49,.25)';x.fill();
    x.fillStyle='rgba(36,55,43,.24)';x.beginPath();x.ellipse(px,py+tile*.3,tile*.28,tile*.1,0,0,Math.PI*2);x.fill();
    const bob=p.moveAt&&elapsed<1?Math.sin(elapsed*Math.PI*4)*tile*.025:0;
    const psp=window.WORLD_SPRITES&&WORLD_SPRITES.getPlayer(WORLD.outfit);
    if(psp){const sz=1.3*tile,mv=p.moveAt&&elapsed<1,gy=py+tile*.44,br=WORLD.anim!==false?Math.sin(T*2.3):0,
      hop=mv?-Math.abs(Math.sin(elapsed*Math.PI))*tile*.12:0,tilt=mv?Math.sin(elapsed*Math.PI*2)*.13:0,
      sq=mv?1+Math.sin(elapsed*Math.PI*2)*.04:1+br*.022,face=WORLD.facing<0?-1:1;
      x.save();x.translate(px,gy);x.rotate(tilt);x.scale(face/sq,sq);
      x.drawImage(psp.img,-sz/2,-sz*(58/64)+hop,sz,sz);x.restore();}else{
    roundRect(x,px-tile*.17,py+tile*.11+bob,tile*.13,tile*.22,tile*.045,'#34465a');roundRect(x,px+tile*.04,py+tile*.11-bob,tile*.13,tile*.22,tile*.045,'#34465a');
    roundRect(x,px-tile*.22,py-tile*.035,tile*.44,tile*.29,tile*.095,WORLD.outfit||'#d7a75b','#ffffff66');
    roundRect(x,px-tile*.24,py+tile*.015,tile*.09,tile*.21,tile*.045,'#c98f67');roundRect(x,px+tile*.15,py+tile*.015,tile*.09,tile*.21,tile*.045,'#c98f67');
    roundRect(x,px+tile*.13,py+tile*.005,tile*.14,tile*.19,tile*.045,'#7d5bb2','#5b4386');
    x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=tile*.025;x.beginPath();x.moveTo(px-tile*.1,py+tile*.02);x.lineTo(px-tile*.1,py+tile*.19);x.stroke();
    x.fillStyle='#c98f67';x.beginPath();x.arc(px,py-tile*.16,tile*.175,0,Math.PI*2);x.fill();
    x.fillStyle='#4b3b32';x.beginPath();x.ellipse(px,py-tile*.22,tile*.18,tile*.105,0,Math.PI,Math.PI*2);x.fill();x.beginPath();x.ellipse(px-tile*.14,py-tile*.17,tile*.045,tile*.095,-.25,0,Math.PI*2);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(px-tile*.055,py-tile*.16,tile*.027,0,Math.PI*2);x.arc(px+tile*.055,py-tile*.16,tile*.027,0,Math.PI*2);x.fill();x.fillStyle='#34465a';x.beginPath();x.arc(px-tile*.05,py-tile*.16,tile*.012,0,Math.PI*2);x.arc(px+tile*.06,py-tile*.16,tile*.012,0,Math.PI*2);x.fill();
    x.strokeStyle='#8d5140';x.lineWidth=tile*.018;x.beginPath();x.arc(px,py-tile*.115,tile*.045,.15,Math.PI-.3);x.stroke();
    }
    if(WORLD.target){x.strokeStyle='rgba(255,197,49,'+(.35+.65*(.5+.5*Math.sin(performance.now()/180)))+')';x.lineWidth=4;x.setLineDash([5,4]);x.strokeRect(ox+WORLD.target.x*tile+3,oy+WORLD.target.y*tile+3,tile-6,tile-6);x.setLineDash([]);}
    {const vg=x.createRadialGradient(r.width/2,r.height/2,Math.min(r.width,r.height)*.35,r.width/2,r.height/2,Math.max(r.width,r.height)*.75);vg.addColorStop(0,'rgba(20,40,25,0)');vg.addColorStop(1,'rgba(20,40,25,.22)');x.fillStyle=vg;x.fillRect(0,0,r.width,r.height);}
    if(p.moveAt&&elapsed>=1&&p.queuedKey){const queued=p.queuedKey;p.queuedKey=null;worldMove(queued);return;}
    // Redraw continuously only while the player is moving. A help marker is static,
    // so it must not keep an expensive full-map render loop running forever.
    if(p.moveAt&&elapsed<1)WORLD.raf=requestAnimationFrame(worldDraw);
    else if(WORLD.anim!==false&&!document.hidden&&window.WORLD_SPRITES)WORLD.idle=setTimeout(()=>{WORLD&&WORLD.mode==='play'&&(WORLD.raf=requestAnimationFrame(worldDraw));},WORLD.idleMs||90);
  }
  if(window.WORLD_SPRITES){WORLD_SPRITES.onReady=()=>{if(WORLD&&WORLD.mode==='play')worldDraw();};WORLD_SPRITES.preload();WORLD_SPRITES.preloadScenes();}
  function worldStatus(){const s=$('#world-step');if(s)s.textContent=worldTask().check.type==='sequence'?'Step '+(WORLD.step+1)+' of '+worldTask().check.steps.length:'';const carry=$('#world-carry');if(carry)carry.textContent=WORLD.carried?'Carrying '+(WORLD.carried==='key'?'the key':'the basket'):'';}
  function worldRenderPlay(){if(WORLD&&(!WORLD.picked||WORLD.picked.size===0)&&!WORLD.carried)WORLD.origObjs=WORLD.objects.map(o=>({...o}));if(WORLD.anim===undefined){try{WORLD.anim=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{WORLD.anim=true;}}if(WORLD.labels===undefined){try{WORLD.labels=localStorage.getItem('epiphany-world-labels')==='1';}catch{WORLD.labels=false;}}const t=worldTask();WORLD.taskStart={x:WORLD.player.x,y:WORLD.player.y};wFixOffset(t);const c0=t.check.type==='sequence'?t.check.steps[0]:t.check;WORLD.needLeave=WORLD.run==='practice'&&!['pickup','give','offset'].includes(c0.type)&&worldCheck(c0);$('#world-game').innerHTML=worldShell('<div class="world-stage" data-world-weather="'+(WORLD.weather||'clear')+'" data-world-time="'+(WORLD.timeOfDay||'morning')+'"><div class="world-atmosphere" aria-live="polite">'+(WORLD.weather==='rain'?'🌧 Rainy':'☀ Clear')+' · '+({morning:'🌅 Morning',evening:'🌇 Evening',night:'🌙 Night'}[WORLD.timeOfDay]||'🌅 Morning')+'</div><canvas id="world-canvas" aria-label="Top-down world map"></canvas><div class="world-helpbar"><button data-world-speak>🔊 Listen</button><button data-world-labels aria-pressed="'+(WORLD.labels?'true':'false')+'" class="'+(WORLD.labels?'is-on':'')+'">🏷 Names</button><button data-world-help-toggle aria-expanded="false">Need help?</button><span id="world-step"></span><span id="world-carry"></span></div><section class="world-help-panel" id="world-help-panel" hidden aria-live="polite"><div class="world-help-heading"><strong>What should I do?</strong><span>Hints are optional — choose the level you need.</span></div><p id="world-help-copy">1. Find the person or object named in the instruction. 2. Follow direction words like under, behind, or next to. 3. Stand beside an item or person and press Interact when needed.</p><div class="world-help-actions"><button data-world-help-level="1">Small hint</button><button data-world-help-level="2">Show target</button><button data-world-help-level="3">Explain in Arabic</button></div></section><div class="world-mobile-controls"><div class="world-dpad"><button data-world-move="ArrowUp" aria-label="Move up">▲</button><div><button data-world-move="ArrowLeft" aria-label="Move left">◀</button><button data-world-move="ArrowDown" aria-label="Move down">▼</button><button data-world-move="ArrowRight" aria-label="Move right">▶</button></div></div><button class="world-interact" data-world-interact>Space · Interact</button></div></div>');worldStatus();if(WORLD.needLeave)worldFeedback('You are already close! Step away, then come back.');requestAnimationFrame(worldDraw);}
  function worldRegionArt(id){
    const art={
      village:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="23" ry="5" fill="#b6d6a0"/><path d="M8 30 28 12l20 18v21H8z" fill="#f0d7b1" stroke="#a86d51" stroke-width="2.5" stroke-linejoin="round"/><path d="M4 30 28 8l24 22" fill="#c86f59" stroke="#98503f" stroke-width="3" stroke-linejoin="round"/><rect x="23" y="35" width="11" height="16" rx="2" fill="#7e5b45"/><rect x="12" y="33" width="8" height="8" rx="1" fill="#a9d8df"/><circle cx="51" cy="18" r="8" fill="#6da86d"/><circle cx="47" cy="15" r="5" fill="#8cc47c"/></svg>',
      market:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="24" ry="5" fill="#e5d4b2"/><path d="M9 26h46v27H9z" fill="#c18a54" stroke="#865a36" stroke-width="2"/><path d="M7 26 13 11h38l6 15z" fill="#fff1d9" stroke="#9c6a43" stroke-width="2"/><path d="M13 11h8v15h-8zm16 0h8v15h-8zm16 0h6v15h-6z" fill="#df7660"/><rect x="15" y="35" width="34" height="18" rx="2" fill="#f1d7a3"/><circle cx="23" cy="40" r="4" fill="#e85d50"/><circle cx="33" cy="40" r="4" fill="#e9b83f"/><circle cx="42" cy="40" r="4" fill="#78a85c"/></svg>',
      station:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="24" ry="5" fill="#c5d5df"/><path d="M7 26 32 9l25 17v27H7z" fill="#dce8ed" stroke="#607e91" stroke-width="2.5" stroke-linejoin="round"/><path d="M4 27 32 6l28 21" fill="#4d7893" stroke="#3d627b" stroke-width="3" stroke-linejoin="round"/><rect x="13" y="31" width="38" height="7" rx="2" fill="#f1c64d"/><rect x="17" y="41" width="11" height="12" fill="#8fbac9"/><rect x="36" y="41" width="11" height="12" fill="#8fbac9"/><path d="M8 57h48M14 60h36" stroke="#596a78" stroke-width="2.5"/></svg>',
      home:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="23" ry="5" fill="#d6c3aa"/><path d="M8 28 32 9l24 19v25H8z" fill="#f0d7b5" stroke="#9e6c4a" stroke-width="2.5" stroke-linejoin="round"/><path d="M4 29 32 6l28 23" fill="#a95f50" stroke="#82473c" stroke-width="3" stroke-linejoin="round"/><rect x="26" y="35" width="13" height="18" rx="2" fill="#7c5a44"/><rect x="12" y="33" width="9" height="9" rx="1" fill="#a7d6e0"/><rect x="43" y="33" width="9" height="9" rx="1" fill="#a7d6e0"/></svg>',
      park:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="23" ry="5" fill="#c6dfb1"/><path d="M8 48q10-8 18 0t18 0 12 0" fill="none" stroke="#d7bd8d" stroke-width="7" stroke-linecap="round"/><path d="M31 32v20" stroke="#8b633f" stroke-width="7" stroke-linecap="round"/><circle cx="24" cy="25" r="13" fill="#5d9b60"/><circle cx="39" cy="23" r="14" fill="#73b66c"/><circle cx="32" cy="14" r="12" fill="#8bc979"/></svg>',
      school:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="23" ry="5" fill="#d8d3bd"/><path d="M7 25 32 8l25 17v28H7z" fill="#e9d8bd" stroke="#9b7656" stroke-width="2.5" stroke-linejoin="round"/><path d="M4 26 32 5l28 21" fill="#6d7eb4" stroke="#4d5e91" stroke-width="3" stroke-linejoin="round"/><rect x="13" y="31" width="10" height="10" rx="1" fill="#9fd0df"/><rect x="41" y="31" width="10" height="10" rx="1" fill="#9fd0df"/><rect x="27" y="34" width="11" height="19" rx="2" fill="#8b6549"/></svg>',
      airport:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="54" rx="24" ry="5" fill="#c8d9e7"/><path d="M7 27h50v26H7z" fill="#eaf1f5" stroke="#6c879b" stroke-width="2.5"/><path d="M4 27 14 11h36l10 16z" fill="#4f7896" stroke="#385c78" stroke-width="2.5"/><path d="M20 12v15m12-15v15m12-15v15" stroke="#fff" stroke-width="5"/><path d="M13 38h38M13 45h38" stroke="#8db7c9" stroke-width="3"/><path d="M28 4h8l-1 9h-6z" fill="#f4c54b"/></svg>',
      hospital:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="55" rx="23" ry="5" fill="#c9dfd8"/><path d="M9 20h46v33H9z" fill="#edf8f5" stroke="#6d9d91" stroke-width="2.5"/><path d="M5 21 32 7l27 14" fill="#78b9ad" stroke="#4d8b80" stroke-width="3"/><rect x="25" y="30" width="14" height="23" rx="2" fill="#b6d8ef"/><path d="M32 22v12M26 28h12" stroke="#e85d67" stroke-width="5" stroke-linecap="round"/><rect x="13" y="30" width="8" height="8" fill="#a5d8e8"/><rect x="43" y="30" width="8" height="8" fill="#a5d8e8"/></svg>',
      office:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="55" rx="23" ry="5" fill="#c6d5e4"/><path d="M12 12h40v41H12z" fill="#e7eef7" stroke="#7188a5" stroke-width="2.5"/><path d="M8 14h48" stroke="#4d7099" stroke-width="5"/><rect x="18" y="21" width="10" height="10" fill="#9bcce0"/><rect x="36" y="21" width="10" height="10" fill="#9bcce0"/><rect x="18" y="36" width="10" height="10" fill="#9bcce0"/><rect x="36" y="36" width="10" height="17" fill="#8a6d54"/><path d="M5 54h54" stroke="#7188a5" stroke-width="3"/></svg>',
    };
    return art[id]||art.village;
  }
  function worldShowRegions(){
    if(!WORLD)return;
    const completed=(state.world&&state.world.done||[]).length;
    const regions=WORLD_DATA.regions||[];
    $('#world-game').innerHTML='<div class="world-region-hub"><div class="world-page-actions"><button type="button" class="world-home" data-world-home>⌂ Home</button></div>'+(hasDeveloperAccess()?'<p class="developer-access-note">🛠 Developer access active · all regions available for testing</p>':'')+'<p class="world-kicker">EPIPHANY WORLD</p><h1>Choose your next adventure</h1><p>Explore places, talk to people, finish missions and earn rewards.</p><div class="world-region-grid">'+regions.map(r=>{const open=hasDeveloperAccess()||completed>=r.unlock;const done=(state.world.done||[]).filter(id=>id.startsWith('world-'+r.id+'-')).length;return '<div class="world-region-wrap"><button class="world-region-card '+(open?'':'is-locked')+'" data-world-region="'+esc(r.id)+'" '+(open?'':'disabled')+'><span class="world-region-icon">'+worldRegionArt(r.id)+'</span><strong>'+esc(r.name)+'</strong><small>'+esc(r.description)+'</small><span class="world-region-progress">'+(open?done+' missions completed':'Complete '+r.unlock+' missions to unlock')+'</span></button>'+(open?'<button class="world-practice-btn" data-world-practice="'+esc(r.id)+'">Practice run · new missions every time</button>':'')+'</div>';}).join('')+'</div><button class="world-secondary" data-world-exit>Back to Epiphany</button></div>';
  }
  function worldChooseRegion(id,mode){
    if(!WORLD)return;const region=(WORLD_DATA.regions||[]).find(r=>r.id===id);if(!region)return;WORLD.weather=['clear','rain'][Math.floor(Math.random()*2)];WORLD.timeOfDay=['morning','evening','night'][Math.floor(Math.random()*3)];
    const completed=(state.world&&state.world.done||[]).length;if(!hasDeveloperAccess()&&completed<region.unlock){toast('Complete more missions to unlock this place.');return;}
    const storyTasks=WORLD_DATA.tasks.filter(t=>(t.region||'village')===region.id&&(!t.weather||t.weather===WORLD.weather)&&(!t.timeOfDay||t.timeOfDay===WORLD.timeOfDay));
    // Story missions first; once they are all done (or on request) play endless practice runs.
    const storyDone=storyTasks.every(t=>(state.world.done||[]).includes(t.id));
    const run=mode||(storyDone?'practice':'story');
    const baseObjects=(region.objects||WORLD_DATA.objects).map(o=>({...o}));
    WORLD.region=region.id;WORLD.regionName=region.name;WORLD.run=run;WORLD.index=0;WORLD.dialogueComplete=false;WORLD.conversationOpen=false;WORLD.map=region.map||WORLD_DATA.map;WORLD.objects=baseObjects;
    WORLD.player={x:region.start.x,y:region.start.y,fromX:region.start.x,fromY:region.start.y,moveAt:0,queuedKey:null,color:(WORLD.player&&WORLD.player.color)||'#FFC531'};
    if(run==='practice'){
      wRandomiseLayout();WORLD.tasks=wGenerate(8);
      if(!WORLD.tasks.length){WORLD.run='story';WORLD.tasks=storyTasks;}
    }else WORLD.tasks=storyTasks;
    WORLD.baseObjects=WORLD.objects.map(o=>({...o}));
    WORLD.step=0;WORLD.picked=new Set();WORLD.given=new Set();WORLD.carried=null;WORLD.mode='play';WORLD.usedHelp=false;WORLD.moves=0;WORLD.target=null;WORLD.bonusGiven=false;WORLD.dialogueComplete=false;worldRenderPlay();
  }
  function startWorld(taskId){if(typeof WORLD_DATA==='undefined'){toast('World data is not loaded. Refresh and try again.');return;}if(WORLD&&WORLD.raf)cancelAnimationFrame(WORLD.raf);
    // Opening the World tab should only build the region menu; do not initialise
    // task state, clone maps/objects, or prepare gameplay until a region is chosen.
    if(!taskId){WORLD={mode:'regions',region:null,regionName:null,raf:0,player:{color:'#FFC531'},outfit:'#6C5CE7',showTranslation:!!state.helpArabic,tries:0,usedHelp:false,moves:0,step:0,carried:null,picked:new Set(),given:new Set(),stars:Object.values((state.world&&state.world.stars)||{}).reduce((a,v)=>a+(Number(v)||0),0),progress:{}};lockPage(true);$$('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view==='world'?'page':'false'));$('#world-game').hidden=false;worldShowRegions();return;}
    WORLD={mode:'intro',tasks:WORLD_DATA.tasks.slice(),index:Math.max(0,WORLD_DATA.tasks.findIndex(t=>t.id===taskId)),map:WORLD_DATA.map,objects:WORLD_DATA.objects.map(o=>({...o})),player:{x:WORLD_DATA.start.x,y:WORLD_DATA.start.y,fromX:WORLD_DATA.start.x,fromY:WORLD_DATA.start.y,moveAt:0,queuedKey:null,color:'#FFC531'},outfit:'#6C5CE7',showTranslation:!!state.helpArabic,tries:0,usedHelp:false,moves:0,step:0,carried:null,picked:new Set(),given:new Set(),stars:0,progress:{},raf:0};
    lockPage(true);$$('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view==='world'?'page':'false'));$('#world-game').hidden=false;$('#world-game').innerHTML='<div class="world-intro"><div class="world-page-actions"><button type="button" class="world-home" data-world-home>⌂ Home</button><button class="world-exit" data-world-exit aria-label="Exit World">✕</button></div><div class="world-intro-art" aria-hidden="true">'+worldRegionArt('village')+worldRegionArt('home')+worldRegionArt('park')+'</div><p class="world-kicker">EPIPHANY WORLD</p><h1>Understand. Move. Discover.</h1><p>Read the English instruction and explore a tiny village and complete its missions.</p><h3>Your character</h3><div class="world-color-picks"><button class="is-selected" data-world-color="#FFC531"><span class="world-color-swatch" style="--swatch:#FFC531"></span> Yellow</button><button data-world-color="#7C6CFF"><span class="world-color-swatch" style="--swatch:#7C6CFF"></span> Purple</button></div><h3>Clothes</h3><div class="world-color-picks"><button class="is-selected" data-world-outfit="#6C5CE7">Purple</button><button data-world-outfit="#168B68">Green</button><button data-world-outfit="#3478D4">Blue</button></div><button class="world-primary" data-world-begin>Start exploring →</button><p class="world-small">Arrow keys / WASD to move · Space to interact</p></div>';}
  // After any mission, picked-up items go back where they were so later missions can use them again.
  function worldRestoreObjects(){if(!WORLD)return;(WORLD.origObjs||[]).forEach(o=>{if(!WORLD.objects.some(v=>v.id===o.id))WORLD.objects.push({...o});});WORLD.carried=null;WORLD.picked=new Set();WORLD.given=new Set();}
  function worldComplete(){if(!WORLD||WORLD.mode!=='play')return;const t=worldTask();worldRestoreObjects();const stars=WORLD.usedHelp?(WORLD.moves>(t.generated?14:7)?1:2):3,gain=WORLD.run==='practice'?worldAwardPractice(stars,t):worldAward(stars,t);WORLD.stars=Object.values(state.world.stars).reduce((sum,value)=>sum+(Number(value)||0),0);WORLD.mode='success';sfx('done');
    $('#world-game').innerHTML=worldShell('<section class="world-success"><div class="world-big-star">★</div><p class="world-kicker">TASK COMPLETE</p><h2>Well done!</h2><div class="world-stars">'+('★'.repeat(stars))+'<span>'+('☆'.repeat(3-stars))+'</span></div><p>+'+gain+' XP earned</p><div class="world-context-tip"><strong>English in action</strong><p>“'+esc(t.instruction)+'”</p>'+(t.words&&t.words[0]?'<small>In this mission, <b>'+esc(t.words[0][0])+'</b> means '+esc(t.words[0][1])+'. Read the instruction aloud to practise it in context.</small>':'<small>Read the instruction aloud and connect the English words to the action you just completed.</small>')+'</div><h3>New words</h3><div class="world-word-list">'+(t.words||[]).map(w=>'<span class="world-word-chip"><b>'+esc(w[0])+'</b><small>'+esc(w[1])+'</small></span>').join('')+'</div>'+(t.suggestedStory&&STORIES.some(s=>s.id===t.suggestedStory&&storyLevelIndex(s.level)<=storyLevelIndex(currentLevel().id))?'<button class="world-secondary" data-world-story="'+esc(t.suggestedStory)+'">Read the story behind this task →</button>':'')+'<button class="world-primary" data-world-next>'+(WORLD.index===WORLD.tasks.length-1?(WORLD.run==='practice'?'Finish run':'Finish area'):'Next task')+' →</button></section>');}
  function worldRunBonus(){
    if(DEV_MODE.active&&hasDeveloperAccess())return 'Developer test session · no rewards or progress saved.';
    if(!WORLD||WORLD.run!=='practice')return '';
    if(!WORLD.bonusGiven){WORLD.bonusGiven=true;const b=awardActivity(15,WORLD.tasks.length);state.world.runs=(state.world.runs||0)+1;save();WORLD.bonusText='+15 XP run bonus.'+(b?' '+b:'');}
    return WORLD.bonusText||'';
  }
  function worldNext(){if(WORLD.index===WORLD.tasks.length-1){WORLD.mode='finished';$('#world-game').innerHTML='<div class="world-finish"><div class="world-intro-art">'+esc((WORLD_DATA.regions.find(r=>r.id===WORLD.region)||{}).icon||'🏡')+' ✨ 🌍</div><p class="world-kicker">'+(WORLD.run==='practice'?'PRACTICE RUN COMPLETE':'AREA COMPLETE')+'</p><h1>'+esc(WORLD.regionName||'Adventure')+(WORLD.run==='practice'?' · run complete!':' complete!')+'</h1><p>'+(WORLD.run==='practice'?'You finished '+WORLD.tasks.length+' missions. '+esc(worldRunBonus())+' Every run has new missions and a new layout.':'You earned '+WORLD.stars+' stars in this area.')+'</p><h2>Words from your adventure</h2><div class="world-word-list">'+WORLD.tasks.flatMap(t=>t.words||[]).filter((w,i,a)=>a.findIndex(v=>v[0]===w[0])===i).map(w=>'<span class="world-word-chip"><b>'+esc(w[0])+'</b><small>'+esc(w[1])+'</small></span>').join('')+'</div><button class="world-primary" data-world-practice="'+esc(WORLD.region)+'">New practice run</button><button class="world-secondary" data-world-regions>Explore another place →</button>'+(WORLD.run==='practice'?'':'<button class="world-secondary" data-world-replay>Replay story missions ↻</button>')+'<button class="world-secondary" data-world-exit>Back to Epiphany</button></div>';return;}
    WORLD.index++;WORLD.mode='play';WORLD.tries=0;WORLD.usedHelp=false;WORLD.moves=0;WORLD.step=0;WORLD.target=null;WORLD.objects=(WORLD.baseObjects||((WORLD_DATA.regions.find(r=>r.id===WORLD.region)||{}).objects)||WORLD_DATA.objects).filter(o=>!WORLD.picked.has(o.id)).map(o=>({...o}));worldRenderPlay();}
  function closeWorld(){if(WORLD&&WORLD.idle)clearTimeout(WORLD.idle);stopWorldHold();try{worldCancelAuto();}catch{}worldSwipeStart=null;if(WORLD&&WORLD.raf)cancelAnimationFrame(WORLD.raf);WORLD=null;$('#world-game').hidden=true;lockPage(false);const active=$('.view.is-active');const activeName=active?active.id.replace('-view',''):'home';$$('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view===activeName?'page':'false'));renderAll();}
  let worldHoldDelay = null, worldHoldRepeat = null, worldSwipeStart = null, worldSuppressClickUntil = 0;
  function stopWorldHold() {
    if (worldHoldDelay) clearTimeout(worldHoldDelay);
    if (worldHoldRepeat) clearInterval(worldHoldRepeat);
    worldHoldDelay = null; worldHoldRepeat = null;
  }
  document.addEventListener('pointerdown', e => {
    if (!WORLD || WORLD.mode !== 'play') return;
    const move = e.target.closest('[data-world-move]');
    if (move) {
      e.preventDefault();
      stopWorldHold();
      const key = move.dataset.worldMove;
      worldCancelAuto();
      move.classList.add('is-pressed');
      worldMove(key);
      worldHoldDelay = setTimeout(() => { worldHoldRepeat = setInterval(() => worldMove(key), 185); }, 260);
      try { move.setPointerCapture(e.pointerId); } catch {}
      return;
    }
    if (e.target.closest('#world-canvas')) worldSwipeStart = {x:e.clientX,y:e.clientY,id:e.pointerId};
  }, {passive:false});
  let worldAuto = null;
  function worldCancelAuto() { if (worldAuto) { clearInterval(worldAuto); worldAuto = null; } }
  function worldWalkTo(tx, ty) {
    worldCancelAuto();
    if (!WORLD || WORLD.mode !== 'play') return;
    const W = WORLD_DATA.width, H = WORLD_DATA.height, sx = WORLD.player.x, sy = WORLD.player.y;
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return;
    const goals = new Set(); const addGoal = (x, y) => { if (worldWalkable(x, y)) goals.add(x + ',' + y); };
    if (worldWalkable(tx, ty)) addGoal(tx, ty); else { addGoal(tx + 1, ty); addGoal(tx - 1, ty); addGoal(tx, ty + 1); addGoal(tx, ty - 1); }
    WORLD.tapMark = {x: tx, y: ty, until: performance.now() + 900};
    if (!goals.size || goals.has(sx + ',' + sy)) { worldDraw(); return; }
    const prev = new Map([[sx + ',' + sy, null]]), queue = [[sx, sy]]; let found = null;
    while (queue.length && !found) {
      const [cx, cy] = queue.shift();
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny;
        if (prev.has(k) || !worldWalkable(nx, ny)) continue;
        prev.set(k, cx + ',' + cy);
        if (goals.has(k)) { found = k; break; }
        queue.push([nx, ny]);
      }
    }
    if (!found) { worldFeedback('There is no open path to that place.'); worldDraw(); return; }
    const path = []; for (let k = found; prev.get(k); k = prev.get(k)) path.unshift(k);
    const keys = []; let px = sx, py = sy;
    path.forEach(k => { const [nx, ny] = k.split(',').map(Number); keys.push(nx > px ? 'ArrowRight' : nx < px ? 'ArrowLeft' : ny > py ? 'ArrowDown' : 'ArrowUp'); px = nx; py = ny; });
    let i = 0; worldDraw();
    worldAuto = setInterval(() => {
      if (!WORLD || WORLD.mode !== 'play' || i >= keys.length) { worldCancelAuto(); return; }
      worldMove(keys[i++]);
    }, 190);
  }
  function finishWorldPointer(e) {
    const held = !!(worldHoldDelay || worldHoldRepeat);
    if (held) {
      stopWorldHold();
      document.querySelectorAll('[data-world-move].is-pressed').forEach(b=>b.classList.remove('is-pressed'));
      worldSuppressClickUntil = Date.now() + 450;
    }
    if (!worldSwipeStart || !WORLD || WORLD.mode !== 'play') { worldSwipeStart = null; return; }
    const start = worldSwipeStart; worldSwipeStart = null;
    if (start.id !== e.pointerId) return;
    const dx=e.clientX-start.x, dy=e.clientY-start.y;
    if (Math.max(Math.abs(dx),Math.abs(dy)) < 22) {
      const cv = $('#world-canvas');
      if (cv && e.type === 'pointerup' && WORLD.tile) { const b = cv.getBoundingClientRect(); worldWalkTo(Math.floor((e.clientX - b.left - WORLD.ox) / WORLD.tile), Math.floor((e.clientY - b.top - WORLD.oy) / WORLD.tile)); }
      return;
    }
    worldCancelAuto();
    const key = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'ArrowLeft' : 'ArrowRight') : (dy < 0 ? 'ArrowUp' : 'ArrowDown');
    worldMove(key);
  }
  document.addEventListener('pointerup', finishWorldPointer);
  document.addEventListener('pointercancel', finishWorldPointer);
  document.addEventListener('click',e=>{
    if (Date.now() < worldSuppressClickUntil && e.target.closest('[data-world-move]')) { e.preventDefault(); return; }
    const storyFollow=e.target.closest('[data-story-follow-up]');if(storyFollow){const taskId=storyFollow.dataset.storyFollowUp;$('#game').hidden=true;ST=null;lockPage(false);startWorld(taskId);return;}
    const practicePick=e.target.closest('[data-world-practice]');if(practicePick&&WORLD){worldChooseRegion(practicePick.dataset.worldPractice,'practice');return;}
    const regionPick=e.target.closest('[data-world-region]');if(regionPick){worldChooseRegion(regionPick.dataset.worldRegion);return;}
    if(e.target.closest('[data-world-regions]')){worldShowRegions();return;}
    const move=e.target.closest('[data-world-move]');if(move){return;}
    if(e.target.closest('[data-world-interact]')){worldInteract();return;}
    const dialogClose=e.target.closest('[data-world-dialog-close]');if(dialogClose){const panel=$('#world-conversation');if(panel)panel.remove();if(WORLD)WORLD.conversationOpen=false;return;}
    const dialogChoice=e.target.closest('[data-world-dialog-choice]');if(dialogChoice&&WORLD){const t=worldTask(),choice=t&&t.conversation&&t.conversation.options[Number(dialogChoice.dataset.worldDialogChoice)],feedback=$('.world-conversation-feedback');if(!choice)return;if(choice.correct){if(feedback)feedback.textContent=choice.reply||'That is a natural response. Well done!';WORLD.dialogueComplete=true;WORLD.conversationOpen=false;setTimeout(()=>{const panel=$('#world-conversation');if(panel)panel.remove();if(WORLD&&WORLD.mode==='play'&&worldEval())worldComplete();},650);}else{recordAdaptiveResult('conversation',t.id||t.title||'world-dialogue',false);if(feedback)feedback.textContent=(choice.reply||'Not quite. Try another response.')+' Try again.';sfx('wrong');}if(choice.correct)recordAdaptiveResult('conversation',t.id||t.title||'world-dialogue',true);return;}
    if(e.target.closest('[data-world-labels]')){if(WORLD){WORLD.labels=!WORLD.labels;try{localStorage.setItem('epiphany-world-labels',WORLD.labels?'1':'0');}catch{}const b=e.target.closest('[data-world-labels]');b.setAttribute('aria-pressed',String(WORLD.labels));b.textContent=WORLD.labels?'🏷 Labels on':'🙈 No labels';b.classList.toggle('is-on',WORLD.labels);worldDraw();}return;}
    if(e.target.closest('[data-world-speak]')){if(worldTask())speak(worldTask().instruction);return;}
    
    if(e.target.closest('[data-world-help-toggle]')){if(WORLD){const panel=$('#world-help-panel'),button=e.target.closest('[data-world-help-toggle]'),opening=panel.hidden;panel.hidden=!opening;button.setAttribute('aria-expanded',String(opening));button.textContent=opening?'✕ Close help':'💡 Need help?';}return;}
    const helpLevel=e.target.closest('[data-world-help-level]');if(helpLevel&&WORLD){const level=Number(helpLevel.dataset.worldHelpLevel),t=worldTask(),c=worldStep(),o=(c&&c.object&&worldObj(c.object))||(c&&c.person&&worldObj(c.person)),copy=$('#world-help-copy');copy.setAttribute('dir','auto');if(level===1){copy.textContent=t.hint||'Look for the key noun (the person or thing) and the direction word in the instruction.';}else if(level===2){WORLD.usedHelp=true;WORLD.target=worldHelpTarget(c,o);copy.textContent=(c&&c.type==='pickup')?'Follow the glowing marker to the item, stand next to it, then press “Space · Interact”.':(c&&c.type==='give')?'Carry the requested item to the highlighted person. Stand next to them and press “Space · Interact”.':'Follow the glowing marker. The goal is usually the highlighted object or the tile beside it; use the arrows to move one step at a time.';worldDraw();}else{const targetName=o?(W_AR[o.name]||W_AR[o.id]||o.name):'';const arRelation={near:'اقترب من',interact:'اقترب من ثم تفاعل مع',at:'اذهب إلى',under:'قف أسفل',behind:'قف خلف',left:'قف على يسار',right:'قف على يمين',above:'قف أعلى',below:'قف أسفل',between:'قف بين',pickup:'التقط',give:'سلّم الغرض إلى',offset:'تحرّك من مكانك'};const action=arRelation[c&&c.type]||'ابحث عن';copy.setAttribute('dir','rtl');copy.textContent=(c&&c.type==='pickup')?'تحرّك إلى الغرض المضيء، قف بجانبه ثم اضغط «Space · Interact» لالتقاطه.':(c&&c.type==='give')?'احمل الغرض المطلوب إلى الشخص المحدّد، قف بجانبه ثم اضغط «Space · Interact» لتسليمه.':action+(targetName?' '+targetName:'')+'. استخدم أزرار الأسهم للتحرّك خطوةً خطوة، واستمع إلى التعليمات إذا احتجت.';}$$('[data-world-help-level]').forEach(button=>button.classList.toggle('is-selected',button===helpLevel));worldStatus();return;}
    const pc=e.target.closest('[data-world-color]');if(pc&&WORLD){WORLD.player.color=pc.dataset.worldColor;$('#world-game').querySelectorAll('[data-world-color]').forEach(b=>b.classList.toggle('is-selected',b===pc));return;}
    const po=e.target.closest('[data-world-outfit]');if(po&&WORLD){WORLD.outfit=po.dataset.worldOutfit;$('#world-game').querySelectorAll('[data-world-outfit]').forEach(b=>b.classList.toggle('is-selected',b===po));return;}
    if(e.target.closest('[data-world-begin]')){WORLD.mode='play';worldRenderPlay();return;}
    const worldStory=e.target.closest('[data-world-story]');if(worldStory){const id=worldStory.dataset.worldStory;closeWorld();openView('stories');startStory(id);return;}
    if(e.target.closest('[data-world-next]')){worldNext();return;}
    if(e.target.closest('[data-world-replay]')){if(WORLD&&WORLD.region){worldChooseRegion(WORLD.region);}else startWorld();return;}
    if(e.target.closest('[data-world-home]')){closeWorld();openView('home');return;}
    if(e.target.closest('[data-world-exit]')){closeWorld();return;}
  });
  document.addEventListener('keydown',e=>{if(!WORLD)return;if(e.key==='Escape'){closeWorld();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();worldCancelAuto();worldMove(e.key);return;}if(e.code==='Space'){e.preventDefault();worldInteract();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&WORLD&&WORLD.raf){cancelAnimationFrame(WORLD.raf);WORLD.raf=0;}else if(!document.hidden&&WORLD&&WORLD.mode==='play')worldDraw();});
  window.addEventListener('resize',()=>{if(WORLD&&WORLD.mode==='play')worldDraw();});

  /* ---------- events ---------- */
  document.addEventListener('input', e => { if(e.target&&e.target.id==='story-dictation-answer'&&ST&&ST.dictationActive)ST.dictationAnswer=e.target.value; });
  document.addEventListener('submit', e => { if(e.target && e.target.id==='typing-form'){e.preventDefault();checkTyping();return;}if(e.target&&e.target.id==='story-dictation-form'){e.preventDefault();checkStoryDictation(e.target);return;} });
  document.addEventListener('click', e => {
    const dictionaryExport = e.target.closest('[data-dictionary-export]');
    if (dictionaryExport) { exportPersonalDictionary(dictionaryExport.dataset.dictionaryExport); return; }
    if(e.target.closest('#wotd-save')){const box=$('#wotd-card'),w=WOTD_WORDS.find(x=>x.word===box.dataset.word);if(w&&!state.words.some(x=>String(x[0]).toLowerCase()===w.word.toLowerCase())){state.words.push([w.word,w.meaning,w.level]);recordLearningActivity({words:1});save();renderAll();toast('Word saved to your vault.');}return;}
    const sb=e.target.closest('[data-speak]'); if(sb){speak(sb.dataset.speak);return;}
    const grammarMode=e.target.closest('[data-grammar-mode]');if(grammarMode){G.grammarMode=grammarMode.dataset.grammarMode;G.i=0;renderGrammarModeQuestion();return;}
    const ownRating=e.target.closest('[data-own-rating]');if(ownRating&&G&&G.type==='grammar'&&G.grammarMode==='own'&&!G.answered){const ok=ownRating.dataset.ownRating==='yes';G.answered=true;if(ok)G.score++;G.results[G.i]=ok?'ok':'no';showSheet(ok,'<h3>'+(ok?'Self-check recorded':'Keep practising')+'</h3><p>'+(ok?'You marked that you applied the rule. Compare your sentence with the model to confirm it.':'Use the model sentence and rule to revise your sentence.')+'</p><div class="sheet-actions"><button class="btn" id="go-next">'+(G.i===G.questions.length-1?'See results':'Continue')+ic('arrow')+'</button></div>');return;}
    const orderWord=e.target.closest('[data-order-word]');if(orderWord&&G&&G.type==='grammar'&&G.grammarMode==='order'){const idx=Number(orderWord.dataset.orderWord);if(G.orderPicked.includes(idx))return;G.orderPicked.push(idx);orderWord.disabled=true;$('#grammar-order-answer').textContent=G.orderPicked.map(i=>G.orderWords[i]).join(' ');return;}
    if(e.target.closest('[data-order-reset]')){G.orderPicked=[];G.orderWords.forEach((_,i)=>{const b=$('[data-order-word="'+i+'"]');if(b)b.disabled=false;});$('#grammar-order-answer').textContent='Your sentence will appear here.';return;}
    if(e.target.closest('[data-order-check]')){const actual=G.orderPicked.map(i=>G.orderWords[i]).join(' ').replace(/[.!?]$/,'').toLowerCase(),ok=actual===G.orderTarget;if(ok)G.score++;G.answered=true;G.results[G.i]=ok?'ok':'no';showSheet(ok,'<h3>'+(ok?'Correct sentence!':'Not quite yet.')+'</h3><p>Suggested answer: <b>'+esc(G.orderTarget)+'</b></p><p>'+esc(G.questions[G.i].q.explain)+'</p><div class="sheet-actions"><button class="btn" id="go-next">'+(G.i===G.questions.length-1?'See results':'Continue')+ic('arrow')+'</button></div>');return;}
    const dailyContinue=e.target.closest('[data-daily-session-continue]');
    if(dailyContinue){startDailySession();return;}
    const rb=e.target.closest('[data-review]');
    if(rb){const item=state.review.find(w=>w.word===rb.dataset.word);if(item){item.attempts=(item.attempts||0)+1;
      if(rb.dataset.review==='known'){
        item.exerciseStage=1;
        if((Number(item.box)||1)>=5&&item.mastered){item.streak=(item.streak||0)+1;}
        else item.mastered=false;
      }else{item.errors=(Number(item.errors)||0)+1;item.box=1;item.interval=0;item.streak=0;item.exerciseStage=0;item.mastered=false;item.due=dayKey();}
      save();renderWords();toast(rb.dataset.review==='known'?'Good recall. Next, practise the word in context.':'No problem — this word stays in today’s practice.');}return;}
    const stageSuccess=e.target.closest('[data-review-stage-success]');
    if(stageSuccess){const item=state.review.find(w=>w.word===stageSuccess.dataset.reviewStageSuccess);if(item){item.exerciseStage=2;save();renderWords();toast('Great — now practise spelling from listening.');}return;}
    const ownSentence=e.target.closest('[data-review-sentence]');
    if(ownSentence){
      const word=ownSentence.dataset.reviewSentence,item=state.review.find(w=>w.word===word),field=$('[data-own-sentence="'+CSS.escape(word)+'"]');
      const sentence=field?field.value.trim():'';
      const tokens=sentence.toLowerCase().split(/[^a-z'-]+/).filter(Boolean);
      if(item&&tokens.length>=3&&tokens.includes(item.word.toLowerCase())){
        const completedBox=Math.max(1,Math.min(5,Number(item.box)||1));
        item.interval=REVIEW_INTERVALS[completedBox-1];
        item.box=Math.min(5,completedBox+1);
        item.exerciseStage=0;
        item.streak=(item.streak||0)+1;
        item.mastered=item.box>=5;
        const due=new Date();due.setDate(due.getDate()+item.interval);item.due=dayKey(due);
        save();renderWords();toast('Nice sentence. Your word moved to Box '+item.box+'.');
      }else toast('Write a sentence of at least three words that uses the target word.');
      return;
    }
    const hard=e.target.closest('[data-hard-review]');
    if(hard){const item=state.review.find(w=>w.word===hard.dataset.hardReview);if(item){item.due=dayKey();item.exerciseStage=0;save();renderWords();toast('Added to today’s review.');}return;}
    const moreToggle = e.target.closest('#dock-more-toggle');
    if (moreToggle) {
      const panel = $('#dock-more-panel'), open = !!panel && panel.hidden;
      if (panel) panel.hidden = !open;
      moreToggle.setAttribute('aria-expanded', String(open));
      return;
    }
    const morePanel = $('#dock-more-panel');
    if (morePanel && !morePanel.hidden && !e.target.closest('#dock-more-panel')) closeDockMore();
    const view = e.target.closest('[data-view]');
    if (view) { if(view.dataset.view==='world'){closeDockMore();startWorld();return;} openView(view.dataset.view); return; }
    const spotWord = e.target.closest('[data-spot-index]');
    if (spotWord && G && G.type === 'spot') { selectSpot(Number(spotWord.dataset.spotIndex)); return; }
    const ans = e.target.closest('.answer');
    if (ans && G) { selectAnswer(Number(ans.dataset.i)); return; }
    if (e.target.closest('#go-next')) { next(); return; }
    if (e.target.closest('#daily-challenge-start')) { startDailyChallenge(); return; }
    if (e.target.closest('#one-life-start')) { startOneLife(); return; }
    if (e.target.closest('#daily-start')) {
      if (state.dailyQuestClaimed) { toast('Today’s challenge is complete — come back tomorrow!'); return; }
      startGame(pickNext()); return;
    }
    if (e.target.closest('#weekly-start')) {
      if (state.weeklyClaimed) { toast('Weekly challenge complete! A new one starts Monday.'); return; }
      startGame(pickNext()); return;
    }
    if (e.target.closest('#freeze-info')) {
      toast(state.streakFreezes > 0
        ? 'Your freeze is automatic: miss one day and return the next day to protect your streak.'
        : 'You have no freezes available. Keep learning to protect your streak.');
      return;
    }
    const categoryClose = e.target.closest('[data-category-close]');
    if (categoryClose) { closeCategoryPicker(); return; }
    const categoryButton = e.target.closest('[data-category]');
    if (categoryButton) {
      const cat=(window.__gameCategories||[]).find(item=>item.id===categoryButton.dataset.category);
      if(cat){
        categoryReturnFocus = categoryButton;
        $('#category-picker-title').textContent=cat.title;
        $('#category-picker-desc').textContent=cat.desc;
        $('#category-options').innerHTML=cat.games.map(([id,label])=>{
          const gmData=GAMES[id], meta=META[id];
          return '<button type="button" class="category-option t-'+meta.tone+'" data-game="'+id+'"><span class="category-option-icon">'+glyph(id)+'</span><span><strong>'+label+'</strong><small>'+meta.time+' min · +'+((gmData||meta).xp)+' XP</small></span><span class="category-option-arrow" aria-hidden="true">→</span></button>';
        }).join('');
        $('#category-picker').hidden=false;
        const firstOption = $('#category-options .category-option');
        if(firstOption)firstOption.focus();
        else { const closeBtn=$('#category-picker [data-category-close]:not(.category-backdrop)'); if(closeBtn)closeBtn.focus(); }
      }
      return;
    }
    if (e.target.closest('#developer-session-toggle')) {
      if (DEV_MODE.active) endDeveloperSession(); else startDeveloperSession();
      return;
    }
    if (e.target.closest('#developer-start')) { launchDeveloperActivity(); return; }
    if (e.target.closest('#daily-session-start')) { startDailySession(); return; }
    const gm = e.target.closest('[data-game]');
    if (gm) { closeCategoryPicker(false); if(gm.dataset.game==='personalized')preparePersonalizedGame(); if(MINI[gm.dataset.game])startMini(gm.dataset.game);else startGame(gm.dataset.game); return; }
    const lv = e.target.closest('[data-level]');
    if (lv) {
      const i = Number(lv.dataset.level), l = LEVELS[i];
      if (i > levelIndex() && !hasDeveloperAccess()) toast(l.id + ' is not unlocked by XP. Pass its level check to update your CEFR estimate.');
      else startGame(LEVEL_GAME[i]);
    }
  });
  document.addEventListener('change', e => { if (e.target && e.target.id === 'developer-activity') renderDeveloperLab(); });
  $('#logo').addEventListener('click', e => { e.preventDefault(); openView('home'); });
  $('#game-close').addEventListener('click', closeGame);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#dock-more-panel') && !$('#dock-more-panel').hidden) { closeDockMore(); $('#dock-more-toggle')?.focus({preventScroll:true}); return; }
    if (e.key === 'Escape' && $('#category-picker') && !$('#category-picker').hidden) { closeCategoryPicker(); return; }
    if(ST&&ST.mode==='quiz'&&!ST.answered&&/^[1-9]$/.test(e.key)){const k=Number(e.key)-1;if(k<ST.story.questions[ST.qi].answers.length)answerStoryQuestion(k);return;}
    if (!G) return;
    if (e.key === 'Escape') { closeGame(); return; }
    if (G.type === 'typing') return;
    if (/^[1-9]$/.test(e.key) && !G.answered) {
      const k = Number(e.key) - 1;
      if (k < G.questions[G.i].q.answers.length) selectAnswer(k);
    } else if (e.key === 'Enter' && G.answered && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) next();
  });

  function shufflePlacement(list){const items=list.slice();for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
  const PLACEMENT_SKILLS = ['vocabulary','grammar','story','listening','advanced'];
  function placementQuestions15(){
    const distribution=[['A1',3],['A2',3],['B1',3],['B2',2],['C1',2],['C2',2]],bank=[];
    for(const [levelId,needed] of distribution){
      const candidates=[];
      PLACEMENT_SKILLS.forEach(gameId=>{
        const pool=(GAMES[gameId]?.questions||[]).filter(q=>q.level===levelId&&Array.isArray(q.answers)&&q.answers.length>=2&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.answers.length);
        shufflePlacement(pool).slice(0,Math.max(1,Math.ceil(needed/PLACEMENT_SKILLS.length))).forEach(q=>candidates.push({...q,placementLevel:levelId,placementSkill:gameId}));
      });
      bank.push(...shufflePlacement(candidates).slice(0,needed));
    }
    if(bank.length<15){
      const used=new Set(bank.map(q=>q.id||q.q)),fallback=[];
      Object.entries(GAMES).forEach(([gameId,game])=>(game.questions||[]).forEach(q=>{
        if(!Array.isArray(q.answers)||q.answers.length<2||!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.answers.length)return;
        const key=q.id||q.q;if(used.has(key))return;fallback.push({...q,placementLevel:q.level||'A1',placementSkill:gameId});
      }));
      bank.push(...shufflePlacement(fallback).slice(0,15-bank.length));
    }
    return shufflePlacement(bank).slice(0,15);
  }
  let placement={questions:[],index:0,answers:[],stage:0,highestPassed:0,stageCorrect:0,scoreByLevel:{}};
  // Promotion rules: XP is a gate, not a level score. Thresholds are intentionally configurable.
  const PROMOTION_XP = [300, 500, 700, 1000, 1300]; // A1→A2, A2→B1, B1→B2, B2→C1, C1→C2
  const PROMOTION_PASS_PERCENT = 80;
  const promotionStatus = () => {
    const index = levelIndex(), next = LEVELS[index + 1];
    const required = PROMOTION_XP[index] || 0;
    const earned = Math.max(0, (Number(state.xp) || 0) - (Number(state.xpAtLevelStart) || 0));
    return {index, next, required, earned, unlocked: !!next && earned >= required};
  };
  let promotionTest = null;
  function buildPromotionQuestions(targetLevel) {
    const bank = [];
    Object.entries(GAMES).forEach(([gameId, game]) => {
      if (!['vocabulary','grammar','story','listening','advanced','mistakes'].includes(gameId)) return;
      (game.questions || []).forEach(q => {
        if (q.level !== targetLevel.id || !Array.isArray(q.answers) || q.answers.length < 2 ||
            !Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.answers.length) return;
        bank.push({...q, promotionSkill: gameId});
      });
    });
    const unique = [...new Map(bank.map(q => [q.id || (q.promotionSkill + '|' + q.q), q])).values()];
    return shufflePlacement(unique).slice(0, 10);
  }
  function startPromotionTest() {
    const status = promotionStatus();
    if (!status.next || !status.unlocked) { toast('Earn the required XP first to unlock this promotion test.'); return; }
    const questions = buildPromotionQuestions(status.next);
    if (questions.length < 8) {
      toast('This level’s test bank is still being prepared. Keep practising; the test will unlock when enough questions are available.');
      return;
    }
    promotionTest = {target:status.next, questions, index:0, answers:[]};
    $('#placement-title').textContent = 'Promotion test · ' + status.next.id;
    $('.placement-card .kicker').textContent = 'PROVE YOUR SKILLS';
    $('.placement-intro').textContent = 'Answer the questions for the next CEFR level. You need at least ' + PROMOTION_PASS_PERCENT + '% to pass. XP unlocks this test; your answers determine whether you advance.';
    $('#placement-skip').hidden = true;
    $('#placement').hidden = false; lockPage(true);
    renderPromotionQuestion();
  }
  function renderPromotionQuestion() {
    const q = promotionTest.questions[promotionTest.index];
    $('#placement-progress').textContent = 'Promotion test · Question ' + (promotionTest.index + 1) + ' of ' + promotionTest.questions.length;
    $('#placement-content').innerHTML = '<h2>' + esc(q.q) + '</h2><p>' + esc(q.sub || 'Choose the best answer.') + '</p><div class="answers">' + q.answers.map((x,i)=>'<button class="answer" data-promotion-answer="' + i + '"><span class="key">' + (i+1) + '</span><span>' + esc(x) + '</span></button>').join('') + '</div>';
  }
  function finishPromotionTest() {
    const correct = promotionTest.answers.filter(a=>a.ok).length;
    const total = promotionTest.questions.length;
    const passed = correct / total * 100 >= PROMOTION_PASS_PERCENT;
    const from = state.assessedLevel, to = promotionTest.target.id;
    state.lastPromotionResult = {from, to, score:correct, total, passed, testedAt:new Date().toISOString()};
    state.promotionAttempts[to] = (Number(state.promotionAttempts[to]) || 0) + 1;
    if (passed) {
      state.assessedLevel = to; state.level = to; state.xpAtLevelStart = Number(state.xp) || 0;
      state.promotionHistory.push({from, to, score:correct, total, testedAt:state.lastPromotionResult.testedAt});
    }
    save();
    $('#placement-title').textContent = passed ? 'Level unlocked: ' + to : 'Keep practising';
    $('.placement-card .kicker').textContent = passed ? 'PROMOTION PASSED' : 'PROMOTION TEST COMPLETE';
    $('.placement-intro').textContent = passed
      ? 'You scored ' + correct + '/' + total + '. Your CEFR level is now ' + to + '. The next promotion journey starts from zero XP earned in this level.'
      : 'You scored ' + correct + '/' + total + '. You need ' + Math.ceil(total * PROMOTION_PASS_PERCENT / 100) + ' correct answers to pass. Practise your weak areas and try again; your XP remains saved.';
    $('#placement-progress').textContent = passed ? 'Congratulations!' : 'Attempt ' + state.promotionAttempts[to];
    $('#placement-content').innerHTML = '<div class="promotion-result"><p><strong>' + correct + ' / ' + total + ' correct</strong></p><p>' + (passed ? 'You demonstrated the next level’s skills.' : 'Your current level stays ' + esc(from) + ' until you pass.') + '</p></div><button type="button" class="btn" data-promotion-close>' + (passed ? 'Continue learning' : 'Return to practice') + '</button>';
    promotionTest = null;
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-promotion-start]')) { startPromotionTest(); return; }
    const answer = e.target.closest('[data-promotion-answer]');
    if (answer && promotionTest) {
      const q = promotionTest.questions[promotionTest.index];
      promotionTest.answers.push({id:q.id || q.q, skill:q.promotionSkill, ok:Number(answer.dataset.promotionAnswer) === q.correct});
      promotionTest.index++;
      if (promotionTest.index < promotionTest.questions.length) renderPromotionQuestion();
      else finishPromotionTest();
      return;
    }
    if (e.target.closest('[data-promotion-close]')) {
      $('#placement').hidden = true; $('#placement-skip').hidden = false;
      $('.placement-card .kicker').textContent = 'A QUICK START';
      $('.placement-intro').textContent = 'Answer up to 30 questions across vocabulary, grammar, reading and comprehension. You advance only after a strong result at each band; this is an estimate, not an official exam.';
      lockPage(false); renderAll();
    }
  });

  function showPlacement(){
    if(state.placementDone)return;
    placement={questions:placementQuestions15(),index:0,answers:[],stage:0,highestPassed:0,stageCorrect:0,scoreByLevel:{}};
    $('#placement').hidden=false;lockPage(true);renderPlacementQuestion();
  }
  window.__epiphanyShowPlacement = showPlacement;
  function renderPlacementQuestion(){
    const q=placement.questions[placement.index];
    $('#placement-progress').textContent='Question '+(placement.index+1)+' of '+placement.questions.length+' · Level '+(q.placementLevel||'A1');
    $('#placement-content').innerHTML='<h2>'+esc(q.q)+'</h2><p>'+esc(q.sub||'Choose the best answer.')+'</p><div class="answers">'+q.answers.map((x,i)=>'<button class="answer" data-place-answer="'+i+'"><span class="key">'+(i+1)+'</span><span>'+esc(x)+'</span></button>').join('')+'</div>';
  }
  function closePlacement(){ $('#placement').hidden=true;lockPage(false);$('#placement-skip').hidden=false;$('#placement-title').textContent='Find your English level';$('.placement-card .kicker').textContent='A QUICK START';$('.placement-intro').textContent='Answer 15 short questions across vocabulary, grammar, conversation and comprehension. We use your results to estimate a starting CEFR level; this is not an official exam.';renderAll(); }
  function skipPlacement(){
    state.assessedLevel='A1';state.level='A1';state.placementDone=true;state.placementResult={level:'A1',skipped:true,testedAt:new Date().toISOString()};
    save();closePlacement();toast('Level check skipped. Your estimated starting level remains A1.');
  }
  $('#placement-skip').addEventListener('click',skipPlacement);
  $('#placement-retake')?.addEventListener('click',()=>{state.placementDone=false;save();showPlacement();});
  function finishPlacement(){
    const scores={};
    placement.answers.forEach(a=>{const row=scores[a.level]||(scores[a.level]={correct:0,total:0});row.total++;if(a.ok)row.correct++;});
    const passing=LEVELS.filter(level=>{const row=scores[level.id];return row&&row.correct/row.total>=.67;});
    const target=passing.length?passing[passing.length-1]:LEVELS[0];
    state.assessedLevel=target.id;state.level=target.id;state.placementDone=true;
    state.placementResult={level:target.id,skipped:false,testedAt:new Date().toISOString(),answered:placement.answers.length,correct:placement.answers.filter(a=>a.ok).length,scores};
    save();closePlacement();renderAll();
    toast('Estimated CEFR level: '+target.id+'. XP is separate from your English assessment.');
  }
  function answerPlacement(choice){
    const q=placement.questions[placement.index],ok=choice===q.correct;
    placement.answers.push({level:q.placementLevel||'A1',skill:q.placementSkill,ok});
    placement.index++;
    if(placement.index<placement.questions.length){renderPlacementQuestion();return;}
    finishPlacement();
  }
  document.addEventListener('click',e=>{const p=e.target.closest('[data-place-answer]');if(p&&!$('#placement').hidden){answerPlacement(Number(p.dataset.placeAnswer));return;}});
  window.__epiphanyReadProgress = () => JSON.parse(JSON.stringify(state));
  window.__epiphanyApplyCloudProgress = progress => {
    const incoming = progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : {};
    state = {...defaults(), ...incoming};
    if (!LEVELS.some(level => level.id === state.assessedLevel)) { state.assessedLevel = 'A1'; state.placementDone = false; state.placementResult = null; }
    if (!Number.isFinite(state.xpAtLevelStart)) state.xpAtLevelStart = Number(state.xp) || 0;
    if (!Array.isArray(state.promotionHistory)) state.promotionHistory = [];
    if (!state.promotionAttempts || typeof state.promotionAttempts !== 'object' || Array.isArray(state.promotionAttempts)) state.promotionAttempts = {};
    if (!Array.isArray(state.words)) state.words = [];
    if (!Array.isArray(state.review)) state.review = [];
    if (!Array.isArray(state.completed)) state.completed = [];
    if (!state.mistakeTrapErrors || typeof state.mistakeTrapErrors !== 'object' || Array.isArray(state.mistakeTrapErrors)) state.mistakeTrapErrors = {};
    if (!state.mistakeQuestionErrors || typeof state.mistakeQuestionErrors !== 'object' || Array.isArray(state.mistakeQuestionErrors)) state.mistakeQuestionErrors = {};
    if (!state.modes || typeof state.modes !== 'object' || Array.isArray(state.modes)) state.modes = {};
    if (!state.weakTraps || typeof state.weakTraps !== 'object' || Array.isArray(state.weakTraps)) state.weakTraps = {};
    if (!state.stories || typeof state.stories !== 'object' || Array.isArray(state.stories)) state.stories = {};
    if (!state.world || typeof state.world !== 'object' || Array.isArray(state.world)) state.world = {done:[],stars:{}};
    if (!Array.isArray(state.world.done)) state.world.done = [];
    if (!state.world.stars || typeof state.world.stars !== 'object' || Array.isArray(state.world.stars)) state.world.stars = {};
    if (state.lastDay !== dayKey()) state.daily = 0;
    if (state.dailyQuestDate !== dayKey()) {
      state.dailyQuestDate = dayKey(); state.dailyQuestProgress = 0; state.dailyQuestClaimed = false; state.dailyCorrect = 0; state.dailyXp = 0;
    }
    if (state.weeklyKey !== weekKey()) { state.weeklyKey = weekKey(); state.weeklyProgress = 0; state.weeklyClaimed = false; }
    try { localStorage.setItem('epiphany-progress', JSON.stringify(state)); } catch {}
    renderAll();
  };
  window.__epiphanyResetProgress = () => {
    state = defaults();
    try { localStorage.setItem('epiphany-progress', JSON.stringify(state)); } catch {}
    renderAll();
  };
  renderAll();
  enhanceTranslationControls($('#game-body'));
  let accountWelcomeDismissed = false;
  try { accountWelcomeDismissed = localStorage.getItem('epiphany-account-welcome-dismissed') === '1'; } catch {}
  if(!state.placementDone && accountWelcomeDismissed)showPlacement();
})();
