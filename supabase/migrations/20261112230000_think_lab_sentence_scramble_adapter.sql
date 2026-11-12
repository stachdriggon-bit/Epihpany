-- Phase 5F: add Sentence Scramble as a private adapter on the shared validator.
-- Canonical sentences, accepted alternatives and explanations remain server-only.

ALTER TABLE economy_private.think_lab_validator_sessions
  DROP CONSTRAINT IF EXISTS think_lab_validator_sessions_game_id_check,
  DROP CONSTRAINT IF EXISTS think_lab_validator_game_contract,
  DROP CONSTRAINT IF EXISTS think_lab_validator_expiry;

ALTER TABLE economy_private.think_lab_validator_sessions
  ADD CONSTRAINT think_lab_validator_sessions_game_id_check
    CHECK (game_id IN ('word_forge','odd_one_out','chain_reaction','sentence_scramble')),
  ADD CONSTRAINT think_lab_validator_game_contract CHECK (
    (game_id = 'word_forge'
      AND validator_version = 'word-forge-reviewed-72-20261111-v1'
      AND cefr_level IS NULL
      AND jsonb_array_length(questions) = 24)
    OR
    (game_id = 'odd_one_out'
      AND validator_version = 'odd-one-out-rotated-20261110-v2'
      AND cefr_level IS NOT NULL
      AND jsonb_array_length(questions) BETWEEN 1 AND 12)
    OR
    (game_id = 'chain_reaction'
      AND validator_version = 'chain-reaction-72-20261112-v1'
      AND cefr_level IS NULL
      AND jsonb_array_length(questions) IN (1,24))
    OR
    (game_id = 'sentence_scramble'
      AND validator_version = 'sentence-scramble-72-20261112-v1'
      AND cefr_level IS NULL
      AND jsonb_array_length(questions) IN (1,24))
  ),
  ADD CONSTRAINT think_lab_validator_expiry CHECK (
    expires_at > created_at
    AND (
      (game_id = 'word_forge' AND expires_at <= created_at + interval '45 minutes')
      OR
      (game_id = 'odd_one_out' AND expires_at <= created_at + interval '30 minutes')
      OR
      (game_id IN ('chain_reaction','sentence_scramble') AND expires_at <= created_at + interval '45 minutes')
    )
  );

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
  v_link jsonb;
  v_previous text;
  v_mode_code text;
  v_distinct_options integer;
  v_link_index integer;
  v_answer_index integer;
  v_sentence_words text[];
  v_tile_words text[];
  v_now timestamptz := clock_timestamp();
BEGIN
  IF COALESCE(
       NULLIF(current_setting('request.jwt.claim.role', true), ''),
       NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
     ) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'trusted server role required' USING ERRCODE = '42501';
  END IF;

  IF p_session_id IS NULL
     OR p_game_id IS NULL OR p_game_id NOT IN ('word_forge','odd_one_out','chain_reaction','sentence_scramble')
     OR p_validator_version IS NULL
     OR p_training_mode IS NULL OR p_training_mode NOT IN ('guided','steady','challenge')
     OR p_questions IS NULL OR jsonb_typeof(p_questions) IS DISTINCT FROM 'array'
     OR NOT (
       (p_user_id IS NOT NULL AND p_guest_token_hash IS NULL AND p_client_ip_hash IS NULL)
       OR
       (p_user_id IS NULL
         AND p_guest_token_hash IS NOT NULL
         AND p_guest_token_hash ~ '^[0-9a-f]{64}$'
         AND p_client_ip_hash IS NOT NULL
         AND p_client_ip_hash ~ '^[0-9a-f]{64}$')
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
       OR p_cefr_level IS NULL OR p_cefr_level NOT IN ('A1','A2','B1','B2','C1','C2')
       OR jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12
       OR p_expires_at > v_now + interval '30 minutes'
     ))
     OR (p_game_id = 'chain_reaction' AND (
       p_validator_version IS DISTINCT FROM 'chain-reaction-72-20261112-v1'
       OR p_cefr_level IS NOT NULL
       OR jsonb_array_length(p_questions) NOT IN (1,24)
       OR p_expires_at > v_now + interval '45 minutes'
     ))
     OR (p_game_id = 'sentence_scramble' AND (
       p_validator_version IS DISTINCT FROM 'sentence-scramble-72-20261112-v1'
       OR p_cefr_level IS NOT NULL
       OR jsonb_array_length(p_questions) NOT IN (1,24)
       OR p_expires_at > v_now + interval '45 minutes'
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
      IF jsonb_typeof(q) IS DISTINCT FROM 'object'
         OR q - ARRAY['id','clue','letters','answerWord','explain','skill','prompt'] <> '{}'::jsonb
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
  ELSIF p_game_id = 'odd_one_out' THEN
    IF octet_length(p_questions::text) > 24000 THEN
      RAISE EXCEPTION 'Odd One Out question set exceeds size limit' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF jsonb_typeof(q) IS DISTINCT FROM 'object'
         OR jsonb_typeof(q -> 'words') IS DISTINCT FROM 'array'
         OR jsonb_array_length(q -> 'words') <> 4
         OR COALESCE(q ->> 'answer','') !~ '^[0-3]$'
         OR COALESCE(q ->> 'id','') = ''
      THEN
        RAISE EXCEPTION 'invalid Odd One Out canonical question' USING ERRCODE = '22023';
      END IF;
    END LOOP;
  ELSIF p_game_id = 'chain_reaction' THEN
    v_mode_code := CASE p_training_mode
      WHEN 'guided' THEN 'G'
      WHEN 'steady' THEN 'S'
      ELSE 'C'
    END;
    IF octet_length(p_questions::text) > 262144
       OR (SELECT count(DISTINCT value ->> 'id') FROM jsonb_array_elements(p_questions)) <> jsonb_array_length(p_questions)
    THEN
      RAISE EXCEPTION 'invalid Chain Reaction challenge set' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF jsonb_typeof(q) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'Chain Reaction challenge must be an object' USING ERRCODE = '22023';
      ELSIF q - ARRAY['id','title','start','links'] <> '{}'::jsonb THEN
        RAISE EXCEPTION 'Chain Reaction challenge has unexpected keys' USING ERRCODE = '22023';
      ELSIF length(COALESCE(q ->> 'id','')) <> 8
         OR left(COALESCE(q ->> 'id',''),5) <> ('CR-' || v_mode_code || '-')
         OR substring(COALESCE(q ->> 'id','') from 6) !~ '^[0-9]{3}' THEN
        RAISE EXCEPTION 'Chain Reaction challenge ID does not match training mode: %, expected mode %',q ->> 'id',v_mode_code USING ERRCODE = '22023';
      ELSIF length(COALESCE(q ->> 'title','')) < 3 THEN
        RAISE EXCEPTION 'Chain Reaction challenge title is invalid' USING ERRCODE = '22023';
      ELSIF length(COALESCE(q ->> 'start','')) NOT BETWEEN 2 AND 40
         OR (q ->> 'start') ~ '[^A-Z -]' THEN
        RAISE EXCEPTION 'Chain Reaction start word is invalid: %',q ->> 'start' USING ERRCODE = '22023';
      ELSIF jsonb_typeof(q -> 'links') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Chain Reaction links must be an array' USING ERRCODE = '22023';
      ELSIF jsonb_array_length(q -> 'links') <> 3 THEN
        RAISE EXCEPTION 'Chain Reaction challenge must contain exactly three links' USING ERRCODE = '22023';
      END IF;
      v_previous := q ->> 'start';
      FOR v_link_index IN 0..2 LOOP
        v_link := q -> 'links' -> v_link_index;
        IF jsonb_typeof(v_link) IS DISTINCT FROM 'object'
           OR v_link - ARRAY['from','to','options','answer','explanation'] <> '{}'::jsonb
           OR v_link ->> 'from' IS DISTINCT FROM v_previous
           OR length(COALESCE(v_link ->> 'to','')) NOT BETWEEN 2 AND 40
           OR (v_link ->> 'to') ~ '[^A-Z -]'
           OR jsonb_typeof(v_link -> 'options') IS DISTINCT FROM 'array'
           OR jsonb_array_length(v_link -> 'options') <> 3
           OR COALESCE(v_link ->> 'answer','') NOT IN ('0','1','2')
           OR length(COALESCE(v_link ->> 'explanation','')) < 8
        THEN
          RAISE EXCEPTION 'invalid Chain Reaction link contract' USING ERRCODE = '22023';
        END IF;
        IF EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(v_link -> 'options') AS option_row(option_value)
          WHERE length(option_value) NOT BETWEEN 2 AND 40 OR option_value ~ '[^A-Z -]'
        ) THEN
          RAISE EXCEPTION 'Chain Reaction option contains invalid text' USING ERRCODE = '22023';
        END IF;
        SELECT count(DISTINCT value) INTO v_distinct_options
          FROM jsonb_array_elements_text(v_link -> 'options');
        v_answer_index := (v_link ->> 'answer')::integer;
        IF v_distinct_options <> 3
           OR (v_link -> 'options' ->> v_answer_index) IS DISTINCT FROM (v_link ->> 'to')
        THEN
          RAISE EXCEPTION 'Chain Reaction link options do not match its canonical answer' USING ERRCODE = '22023';
        END IF;
        v_previous := v_link ->> 'to';
      END LOOP;
    END LOOP;

  ELSE
    v_mode_code := CASE p_training_mode
      WHEN 'guided' THEN 'G'
      WHEN 'steady' THEN 'S'
      ELSE 'C'
    END;
    IF octet_length(p_questions::text) > 262144
       OR (SELECT count(DISTINCT value ->> 'id') FROM jsonb_array_elements(p_questions)) <> jsonb_array_length(p_questions)
    THEN
      RAISE EXCEPTION 'invalid Sentence Scramble question set' USING ERRCODE = '22023';
    END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
      IF jsonb_typeof(q) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'Sentence Scramble question must be an object' USING ERRCODE = '22023';
      END IF;
      IF q - ARRAY['id','prompt','sentence','acceptedAnswers','skill','explanation','words'] <> '{}'::jsonb
         OR length(COALESCE(q ->> 'id','')) <> 8
         OR left(COALESCE(q ->> 'id',''),5) <> ('SS-' || v_mode_code || '-')
         OR substring(COALESCE(q ->> 'id','') from 6) !~ '^[0-9]{3}'
         OR q ->> 'prompt' IS DISTINCT FROM 'Build the sentence in the correct order.'
         OR length(COALESCE(q ->> 'sentence','')) NOT BETWEEN 10 AND 240
         OR btrim(COALESCE(q ->> 'sentence','')) IS DISTINCT FROM (q ->> 'sentence')
         OR position('  ' in COALESCE(q ->> 'sentence','')) > 0
         OR position(chr(10) in COALESCE(q ->> 'sentence','')) > 0
         OR position(chr(9) in COALESCE(q ->> 'sentence','')) > 0
         OR jsonb_typeof(q -> 'words') IS DISTINCT FROM 'array'
         OR jsonb_typeof(q -> 'acceptedAnswers') IS DISTINCT FROM 'array'
         OR length(COALESCE(q ->> 'skill','')) < 5
         OR length(COALESCE(q ->> 'explanation','')) < 20
      THEN
        RAISE EXCEPTION 'invalid Sentence Scramble canonical question' USING ERRCODE = '22023';
      END IF;
      IF jsonb_array_length(q -> 'words') NOT BETWEEN 3 AND 24
         OR jsonb_array_length(q -> 'acceptedAnswers') > 8
      THEN
        RAISE EXCEPTION 'Sentence Scramble question has an invalid tile or alternative count' USING ERRCODE = '22023';
      END IF;
      IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(q -> 'words') AS tile(value)
        WHERE jsonb_typeof(value) IS DISTINCT FROM 'string'
           OR length(value #>> '{}') NOT BETWEEN 1 AND 40
           OR btrim(value #>> '{}') IS DISTINCT FROM (value #>> '{}')
           OR position(' ' in (value #>> '{}')) > 0
           OR position(chr(9) in (value #>> '{}')) > 0
           OR position(chr(10) in (value #>> '{}')) > 0
      ) THEN
        RAISE EXCEPTION 'Sentence Scramble word tile is invalid' USING ERRCODE = '22023';
      END IF;
      IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(q -> 'acceptedAnswers') AS alternative(value)
        WHERE jsonb_typeof(value) IS DISTINCT FROM 'string'
           OR length(value #>> '{}') NOT BETWEEN 10 AND 240
           OR btrim(value #>> '{}') IS DISTINCT FROM (value #>> '{}')
      ) THEN
        RAISE EXCEPTION 'Sentence Scramble accepted alternative is invalid' USING ERRCODE = '22023';
      END IF;
      SELECT array_agg(value ORDER BY value) INTO v_tile_words
      FROM jsonb_array_elements_text(q -> 'words') AS tile(value);
      SELECT array_agg(value ORDER BY value) INTO v_sentence_words
      FROM regexp_split_to_table(q ->> 'sentence',' ') AS token(value);
      IF v_tile_words IS DISTINCT FROM v_sentence_words THEN
        RAISE EXCEPTION 'Sentence Scramble tile multiset does not match its canonical sentence' USING ERRCODE = '22023';
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

CREATE OR REPLACE FUNCTION economy_private.submit_think_lab_validator_answer(
  p_user_id uuid,
  p_guest_token_hash text,
  p_session_id uuid,
  p_game_id text,
  p_question_index integer,
  p_answer jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  s economy_private.think_lab_validator_sessions%ROWTYPE;
  q jsonb;
  v_attempts integer := 0;
  v_correct boolean := false;
  v_advance boolean := false;
  v_next_index integer;
  v_correct_count integer;
  v_completed boolean;
  v_now timestamptz;
  v_answer_text text;
  v_correct_index integer;
  v_words jsonb;
  v_response jsonb;
  v_link_index integer;
  v_expected_link_index integer;
  v_link jsonb;
  v_challenge_completed boolean;
  v_next_link_index integer;
  v_tile_order integer[];
  v_tile_count integer;
  v_tile_distinct integer;
  v_word_count integer;
  v_attempt text;
  v_normalized_attempt text;
  v_normalized_expected text;
BEGIN
  IF COALESCE(
       NULLIF(current_setting('request.jwt.claim.role', true), ''),
       NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
     ) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'trusted server role required' USING ERRCODE = '42501';
  END IF;

  IF p_session_id IS NULL
     OR p_game_id IS NULL OR p_game_id NOT IN ('word_forge','odd_one_out','chain_reaction','sentence_scramble')
     OR p_question_index IS NULL OR p_question_index < 0
     OR p_answer IS NULL OR jsonb_typeof(p_answer) IS DISTINCT FROM 'object'
     OR NOT (
       (p_user_id IS NOT NULL AND p_guest_token_hash IS NULL)
       OR
       (p_user_id IS NULL AND p_guest_token_hash IS NOT NULL
         AND p_guest_token_hash ~ '^[0-9a-f]{64}$')
     )
  THEN
    RAISE EXCEPTION 'invalid Think Lab answer request' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO s
  FROM economy_private.think_lab_validator_sessions
  WHERE session_id = p_session_id
    AND game_id = p_game_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id AND guest_token_hash IS NULL)
      OR
      (p_user_id IS NULL AND user_id IS NULL AND guest_token_hash = p_guest_token_hash)
    )
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Think Lab session not found' USING ERRCODE = 'P0002';
  END IF;
  IF s.status <> 'active' THEN
    RAISE EXCEPTION 'Think Lab session is not active' USING ERRCODE = '55000';
  END IF;

  v_now := clock_timestamp();
  IF s.expires_at <= v_now THEN
    RAISE EXCEPTION 'Think Lab session expired' USING ERRCODE = '57014';
  END IF;
  IF p_question_index <> s.current_index
     OR p_question_index >= jsonb_array_length(s.questions)
  THEN
    RAISE EXCEPTION 'unexpected Think Lab question index' USING ERRCODE = '22023';
  END IF;

  q := s.questions -> s.current_index;

  IF s.game_id = 'word_forge' THEN
    IF s.validator_version IS DISTINCT FROM 'word-forge-reviewed-72-20261111-v1'
       OR (SELECT count(*) FROM jsonb_object_keys(p_answer)) <> 1
       OR p_answer - ARRAY['answerWord'] <> '{}'::jsonb
       OR jsonb_typeof(p_answer -> 'answerWord') IS DISTINCT FROM 'string'
       OR COALESCE(p_answer ->> 'answerWord','') !~ '^[A-Za-z]{3,14}$'
    THEN
      RAISE EXCEPTION 'invalid Word Forge answer payload' USING ERRCODE = '22023';
    END IF;

    IF v_now - COALESCE(s.last_answer_at, s.created_at) < interval '650 milliseconds' THEN
      RAISE EXCEPTION 'Think Lab answer submitted too quickly' USING ERRCODE = '22023';
    END IF;

    v_answer_text := q ->> 'answerWord';
    IF v_answer_text IS NULL THEN
      RAISE EXCEPTION 'invalid canonical Word Forge answer' USING ERRCODE = '22023';
    END IF;

    SELECT count(*) INTO v_attempts
    FROM jsonb_array_elements(s.answers) AS a
    WHERE (a ->> 'question_index')::integer = s.current_index;
    v_attempts := v_attempts + 1;
    v_correct := lower(p_answer ->> 'answerWord') = v_answer_text;
    v_advance := v_correct OR v_attempts >= 3;
    v_next_index := s.current_index + CASE WHEN v_advance THEN 1 ELSE 0 END;
    v_correct_count := s.correct_count + CASE WHEN v_correct AND v_advance THEN 1 ELSE 0 END;
    v_completed := v_next_index = jsonb_array_length(s.questions);

    UPDATE economy_private.think_lab_validator_sessions
    SET answers = answers || jsonb_build_array(jsonb_build_object(
          'question_index', s.current_index,
          'submitted_word', lower(p_answer ->> 'answerWord'),
          'is_correct', v_correct,
          'attempt_number', v_attempts,
          'answered_at', v_now
        )),
        current_index = v_next_index,
        correct_count = v_correct_count,
        last_answer_at = v_now,
        status = CASE WHEN v_completed THEN 'completed' ELSE 'active' END,
        completed_at = CASE WHEN v_completed THEN v_now ELSE NULL END
    WHERE session_id = p_session_id;

    v_response := jsonb_build_object(
      'correct', v_correct,
      'correct_answer', CASE WHEN v_correct OR v_advance THEN v_answer_text ELSE NULL END,
      'explanation', CASE WHEN v_correct OR v_advance THEN q ->> 'explain' ELSE NULL END,
      'skill', CASE WHEN v_correct OR v_advance THEN q ->> 'skill' ELSE NULL END,
      'question_index', p_question_index,
      'attempts_remaining', GREATEST(0, 3 - v_attempts),
      'advance', v_advance,
      'completed', v_completed,
      'next_index', v_next_index,
      'correct_count', v_correct_count
    );

  ELSIF s.game_id = 'odd_one_out' THEN
    IF s.validator_version IS DISTINCT FROM 'odd-one-out-rotated-20261110-v2'
       OR (SELECT count(*) FROM jsonb_object_keys(p_answer)) <> 1
       OR p_answer - ARRAY['selectedIndex'] <> '{}'::jsonb
       OR jsonb_typeof(p_answer -> 'selectedIndex') IS DISTINCT FROM 'number'
       OR COALESCE(p_answer ->> 'selectedIndex','') !~ '^[0-3]$'
    THEN
      RAISE EXCEPTION 'invalid Odd One Out answer payload' USING ERRCODE = '22023';
    END IF;

    IF v_now - COALESCE(s.last_answer_at, s.created_at) < interval '700 milliseconds' THEN
      RAISE EXCEPTION 'Think Lab answer submitted too quickly' USING ERRCODE = '22023';
    END IF;

    v_words := q -> 'words';
    v_correct_index := CASE WHEN COALESCE(q ->> 'answer','') ~ '^[0-3]$'
      THEN (q ->> 'answer')::integer ELSE NULL END;
    IF jsonb_typeof(v_words) IS DISTINCT FROM 'array'
       OR jsonb_array_length(v_words) <> 4
       OR v_correct_index IS NULL
    THEN
      RAISE EXCEPTION 'invalid canonical Odd One Out question' USING ERRCODE = '22023';
    END IF;

    v_correct := (p_answer ->> 'selectedIndex')::integer = v_correct_index;
    v_advance := true;
    v_next_index := s.current_index + 1;
    v_correct_count := s.correct_count + CASE WHEN v_correct THEN 1 ELSE 0 END;
    v_completed := v_next_index = jsonb_array_length(s.questions);

    UPDATE economy_private.think_lab_validator_sessions
    SET answers = answers || jsonb_build_array(jsonb_build_object(
          'question_index', s.current_index,
          'selected_index', (p_answer ->> 'selectedIndex')::integer,
          'is_correct', v_correct,
          'answered_at', v_now
        )),
        current_index = v_next_index,
        correct_count = v_correct_count,
        last_answer_at = v_now,
        status = CASE WHEN v_completed THEN 'completed' ELSE 'active' END,
        completed_at = CASE WHEN v_completed THEN v_now ELSE NULL END
    WHERE session_id = p_session_id;

    v_response := jsonb_build_object(
      'correct', v_correct,
      'correct_index', v_correct_index,
      'correct_answer', v_words ->> v_correct_index,
      'explanation', q ->> 'explain',
      'relationship', q ->> 'relationship',
      'hint', q ->> 'hint',
      'question_index', p_question_index,
      'completed', v_completed,
      'next_index', v_next_index
    );

  ELSIF s.game_id = 'chain_reaction' THEN
    IF s.validator_version IS DISTINCT FROM 'chain-reaction-72-20261112-v1'
       OR (SELECT count(*) FROM jsonb_object_keys(p_answer)) <> 2
       OR p_answer - ARRAY['linkIndex','selectedIndex'] <> '{}'::jsonb
       OR jsonb_typeof(p_answer -> 'linkIndex') IS DISTINCT FROM 'number'
       OR jsonb_typeof(p_answer -> 'selectedIndex') IS DISTINCT FROM 'number'
       OR COALESCE(p_answer ->> 'linkIndex','') !~ '^[0-2]$'
       OR COALESCE(p_answer ->> 'selectedIndex','') !~ '^[0-2]$'
    THEN
      RAISE EXCEPTION 'invalid Chain Reaction answer payload' USING ERRCODE = '22023';
    END IF;

    IF v_now - COALESCE(s.last_answer_at, s.created_at) < interval '700 milliseconds' THEN
      RAISE EXCEPTION 'Think Lab answer submitted too quickly' USING ERRCODE = '22023';
    END IF;

    IF jsonb_typeof(q -> 'links') IS DISTINCT FROM 'array'
       OR jsonb_array_length(q -> 'links') <> 3
    THEN
      RAISE EXCEPTION 'invalid canonical Chain Reaction challenge' USING ERRCODE = '22023';
    END IF;

    SELECT count(*) INTO v_expected_link_index
    FROM jsonb_array_elements(s.answers) AS a
    WHERE (a ->> 'question_index')::integer = s.current_index;

    v_link_index := (p_answer ->> 'linkIndex')::integer;
    IF v_link_index <> v_expected_link_index OR v_link_index > 2 THEN
      RAISE EXCEPTION 'unexpected Chain Reaction link index' USING ERRCODE = '22023';
    END IF;

    v_link := q -> 'links' -> v_link_index;
    v_correct_index := CASE WHEN COALESCE(v_link ->> 'answer','') ~ '^[0-2]$'
      THEN (v_link ->> 'answer')::integer ELSE NULL END;
    IF v_correct_index IS NULL
       OR jsonb_typeof(v_link -> 'options') IS DISTINCT FROM 'array'
       OR jsonb_array_length(v_link -> 'options') <> 3
    THEN
      RAISE EXCEPTION 'invalid canonical Chain Reaction link' USING ERRCODE = '22023';
    END IF;

    v_correct := (p_answer ->> 'selectedIndex')::integer = v_correct_index;
    IF NOT v_correct THEN
      UPDATE economy_private.think_lab_validator_sessions
      SET last_answer_at = v_now,
          wrong_attempt_count = wrong_attempt_count + 1
      WHERE session_id = p_session_id;
      v_next_index := s.current_index;
      v_next_link_index := v_expected_link_index;
      v_challenge_completed := false;
      v_completed := false;
      v_correct_count := s.correct_count;
      v_response := jsonb_build_object(
        'correct', false,
        'question_index', p_question_index,
        'link_index', v_link_index,
        'next_link_index', v_next_link_index,
        'next_index', v_next_index,
        'challenge_completed', false,
        'completed', false
      );
    ELSE
      v_next_link_index := v_link_index + 1;
      v_challenge_completed := v_next_link_index = 3;
      v_next_index := s.current_index + CASE WHEN v_challenge_completed THEN 1 ELSE 0 END;
      v_correct_count := s.correct_count + CASE WHEN v_challenge_completed THEN 1 ELSE 0 END;
      v_completed := v_next_index = jsonb_array_length(s.questions);

      UPDATE economy_private.think_lab_validator_sessions
      SET answers = answers || jsonb_build_array(jsonb_build_object(
            'question_index', s.current_index,
            'link_index', v_link_index,
            'selected_index', (p_answer ->> 'selectedIndex')::integer,
            'is_correct', true,
            'answered_at', v_now
          )),
          current_index = v_next_index,
          correct_count = v_correct_count,
          last_answer_at = v_now,
          status = CASE WHEN v_completed THEN 'completed' ELSE 'active' END,
          completed_at = CASE WHEN v_completed THEN v_now ELSE NULL END
      WHERE session_id = p_session_id;

      v_response := jsonb_build_object(
        'correct', true,
        'question_index', p_question_index,
        'link_index', v_link_index,
        'next_link_index', CASE WHEN v_challenge_completed THEN 0 ELSE v_next_link_index END,
        'next_index', v_next_index,
        'challenge_completed', v_challenge_completed,
        'completed', v_completed,
        'next_word', v_link ->> 'to',
        'explanation', v_link ->> 'explanation'
      );
    END IF;

  ELSE
    IF s.validator_version IS DISTINCT FROM 'sentence-scramble-72-20261112-v1'
       OR (SELECT count(*) FROM jsonb_object_keys(p_answer)) <> 1
       OR p_answer - ARRAY['tileOrder'] <> '{}'::jsonb
       OR jsonb_typeof(p_answer -> 'tileOrder') IS DISTINCT FROM 'array'
    THEN
      RAISE EXCEPTION 'invalid Sentence Scramble answer payload' USING ERRCODE = '22023';
    END IF;

    IF v_now - COALESCE(s.last_answer_at, s.created_at) < interval '700 milliseconds' THEN
      RAISE EXCEPTION 'Think Lab answer submitted too quickly' USING ERRCODE = '22023';
    END IF;

    IF jsonb_typeof(q -> 'words') IS DISTINCT FROM 'array'
       OR jsonb_typeof(q -> 'acceptedAnswers') IS DISTINCT FROM 'array'
    THEN
      RAISE EXCEPTION 'invalid canonical Sentence Scramble question' USING ERRCODE = '22023';
    END IF;
    IF jsonb_array_length(q -> 'words') NOT BETWEEN 3 AND 24 THEN
      RAISE EXCEPTION 'invalid canonical Sentence Scramble tile count' USING ERRCODE = '22023';
    END IF;

    v_word_count := jsonb_array_length(q -> 'words');
    IF jsonb_array_length(p_answer -> 'tileOrder') <> v_word_count THEN
      RAISE EXCEPTION 'Sentence Scramble tile order must use every tile exactly once' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_answer -> 'tileOrder') AS tile(value)
      WHERE jsonb_typeof(value) IS DISTINCT FROM 'number'
         OR length(value::text) NOT BETWEEN 1 AND 2
         OR value::text !~ '^[0-9]{1,2}'
    ) THEN
      RAISE EXCEPTION 'Sentence Scramble tile order contains a non-integer index' USING ERRCODE = '22023';
    END IF;

    SELECT array_agg(value::integer ORDER BY ordinality),
           count(*),
           count(DISTINCT value::integer)
      INTO v_tile_order, v_tile_count, v_tile_distinct
      FROM jsonb_array_elements_text(p_answer -> 'tileOrder') WITH ORDINALITY AS tile(value, ordinality);
    IF v_tile_count <> v_word_count
       OR v_tile_distinct <> v_tile_count
       OR EXISTS (SELECT 1 FROM unnest(v_tile_order) AS tile(tile_index)
                  WHERE tile_index < 0 OR tile_index >= v_word_count)
    THEN
      RAISE EXCEPTION 'Sentence Scramble tile order is not a complete permutation' USING ERRCODE = '22023';
    END IF;

    SELECT string_agg(q -> 'words' ->> tile_index, ' ' ORDER BY ordinality)
      INTO v_attempt
      FROM unnest(v_tile_order) WITH ORDINALITY AS tile(tile_index, ordinality);
    v_normalized_attempt := btrim(regexp_replace(regexp_replace(lower(v_attempt),'[^a-z0-9 ]','','g'),' +',' ','g'));
    v_normalized_expected := btrim(regexp_replace(regexp_replace(lower(q ->> 'sentence'),'[^a-z0-9 ]','','g'),' +',' ','g'));
    v_correct := v_normalized_attempt = v_normalized_expected OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(q -> 'acceptedAnswers') AS alternative(value)
      WHERE btrim(regexp_replace(regexp_replace(lower(value),'[^a-z0-9 ]','','g'),' +',' ','g')) = v_normalized_attempt
    );
    v_next_index := s.current_index + CASE WHEN v_correct THEN 1 ELSE 0 END;
    v_correct_count := s.correct_count + CASE WHEN v_correct THEN 1 ELSE 0 END;
    v_completed := v_next_index = jsonb_array_length(s.questions);

    IF NOT v_correct THEN
      UPDATE economy_private.think_lab_validator_sessions
      SET last_answer_at = v_now,
          wrong_attempt_count = wrong_attempt_count + 1
      WHERE session_id = p_session_id;
      v_response := jsonb_build_object(
        'correct', false,
        'question_index', p_question_index,
        'next_index', v_next_index,
        'completed', false
      );
    ELSE
      UPDATE economy_private.think_lab_validator_sessions
      SET answers = answers || jsonb_build_array(jsonb_build_object(
            'question_index', s.current_index,
            'tile_order', to_jsonb(v_tile_order),
            'is_correct', true,
            'answered_at', v_now
          )),
          current_index = v_next_index,
          correct_count = v_correct_count,
          last_answer_at = v_now,
          status = CASE WHEN v_completed THEN 'completed' ELSE 'active' END,
          completed_at = CASE WHEN v_completed THEN v_now ELSE NULL END
      WHERE session_id = p_session_id;
      v_response := jsonb_build_object(
        'correct', true,
        'question_index', p_question_index,
        'next_index', v_next_index,
        'completed', v_completed,
        'sentence', q ->> 'sentence',
        'explanation', q ->> 'explanation',
        'skill', q ->> 'skill'
      );
    END IF;
  END IF;

  IF v_completed AND s.user_id IS NOT NULL THEN
    IF s.game_id = 'word_forge' THEN
      PERFORM public.economy_record_validated_activity_event(
        s.user_id, s.session_id, 'think_lab', 'think_lab', 'word_forge',
        'game_session_completed', v_now, s.validator_version,
        jsonb_build_object(
          'training_mode', s.training_mode,
          'question_count', 24,
          'correct_count', v_correct_count,
          'incorrect_count', 24 - v_correct_count
        )
      );
    ELSIF s.game_id = 'odd_one_out' THEN
      PERFORM public.economy_record_validated_activity_event(
        s.user_id, s.session_id, 'think_lab', 'think_lab', 'odd_one_out',
        'game_session_completed', v_now, s.validator_version,
        jsonb_build_object(
          'challenge_level', s.cefr_level,
          'training_mode', s.training_mode,
          'question_count', jsonb_array_length(s.questions),
          'correct_count', v_correct_count,
          'incorrect_count', v_next_index - v_correct_count
        )
      );
    ELSIF s.game_id = 'chain_reaction' THEN
      PERFORM public.economy_record_validated_activity_event(
        s.user_id, s.session_id, 'think_lab', 'think_lab', 'chain_reaction',
        'game_session_completed', v_now, s.validator_version,
        jsonb_build_object(
          'training_mode', s.training_mode,
          'session_type', CASE WHEN jsonb_array_length(s.questions) = 1 THEN 'daily' ELSE 'full' END,
          'question_count', jsonb_array_length(s.questions),
          'link_count', jsonb_array_length(s.questions) * 3,
          'wrong_link_attempts', s.wrong_attempt_count,
          'correct_count', v_correct_count,
          'incorrect_count', jsonb_array_length(s.questions) - v_correct_count
        )
      );
    ELSE
      PERFORM public.economy_record_validated_activity_event(
        s.user_id, s.session_id, 'think_lab', 'think_lab', 'sentence_scramble',
        'game_session_completed', v_now, s.validator_version,
        jsonb_build_object(
          'training_mode', s.training_mode,
          'session_type', CASE WHEN jsonb_array_length(s.questions) = 1 THEN 'daily' ELSE 'full' END,
          'question_count', jsonb_array_length(s.questions),
          'correct_count', v_correct_count,
          'incorrect_count', 0,
          'wrong_attempts', s.wrong_attempt_count
        )
      );
    END IF;
  END IF;

  RETURN v_response;
END;
$$;

COMMENT ON FUNCTION economy_private.start_think_lab_validator_session(uuid,text,uuid,text,text,text,text,text,jsonb,timestamptz)
  IS 'Service-role-only unified Think Lab session start with server-owned canonical banks, guest isolation, bounded expiry and per-owner rate limits.';
COMMENT ON FUNCTION economy_private.submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)
  IS 'Service-role-only unified Think Lab answer transition; Chain Reaction links and Sentence Scramble tile permutations are verified as private server-side substeps.';
