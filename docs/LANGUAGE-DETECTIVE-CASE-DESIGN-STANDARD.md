# EPIPHANY — Language Detective Case Design Standard

**Document ID:** LD-CDS-1  
**Status:** Approved design standard; case proposals remain provisional until reviewed  
**Scope:** Language Detective case writing, CEFR progression, evidence design, learner-facing tasks, and content validation

## 1. Core design principle

**Make the task clear without making the solution obvious.**

A learner must understand what they are being asked to determine, explain, compare, or evaluate. The task statement must not identify the decisive clue, prescribe the reasoning path, or reveal the answer.

Clarity belongs to the assignment. Discovery belongs to the learner.

## 2. Independent cases across CEFR

The six CEFR levels use distinct case content:

- A1
- A2
- B1
- B2
- C1
- C2

A learner must not be required to replay a lower-level case to understand the same event from a supposedly harder perspective. Each level introduces its own cases, events, evidence, characters, settings, and conclusions.

Difficulty must progress through both language and reasoning demands—not by replacing simple words with advanced vocabulary alone.

Suggested progression:

| Level | Language and reasoning profile |
|---|---|
| A1 | Short, concrete records; direct observations; one clear inference or simple conclusion |
| A2 | More details and time relationships; two connected facts; simple distinction between fact and assumption |
| B1 | Multiple accounts; basic contradictions; connect evidence from more than one source |
| B2 | Indirect evidence; source reliability; competing explanations and qualified conclusions |
| C1 | Incomplete or uneven evidence; complex relationships; assess the strength and limits of competing hypotheses |
| C2 | Dense but interpretable records; subtle conflicts in scope, attribution, and implication; evaluate nuanced competing explanations |

These are design targets, not rigid limits. A case should fit the level in both its English demands and its reasoning demands.

## 3. Training Mode and Hell Mode invariants

The case truth, evidence, accepted conclusions, and core assessment criteria remain the same across answer formats and Training Modes.

- **Training Mode** (Guided, Steady, Challenge) changes the amount and timing of scaffolding. It does not rewrite the case or make a different answer correct.
- **Standard Mode** retains its staged response: the learner submits reasoning first, then selects a conclusion from the authored options, and the assessment considers both together.
- **Hell Mode** retains two separate written fields—Conclusion and Reasoning—with no multiple-choice conclusion options.
- Hints remain optional. Using a hint must not reduce the learner's score.
- Hints may help the learner orient themselves, notice a relationship, or reflect on reasoning. They must not disclose the decisive evidence or dictate the solution.

## 4. Write the case truth before writing questions

Every case must begin with an author-only truth record. It must state:

1. What actually happened in the case.
2. Which actors did what, and when, where relevant.
3. What each source knows, observed, inferred, misunderstood, or may be concealing.
4. Which facts are established, which are reported, which are inferred, and which remain unknown.
5. Whether the case has one supported conclusion, multiple acceptable conclusions, or a deliberately unresolved element.
6. What evidence would be needed to distinguish competing explanations, if the current record cannot do so.

Do not write questions or answer options before the truth and evidence model are coherent.

A mystery may intentionally remain partly unresolved. However, the learner must be able to tell what the task asks and what kind of conclusion the evidence can support. An unresolved case must not be vague by accident.

## 5. Evidence design

For every evidence item, document:

- A stable evidence ID.
- Its source and form (observation, testimony, record, object, message, measurement, etc.).
- What it directly establishes.
- What it supports only indirectly.
- What it does not establish.
- Reliability, access, timing, and relevant limitations.
- Whether it is essential, contextual/optional, or hidden.
- Which hypotheses it supports, weakens, contradicts, or leaves open.

Rules:

- The core solution must be reachable using essential evidence alone.
- Optional or hidden evidence may add nuance, corroboration, or an alternate interpretation; it must not be secretly required for the basic solution.
- An absence of a record is not automatically proof that an event did not happen.
- Opportunity is not proof of action; access is not proof of identity; presence is not proof of motive.
- A witness's statement is evidence of what the witness reports, not automatic proof that every part of the report is true.
- Do not turn uncertainty into an accusation. If the evidence cannot identify a person, the case must not imply that it can.
- Evidence must not contradict the author-only truth unless the contradiction is intentional and explained (for example, a mistaken witness or altered record).

## 6. Task wording: clear, bounded, non-leading

Every learner-facing task must state the required outcome precisely.

Examples of task types:

- Identify the person or event supported by the record.
- Reconstruct the sequence of events.
- Explain which account is consistent with the evidence.
- Determine what a source can and cannot establish.
- Compare competing explanations and identify the better-supported one.
- Identify all conclusions supported by the evidence.
- State what remains unresolved and explain why.

If the task requires more than one conclusion, say so explicitly. If the learner must select every supported explanation, state that they should select all that apply. If only one best-supported conclusion is required, say that.

Do not:

- Name the decisive evidence in the task prompt.
- Tell the learner which two records to compare unless comparison itself is the skill being assessed.
- Give away a causal link or sequence the learner is meant to discover.
- Use vague prompts such as "What happened?" when several different kinds of answer could reasonably satisfy the question.
- Ask for a person's identity when the evidence only supports a description or leaves identity unknown.

A useful task statement tells the learner **what output is expected**, not **how to obtain it**.

## 7. Conclusions and acceptable answer sets

Before implementation, specify the answer model:

- **Single supported conclusion:** one conclusion is best supported by the complete record.
- **Multiple supported conclusions:** more than one distinct conclusion is independently supported; the task must make the expected answer count or selection rule clear.
- **Qualified conclusion:** the learner must state both what is established and what remains uncertain.
- **Unresolved conclusion:** the evidence cannot distinguish between named hypotheses; the correct response explains the limit rather than inventing certainty.

For each accepted conclusion, record its supporting evidence and reasoning requirements. If multiple formulations or interpretations are defensible, the rubric must recognize them.

Do not force a single answer merely because the UI has one answer slot. Do not accept mutually contradictory conclusions as equally correct unless the evidence genuinely leaves them equally viable and the task is designed to assess that uncertainty.

## 8. Distractor quality and answer-option balance

For every multiple-choice question:

- Distractors must be plausible interpretations of the case, not absurd or unrelated statements.
- Each incorrect option must contain a specific, explainable reasoning error (unsupported identity, mistaken timeline, overclaimed cause, source confusion, incorrect scope, and so on).
- Options should be comparable in length, specificity, grammar, and confidence.
- Do not copy a sentence from the evidence as the correct option while paraphrasing distractors in a way that makes the answer obvious.
- Avoid repeated answer-position patterns. Correct positions must be balanced and shuffled without breaking the relationship between an option and its explanation.
- Do not make every question a trick. Difficulty should come from reasoning, not obscure wording or arbitrary traps.

## 9. Language and reasoning difficulty

CEFR progression must affect the language the learner must read and produce, but it must not turn the task into a vocabulary puzzle.

- Keep A1/A2 sentences concrete and accessible while still requiring a real inference.
- Increase the number and interaction of sources gradually at B1/B2.
- At C1/C2, increase precision demands: attribution, scope, uncertainty, evidential strength, and competing hypotheses.
- Do not rely on obscure specialist vocabulary unless it is taught or explained by the case.
- Do not make a case difficult by hiding essential information in unnecessarily complex prose.
- Semantic alternatives should be accepted when they express the same supported meaning.

## 10. Lore integrity and provisional content

Cases inspired by The Resonance may use established lore, locations, characters, institutions, and events only within their documented limits.

- Separate established canon from proposed case-only details.
- Mark every new event, character, institution procedure, or historical claim as provisional until reviewed.
- Do not invent missing world rules to make a case work.
- Do not imply that a case proposal has become canon merely because it is stored in this repository.
- Keep case-specific fictional records distinct from authoritative worldbuilding records.
- Where lore is intentionally unresolved, preserve that uncertainty rather than silently resolving it in a learning exercise.

## 11. Required case authoring template

Every case proposal must contain:

1. **Case metadata:** ID, title, CEFR level, version, status, setting, and spoiler level.
2. **Learner-facing introduction:** concise context without answer leakage.
3. **Exact task statement:** expected output and number/type of conclusions.
4. **Author-only truth:** full event reconstruction.
5. **Cast and source map:** who knows what, and how they know it.
6. **Evidence register:** essential, contextual/optional, and hidden items with limits.
7. **Hypothesis/conclusion map:** supported, weakened, contradicted, and unresolved claims.
8. **Standard Mode design:** reasoning prompt, conclusion options, answer key, and option explanations.
9. **Hell Mode design:** expected conclusion and reasoning dimensions, including acceptable alternatives.
10. **Hints:** Direction → Connection → Reasoning, each optional and non-revealing.
11. **Assessment rubric:** concepts, evidence links, accepted variants, uncertainty/modality requirements, and partial-credit rules.
12. **Spoiler-safe feedback:** explanations that teach without exposing unrelated story secrets.
13. **Validation notes:** ambiguity checks, alternative-answer review, and lore/canon status.

## 12. Mandatory quality gate

A case is not ready for implementation until all checks pass:

- [ ] The author can state the full truth of the case without contradictions.
- [ ] The learner-facing task is clear on first reading.
- [ ] The task does not reveal the decisive clue or prescribe the reasoning path.
- [ ] The required number and type of conclusions are explicit.
- [ ] Essential evidence is sufficient for the intended solution.
- [ ] Every important claim has a traceable evidence link.
- [ ] The evidence limits are explicit and respected by the answer key.
- [ ] Plausible alternative answers have been considered and handled fairly.
- [ ] Distractors are plausible, balanced, and wrong for identifiable reasons.
- [ ] The English and reasoning demands fit the target CEFR level.
- [ ] Standard, Hell, and Training Modes preserve the same case truth.
- [ ] Hints support thinking without giving away the answer.
- [ ] New lore details are marked provisional and do not silently become canon.
- [ ] A reviewer who did not write the case can understand the task and solve it from the supplied evidence.

If a reviewer cannot tell what the task asks, revise the task. If the reviewer cannot justify the answer from the evidence, revise the case. Do not compensate for either problem by adding stronger hints.

## 13. Initial workflow

1. Approve this standard as the shared authoring contract.
2. Audit the three existing cases against it; do not automatically reuse them across CEFR levels.
3. Design one small, provisional A1 case from established lore.
4. Review its truth, evidence, task wording, and answer model before implementing it.
5. Build separate case sets for A1, A2, B1, B2, C1, and C2.
6. Update the game data and tests only after the case content passes review.

---

**Important:** This document defines case-design standards. It does not claim that the current game already contains six independent CEFR case sets, nor that the existing evaluator fully supports every answer model described here.
