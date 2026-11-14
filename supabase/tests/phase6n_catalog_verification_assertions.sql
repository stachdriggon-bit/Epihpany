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
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  );

  SELECT count(*) INTO v_verified_mappings
  FROM economy_private.mission_event_predicate_mappings
  WHERE (template_id,template_version) IN (
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  ) AND mapping_status='verified';

  IF (v_daily,v_weekly,v_verified_templates,v_assignable_templates,v_verified_mappings)
     IS DISTINCT FROM (4,3,7,7,28) THEN
    RAISE EXCEPTION 'Catalog verification mismatch: daily %, weekly %, verified templates %, assignable %, mappings %',
      v_daily,v_weekly,v_verified_templates,v_assignable_templates,v_verified_mappings;
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

  -- The production economy gate and all financial records remain untouched.
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Catalog verification must not enable the economy';
  END IF;
END;
$phase6n$;
ROLLBACK;
