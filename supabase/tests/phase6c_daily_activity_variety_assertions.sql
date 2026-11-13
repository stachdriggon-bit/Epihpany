-- Phase 6C: end-to-end daily activity variety processing.
-- Verifies cumulative Learning Step and "different from last daily activity"
-- against real trusted Think Lab completion events. All fixtures roll back.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f6c00000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6c@example.invalid','',now(),
  '{}'::jsonb,'{}'::jsonb,now(),now()
);

-- Exercise the JSON JWT-claims fallback used by the trusted processor.
SELECT set_config('request.jwt.claim.role', '', true);
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);

DO $phase6c$
DECLARE
  v_user uuid := 'f6c00000-0000-4000-8000-000000000001';
  v_board uuid := 'f6c00000-0000-4000-8000-000000000011';
  v_learning_assignment uuid := 'f6c00000-0000-4000-8000-000000000021';
  v_variety_assignment uuid := 'f6c00000-0000-4000-8000-000000000022';
  v_learning_snapshot jsonb;
  v_variety_snapshot jsonb;
  v_first_event uuid := 'f6c00000-0000-4000-8000-000000000031';
  v_second_event uuid := 'f6c00000-0000-4000-8000-000000000032';
  v_third_event uuid := 'f6c00000-0000-4000-8000-000000000033';
  v_replay_count integer;
BEGIN
  -- Temporary verified successors use the real production evaluators and mappings.
  INSERT INTO economy_private.mission_template_versions (
    template_id, template_version, period_type, mission_family, reward_amount,
    objective_definition, validator_mapping_status, is_assignable
  )
  SELECT template_id, 99, period_type, mission_family, reward_amount,
         objective_definition || jsonb_build_object(
           'progress_metric','event_count','target_count',3
         ),
         'verified', true
  FROM economy_private.mission_template_versions
  WHERE template_id='learning_step' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id, template_version, predicate_version, predicate_key,
    source_system, experience_id, activity_id, event_type, validator_version,
    mapping_status, predicate_definition
  )
  SELECT template_id, 99, predicate_version, predicate_key,
         source_system, experience_id, activity_id, event_type, validator_version,
         'verified', predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='learning_step' AND template_version=2;

  INSERT INTO economy_private.mission_template_versions (
    template_id, template_version, period_type, mission_family, reward_amount,
    objective_definition, validator_mapping_status, is_assignable
  )
  SELECT template_id, 99, period_type, mission_family, reward_amount,
         objective_definition || jsonb_build_object(
           'progress_metric','different_from_last_daily_activity','target_count',1
         ),
         'verified', true
  FROM economy_private.mission_template_versions
  WHERE template_id='try_something_different' AND template_version=2;

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id, template_version, predicate_version, predicate_key,
    source_system, experience_id, activity_id, event_type, validator_version,
    mapping_status, predicate_definition
  )
  SELECT template_id, 99, predicate_version, predicate_key,
         source_system, experience_id, activity_id, event_type, validator_version,
         'verified', predicate_definition
  FROM economy_private.mission_event_predicate_mappings
  WHERE template_id='try_something_different' AND template_version=2;

  SELECT objective_definition INTO v_learning_snapshot
  FROM economy_private.mission_template_versions
  WHERE template_id='learning_step' AND template_version=99;
  SELECT objective_definition INTO v_variety_snapshot
  FROM economy_private.mission_template_versions
  WHERE template_id='try_something_different' AND template_version=99;

  IF v_learning_snapshot IS NULL OR v_variety_snapshot IS NULL THEN
    RAISE EXCEPTION 'Phase 6C temporary verified templates were not created';
  END IF;

  INSERT INTO economy_private.mission_boards (
    board_id,user_id,period_type,period_start,period_end,timezone_name,
    config_version,template_bank_version
  ) VALUES (
    v_board,v_user,'daily',date_trunc('day',now()),
    date_trunc('day',now()) + interval '1 day','UTC',1,1
  );

  INSERT INTO economy_private.mission_assignments (
    assignment_id,board_id,user_id,slot_number,template_id,template_version,
    objective_snapshot,reward_snapshot
  ) VALUES
    (v_learning_assignment,v_board,v_user,1,'learning_step',99,v_learning_snapshot,10),
    (v_variety_assignment,v_board,v_user,2,'try_something_different',99,v_variety_snapshot,10);

  -- First OOO activity: Learning Step advances; variety has no previous activity.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_first_event,v_user,v_first_event,'think_lab','think_lab','odd_one_out',
    'game_session_completed',now()-interval '30 minutes',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"steady","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_learning_assignment AND progress_value=1 AND assignment_status='active'
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence
    WHERE assignment_id=v_variety_assignment
  ) THEN
    RAISE EXCEPTION 'First daily activity must advance Learning Step only';
  END IF;

  -- Repeating OOO advances Learning Step but must not satisfy variety.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_second_event,v_user,v_second_event,'think_lab','think_lab','odd_one_out',
    'game_session_completed',now()-interval '20 minutes',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":12,"correct_count":9,"incorrect_count":3}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_learning_assignment AND progress_value=2 AND assignment_status='active'
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence
    WHERE assignment_id=v_variety_assignment
  ) THEN
    RAISE EXCEPTION 'A repeated activity must not satisfy Try Something Different';
  END IF;

  -- Word Forge is different from the most recent prior daily activity (OOO).
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES (
    v_third_event,v_user,v_third_event,'think_lab','think_lab','word_forge',
    'game_session_completed',now()-interval '10 minutes',now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":24,"correct_count":20,"incorrect_count":4}'::jsonb
  );

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_learning_assignment AND progress_value=3 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Third valid activity must complete the cumulative Learning Step target';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE assignment_id=v_variety_assignment AND progress_value=1 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'A different game must complete Try Something Different';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_assignment_evidence
      WHERE assignment_id=v_variety_assignment) <> 1
     OR (SELECT count(*) FROM economy_private.mission_event_progress
         WHERE assignment_id=v_variety_assignment) <> 1
     OR NOT EXISTS (
       SELECT 1 FROM economy_private.mission_event_progress
       WHERE assignment_id=v_variety_assignment AND event_id=v_third_event
     ) THEN
    RAISE EXCEPTION 'Variety mission must persist exactly one qualifying evidence/progress record';
  END IF;

  -- The JSON-claims role path must also make replay a harmless no-op.
  v_replay_count := economy_private.process_mission_event(v_third_event);
  IF v_replay_count <> 0 THEN
    RAISE EXCEPTION 'Replaying the third event must not create additional progress';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=v_user) THEN
    RAISE EXCEPTION 'Phase 6C must not create wallets, ledger entries, rewards, or achievements';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6C must leave the economy disabled';
  END IF;
END;
$phase6c$;

ROLLBACK;
