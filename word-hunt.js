/* EPIPHANY THINK LAB — Word Hunt interaction layer. */
(() => {
  'use strict';
  const root = document.getElementById('think-lab-content');
  const bank = window.EPIPHANY_WORD_HUNT_BANK;
  if (!root || !bank) return;

  let level = null;
  let puzzleIndex = 0;
  let found = new Set();
  let startCell = null;
  let hintWord = null;
  let feedback = '';
  let completed = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const puzzleList = () => level ? bank.puzzles[level] || [] : [];
  const puzzle = () => puzzleList()[puzzleIndex] || null;
  const levelReady = id => {
    const config = bank.levels[id], list = bank.puzzles[id] || [];
    return !!config && list.length === config.count && list.every(item => bank.validatePuzzle(item, id).valid);
  };
  const pathFor = (match, length) => Array.from({length}, (_, i) => ({
    row:match.row + match.dr * i, col:match.col + match.dc * i
  }));
  function wordCells(item, word) {
    const match = bank.occurrences(item.grid, word)[0];
    return match ? pathFor(match, word.length) : [];
  }
  function renderLevels() {
    level = null;
    const status = bank.validateBank();
    root.innerHTML = '<div class="wh-shell">' +
      '<div class="tl-game-head"><button class="tl-back" type="button" data-wh-home>← Think Lab home</button><span class="tl-eyebrow">WORD HUNT</span></div>' +
      '<section class="wh-panel"><div class="wh-kicker">FIND THE HIDDEN WORDS</div><h2>Choose your level</h2>' +
      '<p class="wh-intro">Find every word hidden in the letter grid. Tap the first and last letters of a word. No timer, and no penalty for trying again.</p>' +
      '<div class="wh-level-grid">' + Object.entries(bank.levels).map(([id, config]) => {
        const ready = levelReady(id), count = (bank.puzzles[id] || []).length;
        return '<button type="button" class="wh-level-card" data-wh-level="' + id + '"' + (ready ? '' : ' disabled') + '>' +
          '<span class="wh-level-size">' + config.size + ' × ' + config.size + '</span><strong>' + config.label + '</strong>' +
          '<span>' + (ready ? config.count + ' puzzles · ' + config.wordsPerPuzzle + ' words each' : count + ' / ' + config.count + ' puzzles ready') + '</span></button>';
      }).join('') + '</div>' +
      (status.valid ? '' : '<p class="wh-bank-status" role="status">A level opens only when its complete puzzle set passes validation.</p>') +
      '</section></div>';
  }
  function renderPuzzle() {
    const item = puzzle();
    if (!item) return renderLevels();
    const config = bank.levels[level];
    const directionNote = level === 'easy' ? 'Across and down (forward only)' : level === 'medium' ? 'Across, down and diagonal (forward only)' : 'All eight directions, including backwards';
    const foundCount = found.size;
    const foundCells = new Set();
    for (const word of found) for (const cell of wordCells(item, word)) foundCells.add(cell.row + ',' + cell.col);
    const hintCells = hintWord ? wordCells(item, hintWord) : [];
    const hintStart = hintCells[0] ? hintCells[0].row + ',' + hintCells[0].col : '';
    const selected = startCell ? startCell.row + ',' + startCell.col : '';
    const grid = item.grid.map((row, r) => [...row].map((letter, c) => {
      const key = r + ',' + c;
      const classes = ['wh-cell'];
      if (foundCells.has(key)) classes.push('is-found');
      if (key === selected) classes.push('is-selected');
      if (key === hintStart) classes.push('is-hint');
      return '<button type="button" class="' + classes.join(' ') + '" data-wh-cell="' + r + '-' + c + '"' +
        ' aria-label="Row ' + (r + 1) + ', column ' + (c + 1) + ', letter ' + letter + '"' +
        ' aria-pressed="' + (foundCells.has(key) || key === selected) + '"' + (completed ? ' disabled' : '') + '>' + letter + '</button>';
    }).join('')).join('');
    const words = item.words.map(word => '<span class="wh-word-chip' + (found.has(word) ? ' is-found' : '') + '" aria-label="' +
      esc(word) + (found.has(word) ? ', found' : ', not found') + '">' + esc(word) + '</span>').join('');
    root.innerHTML = '<div class="wh-shell">' +
      '<div class="tl-game-head"><button class="tl-back" type="button" data-wh-levels>← Choose level</button><span class="tl-eyebrow">WORD HUNT · ' + config.label.toUpperCase() + '</span></div>' +
      '<section class="wh-panel"><div class="wh-progress-row"><span class="wh-kicker">' + esc(item.title) + '</span><span class="wh-progress">' +
      (puzzleIndex + 1) + ' / ' + config.count + ' puzzles</span></div>' +
      '<h2>Find the words</h2><p class="wh-instruction">Tap a starting letter, then tap the final letter in a straight line. <strong>' + directionNote + '.</strong></p>' +
      '<div class="wh-score-row"><strong>' + foundCount + ' <span>/ ' + item.words.length + ' found</span></strong><span>' + (item.words.length - foundCount) + ' left</span></div>' +
      '<div class="wh-board-wrap"><div class="wh-board" style="--wh-size:' + config.size + '" role="group" aria-label="' + config.size + ' by ' + config.size + ' letter grid">' + grid + '</div></div>' +
      '<div class="wh-targets"><div class="wh-targets-head"><strong>Words to find</strong><span>' + esc(item.title) + '</span></div><div class="wh-word-list">' + words + '</div></div>' +
      '<div class="wh-actions"><button type="button" class="tl-secondary" data-wh-hint' + (completed || foundCount === item.words.length ? ' disabled' : '') + '>Show a hint</button>' +
      '<button type="button" class="tl-secondary" data-wh-clear' + (!startCell ? ' disabled' : '') + '>Clear selection</button></div>' +
      (feedback ? '<p class="wh-feedback" role="status">' + esc(feedback) + '</p>' : '') +
      (completed ? '<div class="wh-complete" role="status"><strong>✓ Grid cleared!</strong><p>You found all ' + item.words.length + ' words. Take a breath, then continue when you are ready.</p>' +
        '<button type="button" class="tl-next" data-wh-next>' + (puzzleIndex + 1 < config.count ? 'Next puzzle ↗' : 'Finish level ↗') + '</button></div>' : '') +
      '</section></div>';
  }
  function selectCell(row, col) {
    if (completed) return;
    if (!startCell) {
      startCell = {row, col};
      feedback = 'Now tap the final letter of the word.';
      renderPuzzle();
      return;
    }
    const drRaw = row - startCell.row, dcRaw = col - startCell.col;
    if (drRaw === 0 && dcRaw === 0) {
      startCell = null; feedback = 'Selection cleared.'; renderPuzzle(); return;
    }
    const diagonal = Math.abs(drRaw) === Math.abs(dcRaw);
    if (!(drRaw === 0 || dcRaw === 0 || diagonal)) {
      feedback = 'Choose a straight line: across, down, or diagonal. Your starting letter is still selected.';
      renderPuzzle();
      return;
    }
    const steps = Math.max(Math.abs(drRaw), Math.abs(dcRaw));
    const dr = Math.sign(drRaw), dc = Math.sign(dcRaw);
    const letters = [];
    for (let i = 0; i <= steps; i++) letters.push(puzzle().grid[startCell.row + dr * i][startCell.col + dc * i]);
    const selected = letters.join('');
    const directionAllowed = level === 'easy'
      ? (dr === 0 && dc === 1) || (dr === 1 && dc === 0)
      : level === 'medium'
        ? (dr >= 0 && dc >= 0) || (dr === 1 && dc === -1)
        : true;
    const matchedWord = directionAllowed
      ? puzzle().words.find(word => word === selected || word === [...selected].reverse().join(''))
      : null;
    const answer = matchedWord && !found.has(matchedWord) ? matchedWord : null;
    if (answer) {
      found.add(answer);
      startCell = null;
      hintWord = null;
      feedback = '✓ ' + answer + ' found!';
      const puzzleComplete = found.size === puzzle().words.length;
      if (window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.recordResult === 'function') {
        window.EpiphanyThinkLab.recordResult('vocabulary', 'word-hunt', true,
          puzzleComplete && puzzleIndex === puzzleList().length - 1, {trackAdaptive:false});
      }
      if (puzzleComplete) completed = true;
    } else {
      if (matchedWord && found.has(matchedWord)) {
        feedback = 'You have already found that word.';
      } else {
        if (window.EpiphanyThinkLab && typeof window.EpiphanyThinkLab.recordResult === 'function') {
          window.EpiphanyThinkLab.recordResult('vocabulary', 'word-hunt', false, false, {trackAdaptive:false});
        }
        feedback = directionAllowed
          ? 'Not a target word yet. There is no penalty for trying again. Your starting letter is still selected—try a different ending.'
          : 'That direction is not available at this level. There is no penalty for trying again. Your starting letter is still selected.';
      }
      // Keep the original start cell after an unsuccessful attempt. Learners can
      // try another endpoint without having to select the first letter again.
    }
    renderPuzzle();
  }
  function startLevel(id) {
    if (!levelReady(id)) return;
    level = id;
    puzzleIndex = 0;
    found = new Set();
    startCell = null;
    hintWord = null;
    feedback = '';
    completed = false;
    renderPuzzle();
  }
  function nextPuzzle() {
    if (!completed) return;
    if (puzzleIndex + 1 >= puzzleList().length) {
      const total = puzzleList().length;
      root.innerHTML = '<div class="wh-shell"><section class="wh-panel wh-finish"><span class="wh-kicker">LEVEL COMPLETE</span><h2>Every word found.</h2>' +
        '<p>You completed all ' + total + ' ' + bank.levels[level].label + ' puzzles. There was no rush—just careful searching.</p>' +
        '<button type="button" class="tl-next" data-wh-levels>Choose another level</button><button type="button" class="tl-back" data-wh-home>Back to Think Lab</button></section></div>';
      return;
    }
    puzzleIndex++;
    found = new Set();
    startCell = null;
    hintWord = null;
    feedback = '';
    completed = false;
    renderPuzzle();
  }
  root.addEventListener('click', event => {
    const target = event.target.closest('[data-wh-home],[data-wh-levels],[data-wh-level],[data-wh-cell],[data-wh-hint],[data-wh-clear],[data-wh-next]');
    if (!target || !root.contains(target)) return;
    if (target.hasAttribute('data-wh-home')) {
      window.EpiphanySpeech?.stop?.();
      level = null;
      root.innerHTML = '';
      if (typeof window.EPIPHANY_THINK_LAB_HOME === 'function') window.EPIPHANY_THINK_LAB_HOME();
      else root.dispatchEvent(new CustomEvent('epiphany:think-lab-home'));
      return;
    }
    if (target.hasAttribute('data-wh-levels')) { renderLevels(); return; }
    if (target.hasAttribute('data-wh-level')) { startLevel(target.dataset.whLevel); return; }
    if (target.hasAttribute('data-wh-cell')) {
      const [row, col] = target.dataset.whCell.split('-').map(Number);
      selectCell(row, col);
      return;
    }
    if (target.hasAttribute('data-wh-hint')) {
      const next = puzzle().words.find(word => !found.has(word));
      if (next) {
        hintWord = next;
        startCell = null;
        const first = wordCells(puzzle(), next)[0];
        feedback = first ? 'Hint: start from the highlighted letter, then follow a straight line.' : 'Try another word in this theme.';
        renderPuzzle();
      }
      return;
    }
    if (target.hasAttribute('data-wh-clear')) { startCell = null; feedback = 'Selection cleared.'; renderPuzzle(); return; }
    if (target.hasAttribute('data-wh-next')) { nextPuzzle(); return; }
  });
  window.EPIPHANY_WORD_HUNT = Object.freeze({open:renderLevels, validateBank:bank.validateBank});
})();