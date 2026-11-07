/* EPIPHANY THINK LAB — Letter Grid adjacent-letter word paths. */
(() => {
  'use strict';
  const root=document.getElementById('think-lab-content');
  const bank=window.EPIPHANY_LETTER_GRID_BANK;
  if(!root||!bank)return;

  let level=null,puzzleIndex=0,found=new Set(),activeClue='',path=[],hinted=new Set(),feedback='',completed=false;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list=()=>level?(bank.puzzles[level]||[]):[];
  const puzzle=()=>list()[puzzleIndex]||null;
  const clue=()=>puzzle()?.words.find(item=>item.id===activeClue)||null;
  const levelReady=id=>!!bank.levels[id]&&(bank.puzzles[id]||[]).length===bank.levels[id].count&&(bank.puzzles[id]||[]).every(item=>bank.validatePuzzle(item,id).valid);
  const cellText=indices=>indices.map(index=>puzzle().grid[Math.floor(index/bank.levels[level].size)][index%bank.levels[level].size]).join('');

  function renderLevels(){
    level=null;
    const status=bank.validateBank();
    root.innerHTML='<div class="lg-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-lg-home>← Think Lab home</button><span class="tl-eyebrow">LETTER GRID</span></div><section class="lg-panel"><div class="lg-kicker">CONNECT THE LETTERS</div><h2>Choose your level</h2><p class="lg-intro">Read each clue, then connect neighboring letters to spell its answer. Your path can turn in any direction. No timer and no penalty for trying again.</p><div class="lg-level-grid">'+Object.entries(bank.levels).map(([id,cfg])=>'<button type="button" class="lg-level-card" data-lg-level="'+id+'"'+(levelReady(id)?'':' disabled')+'><span class="lg-level-size">'+cfg.size+' × '+cfg.size+' grid</span><strong>'+cfg.label+'</strong><span>'+cfg.count+' puzzles · '+cfg.wordsPerPuzzle+' clues each</span></button>').join('')+'</div>'+(status.valid?'':'<p class="lg-feedback" role="status">A level opens only when its complete puzzle set passes validation.</p>')+'</section></div>';
  }

  function renderPuzzle(){
    const item=puzzle();if(!item)return renderLevels();
    const cfg=bank.levels[level],active=clue(),foundCells=new Set();
    for(const entry of item.words)if(found.has(entry.id))for(const index of entry.path)foundCells.add(index);
    const hintCell=active&&hinted.has(active.id)?active.path[0]:-1;
    const cells=item.grid.map(row=>[...row]).flat().map((letter,index)=>{
      const classes=['lg-cell'];
      if(path.includes(index))classes.push('is-selected');
      if(foundCells.has(index))classes.push('is-found');
      if(index===hintCell)classes.push('is-hint');
      const row=Math.floor(index/cfg.size)+1,col=index%cfg.size+1;
      return '<button type="button" class="'+classes.join(' ')+'" data-lg-cell="'+index+'" aria-label="Row '+row+', column '+col+', letter '+letter+'" aria-pressed="'+(path.includes(index)||foundCells.has(index))+'"'+(completed||!active||foundCells.has(index)?' disabled':'')+'>'+letter+'</button>';
    }).join('');
    const clues=item.words.map(entry=>{
      const isFound=found.has(entry.id),isActive=activeClue===entry.id;
      return '<button type="button" class="lg-clue'+(isFound?' is-found':'')+(isActive?' is-active':'')+'" data-lg-clue="'+entry.id+'"'+(isFound||completed?' disabled':'')+'><span class="lg-clue-main"><strong>'+esc(isFound?entry.answer:entry.clue)+'</strong><small>'+entry.answer.length+' letters</small></span><span class="lg-clue-state">'+(isFound?'✓ Found':isActive?'Selected':'Choose clue')+'</span></button>';
    }).join('');
    const selectedLetters=path.length?cellText(path).split('').join(' · '):'Select neighboring letters on the grid';
    root.innerHTML='<div class="lg-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-lg-levels>← Choose level</button><span class="tl-eyebrow">LETTER GRID · '+cfg.label.toUpperCase()+'</span></div><section class="lg-panel"><div class="lg-progress-row"><span class="lg-kicker">'+esc(item.title)+'</span><span class="lg-progress">'+(puzzleIndex+1)+' / '+cfg.count+'</span></div><h2>Follow the letter path</h2><div class="lg-score-row"><strong>'+found.size+' <span>/ '+item.words.length+' words found</span></strong><span>Connect any neighboring direction</span></div><div class="lg-game-layout"><div class="lg-board-column"><div class="lg-board-wrap"><div class="lg-board" style="--lg-size:'+cfg.size+'">'+cells+'</div></div><div class="lg-path-preview" aria-live="polite"><span class="lg-path-label">YOUR PATH</span><strong>'+esc(selectedLetters)+'</strong></div><div class="lg-actions"><button type="button" class="tl-secondary" data-lg-hint'+(!active||hinted.has(active.id)?' disabled':'')+'>Reveal starting letter</button><button type="button" class="tl-secondary" data-lg-clear'+(!path.length?' disabled':'')+'>Clear path</button></div></div><div class="lg-clues"><div class="lg-clues-head"><strong>Word clues</strong><span>'+found.size+' of '+item.words.length+'</span></div>'+clues+'</div></div>'+(feedback?'<p class="lg-feedback" role="status">'+esc(feedback)+'</p>':'')+(completed?'<div class="lg-complete" role="status"><strong>✓ Puzzle complete!</strong><p>You connected every word in this grid.</p><button type="button" class="tl-next" data-lg-next>'+(puzzleIndex+1<cfg.count?'Next puzzle ↗':'Finish level ↗')+'</button></div>':'')+'</section></div>';
  }

  function record(correct,isComplete=false){
    if(window.EpiphanyThinkLab&&typeof window.EpiphanyThinkLab.recordResult==='function'){
      window.EpiphanyThinkLab.recordResult('vocabulary','letter-grid',correct,isComplete,{trackAdaptive:false});
    }
  }
  function selectClue(id){
    const entry=puzzle().words.find(item=>item.id===id);
    if(!entry||found.has(id)||completed)return;
    activeClue=id;path=[];feedback='Connect '+entry.answer.length+' neighboring letters to solve this clue.';renderPuzzle();
  }
  function selectCell(index){
    const entry=clue();if(!entry||completed)return;
    const size=bank.levels[level].size;
    if(path.includes(index)){
      const at=path.indexOf(index);
      if(at===path.length-2){path.pop();feedback='Last letter removed from your path.';renderPuzzle();return;}
      feedback='A cell can appear only once in a word path. Use the previous cell to step back.';renderPuzzle();return;
    }
    if(path.length){
      const previous=path[path.length-1],r=Math.floor(previous/size),c=previous%size,nr=Math.floor(index/size),nc=index%size;
      if(Math.max(Math.abs(r-nr),Math.abs(c-nc))!==1){feedback='Choose a cell next to the last letter. Diagonal steps are allowed.';renderPuzzle();return;}
    }
    if(path.length>=entry.answer.length)return;
    path.push(index);
    if(path.length===entry.answer.length){
      const answer=cellText(path);
      if(answer===entry.answer){
        found.add(entry.id);const allFound=found.size===puzzle().words.length;
        completed=allFound;record(true,allFound&&puzzleIndex===list().length-1);
        feedback='Found '+entry.answer+'!'+(allFound?' Every clue is solved.':' Choose the next clue when you are ready.');
        activeClue='';path=[];
      }else{
        record(false,false);feedback='Not quite. Try a different route—there is no penalty.';path=[];
      }
    }else{
      feedback=path.length+' of '+entry.answer.length+' letters connected.';
    }
    renderPuzzle();
  }
  function revealHint(){
    const entry=clue();if(!entry||hinted.has(entry.id))return;
    hinted.add(entry.id);path=[];feedback='Starting letter: '+entry.answer[0]+'. Find it, then connect the remaining letters.';renderPuzzle();
  }
  function nextPuzzle(){
    if(!completed)return;
    if(puzzleIndex+1>=list().length){
      root.innerHTML='<div class="lg-shell"><section class="lg-panel lg-finish"><span class="lg-kicker">LEVEL COMPLETE</span><h2>Every path connected.</h2><p>You solved all '+list().length+' '+bank.levels[level].label+' puzzles, one letter at a time.</p><button type="button" class="tl-next" data-lg-levels>Choose another level</button><button type="button" class="tl-back" data-lg-home>Back to Think Lab</button></section></div>';
      return;
    }
    puzzleIndex++;found=new Set();activeClue='';path=[];hinted=new Set();feedback='';completed=false;renderPuzzle();
  }
  function startLevel(id){
    if(!levelReady(id))return;
    level=id;puzzleIndex=0;found=new Set();activeClue='';path=[];hinted=new Set();feedback='';completed=false;renderPuzzle();
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-lg-home],[data-lg-levels],[data-lg-level],[data-lg-clue],[data-lg-cell],[data-lg-hint],[data-lg-clear],[data-lg-next]');
    if(!target||!root.contains(target))return;
    if(target.hasAttribute('data-lg-home')){
      window.EpiphanySpeech?.stop?.();level=null;root.innerHTML='';
      if(typeof window.EPIPHANY_THINK_LAB_HOME==='function')window.EPIPHANY_THINK_LAB_HOME();
      else root.dispatchEvent(new CustomEvent('epiphany:think-lab-home'));
      return;
    }
    if(target.hasAttribute('data-lg-levels')){renderLevels();return;}
    if(target.hasAttribute('data-lg-level')){startLevel(target.dataset.lgLevel);return;}
    if(target.hasAttribute('data-lg-clue')){selectClue(target.dataset.lgClue);return;}
    if(target.hasAttribute('data-lg-cell')){selectCell(Number(target.dataset.lgCell));return;}
    if(target.hasAttribute('data-lg-hint')){revealHint();return;}
    if(target.hasAttribute('data-lg-clear')){path=[];feedback='Path cleared. Start again from any letter.';renderPuzzle();return;}
    if(target.hasAttribute('data-lg-next')){nextPuzzle();return;}
  });
  window.EPIPHANY_LETTER_GRID=Object.freeze({open:renderLevels,validateBank:bank.validateBank});
})();
