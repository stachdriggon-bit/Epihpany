# Letter Path — Game Specification

**Status:** Redesigned as a straight-line word-search game. The first-release bank contains 48 fixed randomized boards and 216 target words; automated verification is being updated for the new interaction model.  
**Think Lab position:** Existing Letter Grid slot (display name: Letter Path).  
**Gameplay model:** Independent Easy / Medium / Hard / Expert selection. No Guided / Steady / Challenge modes.

## Product role

Letter Path is a classic hidden-word search. Players scan a crowded letter grid and find a visible list of target words. It is not a clue-led path-building exercise: players do not choose a clue and may not turn a path around neighboring letters.

## Core loop

1. Choose Easy, Medium, Hard, or Expert.
2. Read the target-word list.
3. Find each word hidden in the grid. Every word is laid out in one straight line: horizontal, vertical, or diagonal.
4. Words may run in either direction, including backwards.
5. Tap the letters in sequence. Once the direction is established, every next letter must continue along that same line.
6. Tap a selected letter again to remove it and step back. The player may also clear the entire selection.
7. Correct words are marked in the grid and crossed off the target list. No timer or penalty is imposed.

## Difficulty and fixed content

| Level | Grid | Words per puzzle | Word length | Puzzles |
|---|---:|---:|---:|---:|
| Easy | 4 × 4 | 3 | 3–4 | 12 |
| Medium | 6 × 6 | 4 | 4–5 | 12 |
| Hard | 7 × 7 | 5 | 4–6 | 12 |
| Expert | 8 × 8 | 6 | 5–7 | 12 |

The first release contains **48 fixed puzzles and 216 target words**. Word placements are mixed across each board and randomized when the fixed bank is authored; they are not assigned to predictable corners or positions at runtime. Every target appears exactly once. The runtime does not generate or shuffle puzzles.

## Placement and validation

- Every grid is square and contains uppercase A–Z letters only.
- Every target has one fixed path with exactly one cell per answer letter.
- A path must be a single straight line in one of eight directions; turning paths are invalid.
- A path cannot reuse or overlap another target path.
- Every target must appear exactly once in the board, including reverse-direction searches.
- Each level is unavailable unless all 12 boards pass validation.

## Feedback, progression, and rewards

- A correct word is marked in the grid and crossed off the target list.
- An invalid sequence receives neutral retry guidance; it is not a scored failure.
- Tapping a selected cell again steps back through the current selection. Clear selection remains available as a full reset.
- An optional hint highlights only a starting cell; it does not reveal the word or its route.
- Existing Think Lab progression remains authoritative; no separate currency or reward system is introduced.

## Interface and accessibility

- The board remains responsive from phone to desktop and uses square cells.
- Each grid cell is a real button with row, column, and letter accessible names.
- The target list is visible beside or below the board.
- The selection preview announces the current letters; found words remain visibly marked.
- No clue-selection panel, turning-path mechanic, timer, or forced pace.

## Implementation files

- `letter-grid-bank.js` — fixed grids, straight-line placements, and content validator.
- `letter-grid.js` — word selection, step-back, hints, completion, and Think Lab bridge.
- `letter-grid.css` — responsive board and target-word list.
- `tests/letter-grid-bank.test.js` — bank shape, unique placements, and straight-line validation.
- `tests/letter-grid-engine.test.js` — straight-line selection, step-back, hints, and progression.
- `think-lab.js`, `icon-system.js`, `lazy-data.js`, `service-worker.js` — Think Lab registration and lazy/offline integration.

## Deferred

- Procedural board generation.
- Timed, competitive, or multiplayer modes.
- Additional content beyond the first 48 puzzles.
