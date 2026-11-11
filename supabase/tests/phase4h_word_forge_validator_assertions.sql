BEGIN;
INSERT INTO auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES('f4b80000-0000-4000-8000-000000000051','authenticated','authenticated','velorn-word-forge@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());
SELECT set_config('request.jwt.claim.role','service_role',true);
DO $test$
DECLARE u uuid:='f4b80000-0000-4000-8000-000000000051';s uuid:='f4b80000-0000-4000-8000-000000000061';g uuid:='f4b80000-0000-4000-8000-000000000062';qs jsonb;r jsonb;
BEGIN
 IF has_function_privilege('anon','public.velorn_start_word_forge_session(uuid,uuid,text,text,text,text,jsonb,timestamptz)','EXECUTE')
 OR has_function_privilege('authenticated','public.velorn_submit_word_forge_answer(uuid,text,uuid,integer,text)','EXECUTE')
 OR NOT has_function_privilege('service_role','public.velorn_start_word_forge_session(uuid,uuid,text,text,text,text,jsonb,timestamptz)','EXECUTE')
 THEN RAISE EXCEPTION 'Word Forge RPC grants are not service-role-only';END IF;
 IF has_table_privilege('anon','economy_private.word_forge_validator_sessions','SELECT') OR has_table_privilege('authenticated','economy_private.word_forge_validator_sessions','SELECT')
 THEN RAISE EXCEPTION 'Browser roles can read private Word Forge sessions';END IF;
 SELECT jsonb_agg(jsonb_build_object('id','WF-G-'||lpad(n::text,3,'0'),'clue','A common fruit that grows on a tree.','letters','PPLAE','answerWord','apple','explain','An apple is a common fruit that grows on an apple tree.','skill','Food vocabulary','prompt','Forge the word from the letter tiles.') ORDER BY n)
 INTO qs FROM generate_series(1,24) AS gs(n);
 PERFORM public.velorn_start_word_forge_session(s,u,NULL,NULL,'word-forge-reviewed-72-20261111-v1','guided',qs,clock_timestamp()+interval '30 minutes');
 PERFORM public.velorn_start_word_forge_session(g,NULL,repeat('a',64),repeat('b',64),'word-forge-reviewed-72-20261111-v1','guided',qs,clock_timestamp()+interval '30 minutes');
 BEGIN PERFORM public.velorn_start_word_forge_session('f4b80000-0000-4000-8000-000000000064',NULL,NULL,repeat('b',64),'word-forge-reviewed-72-20261111-v1','guided',qs,clock_timestamp()+interval '30 minutes');RAISE EXCEPTION 'Unowned guest session accepted';EXCEPTION WHEN SQLSTATE '22023' THEN NULL;END;
 PERFORM pg_sleep(0.7);
 BEGIN PERFORM public.velorn_submit_word_forge_answer(u,NULL,s,1,'apple');RAISE EXCEPTION 'Out-of-order answer accepted';EXCEPTION WHEN SQLSTATE '22023' THEN NULL;END;
 BEGIN PERFORM public.velorn_submit_word_forge_answer(u,NULL,s,NULL,'apple');RAISE EXCEPTION 'NULL question index accepted';EXCEPTION WHEN SQLSTATE '22023' THEN NULL;END;
 BEGIN PERFORM public.velorn_start_word_forge_session('f4b80000-0000-4000-8000-000000000063',u,NULL,NULL,'word-forge-reviewed-72-20261111-v1',NULL,qs,clock_timestamp()+interval '30 minutes');RAISE EXCEPTION 'NULL training mode accepted';EXCEPTION WHEN SQLSTATE '22023' THEN NULL;END;
 IF (SELECT current_index FROM economy_private.word_forge_validator_sessions WHERE session_id=s)<>0 THEN RAISE EXCEPTION 'Rejected answer changed session cursor';END IF;
 UPDATE economy_private.word_forge_validator_sessions SET current_index=23,correct_count=0,
 answers=(SELECT jsonb_agg(jsonb_build_object('question_index',n,'submitted_word','wrong','is_correct',false,'attempt_number',1,'answered_at',clock_timestamp())) FROM generate_series(0,22) AS gs(n))
 WHERE session_id=s;
 PERFORM pg_sleep(0.7);r:=public.velorn_submit_word_forge_answer(u,NULL,s,23,'wrong');
 IF (r->>'advance')::boolean OR (r->>'attempts_remaining')::integer<>2 THEN RAISE EXCEPTION 'First wrong attempt did not allow retry';END IF;
 PERFORM pg_sleep(0.7);r:=public.velorn_submit_word_forge_answer(u,NULL,s,23,'wrong');
 IF (r->>'advance')::boolean OR (r->>'attempts_remaining')::integer<>1 THEN RAISE EXCEPTION 'Second wrong attempt should still hold cursor';END IF;
 PERFORM pg_sleep(0.7);r:=public.velorn_submit_word_forge_answer(u,NULL,s,23,'wrong');
 IF NOT (r->>'completed')::boolean OR r->>'correct_answer'<>'apple' THEN RAISE EXCEPTION 'Third wrong attempt did not resolve question';END IF;
 IF NOT EXISTS(SELECT 1 FROM economy_private.activity_events WHERE user_id=u AND source_event_key=s AND source_system='think_lab' AND experience_id='think_lab' AND activity_id='word_forge' AND event_type='game_session_completed' AND validator_version='word-forge-reviewed-72-20261111-v1' AND evidence='{"training_mode":"guided","question_count":24,"correct_count":0,"incorrect_count":24}'::jsonb)
 THEN RAISE EXCEPTION 'Authenticated completion event missing or malformed';END IF;
 UPDATE economy_private.word_forge_validator_sessions SET current_index=23,correct_count=0,
 answers=(SELECT jsonb_agg(jsonb_build_object('question_index',n,'submitted_word','wrong','is_correct',false,'attempt_number',1,'answered_at',clock_timestamp())) FROM generate_series(0,22) AS gs(n))
 WHERE session_id=g;
 PERFORM pg_sleep(0.7);PERFORM public.velorn_submit_word_forge_answer(NULL,repeat('a',64),g,23,'wrong');
 PERFORM pg_sleep(0.7);PERFORM public.velorn_submit_word_forge_answer(NULL,repeat('a',64),g,23,'wrong');
 PERFORM pg_sleep(0.7);PERFORM public.velorn_submit_word_forge_answer(NULL,repeat('a',64),g,23,'wrong');
 IF EXISTS(SELECT 1 FROM economy_private.activity_events WHERE source_event_key=g) THEN RAISE EXCEPTION 'Guest completion emitted an activity event';END IF;
 IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN RAISE EXCEPTION 'Economy must remain disabled';END IF;
 IF EXISTS(SELECT 1 FROM economy_private.wallets WHERE user_id=u) OR EXISTS(SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=u)
 OR EXISTS(SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=u) OR EXISTS(SELECT 1 FROM economy_private.achievement_awards WHERE user_id=u)
 THEN RAISE EXCEPTION 'Validator created wallet or reward data';END IF;
END;$test$;
ROLLBACK;
