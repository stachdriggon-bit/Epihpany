# Velorn Phase 1 — Private Wallet & Ledger Foundation

> **Status:** Implemented in `main`; SQL syntax and transaction behavior validated in a rollback-only transaction against the connected PostgreSQL 17.11 project. The migration has not yet been applied to production. Clean-room GitHub Actions verification is pending.

## Scope

Phase 1 establishes only the private server-side accounting foundation. It does not activate the player economy, award Velorn, expose balances, change the Card Portal, or modify website code.

## Database objects

The migration `20261110182300_velorn_private_wallet_ledger_foundation.sql` creates:

- `economy_private.economy_config_versions`: immutable versioned configuration snapshots. Version 1 records the approved working mission values and Card Portal prices without implementing draw odds or Pity.
- `economy_private.economy_settings`: a single settings row with `economy_enabled = false` and active config version 1.
- `economy_private.wallets`: one lazily-created wallet per registered Auth user, using whole-number `bigint` balances, non-negative constraints, and a diagnostic version.
- `economy_private.wallet_ledger`: signed, append-only transaction records with resulting balances, stable source references, idempotency keys, configuration version, reason, bounded metadata, and server timestamps.

All four tables have RLS enabled and forced. The private schema is not in the configured Data API schemas. No API role has direct table access.

## Server boundary

Three narrow public-schema RPC wrappers use `SECURITY INVOKER` and are executable only by `service_role`:

- `economy_post_wallet_transaction(...)`
- `economy_get_wallet_snapshot(user_id)`
- `economy_reconcile_wallets()`

Their private implementations use a fixed empty `search_path`, are stored in `economy_private`, and independently require the `service_role` JWT claim. The service role has schema usage and function execution only, not direct table privileges. No service-role key is added to browser code.

## Transaction invariants

- Credits are positive; debits are negative; zero-value transactions are rejected.
- Debit and credit operations update the wallet and insert the ledger row in one PostgreSQL transaction.
- Wallet-row locking serializes same-player balance changes.
- A unique `(user_id, idempotency_key)` constraint prevents duplicate transactions. Reusing a key with a different payload is rejected.
- A debit that would make the balance negative fails without changing the wallet or ledger.
- Ledger and configuration-version UPDATE/DELETE operations are blocked by triggers. Corrections must be compensating entries, never edits to history.
- The reconciliation routine reports any wallet whose stored balance differs from the sum of its ledger entries.
- Wallets are created lazily only when a trusted transaction is accepted; Phase 1 does not create empty wallets for existing players.

## Disabled-by-default behavior

The economy setting is false. A new transaction is rejected while disabled and does not create a wallet. There are no automatic grants, starter balances, guest conversions, player-facing reads, UI changes, or Card Portal integration in this phase. Existing local prototype balances and card ownership are not imported.

The feature flag is controlled by a database administrator through the private settings row; it is not exposed to clients or an RPC.

## Verification

`supabase/tests/phase1_wallet_assertions.sql` covers:

- Schema exposure, role grants, RLS/FORCE RLS, and append-only triggers.
- Disabled writes creating no wallet.
- Credit, debit, idempotent replay, and mismatched-key rejection.
- Insufficient-funds rollback.
- Wallet snapshot and ledger reconciliation.
- Rejection of ledger UPDATE and DELETE.
- Disabling the economy again and confirming that no further transaction is accepted.

The SQL migration and test script were executed together inside an explicit transaction against the connected project, followed by `ROLLBACK`. The test passed after correcting a PL/pgSQL name ambiguity. A follow-up read confirmed that the private schema and public RPC wrapper do not exist in production and the hosted migration history remains at the original nine entries. This was a syntax/behavior smoke test only; it did not replace the clean-room CI run.

## Production gate

Do not apply the migration to production until the disposable local Supabase workflow passes both the Phase 0 catalog comparison and the Phase 1 assertions. After deployment, verify the migration record, private-schema privileges, disabled setting, zero wallet/ledger rows, and Supabase security/performance advisors.

Phase 2 remains separate: normalized activity events, server-side validation, mission claims, and achievement awards. The open decisions documented in `VELORN-TECHNICAL-ARCHITECTURE.md` remain gates for later reward issuance and Card Portal activation.
