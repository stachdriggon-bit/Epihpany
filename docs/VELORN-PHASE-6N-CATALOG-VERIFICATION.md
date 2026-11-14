# Velorn Phase 6N — Catalog Verification

## Scope

This phase verifies the seven selected mission template versions without enabling the economy, generating boards, creating wallets, issuing rewards, or deploying services.

## Approved catalog

| Period | Template | Version | Predicate |
|---|---|---:|---|
| Daily | Learning Step | 2 | `learning_step_think_lab_v1` |
| Daily | Try Something Different | 2 | `try_something_different_think_lab_v1` |
| Daily | Solve a Challenge | 5 | `solve_a_challenge_think_lab_v1` |
| Daily | Put Knowledge to Use | 2 | `put_knowledge_to_use_think_lab_v1` |
| Weekly | Consistent Progress | 2 | `consistent_progress_think_lab_v1` |
| Weekly | Broaden Your Experience | 2 | `broaden_your_experience_think_lab_v1` |
| Weekly | Meaningful Progress | 2 | `meaningful_progress_think_lab_v1` |

Each selected template must have four exact Think Lab activity mappings, a distinct mission family and predicate key within its board period, and a private SECURITY DEFINER evaluator executable only by `service_role`.

## Predicate distinctions

- **Put Knowledge to Use:** a fully completed 24-question round in Guided or Steady mode. Challenge mode does not count for this practice objective.
- **Meaningful Progress:** a fully completed 24-question round in any supported training mode. Its weekly aggregation represents a substantial multi-step milestone.
- **Solve a Challenge:** a validated completion in Challenge mode.
- Other templates retain their distinct evidence metrics: event count, different-from-last-daily-activity, distinct days, and distinct activities.

## Migration and tests

- Migration: `20261114020000_velorn_verified_mission_catalog.sql`
- Assertions: `supabase/tests/phase6n_catalog_verification_assertions.sql`
- The migration fails closed unless exactly four daily and three weekly templates and all 28 mapping contracts pass its preflight.
- Only the seven explicitly listed versions and their 28 mappings are promoted to `verified`; no other template is changed.
- The SQL assertion test is rollback-only.

## Safety boundaries

- `economy_enabled` remains `false`.
- No wallet, ledger, board, assignment, claim, or award rows are created.
- No board generation is invoked.
- No Edge Function or Vercel deployment is authorized by this phase.
- The hosted catalog is not changed by this repository preparation. Apply the migration to hosted production only after the branch CI and the separate restore-drill gate are satisfied.
