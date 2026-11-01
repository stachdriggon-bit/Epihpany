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


---

## 19. Phase 5 — Expanded manual simulation record

**Status:** Manual design simulation completed for review; not an automated test run and not proof of implemented behavior.

### 19.1 The 18 core combinations

The six combinations below were reviewed for each of the three experimental cases, producing 18 case/mode/format scenarios:

| ID | Training Mode | Answer Format |
|---|---|---|
| MODE-01 | Guided | Standard |
| MODE-02 | Guided | Hell Mode |
| MODE-03 | Steady | Standard |
| MODE-04 | Steady | Hell Mode |
| MODE-05 | Challenge | Standard |
| MODE-06 | Challenge | Hell Mode |

Case-specific expected semantic outcomes:
- **CASE-001 / The Missing Package:** an unidentified resident picked up the package; identity and motive are unknown.
- **CASE-002 / Conflicting Accounts:** the envelope was found in Room B; Lena moving it with papers is plausible but unproven; the card log does not identify the physical user.
- **CASE-003 / The Uncertain Evidence:** an unusual R-4 reading was recorded; the available evidence does not establish an external source or a technical fault.

For each case, equivalent Standard selections and Hell Mode written responses should receive equivalent academic assessment when they express the same conclusion and reasoning. Guided, Steady, and Challenge must not alter accepted conclusions or evidence facts. Guided's A+ cap applies to the awarded grade only, not to the underlying dimension scores.

### 19.2 Hint ladder simulation

The three hint levels were reviewed against all three cases:

1. **Direction Hint:** directs attention to relevant evidence without identifying the answer.
2. **Connection Hint:** helps the learner connect relevant evidence or compare sources.
3. **Reasoning Hint:** clarifies the reasoning task and evidence limitations without supplying the final conclusion.

Case-specific examples:
- CASE-001: review reception statements → compare delivery and observation times → distinguish observed pickup from unknown identity/motive.
- CASE-002: review Omar's observation and the access log → compare reported paper movement with room access → distinguish card use from the identity of the user and contents moved.
- CASE-003: separate observation from interpretation → compare R-4, R-7, and maintenance limitations → identify competing hypotheses and evidence that could distinguish them.

Proposed hint behavior by mode:
- Guided may offer or suggest the first hint more readily and present fuller scaffolding.
- Steady provides hints on request with balanced explanation.
- Challenge provides concise, less revealing hints on request.
- All Essential evidence remains available in every mode.
- Hints do not reduce academic points.
- A learner may request a higher hint level without first submitting a wrong answer.
- Repeated requests do not create repeated rewards or academic penalties.
- A defective or answer-revealing hint is a content/design defect, not a learner failure.

**Proposed sequencing rule:** reveal hints in Direction → Connection → Reasoning order. The learner may progress to the next hint after viewing the previous one; no wrong answer is required to unlock it.

### 19.3 Retry simulation

An illustrative CASE-001 sequence was reviewed:
- Attempt 1: unsupported accusation against Adam.
- Attempt 2: incorrect inference that Sara picked up the package because she witnessed the event.
- Attempt 3: correct conclusion that an unidentified resident picked it up.

Expected behavior:
- Wrong attempts do not block investigation progress or create automatic grade deductions.
- Earlier answers remain in the attempt history.
- The latest clear response after feedback represents the learner's current demonstrated understanding for that question.
- The final case assessment uses the learner's final submitted conclusion and reasoning, with the full interaction history retained for review.
- A replay of the entire completed case creates a new attempt; it does not overwrite the previous attempt.
- A changed Training Mode or Answer Format applies to the new attempt only.

### 19.4 Ambiguity simulation

Reviewed response classes:
- unclear pronoun/reference: request clarification;
- materially ambiguous claim: request clarification where the ambiguity changes the assessment;
- true but incomplete fact: award partial credit;
- internal contradiction: identify the conflicting claims and explain the evidence boundary;
- clear paraphrase: accept;
- minor grammar errors with clear meaning: accept the meaning;
- concise but complete response: accept;
- keyword-only response without a valid relationship: do not award understanding;
- plausible hypothesis stated as certainty: assess overclaiming;
- unsupported or unclassifiable free response: use a clarification/unsupported classification rather than pretending to understand it.

Suggested evaluator outcomes include `NEEDS_CLARIFICATION`, `PARTIAL`, `ACCEPTED`, `UNSUPPORTED`, and `CONTRADICTION`. These are conceptual labels pending schema design, not implemented enums.

### 19.5 Mode differentiation and invariants

Modes must create genuinely different support experiences:
- Guided: clearer orientation, more explicit scaffolding, fuller feedback.
- Steady: balanced independent investigation and moderate support.
- Challenge: minimal proactive guidance and more independent reasoning.

The following must remain invariant:
- Essential evidence availability;
- case facts and event chronology;
- accepted conclusions and defensible alternatives;
- academic dimensions and provisional 35/40/25 weights;
- semantic standards and partial-credit principles;
- no academic penalty for hint use;
- no hidden grammar/verbosity bonus;
- no silent CEFR change.

Independence is a separate descriptor (High / Moderate / Assisted) and does not add or subtract academic points. A learner who uses no hints is not automatically entitled to bonus points.

### 19.6 Manual test inventory

The design review covered 57 scenario entries across:
- 18 core case/mode/format combinations;
- 9 hint scenarios;
- 8 retry scenarios;
- 10 ambiguity scenarios;
- 6 user-experience differentiation scenarios;
- 6 scoring fairness and invariant scenarios.

This inventory is a design-review count. It does not mean 57 automated tests were implemented or executed.

### 19.7 Open decisions before Assessment Engine approval

1. Define exact reproducible rules for Independence High / Moderate / Assisted.
2. Confirm whether question-level assessment uses the latest clear response after feedback, while retaining all earlier attempts (current proposal), or another policy.
3. Define clarification interaction limits and how many clarifications may be requested without penalty (current proposal: allow repeated clarification where needed, without grade penalty).
4. Define the exact local rule-based semantic evaluator's supported variants, contradiction handling, and safe fallback for unrecognized wording.
5. Define the final grade gates and scoring formula after calibration, rather than relying only on provisional bands.

### 19.8 Phase 5 status

The 18 combinations and the hint/retry/ambiguity/fairness scenarios have received a manual design review. Phase 5 is **not yet formally approved**: the open decisions above must be resolved, and the behavior must later be implemented and verified with automated tests. No code change or automated test execution is claimed by this record.


---

## 20. Phase 6 — Case Data Schema approval

**Status:** Approved design baseline; implementation not started.

The user approved the Phase 6 Case Data Schema direction. The approved decisions are:

### 20.1 Conceptual structure

Each reusable case is organized into:
- `metadata`: stable case identity, title, CEFR, case type, lifecycle status, and version information;
- `introduction`: learner-facing case introduction;
- `evidence`: stable evidence records;
- `investigation`: intermediate questions and their evidence dependencies;
- `conclusion`: final task and supported response formats;
- `evaluation`: authored assessment criteria and semantic rules.

The schema must include a `schemaVersion` so future schema evolution can be handled deliberately.

### 20.2 Evidence records and interpretation

Every evidence item has a stable ID, type, importance/role, and learner-facing content. Internal assessment metadata should describe:
- what the evidence supports;
- what it does not establish;
- known limitations or uncertainty.

These interpretation fields are evaluator guidance and must not be confused with learner-facing content.

An optional evidence item must never become an undisclosed requirement for a fair basic solution or a strong grade.

### 20.3 Semantic answer model

The evaluator must not depend on one exact model-answer sentence. It should represent:
- required concepts;
- meaning-equivalent accepted variants;
- evidence references and relationships;
- unsupported claims and overreach;
- relevant uncertainty and limitations.

Equivalent wording should be accepted when it communicates the same supported meaning. Concise, accurate answers must not be disadvantaged.

### 20.4 Schema validation requirements

Before a case can be approved for publication, validation must check at least:
- unique case identity and version;
- unique evidence and question IDs within the case;
- all evidence references resolve;
- all question dependencies refer to existing evidence;
- all evaluation references resolve;
- every required concept has an explicit criterion;
- optional evidence is not required by core questions or the basic conclusion;
- unsupported-claim rules include a rationale;
- the reference conclusion is consistent with the evidence;
- required content and evaluation sections are complete for the case lifecycle state.

### 20.5 Evaluation architecture and security limitation

Version one remains a local, structured, rule-based evaluator. Separating learner-facing case content from evaluation metadata is an organizational boundary, **not a security boundary**: client-delivered rules and reference answers can be inspected by a technically capable user.

A hybrid server-side evaluator may be reconsidered later if answer confidentiality becomes a product requirement. It is not part of the approved V1 scope.

### 20.6 Status boundary

This approval establishes the conceptual schema direction and validation requirements only. The exact machine-readable schema, field-level types, constraints, sample-case validation, evaluator rules, and automated tests remain to be specified in Phase 6. No code implementation or runtime verification is claimed.
 

---

## 21. Phase 6 — Local assessment engine architecture

**Status:** Approved conceptual architecture; implementation not started.

The user approved a deterministic, local, structured rule-based assessment engine composed of independently testable modules.

### 21.1 Evaluation pipeline

The conceptual pipeline is:

1. **TextNormalizer** — normalize safe surface-level variation without removing meaning-bearing tokens such as negation, uncertainty, or modality.
2. **SemanticMatcher** — match authored concepts and meaning-equivalent variants rather than requiring one exact model-answer sentence.
3. **EvidenceReasoner** — evaluate whether the response connects conclusions to relevant evidence and respects evidence limitations.
4. **ClaimValidator** — detect unsupported claims, overstatement, and contradictions against case facts or the learner's own response.
5. **EvaluationResolver** — combine module findings into a defined evaluation outcome and criterion-level assessment.
6. **FeedbackBuilder** — produce clear, educational feedback grounded in the case's authored criteria.

### 21.2 Deterministic behavior and case-driven configuration

The same normalized response, case version, and evaluation configuration should produce the same result. Case-specific concepts, accepted variants, evidence relationships, and unsupported claims belong in Case Data, not in one-off hard-coded branches for individual cases.

Each module must have a narrow responsibility and independently testable inputs and outputs.

### 21.3 Unknown wording and safe fallback

Unrecognized wording must not automatically be classified as incorrect. When the evaluator cannot confidently map a response to authored concepts, it should use a safe clarification or rephrasing path. It must not silently accept an unknown response, invent an interpretation, or penalize the learner merely because the local evaluator lacks a matching pattern.

### 21.4 Response-format invariants

Standard multiple-choice and Hell Mode free-text responses are different input paths but share the same underlying case truth, accepted conclusions, evidence standards, and academic rubric. Hell Mode receives no automatic score bonus for free-text entry.

### 21.5 Normalization safeguards

Normalization may handle safe formatting and known surface variants, but must preserve negation, uncertainty, modality, attribution, and other meaning-bearing distinctions. For example, changing "did" to "didn't" must never be treated as harmless normalization.

### 21.6 Status boundary

This approval defines the conceptual module architecture and fallback principle. Exact module contracts, semantic rule representation, conflict resolution, scoring integration, test fixtures, and executable behavior remain open for subsequent Phase 6 design. No implementation or automated verification is claimed.

 
---

## 22. Phase 6 — Semantic Evaluation and claim interpretation

**Status:** Approved conceptual design baseline; implementation and automated verification not started.

The semantic evaluator must recognize what a learner means, how claims relate to one another, and how strongly the available evidence supports them. It must not treat word presence as proof of understanding or assume that an unfamiliar sentence is wrong.

### 22.1 Concept model

Each case-authored concept is a small, reusable meaning unit with:
- a stable `conceptId`;
- a concise semantic definition;
- accepted direct wording variants and controlled paraphrase patterns;
- the evidence references relevant to the concept;
- required relationships to other concepts, where applicable;
- constraints describing what the concept does and does not mean;
- relevant polarity, modality, attribution, and time conditions.

Concepts should be composable. A conclusion is represented as a set of propositions and relationships, not as one memorized model sentence.

### 22.2 Two complementary matching paths

**Direct Match** recognizes an authored wording variant or a well-defined paraphrase pattern.

**Compositional Match** recognizes known concepts and combines them through supported relationships, even when the complete sentence has never been authored verbatim.

Both paths must satisfy the same case constraints. Direct Match is not permission to ignore negation, attribution, uncertainty, evidence limits, or relationships. Compositional Match must not invent a relationship merely because the relevant keywords are present.

If the evaluator cannot establish a sufficiently clear interpretation through either path, it must use the safe clarification path rather than guess.

### 22.3 Proposition and relationship representation

For interpretation, a meaningful claim is conceptually represented by:
- subject / entity;
- predicate or relation;
- object / target, when applicable;
- polarity (affirmed or negated);
- modality / certainty (asserted, possible, probable, uncertain, unknown);
- attribution / source (who observed, reported, inferred, or believes it);
- time or sequence, when relevant;
- evidence references and scope;
- epistemic status.

The exact machine-readable field names and grammar remain implementation details to be specified during technical design. The semantic distinctions themselves are approved.

### 22.4 Preserve epistemic distinctions

The evaluator must distinguish:
- **Established fact:** explicitly established by the authored case record.
- **Reported observation:** what a named source says they observed; attribution must remain attached.
- **Inference:** a conclusion supported by one or more facts but not directly stated as an observation.
- **Hypothesis:** a possible explanation that remains unconfirmed.
- **Unknown / Not established:** a matter the available evidence does not resolve.
- **Opinion / impression:** a source's personal belief or feeling, not a verified finding.

These labels describe the status of a claim, not the learner's intelligence or the truthfulness of a witness. A reported statement may be relevant evidence without proving every interpretation attached to it.

### 22.5 Negation, uncertainty, modality, and attribution

These are meaning-bearing features and must never be discarded during normalization.

Examples of distinctions the evaluator must preserve:
- "Sara saw the resident take it" versus "Sara did not see the resident take it".
- "Lena may have moved the envelope" versus "Lena moved the envelope".
- "The card was used" versus "Lena used the card".
- "The reading was unusual" versus "an external event caused the reading".
- "The report suggests an external event" versus "an external event was confirmed".

A sentence containing a negated or uncertain phrase must not match an affirmative or certain concept simply because it contains the same nouns and verbs. Attribution must not be transferred from a source to the learner's own assertion or from an access credential to the person associated with it.

### 22.6 Evidence relations and limits

The evaluator may recognize authored relations such as:
- supports;
- contradicts;
- is consistent with;
- weakens;
- contextualizes;
- does not establish;
- leaves unresolved.

Evidence relations are case-authored and scoped. Support for one proposition must not automatically transfer to a stronger proposition. For example, evidence that a room access card was used does not, by itself, establish who physically used it or what was carried into the room. A recorded anomaly does not, by itself, establish its cause.

The evaluator must not use invalid transitivity: if evidence supports A and A is associated with B, it does not follow that the evidence proves B unless the case explicitly defines that relationship.

### 22.7 Mixed, unsupported, and contradictory claims

An answer may contain more than one claim. The evaluator must assess each material claim and its relationship to the requested conclusion.

- A supported central conclusion with a minor unsupported extra detail may receive partial credit for the affected criterion; it must not be silently treated as wholly correct.
- A plausible hypothesis stated explicitly as a possibility may be acceptable when the case permits it.
- The same hypothesis stated as a confirmed fact is overclaiming and must be flagged.
- A material contradiction within the learner's final answer must not be resolved by arbitrarily selecting the more favorable sentence.
- If the contradiction makes the intended conclusion unclear, request clarification.
- If the learner's position is clear but conflicts with established case facts, classify the relevant claim as contradicted / unsupported and explain why.
- A correct conclusion does not erase a materially false explanation; conclusion and reasoning remain separately assessed.

The evaluator must not infer dishonesty, motive, or intent from a contradiction.

### 22.8 Outcome resolution

The five conceptual outcomes are retained:
- `ACCEPTED`: the response is interpretable and meets the relevant case criteria.
- `PARTIAL`: meaningful understanding is present, but one or more required elements are missing or materially weakened.
- `NEEDS_CLARIFICATION`: the intended meaning or reference is materially ambiguous, so a fair assessment cannot yet be made.
- `UNSUPPORTED`: the response makes a material claim that the available case evidence does not support.
- `CONTRADICTION`: a material claim conflicts with established case facts or the response contains an unresolved material conflict.

These are assessment outcomes, not necessarily mutually exclusive internal diagnostic flags. A response can carry claim-level flags while the resolver selects one primary outcome. When clarification is needed, do not assign a final grade for the unresolved response. Clarification attempts remain penalty-free and are retained in session history.

### 22.9 Fairness and deterministic behavior

- The same case version, evaluator version, configuration, and normalized response must produce the same interpretation and assessment result.
- Grammar and spelling tolerance must not remove meaning-bearing distinctions.
- Concision is not a defect; verbosity is not evidence.
- Unknown but potentially valid wording is not automatically wrong.
- Keyword-only matches are insufficient.
- Accepted alternatives must be authored or composed from recognized concepts and valid relations.
- A rule must not award a claim that violates an explicit case constraint.
- The evaluator must expose a safe fallback when its supported language coverage is insufficient; it must not pretend to understand unrestricted natural language.

### 22.10 Required semantic regression scenarios

Each reference case must include positive and negative pairs that differ in one critical semantic feature, including:
- affirmative versus negated claim;
- possible versus certain claim;
- reported statement versus established fact;
- credential / access event versus identified human actor;
- observation versus causal explanation;
- supported relation versus keyword-only co-occurrence;
- valid concise paraphrase versus incomplete claim;
- supported central conclusion plus unsupported add-on;
- self-contradictory response;
- plausible alternative versus unsupported certainty.

The test fixtures must record expected claim interpretation, evidence relation, primary outcome, affected assessment criteria, and rationale. These are planned automated-test fixtures; no such tests are claimed to have run.

**Checkpoint:** Semantic evaluation principles are approved as a design baseline. Exact lexical resources, grammar patterns, serialized data types, scoring integration, and executable test fixtures remain to be specified. No code implementation or automated verification has occurred.


---

## 23. Phase 6 — Evaluator module contracts

**Status:** Approved conceptual contracts; exact code interfaces remain implementation work.

The six approved modules form one deterministic pipeline. Each module receives explicit input and returns structured output; modules must not silently change the case facts or invent missing meaning.

1. **TextNormalizer**
   - Input: raw learner response and language/locale context.
   - Output: normalized text representation, clause boundaries, and preserved semantic markers.
   - It may normalize harmless casing, whitespace, punctuation, and explicitly supported spelling variants.
   - It must preserve negation, modality, uncertainty, attribution, tense/time, pronouns, comparisons, and clause relationships.
   - It must not perform aggressive stemming or delete words merely because they appear grammatically small.

2. **SemanticMatcher**
   - Input: normalized clauses and the versioned case concept catalogue.
   - Output: candidate concepts/propositions, Direct or Compositional match path, recognized operators, and an interpretation status.
   - It must distinguish a recognized interpretation from an ambiguous or unrecognized one.
   - It must not use keyword co-occurrence as a sufficient match or select a favorable interpretation when materially different parses remain possible.

3. **EvidenceReasoner**
   - Input: interpreted propositions and authored evidence relationship graph.
   - Output: evidence support, contradiction, consistency, limitation, and unresolved-relation assessments for each material claim.
   - It must check the scope and strength of each relation and prohibit unsupported transitive inference.

4. **ClaimValidator**
   - Input: interpreted propositions, evidence assessments, and case constraints.
   - Output: claim-level diagnostics, including supported, incomplete, overclaimed, unsupported, or contradicted claims, with a rationale and affected criteria.
   - It must distinguish a hypothesis expressed as possible from the same hypothesis asserted as fact.

5. **EvaluationResolver**
   - Input: module outputs, required concepts, rubric criteria, and response context.
   - Output: primary outcome, criterion-level performance, dimension scores, clarification requirement, and diagnostic flags.
   - It must not issue a final grade while a material clarification is pending.
   - It must not let one correct phrase erase a material contradiction elsewhere in the answer.

6. **FeedbackBuilder**
   - Input: resolved outcome, criterion results, and authored feedback resources.
   - Output: concise educational feedback explaining what was understood, what needs attention, and which evidence boundary matters.
   - It must use authored, traceable feedback patterns and must not fabricate evidence, case facts, or explanations.
   - Feedback should be constructive and English-first, with optional Arabic support following the existing replacement-in-place rule.

### 23.1 Pipeline invariants

- Each module is independently testable.
- Inputs include explicit case and evaluator versions.
- No module mutates Case Data or historical Session Data.
- The same versioned inputs produce the same outputs.
- A failure or unsupported parse is surfaced as such; it is not converted into a guessed answer.
- Diagnostic detail may be richer internally than the learner-facing feedback.
- Module outputs retain enough traceability to explain why a criterion was or was not awarded.

---

## 24. Phase 6 — Scoring, clarification, and independence rules

**Status:** Approved conceptual policy; numeric calibration remains provisional.

### 24.1 Criterion-to-dimension aggregation

- Each case defines weighted criteria within the three approved dimensions.
- Each criterion uses the provisional performance levels: Excellent (100%), Strong (75%), Developing (50%), Limited (25%), and No Credit (0%).
- Criterion results are aggregated within their dimension using the authored criterion weights.
- Dimension results are then combined using the provisional top-level weights: Conclusion Accuracy 35%, Evidence Reasoning 40%, and Critical Thinking 25%.
- The weighted result is a numeric score from 0 to 100; letter-grade bands remain S 96–100, A+ 90–95, A 80–89, B 70–79, C 60–69, D 40–59, and F 0–39, subject to the grade gates below.

### 24.2 Scoring safeguards and grade gates

- A pending material clarification has no final score or letter grade.
- A clear but incomplete answer may receive partial credit; do not round it up to full understanding.
- A materially unsupported or contradicted claim affects the criterion(s) it actually damages. Do not impose an arbitrary whole-answer penalty when the unsupported detail is peripheral.
- A materially false central conclusion or explanation must prevent full credit for the affected criterion, even if other parts are correct.
- The S grade requires a weighted score of at least 96, at least 90 in each of the three dimensions, and no unresolved material contradiction or material unsupported assertion in the final answer.
- If the numeric score reaches 96 but the S gate is not met, award no higher than A+.
- Guided mode caps the awarded letter grade at A+; it does not change the numeric score or dimension scores.
- Steady and Challenge may award S when all S requirements are met.
- Hell Mode never adds points or changes thresholds.
- The grade scale evaluates demonstrated investigation reasoning, not whether the case's real-world mystery has a fully known answer. F means insufficient demonstrated performance, not that the case itself is unresolved.

The exact criterion weights inside each case and any further calibration adjustments remain case-authoring and calibration work. These rules do not claim that the provisional weights or bands have been validated against production learner data.

### 24.3 Clarification policy

- Clarification is required when an ambiguous reference, scope, polarity, attribution, or certainty level materially changes the interpretation.
- The evaluator should identify the smallest ambiguity that needs resolving and ask one focused clarification question.
- Clarification may be repeated when the response remains materially ambiguous; there is no academic penalty or fixed attempt limit.
- Clarification turns are retained in the attempt history but are not treated as wrong answers.
- A learner may leave the case and resume later; unresolved clarification must not be silently converted to a final grade.
- If the learner chooses to submit without resolving the ambiguity, the system records the response as incomplete / not assessable for the affected criterion rather than guessing.

### 24.4 Independence policy

Independence remains separate from academic scores:
- **High:** no optional hints were used.
- **Moderate:** Direction and/or Connection hints were used, but no Reasoning hint.
- **Assisted:** a Reasoning hint was used.

The normal scaffolding built into Guided mode is not itself an optional hint and does not reduce Independence. Clarification requests, retries, and ordinary explanatory feedback do not change Independence. Hint use never subtracts academic points, and no-hint use does not add bonus points.

### 24.5 Calibration and test status

The 35/40/25 weights, criterion performance levels, grade bands, and S gate are a coherent proposed baseline for the next calibration review. They remain provisional until the 57-entry scenario inventory is converted into executable fixtures and reviewed against actual evaluator outputs. Manual design review must not be described as automated testing.


---

## 25. Phase 6 — Reference fixture contract and approval gate

**Status:** Test design contract approved; fixtures are planned, not yet implemented or executed.

### 25.1 Fixture structure

Each future semantic or scoring fixture must carry:
- stable `scenarioId`;
- case ID, exact case version, and evaluator version;
- CEFR, Training Mode, and Answer Format where relevant;
- learner response and any preceding answer / clarification context;
- expected interpreted claims and semantic operators;
- expected concept matches and match path (Direct / Compositional);
- expected evidence relationships and claim-level diagnostics;
- expected primary outcome;
- expected criterion and dimension assessment, where assessable;
- expected letter grade and Independence, where applicable;
- whether clarification is required;
- a rationale and the invariant being protected.

A fixture must distinguish expected behavior from actual execution results. The status remains Not Run until an automated test has genuinely executed.

### 25.2 The 57-scenario regression inventory

The existing manual review inventory becomes the minimum initial regression suite:
- 18 core case × Training Mode × Answer Format combinations;
- 9 hint behavior scenarios;
- 8 retry and latest-clear-response scenarios;
- 10 ambiguity and semantic-outcome scenarios;
- 6 mode differentiation and experience scenarios;
- 6 fairness and scoring-invariant scenarios.

The count is 57 planned scenario entries, not 57 implemented tests. Semantic positive/negative pairs from Section 22.10 must be added to the relevant cases; if they expand the suite beyond 57, retain the additional coverage rather than forcing the count to remain fixed.

### 25.3 Case-specific semantic anchors

The first fixtures must protect these distinctions:

**CASE-001 — The Missing Package**
- Supported: an unidentified resident wearing a green jacket picked up the package.
- Must remain unknown: the resident's identity and motive.
- Reject or flag: attributing the pickup to Sara or Adam; treating witness presence as proof of pickup; asserting a motive.

**CASE-002 — Conflicting Accounts**
- Supported: the envelope was later found in Room B; Lena reported moving papers; Lena's card was used to access the room.
- Plausible but unproven: Lena moved the envelope.
- Must remain unknown: who physically used the card and exactly what was moved.
- Reject or flag: treating card use as proof Lena personally entered; treating Omar's unidentified papers as confirmed sighting of the envelope; asserting theft as established.

**CASE-003 — The Uncertain Evidence**
- Supported: R-4 recorded an unusual increase in signal strength during the stated interval; the record is incomplete.
- Plausible hypotheses: an external source or a temporary receiver fault.
- Must remain unresolved: the actual cause and source.
- Reject or flag: claiming the external event is confirmed; using R-7 as a direct control; treating a personal impression or preliminary report as independent confirmation.

### 25.4 Phase 6 design acceptance checklist

The conceptual design is ready to move to implementation planning only when the following are all represented in the reviewed specification:
1. Versioned Case Data is separate from Session Data.
2. Evidence IDs, roles, relationships, limitations, and references are defined.
3. Required concepts, accepted alternatives, and constraints are case-authored.
4. Direct and Compositional matching preserve semantic operators and relationships.
5. Facts, attributed observations, inferences, hypotheses, unknowns, and opinions remain distinct.
6. Evidence scope and invalid transitive inference are handled.
7. Mixed claims, overclaiming, and contradictions have explicit outcomes.
8. All five primary outcomes have defined behavior.
9. The six module responsibilities and invariants are defined.
10. Criterion/dimension aggregation, provisional grade bands, and S / Guided gates are documented.
11. Clarification and Independence behavior are documented.
12. The 57-scenario inventory and case-specific semantic anchors are traceable to planned fixtures.
13. Limitations of deterministic local evaluation are explicit.
14. Persistence & Recovery remains a separate later phase.
15. No code or automated test is represented as completed before it exists and is verified.

**Phase 6 checkpoint:** The conceptual assessment-engine design is documented across Sections 20–25. This is not an implementation approval. The next work is to translate the design into exact machine-readable contracts and executable fixtures, review those artifacts, and then request explicit approval for the implementation scope. No code changes or automated test runs are claimed by this checkpoint.


---

## 26. Assessment Engine Contract

**Status:** Contract drafted and conceptually exercised against all three reference cases; pending user review and implementation approval.

The detailed module and data-flow contract is maintained in [ASSESSMENT-ENGINE-CONTRACT.md](./ASSESSMENT-ENGINE-CONTRACT.md).

The contract specifies:
- versioned evaluation context and canonical semantic data types;
- explicit input/output responsibilities for all six modules;
- shared module envelopes, statuses, diagnostics, and failure propagation;
- orchestrator sequencing and data ownership;
- Standard / Hell Mode convergence;
- criterion and dimension resolution, grade gates, clarification, and Independence;
- representative end-to-end traces for CASE-001, CASE-002, and CASE-003;
- cross-case semantic regression requirements and implementation-readiness checklist.

The design walkthroughs are manual reasoning exercises, not executed tests. They show how the proposed contracts should handle supported conclusions, keyword traps, actor attribution, overclaiming, uncertainty, and mixed claims.

**Boundary:** The contract is ready for review, not implementation-approved. Runtime schemas, executable fixtures, module tests, full-pipeline tests, scoring calibration, and project test-suite execution remain outstanding. No application source code was changed and no automated test was run.
