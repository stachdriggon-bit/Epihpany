-- Phase 3C trusted Odd One Out validator contract tests.
-- Disposable local Supabase only; all test data is rolled back.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f3000000-0000-4000-8000-000000000021',
  'authenticated', 'authenticated', 'velorn-phase3-validator@example.invalid',
  '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase3$
DECLARE
  v_rls boolean;
  v_force_rls boolean;
  v_fast_rejected boolean := false;
  v_replay_rejected boolean := false;
  v_result jsonb;
  v_event_count integer;
  v_event_evidence jsonb;
BEGIN
  SELECT relrowsecurity, relforcerowsecurity
    INTO v_rls, v_force_rls
  FROM pg_class
  WHERE oid = 'economy_private.game_validator_sessions'::regclass;

  IF NOT v_rls OR NOT v_force_rls THEN
    RAISE EXCEPTION 'Validator sessions must have RLS and FORCE RLS enabled';
  END IF;

  IF has_table_privilege('anon', 'economy_private.game_validator_sessions', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.game_validator_sessions', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.game_validator_sessions', 'INSERT')
     OR has_table_privilege('service_role', 'economy_private.game_validator_sessions', 'DELETE') THEN
    RAISE EXCEPTION 'Validator sessions expose forbidden direct table privileges';
  END IF;

  IF has_function_privilege('anon', 'public.velorn_start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.velorn_start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.velorn_submit_odd_one_out_answer(uuid,uuid,integer,integer)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.velorn_submit_odd_one_out_answer(uuid,uuid,integer,integer)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.velorn_start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.velorn_submit_odd_one_out_answer(uuid,uuid,integer,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Validator RPCs must be executable only by service_role';
  END IF;

  PERFORM public.velorn_start_odd_one_out_session(
    'f3000000-0000-4000-8000-000000000021',
    'f3000000-0000-4000-8000-000000000022',
    'odd-one-out-v1',
    'A1',
    'steady',
    '[{"id":"A1-CAT-01","words":["apple","pear","pencil","banana"],"answer":2,"explain":"A pencil is not food.","relationship":"category","hint":"Three are foods."}]'::jsonb,
    clock_timestamp() + interval '20 minutes'
  );

  BEGIN
    PERFORM public.velorn_submit_odd_one_out_answer(
      'f3000000-0000-4000-8000-000000000021',
      'f3000000-0000-4000-8000-000000000022',
      0,
      0
    );
  EXCEPTION WHEN SQLSTATE '22023' THEN
    v_fast_rejected := true;
  END;

  IF NOT v_fast_rejected THEN
    RAISE EXCEPTION 'Validator must reject an answer submitted too quickly';
  END IF;

  PERFORM pg_sleep(0.8);

  v_result := public.velorn_submit_odd_one_out_answer(
    'f3000000-0000-4000-8000-000000000021',
    'f3000000-0000-4000-8000-000000000022',
    0,
    0
  );

  IF (v_result ->> 'correct')::boolean IS DISTINCT FROM false
     OR (v_result ->> 'completed')::boolean IS DISTINCT FROM true
     OR (v_result ->> 'correct_index')::integer <> 2 THEN
    RAISE EXCEPTION 'Server answer validation returned an unexpected result: %', v_result;
  END IF;

  SELECT count(*), jsonb_agg(evidence) -> 0
    INTO v_event_count, v_event_evidence
  FROM economy_private.activity_events
  WHERE user_id = 'f3000000-0000-4000-8000-000000000021'
    AND source_event_key = 'f3000000-0000-4000-8000-000000000022';

  IF v_event_count <> 1
     OR v_event_evidence ->> 'challenge_level' <> 'A1'
     OR v_event_evidence ->> 'correct_count' <> '0'
     OR v_event_evidence ->> 'incorrect_count' <> '1' THEN
    RAISE EXCEPTION 'Final answer must atomically create one server-validated event: %, %', v_event_count, v_event_evidence;
  END IF;

  BEGIN
    PERFORM public.velorn_submit_odd_one_out_answer(
      'f3000000-0000-4000-8000-000000000021',
      'f3000000-0000-4000-8000-000000000022',
      0,
      0
    );
  EXCEPTION WHEN SQLSTATE '55000' THEN
    v_replay_rejected := true;
  END;

  IF NOT v_replay_rejected THEN
    RAISE EXCEPTION 'Completed sessions must reject replayed answers';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id = 'f3000000-0000-4000-8000-000000000021')
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id = 'f3000000-0000-4000-8000-000000000021')
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id = 'f3000000-0000-4000-8000-000000000021')
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id = 'f3000000-0000-4000-8000-000000000021') THEN
    RAISE EXCEPTION 'Phase 3C must not create wallets, balances, claims, or awards';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 3C must leave the economy disabled';
  END IF;
END;
$phase3$;

ROLLBACK;
