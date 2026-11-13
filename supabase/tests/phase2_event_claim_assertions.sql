-- Phase 2 event/claim foundation contract tests. Disposable local Supabase only.
BEGIN;

DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'economy_private'
    AND c.relkind = 'r'
    AND c.relname IN (
      'activity_events', 'mission_template_versions', 'achievement_definitions',
      'mission_boards', 'mission_assignments', 'mission_reward_claims',
      'achievement_awards'
    )
    AND c.relrowsecurity AND c.relforcerowsecurity;
  IF v_count <> 7 THEN
    RAISE EXCEPTION 'Expected RLS and FORCE RLS on seven Phase 2 tables; found %', v_count;
  END IF;

  IF has_table_privilege('anon', 'economy_private.activity_events', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.activity_events', 'INSERT')
     OR has_table_privilege('service_role', 'economy_private.activity_events', 'INSERT')
     OR has_table_privilege('authenticated', 'economy_private.mission_reward_claims', 'SELECT')
     OR has_table_privilege('service_role', 'economy_private.achievement_awards', 'INSERT') THEN
    RAISE EXCEPTION 'Phase 2 private tables must not grant direct API-role access';
  END IF;

  IF NOT has_function_privilege(
       'service_role',
       'economy_private.post_wallet_transaction(uuid,bigint,text,text,text,uuid,text,smallint,jsonb)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'Phase 2 must preserve the Phase 1 private wallet transaction grant';
  END IF;

  IF has_function_privilege(
       'anon',
       'public.economy_record_validated_activity_event(uuid,uuid,text,text,text,text,timestamptz,text,jsonb)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'authenticated',
       'public.economy_record_validated_activity_event(uuid,uuid,text,text,text,text,timestamptz,text,jsonb)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'service_role',
       'public.economy_record_validated_activity_event(uuid,uuid,text,text,text,text,timestamptz,text,jsonb)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'Validated event RPC must be callable only by service_role';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'economy_private.activity_events'::regclass
      AND tgname = 'activity_events_append_only' AND NOT tgisinternal
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'economy_private.mission_reward_claims'::regclass
      AND tgname = 'mission_reward_claims_append_only' AND NOT tgisinternal
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'economy_private.achievement_awards'::regclass
      AND tgname = 'achievement_awards_append_only' AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION 'Phase 2 event and claim history must be append-only';
  END IF;

  -- Assignability is allowed only when the exact immutable template version
  -- has a verified predicate mapping and a private service-role-only evaluator.
  -- Achievement definitions remain non-assignable until their own evidence path exists.
  IF EXISTS (
    SELECT 1
    FROM economy_private.mission_template_versions t
    WHERE t.is_assignable
      AND (
        t.validator_mapping_status <> 'verified'
        OR NOT EXISTS (
          SELECT 1
          FROM economy_private.mission_event_predicate_mappings m
          JOIN pg_catalog.pg_proc p
            ON p.oid = to_regprocedure(
              'economy_private.evaluate_' || m.predicate_key || '(uuid)'
            )
          WHERE m.template_id = t.template_id
            AND m.template_version = t.template_version
            AND m.mapping_status = 'verified'
            AND p.prosecdef
            AND p.prorettype = 'boolean'::regtype
            AND has_function_privilege('service_role', p.oid, 'EXECUTE')
            AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')
            AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
        )
      )
  ) OR EXISTS (
    SELECT 1 FROM economy_private.achievement_definitions
    WHERE is_assignable
  ) THEN
    RAISE EXCEPTION 'Every assignable mission must have a verified mapping and trusted evaluator; achievements remain gated';
  END IF;

  -- Preserve the eleven original definitions and both immutable challenge
  -- successors: v2 mapped/non-assignable, v3 verified/assignable.
  IF (SELECT count(*) FROM economy_private.mission_template_versions
      WHERE template_version = 1) <> 11
     OR (SELECT count(*) FROM economy_private.mission_template_versions
         WHERE template_id = 'solve_a_challenge' AND template_version IN (2,3,4)) <> 3
     OR (SELECT count(*) FROM economy_private.mission_template_versions) <> 21
     OR (SELECT count(*) FROM economy_private.achievement_definitions) <> 10
     OR (SELECT count(*) FROM economy_private.mission_event_predicate_mappings
         WHERE template_id = 'solve_a_challenge' AND template_version IN (2,3,4)) <> 3 THEN
    RAISE EXCEPTION 'Expected the 11 original missions, three legacy challenge successors/mappings, seven additive Phase 6B versions, and 10 achievement definitions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM economy_private.mission_template_versions
    WHERE (template_id = 'solve_a_challenge' AND template_version = 2
           AND (validator_mapping_status <> 'mapped' OR is_assignable))
       OR (template_id = 'solve_a_challenge' AND template_version = 3
           AND (validator_mapping_status <> 'verified' OR NOT is_assignable))
       OR (template_id <> 'solve_a_challenge' AND template_version = 1
           AND (validator_mapping_status <> 'unmapped' OR is_assignable))
       OR (template_id = 'solve_a_challenge' AND template_version = 4
           AND (validator_mapping_status <> 'mapped' OR is_assignable))
       OR (template_id = 'solve_a_challenge' AND template_version NOT IN (1,2,3,4,5))
       OR (template_id <> 'solve_a_challenge' AND template_version NOT IN (1,2))
       OR (period_type = 'daily' AND reward_amount <> 10)
       OR (period_type = 'weekly' AND reward_amount <> 20)
  ) OR EXISTS (
    SELECT 1 FROM economy_private.mission_event_predicate_mappings
    WHERE (template_id = 'solve_a_challenge' AND template_version = 2
              AND (predicate_version <> 1 OR mapping_status <> 'mapped'))
       OR (template_id = 'solve_a_challenge' AND template_version = 3
              AND (predicate_version <> 2 OR mapping_status <> 'verified'))
       OR (template_id = 'solve_a_challenge' AND template_version = 4
              AND (predicate_version <> 3 OR mapping_status <> 'mapped'
                   OR predicate_key <> 'solve_a_challenge_word_forge_v1'
                   OR validator_version <> 'word-forge-reviewed-72-20261111-v1'))
       OR (template_id <> 'solve_a_challenge' OR template_version NOT IN (2,3,4))
       AND NOT (
         (template_id IN ('learning_step','try_something_different','put_knowledge_to_use',
                          'consistent_progress','broaden_your_experience','meaningful_progress')
          AND template_version = 2)
         OR (template_id = 'solve_a_challenge' AND template_version = 5)
       )
  ) OR EXISTS (
    SELECT 1 FROM economy_private.achievement_definitions
    WHERE validator_mapping_status <> 'unmapped' OR is_assignable
  ) THEN
    RAISE EXCEPTION 'Mission successors, predicate mappings, rewards, or achievement gates do not match the verified Phase 4G contract';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 2 must not enable the economy';
  END IF;
END;
$$;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f2000000-0000-4000-8000-000000000021',
  'authenticated', 'authenticated', 'velorn-phase2-test@example.invalid',
  '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $$
DECLARE
  v_first uuid;
  v_replay uuid;
  v_count integer;
BEGIN
  SELECT event_id INTO v_first
  FROM public.economy_record_validated_activity_event(
    'f2000000-0000-4000-8000-000000000021',
    'f2000000-0000-4000-8000-000000000022',
    'think_lab', 'odd_one_out', 'session-001', 'validated_completion',
    '2026-11-10T18:00:00Z', 'odd-one-out-validator-v1',
    '{"result":"passed","difficulty":"guided"}'::jsonb
  );

  SELECT event_id INTO v_replay
  FROM public.economy_record_validated_activity_event(
    'f2000000-0000-4000-8000-000000000021',
    'f2000000-0000-4000-8000-000000000022',
    'think_lab', 'odd_one_out', 'session-001', 'validated_completion',
    '2026-11-10T18:00:00Z', 'odd-one-out-validator-v1',
    '{"result":"passed","difficulty":"guided"}'::jsonb
  );

  IF v_first IS DISTINCT FROM v_replay THEN
    RAISE EXCEPTION 'Idempotent event replay must return the original event ID';
  END IF;

  SELECT count(*) INTO v_count
  FROM economy_private.activity_events
  WHERE user_id = 'f2000000-0000-4000-8000-000000000021';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Expected one accepted activity event after duplicate replay; found %', v_count;
  END IF;

  BEGIN
    PERFORM *
    FROM public.economy_record_validated_activity_event(
      'f2000000-0000-4000-8000-000000000021',
      'f2000000-0000-4000-8000-000000000022',
      'think_lab', 'odd_one_out', 'session-001', 'validated_completion',
      '2026-11-10T18:00:00Z', 'odd-one-out-validator-v1',
      '{"result":"forged","difficulty":"guided"}'::jsonb
    );
    RAISE EXCEPTION 'Reusing an event key with a different payload must fail';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;

  BEGIN
    UPDATE economy_private.activity_events
    SET event_type = 'forged_event'
    WHERE event_id = v_first;
    RAISE EXCEPTION 'Accepted activity evidence must not be editable';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
END;
$$;

ROLLBACK;
