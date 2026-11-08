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
      reviewOnly: !!config.reviewOnly,
      getItems({level}) {
        const rows = typeof config.getItems === 'function' ? config.getItems({level}) : source;
        if (!Array.isArray(rows)) return [];
        return rows.filter(item => item && LEVELS.includes(item.level) && item.level === level)
          .map((item, index) => ({...item, id: stableId(config.id, item, index), level: item.level, sourceActivityId: item.sourceActivityId || config.legacyId || config.id}));
      },
      getReviewItems({level}) {
        const rows = typeof config.getReviewItems === 'function'
          ? config.getReviewItems({level})
          : (typeof config.getItems === 'function' ? config.getItems({level}) : source);
        if (!Array.isArray(rows)) return [];
        return rows.filter(item => item && LEVELS.includes(item.level) && item.level === level)
          .map((item, index) => ({...item, id: stableId(config.id, item, index), level: item.level, sourceActivityId: item.sourceActivityId || config.legacyId || config.id}));
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

    if (Array.isArray(sources.audioItems)) {
      adapters.push(makeAdapter({
        id: 'soundscape-sound-picture-match', domain: 'soundscape', legacyId: 'audioImage', interactionType: 'listening', skills: ['spoken-word-recognition'],
        getSource: () => sources.audioItems,
        evaluate: (item, answer) => {
          const selected = typeof answer === 'string' ? answer : answer && (answer.word || answer.selected);
          const correct = normalize(selected) === normalize(item.word);
          return {correct, errorType: correct ? null : 'audio-word-picture-match'};
        },
        correctAnswer: item => item.word
      }));
    }

    if (Array.isArray(sources.wordOfDayItems)) {
      adapters.push(makeAdapter({
        id: 'wordcraft-word-match', domain: 'wordcraft', legacyId: 'match', interactionType: 'matching', skills: ['word-meaning-retrieval'],
        getSource: () => [],
        getItems: ({level}) => {
          const reviewState = typeof sources.reviewState === 'function' ? sources.reviewState() : sources.reviewState;
          const saved = new Set((reviewState?.words || []).map(row => normalize(Array.isArray(row) ? row[0] : row && row.word)));
          const rows = sources.wordOfDayItems.filter(item => item && item.level === level && item.word && item.meaning);
          return rows.map(item => ({...item, sourceActivityId:'word-of-the-day', savedForReview:saved.has(normalize(item.word))}));
        },
        evaluate: (item, answer) => {
          const word = answer && typeof answer === 'object' ? answer.word : '';
          const meaning = answer && typeof answer === 'object' ? answer.meaning : '';
          const correct = normalize(word) === normalize(item.word) && normalize(meaning) === normalize(item.meaning);
          return {correct, errorType: correct ? null : 'word-pair-mismatch'};
        },
        correctAnswer: item => ({word:item.word,meaning:item.meaning})
      }));
    }

    if (Array.isArray(sources.soundscapeDictationBank)) {
      adapters.push(makeAdapter({
        id:'soundscape-dictation-bank', domain:'soundscape', legacyId:'soundscape-dictation',
        interactionType:'typed', skills:['listening-transcription'],
        getSource:() => sources.soundscapeDictationBank,
        evaluate:(item, answer) => {
          const correct = normalize(item.text) === normalize(answer);
          return {correct, errorType:correct ? null : 'dictation-transcription'};
        },
        correctAnswer:item => item.text
      }));
    }

    if (sources.soundMazeBank && sources.soundMazeBank.levels) {
      adapters.push(makeAdapter({
        id: 'soundscape-sound-maze', domain: 'soundscape', legacyId: 'sound-maze', interactionType: 'listening', skills: ['phonological-recognition'],
        getSource: () => [],
        getItems: ({level}) => {
          const group = sources.soundMazeBank.levels[level];
          if (!group) return [];
          return ['guided','steady','challenge'].flatMap(mode => (group[mode] || []).map(item => ({
            ...item, level, trainingMode: mode, target: item.target, sourceActivityId: 'sound-maze'
          })));
        },
        evaluate: (item, answer) => {
          const selected = typeof answer === 'number' ? item.options?.[answer] : (answer && typeof answer === 'object' ? answer.selected : answer);
          const correct = normalize(selected) === normalize(item.target);
          return {correct, errorType: correct ? null : 'sound-discrimination', trainingMode: item.trainingMode};
        },
        correctAnswer: item => item.target
      }));
    }

    if (Array.isArray(sources.practiceSamples)) {
      adapters.push(makeAdapter({
        id: 'soundscape-dictation', domain: 'soundscape', legacyId: 'practice-lab', interactionType: 'typed', skills: ['listening-transcription'],
        getSource: () => sources.practiceSamples,
        evaluate: (item, answer) => {
          const correct = normalize(item.text) === normalize(answer);
          return {correct, errorType: correct ? null : 'dictation-transcription'};
        },
        correctAnswer: item => item.text
      }));
      adapters.push(makeAdapter({
        id: 'real-world-speaking-shadowing', domain: 'real-world', legacyId: 'practice-lab', interactionType: 'speech', skills: ['spoken-communication'],
        getSource: () => sources.practiceSamples,
        evaluate: (item, answer) => {
          const expected = normalize(item.text).split(' ').filter(Boolean);
          const actual = normalize(answer).split(' ').filter(Boolean);
          let cursor = 0, matched = 0;
          expected.forEach(word => {
            const found = actual.indexOf(word, cursor);
            if (found >= cursor) { matched++; cursor = found + 1; }
          });
          const accuracy = Math.round(matched / Math.max(1, expected.length) * 100);
          return {correct: accuracy === 100, accuracy, matchedWords: matched, targetWords: expected.length, errorType: accuracy === 100 ? null : 'speech-recognition-word-match'};
        },
        correctAnswer: item => item.text
      }));
    }

    if (Array.isArray(sources.sentenceItems)) {
      adapters.push(makeAdapter({
        id: 'sentence-studio-sentence-builder', domain: 'sentence-studio', legacyId: 'sentenceOrder', interactionType: 'ordering', skills: ['sentence-construction'],
        getSource: () => sources.sentenceItems,
        evaluate: (item, answer) => {
          const actual = Array.isArray(answer) ? answer.join(' ') : String(answer || '');
          const correct = normalize(actual) === normalize(item.text);
          return {correct, errorType: correct ? null : 'word-order'};
        },
        correctAnswer: item => item.text
      }));
    }

    if (Array.isArray(sources.textwiseSequenceBank)) {
      adapters.push(makeAdapter({
        id: 'textwise-sequence', domain: 'textwise', interactionType: 'ordering', skills: ['text-sequencing'],
        getSource: () => sources.textwiseSequenceBank,
        evaluate: (item, answer) => {
          const actual = Array.isArray(answer) ? answer : [];
          const expected = item.steps || [];
          const correct = actual.length === expected.length && actual.every((value, index) => normalize(value) === normalize(expected[index]));
          return {correct, errorType: correct ? null : 'event-sequencing'};
        },
        correctAnswer: item => item.steps
      }));
    }

    if (Array.isArray(sources.wordOfDayItems)) {
      adapters.push(makeAdapter({
        id:'wordcraft-speed-round', domain:'wordcraft', legacyId:'speed',
        interactionType:'typed', skills:['rapid-vocabulary-retrieval'],
        getSource:() => [],
        getItems:({level}) => {
          const reviewState = typeof sources.reviewState === 'function' ? sources.reviewState() : sources.reviewState;
          const saved = new Set((reviewState?.review || []).filter(row=>row&&row.word).map(row=>normalize(row.word)));
          (reviewState?.words || []).forEach(row=>saved.add(normalize(Array.isArray(row)?row[0]:row&&row.word)));
          const candidates = sources.wordOfDayItems.filter(item=>item&&item.level===level&&item.word&&item.meaning);
          const prioritized = candidates.filter(item=>saved.has(normalize(item.word)));
          return (prioritized.length ? prioritized : candidates).map(item=>({...item,sourceActivityId:'word-of-the-day'}));
        },
        getReviewItems:({level}) => sources.wordOfDayItems
          .filter(item=>item&&item.level===level&&item.word&&item.meaning)
          .map(item=>({...item,sourceActivityId:'word-of-the-day'})),
        evaluate:(item, answer) => {
          const correct = normalize(answer) === normalize(item.word);
          return {correct,errorType:correct?null:'rapid-vocabulary-recall'};
        },
        correctAnswer:item=>item.word
      }));
    }

    if (sources.reviewState && sources.games) {
      const getReviewState = () => typeof sources.reviewState === 'function' ? sources.reviewState() : sources.reviewState;
      const reviewItems = (level, sourceQuestions, predicate, score) => sourceQuestions
        .filter(item => item && item.level === level && predicate(item))
        .map(item => ({...item, reviewWeight: score(item), sourceActivityId: item.sourceActivityId || 'legacy-review'}))
        .sort((a,b) => b.reviewWeight - a.reviewWeight);
      adapters.push(makeAdapter({
        id: 'wordcraft-personal-review', domain: 'wordcraft', interactionType: 'dynamic', skills: ['vocabulary-retrieval'], reviewOnly: true,
        getSource: () => [],
        getItems: ({level}) => {
          const reviewState = getReviewState() || {};
          const saved = new Set((reviewState.review || []).filter(row => row && row.word).map(row => normalize(row.word)));
          (reviewState.words || []).forEach(row => saved.add(normalize(Array.isArray(row) ? row[0] : row && row.word)));
          const bank = sources.games.vocabulary && sources.games.vocabulary.questions || [];
          const term = item => Array.isArray(item.word) ? item.word[0] : (item.word || item.q);
          const meaning = item => Array.isArray(item.word) ? item.word[1] : item.answers?.[item.correct];
          return reviewItems(level, bank, item => saved.has(normalize(term(item))), item => {
            const row = (reviewState.review || []).find(entry => entry && normalize(entry.word) === normalize(term(item)));
            return Number(row && row.errors) || 0;
          }).map(item => {
            const row = (reviewState.review || []).find(entry => entry && normalize(entry.word) === normalize(term(item)));
            return {...item, sourceActivityId:'vocabulary', reviewPrompt:term(item), reviewMeaning:row && row.meaning || meaning(item)};
          });
        },
        evaluate: (item, answer) => ({correct: normalize(answer) === normalize(item.reviewMeaning), errorType: normalize(answer) === normalize(item.reviewMeaning) ? null : 'vocabulary-recall'}),
        correctAnswer: item => item.reviewMeaning
      }));
      adapters.push(makeAdapter({
        id: 'sentence-studio-personal-review', domain: 'sentence-studio', interactionType: 'choice', skills: ['grammar-retrieval'], reviewOnly: true,
        getSource: () => [],
        getItems: ({level}) => {
          const reviewState = getReviewState() || {};
          const errors = reviewState.mistakeTrapErrors || {};
          const questionErrors = reviewState.mistakeQuestionErrors || {};
          const bank = sources.games.mistakes && sources.games.mistakes.questions || [];
          return reviewItems(level, bank, item => (Number(questionErrors[item.id]) || 0) > 0 || (Number(errors[item.trap]) || 0) > 0,
            item => (Number(questionErrors[item.id]) || 0) * 3 + (Number(errors[item.trap]) || 0) * 2)
            .map(item => ({...item, sourceActivityId:'mistakes'}));
        },
        evaluate: (item, answer) => {
          const selected = typeof answer === 'number' ? answer : Number(answer);
          const correct = Number.isInteger(selected) && selected === Number(item.correct);
          return {correct, errorType: correct ? null : (item.trap || 'grammar-review')};
        },
        correctAnswer: item => item.answers?.[item.correct]
      }));
    }

    if (sources.reviewState && sources.games) {
      const getReviewState = () => typeof sources.reviewState === 'function' ? sources.reviewState() : sources.reviewState;
      const sourceAdapters = adapters.filter(adapter => !adapter.reviewOnly);
      sourceAdapters.forEach(sourceAdapter => {
        adapters.push(makeAdapter({
          id: sourceAdapter.id + '-history-review',
          domain: sourceAdapter.domain,
          legacyId: sourceAdapter.id,
          interactionType: sourceAdapter.interactionType,
          skills: sourceAdapter.skills,
          reviewOnly: true,
          getSource: () => [],
          getItems: ({level}) => {
            const state = getReviewState() || {};
            const history = Array.isArray(state.fluentiaHistory) ? state.fluentiaHistory : [];
            const reviewState = state.fluentiaReviewState || {};
            const failed = new Map();
            history.forEach(event => {
              if (!event || event.activityId !== sourceAdapter.id || event.level !== level || event.correct !== false) return;
              const key = String(event.sourceActivityId || sourceAdapter.id) + ':' + String(event.itemId || '');
              if (!event.itemId || reviewState[key]?.mastered === true) return;
              failed.set(String(event.itemId), event);
            });
            if (!failed.size) return [];
            return sourceAdapter.getReviewItems({level}).filter(item => failed.has(String(item.id))).map(item => ({
              ...item,
              reviewErrorType: failed.get(String(item.id)).errorType || null,
              reviewSourceActivityId: sourceAdapter.id
            }));
          },
          evaluate: (item, answer) => sourceAdapter.evaluate(item, answer),
          correctAnswer: item => sourceAdapter.getFeedback?.(item, null, null)?.correctAnswer
        }));
      });
    }

    if (typeof sources.onProgress === 'function') adapters.forEach(adapter => { adapter.onProgress = sources.onProgress; });
    return adapters;
  }

  const api = Object.freeze({
    version: '1.0.0',
    createAdapters,
    registerSources(engine, sources) {
      if (!engine || typeof engine.registerActivity !== 'function') throw new TypeError('A Fluentia engine is required.');
      const adapters = createAdapters(sources);
      const registered = new Set(typeof engine.listActivities === 'function' ? engine.listActivities().map(item => item.id) : []);
      const added = [];
      adapters.forEach(adapter => {
        if (!registered.has(adapter.id)) { engine.registerActivity(adapter); added.push(adapter.id); }
      });
      return added;
    },
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
