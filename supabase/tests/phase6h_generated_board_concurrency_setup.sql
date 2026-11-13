-- Phase 6H: generated boards, trusted Think Lab events, and atomic reward claims end-to-end.
-- All wallet/ledger/claim writes are disposable transaction fixtures and are rolled back.
-- The economy gate is restored to disabled before the enclosing transaction rolls back.
BEGIN;

INSERT INTO auth.users (
  id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) VALUES (
  'f6a80000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6h@example.invalid','',now(),
  '{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()
);

SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);

DO $phase6h$
DECLARE
  v_user uuid := 'f6a80000-0000-4000-8000-000000000001';
  v_reference timestamptz := '2026-11-13 12:00:00+00';
  v_daily_board uuid;
  v_weekly_board uuid;
  v_status text;
  v_period_key text;
  v_count integer;
  v_families integer;
  v_predicates integer;
  v_daily_templates text[];
  v_weekly_templates text[];
  v_last_progress integer;
  v_assignment_id uuid;
  v_first_claim uuid;
  v_replay_claim uuid;
  v_bonus_claim uuid;
  v_bonus_replay uuid;
  v_reward bigint;
  v_replayed boolean;
  v_balance bigint;
  v_claim_count integer;
  v_ledger_count integer;
BEGIN
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6F must start with the economy disabled';
  END IF;

  -- Clone the six Think Lab templates needed to complete the two generated boards.
  -- solve_a_challenge already has its independently verified OOO Challenge mapping.
  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT
    'phase6h_' || t.template_id,t.template_version,t.period_type,t.mission_family,
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
    'phase6h_' || m.template_id,m.template_version,m.predicate_version,m.predicate_key,
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
  INTO v_daily_board,v_status,v_period_key,v_count
  FROM public.economy_generate_mission_board(v_user,'daily',v_reference);

  IF v_daily_board IS NULL OR v_status <> 'created' OR v_count <> 4 THEN
    RAISE EXCEPTION 'Phase 6F must generate one complete four-slot daily board';
  END IF;

  SELECT array_agg(template_id ORDER BY template_id),
         count(DISTINCT objective_snapshot->>'mission_family')::integer,
         count(DISTINCT objective_snapshot->>'predicate_key')::integer
  INTO v_daily_templates,v_families,v_predicates
  FROM economy_private.mission_assignments
  WHERE board_id=v_daily_board;
  IF v_families <> 4 OR v_predicates <> 4
     OR v_daily_templates IS DISTINCT FROM ARRAY[
       'phase6h_learning_step','phase6h_put_knowledge_to_use',
       'phase6h_try_something_different','solve_a_challenge'
     ]::text[] THEN
    RAISE EXCEPTION 'Generated daily board does not contain the four expected distinct missions: %',v_daily_templates;
  END IF;

  SELECT out_board_id,out_status,out_period_key,out_assignment_count
  INTO v_weekly_board,v_status,v_period_key,v_count
  FROM public.economy_generate_mission_board(v_user,'weekly',v_reference);

  IF v_weekly_board IS NULL OR v_status <> 'created' OR v_count <> 3 THEN
    RAISE EXCEPTION 'Phase 6F must generate one complete three-slot weekly board';
  END IF;

  SELECT array_agg(template_id ORDER BY template_id),
         count(DISTINCT objective_snapshot->>'mission_family')::integer,
         count(DISTINCT objective_snapshot->>'predicate_key')::integer
  INTO v_weekly_templates,v_families,v_predicates
  FROM economy_private.mission_assignments
  WHERE board_id=v_weekly_board;
  IF v_families <> 3 OR v_predicates <> 3
     OR v_weekly_templates IS DISTINCT FROM ARRAY[
       'phase6h_broaden_your_experience','phase6h_consistent_progress',
       'phase6h_meaningful_progress'
     ]::text[] THEN
    RAISE EXCEPTION 'Generated weekly board does not contain the three expected distinct missions: %',v_weekly_templates;
  END IF;

  -- Three distinct weekly activity days. The first two sessions are partial rounds.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    'f6a80000-0000-4000-8000-000000000011',v_user,
    'f6a80000-0000-4000-8000-000000000101','think_lab','think_lab','odd_one_out',
    'game_session_completed','2026-11-11 09:00:00+00',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":8,"correct_count":7,"incorrect_count":1}'::jsonb
  ),
  (
    'f6a80000-0000-4000-8000-000000000012',v_user,
    'f6a80000-0000-4000-8000-000000000102','think_lab','think_lab','word_forge',
    'game_session_completed','2026-11-12 09:00:00+00',now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  );

  -- On the daily board's date: a full OOO Challenge round, then a different full game.
  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    'f6a80000-0000-4000-8000-000000000013',v_user,
    'f6a80000-0000-4000-8000-000000000103','think_lab','think_lab','odd_one_out',
    'game_session_completed','2026-11-13 08:00:00+00',now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B2","training_mode":"challenge","question_count":12,"correct_count":10,"incorrect_count":2}'::jsonb
  ),
  (
    'f6a80000-0000-4000-8000-000000000014',v_user,
    'f6a80000-0000-4000-8000-000000000104','think_lab','think_lab','word_forge',
    'game_session_completed','2026-11-13 09:00:00+00',now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"steady","question_count":24,"correct_count":22,"incorrect_count":2}'::jsonb
  ),
  (
    'f6a80000-0000-4000-8000-000000000015',v_user,
    'f6a80000-0000-4000-8000-000000000105','think_lab','think_lab','chain_reaction',
    'game_session_completed','2026-11-13 10:00:00+00',now(),
    'chain-reaction-72-20261112-v1',
    '{"training_mode":"steady","session_type":"full","question_count":24,"link_count":72,"wrong_link_attempts":3,"correct_count":21,"incorrect_count":3}'::jsonb
  );

  -- All four daily assignments must complete from verified events, not browser-supplied progress.
  IF EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_daily_board AND assignment_status <> 'completed'
  ) THEN
    RAISE EXCEPTION 'Every daily mission should complete through the trusted event pipeline';
  END IF;

  -- All three weekly assignments must complete through cumulative evidence.
  IF EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_weekly_board AND assignment_status <> 'completed'
  ) THEN
    RAISE EXCEPTION 'Every weekly mission should complete through the trusted event pipeline';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_daily_board
      AND objective_snapshot->>'predicate_key'='try_something_different_think_lab_v1'
      AND progress_value=1 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Try Something Different must advance only after the second, different daily game';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_weekly_board
      AND objective_snapshot->>'predicate_key'='consistent_progress_think_lab_v1'
      AND progress_value=3 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Consistent Progress must count three distinct local activity days';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_weekly_board
      AND objective_snapshot->>'predicate_key'='broaden_your_experience_think_lab_v1'
      AND progress_value=2 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Broaden Your Experience must count two distinct games';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE board_id=v_weekly_board
      AND objective_snapshot->>'predicate_key'='meaningful_progress_think_lab_v1'
      AND progress_value=1 AND assignment_status='completed'
  ) THEN
    RAISE EXCEPTION 'Meaningful Progress must require a complete multi-step round';
  END IF;

  -- A replay of the last accepted event must not create more progress.
  v_last_progress := economy_private.process_mission_event(
    'f6a80000-0000-4000-8000-000000000015'
  );
  IF v_last_progress <> 0 THEN
    RAISE EXCEPTION 'Replaying an already processed generated-board event must be a no-op';
  END IF;

  IF (SELECT count(*) FROM economy_private.mission_boards WHERE user_id=v_user) <> 2
     OR (SELECT count(*) FROM economy_private.mission_assignments WHERE user_id=v_user) <> 7 THEN
    RAISE EXCEPTION 'End-to-end processing must retain exactly two boards and seven assignments';
  END IF;

  -- Leave the generated, fully completed boards committed for independent concurrent sessions.
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Phase 6H concurrency setup must leave the economy enabled for its isolated claim test';
  END IF;
END;
$phase6h$;

COMMIT;
