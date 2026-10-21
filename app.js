const LEVELS = [
  {id:'A1',name:'Newcomer',title:'First Steps',desc:'Meet everyday words, build simple sentences, and start saying what you mean.',theme:'Your first discoveries',xp:0},
  {id:'A2',name:'Explorer',title:'Everyday Explorer',desc:'Talk about your life, make plans, and handle familiar everyday situations.',theme:'The everyday world',xp:180},
  {id:'B1',name:'Wayfinder',title:'Independent Wayfinder',desc:'Tell stories, explain opinions, and navigate travel, study, and work.',theme:'Stories & possibilities',xp:520},
  {id:'B2',name:'Trailblazer',title:'Confident Trailblazer',desc:'Follow complex ideas, debate thoughtfully, and express yourself with nuance.',theme:'Ideas in motion',xp:1100},
  {id:'C1',name:'Wordsmith',title:'Fluent Wordsmith',desc:'Use flexible language, read between the lines, and communicate precisely.',theme:'Beyond the obvious',xp:2100},
  {id:'C2',name:'Virtuoso',title:'Language Virtuoso',desc:'Handle subtle meaning, sophisticated texts, and demanding real-world tasks.',theme:'Mastery without borders',xp:3600}
];
const GAMES = {
  vocabulary:{title:'Word collector',category:'VOCABULARY',xp:30,desc:'Choose the meaning that fits best.',questions:[
    {q:'What does “borrow” mean?',sub:'Choose the closest meaning.',answers:['To give something away','To take something for a while and return it','To buy something new','To lose something'],correct:1,explain:'Borrow means to take and use something that belongs to someone else, then give it back.',word:['borrow','to use something and return it']},
    {q:'She was absolutely delighted.',sub:'What does “delighted” mean?',answers:['Very pleased and happy','A little confused','Extremely tired','Quite worried'],correct:0,explain:'Delighted means very happy or pleased. It is stronger than simply “glad”.',word:['delighted','very pleased and happy']},
    {q:'Which word means “happening often”?',sub:'Choose the best word.',answers:['Rare','Frequent','Unlikely','Brief'],correct:1,explain:'Frequent describes something that happens often.',word:['frequent','happening often']},
    {q:'“I need to figure it out.” What does it mean?',sub:'Understand the expression.',answers:['Draw a picture','Find an answer or understand something','Forget about it','Explain it loudly'],correct:1,explain:'To figure something out is to understand or solve it.',word:['figure out','to understand or solve something']},
    {q:'Choose the best word: The instructions were so ___ that nobody was confused.',sub:'Complete the sentence.',answers:['vague','clear','scarce','reluctant'],correct:1,explain:'Clear means easy to understand, which fits the second half of the sentence.',word:['clear','easy to understand']}
  ]},
  grammar:{title:'Sentence shaper',category:'GRAMMAR',xp:40,desc:'Find the sentence that works.',questions:[
    {q:'She ___ to school every day.',sub:'Choose the correct form.',answers:['go','goes','going','gone'],correct:1,explain:'With he, she, or it in the present simple, most verbs take -s: she goes.',word:null},
    {q:'They ___ dinner when I arrived.',sub:'Choose the best tense.',answers:['have','were having','are having','had have'],correct:1,explain:'The past continuous describes an action in progress when another past event happened.',word:null},
    {q:'If I ___ more time, I would learn Italian.',sub:'Complete the second conditional.',answers:['have','will have','had','would have'],correct:2,explain:'The second conditional uses if + past simple, then would + base verb for an unreal or imagined situation.',word:null},
    {q:'Neither of the answers ___ correct.',sub:'Choose the standard form.',answers:['are','were','is','be'],correct:2,explain:'In formal standard English, neither is generally treated as singular here: neither is correct.',word:null},
    {q:'By next June, she ___ her degree.',sub:'Choose the future perfect.',answers:['will finish','will have finished','has finished','finishes'],correct:1,explain:'The future perfect (will have + past participle) describes something completed before a future point.',word:null}
  ]},
  story:{title:'Lost in London',category:'REAL LIFE',xp:50,desc:'Make choices to keep the conversation moving.',questions:[
    {q:'You need to find the train station. What do you ask?',sub:'A stranger is walking past.',answers:['Where train station?','Could you tell me how to get to the train station?','You tell station now.','How I am station?'],correct:1,explain:'“Could you tell me how to get to…?” is a polite, natural way to ask for directions.',word:['Could you tell me how to get to…?','a polite way to ask for directions']},
    {q:'The person says, “It’s just around the corner.” What do they mean?',sub:'Understand the direction.',answers:['It is very far away','It is nearby, after turning at the next corner','It is upstairs','It is closed today'],correct:1,explain:'“Just around the corner” usually means very close by.',word:['around the corner','very nearby']},
    {q:'You did not hear the directions clearly. You say…',sub:'Keep the conversation friendly.',answers:['Say it again!','What?','Sorry, would you mind repeating that?','You are wrong.'],correct:2,explain:'“Would you mind repeating that?” is polite and natural when you need someone to say something again.',word:['Would you mind repeating that?','a polite request for repetition']},
    {q:'The person helps you. What is a natural response?',sub:'Choose a friendly reply.',answers:['I appreciate your help, thank you.','I am appreciating you help.','Thanks for your helps.','I thank you much.'],correct:0,explain:'“I appreciate your help” is a natural way to express gratitude.',word:null},
    {q:'You are almost there. You hear, “You can’t miss it.” This means…',sub:'Understand the expression.',answers:['You must not go there','It is easy to see or find','You have lost your ticket','It is already closed'],correct:1,explain:'“You can’t miss it” means the place is easy to spot or find.',word:['You can’t miss it','it is easy to see or find']}
  ]},
  listening:{title:'Meaning detective',category:'COMPREHENSION',xp:35,desc:'Read a short message and catch the important detail.',questions:[
    {q:'Message: “The meeting has been pushed back to half past three.” When is it now?',sub:'Read carefully.',answers:['3:00','3:15','3:30','4:30'],correct:2,explain:'Half past three means 3:30. “Pushed back” means the meeting was delayed to a later time.',word:['pushed back','delayed until a later time']},
    {q:'“Although it was raining, we decided to go hiking.” What happened?',sub:'Notice the contrast.',answers:['They stayed home because of rain','They went hiking despite the rain','The rain stopped before they left','They planned to go another day'],correct:1,explain:'Although introduces a contrast: it was raining, but they went hiking anyway.',word:['although','used to introduce a contrast']},
    {q:'A notice says: “No later than Friday.” What is the deadline?',sub:'Interpret the phrase.',answers:['After Friday','Any time next week','Friday at the latest','Only before Monday'],correct:2,explain:'“No later than Friday” means Friday is the latest acceptable time.',word:['no later than','by the stated time at the latest']},
    {q:'“I’d rather you didn’t mention it.” The speaker is asking you to…',sub:'Understand the intention.',answers:['Tell everyone','Avoid talking about it','Write it down','Explain it again'],correct:1,explain:'“I’d rather you didn’t…” expresses a preference that someone not do something.',word:null},
    {q:'“The proposal was rejected on the grounds that it was too costly.” Why was it rejected?',sub:'Find the reason.',answers:['It was too complicated','It was too expensive','It arrived too late','It was incomplete'],correct:1,explain:'“On the grounds that” introduces the reason. Costly means expensive.',word:['on the grounds that','for the reason that']}
  ]},
  spelling:{title:'Word detective',category:'SPELLING',xp:30,desc:'Spot the correctly written word.',questions:[
    {q:'Which spelling is correct?',sub:'Choose carefully.',answers:['Definately','Definitely','Definitly','Definetely'],correct:1,explain:'Definitely is spelled d-e-f-i-n-i-t-e-l-y. A useful trick: it contains “finite”.',word:['definitely','without doubt']},
    {q:'Choose the correct word.',sub:'Something that can be trusted is…',answers:['reliable','relyable','reliabel','relyible'],correct:0,explain:'Reliable is the correct spelling, formed from rely + -able.',word:['reliable','able to be trusted']},
    {q:'Which is the correct form?',sub:'A strong feeling of certainty.',answers:['Confidance','Confidence','Confidense','Confidance'],correct:1,explain:'Confidence is spelled with -ence at the end.',word:['confidence','belief in yourself or something']},
    {q:'Choose the correct spelling.',sub:'To make something better.',answers:['Improve','Impruve','Improvve','Improv'],correct:0,explain:'Improve is spelled i-m-p-r-o-v-e.',word:['improve','to make or become better']},
    {q:'Which word is correct?',sub:'A difficult situation or problem.',answers:['Challange','Challenge','Chalenge','Challeng'],correct:1,explain:'Challenge has one “l” in the middle after “a” and ends in -enge.',word:['challenge','a difficult task or situation']}
  ]},
  advanced:{title:'Nuance navigator',category:'ADVANCED ENGLISH',xp:55,desc:'Choose the most precise and natural expression.',questions:[
    {q:'“Her explanation was plausible, but not entirely convincing.” This means it was…',sub:'Read for nuance.',answers:['Obviously false','Seemingly reasonable, but not fully persuasive','Completely proven','Impossible to understand'],correct:1,explain:'Plausible means apparently reasonable or believable. It does not necessarily mean proven.',word:['plausible','seemingly reasonable or believable']},
    {q:'Choose the best connector: “The evidence was limited; ___, the conclusion was tentative.”',sub:'Show a logical result.',answers:['nevertheless','consequently','whereas','meanwhile'],correct:1,explain:'Consequently signals a result: because the evidence was limited, the conclusion was tentative.',word:['consequently','as a result']},
    {q:'“He was reluctant to endorse the proposal.” He was…',sub:'Infer the attitude.',answers:['Eager to support it','Hesitant or unwilling to support it','Unable to understand it','Certain to reject it publicly'],correct:1,explain:'Reluctant means unwilling or hesitant. It suggests hesitation, not necessarily outright refusal.',word:['reluctant','hesitant or unwilling']},
    {q:'Which phrase most clearly signals a concession?',sub:'Choose the most precise transition.',answers:['In addition','For instance','Admittedly','As a result'],correct:2,explain:'Admittedly acknowledges a point or limitation before introducing a contrasting or qualifying claim.',word:['admittedly','used to acknowledge a point or limitation']},
    {q:'“The findings are inconclusive.” This means the findings…',sub:'Choose the exact meaning.',answers:['Prove the hypothesis','Do not lead to a definite conclusion','Are irrelevant','Have been disproved'],correct:1,explain:'Inconclusive evidence does not settle the question either way.',word:['inconclusive','not leading to a definite conclusion']}
  ]}
};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const localDayKey = (date = new Date()) => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const defaultState = () => ({xp:0,quests:0,words:[],completed:[],streak:0,lastDay:null,daily:0,level:'A1',sound:true,helpArabic:false});
let state;
try { state = {...defaultState(), ...JSON.parse(localStorage.getItem('epiphany-progress') || '{}')}; } catch { state = defaultState(); }
if (state.lastDay !== localDayKey()) state.daily = 0;
let activeGame = null, questionIndex = 0, gameScore = 0, gameAnswers = [], answered = false, gameWords = [];
function saveState(){try{localStorage.setItem('epiphany-progress',JSON.stringify(state));$('#save-status').textContent='Progress saved on this device';}catch{$('#save-status').textContent='Session progress only';}syncArabicHelpButton();
renderStats();}
function currentLevel(){return [...LEVELS].reverse().find(l=>state.xp>=l.xp)||LEVELS[0];}
function levelIndex(){return LEVELS.findIndex(l=>l.id===currentLevel().id);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderStats(){
 const level=currentLevel();state.level=level.id;
 $('#xp-total').innerHTML=state.xp+' <small>XP</small>';$('#quest-total').textContent=state.quests;$('#word-total').textContent=state.words.length;
 $('#level-stat').innerHTML=level.id+' <small>'+level.name+'</small>';$('#profile-level').textContent=level.id+' · '+level.name;$('#streak-count').textContent=(state.streak||0)+' day streak';
 const next=LEVELS[levelIndex()+1];const progress=next?Math.min(100,Math.round((state.xp-level.xp)/(next.xp-level.xp)*100)):100;
 $('#xp-mini-bar').style.width=progress+'%';$('#xp-next').textContent=next?(next.xp-state.xp)+' XP to '+next.id:'C2 unlocked — extraordinary!';
 $('#daily-count').textContent=Math.min(state.daily,2)+' of 2 quests';$('#daily-percent').textContent=Math.min(100,Math.round(state.daily/2*100))+'%';$('#daily-bar').style.width=Math.min(100,state.daily/2*100)+'%';
 $('#path-note').textContent=next?'You’re building toward '+next.id+'. Complete activities, review mistakes, and keep your skills growing.':'You have reached the C2 XP milestone. Keep practising to maintain your edge.';
 renderLevels();
}
function renderLevels(){
 const idx=levelIndex();$('#level-track').innerHTML=LEVELS.map((l,i)=>'<div class="level-node '+(i<idx?'done ':i===idx?'current ':'')+(state.completed.includes(l.id)?'done':'')+'"><div class="level-dot">'+(i<idx?'✓':l.id)+'</div><span class="level-name">'+l.id+'</span></div>').join('');
 $('#world-grid').innerHTML=LEVELS.map((l,i)=>{const unlocked=i<=idx;return '<button class="world-card '+(!unlocked?'locked':'')+'" data-level="'+l.id+'"><div class="world-art"></div><div class="world-level">'+l.id+' · '+l.name.toUpperCase()+'</div><h3>'+l.title+'</h3><p>'+l.desc+'</p><div class="world-meta"><span>'+(unlocked?'Explore this world':'🔒 Unlock at '+l.xp+' XP')+'</span><span class="world-status">'+(unlocked?'↗':'◌')+'</span></div></button>';}).join('');
 $('#activity-grid').innerHTML=[['vocabulary','Aa','Word collector','Grow your vocabulary in context.','3 min','+30 XP'],['grammar','⌘','Sentence shaper','Build accurate, natural sentences.','4 min','+40 XP'],['story','↗','Lost in London','Make choices in everyday conversations.','5 min','+50 XP'],['listening','◖','Meaning detective','Understand messages, tone, and intent.','4 min','+35 XP'],['spelling','✳','Word detective','Sharpen spelling and word recognition.','3 min','+30 XP'],['advanced','✧','Nuance navigator','Explore precise language and subtle meaning.','6 min','+55 XP']].map(a=>'<button class="activity-card" data-game="'+a[0]+'"><div class="activity-icon">'+a[1]+'</div><h3>'+a[2]+'</h3><p>'+a[3]+'</p><div class="activity-meta"><span>'+a[4]+'</span><span>'+a[5]+' ↗</span></div></button>').join('');
 renderVault();renderAchievements();
}
function renderVault(){
 const box=$('#vault-content');if(!state.words.length){box.innerHTML='<div class="empty-state"><div class="empty-icon">▤</div><h3>Your word vault is waiting.</h3><p>Finish a vocabulary or story quest to collect your first useful expression.</p><button class="btn btn-primary" data-game="vocabulary">Find your first word ↗</button></div>';return;}
 box.innerHTML='<div class="word-list">'+state.words.map(w=>'<div class="word-row"><div><strong>'+escapeHtml(w[0])+'</strong><small>'+escapeHtml(w[1])+'</small></div><span class="word-level">'+escapeHtml(w[2]||currentLevel().id)+'</span></div>').join('')+'</div>';
}
function renderAchievements(){
 const all=[['✦','First Spark','Complete your first quest.',state.quests>=1],['Aa','Word Gatherer','Discover 5 useful words.',state.words.length>=5],['⚡','Momentum','Complete 5 quests.',state.quests>=5],['♨','Habit Builder','Return for 3 days.',state.streak>=3],['◎','World Traveler','Reach B1.',levelIndex()>=2],['✧','Mastermind','Reach C1.',levelIndex()>=4]];
 $('#achievement-grid').innerHTML=all.map(a=>'<article class="achievement-card '+(!a[3]?'locked-achievement':'')+'"><div class="achievement-icon">'+a[0]+'</div><h3>'+a[1]+'</h3><p>'+a[2]+'</p><div class="activity-meta"><span>'+(a[3]?'UNLOCKED':'LOCKED')+'</span><span>'+(a[3]?'✓':'◌')+'</span></div></article>').join('');
}
function openView(name){
 $$('.view').forEach(v=>v.classList.toggle('active-view',v.id===name+'-view'));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
 const label={home:'ADVENTURE HOME',worlds:'EXPLORE WORLDS',practice:'QUICK PRACTICE',vocabulary:'WORD VAULT',achievements:'ACHIEVEMENTS'};$('#breadcrumb-current').textContent=label[name]||'ADVENTURE HOME';$('#sidebar').classList.remove('mobile-open');window.scrollTo({top:0,behavior:'smooth'});
}
function startGame(type){
 const game=GAMES[type];if(!game)return;activeGame=type;questionIndex=0;gameScore=0;gameAnswers=[];gameWords=[];answered=false;
 $('#game-overlay').classList.add('open');$('#game-overlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderQuestion();
}
function arabicGuidance(type){return ({vocabulary:'اختر المعنى الأقرب للكلمة أو العبارة الإنجليزية.',grammar:'اختر الصيغة التي تجعل الجملة صحيحة وطبيعية.',story:'تخيّل أنك في هذا الموقف الحقيقي واختر الرد الأنسب والأكثر تهذيبًا.',listening:'اقرأ الرسالة بعناية وابحث عن معناها أو المعلومة الأساسية.',spelling:'اختر الكلمة المكتوبة بطريقة صحيحة.',advanced:'ركّز على الفروق الدقيقة في المعنى والمنطق بين الخيارات.'})[type]||'خذ وقتك واقرأ الخيارات بهدوء.';}
function renderQuestion(){
 const g=GAMES[activeGame];const q=g.questions[questionIndex];answered=false;
 $('#game-step-label').textContent='QUEST '+(questionIndex+1)+' OF '+g.questions.length;$('#game-progress-bar').style.width=((questionIndex)/g.questions.length*100)+'%';$('#game-xp').textContent='+'+g.xp+' XP';
 $('#game-content').innerHTML='<div class="game-heading"><div class="game-kicker">'+g.category+' · '+currentLevel().id+'</div><h2>'+g.title+'</h2><p>'+g.desc+'</p></div><div class="question-box"><div class="question-label">CHALLENGE '+(questionIndex+1)+'</div><h3>'+escapeHtml(q.q)+'</h3><p>'+escapeHtml(q.sub)+'</p></div>'+(state.helpArabic?'<div class="arabic-help" lang="ar" dir="rtl"><strong>مساعدة بالعربية</strong><span>'+arabicGuidance(activeGame)+'</span></div>':'')+'<div class="answer-list">'+q.answers.map((a,i)=>'<button class="answer-option" data-answer="'+i+'"><span class="answer-letter">'+String.fromCharCode(65+i)+'</span><span>'+escapeHtml(a)+'</span></button>').join('')+'</div><div class="feedback-box" id="feedback-box" aria-live="polite"></div><div class="game-footer"><span class="hint">No pressure — learn as you go.</span><button class="btn btn-primary" id="next-question" disabled>'+(questionIndex===g.questions.length-1?'See results':'Continue')+' →</button></div>';
 $$('#game-content [data-answer]').forEach(b=>b.addEventListener('click',()=>selectAnswer(Number(b.dataset.answer))));$('#next-question').addEventListener('click',()=>{if(questionIndex<g.questions.length-1){questionIndex++;renderQuestion();}else showResults();});
}
function selectAnswer(choice){
 if(answered)return;answered=true;const g=GAMES[activeGame],q=g.questions[questionIndex],correct=choice===q.correct;if(correct)gameScore++;gameAnswers.push({correct,choice,correctAnswer:q.correct});
 if(q.word&&correct)gameWords.push(q.word);
 $$('#game-content [data-answer]').forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===choice)b.classList.add('wrong');});
 const fb=$('#feedback-box');fb.classList.add('show');fb.innerHTML='<strong>'+(correct?'✦ Exactly right!':'Not quite — and that’s okay.')+'</strong>'+escapeHtml(q.explain)+(state.helpArabic?'<div class="arabic-feedback" lang="ar" dir="rtl">'+(correct?'أحسنت! إجابتك صحيحة. اقرأ التفسير الإنجليزي لتثبيت القاعدة أو المعنى.':'لا بأس، الخطأ جزء من التعلّم. الإجابة الصحيحة مميّزة أعلاه؛ قارنها باختيارك ثم اقرأ التفسير.')+'</div>':'');$('#next-question').disabled=false;
}
function showResults(){
 const g=GAMES[activeGame],total=g.questions.length,earned=Math.round(g.xp*(.35+.65*gameScore/total));$('#game-progress-bar').style.width='100%';$('#game-step-label').textContent='QUEST COMPLETE';$('#game-xp').textContent='+'+earned+' XP';
 $('#game-content').innerHTML='<div class="game-result"><div class="result-star">'+(gameScore===total?'✦':'✧')+'</div><div class="game-kicker">QUEST COMPLETE</div><h2>'+(gameScore===total?'Brilliant work!':gameScore>=3?'Look at you, growing!':'Every try teaches you something.')+'</h2><p>You got '+gameScore+' out of '+total+' correct. '+(gameScore===total?'A perfect round — enjoy that feeling.':'Review the explanations and give it another go when you’re ready.')+'</p><div class="result-stats"><div class="result-stat"><strong>+'+earned+'</strong><span>XP EARNED</span></div><div class="result-stat"><strong>'+gameScore+'/'+total+'</strong><span>CORRECT</span></div><div class="result-stat"><strong>'+gameWords.length+'</strong><span>WORDS FOUND</span></div></div><button class="btn btn-primary" id="finish-game">Back to your adventure ↗</button> <button class="btn btn-quiet" id="retry-game">Play again</button></div>';
 const levelAtQuestStart=currentLevel().id;state.xp+=earned;state.quests++;state.daily=Math.min(2,state.daily+1);const today=localDayKey();if(state.lastDay!==today){const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const wasYesterday=state.lastDay===localDayKey(yesterday);state.streak=wasYesterday?(state.streak||0)+1:1;state.lastDay=today;}if(!state.completed.includes(levelAtQuestStart))state.completed.push(levelAtQuestStart);
 gameWords.forEach(w=>{if(!state.words.some(existing=>existing[0]===w[0]))state.words.push([...w,currentLevel().id]);});saveState();renderLevels();
 $('#finish-game').addEventListener('click',closeGame);$('#retry-game').addEventListener('click',()=>startGame(activeGame));
}
function closeGame(){ $('#game-overlay').classList.remove('open');$('#game-overlay').setAttribute('aria-hidden','true');document.body.style.overflow='';activeGame=null; }
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.view)));
$$('[data-open-view]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.openView)));
document.addEventListener('click',e=>{const game=e.target.closest('[data-game]');if(game){startGame(game.dataset.game);return;}const world=e.target.closest('[data-level]');if(world){const i=LEVELS.findIndex(l=>l.id===world.dataset.level);if(i>levelIndex()){toast('Keep questing to unlock '+world.dataset.level+'!');return;}const gameForLevel=i>=4?'advanced':i===3?'listening':i===2?'story':i===1?'grammar':'vocabulary';startGame(gameForLevel);}});
$('#continue-btn').addEventListener('click',()=>startGame(currentLevel().id==='C1'||currentLevel().id==='C2'?'advanced':'vocabulary'));
$('#daily-btn').addEventListener('click',()=>startGame(state.daily%2===0?'vocabulary':'story'));
$('#close-game').addEventListener('click',closeGame);$('#game-overlay').addEventListener('click',e=>{if(e.target.id==='game-overlay')closeGame();});
$('#mobile-menu').addEventListener('click',()=>$('#sidebar').classList.toggle('mobile-open'));
$('#sound-toggle').addEventListener('click',()=>{state.sound=!state.sound;$('#sound-toggle').style.color=state.sound?'#b8aaff':'#77738c';toast(state.sound?'Sound effects enabled':'Sound effects muted');saveState();});
function syncArabicHelpButton(){const b=$('#help-toggle');if(!b)return;b.textContent=state.helpArabic?'العربية ON':'العربية OFF';b.setAttribute('aria-pressed',String(state.helpArabic));b.classList.toggle('enabled',state.helpArabic);}
$('#help-toggle').addEventListener('click',()=>{state.helpArabic=!state.helpArabic;syncArabicHelpButton();saveState();if(activeGame&&!answered)renderQuestion();toast(state.helpArabic?'Arabic learning help enabled':'Arabic learning help disabled');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGame();});
syncArabicHelpButton();
renderStats();