-- Phase 6N catalog verification: prove evaluator contracts before making the seven
-- approved mission versions assignable. Append-only; never edits prior migrations.
BEGIN;

CREATE OR REPLACE FUNCTION economy_private.is_valid_think_lab_practice_round_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, true)
     AND EXISTS (
       SELECT 1
       FROM economy_private.activity_events AS e
       WHERE e.event_id = p_event_id
         AND e.evidence ->> 'training_mode' IN ('guided', 'steady')
     );
$function$;

REVOKE ALL ON FUNCTION economy_private.is_valid_think_lab_practice_round_v1(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION economy_private.is_valid_think_lab_practice_round_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_put_knowledge_to_use_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT economy_private.is_valid_think_lab_practice_round_v1(p_event_id);
$function$;

REVOKE ALL ON FUNCTION economy_private.evaluate_put_knowledge_to_use_think_lab_v1(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_put_knowledge_to_use_think_lab_v1(uuid) TO service_role;

DO $phase6n_catalog_preflight$
DECLARE
  v_daily integer;
  v_weekly integer;
  v_templates integer;
  v_mappings integer;
  v_bad integer;
  v_target_templates integer;
  v_target_mappings integer;
BEGIN
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6N catalog verification requires the production economy gate to remain disabled';
  END IF;

  SELECT count(*) FILTER (WHERE period_type='daily'),
         count(*) FILTER (WHERE period_type='weekly'),
         count(*)
    INTO v_daily,v_weekly,v_templates
  FROM economy_private.mission_template_versions
  WHERE (template_id,template_version) IN (
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  );

  IF v_templates <> 7 OR v_daily <> 4 OR v_weekly <> 3 THEN
    RAISE EXCEPTION 'Expected exactly seven selected templates (4 daily, 3 weekly); got total %, daily %, weekly %',
      v_templates,v_daily,v_weekly;
  END IF;

  SELECT count(*) INTO v_mappings
  FROM economy_private.mission_event_predicate_mappings
  WHERE (template_id,template_version) IN (
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  );

  IF v_mappings <> 28 OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE (template_id,template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    ) AND mapping_status <> 'mapped'
  ) THEN
    RAISE EXCEPTION 'Expected exactly 28 immutable mapped Think Lab records; found % or an unexpected status',v_mappings;
  END IF;

  -- The approved source versions and their mappings are immutable. Verification
  -- must be represented by new successor versions, never UPDATE/DELETE.
  SELECT count(*) INTO v_target_templates
  FROM economy_private.mission_template_versions
  WHERE (template_id,template_version) IN (
    ('learning_step',3),('try_something_different',3),('solve_a_challenge',6),
    ('put_knowledge_to_use',3),('consistent_progress',3),
    ('broaden_your_experience',3),('meaningful_progress',3)
  );
  SELECT count(*) INTO v_target_mappings
  FROM economy_private.mission_event_predicate_mappings
  WHERE (template_id,template_version) IN (
    ('learning_step',3),('try_something_different',3),('solve_a_challenge',6),
    ('put_knowledge_to_use',3),('consistent_progress',3),
    ('broaden_your_experience',3),('meaningful_progress',3)
  );
  IF v_target_templates <> 0 OR v_target_mappings <> 0 THEN
    RAISE EXCEPTION 'Phase 6N successor versions already exist; refusing ambiguous catalog promotion';
  END IF;

  -- Each slot has its own family and predicate. Every supported activity contract
  -- must be represented exactly once for each selected template.
  SELECT count(*) INTO v_bad
  FROM (
    SELECT t.template_id,t.template_version
    FROM economy_private.mission_template_versions t
    LEFT JOIN economy_private.mission_event_predicate_mappings m
      ON m.template_id=t.template_id AND m.template_version=t.template_version
    WHERE (t.template_id,t.template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    )
    GROUP BY t.template_id,t.template_version,t.period_type,t.mission_family,t.objective_definition
    HAVING count(m.predicate_version) <> 4
       OR count(DISTINCT m.activity_id) <> 4
       OR count(DISTINCT m.predicate_key) <> 1
       OR min(m.mapping_status) NOT IN ('mapped','verified')
       OR t.objective_definition->>'predicate_key' IS DISTINCT FROM min(m.predicate_key)
       OR t.objective_definition->>'progress_metric' IS NULL
  ) q;

  IF v_bad <> 0 THEN
    RAISE EXCEPTION 'Selected catalog has % incomplete or inconsistent template mappings',v_bad;
  END IF;

  IF EXISTS (
    SELECT 1 FROM (
      SELECT period_type,count(DISTINCT mission_family) AS families,
             count(DISTINCT objective_definition->>'predicate_key') AS predicates
      FROM economy_private.mission_template_versions
      WHERE (template_id,template_version) IN (
        ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
        ('put_knowledge_to_use',2),('consistent_progress',2),
        ('broaden_your_experience',2),('meaningful_progress',2)
      )
      GROUP BY period_type
    ) s
    WHERE families <> CASE period_type WHEN 'daily' THEN 4 ELSE 3 END
       OR predicates <> CASE period_type WHEN 'daily' THEN 4 ELSE 3 END
  ) THEN
    RAISE EXCEPTION 'Selected daily or weekly board slots are not distinct by family and predicate';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM economy_private.mission_event_predicate_mappings m
    WHERE (m.template_id,m.template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    )
    AND (
      to_regprocedure(format('economy_private.evaluate_%s(uuid)',m.predicate_key)) IS NULL
      OR NOT has_function_privilege('service_role',to_regprocedure(format('economy_private.evaluate_%s(uuid)',m.predicate_key)),'EXECUTE')
      OR has_function_privilege('anon',to_regprocedure(format('economy_private.evaluate_%s(uuid)',m.predicate_key)),'EXECUTE')
      OR has_function_privilege('authenticated',to_regprocedure(format('economy_private.evaluate_%s(uuid)',m.predicate_key)),'EXECUTE')
      OR NOT (SELECT p.prosecdef FROM pg_catalog.pg_proc p
              WHERE p.oid=to_regprocedure(format('economy_private.evaluate_%s(uuid)',m.predicate_key)))
    )
  ) THEN
    RAISE EXCEPTION 'One or more selected predicates lack a safe service-role-only SECURITY DEFINER evaluator';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE (template_id,template_version)=('solve_a_challenge',5)
      AND predicate_definition->>'requires_server_owned_completion' IS DISTINCT FROM 'true'
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE (template_id,template_version)=('put_knowledge_to_use',2)
      AND predicate_definition->>'requires_server_owned_completion' IS DISTINCT FROM 'true'
  ) THEN
    RAISE EXCEPTION 'Challenge and practice mappings must require server-owned completion';
  END IF;
END;
$phase6n_catalog_preflight$;

-- Append verified successor templates. Historical mapped versions remain untouched.
INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family,
  reward_amount, objective_definition, validator_mapping_status, is_assignable
)
SELECT
  t.template_id,
  t.template_version + 1,
  t.period_type,
  t.mission_family,
  t.reward_amount,
  t.objective_definition || jsonb_build_object(
    'verification_note',
    'Phase 6N verified successor: all four Think Lab event contracts and the server-owned predicate evaluator were checked.'
  ),
  'verified',
  true
FROM economy_private.mission_template_versions AS t
WHERE (t.template_id,t.template_version) IN (
  ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
  ('put_knowledge_to_use',2),('consistent_progress',2),
  ('broaden_your_experience',2),('meaningful_progress',2)
);

-- Append verified successor mappings using the same exact event contracts.
INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
SELECT
  m.template_id,
  m.template_version + 1,
  m.predicate_version,
  m.predicate_key,
  m.source_system,
  m.experience_id,
  m.activity_id,
  m.event_type,
  m.validator_version,
  'verified',
  m.predicate_definition || jsonb_build_object(
    'verification_phase', '6N',
    'verification_scope', 'immutable successor catalog with service-role-only evaluator checks'
  )
FROM economy_private.mission_event_predicate_mappings AS m
WHERE (m.template_id,m.template_version) IN (
  ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
  ('put_knowledge_to_use',2),('consistent_progress',2),
  ('broaden_your_experience',2),('meaningful_progress',2)
);

DO $phase6n_catalog_postflight$
DECLARE
  v_templates integer;
  v_mappings integer;
BEGIN
  SELECT count(*) INTO v_templates
  FROM economy_private.mission_template_versions
  WHERE (template_id,template_version) IN (
    ('learning_step',3),('try_something_different',3),('solve_a_challenge',6),
    ('put_knowledge_to_use',3),('consistent_progress',3),
    ('broaden_your_experience',3),('meaningful_progress',3)
  )
    AND validator_mapping_status='verified'
    AND is_assignable;

  SELECT count(*) INTO v_mappings
  FROM economy_private.mission_event_predicate_mappings
  WHERE (template_id,template_version) IN (
    ('learning_step',3),('try_something_different',3),('solve_a_challenge',6),
    ('put_knowledge_to_use',3),('consistent_progress',3),
    ('broaden_your_experience',3),('meaningful_progress',3)
  )
    AND mapping_status='verified';

  IF v_templates <> 7 OR v_mappings <> 28 THEN
    RAISE EXCEPTION 'Phase 6N successor catalog incomplete: verified templates %, verified mappings %',
      v_templates,v_mappings;
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE (template_id,template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    )
      AND (validator_mapping_status <> 'mapped' OR is_assignable)
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE (template_id,template_version) IN (
      ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
      ('put_knowledge_to_use',2),('consistent_progress',2),
      ('broaden_your_experience',2),('meaningful_progress',2)
    ) AND mapping_status <> 'mapped'
  ) THEN
    RAISE EXCEPTION 'Phase 6N must preserve every original immutable mapped source record';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6N must leave the economy disabled';
  END IF;
END;
$phase6n_catalog_postflight$;

COMMIT;
