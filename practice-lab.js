(() => {
  'use strict';
  const STORE = 'epiphany-practice-lab-v1';
  const samples = [
    {level:'A1', text:'I would like a glass of water, please.'},
    {level:'A1', text:'Could you help me find the train station?'},
    {level:'A2', text:'I usually practise English for ten minutes every day.'},
    {level:'A2', text:'The weather was sunny, so we walked to the park.'},
    {level:'B1', text:'Although I was nervous, I introduced myself to the group.'},
    {level:'B1', text:'I have been learning English because I want to travel.'},
    {level:'B2', text:'If I had more time, I would listen to a different accent each week.'},
    {level:'B2', text:'The most useful way to improve is to practise a little and often.'}
  ];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value || '').toLowerCase().normalize('NFC').replace(/[’']/g, '').replace(/[^\\p{L}\\p{N}\\s]/gu, ' ').replace(/\\s+/g, ' ').trim();
  let data = {speakingAttempts:0, speakingBest:0, dictationAttempts:0, dictationBest:0, completed:0};
  try { data = {...data, ...JSON.parse(localStorage.getItem(STORE) || '{}')}; } catch {}
  let sampleIndex = Math.floor(Math.random() * samples.length);
  let currentMode = 'speaking';
  let recognition = null;
  let listening = false;
  let lastTranscript = '';
  const voiceLocale = {gb:'en-GB', us:'en-US', au:'en-AU'};
  const phrase = () => samples[sampleIndex];
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch {} };
  const pickNext = () => { const old = sampleIndex; const filter=document.querySelector('#pl-level-filter')?.value||'all'; const choices=samples.map((item,i)=>({...item,i})).filter(item=>filter==='all'||item.level===filter); if(choices.length>1){let next=old;while(next===old){next=choices[Math.floor(Math.random()*choices.length)].i;}sampleIndex=next;}else if(choices.length)sampleIndex=choices[0].i;lastTranscript='';renderPhrase();};
  const scoreWords = (expected, actual) => {
    const target = norm(expected).split(' ').filter(Boolean);
    const said = norm(actual).split(' ').filter(Boolean);
    let cursor = 0;
    return target.map(word => {
      const foundAt = said.indexOf(word, cursor);
      if (foundAt >= cursor) { cursor = foundAt + 1; return {word, ok:true}; }
      return {word, ok:false};
    });
  };
  const wordMarkup = (expected, actual) => scoreWords(expected, actual).map(item => '<span class="pl-word '+(item.ok?'is-match':'is-missing')+'">'+esc(item.word)+'</span>').join(' ');
  const voicesFor = locale => {
    if (!('speechSynthesis' in window)) return [];
    const voices = speechSynthesis.getVoices();
    return voices.filter(v => v.lang.toLowerCase() === locale.toLowerCase());
  };
  const speak = (text, rate) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      status('pl-speaking-status', 'Speech playback is not supported in this browser.', 'error'); return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = voiceLocale[document.querySelector('#pl-accent')?.value || 'gb'];
    utterance.lang = locale;
    utterance.rate = rate;
    const voices = voicesFor(locale);
    if (voices.length) utterance.voice = voices[0];
    utterance.onerror = () => status('pl-speaking-status', 'Could not play audio. Try another voice or browser.', 'error');
    speechSynthesis.speak(utterance);
  };
  const status = (id, message, kind='') => {
    const el = document.getElementById(id); if (!el) return;
    el.textContent = message; el.className = 'pl-status' + (kind ? ' is-'+kind : '');
  };
  const renderPhrase = () => {
    const target = document.querySelector('#pl-target'); if (target) target.textContent = phrase().text;
    const level = document.querySelector('#pl-level'); if (level) level.textContent = phrase().level;
    const transcript = document.querySelector('#pl-transcript'); if (transcript) transcript.value = lastTranscript;
    const comparison = document.querySelector('#pl-word-comparison'); if (comparison) comparison.innerHTML = '';
    const feedback = document.querySelector('#pl-speaking-status'); if (feedback) { feedback.textContent = 'Listen first, then repeat the sentence.'; feedback.className='pl-status'; }
    const dictation = document.querySelector('#pl-dictation-answer'); if (dictation) dictation.value='';
    const dictationResult = document.querySelector('#pl-dictation-result'); if (dictationResult) dictationResult.innerHTML='';
    const dictationStatus = document.querySelector('#pl-dictation-status'); if (dictationStatus) {dictationStatus.textContent='Play the sentence, then type what you hear.';dictationStatus.className='pl-status';}
    updateStats();
  };
  const updateStats = () => {
    const el=document.querySelector('#pl-stats'); if(el) el.innerHTML='<span><strong>'+data.speakingAttempts+'</strong> speaking tries</span><span><strong>'+data.dictationAttempts+'</strong> dictation tries</span><span><strong>'+data.completed+'</strong> exact matches</span>';
  };
  const mount = () => {
    const page = document.querySelector('#arcade-view .arcade-page');
    if (!page || document.querySelector('#practice-lab')) return;
    const section = document.createElement('section');
    section.className='block practice-lab'; section.id='practice-lab';
    section.innerHTML = '<div class="block-head"><div><p class="kicker">NEW · SPEAK · LISTEN · REPEAT</p><h2>Speaking & listening lab</h2><p>Practise aloud, compare the words you said, and train your ear with short dictations.</p></div></div>'+
      '<div class="pl-stats" id="pl-stats" aria-live="polite"></div>'+
      '<div class="pl-controls"><label>Voice accent<select id="pl-accent"><option value="gb">British English</option><option value="us">American English</option><option value="au">Australian English</option></select></label><label>Practice level<select id="pl-level-filter"><option value="all">All levels</option><option>A1</option><option>A2</option><option>B1</option><option>B2</option></select></label></div>'+
      '<div class="pl-mode-tabs" role="tablist" aria-label="Practice mode"><button type="button" class="is-active" data-pl-mode="speaking" role="tab" aria-selected="true">🎙 Speaking & shadowing</button><button type="button" data-pl-mode="dictation" role="tab" aria-selected="false">✍ Dictation</button></div>'+
      '<div class="pl-card" id="pl-speaking-panel"><div class="pl-phrase-meta"><span class="pl-level" id="pl-level">A1</span><span>Listen, then repeat aloud</span></div><p class="pl-target" id="pl-target"></p><div class="pl-actions"><button type="button" class="btn" data-pl-action="listen">▶ Listen</button><button type="button" class="btn btn-ghost" data-pl-action="slow">🐢 Slow audio</button><button type="button" class="btn btn-ghost" data-pl-action="next">New sentence</button></div><div class="pl-actions"><button type="button" class="btn" data-pl-action="record">🎙 Start speaking</button><button type="button" class="btn btn-ghost" data-pl-action="stop" disabled>Stop</button></div><p class="pl-small-note">Your browser turns speech into text. This checks recognised words, not the exact quality of your pronunciation.</p><label for="pl-transcript">Recognised speech (you can edit it)</label><textarea id="pl-transcript" rows="3" placeholder="Your recognised words will appear here…"></textarea><div class="pl-actions"><button type="button" class="btn" data-pl-action="compare">Compare words</button></div><div id="pl-word-comparison" class="pl-word-comparison" aria-live="polite"></div><p id="pl-speaking-status" class="pl-status" aria-live="polite">Listen first, then repeat the sentence.</p><p class="pl-legend"><span class="pl-word is-match">Green = recognised</span><span class="pl-word is-missing">Red = missing / different</span></p></div>'+
      '<div class="pl-card" id="pl-dictation-panel" hidden><div class="pl-phrase-meta"><span class="pl-level" id="pl-dictation-level">Listen</span><span>Type what you hear</span></div><p class="pl-target">Listen carefully. The sentence stays hidden until you check your answer.</p><div class="pl-actions"><button type="button" class="btn" data-pl-action="dictation-listen">▶ Normal speed</button><button type="button" class="btn btn-ghost" data-pl-action="dictation-slow">🐢 Slow speed</button><button type="button" class="btn btn-ghost" data-pl-action="dictation-new">New sentence</button></div><label for="pl-dictation-answer">Your answer</label><textarea id="pl-dictation-answer" rows="3" placeholder="Write the sentence you heard…"></textarea><div class="pl-actions"><button type="button" class="btn" data-pl-action="check-dictation">Check answer</button></div><div id="pl-dictation-result" class="pl-dictation-result" aria-live="polite"></div><p id="pl-dictation-status" class="pl-status" aria-live="polite">Play the sentence, then type what you hear.</p></div>';
    page.insertBefore(section, page.querySelector('.foot-note'));
    section.addEventListener('click', handleClick);
    section.addEventListener('change', event => {
      if (event.target.id==='pl-level-filter') {
        const options=samples.map((s,i)=>({...s,i})).filter(s=>event.target.value==='all'||s.level===event.target.value);
        if(options.length) sampleIndex=options[Math.floor(Math.random()*options.length)].i;
        renderPhrase();
      }
    });
    renderPhrase();
  };
  const setMode = mode => {
    currentMode=mode;
    document.querySelectorAll('[data-pl-mode]').forEach(btn=>{const active=btn.dataset.plMode===mode;btn.classList.toggle('is-active',active);btn.setAttribute('aria-selected',String(active));});
    document.querySelector('#pl-speaking-panel').hidden=mode!=='speaking';
    document.querySelector('#pl-dictation-panel').hidden=mode!=='dictation';
  };
  const handleClick = event => {
    const modeButton=event.target.closest('[data-pl-mode]');
    if(modeButton){setMode(modeButton.dataset.plMode);return;}
    const button=event.target.closest('[data-pl-action]'); if(!button)return;
    const action=button.dataset.plAction;
    if(action==='listen'){speak(phrase().text,1);return;}
    if(action==='slow'){speak(phrase().text,.72);return;}
    if(action==='next'||action==='dictation-new'){pickNext();return;}
    if(action==='dictation-listen'){speak(phrase().text,1);return;}
    if(action==='dictation-slow'){speak(phrase().text,.68);return;}
    if(action==='record'){
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){status('pl-speaking-status','Speech recognition is not available in this browser. Try a supported version of Chrome.','error');return;}
      try{
        if(recognition){recognition.abort();recognition=null;}
        recognition=new SR();recognition.lang=voiceLocale[document.querySelector('#pl-accent').value];recognition.interimResults=true;recognition.continuous=false;
        listening=true;button.disabled=true;const stopButton=document.querySelector('[data-pl-action="stop"]');if(stopButton)stopButton.disabled=false;
        status('pl-speaking-status','Listening… say the sentence now.');
        recognition.onresult=e=>{lastTranscript=Array.from(e.results).map(r=>r[0].transcript).join(' ');const input=document.querySelector('#pl-transcript');if(input)input.value=lastTranscript;};
        recognition.onerror=e=>status('pl-speaking-status',e.error==='not-allowed'?'Microphone permission was denied. Allow microphone access and try again.':'Speech recognition error: '+e.error,'error');
        recognition.onend=()=>{listening=false;button.disabled=false;if(stopButton)stopButton.disabled=true;if(lastTranscript){status('pl-speaking-status','Speech captured. Compare the recognised words below.');compareSpeaking();}else if(listening===false){}};
        recognition.start();
      }catch(error){listening=false;button.disabled=false;status('pl-speaking-status','Could not start the microphone. Check permissions and try again.','error');}
      return;
    }
    if(action==='stop'){if(recognition){recognition.stop();}return;}
    if(action==='compare'){compareSpeaking();return;}
    if(action==='check-dictation'){
      const typed=document.querySelector('#pl-dictation-answer').value;
      if(!typed.trim()){status('pl-dictation-status','Type what you heard before checking.','error');return;}
      const target=norm(phrase().text),answer=norm(typed);
      const targetChars=Array.from(target),answerChars=Array.from(answer);let html='',matches=0;
      const max=Math.max(targetChars.length,answerChars.length);
      for(let i=0;i<max;i++){const a=answerChars[i]||'';if(a===targetChars[i]){html+='<span class="pl-char is-correct">'+esc(a||' ')+'</span>';if(a)matches++;}else if(a){html+='<span class="pl-char is-wrong">'+esc(a)+'</span>';}else{html+='<span class="pl-char is-missing">_</span>';}}
      const percent=Math.round(matches/Math.max(1,targetChars.length)*100);
      document.querySelector('#pl-dictation-result').innerHTML='<p><strong>'+percent+'% character match</strong></p><div class="pl-char-line">'+html+'</div><p class="pl-answer-key"><strong>Correct sentence:</strong> '+esc(phrase().text)+'</p>';
      data.dictationAttempts++;data.dictationBest=Math.max(data.dictationBest,percent);if(answer===target){data.completed++;status('pl-dictation-status','Excellent — exact match!','success');}else status('pl-dictation-status','Good effort. Listen again, then try once more.','error');
      save();updateStats();return;
    }
  };
  const compareSpeaking = () => {
    const input=document.querySelector('#pl-transcript');if(!input)return;
    lastTranscript=input.value;
    if(!lastTranscript.trim()){status('pl-speaking-status','No recognised words yet. Try speaking again or type the transcript.','error');return;}
    const items=scoreWords(phrase().text,lastTranscript);
    document.querySelector('#pl-word-comparison').innerHTML=wordMarkup(phrase().text,lastTranscript);
    const matched=items.filter(x=>x.ok).length,percent=Math.round(matched/Math.max(1,items.length)*100);
    data.speakingAttempts++;data.speakingBest=Math.max(data.speakingBest,percent);
    if(percent===100)data.completed++;
    status('pl-speaking-status',percent+'% of target words recognised. This is a word-match estimate, not a pronunciation score.',percent===100?'success':'');
    save();updateStats();
  };
  document.addEventListener('DOMContentLoaded',mount);
  if(document.readyState!=='loading')mount();
  if('speechSynthesis' in window)window.speechSynthesis.addEventListener?.('voiceschanged',()=>{});
})();