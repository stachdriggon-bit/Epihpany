-- Phase 6M: player dashboard read-model integration contract. Rollback-only.
BEGIN;
INSERT INTO auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES
('f6d00000-0000-4000-8000-000000000001','authenticated','authenticated','velorn-phase6m-owner@example.invalid','',now(),'{}','{"timezone_name":"UTC"}',now(),now()),
('f6d00000-0000-4000-8000-000000000002','authenticated','authenticated','velorn-phase6m-other@example.invalid','',now(),'{}','{"timezone_name":"UTC"}',now(),now());
SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);
DO $phase6m$
DECLARE
  v_user uuid := 'f6d00000-0000-4000-8000-000000000001';
  v_other uuid := 'f6d00000-0000-4000-8000-000000000002';
  v_daily uuid := 'f6d00000-0000-4000-8000-000000000101';
  v_weekly uuid := 'f6d00000-0000-4000-8000-000000000102';
  v_data jsonb; v_other_data jsonb; v_daily_assignments jsonb; v_weekly_assignments jsonb;
BEGIN
  UPDATE economy_private.economy_settings SET economy_enabled=true,updated_at=clock_timestamp() WHERE singleton=true;
  INSERT INTO economy_private.wallets(user_id,balance,version) VALUES(v_user,0,0);
  INSERT INTO economy_private.mission_boards(board_id,user_id,period_type,period_start,period_end,timezone_name,config_version,template_bank_version)
  VALUES
  (v_daily,v_user,'daily',clock_timestamp()-interval '1 hour',clock_timestamp()+interval '1 hour','UTC',1,1),
  (v_weekly,v_user,'weekly',clock_timestamp()-interval '1 hour',clock_timestamp()+interval '1 hour','UTC',1,1);
  INSERT INTO economy_private.mission_assignments(
    assignment_id,board_id,user_id,slot_number,template_id,template_version,objective_snapshot,
    reward_snapshot,progress_value,assignment_status,completed_at
  ) VALUES
  ('f6d00000-0000-4000-8000-000000000201',v_daily,v_user,1,'learning_step',2,'{"summary":"Complete a learning activity","target_count":1}',10,1,'completed',clock_timestamp()),
  ('f6d00000-0000-4000-8000-000000000202',v_daily,v_user,2,'try_something_different',2,'{"summary":"Try a different activity","target_count":1}',10,0,'active',NULL),
  ('f6d00000-0000-4000-8000-000000000203',v_daily,v_user,3,'solve_a_challenge',5,'{"summary":"Solve a challenge","target_count":1}',10,0,'active',NULL),
  ('f6d00000-0000-4000-8000-000000000204',v_daily,v_user,4,'put_knowledge_to_use',2,'{"summary":"Apply what you learned","target_count":1}',10,0,'active',NULL),
  ('f6d00000-0000-4000-8000-000000000211',v_weekly,v_user,1,'consistent_progress',2,'{"summary":"Make progress on three days","target_count":3}',20,1,'active',NULL),
  ('f6d00000-0000-4000-8000-000000000212',v_weekly,v_user,2,'broaden_your_experience',2,'{"summary":"Explore two activities","target_count":2}',20,0,'active',NULL),
  ('f6d00000-0000-4000-8000-000000000213',v_weekly,v_user,3,'meaningful_progress',2,'{"summary":"Complete a meaningful milestone","target_count":1}',20,0,'active',NULL);
  v_data := public.economy_get_player_dashboard(v_user);
  IF v_data->>'enabled' IS DISTINCT FROM 'true' OR v_data->>'balance' IS DISTINCT FROM '0'
     OR jsonb_array_length(v_data->'ledger')<>0 THEN RAISE EXCEPTION 'Wallet dashboard contract incorrect: %',v_data; END IF;
  v_daily_assignments := v_data #> '{daily,assignments}';
  v_weekly_assignments := v_data #> '{weekly,assignments}';
  IF jsonb_array_length(v_daily_assignments)<>4 OR jsonb_array_length(v_weekly_assignments)<>3 THEN
    RAISE EXCEPTION 'Dashboard must return four daily and three weekly assignments';
  END IF;
  IF v_daily_assignments->0->>'canClaim' IS DISTINCT FROM 'true'
     OR v_daily_assignments->0->>'rewardAmount' IS DISTINCT FROM '10'
     OR v_daily_assignments->1->>'canClaim' IS DISTINCT FROM 'false' THEN
    RAISE EXCEPTION 'Assignment progress/claim eligibility incorrect: %',v_daily_assignments;
  END IF;
  IF v_data #>> '{daily,canClaimBonus}' IS DISTINCT FROM 'false'
     OR v_data #>> '{weekly,canClaimBonus}' IS DISTINCT FROM 'false' THEN
    RAISE EXCEPTION 'Board bonus must remain unavailable until required claims are paid';
  END IF;
  v_other_data := public.economy_get_player_dashboard(v_other);
  IF v_other_data->>'balance' IS DISTINCT FROM '0'
     OR v_other_data->'daily' IS DISTINCT FROM 'null'::jsonb
     OR v_other_data->'weekly' IS DISTINCT FROM 'null'::jsonb THEN
    RAISE EXCEPTION 'Dashboard returned another account mission data: %',v_other_data;
  END IF;
  PERFORM set_config('request.jwt.claim.role','authenticated',true);
  BEGIN
    PERFORM public.economy_get_player_dashboard(v_user);
    RAISE EXCEPTION 'Authenticated role must not invoke dashboard RPC';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL;
  END;
  PERFORM set_config('request.jwt.claim.role','service_role',true);
  UPDATE economy_private.economy_settings SET economy_enabled=false,updated_at=clock_timestamp() WHERE singleton=true;
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6M must restore the economy gate to false';
  END IF;
END;
$phase6m$;
ROLLBACK;
