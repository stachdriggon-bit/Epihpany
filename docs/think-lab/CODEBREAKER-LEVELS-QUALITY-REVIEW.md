# Codebreaker — Easy, Medium, and Expert content review

**Branch:** `main`  
**Scope:** all 36 puzzles in Easy, Medium, and Expert after the Hard review.  
**Method:** inspect the player's actual starter mappings, repeated-letter signatures, shared cipher letters across words, and how much of the message is exposed. This is an editorial structural review, not a dictionary-backed proof of unique English plaintext.

## Summary of decisions

| Level | Puzzles | Decision |
|---|---:|---|
| Easy | 12 | Rebuilt 11 words; retained APPLE as the worked example and first puzzle. |
| Medium | 12 | Retained the phrases; improved Medium 01's starter key to expose a cross-word anchor. |
| Expert | 12 | Retained all messages; rebalanced six starter mappings so the single given letter appears 4–8 times. |

The intended progression is now clearer: Easy teaches repeated-letter patterns in single words; Medium asks the player to combine word patterns and shared letters across a phrase; Expert provides longer messages with a useful but non-dominating frequency foothold.

## Easy — 12 single-word signals

Every word is five letters and has at least one repeated-letter group. At least one of the two starter mappings belongs to such a group, so the player can see how repeated positions constrain the answer from the start.

| Puzzle | Plaintext | Structural feature |
|---|---|---|
| 01 | APPLE | P repeats in positions 2–3; retained existing starter key. |
| 02 | LEVEL | L and E both repeat; starter key exposes both groups. |
| 03 | HAPPY | P repeats in positions 3–4; starter key exposes P. |
| 04 | GREEN | E repeats in positions 3–4; starter key exposes E. |
| 05 | SHEEP | E repeats in positions 3–4; starter key exposes E. |
| 06 | SLEEP | E repeats in positions 3–4; starter key exposes E. |
| 07 | STILL | L repeats in positions 4–5; starter key exposes L. |
| 08 | CARRY | R repeats in positions 3–4; starter key exposes R. |
| 09 | CLASS | S repeats in positions 4–5; starter key exposes S. |
| 10 | GRASS | S repeats in positions 4–5; starter key exposes S. |
| 11 | BLOOD | O repeats in positions 3–4; starter key exposes O. |
| 12 | TEETH | E repeats in positions 2 and 4; starter key exposes E. |

The revised set deliberately uses familiar, concrete vocabulary. It does not make every word uniquely solvable from its pattern; the purpose is to teach players to use the visible pattern as evidence and test candidates rather than guess from two unrelated opening letters.

## Medium — 12 short phrases

The phrases were retained because they provide cross-word relationships and a range of repeated patterns. Medium 01 was the one starter-key adjustment: the third mapping changed from `F → N` to `V → D`. The coded V appears in both the first and second words, so the player can test one decoded letter across two separate words.

| Puzzle | Editorial assessment |
|---|---|
| 01 — KIND WORDS HELP | Improved: K and I expose the first word; D is shared by KIND and WORDS. |
| 02 — LEARN BY DOING | Retained: LEA gives a meaningful partial word; R also connects the first and last words. |
| 03 — TAKE YOUR TIME | Retained: TAK provides a foothold; T and I connect the first and final words. |
| 04 — SMALL STEPS COUNT | Retained: repeated L and S positions plus cross-word links. |
| 05 — READ EVERY DAY | Retained: EVERY has an internal repeated-letter pattern; the starter key exposes READ and the E/A anchors. |
| 06 — ASK GOOD QUESTIONS | Retained: GOOD has a double letter and the phrase has shared letter anchors. |
| 07 — KEEP AN OPEN MIND | Retained: KEEP exposes a double-letter pattern; K/E/P recur across the phrase. |
| 08 — PRACTICE MAKES PROGRESS | Retained: repeated positions and several shared letters; longer end of Medium by design. |
| 09 — SHARE WHAT YOU KNOW | Retained: SHA provides an opening; shared letters connect SHARE/WHAT and YOU/KNOW. |
| 10 — LOOK FOR THE CLUE | Retained: LOOK has a repeated O and the key exposes LOOK; repeated/shared letters support cross-checking. |
| 11 — MAKE ROOM TO GROW | Retained: ROOM has a double O; shared letters recur in later words. |
| 12 — WORDS CAN BUILD BRIDGES | Retained: WOR is a useful opening; several cipher letters connect multiple words. It remains the upper-length challenge in Medium. |

Medium should feel like phrase-level reasoning, not a set of isolated five-letter guesses. No semantic definitions are added.

## Expert — 12 long messages

All messages remain unchanged. Six starter keys were reselected based on actual occurrence counts in the plaintext. The target range is 4–8 appearances: enough repeated evidence to establish a foothold, without making the initial letter dominate the entire message.

| Puzzle | Starter mapping after review | Appearances |
|---|---|---:|
| 01 | N → T | 5 |
| 02 | G → T | 6 |
| 03 | D → E | 7 |
| 04 | W → A | 6 |
| 05 | R → O | 7 |
| 06 | O → T | 6 |
| 07 | O → O | 5 |
| 08 | K → A | 6 |
| 09 | X → S | 5 |
| 10 | G → O | 7 |
| 11 | F → N | 6 |
| 12 | W → T | 5 |

Updated keys: Expert 02, 03, 04, 05, 07, and 10. Other keys were retained. The one-letter rule remains intact; the player still has to infer every other substitution.

## Hint behavior improvements

- Pattern hint now ranks words by the number of unresolved repeated positions, rather than selecting the first repeated word in the sentence.
- Cross-word hint ranks unresolved letters by the number of distinct words linked, then by total appearances.
- If no unresolved letter crosses word boundaries, the hint falls back to the most frequent unresolved letter and reports where/how often it appears. It no longer gives a dead-end generic message.
- Letter reveal remains the final, explicit help stage and never reveals the intended plaintext.

## Automated guardrails added

- Easy puzzles must be five-letter words with a repeated-letter pattern, and at least one starter mapping must expose a letter in that repeated group.
- Expert's single starter letter must occur 4–8 times in its message.
- `analyzePuzzle` reports repeated words, cross-word links, starter-letter frequency, and unresolved distinct letters.
- `qualityReport` provides per-puzzle structural and validation output.
- Regression tests cover Easy patterns, Medium 01's shared anchor, Expert starter balance, and the prioritization of both structural hints.

## Limits

These checks establish bank integrity and useful structural starting points. They do not prove that a plaintext is uniquely forced by English word patterns. A full linguistic uniqueness claim would require a defined dictionary/lexicon and a solver that tests candidate plaintexts. Player testing remains necessary to measure perceived difficulty and solve time.
