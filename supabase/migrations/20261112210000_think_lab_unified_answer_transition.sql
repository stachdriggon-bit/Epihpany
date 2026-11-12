-- Phase 5B: one transactional answer transition for all allowlisted Think Lab adapters.
-- Game-specific answer rules remain explicit branches; lifecycle and trust boundary are shared.

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
BEGIN
  IF COALESCE(
       NULLIF(current_setting('request.jwt.claim.role', true), ''),
       NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
     ) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'trusted server role required' USING ERRCODE = '42501';
  END IF;

  IF p_session_id IS NULL
     OR p_game_id IS NULL OR p_game_id NOT IN ('word_forge','odd_one_out')
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

  -- The row lock serializes all attempts, cursor changes, and completion for this session.
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

  ELSE
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
  END IF;

  -- Completion event and session completion commit together. Guests never emit events.
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
    ELSE
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
    END IF;
  END IF;

  RETURN v_response;
END;
$$;

CREATE OR REPLACE FUNCTION public.velorn_submit_think_lab_validator_answer(
  p_user_id uuid,
  p_guest_token_hash text,
  p_session_id uuid,
  p_game_id text,
  p_question_index integer,
  p_answer jsonb
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT economy_private.submit_think_lab_validator_answer(
    p_user_id, p_guest_token_hash, p_session_id, p_game_id, p_question_index, p_answer
  );
$$;

REVOKE ALL ON FUNCTION economy_private.submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb)
  TO service_role;

COMMENT ON FUNCTION economy_private.submit_think_lab_validator_answer(uuid,text,uuid,text,integer,jsonb) IS
  'Shared service-role-only, row-locked Think Lab answer transition with fixed Word Forge and Odd One Out adapter branches; emits one authenticated completion event and no guest events.';
