-- Phase 6N catalog verification assertions. Transaction is rolled back.
BEGIN;
SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);
DO $phase6n$
DECLARE
  v_daily integer;
  v_weekly integer;
  v_verified_templates integer;
  v_assignable_templates integer;
  v_verified_mappings integer;
BEGIN
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6N tests require economy disabled';
  END IF;

  SELECT count(*) FILTER (WHERE period_type='daily'),
         count(*) FILTER (WHERE period_type='weekly'),
         count(*) FILTER (WHERE validator_mapping_status='verified'),
         count(*) FILTER (WHERE is_assignable)
  INTO v_daily,v_weekly,v_verified_templates,v_assignable_templates
  FROM economy_private.mission_template_versions
  WHERE (template_id,template_version) IN (
    ('learning_step',3),('try_something_different',3),('solve_a_challenge',6),
    ('put_knowledge_to_use',3),('consistent_progress',3),
    ('broaden_your_experience',3),('meaningful_progress',3)
  );

  SELECT count(*) INTO v_verified_mappings
  FROM economy_private.mission_event_predicate_mappings
  WHERE (template_id,template_version) IN (
    ('learning_step',3),('try_something_different',3),('solve_a_challenge',6),
    ('put_knowledge_to_use',3),('consistent_progress',3),
    ('broaden_your_experience',3),('meaningful_progress',3)
  ) AND mapping_status='verified';

  IF (v_daily,v_weekly,v_verified_templates,v_assignable_templates,v_verified_mappings)
     IS DISTINCT FROM (4,3,7,0,28) THEN
    RAISE EXCEPTION 'Catalog verification mismatch: daily %, weekly %, verified templates %, assignable templates %, mappings %',
      v_daily,v_weekly,v_verified_templates,v_assignable_templates,v_verified_mappings;
  END IF;

  -- Exercise the approved semantic distinction against server-owned event evidence.
  INSERT INTO auth.users (
    id,aud,role,email,encrypted_password,email_confirmed_at,
    raw_app_meta_data,raw_user_meta_data,created_at,updated_at
  ) VALUES (
    'f6d00000-0000-4000-8000-000000000001',
    'authenticated','authenticated','velorn-phase6n@example.invalid','',now(),
    '{}'::jsonb,'{}'::jsonb,now(),now()
  );

  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    'f6d00000-0000-4000-8000-000000000011',
    'f6d00000-0000-4000-8000-000000000001',
    'f6d00000-0000-4000-8000-000000000111',
    'think_lab','think_lab','word_forge','game_session_completed',
    clock_timestamp()-interval '2 minutes',clock_timestamp(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":24,"correct_count":22,"incorrect_count":2}'::jsonb
  ),
  (
    'f6d00000-0000-4000-8000-000000000012',
    'f6d00000-0000-4000-8000-000000000001',
    'f6d00000-0000-4000-8000-000000000112',
    'think_lab','think_lab','word_forge','game_session_completed',
    clock_timestamp()-interval '1 minute',clock_timestamp(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"challenge","question_count":24,"correct_count":20,"incorrect_count":4}'::jsonb
  ),
  (
    'f6d00000-0000-4000-8000-000000000013',
    'f6d00000-0000-4000-8000-000000000001',
    'f6d00000-0000-4000-8000-000000000113',
    'think_lab','think_lab','odd_one_out','game_session_completed',
    clock_timestamp()-interval '30 seconds',clock_timestamp(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  );

  IF economy_private.is_valid_think_lab_practice_round_v1('f6d00000-0000-4000-8000-000000000011') IS DISTINCT FROM true
     OR economy_private.is_valid_think_lab_practice_round_v1('f6d00000-0000-4000-8000-000000000012') IS DISTINCT FROM false
     OR economy_private.is_valid_think_lab_practice_round_v1('f6d00000-0000-4000-8000-000000000013') IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Put Knowledge to Use must accept only full 24-question Guided/Steady rounds';
  END IF;

  IF economy_private.evaluate_meaningful_progress_think_lab_v1('f6d00000-0000-4000-8000-000000000012') IS DISTINCT FROM true
     OR economy_private.evaluate_meaningful_progress_think_lab_v1('f6d00000-0000-4000-8000-000000000013') IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Meaningful Progress must accept full rounds in any supported mode, including the 12-question Odd One Out round';
  END IF;

  IF has_function_privilege('anon','economy_private.is_valid_think_lab_practice_round_v1(uuid)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.is_valid_think_lab_practice_round_v1(uuid)','EXECUTE')
     OR NOT has_function_privilege('service_role','economy_private.is_valid_think_lab_practice_round_v1(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'Practice-round evaluator privilege boundary is invalid';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='economy_private'
      AND p.proname='evaluate_put_knowledge_to_use_think_lab_v1'
      AND p.prosecdef AND p.proconfig @> ARRAY['search_path=""']
  ) THEN
    RAISE EXCEPTION 'Put Knowledge to Use evaluator must be SECURITY DEFINER with empty search_path';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE (template_id,template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    ) AND (validator_mapping_status <> 'mapped' OR is_assignable)
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE (template_id,template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    ) AND mapping_status <> 'mapped'
  ) THEN
    RAISE EXCEPTION 'Original immutable source versions must remain mapped and non-assignable';
  END IF;

  -- The production economy gate and all financial records remain untouched.
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Catalog verification must not enable the economy';
  END IF;
END;
$phase6n$;
ROLLBACK;
