# Codebreaker — Hard level editorial quality review

**Scope:** all 12 fixed Hard cryptograms on the current main branch.  
**Purpose:** assess the information actually visible to a player before solving, not reverse-engineer the intended answer and present it as a deduction.

## Review method and limits

For each puzzle, inspect:
1. The two supplied cipher-to-English mappings.
2. The partially decoded words those mappings produce.
3. Repeated-letter signatures within words.
4. Whether visible repeated cipher letters connect multiple words and can support cross-checking.

This is a structural/editorial review, not a proof of unique plaintext. The repository does not currently include a comprehensive English lexicon or a dictionary-backed cryptogram solver. Consequently, this review does **not** claim that any candidate word is uniquely forced by the visible constraints. A solver may reasonably form and test hypotheses; the design must not pretend that a guess was logically inevitable.

## Findings

| Puzzle | What the player can see at the start | Editorial assessment |
|---|---|---|
| Hard 01 | The first word is A. The next word has the shape `?L?A?` after the revised key. | Previously weak: `C??A?` did not give a useful foothold. Revised to `O → A`, `P → L`; the second word now has a more informative shape, and the key remains at two mappings. |
| Hard 02 | The first word begins `CU`; its internal pattern repeats the fourth cipher letter at position seven. | Reasonable opening. The long word supplies both known letters and a repeated-position constraint; remaining words allow hypothesis testing. |
| Hard 03 | The first word reads `GOO?`. | Strong opening pattern: the repeated O is visible and the word is narrowly constrained. Other words provide further cross-checks. |
| Hard 04 | The standalone first word is A; the next word has the shape `L???L?`. | Strong structural opening. The next word has a conspicuous repeated-letter relationship and two known positions. |
| Hard 05 | The first word reads `TH?`; the fourth letter of the second word is also known as T. | Good opening. A common three-letter word is partially exposed, and the T mapping recurs in another word. |
| Hard 06 | The first word begins `LE`; its fifth and seventh positions share a cipher letter. The next long word begins with the same decoded L. | Good opening with a useful repeated-position constraint and a cross-word anchor. |
| Hard 07 | The first word begins `HO`; another word has a repeated first/fourth cipher letter and a repeated second/sixth letter. | Moderate-to-good. The first word is not uniquely identified, but the bank provides visible structural constraints to test across the sentence. |
| Hard 08 | The first word is A; the next begins S; a later six-letter word has shape `S?A??S`. | Good opening. The repeated S at both ends plus the known A position is a useful pattern without revealing the word directly. |
| Hard 09 | The first word begins `SM` and ends with a doubled letter. | Strong opening pattern. The first word is meaningfully constrained and repeated letters are immediately visible. |
| Hard 10 | The first word begins `TH`; the second word has matching second and sixth positions. | Good opening. The second word's repeated-position pattern is an important constraint; the first word alone should not be treated as a forced answer. |
| Hard 11 | The first word reads `EVE??`; another word has a doubled second/third letter. | Strong opening. Multiple conspicuous patterns are available before the player commits to a complete phrase. |
| Hard 12 | The first word begins `PR` and has matching fourth/seventh positions; the second word has R in its third position. | Good opening. The repeated-position constraint and the recurring R provide useful structure across words. |

## Decisions

1. **Repair Hard 01's starter key.** Use `O → A` and `P → L`, replacing `O → A` and `A → C`. This gives a more informative partial shape without adding a third mapping or exposing the answer.
2. **Remove unused semantic clue metadata from the fixed bank.** The UI did not display it, but keeping answer-adjacent definitions in the runtime bank contradicted the no-definition design and invited inaccurate feedback.
3. **Correct retry feedback.** It now refers only to repeated-letter patterns and the player's existing key; it no longer tells the player to compare a clue that is not shown.
4. **Use progressive hints rather than jumping immediately to a revealed letter.** The pattern and cross-word stages teach the player where to look without supplying plaintext; the third stage retains the existing one-letter reveal.
5. **Do not change the other 11 Hard puzzles based on this pass.** Their openings are structurally reasonable. Revisit any one of them only if playtesting or a dictionary-backed solver shows that the constraints are misleading or unusually underdetermined.

## What this review does not establish

- It does not prove that each puzzle has only one possible English plaintext under the visible constraints.
- It does not measure solving time or learner success; that requires real player testing.
- It does not certify Easy, Medium, or Expert. Their editorial review remains separate.
- It does not justify adding semantic clues or silently using the intended answer as a hint.

The quality standard is now documented in `CODEBREAKER-SPEC.md` so future bank additions are reviewed for player-visible fairness, not merely valid substitution mechanics.
