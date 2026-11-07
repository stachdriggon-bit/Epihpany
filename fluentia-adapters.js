/* Fluentia Phase 3 — canonical adapters over existing lesson banks.
   This layer describes content and answer semantics; legacy renderers remain authoritative. */
(() => {
  'use strict';

  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const hash = value => {
    let h = 2166136261;
    const input = String(value);
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  };
  const stableId = (activityId, item, index) => {
    const explicit = item && (item.id ?? item.uid ?? item.key);
    if (explicit !== undefined && explicit !== null && String(explicit).trim()) return String(explicit).trim();
    const fingerprint = JSON.stringify(item);
    return activityId + '-' + hash(fingerprint || String(index));
  };
  const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('en')
    .replace(/[’']/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const coordinate = value => {
    if (Array.isArray(value) && value.length >= 2) return [Number(value[0]), Number(value[1])];
    if (value && typeof value === 'object' && 'x' in value && 'y' in value) return [Number(value.x), Number(value.y)];
    if (typeof value === 'string') {
      const match = value.match(/^\s*(-?\d+)\s*[,;:]\s*(-?\d+)\s*$/);
      if (match) return [Number(match[1]), Number(match[2])];
    }
    return null;
  };

  function makeAdapter(config) {
    const source = config.getSource();
    return {
      id: config.id,
      domain: config.domain,
      interactionType: config.interactionType,
      skills: config.skills,
      getItems({level}) {
        if (!Array.isArray(source)) return [];
        return source.filter(item => item && LEVELS.includes(item.level) && item.level === level)
          .map((item, index) => ({...item, id: stableId(config.id, item, index), level: item.level, sourceActivityId: config.legacyId || config.id}));
      },
      evaluate(item, answer) {
        return config.evaluate(item, answer);
      },
      getFeedback(item, answer, evaluation) {
        return {
          explanation: item.explain || item.why_en || item.explanation || '',
          explanationAr: item.explain_ar || item.why_ar || '',
          hint: item.hint || item.arabic_hint || '',
          correctAnswer: config.correctAnswer ? config.correctAnswer(item) : undefined,
          evaluation
        };
      }
    };
  }

  function createAdapters(sources = {}) {
    const games = sources.games || {};
    const adapters = [];
    const choice = (id, domain, legacyId, skill) => {
      const game = games[legacyId];
      adapters.push(makeAdapter({
        id, domain, legacyId, interactionType: 'choice', skills: [skill],
        getSource: () => game && game.questions,
        evaluate: (item, answer) => {
          const selected = typeof answer === 'number' ? answer : Number(answer);
          const correct = Number.isInteger(selected) && selected === Number(item.correct);
          return {correct, errorType: correct ? null : (item.trap || skill), selectedIndex: Number.isInteger(selected) ? selected : null};
        },
        correctAnswer: item => item.answers?.[item.correct]
      }));
    };

    choice('wordcraft-vocabulary', 'wordcraft', 'vocabulary', 'vocabulary');
    choice('wordcraft-spelling', 'wordcraft', 'spelling', 'spelling');
    choice('sentence-studio-grammar', 'sentence-studio', 'grammar', 'grammar');
    choice('textwise-meaning-detective', 'textwise', 'listening', 'reading-comprehension');
    choice('real-world-lost-in-london', 'real-world', 'story', 'practical-communication');
    choice('fine-sense-nuance-navigator', 'fine-sense', 'advanced', 'nuance');

    adapters.push(makeAdapter({
      id: 'sentence-studio-common-mistakes', domain: 'sentence-studio', legacyId: 'mistakes',
      interactionType: 'choice', skills: ['error-recognition'],
      getSource: () => games.mistakes && games.mistakes.questions,
      evaluate: (item, answer) => {
        const selected = typeof answer === 'number' ? answer : Number(answer);
        const correct = Number.isInteger(selected) && selected === Number(item.correct);
        return {correct, errorType: correct ? null : (item.trap || 'common-mistake'), selectedIndex: Number.isInteger(selected) ? selected : null};
      },
      correctAnswer: item => item.answers?.[item.correct]
    }));

    adapters.push(makeAdapter({
      id: 'sentence-studio-spot-the-mistake', domain: 'sentence-studio', interactionType: 'correction',
      skills: ['error-identification'], getSource: () => sources.spot,
      evaluate: (item, answer) => {
        const selected = typeof answer === 'number' ? answer : Number(answer);
        const correct = Number.isInteger(selected) && selected === Number(item.wrongIndex);
        return {correct, errorType: correct ? null : 'error-identification', selectedIndex: Number.isInteger(selected) ? selected : null};
      },
      correctAnswer: item => item.fix
    }));

    adapters.push(makeAdapter({
      id: 'sentence-studio-type-it', domain: 'sentence-studio', interactionType: 'typed',
      skills: ['grammar-production'], getSource: () => sources.typing,
      evaluate: (item, answer) => {
        const accepted = Array.isArray(item.accept) ? item.accept : [item.answer].filter(Boolean);
        const correct = accepted.some(value => normalize(value) === normalize(answer));
        return {correct, errorType: correct ? null : 'typed-form', acceptedAnswerCount: accepted.length};
      },
      correctAnswer: item => item.answer || item.accept?.[0]
    }));

    adapters.push(makeAdapter({
      id: 'real-world-directions', domain: 'real-world', interactionType: 'map',
      skills: ['following-directions'], getSource: () => sources.directions,
      evaluate: (item, answer) => {
        const expected = coordinate(item.answer);
        const actual = coordinate(answer);
        const correct = !!expected && !!actual && expected[0] === actual[0] && expected[1] === actual[1];
        return {correct, errorType: correct ? null : 'route-comprehension', expected, actual};
      },
      correctAnswer: item => item.answer
    }));

    return adapters;
  }

  const api = Object.freeze({
    version: '1.0.0',
    createAdapters,
    registerAll(engine, sources) {
      if (!engine || typeof engine.registerActivity !== 'function') throw new TypeError('A Fluentia engine is required.');
      const adapters = createAdapters(sources);
      const registered = new Set(typeof engine.listActivities === 'function' ? engine.listActivities().map(item => item.id) : []);
      adapters.forEach(adapter => { if (!registered.has(adapter.id)) engine.registerActivity(adapter); });
      return adapters.map(adapter => adapter.id);
    }
  });

  if (typeof window !== 'undefined') Object.defineProperty(window, 'EPIPHANY_FLUENTIA_ADAPTERS', {
    configurable: false, enumerable: false, writable: false, value: api
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
