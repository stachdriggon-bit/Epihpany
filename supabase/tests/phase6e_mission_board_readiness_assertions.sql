-- Phase 6E: prove the seven approved Think Lab missions can fill complete boards safely.
-- Immutable catalog rows are never modified: verified candidates are isolated test copies.
-- The economy gate is enabled only inside this transaction and is rolled back at the end.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f6e00000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6e@example.invalid','',now(),
  '{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase6e$
DECLARE
  v_user uuid := 'f6e00000-0000-4000-8000-000000000001';
  v_reference timestamptz := '2026-11-13 12:00:00+00';
  v_daily_board uuid;
  v_weekly_board uuid;
  v_repeat_board uuid;
  v_status text;
  v_key text;
  v_count integer;
  v_templates text[];
  v_family_count integer;
  v_predicate_count integer;
  v_daily_expected text[] := ARRAY[
    'phase6e_learning_step','phase6e_put_knowledge_to_use',
    'phase6e_try_something_different','solve_a_challenge'
  ]::text[];
  v_weekly_expected text[] := ARRAY[
    'phase6e_broaden_your_experience','phase6e_consistent_progress',
    'phase6e_meaningful_progress'
  ]::text[];
BEGIN
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6E must start with the economy disabled';
  END IF;

  IF has_function_privilege('anon','public.economy_generate_mission_board(uuid,text,timestamptz)','EXECUTE')
     OR has_function_privilege('authenticated','public.economy_generate_mission_board(uuid,text,timestamptz)','EXECUTE')
     OR NOT has_function_privilege('service_role','public.economy_generate_mission_board(uuid,text,timestamptz)','EXECUTE') THEN
    RAISE EXCEPTION 'Board generation must remain service-role-only';
  END IF;

  -- Insert only four verified test candidates first: two daily and two weekly.
  -- The source catalog is append-only and remains unchanged.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT
    'phase6e_' || t.template_id,t.template_version,t.period_type,t.mission_family,
    t.reward_amount,t.objective_definition,'verified',true
  FROM economy_private.mission_template_versions AS t
  WHERE (t.template_id,t.template_version) IN (
    ('learning_step',2),('try_something_different',2),
    ('consistent_progress',2),('broaden_your_experience',2)
  );

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT
    'phase6e_' || m.template_id,m.template_version,m.predicate_version,m.predicate_key,
    m.source_system,m.experience_id,m.activity_id,m.event_type,m.validator_version,
    'verified',m.predicate_definition
  FROM economy_private.mission_event_predicate_mappings AS m
  WHERE (m.template_id,m.template_version) IN (
    ('learning_step',2),('try_something_different',2),
    ('consistent_progress',2),('broaden_your_experience',2)
  );

  -- Generator's economy gate is opened only in this rolled-back test transaction.
  UPDATE economy_private.economy_settings
  SET economy_enabled=true
  WHERE singleton;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_daily_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);

  IF v_daily_board IS NOT NULL OR v_status <> 'not_ready' OR v_count <> 0 THEN
    RAISE EXCEPTION 'Two eligible daily templates must return not_ready without a partial board';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_weekly_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly',v_reference);

  IF v_weekly_board IS NOT NULL OR v_status <> 'not_ready' OR v_count <> 0 THEN
    RAISE EXCEPTION 'Two eligible weekly templates must return not_ready without a partial board';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.mission_boards WHERE user_id=v_user) THEN
    RAISE EXCEPTION 'Insufficient candidate pools must not leave partial mission boards';
  END IF;

  -- Append the remaining three verified test candidates to complete the exact 4+3 pool.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT
    'phase6e_' || t.template_id,t.template_version,t.period_type,t.mission_family,
    t.reward_amount,t.objective_definition,'verified',true
  FROM economy_private.mission_template_versions AS t
  WHERE (t.template_id,t.template_version) IN (
    ('solve_a_challenge',5),('put_knowledge_to_use',2),('meaningful_progress',2)
  );

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT
    'phase6e_' || m.template_id,m.template_version,m.predicate_version,m.predicate_key,
    m.source_system,m.experience_id,m.activity_id,m.event_type,m.validator_version,
    'verified',m.predicate_definition
  FROM economy_private.mission_event_predicate_mappings AS m
  WHERE (m.template_id,m.template_version) IN (
    ('solve_a_challenge',5),('put_knowledge_to_use',2),('meaningful_progress',2)
  );

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_daily_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);

  IF v_daily_board IS NULL OR v_status <> 'created' OR v_count <> 4 THEN
    RAISE EXCEPTION 'A complete verified daily pool must create exactly four assignments';
  END IF;

  SELECT array_agg(template_id ORDER BY template_id),
         count(DISTINCT objective_snapshot ->> 'mission_family')::integer,
         count(DISTINCT objective_snapshot ->> 'predicate_key')::integer
  INTO v_templates,v_family_count,v_predicate_count
  FROM economy_private.mission_assignments
  WHERE board_id=v_daily_board;

  IF (v_templates IS DISTINCT FROM v_daily_expected
      AND v_templates IS DISTINCT FROM ARRAY[
        'phase6e_learning_step','phase6e_put_knowledge_to_use',
        'phase6e_try_something_different','phase6e_solve_a_challenge'
      ]::text[])
     OR v_family_count <> 4 OR v_predicate_count <> 4
     OR EXISTS (
       SELECT 1 FROM economy_private.mission_assignments
       WHERE board_id=v_daily_board AND reward_snapshot <> 10
     ) THEN
    RAISE EXCEPTION 'Daily board assertion failed: templates=%, families=%, predicates=%, reward_mismatches=%',
      v_templates, v_family_count, v_predicate_count,
      (SELECT count(*) FROM economy_private.mission_assignments
       WHERE board_id=v_daily_board AND reward_snapshot <> 10);
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_weekly_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly',v_reference);

  IF v_weekly_board IS NULL OR v_status <> 'created' OR v_count <> 3 THEN
    RAISE EXCEPTION 'A complete verified weekly pool must create exactly three assignments';
  END IF;

  SELECT array_agg(template_id ORDER BY template_id),
         count(DISTINCT objective_snapshot ->> 'mission_family')::integer,
         count(DISTINCT objective_snapshot ->> 'predicate_key')::integer
  INTO v_templates,v_family_count,v_predicate_count
  FROM economy_private.mission_assignments
  WHERE board_id=v_weekly_board;

  IF v_templates IS DISTINCT FROM v_weekly_expected
     OR v_family_count <> 3 OR v_predicate_count <> 3
     OR EXISTS (
       SELECT 1 FROM economy_private.mission_assignments
       WHERE board_id=v_weekly_board AND reward_snapshot <> 20
     ) THEN
    RAISE EXCEPTION 'Weekly board must contain the three distinct approved families/predicates with the approved reward snapshot';
  END IF;

  -- Repeated requests must return the same complete boards, not duplicate them.
  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_repeat_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);

  IF v_repeat_board IS DISTINCT FROM v_daily_board OR v_status <> 'existing' OR v_count <> 4 THEN
    RAISE EXCEPTION 'Daily board generation must be idempotent';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_repeat_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly',v_reference);

  IF v_repeat_board IS DISTINCT FROM v_weekly_board OR v_status <> 'existing' OR v_count <> 3 THEN
    RAISE EXCEPTION 'Weekly board generation must be idempotent';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_boards WHERE user_id=v_user) <> 2
     OR (SELECT count(*) FROM economy_private.mission_assignments WHERE user_id=v_user) <> 7 THEN
    RAISE EXCEPTION 'Exactly two complete boards and seven assignments must exist';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=v_user) THEN
    RAISE EXCEPTION 'Board generation must never create wallets, ledger entries, rewards, or achievement awards';
  END IF;
END;
$phase6e$;

ROLLBACK;
