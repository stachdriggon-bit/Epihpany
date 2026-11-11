# Velorn Phase 4A — Atomic Mission Claims

> **Status:** Repository implementation prepared on 2026-11-11. It must pass the clean-room workflow before the migration is applied to hosted Supabase. Economy remains disabled.

## Scope

This phase adds two server-only database entry points:

- `economy_claim_mission_assignment(user_id, assignment_id)`
- `economy_claim_mission_board_bonus(user_id, board_id)`

Both are available only to `service_role`. The trusted caller must obtain the user ID from verified Supabase Auth context; the browser must never call these RPCs or supply an authoritative user identity.

## Transaction contract

1. Resolve the assignment's board and lock the board row.
2. Lock the assignment row after the board lock. All claim paths for a board use this lock order, serializing the board's reward cap.
3. Return an existing paid claim on retry.
4. Require a completed assignment and a verified, assignable template whose period and reward snapshot match the board's immutable configuration version.
5. Enforce the approved number of paid mission claims: three for daily boards and three for weekly boards.
6. Call the existing Phase 1 wallet transaction with a deterministic idempotency key.
7. Insert the paid claim with the returned ledger entry in the same PostgreSQL transaction.

The claims table is append-only, so the implementation does not create an `eligible` row and later update it. The paid claim is inserted only after the wallet transaction succeeds. Any error rolls back both the ledger credit and claim insert.

## Approved limits

- Daily: three claims × 10 Velorn, plus one 10 Velorn board bonus. The fourth of four slots is optional and cannot exceed the daily cap of 40.
- Weekly: three claims × 20 Velorn, plus one 40 Velorn board bonus. The weekly maximum is 100.

Amounts come from the versioned configuration and immutable assignment snapshots. No request-supplied reward amount is accepted.

## Explicit non-goals

- No board generation or mission rotation.
- No timezone calculation or reset-boundary decision. The service consumes only existing board periods.
- No mission-template activation or validator mapping changes.
- No achievement award writer. Achievement awards need their own predicate-driven, insert-as-paid transaction path because their history is also append-only.
- No Edge Function, browser integration, player balance read, hosted migration, or economy activation in this phase.

## Verification

`supabase/tests/phase4a_atomic_mission_claim_assertions.sql` covers:

- RPC privilege isolation.
- Daily and weekly reward totals.
- Idempotent mission and bonus retries.
- Daily fourth-slot cap enforcement.
- Bonus eligibility.
- One paid claim per ledger entry.
- Full rollback when the wallet rejects a transaction because the economy is disabled.

A later concurrency test should submit the same assignment and distinct assignments on one board in parallel and assert one payment per assignment and no cap overrun. Production deployment remains blocked until clean-room CI and hosted post-migration checks pass.
