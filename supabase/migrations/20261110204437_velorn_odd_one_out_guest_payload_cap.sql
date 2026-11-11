ALTER TABLE economy_private.guest_game_validator_sessions ADD CONSTRAINT guest_validator_questions_payload_size CHECK(octet_length(questions::text)<=24000);
CREATE OR REPLACE FUNCTION economy_private.start_odd_one_out_guest_session(p_session_id uuid,p_token_hash text,p_client_ip_hash text,p_validator_version text,p_challenge_level text,p_training_mode text,p_questions jsonb,p_expires_at timestamptz)
RETURNS void LANGUAGE plpgsql SET search_path TO ''
AS $function$
DECLARE v_active integer;v_recent integer;q jsonb;
BEGIN
 IF p_session_id IS NULL OR p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-f]{64}$'
 OR p_client_ip_hash IS NULL OR p_client_ip_hash !~ '^[0-9a-f]{64}$'
 OR p_validator_version IS NULL OR char_length(p_validator_version) NOT BETWEEN 1 AND 80
 OR p_challenge_level IS NULL OR p_challenge_level NOT IN ('A1','A2','B1','B2','C1','C2')
 OR p_training_mode IS NULL OR p_training_mode NOT IN ('guided','steady','challenge')
 OR p_questions IS NULL OR jsonb_typeof(p_questions) IS DISTINCT FROM 'array'
 OR p_expires_at IS NULL OR p_expires_at<=clock_timestamp() OR p_expires_at>clock_timestamp()+interval '30 minutes'
 THEN RAISE EXCEPTION 'invalid guest validator session parameters' USING ERRCODE='22023';END IF;
 IF jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12 OR octet_length(p_questions::text)>24000
 THEN RAISE EXCEPTION 'invalid guest validator question payload size' USING ERRCODE='22023';END IF;
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
