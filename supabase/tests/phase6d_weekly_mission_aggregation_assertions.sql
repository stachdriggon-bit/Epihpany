-- Phase 6D: end-to-end weekly mission aggregation.
-- Covers three distinct days, two distinct games, and one complete multi-step round.
-- All fixture data is rolled back; no reward/economy state is created.
BEGIN;

INSERT INTO auth.users (
  id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) VALUES (
  'f6d00000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6d@example.invalid','',now(),
  '{}'::jsonb,'{}'::jsonb,now(),now()
);

SELECT set_config('request.jwt.claim.role', '', true);
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);

DO $phase6d$
DECLARE
  v_user uuid := 'f6d00000-0000-4000-8000-000000000001';
  v_board uuid := 'f6d00000-0000-4000-8000-000000000011';
  v_consistent uuid := 'f6d00000-0000-4000-8000-000000000021';
  v_broaden uuid := 'f6d00000-0000-4000-8000-000000000022';
  v_meaningful uuid := 'f6d00000-0000-4000-8000-000000000023';
  v_start timestamptz := date_trunc('day',now()) - interval '3 days';
  v_end timestamptz := date_trunc('day',now()) + interval '4 days';
  v_snapshot jsonb;
  v_progress integer;
BEGIN
  -- Clone the actual mapped successors into temporary verified test versions.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT template_id,99,period_type,mission_family,reward_amount,
         objective_definition || jsonb_build_object(
           'progress_metric','distinct_days','target_count',3
         ),'verified',true
  FROM economy_private.mission_template_versions
  WHERE template_id='consistent_progress' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT template_id,99,predicate_version,predicate_key,
         source_system,experience_id,activity_id,event_type,validator_version,
         'verified',predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='consistent_progress' AND template_version=2;

  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT template_id,99,period_type,mission_family,reward_amount,
         objective_definition || jsonb_build_object(
           'progress_metric','distinct_activities','target_count',2
         ),'verified',true
  FROM economy_private.mission_template_versions
  WHERE template_id='broaden_your_experience' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT template_id,99,predicate_version,predicate_key,
         source_system,experience_id,activity_id,event_type,validator_version,
         'verified',predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='broaden_your_experience' AND template_version=2;

  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT template_id,99,period_type,mission_family,reward_amount,
         objective_definition || jsonb_build_object(
           'progress_metric','event_count','target_count',1
         ),'verified',true
  FROM economy_private.mission_template_versions
  WHERE template_id='meaningful_progress' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT template_id,99,predicate_version,predicate_key,
         source_system,experience_id,activity_id,event_type,validator_version,
         'verified',predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='meaningful_progress' AND template_version=2;

  SELECT objective_definition INTO v_snapshot
  FROM economy_private.mission_template_versions
  WHERE template_id='consistent_progress' AND template_version=99;
  IF v_snapshot IS NULL THEN RAISE EXCEPTION 'Consistent Progress fixture template missing'; END IF;

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,timezone_name,
    config_version,template_bank_version
  ) VALUES (
    v_board,v_user,'weekly',v_start,v_end,'UTC',1,1
  );

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  )
  SELECT v_consistent,v_board,v_user,1,'consistent_progress',99,
         objective_definition,10
  FROM economy_private.mission_template_versions
  WHERE template_id='consistent_progress' AND template_version=99;

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  )
  SELECT v_broaden,v_board,v_user,2,'broaden_your_experience',99,
         objective_definition,10
  FROM economy_private.mission_template_versions
  WHERE template_id='broaden_your_experience' AND template_version=99;

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  )
  SELECT v_meaningful,v_board,v_user,3,'meaningful_progress',99,
         objective_definition,10
  FROM economy_private.mission_template_versions
  WHERE template_id='meaningful_progress' AND template_version=99;

  IF (SELECT count(*) FROM economy_private.mission_assignments
      WHERE board_id=v_board) <> 3 THEN
    RAISE EXCEPTION 'All three weekly fixture assignments must be created';
  END IF;

  -- Day 1: Odd One Out, a valid partial 8-question session (not a full round).
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    'f6d00000-0000-4000-8000-000000000031',v_user,
    'f6d00000-0000-4000-8000-000000000041','think_lab','think_lab','odd_one_out',
    'game_session_completed',v_start+interval '1 day 10 hours',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":8,"correct_count":7,"incorrect_count":1}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_consistent AND progress_value=1 AND assignment_status='active'
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_broaden AND progress_value=1 AND assignment_status='active'
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_meaningful AND assignment_status='active' AND progress_value=0
  ) THEN
    RAISE EXCEPTION 'Day 1 should advance daily diversity and activity variety only';
  END IF;

  -- Day 2: A partial Word Forge session, a different game and a second distinct day.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    'f6d00000-0000-4000-8000-000000000032',v_user,
    'f6d00000-0000-4000-8000-000000000042','think_lab','think_lab','word_forge',
    'game_session_completed',v_start+interval '2 days 10 hours',now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_consistent AND progress_value=2 AND assignment_status='active'
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_broaden AND progress_value=2 AND assignment_status='completed'
  ) OR NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_meaningful AND progress_value=0 AND assignment_status='active'
  ) THEN
    RAISE EXCEPTION 'Day 2 should complete game variety and advance the second distinct day';
  END IF;

  -- Day 3: Sentence Scramble, a full 24-question round, completes all three contracts.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    'f6d00000-0000-4000-8000-000000000033',v_user,
    'f6d00000-0000-4000-8000-000000000043','think_lab','think_lab','sentence_scramble',
    'game_session_completed',v_start+interval '3 days 10 hours',now(),
    'sentence-scramble-72-20261112-v1',
    '{"training_mode":"steady","session_type":"full","question_count":24,"correct_count":21,"incorrect_count":3,"wrong_attempts":4}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_consistent AND progress_value=3 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Third distinct day must complete Consistent Progress';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_broaden AND progress_value=2 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Two different Think Lab games must complete Broaden Your Experience';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_meaningful AND progress_value=1 AND assignment_status='completed'
      AND completed_at=v_start+interval '3 days 10 hours'
  ) THEN
    RAISE EXCEPTION 'A complete Sentence Scramble round must complete Meaningful Progress';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_assignment_evidence
      WHERE assignment_id IN (v_consistent,v_broaden,v_meaningful)) <> 6 THEN
    RAISE EXCEPTION 'Expected six immutable evidence rows across the three weekly missions';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_event_progress
      WHERE assignment_id IN (v_consistent,v_broaden,v_meaningful)) <> 6 THEN
    RAISE EXCEPTION 'Expected six progress transitions across the three weekly missions';
  END IF;

  -- Replay must not create duplicate evidence or progress transitions.
  v_progress := economy_private.process_mission_event('f6d00000-0000-4000-8000-000000000033');
  IF v_progress <> 0 THEN
    RAISE EXCEPTION 'Replaying the final full-round event must be a no-op';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=v_user) THEN
    RAISE EXCEPTION 'Weekly progress must not create wallets, ledger, rewards, or achievements';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Weekly progress must leave the economy disabled';
  END IF;
END;
$phase6d$;

ROLLBACK;
