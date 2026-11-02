# Language Detective — Case Integration Plan

**Document ID:** LD-CIP-1  
**Status:** Runtime integration complete; full repository test workflow passed  
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
6. `language-detective-assessment-fixtures.js` now owns four case snapshots, their learner-facing presentation metadata, and the 57 executable assessment fixtures.
7. `language-detective-ui.js` derives each case's presentation from the assessment registry; it no longer maintains a second caseInfo copy.
8. `language-detective.css` styles the investigation UI.

The UI submits a combined Conclusion/Reasoning string to the same evaluation engine in both answer formats. Standard mode still requires reasoning submission before conclusion choices unlock. Hell Mode still presents two separate free-text fields.

## 3. Current case registry and duplication

The case registry is now authoritative:

- `language-detective-assessment-fixtures.js` stores the assessment snapshot and the presentation metadata for each case.
- `language-detective-ui.js` derives its case picker, timeline, questions, and conclusion choices from that same registry.
- Each case declares its authored CEFR level; `makeContext` reads that value directly.
- The picker groups cases by authored CEFR order and does not let a learner relabel a case to a different level.

This removes the duplicate caseInfo registry and prevents the UI and evaluator from silently assigning different CEFR levels.

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

The evidence-strengthening revision is implemented: Mina's scarf, the cleaner's note, and the lost-property list all identify a small silver star.

Mina's statement currently identifies a blue scarf, while the station records identify a blue scarf from Platform 2. This is a strong match, but it does not uniquely establish that the recorded scarf is Mina's if another blue scarf could have been found there.

The small silver star is repeated in all three records, so the learner can match the found scarf to Mina's description without relying on an unstated uniqueness assumption.

This is a content correction, not a new game mechanic.

## 6. Assessment model for this A1 case

The learner's central conclusion is the scarf's current location: the station's lost-property/ticket desk.

The evaluator recognizes simple semantic variants such as:

- The scarf is at the lost-property desk.
- The blue scarf is at the ticket desk with lost property.
- The station has the scarf at lost property.

It also recognizes a clear pronoun antecedent after the scarf has been named, while leaving unsupported theft claims unaccepted.

The reasoning criteria should reward the supported sequence:

1. Mina had the scarf at Platform 2.
2. The cleaner found the matching scarf under the bench.
3. The cleaner took it to lost property, and the station list confirms receipt.

Do not require the learner to identify the cleaner or infer a motive. Do not reward unsupported accusations of theft. The evaluator must accept simple A1 paraphrases and avoid requiring advanced uncertainty vocabulary.

## 7. Completed implementation

### Phase A — Content and registry foundation

- [x] Added the silver-star identifying detail to the learner description, cleaner note, and lost-property record.
- [x] Moved all four cases into one authoritative registry containing both assessment and presentation data.
- [x] Added explicit CEFR metadata and made the picker group cases by authored level.
- [x] Kept the three pre-existing case snapshots and their 57 assessment fixtures intact.

### Phase B — The Blue Scarf integration

- [x] Added runtime case `CASE-004`, linked to editorial ID `LD-A1-002`.
- [x] Added three Standard conclusion choices and two evidence-check questions.
- [x] Added assessment concepts for the current location, discovery, transfer, matching scarf detail, and unsupported theft claims.
- [x] Added accepted A1 paraphrases and clear pronoun antecedent recognition.
- [x] Preserved Standard, Hell, Guided, Steady, and Challenge behavior.

### Phase C — Regression and content tests

- [x] Validated the new case snapshot and its evidence references.
- [x] Tested multiple simple paraphrases, the discovery/current-location distinction, and unsupported theft claims.
- [x] Tested Standard and Hell answer contracts and authored CEFR grouping.
- [x] Updated the browser smoke test for four registered case files.
- [x] Full repository workflow passed on the implementation commit.

**Verification:** Commit `2441bb67e434e95ff645377bd471c6049e8c5a38` completed the full test workflow successfully. The subsequent metadata-only update adds the editorial ID and implementation status to the case registry and has its own CI run.

## 8. Non-goals

This integration does not:

- Rewrite the assessment engine or change its scoring weights.
- Change Standard, Hell, or Training Mode interaction.
- Add a new game mode.
- Make The Blue Scarf part of the fictional story world.
- Replace or delete the three existing cases.
- Claim that all six CEFR case sets are complete.

## 9. Next step

The next content task is to author additional independent A1 cases and then begin the A2 case set. Do not reuse The Blue Scarf as a harder-level investigation. Runtime additions must continue to include focused assessment tests and the full repository test suite.
