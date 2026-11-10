# Velorn Phase 3C — First Trusted Game Validator: Odd One Out

## Scope

The first server-owned validator is Odd One Out in Think Lab. This phase establishes a trusted challenge lifecycle and a validated completion event. It does not issue Velorn, create wallets, assign missions, or enable the economy.

## Server trust boundary

- The Edge Function verifies the Supabase Auth access token with `auth.getUser(token)` and derives the user ID from the verified user.
- The browser may submit only an action, CEFR level, training mode, session UUID, question index, and selected option index.
- The server selects the questions from the reviewed canonical bank, creates a 25-minute session, and stores all correct indices and explanations in the private schema.
- The start response removes answer indices and explanations. Correctness and feedback are returned only after the server processes the submitted answer.
- Every answer is checked under a row lock against the authenticated owner, active status, expiry, expected question index, and bounded option index.
- The final answer and validated activity event are written in the same Postgres transaction. The session UUID is the idempotency key.
- A completed, expired, abandoned, mismatched, or replayed session cannot create another event.

## Database boundary

`economy_private.game_validator_sessions` is RLS-enabled and FORCE RLS. API roles receive no table access. Only service_role receives the table privileges and execution rights for the narrowly scoped RPC wrappers. Correct answers and session contents remain outside the Data API.

## Event contract

A successful final submission records one `think_lab / think_lab / odd_one_out / game_session_completed` event through the Phase 2 validated-event writer. Evidence is limited to CEFR level, training mode, question count, correct count, and incorrect count. No raw answer text or profile data is stored.

## Deliberate limitations

- Authenticated sessions only. Guest play remains available through the existing offline path but does not produce trusted Velorn evidence.
- This validator records completion evidence; it does not claim to prove that the player did not inspect public client assets. The server controls the answer key and completion lifecycle, while rate limits and stronger anti-abuse signals remain future hardening.
- The UI integration is a separate step and must not treat browser-side XP, scores, or local snapshots as authoritative.
- Mission mappings remain unmapped, reward claims remain unwritable, and `economy_enabled` remains false.

## Acceptance checks

- unauthenticated requests are rejected;
- caller-supplied user IDs and reward fields are rejected;
- correct answers are not present in start responses;
- invalid indices and malformed session identifiers are rejected;
- answer order is enforced;
- concurrent/replayed final submissions create at most one completion event;
- expired and non-active sessions are rejected;
- no wallet, ledger, claim, or achievement write occurs.
