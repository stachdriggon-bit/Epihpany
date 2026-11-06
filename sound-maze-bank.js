/* The Sound Maze — bank contract and deterministic-testable round selection. */
(function attachSoundMazeTools(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.EPIPHANY_SOUND_MAZE_TOOLS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createSoundMazeTools() {
  'use strict';

  const LEVELS = Object.freeze(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  const MODES = Object.freeze(['guided', 'steady', 'challenge']);
  const QUESTIONS_PER_MODE = 12;
  const AXES_PER_MODE = 4;
  const QUESTIONS_PER_AXIS = 3;
  const OPTIONS_PER_QUESTION = 4;

  function validateBank(bank) {
    const errors = [];
    const ids = new Set();
    let total = 0;

    if (!bank || typeof bank !== 'object' || !bank.levels || typeof bank.levels !== 'object') {
      return { valid: false, errors: ['Bank must contain a levels object.'], total: 0 };
    }

    for (const level of LEVELS) {
      const levelBank = bank.levels[level];
      if (!levelBank || typeof levelBank !== 'object') {
        errors.push(level + ': missing CEFR level.');
        continue;
      }

      for (const mode of MODES) {
        const items = levelBank[mode];
        if (!Array.isArray(items)) {
          errors.push(level + '/' + mode + ': questions must be an array.');
          continue;
        }
        if (items.length !== QUESTIONS_PER_MODE) {
          errors.push(level + '/' + mode + ': expected ' + QUESTIONS_PER_MODE + ' questions, found ' + items.length + '.');
        }

        const axisCounts = new Map();
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const label = level + '/' + mode + '/' + (item && item.id ? item.id : 'item-' + (index + 1));
          total++;

          if (!item || typeof item !== 'object') {
            errors.push(label + ': question must be an object.');
            continue;
          }
          if (typeof item.id !== 'string' || !item.id.trim()) {
            errors.push(label + ': missing stable id.');
          } else if (ids.has(item.id)) {
            errors.push(label + ': duplicate id "' + item.id + '".');
          } else {
            ids.add(item.id);
          }
          if (typeof item.target !== 'string' || !item.target.trim()) {
            errors.push(label + ': target must be a non-empty string.');
          }
          if (typeof item.axis !== 'string' || !item.axis.trim()) {
            errors.push(label + ': missing axis.');
          } else {
            axisCounts.set(item.axis, (axisCounts.get(item.axis) || 0) + 1);
          }
          if (!Array.isArray(item.options) || item.options.length !== OPTIONS_PER_QUESTION) {
            errors.push(label + ': expected exactly four options.');
          } else {
            const normalized = item.options.map(option => typeof option === 'string' ? option.trim().toLocaleLowerCase('en') : '');
            if (normalized.some(option => !option)) errors.push(label + ': every option must be a non-empty string.');
            if (new Set(normalized).size !== OPTIONS_PER_QUESTION) errors.push(label + ': options must be four distinct spellings.');
            const correctMatches = item.options.filter(option => typeof item.target === 'string' && option === item.target).length;
            if (correctMatches !== 1) errors.push(label + ': the target must appear exactly once among the options.');
          }
          if (item.answer !== item.target) {
            errors.push(label + ': answer must equal the target spelling.');
          }
          if (typeof item.explain !== 'string' || !item.explain.trim()) {
            errors.push(label + ': missing educational explanation.');
          }
        }

        if (axisCounts.size !== AXES_PER_MODE) {
          errors.push(level + '/' + mode + ': expected ' + AXES_PER_MODE + ' distinct axes, found ' + axisCounts.size + '.');
        }
        for (const [axis, count] of axisCounts) {
          if (count !== QUESTIONS_PER_AXIS) {
            errors.push(level + '/' + mode + '/' + axis + ': expected ' + QUESTIONS_PER_AXIS + ' questions, found ' + count + '.');
          }
        }
      }
    }

    const expectedTotal = LEVELS.length * MODES.length * QUESTIONS_PER_MODE;
    if (total !== expectedTotal) {
      errors.push('Bank total must be ' + expectedTotal + ' questions, found ' + total + '.');
    }
    return { valid: errors.length === 0, errors, total };
  }

  function shuffle(items, random) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const value = Number(random());
      const safeValue = Number.isFinite(value) ? Math.min(0.999999999, Math.max(0, value)) : 0;
      const swapIndex = Math.floor(safeValue * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function selectRound(bank, level, mode, random) {
    const validation = validateBank(bank);
    if (!validation.valid) {
      throw new Error('Cannot select a Sound Maze round from an invalid bank: ' + validation.errors.join(' '));
    }
    if (!LEVELS.includes(level)) throw new RangeError('Unknown Sound Maze CEFR level: ' + level);
    if (!MODES.includes(mode)) throw new RangeError('Unknown Sound Maze training mode: ' + mode);

    const rng = typeof random === 'function' ? random : Math.random;
    const source = bank.levels[level][mode];
    const questions = shuffle(source, rng).map(item => {
      const options = shuffle(item.options, rng);
      return {
        ...item,
        options,
        answerIndex: options.indexOf(item.target),
        cefrLevel: level,
        trainingMode: mode
      };
    });

    return {
      level,
      trainingMode: mode,
      target: QUESTIONS_PER_MODE,
      questions
    };
  }

  return Object.freeze({
    LEVELS,
    MODES,
    QUESTIONS_PER_MODE,
    AXES_PER_MODE,
    QUESTIONS_PER_AXIS,
    OPTIONS_PER_QUESTION,
    validateBank,
    selectRound
  });
});
