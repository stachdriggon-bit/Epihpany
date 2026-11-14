-- Phase 6J: mission-period rollover and strict evidence isolation.
-- All fixtures and the temporary economy gate change are rolled back in the clean-room database.
BEGIN;

INSERT INTO auth.users (
  id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) VALUES (
  'f6b00000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6j@example.invalid','',now(),
  '{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()
);

SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);

DO $phase6j$
DECLARE
  v_user uuid := 'f6b00000-0000-4000-8000-000000000001';
  v_daily_12 uuid;
  v_daily_13 uuid;
  v_daily_14 uuid;
  v_weekly_old uuid;
  v_weekly_new uuid;
  v_board uuid;
  v_status text;
  v_key text;
  v_count integer;
  v_applied integer;
  v_old_days bigint;
  v_new_days bigint;
BEGIN
  UPDATE economy_private.economy_settings
  SET economy_enabled=false,updated_at=clock_timestamp()
  WHERE singleton=true;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6J must begin with the economy disabled';
  END IF;

  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT
    'phase6j_' || t.template_id,t.template_version,t.period_type,t.mission_family,
    t.reward_amount,t.objective_definition,'verified',true
  FROM economy_private.mission_template_versions AS t
  WHERE (t.template_id,t.template_version) IN (
    ('learning_step',2),('try_something_different',2),('put_knowledge_to_use',2),
    ('consistent_progress',2),('broaden_your_experience',2),('meaningful_progress',2)
  );

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT
    'phase6j_' || m.template_id,m.template_version,m.predicate_version,m.predicate_key,
    m.source_system,m.experience_id,m.activity_id,m.event_type,m.validator_version,
    'verified',m.predicate_definition
  FROM economy_private.mission_event_predicate_mappings AS m
  WHERE (m.template_id,m.template_version) IN (
    ('learning_step',2),('try_something_different',2),('put_knowledge_to_use',2),
    ('consistent_progress',2),('broaden_your_experience',2),('meaningful_progress',2)
  );

  UPDATE economy_private.economy_settings
  SET economy_enabled=true,updated_at=clock_timestamp()
  WHERE singleton=true;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_daily_12,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily','2026-11-12 12:00:00+00');
  IF v_daily_12 IS NULL OR v_status <> 'created' OR v_key <> 'daily:2026-11-12' OR v_count <> 4 THEN
    RAISE EXCEPTION 'Nov 12 daily board did not generate as a complete period';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_daily_13,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily','2026-11-13 12:00:00+00');
  IF v_daily_13 IS NULL OR v_status <> 'created' OR v_key <> 'daily:2026-11-13' OR v_count <> 4 THEN
    RAISE EXCEPTION 'Nov 13 daily rollover did not create a fresh complete board';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_daily_14,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily','2026-11-14 00:00:00+00');
  IF v_daily_14 IS NULL OR v_status <> 'created' OR v_key <> 'daily:2026-11-14' OR v_count <> 4 THEN
    RAISE EXCEPTION 'The exact midnight boundary must belong to the new Nov 14 daily board';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_weekly_old,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly','2026-11-13 12:00:00+00');
  IF v_weekly_old IS NULL OR v_status <> 'created' OR v_key <> 'weekly:2026-11-07' OR v_count <> 3 THEN
    RAISE EXCEPTION 'The pre-boundary weekly board must anchor on Saturday Nov 7';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_weekly_new,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly','2026-11-14 00:00:00+00');
  IF v_weekly_new IS NULL OR v_status <> 'created' OR v_key <> 'weekly:2026-11-14' OR v_count <> 3 THEN
    RAISE EXCEPTION 'The exact Saturday midnight boundary must create a new weekly board';
  END IF;

  IF v_daily_12=v_daily_13 OR v_daily_13=v_daily_14 OR v_weekly_old=v_weekly_new THEN
    RAISE EXCEPTION 'A new local period must never reuse the preceding period board';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_boards
    WHERE board_id IN (v_daily_12,v_daily_13,v_daily_14,v_weekly_old,v_weekly_new)
      AND (
        (period_type='daily' AND period_end-period_start <> interval '1 day')
        OR (period_type='weekly' AND period_end-period_start <> interval '7 days')
      )
  ) THEN
    RAISE EXCEPTION 'UTC fixture periods should have their expected one-day/seven-day duration';
  END IF;

  -- Events on Nov 12 and Nov 13 belong to the old Saturday-anchored week.
  -- Events at/after Nov 14 00:00 belong only to the new week and new daily period.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    'f6b00000-0000-4000-8000-000000000011',v_user,
    'f6b00000-0000-4000-8000-000000000101','think_lab','think_lab','odd_one_out',
    'game_session_completed','2026-11-12 09:00:00+00',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  ),
  (
    'f6b00000-0000-4000-8000-000000000012',v_user,
    'f6b00000-0000-4000-8000-000000000102','think_lab','think_lab','odd_one_out',
    'game_session_completed','2026-11-13 08:00:00+00',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B2","training_mode":"challenge","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  ),
  (
    'f6b00000-0000-4000-8000-000000000013',v_user,
    'f6b00000-0000-4000-8000-000000000103','think_lab','think_lab','word_forge',
    'game_session_completed','2026-11-13 09:00:00+00',now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":24,"correct_count":22,"incorrect_count":2}'::jsonb
  ),
  (
    'f6b00000-0000-4000-8000-000000000014',v_user,
    'f6b00000-0000-4000-8000-000000000104','think_lab','think_lab','odd_one_out',
    'game_session_completed','2026-11-14 00:00:00+00',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B2","training_mode":"challenge","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  ),
  (
    'f6b00000-0000-4000-8000-000000000015',v_user,
    'f6b00000-0000-4000-8000-000000000105','think_lab','think_lab','word_forge',
    'game_session_completed','2026-11-14 01:00:00+00',now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":24,"correct_count":22,"incorrect_count":2}'::jsonb
  );

  -- Explicit calls make this test independent of trigger timing; event/assignment
  -- uniqueness keeps it safe if the normal activity-event trigger already ran.
  PERFORM economy_private.process_mission_event('f6b00000-0000-4000-8000-000000000011');
  PERFORM economy_private.process_mission_event('f6b00000-0000-4000-8000-000000000012');
  PERFORM economy_private.process_mission_event('f6b00000-0000-4000-8000-000000000013');
  PERFORM economy_private.process_mission_event('f6b00000-0000-4000-8000-000000000014');
  PERFORM economy_private.process_mission_event('f6b00000-0000-4000-8000-000000000015');

  -- No evidence may ever cross a board's half-open UTC period boundary.
  IF EXISTS (
    SELECT 1
    FROM economy_private.mission_assignment_evidence e
    JOIN economy_private.mission_assignments a ON a.assignment_id=e.assignment_id
    JOIN economy_private.mission_boards b ON b.board_id=a.board_id
    WHERE b.user_id=v_user
      AND (e.occurred_at < b.period_start OR e.occurred_at >= b.period_end)
  ) THEN
    RAISE EXCEPTION 'Mission evidence crossed a board period boundary';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence e
    JOIN economy_private.mission_assignments a ON a.assignment_id=e.assignment_id
    WHERE a.board_id=v_daily_12 AND e.event_id <> 'f6b00000-0000-4000-8000-000000000011'
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence e
    JOIN economy_private.mission_assignments a ON a.assignment_id=e.assignment_id
    WHERE a.board_id=v_daily_13 AND e.event_id NOT IN (
      'f6b00000-0000-4000-8000-000000000012',
      'f6b00000-0000-4000-8000-000000000013'
    )
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence e
    JOIN economy_private.mission_assignments a ON a.assignment_id=e.assignment_id
    WHERE a.board_id=v_daily_14 AND e.event_id NOT IN (
      'f6b00000-0000-4000-8000-000000000014',
      'f6b00000-0000-4000-8000-000000000015'
    )
  ) THEN
    RAISE EXCEPTION 'Daily evidence leaked into a neighboring day board';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence e
    JOIN economy_private.mission_assignments a ON a.assignment_id=e.assignment_id
    WHERE a.board_id=v_weekly_old AND e.event_id IN (
      'f6b00000-0000-4000-8000-000000000014',
      'f6b00000-0000-4000-8000-000000000015'
    )
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_assignment_evidence e
    JOIN economy_private.mission_assignments a ON a.assignment_id=e.assignment_id
    WHERE a.board_id=v_weekly_new AND e.event_id IN (
      'f6b00000-0000-4000-8000-000000000011',
      'f6b00000-0000-4000-8000-000000000012',
      'f6b00000-0000-4000-8000-000000000013'
    )
  ) THEN
    RAISE EXCEPTION 'Weekly evidence leaked across the Saturday rollover';
  END IF;

  SELECT a.progress_value INTO v_old_days
  FROM economy_private.mission_assignments a
  WHERE a.board_id=v_weekly_old
    AND a.objective_snapshot->>'predicate_key'='consistent_progress_think_lab_v1';
  SELECT a.progress_value INTO v_new_days
  FROM economy_private.mission_assignments a
  WHERE a.board_id=v_weekly_new
    AND a.objective_snapshot->>'predicate_key'='consistent_progress_think_lab_v1';
  IF v_old_days IS DISTINCT FROM 2 OR v_new_days IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'Distinct-day progress must remain isolated per week (old %, new %)',v_old_days,v_new_days;
  END IF;

  -- The daily variety mission must compare against the last daily activity,
  -- then complete only when the second activity in the new day differs.
  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_daily_13
      AND objective_snapshot->>'predicate_key'='try_something_different_think_lab_v1'
      AND progress_value=1 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Daily variety must use the previous daily activity without leaking old-day progress';
  END IF;

  -- Same-period retries must return the same board; adjacent periods remain distinct.
  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily','2026-11-13 23:59:59+00');
  IF v_board IS DISTINCT FROM v_daily_13 OR v_status <> 'existing'
     OR v_key <> 'daily:2026-11-13' OR v_count <> 4 THEN
    RAISE EXCEPTION 'A retry within the same local day must return the existing complete board';
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
    INTO v_board,v_status,v_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly','2026-11-14 00:00:00+00');
  IF v_board IS DISTINCT FROM v_weekly_new OR v_status <> 'existing'
     OR v_key <> 'weekly:2026-11-14' OR v_count <> 3 THEN
    RAISE EXCEPTION 'A retry at the new weekly boundary must return the new weekly board';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_boards WHERE user_id=v_user) <> 5
     OR (SELECT count(*) FROM economy_private.mission_assignments WHERE user_id=v_user) <> 18 THEN
    RAISE EXCEPTION 'Three daily and two weekly periods must retain exactly five complete boards and eighteen assignments';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=v_user)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=v_user) THEN
    RAISE EXCEPTION 'Period rollover and evidence processing must not create financial or achievement records';
  END IF;

  UPDATE economy_private.economy_settings
  SET economy_enabled=false,updated_at=clock_timestamp()
  WHERE singleton=true;
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6J must restore the disabled economy gate';
  END IF;
END;
$phase6j$;

ROLLBACK;
