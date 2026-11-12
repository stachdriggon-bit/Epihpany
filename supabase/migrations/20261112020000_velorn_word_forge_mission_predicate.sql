-- Velorn Phase 4I: Word Forge Challenge mission predicate.
-- This adds an immutable mapped successor only. It is intentionally NOT verified
-- or assignable until its full event-to-assignment path passes clean-room CI.

DO $phase4i_preflight$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE template_id='solve_a_challenge' AND template_version=3
      AND validator_mapping_status='verified' AND is_assignable
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE template_id='solve_a_challenge' AND template_version=3
      AND predicate_version=2
      AND predicate_key='solve_a_challenge_odd_one_out_v1'
      AND mapping_status='verified'
  ) THEN
    RAISE EXCEPTION 'The verified Odd One Out challenge successor is required before Word Forge';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE template_id='solve_a_challenge' AND template_version=4
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE template_id='solve_a_challenge' AND template_version=4
  ) THEN
    RAISE EXCEPTION 'Word Forge successor already exists; refusing ambiguous replay';
  END IF;
END;
$phase4i_preflight$;

-- Keep the challenge mission family unique on generated boards. Version 4 has
-- its own exact predicate snapshot so Word Forge cannot be mistaken for OOO.
INSERT INTO economy_private.mission_template_versions (
  template_id,template_version,period_type,mission_family,reward_amount,
  objective_definition,validator_mapping_status,is_assignable
)
SELECT
  template_id,4,period_type,mission_family,reward_amount,
  objective_definition || jsonb_build_object(
    'predicate_key','solve_a_challenge_word_forge_v1',
    'predicate_scope','word_forge_challenge_mode',
    'mapping_note','A complete 24-question server-validated Word Forge session in Challenge mode; no accuracy threshold is imposed.'
  ),
  'mapped',false
FROM economy_private.mission_template_versions
WHERE template_id='solve_a_challenge' AND template_version=3;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id,template_version,predicate_version,predicate_key,
  source_system,experience_id,activity_id,event_type,validator_version,
  mapping_status,predicate_definition
)
VALUES (
  'solve_a_challenge',4,3,'solve_a_challenge_word_forge_v1',
  'think_lab','think_lab','word_forge','game_session_completed',
  'word-forge-reviewed-72-20261111-v1','mapped',
  '{
    "requires_training_mode":"challenge",
    "question_count":24,
    "evidence_keys":["training_mode","question_count","correct_count","incorrect_count"],
    "count_invariant":"correct_count + incorrect_count = 24",
    "accuracy_threshold":null,
    "completion_source":"server_owned_word_forge_session"
  }'::jsonb
);

CREATE OR REPLACE FUNCTION economy_private.evaluate_solve_a_challenge_word_forge_v1(
  p_event_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event economy_private.activity_events%ROWTYPE;
  v_question_count integer;
  v_correct_count integer;
  v_incorrect_count integer;
BEGIN
  IF COALESCE(
       NULLIF(current_setting('request.jwt.claim.role',true),''),
       NULLIF(current_setting('request.jwt.claims',true),'')::jsonb ->> 'role'
     ) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission predicate evaluation requires the trusted server role.'
      USING ERRCODE='42501';
  END IF;
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'A validated activity event is required.'
      USING ERRCODE='22023';
  END IF;

  SELECT e.* INTO v_event
  FROM economy_private.activity_events e
  WHERE e.event_id=p_event_id;
  IF NOT FOUND THEN RETURN false; END IF;

  IF v_event.source_system IS DISTINCT FROM 'think_lab'
     OR v_event.experience_id IS DISTINCT FROM 'think_lab'
     OR v_event.activity_id IS DISTINCT FROM 'word_forge'
     OR v_event.event_type IS DISTINCT FROM 'game_session_completed'
     OR v_event.validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
     OR v_event.occurred_at > v_event.received_at
     OR jsonb_typeof(v_event.evidence) IS DISTINCT FROM 'object'
     OR (v_event.evidence - ARRAY[
       'training_mode','question_count','correct_count','incorrect_count'
     ]) <> '{}'::jsonb
     OR NOT (v_event.evidence ?& ARRAY[
       'training_mode','question_count','correct_count','incorrect_count'
     ])
     OR jsonb_typeof(v_event.evidence->'training_mode') IS DISTINCT FROM 'string'
     OR jsonb_typeof(v_event.evidence->'question_count') IS DISTINCT FROM 'number'
     OR jsonb_typeof(v_event.evidence->'correct_count') IS DISTINCT FROM 'number'
     OR jsonb_typeof(v_event.evidence->'incorrect_count') IS DISTINCT FROM 'number'
     OR (v_event.evidence->>'question_count') !~ '^[0-9]{1,2}$'
     OR (v_event.evidence->>'correct_count') !~ '^[0-9]{1,2}$'
     OR (v_event.evidence->>'incorrect_count') !~ '^[0-9]{1,2}$' THEN
    RETURN false;
  END IF;

  v_question_count := (v_event.evidence->>'question_count')::integer;
  v_correct_count := (v_event.evidence->>'correct_count')::integer;
  v_incorrect_count := (v_event.evidence->>'incorrect_count')::integer;

  RETURN v_event.evidence->>'training_mode'='challenge'
    AND v_question_count=24
    AND v_correct_count BETWEEN 0 AND 24
    AND v_incorrect_count BETWEEN 0 AND 24
    AND v_correct_count+v_incorrect_count=24;
END;
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)
  FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)
  TO service_role;

DO $phase4i_postflight$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE template_id='solve_a_challenge' AND template_version=4
      AND validator_mapping_status='mapped' AND NOT is_assignable
      AND objective_definition->>'predicate_key'='solve_a_challenge_word_forge_v1'
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE template_id='solve_a_challenge' AND template_version=4
      AND predicate_version=3
      AND predicate_key='solve_a_challenge_word_forge_v1'
      AND mapping_status='mapped'
  ) THEN
    RAISE EXCEPTION 'Word Forge must remain mapped and non-assignable';
  END IF;
  IF has_function_privilege('anon','economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)','EXECUTE')
     OR NOT has_function_privilege('service_role','economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'Word Forge evaluator must be service-role-only';
  END IF;
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 4I must not enable the economy';
  END IF;
END;
$phase4i_postflight$;

COMMENT ON FUNCTION economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid) IS
  'Mapped but not yet verified. Accepts only a complete 24-question server-validated Word Forge Challenge session; no accuracy threshold.';
