# Velorn Phase 6K — Adversarial Economy Security and Integrity

## Scope

Exercise the existing wallet, mission-claim, and private-schema boundaries against hostile or malformed requests in the disposable clean-room database. This phase adds assertions and does not change production economy behavior.

## Coverage

- Private schema and table access remain unavailable to anon, authenticated, and service_role direct SQL access.
- RLS and FORCE RLS remain enabled on wallet, event, board, assignment, claim, progress, and cumulative-evidence tables.
- Wallet writing, validated event ingestion, board generation, and mission claim RPCs remain service-role-only.
- Authenticated-role JWT claims cannot invoke wallet writes or mission claims.
- A caller cannot claim another user's assignment.
- Reward snapshot tampering and incomplete boards cannot issue rewards.
- Wallet idempotency rejects a repeated key with a substituted amount or payload.
- Daily bonus requires the configured number of paid mission claims; completed-but-unclaimed missions do not qualify.
- The daily rewarded-mission cap remains enforced, while the fourth completed mission stays unpaid.
- Assignment and bonus claim replays return their original receipts without duplicate ledger credits.
- Ledger and mission claim records remain append-only.
- Wallet balances reconcile exactly to the append-only ledger.
- Disabling the economy gate blocks new wallet writes without partial state changes.
- No cross-account wallet or achievement records are created.

## Safety

The test uses synthetic Auth identities and temporary verified templates/boards. It enables the economy only inside the disposable SQL transaction, restores the singleton gate to false, and rolls back all fixture and financial rows. No hosted database, production setting, user balance, or frontend code is changed.
