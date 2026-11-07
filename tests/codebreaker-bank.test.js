const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','codebreaker-bank.js'),'utf8'),context,{filename:'codebreaker-bank.js',timeout:5000});
const bank=context.window.EPIPHANY_CODEBREAKER_BANK;

test('Codebreaker ships four independent levels with twelve fixed cryptograms each',()=>{
  assert.deepEqual(Object.keys(bank.levels),['easy','medium','hard','expert']);
  assert.equal(bank.validateBank().valid,true,bank.validateBank().errors.join('\n'));
  assert.equal(Object.values(bank.puzzles).flat().length,48);
  for(const [id,config] of Object.entries(bank.levels)){
    assert.equal(bank.puzzles[id].length,config.count,id);
    assert.equal(new Set(bank.puzzles[id].map(p=>p.id)).size,config.count,id+' unique ids');
  }
});

test('every cryptogram preserves spaces, punctuation and a one-to-one substitution',()=>{
  for(const [level,list] of Object.entries(bank.puzzles)) for(const puzzle of list){
    assert.equal(puzzle.cipher.length,puzzle.answer.length,puzzle.id);
    const reverse=new Map();
    for(let i=0;i<puzzle.answer.length;i++){
      const plain=puzzle.answer[i],coded=puzzle.cipher[i];
      assert.equal(plain===' '?coded===' ':true,true,puzzle.id+' spaces');
      if(/[A-Z]/.test(plain)){
        if(reverse.has(coded))assert.equal(reverse.get(coded),plain,puzzle.id+' substitution consistency');
        reverse.set(coded,plain);
      }
    }
    for(const pair of puzzle.known)assert.equal(reverse.get(pair.cipher),pair.plain,puzzle.id+' starter key');
    assert.ok(puzzle.known.length<reverse.size,puzzle.id+' must retain a deduction step');
    assert.equal(bank.validatePuzzle(puzzle,level).valid,true,puzzle.id);
  }
});

test('Codebreaker validator rejects inconsistent substitutions and invalid starter keys',()=>{
  const original=bank.puzzles.easy[0];
  const inconsistent={...original,cipher:'OHXJS'};
  assert.equal(bank.validatePuzzle(inconsistent,'easy').valid,false);
  const badKey={...original,known:[{cipher:'O',plain:'Z'},...original.known.slice(1)]};
  assert.equal(bank.validatePuzzle(badKey,'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,answer:'TOO LONG FOR EASY'},'easy').valid,false);
  assert.equal(bank.validateBank({...bank.puzzles,easy:bank.puzzles.easy.slice(1)}).valid,false);
});
