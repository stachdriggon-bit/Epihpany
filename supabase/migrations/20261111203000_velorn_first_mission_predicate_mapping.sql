-- Velorn Phase 4D: first versioned mission predicate mapping.
-- Maps only a completed Odd One Out session in the player-selected Challenge mode.
-- This is a predicate foundation, not an assignment progress writer or reward activation.

CREATE TABLE economy_private.mission_event_predicate_mappings (
  template_id text NOT NULL,
  template_version integer NOT NULL,
  predicate_version integer NOT NULL CHECK (predicate_version > 0),
  predicate_key text NOT NULL CHECK (predicate_key ~ '^[a-z][a-z0-9_]{1,99}$'),
  source_system text NOT NULL,
  experience_id text NOT NULL,
  activity_id text NOT NULL,
  event_type text NOT NULL,
  validator_version text NOT NULL,
  mapping_status text NOT NULL DEFAULT 'mapped'
    CHECK (mapping_status IN ('mapped', 'verified')),
  predicate_definition jsonb NOT NULL CHECK (
    jsonb_typeof(predicate_definition) = 'object'
    AND octet_length(predicate_definition::text) <= 4096
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (template_id, template_version, predicate_version),
  FOREIGN KEY (template_id, template_version)
    REFERENCES economy_private.mission_template_versions(template_id, template_version)
    ON DELETE RESTRICT
);

ALTER TABLE economy_private.mission_event_predicate_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_event_predicate_mappings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE economy_private.mission_event_predicate_mappings
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER mission_event_predicate_mappings_immutable
  BEFORE UPDATE OR DELETE ON economy_private.mission_event_predicate_mappings
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();

-- Add a new immutable template version. Version 1 remains untouched and non-assignable.
-- Version 2 is mapped but intentionally not verified or assignable until the full
-- assignment-progress processor and end-to-end claim path are implemented.
INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family,
  reward_amount, objective_definition, validator_mapping_status, is_assignable
)
SELECT
  t.template_id,
  2,
  t.period_type,
  t.mission_family,
  t.reward_amount,
  t.objective_definition || jsonb_build_object(
    'predicate_key', 'solve_a_challenge_odd_one_out_v1',
    'predicate_scope', 'odd_one_out_challenge_mode',
    'mapping_note', 'A complete server-validated Odd One Out session in Challenge mode; no accuracy threshold is imposed.'
  ),
  'mapped',
  false
FROM economy_private.mission_template_versions AS t
WHERE t.template_id = 'solve_a_challenge'
  AND t.template_version = 1
  AND NOT EXISTS (
    SELECT 1
    FROM economy_private.mission_template_versions AS existing
    WHERE existing.template_id = 'solve_a_challenge'
      AND existing.template_version = 2
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE template_id = 'solve_a_challenge' AND template_version = 2
  ) THEN
    RAISE EXCEPTION 'The approved solve_a_challenge v1 template was not found';
  END IF;
END;
$$;

INSERT INTO economy_private.mission_event_predicate_mappings (
  template_id, template_version, predicate_version, predicate_key,
  source_system, experience_id, activity_id, event_type,
  validator_version, mapping_status, predicate_definition
)
VALUES (
  'solve_a_challenge',
  2,
  1,
  'solve_a_challenge_odd_one_out_v1',
  'think_lab',
  'think_lab',
  'odd_one_out',
  'game_session_completed',
  'odd-one-out-rotated-20261110-v2',
  'mapped',
  '{
    "requires_training_mode": "challenge",
    "challenge_levels": ["A1", "A2", "B1", "B2", "C1", "C2"],
    "question_count": {"minimum": 1, "maximum": 12},
    "evidence_keys": ["challenge_level", "training_mode", "question_count", "correct_count", "incorrect_count"],
    "count_invariant": "correct_count + incorrect_count = question_count",
    "accuracy_threshold": null,
    "completion_source": "server_owned_odd_one_out_session"
  }'::jsonb
);

CREATE OR REPLACE FUNCTION economy_private.evaluate_solve_a_challenge_odd_one_out_v1(
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
  v_challenge_level text;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
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

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Reject any event that does not match the exact trusted validator contract.
  IF v_event.source_system IS DISTINCT FROM 'think_lab'
     OR v_event.experience_id IS DISTINCT FROM 'think_lab'
     OR v_event.activity_id IS DISTINCT FROM 'odd_one_out'
     OR v_event.event_type IS DISTINCT FROM 'game_session_completed'
     OR v_event.validator_version IS DISTINCT FROM 'odd-one-out-rotated-20261110-v2'
     OR v_event.occurred_at > v_event.received_at
     OR jsonb_typeof(v_event.evidence) IS DISTINCT FROM 'object'
     OR (v_event.evidence - ARRAY[
       'challenge_level', 'training_mode', 'question_count',
       'correct_count', 'incorrect_count'
     ]) <> '{}'::jsonb
     OR NOT (v_event.evidence ?& ARRAY[
       'challenge_level', 'training_mode', 'question_count',
       'correct_count', 'incorrect_count'
     ])
     OR jsonb_typeof(v_event.evidence -> 'challenge_level') IS DISTINCT FROM 'string'
     OR jsonb_typeof(v_event.evidence -> 'training_mode') IS DISTINCT FROM 'string'
     OR jsonb_typeof(v_event.evidence -> 'question_count') IS DISTINCT FROM 'number'
     OR jsonb_typeof(v_event.evidence -> 'correct_count') IS DISTINCT FROM 'number'
     OR jsonb_typeof(v_event.evidence -> 'incorrect_count') IS DISTINCT FROM 'number'
     OR (v_event.evidence ->> 'question_count') !~ '^[0-9]{1,2}$'
     OR (v_event.evidence ->> 'correct_count') !~ '^[0-9]{1,2}$'
     OR (v_event.evidence ->> 'incorrect_count') !~ '^[0-9]{1,2}$' THEN
    RETURN false;
  END IF;

  v_challenge_level := v_event.evidence ->> 'challenge_level';
  v_question_count := (v_event.evidence ->> 'question_count')::integer;
  v_correct_count := (v_event.evidence ->> 'correct_count')::integer;
  v_incorrect_count := (v_event.evidence ->> 'incorrect_count')::integer;

  RETURN
    v_event.evidence ->> 'training_mode' = 'challenge'
    AND v_challenge_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
    AND v_question_count BETWEEN 1 AND 12
    AND v_correct_count BETWEEN 0 AND v_question_count
    AND v_incorrect_count BETWEEN 0 AND v_question_count
    AND v_correct_count + v_incorrect_count = v_question_count;
END;
$$;

REVOKE ALL ON FUNCTION economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)
  TO service_role;

COMMENT ON TABLE economy_private.mission_event_predicate_mappings IS
  'Immutable versioned links between approved mission templates and exact trusted event contracts. A mapped predicate is not automatically verified or assignable.';
COMMENT ON FUNCTION economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid) IS
  'Service-role-only fail-closed predicate for a completed server-validated Odd One Out session in Challenge mode. Completion does not impose an accuracy threshold.';
