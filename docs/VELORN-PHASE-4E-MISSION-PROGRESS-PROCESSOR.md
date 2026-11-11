# Velorn Phase 4E — Trusted Mission Progress Processor

## Scope

Phase 4E connects immutable, server-validated activity events to matching mission assignments. It is the first progress writer; it is not a board generator, a reward claimant, or an economy activation.

## Processing model

- New rows in `economy_private.activity_events` invoke a private database trigger.
- The trigger calls the service-role-only event processor in the same transaction as event insertion. If processing fails, the event insert also rolls back; the trusted validator can retry with the same source event key.
- The processor matches the complete event contract: source system, experience, activity, event type, validator version, template version, predicate key, user, and the board's UTC period boundaries.
- Only explicitly implemented predicate evaluators can advance progress. Unknown predicate keys fail closed.
- The first supported predicate is `solve_a_challenge_odd_one_out_v1`. A fully completed Challenge-mode Odd One Out session advances the matching assignment from 0 to 1 and marks it completed. Guided/Steady, malformed evidence, wrong validator versions, other activities, and events outside the board period do not count.
- A player-selected challenge tier is not treated as verified CEFR proficiency. No accuracy threshold is imposed for this completion objective.

## Idempotency and concurrency

- `mission_event_progress` is private, RLS + FORCE RLS protected, and append-only.
- A unique `(event_id, assignment_id)` constraint makes repeated or concurrent processing of the same event/assignment pair a no-op after the first committed application.
- The processor locks the mission board before the assignment, matching the claim service lock order.
- The progress history insert and assignment update share one database transaction. An update failure rolls back the history row.
- A service-role-only board backfill replays all trusted events inside a board's saved period. This handles a board created after an eligible activity already occurred; replay is idempotent.

## Deliberate boundaries

- The existing `solve_a_challenge v2` mapping remains `mapped`, not `verified`, and the template remains non-assignable.
- No template or mapping is activated by this migration.
- No mission boards or assignments are generated.
- No wallet, ledger, claim, achievement award, player balance, or browser API is created.
- `economy_enabled` remains false.
- The processor only supports the explicitly coded one-event completion predicate. It does not pretend that the other ten mission templates or achievements are implemented.

## Verification

The clean-room test covers private access controls, trigger wiring, service-role-only execution, automatic processing, completion with zero correct answers, duplicate replay, rejection of Steady mode and out-of-period events, delayed board creation/backfill, append-only progress evidence, and the absence of wallet/ledger/claim/award writes.

The migration must pass clean-room schema reconstruction before being applied to hosted Supabase. After deployment, use rollback-only test data and verify the same invariants while confirming the production economy remains disabled.


## Phase 4F follow-on

Phase 4F adds the server-only board generator and replaces the initial one-predicate switch with constrained dynamic dispatch. Only verified mappings backed by private SECURITY DEFINER boolean evaluators granted to `service_role` can advance assignments. The generator requires complete distinct predicate pools (four daily, three weekly), snapshots rewards and objectives, and stays dormant while the economy is disabled. See `docs/VELORN-PHASE-4F-MISSION-BOARD-GENERATION.md` for the full contract.
