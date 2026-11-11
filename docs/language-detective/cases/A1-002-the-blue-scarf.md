# A1 Case — The Blue Scarf

**Case ID:** LD-A1-002  
**CEFR:** A1  
**Version:** draft-1  
**Content status:** Implemented in runtime as `CASE-004`  
**Case type:** Everyday mystery; independent of the story world  
**Lore status:** No worldbuilding or canon implications  
**Spoiler level:** Low

## 1. Learner-facing introduction

Mina visits a small train station on a cold morning. She wears a blue scarf. When her train arrives, the scarf is no longer around her neck.

Mina asks the station staff for help. Three short records are available.

## 2. Exact learner task

**Where is Mina's scarf now? Choose the best-supported answer and explain how the records help you decide.**

Expected output: one location, with a short explanation. The task does not ask the learner to accuse anyone or guess why the scarf was moved.

## 3. Author-only truth

- Mina took off her blue scarf while sitting on a bench beside Platform 2.
- The scarf, which has a small silver star, fell under the bench.
- A station cleaner found it while cleaning Platform 2.
- The cleaner took it to the station's lost-property desk.
- The scarf is at the lost-property desk when Mina asks for help.
- No one stole or deliberately hid the scarf.
- The cleaner's identity is not needed to answer the task.

This is a self-contained everyday case. The station, people, and event are fictional case details and have no connection to the site's story-world canon.

## 4. Cast and source map

- **Mina:** remembers wearing the scarf at the station but did not see where it fell.
- **Ticket clerk:** knows the station's lost-property desk and checks its current items.
- **Cleaner:** found the scarf under the Platform 2 bench and moved it.
- **Records:** a short cleaning note and the lost-property desk list.

## 5. Evidence register

| ID | Class | Evidence | Directly establishes | Does not establish |
|---|---|---|---|---|
| E01 | ESSENTIAL | Mina says she had a blue scarf with a small silver star when she sat at Platform 2; it was missing when she boarded her train. | The scarf's description and Mina's last known possession. | The exact place where it was left. |
| E02 | ESSENTIAL | Cleaning note: “Platform 2, 8:20. I found a blue scarf with a small silver star under the bench. I took it to the lost-property desk.” | A matching scarf was found under the bench and transferred to the desk. | The note does not name the owner. |
| E03 | ESSENTIAL | Lost-property list: “8:25 — one blue scarf with a small silver star received from Platform 2.” | The matching item was received by lost property. | The list does not name the owner. |
| E04 | CONTEXTUAL | A station notice says: “Lost property is kept at the ticket desk.” | The desk is the station's lost-property point. | Anything about who lost or found the scarf. |

The intended answer follows from the match between Mina's description and the two station records. The case does not rely on guessing a person's motive or treating an opportunity as proof.

## 6. Conclusion model

**Single supported conclusion:** Mina's blue scarf is at the lost-property desk.

The records support this location:
- E01 places Mina and the scarf at Platform 2 before it goes missing.
- E02 records a blue scarf found under the Platform 2 bench and moved to lost property.
- E03 confirms that a blue scarf from Platform 2 was received at the desk.
- E04 explains where lost property is kept.

The repeated silver-star detail links Mina's scarf to the item found and received at the desk. It does not prove who caused it to fall, and that question is outside the task.

## 7. Standard Mode

**Reasoning prompt:** Explain why the lost-property desk is the best place to look for Mina's scarf.

**Conclusion choices:**

A. The scarf is at the lost-property desk.  
B. The scarf is still under the bench on Platform 2.  
C. The scarf is on Mina's train.

**Answer key:** A

**Distractor rationale:**
- A uses the place where the scarf was found but ignores the record that it was moved.
- C confuses the train Mina boarded with the place where the scarf was last recorded.
- B combines the cleaning note with the lost-property list and the station notice.

The options are short and concrete for A1. The current runtime places the supported conclusion first; randomized option ordering remains a separate UI improvement.

## 8. Hell Mode

The learner writes two separate responses: **Conclusion** and **Reasoning**.

Expected conclusion:
- The blue scarf is at the lost-property desk / ticket desk.

Expected reasoning:
- Mina had the blue scarf with the small silver star at Platform 2.
- The cleaner found a scarf with the same description under the bench.
- The cleaner took the scarf to lost property, and the station list confirms receipt.

Accept simple paraphrases such as “It is with the lost things at the ticket desk.” Do not require the exact phrase “lost-property desk.”

## 9. Hint ladder

Hints are optional and do not reduce the score.

1. **Direction:** Look at what happened after Mina sat on the bench.
2. **Connection:** Follow the blue scarf from the cleaning note to the station list.
3. **Reasoning:** One record says where the scarf was found. Another says where it was taken.

The hints do not name the final location.

## 10. Assessment rubric

| Dimension | Full-credit meaning |
|---|---|
| Conclusion | Locates the scarf at the lost-property desk / ticket desk. |
| Evidence connection | Uses the Platform 2 cleaning note and the received-item list. |
| Sequence | Understands that the scarf was found first and moved afterwards. |

**Partial credit:**
- Says the scarf is at the station but does not identify the desk: partial.
- Identifies the lost-property desk but gives no supporting reason: conclusion credit, limited reasoning credit.
- Says it is under the bench: recognizes the discovery location but misses the later movement.
- Accuses the cleaner of stealing it: unsupported and inconsistent with the recorded transfer.

## 11. Validation and review

- The task asks for one concrete output: the scarf's current location.
- The evidence is short, concrete, and uses common A1 vocabulary.
- The answer requires following a simple sequence, not specialist knowledge.
- The learner is not asked to identify a culprit.
- The conclusion is supported by the essential evidence.
- Alternative wording for “lost-property desk” must be accepted.
- No hidden clue is required.
- The runtime assessment uses `CASE-004` with a fixed A1 level, four evidence records, two evidence checks, three conclusion choices, semantic answer concepts, and regression tests.

## 12. Runtime implementation notes

- The learner-facing case and assessment snapshot share one registry entry in `language-detective-assessment-fixtures.js`.
- The case appears in the picker under A1 and is labelled as an everyday mystery.
- Standard Mode uses the three conclusion choices; Hell Mode keeps separate Conclusion and Reasoning fields.
- The evaluator accepts clear A1 paraphrases, recognizes a clear pronoun antecedent such as “it” when the scarf has already been named, and rejects unsupported theft claims.
- Regression coverage distinguishes the scarf's discovery place (under the bench) from its later location (lost property).

---

**Runtime ID:** `CASE-004`  
**Editorial ID:** `LD-A1-002`  
**Implementation status:** Integrated on `main`; full repository test workflow passed.
