# Velorn Phase 3C — First Odd One Out Validator

## Scope and status

The first game-specific validator is Odd One Out in Think Lab. The authenticated server path is implemented and deployed. It creates server-owned challenge sessions, evaluates answers against server-held session data, and emits one validated completion event. It does not issue Velorn, assign missions, write claims, create wallets, or enable the economy.

## Server trust boundary

- The Edge Function verifies the Supabase Auth access token with `auth.getUser(token)` and derives the user ID from the verified user.
- The Edge Function gateway requires JWT verification (`verify_jwt = true`).
- The browser may submit only an action, player-selected challenge tier, training mode, session UUID, question index, and selected option index.
- The server selects questions from the reviewed canonical bank, creates a 25-minute session, and stores answer indices and explanations in the private schema.
- The start response uses an allow-list of public question fields and excludes answer indices and explanations.
- Every answer is checked under a row lock against the authenticated owner, active status, expiry, expected question index, valid four-option set, and bounded option index.
- The final answer and validated activity event are written in the same Postgres transaction. The session UUID is the idempotency key.
- A completed, expired, mismatched, or replayed session cannot create another event.

## Abuse controls

The hardening migration adds:
- a maximum of three concurrent active sessions per user;
- a maximum of ten session starts per rolling 15-minute window, serialized with a per-user advisory transaction lock;
- a minimum 700 ms interval between accepted answers;
- a 25-minute session expiry, bounded by the database to no more than 30 minutes.

These controls add friction to automated farming; they do not prove attention, comprehension, or human interaction.

## Database boundary

`economy_private.game_validator_sessions` is RLS-enabled and FORCE RLS. API roles have no direct table access. Only `service_role` receives the required table privileges and execution rights for the narrowly scoped RPC wrappers. The schema is excluded from the Data API.

The follow-up migration renames `cefr_level` to `challenge_level`. This is deliberately a player-selected practice tier, not a verified CEFR proficiency assessment. EPIPHANY's assessed level currently resides in client-side progress state and must not be used as proof for reward eligibility.

## Event contract

A successful final submission records one `think_lab / think_lab / odd_one_out / game_session_completed` event through the Phase 2 validated-event writer. Evidence is limited to the player-selected challenge tier, training mode, question count, correct count, and incorrect count. No raw answer text or profile data is stored.

## Application integration

- Signed-in players start and answer Odd One Out through `velorn-odd-one-out`; the client cannot submit a user ID, score, reward, or completion flag.
- Guest play remains on the existing local path and produces no trusted economy event.
- Browser-side XP and learning snapshots remain separate from Velorn evidence.
- If a signed-in player's secure session cannot start or an answer cannot be verified, the game does not silently fall back to a local result.

## Deployment verification

- Initial database migration: `20261110193000_velorn_odd_one_out_validator.sql`, recorded in the hosted migration ledger as `20261110192426`.
- Hardening migration: `20261110193500_velorn_odd_one_out_abuse_controls.sql`, recorded as `20261110193018`.
- Edge Function: `velorn-odd-one-out`, active version 4, with JWT verification enabled.
- The three deployed Edge Function files (`index.ts`, `odd-one-out-bank.js`, and `odd-one-out-validator.mjs`) were compared byte-for-byte with the current repository files and match.
- The live database contains the hardened `challenge_level` and `last_answer_at` columns and the updated start RPC signature.
- Latest live-state check: zero validator sessions, zero activity events, and `economy_enabled = false`.
- A clean-room SQL contract test now exercises private table privileges, service-only RPC access, session creation, too-fast answer rejection, server-side correctness, atomic completion event creation, replay rejection, and the absence of wallet/claim/award writes. The current GitHub schema-reconstruction run must pass before this phase is marked fully verified.

## Important reward limitation — not reward eligible

The root-level public `odd-one-out-bank.js` still contains answer indices because the existing guest/client game uses that bank. The Edge Function does not return those indices in its start response, but a determined player can inspect the public static asset and discover them.

Therefore this validator is **constrained**, not fully reward-grade. It reliably verifies authenticated session ownership, server-side answer evaluation, answer ordering, expiry, replay protection, bounded pacing, and atomic event recording. It does **not** prove that a player independently solved the questions.

Before any mission or achievement is mapped to this event:
1. Remove answer-bearing content from every public client asset and keep the answer key server-only, or move all evaluation paths to a server-owned challenge service.
2. Add a focused acceptance test proving no public asset or start response exposes answer keys.
3. Review event eligibility separately; validator success alone does not choose or authorize a reward.

Mission templates remain unmapped and unassignable. Reward claims remain unwritable. `economy_enabled = false`.

## Acceptance checks

- unauthenticated requests are rejected by JWT verification and explicit Auth verification;
- caller-supplied user IDs and reward fields are rejected;
- correct answers are absent from the start response;
- invalid indices and malformed session identifiers are rejected;
- answer order is enforced;
- concurrent/replayed final submissions create at most one completion event;
- expired and non-active sessions are rejected;
- rate limits and minimum answer spacing are enforced by the database;
- no wallet, ledger, claim, or achievement write occurs.
