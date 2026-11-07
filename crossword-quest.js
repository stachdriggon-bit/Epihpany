/* EPIPHANY THINK LAB — Crossword Quest interaction layer. */
(() => {
  'use strict';
  const root = document.getElementById('think-lab-content');
  const bank = window.EPIPHANY_CROSSWORD_QUEST_BANK;
  if (!root || !bank) return;

  const levels = bank.levels;
  let activeLevel = null;
  let puzzleIndex = 0;
  let puzzle = null;
  let values = [];
  let currentCell = null;
  let currentDirection = 'across';
  let clueVisible = false;
  let solved = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));

  function levelReady(level) {
    const list = bank.puzzles[level] || [];
    const ids = new Set(list.map(item => item && item.id).filter(Boolean));
    return list.length === levels[level].count && ids.size === list.length &&
      list.every(item => bank.validatePuzzle(item, levels[level].size).valid);
  }

  function open() {
    activeLevel = null;
    puzzle = null;
    renderLevels();
  }

  function renderLevels() {
    const bankStatus = bank.validateBank();
    root.innerHTML = '<div class="cq-shell">' +
      '<div class="tl-game-head"><button class="tl-back" type="button" data-cq-home>← Think Lab home</button><span class="tl-eyebrow">CROSSWORD QUEST</span></div>' +
      '<section class="cq-panel"><div class="cq-kicker">WORD PUZZLES</div><h2>Choose your level</h2>' +
      '<p class="cq-intro">Solve classic across-and-down crosswords at your own pace. There is no timer.</p>' +
      '<div class="cq-level-grid">' + Object.entries(levels).map(([id, level]) => {
        const ready = levelReady(id);
        const count = (bank.puzzles[id] || []).length;
        return '<button type="button" class="cq-level-card" data-cq-level="' + id + '"' + (ready ? '' : ' disabled') + '>' +
          '<span class="cq-level-size">' + level.size + ' × ' + level.size + '</span><strong>' + level.label + '</strong>' +
          '<span>' + (ready ? level.count + ' reviewed puzzles' : count + ' / ' + level.count + ' puzzles prepared') + '</span></button>';
      }).join('') + '</div>' +
      (bankStatus.valid ? '' : '<p class="cq-bank-status" role="status">The reviewed puzzle bank is being prepared. A level will become available after all 24 grids have passed validation.</p>') +
      '</section></div>';
  }

  function getEntryAt(row, col, direction = currentDirection) {
    if (!puzzle) return null;
    return puzzle.entries.find(entry => entry.direction === direction &&
      (direction === 'across'
        ? row === entry.row && col >= entry.col && col < entry.col + entry.answer.length
        : col === entry.col && row >= entry.row && row < entry.row + entry.answer.length)) || null;
  }

  function entriesAt(row, col) {
    return ['across', 'down'].map(direction => getEntryAt(row, col, direction)).filter(Boolean);
  }

  function selectCell(row, col, toggle = false) {
    if (!puzzle || puzzle.layout[row]?.[col] !== '.') return;
    const same = currentCell && currentCell.row === row && currentCell.col === col;
    if (same && toggle) {
      const other = currentDirection === 'across' ? 'down' : 'across';
      if (getEntryAt(row, col, other)) currentDirection = other;
    } else {
      currentCell = { row, col };
      if (!getEntryAt(row, col, currentDirection)) currentDirection = getEntryAt(row, col, currentDirection === 'across' ? 'down' : 'across') ? (currentDirection === 'across' ? 'down' : 'across') : 'across';
    }
    clueVisible = false;
    renderPuzzle();
    const input = root.querySelector('[data-cq-cell="' + row + '-' + col + '"]');
    if (input) input.focus({ preventScroll: true });
  }

  function activeEntry() {
    return currentCell ? getEntryAt(currentCell.row, currentCell.col) : null;
  }

  function entryCells(entry) {
    return Array.from({ length: entry.answer.length }, (_, offset) => ({
      row: entry.row + (entry.direction === 'down' ? offset : 0),
      col: entry.col + (entry.direction === 'across' ? offset : 0)
    }));
  }

  function renderPuzzle() {
    if (!puzzle) return;
    const size = puzzle.size;
    const numberAt = new Map();
    puzzle.entries.forEach(entry => {
      const key = entry.row + '-' + entry.col;
      const current = numberAt.get(key);
      if (current === undefined || entry.number < current) numberAt.set(key, entry.number);
    });
    const selected = activeEntry();
    const selectedCells = new Set(selected ? entryCells(selected).map(cell => cell.row + '-' + cell.col) : []);
    const rows = puzzle.layout.map((line, row) => '<div class="cq-row" role="row">' + [...line].map((cell, col) => {
      if (cell === '#') return '<span class="cq-black" role="gridcell" aria-hidden="true"></span>';
      const key = row + '-' + col;
      const number = numberAt.get(key);
      const active = currentCell && currentCell.row === row && currentCell.col === col;
      return '<label class="cq-cell' + (selectedCells.has(key) ? ' is-word' : '') + (active ? ' is-active' : '') + '" role="gridcell">' +
        (number ? '<span class="cq-cell-number">' + number + '</span>' : '') +
        '<input type="text" maxlength="1" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" ' +
        'aria-label="Row ' + (row + 1) + ', column ' + (col + 1) + (number ? ', clue ' + number : '') + '" ' +
        'data-cq-cell="' + key + '" value="' + esc(values[row][col]) + '"' + (solved ? ' disabled' : '') + '></label>';
    }).join('') + '</div>').join('');
    const clue = selected && clueVisible ? '<div class="cq-clue-text" role="status"><span>' + selected.number + ' · ' + selected.direction.toUpperCase() + '</span>' + esc(selected.clue) + '</div>' : '<div class="cq-clue-placeholder">Select a word, then choose Show Clue when you need it.</div>';
    const level = levels[activeLevel];
    root.innerHTML = '<div class="cq-shell">' +
      '<div class="tl-game-head"><button class="tl-back" type="button" data-cq-levels>← Choose level</button><span class="tl-eyebrow">CROSSWORD QUEST · ' + level.label.toUpperCase() + '</span><span class="cq-progress">PUZZLE ' + (puzzleIndex + 1) + ' / ' + level.count + '</span></div>' +
      '<section class="cq-panel cq-play-panel"><div class="cq-puzzle-heading"><div><div class="cq-kicker">' + level.label.toUpperCase() + ' CROSSWORD</div><h2>' + esc(puzzle.title || 'Crossword ' + (puzzleIndex + 1)) + '</h2></div><span class="cq-grid-size">' + size + ' × ' + size + '</span></div>' +
      '<p class="cq-instruction">Choose a square to select a word. Tap the same crossing square again to switch direction.</p>' +
      '<div class="cq-board-wrap"><div class="cq-board" role="grid" aria-label="' + level.label + ' crossword grid" style="--cq-size:' + size + '">' + rows + '</div></div>' +
      '<div class="cq-clue-area"><div class="cq-clue-actions"><button type="button" class="cq-action cq-primary-action" data-cq-clue' + (selected ? '' : ' disabled') + '>Show Clue</button>' +
      '<button type="button" class="cq-action" data-cq-direction' + (selected && entriesAt(currentCell.row,currentCell.col).length > 1 ? '' : ' disabled') + '>Switch direction</button></div>' + clue + '</div>' +
      '<div class="cq-controls"><button type="button" class="cq-action" data-cq-clear' + (solved ? ' disabled' : '') + '>Clear grid</button><button type="button" class="cq-action cq-check-action" data-cq-check' + (solved ? ' hidden' : '') + '>Check grid</button>' +
      (solved ? '<button type="button" class="cq-action cq-primary-action" data-cq-next>Next puzzle →</button>' : '') + '</div>' +
      '<p class="cq-feedback" id="cq-feedback" role="status" aria-live="polite"></p>' +
      '</section></div>';
  }

  function showFeedback(message, kind = '') {
    const feedback = root.querySelector('#cq-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = 'cq-feedback' + (kind ? ' is-' + kind : '');
  }

  function startLevel(level) {
    activeLevel = level;
    puzzleIndex = 0;
    startPuzzle();
  }

  function startPuzzle() {
    const list = bank.puzzles[activeLevel] || [];
    puzzle = list[puzzleIndex];
    if (!puzzle || !bank.validatePuzzle(puzzle, levels[activeLevel].size).valid) {
      renderLevels();
      return;
    }
    values = puzzle.layout.map(row => [...row].map(cell => cell === '#' ? '#' : ''));
    currentCell = null;
    currentDirection = 'across';
    clueVisible = false;
    solved = false;
    const first = puzzle.entries.find(entry => entry.direction === 'across') || puzzle.entries[0];
    if (first) currentCell = { row: first.row, col: first.col };
    renderPuzzle();
  }

  function moveWithinEntry(step) {
    const entry = activeEntry();
    if (!entry || !currentCell) return;
    const cells = entryCells(entry);
    const index = cells.findIndex(cell => cell.row === currentCell.row && cell.col === currentCell.col);
    const next = cells[index + step];
    if (!next) return;
    currentCell = next;
    clueVisible = false;
    renderPuzzle();
    root.querySelector('[data-cq-cell="' + next.row + '-' + next.col + '"]')?.focus({ preventScroll: true });
  }

  root.addEventListener('click', event => {
    const levelButton = event.target.closest('[data-cq-level]');
    if (levelButton && !levelButton.disabled) { startLevel(levelButton.dataset.cqLevel); return; }
    if (event.target.closest('[data-cq-home]')) {
      const home = document.createElement('button');
      home.type = 'button';
      home.hidden = true;
      home.setAttribute('data-think-home', '');
      root.appendChild(home);
      home.click();
      home.remove();
      return;
    }
    if (event.target.closest('[data-cq-levels]')) { renderLevels(); return; }
    const cellInput = event.target.closest('[data-cq-cell]');
    if (cellInput) {
      const [row, col] = cellInput.dataset.cqCell.split('-').map(Number);
      const same = currentCell && currentCell.row === row && currentCell.col === col;
      if (same) {
        const other = currentDirection === 'across' ? 'down' : 'across';
        if (getEntryAt(row, col, other)) currentDirection = other;
      } else {
        currentCell = { row, col };
        if (!getEntryAt(row, col, currentDirection)) currentDirection = currentDirection === 'across' ? 'down' : 'across';
      }
      clueVisible = false;
      renderPuzzle();
      root.querySelector('[data-cq-cell="' + row + '-' + col + '"]')?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest('[data-cq-clue]')) {
      if (activeEntry()) { clueVisible = true; renderPuzzle(); }
      return;
    }
    if (event.target.closest('[data-cq-direction]')) {
      const other = currentDirection === 'across' ? 'down' : 'across';
      if (currentCell && getEntryAt(currentCell.row, currentCell.col, other)) {
        currentDirection = other;
        clueVisible = false;
        renderPuzzle();
        root.querySelector('[data-cq-cell="' + currentCell.row + '-' + currentCell.col + '"]')?.focus({ preventScroll: true });
      }
      return;
    }
    if (event.target.closest('[data-cq-clear]') && !solved) {
      values = puzzle.layout.map(row => [...row].map(cell => cell === '#' ? '#' : ''));
      renderPuzzle();
      showFeedback('The grid has been cleared.');
      return;
    }
    if (event.target.closest('[data-cq-check]') && !solved) {
      let complete = true;
      let correct = true;
      for (let row = 0; row < puzzle.size; row++) {
        for (let col = 0; col < puzzle.size; col++) {
          if (puzzle.layout[row][col] !== '.') continue;
          if (!values[row][col]) complete = false;
          if (values[row][col] !== puzzle.solution[row][col]) correct = false;
        }
      }
      if (!complete) { showFeedback('Fill the open squares before checking.', 'notice'); return; }
      if (!correct) { showFeedback('Some letters still need another look. Your answers are not revealed.', 'notice'); return; }
      solved = true;
      renderPuzzle();
      showFeedback('Crossword solved. Well done!', 'success');
      return;
    }
    if (event.target.closest('[data-cq-next]') && solved) {
      puzzleIndex++;
      if (puzzleIndex >= levels[activeLevel].count) {
        puzzle = null;
        root.innerHTML = '<div class="cq-shell"><div class="tl-game-head"><button class="tl-back" type="button" data-cq-levels>← Choose another level</button><span class="tl-eyebrow">CROSSWORD QUEST</span></div><section class="cq-panel cq-finish"><div class="cq-kicker">LEVEL COMPLETE</div><h2>' + levels[activeLevel].label + ' complete!</h2><p>You have solved all 24 reviewed crosswords in this level.</p><button type="button" class="cq-action cq-primary-action" data-cq-levels>Choose another level</button></section></div>';
      } else startPuzzle();
    }
  });

  root.addEventListener('input', event => {
    const input = event.target.closest('[data-cq-cell]');
    if (!input || solved || !puzzle) return;
    const [row, col] = input.dataset.cqCell.split('-').map(Number);
    const letter = [...input.value.toUpperCase()].find(char => /^[A-Z]$/.test(char)) || '';
    values[row][col] = letter;
    if (input.value !== letter) input.value = letter;
    if (letter) moveWithinEntry(1);
  });

  root.addEventListener('keydown', event => {
    const input = event.target.closest('[data-cq-cell]');
    if (!input || solved || !puzzle) return;
    const [row, col] = input.dataset.cqCell.split('-').map(Number);
    const arrows = { ArrowLeft: [0,-1], ArrowRight: [0,1], ArrowUp: [-1,0], ArrowDown: [1,0] };
    if (arrows[event.key]) {
      event.preventDefault();
      const [dr, dc] = arrows[event.key];
      let nextRow = row + dr, nextCol = col + dc;
      while (nextRow >= 0 && nextCol >= 0 && nextRow < puzzle.size && nextCol < puzzle.size && puzzle.layout[nextRow][nextCol] === '#') {
        nextRow += dr; nextCol += dc;
      }
      if (nextRow >= 0 && nextCol >= 0 && nextRow < puzzle.size && nextCol < puzzle.size && puzzle.layout[nextRow][nextCol] === '.') selectCell(nextRow, nextCol);
    } else if (event.key === 'Backspace' && !input.value) {
      event.preventDefault();
      moveWithinEntry(-1);
    }
  });

  root.addEventListener('focusin', event => {
    const input = event.target.closest('[data-cq-cell]');
    if (!input || !puzzle) return;
    const [row, col] = input.dataset.cqCell.split('-').map(Number);
    if (!currentCell || currentCell.row !== row || currentCell.col !== col) {
      currentCell = { row, col };
      clueVisible = false;
      renderPuzzle();
      root.querySelector('[data-cq-cell="' + row + '-' + col + '"]')?.focus({ preventScroll: true });
    }
  });

  window.EPIPHANY_CROSSWORD_QUEST = Object.freeze({ open });
})();
