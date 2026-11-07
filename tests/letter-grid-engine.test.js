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
function startFirstClue(h){
  h.window.EPIPHANY_LETTER_GRID.open();
  h.click('[data-lg-level]',{lgLevel:'easy'});
  const item=h.bank.puzzles.easy[0].words[0];
  h.click('[data-lg-clue]',{lgClue:item.id});
  return item;
}

test('Letter Grid opens its own four-level picker and does not use shared training modes',()=>{
  const h=harness();h.window.EPIPHANY_LETTER_GRID.open();
  assert.match(h.root.innerHTML,/Choose your level/);
  for(const id of ['easy','medium','hard','expert'])assert.match(h.root.innerHTML,new RegExp('data-lg-level="'+id+'"'));
  assert.doesNotMatch(h.root.innerHTML,/Guided|Steady|Challenge|timer/i);
});

test('a clue is solved by connecting its exact adjacent-letter path',()=>{
  const h=harness(),word=startFirstClue(h);
  for(const cell of word.path)h.click('[data-lg-cell]',{lgCell:String(cell)});
  assert.match(h.root.innerHTML,/lg-clue is-found/);
  assert.match(h.root.innerHTML,new RegExp(word.answer));
  assert.equal(h.results.length,1);
  assert.equal(h.results[0][0],'vocabulary');
  assert.equal(h.results[0][1],'letter-grid');
  assert.equal(h.results[0][2],true);
  assert.equal(h.results[0][4].trackAdaptive,false);
});

test('wrong full paths can be retried without a penalty system',()=>{
  const h=harness(),word=startFirstClue(h);
  for(const cell of [...word.path].reverse())h.click('[data-lg-cell]',{lgCell:String(cell)});
  assert.match(h.root.innerHTML,/Not quite/);
  assert.match(h.root.innerHTML,/data-lg-clue=/);
  assert.equal(h.results.length,1);
  assert.equal(h.results[0][2],false);
  for(const cell of word.path)h.click('[data-lg-cell]',{lgCell:String(cell)});
  assert.match(h.root.innerHTML,/lg-clue is-found/);
  assert.equal(h.results.length,2);
  assert.equal(h.results[1][2],true);
});

test('letter paths enforce neighboring cells and support one-step backtracking',()=>{
  const h=harness(),word=startFirstClue(h);
  h.click('[data-lg-cell]',{lgCell:String(word.path[0])});
  h.click('[data-lg-cell]',{lgCell:String((word.path[0]+h.bank.levels.easy.size+2)%(h.bank.levels.easy.size**2))});
  assert.match(h.root.innerHTML,/Choose a cell next to the last letter/);
  h.click('[data-lg-cell]',{lgCell:String(word.path[1])});
  assert.match(h.root.innerHTML,/2 of .* letters connected/);
  h.click('[data-lg-cell]',{lgCell:String(word.path[0])});
  assert.match(h.root.innerHTML,/1 of .* letters connected/);
  assert.equal(h.results.length,0);
});

test('optional hint reveals only the starting letter and marks its grid cell',()=>{
  const h=harness(),word=startFirstClue(h);
  h.click('[data-lg-hint]');
  assert.match(h.root.innerHTML,new RegExp('Starting letter: '+word.answer[0]));
  const cellClass=h.root.innerHTML.match(new RegExp('class="([^"]*is-hint[^"]*)" data-lg-cell="'+word.path[0]+'"'));
  assert.ok(cellClass,'the first path cell should be highlighted');
  assert.equal(h.results.length,0);
  assert.match(h.root.innerHTML,/Reveal starting letter/);
});
