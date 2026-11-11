-- Velorn Phase 4F: safe, idempotent mission board generation contract.
-- Disposable clean-room DB only.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('f4f00000-0000-4000-8000-000000000051','authenticated','authenticated','velorn-phase4f-a@example.invalid','',now(),'{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase4f$
DECLARE
  v_user uuid := 'f4f00000-0000-4000-8000-000000000051';
  v_reference timestamptz := '2026-11-11 12:00:00+00';
  v_board uuid;
  v_status text;
  v_key text;
  v_count integer;
  v_repeat_board uuid;
  v_repeat_status text;
  v_repeat_key text;
  v_repeat_count integer;
  v_daily_index integer;
  v_weekly_index integer;
  v_template_id text;
  v_family text;
  v_predicate text;
  v_function_name text;
  v_assignment_id uuid;
  v_event_id uuid := 'f4f00000-0000-4000-8000-000000000091';
  v_source_system text;
  v_experience_id text;
  v_activity_id text;
  v_event_type text;
  v_validator_version text;
BEGIN
  IF has_function_privilege('anon','public.economy_generate_mission_board(uuid,text,timestamptz)','EXECUTE')
     OR has_function_privilege('authenticated','public.economy_generate_mission_board(uuid,text,timestamptz)','EXECUTE')
     OR NOT has_function_privilege('service_role','public.economy_generate_mission_board(uuid,text,timestamptz)','EXECUTE')
  THEN RAISE EXCEPTION 'Mission board generation must be service-role-only'; END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'The clean-room economy must begin disabled'; END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);
  IF v_board IS NOT NULL OR v_status <> 'disabled' OR v_count <> 0
  THEN RAISE EXCEPTION 'Disabled economy must prevent board generation'; END IF;

  UPDATE economy_private.economy_settings SET economy_enabled = true WHERE singleton;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);
  IF v_board IS NOT NULL OR v_status <> 'not_ready' OR v_count <> 0
  THEN RAISE EXCEPTION 'An insufficient verified daily pool must not create a board'; END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly',v_reference);
  IF v_board IS NOT NULL OR v_status <> 'not_ready' OR v_count <> 0
  THEN RAISE EXCEPTION 'An insufficient verified weekly pool must not create a board'; END IF;

  FOR v_daily_index IN 1..3 LOOP
    v_template_id := format('f4f_daily_%s',v_daily_index);
    v_family := format('f4f_daily_family_%s',v_daily_index);
    v_predicate := format('f4f_daily_predicate_%s_v1',v_daily_index);
    v_function_name := 'evaluate_' || v_predicate;

    EXECUTE format(
      'CREATE FUNCTION economy_private.%I(uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '''' AS %L',
      v_function_name, 'SELECT true'
    );
    EXECUTE format('REVOKE ALL ON FUNCTION economy_private.%I(uuid) FROM PUBLIC, anon, authenticated, service_role',v_function_name);
    EXECUTE format('GRANT EXECUTE ON FUNCTION economy_private.%I(uuid) TO service_role',v_function_name);

    INSERT INTO economy_private.mission_template_versions (
      template_id,template_version,period_type,mission_family,reward_amount,
      objective_definition,validator_mapping_status,is_assignable
    ) VALUES (
      v_template_id,1,'daily',v_family,10,
      jsonb_build_object('summary','Temporary Phase 4F test mission','predicate_key',v_predicate),
      'verified',true
    );

    INSERT INTO economy_private.mission_event_predicate_mappings (
      template_id,template_version,predicate_version,predicate_key,
      source_system,experience_id,activity_id,event_type,validator_version,
      mapping_status,predicate_definition
    ) VALUES (
      v_template_id,1,1,v_predicate,'phase4f','phase4f',v_template_id,
      'test_completed','phase4f-test-v1','verified',
      jsonb_build_object('test_only',true)
    );
  END LOOP;

  FOR v_weekly_index IN 1..3 LOOP
    v_template_id := format('f4f_weekly_%s',v_weekly_index);
    v_family := format('f4f_weekly_family_%s',v_weekly_index);
    v_predicate := format('f4f_weekly_predicate_%s_v1',v_weekly_index);
    v_function_name := 'evaluate_' || v_predicate;

    EXECUTE format(
      'CREATE FUNCTION economy_private.%I(uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '''' AS %L',
      v_function_name, 'SELECT true'
    );
    EXECUTE format('REVOKE ALL ON FUNCTION economy_private.%I(uuid) FROM PUBLIC, anon, authenticated, service_role',v_function_name);
    EXECUTE format('GRANT EXECUTE ON FUNCTION economy_private.%I(uuid) TO service_role',v_function_name);

    INSERT INTO economy_private.mission_template_versions (
      template_id,template_version,period_type,mission_family,reward_amount,
      objective_definition,validator_mapping_status,is_assignable
    ) VALUES (
      v_template_id,1,'weekly',v_family,20,
      jsonb_build_object('summary','Temporary Phase 4F test mission','predicate_key',v_predicate),
      'verified',true
    );

    INSERT INTO economy_private.mission_event_predicate_mappings (
      template_id,template_version,predicate_version,predicate_key,
      source_system,experience_id,activity_id,event_type,validator_version,
      mapping_status,predicate_definition
    ) VALUES (
      v_template_id,1,1,v_predicate,'phase4f','phase4f',v_template_id,
      'test_completed','phase4f-test-v1','verified',
      jsonb_build_object('test_only',true)
    );
  END LOOP;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);
  IF v_board IS NULL OR v_status <> 'created' OR v_count <> 4
  THEN RAISE EXCEPTION 'A complete verified daily pool must create exactly four slots'; END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_repeat_board,v_repeat_status,v_repeat_key,v_repeat_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);
  IF v_repeat_board <> v_board OR v_repeat_status <> 'existing'
     OR v_repeat_key <> v_key OR v_repeat_count <> 4
  THEN RAISE EXCEPTION 'Daily board generation must be idempotent for the same period'; END IF;

  IF (SELECT count(*) FROM economy_private.mission_assignments WHERE board_id=v_board) <> 4
     OR (SELECT count(DISTINCT slot_number) FROM economy_private.mission_assignments WHERE board_id=v_board) <> 4
     OR (SELECT count(DISTINCT template_id) FROM economy_private.mission_assignments WHERE board_id=v_board) <> 4
     OR (SELECT count(DISTINCT objective_snapshot->>'predicate_key') FROM economy_private.mission_assignments WHERE board_id=v_board) <> 4
     OR EXISTS (SELECT 1 FROM economy_private.mission_assignments WHERE board_id=v_board AND reward_snapshot <> 10)
  THEN RAISE EXCEPTION 'Daily board slots must be distinct and retain approved reward snapshots'; END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly',v_reference);
  IF v_board IS NULL OR v_status <> 'created' OR v_count <> 3
  THEN RAISE EXCEPTION 'A complete verified weekly pool must create exactly three slots'; END IF;

  IF (SELECT count(*) FROM economy_private.mission_assignments WHERE board_id=v_board) <> 3
     OR (SELECT count(DISTINCT slot_number) FROM economy_private.mission_assignments WHERE board_id=v_board) <> 3
     OR (SELECT count(DISTINCT template_id) FROM economy_private.mission_assignments WHERE board_id=v_board) <> 3
     OR (SELECT count(DISTINCT objective_snapshot->>'predicate_key') FROM economy_private.mission_assignments WHERE board_id=v_board) <> 3
     OR EXISTS (SELECT 1 FROM economy_private.mission_assignments WHERE board_id=v_board AND reward_snapshot <> 20)
  THEN RAISE EXCEPTION 'Weekly board slots must be distinct and retain approved reward snapshots'; END IF;

  IF EXISTS (
    SELECT 1
    FROM economy_private.mission_assignments a
    JOIN economy_private.mission_template_versions t
      ON t.template_id=a.template_id AND t.template_version=a.template_version
    LEFT JOIN economy_private.mission_event_predicate_mappings m
      ON m.template_id=t.template_id AND m.template_version=t.template_version
     AND m.mapping_status='verified'
    WHERE (t.template_id='solve_a_challenge' AND t.template_version=2)
       OR t.validator_mapping_status <> 'verified'
       OR NOT t.is_assignable
       OR m.template_id IS NULL
  ) THEN RAISE EXCEPTION 'Only verified templates and mappings may appear on generated boards'; END IF;

  -- Exercise the new dynamic predicate dispatcher using a temporary, trusted event.
  SELECT a.assignment_id,t.template_id,m.source_system,m.experience_id,m.activity_id,
         m.event_type,m.validator_version
    INTO v_assignment_id,v_template_id,v_source_system,v_experience_id,v_activity_id,
         v_event_type,v_validator_version
  FROM economy_private.mission_assignments AS a
  JOIN economy_private.mission_template_versions AS t
    ON t.template_id=a.template_id AND t.template_version=a.template_version
  JOIN economy_private.mission_event_predicate_mappings AS m
    ON m.template_id=t.template_id AND m.template_version=t.template_version
   AND m.mapping_status='verified'
  WHERE a.board_id = (
    SELECT b.board_id FROM economy_private.mission_boards AS b
    WHERE b.user_id=v_user AND b.period_type='daily'
      AND b.period_start=(SELECT min(period_start) FROM economy_private.mission_boards WHERE user_id=v_user AND period_type='daily')
  )
    AND m.predicate_key LIKE 'f4f_daily_predicate_%'
  ORDER BY a.slot_number
  LIMIT 1;

  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_event_id,v_user,v_event_id,v_source_system,v_experience_id,v_activity_id,
    v_event_type,v_reference,clock_timestamp(),v_validator_version,'{}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_assignment_id AND assignment_status='completed'
      AND progress_value=1
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_event_progress
    WHERE event_id=v_event_id AND assignment_id=v_assignment_id
  ) THEN RAISE EXCEPTION 'Dynamic verified predicate dispatch did not advance its assignment'; END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=v_user)
  THEN RAISE EXCEPTION 'Board generation and progress must not create wallets or rewards'; END IF;
END;
$phase4f$;

ROLLBACK;
