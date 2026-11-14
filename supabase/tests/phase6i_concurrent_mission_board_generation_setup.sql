-- Phase 6I: concurrent idempotent generation of daily and weekly mission boards.
-- Fixtures are committed only inside the disposable clean-room Supabase database.
-- The workflow always restores the economy gate to disabled.
BEGIN;

INSERT INTO auth.users (
  id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) VALUES (
  'f6b90000-0000-4000-8000-000000000001',
  'authenticated','authenticated','velorn-phase6i@example.invalid','',now(),
  '{}'::jsonb,'{"timezone_name":"UTC"}'::jsonb,now(),now()
);

SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);

DO $phase6i_setup$
BEGIN
  UPDATE economy_private.economy_settings
  SET economy_enabled=false,updated_at=clock_timestamp()
  WHERE singleton=true;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Phase 6I must begin with the economy disabled';
  END IF;

  INSERT INTO economy_private.mission_template_versions (
    template_id,template_version,period_type,mission_family,reward_amount,
    objective_definition,validator_mapping_status,is_assignable
  )
  SELECT
    'phase6i_' || t.template_id,t.template_version,t.period_type,t.mission_family,
    t.reward_amount,t.objective_definition,'verified',true
  FROM economy_private.mission_template_versions AS t
  WHERE (t.template_id,t.template_version) IN (
    ('learning_step',2),('try_something_different',2),('put_knowledge_to_use',2),
    ('consistent_progress',2),('broaden_your_experience',2),('meaningful_progress',2)
  );

  INSERT INTO economy_private.mission_event_predicate_mappings (
    template_id,template_version,predicate_version,predicate_key,
    source_system,experience_id,activity_id,event_type,validator_version,
    mapping_status,predicate_definition
  )
  SELECT
    'phase6i_' || m.template_id,m.template_version,m.predicate_version,m.predicate_key,
    m.source_system,m.experience_id,m.activity_id,m.event_type,m.validator_version,
    'verified',m.predicate_definition
  FROM economy_private.mission_event_predicate_mappings AS m
  WHERE (m.template_id,m.template_version) IN (
    ('learning_step',2),('try_something_different',2),('put_knowledge_to_use',2),
    ('consistent_progress',2),('broaden_your_experience',2),('meaningful_progress',2)
  );

  UPDATE economy_private.economy_settings
  SET economy_enabled=true,updated_at=clock_timestamp()
  WHERE singleton=true;
END;
$phase6i_setup$;

COMMIT;
