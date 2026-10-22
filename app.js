/* Epiphany app logic. Lesson content lives in data.js (LEVELS, GAMES, AR_EXPLANATIONS).
   Saved progress keeps the same localStorage key and shape as the first prototype. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ic = n => '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  const dayKey = (d = new Date()) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');

  /* ---------- state ---------- */
  const defaults = () => ({xp:0, quests:0, words:[], review:[], placementDone:false, completed:[], streak:0, lastDay:null, daily:0, level:'A1', sound:true, helpArabic:false});
  let state;
  try { state = {...defaults(), ...JSON.parse(localStorage.getItem('epiphany-progress') || '{}')}; } catch { state = defaults(); }
  if (!Array.isArray(state.review)) state.review = [];
  if (state.lastDay !== dayKey()) state.daily = 0;
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
    advanced:  {label:'Advanced',     tone:'ink',    icon:'spark',  time:6, blurb:'Explore precise language and subtle meaning.'}
  };
  const ORDER = ['vocabulary', 'spelling', 'grammar', 'story', 'listening', 'advanced'];
  const UNLOCK = {vocabulary:0, spelling:0, grammar:1, story:2, listening:3, advanced:4};   // level index that suggests each game
  const LEVEL_GAME = ['vocabulary', 'grammar', 'story', 'listening', 'advanced', 'advanced']; // same mapping the world map used
  const glyph = g => META[g].icon ? ic(META[g].icon) : META[g].glyph;

  /* ---------- derived values ---------- */
  const levelIndex = () => { let i = 0; LEVELS.forEach((l, k) => { if (state.xp >= l.xp) i = k; }); return i; };
  const currentLevel = () => LEVELS[levelIndex()];
  const liveStreak = () => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return state.lastDay === dayKey() || state.lastDay === dayKey(y) ? (state.streak || 0) : 0;
  };
  function pickNext() {
    const ok = ORDER.filter(g => UNLOCK[g] <= levelIndex());
    return ok[state.quests % ok.length];
  }

  /* ---------- rendering: header + home ---------- */
  function renderHeader() {
    $('#chip-streak').textContent = liveStreak();
    $('#chip-xp').textContent = state.xp;
  }

  function renderHome() {
    const h = new Date().getHours();
    $('#greeting').textContent = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

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
      return '<button class="tile t-' + mm.tone + '" data-game="' + k + '"><span class="tile-ic">' + glyph(k) + '</span>' +
        '<span><h3>' + esc(gm.title) + '</h3><p>' + mm.time + ' min · +' + gm.xp + ' XP</p></span></button>';
    }).join('');
  }

  /* ---------- rendering: words + trophies ---------- */
  function speak(text) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { toast('Speech playback is not supported in this browser.'); return; }
    window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text || '')); u.lang='en-US'; u.rate=0.88; window.speechSynthesis.speak(u);
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
  function renderWords() {
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
      ['crown', 'Mastermind',      'Reach C1.',                  Math.min(idx, 4), 4]
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
    $$('#ar-toggle, #game-ar').forEach(b => b.setAttribute('aria-pressed', String(!!state.helpArabic)));
    const s = $('#sound-toggle');
    s.setAttribute('aria-pressed', String(!!state.sound));
    s.innerHTML = ic(state.sound ? 'sound' : 'mute');
  }
  function toggleArabic() {
    state.helpArabic = !state.helpArabic; save(); syncSettings();
    if (G) { if (G.answered) setSheetSpace(); } else toast(state.helpArabic ? 'Arabic help is on' : 'Arabic help is off');
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
    advanced:'ركّز على الفروق الدقيقة في المعنى والمنطق بين الخيارات.'
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
    const selected = levelPool.length >= 5
      ? shuffle(levelPool).slice(0, 5)
      : [...shuffle(levelPool), ...shuffle(generalPool).slice(0, 5 - levelPool.length)];
    const paired = shuffle(selected).map(q => ({q, ar: q.ar || 'راجع معنى الإجابة الصحيحة وحاول تذكّرها في سياق جديد.'}));
    G = {type, questions: paired, i:0, score:0, words:[], answered:false, results:[]};
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
      const sel = $('#answers .correct'); if (sel) sel.scrollIntoView({block:'nearest', behavior:'smooth'});
      const b = $('#go-next'); if (b) b.focus({preventScroll: true});
    });
  }

  function renderQuestion() {
    const game = GAMES[G.type], q = G.questions[G.i].q, m = META[G.type];
    G.answered = false; hideSheet(); renderSteps();
    $('#game-body').innerHTML =
      '<div class="q-meta"><span class="pill">' + (G.reviewMode ? 'Practice again' : m.label) + '</span><span class="q-count">Question ' + (G.i + 1) + ' of ' + game.questions.length + '</span></div>' +
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
    else if (!G.reviewMode) addReview(q.word,q.explain);
    G.results[G.i] = ok ? 'ok' : 'no';
    $$('#answers .answer').forEach((b, k) => { b.disabled = true; if (k === q.correct) b.classList.add('correct'); else if (k === choice) b.classList.add('wrong'); });
    $('#answers').classList.add('done');
    renderSteps(); sfx(ok ? 'ok' : 'no');
    const last = G.i === game.questions.length - 1;
    showSheet(ok,
      '<h3><span class="sheet-mark">' + ic(ok ? 'check' : 'x') + '</span>' + (ok ? 'Exactly right!' : 'Not quite — and that’s okay.') + '</h3>' +
      (ok ? '' : '<p>Correct answer: <b>' + esc(q.answers[q.correct]) + '</b></p>') +
      '<p>' + esc(q.explain) + '</p>' +
      (ok && q.word ? '<div class="newword"><span>New word</span><b>' + esc(q.word[0]) + '</b><span>' + esc(q.word[1]) + '</span></div>' : '') +
      '<p class="ar-only arabic" lang="ar" dir="rtl"><strong>' + (ok ? 'أحسنت!' : 'معلومة للتعلّم') + '</strong> ' + esc(item.ar) + '</p>' +
      '<div class="sheet-actions"><button class="btn" id="go-next">' + (last ? 'See results' : 'Continue') + ic('arrow') + '</button></div>');
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
    if (state.lastDay !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      state.streak = state.lastDay === dayKey(y) ? (state.streak || 0) + 1 : 1;
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
      (after.id !== before.id ? '<div class="levelup"><b>You reached ' + after.id + '!</b>' + after.name + ' · ' + esc(after.title) + '</div>' : '') +
      (G.words.length ? '<div class="found"><div class="found-title">Added to your vault</div>' + G.words.map(w => '<span class="w">' + esc(w[0]) + '</span>').join('') + '</div>' : '') + (G.originalQuestions ? '<p class="review-complete">You also reviewed ' + G.originalQuestions.filter((item,i)=>G.originalResults[i]==='no').length + ' missed question(s).</p>' : '') +
      '<div class="result-actions"><button class="btn" id="res-next">' + ic('play') + 'Next: ' + esc(GAMES[nxt].title) + '</button>' +
      '<button class="btn btn-ghost" id="res-home">Back to home</button>' +
      '<button class="btn btn-link" id="res-again">Play this quest again</button></div></div>';
    $('#game-scroll').scrollTop = 0;
    const type = G.type;
    $('#res-next').addEventListener('click', () => startGame(nxt));
    $('#res-home').addEventListener('click', closeGame);
    $('#res-again').addEventListener('click', () => startGame(type));
    $('#res-next').focus({preventScroll: true});
  }

  function closeGame() {
    $('#game').hidden = true; hideSheet(); G = null;
    lockPage(false); renderAll();
    const h = $('.view.is-active h1'); if (h) h.focus({preventScroll: true});
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const sb=e.target.closest('[data-speak]'); if(sb){speak(sb.dataset.speak);return;}
    const rb=e.target.closest('[data-review]');
    if(rb){const item=state.review.find(w=>w.word===rb.dataset.word);if(item){item.attempts=(item.attempts||0)+1;
      if(rb.dataset.review==='known'){const intervals=[1,3,7,14,30];item.streak=(item.streak||0)+1;item.interval=intervals[Math.min(item.streak-1,intervals.length-1)];const due=new Date();due.setDate(due.getDate()+item.interval);item.due=dayKey(due);}
      else{item.streak=0;item.interval=0;item.due=dayKey();}
      save();renderWords();toast(rb.dataset.review==='known'?'Nice! We’ll review it again later.':'No problem — this word stays in today’s practice.');}return;}
    const view = e.target.closest('[data-view]');
    if (view) { openView(view.dataset.view); return; }
    const ans = e.target.closest('.answer');
    if (ans && G) { selectAnswer(Number(ans.dataset.i)); return; }
    if (e.target.closest('#go-next')) { next(); return; }
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
