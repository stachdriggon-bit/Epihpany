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


test('player-facing cryptograms contain no semantic answer clues',()=>{
  for(const list of Object.values(bank.puzzles)) for(const puzzle of list){
    assert.equal(Object.hasOwn(puzzle,'clue'),false,puzzle.id+' must not carry a semantic clue');
  }
  assert.equal(bank.validatePuzzle({...bank.puzzles.easy[0],clue:'A fruit you can eat.'},'easy').valid,false);
});

test('Hard 01 starts with a more useful structural foothold without revealing a word',()=>{
  const puzzle=bank.puzzles.hard.find(item=>item.id==='cb-hard-01');
  assert.equal(JSON.stringify(puzzle.known.map(pair=>[pair.cipher,pair.plain])),JSON.stringify([['O','A'],['P','L']]));
  const partialWords=puzzle.cipher.split(' ').map(word=>[...word].map(letter=>({O:'A',P:'L'}[letter]||'·')).join(''));
  assert.equal(JSON.stringify(partialWords),JSON.stringify(['A','·L·A·','·LA·','·A···','·A··','····','·A····']));
  assert.equal(puzzle.known.length,2);
});

test('Easy bank uses repeated-letter patterns as a visible deduction mechanic',()=>{
  for(const puzzle of bank.puzzles.easy){
    assert.equal(puzzle.answer.length,5,puzzle.id);
    const repeated=new Set([...puzzle.answer].filter((letter,index,all)=>all.indexOf(letter)!==index));
    assert.ok(repeated.size>0,puzzle.id+' must have a repeated plaintext pattern');
    assert.ok(puzzle.known.some(pair=>repeated.has(pair.plain)),puzzle.id+' starter key must touch a repeated group');
    assert.equal(bank.validatePuzzle(puzzle,'easy').valid,true,puzzle.id);
  }
});

test('Medium 01 starter key exposes a useful cross-word anchor',()=>{
  const puzzle=bank.puzzles.medium.find(item=>item.id==='cb-medium-01');
  assert.deepEqual(puzzle.known.map(pair=>[pair.cipher,pair.plain]),[['O','K'],['R','I'],['V','D']]);
  const words=puzzle.cipher.split(' ');
  assert.ok(words[0].includes('V')&&words[1].includes('V'));
  assert.equal(bank.validatePuzzle(puzzle,'medium').valid,true);
});

test('Expert starter mappings are balanced by actual message frequency',()=>{
  for(const puzzle of bank.puzzles.expert){
    const plain=puzzle.known[0].plain;
    const occurrences=[...puzzle.answer].filter(letter=>letter===plain).length;
    assert.ok(occurrences>=4&&occurrences<=8,puzzle.id+' starter letter frequency '+occurrences);
    assert.equal(bank.validatePuzzle(puzzle,'expert').valid,true,puzzle.id);
  }
});

test('quality analysis reports within-word patterns and cross-word links without claiming unique solutions',()=>{
  const puzzle=bank.puzzles.medium.find(item=>item.id==='cb-medium-01');
  const report=bank.analyzePuzzle(puzzle);
  assert.ok(Array.isArray(report.repeatedWords));
  assert.ok(report.crossWordLetters.some(item=>item.letter==='V'&&item.words.includes(1)&&item.words.includes(2)));
  assert.equal(report.unresolvedDistinctLetters>0,true);
  const quality=bank.qualityReport();
  assert.equal(quality.easy.length,12);
  assert.equal(quality.medium.length,12);
  assert.equal(quality.expert.length,12);
  assert.ok(quality.easy.every(item=>item.validation.valid));
});
