-- Phase 6A: cumulative, append-only mission evidence and threshold progress.
-- No template is activated and no reward/economy state is changed.

CREATE TABLE economy_private.mission_assignment_evidence (
  evidence_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL,
  event_id uuid NOT NULL,
  source_event_key uuid NOT NULL,
  activity_id text NOT NULL CHECK (char_length(activity_id) BETWEEN 1 AND 160),
  occurred_at timestamptz NOT NULL,
  local_activity_date date NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (assignment_id, user_id)
    REFERENCES economy_private.mission_assignments(assignment_id, user_id)
    ON DELETE RESTRICT,
  FOREIGN KEY (event_id, user_id)
    REFERENCES economy_private.activity_events(event_id, user_id)
    ON DELETE RESTRICT,
  UNIQUE (event_id, assignment_id)
);

CREATE INDEX mission_assignment_evidence_assignment_day_idx
  ON economy_private.mission_assignment_evidence
    (assignment_id, local_activity_date, activity_id);

ALTER TABLE economy_private.mission_assignment_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_assignment_evidence FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE economy_private.mission_assignment_evidence
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER mission_assignment_evidence_immutable
  BEFORE UPDATE OR DELETE ON economy_private.mission_assignment_evidence
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();

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
    IF v_target < 1 OR v_metric NOT IN ('event_count','distinct_days','distinct_activities') THEN
      CONTINUE;
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

COMMENT ON TABLE economy_private.mission_assignment_evidence IS
  'Append-only, service-owned event evidence for cumulative mission progress. One trusted event can be recorded once per assignment.';
COMMENT ON FUNCTION economy_private.process_mission_event(uuid) IS
  'Service-role-only idempotent mission processor. Stores immutable event evidence and advances event-count, distinct-day, or distinct-activity thresholds; it never issues rewards.';
