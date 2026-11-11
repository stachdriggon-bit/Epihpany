-- Velorn Phase 4G: verify the first real mission predicate end-to-end.
-- Historical v1/v2 definitions remain immutable; v3 is the first assignable version.
-- The economy stays disabled and the available pool remains intentionally incomplete.

DO $phase4g_preflight$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM economy_private.mission_template_versions
    WHERE template_id = 'solve_a_challenge'
      AND template_version = 2
      AND validator_mapping_status = 'mapped'
      AND NOT is_assignable
  ) THEN
    RAISE EXCEPTION 'Expected the reviewed Odd One Out template version 2';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM economy_private.mission_event_predicate_mappings
    WHERE template_id = 'solve_a_challenge'
      AND template_version = 2
      AND predicate_version = 1
      AND predicate_key = 'solve_a_challenge_odd_one_out_v1'
      AND mapping_status = 'mapped'
  ) THEN
    RAISE EXCEPTION 'Expected the reviewed Odd One Out predicate mapping';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE template_id = 'solve_a_challenge' AND template_version = 3
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE template_id = 'solve_a_challenge'
      AND template_version = 3
      AND predicate_version = 2
  ) THEN
    RAISE EXCEPTION 'Phase 4G target version already exists; refusing ambiguous replay';
  END IF;
END;
$phase4g_preflight$;

-- Do not mutate the immutable mapped records. Add a verified successor version.
INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family,
  reward_amount, objective_definition, validator_mapping_status, is_assignable
)
SELECT
  template_id,
  3,
  period_type,
  mission_family,
  reward_amount,
  objective_definition || jsonb_build_object(
    'verification_note',
    'Verified against the deployed server-owned Odd One Out Challenge validator and the Phase 4G end-to-end event-to-assignment test.'
  ),
  'verified',
  true
FROM economy_private.mission_template_versions
WHERE template_id = 'solve_a_challenge'
  AND template_version = 2;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type,
  validator_version, mapping_status, predicate_definition
)
SELECT
  template_id,
  3,
  2,
  predicate_key,
  source_system,
  experience_id,
  activity_id,
  event_type,
  validator_version,
  'verified',
  predicate_definition || jsonb_build_object(
    'verification_phase', '4G',
    'verification_scope', 'deployed_authenticated_odd_one_out_validator_to_assignment_progress'
  )
FROM economy_private.mission_event_predicate_mappings
WHERE template_id = 'solve_a_challenge'
  AND template_version = 2
  AND predicate_version = 1;

DO $phase4g_postflight$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM economy_private.mission_template_versions t
    JOIN economy_private.mission_event_predicate_mappings m
      ON m.template_id = t.template_id
     AND m.template_version = t.template_version
    WHERE t.template_id = 'solve_a_challenge'
      AND t.template_version = 3
      AND t.validator_mapping_status = 'verified'
      AND t.is_assignable
      AND m.predicate_version = 2
      AND m.predicate_key = 'solve_a_challenge_odd_one_out_v1'
      AND m.mapping_status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Phase 4G verified successor records were not created';
  END IF;

  IF (SELECT economy_enabled
      FROM economy_private.economy_settings
      WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 4G must not enable the economy';
  END IF;
END;
$phase4g_postflight$;

COMMENT ON FUNCTION economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid) IS
  'Verified in Phase 4G against the deployed authenticated Odd One Out validator and the real event-trigger-to-assignment progress path. Challenge completion has no accuracy threshold.';
