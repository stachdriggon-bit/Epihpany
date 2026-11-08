const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const bankSource=fs.readFileSync(path.join(__dirname,'..','codebreaker-bank.js'),'utf8');
const engineSource=fs.readFileSync(path.join(__dirname,'..','codebreaker.js'),'utf8');
function harness(){
  const listeners={},root={innerHTML:'',addEventListener(type,fn){listeners[type]=fn;},contains(){return true;}},results=[];
  const window={EpiphanyThinkLab:{recordResult(...args){results.push(args);}},EpiphanySpeech:{stop(){}}};
  const document={getElementById:id=>id==='think-lab-content'?root:null};
  const context=vm.createContext({window,document,Set,Map,Object,Array,String,Number,Math,CustomEvent:function(type){this.type=type;}});
  vm.runInContext(bankSource,context,{filename:'codebreaker-bank.js',timeout:5000});
  vm.runInContext(engineSource,context,{filename:'codebreaker.js',timeout:5000});
  function click(selector,dataset={}){
    const attrs=new Set([...selector.matchAll(/\[([^\]]+)\]/g)].map(m=>m[1]));
    const target={dataset,closest(query){return query.split(',').some(part=>part.trim()===selector)?this:null;},hasAttribute(name){return attrs.has(name);}};
    listeners.click({target});
  }
  return {root,click,results,window,bank:window.EPIPHANY_CODEBREAKER_BANK};
}

test('Codebreaker opens its own four-level picker and never uses shared training modes',()=>{
  const h=harness();h.window.EPIPHANY_CODEBREAKER.open();
  assert.match(h.root.innerHTML,/Choose your level/);
  assert.match(h.root.innerHTML,/How the code works/);
  assert.match(h.root.innerHTML,/O H H J S/);
  assert.doesNotMatch(h.root.innerHTML,/Use the clue/);
  for(const id of ['easy','medium','hard','expert'])assert.match(h.root.innerHTML,new RegExp('data-cb-level="'+id+'"'));
  assert.doesNotMatch(h.root.innerHTML,/Guided|Steady|Challenge/);
});

test('starter key, letter assignment and exact message checking complete a puzzle',()=>{
  const h=harness();h.window.EPIPHANY_CODEBREAKER.open();h.click('[data-cb-level]',{cbLevel:'easy'});
  assert.match(h.root.innerHTML,/ENCRYPTED MESSAGE/);
  assert.match(h.root.innerHTML,/same coded letter always means the same English letter/);
  assert.match(h.root.innerHTML,/Select a coded letter/);
  assert.doesNotMatch(h.root.innerHTML,/cb-clue|Clue/);
  h.click('[data-cb-symbol]',{cbSymbol:'J'});h.click('[data-cb-plain]',{cbPlain:'L'});
  h.click('[data-cb-symbol]',{cbSymbol:'S'});h.click('[data-cb-plain]',{cbPlain:'E'});
  h.click('[data-cb-check]');
  assert.match(h.root.innerHTML,/Message decoded!/);
  assert.match(h.root.innerHTML,/APPLE/);
  assert.equal(h.results.length,1);assert.equal(h.results[0][2],true);
});

test('the substitution key prevents assigning one plaintext letter to two coded letters',()=>{
  const h=harness();h.window.EPIPHANY_CODEBREAKER.open();h.click('[data-cb-level]',{cbLevel:'easy'});
  h.click('[data-cb-symbol]',{cbSymbol:'J'});h.click('[data-cb-plain]',{cbPlain:'P'});
  assert.match(h.root.innerHTML,/already assigned/);
  assert.equal(h.results.length,0);
});

test('Codebreaker offers structural hints before revealing a letter',()=>{
  const h=harness();h.window.EPIPHANY_CODEBREAKER.open();h.click('[data-cb-level]',{cbLevel:'hard'});
  h.click('[data-cb-hint]');
  assert.match(h.root.innerHTML,/Pattern hint:/);
  assert.doesNotMatch(h.root.innerHTML,/Key revealed:/);
  assert.match(h.root.innerHTML,/Cross-word hint/);
  h.click('[data-cb-hint]');
  assert.match(h.root.innerHTML,/Cross-word hint:/);
  assert.doesNotMatch(h.root.innerHTML,/Key revealed:/);
  h.click('[data-cb-hint]');
  assert.match(h.root.innerHTML,/Key revealed:/);
  assert.doesNotMatch(h.root.innerHTML,/A CLEAR PLAN MAKES HARD WORK EASIER/);
  assert.equal(h.results.length,0);
});

test('wrong complete decoding is retryable and recorded without a penalty system',()=>{
  const h=harness();h.window.EPIPHANY_CODEBREAKER.open();h.click('[data-cb-level]',{cbLevel:'easy'});
  h.click('[data-cb-symbol]',{cbSymbol:'J'});h.click('[data-cb-plain]',{cbPlain:'B'});
  h.click('[data-cb-symbol]',{cbSymbol:'S'});h.click('[data-cb-plain]',{cbPlain:'E'});
  h.click('[data-cb-check]');
  assert.match(h.root.innerHTML,/Not quite/);
  assert.match(h.root.innerHTML,/repeated-letter patterns and your existing key/);
  assert.doesNotMatch(h.root.innerHTML,/clue/i);
  assert.equal(h.results.length,1);assert.equal(h.results[0][2],false);
  assert.match(h.root.innerHTML,/data-cb-check/);
});
