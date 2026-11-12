# Think Lab Unified Validator Engine

Status: approved implementation direction; design extraction in progress.
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

The engine dispatches through a compile-time allowlisted registry. It must never accept a client-supplied module name, table, RPC name, validator version, event contract, or reward.

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

### Step 1 — shared primitive extraction (started)
- Added supabase/functions/_shared/think-lab-validator-engine.mjs.
- Extracted shared response headers/envelope, bearer parsing, JWT classification, Auth getUser identity resolution, cryptographic SHA-256/HMAC helpers, random bearer generation, client network address extraction, strict object/key helpers, and UUID validation.
- Migrated Word Forge to consume these shared primitives without changing its RPC contract, session table, question bank, answer semantics, or client response shape.
- Added tests/think-lab-validator-engine.test.js for response headers, bearer classification, Auth identity resolution/fail-closed behavior, guest token and digest formats, network address selection, exact-key checks, and UUID validation.
- This is an incremental extraction only. The generic session lifecycle, shared database table/RPC contract, adapter registry, and Odd One Out migration are not implemented yet.
- No database migration or hosted deployment was performed. Economy remains disabled.
