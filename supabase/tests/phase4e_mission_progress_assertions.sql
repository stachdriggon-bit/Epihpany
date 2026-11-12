-- Velorn Phase 4E: trusted mission progress processor contract.
-- Disposable clean-room DB only.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('f4e00000-0000-4000-8000-000000000051','authenticated','authenticated','velorn-phase4e-a@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now()),
  ('f4e00000-0000-4000-8000-000000000052','authenticated','authenticated','velorn-phase4e-b@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now()),
  ('f4e00000-0000-4000-8000-000000000053','authenticated','authenticated','velorn-phase4e-c@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase4e$
DECLARE
  v_start timestamptz := date_trunc('day', now());
  v_end timestamptz := date_trunc('day', now()) + interval '1 day';
  v_board_a uuid := 'f4e00000-0000-4000-8000-000000000061';
  v_board_b uuid := 'f4e00000-0000-4000-8000-000000000062';
  v_board_c uuid := 'f4e00000-0000-4000-8000-000000000063';
  v_assignment_a uuid := 'f4e00000-0000-4000-8000-000000000071';
  v_assignment_b uuid := 'f4e00000-0000-4000-8000-000000000072';
  v_assignment_c uuid := 'f4e00000-0000-4000-8000-000000000073';
  v_event_a uuid := 'f4e00000-0000-4000-8000-000000000081';
  v_event_b uuid := 'f4e00000-0000-4000-8000-000000000082';
  v_event_c uuid := 'f4e00000-0000-4000-8000-000000000083';
  v_event_outside uuid := 'f4e00000-0000-4000-8000-000000000084';
  v_snapshot jsonb;
  v_result integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='economy_private' AND c.relname='mission_event_progress'
      AND c.relrowsecurity AND c.relforcerowsecurity
  ) THEN RAISE EXCEPTION 'Progress history must have RLS and FORCE RLS'; END IF;

  IF has_table_privilege('anon','economy_private.mission_event_progress','SELECT')
     OR has_table_privilege('authenticated','economy_private.mission_event_progress','SELECT')
     OR has_table_privilege('service_role','economy_private.mission_event_progress','SELECT')
  THEN RAISE EXCEPTION 'Progress history must not be directly readable by API roles'; END IF;

  IF has_function_privilege('anon','economy_private.process_mission_event(uuid)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.process_mission_event(uuid)','EXECUTE')
     OR NOT has_function_privilege('service_role','economy_private.process_mission_event(uuid)','EXECUTE')
     OR has_function_privilege('anon','economy_private.process_mission_board_events(uuid)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.process_mission_board_events(uuid)','EXECUTE')
     OR NOT has_function_privilege('service_role','economy_private.process_mission_board_events(uuid)','EXECUTE')
  THEN RAISE EXCEPTION 'Progress processors must be service-role-only'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid='economy_private.activity_events'::regclass
      AND tgname='activity_events_process_mission_progress' AND NOT tgisinternal
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid='economy_private.mission_event_progress'::regclass
      AND tgname='mission_event_progress_immutable' AND NOT tgisinternal
  ) THEN RAISE EXCEPTION 'Progress automation and append-only protection are required'; END IF;

  -- Exercise the processor only against a temporary verified/assignable version.
  -- The transaction rollback below guarantees this test activation never persists.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT 'f4e_odd_one_out_test',1,period_type,
         'f4e_odd_one_out_test_family',reward_amount,
         objective_definition,'verified',true
  FROM economy_private.mission_template_versions
  WHERE template_id='solve_a_challenge' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT 'f4e_odd_one_out_test',1,predicate_version,predicate_key,
         source_system,experience_id,activity_id,event_type,validator_version,
         'verified',predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='solve_a_challenge' AND template_version=2;

  SELECT objective_definition INTO v_snapshot
  FROM economy_private.mission_template_versions
  WHERE template_id='f4e_odd_one_out_test' AND template_version=1;
  IF v_snapshot ->> 'predicate_key' <> 'solve_a_challenge_odd_one_out_v1' THEN
    RAISE EXCEPTION 'Mission assignment snapshot must retain the exact predicate key';
  END IF;

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,timezone_name,config_version,template_bank_version
  ) VALUES
    (v_board_a,'f4e00000-0000-4000-8000-000000000051','daily',v_start,v_end,'UTC',1,1),
    (v_board_b,'f4e00000-0000-4000-8000-000000000052','daily',v_start,v_end,'UTC',1,1);

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  ) VALUES
    (v_assignment_a,v_board_a,'f4e00000-0000-4000-8000-000000000051',1,'f4e_odd_one_out_test',1,v_snapshot,10),
    (v_assignment_b,v_board_b,'f4e00000-0000-4000-8000-000000000052',1,'f4e_odd_one_out_test',1,v_snapshot,10);

  -- An event inserted after its board exists is processed automatically by the trigger.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_event_a,'f4e00000-0000-4000-8000-000000000051',v_event_a,
    'think_lab','think_lab','odd_one_out','game_session_completed',
    now(),now(),'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"challenge","question_count":12,"correct_count":0,"incorrect_count":12}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_assignment_a AND assignment_status='completed'
      AND progress_value=1 AND completed_at IS NOT NULL
  ) THEN RAISE EXCEPTION 'Valid completed Challenge event did not complete its assignment'; END IF;

  IF (SELECT count(*) FROM economy_private.mission_event_progress
      WHERE event_id=v_event_a AND assignment_id=v_assignment_a) <> 1
  THEN RAISE EXCEPTION 'Exactly one progress application must be recorded'; END IF;

  v_result := economy_private.process_mission_event(v_event_a);
  IF v_result <> 0 THEN RAISE EXCEPTION 'Replaying an event must not apply progress twice'; END IF;

  -- Steady mode and out-of-period events must not advance the assignment.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    v_event_b,'f4e00000-0000-4000-8000-000000000052',v_event_b,
    'think_lab','think_lab','odd_one_out','game_session_completed',
    now(),now(),'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":12,"correct_count":9,"incorrect_count":3}'::jsonb
  ),
  (
    v_event_outside,'f4e00000-0000-4000-8000-000000000052',v_event_outside,
    'think_lab','think_lab','odd_one_out','game_session_completed',
    v_start - interval '1 second',now(),'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  );

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_assignment_b AND assignment_status <> 'active'
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_progress
    WHERE assignment_id=v_assignment_b
  ) THEN RAISE EXCEPTION 'Non-qualifying or out-of-period events must not advance progress'; END IF;

  -- A qualifying event may precede board creation; the board backfill must recover it.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_event_c,'f4e00000-0000-4000-8000-000000000053',v_event_c,
    'think_lab','think_lab','odd_one_out','game_session_completed',
    now(),now(),'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"C1","training_mode":"challenge","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  );

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,timezone_name,config_version,template_bank_version
  ) VALUES (v_board_c,'f4e00000-0000-4000-8000-000000000053','daily',v_start,v_end,'UTC',1,1);

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  ) VALUES (
    v_assignment_c,v_board_c,'f4e00000-0000-4000-8000-000000000053',1,
    'f4e_odd_one_out_test',1,v_snapshot,10
  );

  v_result := economy_private.process_mission_board_events(v_board_c);
  IF v_result <> 1 THEN RAISE EXCEPTION 'Board backfill should apply exactly one qualifying event'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_assignment_c AND assignment_status='completed' AND progress_value=1
  ) THEN RAISE EXCEPTION 'Board backfill did not complete the eligible assignment'; END IF;

  v_result := economy_private.process_mission_board_events(v_board_c);
  IF v_result <> 0 THEN RAISE EXCEPTION 'Repeated board backfill must be idempotent'; END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id IN (
      'f4e00000-0000-4000-8000-000000000051',
      'f4e00000-0000-4000-8000-000000000052',
      'f4e00000-0000-4000-8000-000000000053'))
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id IN (
      'f4e00000-0000-4000-8000-000000000051',
      'f4e00000-0000-4000-8000-000000000052',
      'f4e00000-0000-4000-8000-000000000053'))
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id IN (
      'f4e00000-0000-4000-8000-000000000051',
      'f4e00000-0000-4000-8000-000000000052',
      'f4e00000-0000-4000-8000-000000000053'))
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id IN (
      'f4e00000-0000-4000-8000-000000000051',
      'f4e00000-0000-4000-8000-000000000052',
      'f4e00000-0000-4000-8000-000000000053'))
  THEN RAISE EXCEPTION 'Progress processing must never create wallet or reward records'; END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'Progress processing must leave the economy disabled'; END IF;
END;
$phase4e$;

ROLLBACK;
