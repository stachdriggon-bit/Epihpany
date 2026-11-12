# Think Lab Unified Validator Engine

Status: Word Forge, Odd One Out, Chain Reaction, and Sentence Scramble are on the unified runtime; clean-room CI verified on 2026-11-12.
Date: 2026-11-12

## Decision

Think Lab games will share one server-side session lifecycle and trust boundary. Games will not create independent authentication, guest-token, rate-limit, expiry, ordering, replay-protection, or activity-event pipelines.

The shared engine owns:
- request parsing and strict action contracts;
- authenticated identity resolution through Supabase Auth getUser;
- guest bearer creation, hashing, IP HMAC rate limiting, and guest isolation;
- session creation, expiry, active-session and recent-session limits;
- ordered question progression, retry/attempt accounting, replay and concurrency protection;
- server-only canonical question payload storage;
- session completion and exactly-once trusted activity-event emission for authenticated users;
- uniform response/error envelopes and no-store headers.

Each game owns only a trusted adapter:
- selection of a round from its private content bank;
- safe projection of prompts/options to the client;
- validation of a game-specific answer payload against the current canonical item;
- retry/advance policy where genuinely game-specific;
- game-specific feedback (answer, explanation, skill) returned only when permitted;
- an immutable event evidence builder with a fixed schema.

The engine dispatches through a compile-time allowlisted registry (`word_forge`, `odd_one_out`, `chain_reaction`, `sentence_scramble`). It must never accept a client-supplied module name, table, RPC name, validator version, event contract, or reward.

## Current-state findings

### Word Forge
- One Edge Function currently handles both guest and authenticated sessions by manually distinguishing a real user JWT from the project API key and verifying it with auth.getUser.
- Its private 72-item bank is server-side; the client receives only safe question projections.
- A dedicated private table economy_private.word_forge_validator_sessions stores the canonical 24-question round, guest-token hash or user ID, progress, attempts, and lifecycle state.
- SQL functions own ordered answer validation, three-attempt policy, expiry, locking, and authenticated completion-event emission.
- The Word Forge browser contract already waits for server confirmation before advancing/completing.
- Guest sessions do not create activity events or economy records.

### Odd One Out
- It currently uses separate authenticated and guest Edge Functions and separate start/answer RPC paths.
- It already keeps its question bank private, stores canonical round data server-side, and validates answers on the server.
- The guest path has hashed bearer tokens and IP HMAC rate limiting.
- Its client-facing answer contract is different (selected option index, with game-specific explanation/hint fields).
- The mission pipeline already consumes trusted completion events and should remain unchanged.

### Important implication
The current implementations duplicate lifecycle and trust-boundary behavior, but their game rules are not interchangeable. The shared engine must unify orchestration without flattening the adapters into a generic, weak validator.

## Target architecture

Think Lab client
  -> one validator Edge Function
  -> Auth/guest identity boundary
  -> shared session engine (create, answer, expire, complete, order, attempts, rate limits, locking, replay protection)
  -> allowlisted game adapter registry
       word_forge
       odd_one_out
       chain_reaction
       sentence_scramble
  -> private validator session storage + trusted activity event
  -> existing mission-event processor / mission assignments / claims

## Shared session contract

A session records:
- immutable session ID and game ID;
- either authenticated user ID or guest token hash + client IP HMAC (never both);
- validator/content version;
- game mode and any validated difficulty/level;
- canonical server-only question payloads and adapter state;
- current question index, attempt counters, score/evidence accumulator;
- created, expiry, last-answer and completion timestamps;
- active/completed/expired status.

All state transitions are transactional and lock the session row. A request is accepted only when:
- the session exists, is active, and has not expired;
- caller identity/token matches the session owner;
- game ID and validator version match the session;
- requested question index equals the server's current index;
- request shape contains only the fields allowed by that adapter;
- timing and retry limits pass;
- the adapter validates the answer against the canonical server-side item.

Concurrent duplicate submissions must serialize. A replay or stale index is rejected without advancing state. An idempotent retry may return a prior result only if a future explicit contract requires it; default behavior is conflict rejection.

## Guest and economy boundary

- Guest tokens are 256-bit random bearer values returned once; only hashes are stored.
- Guest IP identifiers are HMACed with a server secret.
- Guest sessions never emit activity events and never create wallets, claims, awards, or Velorn.
- Authenticated identity is derived only from verified Auth user data, never from request JSON.
- The engine emits one trusted completion event only after the full session is complete.
- The existing mission processor remains the only path from trusted activity events to mission progress.
- Economy stays disabled until the separate security audit, all test gates, and explicit user approval.

## Migration strategy

1. Extract and document shared behavior from Word Forge and Odd One Out; no gameplay changes.
2. Implement shared engine primitives and adapter interface with unit tests, initially exercised against Word Forge without switching production routing.
3. Add generic private session storage and service-role-only transactional RPCs. Keep legacy tables/RPCs available during the migration window.
4. Migrate Word Forge to the shared engine and prove guest/auth E2E, replay, rate-limit, expiry, and 24-question browser behavior.
5. Migrate Odd One Out to the same engine, preserving its level/mode and feedback contract.
6. Add Chain Reaction and Sentence Scramble as adapters only; do not add per-game session tables or Edge Functions.
7. Retire legacy Word Forge/Odd One Out session tables and RPCs only after parity tests pass and no callers remain.
8. Keep game-specific mission mappings/evaluators separate and strict; reuse the existing event processor and mission pipeline.

## Required test gates

- adapter unit tests: safe projection, private answer isolation, answer validation, retry policy, evidence schema;
- shared-engine unit tests: identity, guest token, rate limits, lifecycle, expiry, ordering, replay, concurrency, exact request fields;
- SQL assertions: RLS/FORCE RLS, service-role-only access, ownership binding, row locking, expiry, no guest events, no duplicate completion;
- Edge E2E: guest and authenticated session per game;
- browser smoke: full real UI flow and no regression in navigation/feedback;
- mission tests: trusted event progresses only its exact mapped predicate;
- full clean-room migration replay and existing CI checks.

## Non-goals

- No redesign of game UI or content.
- No rewrite of wallets, ledger, claims, mission boards, mission processor, or timezone logic.
- No economy activation as part of this refactor.
- No client-side answer keys, score authority, user IDs, reward amounts, or validator selection.

## Implementation progress

### Step 1 — shared primitive extraction (implemented; CI verification pending)
- Added supabase/functions/_shared/think-lab-validator-engine.mjs.
- Extracted shared response headers/envelope, bearer parsing, JWT classification, Auth getUser identity resolution, cryptographic SHA-256/HMAC helpers, random bearer generation, client network address extraction, strict object/key helpers, and UUID validation.
- Migrated Word Forge to consume these shared primitives without changing its RPC contract, session table, question bank, answer semantics, or client response shape.
- Added tests/think-lab-validator-engine.test.js for response headers, bearer classification, Auth identity resolution/fail-closed behavior, guest token and digest formats, network address selection, exact-key checks, and UUID validation.
- This is an incremental extraction only. The generic session lifecycle, shared database table/RPC contract, adapter registry, and Odd One Out migration are not implemented yet.
- No database migration or hosted deployment was performed. Economy remains disabled.


### Step 2 — allowlisted game adapter contract (implemented; routing migration pending)
- Added `supabase/functions/_shared/think-lab-validator-adapters.mjs` as a compile-time registry. It accepts only the built-in `word_forge`, `odd_one_out`, `chain_reaction`, and `sentence_scramble` adapters; unknown/client-injected game identifiers fail closed.
- Added per-game adapter modules. Each adapter owns its existing selection rules, canonical question construction, safe client projection, answer request validation, RPC argument mapping, and response projection.
- Word Forge now routes its start/answer validation and projection through the adapter while retaining the existing session RPCs, database table, Edge Function URL, request/response contract, retry policy, and mission event semantics.
- Added adapter contract tests covering allowlisting, contract completeness, Word Forge 24-item/private-answer behavior, Odd One Out level/mode/index-answer behavior, and Chain Reaction three-link challenge projection.
- Odd One Out still runs through its legacy authenticated and guest Edge Functions. The registry is not yet the single public runtime endpoint; guest/auth identity and lifecycle orchestration have not yet been moved into a shared database contract.
- No SQL migration, hosted deployment, Edge Function deployment, or economy activation was performed in this step.


### Step 3 — unified private session storage foundation (implemented; clean-room CI passed on 2026-11-12)
- Added additive migration `20261112203000_think_lab_unified_validator_sessions.sql`. The current allowlist also includes Chain Reaction and Sentence Scramble as documented in Steps 6 and 7 below.
- New private table `economy_private.think_lab_validator_sessions` stores both authenticated and guest sessions with mutually exclusive ownership fields, a fixed game allowlist, validator-version binding, CEFR/mode metadata, canonical server-side questions, cursor, answer history, status, expiry, and timestamps.
- New `public.velorn_start_think_lab_validator_session` RPC delegates to a service-role-only `SECURITY DEFINER` function. It validates the role from both supported JWT claim settings, rejects unknown game/version combinations, validates per-game question payload shape, enforces session lifetime and shared per-user/IP rate limits, and inserts atomically.
- Guest bearer tokens are represented only by their SHA-256 hash; guest network identity is represented only by the server HMAC. Authenticated sessions cannot carry guest credentials, and guest sessions cannot carry a user ID.
- RLS and FORCE RLS are enabled. Direct table privileges are revoked from every API role, including service_role; only the trusted definer function can mutate this storage. The public RPC itself is executable only by service_role.
- Added rollback-only Phase 5A SQL assertions for authenticated/guest creation across both games, ownership exclusivity, role/table boundaries, malformed payload rejection, and the absence of activity, wallet, ledger, or reward side effects.
- The legacy Word Forge and Odd One Out tables, Edge Functions, and RPCs are intentionally untouched. The shared answer transition and runtime cutover were pending at this phase; the later Step 5 and Step 6 entries below record the completed runtime cutover.
- No hosted migration or Edge Function deployment was performed; economy remains disabled.


### Step 4 — shared transactional answer transition (implemented; clean-room verification pending)
- Added additive migration `20261112210000_think_lab_unified_answer_transition.sql` with one service-role-only RPC for the allowlisted games.
- The transition locks the session row, verifies owner (authenticated user or guest token hash), game binding, active state, expiry, current question index, strict adapter-specific answer shape, and minimum answer pacing before changing any state.
- Word Forge retains its three-attempt retry rule and only advances after a correct answer or the third attempt. Odd One Out retains one-selection-per-question progression and its existing feedback contract.
- The session update and authenticated completion event are one transaction. The event uses each game's exact existing evidence schema and validator version; guests never emit activity events.
- Added rollback-only Phase 5B SQL assertions for retries, ordering, replay after completion, expiry, guest ownership, authenticated event evidence, and guest event isolation. The clean-room workflow runs these assertions immediately after Phase 5A.
- This is still additive infrastructure. No game route has been cut over, legacy session tables/RPCs remain intact, no hosted migration or Edge deployment was performed, and the economy remains disabled.


### Step 5 — unified Edge runtime and frontend cutover (implemented; clean-room CI passed on 2026-11-12)
- Added `supabase/functions/velorn-think-lab-validator/index.ts` as the single start/answer endpoint for the registered games. It verifies authenticated JWTs through Auth getUser, creates one-time guest bearer tokens, hashes guest credentials, applies the shared network identity boundary, and dispatches only through the adapter allowlist.
- Added Edge E2E coverage for guest/auth Word Forge and Odd One Out sessions, unknown games, client-supplied identity rejection, session ownership, event isolation, and no wallet/reward side effects.
- Cut Word Forge and Odd One Out frontend requests over to the shared endpoint without changing their answer/feedback behavior. Browser smoke now asserts both game IDs and session tokens are sent through the same endpoint.
- Legacy per-game Edge Functions, tables, and RPCs remain available for parity; no legacy cleanup has occurred.

### Step 6 — Chain Reaction adapter and three-link substate (implemented; clean-room CI passed on 2026-11-12)
- Added `chain_reaction` to the shared allowlist through `supabase/functions/velorn-chain-reaction/chain-reaction-adapter.mjs`. The adapter selects only from the approved mode-specific bank and keeps each three-link challenge as one session question (24 full-round items, not 72 top-level questions).
- The private canonical bank is bundled under `supabase/functions/velorn-chain-reaction/chain-reaction-bank.js` for the Edge runtime. The browser no longer lazy-loads or caches the answer-bearing Chain Reaction bank. It receives only challenge title/start, each link's source word, and three options; answer destinations, answer indexes, and explanations stay server-side until a correct link is accepted.
- Added `20261112220000_think_lab_chain_reaction_adapter.sql`. The existing private session table and shared RPCs now allow Chain Reaction without creating another session table or Edge Function. Each correct link is stored as a server-side substep; the challenge cursor advances only after all three links are correct. Wrong links remain retryable, do not advance state, and do not reveal the answer or explanation; their count is aggregated in the private session and included in trusted event evidence. Row locking and the existing owner/expiry/pacing checks remain shared.
- Full sessions contain 24 challenges/72 links. Daily sessions contain one deterministic challenge and are explicitly identified in event evidence as `session_type: daily`; full sessions are identified as `session_type: full`. Future mission mapping must distinguish these event scopes rather than treating a one-challenge daily session as a full round.
- Added rollback-only SQL assertions, guest/auth Edge E2E coverage (including wrong-link retry, order enforcement, answer-key isolation, daily scope, guest event isolation), adapter unit tests, Think Lab browser-smoke coverage, and lazy-loading assertions that the private bank is not shipped to the browser.
- No hosted migration, Edge Function deployment, or economy activation was performed. The economy remains disabled.

### Next implementation step
- Add Sentence Scramble as an adapter to this same session lifecycle. It must preserve the existing 24-sentence mode-specific banks and accepted-answer normalization, store canonical accepted sentences server-side, project only safe word tiles/prompts, and emit one authenticated completion event only after the full 24-item round (or an explicitly scoped one-item daily session). Do not create a separate session table, Edge Function, or reward pipeline.
