-- Velorn Phase 4A: atomic mission reward claims.
-- Claims and their wallet ledger credits are committed or rolled back together.
-- This does not generate boards, activate templates, or enable the economy.

CREATE OR REPLACE FUNCTION economy_private.claim_mission_assignment(
  p_user_id uuid,
  p_assignment_id uuid
)
RETURNS TABLE (
  out_claim_id uuid,
  out_user_id uuid,
  out_claim_key text,
  out_claim_status text,
  out_reward_amount bigint,
  out_ledger_entry_id uuid,
  out_paid_at timestamptz,
  out_replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_board_id uuid;
  v_board economy_private.mission_boards%ROWTYPE;
  v_assignment economy_private.mission_assignments%ROWTYPE;
  v_template economy_private.mission_template_versions%ROWTYPE;
  v_existing economy_private.mission_reward_claims%ROWTYPE;
  v_config jsonb;
  v_expected_reward bigint;
  v_reward_limit integer;
  v_board_size integer;
  v_assignment_count integer;
  v_paid_count integer;
  v_ledger_entry_id uuid;
  v_claim_id uuid;
  v_claim_key text;
  v_idempotency_key uuid;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission claims require the trusted server role.'
      USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL OR p_assignment_id IS NULL THEN
    RAISE EXCEPTION 'A verified player and assignment are required.'
      USING ERRCODE = '22023';
  END IF;

  -- Resolve the board, then lock board before assignment. Every claim on a board
  -- follows this order, serializing the rewarded-mission cap across concurrent calls.
  SELECT a.board_id INTO v_board_id
  FROM economy_private.mission_assignments AS a
  WHERE a.assignment_id = p_assignment_id
    AND a.user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission assignment was not found for this player.'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT b.* INTO v_board
  FROM economy_private.mission_boards AS b
  WHERE b.board_id = v_board_id
    AND b.user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission board ownership could not be verified.'
      USING ERRCODE = '42501';
  END IF;

  SELECT a.* INTO v_assignment
  FROM economy_private.mission_assignments AS a
  WHERE a.assignment_id = p_assignment_id
    AND a.board_id = v_board.board_id
    AND a.user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission assignment ownership could not be verified.'
      USING ERRCODE = '42501';
  END IF;

  -- A committed claim is the authoritative replay response.
  SELECT c.* INTO v_existing
  FROM economy_private.mission_reward_claims AS c
  WHERE c.assignment_id = p_assignment_id;
  IF FOUND THEN
    IF v_existing.user_id <> p_user_id OR v_existing.claim_status <> 'paid' THEN
      RAISE EXCEPTION 'Existing mission claim is not payable.'
        USING ERRCODE = '55000';
    END IF;
    RETURN QUERY SELECT v_existing.claim_id, v_existing.user_id,
      v_existing.claim_key, v_existing.claim_status, v_existing.reward_amount,
      v_existing.ledger_entry_id, v_existing.paid_at, true;
    RETURN;
  END IF;

  IF v_assignment.assignment_status <> 'completed'
     OR v_assignment.completed_at IS NULL THEN
    RAISE EXCEPTION 'Only a completed mission can be claimed.'
      USING ERRCODE = '55000';
  END IF;

  SELECT t.* INTO v_template
  FROM economy_private.mission_template_versions AS t
  WHERE t.template_id = v_assignment.template_id
    AND t.template_version = v_assignment.template_version;
  IF NOT FOUND
     OR NOT v_template.is_assignable
     OR v_template.validator_mapping_status <> 'verified'
     OR v_template.period_type <> v_board.period_type THEN
    RAISE EXCEPTION 'Mission template is not verified for reward claims.'
      USING ERRCODE = '55000';
  END IF;

  SELECT c.config INTO v_config
  FROM economy_private.economy_config_versions AS c
  WHERE c.config_version = v_board.config_version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Board economy configuration is unavailable.'
      USING ERRCODE = '55000';
  END IF;

  IF v_board.period_type = 'daily' THEN
    v_expected_reward := (v_config #>> '{daily_mission,per_mission}')::bigint;
    v_reward_limit := (v_config #>> '{daily_mission,rewarded_mission_limit}')::integer;
    v_board_size := (v_config #>> '{daily_mission,board_size}')::integer;
  ELSE
    v_expected_reward := (v_config #>> '{weekly_mission,per_mission}')::bigint;
    v_board_size := (v_config #>> '{weekly_mission,board_size}')::integer;
    v_reward_limit := v_board_size;
  END IF;

  IF v_expected_reward IS NULL OR v_expected_reward <= 0
     OR v_reward_limit IS NULL OR v_reward_limit <= 0
     OR v_board_size IS NULL OR v_board_size <= 0
     OR v_assignment.reward_snapshot <> v_expected_reward
     OR v_template.reward_amount <> v_expected_reward THEN
    RAISE EXCEPTION 'Mission reward snapshot does not match its approved configuration.'
      USING ERRCODE = '55000';
  END IF;

  SELECT count(*) INTO v_assignment_count
  FROM economy_private.mission_assignments AS a
  WHERE a.board_id = v_board.board_id
    AND a.user_id = p_user_id;
  IF v_assignment_count <> v_board_size THEN
    RAISE EXCEPTION 'Mission board is incomplete and cannot issue rewards.'
      USING ERRCODE = '55000';
  END IF;

  SELECT count(*) INTO v_paid_count
  FROM economy_private.mission_reward_claims AS c
  JOIN economy_private.mission_assignments AS a
    ON a.assignment_id = c.assignment_id
  WHERE a.board_id = v_board.board_id
    AND c.claim_status = 'paid';
  IF v_paid_count >= v_reward_limit THEN
    RAISE EXCEPTION 'The rewarded mission limit for this board has been reached.'
      USING ERRCODE = '55000';
  END IF;

  v_claim_key := 'mission_assignment:' || p_assignment_id::text;
  v_idempotency_key := md5('velorn:' || v_claim_key)::uuid;

  SELECT p.entry_id INTO v_ledger_entry_id
  FROM public.economy_post_wallet_transaction(
    p_user_id,
    v_assignment.reward_snapshot,
    'credit',
    'mission_reward',
    p_assignment_id::text,
    v_idempotency_key,
    'Completed mission reward',
    v_board.config_version,
    jsonb_build_object(
      'board_id', v_board.board_id,
      'assignment_id', p_assignment_id,
      'period_type', v_board.period_type,
      'template_id', v_assignment.template_id,
      'template_version', v_assignment.template_version
    )
  ) AS p;

  INSERT INTO economy_private.mission_reward_claims (
    user_id, assignment_id, claim_key, reward_amount, claim_status,
    ledger_entry_id, config_version, paid_at
  )
  VALUES (
    p_user_id, p_assignment_id, v_claim_key, v_assignment.reward_snapshot,
    'paid', v_ledger_entry_id, v_board.config_version, clock_timestamp()
  )
  RETURNING mission_reward_claims.claim_id INTO v_claim_id;

  RETURN QUERY
  SELECT c.claim_id, c.user_id, c.claim_key, c.claim_status, c.reward_amount,
         c.ledger_entry_id, c.paid_at, false
  FROM economy_private.mission_reward_claims AS c
  WHERE c.claim_id = v_claim_id;
END;
$$;

CREATE OR REPLACE FUNCTION economy_private.claim_mission_board_bonus(
  p_user_id uuid,
  p_board_id uuid
)
RETURNS TABLE (
  out_claim_id uuid,
  out_user_id uuid,
  out_claim_key text,
  out_claim_status text,
  out_reward_amount bigint,
  out_ledger_entry_id uuid,
  out_paid_at timestamptz,
  out_replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_board economy_private.mission_boards%ROWTYPE;
  v_existing economy_private.mission_reward_claims%ROWTYPE;
  v_config jsonb;
  v_bonus bigint;
  v_required_claims integer;
  v_board_size integer;
  v_assignment_count integer;
  v_paid_count integer;
  v_ledger_entry_id uuid;
  v_claim_id uuid;
  v_claim_key text;
  v_idempotency_key uuid;
  v_reason text;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission bonus claims require the trusted server role.'
      USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL OR p_board_id IS NULL THEN
    RAISE EXCEPTION 'A verified player and mission board are required.'
      USING ERRCODE = '22023';
  END IF;

  SELECT b.* INTO v_board
  FROM economy_private.mission_boards AS b
  WHERE b.board_id = p_board_id
    AND b.user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mission board was not found for this player.'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT c.* INTO v_existing
  FROM economy_private.mission_reward_claims AS c
  WHERE c.board_id = p_board_id;
  IF FOUND THEN
    IF v_existing.user_id <> p_user_id OR v_existing.claim_status <> 'paid' THEN
      RAISE EXCEPTION 'Existing mission bonus claim is not payable.'
        USING ERRCODE = '55000';
    END IF;
    RETURN QUERY SELECT v_existing.claim_id, v_existing.user_id,
      v_existing.claim_key, v_existing.claim_status, v_existing.reward_amount,
      v_existing.ledger_entry_id, v_existing.paid_at, true;
    RETURN;
  END IF;

  SELECT c.config INTO v_config
  FROM economy_private.economy_config_versions AS c
  WHERE c.config_version = v_board.config_version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Board economy configuration is unavailable.'
      USING ERRCODE = '55000';
  END IF;

  IF v_board.period_type = 'daily' THEN
    v_bonus := (v_config #>> '{daily_mission,completion_bonus}')::bigint;
    v_required_claims := (v_config #>> '{daily_mission,rewarded_mission_limit}')::integer;
    v_board_size := (v_config #>> '{daily_mission,board_size}')::integer;
    v_reason := 'Daily mission completion bonus';
  ELSE
    v_bonus := (v_config #>> '{weekly_mission,completion_bonus}')::bigint;
    v_board_size := (v_config #>> '{weekly_mission,board_size}')::integer;
    v_required_claims := v_board_size;
    v_reason := 'Weekly mission completion bonus';
  END IF;

  IF v_bonus IS NULL OR v_bonus <= 0
     OR v_required_claims IS NULL OR v_required_claims <= 0
     OR v_board_size IS NULL OR v_board_size <= 0 THEN
    RAISE EXCEPTION 'Mission completion bonus is not configured.'
      USING ERRCODE = '55000';
  END IF;

  SELECT count(*) INTO v_assignment_count
  FROM economy_private.mission_assignments AS a
  WHERE a.board_id = v_board.board_id
    AND a.user_id = p_user_id;
  IF v_assignment_count <> v_board_size THEN
    RAISE EXCEPTION 'Mission board is incomplete and cannot issue a bonus.'
      USING ERRCODE = '55000';
  END IF;

  SELECT count(*) INTO v_paid_count
  FROM economy_private.mission_reward_claims AS c
  JOIN economy_private.mission_assignments AS a
    ON a.assignment_id = c.assignment_id
  WHERE a.board_id = v_board.board_id
    AND c.claim_status = 'paid';
  IF v_paid_count < v_required_claims THEN
    RAISE EXCEPTION 'The required mission completions have not been claimed.'
      USING ERRCODE = '55000';
  END IF;

  v_claim_key := 'mission_board_bonus:' || p_board_id::text;
  v_idempotency_key := md5('velorn:' || v_claim_key)::uuid;

  SELECT p.entry_id INTO v_ledger_entry_id
  FROM public.economy_post_wallet_transaction(
    p_user_id,
    v_bonus,
    'credit',
    'mission_bonus',
    p_board_id::text,
    v_idempotency_key,
    v_reason,
    v_board.config_version,
    jsonb_build_object(
      'board_id', p_board_id,
      'period_type', v_board.period_type,
      'required_paid_missions', v_required_claims
    )
  ) AS p;

  INSERT INTO economy_private.mission_reward_claims (
    user_id, board_id, claim_key, reward_amount, claim_status,
    ledger_entry_id, config_version, paid_at
  )
  VALUES (
    p_user_id, p_board_id, v_claim_key, v_bonus,
    'paid', v_ledger_entry_id, v_board.config_version, clock_timestamp()
  )
  RETURNING mission_reward_claims.claim_id INTO v_claim_id;

  RETURN QUERY
  SELECT c.claim_id, c.user_id, c.claim_key, c.claim_status, c.reward_amount,
         c.ledger_entry_id, c.paid_at, false
  FROM economy_private.mission_reward_claims AS c
  WHERE c.claim_id = v_claim_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_claim_mission_assignment(
  p_user_id uuid,
  p_assignment_id uuid
)
RETURNS TABLE (
  out_claim_id uuid,
  out_user_id uuid,
  out_claim_key text,
  out_claim_status text,
  out_reward_amount bigint,
  out_ledger_entry_id uuid,
  out_paid_at timestamptz,
  out_replayed boolean
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT *
  FROM economy_private.claim_mission_assignment(p_user_id, p_assignment_id);
$$;

CREATE OR REPLACE FUNCTION public.economy_claim_mission_board_bonus(
  p_user_id uuid,
  p_board_id uuid
)
RETURNS TABLE (
  out_claim_id uuid,
  out_user_id uuid,
  out_claim_key text,
  out_claim_status text,
  out_reward_amount bigint,
  out_ledger_entry_id uuid,
  out_paid_at timestamptz,
  out_replayed boolean
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT *
  FROM economy_private.claim_mission_board_bonus(p_user_id, p_board_id);
$$;

REVOKE ALL ON FUNCTION economy_private.claim_mission_assignment(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION economy_private.claim_mission_board_bonus(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.claim_mission_assignment(uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION economy_private.claim_mission_board_bonus(uuid, uuid)
  TO service_role;

REVOKE ALL ON FUNCTION public.economy_claim_mission_assignment(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.economy_claim_mission_board_bonus(uuid, uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.economy_claim_mission_assignment(uuid, uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.economy_claim_mission_board_bonus(uuid, uuid)
  TO service_role;

COMMENT ON FUNCTION public.economy_claim_mission_assignment(uuid, uuid) IS
  'Service-role-only atomic mission reward claim. The user ID must come from verified server Auth context.';
COMMENT ON FUNCTION public.economy_claim_mission_board_bonus(uuid, uuid) IS
  'Service-role-only atomic daily/weekly mission completion bonus claim.';
