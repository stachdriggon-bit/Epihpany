-- Velorn Phase 4C: account timezone policy and DST-safe period resolution.
-- Timezone is a validated account preference stored in Supabase Auth user metadata.
-- The browser may suggest its IANA timezone; the server validates it before use.
-- This migration does not generate boards, assign missions, or enable the economy.

CREATE OR REPLACE FUNCTION public.economy_resolve_mission_period(
  p_user_id uuid,
  p_period_type text,
  p_reference timestamptz DEFAULT clock_timestamp()
)
RETURNS TABLE (
  out_timezone_name text,
  out_period_key text,
  out_period_start timestamptz,
  out_period_end timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_timezone text;
  v_local_reference timestamp without time zone;
  v_local_start timestamp without time zone;
  v_local_end timestamp without time zone;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Mission period resolution requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL OR p_period_type NOT IN ('daily', 'weekly') OR p_reference IS NULL THEN
    RAISE EXCEPTION 'A player, supported period type, and reference time are required.'
      USING ERRCODE = '22023';
  END IF;

  SELECT u.raw_user_meta_data ->> 'timezone_name'
    INTO v_timezone
  FROM auth.users AS u
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The player account was not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Never trust client metadata as a timezone until it matches PostgreSQL's IANA catalog.
  IF v_timezone IS NULL OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_timezone_names AS z WHERE z.name = v_timezone
  ) THEN
    v_timezone := 'UTC';
  END IF;

  v_local_reference := p_reference AT TIME ZONE v_timezone;

  IF p_period_type = 'daily' THEN
    v_local_start := date_trunc('day', v_local_reference);
    v_local_end := v_local_start + interval '1 day';
  ELSE
    -- PostgreSQL DOW: Sunday=0 ... Saturday=6. Saturday is the weekly anchor.
    v_local_start := (
      v_local_reference::date
      - ((extract(dow FROM v_local_reference)::integer + 1) % 7)
    )::timestamp without time zone;
    v_local_end := v_local_start + interval '7 days';
  END IF;

  RETURN QUERY
  SELECT
    v_timezone,
    p_period_type || ':' || to_char(v_local_start::date, 'YYYY-MM-DD'),
    v_local_start AT TIME ZONE v_timezone,
    v_local_end AT TIME ZONE v_timezone;
END;
$$;

REVOKE ALL ON FUNCTION public.economy_resolve_mission_period(uuid, text, timestamptz)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.economy_resolve_mission_period(uuid, text, timestamptz)
  TO service_role;

COMMENT ON FUNCTION public.economy_resolve_mission_period(uuid, text, timestamptz) IS
  'Service-role-only DST-safe period resolver. Daily periods begin at account-local midnight; weekly periods begin Saturday at account-local midnight. Invalid/missing IANA timezone metadata falls back to UTC. Returns UTC instants and a stable local period key.';
