-- Phase 4A atomic mission-claim contract. Disposable clean-room DB only.
BEGIN;

DO $$
BEGIN
  IF has_function_privilege('anon', 'public.economy_claim_mission_assignment(uuid,uuid)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.economy_claim_mission_assignment(uuid,uuid)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.economy_claim_mission_assignment(uuid,uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Mission assignment claim RPC must be service-role-only';
  END IF;
  IF has_function_privilege('anon', 'public.economy_claim_mission_board_bonus(uuid,uuid)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.economy_claim_mission_board_bonus(uuid,uuid)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.economy_claim_mission_board_bonus(uuid,uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Mission board bonus RPC must be service-role-only';
  END IF;
END;
$$;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f3000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'velorn-phase4a-test@example.invalid',
  '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

INSERT INTO economy_private.mission_template_versions (
  template_id, template_version, period_type, mission_family,
  reward_amount, objective_definition, validator_mapping_status, is_assignable
)
VALUES
  ('phase4a_daily_test', 1, 'daily', 'phase4a_test', 10,
   '{"test":true}'::jsonb, 'verified', true),
  ('phase4a_weekly_test', 1, 'weekly', 'phase4a_test', 20,
   '{"test":true}'::jsonb, 'verified', true);

INSERT INTO economy_private.mission_boards (
  board_id, user_id, period_type, period_start, period_end,
  timezone_name, config_version, template_bank_version
)
VALUES
  ('f3000000-0000-4000-8000-000000000101',
   'f3000000-0000-4000-8000-000000000001',
   'daily', '2026-11-10T00:00:00Z', '2026-11-11T00:00:00Z',
   'UTC', 1, 1),
  ('f3000000-0000-4000-8000-000000000102',
   'f3000000-0000-4000-8000-000000000001',
   'weekly', '2026-11-09T00:00:00Z', '2026-11-16T00:00:00Z',
   'UTC', 1, 1),
  ('f3000000-0000-4000-8000-000000000103',
   'f3000000-0000-4000-8000-000000000001',
   'daily', '2026-11-11T00:00:00Z', '2026-11-12T00:00:00Z',
   'UTC', 1, 1);

INSERT INTO economy_private.mission_assignments (
  assignment_id, board_id, user_id, slot_number, template_id, template_version,
  objective_snapshot, reward_snapshot, assignment_status, completed_at
)
VALUES
  ('f3000000-0000-4000-8000-000000000201', 'f3000000-0000-4000-8000-000000000101', 'f3000000-0000-4000-8000-000000000001', 1, 'phase4a_daily_test', 1, '{"test":1}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000202', 'f3000000-0000-4000-8000-000000000101', 'f3000000-0000-4000-8000-000000000001', 2, 'phase4a_daily_test', 1, '{"test":2}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000203', 'f3000000-0000-4000-8000-000000000101', 'f3000000-0000-4000-8000-000000000001', 3, 'phase4a_daily_test', 1, '{"test":3}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000204', 'f3000000-0000-4000-8000-000000000101', 'f3000000-0000-4000-8000-000000000001', 4, 'phase4a_daily_test', 1, '{"test":4}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000211', 'f3000000-0000-4000-8000-000000000102', 'f3000000-0000-4000-8000-000000000001', 1, 'phase4a_weekly_test', 1, '{"test":1}'::jsonb, 20, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000212', 'f3000000-0000-4000-8000-000000000102', 'f3000000-0000-4000-8000-000000000001', 2, 'phase4a_weekly_test', 1, '{"test":2}'::jsonb, 20, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000213', 'f3000000-0000-4000-8000-000000000102', 'f3000000-0000-4000-8000-000000000001', 3, 'phase4a_weekly_test', 1, '{"test":3}'::jsonb, 20, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000221', 'f3000000-0000-4000-8000-000000000103', 'f3000000-0000-4000-8000-000000000001', 1, 'phase4a_daily_test', 1, '{"test":1}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000222', 'f3000000-0000-4000-8000-000000000103', 'f3000000-0000-4000-8000-000000000001', 2, 'phase4a_daily_test', 1, '{"test":2}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000223', 'f3000000-0000-4000-8000-000000000103', 'f3000000-0000-4000-8000-000000000001', 3, 'phase4a_daily_test', 1, '{"test":3}'::jsonb, 10, 'completed', now()),
  ('f3000000-0000-4000-8000-000000000224', 'f3000000-0000-4000-8000-000000000103', 'f3000000-0000-4000-8000-000000000001', 4, 'phase4a_daily_test', 1, '{"test":4}'::jsonb, 10, 'completed', now());

UPDATE economy_private.economy_settings
SET economy_enabled = true, updated_at = clock_timestamp()
WHERE singleton = true;

DO $$
DECLARE
  v_first uuid;
  v_replay uuid;
  v_bonus uuid;
  v_bonus_replay uuid;
  v_amount bigint;
  v_balance bigint;
  v_ledger_count integer;
  v_claim_count integer;
BEGIN
  -- The daily completion bonus is not available before three paid completions.
  BEGIN
    PERFORM * FROM public.economy_claim_mission_board_bonus(
      'f3000000-0000-4000-8000-000000000001',
      'f3000000-0000-4000-8000-000000000101'
    );
    RAISE EXCEPTION 'Daily bonus must be blocked before three paid mission claims';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  SELECT out_claim_id, out_reward_amount INTO v_first, v_amount
  FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000201'
  );
  IF v_amount <> 10 THEN RAISE EXCEPTION 'Daily mission reward should be 10'; END IF;

  SELECT out_claim_id, out_reward_amount INTO v_replay, v_amount
  FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000201'
  );
  IF v_first <> v_replay OR v_amount <> 10 THEN
    RAISE EXCEPTION 'Mission claim replay must return the original claim without paying twice';
  END IF;

  PERFORM * FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000202'
  );
  PERFORM * FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000203'
  );

  -- The fourth daily completion is optional and cannot exceed the three-mission cap.
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(
      'f3000000-0000-4000-8000-000000000001',
      'f3000000-0000-4000-8000-000000000204'
    );
    RAISE EXCEPTION 'Fourth daily mission must not be rewarded';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  SELECT out_claim_id, out_reward_amount INTO v_bonus, v_amount
  FROM public.economy_claim_mission_board_bonus(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000101'
  );
  IF v_amount <> 10 THEN RAISE EXCEPTION 'Daily completion bonus should be 10'; END IF;

  SELECT out_claim_id INTO v_bonus_replay
  FROM public.economy_claim_mission_board_bonus(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000101'
  );
  IF v_bonus <> v_bonus_replay THEN
    RAISE EXCEPTION 'Daily bonus replay must return the original claim';
  END IF;

  -- Weekly missions pay 20 each; all three unlock the separate 40 bonus.
  PERFORM * FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000211'
  );
  PERFORM * FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000212'
  );
  PERFORM * FROM public.economy_claim_mission_assignment(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000213'
  );
  SELECT out_claim_id, out_reward_amount INTO v_bonus, v_amount
  FROM public.economy_claim_mission_board_bonus(
    'f3000000-0000-4000-8000-000000000001',
    'f3000000-0000-4000-8000-000000000102'
  );
  IF v_amount <> 40 THEN RAISE EXCEPTION 'Weekly completion bonus should be 40'; END IF;

  SELECT balance INTO v_balance
  FROM economy_private.wallets
  WHERE user_id = 'f3000000-0000-4000-8000-000000000001';
  IF v_balance <> 140 THEN
    RAISE EXCEPTION 'Expected daily 40 plus weekly 100 = 140 Velorn; got %', v_balance;
  END IF;

  SELECT count(*) INTO v_ledger_count
  FROM economy_private.wallet_ledger
  WHERE user_id = 'f3000000-0000-4000-8000-000000000001';
  SELECT count(*) INTO v_claim_count
  FROM economy_private.mission_reward_claims
  WHERE user_id = 'f3000000-0000-4000-8000-000000000001';
  IF v_ledger_count <> 8 OR v_claim_count <> 8 THEN
    RAISE EXCEPTION 'Expected eight one-to-one paid claims and ledger entries; claims %, ledger %',
      v_claim_count, v_ledger_count;
  END IF;

  -- Disable the economy and verify failed wallet credit leaves no partial claim.
  UPDATE economy_private.economy_settings
  SET economy_enabled = false, updated_at = clock_timestamp()
  WHERE singleton = true;
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(
      'f3000000-0000-4000-8000-000000000001',
      'f3000000-0000-4000-8000-000000000221'
    );
    RAISE EXCEPTION 'Claim must fail while the economy is disabled';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_reward_claims
    WHERE assignment_id = 'f3000000-0000-4000-8000-000000000221'
  ) THEN
    RAISE EXCEPTION 'Failed wallet operation must not leave a partial paid claim';
  END IF;
  SELECT balance INTO v_balance
  FROM economy_private.wallets
  WHERE user_id = 'f3000000-0000-4000-8000-000000000001';
  IF v_balance <> 140 THEN
    RAISE EXCEPTION 'Failed claim changed the wallet balance';
  END IF;
END;
$$;

ROLLBACK;
