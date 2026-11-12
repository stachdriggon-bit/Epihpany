BEGIN;

INSERT INTO auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES ('f5e50000-0000-4000-8000-000000000051','authenticated','authenticated','chain-reaction-transition@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role','service_role',true);

DO $test$
DECLARE
  u uuid := 'f5e50000-0000-4000-8000-000000000051';
  full_session uuid := 'f5e50000-0000-4000-8000-000000000061';
  daily_guest uuid := 'f5e50000-0000-4000-8000-000000000062';
  full_questions jsonb;
  daily_questions jsonb;
  result jsonb;
  i integer;
  link_no integer;
  event_count integer;
  wrong_attempt_count integer;
  expected_next_index integer;
  expected_next_link integer;
  expected_challenge_completed boolean;
  expected_completed boolean;
  selected_index integer;
BEGIN
  IF has_function_privilege('anon','public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)','EXECUTE')
     OR has_function_privilege('authenticated','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
     OR NOT has_function_privilege('service_role','public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)','EXECUTE')
  THEN
    RAISE EXCEPTION 'Unified Chain Reaction RPC privileges are not service-role-only';
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id','CR-G-'||lpad(n::text,3,'0'),
    'title','A valid chain',
    'start','BEE',
    'links',jsonb_build_array(
      jsonb_build_object('from','BEE','to','HONEY','options',jsonb_build_array('HONEY','MILK','BREAD'),'answer',0,'explanation','Bees produce honey.'),
      jsonb_build_object('from','HONEY','to','JAR','options',jsonb_build_array('BOX','JAR','PLATE'),'answer',1,'explanation','Honey is stored in a jar.'),
      jsonb_build_object('from','JAR','to','LID','options',jsonb_build_array('LID','HANDLE','WHEEL'),'answer',0,'explanation','A jar has a lid.')
    )
  ) ORDER BY n)
  INTO full_questions
  FROM generate_series(1,24) AS gs(n);

  daily_questions := jsonb_build_array(full_questions -> 0);

  PERFORM public.velorn_start_think_lab_validator_session(
    full_session,'chain_reaction',u,NULL,NULL,'chain-reaction-72-20261112-v1',NULL,'guided',
    full_questions,clock_timestamp()+interval '35 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    daily_guest,'chain_reaction',NULL,repeat('a',64),repeat('b',64),'chain-reaction-72-20261112-v1',NULL,'challenge',
    daily_questions,clock_timestamp()+interval '35 minutes'
  );

  -- A wrong option is accepted as a retryable response but cannot advance or reveal the key.
  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = full_session;
  result := public.velorn_submit_think_lab_validator_answer(
    u,NULL,full_session,'chain_reaction',0,jsonb_build_object('linkIndex',0,'selectedIndex',1)
  );
  IF (result->>'correct')::boolean IS DISTINCT FROM false
     OR (result->>'next_link_index')::integer <> 0
     OR (result->>'next_index')::integer <> 0
     OR result ? 'next_word' OR result ? 'explanation'
  THEN RAISE EXCEPTION 'Wrong Chain Reaction link did not remain retryable or leaked its answer: %',result; END IF;
  SELECT wrong_attempt_count INTO wrong_attempt_count
  FROM economy_private.think_lab_validator_sessions WHERE session_id=full_session;
  IF wrong_attempt_count <> 1 THEN RAISE EXCEPTION 'Wrong Chain Reaction link attempt was not aggregated'; END IF;

  -- A later link cannot be submitted before the expected link.
  UPDATE economy_private.think_lab_validator_sessions
    SET last_answer_at = clock_timestamp()-interval '1 second'
    WHERE session_id = full_session;
  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      u,NULL,full_session,'chain_reaction',0,jsonb_build_object('linkIndex',1,'selectedIndex',1)
    );
    RAISE EXCEPTION 'Chain Reaction accepted an out-of-order link';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- Each challenge stays one session item and advances only after all three links.
  FOR i IN 0..23 LOOP
    FOR link_no IN 0..2 LOOP
      expected_challenge_completed := link_no = 2;
      expected_completed := i = 23 AND link_no = 2;
      expected_next_index := i;
      expected_next_link := link_no + 1;
      selected_index := 0;
      IF link_no = 1 THEN selected_index := 1; END IF;
      IF link_no = 2 THEN
        expected_next_index := i + 1;
        expected_next_link := 0;
      END IF;
      UPDATE economy_private.think_lab_validator_sessions
        SET last_answer_at = clock_timestamp()-interval '1 second'
        WHERE session_id = full_session;
      result := public.velorn_submit_think_lab_validator_answer(
        u,NULL,full_session,'chain_reaction',i,
        jsonb_build_object('linkIndex',link_no,'selectedIndex',selected_index)
      );
      IF (result->>'correct')::boolean IS DISTINCT FROM true
         OR (result->>'link_index')::integer <> link_no
         OR (result->>'challenge_completed')::boolean IS DISTINCT FROM expected_challenge_completed
         OR (result->>'completed')::boolean IS DISTINCT FROM expected_completed
         OR (result->>'next_index')::integer <> expected_next_index
         OR (result->>'next_link_index')::integer <> expected_next_link
         OR result->>'explanation' IS NULL
      THEN RAISE EXCEPTION 'Chain Reaction progression failed at challenge %, link %: %',i,link_no,result; END IF;
    END LOOP;
  END LOOP;

  SELECT count(*) INTO event_count
  FROM economy_private.activity_events
  WHERE user_id=u AND source_event_key=full_session
    AND source_system='think_lab' AND experience_id='think_lab'
    AND activity_id='chain_reaction' AND event_type='game_session_completed'
    AND validator_version='chain-reaction-72-20261112-v1'
    AND evidence=jsonb_build_object(
      'training_mode','guided','session_type','full','question_count',24,
      'link_count',72,'wrong_link_attempts',1,'correct_count',24,'incorrect_count',0
    );
  IF event_count <> 1 THEN RAISE EXCEPTION 'Full Chain Reaction must emit exactly one trusted completion event; found %',event_count; END IF;

  -- A one-challenge daily session completes after its three links, but guests emit no event.
  FOR link_no IN 0..2 LOOP
    UPDATE economy_private.think_lab_validator_sessions
      SET last_answer_at = clock_timestamp()-interval '1 second'
      WHERE session_id = daily_guest;
    result := public.velorn_submit_think_lab_validator_answer(
      NULL,repeat('a',64),daily_guest,'chain_reaction',0,
      jsonb_build_object('linkIndex',link_no,'selectedIndex',CASE link_no WHEN 1 THEN 1 ELSE 0 END)
    );
    IF (result->>'completed')::boolean IS DISTINCT FROM (link_no=2) THEN
      RAISE EXCEPTION 'Daily guest Chain Reaction completion failed at link %: %',link_no,result;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM economy_private.activity_events WHERE source_event_key=daily_guest)
  THEN RAISE EXCEPTION 'Guest Chain Reaction completion emitted an activity event'; END IF;

  BEGIN
    PERFORM public.velorn_submit_think_lab_validator_answer(
      u,NULL,full_session,'chain_reaction',23,jsonb_build_object('linkIndex',2,'selectedIndex',0)
    );
    RAISE EXCEPTION 'Completed Chain Reaction session accepted a replay';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'The economy must remain disabled'; END IF;
  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=u)
  THEN RAISE EXCEPTION 'Chain Reaction validation created economy records'; END IF;
END;
$test$;

ROLLBACK;
