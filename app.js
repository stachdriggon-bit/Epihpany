/* Epiphany app logic. Lesson content lives in data.js (LEVELS, GAMES, AR_EXPLANATIONS).
   Saved progress keeps the same localStorage key and shape as the first prototype. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ic = n => '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  const dayKey = (d = new Date()) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  const weekKey = (d = new Date()) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); };
  const DAILY_QUESTS = [
    {title:'Finish one quest',desc:'Play any game from start to results.',target:1,kind:'quests',reward:15},
    {title:'Earn 25 XP today',desc:'Keep learning and collect 25 XP today.',target:25,kind:'xp',reward:15},
    {title:'Get 4 answers right',desc:'Answer 4 questions correctly on your first try.',target:4,kind:'correct',reward:15}
  ];

  /* ---------- state ---------- */
  const defaults = () => ({xp:0, quests:0, words:[], review:[], placementDone:false, completed:[], streak:0, lastDay:null, daily:0, level:'A1', sound:true, helpArabic:false, theme:'light', streakFreezes:1, dailyQuestDate:null, dailyQuestProgress:0, dailyQuestClaimed:false, dailyCorrect:0, dailyXp:0, weeklyKey:null, weeklyProgress:0, weeklyClaimed:false, mistakeTrapErrors:{}, mistakeQuestionErrors:{}, modes:{}, weakTraps:{}, stories:{}, world:{done:[],stars:{}}});
  let state;
  try { state = {...defaults(), ...JSON.parse(localStorage.getItem('epiphany-progress') || '{}')}; } catch { state = defaults(); }
  if (!Array.isArray(state.review)) state.review = [];
  if (!state.mistakeTrapErrors || typeof state.mistakeTrapErrors !== 'object' || Array.isArray(state.mistakeTrapErrors)) state.mistakeTrapErrors = {};
  if (!state.mistakeQuestionErrors || typeof state.mistakeQuestionErrors !== 'object' || Array.isArray(state.mistakeQuestionErrors)) state.mistakeQuestionErrors = {};
  if (!state.modes || typeof state.modes !== 'object' || Array.isArray(state.modes)) state.modes = {};
  if (!state.weakTraps || typeof state.weakTraps !== 'object' || Array.isArray(state.weakTraps)) state.weakTraps = {};
  if (!state.stories || typeof state.stories !== 'object' || Array.isArray(state.stories)) state.stories = {};
  if (!state.world || typeof state.world !== 'object' || Array.isArray(state.world)) state.world = {done:[],stars:{}};
  if (!Array.isArray(state.world.done)) state.world.done = [];
  if (!state.world.stars || typeof state.world.stars !== 'object' || Array.isArray(state.world.stars)) state.world.stars = {};
  if (!Number.isFinite(state.streakFreezes)) state.streakFreezes = 1;
  if (state.lastDay !== dayKey()) state.daily = 0;
  if (state.dailyQuestDate !== dayKey()) { state.dailyQuestDate = dayKey(); state.dailyQuestProgress = 0; state.dailyQuestClaimed = false; state.dailyCorrect = 0; state.dailyXp = 0; }
  if (state.weeklyKey !== weekKey()) { state.weeklyKey = weekKey(); state.weeklyProgress = 0; state.weeklyClaimed = false; }
  let saveWarned = false;
  function save() {
    try { localStorage.setItem('epiphany-progress', JSON.stringify(state)); }
    catch { if (!saveWarned) { saveWarned = true; toast('Progress can’t be saved in this browser. It will last for this visit only.'); } }
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
    spot:      {label:'Spot the Mistake', tone:'coral', glyph:'?!', time:4, blurb:'Tap the one incorrect word.'},
    typing:    {label:'Type It', tone:'sky', glyph:'Aa', time:4, blurb:'Write the missing word from memory.'}
  };
  const ORDER = ['vocabulary', 'spelling', 'grammar', 'story', 'listening', 'advanced', 'mistakes', 'typing'];
  const UNLOCK = {vocabulary:0, spelling:0, grammar:1, story:2, listening:3, advanced:4, mistakes:0, spot:0, typing:0};
  GAMES.mistakes = {title:'Common Mistakes', category:'GRAMMAR', xp:40, desc:'Understand common mistakes made by English learners.', questions:MISTAKE_QUESTIONS.map(q=>({q:q.prompt,sub:q.sub,answers:q.options,correct:q.answer,explain:q.why_en,word:null,level:q.level,ar:q.arabic_hint,id:q.id,trap:q.trap,why_ar:q.why_ar,arabic_hint:q.arabic_hint,aha:null}))};
  GAMES.spot = {title:'Spot the Mistake',category:'GRAMMAR',xp:40,desc:'Tap the one incorrect word in a short text.',questions:SPOT_QUESTIONS.map(q=>({...q,q:q.text,sub:'Tap the one incorrect word.',answers:[q.fix],correct:q.wrongIndex,explain:q.why_en,aha:null,mode:'spot'}))};
  GAMES.typing = {title:'Type It',category:'WRITING',xp:45,desc:'Write the missing word without multiple-choice hints.',questions:TYPING_QUESTIONS.map(q=>({...q,q:q.prompt,sub:'Hint: '+q.hint,answers:q.accept,correct:0,explain:q.why_en,aha:null,mode:'typing'}))};
  const AHA_BY_QUESTION = Object.fromEntries(AHA_NOTES.map(note=>[note.questionId,note]));
  Object.values(GAMES).forEach(game=>(game.questions||[]).forEach(item=>{const note=AHA_BY_QUESTION[item.id];if(note)item.aha={en:note.en,ar:note.ar};}));   // level index that suggests each game
  const LEVEL_GAME = ['vocabulary', 'grammar', 'story', 'listening', 'advanced', 'advanced']; // same mapping the world map used
  const glyph = g => META[g].icon ? ic(META[g].icon) : META[g].glyph;

  /* ---------- derived values ---------- */
  const levelIndex = () => { let i = 0; LEVELS.forEach((l, k) => { if (state.xp >= l.xp) i = k; }); return i; };
  const currentLevel = () => LEVELS[levelIndex()];
  const liveStreak = () => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return state.lastDay === dayKey() || state.lastDay === dayKey(y) || (state.lastDay === dayKey(twoDaysAgo) && state.streakFreezes > 0) ? (state.streak || 0) : 0;
  };
  function pickNext() {
    const rotation = ['vocabulary', 'spelling', 'grammar', 'story', 'listening', 'advanced', 'mistakes', 'spot', 'typing'];
    const ok = rotation.filter(g => UNLOCK[g] <= levelIndex());
    return ok[state.quests % ok.length];
  }

  /* ---------- rendering: header + home ---------- */
  function renderHeader() {
    $('#chip-streak').textContent = liveStreak();
    const homeStreak = $('#home-streak'); if (homeStreak) homeStreak.textContent = liveStreak();
    $('#chip-xp').textContent = state.xp;
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

  function renderHome() {
    const h = new Date().getHours();
    $('#greeting').textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

    renderChallenges();
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

    const done = Math.min(state.daily, 2);
    $('#ring-text').textContent = done + '/2';
    $('#ring').setAttribute('aria-label', 'Daily goal: ' + done + ' of 2 quests');
    $('#ring-fg').style.strokeDashoffset = (207.35 * (1 - done / 2)).toFixed(2);
    $('#ring-note').textContent = done >= 2 ? 'Goal complete. Your streak is safe today.'
      : done === 1 ? 'One more quest keeps your streak alive.' : 'Finish 2 quests to keep your streak alive.';

    const idx = levelIndex(), lv = LEVELS[idx], nx = LEVELS[idx + 1];
    const pct = nx ? Math.min(100, Math.round((state.xp - lv.xp) / (nx.xp - lv.xp) * 100)) : 100;
    $('#lv-name').textContent = lv.id + ' · ' + lv.name;
    const homeLevel = $('#home-level'); if (homeLevel) homeLevel.textContent = lv.id;
    $('#lv-next').textContent = nx ? (nx.xp - state.xp) + ' XP to ' + nx.id : 'Top level reached';
    $('#lv-bar').style.width = pct + '%';
    $('#lv-bar-wrap').setAttribute('aria-valuenow', pct);

    const track = $('#track');
    track.style.setProperty('--prog', (idx / (LEVELS.length - 1)).toFixed(3));
    track.innerHTML = LEVELS.map((l, i) => {
      const cls = i < idx ? 'done' : i === idx ? 'current' : 'locked';
      const dot = i < idx ? ic('check') : i > idx ? ic('lock') : l.id;
      const sub = i < idx ? 'Cleared' : i === idx ? 'You are here' : l.xp + ' XP';
      return '<li><button class="node ' + cls + '" data-level="' + i + '" aria-label="' + l.id + ', ' + l.name + (cls === 'locked' ? ', locked, unlocks at ' + l.xp + ' XP' : '') + '">' +
        '<span class="node-dot">' + dot + '</span><span class="node-name">' + l.name + '</span><span class="node-sub">' + sub + '</span></button></li>';
    }).join('');
    $('#track-note').innerHTML = '<strong>' + lv.id + ' · ' + esc(lv.title) + '</strong>' + esc(lv.desc);

    const gameCategories = [
      {id:'words',title:'Words',desc:'Build your vocabulary and recognise words.',icon:'Aa',tone:'violet',games:[['vocabulary','Word collector'],['spelling','Word detective']]},
      {id:'grammar',title:'Grammar',desc:'Make sentences clearer and more accurate.',icon:'S+V',tone:'coral',games:[['grammar','Sentence shaper'],['mistakes','Common mistakes'],['spot','Spot the mistake'],['typing','Type It']]},
      {id:'reading',title:'Reading & Listening',desc:'Understand stories, messages and meaning.',icon:'◖',tone:'sky',games:[['story','Lost in London'],['listening','Meaning detective']]},
      {id:'challenge',title:'Challenge',desc:'Train your ear for nuance and precise meaning.',icon:'✦',tone:'ink',games:[['advanced','Nuance navigator']]}
    ];
    window.__gameCategories = gameCategories;
    $('#games').innerHTML = gameCategories.map(cat =>
      '<button class="category-card t-' + cat.tone + '" type="button" data-category="' + cat.id + '" aria-haspopup="dialog">' +
        '<span class="category-icon">' + cat.icon + '</span><span class="category-copy"><strong>' + cat.title + '</strong><small>' + cat.desc + '</small><em>' + cat.games.length + (cat.games.length===1?' activity':' activities') + '</em></span><span class="category-arrow" aria-hidden="true">→</span></button>'
    ).join('');
  }

  /* ---------- rendering: words + trophies ---------- */
  let speechRequest = 0;
  function speak(text) {
    const synth = window.speechSynthesis;
    if (!synth || !('SpeechSynthesisUtterance' in window)) {
      toast('Speech playback is not supported in this browser.');
      return;
    }
    const phrase = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
    if (!phrase) { toast('There is no word to pronounce.'); return; }

    // Some browsers interrupt a new utterance if cancel() and speak() happen
    // in the same tick. Defer speaking and prefer an available English voice.
    const request = ++speechRequest;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    const voices = synth.getVoices ? synth.getVoices() : [];
    const englishVoice = voices.find(v => /^en-US$/i.test(v.lang))
      || voices.find(v => /^en-GB$/i.test(v.lang))
      || voices.find(v => /^en(?:-|$)/i.test(v.lang));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.onerror = event => {
      if (request === speechRequest && event.error !== 'canceled' && event.error !== 'interrupted') {
        toast('Could not play this pronunciation. Check your browser sound settings and try again.');
      }
    };
    window.setTimeout(() => {
      if (request !== speechRequest) return;
      try {
        if (synth.paused) synth.resume();
        synth.speak(utterance);
      } catch {
        toast('Could not play this pronunciation. Try again.');
      }
    }, 80);
  }
  function wordParts(raw, fallback) {
    if (Array.isArray(raw)) return {word:String(raw[0]||''),meaning:String(raw[1]||fallback||'Review this word in context.'),level:String(raw[2]||currentLevel().id)};
    if (typeof raw==='string'&&raw.trim()) return {word:raw.trim(),meaning:String(fallback||'Review this word in context.'),level:currentLevel().id};
    return null;
  }
  function addReview(raw,fallback) {
    const p=wordParts(raw,fallback); if(!p)return;
    const old=state.review.find(x=>x.word.toLowerCase()===p.word.toLowerCase());
    if(old){old.due=dayKey();old.interval=0;old.streak=0;old.meaning=p.meaning||old.meaning;}
    else state.review.push({...p,due:dayKey(),interval:0,streak:0,attempts:0});
  }
  function renderReview() {
    const due=state.review.filter(w=>!w.due||w.due<=dayKey());
    if(!due.length)return '<section class="review-panel"><div class="review-head"><div><p class="kicker">SPACED REPETITION</p><h2>Daily word review</h2></div><span class="review-count">✓</span></div><p class="review-note">You’re all caught up. Words you miss will appear here for short daily practice.</p></section>';
    const w=due[0];
    return '<section class="review-panel"><div class="review-head"><div><p class="kicker">SPACED REPETITION</p><h2>Daily word review</h2></div><span class="review-count">'+due.length+' due</span></div><p class="review-note">Try to recall the meaning before revealing it. A short session is enough.</p><article class="review-card"><div class="review-word"><b>'+esc(w.word)+'</b><button class="listen-btn" data-speak="'+esc(w.word)+'" aria-label="Listen to '+esc(w.word)+'">'+ic('sound')+' Listen</button></div><p id="review-meaning" hidden>'+esc(w.meaning)+'</p><button class="btn btn-ghost" id="reveal-review">Reveal meaning</button><div class="review-actions" id="review-actions" hidden><button class="btn btn-ghost" data-review="again" data-word="'+esc(w.word)+'">Need practice</button><button class="btn" data-review="known" data-word="'+esc(w.word)+'">I knew it</button></div></article></section>';
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
    box.innerHTML='<div class="wotd-top"><span class="kicker">EPIPHANY OF THE DAY</span><span class="pill">'+esc(w.level)+'</span></div><h2 id="wotd-title" class="wotd-word">'+esc(w.word)+'</h2><p class="wotd-pronunciation">'+esc(w.pronunciation||'')+'</p><div class="wotd-meanings"><p><strong>Meaning:</strong> '+esc(w.meaning)+'</p><p class="arabic" lang="ar" dir="rtl"><strong>المعنى:</strong> '+esc(w.meaning_ar)+'</p></div><p class="wotd-example">“'+esc(w.example)+'”</p><p class="wotd-origin">'+esc(w.origin)+'</p><div class="wotd-actions">'+(speech?'<button type="button" class="btn btn-ghost" data-speak="'+esc(w.word)+'">🔊 Listen</button>':'')+'<button type="button" class="btn" id="wotd-save" '+(saved?'disabled':'')+'>'+(saved?'Saved to Words':'Save word')+'</button></div>';
    box.dataset.word=w.word;
  }
  function renderWords() {
    renderWotd();
    const n=state.words.length, due=state.review.filter(w=>!w.due||w.due<=dayKey()).length;
    $('#words-count').textContent=n+(n===1?' word':' words')+' · '+due+' to review';
    const vault=!n?'<div class="empty"><div class="empty-ic">'+ic('book')+'</div><h2>Your vault is empty, for now.</h2><p>Answer vocabulary questions correctly to collect useful words.</p><button class="btn" data-game="vocabulary">'+ic('play')+'Find your first word</button></div>':
      '<div class="vault">'+state.words.slice().reverse().map(w=>'<article class="word"><div class="word-title"><b>'+esc(w[0])+'</b><button class="listen-btn" data-speak="'+esc(w[0])+'" aria-label="Listen to '+esc(w[0])+'">'+ic('sound')+' Listen</button></div><span>'+esc(w[1])+'</span><em>'+esc(w[2]||'A1')+'</em></article>').join('')+'</div>';
    $('#words-body').innerHTML=renderReview()+'<h2 class="vault-heading">Your collected words</h2>'+vault;
    const reveal=$('#reveal-review'); if(reveal)reveal.addEventListener('click',()=>{$('#review-meaning').hidden=false;$('#review-actions').hidden=false;reveal.hidden=true;});
  }

  function renderTrophies() {
    const idx = levelIndex();
    const all = [
      ['spark', 'First Spark',     'Complete your first quest.', Math.min(state.quests, 1), 1],
      ['book',  'Word Gatherer',   'Discover 5 useful words.',   Math.min(state.words.length, 5), 5],
      ['bolt',  'Momentum',        'Complete 5 quests.',         Math.min(state.quests, 5), 5],
      ['flame', 'Habit Builder',   'Return for 3 days in a row.', Math.min(state.streak || 0, 3), 3],
      ['globe', 'World Traveler',  'Reach B1.',                  Math.min(idx, 2), 2],
      ['crown', 'Mastermind',      'Reach C1.',                  Math.min(idx, 4), 4],
      ['search', 'Mistake Hunter', 'Complete 10 Common Mistakes quests.', Math.min((state.modes.mistakes||0)+(state.modes.spot||0),10),10],
      ['pencil', 'Wordsmith', 'Complete 10 Type It quests.', Math.min(state.modes.typing||0,10),10]
    ];
    const got = all.filter(a => a[3] >= a[4]).length;
    $('#trophies-count').textContent = got + ' of ' + all.length + ' unlocked';
    $('#trophies').innerHTML = all.map(a => {
      const on = a[3] >= a[4];
      return '<article class="trophy' + (on ? ' on' : '') + '"><div class="trophy-ic">' + ic(a[0]) + '</div><div style="flex:1;min-width:0"><h3>' + a[1] + '</h3><p>' + a[2] + '</p>' +
        '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + a[4] + '" aria-valuenow="' + a[3] + '" aria-label="' + a[1] + ' progress"><i style="width:' + Math.round(a[3] / a[4] * 100) + '%"></i></div></div></article>';
    }).join('');
  }

  function renderAll() { renderHeader(); renderHome(); renderStories(); renderWords(); renderTrophies(); syncSettings(); }


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
  const storyLevelIndex=level=>LEVELS.findIndex(l=>l.id===level);
  const storyIsSaved=word=>state.words.some(w=>String(w[0]).toLowerCase()===String(word).toLowerCase());
  function renderStories(){
    const root=$('#stories-content');if(!root||typeof STORIES==='undefined')return;
    const unlocked=storyLevelIndex(currentLevel().id),ordered=STORIES.slice().sort((a,b)=>storyLevelIndex(a.level)-storyLevelIndex(b.level)||a.title.localeCompare(b.title));
    const featured=ordered.find(s=>storyLevelIndex(s.level)<=unlocked&&!(state.stories[s.id]&&state.stories[s.id].done))||ordered.find(s=>storyLevelIndex(s.level)<=unlocked)||ordered[0];
    const card=(s,large)=>{const locked=storyLevelIndex(s.level)>unlocked,done=!!(state.stories[s.id]&&state.stories[s.id].done);return '<button type="button" class="story-card '+(large?'story-featured ':'')+(locked?'is-locked ':'')+(done?'is-done':'')+'" data-story-open="'+esc(s.id)+'" '+(locked?'aria-disabled="true"':'')+'><span class="story-art" style="--story-tone:'+esc(s.tone)+'"><span>'+esc(s.emoji)+'</span>'+(locked?'<b>🔒</b>':'')+'</span><span class="story-card-info"><span class="story-card-meta"><em>'+esc(s.level)+'</em><small>'+s.minutes+' min</small></span><strong>'+esc(s.title)+'</strong><small>'+(locked?'Unlock at '+esc(s.level):done?'✓ Completed · '+state.stories[s.id].score+'/3':'Read this story')+'</small></span></button>';};
    root.innerHTML='<section class="story-feature-section"><div class="block-head"><h2>Recommended story</h2><p>One small story, a little more English.</p></div>'+card(featured,true)+'</section>'+['A1','A2','B1','B2'].map(level=>'<section class="story-level"><div class="block-head"><h2>'+level+' stories</h2><p>'+(storyLevelIndex(level)<=unlocked?'Ready to read':'Reach '+level+' to unlock these stories')+'</p></div><div class="story-grid">'+ordered.filter(s=>s.level===level&&s.id!==featured.id).map(s=>card(s,false)).join('')+'</div></section>').join('');
  }
  function startStory(id){const story=STORIES.find(s=>s.id===id);if(!story)return;if(storyLevelIndex(story.level)>storyLevelIndex(currentLevel().id)){toast('Reach '+story.level+' to unlock this story.');return;}ST={story,page:0,mode:'read',qi:0,score:0,results:[],savedDuring:[],answered:false};G=null;$('#game').className='game t-story';$('#game').hidden=false;lockPage(true);hideSheet();renderStoryPage();}
  function storyTextTokens(text){return (String(text||'').match(/[\p{L}]+(?:['’][\p{L}]+)*|[^\p{L}]+/gu)||[]).map(part=>{if(!/^[\p{L}]+(?:['’][\p{L}]+)*$/u.test(part))return esc(part);const bare=part.toLowerCase().normalize('NFD').replace(/[\p{Diacritic}]/gu,'');const known=storyLookup(bare);return '<button type="button" class="story-word '+(known?'is-vocab ':'')+(storyIsSaved(bare)?'is-saved':'')+'" data-story-word="'+esc(bare)+'" data-story-display="'+esc(part)+'" aria-label="Learn the word '+esc(bare)+'">'+esc(part)+'</button>';}).join('');}
  function storyLookup(key){const all=(typeof STORIES!=='undefined'?STORIES:[]);for(const story of all){const found=Object.entries(story.vocab||{}).find(([k])=>k.toLowerCase()===key);if(found)return {meaning:found[1][0],ar:found[1][1],pronunciation:found[1][2],example:found[1][3]};}const global=(typeof WOTD_WORDS!=='undefined'?WOTD_WORDS:[]).find(w=>w.word.toLowerCase()===key);if(global)return {meaning:global.meaning,ar:global.meaning_ar,pronunciation:global.pronunciation,example:global.example};const saved=state.words.find(w=>String(w[0]).toLowerCase()===key);if(saved)return {meaning:saved[1],ar:'معنى محفوظ سابقًا',pronunciation:key,example:''};const fallback=STORY_WORDS[key]||STORY_WORDS[storyWordBase(key)]||null;if(fallback){return {meaning:fallback,ar:STORY_WORDS_AR[key]||STORY_WORDS_AR[storyWordBase(key)]||'المعنى بالعربية غير متوفر بعد',pronunciation:key,example:''};}return null;}
  function storyWordBase(word){if(STORY_WORDS[word])return word;let w=word;if(w.endsWith('ies')&&w.length>4)w=w.slice(0,-3)+'y';else if(w.endsWith('es')&&w.length>4)w=w.slice(0,-2);else if(w.endsWith('s')&&w.length>3)w=w.slice(0,-1);if(STORY_WORDS[w])return w;const candidates=[word.slice(0,-1),word.slice(0,-2),word.replace(/ies$/,'y'),word.replace(/ied$/,'y'),word.replace(/ed$/,''),word.replace(/ing$/,'')];for(const candidate of candidates){if(candidate!==word&&STORY_WORDS[candidate])return candidate;}return word;}
  const STORY_WORDS_AR={sam:'سام',his:'له / خاصته',sister:'أخت',picnic:'نزهة',they:'هم',take:'يأخذ',apples:'تفاح',apple:'تفاحة',bread:'خبز',juice:'عصير',park:'حديقة عامة',sit:'يجلس',tree:'شجرة',dark:'داكن',cloud:'سحابة',clouds:'غيوم',cover:'يغطي',sky:'سماء',cold:'بارد',rain:'مطر',begins:'يبدأ',begin:'يبدأ',fall:'يسقط / يهطل',puts:'يضع',put:'يضع',food:'طعام',bag:'حقيبة',run:'يركض',small:'صغير',cafe:'مقهى',near:'قريب من',warm:'دافئ',dry:'جاف',share:'يتقاسم',laugh:'يضحك',about:'عن / بشأن',and:'و',to:'إلى',the:'الـ',a:'أداة تنكير',an:'أداة تنكير',in:'في',under:'تحت',at:'في / عند',is:'يكون',are:'يكونون',was:'كان',were:'كانوا',not:'ليس / لا',her:'لها / ـها',he:'هو',she:'هي',it:'هو / هي لغير العاقل',we:'نحن',you:'أنت / أنتم',his:'له / ـه',my:'لي / ـي',your:'لك / ـك',their:'لهم / ـهم',our:'لنا / ـنا',this:'هذا / هذه',that:'ذلك / تلك',with:'مع',from:'من',for:'من أجل',on:'على',of:'من / لـ',but:'لكن',so:'لذلك',when:'عندما',because:'لأن',then:'ثم',now:'الآن',here:'هنا',there:'هناك',can:'يستطيع',cannot:'لا يستطيع',look:'ينظر',looks:'ينظر',see:'يرى',sees:'يرى',find:'يعثر على',found:'عثر على',go:'يذهب',went:'ذهب',come:'يأتي',came:'أتى',say:'يقول',says:'يقول',said:'قال',make:'يصنع / يجعل',made:'صنع / جعل',get:'يحصل على',got:'حصل على',give:'يعطي',gave:'أعطى',help:'يساعد',helped:'ساعد',follow:'يتبع',followed:'تبع',open:'يفتح',opens:'يفتح',close:'يغلق',closed:'أغلق',start:'يبدأ',started:'بدأ',stop:'يتوقف',stopped:'توقف',wait:'ينتظر',waited:'انتظر',leave:'يغادر',left:'غادر',arrive:'يصل',arrived:'وصل',reach:'يصل إلى',reached:'وصل إلى',think:'يفكر',thought:'فكر',know:'يعرف',knew:'عرف',feel:'يشعر',felt:'شعر',want:'يريد',need:'يحتاج',try:'يحاول',tried:'حاول',remember:'يتذكر',remembered:'تذكر',ask:'يسأل',asked:'سأل',tell:'يخبر',told:'أخبر',speak:'يتحدث',spoke:'تحدث',talk:'يتكلم',walk:'يمشي',run:'يركض',ran:'ركض',sit:'يجلس',sat:'جلس',stand:'يقف',stood:'وقف',looked:'نظر',saw:'رأى',went:'ذهب',came:'أتى',took:'أخذ',put:'يضع',warm:'دافئ',cold:'بارد',good:'جيد',bad:'سيئ',new:'جديد',old:'قديم',little:'صغير / قليل',big:'كبير',long:'طويل',short:'قصير',first:'الأول',last:'الأخير',next:'التالي',same:'نفس / ذاته',another:'آخر',every:'كل',some:'بعض',all:'كل',more:'أكثر',only:'فقط',very:'جداً',too:'أيضاً / أكثر من اللازم',again:'مرة أخرى',before:'قبل',after:'بعد',during:'أثناء',already:'بالفعل',just:'فقط / للتو',soon:'قريباً',finally:'أخيراً',together:'معاً',quickly:'بسرعة',slowly:'ببطء',quietly:'بهدوء',happily:'بسعادة',sad:'حزين',happy:'سعيد',afraid:'خائف',tired:'متعب',easy:'سهل',difficult:'صعب',important:'مهم',different:'مختلف',beautiful:'جميل',strange:'غريب',idea:'فكرة',problem:'مشكلة',question:'سؤال',answer:'إجابة',story:'قصة',word:'كلمة',person:'شخص',people:'ناس / أشخاص',friend:'صديق',family:'عائلة',home:'منزل',house:'بيت',room:'غرفة',school:'مدرسة',teacher:'معلم',book:'كتاب',time:'وقت',day:'يوم',night:'ليل',morning:'صباح',today:'اليوم',tomorrow:'غداً',yesterday:'أمس',place:'مكان',road:'طريق',street:'شارع',city:'مدينة',town:'بلدة',door:'باب',window:'نافذة',chair:'كرسي',table:'طاولة',water:'ماء',drink:'مشروب / يشرب',coffee:'قهوة',tea:'شاي',milk:'حليب',fruit:'فاكهة',orange:'برتقالة',banana:'موزة',rainy:'ممطر',sun:'شمس',sunny:'مشمس',weather:'طقس',cloudy:'غائم',sky:'سماء',flower:'زهرة',garden:'حديقة',dog:'كلب',cat:'قط',train:'قطار',bus:'حافلة',station:'محطة',ticket:'تذكرة',taxi:'سيارة أجرة',bike:'دراجة',bag:'حقيبة',coat:'معطف',key:'مفتاح',money:'مال',work:'عمل',job:'وظيفة',team:'فريق',meeting:'اجتماع',manager:'مدير',lab:'مختبر',science:'علوم',test:'اختبار',result:'نتيجة',change:'تغيير',learn:'يتعلم',learned:'تعلم',listen:'يستمع',heard:'سمع',hear:'يسمع',write:'يكتب',read:'يقرأ',reading:'قراءة',writing:'كتابة',think:'يفكر',thought:'فكر',because:'لأن',although:'على الرغم من',however:'مع ذلك',yet:'ومع ذلك / حتى الآن',whether:'ما إذا',within:'داخل / خلال',toward:'باتجاه',through:'عبر / من خلال',around:'حول',behind:'خلف',beside:'بجانب',between:'بين',across:'عبر',over:'فوق',up:'إلى الأعلى',down:'إلى الأسفل',out:'إلى الخارج',into:'إلى الداخل',back:'إلى الخلف',away:'بعيداً',someone:'شخص ما',everyone:'الجميع',nothing:'لا شيء',something:'شيء ما',anything:'أي شيء',everything:'كل شيء',who:'من',what:'ماذا / ما',where:'أين',when:'متى / عندما',why:'لماذا',how:'كيف',which:'أيّ',whose:'لمن',please:'من فضلك',thank:'يشكر',thanks:'شكراً',sorry:'آسف',yes:'نعم',no:'لا',maybe:'ربما',perhaps:'ربما',really:'حقاً',actually:'في الواقع',almost:'تقريباً',enough:'كافٍ',less:'أقل',least:'الأقل',best:'الأفضل',better:'أفضل',worse:'أسوأ',wrong:'خاطئ',right:'صحيح / يمين',true:'صحيح',false:'خاطئ',possible:'ممكن',able:'قادر',cannot:'لا يستطيع',must:'يجب',should:'ينبغي',would:'سوف / كان سي',could:'استطاع / يمكنه',will:'سوف',might:'قد',may:'قد',did:'فعل / أداة للماضي',does:'يفعل',do:'يفعل',done:'منجز / فعل',has:'لديه',have:'لديه',had:'كان لديه',be:'يكون',been:'كان',being:'كونه / يجري',am:'أكون',were:'كانوا',are:'يكونون',was:'كان',is:'يكون',are:'يكونون',and:'و',or:'أو',but:'لكن',if:'إذا',as:'كما / بصفته',than:'من (للمقارنة)',while:'بينما',until:'حتى',since:'منذ / بما أن',for:'لـ / من أجل',from:'من',of:'من / لـ',by:'بواسطة / بجانب',at:'في / عند',in:'في',on:'على',to:'إلى',with:'مع',without:'بدون',about:'عن',against:'ضد',among:'بين',per:'لكل',each:'كل واحد',both:'كلاهما',few:'قليل',several:'عدة',many:'كثير',much:'كثير',most:'معظم',other:'آخر',others:'آخرون',such:'مثل هذا',own:'خاص',same:'نفس',different:'مختلف',another:'آخر',either:'أيّ منهما',neither:'لا هذا ولا ذاك',nor:'ولا',also:'أيضاً',especially:'خصوصاً',instead:'بدلاً من ذلك',rather:'بدلاً من / نوعاً ما',otherwise:'وإلا',therefore:'لذلك',thus:'وبالتالي',still:'ما زال',once:'مرة واحدة',twice:'مرتين',often:'غالباً',sometimes:'أحياناً',always:'دائماً',never:'أبداً',usually:'عادةً',rarely:'نادراً',recently:'مؤخراً',gradually:'تدريجياً',suddenly:'فجأة',immediately:'فوراً',carefully:'بحذر',easily:'بسهولة',slowly:'ببطء',quickly:'بسرعة',clearly:'بوضوح',probably:'على الأرجح',certainly:'بالتأكيد',exactly:'بالضبط',especially:'خصوصاً',generally:'عموماً',simply:'ببساطة',completely:'تماماً',partly:'جزئياً',nearly:'تقريباً',enjoy:'يستمتع',enjoyed:'استمتع',share:'يتقاسم',shared:'تقاسم',laugh:'يضحك',laughed:'ضحك',smile:'يبتسم',smiled:'ابتسم',cry:'يبكي',cried:'بكى',jump:'يقفز',jumped:'قفز',pick:'يلتقط / يختار',picked:'التقط',carry:'يحمل',carried:'حمل',bring:'يجلب',brought:'أحضر',buy:'يشتري',bought:'اشترى',pay:'يدفع',paid:'دفع',eat:'يأكل',ate:'أكل',drink:'يشرب',drank:'شرب',sleep:'ينام',slept:'نام',wake:'يستيقظ',woke:'استيقظ',begin:'يبدأ',began:'بدأ',begun:'بدأ',fall:'يسقط',fell:'سقط',fallen:'سقط',grow:'ينمو',grew:'نما',grown:'نما',build:'يبني',built:'بنى',break:'يكسر',broke:'كسر',broken:'مكسور',choose:'يختار',chose:'اختار',chosen:'مختار',change:'يغير',changed:'غيّر',move:'يتحرك',moved:'تحرك',turn:'يدور / ينعطف',turned:'دار / انعطف',follow:'يتبع',followed:'تبع',decide:'يقرر',decided:'قرر',plan:'يخطط',planned:'خطط',prepare:'يحضّر',prepared:'حضّر',finish:'ينهي',finished:'أنهى',complete:'يكمل',completed:'أكمل',continue:'يواصل',continued:'واصل',return:'يعود',returned:'عاد',arrive:'يصل',arrived:'وصل',travel:'يسافر',travelled:'سافر',visit:'يزور',visited:'زار',happen:'يحدث',happened:'حدث',seem:'يبدو',seemed:'بدا',appear:'يظهر',appeared:'ظهر',become:'يصبح',became:'أصبح',stay:'يبقى',stayed:'بقي',keep:'يحتفظ / يستمر',kept:'احتفظ / استمر',hold:'يمسك',held:'أمسك',catch:'يمسك / يلحق',caught:'أمسك',throw:'يرمي',threw:'رمى',hit:'يضرب',hurt:'يؤلم / يؤذي',win:'يفوز',won:'فاز',lose:'يخسر',lost:'خسر / ضائع',meet:'يقابل',met:'قابل',agree:'يوافق',agreed:'وافق',believe:'يعتقد',believed:'اعتقد',hope:'يأمل',hoped:'أمل',promise:'يعد',promised:'وعد',explain:'يشرح',explained:'شرح',describe:'يصف',described:'وصف',suggest:'يقترح',suggested:'اقترح',offer:'يعرض',offered:'عرض',refuse:'يرفض',refused:'رفض',accept:'يقبل',accepted:'قبل',allow:'يسمح',allowed:'سمح',require:'يتطلب',required:'تطلب',provide:'يوفر',provided:'وفّر',support:'يدعم',supported:'دعم',improve:'يحسّن',improved:'حسّن',create:'ينشئ',created:'أنشأ',develop:'يطوّر',developed:'طوّر',build:'يبني',built:'بنى',check:'يفحص',checked:'فحص',test:'يختبر',tested:'اختبر',measure:'يقيس',measured:'قاس',record:'يسجل',recorded:'سجل',notice:'يلاحظ',noticed:'لاحظ',realize:'يدرك',realized:'أدرك',discover:'يكتشف',discovered:'اكتشف',solve:'يحل',solved:'حل',fix:'يصلح',fixed:'أصلح',repair:'يصلح',repaired:'أصلح',replace:'يستبدل',replaced:'استبدل',remove:'يزيل',removed:'أزال',add:'يضيف',added:'أضاف',save:'يحفظ',saved:'حفظ',send:'يرسل',sent:'أرسل',receive:'يستلم',received:'استلم',return:'يعيد / يعود',returned:'عاد',borrow:'يستعير',borrowed:'استعار',lend:'يعير',lent:'أعار',teach:'يدرّس',taught:'درّس',study:'يدرس',studied:'درس',practice:'يتدرّب',practised:'تدرّب',train:'يدرّب / قطار',trained:'تدرّب',learn:'يتعلم',learned:'تعلم',understand:'يفهم',understood:'فهم',remember:'يتذكر',remembered:'تذكر',forget:'ينسى',forgot:'نسي',forgive:'يسامح',forgave:'سامح',thank:'يشكر',thanked:'شكر',praise:'يمدح',praised:'مدح',blame:'يلوم',blamed:'لام',deny:'ينكر',denied:'أنكر',admit:'يعترف',admitted:'اعترف',apologize:'يعتذر',apologized:'اعتذر',discuss:'يناقش',discussed:'ناقش',argue:'يجادل',argued:'جادل',communicate:'يتواصل',communicated:'تواصل',connect:'يربط',connected:'ربط',invite:'يدعو',invited:'دعا',join:'ينضم',joined:'انضم',lead:'يقود',led:'قاد',manage:'يدير',managed:'أدار',work:'يعمل',worked:'عمل',play:'يلعب',played:'لعب',live:'يعيش',lived:'عاش',die:'يموت',died:'مات',wait:'ينتظر',waited:'انتظر',watch:'يشاهد',watched:'شاهد',listen:'يستمع',listened:'استمع',hear:'يسمع',heard:'سمع',sound:'صوت / يبدو',sounded:'بدا / أصدر صوتاً',voice:'صوت',speech:'خطاب',contest:'مسابقة',chance:'فرصة',ability:'قدرة',experience:'تجربة / خبرة',decision:'قرار',mistake:'خطأ',feedback:'ملاحظات',comment:'تعليق',comments:'تعليقات',conversation:'محادثة',conversations:'محادثات',concern:'قلق / شأن',approval:'موافقة',choice:'اختيار',choices:'خيارات',rule:'قاعدة',rules:'قواعد',process:'عملية',result:'نتيجة',measurement:'قياس',measurements:'قياسات',instrument:'أداة / جهاز',equipment:'معدات',sensor:'مستشعر',reading:'قراءة',readings:'قراءات',science:'علم',scientific:'علمي',lab:'مختبر',school:'مدرسة',manager:'مدير',team:'فريق',meeting:'اجتماع',meetings:'اجتماعات',idea:'فكرة',ideas:'أفكار',suggestion:'اقتراح',suggestions:'اقتراحات',problem:'مشكلة',solution:'حل',success:'نجاح',failure:'فشل',performance:'أداء',routine:'روتين',event:'حدث',public:'عام',private:'خاص',anonymous:'مجهول الهوية',anonymously:'بشكل مجهول',approach:'يقترب / نهج',approached:'اقترب',affect:'يؤثر',affecting:'مؤثّر / يؤثر في',afterward:'بعد ذلك',blunt:'صريح بحدة',box:'صندوق',busiest:'الأكثر ازدحاماً',calm:'هادئ',calmer:'أكثر هدوءاً',catch:'يمسك / يلحق',closed:'مغلق',coach:'مدرب',corner:'زاوية',counter:'منضدة / عدّاد',defensive:'دفاعي',define:'يعرّف',disaster:'كارثة',earlier:'في وقت سابق',floor:'أرضية / طابق',flourish:'يزدهر',front:'أمام',gradually:'تدريجياً',hidden:'مخفي',holding:'يمسك',imposing:'مهيب / يفرض',instrument:'جهاز / أداة',invited:'دعا',jumped:'قفز',listened:'استمع',listeners:'مستمعون',looking:'ينظر',measurements:'قياسات',mistake:'خطأ',nevertheless:'مع ذلك',notes:'ملاحظات',noticed:'لاحظ',onto:'إلى أعلى / على',pause:'توقف مؤقت',performance:'أداء',pointed:'أشار',preparing:'يحضّر',process:'عملية',pulled:'سحب',rather:'بدلاً من / نوعاً ما',recording:'تسجيل',replacing:'استبدال',reviewed:'راجع',river:'نهر',road:'طريق',rug:'سجادة',sealed:'مختوم',seconds:'ثوانٍ',seeing:'رؤية',seen:'شوهد / رأى',several:'عدة',six:'ستة',speech:'خطاب',spent:'قضى / أنفق',stable:'مستقر',sugar:'سكر',teacher:'معلم',testing:'اختبار / يجري اختباراً',things:'أشياء',through:'عبر',tired:'متعب',toy:'لعبة',track:'مسار / يتتبع',treating:'يعامل / يعالج',turned:'استدار / أصبح',useful:'مفيد',whether:'ما إذا',within:'داخل / خلال',window:'نافذة',woke:'استيقظ',wrong:'خاطئ',yet:'ومع ذلك / حتى الآن',aminA:'أمينة',daniel:'دانيال',leo:'ليو',mia:'ميا',nora:'نورا',rafi:'رافي'};
  function renderStoryPage(){const s=ST.story,p=s.pages[ST.page];$('#steps').innerHTML=s.pages.map((_,i)=>'<span class="step '+(i<ST.page?'ok':i===ST.page?'current':'')+'"></span>').join('');$('#game-body').innerHTML='<div class="story-reader"><div class="q-meta"><span class="pill">'+esc(s.level)+' · Story</span><span class="q-count">Page '+(ST.page+1)+' of '+s.pages.length+'</span></div><div class="story-progress-dots">'+s.pages.map((_,i)=>'<span class="'+(i<=ST.page?'active':'')+'"></span>').join('')+'</div><div class="story-scene" style="--story-tone:'+esc(s.tone)+'" aria-hidden="true">'+esc(p.scene)+'</div><h2 class="story-reader-title">'+esc(s.title)+'</h2><div class="story-text">'+storyTextTokens(p.text)+'</div>'+(state.helpArabic?'<p class="story-page-ar arabic" lang="ar" dir="rtl">'+esc(p.ar)+'</p>':'')+'<div class="story-reader-actions"><button class="btn btn-ghost" data-story-action="listen-page">🔊 Listen to page</button><button class="btn btn-ghost" data-story-action="prev" '+(ST.page===0?'disabled':'')+'>← Previous</button><button class="btn" data-story-action="next">'+(ST.page===s.pages.length-1?'Questions':'Next →')+'</button></div><p class="story-help-note">Tap a word to learn it. Dotted underlines mark useful vocabulary.</p><div class="story-word-card" id="story-word-card" hidden aria-live="polite"></div></div>';$('#game-scroll').scrollTop=0;}
  function openStoryWord(raw,display){const key=String(raw||'').toLowerCase(),entry=storyLookup(key);const meaning=entry?entry.meaning:'No explanation has been added for this word yet.',arabic=entry?entry.ar:'لم نضف شرحاً لهذه الكلمة بعد',pron=entry?entry.pronunciation:key,example=entry?entry.example:'';const card=$('#story-word-card');if(!card)return;card.hidden=false;card.innerHTML='<button class="story-card-close" data-story-action="close-word" aria-label="Close word card">×</button><p class="kicker">WORD IN CONTEXT</p><h3>'+esc(display||key)+'</h3><p class="story-pronunciation">'+esc(pron||key)+'</p><p>'+esc(meaning)+'</p><p class="arabic story-word-ar" lang="ar" dir="rtl">'+esc(arabic)+'</p>'+(example?'<p class="story-example">“'+esc(example)+'”</p>':'')+'<div class="story-word-actions"><button class="btn btn-ghost" data-story-action="listen-word" data-value="'+esc(key)+'">🔊 Listen</button><button class="btn" data-story-action="save-word" data-value="'+esc(key)+'" data-meaning="'+esc(meaning)+'" '+(storyIsSaved(key)?'disabled':'')+'>'+(storyIsSaved(key)?'✓ Saved':'Save word')+'</button></div>';}
  function saveStoryWord(word,meaning){const key=word.toLowerCase();if(storyIsSaved(key))return;state.words.push([word,meaning||'No explanation has been added for this word yet.',ST.story.level]);if(!ST.savedDuring.some(w=>w.toLowerCase()===key))ST.savedDuring.push(word);save();renderWords();renderHeader();toast('Word saved to Words.');}
  function storyNext(){if(ST.page<ST.story.pages.length-1){ST.page++;renderStoryPage();return;}ST.mode='quiz';ST.qi=0;ST.score=0;ST.results=[];ST.answered=false;renderStoryQuestion();}
  function renderStoryQuestion(){const q=ST.story.questions[ST.qi];$('#steps').innerHTML=ST.story.questions.map((_,i)=>'<span class="step '+(i<ST.qi?'ok':i===ST.qi?'current':'')+'"></span>').join('');$('#game-body').innerHTML='<div class="q-meta"><span class="pill">Story questions</span><span class="q-count">Question '+(ST.qi+1)+' of 3</span></div><h2 class="q-text" id="story-q-title">'+esc(q.q)+'</h2><p class="q-sub">Choose the best answer.</p><div class="answers" id="story-answers" role="group" aria-labelledby="story-q-title">'+q.answers.map((v,i)=>'<button class="answer" data-story-answer="'+i+'"><span class="key">'+(i+1)+'</span><span>'+esc(v)+'</span></button>').join('')+'</div><button class="btn btn-ghost story-back-reading" data-story-action="back-reading">← Back to story</button>';$('#game-scroll').scrollTop=0;}
  function answerStoryQuestion(choice){if(!ST||ST.mode!=='quiz'||ST.answered)return;const q=ST.story.questions[ST.qi],ok=choice===q.correct;ST.answered=true;if(ok)ST.score++;ST.results[ST.qi]=ok?'ok':'no';$$('#story-answers .answer').forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===choice)b.classList.add('wrong');});showSheet(ok,'<h3><span class="sheet-mark">'+ic(ok?'check':'x')+'</span>'+(ok?'Exactly right!':'Good try — keep learning.')+'</h3>'+(ok?'':'<p>Correct answer: <b>'+esc(q.answers[q.correct])+'</b></p>')+'<p>'+esc(q.explain)+'</p><div class="sheet-actions"><button class="btn" id="go-next">'+(ST.qi===2?'See story results':'Continue')+ic('arrow')+'</button></div>');}
  function finishStory(){const s=ST.story,score=ST.score,old=state.stories[s.id]||{done:false,score:0};state.stories[s.id]={done:true,score:Math.max(Number(old.score)||0,score)};state.xp+=30;state.quests++;state.daily=Math.min(2,state.daily+1);const today=dayKey();if(state.dailyQuestDate!==today){state.dailyQuestDate=today;state.dailyQuestProgress=0;state.dailyQuestClaimed=false;state.dailyCorrect=0;state.dailyXp=0;}if(state.weeklyKey!==weekKey()){state.weeklyKey=weekKey();state.weeklyProgress=0;state.weeklyClaimed=false;}state.dailyXp+=30;state.dailyCorrect+=score;state.dailyQuestProgress=state.daily;state.weeklyProgress=(state.weeklyProgress||0)+1;const task=DAILY_QUESTS[(new Date().getDate()-1)%DAILY_QUESTS.length],progress=task.kind==='quests'?state.daily:task.kind==='xp'?state.dailyXp:state.dailyCorrect;let bonus='';if(!state.dailyQuestClaimed&&progress>=task.target){state.dailyQuestClaimed=true;state.xp+=task.reward;bonus=' Daily bonus +'+task.reward+' XP!';}if(!state.weeklyClaimed&&state.weeklyProgress>=5){state.weeklyClaimed=true;state.xp+=60;bonus+=' Weekly bonus +60 XP!';}if(state.lastDay!==today){const y=new Date();y.setDate(y.getDate()-1);const two=new Date();two.setDate(two.getDate()-2);if(state.lastDay===dayKey(y))state.streak=(state.streak||0)+1;else if(state.lastDay===dayKey(two)&&state.streakFreezes>0){state.streakFreezes--;state.streak=(state.streak||0)+1;bonus+=' Streak freeze protected your streak.';}else state.streak=1;state.lastDay=today;}if(!state.completed.includes(currentLevel().id))state.completed.push(currentLevel().id);save();renderAll();hideSheet();$('#steps').innerHTML=s.questions.map(()=>'<span class="step ok"></span>').join('');const stars=score===3?'★★★':score===2?'★★☆':score===1?'★☆☆':'☆☆☆';$('#game-body').innerHTML='<div class="result story-result"><div class="burst">📚</div><p class="kicker">STORY COMPLETE</p><h2>'+esc(s.title)+'</h2><div class="story-stars">'+stars+'</div><div class="stats3"><div class="stat"><b>+30</b><span>XP earned</span></div><div class="stat"><b>'+score+'/3</b><span>Correct answers</span></div><div class="stat"><b>'+ST.savedDuring.length+'</b><span>Words saved</span></div></div>'+(bonus?'<p class="challenge-bonus">'+esc(bonus.trim())+'</p>':'')+(ST.savedDuring.length?'<div class="found"><div class="found-title">Words you saved</div>'+ST.savedDuring.map(w=>'<span class="w">'+esc(w)+'</span>').join('')+'</div>':'')+(s.followUp?'<div class="follow-up-card"><p><b>Take the story into the village</b></p><p>Use the words you just read in a real task.</p><button class="btn" data-story-follow-up="'+esc(s.followUp.taskId)+'">'+esc(s.followUp.label||'Continue in the village')+' →</button></div>':'')+'<div class="result-actions"><button class="btn" data-story-action="another">Read another story</button><button class="btn btn-ghost" data-story-action="words">Open Words</button><button class="btn btn-ghost" data-story-action="close">Back to Stories</button></div></div>';$('#game-scroll').scrollTop=0;ST.mode='result';}

  /* ---------- navigation ---------- */
  function openView(name) {
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === name + '-view'));
    $$('[data-view]').forEach(b => b.setAttribute('aria-current', b.dataset.view === name ? 'page' : 'false'));
    window.scrollTo(0, 0);
    const h = $('#' + name + '-title'); if (h) h.focus({preventScroll: true});
  }

  /* ---------- settings: Arabic help + sound ---------- */
  function syncSettings() {
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
  document.addEventListener('submit', e => { if(e.target && e.target.id==='typing-form'){e.preventDefault();checkTyping();} });
  document.addEventListener('click', e => {
    const so=e.target.closest('[data-story-open]');if(so){startStory(so.dataset.storyOpen);return;}
    const sa=e.target.closest('[data-story-answer]');if(sa){answerStoryQuestion(Number(sa.dataset.storyAnswer));return;}
    const sw=e.target.closest('[data-story-word]');if(sw&&ST&&ST.mode==='read'){openStoryWord(sw.dataset.storyWord,sw.dataset.storyDisplay);return;}
    const act=e.target.closest('[data-story-action]');
    if(act&&ST){const action=act.dataset.storyAction;if(action==='next'){storyNext();return;}if(action==='prev'&&ST.page>0){ST.page--;renderStoryPage();return;}if(action==='listen-page'){speak(ST.story.pages[ST.page].text);return;}if(action==='listen-word'){speak(act.dataset.value);return;}if(action==='save-word'){saveStoryWord(act.dataset.value,act.dataset.meaning);openStoryWord(act.dataset.value,act.dataset.value);return;}if(action==='close-word'){const c=$('#story-word-card');if(c)c.hidden=true;return;}if(action==='back-reading'){ST.mode='read';ST.page=ST.story.pages.length-1;hideSheet();renderStoryPage();return;}if(action==='another'){const old=ST.story.id;ST=null;const next=STORIES.find(s=>s.id!==old&&storyLevelIndex(s.level)<=storyLevelIndex(currentLevel().id));startStory((next||STORIES[0]).id);return;}if(action==='words'){ST=null;closeGame();openView('words');return;}if(action==='close'){ST=null;closeGame();openView('stories');return;}}
    if(ST&&ST.mode==='quiz'&&e.target.closest('#go-next')){hideSheet();if(ST.qi<2){ST.qi++;ST.answered=false;renderStoryQuestion();}else finishStory();return;}
    if(e.target.closest('#wotd-save')){const box=$('#wotd-card'),w=WOTD_WORDS.find(x=>x.word===box.dataset.word);if(w&&!state.words.some(x=>String(x[0]).toLowerCase()===w.word.toLowerCase())){state.words.push([w.word,w.meaning,w.level]);save();renderAll();toast('Word saved to your vault.');}return;}
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
  function sfx(kind) {
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

  function startGame(type) {
    const game = GAMES[type]; if (!game) return;
    const level = currentLevel().id;
    const levelPool = game.questions.filter(q => q.level === level);
    const generalPool = game.questions.filter(q => !q.level);
    const shuffle = list => {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
      return copy;
    };
    // Use five questions from the learner's current CEFR level whenever possible.
    let selected;
    if (type === 'mistakes') {
      const levels = LEVELS.map(l=>l.id), center = levels.indexOf(level);
      let pool = game.questions.filter(q => Math.abs(levels.indexOf(q.level) - center) <= 1);
      if (pool.length < 5) pool = game.questions.slice();
      const remaining = pool.slice(), chosen = [];
      while (chosen.length < 5 && remaining.length) {
        const weights = remaining.map(q => 1 + Math.min(6, Number(state.mistakeTrapErrors[q.trap] || 0) * 2) + Math.min(3, Number(state.mistakeQuestionErrors[q.id] || 0)));
        const totalWeight = weights.reduce((sum,w)=>sum+w,0); let roll = Math.random()*totalWeight, at = 0;
        for (; at < weights.length - 1; at++) { roll -= weights[at]; if (roll < 0) break; }
        chosen.push(remaining.splice(at,1)[0]);
      }
      selected = shuffle(chosen);
    } else {
      if (levelPool.length >= 5) selected = shuffle(levelPool).slice(0, 5);
      else {
        // Not enough questions at this level (e.g. C1/C2 for newer modes): fill from the nearest levels.
        const ids = LEVELS.map(l => l.id), at = ids.indexOf(level);
        const near = game.questions.filter(q => q.level && q.level !== level)
          .sort((a, b) => Math.abs(ids.indexOf(a.level) - at) - Math.abs(ids.indexOf(b.level) - at) || Math.random() - .5);
        selected = [...shuffle(levelPool), ...shuffle(generalPool), ...near].slice(0, 5);
      }
    }
    const paired = shuffle(selected).map(q => ({q, ar: q.ar || 'راجع معنى الإجابة الصحيحة وحاول تذكّرها في سياق جديد.'}));
    G = {type, questions: paired, i:0, score:0, words:[], answered:false, results:[], originalMode:type};
    const el = $('#game'); el.className = 'game t-' + META[type].tone; el.hidden = false;
    lockPage(true);
    renderQuestion();
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
    $('#game-body').innerHTML =
      '<div class="q-meta"><span class="pill">' + (G.reviewMode ? 'Practice again' : m.label) + '</span><span class="q-count">Question ' + (G.i + 1) + ' of ' + G.questions.length + '</span></div>' +
      '<h2 class="q-text" id="q-text" tabindex="-1">' + esc(q.q) + '</h2>' + (q.word ? '<button class="listen-btn question-listen" data-speak="' + esc(wordParts(q.word, q.explain).word) + '">' + ic('sound') + ' Listen to word</button>' : '') + '<p class="q-sub">' + esc(q.sub) + '</p>' +
      '<p class="ar-only ar-guide arabic" lang="ar" dir="rtl">' + guidance[G.type] + '</p>' +
      '<div class="answers" id="answers" role="group" aria-labelledby="q-text">' +
      q.answers.map((a, i) => '<button class="answer" data-i="' + i + '"><span class="key">' + (i + 1) + '</span><span>' + esc(a) + '</span></button>').join('') + '</div>';
    $('#game-scroll').scrollTop = 0;
    $('#q-text').focus({preventScroll: true});
  }

  function selectAnswer(choice) {
    if (!G || G.answered) return;
    G.answered = true;
    const game = GAMES[G.type], item = G.questions[G.i], q = item.q, ok = choice === q.correct;
    if (ok) { G.score++; const wp=wordParts(q.word,q.explain); if(wp)G.words.push([wp.word,wp.meaning,wp.level]); }
    else if (!G.reviewMode) {
      addReview(q.word,q.explain);
      if (G.type === 'mistakes' && q.id) {
        state.mistakeTrapErrors[q.trap] = (Number(state.mistakeTrapErrors[q.trap]) || 0) + 1;
        state.mistakeQuestionErrors[q.id] = (Number(state.mistakeQuestionErrors[q.id]) || 0) + 1;
      }
      const weakKey = q.trap || (G.type === 'spot' ? 'spot-' + q.level : G.type);
      state.weakTraps[weakKey] = (Number(state.weakTraps[weakKey]) || 0) + 1;
      save();
    }
    G.results[G.i] = ok ? 'ok' : 'no';
    $$('#answers .answer').forEach((b, k) => { b.disabled = true; if (k === q.correct) b.classList.add('correct'); else if (k === choice) b.classList.add('wrong'); });
    $('#answers').classList.add('done');
    renderSteps(); sfx(ok ? 'ok' : 'no');
    const last = G.i === game.questions.length - 1;
    showSheet(ok,
      '<h3><span class="sheet-mark">' + ic(ok ? 'check' : 'x') + '</span>' + (ok ? 'Exactly right!' : 'Not quite — and that’s okay.') + '</h3>' +
      (ok ? '' : '<p>Correct answer: <b>' + esc(q.answers[q.correct]) + '</b></p>') +
      '<p>' + esc(q.explain) + '</p>' +
      (!ok && G.type === 'mistakes' ? '<section class="trap-explanation" aria-label="Why Arabic speakers make this mistake"><h4>Why do Arabic speakers make this mistake?</h4><p class="arabic" lang="ar" dir="rtl">' + esc(q.why_ar || q.ar) + '</p><p class="trap-hint arabic" lang="ar" dir="rtl">' + esc(q.arabic_hint || '') + '</p></section>' : '') +
      (!ok && q.aha ? '<aside class="aha-note"><span aria-hidden="true">💡</span><div><strong>Aha moment</strong><p>'+esc(q.aha.en)+'</p><p class="arabic ar-only" lang="ar" dir="rtl">'+esc(q.aha.ar)+'</p></div></aside>' : '') +
      (ok && q.word ? '<div class="newword"><span>New word</span><b>' + esc(q.word[0]) + '</b><span>' + esc(q.word[1]) + '</span></div>' : '') +
      '<p class="ar-only arabic" lang="ar" dir="rtl"><strong>' + (ok ? 'أحسنت!' : 'معلومة للتعلّم') + '</strong> ' + esc(item.ar) + '</p>' +
      '<div class="sheet-actions"><button class="btn" id="go-next">' + (last ? 'See results' : 'Continue') + ic('arrow') + '</button></div>');
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
    if (G.i < G.questions.length - 1) { G.i++; renderQuestion(); }
    else if (!G.reviewMode && G.questions.some((item,i)=>G.results[i]==='no')) {
      G.originalQuestions=G.questions.slice(); G.originalResults=G.results.slice(); G.originalScore=G.score; G.originalTotal=G.questions.length;
      G.questions=G.originalQuestions.filter((item,i)=>G.originalResults[i]==='no'); G.reviewMode=true; G.i=0; G.score=0; G.results=[]; G.answered=false;
      renderQuestion(); $('#game-body').insertAdjacentHTML('afterbegin','<div class="review-banner">Let’s practise the questions you missed — no extra pressure.</div>');
    } else showResults();
  }

  function showResults() {
    const game = GAMES[G.type], total = G.originalTotal || G.questions.length;
    const finalScore = G.originalScore == null ? G.score : G.originalScore;
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
    G.words.forEach(w => { if (!state.words.some(e => e[0].toLowerCase() === w[0].toLowerCase())) state.words.push([w[0], w[1], w[2] || after.id]); });
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
      '<button class="btn" id="res-next">' + ic('play') + 'Next: ' + esc(GAMES[nxt].title) + '</button>' +
      '<button class="btn btn-ghost" id="res-home">Back to home</button>' +
      '<button class="btn btn-link" id="res-again">Play this quest again</button></div></div>';
    $('#game-scroll').scrollTop = 0;
    const type = G.type;
    const shareData = {game: game.title, score: finalScore, total, xp: earned, level: after.id, streak: liveStreak()};
    $('#res-share').addEventListener('click', () => shareResult(shareData));
    $('#res-download').addEventListener('click', () => shareResult(shareData, true));
    $('#res-next').addEventListener('click', () => startGame(nxt));
    $('#res-home').addEventListener('click', closeGame);
    $('#res-again').addEventListener('click', () => startGame(type));
    $('#res-next').focus({preventScroll: true});
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
    ctx.textAlign = 'center'; ctx.fillStyle = '#6552A3'; ctx.font = '800 30px Arial'; ctx.fillText('QUEST COMPLETE', 540, 315);
    ctx.fillStyle = '#121A3A'; ctx.font = '800 58px Arial'; const words = String(data.game || 'English quest').split(' '); let lines = [], line = '';
    words.forEach(word => { const test = line ? line + ' ' + word : word; if (ctx.measureText(test).width > 820 && line) { lines.push(line); line = word; } else line = test; }); if (line) lines.push(line); lines.slice(0,2).forEach((l,i) => ctx.fillText(l, 540, 390 + i * 65));
    ctx.fillStyle = '#655F7D'; ctx.font = '600 28px Arial'; ctx.fillText('FIRST-TRY SCORE', 540, 515);
    ctx.fillStyle = '#121A3A'; ctx.font = '800 100px Arial'; ctx.fillText(data.score + ' / ' + data.total, 540, 625);
    ctx.fillStyle = '#6552A3'; ctx.font = '800 40px Arial'; ctx.fillText('+' + data.xp + ' XP', 540, 700);
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

  function closeGame() {
    $('#game').hidden = true; hideSheet(); G = null; ST = null;
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
    if(c.type==='pickup')return WORLD.carried===c.object||WORLD.picked.has(c.object);
    if(c.type==='give')return WORLD.given.has(c.item);
    return false;
  }
  function worldStep(){const t=worldTask();return t?(t.check.type==='sequence'?t.check.steps[WORLD.step]:t.check):null;}
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
    p.fromX=p.x;p.fromY=p.y;p.x=x;p.y=y;p.moveAt=performance.now();p.queuedKey=null;WORLD.tries++;WORLD.moves++;
    const here=WORLD.objects.find(o=>o.id==='blue-house'&&worldReachableFromPlayer(o));
    const red=WORLD.objects.find(o=>o.id==='red-house'&&worldReachableFromPlayer(o));
    const task=worldTask();
    if(task&&task.feedback&&here&&task.check.object==='red-house')worldFeedback('That is the blue house, not the red one. Look for the red door.');
    else if(task&&task.feedback&&red&&task.check.object==='blue-house')worldFeedback('That is the red house, not the blue one. Look for the blue door.');
    worldDraw();if(worldEval())worldComplete();
  }
  function worldInteract(){
    if(!WORLD||WORLD.mode!=='play')return;const step=worldStep();if(!step)return;
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
  function worldAward(stars,t){
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
    (t.words||[]).forEach(w=>{if(!state.words.some(v=>String(v[0]).toLowerCase()===String(w[0]).toLowerCase()))state.words.push(w);});
    save();renderHeader();renderWords();renderTrophies();return earned;
  }
  function worldShell(inner){const t=worldTask();return '<div class="world-top"><div class="world-task-count">Task <b>'+(WORLD.index+1)+'</b> / '+WORLD.tasks.length+'</div>'+(t&&t.dialogue?'<div class="world-dialogue">'+esc(t.dialogue)+'</div>':'')+'<div class="world-instruction"><strong>'+esc(t?t.instruction:'Village complete!')+'</strong></div><button class="world-exit" data-world-exit aria-label="Exit World">✕</button></div>'+inner;}
  function worldDraw(){
    if(!WORLD||WORLD.mode!=='play')return;const c=$('#world-canvas');if(!c)return;const r=c.getBoundingClientRect(),d=Math.max(1,Math.min(2,devicePixelRatio||1));if(!r.width||!r.height)return;
    if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);}
    const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,r.width,r.height);
    const tile=Math.min(r.width/20,r.height/14),ox=(r.width-tile*20)/2,oy=(r.height-tile*14)/2;WORLD.tile=tile;WORLD.ox=ox;WORLD.oy=oy;
    // Soft, cohesive top-down village art: layered terrain, curved paths and hand-drawn landmarks.
    const seeded=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
    const grass=['#8dbd78','#91c27b','#96c780','#89b975'];
    const roundRect=(ctx,rx,ry,rw,rh,rr,fill,stroke)=>{ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,rr);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}};
    const pathColor={R:'#d6bd8b',B:'#876044',W:'#4e9ea8',T:'#426f4d',H:'#d5b38a'};
    // Base grass with subtle, non-grid texture.
    x.fillStyle='#8fbe7a';x.fillRect(ox,oy,tile*20,tile*14);
    for(let gy=0;gy<14;gy++)for(let gx=0;gx<20;gx++){
      const px=ox+gx*tile,py=oy+gy*tile,seed=seeded(gx,gy);
      x.fillStyle=grass[Math.floor(seed*grass.length)];x.globalAlpha=.22;
      x.beginPath();x.ellipse(px+tile*(.2+seed*.6),py+tile*(.2+seeded(gy,gx)*.6),tile*.12,tile*.055,seed*2,0,Math.PI*2);x.fill();x.globalAlpha=1;
      if(seed>.83){x.strokeStyle='rgba(52,105,57,.18)';x.lineWidth=Math.max(1,tile*.025);x.beginPath();x.moveTo(px+tile*.55,py+tile*.55);x.lineTo(px+tile*.62,py+tile*.43);x.stroke();}
    }
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
    // Soft tree silhouettes and layered foliage.
    function drawTree(cx,cy){
      x.fillStyle='rgba(34,74,45,.2)';x.beginPath();x.ellipse(cx,cy+tile*.31,tile*.32,tile*.12,0,0,Math.PI*2);x.fill();
      x.fillStyle='#75513a';roundRect(x,cx-tile*.065,cy+tile*.04,tile*.13,tile*.32,tile*.04,'#75513a');
      for(const [dx,dy,rad,color] of [[-.13,.0,.23,'#3f7e52'],[.1,-.08,.25,'#4f915b'],[0,-.19,.25,'#5c9f65'],[-.12,-.18,.18,'#70ad70'],[.13,.04,.16,'#438451']]){
        x.fillStyle=color;x.beginPath();x.arc(cx+tile*dx,cy+tile*dy,tile*rad,0,Math.PI*2);x.fill();
      }
      x.strokeStyle='rgba(28,86,48,.35)';x.lineWidth=Math.max(1,tile*.025);x.beginPath();x.arc(cx,cy-tile*.12,tile*.22,.1,Math.PI*1.7);x.stroke();
    }
    // Recognizable, matched buildings and interactable props.
    function drawHouse(cx,cy,blue=false,bakery=false){
      const wall=bakery?'#f0dfb8':blue?'#d5e4d8':'#ead2b8';
      const roof=bakery?'#9b5947':blue?'#526f80':'#a65e4d';
      x.fillStyle='rgba(42,68,45,.22)';x.beginPath();x.ellipse(cx,cy+tile*.31,tile*.43,tile*.15,0,0,Math.PI*2);x.fill();
      // side wall adds depth
      x.fillStyle=bakery?'#c9ad80':blue?'#a7c2c5':'#c69d7b';
      x.beginPath();x.moveTo(cx+tile*.27,cy-tile*.08);x.lineTo(cx+tile*.4,cy+tile*.02);x.lineTo(cx+tile*.4,cy+tile*.42);x.lineTo(cx+tile*.27,cy+tile*.36);x.closePath();x.fill();
      x.fillStyle=wall;roundRect(x,cx-tile*.34,cy-tile*.03,tile*.62,tile*.43,tile*.025,wall,'rgba(92,66,49,.25)');
      x.fillStyle=roof;x.beginPath();x.moveTo(cx-tile*.43,cy+tile*.015);x.lineTo(cx-tile*.04,cy-tile*.38);x.lineTo(cx+tile*.39,cy+tile*.015);x.closePath();x.fill();
      x.strokeStyle='rgba(255,237,208,.55)';x.lineWidth=Math.max(1,tile*.035);x.beginPath();x.moveTo(cx-tile*.34,cy+tile*.005);x.lineTo(cx-tile*.04,cy-tile*.3);x.lineTo(cx+tile*.3,cy+.01*tile);x.stroke();
      x.fillStyle='#654a3b';roundRect(x,cx-tile*.09,cy+tile*.17,tile*.17,tile*.23,tile*.025,'#76513d');
      x.fillStyle='#d4e8e0';roundRect(x,cx-tile*.27,cy+tile*.08,tile*.12,tile*.12,tile*.02,'#b9d9d5','#f4e5c9');
      if(bakery){
        x.fillStyle='#f0c878';roundRect(x,cx-tile*.31,cy+tile*.015,tile*.57,tile*.1,tile*.025,'#d5a65e');
        x.fillStyle='#fff0c9';x.font='bold '+(tile*.2)+'px sans-serif';x.textAlign='center';x.fillText('BAKERY',cx-tile*.02,cy+tile*.09);
      }
    }
    function drawWell(cx,cy){
      x.fillStyle='rgba(36,63,45,.18)';x.beginPath();x.ellipse(cx,cy+tile*.25,tile*.38,tile*.13,0,0,Math.PI*2);x.fill();
      x.fillStyle='#8a8e87';x.beginPath();x.ellipse(cx,cy+tile*.06,tile*.33,tile*.24,0,0,Math.PI*2);x.fill();
      x.fillStyle='#4e8990';x.beginPath();x.ellipse(cx,cy+tile*.01,tile*.24,tile*.15,0,0,Math.PI*2);x.fill();
      x.strokeStyle='#d2d3c5';x.lineWidth=tile*.075;x.beginPath();x.ellipse(cx,cy+tile*.06,tile*.33,tile*.24,0,0,Math.PI*2);x.stroke();
      x.strokeStyle='#78563c';x.lineWidth=tile*.055;x.beginPath();x.moveTo(cx-tile*.25,cy-tile*.12);x.lineTo(cx-tile*.25,cy-tile*.38);x.lineTo(cx+tile*.25,cy-tile*.38);x.lineTo(cx+tile*.25,cy-tile*.12);x.stroke();
    }
    WORLD.objects.forEach(o=>{
      const cx=ox+(o.x+.5)*tile,cy=oy+(o.y+.5)*tile;
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
      if(o.id==='baker'){
        // Simple illustrated villager, consistent with the environment.
        x.fillStyle='rgba(40,60,40,.18)';x.beginPath();x.ellipse(cx,cy+tile*.27,tile*.25,tile*.09,0,0,Math.PI*2);x.fill();
        x.fillStyle='#d9a477';x.beginPath();x.arc(cx,cy-tile*.07,tile*.19,0,Math.PI*2);x.fill();
        x.fillStyle='#473b34';x.beginPath();x.arc(cx,cy-tile*.13,tile*.19,Math.PI,Math.PI*2);x.fill();
        x.fillStyle='#f1eee1';roundRect(x,cx-tile*.2,cy+tile*.09,tile*.4,tile*.24,tile*.08,'#f1eee1');
        x.fillStyle='#b95e4d';x.fillRect(cx-tile*.2,cy+tile*.15,tile*.4,tile*.07);
        x.fillStyle='#473b34';x.beginPath();x.arc(cx-tile*.06,cy-tile*.06,tile*.018,0,Math.PI*2);x.arc(cx+tile*.06,cy-tile*.06,tile*.018,0,Math.PI*2);x.fill();return;
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
      x.font=tile*.65+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(o.emoji||'•',cx,cy);
    });
        const p=WORLD.player,elapsed=Math.min(1,(performance.now()-(p.moveAt||0))/160),e=elapsed*elapsed*(3-2*elapsed),px=ox+(p.fromX+(p.x-p.fromX)*e+.5)*tile,py=oy+(p.fromY+(p.y-p.fromY)*e+.5)*tile;
    x.fillStyle='rgba(36,55,43,.24)';x.beginPath();x.ellipse(px,py+tile*.27,tile*.24,tile*.09,0,0,Math.PI*2);x.fill();
    // Player is a small adventurer sprite rather than a floating emoji-like face.
    x.fillStyle='#354e62';roundRect(x,px-tile*.16,py+tile*.01,tile*.32,tile*.31,tile*.08,'#354e62');
    x.fillStyle=WORLD.outfit||'#d7a75b';roundRect(x,px-tile*.2,py-tile*.02,tile*.4,tile*.24,tile*.09,WORLD.outfit||'#d7a75b');
    x.fillStyle='#c98f67';x.beginPath();x.arc(px,py-tile*.13,tile*.17,0,Math.PI*2);x.fill();
    x.fillStyle='#4b3b32';x.beginPath();x.arc(px,py-tile*.18,tile*.17,Math.PI,Math.PI*2);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(px-tile*.055,py-tile*.12,tile*.025,0,Math.PI*2);x.arc(px+tile*.055,py-tile*.12,tile*.025,0,Math.PI*2);x.fill();
    if(WORLD.target){x.strokeStyle='rgba(255,197,49,'+(.35+.65*(.5+.5*Math.sin(performance.now()/180)))+')';x.lineWidth=4;x.setLineDash([5,4]);x.strokeRect(ox+WORLD.target.x*tile+3,oy+WORLD.target.y*tile+3,tile-6,tile-6);x.setLineDash([]);}
    if(p.moveAt&&elapsed>=1&&p.queuedKey){const queued=p.queuedKey;p.queuedKey=null;worldMove(queued);return;}
    if((p.moveAt&&elapsed<1)||WORLD.target)WORLD.raf=requestAnimationFrame(worldDraw);
  }
  function worldStatus(){const s=$('#world-step');if(s)s.textContent=worldTask().check.type==='sequence'?'Step '+(WORLD.step+1)+' of '+worldTask().check.steps.length:'';const carry=$('#world-carry');if(carry)carry.textContent=WORLD.carried?'Carrying '+(WORLD.carried==='key'?'the key':'the basket'):'';}
  function worldRenderPlay(){const t=worldTask();$('#world-game').innerHTML=worldShell('<div class="world-stage"><canvas id="world-canvas" aria-label="Top-down village map"></canvas><div class="world-helpbar"><button data-world-speak>🔊 Listen</button><button data-world-help-toggle aria-expanded="false">💡 Need help?</button><span id="world-step"></span><span id="world-carry"></span></div><section class="world-help-panel" id="world-help-panel" hidden aria-live="polite"><div class="world-help-heading"><strong>Learn as you explore</strong><span>Use a hint only when you need it.</span></div><p id="world-help-copy">Try to understand the instruction and explore the village first.</p><div class="world-help-actions"><button data-world-help-level="1">1 · Small hint</button><button data-world-help-level="2">2 · Show target</button><button data-world-help-level="3">3 · Arabic help</button></div></section><div class="world-mobile-controls"><div class="world-dpad"><button data-world-move="ArrowUp" aria-label="Move up">▲</button><div><button data-world-move="ArrowLeft" aria-label="Move left">◀</button><button data-world-move="ArrowDown" aria-label="Move down">▼</button><button data-world-move="ArrowRight" aria-label="Move right">▶</button></div></div><button class="world-interact" data-world-interact>Space · Interact</button></div></div>');worldStatus();requestAnimationFrame(worldDraw);}
  function startWorld(taskId){if(typeof WORLD_DATA==='undefined'){toast('Village data is not loaded. Refresh and try again.');return;}if(WORLD&&WORLD.raf)cancelAnimationFrame(WORLD.raf);
    WORLD={mode:'intro',tasks:WORLD_DATA.tasks.slice(),index:Math.max(0,WORLD_DATA.tasks.findIndex(t=>t.id===taskId)),map:WORLD_DATA.map,objects:WORLD_DATA.objects.map(o=>({...o})),player:{x:WORLD_DATA.start.x,y:WORLD_DATA.start.y,fromX:WORLD_DATA.start.x,fromY:WORLD_DATA.start.y,moveAt:0,queuedKey:null,color:'#FFC531'},outfit:'#6C5CE7',showTranslation:!!state.helpArabic,tries:0,usedHelp:false,moves:0,step:0,carried:null,picked:new Set(),given:new Set(),stars:0,progress:{},raf:0};
    lockPage(true);$$('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view==='world'?'page':'false'));$('#world-game').hidden=false;$('#world-game').innerHTML='<div class="world-intro"><button class="world-exit" data-world-exit>✕</button><div class="world-intro-art">🌳 🏠 🌉</div><p class="world-kicker">EPIPHANY WORLD</p><h1>Understand. Move. Discover.</h1><p>Read the English instruction and explore a tiny village to complete 10 tasks.</p><h3>Your character</h3><div class="world-color-picks"><button class="is-selected" data-world-color="#FFC531">🟡 Yellow</button><button data-world-color="#7C6CFF">🟣 Purple</button></div><h3>Clothes</h3><div class="world-color-picks"><button class="is-selected" data-world-outfit="#6C5CE7">Purple</button><button data-world-outfit="#168B68">Green</button><button data-world-outfit="#3478D4">Blue</button></div><button class="world-primary" data-world-begin>Start exploring →</button><p class="world-small">Arrow keys / WASD to move · Space to interact</p></div>';}
  function worldComplete(){if(!WORLD||WORLD.mode!=='play')return;const t=worldTask();if(t.check.type==='pickup'){WORLD.carried=null;WORLD.picked.delete(t.check.object);const original=WORLD_DATA.objects.find(o=>o.id===t.check.object);if(original&&!worldObj(original.id))WORLD.objects.push({...original});}const stars=WORLD.usedHelp?(WORLD.moves>7?1:2):3,gain=worldAward(stars,t);WORLD.stars=Object.values(state.world.stars).reduce((sum,value)=>sum+(Number(value)||0),0);WORLD.mode='success';sfx('done');
    $('#world-game').innerHTML=worldShell('<section class="world-success"><div class="world-big-star">★</div><p class="world-kicker">TASK COMPLETE</p><h2>Well done!</h2><div class="world-stars">'+('★'.repeat(stars))+'<span>'+('☆'.repeat(3-stars))+'</span></div><p>+'+gain+' XP earned</p><h3>New words</h3><div class="world-word-list">'+t.words.map(w=>'<span class="world-word-chip"><b>'+esc(w[0])+'</b><small>'+esc(w[1])+'</small></span>').join('')+'</div>'+(t.suggestedStory&&STORIES.some(s=>s.id===t.suggestedStory&&storyLevelIndex(s.level)<=storyLevelIndex(currentLevel().id))?'<button class="world-secondary" data-world-story="'+esc(t.suggestedStory)+'">Read the story behind this task →</button>':'')+'<button class="world-primary" data-world-next>'+(WORLD.index===WORLD.tasks.length-1?'Finish village':'Next task')+' →</button></section>');}
  function worldNext(){if(WORLD.index===WORLD.tasks.length-1){WORLD.mode='finished';$('#world-game').innerHTML='<div class="world-finish"><div class="world-intro-art">🏡 ✨ 🌳</div><p class="world-kicker">VILLAGE COMPLETE</p><h1>You did it!</h1><p>You earned '+WORLD.stars+' stars across 10 tasks.</p><h2>Words from your adventure</h2><div class="world-word-list">'+WORLD.tasks.flatMap(t=>t.words).filter((w,i,a)=>a.findIndex(v=>v[0]===w[0])===i).map(w=>'<span class="world-word-chip"><b>'+esc(w[0])+'</b><small>'+esc(w[1])+'</small></span>').join('')+'</div><button class="world-primary" data-world-replay>Play again ↻</button><button class="world-secondary" data-world-exit>Back to Epiphany</button></div>';return;}
    WORLD.index++;WORLD.mode='play';WORLD.tries=0;WORLD.usedHelp=false;WORLD.moves=0;WORLD.step=0;WORLD.target=null;WORLD.objects=WORLD_DATA.objects.filter(o=>!WORLD.picked.has(o.id)).map(o=>({...o}));worldRenderPlay();}
  function closeWorld(){if(WORLD&&WORLD.raf)cancelAnimationFrame(WORLD.raf);WORLD=null;$('#world-game').hidden=true;lockPage(false);const active=$('.view.is-active');const activeName=active?active.id.replace('-view',''):'home';$$('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view===activeName?'page':'false'));renderAll();}
  document.addEventListener('click',e=>{
    const storyFollow=e.target.closest('[data-story-follow-up]');if(storyFollow){const taskId=storyFollow.dataset.storyFollowUp;$('#game').hidden=true;ST=null;lockPage(false);startWorld(taskId);return;}
    const move=e.target.closest('[data-world-move]');if(move){worldMove(move.dataset.worldMove);return;}
    if(e.target.closest('[data-world-interact]')){worldInteract();return;}
    if(e.target.closest('[data-world-speak]')){if(worldTask())speak(worldTask().instruction);return;}
    
    if(e.target.closest('[data-world-help-toggle]')){if(WORLD){const panel=$('#world-help-panel'),button=e.target.closest('[data-world-help-toggle]'),opening=panel.hidden;panel.hidden=!opening;button.setAttribute('aria-expanded',String(opening));button.textContent=opening?'✕ Close help':'💡 Need help?';}return;}
    const helpLevel=e.target.closest('[data-world-help-level]');if(helpLevel&&WORLD){const level=Number(helpLevel.dataset.worldHelpLevel),t=worldTask(),c=worldStep(),o=(c&&c.object&&worldObj(c.object))||(c&&c.person&&worldObj(c.person)),copy=$('#world-help-copy');if(level===1){copy.textContent=t.hint||'Look carefully at the instruction and the objects in the village.';}else if(level===2){WORLD.usedHelp=true;WORLD.target=o?{x:o.x,y:o.y+((c.type==='under'||c.type==='behind')?1:0)}:(c&&c.type==='between'?{x:9,y:12}:c&&c.type==='pickup'?{x:4,y:9}:c&&c.type==='give'?{x:13,y:10}:{x:9,y:8});copy.textContent='Follow the glowing marker on the map. Move to it, or interact when you are next to the correct item or person.';worldDraw();}else{copy.textContent='Read the instruction carefully. Use the map and the object positions to work out what to do.';}$('[data-world-help-level]').forEach(button=>button.classList.toggle('is-selected',button===helpLevel));worldStatus();return;}
    const pc=e.target.closest('[data-world-color]');if(pc&&WORLD){WORLD.player.color=pc.dataset.worldColor;$('#world-game').querySelectorAll('[data-world-color]').forEach(b=>b.classList.toggle('is-selected',b===pc));return;}
    const po=e.target.closest('[data-world-outfit]');if(po&&WORLD){WORLD.outfit=po.dataset.worldOutfit;$('#world-game').querySelectorAll('[data-world-outfit]').forEach(b=>b.classList.toggle('is-selected',b===po));return;}
    if(e.target.closest('[data-world-begin]')){WORLD.mode='play';worldRenderPlay();return;}
    const worldStory=e.target.closest('[data-world-story]');if(worldStory){const id=worldStory.dataset.worldStory;closeWorld();openView('stories');startStory(id);return;}
    if(e.target.closest('[data-world-next]')){worldNext();return;}
    if(e.target.closest('[data-world-replay]')){startWorld();return;}
    if(e.target.closest('[data-world-exit]')){closeWorld();return;}
  });
  document.addEventListener('keydown',e=>{if(!WORLD)return;if(e.key==='Escape'){closeWorld();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();worldMove(e.key);return;}if(e.code==='Space'){e.preventDefault();worldInteract();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&WORLD&&WORLD.raf){cancelAnimationFrame(WORLD.raf);WORLD.raf=0;}else if(!document.hidden&&WORLD&&WORLD.mode==='play')worldDraw();});
  window.addEventListener('resize',()=>{if(WORLD&&WORLD.mode==='play')worldDraw();});

  /* ---------- events ---------- */
  document.addEventListener('submit', e => { if(e.target && e.target.id==='typing-form'){e.preventDefault();checkTyping();} });
  document.addEventListener('click', e => {
    if(e.target.closest('#wotd-save')){const box=$('#wotd-card'),w=WOTD_WORDS.find(x=>x.word===box.dataset.word);if(w&&!state.words.some(x=>String(x[0]).toLowerCase()===w.word.toLowerCase())){state.words.push([w.word,w.meaning,w.level]);save();renderAll();toast('Word saved to your vault.');}return;}
    const sb=e.target.closest('[data-speak]'); if(sb){speak(sb.dataset.speak);return;}
    const rb=e.target.closest('[data-review]');
    if(rb){const item=state.review.find(w=>w.word===rb.dataset.word);if(item){item.attempts=(item.attempts||0)+1;
      if(rb.dataset.review==='known'){const intervals=[1,3,7,14,30];item.streak=(item.streak||0)+1;item.interval=intervals[Math.min(item.streak-1,intervals.length-1)];const due=new Date();due.setDate(due.getDate()+item.interval);item.due=dayKey(due);}
      else{item.streak=0;item.interval=0;item.due=dayKey();}
      save();renderWords();toast(rb.dataset.review==='known'?'Nice! We’ll review it again later.':'No problem — this word stays in today’s practice.');}return;}
    const view = e.target.closest('[data-view]');
    if (view) { if(view.dataset.view==='world'){startWorld();return;} openView(view.dataset.view); return; }
    const spotWord = e.target.closest('[data-spot-index]');
    if (spotWord && G && G.type === 'spot') { selectSpot(Number(spotWord.dataset.spotIndex)); return; }
    const ans = e.target.closest('.answer');
    if (ans && G) { selectAnswer(Number(ans.dataset.i)); return; }
    if (e.target.closest('#go-next')) { next(); return; }
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
    if (categoryClose) { const picker=$('#category-picker'); if(picker)picker.hidden=true; return; }
    const categoryButton = e.target.closest('[data-category]');
    if (categoryButton) {
      const cat=(window.__gameCategories||[]).find(item=>item.id===categoryButton.dataset.category);
      if(cat){
        $('#category-picker-title').textContent=cat.title;
        $('#category-picker-desc').textContent=cat.desc;
        $('#category-options').innerHTML=cat.games.map(([id,label])=>{
          const gmData=GAMES[id], meta=META[id];
          return '<button type="button" class="category-option t-'+meta.tone+'" data-game="'+id+'"><span class="category-option-icon">'+glyph(id)+'</span><span><strong>'+label+'</strong><small>'+meta.time+' min · +'+gmData.xp+' XP</small></span><span class="category-option-arrow" aria-hidden="true">→</span></button>';
        }).join('');
        $('#category-picker').hidden=false;
        const closeBtn=$('#category-picker [data-category-close]:not(.category-backdrop)');
        if(closeBtn)closeBtn.focus();
      }
      return;
    }
    const gm = e.target.closest('[data-game]');
    if (gm) { const picker=$('#category-picker'); if(picker)picker.hidden=true; startGame(gm.dataset.game); return; }
    const lv = e.target.closest('[data-level]');
    if (lv) {
      const i = Number(lv.dataset.level), l = LEVELS[i];
      if (i > levelIndex()) toast(l.id + ' unlocks at ' + l.xp + ' XP. ' + (l.xp - state.xp) + ' XP to go.');
      else startGame(LEVEL_GAME[i]);
    }
  });
  $('#logo').addEventListener('click', e => { e.preventDefault(); openView('home'); });
  $('#game-close').addEventListener('click', closeGame);
  document.addEventListener('keydown', e => {
    if(ST&&ST.mode==='quiz'&&!ST.answered&&/^[1-9]$/.test(e.key)){const k=Number(e.key)-1;if(k<ST.story.questions[ST.qi].answers.length)answerStoryQuestion(k);return;}
    if (!G) return;
    if (e.key === 'Escape') { closeGame(); return; }
    if (G.type === 'typing') return;
    if (/^[1-9]$/.test(e.key) && !G.answered) {
      const k = Number(e.key) - 1;
      if (k < G.questions[G.i].q.answers.length) selectAnswer(k);
    } else if (e.key === 'Enter' && G.answered && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) next();
  });

  function placementQuestions(){const shuffle=list=>{const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};return LEVELS.flatMap(level=>shuffle(GAMES.vocabulary.questions.filter(q=>q.level===level.id)).slice(0,2).map(q=>({...q,placementLevel:level.id}))); }
  let placement={questions:[],index:0,answers:[]};
  function showPlacement(){if(state.placementDone)return;placement={questions:placementQuestions(),index:0,answers:[]};$('#placement').hidden=false;lockPage(true);renderPlacementQuestion();}
  function renderPlacementQuestion(){const q=placement.questions[placement.index];$('#placement-progress').textContent='Question '+(placement.index+1)+' of '+placement.questions.length;$('#placement-content').innerHTML='<h2>'+esc(q.q)+'</h2><p>'+esc(q.sub||'Choose the best answer.')+'</p><div class="answers">'+q.answers.map((x,i)=>'<button class="answer" data-place-answer="'+i+'"><span class="key">'+(i+1)+'</span><span>'+esc(x)+'</span></button>').join('')+'</div>';}
  function skipPlacement(){state.placementDone=true;save();$('#placement').hidden=true;lockPage(false);renderAll();toast('Placement skipped. Your starting level is A1 — you can begin playing now.');}
  $('#placement-skip').addEventListener('click',skipPlacement);
  function answerPlacement(choice){const q=placement.questions[placement.index];placement.answers.push({level:q.placementLevel,ok:choice===q.correct});placement.index++;if(placement.index<placement.questions.length){renderPlacementQuestion();return;}
    const scores=Object.fromEntries(LEVELS.map(l=>[l.id,placement.answers.filter(a=>a.level===l.id&&a.ok).length]));let target=0;for(let i=0;i<LEVELS.length;i++){if(scores[LEVELS[i].id]>=1)target=i;else break;}
    state.level=LEVELS[target].id;state.xp=Math.max(state.xp,LEVELS[target].xp);state.placementDone=true;save();$('#placement').hidden=true;lockPage(false);renderAll();toast('Your starting level is '+LEVELS[target].id+'. You can improve it as you learn.');}
  document.addEventListener('click',e=>{const p=e.target.closest('[data-place-answer]');if(p&&!$('#placement').hidden){answerPlacement(Number(p.dataset.placeAnswer));return;}});
  renderAll(); if(!state.placementDone)showPlacement();
})();
