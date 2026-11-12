-- Phase 5A: additive unified Think Lab validator session foundation.
-- Legacy per-game tables and RPCs remain active until parity and cutover tests pass.

CREATE TABLE economy_private.think_lab_validator_sessions (
  session_id uuid PRIMARY KEY,
  game_id text NOT NULL CHECK (game_id IN ('word_forge','odd_one_out')),
  user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  guest_token_hash text CHECK (guest_token_hash IS NULL OR guest_token_hash ~ '^[0-9a-f]{64}$'),
  client_ip_hash text CHECK (client_ip_hash IS NULL OR client_ip_hash ~ '^[0-9a-f]{64}$'),
  validator_version text NOT NULL CHECK (char_length(validator_version) BETWEEN 1 AND 80),
  cefr_level text CHECK (cefr_level IS NULL OR cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  training_mode text NOT NULL CHECK (training_mode IN ('guided','steady','challenge')),
  questions jsonb NOT NULL CHECK (
    CASE WHEN jsonb_typeof(questions) = 'array'
      THEN jsonb_array_length(questions) BETWEEN 1 AND 24
      ELSE false
    END
    AND octet_length(questions::text) <= 262144
  ),
  answers jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(answers) = 'array'),
  current_index integer NOT NULL DEFAULT 0 CHECK (current_index >= 0),
  correct_count integer NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  last_answer_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT think_lab_validator_owner CHECK (
    (user_id IS NOT NULL AND guest_token_hash IS NULL AND client_ip_hash IS NULL)
    OR
    (user_id IS NULL AND guest_token_hash IS NOT NULL AND client_ip_hash IS NOT NULL)
  ),
  CONSTRAINT think_lab_validator_game_contract CHECK (
    (game_id = 'word_forge'
      AND validator_version = 'word-forge-reviewed-72-20261111-v1'
      AND cefr_level IS NULL
      AND jsonb_array_length(questions) = 24)
    OR
    (game_id = 'odd_one_out'
      AND validator_version = 'odd-one-out-rotated-20261110-v2'
      AND cefr_level IS NOT NULL
      AND jsonb_array_length(questions) BETWEEN 1 AND 12)
  ),
  CONSTRAINT think_lab_validator_expiry CHECK (
    expires_at > created_at
    AND (
      (game_id = 'word_forge' AND expires_at <= created_at + interval '45 minutes')
      OR
      (game_id = 'odd_one_out' AND expires_at <= created_at + interval '30 minutes')
    )
  ),
  CONSTRAINT think_lab_validator_progress CHECK (
    current_index <= jsonb_array_length(questions)
    AND correct_count <= current_index
  )
);

CREATE INDEX think_lab_validator_user_created_idx
  ON economy_private.think_lab_validator_sessions(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX think_lab_validator_guest_ip_created_idx
  ON economy_private.think_lab_validator_sessions(client_ip_hash, created_at DESC)
  WHERE client_ip_hash IS NOT NULL;

ALTER TABLE economy_private.think_lab_validator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.think_lab_validator_sessions FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE economy_private.think_lab_validator_sessions FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE economy_private.think_lab_validator_sessions TO service_role;

CREATE OR REPLACE FUNCTION economy_private.start_think_lab_validator_session(
  p_session_id uuid,
  p_game_id text,
  p_user_id uuid,
  p_guest_token_hash text,
  p_client_ip_hash text,
  p_validator_version text,
  p_cefr_level text,
  p_training_mode text,
  p_questions jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_active integer;
  v_recent integer;
  q jsonb;
  v_letters text;
  v_answer text;
  v_now timestamptz := clock_timestamp();
BEGIN
  IF COALESCE(
       NULLIF(current_setting('request.jwt.claim.role', true), ''),
       NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
     ) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'trusted server role required' USING ERRCODE = '42501';
  END IF;

  IF p_session_id IS NULL
     OR p_game_id IS NULL OR p_game_id NOT IN ('word_forge','odd_one_out')
     OR p_validator_version IS NULL
     OR p_training_mode IS NULL OR p_training_mode NOT IN ('guided','steady','challenge')
     OR p_questions IS NULL OR jsonb_typeof(p_questions) IS DISTINCT FROM 'array'
     OR NOT (
       (p_user_id IS NOT NULL AND p_guest_token_hash IS NULL AND p_client_ip_hash IS NULL)
       OR
       (p_user_id IS NULL
         AND p_guest_token_hash IS NOT NULL AND p_guest_token_hash ~ '^[0-9a-f]{64}
     OR p_expires_at IS NULL OR p_expires_at <= v_now
     OR (p_game_id = 'word_forge' AND (
       p_validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
       OR p_cefr_level IS NOT NULL
       OR CASE WHEN jsonb_typeof(p_questions) = 'array' THEN jsonb_array_length(p_questions) <> 24 ELSE true END
       OR p_expires_at > v_now + interval '45 minutes'
     ))
     OR (p_game_id = 'odd_one_out' AND (
       p_validator_version IS DISTINCT FROM 'odd-one-out-rotated-20261110-v2'
       OR p_cefr_level IS NULL OR p_cefr_level NOT IN ('A1','A2','B1','B2','C1','C2')
       OR CASE WHEN jsonb_typeof(p_questions) = 'array' THEN jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12 ELSE true END
       OR p_expires_at > v_now + interval '30 minutes'
     ))
  THEN
    RAISE EXCEPTION 'invalid Think Lab session parameters' USING ERRCODE = '22023';
  END IF;

  IF p_game_id = 'word_forge' THEN
    IF octet_length(p_questions::text) > 262144
       OR (SELECT count(DISTINCT value ->> 'id') FROM jsonb_array_elements(p_questions)) <> 24
    THEN
      RAISE EXCEPTION 'invalid Word Forge question set' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF q - ARRAY['id','clue','letters','answerWord','explain','skill','prompt'] <> '{}'::jsonb
         OR COALESCE(q ->> 'id','') !~ '^WF-[GSC]-[0-9]{3}$'
         OR COALESCE(q ->> 'clue','') !~ '.{12,}'
         OR q ->> 'prompt' IS DISTINCT FROM 'Forge the word from the letter tiles.'
         OR COALESCE(q ->> 'letters','') !~ '^[A-Z]{3,14}$'
         OR COALESCE(q ->> 'answerWord','') !~ '^[a-z]{3,14}$'
         OR COALESCE(q ->> 'explain','') !~ '.{20,}'
         OR COALESCE(q ->> 'skill','') !~ '.{2,}'
      THEN
        RAISE EXCEPTION 'invalid Word Forge canonical question' USING ERRCODE = '22023';
      END IF;
      SELECT string_agg(ch, '' ORDER BY ch)
        INTO v_letters
        FROM regexp_split_to_table(lower(q ->> 'letters'), '') AS parts(ch)
        WHERE ch <> '';
      SELECT string_agg(ch, '' ORDER BY ch)
        INTO v_answer
        FROM regexp_split_to_table(q ->> 'answerWord', '') AS parts(ch)
        WHERE ch <> '';
      IF v_letters IS DISTINCT FROM v_answer THEN
        RAISE EXCEPTION 'Word Forge letter multiset mismatch' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  ELSE
    IF octet_length(p_questions::text) > 24000 THEN
      RAISE EXCEPTION 'Odd One Out question set exceeds size limit' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF jsonb_typeof(q -> 'words') IS DISTINCT FROM 'array'
         OR CASE WHEN jsonb_typeof(q -> 'words') = 'array' THEN jsonb_array_length(q -> 'words') <> 4 ELSE true END
         OR COALESCE(q ->> 'answer','') !~ '^[0-3]$'
         OR COALESCE(q ->> 'id','') = ''
         OR COALESCE(q ->> 'prompt','') = ''
      THEN
        RAISE EXCEPTION 'invalid Odd One Out canonical question' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  END IF;

  IF p_user_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
    DELETE FROM economy_private.think_lab_validator_sessions
      WHERE created_at < v_now - interval '48 hours';
    SELECT count(*) INTO v_active
      FROM economy_private.think_lab_validator_sessions
      WHERE user_id = p_user_id AND status = 'active' AND expires_at > v_now;
    SELECT count(*) INTO v_recent
      FROM economy_private.think_lab_validator_sessions
      WHERE user_id = p_user_id AND created_at > v_now - interval '15 minutes';
  ELSE
    PERFORM pg_advisory_xact_lock(hashtextextended(p_client_ip_hash, 0));
    DELETE FROM economy_private.think_lab_validator_sessions
      WHERE created_at < v_now - interval '48 hours';
    SELECT count(*) INTO v_active
      FROM economy_private.think_lab_validator_sessions
      WHERE client_ip_hash = p_client_ip_hash AND status = 'active' AND expires_at > v_now;
    SELECT count(*) INTO v_recent
      FROM economy_private.think_lab_validator_sessions
      WHERE client_ip_hash = p_client_ip_hash AND created_at > v_now - interval '15 minutes';
  END IF;

  IF v_active >= 3 OR v_recent >= 10 THEN
    RAISE EXCEPTION 'Think Lab session rate limit exceeded' USING ERRCODE = '54000';
  END IF;

  INSERT INTO economy_private.think_lab_validator_sessions(
    session_id, game_id, user_id, guest_token_hash, client_ip_hash,
    validator_version, cefr_level, training_mode, questions, expires_at
  )
  VALUES (
    p_session_id, p_game_id, p_user_id, p_guest_token_hash, p_client_ip_hash,
    p_validator_version, p_cefr_level, p_training_mode, p_questions, p_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.velorn_start_think_lab_validator_session(
  p_session_id uuid,
  p_game_id text,
  p_user_id uuid,
  p_guest_token_hash text,
  p_client_ip_hash text,
  p_validator_version text,
  p_cefr_level text,
  p_training_mode text,
  p_questions jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT economy_private.start_think_lab_validator_session(
    p_session_id, p_game_id, p_user_id, p_guest_token_hash, p_client_ip_hash,
    p_validator_version, p_cefr_level, p_training_mode, p_questions, p_expires_at
  );
$$;

REVOKE ALL ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  TO service_role;

COMMENT ON TABLE economy_private.think_lab_validator_sessions IS
  'Unified private Think Lab session storage; game adapters retain game-specific validation. Legacy tables remain until verified cutover.';
COMMENT ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz) IS
  'Service-role-only creation of allowlisted authenticated or guest Think Lab sessions.';

         AND p_client_ip_hash IS NOT NULL AND p_client_ip_hash ~ '^[0-9a-f]{64}
     OR p_expires_at IS NULL OR p_expires_at <= v_now
     OR (p_game_id = 'word_forge' AND (
       p_validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
       OR p_cefr_level IS NOT NULL
       OR jsonb_array_length(p_questions) <> 24
       OR p_expires_at > v_now + interval '45 minutes'
     ))
     OR (p_game_id = 'odd_one_out' AND (
       p_validator_version IS DISTINCT FROM 'odd-one-out-rotated-20261110-v2'
       OR p_cefr_level NOT IN ('A1','A2','B1','B2','C1','C2')
       OR jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12
       OR p_expires_at > v_now + interval '30 minutes'
     ))
  THEN
    RAISE EXCEPTION 'invalid Think Lab session parameters' USING ERRCODE = '22023';
  END IF;

  IF p_game_id = 'word_forge' THEN
    IF octet_length(p_questions::text) > 262144
       OR (SELECT count(DISTINCT value ->> 'id') FROM jsonb_array_elements(p_questions)) <> 24
    THEN
      RAISE EXCEPTION 'invalid Word Forge question set' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF q - ARRAY['id','clue','letters','answerWord','explain','skill','prompt'] <> '{}'::jsonb
         OR COALESCE(q ->> 'id','') !~ '^WF-[GSC]-[0-9]{3}$'
         OR COALESCE(q ->> 'clue','') !~ '.{12,}'
         OR q ->> 'prompt' IS DISTINCT FROM 'Forge the word from the letter tiles.'
         OR COALESCE(q ->> 'letters','') !~ '^[A-Z]{3,14}$'
         OR COALESCE(q ->> 'answerWord','') !~ '^[a-z]{3,14}$'
         OR COALESCE(q ->> 'explain','') !~ '.{20,}'
         OR COALESCE(q ->> 'skill','') !~ '.{2,}'
      THEN
        RAISE EXCEPTION 'invalid Word Forge canonical question' USING ERRCODE = '22023';
      END IF;
      SELECT string_agg(ch, '' ORDER BY ch)
        INTO v_letters
        FROM regexp_split_to_table(lower(q ->> 'letters'), '') AS parts(ch)
        WHERE ch <> '';
      SELECT string_agg(ch, '' ORDER BY ch)
        INTO v_answer
        FROM regexp_split_to_table(q ->> 'answerWord', '') AS parts(ch)
        WHERE ch <> '';
      IF v_letters IS DISTINCT FROM v_answer THEN
        RAISE EXCEPTION 'Word Forge letter multiset mismatch' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  ELSE
    IF octet_length(p_questions::text) > 24000 THEN
      RAISE EXCEPTION 'Odd One Out question set exceeds size limit' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF jsonb_typeof(q -> 'words') IS DISTINCT FROM 'array'
         OR jsonb_array_length(q -> 'words') <> 4
         OR COALESCE(q ->> 'answer','') !~ '^[0-3]$'
         OR COALESCE(q ->> 'id','') = ''
         OR COALESCE(q ->> 'prompt','') = ''
      THEN
        RAISE EXCEPTION 'invalid Odd One Out canonical question' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  END IF;

  IF p_user_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
    DELETE FROM economy_private.think_lab_validator_sessions
      WHERE created_at < v_now - interval '48 hours';
    SELECT count(*) INTO v_active
      FROM economy_private.think_lab_validator_sessions
      WHERE user_id = p_user_id AND status = 'active' AND expires_at > v_now;
    SELECT count(*) INTO v_recent
      FROM economy_private.think_lab_validator_sessions
      WHERE user_id = p_user_id AND created_at > v_now - interval '15 minutes';
  ELSE
    PERFORM pg_advisory_xact_lock(hashtextextended(p_client_ip_hash, 0));
    DELETE FROM economy_private.think_lab_validator_sessions
      WHERE created_at < v_now - interval '48 hours';
    SELECT count(*) INTO v_active
      FROM economy_private.think_lab_validator_sessions
      WHERE client_ip_hash = p_client_ip_hash AND status = 'active' AND expires_at > v_now;
    SELECT count(*) INTO v_recent
      FROM economy_private.think_lab_validator_sessions
      WHERE client_ip_hash = p_client_ip_hash AND created_at > v_now - interval '15 minutes';
  END IF;

  IF v_active >= 3 OR v_recent >= 10 THEN
    RAISE EXCEPTION 'Think Lab session rate limit exceeded' USING ERRCODE = '54000';
  END IF;

  INSERT INTO economy_private.think_lab_validator_sessions(
    session_id, game_id, user_id, guest_token_hash, client_ip_hash,
    validator_version, cefr_level, training_mode, questions, expires_at
  )
  VALUES (
    p_session_id, p_game_id, p_user_id, p_guest_token_hash, p_client_ip_hash,
    p_validator_version, p_cefr_level, p_training_mode, p_questions, p_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.velorn_start_think_lab_validator_session(
  p_session_id uuid,
  p_game_id text,
  p_user_id uuid,
  p_guest_token_hash text,
  p_client_ip_hash text,
  p_validator_version text,
  p_cefr_level text,
  p_training_mode text,
  p_questions jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT economy_private.start_think_lab_validator_session(
    p_session_id, p_game_id, p_user_id, p_guest_token_hash, p_client_ip_hash,
    p_validator_version, p_cefr_level, p_training_mode, p_questions, p_expires_at
  );
$$;

REVOKE ALL ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  TO service_role;

COMMENT ON TABLE economy_private.think_lab_validator_sessions IS
  'Unified private Think Lab session storage; game adapters retain game-specific validation. Legacy tables remain until verified cutover.';
COMMENT ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz) IS
  'Service-role-only creation of allowlisted authenticated or guest Think Lab sessions.';
)
     )
     OR p_expires_at IS NULL OR p_expires_at <= v_now
     OR (p_game_id = 'word_forge' AND (
       p_validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
       OR p_cefr_level IS NOT NULL
       OR jsonb_array_length(p_questions) <> 24
       OR p_expires_at > v_now + interval '45 minutes'
     ))
     OR (p_game_id = 'odd_one_out' AND (
       p_validator_version IS DISTINCT FROM 'odd-one-out-rotated-20261110-v2'
       OR p_cefr_level NOT IN ('A1','A2','B1','B2','C1','C2')
       OR jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12
       OR p_expires_at > v_now + interval '30 minutes'
     ))
  THEN
    RAISE EXCEPTION 'invalid Think Lab session parameters' USING ERRCODE = '22023';
  END IF;

  IF p_game_id = 'word_forge' THEN
    IF octet_length(p_questions::text) > 262144
       OR (SELECT count(DISTINCT value ->> 'id') FROM jsonb_array_elements(p_questions)) <> 24
    THEN
      RAISE EXCEPTION 'invalid Word Forge question set' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF q - ARRAY['id','clue','letters','answerWord','explain','skill','prompt'] <> '{}'::jsonb
         OR COALESCE(q ->> 'id','') !~ '^WF-[GSC]-[0-9]{3}$'
         OR COALESCE(q ->> 'clue','') !~ '.{12,}'
         OR q ->> 'prompt' IS DISTINCT FROM 'Forge the word from the letter tiles.'
         OR COALESCE(q ->> 'letters','') !~ '^[A-Z]{3,14}$'
         OR COALESCE(q ->> 'answerWord','') !~ '^[a-z]{3,14}$'
         OR COALESCE(q ->> 'explain','') !~ '.{20,}'
         OR COALESCE(q ->> 'skill','') !~ '.{2,}'
      THEN
        RAISE EXCEPTION 'invalid Word Forge canonical question' USING ERRCODE = '22023';
      END IF;
      SELECT string_agg(ch, '' ORDER BY ch)
        INTO v_letters
        FROM regexp_split_to_table(lower(q ->> 'letters'), '') AS parts(ch)
        WHERE ch <> '';
      SELECT string_agg(ch, '' ORDER BY ch)
        INTO v_answer
        FROM regexp_split_to_table(q ->> 'answerWord', '') AS parts(ch)
        WHERE ch <> '';
      IF v_letters IS DISTINCT FROM v_answer THEN
        RAISE EXCEPTION 'Word Forge letter multiset mismatch' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  ELSE
    IF octet_length(p_questions::text) > 24000 THEN
      RAISE EXCEPTION 'Odd One Out question set exceeds size limit' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF jsonb_typeof(q -> 'words') IS DISTINCT FROM 'array'
         OR jsonb_array_length(q -> 'words') <> 4
         OR COALESCE(q ->> 'answer','') !~ '^[0-3]$'
         OR COALESCE(q ->> 'id','') = ''
         OR COALESCE(q ->> 'prompt','') = ''
      THEN
        RAISE EXCEPTION 'invalid Odd One Out canonical question' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  END IF;

  IF p_user_id IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
    DELETE FROM economy_private.think_lab_validator_sessions
      WHERE created_at < v_now - interval '48 hours';
    SELECT count(*) INTO v_active
      FROM economy_private.think_lab_validator_sessions
      WHERE user_id = p_user_id AND status = 'active' AND expires_at > v_now;
    SELECT count(*) INTO v_recent
      FROM economy_private.think_lab_validator_sessions
      WHERE user_id = p_user_id AND created_at > v_now - interval '15 minutes';
  ELSE
    PERFORM pg_advisory_xact_lock(hashtextextended(p_client_ip_hash, 0));
    DELETE FROM economy_private.think_lab_validator_sessions
      WHERE created_at < v_now - interval '48 hours';
    SELECT count(*) INTO v_active
      FROM economy_private.think_lab_validator_sessions
      WHERE client_ip_hash = p_client_ip_hash AND status = 'active' AND expires_at > v_now;
    SELECT count(*) INTO v_recent
      FROM economy_private.think_lab_validator_sessions
      WHERE client_ip_hash = p_client_ip_hash AND created_at > v_now - interval '15 minutes';
  END IF;

  IF v_active >= 3 OR v_recent >= 10 THEN
    RAISE EXCEPTION 'Think Lab session rate limit exceeded' USING ERRCODE = '54000';
  END IF;

  INSERT INTO economy_private.think_lab_validator_sessions(
    session_id, game_id, user_id, guest_token_hash, client_ip_hash,
    validator_version, cefr_level, training_mode, questions, expires_at
  )
  VALUES (
    p_session_id, p_game_id, p_user_id, p_guest_token_hash, p_client_ip_hash,
    p_validator_version, p_cefr_level, p_training_mode, p_questions, p_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.velorn_start_think_lab_validator_session(
  p_session_id uuid,
  p_game_id text,
  p_user_id uuid,
  p_guest_token_hash text,
  p_client_ip_hash text,
  p_validator_version text,
  p_cefr_level text,
  p_training_mode text,
  p_questions jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT economy_private.start_think_lab_validator_session(
    p_session_id, p_game_id, p_user_id, p_guest_token_hash, p_client_ip_hash,
    p_validator_version, p_cefr_level, p_training_mode, p_questions, p_expires_at
  );
$$;

REVOKE ALL ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  TO service_role;

COMMENT ON TABLE economy_private.think_lab_validator_sessions IS
  'Unified private Think Lab session storage; game adapters retain game-specific validation. Legacy tables remain until verified cutover.';
COMMENT ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz) IS
  'Service-role-only creation of allowlisted authenticated or guest Think Lab sessions.';
