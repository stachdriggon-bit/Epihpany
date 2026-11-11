-- Phase 4D first mission predicate contract. Disposable clean-room DB only.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f4000000-0000-4000-8000-000000000041',
  'authenticated', 'authenticated', 'velorn-phase4d-test@example.invalid',
  '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $phase4d$
DECLARE
  v_valid uuid := 'f4000000-0000-4000-8000-000000000042';
  v_steady uuid := 'f4000000-0000-4000-8000-000000000043';
  v_bad_counts uuid := 'f4000000-0000-4000-8000-000000000044';
  v_wrong_validator uuid := 'f4000000-0000-4000-8000-000000000045';
  v_wrong_activity uuid := 'f4000000-0000-4000-8000-000000000046';
  v_missing uuid := 'f4000000-0000-4000-8000-000000000047';
BEGIN
  IF has_function_privilege('anon', 'economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'economy_private.evaluate_solve_a_challenge_odd_one_out_v1(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Mission predicate evaluator must be service-role-only';
  END IF;

  IF has_table_privilege('anon', 'economy_private.mission_event_predicate_mappings', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.mission_event_predicate_mappings', 'SELECT')
     OR has_table_privilege('service_role', 'economy_private.mission_event_predicate_mappings', 'SELECT') THEN
    RAISE EXCEPTION 'Predicate mapping table must not be directly readable by API roles';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE template_id = 'solve_a_challenge'
      AND template_version = 2
      AND validator_mapping_status = 'mapped'
      AND NOT is_assignable
  ) THEN
    RAISE EXCEPTION 'New challenge template version must remain mapped but non-assignable';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE template_id = 'solve_a_challenge'
      AND template_version = 2
      AND predicate_key = 'solve_a_challenge_odd_one_out_v1'
      AND mapping_status = 'mapped'
  ) THEN
    RAISE EXCEPTION 'Versioned predicate mapping is missing';
  END IF;

  INSERT INTO economy_private.activity_events (
    event_id, user_id, source_event_key, source_system, experience_id,
    activity_id, event_type, occurred_at, received_at, validator_version, evidence
  )
  VALUES
  (
    v_valid, 'f4000000-0000-4000-8000-000000000041', v_valid,
    'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
    now() - interval '1 minute', now(), 'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"A2","training_mode":"challenge","question_count":12,"correct_count":0,"incorrect_count":12}'::jsonb
  ),
  (
    v_steady, 'f4000000-0000-4000-8000-000000000041', v_steady,
    'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
    now() - interval '1 minute', now(), 'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"steady","question_count":12,"correct_count":9,"incorrect_count":3}'::jsonb
  ),
  (
    v_bad_counts, 'f4000000-0000-4000-8000-000000000041', v_bad_counts,
    'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
    now() - interval '1 minute', now(), 'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":3}'::jsonb
  ),
  (
    v_wrong_validator, 'f4000000-0000-4000-8000-000000000041', v_wrong_validator,
    'think_lab', 'think_lab', 'odd_one_out', 'game_session_completed',
    now() - interval '1 minute', now(), 'unreviewed-validator-v1',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  ),
  (
    v_wrong_activity, 'f4000000-0000-4000-8000-000000000041', v_wrong_activity,
    'think_lab', 'think_lab', 'letter_grid', 'game_session_completed',
    now() - interval '1 minute', now(), 'odd-one-out-rotated-20261110-v2',
    '{"challenge_level":"B1","training_mode":"challenge","question_count":12,"correct_count":8,"incorrect_count":4}'::jsonb
  );

  IF NOT economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_valid) THEN
    RAISE EXCEPTION 'A fully completed Challenge-mode session should qualify even with zero correct answers';
  END IF;
  IF economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_steady)
     OR economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_bad_counts)
     OR economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_wrong_validator)
     OR economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_wrong_activity)
     OR economy_private.evaluate_solve_a_challenge_odd_one_out_v1(v_missing) THEN
    RAISE EXCEPTION 'Predicate must reject non-challenge, malformed, untrusted, mismatched, and missing evidence';
  END IF;

  IF EXISTS (SELECT 1 FROM economy_private.wallets WHERE user_id = 'f4000000-0000-4000-8000-000000000041')
     OR EXISTS (SELECT 1 FROM economy_private.wallet_ledger WHERE user_id = 'f4000000-0000-4000-8000-000000000041')
     OR EXISTS (SELECT 1 FROM economy_private.mission_reward_claims WHERE user_id = 'f4000000-0000-4000-8000-000000000041')
     OR EXISTS (SELECT 1 FROM economy_private.achievement_awards WHERE user_id = 'f4000000-0000-4000-8000-000000000041') THEN
    RAISE EXCEPTION 'Predicate evaluation must not create wallet, ledger, claim, or award rows';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Predicate mapping must leave the economy disabled';
  END IF;
END;
$phase4d$;

ROLLBACK;
