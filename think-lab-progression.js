/* Shared Think Lab game registry and safe progress snapshot contract. */
(() => {
  'use strict';
  const definitions = [
    {id:'odd',name:'Odd One Out',skill:'vocabulary',adapter:'think-lab',levelModel:'training-mode',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'translator',name:'The Bold Translator',skill:'conversation',adapter:'think-lab',levelModel:'cefr',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'wordladder',name:'Word Ladder',skill:'spelling',adapter:'think-lab',levelModel:'training-mode',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'maze',name:'The Sound Maze',skill:'listening',adapter:'think-lab',levelModel:'cefr',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'connections',name:'Word Connections',skill:'vocabulary',adapter:'think-lab',levelModel:'training-mode',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'scramble',name:'Sentence Scramble',skill:'grammar',adapter:'think-lab',levelModel:'training-mode',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'forge',name:'Word Forge',skill:'spelling',adapter:'think-lab',levelModel:'training-mode',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'chain',name:'Chain Reaction',skill:'vocabulary',adapter:'think-lab',levelModel:'training-mode',trainingModes:['guided','steady','challenge'],supportsResume:true},
    {id:'wordhunt',name:'Word Hunt',skill:'vocabulary',adapter:'word-hunt',levelModel:'puzzle-level',trainingModes:[],supportsResume:true},
    {id:'codebreaker',name:'Codebreaker',skill:'vocabulary',adapter:'codebreaker',levelModel:'puzzle-level',trainingModes:[],supportsResume:true},
    {id:'lettergrid',name:'Letter Path',skill:'vocabulary',adapter:'letter-grid',levelModel:'puzzle-level',trainingModes:[],supportsResume:true}
  ].map(item => Object.freeze({...item,trainingModes:Object.freeze(item.trainingModes.slice())}));
  const byId = new Map(definitions.map(item => [item.id,item]));
  const SKILL_IDS = Object.freeze(['vocabulary','grammar','listening','conversation','reading','spelling']);
  const TRAINING_MODES = Object.freeze(['guided','steady','challenge']);
  const MAX_SNAPSHOT_BYTES = 65536;
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const validId = id => typeof id === 'string' && byId.has(id);
  const validDateKey = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(value + 'T12:00:00.000Z').getTime()) && new Date(value + 'T12:00:00.000Z').toISOString().slice(0,10) === value;
  const plainObject = value => !!value && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

  function getRegistry() { return definitions.map(item => ({...item,trainingModes:item.trainingModes.slice()})); }
  function getGame(id) {
    const item = byId.get(String(id || '').trim().toLowerCase());
    return item ? {...item,trainingModes:item.trainingModes.slice()} : null;
  }
  function validateSnapshot(input, expected = {}) {
    const fail = reason => ({valid:false,reason,snapshot:null});
    if (!plainObject(input)) return fail('snapshot-not-object');
    if (input.schemaVersion !== 1) return fail('unsupported-schema');
    if (!validId(input.gameId)) return fail('unknown-game');
    if (typeof input.bankVersion !== 'string' || !input.bankVersion.trim() || input.bankVersion.length > 80) return fail('invalid-bank-version');
    if (typeof input.level !== 'string' || !/^[A-Za-z0-9_-]{1,24}$/.test(input.level)) return fail('invalid-level');
    if (!Number.isSafeInteger(input.position) || input.position < 0 || input.position > 10000) return fail('invalid-position');
    if (input.trainingMode !== null && input.trainingMode !== undefined && !TRAINING_MODES.includes(input.trainingMode)) return fail('invalid-training-mode');
    if (!plainObject(input.payload)) return fail('invalid-payload');
    let serialized;
    try { serialized = JSON.stringify(input); } catch { return fail('unserializable-snapshot'); }
    if (typeof serialized !== 'string' || serialized.length > MAX_SNAPSHOT_BYTES) return fail('snapshot-too-large');
    if (expected.gameId && input.gameId !== expected.gameId) return fail('game-mismatch');
    if (expected.bankVersion && input.bankVersion !== expected.bankVersion) return fail('bank-version-mismatch');
    if (expected.level && input.level !== expected.level) return fail('level-mismatch');
    if (expected.trainingMode && input.trainingMode !== expected.trainingMode) return fail('training-mode-mismatch');
    return {valid:true,reason:null,snapshot:clone(input)};
  }

  function createStore(readState, writeState, now = () => new Date().toISOString()) {
    if (typeof readState !== 'function' || typeof writeState !== 'function') throw new TypeError('Progress store requires read and write callbacks.');
    function current() {
      let value;
      try { value = readState(); } catch { value = null; }
      if (plainObject(value) && value.version === 1 && plainObject(value.games) && plainObject(value.snapshots) && Array.isArray(value.recentGames)) return value;
      const fresh = {version:1,games:{},snapshots:{},recentGames:[]};
      writeState(fresh);
      return fresh;
    }
    function commit(value) { writeState(value); return value; }
    function recordStart(gameId, context = {}) {
      if (!validId(gameId)) return false;
      const state = current(), timestamp = now();
      const previous = plainObject(state.games[gameId]) ? state.games[gameId] : {};
      const next = {...previous,launchCount:(Number(previous.launchCount)||0)+1,lastPlayedAt:timestamp};
      if (typeof context.level === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(context.level)) next.lastLevel = context.level;
      if (TRAINING_MODES.includes(context.trainingMode)) next.lastTrainingMode = context.trainingMode;
      state.games[gameId] = next;
      state.recentGames = [gameId,...state.recentGames.filter(id => id !== gameId && validId(id))].slice(0,30);
      commit(state);
      return clone(next);
    }
    function saveSnapshot(gameId, input) {
      if (!validId(gameId)) return {saved:false,reason:'unknown-game'};
      if (!plainObject(input)) return {saved:false,reason:'snapshot-not-object'};
      const candidate = {...input,gameId,schemaVersion:1,updatedAt:now()};
      const checked = validateSnapshot(candidate);
      if (!checked.valid) return {saved:false,reason:checked.reason};
      const state = current();
      state.snapshots[gameId] = checked.snapshot;
      const history = plainObject(state.games[gameId]) ? state.games[gameId] : {};
      state.games[gameId] = {...history,lastPlayedAt:checked.snapshot.updatedAt,lastLevel:checked.snapshot.level};
      commit(state);
      return {saved:true,snapshot:clone(checked.snapshot)};
    }
    function getSnapshot(gameId, expected = {}) {
      if (!validId(gameId)) return null;
      const state = current(), snapshot = state.snapshots[gameId];
      if (!snapshot) return null;
      const checked = validateSnapshot(snapshot,{...expected,gameId});
      if (!checked.valid) {
        delete state.snapshots[gameId];
        commit(state);
        return null;
      }
      return checked.snapshot;
    }
    function clearSnapshot(gameId) {
      if (!validId(gameId)) return false;
      const state = current();
      if (!Object.prototype.hasOwnProperty.call(state.snapshots,gameId)) return false;
      delete state.snapshots[gameId];
      commit(state);
      return true;
    }
    function recordCompletion(gameId, kind = 'round') {
      if (!validId(gameId) || !['round','session'].includes(kind)) return false;
      const state = current(), previous = plainObject(state.games[gameId]) ? state.games[gameId] : {};
      const field = kind === 'session' ? 'completedSessions' : 'completedRounds';
      const next = {...previous,[field]:Math.max(0,Number(previous[field])||0)+1,lastCompletedAt:now()};
      state.games[gameId] = next;
      commit(state);
      return clone(next);
    }
    function getDailyChallenge(date) {
      if (!validDateKey(date)) return null;
      const state = current(), records = plainObject(state.dailyChallenges) ? state.dailyChallenges : {};
      const record = records[date];
      return plainObject(record) ? clone(record) : null;
    }
    function startDailyChallenge(challenge) {
      if (!plainObject(challenge) || !validDateKey(challenge.date) || !validId(challenge.gameId) ||
          !/^(A1|A2|B1|B2|C1|C2)$/.test(challenge.level) ||
          !Number.isSafeInteger(challenge.seed) || challenge.seed < 0 || challenge.seed > 0xffffffff) return false;
      const state = current(), records = plainObject(state.dailyChallenges) ? state.dailyChallenges : (state.dailyChallenges = {});
      const existing = records[challenge.date];
      if (plainObject(existing)) {
        if (existing.gameId !== challenge.gameId || existing.level !== challenge.level || existing.seed !== challenge.seed) return false;
        return clone(existing);
      }
      const record = {
        date:challenge.date, gameId:challenge.gameId, level:challenge.level, seed:challenge.seed,
        challengeId:typeof challenge.challengeId === 'string' ? challenge.challengeId.slice(0,100) : challenge.gameId + ':' + challenge.seed.toString(36),
        status:'active', startedAt:now(), completedAt:null, snapshot:null
      };
      records[challenge.date] = record;
      Object.keys(records).sort().slice(0, Math.max(0,Object.keys(records).length-30)).forEach(key => { delete records[key]; });
      commit(state);
      return clone(record);
    }
    function saveDailyChallengeSnapshot(date, gameId, input) {
      if (!validDateKey(date) || !validId(gameId) || !plainObject(input)) return {saved:false,reason:'invalid-request'};
      const state = current(), records = plainObject(state.dailyChallenges) ? state.dailyChallenges : {};
      const record = records[date];
      if (!plainObject(record) || record.gameId !== gameId || record.status !== 'active') return {saved:false,reason:'challenge-not-active'};
      const candidate = {...input,gameId,schemaVersion:1,updatedAt:now()};
      const checked = validateSnapshot(candidate);
      if (!checked.valid) return {saved:false,reason:checked.reason};
      record.snapshot = checked.snapshot;
      commit(state);
      return {saved:true,snapshot:clone(checked.snapshot)};
    }
    function clearDailyChallengeSnapshots(gameId) {
      if (!validId(gameId)) return 0;
      const state = current(), records = plainObject(state.dailyChallenges) ? state.dailyChallenges : {};
      let cleared = 0;
      for (const record of Object.values(records)) {
        if (plainObject(record) && record.gameId === gameId && record.snapshot) {
          record.snapshot = null;
          cleared++;
        }
      }
      if (cleared) commit(state);
      return cleared;
    }
    function completeDailyChallenge(date, gameId) {
      if (!validDateKey(date) || !validId(gameId)) return {completed:false,reason:'invalid-request'};
      const state = current(), records = plainObject(state.dailyChallenges) ? state.dailyChallenges : {};
      const record = records[date];
      if (!plainObject(record) || record.gameId !== gameId) return {completed:false,reason:'challenge-not-started'};
      if (record.status === 'completed') return {completed:false,duplicate:true,record:clone(record)};
      if (record.status !== 'active') return {completed:false,reason:'invalid-status'};
      record.status = 'completed';
      record.completedAt = now();
      record.snapshot = null;
      commit(state);
      return {completed:true,duplicate:false,record:clone(record)};
    }
    function getHistory() {
      const state = current();
      return {games:clone(state.games),recentGames:state.recentGames.filter(validId).slice()};
    }
    function getGameProgress(gameId) {
      if (!validId(gameId)) return null;
      const state = current();
      return plainObject(state.games[gameId]) ? clone(state.games[gameId]) : null;
    }
    return Object.freeze({recordStart,saveSnapshot,getSnapshot,clearSnapshot,recordCompletion,getHistory,getGameProgress,getDailyChallenge,startDailyChallenge,saveDailyChallengeSnapshot,clearDailyChallengeSnapshots,completeDailyChallenge});
  }

  function selectDailyChallenge(options = {}) {
    const date = options.date, level = String(options.level || '').toUpperCase();
    if (!validDateKey(date) || !/^(A1|A2|B1|B2|C1|C2)$/.test(level)) return null;
    const available = Array.isArray(options.availableGameIds) ? [...new Set(options.availableGameIds.filter(validId))] : [];
    if (!available.length) return null;
    let hash = 2166136261;
    const source = date + '|' + level;
    for (let i = 0; i < source.length; i++) { hash ^= source.charCodeAt(i); hash = Math.imul(hash,16777619); }
    const seed = hash >>> 0, gameId = available[seed % available.length];
    return {date,level,gameId,seed,challengeId:gameId + ':' + seed.toString(36)};
  }

  function recommendNext(options = {}) {
    const history = plainObject(options.history) ? options.history : {};
    const gameHistory = plainObject(history.games) ? history.games : {};
    const recent = Array.isArray(history.recentGames) ? history.recentGames.filter(validId) : [];
    const signals = plainObject(options.signals) ? options.signals : {};
    const available = Array.isArray(options.availableGameIds)
      ? new Set(options.availableGameIds.filter(validId))
      : new Set(definitions.map(game => game.id));
    const candidates = definitions.filter(game => available.has(game.id) && game.adapter && game.supportsResume);
    if (!candidates.length) return null;
    const signalRows = SKILL_IDS.map(skill => {
      const value = plainObject(signals[skill]) ? signals[skill] : {};
      const attempts = Math.max(0, Number(value.attempts) || 0);
      const errors = Math.max(0, Number(value.errors) || 0);
      const correct = Math.max(0, Number(value.correct) || 0);
      return {skill,attempts,errors,correct,accuracy:attempts ? Math.round(correct / attempts * 100) : null};
    }).filter(row => row.attempts >= 2 && row.errors > 0)
      .sort((a,b) => (a.accuracy-b.accuracy) || (b.errors-a.errors) || (b.attempts-a.attempts));
    const recentSet = new Set(recent.slice(0,2));
    const chooseLeastUsed = pool => {
      const alternatives = pool.filter(game => !recentSet.has(game.id));
      const source = alternatives.length ? alternatives : pool;
      return source.slice().sort((a,b) => {
        const ah = plainObject(gameHistory[a.id]) ? gameHistory[a.id] : {};
        const bh = plainObject(gameHistory[b.id]) ? gameHistory[b.id] : {};
        const aUsage = Math.max(0,Number(ah.launchCount)||0) + Math.max(0,Number(ah.completedRounds)||0) * 0.5;
        const bUsage = Math.max(0,Number(bh.launchCount)||0) + Math.max(0,Number(bh.completedRounds)||0) * 0.5;
        return aUsage-bUsage || definitions.indexOf(a)-definitions.indexOf(b);
      })[0];
    };
    for (const signal of signalRows) {
      const matching = candidates.filter(game => game.skill === signal.skill);
      if (!matching.length) continue;
      const selected = chooseLeastUsed(matching);
      return {
        game:selected.id, skill:signal.skill, label:selected.name, title:selected.name,
        hint:'A focused activity for '+signal.skill+' practice.',
        attempts:signal.attempts, accuracy:signal.accuracy,
        reason:'Chosen from your '+signal.skill+' results and recent game history.',
        kind:'skill'
      };
    }
    const selected = chooseLeastUsed(candidates);
    const previous = recent[0];
    return {
      game:selected.id, skill:selected.skill, label:selected.name, title:selected.name,
      hint:'A short activity to build a clearer picture of your strengths.',
      attempts:0, accuracy:null,
      reason:previous && previous !== selected.id
        ? 'A fresh activity, selected from games you have played less often.'
        : 'Start here to build your personal practice history.',
      kind:'starter'
    };
  }

  const api = Object.freeze({version:1,getRegistry,getGame,validateSnapshot,createStore,recommendNext,selectDailyChallenge,skillIds:SKILL_IDS.slice(),trainingModes:TRAINING_MODES.slice()});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.EPIPHANY_THINK_LAB_PROGRESSION = api;
})();
