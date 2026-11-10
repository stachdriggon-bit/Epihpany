# Velorn Phase 2 — Validated Events and Reward-Claim Foundation

> **Status:** Phase 2 database foundation committed to `main`; clean-room CI verification is pending. Not deployed to the hosted Supabase project. No game integration, live mission boards, reward claims, Velorn issuance, player balance reads, or economy activation is enabled.

## Scope delivered in this foundation

The migration `20261110190000_velorn_phase2_event_claim_foundation.sql` adds seven tables inside the existing non-exposed `economy_private` schema:

- `activity_events`: immutable, normalized activity evidence, tied to an Auth user, with a server-side received timestamp, validator version, stable source event key, experience/activity identity, event type, and bounded evidence JSON.
- `mission_template_versions`: versioned daily/weekly mission definitions with reward snapshots and explicit validator-mapping status.
- `achievement_definitions`: versioned achievement/stage definitions with reward snapshots and explicit validator-mapping status.
- `mission_boards`: immutable per-user period assignments, including period boundaries, timezone, and configuration/template-bank versions.
- `mission_assignments`: stable board slots, objective/reward snapshots, progress state, completion state, and replacement lineage.
- `mission_reward_claims`: one-time claim identities for either an individual assignment or a board completion bonus, with the eventual ledger-entry reference.
- `achievement_awards`: one-time achievement/stage identities and the eventual ledger-entry reference.

All seven tables have RLS enabled and forced. No API role has direct table privileges. Event, definition, board, claim, and award history is append-only. The existing private-schema boundary and service-role-only server pattern are preserved.

## Trusted event ingestion contract

The migration adds one narrow RPC:

- `public.economy_record_validated_activity_event(...)`

It is executable only by `service_role`; the private implementation independently verifies the trusted JWT role claim. The caller supplies the authenticated user ID from its verified server context, never from an untrusted client assertion.

The RPC validates required identifiers, field lengths, JSON object type and size, and stable event identity. The unique key `(user_id, source_event_key)` makes retries idempotent. Reusing that key with a different payload is rejected. Accepted evidence cannot be updated or deleted.

**Important trust boundary:** this RPC is an ingestion boundary for a result that has already been validated by a trusted server-side game validator. It does not prove that a browser-reported answer or score is true. A service-role caller must not forward raw client completion claims as validated evidence.

## Approved reward definitions preserved

The source of truth for product values remains `WORLD_CURRENCY_VELORN.md`:

- Daily board: four choices, first three eligible completed missions pay 10 Velorn each, plus a 10 Velorn completion bonus; maximum 40 per daily period.
- Weekly board: three missions at 20 Velorn each, plus a 40 Velorn completion bonus; maximum 100 per weekly period.
- Achievement rewards remain additional: 25 / 50 / 100 / 200 Velorn by the approved milestone tier.
- The approved daily and weekly mission banks and achievement catalogue remain the canonical content definitions.

The migration seeds all 11 approved daily/weekly mission templates and all 10 approved achievement definitions as version 1 records. Their approved reward values and objective descriptions are preserved, but every record remains `unmapped` and `is_assignable = false`. They cannot be activated unless their server-side validator mapping is explicitly `verified`. No mission is assigned by this foundation.

## Deliberately not enabled

- No Edge Function has been deployed.
- No browser/PWA code has been changed and no client can submit directly to the private RPC.
- No raw answer text, story content, email, or unrelated profile data is stored in the event evidence.
- No mission board is generated or exposed.
- No claim or achievement-award writer is exposed.
- No Velorn credit is issued; the existing wallet writer still rejects transactions while `economy_enabled = false`.
- No wallet is created, no player balance is exposed, and no local prototype balance is imported.
- No timezone/reset boundary is selected on behalf of the product.

## Required remaining Phase 2 work before claims can be paid

1. **Validator registry:** map each eligible game/experience to a server-owned validator version and stable event schema. Each validator must establish the user from verified Auth context, verify a real completion against authoritative or server-issued evidence, enforce replay/rate/timing rules, and call the trusted ingestion RPC only after validation.
2. **Evidence coverage:** classify every game/activity as fully server-verifiable, constrained-client-result, or unverified/offline-only. Constrained results must have explicitly limited eligibility; unverified results cannot earn Velorn.
3. **Mission predicate mappings:** implement and test each approved daily/weekly objective against normalized event facts. Do not activate a template until its mapping status is verified and it can be fairly completed.
4. **Achievement predicate mappings:** implement stable permanent/stage/case identities and distinct-progress counting. Case Closed must use a distinct stable case ID; repeated sessions cannot create a second award for the same case.
5. **Board service:** implement server-side eligible-template filtering, rotation/fairness, immutable board creation, four daily slots / three weekly slots, replacement lineage, and period stability.
6. **Period policy:** resolve the account timezone source and fallback, daily reset boundary, week-start rule, daylight-saving behavior, and timezone-change handling. The schema stores the timezone and UTC boundaries for each board; it does not guess them.
7. **Atomic claim service:** lock the assignment/award identity, create the claim and call the Phase 1 wallet transaction in one database transaction. A retry must return the original claim; concurrent claims must not double-pay. Mission bonus claims must be independently idempotent and enforce the 40/100 period caps.
8. **Tests:** exercise valid and invalid validators, forged IDs, duplicate/mismatched event keys, event replays, cross-user access, board races, replacement lineage, concurrent claims, claim/ledger atomic rollback, daily/weekly caps, achievement uniqueness, and economy-disabled rejection.
9. **Operational review:** run security/performance advisors and production post-deployment checks after CI passes. Keep economy disabled throughout.

## Verification gate

The clean-room workflow now includes `supabase/tests/phase2_event_claim_assertions.sql`, covering private-table RLS/privileges, service-role-only event ingestion, idempotent event replay, mismatched-payload rejection, append-only event evidence, the complete 11-template / 10-achievement seed bank with inactive status, and disabled economy state.

The migration must not be applied to hosted Supabase until the complete clean-room GitHub Actions run passes. This phase-2 foundation is additive and has no website dependency. After deployment, verify all seven tables are private, no API role has direct table access, the RPC is service-role-only, `economy_enabled` remains false, and wallet/ledger/claim/award/board tables remain empty.

## Safety rule

A validated event is evidence, not a reward. The central mission/achievement engine decides whether that evidence satisfies a versioned objective; the wallet ledger remains the only authority for Velorn balance changes. No game, browser, local storage value, or client-supplied reward amount may bypass that chain.
