# Velorn Phase 3C — First Odd One Out Validator

## Scope

The first game-specific validator is Odd One Out in Think Lab. It establishes server-owned challenge sessions and emits a validated completion event. It does not issue Velorn, assign missions, write claims, create wallets, or enable the economy.

## Server trust boundary

- The Edge Function verifies the Supabase Auth access token with `auth.getUser(token)` and derives the user ID from the verified user.
- The Edge Function requires a valid JWT at the gateway (`verify_jwt = true`).
- The browser may submit only an action, CEFR level, training mode, session UUID, question index, and selected option index.
- The server selects the questions from the reviewed canonical bank, creates a 25-minute session, and stores answer indices and explanations in the private schema.
- The start response strips answer indices and explanations. Correctness and feedback are returned only after the server processes the submitted answer.
- Every answer is checked under a row lock against the authenticated owner, active status, expiry, expected question index, and bounded option index.
- The final answer and validated activity event are written in the same Postgres transaction. The session UUID is the idempotency key.
- A completed, expired, abandoned, mismatched, or replayed session cannot create another event.

## Database boundary

`economy_private.game_validator_sessions` is RLS-enabled and FORCE RLS. API roles have no table access. Only `service_role` receives the required table privileges and execution rights for the narrowly scoped RPC wrappers. The table is in a schema excluded from the Data API.

## Event contract

A successful final submission records one `think_lab / think_lab / odd_one_out / game_session_completed` event through the Phase 2 validated-event writer. Evidence is limited to CEFR level, training mode, question count, correct count, and incorrect count. No raw answer text or profile data is stored.

## Application integration

- Signed-in players start and answer Odd One Out through `velorn-odd-one-out`; the client cannot submit a user ID, score, reward, or completion flag.
- Guest play remains on the existing local path and produces no trusted economy event.
- Browser-side XP and learning snapshots remain separate from Velorn evidence.
- If a signed-in player's secure session cannot start or an answer cannot be verified, the game does not silently fall back to a local result.

## Deployment and verification

- Migration file: `supabase/migrations/20261110193000_velorn_odd_one_out_validator.sql`.
- Hosted migration version: `20261110192426` (`velorn_odd_one_out_validator`).
- Edge Function: `velorn-odd-one-out`, active version 1, with JWT verification enabled.
- The deployed Edge Function files were compared with the current repository files and match.
- A rollback-only SQL smoke test created a two-question test session, verified a correct and an incorrect answer, completed the session, rejected a replay, and observed exactly one completion event and zero wallets. The transaction was rolled back; a follow-up query confirmed zero test users, sessions, and events persisted.
- Clean-room Supabase migration replay passed. The EPIPHANY unit suite and browser smoke tests passed on the validated application commit.

## Important anti-abuse limitation — not reward eligible yet

The public root-level `odd-one-out-bank.js` still contains answer indices because the existing guest/client game uses that bank. The Edge Function does not return those indices in its start response, but a determined player can inspect the public static asset and discover them.

Therefore this validator is trusted for authenticated session ownership, server-side answer evaluation, answer ordering, expiry, replay protection, and atomic event recording. It is **not** proof that a player independently solved the questions, and it is not yet an anti-cheat/reward-grade validator.

Before any mission or achievement is mapped to this event:
1. Remove answer-bearing content from every public client asset and keep the answer key server-only, or move all evaluation paths to a server-owned challenge service.
2. Add per-user session-start rate limits and minimum answer pacing/abuse signals.
3. Add a focused acceptance test proving that no public asset or start response exposes answer keys.
4. Review event eligibility separately; validator success alone does not choose or authorize a reward.

Mission templates remain unmapped and unassignable. Reward claims remain unwritable. `economy_enabled = false`.

## Acceptance checks

- unauthenticated requests are rejected by JWT verification and explicit Auth verification;
- caller-supplied user IDs and reward fields are rejected;
- correct answers are absent from the start response;
- invalid indices and malformed session identifiers are rejected;
- answer order is enforced;
- concurrent/replayed final submissions create at most one completion event;
- expired and non-active sessions are rejected;
- no wallet, ledger, claim, or achievement write occurs.
