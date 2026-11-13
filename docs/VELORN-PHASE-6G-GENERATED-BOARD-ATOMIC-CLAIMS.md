# Velorn Phase 6G — Atomic Claims on Generated Boards

## Scope

Phase 6G extends the Phase 6F generated-board event pipeline through the existing service-role-only mission claim functions. It verifies that completed assignments from actual generated daily and weekly boards can be claimed against the approved configuration and wallet ledger.

## End-to-end contract

- Generate the approved four-slot daily and three-slot weekly boards from verified test copies of the Think Lab mission templates.
- Complete the assignments through the trusted activity-event pipeline, including the daily activity-variety condition and weekly cumulative conditions.
- Reject a daily completion bonus before the required mission claims are paid.
- Pay three daily assignments, reject the fourth daily reward under the configured cap, then pay the daily completion bonus.
- Pay all three weekly assignments and the weekly completion bonus.
- Replay an assignment claim and a daily bonus claim; both must return the original claim without duplicate ledger credits.
- Verify the expected 140 Velorn total, eight claim rows, and eight matching ledger entries.
- Keep claim and wallet RPCs service-role-only; do not issue achievement awards.

## Safety

This is a disposable clean-room database test. The economy flag is enabled only inside the test transaction and explicitly restored to false before rollback. All test wallet balances, ledger entries, and claim rows are rolled back. This phase does not enable the economy in any hosted environment, deploy an Edge Function, or change the PWA.

## Verification

The clean-room workflow runs `supabase/tests/phase6g_generated_board_atomic_claim_assertions.sql` immediately after Phase 6F. Passing this phase proves the database claim lifecycle for generated boards; it does not authorize production reward activation.
