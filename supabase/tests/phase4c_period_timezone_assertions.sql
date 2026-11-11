-- Velorn Phase 4C timezone and period-boundary contract. Disposable clean-room DB only.
BEGIN;

DO $$
BEGIN
  IF has_function_privilege('anon', 'public.economy_resolve_mission_period(uuid,text,timestamptz)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.economy_resolve_mission_period(uuid,text,timestamptz)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.economy_resolve_mission_period(uuid,text,timestamptz)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Period resolver must be service-role-only';
  END IF;
END;
$$;

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f4000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'velorn-phase4c-test@example.invalid',
  '', now(), '{}'::jsonb, '{"timezone_name":"America/New_York"}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $$
BEGIN
  BEGIN
    PERFORM * FROM public.economy_resolve_mission_period(
      'f4000000-0000-4000-8000-000000000001', NULL, now()
    );
    RAISE EXCEPTION 'NULL period type was unexpectedly accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;
END;
$$;

DO $$
DECLARE
  v_period record;
BEGIN
  SELECT * INTO v_period
  FROM public.economy_resolve_mission_period(
    'f4000000-0000-4000-8000-000000000001',
    'daily',
    '2026-03-08T12:00:00Z'::timestamptz
  );
  IF v_period.out_timezone_name <> 'America/New_York'
     OR v_period.out_period_key <> 'daily:2026-03-08'
     OR v_period.out_period_start <> '2026-03-08T05:00:00Z'::timestamptz
     OR v_period.out_period_end <> '2026-03-09T04:00:00Z'::timestamptz
     OR extract(epoch FROM (v_period.out_period_end - v_period.out_period_start)) <> 82800 THEN
    RAISE EXCEPTION 'DST spring-forward daily period was not resolved as a 23-hour local day: %', row_to_json(v_period);
  END IF;

  SELECT * INTO v_period
  FROM public.economy_resolve_mission_period(
    'f4000000-0000-4000-8000-000000000001',
    'weekly',
    '2026-03-08T12:00:00Z'::timestamptz
  );
  IF v_period.out_timezone_name <> 'America/New_York'
     OR v_period.out_period_key <> 'weekly:2026-03-07'
     OR v_period.out_period_start <> '2026-03-07T05:00:00Z'::timestamptz
     OR v_period.out_period_end <> '2026-03-14T04:00:00Z'::timestamptz
     OR extract(epoch FROM (v_period.out_period_end - v_period.out_period_start)) <> 601200 THEN
    RAISE EXCEPTION 'Saturday-anchored DST weekly period was not resolved as 167 hours: %', row_to_json(v_period);
  END IF;

  UPDATE auth.users
  SET raw_user_meta_data = '{"timezone_name":"Not/A_Real_Zone"}'::jsonb
  WHERE id = 'f4000000-0000-4000-8000-000000000001';

  SELECT * INTO v_period
  FROM public.economy_resolve_mission_period(
    'f4000000-0000-4000-8000-000000000001',
    'daily',
    '2026-11-11T12:00:00Z'::timestamptz
  );
  IF v_period.out_timezone_name <> 'UTC'
     OR v_period.out_period_key <> 'daily:2026-11-11'
     OR v_period.out_period_start <> '2026-11-11T00:00:00Z'::timestamptz
     OR v_period.out_period_end <> '2026-11-12T00:00:00Z'::timestamptz THEN
    RAISE EXCEPTION 'Invalid timezone metadata did not safely fall back to UTC: %', row_to_json(v_period);
  END IF;
END;
$$;

ROLLBACK;
