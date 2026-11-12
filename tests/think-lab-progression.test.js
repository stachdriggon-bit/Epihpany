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
  assert.equal(progression.validateSnapshot({...valid,payload:{large:'x'.repeat(70000)}}).reason, 'snapshot-too-large');
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

test('daily challenge selection is stable by local date and CEFR and only uses available registered games', () => {
  const options = {date:'2026-11-09',level:'A1',availableGameIds:['odd','maze','forge']};
  assert.deepEqual(progression.selectDailyChallenge(options),progression.selectDailyChallenge(options));
  assert.ok(options.availableGameIds.includes(progression.selectDailyChallenge(options).gameId));
  assert.equal(progression.selectDailyChallenge({...options,date:'2026-02-30'}),null);
  assert.equal(progression.selectDailyChallenge({...options,level:'A9'}),null);
  assert.equal(progression.selectDailyChallenge({...options,availableGameIds:['retired']}),null);
  assert.equal(progression.selectDailyChallenge({...options,availableGameIds:[]}),null);
});

test('daily challenge is persisted separately, resumes safely, and can complete only once per date', () => {
  const state = {xp:42,quests:3};
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; }, () => '2026-11-09T10:00:00.000Z');
  const selected = progression.selectDailyChallenge({date:'2026-11-09',level:'A1',availableGameIds:['odd','maze']});
  const started = store.startDailyChallenge(selected);
  assert.equal(started.status,'active');
  assert.deepEqual(store.startDailyChallenge(selected),started);
  assert.equal(store.startDailyChallenge({...selected,gameId:selected.gameId==='odd'?'maze':'odd'}),false);
  const regularSnapshot = {bankVersion:'regular-rounds-v1',level:'steady',trainingMode:'steady',position:0,payload:{pool:[{id:'regular'}],score:0}};
  assert.equal(store.saveSnapshot(selected.gameId,regularSnapshot).saved,true);
  const snapshot = {bankVersion:'think-lab-rounds-v1',level:'steady',trainingMode:'steady',position:0,payload:{pool:[{id:'one'}],score:0}};
  assert.equal(store.saveDailyChallengeSnapshot(selected.date,selected.gameId,snapshot).saved,true);
  assert.deepEqual(store.getDailyChallenge(selected.date).snapshot.payload.pool,snapshot.payload.pool);
  assert.equal(store.completeDailyChallenge(selected.date,selected.gameId).completed,true);
  assert.equal(store.getDailyChallenge(selected.date).snapshot,null);
  assert.deepEqual(store.getSnapshot(selected.gameId).payload.pool,regularSnapshot.payload.pool,'daily completion must preserve the regular game resume');
  assert.equal(store.completeDailyChallenge(selected.date,selected.gameId).duplicate,true);
  assert.equal(state.xp,42);
  assert.equal(state.quests,3);
});

test('server-backed game migration clears legacy daily snapshots without completing the challenge', () => {
  const state = {};
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; }, () => '2026-11-09T10:00:00.000Z');
  const sentence = progression.selectDailyChallenge({date:'2026-11-09',level:'A1',availableGameIds:['scramble']});
  const other = progression.selectDailyChallenge({date:'2026-11-08',level:'A1',availableGameIds:['maze']});
  store.startDailyChallenge(sentence);
  store.startDailyChallenge(other);
  const snapshot = {bankVersion:'legacy-local-sentence-v1',level:'A1',trainingMode:'steady',position:0,payload:{pool:[{sentence:'private answer'}]}};
  assert.equal(store.saveDailyChallengeSnapshot(sentence.date,sentence.gameId,snapshot).saved,true);
  assert.equal(store.saveDailyChallengeSnapshot(other.date,other.gameId,snapshot).saved,true);
  assert.equal(store.clearDailyChallengeSnapshots('scramble'),1);
  assert.equal(store.getDailyChallenge(sentence.date).snapshot,null);
  assert.equal(store.getDailyChallenge(sentence.date).status,'active');
  assert.deepEqual(store.getDailyChallenge(other.date).snapshot.payload.pool,snapshot.payload.pool);
  assert.equal(store.clearDailyChallengeSnapshots('scramble'),0);
});

test('daily challenge history is date-scoped and keeps yesterday separate from today', () => {
  const state = {};
  const store = progression.createStore(() => state.thinkLabProgress, value => { state.thinkLabProgress = value; }, () => '2026-11-09T10:00:00.000Z');
  const yesterday = progression.selectDailyChallenge({date:'2026-11-08',level:'A1',availableGameIds:['odd']});
  const today = progression.selectDailyChallenge({date:'2026-11-09',level:'A1',availableGameIds:['maze']});
  store.startDailyChallenge(yesterday); store.completeDailyChallenge(yesterday.date,yesterday.gameId); store.startDailyChallenge(today);
  assert.equal(store.getDailyChallenge(yesterday.date).status,'completed');
  assert.equal(store.getDailyChallenge(today.date).status,'active');
});

test('recommendation always targets a registered playable game and avoids recent games when alternatives exist', () => {
  const registry = progression.getRegistry();
  const result = progression.recommendNext({
    availableGameIds: registry.map(game => game.id),
    history: {games:{odd:{launchCount:8},translator:{launchCount:1}},recentGames:['odd','translator']},
    signals: {vocabulary:{attempts:6,correct:2,errors:4}}
  });
  assert.ok(registry.some(game => game.id === result.game));
  assert.notEqual(result.game,'odd');
  assert.equal(result.kind,'skill');
  assert.equal(result.skill,'vocabulary');
  assert.equal(result.accuracy,33);
});

test('recommendation rotates toward less-used games when there is not enough skill evidence', () => {
  const first = progression.recommendNext({history:{games:{odd:{launchCount:4}},recentGames:['odd']},signals:{}});
  assert.equal(first.game,'translator');
  assert.equal(first.kind,'starter');
  assert.equal(first.attempts,0);
});

test('recommendation skips unsupported skills and respects the available-game allowlist', () => {
  const result = progression.recommendNext({
    availableGameIds:['maze','translator'],
    history:{games:{maze:{launchCount:5},translator:{launchCount:1}},recentGames:['translator']},
    signals:{reading:{attempts:8,correct:1,errors:7},listening:{attempts:5,correct:1,errors:4}}
  });
  assert.equal(result.game,'maze');
  assert.equal(result.skill,'listening');
  assert.equal(progression.recommendNext({availableGameIds:[],signals:{}}),null);
});
