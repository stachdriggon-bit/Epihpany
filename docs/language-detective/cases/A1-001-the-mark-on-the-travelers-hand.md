# A1 Case Proposal — The Mark on the Traveler's Hand

**Case ID:** LD-A1-001  
**Working title:** The Mark on the Traveler's Hand  
**CEFR:** A1  
**Content status:** Provisional case proposal — not implemented in the game  
**Lore status:** Case event and setting are non-canon until reviewed; the underlying mark rule is drawn from the current world foundation  
**Version:** draft-1  
**Spoiler level:** Low

> This is a small pilot case to test the new authoring standard. It deliberately avoids inventing registration procedures, institutional authority, a named character, or a new magical rule.

## 1. Learner-facing introduction

A traveler stops at a roadside waystation. While taking off a glove, the traveler reveals a clear symbol on one hand. The attendant has seen a similar symbol in a reference guide, but another traveler makes a much bigger claim about what it means.

The waystation keeps a short observation note and a copy of the reference entry.

## 2. Exact learner task

**What can be concluded about the traveler from the visible mark? Choose the best-supported statement and explain which information the mark does—and does not—provide.**

Expected output: one qualified conclusion, supported by a short explanation. The task asks for one best-supported statement; it does not ask the learner to identify the traveler's exact ability.

## 3. Author-only truth

- The traveler is a sorcerer and can control Aelora Energy.
- The visible symbol is the traveler's restraint mark.
- The mark identifies the category of the traveler's restriction.
- The mark does not reveal every practical detail of the traveler's individual restriction, ability, techniques, or mastery.
- The other traveler's claim that the mark reveals the traveler's exact techniques is incorrect.
- No conclusion about registration status, strength, motive, or character history is part of this case.

The case event, waystation, attendant, and other traveler are invented placeholders for this learning exercise. They are not established people, locations, or events in The Resonance.

## 4. Source and cast map

- **Traveler:** the person whose hand mark is observed. They do not provide a statement about their ability.
- **Waystation attendant:** records only the visible mark; does not claim to know the traveler personally.
- **Second traveler:** makes an unsupported claim that the mark reveals exact techniques.
- **Reference guide:** a short in-world explanatory extract based on the established mark rule. It is a case-authored teaching document, not a newly established institution or official world publication.

## 5. Evidence register

| ID | Role | Evidence | Directly establishes | Does not establish |
|---|---|---|---|---|
| E01 | ESSENTIAL | The attendant's observation note describes a visible restraint symbol on the traveler's hand. | A mark was visibly present. | The traveler's exact ability, strength, or registration status. |
| E02 | ESSENTIAL | The reference guide states that the mark appears when a person becomes able to control Aelora Energy. It identifies the restriction category, not every detail of the individual restriction. | What the mark signifies and the boundary of what it reveals. | The traveler's specific techniques, full limits, or level of mastery. |
| E03 | CONTEXTUAL | Another traveler says the mark reveals every technique the person can use. | A claim was made by a second traveler. | That the claim is accurate. |

The core conclusion is reachable from E01 and E02 alone. E03 adds a claim to evaluate but is not required to solve the case.

## 6. Supported conclusion

**The traveler is a sorcerer, but the mark does not reveal every detail of their individual ability or restriction.**

Why it is supported:
- E01 records the visible mark.
- E02 explains that the mark appears when a person becomes able to control Aelora Energy.
- E02 also limits what can be inferred: the mark identifies a restriction category, not every individual detail.

## 7. Standard Mode

**Reasoning prompt:** Explain what the visible mark establishes and why it does not tell us everything about the traveler's ability.

**Conclusion choices:**

A. The traveler is a sorcerer, but the mark does not reveal every detail of their individual ability or restriction.  
B. The traveler has registered with the local authorities, because the mark confirms completed registration.  
C. The traveler's exact techniques and level of mastery can all be identified from the mark.

**Answer key:** A

**Distractor rationale:**
- B confuses the appearance of a mark with registration. The current world foundation explicitly distinguishes the two; the mark does not mean registration happened automatically.
- C overstates what the mark reveals. It identifies a restriction category, not all individual details or mastery.

Options are intentionally similar in length and grammatical form. The correct option must not be made visually distinctive in the UI.

## 8. Hell Mode

The learner writes a separate **Conclusion** and **Reasoning** response.

Expected conclusion:
- The traveler is a sorcerer / can control Aelora Energy.
- The mark does not reveal all details of their individual ability or restriction.

Expected reasoning:
- The observed mark is linked to becoming able to control Aelora Energy.
- The mark identifies a restriction category but not the full individual details.

Accept clear A1-level paraphrases. Do not require the learner to reproduce the terms "restriction category" or "individual restriction" exactly if the meaning is expressed accurately.

## 9. Assessment outline

| Dimension | Required meaning |
|---|---|
| Conclusion accuracy | Identifies the traveler as a sorcerer / able to control Aelora Energy. |
| Evidence reasoning | Connects the observed mark to the reference guide. |
| Evidence boundary | Does not claim the mark reveals exact techniques, full restriction details, mastery, or registration. |

**Partial credit:**
- Correctly identifies the traveler as a sorcerer but claims the mark reveals every ability detail: partial, with an evidence-boundary correction.
- Correctly says the mark does not reveal exact abilities but fails to state what it does establish: partial.
- Says only that the traveler has a mark, without interpreting it: incomplete.
- Claims registration or exact mastery as established: unsupported.

## 10. Hint ladder

Hints are optional and must not reduce score.

1. **Direction:** Start with the observation and the reference entry. What does the reference say the mark means?
2. **Connection:** Separate what the mark identifies from the details it does not show.
3. **Reasoning:** State one thing the mark establishes and one thing it cannot tell us.

The final hint is intentionally more explicit than the task, but it still does not supply the complete conclusion.

## 11. Quality review

- Task is explicit: one best-supported statement plus an explanation.
- The prompt does not name the answer or tell the learner which evidence item is decisive.
- The core conclusion relies on essential evidence only.
- The distinction between a visible mark and completed registration is preserved.
- The case does not assume that the mark reveals exact ability details.
- No new institution, character biography, magical technique, or canon event is introduced.
- The case has a simple, defensible answer suitable for an A1 pilot.

## 12. Open review questions

1. Is the roadside waystation setting acceptable as a case-only, non-canon setting?
2. Is the reference-guide extract a clear enough source for an A1 learner, or should it be represented as a short note with simpler wording?
3. Does this feel like a small investigation rather than a lore comprehension quiz? If not, we should add one simple but meaningful piece of evidence—not extra complexity for its own sake.

---

**Implementation gate:** Do not add this proposal to the live case data or assessment fixtures until the case has been reviewed and approved. The current Language Detective implementation still contains the three existing cases; this proposal does not change runtime behavior.
