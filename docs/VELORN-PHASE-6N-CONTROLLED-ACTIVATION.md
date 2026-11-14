# Velorn Phase 6N — Controlled Activation

## Status

**Prepared, not activated.** This phase is deliberately gated. The repository is not authorized to change the hosted Supabase project or deploy the Vercel application. The client gate in `velorn.js` must remain `false`, and the production economy gate must remain `economy_enabled=false` until every prerequisite below is verified and the operator explicitly authorizes the production actions.

## Verified repository-side baseline

- Phases 6A–6M have repository tests and documentation.
- The player dashboard Edge Function is configured with `verify_jwt = true`.
- The dashboard function derives the player ID from a token verified with Supabase Auth; it does not accept a client-supplied user ID.
- The browser dashboard is guarded by `CLIENT_GATE_OPEN = false`; while closed it does not invoke the dashboard endpoint or expose balances, boards, or claim controls.
- The dashboard read model fails closed while the economy setting is disabled.
- CI's Supabase reconstruction is a disposable local environment. A passing local reconstruction is not evidence of hosted-project state.
- The 6B Think Lab template versions were intentionally registered as mapped but non-assignable. They must not be made assignable merely to make a board appear.

## Mandatory activation blockers

| Gate | Required evidence | Current status |
|---|---|---|
| Production catalog | Read-only inspection of the hosted catalog confirms exactly four eligible Daily slots and three eligible Weekly slots; each selected version is verified, assignable, period-correct, and has a matching validator mapping and reward snapshot | **Not verified** — no hosted database inspection authorized/performed |
| Backup and restore | A restore drill in a separate isolated Supabase project; verify migration history, ownership isolation, ledger reconciliation, claims, and idempotent replay; preserve the source project untouched | **Not performed** |
| Edge Function deployment | Deploy `velorn-player-dashboard` and confirm Auth verification, secrets, endpoint behavior, and logs in hosted Supabase | **Not deployed** |
| Claims endpoint | Confirm the existing `velorn-mission-claims` deployment matches the reviewed source and has the required secrets/permissions | **Not verified** |
| Frontend release | Deploy the reviewed frontend only after endpoint verification; do not use an automatic Vercel deployment while deployment-rate-limit concerns remain | **Not deployed** |
| Economy activation | Explicit operator approval, a staged activation window, monitoring owner, rollback operator, and a tested immediate disable procedure | **Not authorized** |

## Controlled activation sequence

1. **Read-only production preflight:** inspect project identity, migration history, economy flag, active configuration, template versions, validator mappings, board-size/reward settings, Edge Function inventory, and current reconciliation output. Do not mutate rows or flags.
2. **Restore drill:** create/restore a separate isolated project from a supported backup/PITR point. Validate schema, account isolation, wallet-to-ledger reconciliation, reward claim integrity, and idempotent replay. Never perform the drill against the source project.
3. **Catalog approval:** prepare a reviewed, explicit list of the four Daily and three Weekly template versions. Verify each against its predicate/evaluator and evidence contract. Any missing or ambiguous mapping blocks activation; do not infer assignability from a template name.
4. **Deploy the dashboard Edge Function:** deploy only after the function source, secrets, Auth verification, and hosted migration state have been reviewed. Keep both activation gates closed.
5. **Deploy the frontend:** release the client with the gate still closed, verify sign-in/guest behavior and that no dashboard requests are made while closed.
6. **Controlled enablement:** only after a separate explicit approval, open the client gate and enable the economy in a coordinated, monitored window. Do not issue starter grants, import legacy Tokens, or backfill rewards.
7. **Smoke checks and monitoring:** verify one eligible account can load the correct boards and claim only server-authorized rewards; verify a second account cannot see or claim the first account's data; reconcile wallet balances to the append-only ledger; inspect sanitized errors and claim idempotency.
8. **Rollback:** close the client gate and set the economy flag false immediately if any invariant fails. Preserve financial history; never edit or delete wallet/ledger/claim rows. Investigate and rerun the clean-room tests before reopening.

## Stop conditions

Do not proceed to the next step if:
- the hosted project identity or migration state is uncertain;
- the economy flag is already unexpectedly enabled;
- reconciliation returns any mismatch;
- any of the seven selected templates lacks a verified evaluator/mapping or has a reward/period mismatch;
- restore verification is incomplete;
- Edge Function authentication or secrets are misconfigured;
- any cross-account isolation or idempotency check fails;
- monitoring and rollback operators are not available.

## Authorization boundary

This document and repository-side preparation do not authorize hosted database inspection, hosted database mutation, Edge Function deployment, Vercel deployment, or economy activation. Those are separate production operations and require explicit approval. Until then, `CLIENT_GATE_OPEN` stays `false` and the economy remains disabled.
