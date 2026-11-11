# Velorn Phase 4F — Safe Mission Board Generation

## Scope

Phase 4F adds server-side mission board generation and extends the trusted progress processor to dispatch newly implemented predicates safely. It does not activate the economy, expose a player API, deploy an Edge Function, or change the PWA.

## Generation contract

- Entry point: `public.economy_generate_mission_board(user_id, period_type, reference)`.
- The function is SECURITY DEFINER, has an empty search path, verifies the service-role JWT claim, and is executable only by `service_role`.
- It refuses to create boards while `economy_enabled = false`.
- It uses the Phase 4C resolver for account timezone, UTC boundaries, local daily keys, and Saturday-anchored weekly periods.
- It snapshots the active configuration version and approved template-bank version (1).
- Daily boards require four slots with 10 Velorn reward snapshots; weekly boards require three slots with 20 Velorn snapshots.
- A template is eligible only when it is `verified` and assignable, its exact predicate mapping is `verified`, and its evaluator exists as a private SECURITY DEFINER boolean function executable only by `service_role`.
- A board cannot repeat a mission family or predicate key. Selection is deterministic for the player and period.
- If the complete eligible pool is unavailable, the function returns `not_ready` and creates neither a board nor partial assignments.
- The unique user/period key and row locking make retries and concurrent generation idempotent. Existing complete boards are returned unchanged; inconsistent partial boards fail closed.
- Objective and reward values are copied into assignment snapshots. Client-supplied amounts, template IDs, user IDs, or slot contents are never accepted.

## Extensible trusted predicate dispatch

Phase 4E initially used a hard-coded single-predicate dispatch. Phase 4F replaces that switch with a constrained dynamic dispatcher. It derives the evaluator name only from a verified predicate key, and will invoke it only when the matching function is a private SECURITY DEFINER boolean evaluator with execute permission granted to `service_role` and denied to `anon` and `authenticated`. Missing, unsafe, or unknown evaluators fail closed. This allows later verified mission predicates to join the same trusted progress pipeline without weakening its access boundary.

## Current production readiness

The approved mission bank currently has 11 version-1 definitions. The only additional predicate mapping is `solve_a_challenge v2`, and it remains `mapped` rather than `verified`; all other templates are `unmapped`. Therefore the current eligible pool is empty. This is intentional: Phase 4F returns `not_ready` for both daily and weekly requests and does not create empty or duplicate-filled boards.

The first verified predicate cannot fill either board by itself. Before player-facing boards can be enabled, the project must implement and verify enough distinct daily and weekly predicates to fill four daily slots and three weekly slots.

## Verification

The rollback-only Phase 4F test checks:

- service-role-only access and the disabled-economy gate;
- no-op `not_ready` results with the current inactive production catalogue;
- temporary verified template/mapping/evaluator fixtures;
- exactly four daily and three weekly assignments;
- distinct slot, mission-family, and predicate snapshots;
- approved reward snapshots (10 daily / 20 weekly);
- idempotent repeat generation;
- exclusion of the mapped-but-unverified Odd One Out template;
- dynamic predicate dispatch and progress application;
- no wallet, ledger, reward claim, or achievement writes.

The test temporarily enables the economy and inserts fixtures only inside a transaction that always rolls back. Production remains disabled and no player boards are created by this migration.
