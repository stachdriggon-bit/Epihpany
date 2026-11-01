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
