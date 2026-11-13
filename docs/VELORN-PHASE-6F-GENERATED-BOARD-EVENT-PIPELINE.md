# Velorn Phase 6F — Generated Board Event Pipeline

## Scope

Phase 6F connects the verified mission catalog and board generator to the trusted activity-event processor. It proves that the generated daily and weekly boards can be completed from server-validated Think Lab events, including cumulative evidence and replay handling.

This is a progress-only phase. It does **not** call mission claim RPCs, create wallets, write ledger entries, issue rewards or achievements, expose balances, activate the economy, or change the PWA.

## End-to-end contract

- Generate a complete four-slot daily board and a complete three-slot weekly board using the real board generator.
- Use isolated, transaction-scoped verified copies of the six newer Think Lab templates; use the independently verified Odd One Out Challenge template for the fourth daily slot.
- Feed trusted event records through the normal database event trigger and mission progress processor path.
- Verify all four daily missions complete, including the requirement that Try Something Different waits for a different game later in the same local day.
- Verify all three weekly missions complete: three distinct local activity days; two distinct games; one full multi-step round.
- Replay a previously processed event and prove it is a no-op.
- Assert that no wallet, ledger, mission reward claim, or achievement award is created.
- Restore the economy flag to disabled and roll back every fixture.

## Verification

The test file supabase/tests/phase6f_generated_board_event_pipeline_assertions.sql runs in the clean-room Supabase workflow after Phase 6E. It starts with economy_enabled = false, enables it only inside a transaction so the service-role-only board generator can run, and ends with the flag false before rolling back.

Passing Phase 6F proves generated-board-to-progress integration. It does not authorize production assignment, claims, reward issuance, or user-facing economy activation.
