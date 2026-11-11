# Codebreaker — Game Specification

**Status:** First implementation retained; instructions redesigned so decoding—not guessing from a definition—is the central task.  
**Think Lab position:** Game 10.  
**Gameplay model:** Independent four-level selection; no Guided / Steady / Challenge modes.

## Product role

Codebreaker is a substitution-cipher puzzle. The player receives an encrypted message and must discover the letter key that decodes it. There is no definition or question that gives away the plaintext. The challenge is to reason from the known starter mappings, repeated-letter patterns, word shapes, and the player's own assignments.

## Core loop

1. Choose Easy, Medium, Hard, or Expert.
2. Inspect the encrypted message and the starter letter mappings.
3. Select a coded letter in the message or key.
4. Choose the English letter it represents.
5. Every occurrence of that coded letter updates together. A coded letter always represents the same English letter throughout the message.
6. A plaintext letter can be assigned to only one coded letter; this preserves a one-to-one substitution key.
7. Decode every letter and check the complete message. Incorrect mappings remain editable and can be checked again without a penalty.
8. An optional hint reveals one additional correct letter mapping, not the plaintext message.

## Difficulty and content

| Level | Message shape | Starter key | Puzzles |
|---|---|---:|---:|
| Easy | Single five-letter word with a repeated-letter pattern | 2 mappings | 12 |
| Medium | Short phrases | 3 mappings | 12 |
| Hard | Full sentences | 2 mappings | 12 |
| Expert | Longer multi-clause messages | 1 mapping | 12 |

The first release contains **48 fixed cryptograms**. Each message uses a fixed monoalphabetic substitution, preserves spaces and punctuation, and has one intended plaintext. No definition or direct-answer clue is shown during play.

## Validation

- Exactly 12 puzzles per level and unique stable IDs/answers.
- Cipher and answer have identical length and preserve all spaces/punctuation.
- Every plaintext letter maps to exactly one cipher letter, and every cipher letter maps to exactly one plaintext letter.
- Starter key pairs match the encoded message and cannot repeat either side.
- Every puzzle retains at least one unknown mapping for the player to solve.
- Easy words are five letters, contain a repeated-letter group, and expose at least one letter from that group in the starter key.
- Expert's single starter letter appears 4–8 times in the message to provide a useful but non-dominating opening.
- A level is unavailable if its full bank fails validation.

## Feedback, progression, and rewards

- The letter key is editable until the message is solved.
- Reassigning a key frees its previous plaintext letter; a plaintext letter already used elsewhere cannot be assigned again.
- The hint reveals one unmapped letter and locks that revealed pair.
- An incomplete message cannot be checked.
- Incorrect complete messages receive neutral retry guidance; no countdown, limited attempts, score loss, or competitive ranking.
- Existing Think Lab progression remains authoritative; Codebreaker creates no separate currency or reward system.

## Interface and accessibility

- The encrypted message is displayed as selectable coded-letter cells with decoded letters beneath them.
- A compact three-step instruction explains: select a coded letter, assign its English replacement, then decode the message.
- The on-screen alphabet and key are real buttons with accessible labels and visible focus.
- Controls are touch-friendly and responsive on phone and desktop.
- No answer-giving semantic clue is displayed.

## Implementation files

- `codebreaker-bank.js` — fixed 48-puzzle bank and substitution validator.
- `codebreaker.js` — level flow, letter-key editor, hints, checking, progression, and Think Lab bridge.
- `codebreaker.css` — responsive cryptogram interface and instruction steps.
- `tests/codebreaker-bank.test.js` — bank shape and cipher integrity.
- `tests/codebreaker-engine.test.js` — key consistency, hints, checking, and completion.
- `think-lab.js`, `icon-system.js`, `lazy-data.js`, `service-worker.js` — Think Lab registration and lazy integration.

## Deferred

- Procedural cryptogram generation.
- Timed, competitive, or multiplayer modes.
- Additional content beyond the first 48 messages.


## Content quality standard (added after Hard-bank review)

A valid substitution is not automatically a fair or well-designed puzzle. Bank validation therefore checks structural integrity, while editorial review checks the player's actual starting position.

- Do not store semantic definitions, paraphrases, or answer-revealing clues in the player-facing puzzle bank. The intended plaintext is not a player hint.
- Review the visible starter mappings and the resulting partial word shapes before approving a puzzle. Assess whether they provide a reasonable first hypothesis without assuming the intended answer.
- Evaluate repeated-letter patterns and relationships across words as constraints, not as proof that a particular word is uniquely determined.
- Never describe a candidate as deduced unless the visible constraints actually establish it. Cryptogram solving may involve testing and revising hypotheses.
- Keep a written editorial review for each level. Record weak openings and repair them by improving starter mappings or replacing the puzzle; do not compensate with a hidden semantic clue.
- Automated bank validation must not claim linguistic solvability or unique English plaintext unless a real dictionary-backed solver has established that property.

## Hard level review

The first editorial pass is recorded in `docs/think-lab/CODEBREAKER-HARD-QUALITY-REVIEW.md`. Hard 01's starter key was adjusted from `O → A, A → C` to `O → A, P → L` to give the player a more informative opening pattern while retaining exactly two starter mappings.


### Progressive hint behavior

The single hint control advances through three non-penalizing stages on each puzzle:
1. **Pattern hint:** ranks words by unresolved repeated-letter evidence, then identifies the strongest pattern and matching positions without suggesting a plaintext word. If there is no repeated pattern, it directs the player to compare recurring letters across words.
2. **Cross-word hint:** prioritizes an unresolved coded letter shared by the largest number of words, then by total occurrences. If no unresolved letter crosses word boundaries, it reports the most frequent unresolved letter and its word locations.
3. **Letter reveal:** reveals and locks one correct mapping, preserving the existing explicit assistance behavior.

The control resets for each new puzzle. These hints must never expose the intended plaintext or use a semantic definition.


## Full level review

The complete editorial review for Easy, Medium, and Expert is recorded in `docs/think-lab/CODEBREAKER-LEVELS-QUALITY-REVIEW.md`. It documents all 36 puzzles, the Easy word-bank rebuild, Medium 01's improved cross-word starter key, and the six rebalanced Expert starter mappings. The review explicitly distinguishes structural fairness from proof of unique plaintext.
