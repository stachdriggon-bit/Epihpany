/* EPIPHANY THINK LAB — Letter Path straight-line word search. */
(() => {
  'use strict';
  const root=document.getElementById('think-lab-content');
  const bank=window.EPIPHANY_LETTER_GRID_BANK;
  if(!root||!bank)return;

  let level=null,puzzleIndex=0,found=new Set(),path=[],direction=null,hintedWord='',feedback='',completed=false;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list=()=>level?(bank.puzzles[level]||[]):[];
  const puzzle=()=>list()[puzzleIndex]||null;
  const cfg=()=>bank.levels[level];
  const letters=indices=>indices.map(index=>puzzle().grid[Math.floor(index/cfg().size)][index%cfg().size]).join('');
  const remaining=()=>puzzle().words.filter(word=>!found.has(word.id));
  const straightVector=(a,b)=>{const n=cfg().size,dr=Math.floor(b/n)-Math.floor(a/n),dc=b%n-a%n;return Math.max(Math.abs(dr),Math.abs(dc))===1?[dr,dc]:null;};
  function renderLevels(){
    level=null;
    const status=bank.validateBank();
    root.innerHTML='<div class="lg-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-lg-home>← Think Lab home</button><span class="tl-eyebrow">LETTER PATH</span></div><section class="lg-panel"><div class="lg-kicker">FIND THE HIDDEN WORDS</div><h2>Choose your level</h2><p class="lg-intro">Find the listed words in the letter grid. Each word runs in one straight line: across, down, or diagonal. Words may run in either direction. No timer and no penalty for trying again.</p><div class="lg-level-grid">'+Object.entries(bank.levels).map(([id,cfg])=>'<button type="button" class="lg-level-card" data-lg-level="'+id+'"'+(levelReady(id)?'':' disabled')+'><span class="lg-level-size">'+cfg.size+' × '+cfg.size+' grid</span><strong>'+cfg.label+'</strong><span>'+cfg.count+' puzzles · '+cfg.wordsPerPuzzle+' words each</span></button>').join('')+'</div>'+(status.valid?'':'<p class="lg-feedback" role="status">A level opens only when its complete puzzle set passes validation.</p>')+'</section></div>';
  }
  function levelReady(id){return !!bank.levels[id]&&(bank.puzzles[id]||[]).length===bank.levels[id].count&&(bank.puzzles[id]||[]).every(item=>bank.validatePuzzle(item,id).valid);}
  function renderPuzzle(){
    const item=puzzle();if(!item)return renderLevels();
    const size=cfg().size,foundCells=new Set();
    for(const entry of item.words)if(found.has(entry.id))for(const cell of entry.path)foundCells.add(cell);
    const hintCell=hintedWord?item.words.find(w=>w.id===hintedWord)?.path[0]:-1;
    const cells=item.grid.map(row=>[...row]).flat().map((letter,index)=>{
      const classes=['lg-cell'];if(path.includes(index))classes.push('is-selected');if(foundCells.has(index))classes.push('is-found');if(index===hintCell)classes.push('is-hint');
      return '<button type="button" class="'+classes.join(' ')+'" data-lg-cell="'+index+'" aria-label="Row '+(Math.floor(index/size)+1)+', column '+(index%size+1)+', letter '+letter+'" aria-pressed="'+(path.includes(index)||foundCells.has(index))+'"'+(completed||foundCells.has(index)?' disabled':'')+'>'+letter+'</button>';
    }).join('');
    const targets=item.words.map(word=>'<span class="lg-word'+(found.has(word.id)?' is-found':'')+'" aria-label="'+esc(word.answer)+(found.has(word.id)?', found':', to find')+'">'+esc(word.answer)+'</span>').join('');
    const preview=path.length?letters(path).split('').join(' · '):'Tap a letter to begin a word';
    root.innerHTML='<div class="lg-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-lg-levels>← Choose level</button><span class="tl-eyebrow">LETTER PATH · '+cfg().label.toUpperCase()+'</span></div><section class="lg-panel"><div class="lg-progress-row"><span class="lg-kicker">WORD SEARCH</span><span class="lg-progress">'+(puzzleIndex+1)+' / '+cfg().count+'</span></div><h2>Find the words</h2><p class="lg-instruction">Tap the letters in order along one straight line. You can go horizontally, vertically, or diagonally—including backwards. Tap a selected letter again to step back.</p><div class="lg-score-row"><strong>'+found.size+' <span>/ '+item.words.length+' found</span></strong><span>'+remaining().length+' left</span></div><div class="lg-game-layout"><div class="lg-board-column"><div class="lg-board-wrap"><div class="lg-board" style="--lg-size:'+size+'" role="group" aria-label="'+size+' by '+size+' letter grid">'+cells+'</div></div><div class="lg-path-preview" aria-live="polite"><span class="lg-path-label">YOUR SELECTION</span><strong>'+esc(preview)+'</strong></div><div class="lg-actions"><button type="button" class="tl-secondary" data-lg-hint'+(!remaining().length||hintedWord?' disabled':'')+'>Show a starting letter</button><button type="button" class="tl-secondary" data-lg-clear'+(!path.length?' disabled':'')+'>Clear selection</button></div></div><div class="lg-targets"><div class="lg-clues-head"><strong>Words to find</strong><span>'+found.size+' of '+item.words.length+'</span></div><div class="lg-word-list">'+targets+'</div></div></div>'+(feedback?'<p class="lg-feedback" role="status">'+esc(feedback)+'</p>':'')+(completed?'<div class="lg-complete" role="status"><strong>✓ Puzzle complete!</strong><p>You found every hidden word.</p><button type="button" class="tl-next" data-lg-next>'+(puzzleIndex+1<cfg().count?'Next puzzle ↗':'Finish level ↗')+'</button></div>':'')+'</section></div>';
  }
  function record(correct,isComplete=false){if(window.EpiphanyThinkLab&&typeof window.EpiphanyThinkLab.recordResult==='function')window.EpiphanyThinkLab.recordResult('vocabulary','letter-grid',correct,isComplete,{trackAdaptive:false});}
  function resetPath(message=''){path=[];direction=null;feedback=message;}
  function selectCell(index){
    if(completed)return;
    const size=cfg().size;
    if(path.includes(index)){
      const at=path.indexOf(index);
      path=path.slice(0,at);direction=path.length>=2?straightVector(path[0],path[1]):null;
      feedback='Selection stepped back. Continue from the last letter or choose another starting point.';
      renderPuzzle();return;
    }
    if(!path.length){path=[index];feedback='Continue in a straight line.';renderPuzzle();return;}
    const nextDirection=straightVector(path[path.length-1],index);
    if(!nextDirection){resetPath('That cell is not beside the last one. Start a new straight line.');path=[index];renderPuzzle();return;}
    if(!direction)direction=nextDirection;
    else if(direction[0]!==nextDirection[0]||direction[1]!==nextDirection[1]){path=[index];direction=null;feedback='A word must stay on the same straight line. This letter is your new starting point.';renderPuzzle();return;}
    path.push(index);
    const selected=letters(path),reverse=[...selected].reverse().join('');
    const match=remaining().find(word=>word.answer===selected||word.answer===reverse);
    if(match){
      found.add(match.id);record(true,found.size===itemWordCount()&&puzzleIndex===list().length-1);
      feedback='✓ '+match.answer+' found!';
      path=[];direction=null;hintedWord='';
      if(found.size===itemWordCount())completed=true;
      renderPuzzle();return;
    }
    const possible=remaining().some(word=>word.answer.startsWith(selected)||word.answer.startsWith(reverse));
    if(!possible){record(false,false);resetPath('That line does not match a remaining word. Try another starting letter.');}
    else feedback=selected.length+' letters selected.';
    renderPuzzle();
  }
  function itemWordCount(){return puzzle().words.length;}
  function startLevel(id){if(!levelReady(id))return;level=id;puzzleIndex=0;found=new Set();path=[];direction=null;hintedWord='';feedback='';completed=false;renderPuzzle();}
  function nextPuzzle(){
    if(!completed)return;
    if(puzzleIndex+1>=list().length){root.innerHTML='<div class="lg-shell"><section class="lg-panel lg-finish"><span class="lg-kicker">LEVEL COMPLETE</span><h2>Every word found.</h2><p>You completed all '+list().length+' '+cfg().label+' puzzles.</p><button type="button" class="tl-next" data-lg-levels>Choose another level</button><button type="button" class="tl-back" data-lg-home>Back to Think Lab</button></section></div>';return;}
    puzzleIndex++;found=new Set();path=[];direction=null;hintedWord='';feedback='';completed=false;renderPuzzle();
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-lg-home],[data-lg-levels],[data-lg-level],[data-lg-cell],[data-lg-hint],[data-lg-clear],[data-lg-next]');
    if(!target||!root.contains(target))return;
    if(target.hasAttribute('data-lg-home')){window.EpiphanySpeech?.stop?.();level=null;root.innerHTML='';if(typeof window.EPIPHANY_THINK_LAB_HOME==='function')window.EPIPHANY_THINK_LAB_HOME();else root.dispatchEvent(new CustomEvent('epiphany:think-lab-home'));return;}
    if(target.hasAttribute('data-lg-levels')){renderLevels();return;}
    if(target.hasAttribute('data-lg-level')){startLevel(target.dataset.lgLevel);return;}
    if(target.hasAttribute('data-lg-cell')){selectCell(Number(target.dataset.lgCell));return;}
    if(target.hasAttribute('data-lg-hint')){const next=remaining()[0];if(next){hintedWord=next.id;feedback='Starting letter highlighted. Follow the straight line to find the word.';renderPuzzle();}return;}
    if(target.hasAttribute('data-lg-clear')){resetPath('Selection cleared.');renderPuzzle();return;}
    if(target.hasAttribute('data-lg-next')){nextPuzzle();return;}
  });
  window.EPIPHANY_LETTER_GRID=Object.freeze({open:renderLevels,validateBank:bank.validateBank});
})();
