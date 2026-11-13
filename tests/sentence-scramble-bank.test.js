const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function normalizedText(sentence) {
  return String(sentence).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

function normalizedTokens(sentence) {
  return String(sentence).toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort();
}

test('Sentence Scramble bank contains 72 unique reviewed challenges in three equal modes', () => {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(root, 'sentence-scramble-bank.js'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'sentence-scramble-bank.js' }));
  vm.runInNewContext(source, context);

  const bank = context.window.EPIPHANY_SENTENCE_SCRAMBLE_BANK;
  assert.ok(bank, 'bank should expose its public global');
  assert.equal(bank.schemaVersion, 1);
  assert.equal(bank.gameId, 'sentence-scramble');
  assert.equal(bank.totalChallenges, 72);
  assert.equal(normalizedText('Can you help me please'), normalizedText('Can you help me, please?'), 'punctuation-only differences should normalize equally');

  const all = [];
  for (const [mode, prefix] of [['guided', 'SS-G-'], ['steady', 'SS-S-'], ['challenge', 'SS-C-']]) {
    assert.ok(Array.isArray(bank.modes[mode]), mode + ' should be an array');
    assert.equal(bank.modes[mode].length, 24, mode + ' should contain 24 challenges');
    for (const [index, item] of bank.modes[mode].entries()) {
      assert.equal(item.id, prefix + String(index + 1).padStart(3, '0'));
      assert.ok(item.sentence && item.sentence.trim(), item.id + ' needs a sentence');
      assert.ok(item.skill && item.skill.trim(), item.id + ' needs a skill note');
      assert.ok(item.explanation && item.explanation.trim(), item.id + ' needs an explanation field');
      assert.notEqual(normalizedText(item.explanation), normalizedText(item.skill), item.id + ' explanation must teach the sentence rather than repeat the skill note');
      assert.ok(item.prompt && item.prompt.trim(), item.id + ' needs a prompt');
      assert.ok(normalizedTokens(item.sentence).length > 0, item.id + ' must produce tiles');
      assert.ok(Array.isArray(item.acceptedAnswers), item.id + ' acceptedAnswers must be an array');
      for (const alternative of item.acceptedAnswers) {
        assert.notEqual(normalizedText(alternative), normalizedText(item.sentence), item.id + ' must not repeat its canonical answer');
        assert.deepEqual(normalizedTokens(alternative), normalizedTokens(item.sentence), item.id + ' alternatives must use the same word multiset');
      }
      all.push(item);
    }
  }

  assert.equal(all.length, 72);
  assert.equal(new Set(all.map(item => item.id)).size, 72, 'IDs must be unique');
  const sentences = all.map(item => item.sentence.toLowerCase().replace(/\s+/g, ' ').trim());
  assert.equal(new Set(sentences).size, 72, 'sentences must not be duplicated');
});

test('Sentence Scramble and Chain Reaction answer banks stay server-side while Think Lab uses secure sessions', () => {
  const lazy = fs.readFileSync(path.join(root, 'lazy-data.js'), 'utf8');
  const think = fs.readFileSync(path.join(root, 'think-lab.js'), 'utf8');
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const edge = fs.readFileSync(path.join(root, 'supabase/functions/velorn-think-lab-validator/index.ts'), 'utf8');

  // Canonical answers must never be shipped to or cached by the browser.
  assert.equal(lazy.includes('sentence-scramble-bank.js'), false);
  assert.equal(lazy.includes('chain-reaction-bank.js'), false);
  assert.equal(worker.includes("'./sentence-scramble-bank.js'"), false);
  assert.equal(worker.includes("'./chain-reaction-bank.js'"), false);
  assert.ok(edge.includes('import "../velorn-sentence-scramble/sentence-scramble-bank.js";'));
  assert.ok(edge.includes('import "../velorn-chain-reaction/chain-reaction-bank.js";'));

  // The browser receives only server-projected tiles/links and submits answers for verification.
  assert.equal(think.includes('EPIPHANY_SENTENCE_SCRAMBLE_BANK'), false);
  assert.equal(think.includes('EPIPHANY_CHAIN_REACTION_BANK'), false);
  assert.ok(think.includes("gameId:'sentence_scramble'"));
  assert.ok(think.includes("gameId:'chain_reaction'"));
  assert.ok(think.includes("action:'answer',gameId:'sentence_scramble'"));
  assert.ok(think.includes("action:'answer',gameId:'chain_reaction'"));
  const scrambleCheck = think.split("if(e.target.closest('[data-scramble-check]'))")[1]?.split("const chainAnswer=e.target.closest('[data-chain-answer]')")[0] || '';
  assert.ok(scrambleCheck, 'Sentence Scramble check handler should exist');
  assert.ok(scrambleCheck.includes('validatorClientForSession.functions.invoke'));
  assert.equal(scrambleCheck.includes('item.options[item.answer]'), false);
});
