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
  const defaults = () => ({xp:0, quests:0, words:[], completed:[], streak:0, lastDay:null, daily:0, level:'A1', sound:true, helpArabic:false});
  let state;
  try { state = {...defaults(), ...JSON.parse(localStorage.getItem('epiphany-progress') || '{}')}; } catch { state = defaults(); }
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
  function renderWords() {
    const n = state.words.length;
    $('#words-count').textContent = n + (n === 1 ? ' word' : ' words');
    $('#words-body').innerHTML = !n
      ? '<div class="empty"><div class="empty-ic">' + ic('book') + '</div><h2>Your vault is empty, for now.</h2><p>Answer a vocabulary or real-life question correctly and the word lands here with its meaning.</p><button class="btn" data-game="vocabulary">' + ic('play') + 'Find your first word</button></div>'
      : '<div class="vault">' + state.words.slice().reverse().map(w =>
          '<article class="word"><b>' + esc(w[0]) + '</b><span>' + esc(w[1]) + '</span><em>' + esc(w[2] || 'A1') + '</em></article>').join('') + '</div>';
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
    const paired = game.questions.map((q, i) => ({q, ar: (AR_EXPLANATIONS[type] || [])[i] || 'راجع معنى الإجابة الصحيحة وحاول تذكّرها في سياق جديد.'}));
    for (let i = paired.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [paired[i], paired[j]] = [paired[j], paired[i]]; }
    G = {type, questions: paired.slice(0, Math.min(5, paired.length)), i:0, score:0, words:[], answered:false, results:[]};
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
      '<div class="q-meta"><span class="pill">' + m.label + '</span><span class="q-count">Question ' + (G.i + 1) + ' of ' + game.questions.length + '</span></div>' +
      '<h2 class="q-text" id="q-text" tabindex="-1">' + esc(q.q) + '</h2><p class="q-sub">' + esc(q.sub) + '</p>' +
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
    if (ok) { G.score++; if (q.word) G.words.push(q.word); }
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
    if (G.i < G.questions.length - 1) { G.i++; renderQuestion(); } else showResults();
  }

  function showResults() {
    const game = GAMES[G.type], total = G.questions.length;
    const earned = Math.round(game.xp * (.35 + .65 * G.score / total));
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
    G.words.forEach(w => { if (!state.words.some(e => e[0] === w[0])) state.words.push([w[0], w[1], after.id]); });
    save(); renderAll();

    hideSheet(); renderSteps(true); sfx('done');
    const perfect = G.score === total, nxt = pickNext();
    $('#game-body').innerHTML =
      '<div class="result"><div class="burst">' + ic('spark') + '</div>' +
      '<p class="kicker" style="margin:6px 0 0">Quest complete</p>' +
      '<h2>' + (perfect ? 'Brilliant work!' : G.score >= 3 ? 'Look at you, growing!' : 'Every try teaches you something.') + '</h2>' +
      '<p>You got ' + G.score + ' out of ' + total + '. ' + (perfect ? 'A perfect round. Enjoy that feeling.' : 'Check the words below and play again when you’re ready.') + '</p>' +
      '<div class="stats3"><div class="stat"><b>+' + earned + '</b><span>XP earned</span></div><div class="stat"><b>' + G.score + '/' + total + '</b><span>Correct</span></div><div class="stat"><b>' + G.words.length + '</b><span>New words</span></div></div>' +
      (after.id !== before.id ? '<div class="levelup"><b>You reached ' + after.id + '!</b>' + after.name + ' · ' + esc(after.title) + '</div>' : '') +
      (G.words.length ? '<div class="found"><div class="found-title">Added to your vault</div>' + G.words.map(w => '<span class="w">' + esc(w[0]) + '</span>').join('') + '</div>' : '') +
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

  renderAll();
})();
