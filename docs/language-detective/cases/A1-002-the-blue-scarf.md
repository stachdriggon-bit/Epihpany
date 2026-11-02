# A1 Case Proposal — The Blue Scarf

**Case ID:** LD-A1-002  
**CEFR:** A1  
**Version:** draft-1  
**Content status:** Provisional proposal — not implemented in the game  
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
- The scarf fell under the bench.
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
| E01 | ESSENTIAL | Mina's statement: “I had my blue scarf when I sat on the bench at Platform 2. I did not have it when I got on the train.” | The scarf was with Mina at the bench and was missing later. | The exact place where it was left. |
| E02 | ESSENTIAL | Cleaning note: “Platform 2, 8:20. I found a blue scarf under the bench. I took it to the lost-property desk.” | A blue scarf was found under that bench and taken to the desk. | Whether this is Mina's scarf by itself. |
| E03 | ESSENTIAL | Lost-property list: “8:25 — one blue scarf received from Platform 2.” | A blue scarf from Platform 2 is now recorded at the desk. | Who originally owned it. |
| E04 | CONTEXTUAL | A station notice says: “Lost property is kept at the ticket desk.” | The desk is the station's lost-property point. | Anything about who lost or found the scarf. |

The intended answer follows from the match between Mina's description and the two station records. The case does not rely on guessing a person's motive or treating an opportunity as proof.

## 6. Conclusion model

**Single supported conclusion:** Mina's blue scarf is at the lost-property desk.

The records support this location:
- E01 places Mina and the scarf at Platform 2 before it goes missing.
- E02 records a blue scarf found under the Platform 2 bench and moved to lost property.
- E03 confirms that a blue scarf from Platform 2 was received at the desk.
- E04 explains where lost property is kept.

The evidence strongly supports that the scarf at the desk is Mina's. It does not prove who caused it to fall, and that question is outside the task.

## 7. Standard Mode

**Reasoning prompt:** Explain why the lost-property desk is the best place to look for Mina's scarf.

**Conclusion choices:**

A. The scarf is still under the bench on Platform 2.  
B. The scarf is at the lost-property desk.  
C. The scarf is on Mina's train.

**Answer key:** B

**Distractor rationale:**
- A uses the place where the scarf was found but ignores the record that it was moved.
- C confuses the train Mina boarded with the place where the scarf was last recorded.
- B combines the cleaning note with the lost-property list and the station notice.

The options are short and concrete for A1. In implementation, their order should be randomized; the correct option must not be tied to a fixed position.

## 8. Hell Mode

The learner writes two separate responses: **Conclusion** and **Reasoning**.

Expected conclusion:
- The blue scarf is at the lost-property desk / ticket desk.

Expected reasoning:
- Mina had it at Platform 2.
- The cleaner found a blue scarf under the bench there.
- The cleaner took it to lost property, and the list says a blue scarf was received.

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
- This is a proposal only; it has not been added to runtime case data or assessment fixtures.

## 12. Open review points

1. Does the station setting and the small-scale mystery feel engaging enough for the first everyday A1 case?
2. Should the learner-facing records appear as separate evidence cards (Mina's statement, cleaning note, and desk list) in the final game presentation?

---

**Implementation gate:** Await review and approval before translating this proposal into runtime data or evaluator fixtures.
