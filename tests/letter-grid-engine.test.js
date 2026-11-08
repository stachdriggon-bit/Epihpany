const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const bankSource=fs.readFileSync(path.join(__dirname,'..','letter-grid-bank.js'),'utf8');
const engineSource=fs.readFileSync(path.join(__dirname,'..','letter-grid.js'),'utf8');
function harness(){
  const listeners={},root={innerHTML:'',addEventListener(type,fn){listeners[type]=fn;},contains(){return true;}},results=[];
  const window={EpiphanyThinkLab:{recordResult(...args){results.push(args);}},EpiphanySpeech:{stop(){}}};
  const document={getElementById:id=>id==='think-lab-content'?root:null};
  const context=vm.createContext({window,document,Set,Map,Object,Array,String,Number,Math,CustomEvent:function(type){this.type=type;}});
  vm.runInContext(bankSource,context,{filename:'letter-grid-bank.js',timeout:5000});
  vm.runInContext(engineSource,context,{filename:'letter-grid.js',timeout:5000});
  function click(selector,dataset={}){
    const attrs=new Set([...selector.matchAll(/\[([^\]]+)\]/g)].map(m=>m[1]));
    const target={dataset,closest(query){return query.split(',').some(part=>part.trim()===selector)?this:null;},hasAttribute(name){return attrs.has(name);}};
    listeners.click({target});
  }
  return {root,click,results,window,bank:window.EPIPHANY_LETTER_GRID_BANK};
}
function start(h){
  h.window.EPIPHANY_LETTER_GRID.open();
  h.click('[data-lg-level]',{lgLevel:'easy'});
  const word=h.bank.puzzles.easy[0].words[0];\n  h.click('[data-lg-clue]',{lgClue:word.id});\n  return word;
}
test('Letter Path opens four independent levels and presents a word-search instruction',()=>{
  const h=harness();h.window.EPIPHANY_LETTER_GRID.open();
  for(const id of ['easy','medium','hard','expert'])assert.match(h.root.innerHTML,new RegExp('data-lg-level="'+id+'"'));
  assert.match(h.root.innerHTML,/straight line/);
  assert.doesNotMatch(h.root.innerHTML,/Guided|Steady|Challenge/i);
});
test('target words are visible and found by selecting their straight-line letters',()=>{
  const h=harness(),word=start(h);
  assert.match(h.root.innerHTML,new RegExp(word.answer));
  assert.doesNotMatch(h.root.innerHTML,/Choose clue|Word clues/);
  for(const cell of word.path)h.click('[data-lg-cell]',{lgCell:String(cell)});
  assert.match(h.root.innerHTML,/lg-word is-found/);
  assert.equal(h.results.length,1);
  assert.equal(h.results[0][1],'letter-grid');
  assert.equal(h.results[0][2],true);
  assert.equal(h.results[0][4].trackAdaptive,false);
});
test('tapping a selected letter again steps back one cell',()=>{
  const h=harness(),word=start(h);
  h.click('[data-lg-cell]',{lgCell:String(word.path[0])});
  h.click('[data-lg-cell]',{lgCell:String(word.path[1])});
  h.click('[data-lg-cell]',{lgCell:String(word.path[1])});
  assert.match(h.root.innerHTML,/YOUR PATH/);
  assert.match(h.root.innerHTML,new RegExp('>'+word.answer[0]+'<'));
  assert.equal(h.results.length,0);
});
test('the path cannot turn after its direction is established',()=>{
  const h=harness(),word=start(h),n=h.bank.levels.easy.size;
  h.click('[data-lg-cell]',{lgCell:String(word.path[0])});
  h.click('[data-lg-cell]',{lgCell:String(word.path[1])});
  const first=word.path[0],second=word.path[1],last=second;
  const dr=Math.floor(second/n)-Math.floor(first/n),dc=second%n-first%n;
  const r=Math.floor(last/n),col=last%n;
  const alternatives=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const turn=alternatives.map(([rr,cc])=>({rr,cc,index:(r+rr)*n+col+cc})).find(x=>Math.max(Math.abs(x.rr),Math.abs(x.cc))===1&&(x.rr!==dr||x.cc!==dc)&&r+x.rr>=0&&r+x.rr<n&&col+x.cc>=0&&col+x.cc<n&&!word.path.includes(x.index));
  if(turn)h.click('[data-lg-cell]',{lgCell:String(turn.index)});
  assert.match(h.root.innerHTML,/same straight line/);
  assert.equal(h.results.length,0);
});
test('hint highlights a starting cell without revealing a path',()=>{
  const h=harness();start(h);h.click('[data-lg-hint]');
  assert.match(h.root.innerHTML,/Starting letter:/);
  assert.match(h.root.innerHTML,/is-hint/);
  assert.equal(h.results.length,0);
});
