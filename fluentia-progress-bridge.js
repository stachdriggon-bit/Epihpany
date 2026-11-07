/* Fluentia ↔ legacy progress compatibility bridge.
   Adds an idempotent, bounded history to the existing profile without awarding XP
   or changing legacy review schedules/reward counters. */
(function attachFluentiaProgressBridge(root) {
  'use strict';
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  function createBridge(readState, writeHistory) {
    if (typeof readState !== 'function') throw new TypeError('A state reader is required.');
    function getReviewSnapshot() {
      const state = readState() || {};
      return {
        review: clone(Array.isArray(state.review) ? state.review : []),
        words: clone(Array.isArray(state.words) ? state.words : []),
        mistakeTrapErrors: clone(state.mistakeTrapErrors || {}),
        mistakeQuestionErrors: clone(state.mistakeQuestionErrors || {}),
        mistakeTrapCorrect: clone(state.mistakeTrapCorrect || {}),
        adaptiveSignals: clone(state.adaptiveSignals || {})
      };
    }
    function toLegacyResult(event) {
      if (!event || typeof event !== 'object' || typeof event.correct !== 'boolean') {
        throw new TypeError('A normalized Fluentia result event is required.');
      }
      return {
        source: 'fluentia',
        game: String(event.sourceActivityId || event.activityId || ''),
        questionId: String(event.itemId || ''),
        level: String(event.level || ''),
        correct: event.correct,
        trap: String(event.errorType || ''),
        skill: String(event.skill || ''),
        domain: String(event.domain || ''),
        activityId: String(event.activityId || ''),
        sessionId: String(event.sessionId || ''),
        eventId: String(event.eventId || ''),
        answeredAt: String(event.answeredAt || '')
      };
    }
    function getHistory() {
      const state = readState() || {};
      return clone(Array.isArray(state.fluentiaHistory) ? state.fluentiaHistory : []);
    }
    function recordEvent(event) {
      const projected = toLegacyResult(event);
      if (!projected.eventId || !projected.sessionId || !projected.activityId || !projected.questionId) {
        throw new TypeError('Fluentia result event is missing stable attribution fields.');
      }
      const history = getHistory();
      if (history.some(row => row && row.eventId === projected.eventId)) return {stored:false, duplicate:true, history};
      const next = history.concat([projected]).slice(-500);
      if (typeof writeHistory === 'function') writeHistory(clone(next));
      return {stored:true, duplicate:false, history:clone(next)};
    }
    return Object.freeze({getReviewSnapshot, toLegacyResult, getHistory, recordEvent});
  }
  const api = Object.freeze({version:'1.1.0', createBridge});
  if (root) root.EPIPHANY_FLUENTIA_PROGRESS_BRIDGE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
