BEGIN;

INSERT INTO auth.users(id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
VALUES ('f5a10000-0000-4000-8000-000000000051','authenticated','authenticated','think-lab-unified@example.invalid','',now(),'{}'::jsonb,'{}'::jsonb,now(),now());

SELECT set_config('request.jwt.claim.role','service_role',true);

DO $test$
DECLARE
  u uuid := 'f5a10000-0000-4000-8000-000000000051';
  wf_user uuid := 'f5a10000-0000-4000-8000-000000000061';
  wf_guest uuid := 'f5a10000-0000-4000-8000-000000000062';
  ooo_user uuid := 'f5a10000-0000-4000-8000-000000000063';
  ooo_guest uuid := 'f5a10000-0000-4000-8000-000000000064';
  wf_questions jsonb;
  ooo_questions jsonb;
BEGIN
  IF has_function_privilege('anon','public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)','EXECUTE')
     OR has_function_privilege('authenticated','public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)','EXECUTE')
     OR NOT has_function_privilege('service_role','public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)','EXECUTE')
  THEN
    RAISE EXCEPTION 'Unified session creation RPC is not service-role-only';
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

  ooo_questions := jsonb_build_array(jsonb_build_object(
    'id','OOO-TEST-001',
    'prompt','Choose the word that does not belong.',
    'why','One item belongs to a different category.',
    'words',jsonb_build_array('apple','pear','carrot','plum'),
    'answer',2,
    'explain','A carrot is a vegetable.',
    'relationship','food category',
    'hint','Think about plant parts.',
    'context','A simple food vocabulary question.'
  ));

  PERFORM public.velorn_start_think_lab_validator_session(
    wf_user,'word_forge',u,NULL,NULL,'word-forge-reviewed-72-20261111-v1',NULL,'guided',
    wf_questions,clock_timestamp()+interval '30 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    wf_guest,'word_forge',NULL,repeat('a',64),repeat('b',64),'word-forge-reviewed-72-20261111-v1',NULL,'challenge',
    wf_questions,clock_timestamp()+interval '30 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    ooo_user,'odd_one_out',u,NULL,NULL,'odd-one-out-rotated-20261110-v2','B2','steady',
    ooo_questions,clock_timestamp()+interval '20 minutes'
  );
  PERFORM public.velorn_start_think_lab_validator_session(
    ooo_guest,'odd_one_out',NULL,repeat('c',64),repeat('d',64),'odd-one-out-rotated-20261110-v2','A1','guided',
    ooo_questions,clock_timestamp()+interval '20 minutes'
  );

  IF (SELECT count(*) FROM economy_private.think_lab_validator_sessions
      WHERE session_id IN (wf_user,wf_guest,ooo_user,ooo_guest)) <> 4
  THEN RAISE EXCEPTION 'Authenticated and guest sessions were not stored in the unified table'; END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.think_lab_validator_sessions
    WHERE (user_id IS NOT NULL AND (guest_token_hash IS NOT NULL OR client_ip_hash IS NOT NULL))
       OR (user_id IS NULL AND (guest_token_hash IS NULL OR client_ip_hash IS NULL))
  ) THEN RAISE EXCEPTION 'Unified session owner exclusivity was violated'; END IF;

  BEGIN
    PERFORM public.velorn_start_think_lab_validator_session(
      'f5a10000-0000-4000-8000-000000000065','word_forge',u,NULL,NULL,
      'untrusted-validator-version',NULL,'guided',wf_questions,clock_timestamp()+interval '20 minutes'
    );
    RAISE EXCEPTION 'Unknown validator version was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  BEGIN
    PERFORM public.velorn_start_think_lab_validator_session(
      'f5a10000-0000-4000-8000-000000000066','odd_one_out',u,NULL,NULL,
      'odd-one-out-rotated-20261110-v2',NULL,'guided',ooo_questions,clock_timestamp()+interval '20 minutes'
    );
    RAISE EXCEPTION 'Odd One Out session without a CEFR level was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  BEGIN
    PERFORM public.velorn_start_think_lab_validator_session(
      'f5a10000-0000-4000-8000-000000000067','word_forge',NULL,repeat('e',64),NULL,
      'word-forge-reviewed-72-20261111-v1',NULL,'guided',wf_questions,clock_timestamp()+interval '20 minutes'
    );
    RAISE EXCEPTION 'Guest session without IP HMAC was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  BEGIN
    PERFORM public.velorn_start_think_lab_validator_session(
      'f5a10000-0000-4000-8000-000000000068','word_forge',u,NULL,NULL,
      'word-forge-reviewed-72-20261111-v1',NULL,'guided',
      jsonb_set(wf_questions,'{0,letters}','"AAAAA"'::jsonb),clock_timestamp()+interval '20 minutes'
    );
    RAISE EXCEPTION 'Word Forge letter multiset mismatch was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false
  THEN RAISE EXCEPTION 'Economy must remain disabled'; END IF;
  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id=u)
     OR EXISTS (SELECT 1 FROM economy_private.activity_events WHERE user_id=u)
  THEN RAISE EXCEPTION 'Unified session creation created economy or activity records'; END IF;
END;
$test$;

ROLLBACK;
