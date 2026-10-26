/* The Resonance — independent narrative and investigation state */
(() => {
  'use strict';
  const KEY = 'epiphany-resonance-v1';
  const root = () => document.getElementById('resonance-view');
  const initial = () => ({scene:'reception',phase:'arrival',dialogueIndex:0,inspected:[],evidence:[],choices:[],translation:false,updatedAt:Date.now()});
  let state = load();
  const copy = {
    arrival:{en:'The room was quiet, except for the faint hiss of the old receiver.',ar:'كانت الغرفة هادئة، باستثناء هسيس خافت يصدر عن جهاز الاستقبال القديم.'},
    receiver:{en:'The receiver is cold to the touch. A narrow indicator glows, though the main network is listed as offline.',ar:'جهاز الاستقبال بارد عند لمسه. يضيء مؤشر صغير رغم أن الشبكة الرئيسية مسجلة على أنها غير متصلة.'},
    message:{en:'If you can read this, don’t trust the record. Find what was left unsaid.',ar:'إذا كنت تستطيع قراءة هذه الرسالة، فلا تثق بالسجل. ابحث عمّا لم يُقَل.'},
    found:{en:'A message has been preserved in the receiver log. Its arrival is recorded at 21:14. That does not tell you when it was created, who sent it, or how it reached this room.',ar:'حُفظت رسالة في سجل جهاز الاستقبال، وسُجّل وصولها عند 21:14. لكن ذلك لا يخبرك متى كُتبت أو من أرسلها أو كيف وصلت إلى هذه الغرفة.'},
    wayfinder:{en:'You received it, didn’t you?',ar:'لقد استقبلتها، أليس كذلك؟'},
    response1:{en:'Because that receiver has been silent for years. I came back when I heard the hiss.',ar:'لأن جهاز الاستقبال هذا ظل صامتًا لسنوات. عدت عندما سمعت الهسيس.'},
    response2:{en:'That isn’t the same as saying they’re all false. A record can be incomplete without every line being a lie.',ar:'هذا لا يعني أن السجلات كلها كاذبة. فقد يكون السجل ناقصًا دون أن تكون كل سطوره أكاذيب.'},
    response3:{en:'I know parts of what happened here. I don’t know who sent the message. We need to separate what we saw from what we suspect.',ar:'أعرف أجزاءً مما حدث هنا، لكنني لا أعرف من أرسل الرسالة. علينا أن نفصل بين ما رأيناه وما نشتبه فيه.'}
  };
  function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');return raw&&typeof raw==='object'?{...initial(),...raw,inspected:Array.isArray(raw.inspected)?raw.inspected:[],evidence:Array.isArray(raw.evidence)?raw.evidence:[],choices:Array.isArray(raw.choices)?raw.choices:[]}:initial();}catch{return initial();}}
  function save(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function text(key){const item=copy[key]||{en:'',ar:''};return state.translation&&item.ar?item.ar:item.en;}
  function isKnown(id){return state.evidence.includes(id);}
  function addEvidence(id){if(!isKnown(id)){state.evidence.push(id);save();}}
  function render(){
    const host=root();if(!host)return;
    const phase=state.phase;
    const isDialogue=phase==='wayfinder'||phase==='wayfinder-response';
    const narrationKey=phase==='arrival'?'arrival':phase==='receiver'?'receiver':phase==='message'?'message':phase==='evidence-found'?'found':phase==='wayfinder'?'wayfinder':phase==='wayfinder-response'?(state.choices[state.choices.length-1]==='record'?'response2':state.choices[state.choices.length-1]==='receiver'?'response1':'response3'):'arrival';
    const canInspect=phase==='arrival'||phase==='receiver';
    const known=isKnown('E-01');
    host.innerHTML='<div class="res-shell"><header class="res-topbar"><div class="res-brand">THE RESONANCE<small>A story of truths and silences</small></div><div class="res-actions"><button class="res-btn" data-res-action="journal">▤ Evidence journal <span>'+state.evidence.length+'</span></button><button class="res-btn" data-res-action="translation">'+(state.translation?'العربية ✓':'العربية')+'</button><button class="res-btn" data-res-action="menu">⟵ Exit story</button></div></header><div class="res-intro"><p class="res-kicker">CHAPTER 01 · THE MISSING MESSAGE</p><h1>The room remembers.</h1><p>Investigate what remains. Keep evidence, interpretations, and unanswered questions separate.</p></div><section class="res-stage" aria-label="Interactive visual novel scene"><div class="res-scene-art" aria-hidden="true"><div class="res-window"></div><div class="res-desk"></div><div class="res-lamp"></div><button class="res-radio" aria-label="Inspect the old receiver" data-res-action="receiver"></button><button class="res-paper" aria-label="Inspect the paper" data-res-action="message">A message<br>left unsaid</button></div>'+(canInspect?'<button class="res-hotspot radio" data-res-action="receiver">⌕ Inspect receiver</button><button class="res-hotspot note" data-res-action="message">⌕ Inspect note</button>':'')+(isDialogue?'<div class="res-wayfinder" aria-label="Wayfinder, standing in the doorway"><div class="res-wayfinder-halo"></div><div class="res-wayfinder-coat"></div><div class="res-wayfinder-head"><div class="res-wayfinder-face"></div></div><div class="res-wayfinder-caption">WAYFINDER <small>UNVERIFIED WITNESS</small></div></div>':'')+'<div class="res-narration" aria-live="polite"><span class="res-speaker">'+(isDialogue?'WAYFINDER':'THE INVESTIGATOR')+'</span><p>'+esc(text(narrationKey))+'</p>'+(phase==='evidence-found'?'<div class="res-progress"><span style="width:18%"></span></div>':'')+'</div></section><div class="res-understage"><section class="res-panel"><h2>'+(isDialogue?'Conversation':'What will you do?')+'</h2><p>'+(isDialogue?'Ask a question. A response can guide the investigation, but it is not proof by itself.':'Inspect the receiver and the note. The important clues are not hidden behind tiny hotspots.')+'</p><div class="res-choice-list">'+choicesMarkup(phase)+'</div></section><aside class="res-panel"><h2>Investigation journal</h2><p class="res-muted">Evidence is recorded once and remains available when you return.</p>'+(known?'<div class="res-evidence-item"><span class="res-evidence-id">E-01</span><div><strong>The Message</strong><small>Receiver log · Recorded arrival: 21:14</small></div></div>':'<p class="res-muted">No evidence recorded yet. Inspect the note to add E-01.</p>')+'<button class="res-btn" data-res-action="journal">Open full journal →</button><p class="res-muted">Progress saves automatically on this device.</p></aside></div></div><div class="res-overlay" id="res-journal" hidden><section class="res-dialog" role="dialog" aria-modal="true" aria-labelledby="res-journal-title"><div class="res-dialog-head"><h2 id="res-journal-title">Evidence journal</h2><button class="res-btn" data-res-action="close-journal" aria-label="Close journal">✕</button></div><p class="res-muted">Confirmed information is kept separate from interpretations and unresolved questions.</p>'+(known?'<article class="res-evidence-item"><span class="res-evidence-id">E-01</span><div><strong>The Message</strong><p>'+esc(text('message'))+'</p><p><b>Source:</b> Receiver log. <b>Recorded arrival:</b> 21:14.</p><p><b>Supports:</b> The receiver log records an arrival at 21:14.</p><p><b>Does not prove:</b> The message’s creation time, sender identity, or transmission route.</p><span class="res-tag">Recorded evidence</span></div></article>':'<p>No evidence discovered yet.</p>')+'<h3>Unresolved questions</h3><ul><li>Who sent the message?</li><li>How did it reach the receiver while the main network was offline?</li><li>Has the receiver clock been independently verified?</li></ul></section></div>';
  }
  function choicesMarkup(phase){
    if(phase==='arrival')return '<button class="res-choice" data-res-action="receiver">Inspect the old receiver →</button><button class="res-choice" data-res-action="message">Examine the paper on the desk →</button>';
    if(phase==='receiver')return '<button class="res-choice" data-res-action="message">Examine the paper on the desk →</button><button class="res-choice" data-res-action="continue">Look around the room →</button>';
    if(phase==='message')return '<button class="res-choice" data-res-action="record">Record the message in the journal →</button>';
    if(phase==='evidence-found')return '<button class="res-choice" data-res-action="meet">Someone is standing in the doorway →</button>';
    if(phase==='wayfinder')return '<button class="res-choice" data-res-choice="receiver">How do you know about the message?</button><button class="res-choice" data-res-choice="record">The message says not to trust the record.</button><button class="res-choice" data-res-choice="careful">What do you know—and what are you unsure of?</button>';
    if(phase==='wayfinder-response')return '<button class="res-choice" data-res-action="journal">Review the evidence before continuing →</button><button class="res-choice" data-res-action="continue">Continue the investigation →</button>';
    return '<button class="res-choice" data-res-action="continue">Continue →</button>';
  }
  function act(action){
    if(action==='journal'){const m=document.getElementById('res-journal');if(m)m.hidden=false;return;}
    if(action==='close-journal'){const m=document.getElementById('res-journal');if(m)m.hidden=true;return;}
    if(action==='translation'){state.translation=!state.translation;save();render();return;}
    if(action==='menu'){if(typeof window.openView==='function')window.openView('stories');else document.querySelector('[data-view="stories"]')?.click();return;}
    if(action==='receiver'){state.inspected.includes('receiver')||state.inspected.push('receiver');if(state.phase==='arrival')state.phase='receiver';save();render();return;}
    if(action==='message'){state.inspected.includes('message')||state.inspected.push('message');state.phase='message';save();render();return;}
    if(action==='record'){addEvidence('E-01');state.phase='evidence-found';save();render();return;}
    if(action==='meet'){state.phase='wayfinder';save();render();return;}
    if(action==='continue'){if(state.phase==='receiver')state.phase=isKnown('E-01')?'evidence-found':'arrival';else if(state.phase==='wayfinder-response')state.phase='evidence-found';else if(state.phase==='evidence-found')state.phase='wayfinder';else state.phase='arrival';save();render();return;}
    if(action==='careful'||action==='record'||action==='receiver'){state.choices.push(action);state.phase='wayfinder-response';save();render();}
  }
  function open(){state=load();render();}
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-res-action],[data-res-choice]');if(!el||!root()?.contains(el))return;
    e.preventDefault();if(el.dataset.resChoice){state.choices.push(el.dataset.resChoice);state.phase='wayfinder-response';save();render();return;}act(el.dataset.resAction);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=document.getElementById('res-journal');if(m&&!m.hidden)m.hidden=true;}});
  window.EPIPHANY_RESONANCE={open,reset(){state=initial();save();render();}};
})();