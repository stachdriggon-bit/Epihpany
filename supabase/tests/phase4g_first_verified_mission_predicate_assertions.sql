-- Velorn Phase 4G: verify the first production-backed predicate end-to-end.
-- Disposable clean-room DB only. All users, events, boards and temporary gate changes roll back.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('f4b00000-0000-4000-8000-000000000051','authenticated','authenticated','velorn-phase4g-valid@example.invalid','',now(),'{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()),
  ('f4b00000-0000-4000-8000-000000000052','authenticated','authenticated','velorn-phase4g-invalid@example.invalid','',now(),'{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()),
  ('f4b00000-0000-4000-8000-000000000053','authenticated','authenticated','velorn-phase4g-board@example.invalid','{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase4g$
DECLARE
  v_valid_user uuid := 'f4b00000-0000-4000-8000-000000000051';
  v_invalid_user uuid := 'f4b00000-0000-4000-8000-000000000052';
  v_board_user uuid := 'f4b00000-0000-4000-8000-000000000053';
  v_valid_board uuid := 'f4b00000-0000-4000-8000-000000000061';
  v_invalid_board uuid := 'f4b00000-0000-4000-8000-000000000062';
  v_valid_assignment uuid := 'f4b00000-0000-4000-8000-000000000071';
  v_invalid_assignment uuid := 'f4b00000-0000-4000-8000-000000000072';
  v_valid_event uuid := 'f4b00000-0000-4000-8000-000000000081';
  v_invalid_event uuid := 'f4b00000-0000-4000-8000-000000000082';
  v_start timestamptz := date_trunc('day', clock_timestamp());
  v_status text;
  v_count integer;
  v_applied integer;
BEGIN
  IF has_function_privilege('anon','economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)','EXECUTE')
     OR NOT has_function_privilege('service_role','economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)','EXECUTE')
  THEN RAISE EXCEPTION 'The verified evaluator must remain service-role-only'; END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM economy_private.mission_template_versions t
    JOIN economy_private.mission_event_predicate_mappings m
      ON m.template_id=t.template_id AND m.template_version=t.template_version
    WHERE t.template_id='solve_a_challenge'
      AND t.template_version=3
      AND t.validator_mapping_status='verified'
      AND t.is_assignable
      AND m.predicate_version=2
      AND m.mapping_status='verified'
      AND m.validator_version='odd-one-out-rotated-20261110-v2'
  ) THEN RAISE EXCEPTION 'The real Odd One Out template/mapping successor must be verified'; END IF;

  -- Even with the economy gate opened inside this rollback-only test, one verified
  -- daily template and zero weekly templates must never produce partial boards.
  UPDATE economy_private.economy_settings SET economy_enabled=true WHERE singleton;
  SELECT out_status,out_assignment_count INTO v_status,v_count
  FROM public.economy_generate_mission_board(v_board_user,'daily',clock_timestamp());
  IF v_status <> 'not_ready' OR v_count <> 0 THEN
    RAISE EXCEPTION 'One verified daily template must not create an incomplete board';
  END IF;
  SELECT out_status,out_assignment_count INTO v_status,v_count
  FROM public.economy_generate_mission_board(v_board_user,'weekly',clock_timestamp());
  IF v_status <> 'not_ready' OR v_count <> 0 THEN
    RAISE EXCEPTION 'Zero verified weekly templates must not create a board';
  END IF;
  IF EXISTS (SELECT 1 FROM economy_private.mission_boards WHERE user_id=v_board_user)
     OR EXISTS (SELECT 1 FROM economy_private.mission_assignments WHERE user_id=v_board_user)
  THEN RAISE EXCEPTION 'An insufficient verified pool created a partial board'; END IF;
  UPDATE economy_private.economy_settings SET economy_enabled=false WHERE singleton;

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,
    timezone_name,config_version,template_bank_version
  ) VALUES
    (v_valid_board,v_valid_user,'daily',v_start,v_start+interval '1 day','UTC',1,1),
    (v_invalid_board,v_invalid_user,'daily',v_start,v_start+interval '1 day','UTC',1,1);

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  )
  SELECT v_valid_assignment,v_valid_board,v_valid_user,1,t.template_id,t.template_version,
         t.objective_definition,10
  FROM economy_private.mission_template_versions t
  WHERE t.template_id='solve_a_challenge' AND t.template_version=3;

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  )
  SELECT v_invalid_assignment,v_invalid_board,v_invalid_user,1,t.template_id,t.template_version,
         t.objective_definition,10
  FROM economy_private.mission_template_versions t
  WHERE t.template_id='solve_a_challenge' AND t.template_version=3;

  -- This is the exact event contract emitted by the deployed server-owned validator.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_valid_event,v_valid_user,v_valid_event,'think_lab','think_lab','odd_one_out',
    'game_session_completed',clock_timestamp(),clock_timestamp(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"challenge","question_count":12,"correct_count":0,"incorrect_count":12}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_valid_assignment
      AND assignment_status='completed'
      AND progress_value=1
      AND completed_at IS NOT NULL
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_event_progress
    WHERE event_id=v_valid_event AND assignment_id=v_valid_assignment
  ) THEN RAISE EXCEPTION 'A valid zero-correct Challenge completion must advance the assignment'; END IF;

  v_applied := economy_private.process_mission_event(v_valid_event);
  IF v_applied <> 0 OR (
    SELECT count(*) FROM economy_private.mission_event_progress
    WHERE event_id=v_valid_event AND assignment_id=v_valid_assignment
  ) <> 1 THEN RAISE EXCEPTION 'Event replay must not apply progress twice'; END IF;

  -- A completed non-Challenge session is a trusted event, but not this mission.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_invalid_event,v_invalid_user,v_invalid_event,'think_lab','think_lab','odd_one_out',
    'game_session_completed',clock_timestamp(),clock_timestamp(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":10,"correct_count":8,"incorrect_count":2}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_invalid_assignment AND assignment_status='active' AND progress_value=0
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_progress
    WHERE event_id=v_invalid_event AND assignment_id=v_invalid_assignment
  ) THEN RAISE EXCEPTION 'Steady mode must not advance the Challenge mission'; END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.wallets WHERE user_id IN (v_valid_user,v_invalid_user,v_board_user)
  ) OR EXISTS (
    SELECT 1 FROM economy_private.wallet_ledger WHERE user_id IN (v_valid_user,v_invalid_user,v_board_user)
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id IN (v_valid_user,v_invalid_user,v_board_user)
  ) OR EXISTS (
    SELECT 1 FROM economy_private.achievement_awards WHERE user_id IN (v_valid_user,v_invalid_user,v_board_user)
  ) THEN RAISE EXCEPTION 'Predicate verification must not create wallets or rewards'; END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN RAISE EXCEPTION 'Phase 4G must leave the economy disabled'; END IF;
END;
$phase4g$;

ROLLBACK;
