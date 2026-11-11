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
- Edge Functions: `velorn-odd-one-out` is active at version 7 with JWT verification enabled; `velorn-odd-one-out-guest` is active at version 5 with gateway JWT verification disabled by design because it uses a random 256-bit per-session bearer token whose SHA-256 hash is stored server-side.
- All six deployed Edge Function files (three per function: `index.ts`, `odd-one-out-bank.js`, and `odd-one-out-validator.mjs`) were compared byte-for-byte with the current repository files on 2026-11-11 and match.
- The hosted database records all six Velorn migrations. The guest session table is present, and current live-state checks found zero guest sessions, authenticated validator sessions, activity events, wallets, ledger entries, mission boards, assignments, claims, or achievement awards.
- The hosted setting remains `economy_enabled = false`; all 11 mission templates and 10 achievement definitions remain non-assignable.
- The live database contains the hardened `challenge_level` and `last_answer_at` columns and the updated start RPC signature.
- Latest live-state check: zero validator sessions, zero activity events, and `economy_enabled = false`.
- Clean-room Supabase migration replay and the Phase 3 SQL contract test passed in GitHub run `42886288805`. The test exercised private table privileges, service-only RPC access, session creation, too-fast answer rejection, server-side correctness, atomic completion event creation, replay rejection, and the absence of wallet/claim/award writes.

## Reward eligibility status

The former public answer-bank exposure has been addressed:

- The root-level public `odd-one-out-bank.js` asset is absent from the repository's deployed website root.
- The canonical answer-bearing bank exists only in the authenticated and guest Edge Function source trees; both copies are byte-identical.
- `.vercelignore` excludes the entire `supabase/` tree, and the PWA lazy loader and service worker do not load or cache the answer bank.
- Both Edge Function start responses use an explicit allow-list that excludes answer indices and explanations. Correct answers are returned only after the corresponding answer has been submitted.
- The canonical bank was rotated; the current server version is `odd-one-out-rotated-20261110-v2`.

Odd One Out now has a server-owned question bank and server-side answer evaluation. This removes the previously documented public answer-key blocker. It does not mean rewards are active: no mission predicate has been approved and mapped to this event, no claim writer or board service is enabled, and the economy remains disabled. The event is evidence for a future reviewed mapping, not a reward by itself.

Guest sessions are deliberately separate from account sessions. They use a random 256-bit bearer token, store only its hash, and are rate-limited by IP and answer pacing. Guest completions do not create trusted activity events, wallets, claims, awards, or Velorn. A guest therefore cannot inherit or spend an authenticated account's wallet.

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


## Guest play and static-asset isolation

- Odd One Out is online-only for guests and signed-in players. The browser does not load, cache, or fall back to an answer-bearing bank.
- The canonical bank stays in the private Supabase Edge Function source tree. Guest and authenticated copies are byte-identical and tested.
- Vercel excludes the entire `supabase/` tree via `.vercelignore`; Edge Functions are deployed separately.
- Signed-in sessions use `velorn-odd-one-out` and verified Auth identity. Guest sessions use `velorn-odd-one-out-guest` with a random 256-bit bearer token; only its hash is stored in the private database. The raw token remains in page memory and responses use `Cache-Control: no-store`.
- Guest sessions have per-IP and answer-pacing limits. They never write trusted activity events, mission claims, wallets, or Velorn ledger entries.
- The frontend fails closed if the network or validator is unavailable. It never switches to local questions.
- Daily Think Lab selection may include Odd One Out for guests; starting still requires the trusted online validator.


## Rotated answer bank (2026-11-10)

The original Odd One Out bank had previously been delivered to browsers as a lazy-loaded static asset. Making the repository private and removing the asset from the current Vercel deployment stops new exposure, but does not invalidate copies that players may already have downloaded.

- All 72 base questions and all 72 Challenge-mode option sets now use new outlier words absent from the former bank.
- Explanations and challenge explanations were revised alongside the rotated options.
- The bank exposes the internal version `odd-one-out-rotated-20261110-v2`; both authenticated and guest validators record the same validator version.
- The browser still receives only the safe question options. Correct indices and explanations remain server-side until each answer is submitted.


## Guest validator contract coverage (2026-11-11)

The clean-room Supabase workflow also runs `supabase/tests/phase3_guest_validator_assertions.sql`. It verifies private RLS/FORCE RLS boundaries, service-role-only RPC execution, token-hash isolation, rejection of wrong-token access, minimum answer spacing, server-side correctness, completion/replay behavior, and the absence of guest event, wallet, ledger, claim, and award writes. The economy-disabled invariant is checked in the same rollback-only test.
