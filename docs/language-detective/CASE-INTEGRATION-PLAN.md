# Language Detective — Case Integration Plan

**Document ID:** LD-CIP-1  
**Status:** Technical audit complete; implementation not started  
**Target case:** LD-A1-002 — The Blue Scarf  
**Repository branch:** main

## 1. Purpose

Integrate approved case content into the existing Language Detective without changing the established answer formats, training modes, evidence-check behavior, or assessment scoring contract.

The Blue Scarf is an everyday A1 case. It is independent of the site's fictional story world.

## 2. Current runtime architecture

The feature is loaded on demand from Think Lab:

1. `think-lab.js` starts the detective mode.
2. `lazy-data.js` loads the Language Detective scripts and stylesheet as a feature group.
3. `language-detective-assessment-schemas.js` validates case snapshots and evaluation requests.
4. `language-detective-cefr-patterns.js` provides language-level profiles and construction patterns.
5. `language-detective-assessment-engine.js` runs normalization, semantic matching, evidence reasoning, claim validation, evaluation resolution, and feedback.
6. `language-detective-assessment-fixtures.js` currently owns the three case snapshots and the 57 executable assessment fixtures.
7. `language-detective-ui.js` separately owns the three learner-facing case descriptions, timelines, evidence-check questions, and Standard conclusion options.
8. `language-detective.css` styles the investigation UI.

The UI submits a combined Conclusion/Reasoning string to the same evaluation engine in both answer formats. Standard mode still requires reasoning submission before conclusion choices unlock. Hell Mode still presents two separate free-text fields.

## 3. Current case registry and duplication

Case content is currently split across two sources:

- Assessment facts and semantic answer concepts live in `language-detective-assessment-fixtures.js`.
- Learner-facing presentation content lives in the `caseInfo` object inside `language-detective-ui.js`.

The same case ID is therefore represented twice. A case can become inconsistent if only one side is updated.

The fixture helper `makeContext` also hardcodes the CEFR mapping for the three current case IDs. The UI's initial CEFR selector defaults to B1 and can override the case's mapped level. This must be replaced with explicit case metadata so an A1 case is assessed as A1 by design, rather than relying on a global default or a manual override.

## 4. Integration requirements for The Blue Scarf

Use a stable runtime ID such as `CASE-004` while retaining the editorial/document ID `LD-A1-002`. The runtime ID must not be inferred from the document number.

The case registry must provide, at minimum:

- Runtime case ID and content version.
- Editorial case ID and title.
- Fixed CEFR level: A1.
- Case category: everyday mystery.
- Learner-facing introduction and timeline.
- Evidence cards and their limitations.
- Evidence-check questions and answer explanations.
- Three balanced Standard conclusion options.
- Assessment snapshot: concepts, evidence relations, criteria, and accepted semantic variants.
- Hint content or the shared hint policy.
- Status indicating approved content and implementation readiness.

The same metadata should drive the picker and evaluation context. Do not let the UI and evaluator independently guess a case's CEFR level.

## 5. Important content validation before implementation

The current Blue Scarf draft needs one small evidence-strengthening revision before runtime implementation.

Mina's statement currently identifies a blue scarf, while the station records identify a blue scarf from Platform 2. This is a strong match, but it does not uniquely establish that the recorded scarf is Mina's if another blue scarf could have been found there.

Add one simple, observable identifying detail to Mina's description and repeat that detail in the cleaner's note and lost-property entry (for example, a small silver star on the scarf). Keep the vocabulary A1-friendly. The learner should be able to match the records without relying on an unstated uniqueness assumption.

This is a content correction, not a new game mechanic.

## 6. Assessment model for this A1 case

The learner's central conclusion is the scarf's current location: the station's lost-property/ticket desk.

The evaluator should recognize simple semantic variants such as:

- The scarf is at the lost-property desk.
- It is at the ticket desk with the lost things.
- The station has the scarf at lost property.

The reasoning criteria should reward the supported sequence:

1. Mina had the scarf at Platform 2.
2. The cleaner found the matching scarf under the bench.
3. The cleaner took it to lost property, and the station list confirms receipt.

Do not require the learner to identify the cleaner or infer a motive. Do not reward unsupported accusations of theft. The evaluator must accept simple A1 paraphrases and avoid requiring advanced uncertainty vocabulary.

## 7. Recommended implementation sequence

### Phase A — Content and registry foundation

1. Revise the scarf evidence to include a matching identifying detail.
2. Introduce a single case registry module for learner-facing metadata and assessment snapshots, or otherwise establish one authoritative source from which both the UI and evaluator data are derived.
3. Move the three existing cases into the same registry without changing their evidence, answer keys, or learner-facing wording.
4. Assign explicit CEFR metadata to every case.
5. Make the picker filter by CEFR level, or otherwise clearly group cases by their authored level. Do not allow a case authored for A1 to be silently relabelled as B1/C1.

### Phase B — The Blue Scarf integration

1. Add the Blue Scarf as a new runtime case with a stable runtime ID.
2. Add its three Standard conclusion options and two evidence-check questions.
3. Add assessment concepts for the scarf's current location and the evidence sequence.
4. Add accepted paraphrases for common A1 wording.
5. Keep Standard, Hell, and all three Training modes on the existing shared pipeline.
6. Keep the case category visible in the picker so everyday cases and story-world cases can coexist without confusion.

### Phase C — Regression and content tests

Add tests that verify:

- Every registry case has a valid assessment snapshot.
- Every case has a unique runtime ID and an explicit CEFR level.
- The picker exposes only cases appropriate to the selected level.
- The Blue Scarf appears under A1 and is labelled as an everyday mystery.
- Its correct location is accepted through multiple simple paraphrases.
- A response that only says the scarf was found under the bench is incomplete because it ignores the later transfer.
- Unsupported theft accusations are not accepted.
- All evidence references resolve.
- Every case retains three balanced Standard conclusion options.
- Hell Mode continues to have separate Conclusion and Reasoning fields and no conclusion choices.
- Guided, Steady, and Challenge preserve the same case truth and academic scoring contract.
- The existing three cases retain their current expected behavior.

Update fixture counts and test assertions from the current 57-scenario baseline only when new executable fixtures are actually added.

## 8. Non-goals

This integration does not:

- Rewrite the assessment engine or change its scoring weights.
- Change Standard, Hell, or Training Mode interaction.
- Add a new game mode.
- Make The Blue Scarf part of the fictional story world.
- Replace or delete the three existing cases.
- Claim that all six CEFR case sets are complete.

## 9. Implementation gate

Implementation may begin after the Blue Scarf identity detail is made unambiguous and the registry approach is agreed. Runtime changes must be accompanied by focused unit tests and the full `npm test` suite. Do not treat a successful script load as proof that a case is correctly assessable.
