-- Mirrors the already deployed guest validator foundation migration.
CREATE TABLE economy_private.guest_game_validator_sessions (
 session_id uuid PRIMARY KEY,
 token_hash text NOT NULL CHECK(token_hash ~ '^[0-9a-f]{64}$'),
 client_ip_hash text NOT NULL CHECK(client_ip_hash ~ '^[0-9a-f]{64}$'),
 validator_id text NOT NULL DEFAULT 'odd_one_out' CHECK(validator_id='odd_one_out'),
 validator_version text NOT NULL CHECK(char_length(validator_version) BETWEEN 1 AND 80),
 challenge_level text NOT NULL CHECK(challenge_level IN ('A1','A2','B1','B2','C1','C2')),
 training_mode text NOT NULL CHECK(training_mode IN ('guided','steady','challenge')),
 questions jsonb NOT NULL CHECK(jsonb_typeof(questions)='array' AND jsonb_array_length(questions) BETWEEN 1 AND 12),
 current_index integer NOT NULL DEFAULT 0 CHECK(current_index>=0),
 correct_count integer NOT NULL DEFAULT 0 CHECK(correct_count>=0),
 answers jsonb NOT NULL DEFAULT '[]'::jsonb CHECK(jsonb_typeof(answers)='array'),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','expired')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),expires_at timestamptz NOT NULL,
 last_answer_at timestamptz,completed_at timestamptz,
 CONSTRAINT guest_validator_expiry CHECK(expires_at>created_at AND expires_at<=created_at+interval '30 minutes'),
 CONSTRAINT guest_validator_progress CHECK(current_index<=jsonb_array_length(questions))
);
ALTER TABLE economy_private.guest_game_validator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.guest_game_validator_sessions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE economy_private.guest_game_validator_sessions FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE economy_private.guest_game_validator_sessions TO service_role;
GRANT USAGE ON SCHEMA economy_private TO service_role;
CREATE INDEX guest_validator_ip_created_idx ON economy_private.guest_game_validator_sessions(client_ip_hash,created_at DESC);
CREATE OR REPLACE FUNCTION economy_private.start_odd_one_out_guest_session(p_session_id uuid,p_token_hash text,p_client_ip_hash text,p_validator_version text,p_challenge_level text,p_training_mode text,p_questions jsonb,p_expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path TO ''
AS $function$
DECLARE v_active integer;v_recent integer;q jsonb;
BEGIN
 IF p_session_id IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$' OR p_client_ip_hash !~ '^[0-9a-f]{64}$'
 OR p_validator_version IS NULL OR p_challenge_level NOT IN ('A1','A2','B1','B2','C1','C2')
 OR p_training_mode NOT IN ('guided','steady','challenge') OR jsonb_typeof(p_questions) IS DISTINCT FROM 'array'
 OR jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12 OR p_expires_at<=clock_timestamp()
 OR p_expires_at>clock_timestamp()+interval '30 minutes'
 THEN RAISE EXCEPTION 'invalid guest validator session parameters' USING ERRCODE='22023';END IF;
 FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
  IF jsonb_typeof(q->'words') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'words')<>4 OR COALESCE(q->>'answer','') !~ '^[0-3]$'
  THEN RAISE EXCEPTION 'invalid guest challenge question' USING ERRCODE='22023';END IF;
 END LOOP;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_client_ip_hash,0));
 DELETE FROM economy_private.guest_game_validator_sessions WHERE created_at<clock_timestamp()-interval '24 hours';
 SELECT count(*) INTO v_active FROM economy_private.guest_game_validator_sessions WHERE client_ip_hash=p_client_ip_hash AND status='active' AND expires_at>clock_timestamp();
 SELECT count(*) INTO v_recent FROM economy_private.guest_game_validator_sessions WHERE client_ip_hash=p_client_ip_hash AND created_at>clock_timestamp()-interval '15 minutes';
 IF v_active>=3 OR v_recent>=10 THEN RAISE EXCEPTION 'guest validator session rate limit exceeded' USING ERRCODE='54000';END IF;
 INSERT INTO economy_private.guest_game_validator_sessions(session_id,token_hash,client_ip_hash,validator_id,validator_version,challenge_level,training_mode,questions,expires_at)
 VALUES(p_session_id,p_token_hash,p_client_ip_hash,'odd_one_out',p_validator_version,p_challenge_level,p_training_mode,p_questions,p_expires_at);
END $function$;
CREATE OR REPLACE FUNCTION economy_private.submit_odd_one_out_guest_answer(p_session_id uuid,p_token_hash text,p_question_index integer,p_selected_index integer)
RETURNS jsonb LANGUAGE plpgsql SET search_path TO ''
AS $function$
DECLARE s economy_private.guest_game_validator_sessions%ROWTYPE;q jsonb;w jsonb;c integer;ok boolean;nxt integer;done boolean;
BEGIN
 SELECT * INTO s FROM economy_private.guest_game_validator_sessions WHERE session_id=p_session_id AND token_hash=p_token_hash FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'guest validator session not found' USING ERRCODE='P0002';END IF;
 IF s.status<>'active' THEN RAISE EXCEPTION 'guest validator session is not active' USING ERRCODE='55000';END IF;
 IF s.expires_at<=clock_timestamp() THEN UPDATE economy_private.guest_game_validator_sessions SET status='expired' WHERE session_id=p_session_id;RAISE EXCEPTION 'guest validator session expired' USING ERRCODE='57014';END IF;
 IF clock_timestamp()-COALESCE(s.last_answer_at,s.created_at)<interval '700 milliseconds' THEN RAISE EXCEPTION 'guest answer submitted too quickly' USING ERRCODE='22023';END IF;
 IF p_question_index IS NULL OR p_selected_index IS NULL OR p_question_index<>s.current_index OR p_question_index<0 OR p_question_index>=jsonb_array_length(s.questions) OR p_selected_index<0 OR p_selected_index>3
 THEN RAISE EXCEPTION 'unexpected guest question or answer index' USING ERRCODE='22023';END IF;
 q:=s.questions->p_question_index;w:=q->'words';c:=(q->>'answer')::integer;ok:=p_selected_index=c;nxt:=s.current_index+1;done:=nxt>=jsonb_array_length(s.questions);
 UPDATE economy_private.guest_game_validator_sessions SET answers=answers||jsonb_build_array(jsonb_build_object('question_index',p_question_index,'selected_index',p_selected_index,'is_correct',ok,'answered_at',clock_timestamp())),
 current_index=nxt,correct_count=correct_count+CASE WHEN ok THEN 1 ELSE 0 END,last_answer_at=clock_timestamp(),status=CASE WHEN done THEN 'completed' ELSE 'active' END,completed_at=CASE WHEN done THEN clock_timestamp() ELSE NULL END WHERE session_id=p_session_id;
 RETURN jsonb_build_object('correct',ok,'correct_index',c,'correct_answer',w->>c,'explanation',q->>'explain','relationship',q->>'relationship','hint',q->>'hint','question_index',p_question_index,'completed',done,'next_index',nxt);
END $function$;
CREATE OR REPLACE FUNCTION public.velorn_start_odd_one_out_guest_session(p_session_id uuid,p_token_hash text,p_client_ip_hash text,p_validator_version text,p_challenge_level text,p_training_mode text,p_questions jsonb,p_expires_at timestamptz)
RETURNS void LANGUAGE sql SET search_path TO ''
AS $function$ SELECT economy_private.start_odd_one_out_guest_session(p_session_id,p_token_hash,p_client_ip_hash,p_validator_version,p_challenge_level,p_training_mode,p_questions,p_expires_at); $function$;
CREATE OR REPLACE FUNCTION public.velorn_submit_odd_one_out_guest_answer(p_session_id uuid,p_token_hash text,p_question_index integer,p_selected_index integer)
RETURNS jsonb LANGUAGE sql SET search_path TO ''
AS $function$ SELECT economy_private.submit_odd_one_out_guest_answer(p_session_id,p_token_hash,p_question_index,p_selected_index); $function$;
REVOKE ALL ON FUNCTION economy_private.start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION economy_private.submit_odd_one_out_guest_answer(uuid,text,integer,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.velorn_start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.velorn_submit_odd_one_out_guest_answer(uuid,text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION economy_private.start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION economy_private.submit_odd_one_out_guest_answer(uuid,text,integer,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_start_odd_one_out_guest_session(uuid,text,text,text,text,text,jsonb,timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_submit_odd_one_out_guest_answer(uuid,text,integer,integer) TO service_role;
