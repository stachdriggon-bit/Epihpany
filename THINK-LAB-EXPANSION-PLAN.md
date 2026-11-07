# Think Lab Expansion Plan

**Status:** Expansion direction approved; Letter Grid is the current implementation. Word Hunt and Codebreaker have their first implementations and fixed banks on `main`, with final CI/manual QA pending. Crossword Quest is paused and preserved for possible future resumption.  
**Branch:** `main`

## Product direction

Expand Think Lab with replayable word-puzzle experiences rather than adding another set of explicitly instructional activities. Arcade remains the primary home for direct learning and practice; Think Lab focuses on enjoyable word games, puzzles, pattern-finding, and deduction.

The new games should feel like games people choose to play, while naturally engaging with English vocabulary and language.

## Approved initial game lineup

Build and review the games in this order:

1. **Crossword Quest** — classic crossword solving using numbered horizontal and vertical clues.
2. **Word Hunt** — find hidden words in a letter grid, including varied directions where appropriate.
3. **Codebreaker** — decode encrypted words, sentences, and messages through deduction.
4. **Letter Grid** — form words by connecting adjacent letters in a grid, with a replayable score/challenge loop.

This is the initial expansion set, not a commitment to add all four without individual review.

## Deliberate exclusions for this first set

- **Anagram Vault** is deferred because its core letter-rearrangement loop may overlap too much with Word Forge.
- **Word Links** is deferred because its grouping/association loop may overlap too much with Word Connections.

These ideas may be reconsidered if a genuinely distinct mechanic is identified.

## Design and approval process

Work on one game at a time. Before implementation, define and approve:

1. Core gameplay and player interaction.
2. Rules, valid actions, mistakes, hints, and win conditions.
3. Difficulty progression and replay structure.
4. Content-bank format, size, validation, and answer uniqueness.
5. Scoring, progression, and reward behavior.
6. Accessibility and responsive behavior where relevant.

Do not assume every game needs the same round structure or the Guided / Steady / Challenge modes. Choose the progression model that best fits each game's mechanics.

## Implementation and verification process

After a game's specification and content are approved:

1. Save its approved specification and content in the repository.
2. Inspect the existing Think Lab integration points and reuse established patterns where suitable.
3. Implement only the approved game, keeping unrelated games and artwork unchanged.
4. Add or update focused unit/content tests and browser smoke coverage.
5. Run `npm run test:unit` and `npm run test:browser`.
6. Review the game manually on phone and desktop.
7. Fix any failures before moving to the next game.

Integrate through the existing lazy-loading path. Preserve Think Lab's shared progression/reward conventions and current visual identity unless a game-specific approved design requires otherwise.

## Scope boundaries

- Do not rewrite or redesign the existing eight Think Lab games as part of this expansion.
- Do not duplicate Arcade's instructional experience.
- Avoid unnecessary changes to shared navigation, card artwork, World, or The Resonance.
- Prefer distinct mechanics over increasing the game count for its own sake.

## Previous game: Word Hunt

Word Hunt has its first implementation and fixed 48-puzzle content bank on `main`. See [`WORD-HUNT-SPEC.md`](./WORD-HUNT-SPEC.md). Its independent four-level flow, content validator, responsive grid, icon, and lazy-loading integration are in place. The first release contains 12 puzzles per level and 432 target-word placements. CI and manual phone/desktop review remain pending before release acceptance.

## Previous game: Codebreaker

Codebreaker has its first implementation and fixed 48-cryptogram bank on `main`. See [`CODEBREAKER-SPEC.md`](./CODEBREAKER-SPEC.md). It uses a distinct substitution-cipher deduction loop, its own four-level picker, starter letter keys, optional single-letter hints, a no-penalty retry flow, a dedicated icon, responsive styling, and lazy loading. Its bank/engine tests are included; CI and manual phone/desktop review remain pending.

## Current game: Letter Grid

Letter Grid has its first implementation and fixed 48-puzzle bank on `main`. See [`LETTER-GRID-SPEC.md`](./LETTER-GRID-SPEC.md). It uses a clue-led adjacent-letter path mechanic: players connect neighboring cells in any of eight directions, with turns and backtracking, to spell hidden answers. The first release contains 216 target words, a separate four-level picker, optional starting-letter hints, no-penalty retries, a dedicated outline icon, responsive styling, lazy loading, offline caching, and focused bank/engine/browser tests. CI and manual phone/desktop review remain pending.

## Paused game: Crossword Quest

Crossword Quest is **paused, not deleted**. Its player-facing card and lazy runtime loading have been disabled. Its specification, prototype engine, styles, validator, lexicons, tests, and partial bank work remain in the repository. See [`CROSSWORD-QUEST-SPEC.md`](./CROSSWORD-QUEST-SPEC.md). It remains unavailable to players until a complete reviewed puzzle bank exists. Do not remove or rewrite its files while Word Hunt is being completed.
