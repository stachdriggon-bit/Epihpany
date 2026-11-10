-- Velorn Phase 3C hardening: distinguish learner-selected challenge tier,
-- serialize per-user session starts, and pace answers to reduce automated farming.
-- This migration upgrades the already-deployed 20261110193000 foundation.

ALTER TABLE economy_private.game_validator_sessions
  RENAME COLUMN cefr_level TO challenge_level;

ALTER TABLE economy_private.game_validator_sessions
  ADD COLUMN last_answer_at timestamptz;

-- The public wrapper depends on the private implementation, so drop it first
-- before changing the input argument name from p_cefr_level to p_challenge_level.
DROP FUNCTION public.velorn_start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz);
DROP FUNCTION economy_private.start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz);

CREATE OR REPLACE FUNCTION economy_private.start_odd_one_out_session(
  p_user_id uuid,
  p_session_id uuid,
  p_validator_version text,
  p_challenge_level text,
  p_training_mode text,
  p_questions jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_active_count integer;
  v_recent_count integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'authenticated user is required' USING ERRCODE = '22023';
  END IF;

  -- Serialize starts for the same player so concurrent requests cannot race
  -- through the active-session and rolling-window limits.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  SELECT count(*) INTO v_active_count
  FROM economy_private.game_validator_sessions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND expires_at > clock_timestamp();

  SELECT count(*) INTO v_recent_count
  FROM economy_private.game_validator_sessions
  WHERE user_id = p_user_id
    AND created_at > clock_timestamp() - interval '15 minutes';

  IF v_active_count >= 3 OR v_recent_count >= 10 THEN
    RAISE EXCEPTION 'validator session rate limit exceeded' USING ERRCODE = '54000';
  END IF;

  IF p_session_id IS NULL
     OR p_validator_version IS NULL
     OR p_challenge_level NOT IN ('A1','A2','B1','B2','C1','C2')
     OR p_training_mode NOT IN ('guided','steady','challenge')
     OR jsonb_typeof(p_questions) <> 'array'
     OR jsonb_array_length(p_questions) NOT BETWEEN 1 AND 12
     OR p_expires_at <= clock_timestamp()
     OR p_expires_at > clock_timestamp() + interval '30 minutes'
  THEN
    RAISE EXCEPTION 'invalid validator session parameters' USING ERRCODE = '22023';
  END IF;

  INSERT INTO economy_private.game_validator_sessions (
    session_id, user_id, validator_id, validator_version,
    challenge_level, training_mode, questions, expires_at
  ) VALUES (
    p_session_id, p_user_id, 'odd_one_out', p_validator_version,
    p_challenge_level, p_training_mode, p_questions, p_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.velorn_start_odd_one_out_session(
  p_user_id uuid,
  p_session_id uuid,
  p_validator_version text,
  p_challenge_level text,
  p_training_mode text,
  p_questions jsonb,
  p_expires_at timestamptz
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT economy_private.start_odd_one_out_session(
    p_user_id, p_session_id, p_validator_version,
    p_challenge_level, p_training_mode, p_questions, p_expires_at
  );
$$;

REVOKE ALL ON FUNCTION economy_private.start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.velorn_start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.velorn_start_odd_one_out_session(uuid,uuid,text,text,text,jsonb,timestamptz)
  TO service_role;

CREATE OR REPLACE FUNCTION economy_private.submit_odd_one_out_answer(
  p_user_id uuid,
  p_session_id uuid,
  p_question_index integer,
  p_selected_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_session economy_private.game_validator_sessions%ROWTYPE;
  v_question jsonb;
  v_words jsonb;
  v_correct_index integer;
  v_is_correct boolean;
  v_next_index integer;
  v_completed boolean;
  v_answer jsonb;
BEGIN
  SELECT * INTO v_session
  FROM economy_private.game_validator_sessions
  WHERE session_id = p_session_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'validator session not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_session.status <> 'active' THEN
    RAISE EXCEPTION 'validator session is not active' USING ERRCODE = '55000';
  END IF;
  IF v_session.expires_at <= clock_timestamp() THEN
    UPDATE economy_private.game_validator_sessions
      SET status = 'expired'
      WHERE session_id = p_session_id;
    RAISE EXCEPTION 'validator session expired' USING ERRCODE = '57014';
  END IF;
  IF clock_timestamp() - COALESCE(v_session.last_answer_at, v_session.created_at) < interval '700 milliseconds' THEN
    RAISE EXCEPTION 'answer submitted too quickly' USING ERRCODE = '22023';
  END IF;
  IF p_question_index IS NULL OR p_selected_index IS NULL
     OR p_question_index <> v_session.current_index
     OR p_question_index < 0
     OR p_question_index >= jsonb_array_length(v_session.questions)
     OR p_selected_index < 0 OR p_selected_index > 3
  THEN
    RAISE EXCEPTION 'unexpected question or answer index' USING ERRCODE = '22023';
  END IF;

  v_question := v_session.questions -> p_question_index;
  v_words := v_question -> 'words';
  IF jsonb_typeof(v_words) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'invalid question options' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(v_words) <> 4 THEN
    RAISE EXCEPTION 'invalid question option count' USING ERRCODE = '22023';
  END IF;

  v_correct_index := (v_question ->> 'answer')::integer;
  IF v_correct_index IS NULL OR v_correct_index < 0 OR v_correct_index > 3 THEN
    RAISE EXCEPTION 'invalid canonical answer' USING ERRCODE = '22023';
  END IF;

  v_is_correct := p_selected_index = v_correct_index;
  v_next_index := v_session.current_index + 1;
  v_completed := v_next_index >= jsonb_array_length(v_session.questions);
  v_answer := jsonb_build_object(
    'question_index', p_question_index,
    'selected_index', p_selected_index,
    'is_correct', v_is_correct,
    'answered_at', clock_timestamp()
  );

  UPDATE economy_private.game_validator_sessions
  SET answers = answers || jsonb_build_array(v_answer),
      current_index = v_next_index,
      correct_count = correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
      last_answer_at = clock_timestamp(),
      status = CASE WHEN v_completed THEN 'completed' ELSE 'active' END,
      completed_at = CASE WHEN v_completed THEN clock_timestamp() ELSE NULL END
  WHERE session_id = p_session_id;

  IF v_completed THEN
    PERFORM public.economy_record_validated_activity_event(
      p_user_id,
      p_session_id,
      'think_lab',
      'think_lab',
      'odd_one_out',
      'game_session_completed',
      clock_timestamp(),
      v_session.validator_version,
      jsonb_build_object(
        'challenge_level', v_session.challenge_level,
        'training_mode', v_session.training_mode,
        'question_count', jsonb_array_length(v_session.questions),
        'correct_count', v_session.correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        'incorrect_count', v_next_index - (v_session.correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END)
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'correct', v_is_correct,
    'correct_index', v_correct_index,
    'correct_answer', v_words ->> v_correct_index,
    'explanation', v_question ->> 'explain',
    'relationship', v_question ->> 'relationship',
    'hint', v_question ->> 'hint',
    'question_index', p_question_index,
    'completed', v_completed,
    'next_index', v_next_index
  );
END;
$$;

COMMENT ON COLUMN economy_private.game_validator_sessions.challenge_level IS
  'Player-selected practice challenge tier, not a verified CEFR proficiency assessment.';
COMMENT ON COLUMN economy_private.game_validator_sessions.last_answer_at IS
  'Server timestamp used to enforce minimum answer pacing.';
