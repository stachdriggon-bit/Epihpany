-- Seed one disposable Auth user for the concurrent wallet contract test.
-- This file is run only against the ephemeral local Supabase stack.
BEGIN;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f1000000-0000-4000-8000-000000000021',
  'authenticated', 'authenticated', 'velorn-concurrency-test@example.invalid',
  '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

UPDATE economy_private.economy_settings
SET economy_enabled = true, updated_at = clock_timestamp()
WHERE singleton = true;

COMMIT;
