# Velorn Phase 6M — Player Dashboard and Mission Claim Integration

## Scope

Connect the signed-in EPIPHANY Home view to the trusted Velorn backend through narrow Supabase Edge Function calls. The browser never queries economy_private, chooses a user ID, computes a reward, or writes a balance.

## Delivered integration

- velorn-player-dashboard verifies the bearer token with Supabase Auth and derives the player ID from the verified user.
- The Edge Function calls the service-role-only dashboard RPC, then requests idempotent daily/weekly board generation only when the economy gate is enabled.
- A not_ready board is a normal fail-closed response; no partial board or reduced reward is fabricated.
- The read model returns balance as a decimal string, up to five recent ledger entries, current daily/weekly assignments, progress, reward snapshots, claim status, and server-derived claim eligibility.
- account.js exposes only two narrow methods: load the dashboard and claim a mission/board bonus. The raw Supabase client and service-role key are not exposed to the Velorn UI.
- Home shows wallet and mission boards only for signed-in accounts. While disabled it shows a clear inactive message and exposes no balance or reward controls.
- Assignment claims and board bonuses call the existing authenticated velorn-mission-claims Edge Function. Claim buttons appear only when the server reports canClaim=true.
- Amounts are strings to avoid JavaScript precision loss for PostgreSQL bigint balances.
- Guests retain the existing learning flow and do not receive a Velorn wallet.

## Deliberate boundaries

- Card Portal legacy local Tokens are not Velorn and are not connected to this wallet. Paid draw/upgrade paths remain outside this integration until server-side Card Portal transactions are implemented and approved.
- XP, Shards, learning progress, and Velorn remain separate resources.
- No browser-side reward calculation, starter grant, local balance import, or client-supplied user identity is added.
- No Edge Function is deployed to hosted Supabase by this phase.

## Verification

- phase6m_player_dashboard_assertions.sql checks wallet/board serialization, daily and weekly assignment projection, claim eligibility, bonus gating, cross-account isolation, role rejection, and gate restoration in a rollback-only transaction.
- velorn-dashboard-contract.test.js checks the RPC, Edge Function, browser API boundary, UI gates, and prototype Token separation.
- GitHub Actions runs the SQL assertions after Phase 6L and normal EPIPHANY unit/browser checks. The economy gate remains false.
