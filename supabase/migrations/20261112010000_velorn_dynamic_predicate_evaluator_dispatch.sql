-- Phase 4H follow-up: dispatch verified predicates to their private evaluator functions.
-- Evaluators must be SECURITY DEFINER functions with the exact (uuid) -> boolean contract.
-- The mapping is trusted metadata; function names are schema-qualified and identifier-quoted.

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
  v_qualifies boolean;
  v_evaluator_oid oid;
  v_evaluator_name text;
  v_progress_id uuid;
  v_progress_after bigint;
  v_updated integer;
  v_applied integer := 0;
BEGIN
  IF COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role') IS DISTINCT FROM 'service_role' THEN
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
    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    -- Resolve only a trusted SECURITY DEFINER evaluator in the fixed private schema.
    -- The verified mapping selects the predicate key; no client-supplied function name is used.
    v_evaluator_name := 'evaluate_' || v_mapping.predicate_key;
    v_evaluator_oid := to_regprocedure(
      format('economy_private.%I(uuid)', v_evaluator_name)
    );

    IF v_evaluator_oid IS NULL OR NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc AS p
      JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
      WHERE p.oid = v_evaluator_oid
        AND n.nspname = 'economy_private'
        AND p.pronargs = 1
        AND p.proargtypes[0] = 'uuid'::regtype
        AND p.prorettype = 'boolean'::regtype
        AND p.prosecdef
    ) THEN
      CONTINUE;
    END IF;

    EXECUTE format('SELECT economy_private.%I($1)', v_evaluator_name)
      INTO v_qualifies
      USING v_event.event_id;
    IF NOT v_qualifies THEN
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



NOTIFY pgrst, 'reload schema';

COMMENT ON FUNCTION economy_private.process_mission_event(uuid) IS
  'Service-role-only idempotent processor. Dispatches verified predicates only to SECURITY DEFINER private evaluators with the exact uuid-to-boolean contract.';