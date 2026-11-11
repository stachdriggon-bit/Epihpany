const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const serverSource=fs.readFileSync(path.join(process.cwd(),'supabase/functions/velorn-word-forge/word-forge-bank.js'),'utf8');
const context=vm.createContext({});
vm.runInContext(serverSource,context,{filename:'word-forge-bank.js',timeout:5000});
const bank=context.EPIPHANY_WORD_FORGE_BANK;
const publicSource=fs.readFileSync(path.join(process.cwd(),'word-forge-bank.js'),'utf8');

test('canonical server Word Forge bank validates all 72 questions across three 24-question modes',()=>{
  assert.equal(bank.validateBank().valid,true,bank.validateBank().errors.join('; '));
  assert.equal(bank.validateBank().totalChallenges,72);
  for(const mode of bank.modes){
    const round=bank.selectRound(mode,()=>0.37);
    assert.equal(round.length,24);
    assert.equal(new Set(round.map(item=>item.id)).size,24);
    assert.ok(round.every(item=>item.answerWord&&item.explain&&item.skill));
  }
});
test('browser Word Forge bank contains prompt metadata only',()=>{
  assert.equal(publicSource.includes('answerWord'),false);
  assert.equal(publicSource.includes('explain:'),false);
  assert.equal(publicSource.includes('skill:'),false);
});
