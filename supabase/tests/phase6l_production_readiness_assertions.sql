-- Phase 6L: production-readiness gate and recovery invariants. Rollback-only.
BEGIN;
SELECT set_config('request.jwt.claim.role','service_role',true);
SELECT set_config('request.jwt.claims','{"role":"service_role"}',true);
DO $phase6l$
DECLARE v_enabled boolean; v_dashboard jsonb; v_function text := 'public.economy_get_player_dashboard(uuid)';
BEGIN
  SELECT economy_enabled INTO v_enabled FROM economy_private.economy_settings WHERE singleton=true;
  IF v_enabled IS DISTINCT FROM false THEN RAISE EXCEPTION 'Phase 6L requires the economy to start disabled'; END IF;
  -- Phase 6I deliberately retains synthetic board fixtures; financial rows must remain absent.
  IF (SELECT count(*) FROM economy_private.wallets)<>0
     OR (SELECT count(*) FROM economy_private.wallet_ledger)<>0
     OR (SELECT count(*) FROM economy_private.mission_reward_claims)<>0
     OR (SELECT count(*) FROM economy_private.achievement_awards)<>0 THEN
    RAISE EXCEPTION 'Readiness baseline must contain no wallet, ledger, claim, or award data';
  END IF;
  IF has_function_privilege('anon',v_function,'EXECUTE')
     OR has_function_privilege('authenticated',v_function,'EXECUTE')
     OR NOT has_function_privilege('service_role',v_function,'EXECUTE') THEN
    RAISE EXCEPTION 'Dashboard RPC must be callable only by service_role';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='economy_private' AND p.proname='get_player_dashboard'
      AND p.prosecdef AND p.proconfig @> ARRAY['search_path=""']
  ) THEN RAISE EXCEPTION 'Private dashboard must be SECURITY DEFINER with an empty search_path'; END IF;
  IF EXISTS (SELECT 1 FROM public.economy_reconcile_wallets()) THEN
    RAISE EXCEPTION 'Wallet-to-ledger reconciliation must be clean before readiness';
  END IF;
  v_dashboard := public.economy_get_player_dashboard('f6d00000-0000-4000-8000-000000000099'::uuid);
  IF v_dashboard->>'enabled' IS DISTINCT FROM 'false'
     OR v_dashboard ? 'balance' OR v_dashboard ? 'daily'
     OR v_dashboard ? 'weekly' OR v_dashboard ? 'ledger' THEN
    RAISE EXCEPTION 'Disabled dashboard exposed wallet or mission data: %',v_dashboard;
  END IF;
  UPDATE economy_private.economy_settings SET economy_enabled=false,updated_at=clock_timestamp() WHERE singleton=true;
  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Economy gate must remain disabled';
  END IF;
END;
$phase6l$;
ROLLBACK;
