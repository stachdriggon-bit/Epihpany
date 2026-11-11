-- Phase 4H follow-up: the public RPC grants are the authorization boundary.
-- Avoid depending on the legacy singular JWT claim setting, which is not populated
-- consistently by newer Supabase local/API gateway versions.
CREATE OR REPLACE FUNCTION economy_private.start_word_forge_session(p_session_id uuid,p_user_id uuid,p_guest_token_hash text,p_client_ip_hash text,p_validator_version text,p_training_mode text,p_questions jsonb,p_expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_active integer;v_recent integer;q jsonb;v_letters text;v_answer text;
BEGIN
 IF p_session_id IS NULL OR p_validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
 OR p_training_mode IS NULL OR p_training_mode NOT IN('guided','steady','challenge') OR jsonb_typeof(p_questions) IS DISTINCT FROM 'array'
 OR jsonb_array_length(p_questions)<>24 OR p_expires_at<=clock_timestamp() OR p_expires_at>clock_timestamp()+interval '45 minutes'
 OR NOT((p_user_id IS NOT NULL AND p_guest_token_hash IS NULL AND p_client_ip_hash IS NULL)
 OR(p_user_id IS NULL AND p_guest_token_hash IS NOT NULL AND p_guest_token_hash~'^[0-9a-f]{64}$' AND p_client_ip_hash IS NOT NULL AND p_client_ip_hash~'^[0-9a-f]{64}$'))
 THEN RAISE EXCEPTION 'invalid Word Forge session parameters' USING ERRCODE='22023';END IF;
 IF (SELECT count(DISTINCT value->>'id') FROM jsonb_array_elements(p_questions))<>24 THEN RAISE EXCEPTION 'question IDs must be unique' USING ERRCODE='22023';END IF;
 FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
  IF q-ARRAY['id','clue','letters','answerWord','explain','skill','prompt']<>'{}'::jsonb
   OR COALESCE(q->>'id','') !~ '^WF-[GSC]-[0-9]{3}$'
   OR COALESCE(q->>'clue','') !~ '.{12,}'
   OR q->>'prompt' IS DISTINCT FROM 'Forge the word from the letter tiles.'
   OR COALESCE(q->>'letters','') !~ '^[A-Z]{3,14}$'
   OR COALESCE(q->>'answerWord','') !~ '^[a-z]{3,14}$'
   OR COALESCE(q->>'explain','') !~ '.{20,}' OR COALESCE(q->>'skill','') !~ '.{2,}'
  THEN RAISE EXCEPTION 'invalid Word Forge canonical question' USING ERRCODE='22023';END IF;
  SELECT string_agg(ch,'' ORDER BY ch) INTO v_letters FROM regexp_split_to_table(lower(q->>'letters'),'') AS parts(ch) WHERE ch<>'';
  SELECT string_agg(ch,'' ORDER BY ch) INTO v_answer FROM regexp_split_to_table(q->>'answerWord','') AS parts(ch) WHERE ch<>'';
  IF v_letters IS DISTINCT FROM v_answer THEN RAISE EXCEPTION 'letter multiset mismatch' USING ERRCODE='22023';END IF;
 END LOOP;
 IF p_user_id IS NOT NULL THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  DELETE FROM economy_private.word_forge_validator_sessions WHERE created_at<clock_timestamp()-interval '48 hours';
  SELECT count(*) INTO v_active FROM economy_private.word_forge_validator_sessions WHERE user_id=p_user_id AND status='active' AND expires_at>clock_timestamp();
  SELECT count(*) INTO v_recent FROM economy_private.word_forge_validator_sessions WHERE user_id=p_user_id AND created_at>clock_timestamp()-interval '15 minutes';
 ELSE
  PERFORM pg_advisory_xact_lock(hashtextextended(p_client_ip_hash,0));
  DELETE FROM economy_private.word_forge_validator_sessions WHERE created_at<clock_timestamp()-interval '48 hours';
  SELECT count(*) INTO v_active FROM economy_private.word_forge_validator_sessions WHERE client_ip_hash=p_client_ip_hash AND status='active' AND expires_at>clock_timestamp();
  SELECT count(*) INTO v_recent FROM economy_private.word_forge_validator_sessions WHERE client_ip_hash=p_client_ip_hash AND created_at>clock_timestamp()-interval '15 minutes';
 END IF;
 IF v_active>=3 OR v_recent>=10 THEN RAISE EXCEPTION 'Word Forge session rate limit exceeded' USING ERRCODE='54000';END IF;
 INSERT INTO economy_private.word_forge_validator_sessions(session_id,user_id,guest_token_hash,client_ip_hash,validator_version,training_mode,questions,expires_at)
 VALUES(p_session_id,p_user_id,p_guest_token_hash,p_client_ip_hash,p_validator_version,p_training_mode,p_questions,p_expires_at);
END $$;

CREATE OR REPLACE FUNCTION economy_private.submit_word_forge_answer(p_user_id uuid,p_guest_token_hash text,p_session_id uuid,p_question_index integer,p_submitted_word text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s economy_private.word_forge_validator_sessions%ROWTYPE;q jsonb;v_attempts integer;v_correct boolean;v_advance boolean;v_next integer;v_correct_count integer;v_done boolean;v_answer text;
BEGIN
 IF p_session_id IS NULL OR p_question_index IS NULL OR p_question_index NOT BETWEEN 0 AND 23 OR COALESCE(p_submitted_word,'') !~ '^[A-Za-z]{3,14}$' OR NOT((p_user_id IS NOT NULL AND p_guest_token_hash IS NULL) OR(p_user_id IS NULL AND p_guest_token_hash IS NOT NULL AND p_guest_token_hash~'^[0-9a-f]{64}$')) THEN RAISE EXCEPTION 'invalid Word Forge answer' USING ERRCODE='22023';END IF;
 SELECT * INTO s FROM economy_private.word_forge_validator_sessions WHERE session_id=p_session_id
 AND ((p_user_id IS NOT NULL AND user_id=p_user_id AND guest_token_hash IS NULL) OR(p_user_id IS NULL AND user_id IS NULL AND guest_token_hash=p_guest_token_hash)) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Word Forge session not found' USING ERRCODE='P0002';END IF;
 IF s.status<>'active' THEN RAISE EXCEPTION 'Word Forge session is not active' USING ERRCODE='55000';END IF;
 IF s.expires_at<=clock_timestamp() THEN UPDATE economy_private.word_forge_validator_sessions SET status='expired' WHERE session_id=p_session_id;RAISE EXCEPTION 'Word Forge session expired' USING ERRCODE='57014';END IF;
 IF clock_timestamp()-COALESCE(s.last_answer_at,s.created_at)<interval '650 milliseconds' THEN RAISE EXCEPTION 'Word Forge answer submitted too quickly' USING ERRCODE='22023';END IF;
 IF p_question_index<>s.current_index THEN RAISE EXCEPTION 'unexpected Word Forge question index' USING ERRCODE='22023';END IF;
 q:=s.questions->s.current_index;v_answer:=q->>'answerWord';
 SELECT count(*) INTO v_attempts FROM jsonb_array_elements(s.answers) a WHERE (a->>'question_index')::integer=s.current_index;
 v_attempts:=v_attempts+1;v_correct:=lower(p_submitted_word)=v_answer;v_advance:=v_correct OR v_attempts>=3;
 v_next:=s.current_index+CASE WHEN v_advance THEN 1 ELSE 0 END;
 v_correct_count:=s.correct_count+CASE WHEN v_correct AND v_advance THEN 1 ELSE 0 END;
 v_done:=v_next=jsonb_array_length(s.questions);
 UPDATE economy_private.word_forge_validator_sessions SET
  answers=answers||jsonb_build_array(jsonb_build_object('question_index',s.current_index,'submitted_word',lower(p_submitted_word),'is_correct',v_correct,'attempt_number',v_attempts,'answered_at',clock_timestamp())),
  current_index=v_next,correct_count=v_correct_count,last_answer_at=clock_timestamp(),
  status=CASE WHEN v_done THEN 'completed' ELSE 'active' END,completed_at=CASE WHEN v_done THEN clock_timestamp() ELSE NULL END
 WHERE session_id=p_session_id;
 IF v_done AND s.user_id IS NOT NULL THEN
  PERFORM public.economy_record_validated_activity_event(s.user_id,p_session_id,'think_lab','think_lab','word_forge','game_session_completed',
   clock_timestamp(),s.validator_version,jsonb_build_object('training_mode',s.training_mode,'question_count',24,'correct_count',v_correct_count,'incorrect_count',24-v_correct_count));
 END IF;
 RETURN jsonb_build_object('correct',v_correct,'correct_answer',CASE WHEN v_correct OR v_advance THEN v_answer ELSE NULL END,
  'explanation',CASE WHEN v_correct OR v_advance THEN q->>'explain' ELSE NULL END,
  'skill',CASE WHEN v_correct OR v_advance THEN q->>'skill' ELSE NULL END,
  'question_index',p_question_index,'attempts_remaining',GREATEST(0,3-v_attempts),'advance',v_advance,
  'completed',v_done,'next_index',v_next,'correct_count',v_correct_count);
END $$;

NOTIFY pgrst, 'reload schema';
COMMENT ON FUNCTION economy_private.start_word_forge_session(uuid,uuid,text,text,text,text,jsonb,timestamptz)
 IS 'Service-role-only Word Forge session creation; EXECUTE is revoked from browser roles.';
COMMENT ON FUNCTION economy_private.submit_word_forge_answer(uuid,text,uuid,integer,text)
 IS 'Service-role-only Word Forge answer validation; EXECUTE is revoked from browser roles.';
