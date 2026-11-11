-- Velorn Phase 4F: verified mission board generation and extensible predicate dispatch.
-- The generator never creates partial boards and remains dormant while economy_enabled=false.

-- Phase 4F extends the Phase 4E processor to dispatch only private,
-- service-role-only SECURITY DEFINER boolean evaluators by verified predicate key.
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
       OR v_assignment.progress_value >= 1 THEN
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

    v_progress_after := 1;
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
        assignment_status = 'completed',
        completed_at = v_event.occurred_at
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

REVOKE ALL ON FUNCTION economy_private.process_mission_event(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.process_mission_event(uuid)
  TO service_role;

-- Velorn Phase 4F: safe, idempotent server-side mission board generation.
-- No templates are activated and the economy remains disabled by default.

CREATE OR REPLACE FUNCTION public.economy_generate_mission_board(
  p_user_id uuid,
  p_period_type text,
  p_reference timestamptz DEFAULT clock_timestamp()
)
RETURNS TABLE (
  out_board_id uuid,
  out_status text,
  out_period_key text,
  out_assignment_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_period record;
  v_config jsonb;
  v_config_version smallint;
  v_board_size integer;
  v_expected_reward bigint;
  v_board_id uuid;
  v_assignment_count integer;
  v_template_ids text[] := ARRAY[]::text[];
  v_template_versions integer[] := ARRAY[]::integer[];
  v_predicate_versions integer[] := ARRAY[]::integer[];
  v_predicate_keys text[] := ARRAY[]::text[];
  v_families text[] := ARRAY[]::text[];
  v_predicates text[] := ARRAY[]::text[];
  v_candidate record;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission board generation requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NULL OR p_period_type IS NULL
     OR p_period_type NOT IN ('daily', 'weekly') OR p_reference IS NULL THEN
    RAISE EXCEPTION 'A player, supported period type, and reference time are required.'
      USING ERRCODE = '22023';
  END IF;

  SELECT s.active_config_version
    INTO v_config_version
  FROM economy_private.economy_settings AS s
  WHERE s.singleton AND s.economy_enabled
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, 'disabled'::text, NULL::text, 0;
    RETURN;
  END IF;

  SELECT c.config INTO v_config
  FROM economy_private.economy_config_versions AS c
  WHERE c.config_version = v_config_version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The active economy configuration is missing.'
      USING ERRCODE = '55000';
  END IF;

  IF p_period_type = 'daily' THEN
    v_board_size := (v_config -> 'daily_mission' ->> 'board_size')::integer;
    v_expected_reward := (v_config -> 'daily_mission' ->> 'per_mission')::bigint;
    IF v_board_size <> 4 OR v_expected_reward <> 10 THEN
      RAISE EXCEPTION 'The approved daily mission configuration is not available.'
        USING ERRCODE = '55000';
    END IF;
  ELSE
    v_board_size := (v_config -> 'weekly_mission' ->> 'board_size')::integer;
    v_expected_reward := (v_config -> 'weekly_mission' ->> 'per_mission')::bigint;
    IF v_board_size <> 3 OR v_expected_reward <> 20 THEN
      RAISE EXCEPTION 'The approved weekly mission configuration is not available.'
        USING ERRCODE = '55000';
    END IF;
  END IF;

  SELECT * INTO v_period
  FROM public.economy_resolve_mission_period(p_user_id, p_period_type, p_reference);

  SELECT b.board_id INTO v_board_id
  FROM economy_private.mission_boards AS b
  WHERE b.user_id = p_user_id
    AND b.period_type = p_period_type
    AND b.period_start = v_period.out_period_start
  FOR UPDATE;

  IF FOUND THEN
    SELECT count(*)::integer INTO v_assignment_count
    FROM economy_private.mission_assignments AS a
    WHERE a.board_id = v_board_id;
    IF v_assignment_count <> v_board_size THEN
      RAISE EXCEPTION 'An existing mission board has an incomplete assignment set.'
        USING ERRCODE = '55000';
    END IF;
    RETURN QUERY SELECT v_board_id, 'existing'::text,
                        v_period.out_period_key, v_assignment_count;
    RETURN;
  END IF;

  -- A template is eligible only if its exact mapping is verified and its
  -- evaluator is a private SECURITY DEFINER boolean function executable only
  -- by service_role. This mirrors Phase 4E's dynamic evaluator dispatch.
  FOR v_candidate IN
    SELECT
      t.template_id, t.template_version, t.mission_family, t.reward_amount,
      t.objective_definition, m.predicate_version, m.predicate_key
    FROM economy_private.mission_template_versions AS t
    JOIN economy_private.mission_event_predicate_mappings AS m
      ON m.template_id = t.template_id
     AND m.template_version = t.template_version
    WHERE t.period_type = p_period_type
      AND t.validator_mapping_status = 'verified'
      AND t.is_assignable
      AND t.reward_amount = v_expected_reward
      AND m.mapping_status = 'verified'
      AND m.predicate_key ~ '^[a-z][a-z0-9_]{1,99}$'
      AND EXISTS (
        SELECT 1
        FROM pg_catalog.pg_proc AS p
        WHERE p.oid = to_regprocedure(
          format('economy_private.evaluate_%s(uuid)', m.predicate_key)
        )
          AND p.prorettype = 'boolean'::regtype
          AND p.prosecdef
          AND has_function_privilege('service_role', p.oid, 'EXECUTE')
          AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')
          AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
      )
    ORDER BY
      md5(concat_ws('|', p_user_id::text, v_period.out_period_key,
                    t.template_id, t.template_version::text, m.predicate_key)),
      t.template_id, t.template_version DESC, m.predicate_version DESC
  LOOP
    IF NOT (v_candidate.mission_family = ANY(v_families))
       AND NOT (v_candidate.predicate_key = ANY(v_predicates)) THEN
      v_template_ids := array_append(v_template_ids, v_candidate.template_id);
      v_template_versions := array_append(v_template_versions, v_candidate.template_version);
      v_predicate_versions := array_append(v_predicate_versions, v_candidate.predicate_version);
      v_predicate_keys := array_append(v_predicate_keys, v_candidate.predicate_key);
      v_families := array_append(v_families, v_candidate.mission_family);
      v_predicates := array_append(v_predicates, v_candidate.predicate_key);
      EXIT WHEN cardinality(v_template_ids) = v_board_size;
    END IF;
  END LOOP;

  IF cardinality(v_template_ids) <> v_board_size THEN
    RETURN QUERY SELECT NULL::uuid, 'not_ready'::text,
                        v_period.out_period_key, 0;
    RETURN;
  END IF;

  INSERT INTO economy_private.mission_boards (
    user_id, period_type, period_start, period_end, timezone_name,
    config_version, template_bank_version
  )
  VALUES (
    p_user_id, p_period_type, v_period.out_period_start, v_period.out_period_end,
    v_period.out_timezone_name, v_config_version, 1
  )
  ON CONFLICT (user_id, period_type, period_start) DO NOTHING
  RETURNING board_id INTO v_board_id;

  IF v_board_id IS NULL THEN
    SELECT b.board_id INTO v_board_id
    FROM economy_private.mission_boards AS b
    WHERE b.user_id = p_user_id
      AND b.period_type = p_period_type
      AND b.period_start = v_period.out_period_start
    FOR UPDATE;
  END IF;
  IF v_board_id IS NULL THEN
    RAISE EXCEPTION 'Mission board creation could not resolve its period identity.'
      USING ERRCODE = '55000';
  END IF;

  SELECT count(*)::integer INTO v_assignment_count
  FROM economy_private.mission_assignments AS a
  WHERE a.board_id = v_board_id;

  IF v_assignment_count = v_board_size THEN
    RETURN QUERY SELECT v_board_id, 'existing'::text,
                        v_period.out_period_key, v_assignment_count;
    RETURN;
  ELSIF v_assignment_count <> 0 THEN
    RAISE EXCEPTION 'A concurrent mission board has an incomplete assignment set.'
      USING ERRCODE = '55000';
  END IF;

  INSERT INTO economy_private.mission_assignments (
    board_id, user_id, slot_number, template_id, template_version,
    objective_snapshot, reward_snapshot
  )
  SELECT
    v_board_id, p_user_id, selected.slot_number::smallint,
    t.template_id, t.template_version,
    t.objective_definition || jsonb_build_object(
      'template_id', t.template_id,
      'template_version', t.template_version,
      'mission_family', t.mission_family,
      'predicate_key', m.predicate_key
    ),
    t.reward_amount
  FROM unnest(
    v_template_ids, v_template_versions, v_predicate_versions, v_predicate_keys
  ) WITH ORDINALITY AS selected(
    template_id, template_version, predicate_version, predicate_key, slot_number
  )
  JOIN economy_private.mission_template_versions AS t
    ON t.template_id = selected.template_id
   AND t.template_version = selected.template_version
  JOIN economy_private.mission_event_predicate_mappings AS m
    ON m.template_id = selected.template_id
   AND m.template_version = selected.template_version
   AND m.predicate_version = selected.predicate_version
   AND m.predicate_key = selected.predicate_key
   AND m.mapping_status = 'verified'
  ORDER BY selected.slot_number;

  GET DIAGNOSTICS v_assignment_count = ROW_COUNT;
  IF v_assignment_count <> v_board_size THEN
    RAISE EXCEPTION 'Mission board assignment creation was incomplete.'
      USING ERRCODE = '55000';
  END IF;

  RETURN QUERY SELECT v_board_id, 'created'::text,
                      v_period.out_period_key, v_assignment_count;
END;
$$;

REVOKE ALL ON FUNCTION public.economy_generate_mission_board(uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.economy_generate_mission_board(uuid, text, timestamptz)
  TO service_role;

COMMENT ON FUNCTION public.economy_generate_mission_board(uuid, text, timestamptz) IS
  'Service-role-only, idempotent daily/weekly board generator. Requires the economy gate, approved board size/reward config, enough distinct verified templates, verified predicate mappings, and a private service-role-only boolean evaluator for every selected predicate. Returns not_ready without creating a partial board.';
