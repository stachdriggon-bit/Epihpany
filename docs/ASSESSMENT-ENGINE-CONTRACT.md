# EPIPHANY — The Language Detective
# Assessment Engine Contract

**Document ID:** AEC-1  
**Status:** Design contract — proposed for implementation review  
**Scope:** Local deterministic assessment engine, V1  
**Related records:** [Content Development Roadmap 2](./CONTENT-DEVELOPMENT-ROADMAP-2.md), [Technical Design and Validation Method](./TECHNICAL-DESIGN-AND-VALIDATION-METHOD.md)  
**Implementation status:** Not started  
**Automated test status:** Not implemented / Not run

---

## 1. Purpose and boundary

This contract turns the approved assessment architecture into explicit module responsibilities, data contracts, pipeline transitions, failure behavior, and reference-case walkthroughs.

It is a design artifact, not executable code and not evidence that the evaluator can understand unrestricted natural language. V1 is a local, deterministic, case-authored rule engine. It recognizes a deliberately bounded set of language patterns and semantic constructions. When a response falls outside that supported coverage, the engine must expose uncertainty and request clarification or rephrasing rather than guess.

The contract covers final-answer assessment in Standard and Hell Mode. Intermediate multiple-choice questions use the same case truth and evidence model but have a simpler answer-resolution path. Training Mode changes scaffolding and feedback presentation, not the facts, accepted conclusions, or academic rubric.

### 1.1 Non-goals

V1 does not:
- provide general-purpose natural-language understanding;
- infer facts that are absent from Case Data;
- use an external AI service;
- treat keyword presence as proof of a semantic relationship;
- hide Essential evidence or change case truth by mode;
- expose internal reference answers as a security-protected secret;
- persist or mutate session history from inside an assessment module.

### 1.2 Governing invariants

1. The same case version, evaluator version, configuration, and response context produce the same result.
2. Every assessed claim must be traceable to a recognized concept, evidence relation, constraint, and rubric criterion, or be explicitly marked unrecognized.
3. Negation, modality, uncertainty, attribution, time, and clause relationships are meaning-bearing.
4. A stronger claim requires stronger evidence; support must not be transferred by invalid transitivity.
5. Unknown wording is not automatically wrong and is not silently accepted.
6. A material clarification request has no final grade.
7. Conclusion quality and reasoning quality remain separately assessable.
8. Training Mode, Answer Format, hints, and CEFR do not rewrite case facts or semantic standards.
9. Evaluation is pure: modules read versioned inputs and return outputs; they do not mutate Case Data or Session Data.
10. Learner-facing feedback is generated only from traceable evaluation findings and authored feedback resources.

---

## 2. Shared identifiers and version envelope

Every evaluation request must identify the exact versions used. A case update must not silently change the interpretation of an in-progress or historical attempt.

```ts
type CaseId = string;
type CaseVersion = string;       // immutable published/draft revision identifier
type EvaluatorVersion = string;  // semantic rules + module contract revision
type ScenarioId = string;

type EvaluationContext = {
  caseId: CaseId;
  caseVersion: CaseVersion;
  evaluatorVersion: EvaluatorVersion;
  schemaVersion: string;
  cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  trainingMode: "GUIDED" | "STEADY" | "CHALLENGE";
  answerFormat: "STANDARD" | "HELL";
  locale: "en" | "ar";
  attemptId: string;
  responseId: string;
};
```

Rules:
- IDs are stable within their declared scope; display names are not identifiers.
- The evaluator receives an immutable case snapshot matching `caseVersion`.
- `attemptId` and `responseId` are correlation identifiers, not permission to write history.
- Locale controls presentation resources; it must not change semantic interpretation.
- If a version or required reference cannot be resolved, stop evaluation with a typed configuration error. Do not fall back to the latest case version.

---

## 3. Canonical semantic data types

These are conceptual TypeScript-style contracts. Exact serialization, validation library, and runtime representation will be selected during implementation, but the distinctions and required information are binding.

### 3.1 Claim and proposition

```ts
type Polarity = "AFFIRMED" | "NEGATED" | "UNKNOWN";

type Modality =
  | "CERTAIN"
  | "PROBABLE"
  | "POSSIBLE"
  | "UNCERTAIN"
  | "UNKNOWN";

type EpistemicStatus =
  | "ESTABLISHED_FACT"
  | "REPORTED_OBSERVATION"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "UNKNOWN_NOT_ESTABLISHED"
  | "OPINION_IMPRESSION";

type ClaimSource =
  | { kind: "LEARNER_ASSERTION" }
  | { kind: "ATTRIBUTED_SOURCE"; sourceId: string; sourceName?: string }
  | { kind: "CASE_RECORD"; recordId: string }
  | { kind: "UNRESOLVED_ATTRIBUTION" };

type Proposition = {
  propositionId: string;
  subjectConceptId?: string;
  predicate: string;
  objectConceptId?: string;
  polarity: Polarity;
  modality: Modality;
  source: ClaimSource;
  epistemicStatus: EpistemicStatus;
  timeRef?: string;
  clauseId: string;
  evidenceRefs: string[];
  scopeNotes?: string[];
};
```

A proposition may be incomplete. Missing fields must remain missing; modules must not invent a subject, actor, cause, or time to make a match succeed.

### 3.2 Concept definition

```ts
type CaseConcept = {
  conceptId: string;
  definition: string;
  acceptedVariants: string[];
  paraphrasePatterns: string[];
  evidenceRefs: string[];
  requiredRelations: string[];
  constraints: string[];
  allowedPolarity: Polarity[];
  allowedModalities: Modality[];
  expectedEpistemicStatuses: EpistemicStatus[];
};
```

A case may author direct phrases and controlled patterns. Compositional recognition may combine concepts only through explicitly declared relations. A concept definition is not a license to accept any sentence containing its keywords.

### 3.3 Evidence relationship

```ts
type EvidenceRelation =
  | "SUPPORTS"
  | "CONTRADICTS"
  | "CONSISTENT_WITH"
  | "WEAKENS"
  | "CONTEXTUALIZES"
  | "DOES_NOT_ESTABLISH"
  | "LEAVES_UNRESOLVED";

type EvidenceLink = {
  evidenceId: string;
  targetPropositionPattern: string;
  relation: EvidenceRelation;
  scope: string;
  limitation: string;
};
```

Relations are authored per target proposition and scope. A link supporting “the card was used” cannot be reused as support for “Lena personally used the card” unless a separate case-authored rule establishes that link.

### 3.4 Module diagnostics

```ts
type DiagnosticSeverity = "INFO" | "NOTICE" | "WARNING" | "BLOCKING";

type Diagnostic = {
  code: string;
  severity: DiagnosticSeverity;
  messageKey: string;
  propositionIds: string[];
  evidenceRefs: string[];
  criterionIds: string[];
};
```

Diagnostics are machine-readable and traceable. Learner-facing wording is resolved later through FeedbackBuilder resources; modules should not author ad hoc prose.

---

## 4. Pipeline overview and data ownership

```text
EvaluationRequest + immutable CaseSnapshot
                  |
                  v
           TextNormalizer
                  |
          NormalizedResponse
                  |
                  v
           SemanticMatcher <---- CaseConceptCatalogue
                  |
          InterpretedResponse
                  |
                  v
           EvidenceReasoner <---- EvidenceRelationshipGraph
                  |
          EvidenceAssessment
                  |
                  v
            ClaimValidator <---- CaseConstraints
                  |
          ClaimValidation
                  |
                  v
          EvaluationResolver <---- Rubric + mode policy
                  |
          ResolvedEvaluation
                  |
                  v
            FeedbackBuilder <---- Authored feedback resources
                  |
          EvaluationResult
```

### 4.1 Ownership rules

- Case Data owns facts, evidence, concepts, constraints, questions, rubrics, and authored feedback resources.
- The caller owns the immutable response and EvaluationContext.
- Each module owns only its output object.
- The orchestrator owns sequencing and correlation; it does not reinterpret module findings.
- Session/persistence services own attempt history and saving. They receive the completed result from outside the pure evaluator.
- No module may update coins, XP, progress, case content, or previous attempts.

### 4.2 Common module envelope

Every module result carries:
- `caseId`, `caseVersion`, `evaluatorVersion`;
- `responseId`;
- `moduleName` and `moduleVersion`;
- `status`;
- `data`;
- `diagnostics`.

Module status is one of:
- `OK`: completed within supported rules;
- `PARTIAL`: some clauses could not be interpreted, but usable findings exist;
- `NEEDS_CLARIFICATION`: material ambiguity prevents fair downstream grading;
- `UNSUPPORTED_INPUT`: input falls outside declared support;
- `CONFIGURATION_ERROR`: required case data, version, or reference is invalid.

A configuration error aborts the pipeline. A material clarification state is propagated and prevents final grading. Partial interpretation may continue only for claims that are independently clear; uncertain claims remain explicitly unresolved.

---

## 5. Module 1 — TextNormalizer

### Input

```ts
type TextNormalizerInput = {
  context: EvaluationContext;
  rawResponse: string;
  supportedLocale: "en";
  normalizationProfileId: string;
};
```

Arabic is optional help/presentation language in the product. V1 semantic evaluation is English-response focused unless a later approved language-specific evaluator is added. The normalizer must not silently translate Arabic into an assumed English meaning.

### Output

```ts
type NormalizedResponse = {
  originalText: string;
  normalizedText: string;
  clauses: Array<{
    clauseId: string;
    text: string;
    tokenRefs: string[];
    preservedOperators: string[];
    sourceSpan: [number, number];
  }>;
  detectedLanguage: "en" | "ar" | "MIXED" | "UNKNOWN";
  normalizationNotes: string[];
};
```

### Allowed operations
- normalize whitespace, casing, and harmless punctuation;
- normalize explicitly authored spelling variants;
- split clauses only where the boundary is sufficiently clear;
- retain source spans so later feedback can refer to the learner's wording.

### Forbidden operations
- deleting or neutralizing `not`, `never`, `may`, `might`, `probably`, `possibly`, `unknown`, `only`, `because`, attribution phrases, or time markers;
- treating tense, actor, object, or causal wording as cosmetic;
- aggressive stemming that collapses distinct meanings;
- auto-correcting a word where the correction changes the claim;
- translating mixed or Arabic text by guessing.

### Failure behavior
If the response is blank, unsupported-language, or cannot be segmented safely, return a typed status and do not manufacture normalized claims.

---

## 6. Module 2 — SemanticMatcher

### Input
- NormalizedResponse;
- versioned CaseConcept catalogue;
- authored grammar / paraphrase patterns;
- allowed relationship patterns.

### Output

```ts
type MatchPath = "DIRECT" | "COMPOSITIONAL";

type ConceptMatch = {
  conceptId: string;
  matchPath: MatchPath;
  clauseIds: string[];
  propositionIds: string[];
  matchedVariantId?: string;
  confidenceClass: "RULE_EXACT" | "RULE_COMPOSED" | "AMBIGUOUS";
};

type InterpretedResponse = {
  propositions: Proposition[];
  conceptMatches: ConceptMatch[];
  unmatchedClauseIds: string[];
  ambiguityGroups: Array<{
    clauseIds: string[];
    alternativeInterpretations: string[];
    materialDifference: string;
  }>;
};
```

### Matching rules
1. Direct Match applies a known authored phrase/pattern and still parses its polarity, modality, attribution, and scope.
2. Compositional Match combines recognized concepts through an explicitly allowed relation.
3. A match requires the correct roles and relationships, not just the right nouns.
4. If two materially different interpretations remain possible, return ambiguity rather than selecting the more favorable one.
5. An unmatched clause is preserved. It is not discarded simply because another clause matched.
6. No general-purpose semantic similarity score is used as proof in V1.

### Failure behavior
- Unknown but potentially meaningful wording: `UNSUPPORTED_INPUT` or `PARTIAL`, with a rephrase/clarification route.
- Material pronoun or actor ambiguity: `NEEDS_CLARIFICATION`.
- Keyword-only co-occurrence: no semantic match for the missing relation.

---

## 7. Module 3 — EvidenceReasoner

### Input
- InterpretedResponse;
- evidence records and authored EvidenceRelationshipGraph;
- evidence limitations and importance roles.

### Output

```ts
type PropositionEvidenceAssessment = {
  propositionId: string;
  evidenceFindings: Array<{
    evidenceId: string;
    relation: EvidenceRelation;
    applicableScope: string;
    limitation: string;
  }>;
  supportState:
    | "SUPPORTED"
    | "PARTIALLY_SUPPORTED"
    | "CONSISTENT_NOT_PROVEN"
    | "UNRESOLVED"
    | "CONTRADICTED"
    | "NO_AUTHORED_RELATION";
};

type EvidenceAssessment = {
  propositionAssessments: PropositionEvidenceAssessment[];
  missingEssentialEvidenceRefs: string[];
  invalidInferenceFlags: Diagnostic[];
};
```

### Reasoning rules
- Assess each proposition separately.
- Respect evidence role: Essential, Optional, Hidden, contextual, or disconfirming.
- Optional/Hidden evidence cannot become an undisclosed requirement for a fair basic solution.
- Distinguish direct observation from a witness's interpretation.
- Distinguish a record that an event occurred from proof of the human actor.
- Distinguish an unusual measurement from proof of its cause.
- Do not chain evidence relationships transitively unless the case explicitly defines the chain.
- A lack of evidence is not automatically evidence of the opposite claim.

### Failure behavior
If no authored relation exists, return `NO_AUTHORED_RELATION`; do not infer support from proximity or shared vocabulary.

---

## 8. Module 4 — ClaimValidator

### Input
- InterpretedResponse;
- EvidenceAssessment;
- case constraints and required/unsupported claim patterns.

### Output

```ts
type ClaimState =
  | "SUPPORTED"
  | "INCOMPLETE"
  | "OVERCLAIMED"
  | "UNSUPPORTED"
  | "CONTRADICTED"
  | "UNRESOLVED";

type ClaimFinding = {
  propositionId: string;
  state: ClaimState;
  materiality: "CENTRAL" | "MATERIAL" | "PERIPHERAL";
  affectedCriterionIds: string[];
  diagnosticCodes: string[];
  rationaleKey: string;
};

type ClaimValidation = {
  findings: ClaimFinding[];
  materialContradictions: Diagnostic[];
  unsupportedMaterialClaims: Diagnostic[];
  clarificationRequired: boolean;
};
```

### Validation rules
- A hypothesis expressed as possible is not equivalent to the same hypothesis asserted as certain.
- A reported statement remains attributed to its source.
- The learner's conclusion is not allowed to inherit a witness's attribution.
- A material false central claim affects its criterion even if other claims are correct.
- A peripheral unsupported detail should not trigger an arbitrary whole-answer penalty.
- A correct conclusion does not erase a materially false explanation.
- Contradictions are surfaced; the module must not infer dishonesty or motive.

### Conflict policy
- If the learner's intended position is unclear because of conflicting clauses, set `clarificationRequired`.
- If the position is clear but conflicts with established case facts, mark the affected claim `CONTRADICTED`.
- If a supported central claim has an unsupported add-on, preserve both findings and let EvaluationResolver award only the supported criterion credit.
- Do not resolve conflict by choosing whichever clause yields the highest score.

---

## 9. Module 5 — EvaluationResolver

### Input
- all upstream module outputs;
- required concepts and case rubric;
- EvaluationContext;
- clarification / retry context relevant to the current response.

### Output

```ts
type PrimaryOutcome =
  | "ACCEPTED"
  | "PARTIAL"
  | "NEEDS_CLARIFICATION"
  | "UNSUPPORTED"
  | "CONTRADICTION";

type CriterionResult = {
  criterionId: string;
  level: "EXCELLENT" | "STRONG" | "DEVELOPING" | "LIMITED" | "NO_CREDIT";
  percentage: 100 | 75 | 50 | 25 | 0;
  rationaleKeys: string[];
};

type DimensionResult = {
  dimension:
    | "CONCLUSION_ACCURACY"
    | "EVIDENCE_REASONING"
    | "CRITICAL_THINKING";
  score: number;
};

type ResolvedEvaluation = {
  primaryOutcome: PrimaryOutcome;
  criterionResults: CriterionResult[];
  dimensionResults: DimensionResult[];
  weightedScore?: number;
  awardedGrade?: "S" | "A+" | "A" | "B" | "C" | "D" | "F";
  clarificationRequired: boolean;
  claimDiagnostics: Diagnostic[];
  independence: "HIGH" | "MODERATE" | "ASSISTED";
  gradeGateReasons: string[];
};
```

### Resolution order
1. Abort on configuration error.
2. If a material ambiguity blocks interpretation, return `NEEDS_CLARIFICATION` with no weighted score or grade.
3. Resolve each material claim against evidence and case constraints.
4. Determine criterion-level performance; do not jump directly from a whole-answer impression to a grade.
5. Aggregate criterion scores within each dimension using case-authored criterion weights.
6. Aggregate dimensions using provisional 35% Conclusion Accuracy, 40% Evidence Reasoning, and 25% Critical Thinking.
7. Apply grade gates and mode cap.
8. Return the primary outcome plus claim-level diagnostics.

### Outcome precedence
- `NEEDS_CLARIFICATION` takes precedence when material ambiguity prevents a fair interpretation.
- Otherwise, a material conflict with established case facts yields `CONTRADICTION`.
- Otherwise, a material unsupported central claim yields `UNSUPPORTED`.
- Otherwise, meaningful but incomplete performance yields `PARTIAL`.
- Otherwise, `ACCEPTED`.

This precedence selects one primary outcome; it does not erase additional claim-level flags.

### Provisional scoring rules
- Criterion performance levels: Excellent 100%, Strong 75%, Developing 50%, Limited 25%, No Credit 0%.
- Dimension weights: 35 / 40 / 25 as specified above.
- Provisional bands: S 96–100, A+ 90–95, A 80–89, B 70–79, C 60–69, D 40–59, F 0–39.
- S requires weighted score ≥96, each dimension ≥90, and no unresolved material contradiction or material unsupported assertion.
- If numeric score is ≥96 but S gate fails, cap at A+.
- Guided caps awarded grade at A+ without changing numeric/dimension scores.
- Steady and Challenge may award S.
- Hell Mode adds no bonus and changes no rubric threshold.
- The numeric weights and grade bands remain provisional until fixture-based calibration.

### Retry and clarification boundary
The resolver assesses the current submitted response. The session layer retains all attempts. After feedback, the latest clear submitted response is the current demonstrated understanding for that question; earlier responses remain immutable history and do not impose automatic penalties. A clarification turn is not a wrong answer and cannot be converted into a grade while unresolved.

### Independence
- HIGH: no optional hints used.
- MODERATE: Direction and/or Connection used, no Reasoning hint.
- ASSISTED: Reasoning hint used.
Built-in Guided scaffolding, clarification, retries, and ordinary feedback do not reduce Independence. Hint use never reduces academic points; no-hint use gives no bonus.

---

## 10. Module 6 — FeedbackBuilder

### Input
- ResolvedEvaluation;
- traceable diagnostics and criterion rationale keys;
- authored feedback resources for the case and CEFR;
- locale and Training Mode.

### Output

```ts
type FeedbackItem = {
  type: "WHAT_YOU_GOT" | "WHAT_TO_REVISIT" | "EVIDENCE_BOUNDARY" | "NEXT_STEP";
  resourceKey: string;
  evidenceRefs: string[];
  criterionIds: string[];
};

type FeedbackResult = {
  items: FeedbackItem[];
  availableLocales: string[];
  clarificationPromptKey?: string;
};
```

### Rules
- Explain the learner's valid reasoning before correcting gaps where appropriate.
- Point to the smallest relevant evidence boundary.
- Never invent facts or claim that a source said something it did not say.
- Do not expose hidden evaluator internals as learner-facing text.
- Keep feedback concise and English-first; Arabic help follows the product's same-slot replacement rule.
- Training Mode may change scaffolding/detail, but not the semantic result or score.

---

## 11. Orchestrator contract

The orchestrator is a thin coordinator, not a seventh reasoning module.

### Input
- EvaluationContext;
- immutable CaseSnapshot;
- learner response;
- hint usage and current response context.

### Output
- EvaluationResult containing version envelope, normalized/interpreted trace, primary outcome, criterion/dimension results, grade if assessable, Independence, feedback, and diagnostics.

### Execution rules
1. Validate the context and CaseSnapshot version.
2. Run TextNormalizer.
3. If no safe input representation exists, return a typed non-grade result.
4. Run SemanticMatcher.
5. If a material ambiguity exists, run only the safe clarification resolution path; do not award a final grade.
6. Run EvidenceReasoner.
7. Run ClaimValidator.
8. Run EvaluationResolver.
9. Run FeedbackBuilder.
10. Return a deterministic result with traceability metadata.

A module error must never be swallowed and converted to an apparently successful assessment. The orchestrator returns an explicit failure result with module and diagnostic code.

---

## 12. Standard and Hell Mode input adapters

Both formats must converge on the same semantic evaluation model.

### Standard
- The selected option maps to a case-authored proposition / answer key.
- The adapter records the selected option and its semantic identifier.
- The evaluator assesses the mapped proposition against the same rubric and evidence constraints.
- Distractor correctness must be case-authored and versioned.

### Hell Mode
- Two separate fields are submitted: Your Conclusion and Your Reasoning.
- Each field is normalized and interpreted with its role retained.
- Conclusion propositions primarily inform Conclusion Accuracy.
- Reasoning propositions primarily inform Evidence Reasoning and Critical Thinking.
- Cross-field contradictions are checked.
- A correct conclusion with materially false reasoning cannot receive full reasoning credit.
- A concise answer may receive full credit; verbosity and advanced grammar are not rewarded.

The two adapters must not create different standards of truth or evidence.

---

## 13. Reference-case contract walkthroughs

The following are design-level traces using representative responses. They validate the intended contracts and boundaries; they are not executed software tests.

### 13.1 CASE-001 — The Missing Package

**Case anchors**
- Delivery record: package placed at reception at 10:05; no recipient named.
- Nora arrived at 10:20 and the package was absent.
- Adam was away 10:00–10:15 and did not witness delivery.
- Sara saw the driver place the package and later saw a resident in a green jacket take it at 10:12; she did not see the resident's face.
- The identity and motive of the resident remain unknown.

**Response A — supported concise answer**

> An unidentified resident in a green jacket picked up the package. We don't know who they were or why.

Expected trace:
- TextNormalizer: preserves “unidentified”, actor phrase, and both unknown clauses.
- SemanticMatcher: Direct or Compositional match for pickup by an unidentified resident wearing a green jacket; separate unknown-identity and unknown-motive propositions.
- EvidenceReasoner: Sara's attributed observation supports the pickup description; the evidence leaves identity and motive unresolved.
- ClaimValidator: all central propositions supported / appropriately limited.
- EvaluationResolver: `ACCEPTED`; high criterion performance is possible without extra prose.
- FeedbackBuilder: acknowledge correct distinction between observed pickup and unknown identity/motive.

**Response B — keyword trap**

> Sara took the package because she saw the resident take it.

Expected trace:
- SemanticMatcher: recognizes Sara, package, and resident but parses the actor as Sara; it must not map this to the resident-pickup proposition.
- EvidenceReasoner: no evidence supports Sara as the picker.
- ClaimValidator: central actor claim is `UNSUPPORTED`; the causal “because” relation is also invalid.
- EvaluationResolver: `UNSUPPORTED` or `PARTIAL` only if separately supported criteria exist; never `ACCEPTED`.
- FeedbackBuilder: explain that witnessing an event does not establish that Sara performed it.

**Response C — overclaiming**

> The resident stole the package to keep it.

Expected trace:
- SemanticMatcher: recognizes resident/pickup but also theft/motive claims.
- EvidenceReasoner: pickup is supported; theft and motive are not established.
- ClaimValidator: supported central event plus material unsupported additions.
- EvaluationResolver: `PARTIAL` or `UNSUPPORTED` depending on authored criterion materiality; no full credit for unsupported intent.
- FeedbackBuilder: distinguish taking/picking up from proven theft or motive.

**CASE-001 acceptance checks**
- Do not identify Sara or Adam as the picker.
- Do not infer theft or motive.
- Preserve that Sara did not see the resident's face.
- Do not require optional package-label evidence.

### 13.2 CASE-002 — Conflicting Accounts

**Case anchors**
- Nadia said she placed the envelope at reception at 3:05 and returned at 3:45.
- Omar saw a large envelope at 3:20, then later saw Nadia carrying papers; he did not identify those papers as the missing envelope.
- Lena said she moved a group of papers to Room B around 3:25 and did not recall checking every sheet.
- Lena's card opened Room B at 3:22 and the room was closed at 3:41; the log does not identify the physical card user or contents moved.
- The envelope was found in Room B at 4:10, closed, with its papers inside.

**Response A — calibrated hypothesis**

> Lena may have moved the envelope with the papers, but the card log does not prove that she used the card herself.

Expected trace:
- TextNormalizer: preserves “may” and “does not prove”.
- SemanticMatcher: identifies a possible Lena-movement hypothesis and a negated proof claim about card-user identity.
- EvidenceReasoner: Lena's reported movement and Room B access are consistent with the hypothesis; neither establishes it.
- ClaimValidator: hypothesis remains appropriately qualified; card-use limitation is respected.
- EvaluationResolver: `ACCEPTED` if the case rubric accepts this as a defensible conclusion; full credit depends on whether it also addresses the envelope's recovery and uncertainty requirements.
- FeedbackBuilder: praise calibration; identify any missing required element without converting uncertainty into error.

**Response B — invalid actor transfer**

> Lena used her card and took the envelope to Room B.

Expected trace:
- SemanticMatcher: separates “card used” from “Lena used the card”; detects the actor attribution.
- EvidenceReasoner: access log supports card use, not the physical user's identity or the envelope's contents.
- ClaimValidator: Lena-as-user and envelope-as-carried are overclaims.
- EvaluationResolver: `UNSUPPORTED` or `PARTIAL` based on the remaining supported claims; not fully accepted.
- FeedbackBuilder: explain the difference between a credential event and a proven human actor.

**Response C — unsupported accusation**

> Omar lied because he saw Nadia steal it.

Expected trace:
- SemanticMatcher: identifies claims of lying, theft, and a claimed sighting of the envelope.
- EvidenceReasoner: Omar did not identify the papers as the envelope; no evidence establishes deliberate lying or theft.
- ClaimValidator: material unsupported and contradicted details.
- EvaluationResolver: `UNSUPPORTED` or `CONTRADICTION` if the response directly conflicts with the case record; do not infer motive or dishonesty.
- FeedbackBuilder: distinguish what Omar saw from what he inferred.

**CASE-002 acceptance checks**
- Card use must not be equated with Lena's physical presence.
- “Papers” must not automatically match “the envelope”.
- Lena moving the envelope remains plausible, not proven.
- The envelope's later location is established; its mover is not.

### 13.3 CASE-003 — The Uncertain Evidence

**Case anchors**
- R-4 recorded an unusual signal-strength increase from 21:43 to 21:47 on Oct 14; the record is incomplete.
- Analyst One considered an external source possible but could not identify it or exclude a fault.
- Analyst Two considered a temporary R-4 fault possible but could not prove it.
- Maintenance records show earlier instability but no diagnostic test on Oct 14.
- R-7 had a different direction and sensitivity and is not a direct control.
- The preliminary report predates recovery of the original recording; repeating it is not independent confirmation.
- The technician's personal impression is not a diagnosis.
- Cause and source remain unresolved.

**Response A — evidence-calibrated conclusion**

> R-4 recorded an unusual increase, but the incomplete data cannot establish whether it came from an external source or a receiver fault.

Expected trace:
- TextNormalizer: preserves “but”, “cannot establish”, and alternatives.
- SemanticMatcher: identifies the recorded anomaly, incomplete record, and unresolved causal alternatives.
- EvidenceReasoner: the log supports the anomaly; analyst statements support competing hypotheses only; maintenance context does not prove a fault; R-7 is not a direct control.
- ClaimValidator: no causal overclaim; uncertainty and evidence limits are correctly represented.
- EvaluationResolver: `ACCEPTED`; full credit is possible with a concise response if all required criteria are met.
- FeedbackBuilder: acknowledge distinction between observation and causal explanation.

**Response B — causal overclaim**

> An external event definitely caused the signal increase because R-7 did not record it.

Expected trace:
- SemanticMatcher: recognizes external event, certainty, causal relation, and R-7 comparison.
- EvidenceReasoner: R-7 is not a direct control; no evidence establishes an external cause.
- ClaimValidator: certainty and causality are overclaimed; the R-7 inference violates case limitations.
- EvaluationResolver: `UNSUPPORTED` or `CONTRADICTION` if the response asserts a case fact that the record explicitly rules out; no S grade.
- FeedbackBuilder: explain why differing instrument direction/sensitivity prevents that comparison from proving cause.

**Response C — false certainty about fault**

> R-4 was broken, so the reading was meaningless.

Expected trace:
- SemanticMatcher: recognizes fault as a certain causal claim and “meaningless” as an additional conclusion.
- EvidenceReasoner: earlier instability is contextual; no diagnostic test on Oct 14 establishes a fault.
- ClaimValidator: fault is unproven; dismissing the reading as meaningless is unsupported.
- EvaluationResolver: `UNSUPPORTED` or `PARTIAL` if the learner correctly recognizes uncertainty elsewhere; do not accept a hypothesis as fact.
- FeedbackBuilder: distinguish a possible technical explanation from a confirmed diagnosis.

**CASE-003 acceptance checks**
- The unusual R-4 reading is an established recorded observation, not proof of an external event.
- Neither external source nor receiver fault is confirmed.
- R-7 is not a direct control.
- The preliminary report and personal impression are not independent confirmation.
- The optional weather note cannot become a required proof source.

---

## 14. Cross-case contract tests

The following are required future automated fixtures. They are not marked as executed.

| Fixture family | Input variation | Required invariant |
|---|---|---|
| Negation | “did” / “did not” | Opposite polarity never collapses |
| Modality | “may have” / “definitely did” | Hypothesis is not certainty |
| Attribution | “Lena's card was used” / “Lena used the card” | Credential event is not human identity |
| Observation / cause | “unusual reading” / “external event caused it” | Observation does not prove cause |
| Actor role | Witness saw action / witness performed action | Observer is not actor |
| Evidence scope | “papers” / “the envelope” | Generic object does not become identified item |
| Keyword trap | Correct nouns, invalid relation | No keyword-only acceptance |
| Concise paraphrase | Different wording, same supported proposition | Equivalent meaning is accepted |
| Mixed claim | Supported core + unsupported add-on | Partial credit and diagnostics preserved |
| Contradiction | Affirmed and negated material claims | Clarification or contradiction, never cherry-pick |
| Unknown wording | Plausible but unsupported construction | Safe fallback, not guessed acceptance |
| Optional evidence | Remove optional clue | Basic valid solution remains valid |
| Determinism | Repeat identical versioned request | Byte-equivalent semantic result, excluding non-deterministic timestamps |
| Version isolation | Same response, different case version | Each version is evaluated only against its own snapshot |

Every fixture must specify expected propositions, relations, diagnostics, primary outcome, criterion effects, and rationale.

---

## 15. Design simulation findings

The three reference-case walkthroughs support the proposed module boundaries at a conceptual level:

1. TextNormalizer can preserve the semantic operators required by the examples without deciding truth.
2. SemanticMatcher can separate concepts that share vocabulary but differ in actor, relation, polarity, certainty, or attribution.
3. EvidenceReasoner can constrain claims to case-authored evidence links and limitations.
4. ClaimValidator can retain supported and unsupported claims in the same response.
5. EvaluationResolver can choose a primary outcome while preserving claim-level diagnostics and withholding grades during clarification.
6. FeedbackBuilder can explain the smallest relevant evidence boundary without inventing facts.

### 15.1 Issues exposed and contract clarifications

- A response may contain a correct proposition and an unsupported add-on; outputs therefore need claim-level findings, not only one whole-answer label.
- A correct Standard option and a semantically equivalent Hell Mode answer must converge on the same criterion result.
- A phrase can be grammatically simple yet epistemically precise; grammar complexity must not influence scoring.
- “Unknown” is sometimes the correct conclusion, not a failure to answer.
- A case may have multiple plausible hypotheses; the evaluator must reward calibrated uncertainty rather than demand one speculative cause.
- Ambiguity should be localized to the smallest clause or reference, so one unclear phrase does not erase independently clear claims.

No design-level inconsistency was found that requires changing the six-module architecture. This conclusion is limited to the representative traces in this document; broader coverage depends on executable fixtures.

---

## 16. Implementation-readiness checklist

Before code implementation is approved, all of the following must be completed:

- [ ] Review and approve this contract as the implementation baseline.
- [ ] Convert conceptual types into validated runtime schemas.
- [ ] Define exact case-data serialization for concepts, grammar patterns, evidence links, constraints, and rubric criteria.
- [ ] Define a bounded English grammar / pattern catalogue for each CEFR band; do not imply unrestricted language coverage.
- [ ] Create executable fixtures for all three reference cases, including positive/negative semantic pairs.
- [ ] Convert the 57 manual scenario entries into fixtures and add any missing semantic regression cases.
- [ ] Test module-level inputs/outputs independently.
- [ ] Test full pipeline traces and module failure propagation.
- [ ] Test Standard/Hell parity.
- [ ] Test retry, clarification, and Independence integration without mutating historical attempts.
- [ ] Calibrate provisional weights and grade gates against actual fixture results.
- [ ] Run the complete project test suite and review regressions.
- [ ] Request explicit user approval for the implementation scope.

Persistence & Recovery remains a separate later design phase. This contract does not authorize implementation by itself.

---

## 17. Change control

Changes to semantic meaning, evidence scope, outcome precedence, scoring policy, or module ownership require a documented design decision and updated regression fixtures. Purely editorial improvements to examples do not alter the contract.

**Final status:** Contract drafted and conceptually exercised against CASE-001, CASE-002, and CASE-003. It is ready for review, not yet implementation-approved. No source code was changed, and no automated test was run.
