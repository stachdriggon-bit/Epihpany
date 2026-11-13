-- Phase 6A: cumulative mission evidence, distinct-day aggregation, and replay safety.
-- Disposable clean-room DB only.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('f6a00000-0000-4000-8000-000000000001','authenticated','authenticated','velorn-phase6a-a@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now()),
  ('f6a00000-0000-4000-8000-000000000002','authenticated','authenticated','velorn-phase6a-b@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase6a$
DECLARE
  v_daily_board uuid := 'f6a00000-0000-4000-8000-000000000011';
  v_weekly_board uuid := 'f6a00000-0000-4000-8000-000000000012';
  v_daily_assignment uuid := 'f6a00000-0000-4000-8000-000000000021';
  v_weekly_assignment uuid := 'f6a00000-0000-4000-8000-000000000022';
  v_daily_snapshot jsonb;
  v_weekly_snapshot jsonb;
  v_start timestamptz := date_trunc('day', now()) - interval '3 days';
  v_end timestamptz := date_trunc('day', now()) + interval '4 days';
  v_result integer;
  v_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='economy_private' AND c.relname='mission_assignment_evidence'
      AND c.relrowsecurity AND c.relforcerowsecurity
  ) THEN RAISE EXCEPTION 'Cumulative evidence must have RLS and FORCE RLS'; END IF;

  IF has_table_privilege('anon','economy_private.mission_assignment_evidence','SELECT')
     OR has_table_privilege('authenticated','economy_private.mission_assignment_evidence','SELECT')
     OR has_table_privilege('service_role','economy_private.mission_assignment_evidence','SELECT')
  THEN RAISE EXCEPTION 'Cumulative evidence must not be directly readable by API roles'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid='economy_private.mission_assignment_evidence'::regclass
      AND tgname='mission_assignment_evidence_immutable' AND NOT tgisinternal
  ) THEN RAISE EXCEPTION 'Cumulative evidence must be append-only'; END IF;

  -- Temporary verified test predicates are rolled back with this test transaction.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT 'f6a_event_count_test',1,'daily','f6a_event_count_test',reward_amount,
         objective_definition || jsonb_build_object(
           'predicate_key','solve_a_challenge_odd_one_out_v1',
           'progress_metric','event_count','target_count',2
         ),'verified',true
  FROM economy_private.mission_template_versions
  WHERE template_id='solve_a_challenge' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT 'f6a_event_count_test',1,predicate_version,predicate_key,
         source_system,experience_id,activity_id,event_type,validator_version,
         'verified',predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='solve_a_challenge' AND template_version=2;

  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT 'f6a_distinct_days_test',1,'weekly','f6a_distinct_days_test',reward_amount,
         objective_definition || jsonb_build_object(
           'predicate_key','solve_a_challenge_odd_one_out_v1',
           'progress_metric','distinct_days','target_count',3
         ),'verified',true
  FROM economy_private.mission_template_versions
  WHERE template_id='solve_a_challenge' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT 'f6a_distinct_days_test',1,predicate_version,predicate_key,
         source_system,experience_id,activity_id,event_type,validator_version,
         'verified',predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='solve_a_challenge' AND template_version=2;

  SELECT objective_definition INTO v_daily_snapshot
  FROM economy_private.mission_template_versions
  WHERE template_id='f6a_event_count_test' AND template_version=1;
  SELECT objective_definition INTO v_weekly_snapshot
  FROM economy_private.mission_template_versions
  WHERE template_id='f6a_distinct_days_test' AND template_version=1;

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,timezone_name,config_version,template_bank_version
  ) VALUES
    (v_daily_board,'f6a00000-0000-4000-8000-000000000001','daily',date_trunc('day',now()),date_trunc('day',now())+interval '1 day','UTC',1,1),
    (v_weekly_board,'f6a00000-0000-4000-8000-000000000002','weekly',v_start,v_end,'UTC',1,1);

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  ) VALUES
    (v_daily_assignment,v_daily_board,'f6a00000-0000-4000-8000-000000000001',1,'f6a_event_count_test',1,v_daily_snapshot,10),
    (v_weekly_assignment,v_weekly_board,'f6a00000-0000-4000-8000-000000000002',1,'f6a_distinct_days_test',1,v_weekly_snapshot,20);

  -- Event-count metric: first event adds one step; second completes the threshold.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    'f6a00000-0000-4000-8000-000000000031','f6a00000-0000-4000-8000-000000000001',
    'f6a00000-0000-4000-8000-000000000041','think_lab','think_lab','odd_one_out',
    'game_session_completed',now(),now(),'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_daily_assignment AND assignment_status='active' AND progress_value=1
  ) THEN RAISE EXCEPTION 'First cumulative event must advance progress without completing the target'; END IF;

  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    'f6a00000-0000-4000-8000-000000000032','f6a00000-0000-4000-8000-000000000001',
    'f6a00000-0000-4000-8000-000000000042','think_lab','think_lab','odd_one_out',
    'game_session_completed',now(),now(),'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":7,"incorrect_count":5}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_daily_assignment AND assignment_status='completed' AND progress_value=2
  ) THEN RAISE EXCEPTION 'Second cumulative event must complete the threshold'; END IF;

  v_result := economy_private.process_mission_event('f6a00000-0000-4000-8000-000000000032');
  IF v_result <> 0 THEN RAISE EXCEPTION 'Replayed event must not add cumulative progress'; END IF;

  -- Three distinct local dates are required; a second event on the same date
  -- remains evidence but must not increase the distinct-day metric.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    'f6a00000-0000-4000-8000-000000000051','f6a00000-0000-4000-8000-000000000002',
    'f6a00000-0000-4000-8000-000000000061','think_lab','think_lab','odd_one_out',
    'game_session_completed',date_trunc('day',now())-interval '2 days'+interval '10 hours',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  ),
  (
    'f6a00000-0000-4000-8000-000000000052','f6a00000-0000-4000-8000-000000000002',
    'f6a00000-0000-4000-8000-000000000062','think_lab','think_lab','odd_one_out',
    'game_session_completed',date_trunc('day',now())-interval '2 days'+interval '12 hours',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_weekly_assignment AND assignment_status='active' AND progress_value=1
  ) THEN RAISE EXCEPTION 'Two events on one local day must count as one distinct day'; END IF;

  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    'f6a00000-0000-4000-8000-000000000053','f6a00000-0000-4000-8000-000000000002',
    'f6a00000-0000-4000-8000-000000000063','think_lab','think_lab','odd_one_out',
    'game_session_completed',date_trunc('day',now())-interval '1 day'+interval '10 hours',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B2","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  ),
  (
    'f6a00000-0000-4000-8000-000000000054','f6a00000-0000-4000-8000-000000000002',
    'f6a00000-0000-4000-8000-000000000064','think_lab','think_lab','odd_one_out',
    'game_session_completed',date_trunc('day',now())+interval '10 hours',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"C1","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_weekly_assignment AND assignment_status='completed' AND progress_value=3
  ) THEN RAISE EXCEPTION 'Third distinct day must complete the weekly threshold'; END IF;

  SELECT count(*) INTO v_count
  FROM economy_private.mission_assignment_evidence
  WHERE assignment_id IN (v_daily_assignment,v_weekly_assignment);
  IF v_count <> 6 THEN RAISE EXCEPTION 'Expected six immutable evidence records, got %',v_count; END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id IN (
      'f6a00000-0000-4000-8000-000000000001','f6a00000-0000-4000-8000-000000000002'))
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id IN (
      'f6a00000-0000-4000-8000-000000000001','f6a00000-0000-4000-8000-000000000002'))
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id IN (
      'f6a00000-0000-4000-8000-000000000001','f6a00000-0000-4000-8000-000000000002'))
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id IN (
      'f6a00000-0000-4000-8000-000000000001','f6a00000-0000-4000-8000-000000000002'))
  THEN RAISE EXCEPTION 'Cumulative progress must never create rewards or wallets'; END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'Cumulative progress must leave the economy disabled'; END IF;
END;
$phase6a$;

ROLLBACK;
