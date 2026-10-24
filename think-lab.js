/* EPIPHANY THINK LAB — reasoning-first English challenges */
(() => {
  'use strict';
  const root = document.getElementById('think-lab-content');
  if (!root) return;
  const rounds = {
    odd: [
      {prompt:'Which word does not belong?', why:'Find the shared category.', words:['violin','piano','drums','carrot'], answer:3, explain:'Violin, piano and drums are musical instruments. A carrot is a vegetable.'},
      {prompt:'Which word does not belong?', why:'Think about movement.', words:['walk','stroll','wander','whisper'], answer:3, explain:'Walk, stroll and wander describe ways of moving. Whisper describes speaking quietly.'},
      {prompt:'Which word does not belong?', why:'Look for the relationship.', words:['tiny','small','enormous','little'], answer:2, explain:'Tiny, small and little mean nearly the same thing. Enormous means very large.'}
    ],
    translator: [
      {ar:'أنا جائع جدًا.', prompt:'Choose the most natural English sentence.', options:['I have a big hunger.','I’m very hungry.','I am hunger very.'], answer:1, explain:'“I’m very hungry” is the natural everyday expression. Word-for-word translation often sounds unnatural.'},
      {ar:'هل يمكنك مساعدتي؟', prompt:'Choose the most natural English sentence.', options:['Can you help me?','You can helping me?','Can you to help me?'], answer:0, explain:'Use “Can you + base verb” to make this polite, natural request.'},
      {ar:'لم أره منذ يومين.', prompt:'Choose the most natural English sentence.', options:['I didn’t see him since two days.','I haven’t seen him for two days.','I not saw him two days.'], answer:1, explain:'“I haven’t seen him for two days” connects a past event to the present. “For” gives the duration.'}
    ],
    detective: [
      {title:'The missing umbrella', clues:['The pavement outside is wet.','Sam’s coat is dry.','A dripping umbrella is beside the door.'], question:'What is the most likely explanation?', options:['Sam came in with an umbrella.','Sam went swimming.','The umbrella is brand new.'], answer:0, explain:'The wet pavement and dripping umbrella support the first explanation. It is the best-supported conclusion, not absolute proof.'},
      {title:'The untouched lunch', clues:['Maya’s lunch is still in her bag.','She says she is starving.','The lunch break ended ten minutes ago.'], question:'What most likely happened?', options:['She forgot to bring food.','She did not get a chance to eat.','She already ate her lunch.'], answer:1, explain:'Her lunch is still in the bag and she is hungry, so she probably did not get a chance to eat.'},
      {title:'The quiet library', clues:['A sign says “Study in progress”.','Everyone is speaking softly.','A phone starts ringing loudly.'], question:'What should happen next?', options:['Turn the volume up.','Ignore the sign.','Silence the phone.'], answer:2, explain:'The clues show that quiet is expected, so silencing the phone best fits the situation.'}
    ]
  };
  let mode = null, index = 0, score = 0, locked = false, clueCount = 0;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const games = [
    {id:'odd',num:'01',icon:'◈',name:'Odd One Out',tag:'PATTERN RECOGNITION',desc:'Spot the outsider, then explain the relationship that connects the others.',time:'2–3 min'},
    {id:'detective',num:'02',icon:'⌕',name:'The Language Detective',tag:'CLUES & INFERENCE',desc:'Read the evidence, connect the clues and choose the best-supported conclusion.',time:'3–4 min'},
    {id:'translator',num:'03',icon:'⇄',name:'The Bold Translator',tag:'NATURAL ENGLISH',desc:'Choose the sentence a real speaker would use—not a word-for-word translation.',time:'2–3 min'}
  ];
  function landing() {
    mode = null;
    root.innerHTML = '<div class="tl-mission"><div><span class="tl-eyebrow"><i></i> THINKING MODE · ENGLISH INSIDE</span><h2>Don’t just play.<br><em>Figure it out.</em></h2><p>Every challenge is a small case to solve. Notice patterns, connect evidence and discover why one answer fits better than another.</p><div class="tl-mission-meta"><span>⌁ Logic</span><span>◉ Context</span><span>⇄ Expression</span></div></div><div class="tl-orbit" aria-hidden="true"><span class="tl-orbit-core">EP<span>·</span></span><i class="tl-node tl-node-a">?</i><i class="tl-node tl-node-b">A≠B</i><i class="tl-node tl-node-c">∴</i><i class="tl-link tl-link-a"></i><i class="tl-link tl-link-b"></i></div></div><div class="tl-daily"><div><span class="tl-eyebrow">YOUR FIRST CASE</span><h3>Three ways to think in English</h3><p>Choose a challenge. You’ll get feedback that explains the reasoning, not just a green tick.</p></div><span class="tl-case-stamp">CASE FILE<br><b>001—003</b></span></div><div class="tl-cases">'+games.map(g=>'<button type="button" class="tl-case" data-think-game="'+g.id+'"><span class="tl-case-top"><span class="tl-case-number">'+g.num+' / CASE</span><span class="tl-case-icon">'+g.icon+'</span></span><span class="tl-case-tag">'+g.tag+'</span><strong>'+g.name+'</strong><span class="tl-case-desc">'+g.desc+'</span><span class="tl-case-bottom"><span>'+g.time+'</span><b>Open case ↗</b></span></button>').join('')+'</div><p class="tl-footer-note"><span>✳</span> No guessing blindly. Every answer comes with a reason.</p>';
  }
  function renderGame() {
    const pool = rounds[mode];
    const item = pool[index % pool.length];
    locked = false;
    let intro = '';
    if (mode === 'odd') intro = '<div class="tl-word-options">'+item.words.map((w,i)=>'<button type="button" class="tl-option tl-word-option" data-think-answer="'+i+'"><span class="tl-option-index">0'+(i+1)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'translator') intro = '<div class="tl-translation-prompt" lang="ar" dir="rtl">'+esc(item.ar)+'</div><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    if (mode === 'detective') intro = '<div class="tl-clue-list">'+item.clues.slice(0,clueCount+1).map((c,i)=>'<div class="tl-clue"><span>CLUE 0'+(i+1)+'</span><p>'+esc(c)+'</p></div>').join('')+'</div><div class="tl-reveal-row">'+(clueCount<item.clues.length-1?'<button class="tl-secondary" type="button" data-think-clue>Reveal next clue +</button>':'<span class="tl-all-clues">All evidence revealed</span>')+'</div><h3 class="tl-question">'+item.question+'</h3><div class="tl-answer-options">'+item.options.map((w,i)=>'<button type="button" class="tl-option" data-think-answer="'+i+'"><span class="tl-option-index">'+String.fromCharCode(65+i)+'</span><strong>'+esc(w)+'</strong></button>').join('')+'</div>';
    root.innerHTML = '<div class="tl-game-head"><button class="tl-back" type="button" data-think-back>← All cases</button><span class="tl-eyebrow">CASE '+String(index+1).padStart(2,'0')+' / '+pool.length+'</span><span class="tl-score">SOLVED <b>'+score+'</b></span></div><div class="tl-game-card"><div class="tl-game-kicker">'+(mode==='odd'?'PATTERN ANALYSIS':mode==='detective'?'EVIDENCE BOARD':'NATURAL EXPRESSION')+'</div><h2>'+esc(mode==='detective'?item.title:item.prompt)+'</h2><p class="tl-game-instruction">'+esc(mode==='odd'?item.why:mode==='translator'?'Read the Arabic sentence, then choose the natural English equivalent.':'Reveal the clues and select the conclusion they support.')+'</p>'+intro+'<div class="tl-feedback" id="tl-feedback" aria-live="polite" hidden></div><div class="tl-game-actions"><span>ROUND '+(index+1)+' OF '+pool.length+'</span><button class="tl-next" type="button" data-think-next hidden>Next round →</button></div></div>';
  }
  function start(id) { mode=id; index=0; score=0; clueCount=0; renderGame(); }
  root.addEventListener('click', e => {
    const launch=e.target.closest('[data-think-game]'); if(launch){start(launch.dataset.thinkGame);return;}
    if(e.target.closest('[data-think-back]')){landing();return;}
    if(e.target.closest('[data-think-clue]')){clueCount=Math.min(rounds.detective[index%rounds.detective.length].clues.length-1,clueCount+1);renderGame();return;}
    if(e.target.closest('[data-think-next]')){index++;clueCount=0;if(index>=rounds[mode].length){const finished=mode;root.innerHTML='<div class="tl-finish"><span class="tl-finish-mark">∴</span><span class="tl-eyebrow">CASE FILE CLOSED</span><h2>Good thinking.</h2><p>You solved <b>'+score+' of '+rounds[finished].length+'</b> challenges. The goal is not only to get it right—it’s to understand why.</p><button type="button" class="tl-next" data-think-restart>Try another case ↗</button><button type="button" class="tl-back" data-think-back>Back to Think Lab</button></div>';mode=null;}else renderGame();return;}
    if(e.target.closest('[data-think-restart]')){landing();return;}
    const answer=e.target.closest('[data-think-answer]'); if(!answer||locked||!mode)return;
    locked=true;const item=rounds[mode][index%rounds[mode].length],chosen=Number(answer.dataset.thinkAnswer),correct=chosen===item.answer;if(correct)score++;
    root.querySelectorAll('[data-think-answer]').forEach(b=>{b.disabled=true;const n=Number(b.dataset.thinkAnswer);if(n===item.answer)b.classList.add('is-correct');if(n===chosen&&!correct)b.classList.add('is-wrong');});
    const fb=root.querySelector('#tl-feedback');fb.hidden=false;fb.className='tl-feedback '+(correct?'is-correct':'is-wrong');fb.innerHTML='<strong>'+(correct?'✓ Well reasoned.':'↗ Look at the clues again.')+'</strong><p>'+esc(item.explain)+'</p>';
    const next=root.querySelector('[data-think-next]');if(next)next.hidden=false;
  });
  landing();
})();