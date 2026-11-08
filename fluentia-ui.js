/* Fluentia Phase 5 — learner-facing hub and mixed practice UI.
   The engine remains the single source of truth for eligibility, selection and evaluation. */
(() => {
  'use strict';
  const root = document.getElementById('fluentia-content');
  if (!root) return;
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const domainDefs = [
    {id:'wordcraft',name:'Wordcraft',icon:'Aa',desc:'Build a stronger vocabulary and recognise how words work.',accent:'violet'},
    {id:'sentence-studio',name:'Sentence Studio',icon:'S+',desc:'Shape accurate, natural sentences and strengthen grammar.',accent:'coral'},
    {id:'textwise',name:'Textwise',icon:'▤',desc:'Read with purpose, connect details and understand meaning.',accent:'sky'},
    {id:'soundscape',name:'Soundscape',icon:'♫',desc:'Listen closely, recognise sounds and build transcription skills.',accent:'mint'},
    {id:'real-world',name:'Real World',icon:'↗',desc:'Use English in practical situations and everyday communication.',accent:'navy'},
    {id:'fine-sense',name:'Fine Sense',icon:'✧',desc:'Explore nuance, precision and subtle differences in meaning.',accent:'gold'}
  ];
  const activityNames = {
    'wordcraft-vocabulary':'Word Collector','wordcraft-spelling':'Word Detective','wordcraft-word-match':'Word Match','wordcraft-speed-round':'Speed Round','wordcraft-personal-vocabulary':'Personal Vocabulary',
    'sentence-studio-grammar':'Sentence Shaper','sentence-studio-common-mistakes':'Common Mistakes','sentence-studio-spot-the-mistake':'Spot the Mistake','sentence-studio-type-it':'Type It','sentence-studio-sentence-builder':'Sentence Builder','sentence-studio-your-review':'Your Review','wordcraft-personal-review':'Your Vocabulary Review','sentence-studio-personal-review':'Your Grammar Review',
    'textwise-meaning-detective':'Meaning Detective','textwise-sequence':'Text Sequencing',
    'soundscape-sound-picture-match':'Sound & Picture Match','soundscape-sound-maze':'Sound Maze','soundscape-dictation-bank':'Dictation','soundscape-practice-dictation':'Practice Dictation',
    'real-world-lost-in-london':'Lost in London','real-world-directions':'Directions','real-world-speaking-shadowing':'Speaking & Shadowing','real-world-your-review':'Your Review',
    'fine-sense-nuance-navigator':'Nuance Navigator'
  };
  const interactionLabels = {choice:'Choose an answer',correction:'Find the correction',typed:'Written answer',ordering:'Put in order',matching:'Match the pairs',map:'Map response',listening:'Listening task',speech:'Speaking practice',dynamic:'Adaptive practice'};
  const symbols = {choice:'◉',correction:'✎',typed:'Aa',ordering:'↔',matching:'⤳',map:'⌖',listening:'♫',speech:'◖',dynamic:'✦'};
  let engine = null, activities = [], selectedLevel = 'A1', currentDomain = null, currentSession = null, currentModeLabel = '', currentMode = '', currentQuestion = null, answered = false, lastEvent = null;
  let translated = false, choosingSectionMixed = false;
  let speechRecognition = null, speechListening = false, speechErrorMessage = '';
  const levelNames = {A1:'Beginner',A2:'Elementary',B1:'Intermediate',B2:'Upper intermediate',C1:'Advanced',C2:'Proficient'};
  function activityLabel(id) {
    if (activityNames[id]) return activityNames[id];
    const review = String(id).match(/^(.*)-history-review$/);
    if (review) return (activityNames[review[1]] || review[1].replace(/^[^-]+-/,'').replace(/-/g,' ')) + ' · Review';
    return String(id).replace(/^[^-]+-/,'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  }
  function getProgress() { try { return window.__epiphanyReadProgress?.() || {}; } catch { return {}; } }
  function currentLevel() {
    const state = getProgress();
    const level = String(state.assessedLevel || state.level || 'A1').toUpperCase();
    return ['A1','A2','B1','B2','C1','C2'].includes(level) ? level : 'A1';
  }
  function getEngine() { return window.EPIPHANY_FLUENTIA_SESSION_ENGINE || null; }
  function eligibleItems(activity, level = selectedLevel) {
    try { return activity.getItems({level,domain:activity.domain,activityId:activity.id}) || []; } catch { return []; }
  }
  function refreshActivities() {
    engine = getEngine();
    if (!engine) { activities = []; return; }
    activities = engine.listActivities().map(info => {
      const adapter = engine.getActivity(info.id);
      return {...info,reviewOnly:!!adapter?.reviewOnly,items:eligibleItems(adapter || info)};
    });
  }
  function domainMarkup(domain, count) {
    const disabled = count < 1;
    return '<button type="button" class="fluentia-domain-card" data-domain="'+domain.id+'" '+(disabled?'disabled':'')+'><span class="fluentia-domain-icon" aria-hidden="true">'+domain.icon+'</span><strong>'+domain.name+'</strong><p>'+domain.desc+'</p><span class="fluentia-domain-foot"><span>'+count+' available activit'+(count===1?'y':'ies')+'</span><span>'+(disabled?'Coming soon':'Explore →')+'</span></span></button>';
  }
  function modeCard(mode) {
    const isGlobal = mode === 'fluentia-mix';
    const count = activities.filter(a => !a.reviewOnly && a.items.length).length;
    return '<button type="button" class="fluentia-mode-card '+(isGlobal?'is-global':'')+'" data-mode="'+mode+'"><span class="fluentia-mode-icon">'+(isGlobal?'✦':'↻')+'</span><strong>'+(isGlobal?'Fluentia Mix':'Section Mixed')+'</strong><p>'+(isGlobal?'Move across all six domains in one balanced session. The engine shares questions fairly and avoids repeats.':'Stay within one domain while rotating between its available activities.')+'</p><span class="fluentia-mode-meta">'+(isGlobal?count+' eligible activities across available domains':'Choose a domain first')+' · 10 questions</span></button>';
  }
  function toolbar() {
    return '<div class="fluentia-toolbar"><label class="fluentia-level-control">Practice level <select id="fluentia-level" aria-label="Choose CEFR practice level">'+['A1','A2','B1','B2','C1','C2'].map(level=>'<option value="'+level+'" '+(selectedLevel===level?'selected':'')+'>'+level+' · '+levelNames[level]+'</option>').join('')+'</select></label><span class="fluentia-domain-foot">Your assessed level: <b>'+currentLevel()+'</b></span></div>';
  }
  function renderHome() {
    refreshActivities();
    currentDomain = null; choosingSectionMixed = false;
    const globalCount = activities.filter(a => !a.reviewOnly && a.items.length).length;
    root.innerHTML = '<div class="fluentia-hero"><div><p class="kicker">YOUR ENGLISH PRACTICE SPACE</p><h1 id="fluentia-title">Fluentia</h1><p>Build fluency through short activities across six connected areas. Choose a skill or explore a domain. For a cross-domain session, try Fluentia Mix.</p></div><div class="fluentia-hero-mark" aria-hidden="true">F</div></div>'+toolbar()+'<div class="fluentia-modes">'+modeCard('fluentia-mix')+'</div><div class="fluentia-section-heading"><div><h2>Explore the six domains</h2><p>Each domain brings related English skills together.</p></div></div><div class="fluentia-domain-grid">'+domainDefs.map(domain=>domainMarkup(domain,activities.filter(a=>a.domain===domain.id&&!a.reviewOnly&&a.items.length).length)).join('')+'</div>'+reviewPanel();
    bindToolbar();
  }
  function reviewPanel() {
    const reviews = activities.filter(a => a.reviewOnly && a.items.length);
    return '<section class="fluentia-review-panel"><h2>Your Review</h2><p>Revisit questions you missed in Fluentia, alongside your saved vocabulary and grammar review. A question leaves the active review queue after you answer it correctly here.</p><div class="fluentia-review-actions">'+(reviews.length?reviews.map(a=>'<button type="button" class="btn btn-ghost" data-activity="'+esc(a.id)+'">'+esc(activityLabel(a.id))+' · '+a.items.length+'</button>').join(''):'<span class="fluentia-empty">Your personalised review will appear after you save learning or miss a Fluentia question.</span>')+'</div></section>';
  }
  function bindToolbar() {
    const select = $('#fluentia-level');
    if (select) select.addEventListener('change', () => { selectedLevel = select.value; renderHome(); });
  }
  function renderDomain(domainId) {
    refreshActivities();
    const domain = domainDefs.find(item=>item.id===domainId);
    if (!domain) return renderHome();
    currentDomain = domainId; choosingSectionMixed = false;
    const items = activities.filter(a=>a.domain===domainId&&!a.reviewOnly&&a.items.length);
    root.innerHTML = '<button type="button" class="fluentia-back" data-back>← All Fluentia</button><div class="fluentia-domain-intro"><span class="fluentia-domain-icon">'+domain.icon+'</span><div><p class="kicker">FLUENTIA DOMAIN</p><h2>'+domain.name+'</h2><p>'+domain.desc+'</p></div></div><div class="fluentia-section-heading"><div><h2>Choose an activity</h2><p>Every activity uses your selected '+selectedLevel+' level.</p></div></div><div class="fluentia-modes fluentia-domain-modes">'+modeCard('section-mixed')+'</div>'+(items.length?'<div class="fluentia-activity-list">'+items.map(activityCard).join('')+'</div>':'<div class="fluentia-empty">No activities have eligible content for '+selectedLevel+' yet. Choose another level or return later.</div>');
  }
  function activityCard(activity) {
    const label = activityLabel(activity.id);
    return '<button type="button" class="fluentia-activity-card" data-activity="'+esc(activity.id)+'"><span class="fluentia-activity-symbol">'+(symbols[activity.interactionType]||'✦')+'</span><span class="fluentia-activity-copy"><strong>'+esc(label)+'</strong><small>'+esc(interactionLabels[activity.interactionType]||activity.interactionType)+' · '+activity.items.length+' items · '+selectedLevel+'</small></span><span class="fluentia-activity-arrow" aria-hidden="true">→</span></button>';
  }
  function startSession(mode, options = {}) {
    refreshActivities();
    const config = {mode,level:selectedLevel,itemCount:10};
    if (mode==='section-mixed') config.domain = options.domain || currentDomain;
    if (mode==='single') config.activityId = options.activityId;
    try {
      currentSession = engine.createSession(config);
      currentMode = mode;
      currentModeLabel = options.label || (mode==='fluentia-mix'?'Fluentia Mix':mode==='section-mixed'?'Section Mixed':activityLabel(options.activityId)||'Practice');
      nextQuestion();
    } catch (error) {
      root.innerHTML = '<div class="fluentia-empty"><b>Practice is not available yet.</b><p>'+esc(error.message||'No eligible questions were found for this level.')+'</p><button class="btn btn-ghost" type="button" data-back>Back to Fluentia</button></div>';
    }
  }
  function nextQuestion() {
    if (!currentSession) return renderHome();
    if (currentSession.status==='completed') return renderSummary();
    try { currentQuestion = engine.selectNext(currentSession); }
    catch (error) { root.innerHTML = '<div class="fluentia-empty">'+esc(error.message)+'</div>'; return; }
    if (!currentQuestion) return renderSummary();
    answered = false; lastEvent = null; translated = false;
    renderQuestion();
  }
  function promptText(item) {
    if (currentQuestion.activityId==='wordcraft-speed-round') return item.meaning || 'Type the word that matches the meaning.';
    if (currentQuestion.activityId==='soundscape-sound-picture-match') return 'Listen to the word, then choose the matching picture.';
    if (['soundscape-dictation-bank','soundscape-dictation'].includes(currentQuestion.activityId)) return 'Listen to the sentence, then type what you hear.';
    if (currentQuestion.activityId==='real-world-speaking-shadowing') return 'Listen to the sentence, then repeat it aloud or type what you said.';
    if (currentQuestion.activityId==='sentence-studio-sentence-builder') return 'Rebuild the sentence in the correct order.';
    if (currentQuestion.interactionType==='correction') return item.prompt || 'Select the incorrect word in the sentence.';
    return item.reviewPrompt || item.prompt || item.q || item.instruction || item.question || item.sentence || item.text || item.word || 'Choose the best response.';
  }
  function optionsFor(item) {
    let rows = Array.isArray(item.answers) ? item.answers : Array.isArray(item.options) ? item.options : null;
    if (!rows && currentQuestion.interactionType==='correction') rows = Array.isArray(item.words) ? item.words : Array.isArray(item.tokens) ? item.tokens : (item.text ? String(item.text).trim().split(/\\s+/) : null);
    if (!rows && currentQuestion.interactionType==='listening' && currentQuestion.activityId==='soundscape-sound-picture-match') {
      const source = activities.find(activity=>activity.id==='soundscape-sound-picture-match');
      rows = (source?.items || []).map(row=>row.word).filter(Boolean);
    }
    return rows ? rows.map(value=>typeof value==='string'?value:(value.label||value.text||value.word||String(value))) : null;
  }
  function inputFor(item) {
    const type = currentQuestion.interactionType;
    if (type==='choice'||type==='correction'||(type==='listening' && optionsFor(item))) return null;
    if (type==='matching') return '<label>Match the meaning for <b>'+esc(item.word||'this word')+'</b><input class="fluentia-answer-input" id="fluentia-match-meaning" autocomplete="off" placeholder="Type the matching meaning" aria-label="Matching meaning"></label>';
    if (type==='speech') {
      const supported = !!(window.isSecureContext !== false && (window.SpeechRecognition || window.webkitSpeechRecognition));
      return '<div class="fluentia-speech-tools"><div class="fluentia-speech-actions"><button type="button" class="btn" data-speech-start '+(supported?'':'disabled')+'>🎙 Start speaking</button><button type="button" class="btn btn-ghost" data-speech-stop disabled>Stop</button></div><p class="fluentia-speech-status" id="fluentia-speech-status" role="status" aria-live="polite">'+(supported?'Allow microphone access when your browser asks, then repeat the sentence.':'Speech recognition is not supported in this browser or context. You can still type your transcript below.')+'</p><label for="fluentia-speech-transcript">Recognised words (editable)</label><textarea class="fluentia-answer-input fluentia-speech-transcript" id="fluentia-speech-transcript" rows="3" placeholder="Your recognised words will appear here…"></textarea><p class="fluentia-speech-note">This compares recognised words with the target. It does not assess pronunciation quality.</p></div>';
    }
    return '<input class="fluentia-answer-input" id="fluentia-answer" type="text" autocomplete="off" placeholder="'+(type==='ordering'?'Enter each step in order, separated by >':type==='map'?'Enter the map coordinate, for example 2,3':'Type your answer')+'" aria-label="Your answer">';
  }
  function renderQuestion() {
    const item = currentQuestion.item, opts = optionsFor(item), prompt = promptText(item);
    const meta = activities.find(a=>a.id===currentQuestion.activityId);
    const count = currentSession.completedCount+1, percent = (currentSession.completedCount/currentSession.targetCount)*100;
    const choices = opts && ['choice','correction','listening','matching','map'].includes(currentQuestion.interactionType)
      ? '<div class="fluentia-answer-grid">'+opts.map((option,index)=>'<button type="button" class="fluentia-answer" data-answer-index="'+index+'" data-answer-value="'+esc(option)+'"><span class="fluentia-answer-index">'+(index+1)+'</span><span>'+esc(option)+'</span></button>').join('')+'</div>'
      : inputFor(item);
    const correctionSentence = currentQuestion.interactionType==='correction' && item.text ? '<p class="fluentia-question-prompt">'+esc(item.text)+'</p>' : ''; const spoken = currentQuestion.activityId==='wordcraft-speed-round' ? '' : (item.word || item.target || item.text || ''); const listen = spoken && window.EpiphanySpeech ? '<button type="button" class="btn btn-ghost" data-fluentia-speak="'+esc(spoken)+'">♫ Listen</button>' : '';
    root.innerHTML = '<div class="fluentia-session"><div class="fluentia-session-top"><button type="button" class="fluentia-back" data-exit>← Leave session</button><span class="pill">'+esc(currentModeLabel)+' · '+esc(selectedLevel)+'</span></div><div class="fluentia-session-progress" role="progressbar" aria-valuemin="0" aria-valuemax="'+currentSession.targetCount+'" aria-valuenow="'+count+'"><span style="width:'+percent+'%"></span></div><article class="fluentia-question-card"><p class="kicker">'+esc(domainDefs.find(d=>d.id===currentQuestion.domain)?.name||currentQuestion.domain)+' · '+esc(interactionLabels[currentQuestion.interactionType]||currentQuestion.interactionType)+'</p><p class="fluentia-question-prompt">Question '+count+' of '+currentSession.targetCount+'</p><h2>'+esc(prompt)+'</h2>'+correctionSentence+listen+(item.sub?'<p class="fluentia-question-prompt">'+esc(item.sub)+'</p>':'')+(choices||'<div class="fluentia-empty">This activity does not yet have a compatible response control.</div>')+'<div id="fluentia-feedback" aria-live="polite"></div><div class="fluentia-session-actions">'+(opts&&choices?'<span class="fluentia-question-prompt">Choose one answer</span>':'<button type="button" class="btn" data-submit>Check answer</button>')+'<button type="button" class="btn" data-next hidden>Continue →</button></div></article></div>';
  }
  function submit(answer) {
    if (answered || !currentQuestion) return;
    if (answer === undefined) {
      if (currentQuestion.interactionType==='matching') {
        const meaning=$('#fluentia-match-meaning');
        answer={word:currentQuestion.item.word||'',meaning:meaning?.value.trim()||''};
        if(!answer.word||!answer.meaning){meaning?.focus();return;}
      } else if (currentQuestion.interactionType==='speech') {
        const input = $('#fluentia-speech-transcript');
        answer = input ? input.value.trim() : '';
        if (!answer) { input?.focus(); return; }
      } else {
        const input = $('#fluentia-answer');
        answer = input ? input.value.trim() : '';
        if (!answer) { if(input) input.focus(); return; }
        if (currentQuestion.interactionType==='ordering') answer=answer.split(/\\s*>\\s*/).map(value=>value.trim()).filter(Boolean);
      }
    }
    try {
      stopSpeechRecognition();
      lastEvent = engine.submitAnswer(currentSession,answer);
      answered = true;
      const feedback = lastEvent.feedback || {};
      const explain = translated && feedback.explanationAr ? feedback.explanationAr : feedback.explanation;
      const correctAnswer = feedback.correctAnswer;
      const host = $('#fluentia-feedback');
      if (host) host.innerHTML = '<div class="fluentia-feedback '+(lastEvent.correct?'':'is-wrong')+'"><strong>'+(lastEvent.correct?'Correct — well done.':'Good attempt. Let’s learn from it.')+'</strong>'+(explain?'<p>'+esc(explain)+'</p>':'')+(correctAnswer&&!lastEvent.correct?'<p><b>Answer:</b> '+esc(Array.isArray(correctAnswer)?correctAnswer.join(' · '):(correctAnswer&&typeof correctAnswer==='object'?Object.values(correctAnswer).join(' — '):correctAnswer))+'</p>':'')+(feedback.explanationAr?'<button type="button" class="btn btn-ghost fluentia-translation" data-translate>'+ (translated?'Show English':'عرض المساعدة بالعربية')+'</button>':'')+'</div>';
      root.querySelectorAll('[data-answer-index],#fluentia-answer,#fluentia-match-meaning,#fluentia-speech-transcript,[data-submit],[data-speech-start],[data-speech-stop]').forEach(el=>el.disabled=true);
      const next = $('[data-next]'); if(next) next.hidden=false;
      const actions = $('.fluentia-session-actions'); if(actions){const note=document.createElement('span');note.className='fluentia-question-prompt';note.textContent=lastEvent.correct?'✓':'↻';actions.prepend(note);}
    } catch (error) { const host=$('#fluentia-feedback'); if(host)host.textContent=error.message||'Could not check this answer.'; }
  }
  function renderLoading() {
    root.innerHTML = '<div class="fluentia-empty" role="status">Preparing your practice activities…</div>';
  }
  function renderLoadError(message) {
    root.innerHTML = '<div class="fluentia-empty" role="alert"><b>Fluentia could not prepare its activities.</b><p>'+esc(message||'Check your connection, then try again.')+'</p><button type="button" class="btn" data-fluentia-retry>Try again</button></div>';
  }
  function startSpeechRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const status = $('#fluentia-speech-status');
    const start = $('[data-speech-start]'), stop = $('[data-speech-stop]');
    if (!Recognition || window.isSecureContext === false) {
      if (status) status.textContent = 'Speech recognition is unavailable here. Type the words you said into the transcript instead.';
      if (start) start.disabled = true;
      return;
    }
    stopSpeechRecognition();
    speechErrorMessage = '';
    try {
      const recognition = new Recognition();
      speechRecognition = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      speechListening = true;
      if (start) start.disabled = true;
      if (stop) stop.disabled = false;
      if (status) status.textContent = 'Listening… repeat the sentence now.';
      recognition.onresult = event => {
        if (speechRecognition !== recognition) return;
        const transcript = Array.from(event.results || []).map(result => result[0]?.transcript || '').join(' ').trim();
        const input = $('#fluentia-speech-transcript');
        if (input) input.value = transcript;
      };
      recognition.onerror = event => {
        if (speechRecognition !== recognition) return;
        const reason = event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Microphone permission was denied. Allow microphone access in your browser settings, then try again.'
          : event.error === 'audio-capture'
            ? 'No microphone was found. Connect or enable a microphone, then try again.'
            : event.error === 'no-speech'
              ? 'No speech was detected. Try again and speak a little closer to your microphone.'
              : 'Speech recognition failed ('+String(event.error||'unknown')+'). You can type your transcript instead.';
        speechErrorMessage = reason;
        if (status) status.textContent = reason;
      };
      recognition.onend = () => {
        if (speechRecognition !== recognition) return;
        speechRecognition = null;
        speechListening = false;
        if (start) start.disabled = answered;
        if (stop) stop.disabled = true;
        if (status && root.contains(status)) status.textContent = speechErrorMessage || ($('#fluentia-speech-transcript')?.value.trim()
          ? 'Speech captured. Check the recognised words, edit them if needed, then submit.'
          : 'No words were captured. Try again or type your transcript.');
      };
      recognition.start();
    } catch (error) {
      speechListening = false;
      speechRecognition = null;
      if (start) start.disabled = false;
      if (stop) stop.disabled = true;
      if (status) status.textContent = 'The microphone could not start. Check browser permissions and try again.';
    }
  }
  function stopSpeechRecognition() {
    const active = speechRecognition;
    speechRecognition = null;
    speechListening = false;
    if (active) {
      active.onresult = null;
      active.onerror = null;
      active.onend = null;
      try { active.abort(); } catch {}
    }
    const start = $('[data-speech-start]'), stop = $('[data-speech-stop]');
    if (start && currentQuestion?.interactionType === 'speech' && !answered) start.disabled = false;
    if (stop) stop.disabled = true;
  }
  function renderSummary() {
    const total=currentSession.completedCount,correct=currentSession.correctCount,percent=total?Math.round(correct/total*100):0;
    const byDomain={};currentSession.answers.forEach(answer=>byDomain[answer.domain]=(byDomain[answer.domain]||0)+1);
    root.innerHTML='<div class="fluentia-summary"><p class="kicker">SESSION COMPLETE</p><h2>'+esc(currentModeLabel)+'</h2><div class="fluentia-summary-score">'+percent+'%</div><p>'+correct+' correct out of '+total+' questions.</p><div class="fluentia-summary-stats"><div><b>'+total+'</b><span>Questions</span></div><div><b>'+correct+'</b><span>Correct</span></div><div><b>'+Object.keys(byDomain).length+'</b><span>Domains</span></div></div><div class="fluentia-review-source">Your answers have been added to Fluentia practice history. This session does not add legacy Arcade XP or duplicate legacy rewards.</div><div class="fluentia-session-actions"><button type="button" class="btn" data-restart>Practise again</button><button type="button" class="btn btn-ghost" data-back>Back to Fluentia</button></div></div>';
  }
  function leaveSession({ render = true } = {}) {
    stopSpeechRecognition();
    if (currentSession && !['completed','abandoned'].includes(currentSession.status)) {
      try { engine.abandonSession(currentSession); } catch {}
    }
    currentSession=null;currentQuestion=null;answered=false;lastEvent=null;translated=false;
    currentMode='';currentModeLabel='';currentDomain=null;choosingSectionMixed=false;
    if (render) renderHome();
  }
  function handleClick(event) {
    if(event.target.closest('[data-fluentia-retry]')){
      renderLoading();
      window.EPIPHANY_LAZY_LOAD('fluentia').then(()=>renderHome()).catch(error=>renderLoadError(error.message));
      return;
    }
    if(event.target.closest('[data-speech-start]')){startSpeechRecognition();return;}
    if(event.target.closest('[data-speech-stop]')){if(speechRecognition){try{speechRecognition.stop();}catch{stopSpeechRecognition();}}else stopSpeechRecognition();const status=$('#fluentia-speech-status');if(status)status.textContent='Stopping microphone…';return;}
    const domain=event.target.closest('[data-domain]');
    if(domain){if(choosingSectionMixed){choosingSectionMixed=false;startSession('section-mixed',{domain:domain.dataset.domain});}else renderDomain(domain.dataset.domain);return;}
    if(event.target.closest('[data-back]')){leaveSession();return;}
    if(event.target.closest('[data-exit]')){leaveSession();return;}
    const mode=event.target.closest('[data-mode]');
    if(mode){if(mode.dataset.mode==='section-mixed'){if(currentDomain){startSession('section-mixed',{domain:currentDomain});return;}choosingSectionMixed=true;root.innerHTML='<button type="button" class="fluentia-back" data-back>← All Fluentia</button><div class="fluentia-section-heading"><div><h2>Choose a domain for Section Mixed</h2><p>Your session will stay within that domain.</p></div></div><div class="fluentia-domain-grid">'+domainDefs.map(domain=>domainMarkup(domain,activities.filter(a=>a.domain===domain.id&&!a.reviewOnly&&a.items.length).length)).join('')+'</div>';return;}startSession('fluentia-mix');return;}
    const activity=event.target.closest('[data-activity]');
    if(activity){startSession('single',{activityId:activity.dataset.activity,label:activityNames[activity.dataset.activity]||'Practice'});return;}
    const answer=event.target.closest('[data-answer-index]');
    if(answer){const index=Number(answer.dataset.answerIndex);submit(currentQuestion?.activityId==='soundscape-sound-picture-match'?answer.dataset.answerValue||answer.querySelector('span:last-child')?.textContent||'':index);return;}
    if(event.target.closest('[data-submit]')){submit();return;}
    if(event.target.closest('[data-next]')){nextQuestion();return;}
    if(event.target.closest('[data-translate]')){translated=!translated;const feedback=lastEvent?.feedback||{};const host=$('#fluentia-feedback');if(host){const explain=translated?feedback.explanationAr:feedback.explanation;host.querySelector('p')?.replaceChildren(document.createTextNode(explain||''));const button=host.querySelector('[data-translate]');if(button)button.textContent=translated?'Show English':'عرض المساعدة بالعربية';}return;}
    if(event.target.closest('[data-restart]')){const mode=currentMode,domain=currentSession?.domain,activityId=currentSession?.activityIds?.[0];currentSession=null;if(mode==='single')startSession(mode,{activityId,label:currentModeLabel});else if(mode==='section-mixed')startSession(mode,{domain});else startSession(mode);return;}
    const speak=event.target.closest('[data-fluentia-speak]');if(speak){window.EpiphanySpeech?.speak(speak.dataset.fluentiaSpeak);return;}
  }
  root.addEventListener('click',handleClick);
  root.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='fluentia-answer'){event.preventDefault();submit();}});
  document.addEventListener('click',event=>{
    const nav=event.target.closest('.tab[data-view="fluentia"]');
    if(nav){leaveSession({render:false});selectedLevel=currentLevel();renderLoading();}
  },true);
  document.addEventListener('epiphany:view-changed',event=>{
    if(event.detail?.view!=='fluentia')leaveSession({render:false});
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stopSpeechRecognition();
  });
  document.addEventListener('epiphany:fluentia-sources-ready',()=>{
    if(root.closest('.view')?.classList.contains('is-active')){selectedLevel=currentLevel();renderHome();}
  });
  document.addEventListener('epiphany:fluentia-sources-failed',event=>{
    if(root.closest('.view')?.classList.contains('is-active'))renderLoadError(event.detail?.message);
  });
  window.addEventListener('epiphany:progress-saved',()=>{if(root.closest('.view')?.classList.contains('is-active')&&!currentSession){selectedLevel=currentLevel();renderHome();}});
  selectedLevel=currentLevel();
  renderHome();
})();