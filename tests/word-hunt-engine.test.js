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

test('optional Word Hunt hint highlights a starting cell without revealing a solution',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  h.click('[data-wh-hint]');
  assert.match(h.root.innerHTML,/wh-cell is-hint/);
  assert.match(h.root.innerHTML,/highlighted letter/);
});

test('a correct two-cell selection finds a target word and updates the board',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  const puzzle=h.bank.puzzles.easy[0], word=puzzle.words[0], match=h.bank.occurrences(puzzle.grid,word)[0];
  const endRow=match.row+match.dr*(word.length-1),endCol=match.col+match.dc*(word.length-1);
  h.click('[data-wh-cell]',{whCell:match.row+'-'+match.col});
  h.click('[data-wh-cell]',{whCell:endRow+'-'+endCol});
  assert.match(h.root.innerHTML,/wh-word-chip is-found/);
  assert.match(h.root.innerHTML,/1 <span>\/ 6 found/);
  assert.match(h.root.innerHTML,/Next tap|final letter|found!/i);
  assert.equal(h.results.length,1,'a correct word is recorded as an attempt');
  assert.equal(h.results[0][2],true);
  h.click('[data-wh-cell]',{whCell:match.row+'-'+match.col});
  h.click('[data-wh-cell]',{whCell:endRow+'-'+endCol});
  assert.equal(h.results.length,1,'selecting an already-found word is not recorded as a failed attempt');
  assert.match(h.root.innerHTML,/already found/i);
});

test('Easy rejects backwards selection even when the letters spell a target word',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  const puzzle=h.bank.puzzles.easy[0], word=puzzle.words[0], match=h.bank.occurrences(puzzle.grid,word)[0];
  const endRow=match.row+match.dr*(word.length-1),endCol=match.col+match.dc*(word.length-1);
  h.click('[data-wh-cell]',{whCell:endRow+'-'+endCol});
  h.click('[data-wh-cell]',{whCell:match.row+'-'+match.col});
  assert.match(h.root.innerHTML,/direction is not available/i);
  assert.match(h.root.innerHTML,/0 <span>\/ 6 found/);
  assert.equal(h.results.length,1);
  assert.equal(h.results[0][2],false);
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
  assert.equal(h.results.length,6,'each found word is recorded once');
  assert.deepEqual(h.results[5].slice(0,4),['vocabulary','word-hunt',true,false]);
  assert.equal(h.results[5][4].trackAdaptive,false);
  h.click('[data-wh-next]');
  assert.match(h.root.innerHTML,/Food Market/);
});

test('a straight-line miss is tracked without blocking retries or adding a score penalty',()=>{
  const h=createHarness();
  h.window.EPIPHANY_WORD_HUNT.open();
  h.click('[data-wh-level]',{whLevel:'easy'});
  h.click('[data-wh-cell]',{whCell:'0-0'});
  h.click('[data-wh-cell]',{whCell:'0-1'});
  assert.equal(h.results.length,1);
  assert.equal(h.results[0][2],false);
  assert.equal(h.results[0][4].trackAdaptive,false);
  assert.match(h.root.innerHTML,/there is no penalty/i);
  assert.match(h.root.innerHTML,/0 <span>\/ 6 found/);
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
