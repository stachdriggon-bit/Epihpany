/* EPIPHANY THINK LAB — Letter Path straight-line clue search. */
(() => {
  'use strict';
  const root=document.getElementById('think-lab-content');
  const bank=window.EPIPHANY_LETTER_GRID_BANK;
  if(!root||!bank)return;

  let level=null,puzzleIndex=0,found=new Set(),activeClue='',path=[],hinted=new Set(),feedback='',completed=false,direction=null;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list=()=>level?(bank.puzzles[level]||[]):[];
  const puzzle=()=>list()[puzzleIndex]||null;
  const cfg=()=>bank.levels[level];
  const clue=()=>puzzle()?.words.find(word=>word.id===activeClue)||null;
  const BANK_VERSION='letter-grid-bank-v1';
  function progression(){return window.EpiphanyThinkLab;}
  function saveProgress(){
    if(!level||!puzzle())return;
    progression()?.saveGameSnapshot?.('lettergrid',{bankVersion:BANK_VERSION,level,trainingMode:null,position:puzzleIndex,payload:{found:[...found],activeClue,path:path.slice(),hinted:[...hinted],completed,direction:direction&&direction.slice(),feedback}});
  }
  function resumeProgress(){
    const snapshot=progression()?.getGameSnapshot?.('lettergrid',{bankVersion:BANK_VERSION});
    if(!snapshot||!levelReady(snapshot.level)||snapshot.position>=(bank.puzzles[snapshot.level]||[]).length)return false;
    const item=bank.puzzles[snapshot.level][snapshot.position],p=snapshot.payload;
    if(!p||!Array.isArray(p.found)||!Array.isArray(p.hinted)||!Array.isArray(p.path)||
       p.found.some(id=>!item.words.some(word=>word.id===id))||new Set(p.found).size!==p.found.length||
       p.hinted.some(id=>!item.words.some(word=>word.id===id))||
       (p.activeClue!==''&&!item.words.some(word=>word.id===p.activeClue&&!p.found.includes(word.id)))||
       p.path.some(cell=>!Number.isInteger(cell)||cell<0||cell>=bank.levels[snapshot.level].size**2)||
       typeof p.completed!=='boolean'||p.completed!==(p.found.length===item.words.length))return false;
    const active=item.words.find(word=>word.id===p.activeClue);
    if(p.path.length&&(!active||!p.path.every((cell,i)=>cell===active.path[i]||cell===active.path[active.path.length-1-i])))return false;
    level=snapshot.level;puzzleIndex=snapshot.position;found=new Set(p.found);activeClue=p.activeClue||'';
    path=p.path.slice();hinted=new Set(p.hinted);completed=p.completed;
    direction=Array.isArray(p.direction)&&p.direction.length===2&&p.direction.every(Number.isInteger)?p.direction.slice():null;
    feedback=typeof p.feedback==='string'?p.feedback:'';
    progression()?.recordGameStart?.('lettergrid',{level});renderPuzzle();return true;
  }
  const letters=indices=>indices.map(index=>puzzle().grid[Math.floor(index/cfg().size)][index%cfg().size]).join('');
  const directionBetween=(a,b)=>{const n=cfg().size,dr=Math.floor(b/n)-Math.floor(a/n),dc=b%n-a%n;return Math.max(Math.abs(dr),Math.abs(dc))===1?[dr,dc]:null;};
  function levelReady(id){return !!bank.levels[id]&&(bank.puzzles[id]||[]).length===bank.levels[id].count&&(bank.puzzles[id]||[]).every(item=>bank.validatePuzzle(item,id).valid);}
  function renderLevels(){
    level=null;
    const status=bank.validateBank();
    const saved=progression()?.getGameSnapshot?.('lettergrid',{bankVersion:BANK_VERSION});
    const resumeMarkup=saved&&levelReady(saved.level)&&saved.position<(bank.puzzles[saved.level]||[]).length
      ?'<button type="button" class="tl-next" data-lg-resume>Resume '+esc(bank.levels[saved.level].label)+' · Puzzle '+(saved.position+1)+' ↗</button>':'';
    root.innerHTML='<div class="lg-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-lg-home>← Think Lab home</button><span class="tl-eyebrow">LETTER PATH</span></div><section class="lg-panel"><div class="lg-kicker">FIND THE HIDDEN WORDS</div><h2>Choose your level</h2><p class="lg-intro">Read a clue, then find its answer hidden in the letter grid. Each word runs in one straight line: across, down, or diagonal. Words may run in either direction. No timer and no penalty for trying again.</p>'+resumeMarkup+'<div class="lg-level-grid">'+Object.entries(bank.levels).map(([id,config])=>'<button type="button" class="lg-level-card" data-lg-level="'+id+'"'+(levelReady(id)?'':' disabled')+'><span class="lg-level-size">'+config.size+' × '+config.size+' grid</span><strong>'+config.label+'</strong><span>'+config.count+' puzzles · '+config.wordsPerPuzzle+' clues each</span></button>').join('')+'</div>'+(status.valid?'':'<p class="lg-feedback" role="status">A level opens only when its complete puzzle set passes validation.</p>')+'</section></div>';
  }
  function renderPuzzle(){
    const item=puzzle();if(!item)return renderLevels();
    const size=cfg().size,active=clue(),foundCells=new Set();
    for(const entry of item.words)if(found.has(entry.id))for(const cell of entry.path)foundCells.add(cell);
    const hintCell=active&&hinted.has(active.id)?active.path[0]:-1;
    const cells=item.grid.map(row=>[...row]).flat().map((letter,index)=>{
      const classes=['lg-cell'];if(path.includes(index))classes.push('is-selected');if(foundCells.has(index))classes.push('is-found');if(index===hintCell)classes.push('is-hint');
      return '<button type="button" class="'+classes.join(' ')+'" data-lg-cell="'+index+'" aria-label="Row '+(Math.floor(index/size)+1)+', column '+(index%size+1)+', letter '+letter+'" aria-pressed="'+(path.includes(index)||foundCells.has(index))+'"'+(completed||!active||foundCells.has(index)?' disabled':'')+'>'+letter+'</button>';
    }).join('');
    const clues=item.words.map(entry=>{
      const isFound=found.has(entry.id),isActive=activeClue===entry.id;
      return '<button type="button" class="lg-clue'+(isFound?' is-found':'')+(isActive?' is-active':'')+'" data-lg-clue="'+entry.id+'"'+(isFound||completed?' disabled':'')+'><span class="lg-clue-main"><strong>'+esc(isFound?entry.answer:entry.clue)+'</strong><small>'+entry.answer.length+' letters</small></span><span class="lg-clue-state">'+(isFound?'✓ Found':isActive?'Selected':'Choose clue')+'</span></button>';
    }).join('');
    const preview=path.length?letters(path).split('').join(' · '):active?'Select the first letter of the answer':'Choose a clue to begin';
    root.innerHTML='<div class="lg-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-lg-levels>← Choose level</button><span class="tl-eyebrow">LETTER PATH · '+cfg().label.toUpperCase()+'</span></div><section class="lg-panel"><div class="lg-progress-row"><span class="lg-kicker">'+esc(item.title)+'</span><span class="lg-progress">'+(puzzleIndex+1)+' / '+cfg().count+'</span></div><h2>Find the hidden word</h2><p class="lg-instruction">Choose a clue, then tap its letters in order along one straight line. Move horizontally, vertically, or diagonally—including backwards. Tap a selected letter again to step back.</p><div class="lg-score-row"><strong>'+found.size+' <span>/ '+item.words.length+' words found</span></strong><span>'+(active?'Find '+active.answer.length+' letters':'Choose a clue')+'</span></div><div class="lg-game-layout"><div class="lg-board-column"><div class="lg-board-wrap"><div class="lg-board" style="--lg-size:'+size+'" role="group" aria-label="'+size+' by '+size+' letter grid">'+cells+'</div></div><div class="lg-path-preview" aria-live="polite"><span class="lg-path-label">YOUR PATH</span><strong>'+esc(preview)+'</strong></div><div class="lg-actions"><button type="button" class="tl-secondary" data-lg-hint'+(!active||hinted.has(active.id)?' disabled':'')+'>Reveal starting letter</button><button type="button" class="tl-secondary" data-lg-clear'+(!path.length?' disabled':'')+'>Clear path</button></div></div><div class="lg-clues"><div class="lg-clues-head"><strong>Word clues</strong><span>'+found.size+' of '+item.words.length+'</span></div>'+clues+'</div></div>'+(feedback?'<p class="lg-feedback" role="status">'+esc(feedback)+'</p>':'')+(completed?'<div class="lg-complete" role="status"><strong>✓ Puzzle complete!</strong><p>You found every hidden word.</p><button type="button" class="tl-next" data-lg-next>'+(puzzleIndex+1<cfg().count?'Next puzzle ↗':'Finish level ↗')+'</button></div>':'')+'</section></div>';
    saveProgress();
  }
  function record(correct,isComplete=false){if(window.EpiphanyThinkLab&&typeof window.EpiphanyThinkLab.recordResult==='function')window.EpiphanyThinkLab.recordResult('vocabulary','letter-grid',correct,isComplete,{trackAdaptive:false});}
  function selectClue(id){
    const entry=puzzle().words.find(word=>word.id===id);if(!entry||found.has(id)||completed)return;
    activeClue=id;path=[];direction=null;feedback='Find the '+entry.answer.length+' letters that match this clue.';renderPuzzle();
  }
  function selectCell(index){
    const entry=clue();if(!entry||completed)return;
    if(path.includes(index)){
      const at=path.indexOf(index);path=path.slice(0,at);
      direction=path.length>=2?directionBetween(path[0],path[1]):null;
      feedback='Stepped back. Continue from the last selected letter.';renderPuzzle();return;
    }
    if(!path.length){path=[index];feedback='Now choose the next letter in a straight line.';renderPuzzle();return;}
    const nextDirection=directionBetween(path[path.length-1],index);
    if(!nextDirection){feedback='Choose a neighboring cell. Diagonal steps are allowed.';renderPuzzle();return;}
    if(!direction)direction=nextDirection;
    else if(direction[0]!==nextDirection[0]||direction[1]!==nextDirection[1]){feedback='A word must stay on the same straight line. Tap a selected letter to step back.';renderPuzzle();return;}
    path.push(index);
    if(path.length===entry.answer.length){
      const answer=letters(path),reverse=[...answer].reverse().join('');
      if(answer===entry.answer||reverse===entry.answer){
        found.add(entry.id);const allFound=found.size===puzzle().words.length;
        completed=allFound;record(true,allFound&&puzzleIndex===list().length-1);
        feedback='Found '+entry.answer+'!'+(allFound?' Every clue is solved.':' Choose the next clue when ready.');
        activeClue='';path=[];direction=null;
      }else{record(false,false);feedback='Not quite. Try another straight line—there is no penalty.';path=[];direction=null;}
    }else{feedback=path.length+' of '+entry.answer.length+' letters selected.';}
    renderPuzzle();
  }
  function revealHint(){
    const entry=clue();if(!entry||hinted.has(entry.id))return;
    hinted.add(entry.id);path=[];direction=null;feedback='Starting letter: '+entry.answer[0]+'. Find it, then follow the straight line.';renderPuzzle();
  }
  function nextPuzzle(){
    if(!completed)return;
    if(puzzleIndex+1>=list().length){progression()?.clearGameSnapshot?.('lettergrid');root.innerHTML='<div class="lg-shell"><section class="lg-panel lg-finish"><span class="lg-kicker">LEVEL COMPLETE</span><h2>Every word found.</h2><p>You completed all '+list().length+' '+cfg().label+' puzzles.</p><button type="button" class="tl-next" data-lg-levels>Choose another level</button><button type="button" class="tl-back" data-lg-home>Back to Think Lab</button></section></div>';return;}
    puzzleIndex++;found=new Set();activeClue='';path=[];direction=null;hinted=new Set();feedback='';completed=false;renderPuzzle();
  }
  function startLevel(id){if(!levelReady(id))return;progression()?.clearGameSnapshot?.('lettergrid');progression()?.recordGameStart?.('lettergrid',{level:id});level=id;puzzleIndex=0;found=new Set();activeClue='';path=[];direction=null;hinted=new Set();feedback='';completed=false;renderPuzzle();}
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-lg-resume],[data-lg-home],[data-lg-levels],[data-lg-level],[data-lg-clue],[data-lg-cell],[data-lg-hint],[data-lg-clear],[data-lg-next]');
    if(!target||!root.contains(target))return;
    if(target.hasAttribute('data-lg-home')){window.EpiphanySpeech?.stop?.();level=null;root.innerHTML='';if(typeof window.EPIPHANY_THINK_LAB_HOME==='function')window.EPIPHANY_THINK_LAB_HOME();else root.dispatchEvent(new CustomEvent('epiphany:think-lab-home'));return;}
    if(target.hasAttribute('data-lg-resume')){if(!resumeProgress())renderLevels();return;}
    if(target.hasAttribute('data-lg-levels')){renderLevels();return;}
    if(target.hasAttribute('data-lg-level')){startLevel(target.dataset.lgLevel);return;}
    if(target.hasAttribute('data-lg-clue')){selectClue(target.dataset.lgClue);return;}
    if(target.hasAttribute('data-lg-cell')){selectCell(Number(target.dataset.lgCell));return;}
    if(target.hasAttribute('data-lg-hint')){revealHint();return;}
    if(target.hasAttribute('data-lg-clear')){path=[];direction=null;feedback='Path cleared. Start again from any letter.';renderPuzzle();return;}
    if(target.hasAttribute('data-lg-next')){nextPuzzle();return;}
  });
  window.EPIPHANY_LETTER_GRID=Object.freeze({open:renderLevels,validateBank:bank.validateBank});
})();
