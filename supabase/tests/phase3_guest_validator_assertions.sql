-- Guest Odd One Out validator contract tests.
-- Disposable local Supabase only; all test data is rolled back.
BEGIN;

DO $guest$
DECLARE
  v_rls boolean;
  v_force_rls boolean;
BEGIN
  SELECT relrowsecurity, relforcerowsecurity
    INTO v_rls, v_force_rls
  FROM pg_class
  WHERE oid = 'economy_private.guest_game_validator_sessions'::regclass;

  IF NOT v_rls OR NOT v_force_rls THEN
    RAISE EXCEPTION 'Guest validator sessions must have RLS and FORCE RLS enabled';
  END IF;

  IF has_table_privilege('anon', 'economy_private.guest_game_validator_sessions', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.guest_game_validator_sessions', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.guest_game_validator_sessions', 'INSERT') THEN
    RAISE EXCEPTION 'Guest validator sessions must not be directly accessible to browser roles';
  END IF;

  IF has_function_privilege('anon', 'public.velorn_start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.velorn_start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.velorn_submit_odd_one_out_guest_answer(uuid,text,integer,integer)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.velorn_submit_odd_one_out_guest_answer(uuid,text,integer,integer)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.velorn_start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.velorn_submit_odd_one_out_guest_answer(uuid,text,integer,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Guest validator RPCs must be callable only by service_role';
  END IF;
END;
$guest$;

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $guest$
DECLARE
  v_session_id constant uuid := 'f3500000-0000-4000-8000-000000000021';
  v_token_hash constant text := repeat('a', 64);
  v_wrong_hash constant text := repeat('b', 64);
  v_ip_hash constant text := repeat('c', 64);
  v_result jsonb;
  v_session economy_private.guest_game_validator_sessions%ROWTYPE;
  v_replay_rejected boolean := false;
  v_wrong_token_rejected boolean := false;
  v_fast_rejected boolean := false;
  v_events_before integer;
BEGIN
  SELECT count(*) INTO v_events_before FROM economy_private.activity_events;

  PERFORM public.velorn_start_odd_one_out_guest_session(
    v_session_id,
    v_token_hash,
    v_ip_hash,
    'odd-one-out-rotated-20261110-v2',
    'A1',
    'steady',
    '[{"id":"A1-CAT-01","words":["apple","pear","pencil","banana"],"answer":2,"explain":"A pencil is not food.","relationship":"category","hint":"Three are foods."}]'::jsonb,
    clock_timestamp() + interval '20 minutes'
  );

  SELECT * INTO v_session
  FROM economy_private.guest_game_validator_sessions
  WHERE session_id = v_session_id;

  IF NOT FOUND OR v_session.token_hash <> v_token_hash
     OR v_session.token_hash = v_wrong_hash
     OR v_session.status <> 'active' THEN
    RAISE EXCEPTION 'Guest session must persist only the supplied token hash and start active';
  END IF;

  BEGIN
    PERFORM public.velorn_submit_odd_one_out_guest_answer(v_session_id, v_wrong_hash, 0, 2);
    RAISE EXCEPTION 'A different guest token must not access the session';
  EXCEPTION WHEN SQLSTATE 'P0002' THEN
    v_wrong_token_rejected := true;
  END;

  IF NOT v_wrong_token_rejected THEN
    RAISE EXCEPTION 'Wrong guest token was not rejected';
  END IF;

  BEGIN
    PERFORM public.velorn_submit_odd_one_out_guest_answer(v_session_id, v_token_hash, 0, 2);
    RAISE EXCEPTION 'Guest answer pacing must reject an immediate answer';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    v_fast_rejected := true;
  END;

  IF NOT v_fast_rejected THEN
    RAISE EXCEPTION 'Guest minimum answer spacing was not enforced';
  END IF;

  PERFORM pg_sleep(0.8);

  v_result := public.velorn_submit_odd_one_out_guest_answer(v_session_id, v_token_hash, 0, 2);

  IF (v_result ->> 'correct')::boolean IS DISTINCT FROM true
     OR (v_result ->> 'completed')::boolean IS DISTINCT FROM true
     OR (v_result ->> 'correct_index')::integer <> 2 THEN
    RAISE EXCEPTION 'Guest server-side answer validation returned an unexpected result: %', v_result;
  END IF;

  SELECT * INTO v_session
  FROM economy_private.guest_game_validator_sessions
  WHERE session_id = v_session_id;

  IF v_session.status <> 'completed'
     OR v_session.current_index <> 1
     OR v_session.correct_count <> 1
     OR jsonb_array_length(v_session.answers) <> 1 THEN
    RAISE EXCEPTION 'Guest session completion state was not committed exactly once';
  END IF;

  BEGIN
    PERFORM public.velorn_submit_odd_one_out_guest_answer(v_session_id, v_token_hash, 0, 2);
    RAISE EXCEPTION 'A completed guest session must reject replay';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    v_replay_rejected := true;
  END;

  IF NOT v_replay_rejected THEN
    RAISE EXCEPTION 'Completed guest session replay was not rejected';
  END IF;

  IF (SELECT count(*) FROM economy_private.activity_events) <> v_events_before
     OR EXISTS (SELECT 1 FROM economy_private.wallets)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards) THEN
    RAISE EXCEPTION 'Guest play must not create trusted events, wallets, claims, awards, or Velorn';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Guest validator contract must leave the economy disabled';
  END IF;
END;
$guest$;

ROLLBACK;
