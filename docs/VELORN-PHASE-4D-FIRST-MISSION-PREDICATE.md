# Velorn Phase 4D — First Trusted Mission Predicate Mapping

## Scope

This phase maps one approved mission, `solve_a_challenge`, to one exact trusted activity contract:

- Source system: `think_lab`
- Experience: `think_lab`
- Activity: `odd_one_out`
- Event type: `game_session_completed`
- Validator version: `odd-one-out-rotated-20261110-v2`
- Required training mode: `challenge`

The predicate accepts a completed server-owned session with internally consistent evidence: 1–12 questions, valid challenge level, and correct + incorrect answers equal to the total question count.

## Fairness rule

This mission measures completing a challenge, not scoring highly. A completed Challenge-mode session qualifies even if every answer is incorrect. There is no accuracy threshold, and the player-selected challenge level is not represented as a verified CEFR proficiency assessment.

Steady and Guided sessions do not satisfy this predicate. Nor do other games, event types, validator versions, missing events, malformed evidence, or mismatched answer totals.

## Versioning and safety

- Existing immutable template version 1 remains unchanged.
- Template version 2 carries the predicate reference and status `mapped`.
- A private immutable mapping row records the exact event and validator contract.
- The evaluator is fail-closed and executable only by `service_role`.
- Version 2 remains `is_assignable = false`; mapping is not the same as verification.
- No assignment progress writer, board generator, claim, wallet, or player-facing API is added here.
- Economy remains disabled.

The template cannot become assignable until the subsequent progress processor is implemented and the full event-to-assignment-to-claim path is tested, including period boundaries, duplicate events, replacement rules, concurrent processing, and disabled-economy rollback.

## Verification

The clean-room contract checks service-role-only execution, private table grants, immutable template versioning, the exact mapping, valid Challenge completion, and rejection of steady mode, malformed counts, wrong validator version, wrong activity, and missing events. It also verifies no wallet, ledger, claim, or award rows are created.
