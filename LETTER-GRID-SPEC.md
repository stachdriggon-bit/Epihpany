# Letter Grid — Game Specification

**Status:** First implementation and fixed first-release content bank committed to `main`. Unit/static, browser smoke, and content-quality CI checks pass; manual phone/desktop visual review remains pending until Vercel deployment is available.  
**Think Lab position:** Game 11.  
**Gameplay model:** Independent Easy / Medium / Hard / Expert selection. No Guided / Steady / Challenge modes.

## Product role

Letter Grid is a clue-led word-path puzzle. It is distinct from Word Hunt: players do not select the first and last letters along a straight line. They select a clue and connect adjacent letters one cell at a time; paths may turn horizontally, vertically, or diagonally. Each target answer is hidden until solved.

## Core loop

1. Choose Easy, Medium, Hard, or Expert.
2. Read one short English definition and its answer length.
3. Select the clue, then tap neighboring letters in sequence to spell the answer.
4. Each next cell must touch the previous cell, including diagonal neighbors. A cell cannot be reused within one word.
5. Players may step back one cell or clear the path at any time.
6. A complete path is checked automatically. Correct words are revealed and marked found. An incorrect full path can be retried without a penalty.
7. An optional hint reveals only the starting letter and highlights its cell; it never draws the answer path.
8. Solve all clues in a puzzle to advance. Complete all 12 puzzles to finish the level.

## Difficulty and fixed content

| Level | Grid | Clues per puzzle | Answer length | Puzzles |
|---|---:|---:|---:|---:|
| Easy | 4 × 4 | 3 | 3–4 | 12 |
| Medium | 6 × 6 | 4 | 4–5 | 12 |
| Hard | 7 × 7 | 5 | 4–6 | 12 |
| Expert | 8 × 8 | 6 | 5–7 | 12 |

The first release contains **48 fixed puzzles and 216 target words**. Every clue has one fixed answer and one prevalidated neighboring-cell path. Boards and paths are authored into the bank; gameplay does not generate or randomize puzzles.

## Content and path validation

- Exactly 12 puzzles per level and the configured number of clues per puzzle.
- Every grid is square, with uppercase A–Z cells only.
- Each answer is unique within its puzzle and fits that level's length range.
- Each target path contains exactly one cell per answer letter.
- Path indices stay inside the grid, never repeat a cell, and never overlap another target path.
- Every path cell contains the matching answer letter.
- Every consecutive pair of cells is adjacent in one of the eight directions.
- A level is unavailable unless its entire bank validates.

## Feedback, progression, and rewards

- Correct paths reveal the word and mark its clue as found.
- Incorrect full-length paths receive neutral retry guidance. There is no score deduction, attempt limit, timer, or leaderboard.
- A single-step backtrack and a clear-path action let players correct selections without restarting a clue.
- The hint reveals the first letter only.
- Successful and incorrect completed paths are recorded through the existing Think Lab vocabulary bridge with adaptive tracking disabled. No separate currency or reward system is introduced.

## Interface and accessibility

- Dedicated Think Lab card and outline icon.
- Independent four-level picker.
- Grid cells are real buttons with row, column, and letter accessible labels.
- Clues are selectable buttons; found answers are revealed in place.
- The current path is shown as readable letters and announced through a live status region.
- Touch-friendly square grid, responsive clue layout, visible keyboard focus, and no forced pace.

## Implementation files

- `letter-grid-bank.js` — fixed 48-puzzle bank and path validator.
- `letter-grid.js` — level flow, clue selection, path interaction, hints, checking, progression, and Think Lab bridge.
- `letter-grid.css` — responsive board and clue interface.
- `tests/letter-grid-bank.test.js` — bank shape, answer, and path integrity.
- `tests/letter-grid-engine.test.js` — clue selection, adjacency, backtracking, hint, and retry behavior.
- `think-lab.js`, `icon-system.js`, `lazy-data.js`, `service-worker.js` — Think Lab registration and lazy/offline integration.

## Verification checklist

- [ ] `npm run test:unit`
- [ ] `npm run test:browser`
- [ ] Manual phone and desktop pass: clue selection, diagonal and turning paths, backtracking, clear path, hints, incorrect paths, puzzle progression, and return to Think Lab.
- [ ] Confirm the game and bank load only through Think Lab's lazy-loading path.

## Deferred

- Procedural board generation.
- Timed, competitive, or multiplayer modes.
- Additional content beyond the first 48 puzzles.
