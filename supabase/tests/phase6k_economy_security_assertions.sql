-- Phase 6K: adversarial economy security, claim integrity, and ledger reconciliation.
-- Disposable clean-room database only. Every fixture and test credit is rolled back.
BEGIN;

INSERT INTO auth.users (
  id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) VALUES
(
  'f6c10000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6k-owner@example.invalid','',now(),
  '{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()
),
(
  'f6c10000-0000-4000-8000-000000000002',
  'authenticated','authenticated','velorn-phase6k-other@example.invalid','',now(),
  '{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()
);

SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);

DO $phase6k$
DECLARE
  v_user uuid := 'f6c10000-0000-4000-8000-000000000001';
  v_other uuid := 'f6c10000-0000-4000-8000-000000000002';
  v_board uuid := 'f6c10000-0000-4000-8000-000000000101';
  v_incomplete_board uuid := 'f6c10000-0000-4000-8000-000000000102';
  v_assignment uuid := 'f6c10000-0000-4000-8000-000000000201';
  v_claim uuid;
  v_replay uuid;
  v_bonus uuid;
  v_bonus_replay uuid;
  v_ledger uuid;
  v_balance bigint;
  v_amount bigint;
  v_replayed boolean;
  v_count integer;
  v_function text;
BEGIN
  -- Baseline: the economy is off, and all private data remains inaccessible directly.
  UPDATE economy_private.economy_settings
  SET economy_enabled=false,updated_at=clock_timestamp()
  WHERE singleton=true;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6K must start with the economy disabled';
  END IF;

  IF has_schema_privilege('anon','economy_private','USAGE')
     OR has_schema_privilege('authenticated','economy_private','USAGE')
     OR NOT has_schema_privilege('service_role','economy_private','USAGE') THEN
    RAISE EXCEPTION 'Private schema access boundary is incorrect';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(ARRAY[
      'economy_private.wallets',
      'economy_private.wallet_ledger',
      'economy_private.activity_events',
      'economy_private.mission_boards',
      'economy_private.mission_assignments',
      'economy_private.mission_reward_claims',
      'economy_private.mission_event_progress',
      'economy_private.mission_assignment_evidence'
    ]) AS t(name)
    WHERE has_table_privilege('anon',t.name,'SELECT')
       OR has_table_privilege('authenticated',t.name,'SELECT')
       OR has_table_privilege('service_role',t.name,'SELECT')
  ) THEN
    RAISE EXCEPTION 'Private economy tables must not expose direct SELECT to API roles';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='economy_private'
      AND c.relname IN (
        'wallets','wallet_ledger','activity_events','mission_boards',
        'mission_assignments','mission_reward_claims',
        'mission_event_progress','mission_assignment_evidence'
      )
      AND (NOT c.relrowsecurity OR NOT c.relforcerowsecurity)
  ) THEN
    RAISE EXCEPTION 'Every protected economy table must enforce RLS';
  END IF;

  FOREACH v_function IN ARRAY ARRAY[
    'public.economy_post_wallet_transaction(uuid,bigint,text,text,text,uuid,text,smallint,jsonb)',
    'public.economy_claim_mission_assignment(uuid,uuid)',
    'public.economy_claim_mission_board_bonus(uuid,uuid)',
    'public.economy_record_validated_activity_event(uuid,uuid,text,text,text,text,timestamptz,text,jsonb)',
    'public.economy_generate_mission_board(uuid,text,timestamptz)'
  ] LOOP
    IF has_function_privilege('anon',v_function,'EXECUTE')
       OR has_function_privilege('authenticated',v_function,'EXECUTE')
       OR NOT has_function_privilege('service_role',v_function,'EXECUTE') THEN
      RAISE EXCEPTION 'RPC privilege boundary is incorrect for %',v_function;
    END IF;
  END LOOP;

  -- Create one complete daily board and one deliberately incomplete board.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  ) VALUES (
    'phase6k_daily_security',1,'daily','phase6k_security',10,
    '{"security_test":true}'::jsonb,'verified',true
  );

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,
    timezone_name,config_version,template_bank_version
  ) VALUES
  (
    v_board,v_user,'daily','2026-11-14 00:00:00+00','2026-11-15 00:00:00+00',
    'UTC',1,1
  ),
  (
    v_incomplete_board,v_user,'daily','2026-11-15 00:00:00+00','2026-11-16 00:00:00+00',
    'UTC',1,1
  );

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot,assignment_status,completed_at
  ) VALUES
  ('f6c10000-0000-4000-8000-000000000201',v_board,v_user,1,'phase6k_daily_security',1,'{"slot":1}'::jsonb,10,'completed',now()),
  ('f6c10000-0000-4000-8000-000000000202',v_board,v_user,2,'phase6k_daily_security',1,'{"slot":2}'::jsonb,10,'completed',now()),
  ('f6c10000-0000-4000-8000-000000000203',v_board,v_user,3,'phase6k_daily_security',1,'{"slot":3}'::jsonb,10,'completed',now()),
  ('f6c10000-0000-4000-8000-000000000204',v_board,v_user,4,'phase6k_daily_security',1,'{"slot":4}'::jsonb,10,'completed',now()),
  ('f6c10000-0000-4000-8000-000000000211',v_incomplete_board,v_user,1,'phase6k_daily_security',1,'{"slot":1}'::jsonb,10,'completed',now());

  -- The role claim is the trusted boundary even when SQL is invoked from a server context.
  PERFORM set_config('request.jwt.claim.role','authenticated',true);
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(v_user,v_assignment);
    RAISE EXCEPTION 'Untrusted JWT role must not claim a mission';
  EXCEPTION WHEN SQLSTATE '42501' THEN
    NULL;
  END;
  BEGIN
    PERFORM * FROM public.economy_post_wallet_transaction(
      v_user,5::bigint,'credit','test','phase6k-untrusted',
      'f6c10000-0000-4000-8000-000000000301','untrusted attempt',NULL::smallint,'{}'::jsonb
    );
    RAISE EXCEPTION 'Untrusted JWT role must not post a wallet transaction';
  EXCEPTION WHEN SQLSTATE '42501' THEN
    NULL;
  END;
  PERFORM set_config('request.jwt.claim.role','service_role',true);

  UPDATE economy_private.economy_settings
  SET economy_enabled=true,updated_at=clock_timestamp()
  WHERE singleton=true;

  -- A service caller cannot redirect a claim to a different account.
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(v_other,v_assignment);
    RAISE EXCEPTION 'Cross-account assignment claim must be rejected';
  EXCEPTION WHEN SQLSTATE 'P0002' THEN
    NULL;
  END;

  -- Reward snapshots are not trusted: the claim must match both the immutable template
  -- version and the board's pinned economy configuration.
  UPDATE economy_private.mission_assignments
  SET reward_snapshot=11
  WHERE assignment_id=v_assignment;
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(v_user,v_assignment);
    RAISE EXCEPTION 'Tampered reward snapshot must be rejected';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
  UPDATE economy_private.mission_assignments
  SET reward_snapshot=10
  WHERE assignment_id=v_assignment;

  -- An incomplete board cannot issue an assignment reward.
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(
      v_user,'f6c10000-0000-4000-8000-000000000211'
    );
    RAISE EXCEPTION 'An incomplete board must not issue mission rewards';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  -- A successful claim is one atomic claim + one ledger credit; replay is a no-op.
  SELECT out_claim_id,out_reward_amount,out_ledger_entry_id,out_replayed
  INTO v_claim,v_amount,v_ledger,v_replayed
  FROM public.economy_claim_mission_assignment(v_user,v_assignment);
  IF v_amount<>10 OR v_ledger IS NULL OR v_replayed THEN
    RAISE EXCEPTION 'First valid claim must issue exactly the configured 10 Velorn';
  END IF;

  SELECT out_claim_id,out_reward_amount,out_replayed
  INTO v_replay,v_amount,v_replayed
  FROM public.economy_claim_mission_assignment(v_user,v_assignment);
  IF v_replay IS DISTINCT FROM v_claim OR v_amount<>10 OR NOT v_replayed THEN
    RAISE EXCEPTION 'Assignment claim replay must return the original paid claim';
  END IF;

  -- Reusing the wallet idempotency key with a different payload must be rejected.
  BEGIN
    PERFORM * FROM public.economy_post_wallet_transaction(
      v_user,11::bigint,'credit','mission_reward',v_assignment::text,
      md5('velorn:mission_assignment:'||v_assignment::text)::uuid,
      'Completed mission reward',1::smallint,
      jsonb_build_object('board_id',v_board,'assignment_id',v_assignment,
        'period_type','daily','template_id','phase6k_daily_security','template_version',1)
    );
    RAISE EXCEPTION 'A mismatched wallet idempotency payload must be rejected';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;

  -- Bonus eligibility requires three paid daily mission claims, not mere completion.
  BEGIN
    PERFORM * FROM public.economy_claim_mission_board_bonus(v_user,v_board);
    RAISE EXCEPTION 'Daily bonus must be blocked before three assignment claims';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  PERFORM * FROM public.economy_claim_mission_assignment(
    v_user,'f6c10000-0000-4000-8000-000000000202'
  );
  PERFORM * FROM public.economy_claim_mission_assignment(
    v_user,'f6c10000-0000-4000-8000-000000000203'
  );

  -- The fourth assignment remains completed but is not eligible for a daily payout.
  BEGIN
    PERFORM * FROM public.economy_claim_mission_assignment(
      v_user,'f6c10000-0000-4000-8000-000000000204'
    );
    RAISE EXCEPTION 'Daily rewarded-mission cap must reject the fourth claim';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  SELECT out_claim_id,out_reward_amount INTO v_bonus,v_amount
  FROM public.economy_claim_mission_board_bonus(v_user,v_board);
  IF v_amount<>10 THEN
    RAISE EXCEPTION 'Daily completion bonus must match the pinned configuration';
  END IF;

  SELECT out_claim_id INTO v_bonus_replay
  FROM public.economy_claim_mission_board_bonus(v_user,v_board);
  IF v_bonus_replay IS DISTINCT FROM v_bonus THEN
    RAISE EXCEPTION 'Daily bonus replay must return the original claim';
  END IF;

  -- Ledger and claims are append-only; wallet balance must reconcile exactly.
  BEGIN
    UPDATE economy_private.wallet_ledger SET reason='tampered'
    WHERE entry_id=v_ledger;
    RAISE EXCEPTION 'Wallet ledger UPDATE must be blocked';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
  BEGIN
    DELETE FROM economy_private.wallet_ledger WHERE entry_id=v_ledger;
    RAISE EXCEPTION 'Wallet ledger DELETE must be blocked';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
  BEGIN
    UPDATE economy_private.mission_reward_claims SET reward_amount=999
    WHERE claim_id=v_claim;
    RAISE EXCEPTION 'Mission reward claim UPDATE must be blocked';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
  BEGIN
    DELETE FROM economy_private.mission_reward_claims WHERE claim_id=v_claim;
    RAISE EXCEPTION 'Mission reward claim DELETE must be blocked';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  SELECT balance INTO v_balance FROM economy_private.wallets WHERE user_id=v_user;
  SELECT count(*) INTO v_count FROM economy_private.wallet_ledger WHERE user_id=v_user;
  IF v_balance<>40 OR v_count<>4 THEN
    RAISE EXCEPTION 'Expected three 10 Velorn mission credits and one 10 bonus; balance %, entries %',v_balance,v_count;
  END IF;
  SELECT count(*) INTO v_count FROM economy_private.mission_reward_claims WHERE user_id=v_user;
  IF v_count<>4 THEN
    RAISE EXCEPTION 'Expected exactly four paid claim records; found %',v_count;
  END IF;
  IF EXISTS (SELECT 1 FROM public.economy_reconcile_wallets()) THEN
    RAISE EXCEPTION 'Wallet reconciliation found a balance/ledger mismatch';
  END IF;

  -- Disabling the feature gate prevents all new money movement and leaves no partial writes.
  UPDATE economy_private.economy_settings
  SET economy_enabled=false,updated_at=clock_timestamp()
  WHERE singleton=true;

  BEGIN
    PERFORM * FROM public.economy_post_wallet_transaction(
      v_user,5::bigint,'credit','test','phase6k-disabled-write',
      'f6c10000-0000-4000-8000-000000000302','disabled test',NULL::smallint,'{}'::jsonb
    );
    RAISE EXCEPTION 'Wallet writes must be blocked after disabling the economy';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  -- A retry of an already-paid claim may return its original receipt, but cannot pay again.
  SELECT out_claim_id INTO v_replay
  FROM public.economy_claim_mission_assignment(v_user,v_assignment);
  IF v_replay IS DISTINCT FROM v_claim THEN
    RAISE EXCEPTION 'Disabled-economy claim replay must not create a new receipt';
  END IF;

  SELECT balance INTO v_balance FROM economy_private.wallets WHERE user_id=v_user;
  SELECT count(*) INTO v_count FROM economy_private.wallet_ledger WHERE user_id=v_user;
  IF v_balance<>40 OR v_count<>4 THEN
    RAISE EXCEPTION 'Disabled write attempt changed the balance or ledger';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=v_other)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=v_other)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id IN (v_user,v_other)) THEN
    RAISE EXCEPTION 'Rejected cross-account operations must not create financial or achievement records';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6K must leave the economy gate disabled';
  END IF;
END;
$phase6k$;

ROLLBACK;
