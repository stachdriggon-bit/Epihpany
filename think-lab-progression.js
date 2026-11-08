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
    function getHistory() {
      const state = current();
      return {games:clone(state.games),recentGames:state.recentGames.filter(validId).slice()};
    }
    function getGameProgress(gameId) {
      if (!validId(gameId)) return null;
      const state = current();
      return plainObject(state.games[gameId]) ? clone(state.games[gameId]) : null;
    }
    return Object.freeze({recordStart,saveSnapshot,getSnapshot,clearSnapshot,recordCompletion,getHistory,getGameProgress});
  }

  const api = Object.freeze({version:1,getRegistry,getGame,validateSnapshot,createStore,skillIds:SKILL_IDS.slice(),trainingModes:TRAINING_MODES.slice()});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.EPIPHANY_THINK_LAB_PROGRESSION = api;
})();
