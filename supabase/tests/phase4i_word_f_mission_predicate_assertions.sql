-- Phase 4I: Word Forge Challenge event-to-assignment predicate contract.
-- Disposable clean-room DB only. All fixtures roll back; no rewards are issued.
BEGIN;

INSERT INTO auth.users (
 id,aud,role,email,encrypted_password,email_confirmed_at,
 raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) VALUES
 ('f4100000-0000-4000-8000-000000000051','authenticated','authenticated','velorn-f4i-valid@example.invalid','',now(),'{}','{}',now(),now()),
 ('f4100000-0000-4000-8000-000000000052','authenticated','authenticated','velorn-f4i-guided@example.invalid','',now(),'{}','{}',now(),now()),
 ('f4100000-0000-4000-8000-000000000053','authenticated','authenticated','velorn-f4i-malformed@example.invalid','',now(),'{}','{}',now(),now());

SELECT set_config('request.jwt.claim.role','service_role',true);

DO $phase4i$
DECLARE
 u_valid uuid:='f4100000-0000-4000-8000-000000000051';
 u_guided uuid:='f4100000-0000-4000-8000-000000000052';
 u_bad uuid:='f4100000-0000-4000-8000-000000000053';
 b_valid uuid:='f4100000-0000-4000-8000-000000000061';
 b_guided uuid:='f4100000-0000-4000-8000-000000000062';
 b_bad uuid:='f4100000-0000-4000-8000-000000000063';
 a_valid uuid:='f4100000-0000-4000-8000-000000000071';
 a_guided uuid:='f4100000-0000-4000-8000-000000000072';
 a_bad uuid:='f4100000-0000-4000-8000-000000000073';
 e_valid uuid:='f4100000-0000-4000-8000-000000000081';
 e_guided uuid:='f4100000-0000-4000-8000-000000000082';
 e_bad uuid:='f4100000-0000-4000-8000-000000000083';
 v_start timestamptz:=date_trunc('day',clock_timestamp());
 v_applied integer;
BEGIN
 IF has_function_privilege('anon','economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)','EXECUTE')
 OR has_function_privilege('authenticated','economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)','EXECUTE')
 OR NOT has_function_privilege('service_role','economy_private.evaluate_solve_a_challenge_word_forge_v1(uuid)','EXECUTE')
 THEN RAISE EXCEPTION 'Word Forge evaluator must be private and service-role-only'; END IF;

 IF NOT EXISTS (
   SELECT 1 FROM economy_private.mission_template_versions
   WHERE template_id='solve_a_challenge' AND template_version=4
     AND validator_mapping_status='mapped' AND NOT is_assignable
 ) OR NOT EXISTS (
   SELECT 1 FROM economy_private.mission_event_predicate_mappings
   WHERE template_id='solve_a_challenge' AND template_version=4
     AND predicate_version=3 AND mapping_status='mapped'
 ) THEN RAISE EXCEPTION 'Word Forge mapping was activated before verification'; END IF;

 -- Temporary verified fixture: it exercises the real processor without opening
 -- the production Word Forge template or mapping. This transaction rolls back.
 INSERT INTO economy_private.mission_template_versions(
  template_id,template_version,period_type,mission_family,reward_amount,
  objective_definition,validator_mapping_status,is_assignable
 ) VALUES(
  'f4i_word_forge_test',1,'daily','f4i_word_forge_test_family',10,
  '{"summary":"Temporary Word Forge predicate test","predicate_key":"solve_a_challenge_word_forge_v1"}',
  'verified',true
 );
 INSERT INTO economy_private.mission_event_predicate_mappings(
  template_id,template_version,predicate_version,predicate_key,
  source_system,experience_id,activity_id,event_type,validator_version,
  mapping_status,predicate_definition
 ) VALUES(
  'f4i_word_forge_test',1,1,'solve_a_challenge_word_forge_v1',
  'think_lab','think_lab','word_forge','game_session_completed',
  'word-forge-reviewed-72-20261111-v1','verified',
  '{"requires_training_mode":"challenge","question_count":24}'::jsonb
 );

 INSERT INTO economy_private.mission_boards(
  board_id,user_id,period_type,period_start,period_end,timezone_name,config_version,template_bank_version
 ) VALUES
 (b_valid,u_valid,'daily',v_start,v_start+interval '1 day','UTC',1,1),
 (b_guided,u_guided,'daily',v_start,v_start+interval '1 day','UTC',1,1),
 (b_bad,u_bad,'daily',v_start,v_start+interval '1 day','UTC',1,1);

 INSERT INTO economy_private.mission_assignments(
  assignment_id,board_id,user_id,slot_number,template_id,template_version,objective_snapshot,reward_snapshot
 )
 SELECT a.assignment_id,a.board_id,a.user_id,1,t.template_id,1,t.objective_definition,10
 FROM (VALUES (a_valid,b_valid,u_valid),(a_guided,b_guided,u_guided),(a_bad,b_bad,u_bad))
 AS a(assignment_id,board_id,user_id)
 CROSS JOIN economy_private.mission_template_versions t
 WHERE t.template_id='f4i_word_forge_test' AND t.template_version=1;

 -- The real validator emits this exact authenticated event shape after question 24.
 INSERT INTO economy_private.activity_events(
  event_id,user_id,source_event_key,source_system,experience_id,activity_id,
  event_type,occurred_at,received_at,validator_version,evidence
 ) VALUES
 (e_valid,u_valid,e_valid,'think_lab','think_lab','word_forge','game_session_completed',
  clock_timestamp(),clock_timestamp(),'word-forge-reviewed-72-20261111-v1',
  '{"training_mode":"challenge","question_count":24,"correct_count":0,"incorrect_count":24}'),
 (e_guided,u_guided,e_guided,'think_lab','think_lab','word_forge','game_session_completed',
  clock_timestamp(),clock_timestamp(),'word-forge-reviewed-72-20261111-v1',
  '{"training_mode":"guided","question_count":24,"correct_count":24,"incorrect_count":0}'),
 (e_bad,u_bad,e_bad,'think_lab','think_lab','word_forge','game_session_completed',
  clock_timestamp(),clock_timestamp(),'word-forge-reviewed-72-20261111-v1',
  '{"training_mode":"challenge","question_count":24,"correct_count":23,"incorrect_count":0}');

 IF NOT economy_private.evaluate_solve_a_challenge_word_forge_v1(e_valid)
 OR economy_private.evaluate_solve_a_challenge_word_forge_v1(e_guided)
 OR economy_private.evaluate_solve_a_challenge_word_forge_v1(e_bad)
 OR economy_private.evaluate_solve_a_challenge_word_forge_v1('f4100000-0000-4000-8000-000000000099')
 THEN RAISE EXCEPTION 'Word Forge predicate accepted invalid, incomplete, non-Challenge or missing evidence'; END IF;

 IF NOT EXISTS (
  SELECT 1 FROM economy_private.mission_assignments
  WHERE assignment_id=a_valid AND assignment_status='completed' AND progress_value=1
 ) OR EXISTS (
  SELECT 1 FROM economy_private.mission_event_progress
  WHERE event_id<>e_valid AND predicate_key='solve_a_challenge_word_forge_v1'
 ) THEN RAISE EXCEPTION 'A valid Word Forge Challenge completion did not advance exactly its own assignment'; END IF;

 IF EXISTS (
  SELECT 1 FROM economy_private.mission_assignments
  WHERE assignment_id IN (a_guided,a_bad) AND (assignment_status<>'active' OR progress_value<>0)
 ) OR EXISTS (
  SELECT 1 FROM economy_private.mission_event_progress
  WHERE event_id IN (e_guided,e_bad)
 ) THEN RAISE EXCEPTION 'Guided or malformed Word Forge evidence advanced mission progress'; END IF;

 v_applied:=economy_private.process_mission_event(e_valid);
 IF v_applied<>0 OR (SELECT count(*) FROM economy_private.mission_event_progress
                     WHERE event_id=e_valid AND assignment_id=a_valid)<>1
 THEN RAISE EXCEPTION 'Word Forge event replay must be idempotent'; END IF;

 IF EXISTS(SELECT 1 FROM economy_private.wallets WHERE user_id IN (u_valid,u_guided,u_bad))
 OR EXISTS(SELECT 1 FROM economy_private.wallet_ledger WHERE user_id IN (u_valid,u_guided,u_bad))
 OR EXISTS(SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id IN (u_valid,u_guided,u_bad))
 OR EXISTS(SELECT 1 FROM economy_private.achievement_awards WHERE user_id IN (u_valid,u_guided,u_bad))
 THEN RAISE EXCEPTION 'Word Forge predicate test must not create wallets or rewards'; END IF;

 IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false
 THEN RAISE EXCEPTION 'Phase 4I must leave the economy disabled'; END IF;
END;
$phase4i$;

ROLLBACK;
