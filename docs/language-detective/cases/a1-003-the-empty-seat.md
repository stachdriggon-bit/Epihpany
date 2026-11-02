# LD-A1-003 — The Empty Seat

**Runtime ID:** `CASE-005`  
**CEFR:** A1  
**Category:** Everyday mystery  
**Status:** Implemented; verification pending

## Learner-facing task

Three passengers claim a green canvas bag found beside a bench in a station waiting room. Decide whose bag is the best-supported match. Compare the seating record, the bag inventory, the claimant's account, and an independent library record. A strong match is not absolute proof.

## Case truth (author-only)

Lina is the best-supported owner of the bag. The conclusion is an evidence-based inference, not a certainty claim.

- The seating log places Lina at the timetable bench; Omar and Nora are recorded in different parts of the waiting room.
- The found-property report places the green canvas bag beside the timetable bench but does not identify its owner.
- The inventory lists a paperback, a blue notebook, and a red pencil case.
- Lina's interview confirms those three contents.
- The library record independently links Lina to the same paperback that morning.
- Omar describes a black backpack with a laptop; Nora describes a blue shopping bag with a scarf.
- The kiosk receipt is contextual only. It does not prove ownership and is not required for the conclusion.

## Decisive reasoning

The learner must connect at least two independent information sources:

1. The bag's location is consistent with Lina's recorded waiting place, but location alone does not prove ownership.
2. The three-item inventory matches Lina's interview answer.
3. The independent library record links Lina to the paperback in the bag.
4. The other claimants' descriptions do not match the found green canvas bag.

Together these details make Lina the best-supported owner. They do not establish absolute ownership beyond all doubt.

## Investigation path

The required path is the four evidence records `E01`–`E04` plus Lina's one-question interview `Q-BAG-CONTENTS`. The optional kiosk receipt `E05` may add timeline context but is not a prerequisite and must not be required in assessment.

The initial statements for Lina, Omar, and Nora are visible from the beginning. Lina's interview answer is added to the notebook only after the learner chooses that question. The evaluator receives the interview-dependent concepts only after the answer is revealed.

## Assessment contract

- Accept a clear conclusion that Lina is the most likely or best-supported owner.
- Reward the inventory-to-interview match and the independent library link.
- Reward calibrated language: the evidence supports the conclusion but does not prove ownership with absolute certainty.
- Do not accept certainty claims that exceed the evidence.
- Do not require the optional kiosk receipt.
- Do not penalize the learner for not using the receipt or for not naming an unsupported motive.

## Quality checks

- [x] Stable runtime and editorial IDs.
- [x] A1 learner-facing language and three conclusion choices.
- [x] Multiple independent sources support the central inference.
- [x] No single unique personal mark determines ownership.
- [x] Optional evidence is not required for conclusion readiness.
- [x] One interview question is available for Lina.
- [x] Discovered interview information is retained in the notebook.
- [x] Path-aware assessment excludes interview-dependent concepts until the answer is revealed.
- [ ] Full repository test workflow passes.
