# EPIPHANY — Content Development Roadmap 2
**The Language Detective — Approved Functional Specification**  
**Roadmap ID:** CDR-2  
**Status:** Design decisions approved; documentation baseline  
**Parent roadmap:** [CONTENT-DEVELOPMENT-ROADMAP.md](./CONTENT-DEVELOPMENT-ROADMAP.md)  
**Scope:** Think Lab → The Language Detective  
**Implementation status:** Not started

---

## 1. Purpose and relationship to the main roadmap

This document records the functional decisions approved during the design discussion for **The Language Detective**. It is a companion specification, not a replacement for the main Content Development Roadmap.

The main roadmap remains the overall phase checklist and source of truth for project-wide sequencing. This document preserves the detailed decisions for this activity so that design work, implementation, and later revisions can be tracked without overloading the main roadmap.

### Decision-status vocabulary

- **Approved:** explicitly agreed and may be treated as the current design baseline.
- **Open:** requires a later design decision; do not invent a value or behavior.
- **Not started:** no implementation has been authorized or completed.
- **Proposed Lore:** a possible story-world addition, not Canon unless separately approved.

The specification records design approval only. It does not authorize implementation by itself.

## 2. Product identity and learning priorities

The Language Detective remains an educational activity inside Think Lab, not a replacement for The Resonance.

Priority order:

1. Teach learners to think in English.
2. Make investigation and deduction enjoyable.
3. Keep visual complexity low and subordinate to learning.

The interface should retain the existing straightforward activity style:
- a clear text-based case or situation;
- readable evidence and information;
- answer options;
- optional hints;
- educational explanations and feedback.

Do not redesign it as a cinematic investigation board. No evidence-wall interface, maps, scenes, decorative images, or elaborate visual investigation environment are part of this specification. Those belong to The Resonance.

### Learning objectives

The activity should develop the learner's ability to:
- understand and analyze information;
- connect pieces of evidence;
- draw justified inferences;
- notice contradictions;
- distinguish facts from assumptions;
- evaluate source reliability and the limits of available evidence;
- express a conclusion and justify it in English.

## 3. Independent configuration dimensions

The learner's session has three independent configuration dimensions.

### 3.1 English proficiency — CEFR

A1, A2, B1, B2, C1, and C2 determine the language used and the depth of reasoning expected.

### 3.2 Training Mode

- **Guided:** progressive, clearer support and more explicit help.
- **Steady:** balanced independent investigation, with limited hints when requested.
- **Challenge:** more demanding reasoning, stronger ambiguity management, and fewer hints.

Training Mode must not redefine or silently change the selected CEFR level.

### 3.3 Answer Format

- **Multiple Choice**
- **Hell Mode**

Hell Mode is an answer-format option, not a fourth CEFR level or a Training Mode. It is available from the beginning; it is not locked behind progression and may be combined with any CEFR level and Training Mode.

Hell Mode changes only the final-conclusion response format:
- Intermediate investigation questions remain Multiple Choice.
- The standard final conclusion remains Multiple Choice.
- In Hell Mode, the final response has two separate fields: **Your Conclusion** and **Your Reasoning**.
- Show a brief notice before the learner starts a Hell Mode case.

There should be no artificial restriction on selecting CEFR, Training Mode, or Answer Format.

## 4. Case categories and story-world boundaries

Cases may be:

- **Standalone Cases:** self-contained and playable in any order.
- **Lore Cases:** connected to the EPIPHANY world; clues or threads may continue across multiple cases.

Seven case types are approved as the initial taxonomy:

1. Timeline Reconstruction
2. Conflicting Testimonies
3. Report Analysis
4. Hidden Connections
5. Fact or Assumption
6. Message Decoding
7. Mystery Investigation

These types are not mutually exclusive. A case may combine several types, and the taxonomy may be extended when a genuine learning need requires it.

### Lore rules

- Do not contradict established Canon.
- Keep **Canon**, **Proposed Lore**, and **Mystery / Unresolved** information clearly distinguished.
- New ideas may be developed using existing world records as context, but they do not become Canon without the user's explicit approval.
- Do not reveal intentionally protected secrets or rewrite established events.
- The Resonance remains the deeper, story-led and visually immersive experience; The Language Detective uses lore only where it supports the learning case.

## 5. CEFR progression

Higher CEFR levels must change the depth of language and reasoning, not merely make passages longer or vocabulary rarer.

| Level | Approved learning progression |
|---|---|
| A1 | Short cases, direct evidence, identify a person/place/time, connect two clear facts. |
| A2 | Several clues, sequence events, simple cause and effect, straightforward contradictions. |
| B1 | Missing information, indirect inference, contradictions, fact versus assumption. |
| B2 | Multiple sources and testimonies, compare accounts, assess source reliability. |
| C1 | Complex reports, competing interpretations, examine assumptions and evidence strength. |
| C2 | Ambiguity, bias, subtle contradictions, limits of evidence, degrees of certainty, implicit or figurative language. |

All seven case types may appear at any CEFR level when appropriately adapted.

## 6. Case structure and evidence model

Keep **Case Data** separate from **Session Data**. Case Data describes the reusable authored case; Session Data records one learner's attempt and progress through it.

The conceptual Case Data should include:
- stable Case ID;
- title;
- case type or types;
- lifecycle status and case version;
- learning profile and intended CEFR level;
- introduction;
- evidence collection;
- investigation logic and relationships;
- intermediate questions and feedback;
- final-conclusion criteria and rubric;
- hints;
- Lore and quality-control metadata.

### Evidence records

Each evidence item should have:
- stable Evidence ID;
- evidence role: **Essential**, **Optional**, or **Hidden**;
- content;
- learning purpose;
- discovery method;
- unlock condition, if applicable;
- related evidence references;
- interpretation guidance: what it supports, what it does not prove, and what uncertainty remains.

Evidence role and discovery method are separate properties.

### Discovery methods

- **Automatic:** becomes available as part of the case flow.
- **Player Discovery:** the learner actively finds or opens it.
- **Conditional Discovery:** becomes available after a meaningful action, such as noticing a detail, connecting clues, or choosing an appropriate investigation action.

### Evidence relationships

Evidence forms a network, not necessarily a linear chain. Supported relationship concepts:

- Supports
- Contradicts
- Explains
- Weakens
- Contextualizes

Essential evidence must be sufficient for a fair basic solution. Optional and Hidden evidence may deepen the investigation but must not secretly be required for the basic conclusion or a good grade. Missing optional/hidden evidence must not itself cause a penalty.

## 7. Investigation flow and intermediate questions

Approved case lifecycle:

**Case Introduction → Evidence Discovery → Investigation Questions → Final Conclusion → Case Review**

Intermediate questions should be meaningful investigation steps, not filler quizzes.

Indicative question counts (flexible, not quotas):

- A1–A2: 2–3
- B1–B2: 3–4
- C1–C2: 4–5

Possible question roles:
- Comprehension
- Connection
- Timeline
- Contradiction
- Inference
- Reliability

Each question should conceptually contain:
- stable Question ID;
- Question Role;
- prompt and question type;
- required and supporting Evidence References;
- answer options;
- accepted answer or answers;
- educational explanation;
- optional hints;
- unlock condition.

A question must not appear until its required evidence is available. Its explanation must not reveal the final solution prematurely. Optional evidence may enrich an answer but must not become an undisclosed requirement. Do not repeat questions simply to meet a target count.

### Intermediate answer behavior

- Intermediate questions use Multiple Choice in both standard and Hell Mode.
- Answers may be retried.
- A wrong answer must not block progress or access to essential evidence.
- Preserve first and subsequent attempts for review.
- Correcting an earlier misunderstanding should not automatically reduce the final grade.

## 8. Hints and language support

Hints are optional and do not directly penalize the learner.

Hint depth:
1. Direction Hint
2. Connection Hint
3. Reasoning Hint

Training Mode influences hint availability and explicitness:
- Guided: progressive and clear help.
- Steady: limited hints, available on request.
- Challenge: fewer hints that avoid revealing the solution.

Record hint usage. Show **Independence** separately as High / Moderate / Assisted; Independence is not part of the academic grade.

Explanations are English-first. Arabic support is on demand and replaces the English text in the same space; do not show both languages side by side. Translation must not reveal a targeted answer or undermine the English task.

## 9. Final conclusion and evaluation

### Final answer formats

- **Standard:** select an acceptable conclusion from options.
- **Hell Mode:** write in two separate fields, **Your Conclusion** and **Your Reasoning**.

The initial semantic evaluation should use local structured rules and authored case data; no external AI service is assumed for version one.

Each case's evaluation data should define:
- accepted conclusions;
- meaning-equivalent alternatives;
- required concepts and evidence points;
- supporting evidence;
- unsupported claims and common reasoning errors;
- relevant uncertainty and evidence limitations.

Evaluation principles:
- Accept valid alternative wording that expresses the same meaning.
- Minor grammar errors do not invalidate a clear conclusion.
- Award partial credit for partially correct reasoning.
- Do not automatically classify unclear answers as wrong; clarify or request a more precise response where appropriate.
- Do not accept keyword-only answers: evaluate meaning, evidence relationships, and claims.
- Distinguish a supported conclusion from a plausible but unproven claim.

### Separate assessment dimensions

Assess these separately:
1. Conclusion Accuracy
2. Evidence Reasoning
3. Critical Thinking

Also provide an Overall Grade, but it must not be a simplistic arithmetic average of letter grades.

Approved grade scale:
- S — Exceptional
- A+ — Outstanding
- A — Excellent
- B — Good
- C — Satisfactory
- D — Weak
- F — Inconclusive

Independence remains a separate descriptor and does not affect the grade.

Do not penalize a learner for missing Optional or Hidden evidence. **S** represents exceptional quality of thinking, not merely completion or evidence collection. Guided mode is capped at **A+**; S is available in Steady and Challenge.

## 10. Case Review and evidence states

Case Review should explain:
- what the investigation established;
- accepted conclusions and reasonable alternatives;
- decisive evidence and how the clues connect;
- what was not established or remains unresolved;
- optional/hidden evidence the learner missed (shown only after the investigation);
- the learner's assessment dimensions, Overall Grade, and Independence.

Evidence states:
- Undiscovered
- Discovered
- Reviewed
- Connected

Discovering, reviewing, or connecting evidence does not prove that the learner understood or used it correctly. Assessment must evaluate actual reasoning, not the number of evidence items opened or linked.

## 11. Session persistence, save, and history

Case Data and Session Data must remain separate. Do not duplicate the full case definition into every session.

Session data conceptually includes:
- Case ID and exact case version;
- CEFR, Training Mode, and Answer Format;
- evidence states;
- every intermediate answer and attempt;
- hint usage;
- final conclusion and reasoning;
- completion state and result report.

Session states:
- Not Started
- In Progress
- Awaiting Final Conclusion
- Completed

A learner may have multiple unfinished investigations at once. Each must remain independent and resumable.

### Manual save behavior

Use a simple Save control in the existing interface, similar in spirit to Word:
- one action saves the session to the user's account through Supabase;
- no filename, folder, or repeated confirmation dialog;
- show a small success or failure indication;
- if cloud save fails, retain a safe temporary local copy for recovery/retry and clearly state that cloud saving did not complete;
- a local temporary copy must never be presented as confirmation of account/cloud save;
- resume from the latest successfully saved state.

### Completed Case History

Completed attempts are automatically stored as immutable historical records, grouped by case.

Each record preserves its date, configuration, answers, hint use, grades, Independence, report, and exact case version. Learners may review and compare attempts. A new attempt never overwrites an older one. Updating a case must not rewrite historical attempts.

## 12. Rewards and EPIPHANY integration

- Award the case's base completion XP once per case, not again on replay.
- Eligible Optional/Hidden discoveries may grant a curiosity reward once per discovery/reward.
- Achievement rewards are granted once per achievement.
- Replay remains available for learning and improvement; it may update personal records but does not repeat base XP.
- Optional/Hidden evidence is never required for completion or a strong grade.
- Integrate with the existing CEFR, Progress, XP, and Achievements systems without silently changing the learner's CEFR.
- Case vocabulary may be offered for addition to SRS. Do not add every word automatically; the learner chooses which words to keep.
- A case may optionally be selected as a Daily Challenge, but The Language Detective must not become mandatory in the daily path.
- No connection to Card Collection, card currency, purchases, or gacha.

## 13. Case quality and lifecycle

Quality review must cover:
- Learning Value
- Evidence Quality
- Logical Fairness
- Investigation Experience
- Answer & Feedback
- Lore Consistency
- Expandability

Lifecycle states:
1. **Draft Case:** in development and hidden from learners.
2. **Quality Review:** review language, CEFR fit, logic, evidence sufficiency, alternatives, evaluation, flow, and Lore consistency.
3. **Approved Case:** passed review and eligible for publication.

An Approved Case may return to Draft if a defect is found or a substantial revision is needed. Only Approved Cases are visible to learners. Proposed Lore never becomes Canon automatically.

## 14. Open design decisions — not yet approved

The following are intentionally unresolved. Do not invent or implement them until discussed and approved:

1. Exact machine-readable Case Data schema and validation rules for cases, evidence, questions, conclusions, and rubrics.
2. Exact Overall Grade calculation policy.
3. Hell Mode semantic-evaluation edge cases, including borderline and ambiguous responses.
4. Persistence schema, conflict handling, offline recovery, and account-sync behavior.
5. Exact XP amounts, curiosity reward values, and achievement thresholds.
6. How a case's CEFR level is selected and how it relates to the learner's current level without silently changing that level.
7. Accessibility and mobile behavior for the existing evidence/options interface.

## 15. Implementation gate and next step

No code or UI implementation has been approved by this document.

Before implementation:
1. Resolve the open design decisions.
2. Design and review the Case Data Schema.
3. Validate the schema against a small representative sample case.
4. Consolidate and review the complete approved specification.
5. Obtain explicit approval for implementation scope.

**Next design task:** define the Case Data Schema conceptually, then test it against a small sample case. Keep this work in design/review mode until the user explicitly approves implementation.

---

**Checkpoint:** The Language Detective functional design decisions listed in Sections 2–13 are approved and recorded here. The schema and the seven decisions in Section 14 remain open. Implementation has not started.


---

## 16. Assessment design and manual calibration record

**Status:** Design work in progress; no assessment-engine implementation has started.

This section records the experimental assessment work completed after the original functional specification. All scores below are **manual design simulations**, not runtime results, automated tests, or evidence that a software engine exists.

### 16.1 Three experimental reference cases

The following cases are design fixtures for validating assessment behavior:

- **CASE-001 — The Missing Package (A2):** an unidentified resident was observed picking up a package from reception; the person's identity and motive remain unknown. Adam's absence from reception does not implicate him. Sara's observation is decisive. The package label is optional and must not be required for a fair conclusion.
- **CASE-002 — Conflicting Accounts (B1–B2):** an envelope is found in Room B. Lena reported moving papers and her access card was used for the room, but the log does not prove who physically used the card or what was moved. Omar saw unidentified papers, not a positively identified envelope. Other volunteers remain a possible alternative.
- **CASE-003 — The Uncertain Evidence (C1–C2):** R-4 recorded an unusual increase in signal strength, but its origin is unresolved. A technical fault and an external source remain possible. R-7 is not a direct comparison because its direction and sensitivity differ. The technician's personal note is not a diagnostic test. The weather note is optional and does not establish causality.

These are experimental standalone cases, not approved Lore or Canon.

### 16.2 Shared assessment dimensions and provisional weights

| Dimension | Provisional weight |
|---|---:|
| Conclusion Accuracy | 35% |
| Evidence Reasoning | 40% |
| Critical Thinking | 25% |

Each case has its own criterion-level rubric. The same three top-level dimensions and weights are retained across CEFR for comparability, while the expected depth and criteria within each dimension are adapted to the case's CEFR level.

The criterion performance scale is provisionally:
- Excellent — 100% of criterion points
- Strong — 75%
- Developing — 50%
- Limited — 25%
- No Credit — 0%

Provisional overall grade bands:
- S: 96–100
- A+: 90–95
- A: 80–89
- B: 70–79
- C: 60–69
- D: 40–59
- F: 0–39

These weights, bands, and grade gates remain open to calibration. A total score alone must not automatically award S. Guided remains capped at A+; S is available in Steady and Challenge when exceptional reasoning is demonstrated.

### 16.3 Manual simulation checkpoint

A first manual simulation set was drafted with eight illustrative answers per case (24 answer scenarios total), including:
- correct conclusions and meaning-equivalent paraphrases;
- plausible alternative conclusions;
- correct guesses with weak evidence reasoning;
- partial conclusions;
- unsupported accusations;
- source-limit errors;
- excessive skepticism;
- unsupported causal claims.

The initial score examples are illustrative and provisional. Review identified a need to handle ambiguous answers before assigning a final grade, check that each case's core finding is represented, separate conclusion accuracy from reasoning quality, and avoid rewarding either keyword matching or unjustified certainty.

One example was explicitly revised during review: the CA-S07 response, which accurately explained the access-card limitation but omitted the case's central finding, should receive a lower conclusion score. A revised illustrative split was 18/35 Conclusion, 34/40 Evidence, and 22/25 Critical Thinking (74/100), rather than the earlier draft score. This is a calibration note, not a tested engine output.

### 16.4 CEFR calibration principles

The top-level weights remain provisionally consistent across A1–C2. Criterion definitions and expected reasoning depth change with CEFR:

- A1–A2: direct evidence, simple connections, basic sequencing, and clear distinctions between fact and unsupported guess.
- B1–B2: multiple accounts, source comparison, contradictions, observation versus inference, and limitations of records.
- C1–C2: competing hypotheses, source limitations, bias, uncertainty calibration, causal reasoning, and design of discriminating follow-up investigations.

Do not reward answer length, rare vocabulary, or grammatical complexity as substitutes for sound reasoning. Do not penalize a clear and appropriate simple answer at a lower CEFR level. English fluency must not become a hidden component of the academic investigation grade.

### 16.5 Shared assessment safeguards

- Accept meaning-equivalent wording and defensible alternative conclusions.
- Do not use keyword presence as sufficient evidence of understanding.
- Separate conclusion accuracy, evidence reasoning, and critical thinking.
- Award partial credit where the answer demonstrates partial understanding.
- Distinguish a plausible but unproven hypothesis from an established fact.
- Treat materially ambiguous responses as requiring clarification rather than forcing an unreliable wrong/right classification.
- Do not penalize missing Optional or Hidden evidence.
- Do not penalize hint use in the academic grade; report Independence separately.
- Preserve the distinction between confirmed facts, inferences, hypotheses, and unknowns.
- Keep the final grade calculation and grade gates provisional until calibration is complete.

---

## 17. Phase 5 design — Training Modes and Answer Formats

**Status:** Proposed design for review; not yet approved as a final interaction specification and not implemented.

### 17.1 Training Mode behavior

**Guided**
- Provides clearer orientation and progressive scaffolding.
- Makes the Direction → Connection → Reasoning hint progression more explicit.
- Provides fuller explanatory feedback.
- May remind the learner what kind of information to examine, but must not reveal the answer.
- Overall grade is capped at A+.

**Steady**
- Starts with balanced, independent investigation.
- Offers limited hints on request.
- Expects the learner to connect evidence without excessive prompting.
- S is available for genuinely exceptional reasoning.

**Challenge**
- Uses minimal initial guidance.
- Hints are less revealing and should not provide the reasoning on the learner's behalf.
- Expects more independent evidence comparison and uncertainty management.
- S is available for genuinely exceptional reasoning.

### 17.2 Invariants across Training Modes

Training Mode changes scaffolding and hint presentation, not the truth of the case or the academic standard.

- All Essential evidence required for a fair solution remains available in every mode.
- A mode must not create a hidden evidence dependency.
- Optional and Hidden evidence remain nonessential to basic completion and must not cause a grade penalty when missed.
- The same accepted conclusions, meaning-equivalent alternatives, evidence facts, and unsupported-claim rules apply in every mode.
- The same provisional 35/40/25 assessment weights apply in every mode.
- Hint usage affects the separate Independence descriptor, not academic points.
- CEFR remains independent of Training Mode; Challenge must not silently change the selected language level.

### 17.3 Answer Format behavior

**Standard**
- Intermediate questions: Multiple Choice.
- Final conclusion: Multiple Choice.

**Hell Mode**
- Intermediate questions remain Multiple Choice.
- Final response contains two distinct fields: **Your Conclusion** and **Your Reasoning**.
- Hell Mode is available with every CEFR level and Training Mode.
- Hell Mode does not award bonus points merely for being selected.
- The academic dimensions and weights remain unchanged.
- Evaluation must assess the conclusion and its justification, not writing length or advanced grammar.

### 17.4 Core mode/format test matrix

Run the six combinations for each of the three reference cases:

| Test ID | Training Mode | Answer Format |
|---|---|---|
| MODE-01 | Guided | Standard |
| MODE-02 | Guided | Hell Mode |
| MODE-03 | Steady | Standard |
| MODE-04 | Steady | Hell Mode |
| MODE-05 | Challenge | Standard |
| MODE-06 | Challenge | Hell Mode |

This produces 18 core case/mode/format combinations before adding hint-depth, retry, ambiguity, accessibility, and persistence scenarios.

### 17.5 Mode and format test cases

- MODE-T01: Identical correct Standard conclusion receives the same academic result in Guided, Steady, and Challenge, subject only to the explicit Guided A+ grade cap.
- MODE-T02: An identical unsupported accusation is not accepted in any Training Mode.
- MODE-T03: A defensible alternative conclusion remains accepted in all modes.
- MODE-T04: Using one, two, or three hints does not reduce academic points.
- MODE-T05: Hint usage changes only the Independence descriptor in accordance with the authored hint policy.
- MODE-T06: Challenge does not hide Essential evidence or introduce undisclosed dependencies.
- MODE-T07: Guided scaffolding does not reveal the final answer before the learner responds.
- MODE-T08: Intermediate questions remain Multiple Choice in Hell Mode.
- MODE-T09: Standard final conclusion remains Multiple Choice.
- MODE-T10: Hell Mode final response has separate conclusion and reasoning fields.
- MODE-T11: A concise, clear Hell Mode answer can receive full credit; verbosity is not rewarded.
- MODE-T12: Minor grammar errors do not invalidate clear reasoning.
- MODE-T13: Ambiguous Hell Mode answers can request clarification without prematurely recording a final grade.
- MODE-T14: CEFR, Training Mode, and Answer Format can be selected independently and are preserved in the session.
- MODE-T15: Repeated attempts and hint use do not silently alter the selected configuration or rewrite previous attempt records.

### 17.6 Phase 5 acceptance gate

Before Phase 5 can be marked complete, verify:
1. All six mode/format combinations work for all three reference cases.
2. Academic criteria remain consistent across Training Modes.
3. The Guided grade cap is applied without changing dimension scores.
4. Independence remains separate from academic grade.
5. Hint use does not reduce academic points.
6. Essential evidence remains accessible in every mode.
7. Optional/Hidden evidence never becomes a hidden requirement.
8. Intermediate and final response formats follow the Standard/Hell rules.
9. Ambiguity, retries, and configuration persistence behave consistently.
10. Representative CEFR examples are reviewed for appropriate language and reasoning depth.

No implementation or automated test execution is claimed by this design record.

---

## 18. Assessment work status and next sequence

| Work item | Status |
|---|---|
| Three experimental reference cases | Drafted |
| Criterion-level scoring rubrics | Drafted; provisional |
| 24-answer manual simulation | Drafted; design exercise only |
| CEFR-specific criterion calibration | Proposed and reviewed in design |
| Phase 5 mode/format specification | Proposed for review |
| Automated assessment tests | Not started |
| Assessment Engine implementation | Not started |
| Persistence & Recovery design | Still open |

Next sequence:
1. Review and approve the Phase 5 behavior and invariants.
2. Complete mode/format scenario simulations, including hint and ambiguity edge cases.
3. Calibrate overall grade calculation and grade gates using the expanded results.
4. Complete the Assessment Engine approval gate.
5. Only then proceed to the separate Persistence & Recovery design and implementation planning.

**Checkpoint:** The original functional specification remains the approved baseline. The assessment rubrics, manual simulation, CEFR calibration, and Phase 5 details are recorded as provisional design work. No code implementation or automated test run has occurred.
