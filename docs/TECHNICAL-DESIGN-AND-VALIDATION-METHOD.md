# EPIPHANY — Technical Design, Reasoning & Validation Method

**Document ID:** TDRV-1  
**Status:** Initial methodology baseline — reusable and evolving  
**Purpose:** Preserve a repeatable engineering method for designing, evaluating, testing, and improving EPIPHANY activities and future games.

---

## 1. Why this record exists

This document records not only what is being built, but how design decisions are reached and verified. It is intended to become a reusable reference for future game and activity development.

The method prioritizes correctness, learning value, logical fairness, traceability, and evidence-based decisions over speed or premature implementation.

This is a living methodology. It may evolve as later projects reveal better practices.

## 2. Core working principles

1. **Understand before changing:** inspect the existing system and clarify the actual problem before proposing a solution.
2. **Separate product intent from implementation:** establish what the user and learner should experience before choosing code structures.
3. **Make constraints explicit:** identify invariants, dependencies, exclusions, and failure conditions.
4. **Distinguish facts from assumptions:** label confirmed information, hypotheses, proposals, and approved decisions separately.
5. **Prefer testable statements:** convert vague goals into observable acceptance criteria.
6. **Design for edge cases:** test ambiguity, invalid input, partial completion, failure, retries, and alternative valid behavior.
7. **Simulate before coding:** use representative scenarios to expose weaknesses in rules and scoring before implementation.
8. **Calibrate from evidence:** revise weights, thresholds, and rules after observing scenario outcomes rather than defending initial guesses.
9. **Preserve traceability:** connect each requirement to design rules, test cases, expected outcomes, and implementation checks.
10. **Do not overclaim:** distinguish a conceptual review, manual simulation, automated test, and verified production behavior.
11. **Keep user-owned decisions explicit:** especially story canon, learning intent, reward policy, and significant product behavior.
12. **Use approval gates:** do not treat a draft or successful local test as authorization for unrelated implementation.

## 3. The reusable engineering workflow

### Step 1 — Problem framing and scope

Record:
- the user problem or learning need;
- intended audience and context;
- desired outcome;
- current behavior or baseline;
- in-scope and out-of-scope areas;
- known constraints and dependencies;
- risks if the design is wrong.

Output: a concise problem statement and scope boundary.

### Step 2 — Requirements and invariants

Convert the problem into:
- functional requirements: what the system must do;
- quality requirements: accuracy, accessibility, performance, clarity, reliability;
- invariants: what must remain true across all configurations;
- exclusions: what the system must not do;
- observable acceptance criteria.

Avoid requirements such as "make it better" unless accompanied by measurable or reviewable behavior.

Output: a requirement list with stable IDs.

### Step 3 — Conceptual model and architecture

Define the important entities, states, relationships, and boundaries before choosing implementation details.

Examples:
- reusable authored content versus an individual user session;
- evidence versus interpretation;
- academic grade versus learner independence;
- configuration dimensions that must remain independent;
- immutable historical attempts versus the current attempt.

Output: conceptual data model, state model, and dependency map.

### Step 4 — Representative reference scenarios

Create a small but deliberately varied set of examples:
- normal successful path;
- alternative valid path;
- partial success;
- invalid or unsupported result;
- ambiguous input;
- contradictory input;
- boundary condition;
- failure and recovery case.

Give each scenario a stable ID and record:
- input and context;
- expected behavior;
- rationale;
- relevant requirements;
- severity if the behavior fails.

Output: a reference scenario suite that can later become automated tests.

### Step 5 — Rubrics and decision rules

Where quality or correctness is evaluated, define:
- dimensions being assessed;
- criterion-level definitions;
- weights and point allocation, if applicable;
- accepted alternatives;
- partial-credit rules;
- disqualifying or unsupported claims;
- ambiguity handling;
- grade gates and exceptions.

Do not use one model answer as the sole definition of correctness. Represent the concepts, evidence relationships, constraints, and valid alternatives that make an answer acceptable.

Output: a versioned rubric and explicit decision rules.

### Step 6 — Manual simulation

Run the reference scenarios against the proposed rules before coding.

For each scenario record:
- expected classification or score;
- score by dimension;
- rationale for each awarded or withheld point;
- whether the result matches the intended product behavior;
- newly discovered ambiguity or defect.

Look for:
- correct answer by guessing;
- sound reasoning with an alternative conclusion;
- correct conclusion with weak reasoning;
- partial understanding;
- unsupported certainty;
- excessive skepticism;
- ambiguity;
- contradictions;
- unintended incentives.

Output: a simulation report and a list of design defects.

### Step 7 — Calibration

Adjust rules only after examining simulation outcomes.

Check:
- whether weights reflect the actual learning objective;
- whether thresholds create unfair cliffs;
- whether partial credit is meaningful;
- whether a strong alternative is unfairly capped;
- whether superficial strategies can game the score;
- whether different difficulty levels are judged at appropriate depth;
- whether the same quality means the same thing across configurations.

Output: revised, versioned criteria and documented reasons for each change.

### Step 8 — Configuration and interaction matrix

When a system has independent modes or settings, test their combinations explicitly.

For each setting define:
- what it changes;
- what it must not change;
- whether it affects content, assistance, presentation, scoring, or persistence;
- how it combines with other settings;
- edge cases and unsupported combinations.

Use a matrix to avoid testing only the default configuration.

Output: configuration matrix, invariants, and combination tests.

### Step 9 — Approval gate

Before implementation, verify:
- requirements are unambiguous enough to build;
- representative cases pass the design review;
- known edge cases have defined behavior;
- trade-offs and limitations are documented;
- data and state boundaries are understood;
- unresolved decisions are explicitly listed;
- the implementation scope has user approval where required.

Output: a clear approved scope, or a list of blockers.

### Step 10 — Implementation and automated verification

Only after the design gate:
- implement the smallest coherent slice;
- add automated tests from the reference scenarios;
- test regression-sensitive behavior;
- test failure paths and data integrity;
- run the relevant test suite;
- inspect actual results rather than assuming success.

For EPIPHANY repository changes, follow the project workflow and run `npm run stamp` followed by `npm test` when relevant.

Output: code changes, test evidence, and a truthful implementation report.

### Step 11 — Integration, persistence, and recovery

For stateful features, separately verify:
- save and restore;
- multiple concurrent unfinished sessions;
- account/device synchronization;
- conflict handling;
- offline behavior;
- recovery after partial failure;
- immutable history and version compatibility;
- no accidental overwrite or silent data loss.

Output: persistence and recovery verification.

### Step 12 — Release readiness and learning loop

Review:
- functional correctness;
- user experience and accessibility;
- performance and reliability;
- content quality;
- analytics or feedback needs, with privacy constraints;
- known limitations;
- rollback or recovery strategy.

After release, use observed behavior to refine the design without silently rewriting historical records or approved content.

Output: release decision and follow-up backlog.

## 4. Test design standard

A useful test case should include:

| Field | Purpose |
|---|---|
| test_id | Stable identifier |
| requirement_ids | Requirements covered |
| scenario | Input and relevant context |
| expected_behavior | Exact expected system response |
| rationale | Why that response is correct |
| severity | Impact if it fails |
| test_level | Manual, unit, integration, or end-to-end |
| actual_result | Filled only after execution |
| status | Not run, pass, fail, blocked |
| notes | Evidence, limitations, or follow-up |

Never label a manual thought experiment as an automated test. Never mark a test passed without an observed execution result.

## 5. Scoring and evaluation design safeguards

For any activity that evaluates learner or user responses:

- separate outcome correctness from process/reasoning quality;
- define accepted semantic alternatives;
- distinguish fact, inference, hypothesis, and unknown;
- define partial credit;
- handle ambiguity before forcing a binary result;
- avoid keyword-only evaluation;
- prevent answer length or vocabulary complexity from becoming hidden proxies;
- keep assistance/independence separate from academic correctness unless the learning objective explicitly says otherwise;
- test adversarial and gaming strategies;
- explain results in a way that teaches rather than merely labels.

## 6. Configuration matrix standard

For every independent configuration dimension, document:
- allowed values;
- user-facing purpose;
- behavior changed;
- behavior invariant;
- interactions with other dimensions;
- persistence requirements;
- test coverage.

A configuration should not silently alter a different dimension. For example, a training mode must not silently change a learner's selected language level.

## 7. Decision and evidence labels

Use consistent labels in design records:

- **Approved:** explicitly agreed and may be treated as the current baseline.
- **Proposed:** a recommendation awaiting review.
- **Open:** unresolved; do not invent a decision.
- **Experimental:** used for exploration or simulation, not production-approved.
- **Implemented:** code exists, but this alone does not prove correctness.
- **Verified:** behavior was actually checked with recorded evidence.
- **Deprecated:** replaced by a newer decision; preserve the history and reason.

For results, distinguish:
- conceptual reasoning;
- manual simulation;
- automated unit test;
- integration test;
- end-to-end test;
- production observation.

## 8. Traceability and change control

Maintain links between:
- product goals;
- requirements;
- design decisions;
- data fields and state transitions;
- reference scenarios;
- automated tests;
- implementation changes;
- verification evidence.

When a rule changes:
1. record the previous rule;
2. state why it changed;
3. identify affected cases and tests;
4. update expected results;
5. rerun affected tests after implementation;
6. preserve historical assessment records and version context.

Do not rewrite historical results as though the new rubric had always applied.

## 9. Applying the method to The Language Detective

The current application of this method has followed this sequence:

1. Define product identity, learning objectives, CEFR, Training Modes, and answer formats.
2. Separate reusable Case Data from per-attempt Session Data.
3. Define evidence, question, hint, final-conclusion, review, reward, and lifecycle concepts.
4. Draft three reference cases spanning A2, B1–B2, and C1–C2.
5. Draft criterion-level scoring rubrics using Conclusion Accuracy, Evidence Reasoning, and Critical Thinking.
6. Conduct a manual 24-answer simulation exercise.
7. Identify issues involving guessing, ambiguity, core findings, overconfidence, and alternative conclusions.
8. Propose consistent 35/40/25 top-level weights while adapting criterion depth to CEFR.
9. Begin the Training Mode and Answer Format matrix for Guided, Steady, Challenge, Standard, and Hell Mode.

Current limitations:
- no assessment engine has been implemented;
- no automated scoring tests have been run;
- weights, grade bands, grade gates, and some edge-case rules remain provisional;
- the three cases are experimental design fixtures, not approved published content;
- Persistence & Recovery remains a later design and verification phase.

## 10. Reuse in future EPIPHANY games

For each future game or activity, reuse the workflow but adapt the evaluation model to its real purpose.

Examples:
- word and vocabulary games: semantic accuracy, usage context, accepted variants, distractor quality;
- logic and investigation games: evidence sufficiency, inference validity, uncertainty, alternative explanations;
- story choices: narrative consistency, consequence clarity, continuity, player agency;
- puzzle games: solution validity, fairness, hint quality, exploit resistance;
- progression systems: meaningful mastery, replay fairness, reward integrity, no unintended farming.

Do not force every game into the same scoring dimensions. Reuse the design and validation process, not an unsuitable universal rubric.

---

**Initial checkpoint:** This methodology is recorded as a reusable proposed standard. Its application to The Language Detective is in progress. It is not a claim that implementation or automated verification has occurred.


---

## 11. Case study — Phase 5 mode and response-format validation

This case study extends the Language Detective example in Section 9 and demonstrates how the method validates independent configuration dimensions.

### 11.1 Configuration cross-product

Three experimental cases were crossed with:
- Training Mode: Guided, Steady, Challenge;
- Answer Format: Standard, Hell Mode.

This yields 3 × 3 × 2 = 18 core scenarios. Each scenario checks semantic equivalence, not merely identical UI input: a Standard multiple-choice answer and a Hell Mode written answer should receive equivalent academic assessment when they communicate the same conclusion and reasoning.

### 11.2 Separate experience from correctness

The review established two distinct classes of behavior:

**Configurable experience**
- amount and timing of scaffolding;
- proactive hint suggestions;
- hint wording and level of detail;
- feedback depth;
- independence descriptor.

**Invariant evaluation**
- case facts and Essential evidence;
- accepted conclusions and reasonable alternatives;
- academic dimensions and weights;
- semantic correctness rules;
- partial-credit standards;
- no penalty for hint use;
- no hidden grammar, vocabulary, or verbosity bonus.

This separation is reusable in any system where difficulty or assistance settings should change the experience without changing the definition of correctness.

### 11.3 Hint validation

A three-level hint ladder was reviewed:
1. Direction — directs attention.
2. Connection — helps connect evidence.
3. Reasoning — clarifies the reasoning task without giving the answer.

A hint is defective if it leaks the answer, directs the learner toward an unsupported theory, or introduces an undisclosed evidence dependency. Such a defect belongs to content quality, not learner scoring.

### 11.4 Retry and learning-history validation

The simulation distinguished:
- repeated answers within one question;
- the learner's latest clear demonstrated understanding;
- final case conclusion;
- a replay as a separate case attempt.

Earlier responses should remain available for history and learning review. An earlier mistake should not automatically reduce the final academic result after the learner corrects their understanding. The current proposed policy is to assess the latest clear response after feedback while retaining the full attempt history.

### 11.5 Ambiguity as a first-class outcome

A robust evaluator should not force every free-text response into correct or incorrect. The design uses conceptual outcomes such as:
- accepted;
- partial;
- needs clarification;
- unsupported;
- contradiction.

This prevents false certainty in a deterministic local evaluator. Unknown wording should not be silently accepted, but it should not automatically be treated as proof of misunderstanding either.

### 11.6 Independence is not academic achievement

The review separated the quality of the learner's reasoning from how much assistance they used. A learner may produce excellent reasoning after using hints. That learner can receive the same academic points as someone who reached the same reasoning unaided, while their Independence descriptors differ.

### 11.7 Reusable lesson

When validating modes, difficulty settings, and response formats:
- test the full configuration cross-product;
- compare semantically equivalent outcomes;
- explicitly list invariant behavior;
- test hint leakage and missing-information traps;
- retain retries as history rather than automatic penalties;
- provide a safe ambiguity path;
- distinguish assistance/independence from correctness;
- label all simulations as manual until code is actually executed.

This case study is a manual design record, not evidence of implementation or automated verification.


---

## 12. Case study — Phase 6 Case Data Schema

The Language Detective design approved a versioned, structured Case Data model while keeping reusable authored case content separate from individual Session Data.

### 12.1 Conceptual case sections

A case is conceptually composed of metadata, introduction, evidence, investigation questions, final conclusion, and evaluation rules. A `schemaVersion` supports controlled future evolution.

### 12.2 Evidence is more than display text

Evidence records use stable identifiers and distinguish learner-facing content from internal interpretation guidance. Internal guidance records what an item supports, what it does not prove, and its limitations. This is especially important when a source appears authoritative but does not establish identity, causality, or certainty.

### 12.3 Evaluate meaning, not sentence matching

The reference answer is represented through required concepts, accepted semantic variants, evidence relationships, and unsupported claims. A single canonical sentence is not a sufficient definition of correctness.

### 12.4 Validate references and fairness

Schema validation must detect duplicate IDs, dangling references, missing criteria, contradictions between evidence and the reference conclusion, and accidental dependencies on optional evidence. Publication readiness requires complete evaluation data, not merely a valid display payload.

### 12.5 Local evaluation trade-off

The approved V1 direction is a local structured rule-based evaluator. Separating evaluation metadata from learner-facing content improves maintainability but does not make the rules confidential when delivered to the browser. A hybrid server-side evaluator remains a possible future alternative, not part of the approved V1 scope.

This is a design approval record only. Exact field types, constraints, executable validation, evaluator implementation, and runtime verification remain future work.

 

---

## 13. Case study — Modular deterministic assessment engine

The Language Detective assessment engine is approved conceptually as a deterministic, local, structured rule-based pipeline with independently testable modules:

1. `TextNormalizer`
2. `SemanticMatcher`
3. `EvidenceReasoner`
4. `ClaimValidator`
5. `EvaluationResolver`
6. `FeedbackBuilder`

The pipeline evaluates meaning and evidence relationships rather than exact sentence similarity. Case-specific rules are authored as data so that new cases do not require a new evaluator implementation.

Unknown wording must not be marked incorrect automatically. If the evaluator cannot confidently interpret an answer, it should request clarification or rephrasing rather than guess, silently accept, or penalize the learner for the evaluator's own limitation.

Normalization must preserve meaning-bearing distinctions, including negation, uncertainty, modality, and attribution. Standard and Hell Mode use different response-input paths but retain identical academic correctness standards; free-text entry does not earn a bonus by itself.

This is a conceptual design approval only. Module contracts, rule formats, conflict resolution, scoring integration, automated tests, and implementation remain open.

 
---

## 14. Case study — Semantic evaluation and evidence-aware interpretation

The Language Detective semantic model uses small composable concepts rather than one canonical answer sentence. Each case-authored concept has a stable identity, accepted direct variants, relevant evidence references, required relationships, and constraints.

### 14.1 Matching strategy

The evaluator uses two complementary conceptual paths:
- **Direct Match:** recognizes a known wording variant or controlled paraphrase.
- **Compositional Match:** combines recognized concepts through explicitly supported semantic relationships.

Both paths are constrained by the same case-authored rules. Neither may accept a response solely because it contains the expected keywords. Compositional interpretation must not invent relationships; direct wording must not bypass semantic constraints.

### 14.2 Claim representation

A claim is interpreted with its subject, predicate / relation, object, polarity, modality, attribution, relevant time, evidence scope, and epistemic status. These are semantic requirements; exact serialized fields and parser grammar remain open technical details.

The evaluator distinguishes established facts, attributed observations or reports, inferences, hypotheses, unknowns, and opinions / impressions. These distinctions prevent a witness's belief from becoming a verified fact and prevent a plausible explanation from being reported as a proven cause.

### 14.3 Meaning-bearing operators

Negation, uncertainty, modality, attribution, and time are preserved throughout normalization and matching. For example, "may have moved" must not match "moved"; "the card was used" must not match "Lena used the card"; and "an unusual reading occurred" must not match "an external event caused it".

### 14.4 Evidence-aware reasoning

Evidence relationships are explicitly authored and scoped: supports, contradicts, is consistent with, weakens, contextualizes, does not establish, and leaves unresolved. Support for a weaker proposition does not automatically prove a stronger proposition. Invalid transitive inference is prohibited unless the case explicitly defines the relationship.

### 14.5 Mixed claims and conflict handling

Responses are assessed claim by claim. A supported central conclusion with a material unsupported addition may receive partial credit in the affected criterion. A plausible hypothesis expressed as uncertain is distinguished from the same hypothesis asserted as fact. Material unresolved contradictions trigger clarification or a contradiction outcome; the evaluator must not choose whichever sentence gives the higher score. Conclusion accuracy and reasoning quality remain separately assessed.

### 14.6 Primary outcomes

The conceptual primary outcomes are:
- `ACCEPTED`
- `PARTIAL`
- `NEEDS_CLARIFICATION`
- `UNSUPPORTED`
- `CONTRADICTION`

Claim-level diagnostic flags may coexist with a primary outcome. A response awaiting clarification must not receive a final grade. Clarification is penalty-free and retained in the attempt history.

### 14.7 Determinism and regression coverage

The same case version, evaluator version, configuration, and response must produce the same result. Unknown wording must not be automatically rejected, but neither may it be silently accepted. Every reference case needs paired tests for negation, certainty, attribution, actor identity, causality, keyword-only matches, concise paraphrases, mixed claims, and contradictions.

This is a conceptual design record. Lexical resources, grammar patterns, exact serialized types, scoring integration, executable fixtures, and runtime verification remain open. No implementation or automated test execution is claimed.


---

## 15. Case study — Assessment pipeline contracts and score resolution

### 15.1 Module contracts

The six approved modules have explicit responsibilities:

| Module | Responsibility | Must not |
|---|---|---|
| TextNormalizer | Harmless text normalization while preserving semantic operators | Remove negation, modality, attribution, tense, or clause relations |
| SemanticMatcher | Direct and compositional interpretation against case concepts | Treat keywords as proof or guess between materially different parses |
| EvidenceReasoner | Evaluate authored evidence relations and their scope | Transfer support to a stronger claim or infer invalid transitive links |
| ClaimValidator | Identify unsupported, incomplete, overclaimed, and contradicted claims | Infer motive or dishonesty |
| EvaluationResolver | Resolve outcomes and criterion/dimension assessment | Issue a final grade while material clarification is pending |
| FeedbackBuilder | Produce traceable, educational feedback from authored resources | Invent facts, evidence, or rationale |

Every module is independently testable and receives explicit versioned inputs. Module outputs should preserve traceability from the learner's claim to the concept, evidence relation, rubric criterion, and feedback. Case Data and historical Session Data remain immutable during evaluation.

### 15.2 Deterministic pipeline invariants

The same case version, evaluator version, configuration, and response must yield the same result. Unknown or ambiguous wording is surfaced rather than silently accepted or automatically rejected. A materially ambiguous interpretation is not resolved by choosing whichever parse produces the highest score.

### 15.3 Scoring aggregation

Criterion-level performance is provisionally represented as Excellent 100%, Strong 75%, Developing 50%, Limited 25%, or No Credit 0%. Case-authored criterion weights aggregate within each dimension. The dimensions then combine using the provisional 35% Conclusion Accuracy, 40% Evidence Reasoning, and 25% Critical Thinking weights.

The provisional grade bands remain S 96–100, A+ 90–95, A 80–89, B 70–79, C 60–69, D 40–59, and F 0–39.

### 15.4 Grade gates

S requires all of:
- weighted score of at least 96;
- at least 90 in each assessment dimension;
- no unresolved material contradiction;
- no material unsupported assertion in the final answer.

A numeric score of 96 or above that fails the S gate is capped at A+. Guided mode also caps the awarded grade at A+, without changing numeric or dimension scores. Steady and Challenge may award S. Hell Mode changes response format only and gives no bonus.

A material defect affects the criterion(s) it actually undermines; the evaluator should not apply arbitrary whole-answer penalties for peripheral errors. A pending material clarification has no final grade.

### 15.5 Clarification and Independence

Clarification asks one focused question about the smallest material ambiguity. It may repeat without a fixed limit or academic penalty. Clarification turns are retained in history, and unresolved answers cannot silently become graded answers. If the learner proceeds without resolving the ambiguity, the affected criterion is recorded as incomplete / not assessable rather than guessed.

Independence is separate:
- High: no optional hints;
- Moderate: Direction and/or Connection hints, but no Reasoning hint;
- Assisted: Reasoning hint used.

Built-in Guided scaffolding, clarification, retries, and ordinary feedback do not lower Independence. Hint use never reduces academic points, and using no hints gives no academic bonus.

### 15.6 Calibration status

These rules create a coherent baseline for calibration, not a claim of empirical validation. The 35/40/25 weights, criterion levels, grade bands, and S gate remain provisional until the scenario inventory is converted into executable fixtures and actual evaluator outputs are reviewed.


---

## 16. Case study — Reference fixtures and approval gate

### 16.1 Fixture contract

Each future test fixture records a stable scenario ID; case, case-version, and evaluator-version identifiers; relevant CEFR / Training Mode / Answer Format; response context; expected claims and semantic operators; expected concept matches and matching path; evidence relations; claim diagnostics; primary outcome; criterion and dimension results; grade and Independence where applicable; clarification requirement; and rationale.

Expected results and actual execution results are separate fields. A fixture remains Not Run until an automated test actually executes.

### 16.2 Initial regression inventory

The manual design inventory contains 57 planned entries:
- 18 case / mode / format combinations;
- 9 hint scenarios;
- 8 retry scenarios;
- 10 ambiguity scenarios;
- 6 mode differentiation scenarios;
- 6 fairness and scoring-invariant scenarios.

This is a planned suite, not an automated test result. Semantic positive/negative pairs must be added where needed even if the final suite exceeds 57.

### 16.3 Reference-case semantic anchors

- **CASE-001:** an unidentified resident wearing a green jacket picked up the package; identity and motive remain unknown. Do not infer Sara or Adam as the picker.
- **CASE-002:** the envelope was found in Room B; Lena reported moving papers and her card was used, but neither the physical card user nor the contents moved are established. Lena moving the envelope remains plausible, not proven.
- **CASE-003:** R-4 recorded an unusual incomplete reading; an external source and a receiver fault remain hypotheses. R-7 is not a direct control, and the personal note / preliminary report is not independent confirmation.

### 16.4 Design approval boundary

The conceptual assessment-engine design is documented across Sections 12–16. This does not authorize code implementation. Exact machine-readable module contracts and executable fixtures must be produced and reviewed before a separate explicit implementation approval. Persistence & Recovery remains a later phase. No implementation or automated test execution is claimed.
