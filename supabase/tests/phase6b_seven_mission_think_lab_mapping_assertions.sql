-- Phase 6B: seven approved mission definitions and exact Think Lab event contracts.
-- Mappings remain deliberately non-assignable until this contract is reviewed and CI passes.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
  ('f6b00000-0000-4000-8000-000000000001','authenticated','authenticated','velorn-phase6b@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase6b$
DECLARE
  v_event_ooo uuid := 'f6b00000-0000-4000-8000-000000000011';
  v_event_wf uuid := 'f6b00000-0000-4000-8000-000000000012';
  v_event_chain uuid := 'f6b00000-0000-4000-8000-000000000013';
  v_event_sentence uuid := 'f6b00000-0000-4000-8000-000000000014';
  v_event_guided uuid := 'f6b00000-0000-4000-8000-000000000015';
  v_template_count integer;
  v_mapping_count integer;
BEGIN
  SELECT count(*) INTO v_template_count
  FROM economy_private.mission_template_versions
  WHERE (template_id,template_version) IN (
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  )
  AND validator_mapping_status='mapped' AND NOT is_assignable;
  IF v_template_count <> 7 THEN
    RAISE EXCEPTION 'Expected seven mapped/non-assignable mission versions; found %',v_template_count;
  END IF;

  SELECT count(*) INTO v_mapping_count
  FROM economy_private.mission_event_predicate_mappings
  WHERE (template_id,template_version) IN (
    ('learning_step',2),('try_something_different',2),('solve_a_challenge',5),
    ('put_knowledge_to_use',2),('consistent_progress',2),
    ('broaden_your_experience',2),('meaningful_progress',2)
  ) AND mapping_status='mapped';
  IF v_mapping_count <> 28 THEN
    RAISE EXCEPTION 'Expected 28 exact event mappings (four games per mission); found %',v_mapping_count;
  END IF;

  IF has_function_privilege('anon','economy_private.evaluate_learning_step_think_lab_v1(uuid)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.evaluate_learning_step_think_lab_v1(uuid)','EXECUTE')
     OR NOT has_function_privilege('service_role','economy_private.evaluate_learning_step_think_lab_v1(uuid)','EXECUTE')
     OR has_function_privilege('anon','economy_private.is_valid_think_lab_completion_v1(uuid,boolean,boolean)','EXECUTE')
     OR has_function_privilege('authenticated','economy_private.is_valid_think_lab_completion_v1(uuid,boolean,boolean)','EXECUTE')
  THEN RAISE EXCEPTION 'Think Lab predicate evaluators must remain private and service-role-only'; END IF;

  INSERT INTO economy_private.activity_events (
    event_id,user_id,source_event_key,source_system,experience_id,activity_id,
    event_type,occurred_at,received_at,validator_version,evidence
  ) VALUES
  (
    v_event_ooo,'f6b00000-0000-4000-8000-000000000001',v_event_ooo,
    'think_lab','think_lab','odd_one_out','game_session_completed',now(),now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  ),
  (
    v_event_wf,'f6b00000-0000-4000-8000-000000000001',v_event_wf,
    'think_lab','think_lab','word_forge','game_session_completed',now(),now(),
    'word-forge-reviewed-72-20261111-v1',
    '{"training_mode":"challenge","question_count":24,"correct_count":18,"incorrect_count":6}'::jsonb
  ),
  (
    v_event_chain,'f6b00000-0000-4000-8000-000000000001',v_event_chain,
    'think_lab','think_lab','chain_reaction','game_session_completed',now(),now(),
    'chain-reaction-72-20261112-v1',
    '{"training_mode":"challenge","session_type":"full","question_count":24,"link_count":72,"wrong_link_attempts":3,"correct_count":20,"incorrect_count":4}'::jsonb
  ),
  (
    v_event_sentence,'f6b00000-0000-4000-8000-000000000001',v_event_sentence,
    'think_lab','think_lab','sentence_scramble','game_session_completed',now(),now(),
    'sentence-scramble-72-20261112-v1',
    '{"training_mode":"challenge","session_type":"full","question_count":24,"correct_count":24,"incorrect_count":0,"wrong_attempts":2}'::jsonb
  ),
  (
    v_event_guided,'f6b00000-0000-4000-8000-000000000001',v_event_guided,
    'think_lab','think_lab','odd_one_out','game_session_completed',now(),now(),
    'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"guided","question_count":12,"correct_count":12,"incorrect_count":0}'::jsonb
  );

  IF NOT economy_private.evaluate_learning_step_think_lab_v1(v_event_ooo)
     OR NOT economy_private.evaluate_learning_step_think_lab_v1(v_event_wf)
     OR NOT economy_private.evaluate_learning_step_think_lab_v1(v_event_chain)
     OR NOT economy_private.evaluate_learning_step_think_lab_v1(v_event_sentence)
  THEN RAISE EXCEPTION 'Learning Step must accept all four exact authenticated game completion contracts'; END IF;

  IF NOT economy_private.evaluate_solve_a_challenge_think_lab_v1(v_event_ooo)
     OR NOT economy_private.evaluate_solve_a_challenge_think_lab_v1(v_event_wf)
     OR NOT economy_private.evaluate_solve_a_challenge_think_lab_v1(v_event_chain)
     OR NOT economy_private.evaluate_solve_a_challenge_think_lab_v1(v_event_sentence)
     OR economy_private.evaluate_solve_a_challenge_think_lab_v1(v_event_guided)
  THEN RAISE EXCEPTION 'Solve a Challenge must require Challenge mode across all four games'; END IF;

  IF NOT economy_private.evaluate_put_knowledge_to_use_think_lab_v1(v_event_ooo)
     OR NOT economy_private.evaluate_put_knowledge_to_use_think_lab_v1(v_event_wf)
     OR NOT economy_private.evaluate_put_knowledge_to_use_think_lab_v1(v_event_chain)
     OR NOT economy_private.evaluate_put_knowledge_to_use_think_lab_v1(v_event_sentence)
  THEN RAISE EXCEPTION 'Put Knowledge to Use must accept only completed full-round contracts'; END IF;

  IF NOT economy_private.evaluate_meaningful_progress_think_lab_v1(v_event_ooo)
     OR NOT economy_private.evaluate_meaningful_progress_think_lab_v1(v_event_wf)
     OR NOT economy_private.evaluate_meaningful_progress_think_lab_v1(v_event_chain)
     OR NOT economy_private.evaluate_meaningful_progress_think_lab_v1(v_event_sentence)
     OR NOT economy_private.evaluate_try_something_different_think_lab_v1(v_event_ooo)
     OR NOT economy_private.evaluate_consistent_progress_think_lab_v1(v_event_wf)
     OR NOT economy_private.evaluate_broaden_your_experience_think_lab_v1(v_event_chain)
  THEN RAISE EXCEPTION 'Weekly and variety predicates must accept trusted completed game events'; END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_assignments
    WHERE user_id='f6b00000-0000-4000-8000-000000000001'
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_progress
    WHERE user_id='f6b00000-0000-4000-8000-000000000001'
  ) THEN
    RAISE EXCEPTION 'Mapped/non-assignable Phase 6B templates must not progress live assignments';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id='f6b00000-0000-4000-8000-000000000001')
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id='f6b00000-0000-4000-8000-000000000001')
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id='f6b00000-0000-4000-8000-000000000001')
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id='f6b00000-0000-4000-8000-000000000001')
  THEN RAISE EXCEPTION 'Phase 6B predicate verification must never create reward records'; END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'Phase 6B must leave the economy disabled'; END IF;
END;
$phase6b$;

ROLLBACK;
