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

  IF v_mappings <> 28 THEN
    RAISE EXCEPTION 'Expected 28 exact Think Lab mappings; found %',v_mappings;
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

UPDATE economy_private.mission_event_predicate_mappings
SET mapping_status='verified'
WHERE (template_id,template_version) IN (
  ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
  ('put_knowledge_to_use',2),('consistent_progress',2),
  ('broaden_your_experience',2),('meaningful_progress',2)
);

UPDATE economy_private.mission_template_versions
SET validator_mapping_status='verified',
    is_assignable=true
WHERE (template_id,template_version) IN (
  ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
  ('put_knowledge_to_use',2),('consistent_progress',2),
  ('broaden_your_experience',2),('meaningful_progress',2)
);

COMMIT;
