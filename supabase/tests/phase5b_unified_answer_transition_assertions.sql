BEGIN;

INSERT INTO auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES ('f5b20000-0000-4000-8000-000000000051','authenticated','authenticated','think-lab-transition@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role','service_role',true);

DO $test$
DECLARE
  u uuid := 'f5b20000-0000-4000-8000-000000000051';
  wf_user uuid := 'f5b20000-0000-4000-8000-000000000061';
  wf_guest uuid := 'f5b20000-0000-4000-8000-000000000062';
  ooo_user uuid := 'f5b20000-0000-4000-8000-000000000063';
  ooo_guest uuid := 'f5b20000-0000-4000-8000-000000000064';
  expired_guest uuid := 'f5b20000-0000-4000-8000-000000000065';
  wf_questions jsonb;
  ooo_questions jsonb;
  one_ooo_question jsonb;
  result jsonb;
  i integer;
  event_count integer;
BEGIN
  IF has_function_privilege('anon','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
     OR has_function_privilege('authenticated','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
  THEN
    RAISE EXCEPTION 'Unified answer RPC is not service-role-only';
  END IF;

  IF has_table_privilege('anon','economy_private.think_lab_validator_sessions','SELECT')
     OR has_table_privilege('authenticated','economy_private.think_lab_validator_sessions','SELECT')
     OR has_table_privilege('service_role','economy_private.think_lab_validator_sessions','SELECT')
  THEN
    RAISE EXCEPTION 'Unified session table grants are broader than intended';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id','WF-G-'||lpad(n::text,3,'0'),
    'clue','A common fruit that grows on a tree.',
    'letters','PPLAE',
    'answerWord','apple',
    'explain','An apple is a common fruit that grows on an apple tree.',
    'skill','Food vocabulary',
    'prompt','Forge the word from the letter tiles.'
  ) ORDER BY n)
  INTO wf_questions FROM generate_series(1,24) AS gs(n);

  one_ooo_question := jsonb_build_object(
    'id','OOO-TEST-001',
    'prompt','Choose the word that does not belong.',
    'why','One item belongs to a different category.',
    'words',jsonb_build_array('apple','pear','carrot','plum'),
    'answer',2,
    'explain','A carrot is a vegetable.',
    'relationship','food category',
    'hint','Think about plant parts.',
    'context','A simple food vocabulary question.'
  );
  ooo_questions := jsonb_build_array(one_ooo_question, jsonb_set(one_ooo_question,'{id}','"OOO-TEST-002"'::jsonb));

  PERFORM public.velorn_start_think_lab_validator_session(
    wf_user,'word_forge',u,NULL,NULL,'word-forge-reviewed-72-20261111-v1',NULL,'guided',
    wf_questions,clock_timestamp()+interval '30 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    wf_guest,'word_forge',NULL,repeat('a',64),repeat('b',64),'word-forge-reviewed-72-20261111-v1',NULL,'challenge',
    wf_questions,clock_timestamp()+interval '30 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    ooo_user,'odd_one_out',u,NULL,NULL,'odd-one-out-rotated-20261110-v2','C1','challenge',
    ooo_questions,clock_timestamp()+interval '20 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    ooo_guest,'odd_one_out',NULL,repeat('c',64),repeat('d',64),'odd-one-out-rotated-20261110-v2','A1','guided',
    jsonb_build_array(one_ooo_question),clock_timestamp()+interval '20 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    expired_guest,'odd_one_out',NULL,repeat('e',64),repeat('f',64),'odd-one-out-rotated-20261110-v2','B1','steady',
    jsonb_build_array(one_ooo_question),clock_timestamp()+interval '20 minutes'
  );

  -- Word Forge retains its three-attempt retry policy. Incorrect attempts do not advance.
  FOR i IN 1..3 LOOP
    UPDATE economy_private.think_lab_validator_sessions
      SET last_answer_at = clock_timestamp()-interval '1 second'
      WHERE session_id = wf_user;
    result := public.velorn_submit_think_lab_validator_answer(
      u,NULL,wf_user,'word_forge',0,jsonb_build_object('answerWord','wrong')
    );
    IF (result->>'correct')::boolean OR (result->>'attempts_remaining')::integer <> 3-i
       OR (result->>'advance')::boolean IS DISTINCT FROM (i=3)
    THEN
      RAISE EXCEPTION 'Word Forge retry contract failed on attempt %: %',i,result;
    END IF;
  END LOOP;

  IF (SELECT current_index FROM economy_private.think_lab_validator_sessions WHERE session_id=wf_user) <> 1
  THEN RAISE EXCEPTION 'Word Forge did not advance after its third incorrect attempt'; END IF;

  -- Complete the remaining 23 items and verify the single authenticated completion event.
  FOR i IN 1..23 LOOP
    UPDATE economy_private.think_lab_validator_sessions
      SET last_answer_at = clock_timestamp()-interval '1 second'
      WHERE session_id = wf_user;
    result := public.velorn_submit_think_lab_validator_answer(
      u,NULL,wf_user,'word_forge',i,jsonb_build_object('answerWord','apple')
    );
    IF (result->>'correct')::boolean IS DISTINCT FROM true
       OR (result->>'next_index')::integer <> i+1
       OR (result->>'completed')::boolean IS DISTINCT FROM (i=23)
    THEN
      RAISE EXCEPTION 'Word Forge progression contract failed at index %: %',i,result;
    END IF;
  END LOOP;

  SELECT count(*) INTO event_count FROM economy_private.activity_events
  WHERE user_id=u AND source_event_key=wf_user
    AND source_system='think_lab' AND experience_id='think_lab'
    AND activity_id='word_forge' AND event_type='game_session_completed'
    AND validator_version='word-forge-reviewed-72-20261111-v1'
    AND evidence=jsonb_build_object(
      'training_mode','guided','question_count',24,'correct_count',23,'incorrect_count',1
    );
  IF event_count <> 1 THEN RAISE EXCEPTION 'Word Forge must emit exactly one trusted completion event; found %',event_count; END IF;

  -- A completed session cannot accept a replay, even when the index matches its last item.
  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      u,NULL,wf_user,'word_forge',23,jsonb_build_object('answerWord','apple')
    );
    RAISE EXCEPTION 'Completed Word Forge session accepted a replay';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  -- Odd One Out rejects out-of-order answers and advances exactly one question per selection.
  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = ooo_user;
  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      u,NULL,ooo_user,'odd_one_out',1,jsonb_build_object('selectedIndex',2)
    );
    RAISE EXCEPTION 'Odd One Out accepted an out-of-order question';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = ooo_user;
  result := public.velorn_submit_think_lab_validator_answer(
    u,NULL,ooo_user,'odd_one_out',0,jsonb_build_object('selectedIndex',2)
  );
  IF (result->>'correct')::boolean IS DISTINCT FROM true
     OR (result->>'completed')::boolean IS DISTINCT FROM false
     OR (result->>'next_index')::integer <> 1
  THEN RAISE EXCEPTION 'Odd One Out first answer contract failed: %',result; END IF;

  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = ooo_user;
  result := public.velorn_submit_think_lab_validator_answer(
    u,NULL,ooo_user,'odd_one_out',1,jsonb_build_object('selectedIndex',0)
  );
  IF (result->>'correct')::boolean IS DISTINCT FROM false
     OR (result->>'completed')::boolean IS DISTINCT FROM true
     OR (result->>'next_index')::integer <> 2
  THEN RAISE EXCEPTION 'Odd One Out final answer contract failed: %',result; END IF;

  SELECT count(*) INTO event_count FROM economy_private.activity_events
  WHERE user_id=u AND source_event_key=ooo_user
    AND activity_id='odd_one_out' AND event_type='game_session_completed'
    AND validator_version='odd-one-out-rotated-20261110-v2'
    AND evidence=jsonb_build_object(
      'challenge_level','C1','training_mode','challenge',
      'question_count',2,'correct_count',1,'incorrect_count',1
    );
  IF event_count <> 1 THEN RAISE EXCEPTION 'Odd One Out must emit exactly one mapped completion event; found %',event_count; END IF;

  -- Guest completion never creates an activity event.
  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = ooo_guest;
  result := public.velorn_submit_think_lab_validator_answer(
    NULL,repeat('c',64),ooo_guest,'odd_one_out',0,jsonb_build_object('selectedIndex',2)
  );
  IF (result->>'completed')::boolean IS DISTINCT FROM true
     OR EXISTS (SELECT 1 FROM economy_private.activity_events WHERE source_event_key=ooo_guest)
  THEN RAISE EXCEPTION 'Guest Odd One Out completion emitted an activity event'; END IF;

  -- Guest ownership is bound to the bearer hash, not a caller-selected session ID alone.
  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      NULL,repeat('9',64),wf_guest,'word_forge',0,jsonb_build_object('answerWord','apple')
    );
    RAISE EXCEPTION 'Mismatched guest token accessed a session';
  EXCEPTION WHEN SQLSTATE 'P0002' THEN NULL;
  END;

  -- Expiry is checked inside the locked transition before any progress is changed.
  UPDATE economy_private.think_lab_validator_sessions
    SET created_at = clock_timestamp()-interval '2 minutes',
        expires_at = clock_timestamp()-interval '1 minute',
        last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = expired_guest;
  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      NULL,repeat('e',64),expired_guest,'odd_one_out',0,jsonb_build_object('selectedIndex',2)
    );
    RAISE EXCEPTION 'Expired session accepted an answer';
  EXCEPTION WHEN SQLSTATE '57014' THEN NULL;
  END;
  IF (SELECT current_index FROM economy_private.think_lab_validator_sessions WHERE session_id=expired_guest) <> 0
  THEN RAISE EXCEPTION 'Expired session changed progress'; END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'The economy must remain disabled'; END IF;
  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=u)
  THEN RAISE EXCEPTION 'Think Lab answer transitions created economy records'; END IF;
END;
$test$;

ROLLBACK;
