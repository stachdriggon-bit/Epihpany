/* Fluentia shared practice/session engine.
   Phase 2 foundation: contracts and orchestration only.
   Activity renderers, source banks and legacy progress remain owned by their current modules. */
(() => {
  'use strict';

  const DOMAINS = Object.freeze([
    'wordcraft', 'sentence-studio', 'textwise',
    'soundscape', 'real-world', 'fine-sense'
  ]);
  const CEFR_LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  const INTERACTION_TYPES = Object.freeze([
    'choice', 'correction', 'typed', 'ordering', 'matching',
    'map', 'listening', 'speech', 'dynamic'
  ]);
  const SESSION_STATUSES = Object.freeze(['ready', 'active', 'paused', 'completed', 'abandoned']);
  const ERROR_CODES = Object.freeze({
    INVALID_CONFIG: 'FLUENTIA_INVALID_CONFIG',
    INVALID_ADAPTER: 'FLUENTIA_INVALID_ADAPTER',
    INVALID_ITEM: 'FLUENTIA_INVALID_ITEM',
    NO_ELIGIBLE_ITEMS: 'FLUENTIA_NO_ELIGIBLE_ITEMS',
    SESSION_NOT_ACTIVE: 'FLUENTIA_SESSION_NOT_ACTIVE',
    DUPLICATE_ANSWER: 'FLUENTIA_DUPLICATE_ANSWER',
    INVALID_SNAPSHOT: 'FLUENTIA_INVALID_SNAPSHOT'
  });

  class FluentiaError extends Error {
    constructor(code, message, details) {
      super(message);
      this.name = 'FluentiaError';
      this.code = code;
      this.details = details || null;
    }
  }

  const fail = (code, message, details) => { throw new FluentiaError(code, message, details); };
  const cleanId = value => typeof value === 'string' ? value.trim() : '';
  const normalizeLevel = value => {
    const level = String(value || '').trim().toUpperCase();
    return CEFR_LEVELS.includes(level) ? level : null;
  };
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const nowIso = clock => new Date(clock()).toISOString();

  function validateItem(item, activity) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      fail(ERROR_CODES.INVALID_ITEM, 'Activity items must be objects.', { activityId: activity.id });
    }
    const id = cleanId(item.id);
    if (!id) fail(ERROR_CODES.INVALID_ITEM, 'Every item requires a stable id.', { activityId: activity.id });
    const level = normalizeLevel(item.level || item.cefr);
    if (!level) fail(ERROR_CODES.INVALID_ITEM, 'Every session item requires an explicit CEFR level.', { activityId: activity.id, itemId: id });
    return { ...item, id, level };
  }

  function createEngine(options) {
    const config = options || {};
    const clock = typeof config.clock === 'function' ? config.clock : () => Date.now();
    const random = typeof config.random === 'function' ? config.random : Math.random;
    const adapters = new Map();

    function registerActivity(definition) {
      const activity = definition || {};
      const id = cleanId(activity.id);
      if (!id || !DOMAINS.includes(activity.domain) ||
          !INTERACTION_TYPES.includes(activity.interactionType) ||
          typeof activity.getItems !== 'function' ||
          typeof activity.evaluate !== 'function') {
        fail(ERROR_CODES.INVALID_ADAPTER, 'Activity adapter must define id, canonical domain, interactionType, getItems and evaluate.', { activityId: id || null });
      }
      if (adapters.has(id)) fail(ERROR_CODES.INVALID_ADAPTER, 'Activity ids must be unique.', { activityId: id });
      const normalized = Object.freeze({
        id, domain: activity.domain, interactionType: activity.interactionType,
        skills: Object.freeze(Array.isArray(activity.skills) ? activity.skills.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : []),
        getItems: activity.getItems,
        evaluate: activity.evaluate,
        getFeedback: typeof activity.getFeedback === 'function' ? activity.getFeedback : null,
        onProgress: typeof activity.onProgress === 'function' ? activity.onProgress : null
      });
      adapters.set(id, normalized);
      return () => adapters.delete(id);
    }

    function getEligibleActivities(scope, level, activityIds) {
      const allowed = Array.isArray(activityIds) && activityIds.length ? new Set(activityIds) : null;
      return Array.from(adapters.values()).filter(activity =>
        (!scope.domain || activity.domain === scope.domain) &&
        (!activity.reviewOnly || !!scope.includeReview || !!(allowed && allowed.has(activity.id))) &&
        (!allowed || allowed.has(activity.id)) &&
        (!scope.interactionTypes || scope.interactionTypes.includes(activity.interactionType)) &&
        (!scope.skills || !scope.skills.length || activity.skills.some(skill => scope.skills.includes(skill))) &&
        (() => {
          const items = activity.getItems({ level, domain: activity.domain, activityId: activity.id }) || [];
          const levelItems = items.filter(item => normalizeLevel(item && (item.level || item.cefr)) === level);
          levelItems.forEach(item => validateItem(item, activity));
          return levelItems.length > 0;
        })()
      );
    }

    function createSession(sessionConfig) {
      const cfg = sessionConfig || {};
      const level = normalizeLevel(cfg.level);
      if (!level) fail(ERROR_CODES.INVALID_CONFIG, 'A valid CEFR level (A1–C2) is required.');
      const mode = cfg.mode || 'single';
      if (!['single', 'section-mixed', 'fluentia-mix'].includes(mode)) {
        fail(ERROR_CODES.INVALID_CONFIG, 'Unknown session mode.', { mode });
      }
      const domain = cfg.domain || null;
      if (mode === 'section-mixed' && !DOMAINS.includes(domain)) {
        fail(ERROR_CODES.INVALID_CONFIG, 'Section Mixed requires one canonical domain.', { domain });
      }
      if (mode === 'fluentia-mix' && domain) {
        fail(ERROR_CODES.INVALID_CONFIG, 'Fluentia Mix must not be restricted to one domain.', { domain });
      }
      if (mode === 'single' && !cleanId(cfg.activityId)) {
        fail(ERROR_CODES.INVALID_CONFIG, 'Single-activity sessions require activityId.');
      }
      const scope = {
        domain,
        interactionTypes: Array.isArray(cfg.interactionTypes) ? cfg.interactionTypes.slice() : null,
        skills: Array.isArray(cfg.skills) ? cfg.skills.slice() : null,
        includeReview: cfg.includeReview === true
      };
      const activities = getEligibleActivities(scope, level, mode === 'single' ? [cfg.activityId] : cfg.activityIds);
      if (!activities.length) fail(ERROR_CODES.NO_ELIGIBLE_ITEMS, 'No registered activity has eligible items for this session.', { mode, domain, level });
      const targetCount = Number.isInteger(cfg.itemCount) && cfg.itemCount > 0 ? Math.min(cfg.itemCount, 100) : 10;
      const id = cleanId(cfg.sessionId) || 'fluentia-' + Math.floor(random() * 1e9).toString(36) + '-' + clock().toString(36);
      const session = {
        schemaVersion: 1, id, mode, domain, level, status: 'ready',
        createdAt: nowIso(clock), updatedAt: nowIso(clock),
        targetCount, completedCount: 0, correctCount: 0,
        activityIds: activities.map(activity => activity.id),
        seenItemKeys: [], activityUse: {}, domainUse: {},
        current: null, answers: [], lastActivityId: null,
        error: null
      };
      return session;
    }

    function selectNext(session) {
      assertSession(session);
      if (session.status !== 'ready' && session.status !== 'active') {
        fail(ERROR_CODES.SESSION_NOT_ACTIVE, 'Only ready or active sessions can select an item.', { status: session.status });
      }
      if (session.completedCount >= session.targetCount) {
        session.status = 'completed';
        session.updatedAt = nowIso(clock);
        return null;
      }
      const eligible = session.activityIds.map(id => adapters.get(id)).filter(Boolean);
      const candidates = [];
      for (const activity of eligible) {
        let items;
        try { items = activity.getItems({ level: session.level, domain: activity.domain, activityId: activity.id }) || []; }
        catch (error) { session.error = { code: 'ACTIVITY_SOURCE_FAILED', activityId: activity.id, message: String(error && error.message || error) }; continue; }
        for (const raw of items) {
          // Legacy banks may contain intentionally untagged records. Exclude them;
          // only validate items explicitly eligible for this learner's CEFR level.
          if (normalizeLevel(raw && (raw.level || raw.cefr)) !== session.level) continue;
          const item = validateItem(raw, activity);
          const key = activity.id + ':' + item.id;
          if (session.seenItemKeys.includes(key)) continue;
          candidates.push({ activity, item, key });
        }
      }
      if (!candidates.length) {
        session.status = 'completed';
        session.error = { code: ERROR_CODES.NO_ELIGIBLE_ITEMS, message: 'All eligible items have been used.' };
        session.updatedAt = nowIso(clock);
        return null;
      }
      const activityCounts = session.activityUse;
      const domainCounts = session.domainUse;
      const candidateActivityIds = Array.from(new Set(candidates.map(candidate => candidate.activity.id)));
      const minActivityUse = Math.min(...candidateActivityIds.map(id => activityCounts[id] || 0));
      let pool = candidates.filter(c => (activityCounts[c.activity.id] || 0) === minActivityUse);
      if (pool.length > 1 && session.lastActivityId) {
        const alternate = pool.filter(c => c.activity.id !== session.lastActivityId);
        if (alternate.length) pool = alternate;
      }
      const candidateDomains = Array.from(new Set(pool.map(c => c.activity.domain)));
      const minDomainUse = Math.min(...candidateDomains.map(d => domainCounts[d] || 0));
      const balanced = pool.filter(c => (domainCounts[c.activity.domain] || 0) === minDomainUse);
      const selected = balanced[Math.min(balanced.length - 1, Math.floor(Math.max(0, Math.min(0.999999999, Number(random()) || 0)) * balanced.length))];
      session.current = {
        activityId: selected.activity.id, domain: selected.activity.domain,
        interactionType: selected.activity.interactionType, item: clone(selected.item),
        itemKey: selected.key, presentedAt: nowIso(clock)
      };
      session.status = 'active';
      session.updatedAt = nowIso(clock);
      return clone(session.current);
    }

    function submitAnswer(session, answer, metadata) {
      assertSession(session);
      if (session.status !== 'active' || !session.current) {
        fail(ERROR_CODES.SESSION_NOT_ACTIVE, 'There is no active item awaiting an answer.', { status: session.status });
      }
      const current = session.current;
      const activity = adapters.get(current.activityId);
      if (!activity) fail(ERROR_CODES.INVALID_ADAPTER, 'The active activity adapter is no longer registered.', { activityId: current.activityId });
      let evaluation;
      try {
        evaluation = activity.evaluate(clone(current.item), answer, {
          level: session.level, domain: current.domain, interactionType: current.interactionType,
          sessionId: session.id, metadata: metadata || null
        });
      } catch (error) {
        fail('FLUENTIA_EVALUATION_FAILED', 'Activity answer evaluation failed.', {
          activityId: activity.id, itemId: current.item.id, cause: String(error && error.message || error)
        });
      }
      if (!evaluation || typeof evaluation !== 'object' || typeof evaluation.correct !== 'boolean') {
        fail('FLUENTIA_INVALID_EVALUATION', 'Evaluators must return an object with a boolean correct field.', { activityId: activity.id, itemId: current.item.id });
      }
      const feedback = activity.getFeedback ? activity.getFeedback(clone(current.item), answer, evaluation) : null;
      const event = {
        eventId: session.id + ':' + session.completedCount,
        sessionId: session.id, itemId: current.item.id, activityId: activity.id,
        sourceActivityId: cleanId(current.item.sourceActivityId) || activity.id,
        domain: current.domain, interactionType: current.interactionType,
        level: session.level, correct: evaluation.correct,
        errorType: cleanId(evaluation.errorType) || null,
        skill: cleanId(current.item.skill) || activity.skills[0] || null,
        answeredAt: nowIso(clock), evaluation: clone(evaluation), feedback: clone(feedback)
      };
      session.answers.push(event);
      session.seenItemKeys.push(current.itemKey);
      session.activityUse[activity.id] = (session.activityUse[activity.id] || 0) + 1;
      session.domainUse[current.domain] = (session.domainUse[current.domain] || 0) + 1;
      session.completedCount += 1;
      if (evaluation.correct) session.correctCount += 1;
      session.lastActivityId = activity.id;
      session.current = null;
      session.status = session.completedCount >= session.targetCount ? 'completed' : 'ready';
      session.updatedAt = nowIso(clock);
      try { if (activity.onProgress) activity.onProgress(clone(event)); } catch {}
      return clone(event);
    }

    function pauseSession(session) {
      assertSession(session);
      if (session.status === 'active' || session.status === 'ready') {
        session.status = 'paused';
        session.updatedAt = nowIso(clock);
      }
      return session;
    }

    function resumeSession(session) {
      assertSession(session);
      if (session.status !== 'paused') fail(ERROR_CODES.SESSION_NOT_ACTIVE, 'Only paused sessions can be resumed.', { status: session.status });
      session.status = session.current ? 'active' : 'ready';
      session.updatedAt = nowIso(clock);
      return session;
    }

    function abandonSession(session) {
      assertSession(session);
      if (session.status !== 'completed') {
        session.status = 'abandoned';
        session.current = null;
        session.updatedAt = nowIso(clock);
      }
      return session;
    }

    function serializeSession(session) {
      assertSession(session);
      return JSON.stringify(clone(session));
    }

    function restoreSession(snapshot) {
      let parsed;
      try { parsed = typeof snapshot === 'string' ? JSON.parse(snapshot) : clone(snapshot); }
      catch { fail(ERROR_CODES.INVALID_SNAPSHOT, 'Session snapshot is not valid JSON.'); }
      if (!parsed || parsed.schemaVersion !== 1 || !cleanId(parsed.id) ||
          !SESSION_STATUSES.includes(parsed.status) || !normalizeLevel(parsed.level) ||
          !Array.isArray(parsed.activityIds) || !Array.isArray(parsed.answers) ||
          !Array.isArray(parsed.seenItemKeys) || !Number.isInteger(parsed.completedCount) ||
          !Number.isInteger(parsed.targetCount) || parsed.completedCount < 0 ||
          parsed.completedCount > parsed.targetCount) {
        fail(ERROR_CODES.INVALID_SNAPSHOT, 'Session snapshot does not match the supported schema.');
      }
      const known = parsed.activityIds.every(id => adapters.has(id));
      if (!known) fail(ERROR_CODES.INVALID_SNAPSHOT, 'Session snapshot references an unregistered activity.');
      if (parsed.current && (!adapters.has(parsed.current.activityId) || !parsed.current.item || !cleanId(parsed.current.itemKey))) {
        fail(ERROR_CODES.INVALID_SNAPSHOT, 'Session snapshot contains an invalid active item.');
      }
      return parsed;
    }

    function assertSession(session) {
      if (!session || session.schemaVersion !== 1 || !cleanId(session.id)) {
        fail(ERROR_CODES.INVALID_SNAPSHOT, 'A valid Fluentia session is required.');
      }
    }

    function getActivity(id) { return adapters.get(id) || null; }
    function listActivities() {
      return Array.from(adapters.values()).map(a => ({
        id: a.id, domain: a.domain, interactionType: a.interactionType, skills: a.skills.slice()
      }));
    }

    return Object.freeze({
      version: '1.0.0', domains: DOMAINS, levels: CEFR_LEVELS,
      interactionTypes: INTERACTION_TYPES, errorCodes: ERROR_CODES,
      registerActivity, getActivity, listActivities,
      createSession, selectNext, submitAnswer,
      pauseSession, resumeSession, abandonSession,
      serializeSession, restoreSession
    });
  }

  const api = Object.freeze({ version: '1.0.0', domains: DOMAINS, levels: CEFR_LEVELS,
    interactionTypes: INTERACTION_TYPES, errorCodes: ERROR_CODES, FluentiaError, createEngine });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined' && !window.EPIPHANY_FLUENTIA_ENGINE) {
    Object.defineProperty(window, 'EPIPHANY_FLUENTIA_ENGINE', {
      configurable: false, enumerable: false, writable: false, value: api
    });
  }
})();
