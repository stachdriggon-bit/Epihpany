BEGIN;

INSERT INTO auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES ('f5f60000-0000-4000-8000-000000000051','authenticated','authenticated','sentence-scramble-transition@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role','service_role',true);

DO $test$
DECLARE
  u uuid := 'f5f60000-0000-4000-8000-000000000051';
  full_session uuid := 'f5f60000-0000-4000-8000-000000000061';
  daily_guest uuid := 'f5f60000-0000-4000-8000-000000000062';
  full_questions jsonb;
  daily_questions jsonb;
  result jsonb;
  i integer;
  event_count integer;
  observed_wrong_attempt_count integer;
  expected_completed boolean;
  correct_order jsonb := jsonb_build_array(2,4,3,0,1);
  wrong_order jsonb := jsonb_build_array(4,2,3,0,1);
BEGIN
  IF has_function_privilege('anon','public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)','EXECUTE')
     OR has_function_privilege('authenticated','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
  THEN
    RAISE EXCEPTION 'Unified Sentence Scramble RPC privileges are not service-role-only';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id','SS-G-'||lpad(n::text,3,'0'),
    'prompt','Build the sentence in the correct order.',
    'sentence','We read books every day.',
    'acceptedAnswers','[]'::jsonb,
    'skill','word order',
    'explanation','The subject comes before the verb in this statement.',
    'words',jsonb_build_array('every','day.','We','books','read')
  ) ORDER BY n)
  INTO full_questions
  FROM generate_series(1,24) AS gs(n);
  daily_questions := jsonb_build_array(full_questions -> 0);

  PERFORM public.velorn_start_think_lab_validator_session(
    full_session,'sentence_scramble',u,NULL,NULL,'sentence-scramble-72-20261112-v1',NULL,'guided',
    full_questions,clock_timestamp()+interval '35 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    daily_guest,'sentence_scramble',NULL,repeat('a',64),repeat('b',64),'sentence-scramble-72-20261112-v1',NULL,'guided',
    daily_questions,clock_timestamp()+interval '35 minutes'
  );

  -- Duplicate or incomplete tile indexes are rejected before a session transition.
  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      u,NULL,full_session,'sentence_scramble',0,jsonb_build_object('tileOrder',jsonb_build_array(2,2,3,0,1))
    );
    RAISE EXCEPTION 'Sentence Scramble accepted duplicate tile indexes';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- A wrong arrangement is retryable and must not reveal sentence, explanation or skill.
  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = full_session;
  result := public.velorn_submit_think_lab_validator_answer(
    u,NULL,full_session,'sentence_scramble',0,jsonb_build_object('tileOrder',wrong_order)
  );
  IF (result->>'correct')::boolean IS DISTINCT FROM false
     OR (result->>'next_index')::integer <> 0
     OR (result->>'completed')::boolean IS DISTINCT FROM false
     OR result ? 'sentence' OR result ? 'explanation' OR result ? 'skill'
  THEN RAISE EXCEPTION 'Wrong Sentence Scramble arrangement advanced or leaked its answer: %',result; END IF;
  SELECT wrong_attempt_count INTO observed_wrong_attempt_count
  FROM economy_private.think_lab_validator_sessions WHERE session_id=full_session;
  IF observed_wrong_attempt_count <> 1 THEN RAISE EXCEPTION 'Sentence Scramble wrong attempt was not aggregated'; END IF;

  -- Correct permutations advance exactly one sentence; only correct tile orders are stored.
  FOR i IN 0..23 LOOP
    expected_completed := i = 23;
    UPDATE economy_private.think_lab_validator_sessions
      SET last_answer_at = clock_timestamp()-interval '1 second'
      WHERE session_id = full_session;
    result := public.velorn_submit_think_lab_validator_answer(
      u,NULL,full_session,'sentence_scramble',i,jsonb_build_object('tileOrder',correct_order)
    );
    IF (result->>'correct')::boolean IS DISTINCT FROM true
       OR (result->>'question_index')::integer <> i
       OR (result->>'next_index')::integer <> i+1
       OR (result->>'completed')::boolean IS DISTINCT FROM expected_completed
       OR result->>'sentence' IS DISTINCT FROM 'We read books every day.'
       OR result->>'explanation' IS DISTINCT FROM 'The subject comes before the verb in this statement.'
       OR result->>'skill' IS DISTINCT FROM 'word order'
    THEN RAISE EXCEPTION 'Sentence Scramble progression failed at question %: %',i,result; END IF;
  END LOOP;

  IF (SELECT jsonb_array_length(answers) FROM economy_private.think_lab_validator_sessions WHERE session_id=full_session) <> 24
  THEN RAISE EXCEPTION 'Sentence Scramble must store only the 24 accepted sentence transitions'; END IF;

  SELECT count(*) INTO event_count
  FROM economy_private.activity_events
  WHERE user_id=u AND source_event_key=full_session
    AND source_system='think_lab' AND experience_id='think_lab'
    AND activity_id='sentence_scramble' AND event_type='game_session_completed'
    AND validator_version='sentence-scramble-72-20261112-v1'
    AND evidence=jsonb_build_object(
      'training_mode','guided','session_type','full','question_count',24,
      'correct_count',24,'incorrect_count',0,'wrong_attempts',1
    );
  IF event_count <> 1 THEN RAISE EXCEPTION 'Full Sentence Scramble must emit exactly one trusted completion event; found %',event_count; END IF;

  -- A daily guest session contains one server-selected sentence and emits no economy event.
  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = daily_guest;
  result := public.velorn_submit_think_lab_validator_answer(
    NULL,repeat('a',64),daily_guest,'sentence_scramble',0,jsonb_build_object('tileOrder',correct_order)
  );
  IF (result->>'correct')::boolean IS DISTINCT FROM true
     OR (result->>'completed')::boolean IS DISTINCT FROM true
     OR result->>'sentence' IS DISTINCT FROM 'We read books every day.'
  THEN RAISE EXCEPTION 'Daily guest Sentence Scramble completion failed: %',result; END IF;
  IF EXISTS (SELECT 1 FROM economy_private.activity_events WHERE source_event_key=daily_guest)
  THEN RAISE EXCEPTION 'Guest Sentence Scramble completion emitted an activity event'; END IF;

  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      u,NULL,full_session,'sentence_scramble',23,jsonb_build_object('tileOrder',correct_order)
    );
    RAISE EXCEPTION 'Completed Sentence Scramble session accepted a replay';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'The economy must remain disabled'; END IF;
  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=u)
  THEN RAISE EXCEPTION 'Sentence Scramble validation created economy records'; END IF;
END;
$test$;

ROLLBACK;
