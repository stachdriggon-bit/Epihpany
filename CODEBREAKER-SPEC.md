# Codebreaker — Game Specification

**Status:** First implementation and fixed first-release bank committed to `main`; automated validation and manual review are pending.  
**Think Lab position:** Game 10.  
**Gameplay model:** Independent four-level selection; no Guided / Steady / Challenge modes.

## Product role

Codebreaker is a deduction-first cryptogram game. Each encrypted letter consistently represents one English letter across the entire message. Players use a short semantic clue, a small starter key, repeated-letter patterns, and their own letter assignments to reveal the message. It is a puzzle, not a translation lesson.

## Core loop

1. Choose Easy, Medium, Hard, or Expert.
2. Read the clue and inspect the encrypted message.
3. Select a coded letter, then choose the English letter it represents from the on-screen alphabet.
4. The chosen substitution is applied to every occurrence of that coded letter.
5. A plaintext letter can be assigned to only one coded letter; this preserves a one-to-one substitution key.
6. Check the completed message. An incorrect attempt remains editable and can be checked again without a score or attempt penalty.
7. An optional hint reveals one additional correct letter mapping. It does not reveal the whole answer.
8. Decode all 12 messages in a level to complete it.

## Difficulty and content

| Level | Message shape | Starter key | Puzzles |
|---|---|---:|---:|
| Easy | Single five-letter word | 2 mappings | 12 |
| Medium | Short phrases | 3 mappings | 12 |
| Hard | Full sentences | 2 mappings | 12 |
| Expert | Longer multi-clause messages | 1 mapping | 12 |

The first release contains **48 fixed cryptograms**. Messages are original short English phrases and sentences. Every puzzle uses a fixed monoalphabetic substitution, preserves spaces and punctuation, and has a unique intended plaintext. The bank is prepared in advance; no random puzzle generation or network request occurs during play.

## Validation

- Exactly 12 puzzles per level and unique stable IDs/answers.
- Cipher and answer have identical length and preserve all spaces/punctuation.
- Every plaintext letter maps to exactly one cipher letter, and every cipher letter maps to exactly one plaintext letter.
- Starter key pairs must match the encoded message and cannot repeat either side.
- Every puzzle retains at least one unknown mapping for the player to solve.
- Answer length must fit the configured difficulty band.
- A level is unavailable if its full bank fails validation; no sample fallback is shown.

## Feedback, progression, and rewards

- The letter key is editable until the message is solved.
- Reassigning a key frees its previous plaintext letter; a plaintext letter already used elsewhere cannot be assigned again.
- The hint reveals one unmapped letter and locks that revealed pair.
- An incomplete message cannot be checked.
- Incorrect complete messages receive neutral retry guidance; no countdown, limited attempts, score loss, or competitive ranking.
- Correct and incorrect checks are recorded through the existing Think Lab vocabulary bridge with adaptive tracking disabled. Existing progression services remain authoritative; Codebreaker creates no separate currency or reward system.

## Interface and accessibility

- A dedicated Codebreaker card and outline icon appear in Think Lab.
- The game has its own four-level picker.
- The message is displayed as selectable coded-letter cells with decoded letters beneath them.
- The letter key and alphabet are real buttons with accessible labels and visible focus.
- Controls are touch-friendly and responsive on phone and desktop; the alphabet wraps to fewer columns on narrow screens.
- Status feedback announces key assignments, hints, incorrect checks, and completion.
- No timer or forced pace.

## Implementation files

- `codebreaker-bank.js` — fixed 48-puzzle bank and substitution validator.
- `codebreaker.js` — level flow, letter-key editor, hints, checking, progression, and Think Lab bridge.
- `codebreaker.css` — responsive cryptogram interface.
- `tests/codebreaker-bank.test.js` — bank shape and cipher integrity.
- `tests/codebreaker-engine.test.js` — selection, key consistency, hint, and completion behavior.
- `think-lab.js`, `icon-system.js`, `lazy-data.js`, `service-worker.js` — Think Lab registration and lazy integration.

## Verification checklist

- [ ] `npm run test:unit`
- [ ] `npm run test:browser`
- [ ] Manual phone and desktop pass: level picker, selecting and changing mappings, duplicate-letter prevention, hints, incorrect checks, completion, and return to Think Lab.
- [ ] Confirm the game and bank load only through Think Lab's lazy-loading path.

## Deferred

- Procedural cryptogram generation.
- Timed, competitive, or multiplayer modes.
- Additional content beyond the first 48 messages.
