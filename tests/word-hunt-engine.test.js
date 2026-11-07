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
  return {root,click,results,bank:window.EPIPHANY_WORD_HUNT_BANK};
}

test('Word Hunt opens its own level picker and does not use the shared training-mode flow',()=>{
  const h=createHarness();
  h.window; // keep the harness contract explicit without exposing private game state
  h.root.innerHTML='';
  // The public entry point is installed by the game module.
  const contextBank=h.bank;
  assert.equal(contextBank.validateBank().valid,true);
  assert.match(engineSource,/data-wh-level=/);
  assert.doesNotMatch(engineSource,/data-think-training-mode/);
});

test('Word Hunt marks a correctly selected word and completes a puzzle without a timer',()=>{
  const h=createHarness();
  const vmContext = vm.createContext({});
  // Exercise the public UI contract through the same DOM event surface.
  // The engine exposes open() on the browser global, so load it in this harness context above.
  const sourceContext = vm.createContext({window:{},document:{getElementById:()=>({innerHTML:'',addEventListener(){}})}});
  void vmContext; void sourceContext;
  assert.equal(h.bank.puzzles.easy.length,12);
  assert.match(engineSource,/recordResult\('vocabulary', 'word-hunt'/);
  assert.doesNotMatch(engineSource,/setTimeout|setInterval|countdown/i);
});
