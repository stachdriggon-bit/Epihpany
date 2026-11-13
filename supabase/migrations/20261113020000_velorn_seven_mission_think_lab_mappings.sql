-- Phase 6B: map the seven approved missions to the four authenticated Think Lab games.
-- All new template versions remain mapped/non-assignable until the full CI contract is verified.

CREATE OR REPLACE FUNCTION economy_private.process_mission_event(
  p_event_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event economy_private.activity_events%ROWTYPE;
  v_candidate record;
  v_board economy_private.mission_boards%ROWTYPE;
  v_assignment economy_private.mission_assignments%ROWTYPE;
  v_mapping economy_private.mission_event_predicate_mappings%ROWTYPE;
  v_evaluator_oid oid;
  v_qualifies boolean;
  v_progress_id uuid;
  v_progress_after bigint;
  v_target bigint;
  v_metric text;
  v_evidence_id uuid;
  v_last_activity text;
  v_updated integer;
  v_applied integer := 0;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission progress processing requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'A validated activity event is required.'
      USING ERRCODE = '22023';
  END IF;

  SELECT e.* INTO v_event
  FROM economy_private.activity_events AS e
  WHERE e.event_id = p_event_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- All processors lock board before assignment, matching the claim service lock order.
  FOR v_candidate IN
    SELECT b.board_id, a.assignment_id, m.predicate_key, m.predicate_version
    FROM economy_private.mission_boards AS b
    JOIN economy_private.mission_assignments AS a
      ON a.board_id = b.board_id AND a.user_id = b.user_id
    JOIN economy_private.mission_template_versions AS t
      ON t.template_id = a.template_id AND t.template_version = a.template_version
    JOIN economy_private.mission_event_predicate_mappings AS m
      ON m.template_id = t.template_id AND m.template_version = t.template_version
    WHERE b.user_id = v_event.user_id
      AND a.user_id = v_event.user_id
      AND a.assignment_status = 'active'
      AND v_event.occurred_at >= b.period_start
      AND v_event.occurred_at < b.period_end
      AND t.period_type = b.period_type
      AND t.validator_mapping_status = 'verified'
      AND t.is_assignable
      AND m.mapping_status = 'verified'
      AND m.source_system = v_event.source_system
      AND m.experience_id = v_event.experience_id
      AND m.activity_id = v_event.activity_id
      AND m.event_type = v_event.event_type
      AND m.validator_version = v_event.validator_version
      AND a.objective_snapshot ->> 'predicate_key' = m.predicate_key
    ORDER BY b.board_id, a.assignment_id, m.predicate_version DESC
  LOOP
    SELECT b.* INTO v_board
    FROM economy_private.mission_boards AS b
    WHERE b.board_id = v_candidate.board_id
      AND b.user_id = v_event.user_id
    FOR UPDATE;
    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    SELECT a.* INTO v_assignment
    FROM economy_private.mission_assignments AS a
    WHERE a.assignment_id = v_candidate.assignment_id
      AND a.board_id = v_board.board_id
      AND a.user_id = v_event.user_id
    FOR UPDATE;
    IF NOT FOUND OR v_assignment.assignment_status <> 'active' THEN
      CONTINUE;
    END IF;

    -- Re-check the period and snapshot after acquiring locks.
    IF v_event.occurred_at < v_board.period_start
       OR v_event.occurred_at >= v_board.period_end
       OR v_assignment.objective_snapshot ->> 'predicate_key'
            IS DISTINCT FROM v_candidate.predicate_key
       OR v_assignment.progress_value >= COALESCE(NULLIF(v_assignment.objective_snapshot ->> 'target_count', '')::bigint, 1) THEN
      CONTINUE;
    END IF;

    SELECT m.* INTO v_mapping
    FROM economy_private.mission_event_predicate_mappings AS m
    WHERE m.template_id = v_assignment.template_id
      AND m.template_version = v_assignment.template_version
      AND m.predicate_key = v_candidate.predicate_key
      AND m.source_system = v_event.source_system
      AND m.experience_id = v_event.experience_id
      AND m.activity_id = v_event.activity_id
      AND m.event_type = v_event.event_type
      AND m.validator_version = v_event.validator_version
      AND m.mapping_status = 'verified'
    ORDER BY m.predicate_version DESC
    LIMIT 1;
    IF NOT FOUND OR v_mapping.predicate_key !~ '^[a-z][a-z0-9_]{1,99}$' THEN
      CONTINUE;
    END IF;

    -- Resolve only a private SECURITY DEFINER boolean evaluator with service-role-only
    -- execute privilege. Unknown, unsafe, or missing evaluators fail closed.
    SELECT p.oid INTO v_evaluator_oid
    FROM pg_catalog.pg_proc AS p
    WHERE p.oid = to_regprocedure(
        format('economy_private.evaluate_%s(uuid)', v_mapping.predicate_key)
      )
      AND p.prorettype = 'boolean'::regtype
      AND p.prosecdef
      AND has_function_privilege('service_role', p.oid, 'EXECUTE')
      AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')
      AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE');
    IF v_evaluator_oid IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format(
      'SELECT economy_private.%I($1)',
      'evaluate_' || v_mapping.predicate_key
    )
    INTO v_qualifies
    USING v_event.event_id;

    IF v_qualifies IS DISTINCT FROM true THEN
      CONTINUE;
    END IF;

    v_target := COALESCE(NULLIF(v_assignment.objective_snapshot ->> 'target_count', '')::bigint, 1);
    v_metric := COALESCE(v_assignment.objective_snapshot ->> 'progress_metric', 'event_count');
    IF v_target < 1 OR v_metric NOT IN ('event_count','distinct_days','distinct_activities','different_from_last_daily_activity') THEN
      CONTINUE;
    END IF;

    IF v_metric = 'different_from_last_daily_activity' THEN
      SELECT e.activity_id INTO v_last_activity
      FROM economy_private.mission_assignment_evidence AS e
      JOIN economy_private.mission_event_progress AS p
        ON p.assignment_id = e.assignment_id AND p.event_id = e.event_id
      JOIN economy_private.mission_assignments AS a
        ON a.assignment_id = e.assignment_id AND a.user_id = e.user_id
      JOIN economy_private.mission_boards AS b
        ON b.board_id = a.board_id AND b.user_id = a.user_id
      WHERE e.user_id = v_event.user_id
        AND b.period_type = 'daily'
        AND (e.occurred_at, e.event_id) < (v_event.occurred_at, v_event.event_id)
      ORDER BY e.occurred_at DESC, e.event_id DESC
      LIMIT 1;

      -- There must be a previous daily activity, and this one must be different.
      -- The current event is excluded even if another assignment processed it first.
      IF v_last_activity IS NULL OR v_last_activity = v_event.activity_id THEN
        CONTINUE;
      END IF;
    END IF;

    -- Persist every qualifying event as immutable assignment evidence. Replays
    -- cannot create a second row for the same event/assignment pair.
    v_evidence_id := NULL;
    INSERT INTO economy_private.mission_assignment_evidence (
      user_id, assignment_id, event_id, source_event_key, activity_id,
      occurred_at, local_activity_date
    )
    VALUES (
      v_event.user_id, v_assignment.assignment_id, v_event.event_id,
      v_event.source_event_key, v_event.activity_id, v_event.occurred_at,
      (v_event.occurred_at AT TIME ZONE v_board.timezone_name)::date
    )
    ON CONFLICT (event_id, assignment_id) DO NOTHING
    RETURNING evidence_id INTO v_evidence_id;
    IF v_evidence_id IS NULL THEN
      CONTINUE;
    END IF;

    IF v_metric = 'distinct_days' THEN
      SELECT count(DISTINCT e.local_activity_date)::bigint INTO v_progress_after
      FROM economy_private.mission_assignment_evidence AS e
      WHERE e.assignment_id = v_assignment.assignment_id;
    ELSIF v_metric = 'distinct_activities' THEN
      SELECT count(DISTINCT e.activity_id)::bigint INTO v_progress_after
      FROM economy_private.mission_assignment_evidence AS e
      WHERE e.assignment_id = v_assignment.assignment_id;
    ELSE
      SELECT count(*)::bigint INTO v_progress_after
      FROM economy_private.mission_assignment_evidence AS e
      WHERE e.assignment_id = v_assignment.assignment_id;
    END IF;

    v_progress_after := LEAST(v_progress_after, v_target);
    IF v_progress_after <= v_assignment.progress_value THEN
      -- The event remains valid evidence, but it did not advance this metric
      -- (for example, a second activity on the same local calendar day).
      CONTINUE;
    END IF;

    v_progress_id := NULL;
    INSERT INTO economy_private.mission_event_progress (
      user_id, event_id, assignment_id, predicate_key,
      progress_before, progress_after
    )
    VALUES (
      v_event.user_id, v_event.event_id, v_assignment.assignment_id,
      v_mapping.predicate_key, v_assignment.progress_value, v_progress_after
    )
    ON CONFLICT (event_id, assignment_id) DO NOTHING
    RETURNING progress_id INTO v_progress_id;

    -- A replay or concurrent processor that already recorded this pair is a no-op.
    IF v_progress_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE economy_private.mission_assignments
    SET progress_value = v_progress_after,
        assignment_status = CASE WHEN v_progress_after >= v_target THEN 'completed' ELSE 'active' END,
        completed_at = CASE WHEN v_progress_after >= v_target THEN v_event.occurred_at ELSE NULL END
    WHERE assignment_id = v_assignment.assignment_id
      AND user_id = v_event.user_id
      AND assignment_status = 'active'
      AND progress_value = v_assignment.progress_value;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated <> 1 THEN
      RAISE EXCEPTION 'Mission assignment changed during progress application.'
        USING ERRCODE = '40001';
    END IF;

    v_applied := v_applied + 1;
  END LOOP;

  RETURN v_applied;
END;
$$;

CREATE OR REPLACE FUNCTION economy_private.is_valid_think_lab_completion_v1(
  p_event_id uuid,
  p_require_challenge boolean DEFAULT false,
  p_require_full_round boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event economy_private.activity_events%ROWTYPE;
  v_evidence jsonb;
  v_question_count integer;
  v_correct_count integer;
  v_incorrect_count integer;
  v_wrong_count integer := 0;
  v_link_count integer;
  v_full boolean := false;
BEGIN
  IF COALESCE(
       NULLIF(current_setting('request.jwt.claim.role', true), ''),
       NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
     ) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission predicate evaluation requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;
  IF p_event_id IS NULL THEN
    RAISE EXCEPTION 'A validated activity event is required.'
      USING ERRCODE = '22023';
  END IF;

  SELECT e.* INTO v_event
  FROM economy_private.activity_events AS e
  WHERE e.event_id = p_event_id;
  IF NOT FOUND THEN RETURN false; END IF;

  IF v_event.source_system IS DISTINCT FROM 'think_lab'
     OR v_event.experience_id IS DISTINCT FROM 'think_lab'
     OR v_event.event_type IS DISTINCT FROM 'game_session_completed'
     OR v_event.occurred_at > v_event.received_at
     OR jsonb_typeof(v_event.evidence) IS DISTINCT FROM 'object' THEN
    RETURN false;
  END IF;
  v_evidence := v_event.evidence;

  IF v_event.activity_id = 'odd_one_out' THEN
    IF v_event.validator_version IS DISTINCT FROM 'odd-one-out-rotated-20261110-v2'
       OR (v_evidence - ARRAY['challenge_level','training_mode','question_count','correct_count','incorrect_count']) <> '{}'::jsonb
       OR NOT (v_evidence ?& ARRAY['challenge_level','training_mode','question_count','correct_count','incorrect_count'])
       OR jsonb_typeof(v_evidence->'challenge_level') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'training_mode') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'question_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'correct_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'incorrect_count') IS DISTINCT FROM 'number'
       OR COALESCE(v_evidence->>'question_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'correct_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'incorrect_count','') !~ '^[0-9]{1,2}$'
       OR v_evidence->>'challenge_level' NOT IN ('A1','A2','B1','B2','C1','C2') THEN
      RETURN false;
    END IF;
    v_question_count := (v_evidence->>'question_count')::integer;
    v_correct_count := (v_evidence->>'correct_count')::integer;
    v_incorrect_count := (v_evidence->>'incorrect_count')::integer;
    v_full := v_question_count = 12;

  ELSIF v_event.activity_id = 'word_forge' THEN
    IF v_event.validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
       OR (v_evidence - ARRAY['training_mode','question_count','correct_count','incorrect_count']) <> '{}'::jsonb
       OR NOT (v_evidence ?& ARRAY['training_mode','question_count','correct_count','incorrect_count'])
       OR jsonb_typeof(v_evidence->'training_mode') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'question_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'correct_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'incorrect_count') IS DISTINCT FROM 'number'
       OR COALESCE(v_evidence->>'question_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'correct_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'incorrect_count','') !~ '^[0-9]{1,2}$' THEN
      RETURN false;
    END IF;
    v_question_count := (v_evidence->>'question_count')::integer;
    v_correct_count := (v_evidence->>'correct_count')::integer;
    v_incorrect_count := (v_evidence->>'incorrect_count')::integer;
    v_full := v_question_count = 24;

  ELSIF v_event.activity_id = 'chain_reaction' THEN
    IF v_event.validator_version IS DISTINCT FROM 'chain-reaction-72-20261112-v1'
       OR (v_evidence - ARRAY['training_mode','session_type','question_count','link_count','wrong_link_attempts','correct_count','incorrect_count']) <> '{}'::jsonb
       OR NOT (v_evidence ?& ARRAY['training_mode','session_type','question_count','link_count','wrong_link_attempts','correct_count','incorrect_count'])
       OR jsonb_typeof(v_evidence->'training_mode') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'session_type') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'question_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'link_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'wrong_link_attempts') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'correct_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'incorrect_count') IS DISTINCT FROM 'number'
       OR COALESCE(v_evidence->>'question_count','') !~ '^(1|24)$'
       OR COALESCE(v_evidence->>'link_count','') !~ '^[0-9]{1,3}$'
       OR COALESCE(v_evidence->>'wrong_link_attempts','') !~ '^[0-9]{1,5}$'
       OR COALESCE(v_evidence->>'correct_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'incorrect_count','') !~ '^[0-9]{1,2}$' THEN
      RETURN false;
    END IF;
    v_question_count := (v_evidence->>'question_count')::integer;
    v_link_count := (v_evidence->>'link_count')::integer;
    v_wrong_count := (v_evidence->>'wrong_link_attempts')::integer;
    v_correct_count := (v_evidence->>'correct_count')::integer;
    v_incorrect_count := (v_evidence->>'incorrect_count')::integer;
    IF (v_question_count = 1 AND v_evidence->>'session_type' <> 'daily')
       OR (v_question_count <> 1 AND v_evidence->>'session_type' <> 'full')
       OR v_link_count <> v_question_count * 3 THEN
      RETURN false;
    END IF;
    v_full := v_question_count = 24 AND v_evidence->>'session_type' = 'full';

  ELSIF v_event.activity_id = 'sentence_scramble' THEN
    IF v_event.validator_version IS DISTINCT FROM 'sentence-scramble-72-20261112-v1'
       OR (v_evidence - ARRAY['training_mode','session_type','question_count','correct_count','incorrect_count','wrong_attempts']) <> '{}'::jsonb
       OR NOT (v_evidence ?& ARRAY['training_mode','session_type','question_count','correct_count','incorrect_count','wrong_attempts'])
       OR jsonb_typeof(v_evidence->'training_mode') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'session_type') IS DISTINCT FROM 'string'
       OR jsonb_typeof(v_evidence->'question_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'correct_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'incorrect_count') IS DISTINCT FROM 'number'
       OR jsonb_typeof(v_evidence->'wrong_attempts') IS DISTINCT FROM 'number'
       OR COALESCE(v_evidence->>'question_count','') !~ '^(1|24)$'
       OR COALESCE(v_evidence->>'correct_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'incorrect_count','') !~ '^[0-9]{1,2}$'
       OR COALESCE(v_evidence->>'wrong_attempts','') !~ '^[0-9]{1,5}$' THEN
      RETURN false;
    END IF;
    v_question_count := (v_evidence->>'question_count')::integer;
    v_correct_count := (v_evidence->>'correct_count')::integer;
    v_incorrect_count := (v_evidence->>'incorrect_count')::integer;
    v_wrong_count := (v_evidence->>'wrong_attempts')::integer;
    IF (v_question_count = 1 AND v_evidence->>'session_type' <> 'daily')
       OR (v_question_count <> 1 AND v_evidence->>'session_type' <> 'full') THEN
      RETURN false;
    END IF;
    v_full := v_question_count = 24 AND v_evidence->>'session_type' = 'full';
  ELSE
    RETURN false;
  END IF;

  IF v_question_count < 1
     OR v_correct_count < 0 OR v_incorrect_count < 0
     OR v_correct_count + v_incorrect_count <> v_question_count
     OR v_wrong_count < 0 THEN
    RETURN false;
  END IF;

  IF v_evidence->>'training_mode' NOT IN ('guided','steady','challenge') THEN
    RETURN false;
  END IF;
  IF p_require_challenge AND v_evidence->>'training_mode' IS DISTINCT FROM 'challenge' THEN
    RETURN false;
  END IF;
  IF p_require_full_round AND NOT v_full THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION economy_private.is_valid_think_lab_completion_v1(uuid,boolean,boolean)
  FROM PUBLIC, anon, authenticated, service_role;



CREATE OR REPLACE FUNCTION economy_private.evaluate_learning_step_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, false);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_learning_step_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_learning_step_think_lab_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_try_something_different_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, false);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_try_something_different_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_try_something_different_think_lab_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_solve_a_challenge_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, true, false);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_solve_a_challenge_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_solve_a_challenge_think_lab_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_put_knowledge_to_use_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, true);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_put_knowledge_to_use_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_put_knowledge_to_use_think_lab_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_consistent_progress_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, false);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_consistent_progress_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_consistent_progress_think_lab_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_broaden_your_experience_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, false);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_broaden_your_experience_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_broaden_your_experience_think_lab_v1(uuid) TO service_role;

CREATE OR REPLACE FUNCTION economy_private.evaluate_meaningful_progress_think_lab_v1(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT economy_private.is_valid_think_lab_completion_v1(p_event_id, false, true);
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_meaningful_progress_think_lab_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_meaningful_progress_think_lab_v1(uuid) TO service_role;



INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 2, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','learning_step_think_lab_v1',
         'progress_metric','event_count',
         'target_count',1,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='learning_step' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 2, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','try_something_different_think_lab_v1',
         'progress_metric','different_from_last_daily_activity',
         'target_count',1,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='try_something_different' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 5, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','solve_a_challenge_think_lab_v1',
         'progress_metric','event_count',
         'target_count',1,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='solve_a_challenge' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 2, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','put_knowledge_to_use_think_lab_v1',
         'progress_metric','event_count',
         'target_count',1,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='put_knowledge_to_use' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 2, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','consistent_progress_think_lab_v1',
         'progress_metric','distinct_days',
         'target_count',3,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='consistent_progress' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 2, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','broaden_your_experience_think_lab_v1',
         'progress_metric','distinct_activities',
         'target_count',2,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='broaden_your_experience' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family, reward_amount,
  objective_definition, validator_mapping_status, is_assignable
)
SELECT template_id, 2, period_type, mission_family, reward_amount,
       objective_definition || jsonb_build_object(
         'predicate_key','meaningful_progress_think_lab_v1',
         'progress_metric','event_count',
         'target_count',1,
         'predicate_scope','server_validated_think_lab_completion'
       ),
       'mapped', false
FROM economy_private.mission_template_versions
WHERE template_id='meaningful_progress' AND template_version=1
ON CONFLICT (template_id, template_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'learning_step', 2, 1, 'learning_step_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'learning_step', 2, 2, 'learning_step_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'learning_step', 2, 3, 'learning_step_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'learning_step', 2, 4, 'learning_step_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'try_something_different', 2, 1, 'try_something_different_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'try_something_different', 2, 2, 'try_something_different_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'try_something_different', 2, 3, 'try_something_different_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'try_something_different', 2, 4, 'try_something_different_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'solve_a_challenge', 5, 1, 'solve_a_challenge_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'solve_a_challenge', 5, 2, 'solve_a_challenge_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'solve_a_challenge', 5, 3, 'solve_a_challenge_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'solve_a_challenge', 5, 4, 'solve_a_challenge_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'put_knowledge_to_use', 2, 1, 'put_knowledge_to_use_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'put_knowledge_to_use', 2, 2, 'put_knowledge_to_use_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'put_knowledge_to_use', 2, 3, 'put_knowledge_to_use_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'put_knowledge_to_use', 2, 4, 'put_knowledge_to_use_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'consistent_progress', 2, 1, 'consistent_progress_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'consistent_progress', 2, 2, 'consistent_progress_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'consistent_progress', 2, 3, 'consistent_progress_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'consistent_progress', 2, 4, 'consistent_progress_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'broaden_your_experience', 2, 1, 'broaden_your_experience_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'broaden_your_experience', 2, 2, 'broaden_your_experience_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'broaden_your_experience', 2, 3, 'broaden_your_experience_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'broaden_your_experience', 2, 4, 'broaden_your_experience_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'meaningful_progress', 2, 1, 'meaningful_progress_think_lab_v1',
  'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
  'odd-one-out-rotated-20261110-v2', 'mapped',
  '{"event_contract":"odd_one_out:odd-one-out-rotated-20261110-v2","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'meaningful_progress', 2, 2, 'meaningful_progress_think_lab_v1',
  'think_lab', 'think_lab', 'word_forge', 'game_session_completed',
  'word-forge-reviewed-72-20261111-v1', 'mapped',
  '{"event_contract":"word_forge:word-forge-reviewed-72-20261111-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'meaningful_progress', 2, 3, 'meaningful_progress_think_lab_v1',
  'think_lab', 'think_lab', 'chain_reaction', 'game_session_completed',
  'chain-reaction-72-20261112-v1', 'mapped',
  '{"event_contract":"chain_reaction:chain-reaction-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type, validator_version,
  mapping_status, predicate_definition
)
VALUES (
  'meaningful_progress', 2, 4, 'meaningful_progress_think_lab_v1',
  'think_lab', 'think_lab', 'sentence_scramble', 'game_session_completed',
  'sentence-scramble-72-20261112-v1', 'mapped',
  '{"event_contract":"sentence_scramble:sentence-scramble-72-20261112-v1","requires_server_owned_completion":true}'::jsonb
)
ON CONFLICT (template_id, template_version, predicate_version) DO NOTHING;



DO $phase6b$
DECLARE
  v_missing integer;
BEGIN
  SELECT count(*) INTO v_missing
  FROM (VALUES
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  ) AS expected(template_id,template_version)
  LEFT JOIN economy_private.mission_template_versions AS t
    ON t.template_id=expected.template_id AND t.template_version=expected.template_version
  WHERE t.template_id IS NULL
     OR t.validator_mapping_status <> 'mapped'
     OR t.is_assignable;
  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'All seven Phase 6B templates must exist as mapped and non-assignable';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_event_predicate_mappings
      WHERE (template_id,template_version) IN (
        ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
        ('put_knowledge_to_use',2),('consistent_progress',2),
        ('broaden_your_experience',2),('meaningful_progress',2)
      ) AND mapping_status='mapped') <> 28 THEN
    RAISE EXCEPTION 'Each Phase 6B mission must have exactly four mapped game contracts';
  END IF;
END;
$phase6b$;

COMMENT ON FUNCTION economy_private.is_valid_think_lab_completion_v1(uuid,boolean,boolean) IS
  'Private fail-closed verifier for exact server-owned completion event contracts from Odd One Out, Word Forge, Chain Reaction, and Sentence Scramble.';
