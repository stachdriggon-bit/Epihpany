# Word Hunt — Game Specification

**Status:** Implemented foundation and prepared first-release content bank on `main`; automated grid and direction validation is included. CI and manual device review remain pending.  
**Think Lab position:** Game 9.  
**Gameplay model:** Independent four-level puzzle selection; it does not use Guided / Steady / Challenge.

## Product role

Word Hunt is a relaxed word-search puzzle. Players scan a letter grid and locate a prepared list of English words. It is a game-first activity, not a lesson or translation exercise. Arcade remains the home for direct instruction.

## Core loop

1. Choose Easy, Medium, Hard, or Expert.
2. Open the next prepared themed grid.
3. Read the target-word list and locate words in the grid.
4. Select a word by tapping its first letter and then its final letter in a straight line.
5. Correct words are marked in the grid and crossed off the target list.
6. Optional hint highlights the first letter of one remaining word without revealing the answer.
7. Once every target is found, the player may continue to the next puzzle or return to level selection.

No timer is imposed. Incorrect selections do not remove points, consume attempts, or reveal answers. Players can retry freely.

## Direction rules and progression

| Level | Grid | Words per puzzle | Minimum word length | Allowed directions | Content count |
|---|---:|---:|---:|---|---:|
| Easy | 8×8 | 6 | 3 letters | Across and down, forward only | 12 |
| Medium | 10×10 | 8 | 4 letters | Across, down, and forward diagonals | 12 |
| Hard | 12×12 | 10 | 4 letters | All eight directions, including backwards | 12 |
| Expert | 14×14 | 12 | 5 letters | All eight directions, including backwards | 12 |

The first release contains **48 fixed puzzles and 432 target-word placements** across 12 themes: At Home, Food Market, Wildlife, Outdoors, Travel, School, Technology, Sports, Arts, Weather, Workplace, and Everyday Actions. Themes recur across levels with denser grids and broader direction rules.

Puzzles are prepared and stored as fixed grids. The game does not generate or shuffle puzzle content at runtime. Each listed target must appear exactly once in its grid and must follow that level's direction policy. To keep the higher tiers from collapsing into mostly horizontal or vertical searches, every Medium puzzle contains at least two across, two down, and four diagonal words; every Hard and Expert puzzle uses all eight directions.

## Validation and availability

- Every level must contain exactly 12 puzzles.
- Every grid must be square and contain uppercase A–Z letters only.
- Each puzzle must contain the configured number of distinct target words.
- Every target word must occur exactly once in its grid.
- Every placement must obey the direction rules for its level.
- Medium grids must meet the minimum across/down/diagonal mix; Hard and Expert grids must each use all eight directions.
- Stable puzzle IDs and non-empty theme titles are required.
- A level is unavailable if any puzzle in that level fails validation. No fallback or sample puzzles are shown.

## Feedback, progression, and rewards

- A valid selection marks the word in the grid and target list.
- An invalid selection gives neutral retry guidance; it is not a scored failure.
- A hint identifies a starting cell only; it never exposes the target word.
- Each straight-line guess is recorded as a vocabulary attempt through the existing Think Lab bridge, while adaptive difficulty remains unchanged. Incorrect selections do not remove points or limit retries. The final found word marks the final puzzle in the level as complete.
- The experience has no countdown, forced pace, or penalty for mistakes.
- Existing reward/progression services remain authoritative; Word Hunt does not create a separate currency or reward system.

## Interface and accessibility

- The board is responsive from phone to desktop and keeps square cells.
- Every cell is a real button with a row, column, and letter accessible name.
- The two-tap selection model works with touch, mouse, and keyboard activation.
- Found words remain visibly marked; target words remain readable and are crossed off.
- Feedback and completion messages use status semantics.
- The hint is optional and secondary to the grid.
- The game uses its own light outline icon and a distinct but restrained accent treatment.

## Implementation files

- `word-hunt-bank.js` — fixed content, level configuration, and validator.
- `word-hunt.js` — level flow, selection, hints, completion, and Think Lab bridge.
- `word-hunt.css` — responsive board and game styling.
- `tests/word-hunt-bank.test.js` — content and placement validation.
- `tests/word-hunt-engine.test.js` — level flow and interaction contract.
- `think-lab.js`, `icon-system.js`, `lazy-data.js` — registration and lazy integration.

## Verification checklist

- [ ] `npm run test:unit`
- [ ] `npm run test:browser`
- [ ] Manual phone and desktop pass: level picker, all directions, wrong selections, hints, found-word persistence, level completion, and return to Think Lab.
- [ ] Confirm that Word Hunt loads only through Think Lab's lazy-loading path.

## Deferred

- Procedural grid generation.
- Timed or competitive modes.
- Multiplayer, leaderboards, and separate reward currencies.
- Additional content beyond the first 48 puzzles.
