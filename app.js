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
  const defaults = () => ({xp:0, quests:0, words:[], review:[], placementDone:false, completed:[], streak:0, lastDay:null, daily:0, level:'A1', sound:true, helpArabic:false, theme:'light', streakFreezes:1, dailyQuestDate:null, dailyQuestProgress:0, dailyQuestClaimed:false, dailyCorrect:0, dailyXp:0, weeklyKey:null, weeklyProgress:0, weeklyClaimed:false, mistakeTrapErrors:{}, mistakeQuestionErrors:{}, modes:{}, weakTraps:{}});
  let state;
  try { state = {...defaults(), ...JSON.parse(localStorage.getItem('epiphany-progress') || '{}')}; } catch { state = defaults(); }
  if (!Array.isArray(state.review)) state.review = [];
  if (!state.mistakeTrapErrors || typeof state.mistakeTrapErrors !== 'object' || Array.isArray(state.mistakeTrapErrors)) state.mistakeTrapErrors = {};
  if (!state.mistakeQuestionErrors || typeof state.mistakeQuestionErrors !== 'object' || Array.isArray(state.mistakeQuestionErrors)) state.mistakeQuestionErrors = {};
  if (!state.modes || typeof state.modes !== 'object' || Array.isArray(state.modes)) state.modes = {};
  if (!state.weakTraps || typeof state.weakTraps !== 'object' || Array.isArray(state.weakTraps)) state.weakTraps = {};
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

    $('#games').innerHTML = ORDER.map(k => {
      const gm = GAMES[k], mm = META[k];
      if (k === 'mistakes') return '<article class="tile tile-group t-' + mm.tone + '"><span class="tile-ic">' + glyph(k) + '</span><div class="tile-group-main"><h3>Common mistakes</h3><p>Two ways to learn from mistakes · 4 min</p><div class="tile-group-actions"><button type="button" data-game="mistakes">Choose the correct answer</button><button type="button" data-game="spot">Spot the mistake</button></div></div></article>';
      return '<button class="tile t-' + mm.tone + '" data-game="' + k + '"><span class="tile-ic">' + glyph(k) + '</span>' +
        '<span><h3>' + esc(gm.title) + '</h3><p>' + mm.time + ' min · +' + gm.xp + ' XP</p></span></button>';
    }).join('');
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
      ['search', 'Mistake Hunter', 'Complete 10 Common Mistakes questions.', Math.min((state.modes.mistakes||0)+(state.modes.spot||0),10),10],
      ['pencil', 'Wordsmith', 'Complete 10 Type It questions.', Math.min(state.modes.typing||0,10),10]
    ];
    const got = all.filter(a => a[3] >= a[4]).length;
    $('#trophies-count').textContent = got + ' of ' + all.length + ' unlocked';
    $('#trophies').innerHTML = all.map(a => {
      const on = a[3] >= a[4];
      return '<article class="trophy' + (on ? ' on' : '') + '"><div class="trophy-ic">' + ic(a[0]) + '</div><div style="flex:1;min-width:0"><h3>' + a[1] + '</h3><p>' + a[2] + '</p>' +
        '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + a[4] + '" aria-valuenow="' + a[3] + '" aria-label="' + a[1] + ' progress"><i style="width:' + Math.round(a[3] / a[4] * 100) + '%"></i></div></div></article>';
    }).join('');
  }

  function renderAll() { renderHeader(); renderHome(); renderWords(); renderTrophies(); syncSettings(); }

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
      selected = levelPool.length >= 5
        ? shuffle(levelPool).slice(0, 5)
        : [...shuffle(levelPool), ...shuffle(generalPool).slice(0, 5 - levelPool.length)];
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
    $('#game').hidden = true; hideSheet(); G = null;
    lockPage(false); renderAll();
    const h = $('.view.is-active h1'); if (h) h.focus({preventScroll: true});
  }

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
    if (view) { openView(view.dataset.view); return; }
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
    const gm = e.target.closest('[data-game]');
    if (gm) { startGame(gm.dataset.game); return; }
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
