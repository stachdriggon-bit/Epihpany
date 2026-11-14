# Velorn Phase 6N — Catalog Verification

## Scope

This phase verifies the seven selected mission template versions without enabling the economy, generating boards, creating wallets, issuing rewards, or deploying services.

## Approved catalog

| Period | Template | Version | Predicate |
|---|---|---:|---|
| Daily | Learning Step | 3 | `learning_step_think_lab_v1` |
| Daily | Try Something Different | 3 | `try_something_different_think_lab_v1` |
| Daily | Solve a Challenge | 6 | `solve_a_challenge_think_lab_v1` |
| Daily | Put Knowledge to Use | 3 | `put_knowledge_to_use_think_lab_v1` |
| Weekly | Consistent Progress | 3 | `consistent_progress_think_lab_v1` |
| Weekly | Broaden Your Experience | 3 | `broaden_your_experience_think_lab_v1` |
| Weekly | Meaningful Progress | 3 | `meaningful_progress_think_lab_v1` |

Each selected template must have four exact Think Lab activity mappings, a distinct mission family and predicate key within its board period, and a private SECURITY DEFINER evaluator executable only by `service_role`.

## Predicate distinctions

- **Put Knowledge to Use:** a fully completed 24-question round in Guided or Steady mode. The 12-question Odd One Out round and Challenge mode do not count for this practice objective.
- **Meaningful Progress:** a fully completed game-defined round in any supported training mode (12 questions for Odd One Out; 24 for the other three games). Its weekly aggregation represents a substantial multi-step milestone.
- **Solve a Challenge:** a validated completion in Challenge mode.
- Other templates retain their distinct evidence metrics: event count, different-from-last-daily-activity, distinct days, and distinct activities.

## Migration and tests

- Migration: `20261114020000_velorn_verified_mission_catalog.sql`
- Assertions: `supabase/tests/phase6n_catalog_verification_assertions.sql`
- The migration fails closed unless the seven source templates and all 28 source mapping contracts pass preflight, the successor versions do not already exist, and the postflight confirms exactly seven verified non-assignable successors with 28 verified mappings.
- Seven immutable successor versions (Learning Step v3, Try Something Different v3, Solve a Challenge v6, Put Knowledge to Use v3, and the three weekly v3 templates) and their 28 successor mappings are appended as `verified` but remain non-assignable. The original mapped versions and mappings remain unchanged.
- The SQL assertion test is rollback-only.

## Safety boundaries

- `economy_enabled` remains `false`.
- The verified successor templates remain `is_assignable = false`; board generation therefore remains unavailable until the separate controlled activation gate is explicitly completed.
- No wallet, ledger, board, assignment, claim, or award rows are created.
- No board generation is invoked.
- No Edge Function or Vercel deployment is authorized by this phase.
- The hosted catalog is not changed by this repository preparation. Apply the migration to hosted production only after the branch CI and the separate restore-drill gate are satisfied.
