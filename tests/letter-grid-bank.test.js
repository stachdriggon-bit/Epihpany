const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','letter-grid-bank.js'),'utf8'),context,{filename:'letter-grid-bank.js',timeout:5000});
const bank=context.window.EPIPHANY_LETTER_GRID_BANK;

test('Letter Grid contains four independent levels and 48 fixed puzzles',()=>{
  assert.deepEqual(Object.keys(bank.levels),['easy','medium','hard','expert']);
  assert.equal(bank.validateBank().valid,true,bank.validateBank().errors.join('\n'));
  assert.equal(Object.values(bank.puzzles).flat().length,48);
  assert.equal(Object.values(bank.puzzles).flat().flatMap(p=>p.words).length,216);
  for(const [level,cfg] of Object.entries(bank.levels)){
    let diagonalSteps=0,turns=0;
    assert.equal(bank.puzzles[level].length,cfg.count,level);
    assert.equal(new Set(bank.puzzles[level].map(p=>p.id)).size,cfg.count,level+' puzzle IDs');
    for(const puzzle of bank.puzzles[level]){
      assert.equal(puzzle.grid.length,cfg.size,puzzle.id);
      assert.ok(puzzle.grid.every(row=>row.length===cfg.size),puzzle.id+' grid width');
      assert.equal(puzzle.words.length,cfg.wordsPerPuzzle,puzzle.id+' clue count');
      assert.equal(new Set(puzzle.words.map(w=>w.answer)).size,puzzle.words.length,puzzle.id+' unique answers');
      for(const word of puzzle.words){
        assert.ok(word.answer.length>=cfg.minWordLength&&word.answer.length<=cfg.maxWordLength,word.id);
        assert.equal(word.path.length,word.answer.length,word.id);
        for(let i=0;i<word.path.length;i++){
          const cell=word.path[i],row=Math.floor(cell/cfg.size),col=cell%cfg.size;
          assert.equal(puzzle.grid[row][col],word.answer[i],word.id+' path letter');
          if(i){
            const prev=word.path[i-1],pr=Math.floor(prev/cfg.size),pc=prev%cfg.size;
            assert.equal(Math.max(Math.abs(row-pr),Math.abs(col-pc)),1,word.id+' neighboring step');
            if(Math.abs(row-pr)===1&&Math.abs(col-pc)===1)diagonalSteps++;
            if(i>1){const before=word.path[i-2],br=Math.floor(before/cfg.size),bc=before%cfg.size;if((pr-br)!==(row-pr)||(pc-bc)!==(col-pc))turns++;}
          }
        }
      }
    }
    assert.ok(diagonalSteps>0,level+' should include diagonal letter paths');
    assert.ok(turns>0,level+' should include turning letter paths');
  }
});

test('Letter Grid validator rejects broken paths, overlapping cells and duplicate targets',()=>{
  const original=bank.puzzles.easy[0];
  const brokenPath={...original,words:original.words.map((w,i)=>i===0?{...w,path:[w.path[0],w.path[0],...w.path.slice(2)]}:w)};
  assert.equal(bank.validatePuzzle(brokenPath,'easy').valid,false);
  const duplicate={...original,words:[...original.words.slice(0,-1),{...original.words[0],id:'duplicate'}]};
  assert.equal(bank.validatePuzzle(duplicate,'easy').valid,false);
  const badGrid={...original,grid:['ABC']};
  assert.equal(bank.validatePuzzle(badGrid,'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,words:[null]},'easy').valid,false);
  assert.equal(bank.validatePuzzle({...original,words:[{id:'bad',clue:'Broken',answer:null,path:[]}]},'easy').valid,false);
  assert.equal(bank.validateBank({...bank.puzzles,easy:bank.puzzles.easy.slice(1)}).valid,false);
});
