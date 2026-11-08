const test = require('node:test');
const assert = require('node:assert/strict');
const progression = require('../think-lab-progression.js');

test('registry describes exactly the eleven playable Think Lab games with unique stable IDs', () => {
  const games = progression.getRegistry();
  assert.equal(games.length, 11);
  assert.equal(new Set(games.map(game => game.id)).size, 11);
  assert.deepEqual(games.map(game => game.id), ['odd','translator','wordladder','maze','connections','scramble','forge','chain','wordhunt','codebreaker','lettergrid']);
  for (const game of games) {
    assert.ok(progression.skillIds.includes(game.skill), game.id + ' must map to an approved skill');
    assert.ok(game.adapter && game.levelModel);
    assert.equal(game.supportsResume, true);
  }
});

test('registry returns defensive copies instead of exposing mutable definitions', () => {
  const first = progression.getRegistry();
  first[0].id = 'changed';
  first[0].trainingModes.push('unknown');
  assert.equal(progression.getGame('odd').id, 'odd');
  assert.deepEqual(progression.getGame('odd').trainingModes, ['guided','steady','challenge']);
  assert.equal(progression.getGame('missing'), null);
});

test('snapshot validation rejects unknown games, invalid modes, oversized or malformed state', () => {
  const valid = {schemaVersion:1,gameId:'wordhunt',bankVersion:'word-hunt-bank-v1',level:'easy',trainingMode:null,position:2,payload:{found:['apple']}};
  assert.equal(progression.validateSnapshot(valid).valid, true);
  assert.equal(progression.validateSnapshot({...valid,gameId:'retired'}).reason, 'unknown-game');
  assert.equal(progression.validateSnapshot({...valid,trainingMode:'expert'}).reason, 'invalid-training-mode');
  assert.equal(progression.validateSnapshot({...valid,position:-1}).reason, 'invalid-position');
  assert.equal(progression.validateSnapshot({...valid,payload:[]}).reason, 'invalid-payload');
  assert.equal(progression.validateSnapshot({...valid,payload:{large:'x'.repeat(17000)}}).reason, 'snapshot-too-large');
  assert.equal(progression.validateSnapshot(valid,{bankVersion:'new-bank'}).reason, 'bank-version-mismatch');
  assert.equal(progression.validateSnapshot(valid,{level:'medium'}).reason, 'level-mismatch');
});

test('progress store records launches and bounded recent-game history without touching reward totals', () => {
  const state = {xp:125,quests:7};
  let writes = 0, clock = 0;
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; writes++; }, () => '2026-11-09T10:00:0' + clock++ + '.000Z');
  for (const game of progression.getRegistry()) store.recordStart(game.id,{trainingMode:'steady',level:'A1'});
  store.recordStart('odd',{trainingMode:'challenge'});
  const history = store.getHistory();
  assert.equal(history.games.odd.launchCount, 2);
  assert.equal(history.games.odd.lastTrainingMode, 'challenge');
  assert.equal(history.recentGames[0], 'odd');
  assert.equal(history.recentGames.length, 11);
  assert.equal(state.xp, 125);
  assert.equal(state.quests, 7);
  assert.ok(writes > 0);
});

test('save and restore accepts only matching game, bank, level and mode snapshots', () => {
  const state = {};
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; }, () => '2026-11-09T10:00:00.000Z');
  const snapshot = {bankVersion:'connections-bank-v2',level:'steady',trainingMode:'steady',position:4,payload:{selected:['a','b']}};
  assert.equal(store.saveSnapshot('connections',snapshot).saved, true);
  assert.deepEqual(store.getSnapshot('connections',{bankVersion:'connections-bank-v2',level:'steady',trainingMode:'steady'}).payload.selected,['a','b']);
  assert.equal(store.getSnapshot('connections',{bankVersion:'connections-bank-v3'}), null);
  assert.equal(store.getSnapshot('connections'), null, 'a stale snapshot is discarded safely');
  assert.equal(store.getGameProgress('connections').lastLevel, 'steady');
});

test('corrupt persisted snapshots are discarded without preventing other progress from loading', () => {
  const state = {thinkLabProgress:{version:1,games:{odd:{launchCount:2}},snapshots:{odd:{schemaVersion:99,gameId:'odd'}},recentGames:['odd']}};
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; }, () => '2026-11-09T10:00:00.000Z');
  assert.equal(store.getSnapshot('odd'), null);
  assert.equal(state.thinkLabProgress.games.odd.launchCount, 2);
  assert.equal(Object.hasOwn(state.thinkLabProgress.snapshots,'odd'), false);
  assert.equal(store.clearSnapshot('odd'), false);
});

test('completion counters are independent from XP and can be queried per game', () => {
  const state = {xp:42,quests:3};
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; }, () => '2026-11-09T10:00:00.000Z');
  store.recordCompletion('lettergrid','round');
  store.recordCompletion('lettergrid','session');
  assert.equal(store.getGameProgress('lettergrid').completedRounds,1);
  assert.equal(store.getGameProgress('lettergrid').completedSessions,1);
  assert.equal(state.xp,42);
  assert.equal(state.quests,3);
});
