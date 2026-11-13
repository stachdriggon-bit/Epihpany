# Velorn Phase 6H — Concurrent Claims on Generated Boards

## Scope

Phase 6H exercises the Phase 6G generated-board claim lifecycle from independent PostgreSQL sessions. It targets the concurrency guarantee documented in Phase 4A: the board row lock must serialize claims that compete for a board's reward limit, while retries of one assignment or bonus must resolve to the same paid claim.

## Test design

The clean-room workflow first commits isolated fixtures for one test player: a generated four-slot daily board and a generated three-slot weekly board, both completed through the trusted Think Lab event pipeline. It then opens independent `psql` sessions to create real overlap between claim calls.

The test verifies:

- Two simultaneous claims for the same daily assignment both return successfully, but create only one claim and one ledger credit.
- After two daily assignments have been paid, two different completed assignments race for the final daily reward slot. Exactly one succeeds; the other is rejected by the three-claim cap.
- Two simultaneous daily completion-bonus requests both return successfully and do not duplicate the bonus.
- All three weekly assignments can be claimed, and the weekly completion bonus remains payable.
- Final generated-board totals are exactly 140 Velorn, eight paid claims, and eight ledger entries: three daily claims, one daily bonus, three weekly claims, and one weekly bonus.
- The economy flag is restored to disabled even if the workflow step fails.

## Isolation and safety

The fixtures use a dedicated test user and stable Phase 6H IDs in the disposable local Supabase stack. Unlike the rollback-only Phase 6G assertion, this concurrency test commits setup data so independent database sessions can observe the same boards and race against the same rows. The workflow uses an EXIT trap to disable the economy flag and verifies that it is false after successful claims. The database is rebuilt from scratch for each workflow run; no hosted Supabase project is touched.

This phase changes no migration, hosted database, Edge Function, frontend, player balance API, or production economy setting. It does not authorize live reward activation.

## Verification

The workflow runs `supabase/tests/phase6h_generated_board_concurrency_setup.sql` to prepare the completed generated boards, then runs concurrent claim requests in separate `psql` processes and checks the final claim/ledger totals. It runs near the end of the clean-room schema job after other economy assertions, because its committed fixtures intentionally remain in the disposable test database.
