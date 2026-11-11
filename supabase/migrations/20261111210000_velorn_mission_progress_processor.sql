-- Velorn Phase 4E: idempotent mission progress processing.
-- Trusted activity events are matched to exact versioned predicates and active assignments.
-- No board generator, template activation, claim, wallet credit, or economy enablement is added.

ALTER TABLE economy_private.activity_events
  ADD CONSTRAINT activity_events_event_user_unique UNIQUE (event_id, user_id);

CREATE TABLE economy_private.mission_event_progress (
  progress_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  event_id uuid NOT NULL,
  assignment_id uuid NOT NULL,
  FOREIGN KEY (event_id, user_id)
    REFERENCES economy_private.activity_events(event_id, user_id)
    ON DELETE RESTRICT,
  predicate_key text NOT NULL CHECK (predicate_key ~ '^[a-z][a-z0-9_]{1,99}$'),
  progress_before bigint NOT NULL CHECK (progress_before >= 0),
  progress_after bigint NOT NULL CHECK (progress_after > progress_before),
  processed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (assignment_id, user_id)
    REFERENCES economy_private.mission_assignments(assignment_id, user_id)
    ON DELETE RESTRICT,
  UNIQUE (event_id, assignment_id)
);

CREATE INDEX mission_event_progress_assignment_idx
  ON economy_private.mission_event_progress (assignment_id, processed_at DESC);

ALTER TABLE economy_private.mission_event_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_event_progress FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE economy_private.mission_event_progress
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER mission_event_progress_immutable
  BEFORE UPDATE OR DELETE ON economy_private.mission_event_progress
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();

CREATE INDEX activity_events_user_occurred_idx
  ON economy_private.activity_events (user_id, occurred_at, event_id);

CREATE INDEX mission_assignments_user_template_status_idx
  ON economy_private.mission_assignments
    (user_id, template_id, template_version, assignment_status, board_id);

CREATE INDEX mission_event_predicate_event_contract_idx
  ON economy_private.mission_event_predicate_mappings
    (source_system, experience_id, activity_id, event_type, validator_version,
     mapping_status, template_id, template_version);

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
    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    -- Only predicates with an explicitly implemented evaluator can advance progress.
    CASE v_mapping.predicate_key
      WHEN 'solve_a_challenge_odd_one_out_v1' THEN
        v_qualifies :=
          economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_event.event_id);
      ELSE
        v_qualifies := false;
    END CASE;
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

CREATE OR REPLACE FUNCTION economy_private.process_mission_board_events(
  p_board_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_board economy_private.mission_boards%ROWTYPE;
  v_event record;
  v_applied integer := 0;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission board backfill requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;
  IF p_board_id IS NULL THEN
    RAISE EXCEPTION 'A mission board is required.'
      USING ERRCODE = '22023';
  END IF;

  -- The board is immutable; do not hold its lock while replaying events.
  -- process_mission_event acquires every affected board/assignment lock in one
  -- deterministic order, avoiding cross-board backfill deadlocks.
  SELECT b.* INTO v_board
  FROM economy_private.mission_boards AS b
  WHERE b.board_id = p_board_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission board was not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Board creation may occur after a player has already completed an eligible
  -- activity in the same period. Replaying the period is safe and idempotent.
  FOR v_event IN
    SELECT e.event_id
    FROM economy_private.activity_events AS e
    WHERE e.user_id = v_board.user_id
      AND e.occurred_at >= v_board.period_start
      AND e.occurred_at < v_board.period_end
    ORDER BY e.occurred_at, e.event_id
  LOOP
    v_applied := v_applied
      + economy_private.process_mission_event(v_event.event_id);
  END LOOP;

  RETURN v_applied;
END;
$$;

CREATE OR REPLACE FUNCTION economy_private.process_new_activity_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM economy_private.process_mission_event(NEW.event_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER activity_events_process_mission_progress
  AFTER INSERT ON economy_private.activity_events
  FOR EACH ROW EXECUTE FUNCTION economy_private.process_new_activity_event();

REVOKE ALL ON FUNCTION economy_private.process_mission_event(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION economy_private.process_mission_board_events(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION economy_private.process_new_activity_event()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.process_mission_event(uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION economy_private.process_mission_board_events(uuid)
  TO service_role;

COMMENT ON TABLE economy_private.mission_event_progress IS
  'Append-only idempotency evidence linking one trusted event to one mission assignment progress application.';
COMMENT ON FUNCTION economy_private.process_mission_event(uuid) IS
  'Service-role-only idempotent processor. Matches exact event contracts, locks board before assignment, and applies only explicitly implemented predicates.';
COMMENT ON FUNCTION economy_private.process_mission_board_events(uuid) IS
  'Service-role-only period backfill for events received before a board and its assignments were created.';
