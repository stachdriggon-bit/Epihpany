# Velorn Phase 6I — Concurrent Mission Board Generation

## Scope

Verify that simultaneous requests to generate the same user's daily or weekly board converge on one stable board and one complete assignment set.

## Test design

The clean-room workflow creates an isolated account and verified test-only template/mapping copies, then launches two independent PostgreSQL sessions for the same daily period and two for the same weekly period. The requests overlap intentionally.

The test requires:

- Both daily calls succeed and return the same board ID.
- Exactly one daily call reports `created`; the other reports `existing`.
- Both weekly calls succeed and return the same board ID, with one `created` and one `existing`.
- The daily board contains exactly four assignments and the weekly board exactly three.
- Exactly two boards and seven assignments exist for the test account.
- A subsequent retry returns the same board IDs and complete assignment counts.
- No wallet, ledger, reward claim, or achievement award is created by board generation.
- The economy gate is restored to disabled, including on workflow failure.

## Isolation and safety

Only the disposable local Supabase stack is used. The test account and test catalog copies are isolated under Phase 6I identifiers. The workflow uses an EXIT trap to disable the economy gate. No migration, hosted database, Edge Function, frontend, or production economy setting is changed.

## Verification

The setup SQL commits the isolated account and verified test candidates so independent sessions can race against the same period identity. The workflow then runs concurrent daily and weekly generator requests, compares returned board identities/statuses, checks completeness and absence of financial side effects, disables the gate, and verifies the final state.
