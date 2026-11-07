/* EPIPHANY — Crossword Quest reviewed puzzle bank and validator. */
(() => {
  'use strict';

  const LEVELS = Object.freeze({
    easy: Object.freeze({ label: 'Easy', size: 5, count: 24 }),
    medium: Object.freeze({ label: 'Medium', size: 7, count: 24 }),
    hard: Object.freeze({ label: 'Hard', size: 9, count: 24 }),
    expert: Object.freeze({ label: 'Expert', size: 11, count: 24 })
  });

  // Puzzle records are added only after their grids, entries, crossings and clues
  // have been reviewed. Keep this bank separate from the game engine.
  const puzzles = { easy: [], medium: [], hard: [], expert: [] };

  function validatePuzzle(puzzle, expectedSize) {
    const errors = [];
    if (!puzzle || typeof puzzle !== 'object') return { valid: false, errors: ['Puzzle record is missing.'] };
    const size = Number(puzzle.size);
    if (!Number.isInteger(size) || size < 3 || size !== expectedSize) errors.push('Grid size does not match its level.');
    const layout = Array.isArray(puzzle.layout) ? puzzle.layout : [];
    const solution = Array.isArray(puzzle.solution) ? puzzle.solution : [];
    if (layout.length !== size || solution.length !== size) errors.push('Grid rows do not match the declared size.');
    for (let row = 0; row < size; row++) {
      if (typeof layout[row] !== 'string' || layout[row].length !== size || !/^[#.]+$/.test(layout[row] || '')) {
        errors.push('Layout row ' + (row + 1) + ' must contain exactly ' + size + ' cells using # and . only.');
      }
      if (typeof solution[row] !== 'string' || solution[row].length !== size || !/^[A-Z#]+$/.test(solution[row] || '')) {
        errors.push('Solution row ' + (row + 1) + ' must contain exactly ' + size + ' cells using A–Z and # only.');
      }
    }
    if (errors.length) return { valid: false, errors };

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const open = layout[row][col] === '.';
        if (open !== (solution[row][col] !== '#')) errors.push('Layout and solution disagree at row ' + (row + 1) + ', column ' + (col + 1) + '.');
      }
    }

    const expected = [];
    const numbers = Array.from({ length: size }, () => Array(size).fill(0));
    let nextNumber = 1;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (layout[row][col] !== '.') continue;
        const across = col === 0 || layout[row][col - 1] === '#';
        const down = row === 0 || layout[row - 1][col] === '#';
        if (!across && !down) continue;
        numbers[row][col] = nextNumber;
        if (across) expected.push({ number: nextNumber, direction: 'across', row, col });
        if (down) expected.push({ number: nextNumber, direction: 'down', row, col });
        nextNumber++;
      }
    }

    const entries = Array.isArray(puzzle.entries) ? puzzle.entries : [];
    const expectedByKey = new Map(expected.map(entry => [entry.number + ':' + entry.direction, entry]));
    const actualKeys = new Set();
    for (const entry of entries) {
      if (!entry || !['across', 'down'].includes(entry.direction)) {
        errors.push('Every entry must have an across or down direction.');
        continue;
      }
      const key = entry.number + ':' + entry.direction;
      if (actualKeys.has(key)) errors.push('Duplicate entry ' + key + '.');
      actualKeys.add(key);
      const expectedEntry = expectedByKey.get(key);
      if (!expectedEntry || expectedEntry.row !== entry.row || expectedEntry.col !== entry.col) errors.push('Entry ' + key + ' does not match its numbered start cell.');
      if (!String(entry.clue || '').trim()) errors.push('Entry ' + key + ' has no clue.');
      if (!Number.isInteger(entry.row) || !Number.isInteger(entry.col) || entry.row < 0 || entry.col < 0 || entry.row >= size || entry.col >= size) {
        errors.push('Entry ' + key + ' has an invalid starting cell.');
        continue;
      }
      const cells = [...String(entry.answer || '').toUpperCase()];
      if (cells.length < 3) errors.push('Entry ' + key + ' must be at least three letters long.');
      if (!cells.length || cells.some(letter => !/^[A-Z]$/.test(letter))) errors.push('Entry ' + key + ' must contain English letters only.');
      let runLength = 0;
      while (entry.row + (entry.direction === 'down' ? runLength : 0) < size &&
        entry.col + (entry.direction === 'across' ? runLength : 0) < size &&
        layout[entry.row + (entry.direction === 'down' ? runLength : 0)][entry.col + (entry.direction === 'across' ? runLength : 0)] === '.') runLength++;
      if (cells.length !== runLength) errors.push('Entry ' + key + ' must cover its complete uninterrupted answer slot.');
      for (let i = 0; i < cells.length; i++) {
        const row = entry.row + (entry.direction === 'down' ? i : 0);
        const col = entry.col + (entry.direction === 'across' ? i : 0);
        if (row >= size || col >= size || layout[row][col] !== '.') {
          errors.push('Entry ' + key + ' extends outside its open cells.');
          break;
        }
        if (!/^[A-Z]$/.test(cells[i]) || solution[row][col] !== cells[i]) {
          errors.push('Entry ' + key + ' does not match the solution at row ' + (row + 1) + ', column ' + (col + 1) + '.');
        }
      }
    }

    const expectedKeys = new Set(expected.map(entry => entry.number + ':' + entry.direction));
    for (const key of expectedKeys) if (!actualKeys.has(key)) errors.push('Missing numbered entry ' + key + '.');
    for (const key of actualKeys) if (!expectedKeys.has(key)) errors.push('Unexpected numbered entry ' + key + '.');

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (layout[row][col] !== '.') continue;
        const across = entries.some(entry => entry.direction === 'across' && row === entry.row && col >= entry.col && col < entry.col + String(entry.answer || '').length);
        const down = entries.some(entry => entry.direction === 'down' && col === entry.col && row >= entry.row && row < entry.row + String(entry.answer || '').length);
        if (!across || !down) errors.push('Open cell at row ' + (row + 1) + ', column ' + (col + 1) + ' must belong to both an across and a down entry.');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  function validateBank(source = puzzles) {
    const errors = [];
    const counts = {};
    for (const [level, config] of Object.entries(LEVELS)) {
      const list = source && Array.isArray(source[level]) ? source[level] : [];
      counts[level] = list.length;
      if (list.length !== config.count) errors.push(config.label + ' must contain exactly ' + config.count + ' puzzles; found ' + list.length + '.');
      const ids = new Set();
      list.forEach((puzzle, index) => {
        if (!puzzle || !String(puzzle.id || '').trim()) errors.push(config.label + ' puzzle ' + (index + 1) + ' has no stable id.');
        else if (ids.has(puzzle.id)) errors.push(config.label + ' contains duplicate puzzle id ' + puzzle.id + '.');
        else ids.add(puzzle.id);
        const result = validatePuzzle(puzzle, config.size);
        result.errors.forEach(error => errors.push(config.label + ' puzzle ' + (index + 1) + ': ' + error));
      });
    }
    return { valid: errors.length === 0, complete: errors.length === 0, counts, errors };
  }

  window.EPIPHANY_CROSSWORD_QUEST_BANK = Object.freeze({
    levels: LEVELS,
    puzzles: Object.freeze(puzzles),
    validatePuzzle,
    validateBank
  });
})();
