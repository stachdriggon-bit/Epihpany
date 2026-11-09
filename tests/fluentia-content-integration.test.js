const test = require('node:test');
const assert = require('node:assert/strict');
const textwise = require('../fluentia-textwise-bank.js');
const soundMaze = require('../sound-maze-content.js');
const soundscapeDictation = require('../fluentia-soundscape-bank.js');
const AdapterFactory = require('../fluentia-adapters.js');
const SoundMazeTools = require('../sound-maze-bank.js');

test('Textwise sequencing has independent reviewed content across all six CEFR levels', () => {
  assert.equal(textwise.length, 36);
  const counts = Object.fromEntries(['A1','A2','B1','B2','C1','C2'].map(level => [level, textwise.filter(item => item.level === level).length]));
  assert.deepEqual(counts, {A1:6,A2:6,B1:6,B2:6,C1:6,C2:6});
  assert.equal(new Set(textwise.map(item => item.id)).size, textwise.length);
  assert.ok(textwise.every(item => Array.isArray(item.steps) && item.steps.length >= 3));
  assert.ok(textwise.every(item => !/story|episode|character/i.test(item.source || '')));
});

test('Sound Maze source passes its canonical bank contract and exposes 36 items per CEFR level', () => {
  const validation = SoundMazeTools.validateBank(soundMaze);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  const adapters = AdapterFactory.createAdapters({soundMazeBank:soundMaze});
  const adapter = adapters.find(item => item.id === 'soundscape-sound-maze');
  assert.ok(adapter);
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    const items = adapter.getItems({level});
    assert.equal(items.length, 36, level);
    assert.ok(items.every(item => item.level === level));
    assert.equal(new Set(items.map(item => item.id)).size, 36);
  }
});

test('Sound Maze adapter keeps listening answer validation separate from spelling display order', () => {
  const adapters = AdapterFactory.createAdapters({soundMazeBank:soundMaze});
  const adapter = adapters.find(item => item.id === 'soundscape-sound-maze');
  const item = adapter.getItems({level:'A1'})[0];
  assert.equal(adapter.evaluate(item, item.target).correct, true);
  const wrong = item.options.find(option => option !== item.target);
  assert.equal(adapter.evaluate(item, wrong).correct, false);
});

test('Soundscape dictation has six authored transcription items at every CEFR level', () => {
  assert.equal(soundscapeDictation.length, 36);
  const counts = Object.fromEntries(['A1','A2','B1','B2','C1','C2'].map(level => [level, soundscapeDictation.filter(item => item.level === level).length]));
  assert.deepEqual(counts, {A1:6,A2:6,B1:6,B2:6,C1:6,C2:6});
  assert.equal(new Set(soundscapeDictation.map(item=>item.id)).size, soundscapeDictation.length);
  const adapter = AdapterFactory.createAdapters({soundscapeDictationBank:soundscapeDictation}).find(item=>item.id==='soundscape-dictation-bank');
  assert.ok(adapter);
  for (const level of ['A1','A2','B1','B2','C1','C2']) {
    const items=adapter.getItems({level});
    assert.equal(items.length,6,level);
    assert.ok(items.every(item=>item.level===level));
  }
  const item=adapter.getItems({level:'C2'})[0];
  assert.equal(adapter.evaluate(item,item.text).correct,true);
  assert.equal(adapter.evaluate(item,'unrelated words').correct,false);
});


test('Textwise sequencing content has unique prompts and complete, non-repeating step sequences', () => {
  const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  assert.equal(textwise.length, 36);
  assert.equal(new Set(textwise.map(item => normalize(item.title))).size, textwise.length, 'sequence titles must be unique');
  assert.equal(new Set(textwise.map(item => normalize(item.text))).size, textwise.length, 'sequence contexts must be unique');
  for (const item of textwise) {
    assert.ok(item.title.trim(), item.id + ' needs a title');
    assert.ok(item.text.trim(), item.id + ' needs a context');
    assert.ok(item.steps.length >= 3, item.id + ' needs at least three steps');
    assert.equal(new Set(item.steps.map(normalize)).size, item.steps.length, item.id + ' must not repeat a step');
    assert.ok(item.steps.every(step => normalize(step).length >= 8), item.id + ' contains an empty or implausibly short step');
  }
});

test('Soundscape dictation content has unique level-tagged transcripts and usable instructions', () => {
  const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  assert.equal(soundscapeDictation.length, 36);
  assert.equal(new Set(soundscapeDictation.map(item => normalize(item.text))).size, soundscapeDictation.length);
  for (const item of soundscapeDictation) {
    assert.ok(['A1','A2','B1','B2','C1','C2'].includes(item.level), item.id + ' needs an explicit CEFR level');
    assert.ok(item.text.trim().split(/\s+/).length >= 5, item.id + ' transcript is too short for dictation');
    assert.ok(item.prompt.trim(), item.id + ' needs a learner instruction');
    assert.ok(item.explanation.trim(), item.id + ' needs learning feedback');
  }
});
