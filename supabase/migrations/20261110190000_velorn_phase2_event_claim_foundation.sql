-- Velorn Phase 2 foundation: normalized validated activity evidence and claim records.
-- This migration deliberately does not issue rewards, assign live boards, or enable the economy.
-- Game-specific validators and mission predicate mappings must be reviewed before any claims can be paid.

CREATE TABLE economy_private.activity_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  source_event_key uuid NOT NULL,
  source_system text NOT NULL CHECK (source_system ~ '^[a-z][a-z0-9_]{1,39}$'),
  experience_id text NOT NULL CHECK (experience_id ~ '^[a-z][a-z0-9_]{1,59}$'),
  activity_id text NOT NULL CHECK (char_length(activity_id) BETWEEN 1 AND 160),
  event_type text NOT NULL CHECK (event_type ~ '^[a-z][a-z0-9_]{1,59}$'),
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  validator_version text NOT NULL CHECK (char_length(validator_version) BETWEEN 1 AND 80),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (
    jsonb_typeof(evidence) = 'object' AND octet_length(evidence::text) <= 4096
  ),
  CONSTRAINT activity_events_user_source_key UNIQUE (user_id, source_event_key)
);

CREATE INDEX activity_events_user_received_idx
  ON economy_private.activity_events (user_id, received_at DESC, event_id DESC);
CREATE INDEX activity_events_experience_type_idx
  ON economy_private.activity_events (experience_id, event_type, occurred_at DESC);

CREATE TABLE economy_private.mission_template_versions (
  template_id text NOT NULL CHECK (template_id ~ '^[a-z][a-z0-9_]{1,79}$'),
  template_version integer NOT NULL CHECK (template_version > 0),
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  mission_family text NOT NULL CHECK (mission_family ~ '^[a-z][a-z0-9_]{1,59}$'),
  reward_amount bigint NOT NULL CHECK (reward_amount > 0),
  objective_definition jsonb NOT NULL CHECK (
    jsonb_typeof(objective_definition) = 'object'
    AND octet_length(objective_definition::text) <= 4096
  ),
  validator_mapping_status text NOT NULL DEFAULT 'unmapped'
    CHECK (validator_mapping_status IN ('unmapped', 'mapped', 'verified')),
  is_assignable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (template_id, template_version),
  CONSTRAINT mission_template_activation_guard CHECK (
    NOT is_assignable OR validator_mapping_status = 'verified'
  )
);

CREATE TABLE economy_private.achievement_definitions (
  achievement_id text NOT NULL CHECK (achievement_id ~ '^[a-z][a-z0-9_]{1,79}$'),
  stage_id text NOT NULL DEFAULT 'permanent'
    CHECK (stage_id ~ '^[a-z][a-z0-9_]{1,79}$'),
  definition_version integer NOT NULL CHECK (definition_version > 0),
  reward_amount bigint NOT NULL CHECK (reward_amount > 0),
  milestone_definition jsonb NOT NULL CHECK (
    jsonb_typeof(milestone_definition) = 'object'
    AND octet_length(milestone_definition::text) <= 4096
  ),
  validator_mapping_status text NOT NULL DEFAULT 'unmapped'
    CHECK (validator_mapping_status IN ('unmapped', 'mapped', 'verified')),
  is_assignable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (achievement_id, stage_id, definition_version),
  CONSTRAINT achievement_activation_guard CHECK (
    NOT is_assignable OR validator_mapping_status = 'verified'
  )
);

CREATE TABLE economy_private.mission_boards (
  board_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL CHECK (period_end > period_start),
  timezone_name text NOT NULL CHECK (char_length(timezone_name) BETWEEN 1 AND 80),
  config_version smallint NOT NULL
    REFERENCES economy_private.economy_config_versions(config_version),
  template_bank_version integer NOT NULL CHECK (template_bank_version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_type, period_start)
);

CREATE INDEX mission_boards_user_period_idx
  ON economy_private.mission_boards (user_id, period_type, period_start DESC);

CREATE TABLE economy_private.mission_assignments (
  assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES economy_private.mission_boards(board_id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  slot_number smallint NOT NULL CHECK (slot_number BETWEEN 1 AND 4),
  template_id text NOT NULL,
  template_version integer NOT NULL,
  objective_snapshot jsonb NOT NULL CHECK (
    jsonb_typeof(objective_snapshot) = 'object'
    AND octet_length(objective_snapshot::text) <= 4096
  ),
  reward_snapshot bigint NOT NULL CHECK (reward_snapshot > 0),
  progress_value bigint NOT NULL DEFAULT 0 CHECK (progress_value >= 0),
  assignment_status text NOT NULL DEFAULT 'active'
    CHECK (assignment_status IN ('active', 'completed', 'replaced', 'expired')),
  completed_at timestamptz,
  replaced_by uuid REFERENCES economy_private.mission_assignments(assignment_id)
    DEFERRABLE INITIALLY DEFERRED,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (template_id, template_version)
    REFERENCES economy_private.mission_template_versions(template_id, template_version)
    ON DELETE RESTRICT,
  UNIQUE (board_id, slot_number),
  UNIQUE (assignment_id, user_id),
  CONSTRAINT mission_assignment_completion_time_check CHECK (
    (assignment_status = 'completed' AND completed_at IS NOT NULL)
    OR (assignment_status <> 'completed' AND completed_at IS NULL)
  )
);

CREATE INDEX mission_assignments_user_status_idx
  ON economy_private.mission_assignments (user_id, assignment_status, created_at DESC);

CREATE TABLE economy_private.mission_reward_claims (
  claim_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assignment_id uuid NOT NULL,
  claim_key text NOT NULL CHECK (char_length(claim_key) BETWEEN 1 AND 180),
  reward_amount bigint NOT NULL CHECK (reward_amount > 0),
  claim_status text NOT NULL DEFAULT 'eligible'
    CHECK (claim_status IN ('eligible', 'paid', 'blocked')),
  ledger_entry_id uuid REFERENCES economy_private.wallet_ledger(entry_id) ON DELETE RESTRICT,
  config_version smallint NOT NULL
    REFERENCES economy_private.economy_config_versions(config_version),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  FOREIGN KEY (assignment_id, user_id)
    REFERENCES economy_private.mission_assignments(assignment_id, user_id)
    ON DELETE RESTRICT,
  UNIQUE (user_id, claim_key),
  UNIQUE (assignment_id),
  CONSTRAINT mission_claim_ledger_state_check CHECK (
    (claim_status = 'paid' AND ledger_entry_id IS NOT NULL AND paid_at IS NOT NULL)
    OR (claim_status <> 'paid' AND ledger_entry_id IS NULL AND paid_at IS NULL)
  )
);

CREATE TABLE economy_private.achievement_awards (
  award_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  achievement_id text NOT NULL,
  stage_id text NOT NULL,
  definition_version integer NOT NULL,
  qualifying_event_id uuid REFERENCES economy_private.activity_events(event_id) ON DELETE RESTRICT,
  qualifying_reference text NOT NULL
    CHECK (char_length(qualifying_reference) BETWEEN 1 AND 180),
  reward_amount bigint NOT NULL CHECK (reward_amount > 0),
  award_status text NOT NULL DEFAULT 'eligible'
    CHECK (award_status IN ('eligible', 'paid', 'blocked')),
  ledger_entry_id uuid REFERENCES economy_private.wallet_ledger(entry_id) ON DELETE RESTRICT,
  config_version smallint NOT NULL
    REFERENCES economy_private.economy_config_versions(config_version),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  FOREIGN KEY (achievement_id, stage_id, definition_version)
    REFERENCES economy_private.achievement_definitions(
      achievement_id, stage_id, definition_version
    ) ON DELETE RESTRICT,
  UNIQUE (user_id, achievement_id, stage_id),
  CONSTRAINT achievement_award_ledger_state_check CHECK (
    (award_status = 'paid' AND ledger_entry_id IS NOT NULL AND paid_at IS NOT NULL)
    OR (award_status <> 'paid' AND ledger_entry_id IS NULL AND paid_at IS NULL)
  )
);

CREATE INDEX achievement_awards_user_created_idx
  ON economy_private.achievement_awards (user_id, created_at DESC);

-- Private economy tables remain inaccessible to all API roles directly.
ALTER TABLE economy_private.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.activity_events FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_template_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.achievement_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_boards FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.mission_reward_claims FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.achievement_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.achievement_awards FORCE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA economy_private
  FROM PUBLIC, anon, authenticated, service_role;

-- Event, definition, board and claim history cannot be rewritten or deleted.
CREATE TRIGGER activity_events_append_only
  BEFORE UPDATE OR DELETE ON economy_private.activity_events
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();
CREATE TRIGGER mission_template_versions_immutable
  BEFORE UPDATE OR DELETE ON economy_private.mission_template_versions
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();
CREATE TRIGGER achievement_definitions_immutable
  BEFORE UPDATE OR DELETE ON economy_private.achievement_definitions
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();
CREATE TRIGGER mission_boards_immutable
  BEFORE UPDATE OR DELETE ON economy_private.mission_boards
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();
CREATE TRIGGER mission_reward_claims_append_only
  BEFORE UPDATE OR DELETE ON economy_private.mission_reward_claims
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();
CREATE TRIGGER achievement_awards_append_only
  BEFORE UPDATE OR DELETE ON economy_private.achievement_awards
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();

CREATE OR REPLACE FUNCTION economy_private.record_validated_activity_event(
  p_user_id uuid,
  p_source_event_key uuid,
  p_source_system text,
  p_experience_id text,
  p_activity_id text,
  p_event_type text,
  p_occurred_at timestamptz,
  p_validator_version text,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  event_id uuid,
  user_id uuid,
  source_event_key uuid,
  source_system text,
  experience_id text,
  activity_id text,
  event_type text,
  occurred_at timestamptz,
  received_at timestamptz,
  validator_version text,
  evidence jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing economy_private.activity_events%ROWTYPE;
  v_event_id uuid;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Validated activity ingestion requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NULL OR p_source_event_key IS NULL
     OR p_source_system IS NULL OR p_source_system !~ '^[a-z][a-z0-9_]{1,39}$'
     OR p_experience_id IS NULL OR p_experience_id !~ '^[a-z][a-z0-9_]{1,59}$'
     OR p_activity_id IS NULL OR char_length(p_activity_id) NOT BETWEEN 1 AND 160
     OR p_event_type IS NULL OR p_event_type !~ '^[a-z][a-z0-9_]{1,59}$'
     OR p_occurred_at IS NULL
     OR p_validator_version IS NULL OR char_length(p_validator_version) NOT BETWEEN 1 AND 80
     OR p_evidence IS NULL OR jsonb_typeof(p_evidence) <> 'object'
     OR octet_length(p_evidence::text) > 4096 THEN
    RAISE EXCEPTION 'Validated activity event payload is invalid.'
      USING ERRCODE = '22023';
  END IF;

  SELECT e.* INTO v_existing
  FROM economy_private.activity_events AS e
  WHERE e.user_id = p_user_id
    AND e.source_event_key = p_source_event_key;

  IF FOUND THEN
    IF v_existing.source_system <> p_source_system
       OR v_existing.experience_id <> p_experience_id
       OR v_existing.activity_id <> p_activity_id
       OR v_existing.event_type <> p_event_type
       OR v_existing.occurred_at <> p_occurred_at
       OR v_existing.validator_version <> p_validator_version
       OR v_existing.evidence <> p_evidence THEN
      RAISE EXCEPTION 'Activity event key was already used for a different payload.'
        USING ERRCODE = '22023';
    END IF;
    RETURN QUERY
      SELECT e.event_id, e.user_id, e.source_event_key, e.source_system,
             e.experience_id, e.activity_id, e.event_type, e.occurred_at,
             e.received_at, e.validator_version, e.evidence
      FROM economy_private.activity_events AS e
      WHERE e.event_id = v_existing.event_id;
    RETURN;
  END IF;

  INSERT INTO economy_private.activity_events (
    user_id, source_event_key, source_system, experience_id, activity_id,
    event_type, occurred_at, validator_version, evidence
  )
  VALUES (
    p_user_id, p_source_event_key, p_source_system, p_experience_id, p_activity_id,
    p_event_type, p_occurred_at, p_validator_version, p_evidence
  )
  RETURNING activity_events.event_id INTO v_event_id;

  RETURN QUERY
    SELECT e.event_id, e.user_id, e.source_event_key, e.source_system,
           e.experience_id, e.activity_id, e.event_type, e.occurred_at,
           e.received_at, e.validator_version, e.evidence
    FROM economy_private.activity_events AS e
    WHERE e.event_id = v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_record_validated_activity_event(
  p_user_id uuid,
  p_source_event_key uuid,
  p_source_system text,
  p_experience_id text,
  p_activity_id text,
  p_event_type text,
  p_occurred_at timestamptz,
  p_validator_version text,
  p_evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  event_id uuid,
  user_id uuid,
  source_event_key uuid,
  source_system text,
  experience_id text,
  activity_id text,
  event_type text,
  occurred_at timestamptz,
  received_at timestamptz,
  validator_version text,
  evidence jsonb
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT *
  FROM economy_private.record_validated_activity_event(
    p_user_id, p_source_event_key, p_source_system, p_experience_id,
    p_activity_id, p_event_type, p_occurred_at, p_validator_version, p_evidence
  );
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA economy_private
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.record_validated_activity_event(
  uuid, uuid, text, text, text, text, timestamptz, text, jsonb
) TO service_role;

REVOKE ALL ON FUNCTION public.economy_record_validated_activity_event(
  uuid, uuid, text, text, text, text, timestamptz, text, jsonb
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.economy_record_validated_activity_event(
  uuid, uuid, text, text, text, text, timestamptz, text, jsonb
) TO service_role;

COMMENT ON TABLE economy_private.activity_events IS
  'Immutable, server-validated activity evidence. Client payloads are never accepted as validation.';
COMMENT ON TABLE economy_private.mission_template_versions IS
  'Versioned approved mission bank definitions. Assignability requires a verified server validator mapping.';
COMMENT ON TABLE economy_private.achievement_definitions IS
  'Versioned achievement milestones. Assignability requires a verified server validator mapping.';
COMMENT ON TABLE economy_private.mission_boards IS
  'Stable immutable daily/weekly board periods; no player-facing board API is enabled in Phase 2 foundation.';
COMMENT ON TABLE economy_private.mission_reward_claims IS
  'One-time mission reward claim records. No claim writer or reward issuance is enabled in this foundation.';
COMMENT ON TABLE economy_private.achievement_awards IS
  'One-time achievement milestone awards. No award writer or reward issuance is enabled in this foundation.';
