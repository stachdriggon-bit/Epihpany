# Velorn Phase 6L — Production Readiness and Recovery

## Scope

This phase hardens the operational boundary around the wallet, ledger, mission lifecycle, claim pipeline, and authenticated player read model. It does not activate rewards, import balances, deploy to hosted Supabase, or create production player data.

## Readiness gates

- The economy_private schema remains non-exposed, with RLS and FORCE RLS on protected tables.
- Wallet writes, claims, reconciliation, board generation, and player dashboard reads remain service-role-only.
- The private dashboard function is SECURITY DEFINER with an empty search_path; the public wrapper is SECURITY INVOKER.
- The player dashboard returns no balance, ledger, board, or claim data while economy_enabled=false.
- Wallet balances must reconcile exactly to the append-only ledger.
- No service-role key, reward amount, user ID, or financial authority is present in browser assets.
- Economy remains disabled at the end of every CI assertion.

## Operational runbook

### Normal monitoring

Review before any controlled activation:
1. Reconciliation mismatches from public.economy_reconcile_wallets() (expected zero rows).
2. Wallet/claim RPC failures grouped by sanitized SQLSTATE and operation; never log bearer tokens or full request bodies.
3. Duplicate claim and idempotent replay rates, separating expected retries from unusual spikes.
4. Mission board generation outcomes (created, existing, not_ready) and complete-board counts.
5. Edge Function latency, 4xx/5xx rates, Auth verification failures, and timeouts.
6. Daily/weekly paid claim totals against approved caps (40 and 100 Velorn).

The dashboard endpoint logs only sanitized operation/error codes and returns generic failures to the browser. It never returns SQL details or secrets.

### Incident containment

1. Stop player-facing reward requests by setting economy_private.economy_settings.economy_enabled=false through a reviewed privileged operator session.
2. Confirm the gate is false and run wallet-to-ledger reconciliation.
3. Preserve wallet ledger, claim, event, and board records. Do not delete or rewrite financial history.
4. Disable or roll back the affected Edge Function deployment if request orchestration is implicated.
5. Capture sanitized request IDs, timestamps, SQLSTATEs, and affected operation types.
6. Correct legitimate balance discrepancies only with reviewed compensating ledger transactions; never edit wallet or ledger rows directly.
7. Re-run clean-room reconstruction and Phase 6K–6M tests before reopening the gate.

### Recovery and backups

- Before activation, verify backup/PITR retention for the chosen Supabase tier and confirm an operator can identify a restore point.
- Perform a restore drill in a separate isolated project; verify schema/migration history, wallet-to-ledger reconciliation, mission claims, and account ownership.
- A restore must not automatically replay reward events or claims. Replayed requests must resolve to original idempotent receipts.
- Keep the source project untouched during restore drills. Never run recovery exercises against production player balances.

## Explicit exclusions

- No hosted database changes or deployment.
- No economy flag activation.
- No initial balance, welcome grant, local Token conversion, or backfill.
- No automatic retry of failed financial writes with a new idempotency key.
- No direct mutation/deletion of append-only records.

## Verification

phase6l_production_readiness_assertions.sql verifies the disabled gate, absence of wallet/ledger/claim/achievement rows in the clean-room baseline, service-role-only dashboard access, fixed search path, empty reconciliation result, and fail-closed dashboard response. All fixtures roll back.
