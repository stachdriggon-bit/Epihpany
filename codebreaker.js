/* EPIPHANY THINK LAB — Codebreaker cryptogram interaction layer. */
(() => {
  'use strict';
  const root=document.getElementById('think-lab-content');
  const bank=window.EPIPHANY_CODEBREAKER_BANK;
  if(!root||!bank)return;
  let level=null,index=0,mapping=Object.create(null),locked=new Set(),active='',feedback='',completed=false;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list=()=>level?(bank.puzzles[level]||[]):[];
  const puzzle=()=>list()[index]||null;
  const uniqueCipher=()=>[...new Set((puzzle()?.cipher||'').replace(/[^A-Z]/g,''))];
  const levelReady=id=>!!bank.levels[id]&&(bank.puzzles[id]||[]).length===bank.levels[id].count&&(bank.puzzles[id]||[]).every(p=>bank.validatePuzzle(p,id).valid);
  function seedPuzzle(){
    mapping=Object.create(null);locked=new Set();active='';feedback='';completed=false;
    for(const pair of puzzle().known){mapping[pair.cipher]=pair.plain;locked.add(pair.cipher);}
  }
  function renderLevels(){
    level=null;
    const status=bank.validateBank();
    root.innerHTML='<div class="cb-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-cb-home>← Think Lab home</button><span class="tl-eyebrow">CODEBREAKER</span></div><section class="cb-panel"><div class="cb-kicker">CRACK THE MESSAGE</div><h2>Choose your level</h2><p class="cb-intro">Each coded letter stands for one English letter. Use the clue and starter key to decode the hidden message. No timer and no penalty for experimenting.</p><div class="cb-level-grid">'+Object.entries(bank.levels).map(([id,cfg])=>'<button class="cb-level-card" type="button" data-cb-level="'+id+'"'+(levelReady(id)?'':' disabled')+'><span class="cb-level-count">'+cfg.count+' signals</span><strong>'+cfg.label+'</strong><span>'+(id==='easy'?'Single words':id==='medium'?'Short phrases':id==='hard'?'Full sentences':'Long messages')+'</span></button>').join('')+'</div>'+(status.valid?'':'<p class="cb-feedback" role="status">A level opens only when its complete message set passes validation.</p>')+'</section></div>';
  }
  function renderPuzzle(){
    const item=puzzle();if(!item)return renderLevels();
    const cfg=bank.levels[level],unique=uniqueCipher();
    const message=[...item.cipher].map(ch=>{
      if(!/[A-Z]/.test(ch))return '<span class="cb-gap" aria-hidden="true">'+(ch===' '?'&nbsp;':esc(ch))+'</span>';
      const value=mapping[ch]||'',selected=active===ch;
      return '<button type="button" class="cb-symbol'+(selected?' is-active':'')+(locked.has(ch)?' is-locked':'')+'" data-cb-symbol="'+ch+'" aria-label="Coded letter '+ch+(value?', decoded as '+value:'')+(locked.has(ch)?', starter key':'')+'"><span class="cb-coded">'+ch+'</span><strong>'+(value||'·')+'</strong></button>';
    }).join('');
    const key=unique.map(ch=>'<button type="button" class="cb-key-chip'+(active===ch?' is-active':'')+(locked.has(ch)?' is-locked':'')+'" data-cb-symbol="'+ch+'"><b>'+ch+'</b><span>'+(mapping[ch]||'—')+'</span></button>').join('');
    const alphabet=bank.letters.split('').map(ch=>{
      const used=Object.keys(mapping).some(code=>mapping[code]===ch&&code!==active);
      return '<button type="button" class="cb-letter-key" data-cb-plain="'+ch+'"'+(!active||locked.has(active)||used||completed?' disabled':'')+'>'+ch+'</button>';
    }).join('');
    root.innerHTML='<div class="cb-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-cb-levels>← Choose level</button><span class="tl-eyebrow">CODEBREAKER · '+cfg.label.toUpperCase()+'</span></div><section class="cb-panel"><div class="cb-progress-row"><span class="cb-kicker">'+esc(item.title)+'</span><span class="cb-progress">'+(index+1)+' / '+cfg.count+'</span></div><h2>Decode the message</h2><p class="cb-clue"><strong>Clue</strong> '+esc(item.clue)+'</p><div class="cb-message-wrap"><span class="cb-label">ENCRYPTED MESSAGE</span><div class="cb-message" aria-label="Encrypted message">'+message+'</div></div><div class="cb-key-area"><div class="cb-key-heading"><strong>Your letter key</strong><span>Choose a coded letter, then its meaning</span></div><div class="cb-key-grid">'+key+'</div><div class="cb-alphabet" aria-label="Choose the decoded letter">'+alphabet+'</div></div><div class="cb-actions"><button type="button" class="tl-secondary" data-cb-hint'+(completed?' disabled':'')+'>Reveal one letter</button><button type="button" class="tl-secondary" data-cb-clear'+(!active||locked.has(active)||completed?' disabled':'')+'>Clear selected key</button><button type="button" class="tl-next" data-cb-check'+(completed?' disabled':'')+'>Check message</button></div>'+(feedback?'<p class="cb-feedback" role="status">'+esc(feedback)+'</p>':'')+(completed?'<div class="cb-complete" role="status"><strong>✓ Message decoded!</strong><p>'+esc(item.answer)+'</p><button type="button" class="tl-next" data-cb-next>'+(index+1<cfg.count?'Next signal ↗':'Finish level ↗')+'</button></div>':'')+'</section></div>';
  }
  function selectSymbol(ch){
    if(completed||locked.has(ch))return;
    active=active===ch?'':ch;
    feedback=active?'Choose the English letter that replaces '+ch+'.':'Letter selection cleared.';
    renderPuzzle();
  }
  function assignLetter(ch){
    if(!active||completed||locked.has(active))return;
    const used=Object.keys(mapping).find(code=>mapping[code]===ch&&code!==active);
    if(used){feedback=ch+' is already assigned to '+used+'. Each decoded letter can be used only once.';renderPuzzle();return;}
    mapping[active]=ch;feedback=active+' now decodes as '+ch+'.';active='';renderPuzzle();
  }
  function revealHint(){
    const answer=puzzle().answer,cipher=puzzle().cipher;
    for(let i=0;i<cipher.length;i++){
      const coded=cipher[i],plain=answer[i];
      if(/[A-Z]/.test(coded)&&!mapping[coded]&&!Object.keys(mapping).some(code=>mapping[code]===plain)){
        mapping[coded]=plain;locked.add(coded);active='';
        feedback='Key revealed: '+coded+' = '+plain+'. Use it to narrow down the message.';
        renderPuzzle();return;
      }
    }
    feedback='The remaining letters are already assigned elsewhere. Clear an incorrect key before using another hint.';renderPuzzle();
  }
  function checkMessage(){
    const item=puzzle(),missing=uniqueCipher().filter(ch=>!mapping[ch]);
    if(missing.length){feedback='Decode the remaining '+missing.length+' coded letter'+(missing.length===1?'':'s')+' before checking.';renderPuzzle();return;}
    const decoded=[...item.cipher].map(ch=>/[A-Z]/.test(ch)?mapping[ch]:ch).join('');
    const correct=decoded===item.answer;
    if(correct){
      completed=true;feedback='Every letter is in the right place.';
    }else{
      feedback='Not quite. Compare the repeated letters and clue, then adjust your key. There is no penalty.';
    }
    if(window.EpiphanyThinkLab&&typeof window.EpiphanyThinkLab.recordResult==='function'){
      window.EpiphanyThinkLab.recordResult('vocabulary','codebreaker',correct,correct&&index===list().length-1,{trackAdaptive:false});
    }
    renderPuzzle();
  }
  function nextPuzzle(){
    if(!completed)return;
    if(index+1>=list().length){
      root.innerHTML='<div class="cb-shell"><section class="cb-panel cb-finish"><span class="cb-kicker">LEVEL COMPLETE</span><h2>Every signal decoded.</h2><p>You solved all '+list().length+' '+bank.levels[level].label+' messages. Each one was cracked at your own pace.</p><button type="button" class="tl-next" data-cb-levels>Choose another level</button><button type="button" class="tl-back" data-cb-home>Back to Think Lab</button></section></div>';
      return;
    }
    index++;seedPuzzle();renderPuzzle();
  }
  function startLevel(id){
    if(!levelReady(id))return;
    level=id;index=0;seedPuzzle();renderPuzzle();
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-cb-home],[data-cb-levels],[data-cb-level],[data-cb-symbol],[data-cb-plain],[data-cb-hint],[data-cb-clear],[data-cb-check],[data-cb-next]');
    if(!target||!root.contains(target))return;
    if(target.hasAttribute('data-cb-home')){
      window.EpiphanySpeech?.stop?.();level=null;root.innerHTML='';
      if(typeof window.EPIPHANY_THINK_LAB_HOME==='function')window.EPIPHANY_THINK_LAB_HOME();
      else root.dispatchEvent(new CustomEvent('epiphany:think-lab-home'));
      return;
    }
    if(target.hasAttribute('data-cb-levels')){renderLevels();return;}
    if(target.hasAttribute('data-cb-level')){startLevel(target.dataset.cbLevel);return;}
    if(target.hasAttribute('data-cb-symbol')){selectSymbol(target.dataset.cbSymbol);return;}
    if(target.hasAttribute('data-cb-plain')){assignLetter(target.dataset.cbPlain);return;}
    if(target.hasAttribute('data-cb-hint')){revealHint();return;}
    if(target.hasAttribute('data-cb-clear')){
      if(active&&!locked.has(active))delete mapping[active];
      feedback='Selected key cleared.';active='';renderPuzzle();return;
    }
    if(target.hasAttribute('data-cb-check')){checkMessage();return;}
    if(target.hasAttribute('data-cb-next')){nextPuzzle();return;}
  });
  window.EPIPHANY_CODEBREAKER=Object.freeze({open:renderLevels,validateBank:bank.validateBank});
})();
