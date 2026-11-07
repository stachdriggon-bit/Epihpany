const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const bankSource = fs.readFileSync(path.join(__dirname,'..','word-hunt-bank.js'),'utf8');
const engineSource = fs.readFileSync(path.join(__dirname,'..','word-hunt.js'),'utf8');

function createHarness() {
  const listeners = {};
  const root = {
    innerHTML:'',
    addEventListener(type,fn){listeners[type]=fn;},
    contains(){return true;}
  };
  const results = [];
  const window = {
    EpiphanyThinkLab:{recordResult(...args){results.push(args);}},
    EpiphanySpeech:{stop(){}}
  };
  const document = {getElementById:id=>id==='think-lab-content'?root:null};
  const context = vm.createContext({window,document,Set,Map,Object,Array,String,Number,Math,CustomEvent:function(type){this.type=type;}});
  vm.runInContext(bankSource,context,{filename:'word-hunt-bank.js',timeout:5000});
  vm.runInContext(engineSource,context,{filename:'word-hunt.js',timeout:5000});
  function click(selector,dataset={}) {
    const attrs = new Set([...selector.matchAll(/\[([^\]]+)\]/g)].map(m=>m[1]));
    const target = {
      dataset,
      closest(query){return query.split(',').some(part=>part.trim()===selector)?this:null;},
      hasAttribute(name){return attrs.has(name);}
    };
    listeners.click({target});
  }
  return {root,click,results,bank:window.EPIPHANY_WORD_HUNT_BANK,window};
}

test('Word Hunt opens an independent four-level picker, not the shared training-mode picker',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  assert.match(h.root.innerHTML,/Choose your level/);
  assert.match(h.root.innerHTML,/data-wh-level="easy"/);
  assert.match(h.root.innerHTML,/data-wh-level="expert"/);
  assert.doesNotMatch(h.root.innerHTML,/Guided|Steady|Challenge/);
});

test('a correct two-cell selection finds a target word and updates the board',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  const puzzle=h.bank.puzzles.easy[0], word=puzzle.words[0], match=h.bank.occurrences(puzzle.grid,word)[0];
  const endRow=match.row+match.dr*(word.length-1),endCol=match.col+match.dc*(word.length-1);
  h.click('[data-wh-cell]',{whCell:match.row+'-'+match.col});
  h.click('[data-wh-cell]',{whCell:endRow+'-'+endCol});
  assert.match(h.root.innerHTML,new RegExp(word+' <\\/span>'));
  assert.match(h.root.innerHTML,/1 <span>\/ 6 found/);
  assert.match(h.root.innerHTML,/Next tap|final letter|found!/i);
  assert.equal(h.results.length,0,'a puzzle result is recorded only after all its words are found');
});

test('completing all Easy words records one result and advances to the next fixed puzzle',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  const puzzle=h.bank.puzzles.easy[0];
  for(const word of puzzle.words){
    const match=h.bank.occurrences(puzzle.grid,word)[0];
    const endRow=match.row+match.dr*(word.length-1),endCol=match.col+match.dc*(word.length-1);
    h.click('[data-wh-cell]',{whCell:match.row+'-'+match.col});
    h.click('[data-wh-cell]',{whCell:endRow+'-'+endCol});
  }
  assert.match(h.root.innerHTML,/Grid cleared!/);
  assert.equal(h.results.length,1);
  assert.deepEqual(h.results[0],['vocabulary','word-hunt',true,false]);
  h.click('[data-wh-next]');
  assert.match(h.root.innerHTML,/Food Market/);
});

test('Word Hunt has no timer and invalid non-linear selections do not reveal answers',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  h.click('[data-wh-cell]',{whCell:'0-0'});
  h.click('[data-wh-cell]',{whCell:'1-2'});
  assert.match(h.root.innerHTML,/straight line/);
  assert.doesNotMatch(engineSource,/setTimeout|setInterval|countdown/i);
  assert.doesNotMatch(h.root.innerHTML,/Correct answer|solution:/i);
});
