-- Phase 1 wallet/ledger contract tests. Run only on the disposable local Supabase stack.
BEGIN;

DO $$
DECLARE
  v_count integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'economy_private') THEN
    RAISE EXCEPTION 'Private economy schema is missing';
  END IF;

  IF has_schema_privilege('anon', 'economy_private', 'USAGE')
     OR has_schema_privilege('authenticated', 'economy_private', 'USAGE') THEN
    RAISE EXCEPTION 'Untrusted roles must not have private economy schema usage';
  END IF;
  IF NOT has_schema_privilege('service_role', 'economy_private', 'USAGE') THEN
    RAISE EXCEPTION 'Trusted server role must have private schema usage';
  END IF;

  SELECT count(*) INTO v_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'economy_private'
    AND c.relkind = 'r'
    AND c.relname IN (
      'economy_config_versions', 'economy_settings', 'wallets', 'wallet_ledger'
    )
    AND c.relrowsecurity
    AND c.relforcerowsecurity;
  IF v_count <> 4 THEN
    RAISE EXCEPTION 'Expected RLS and FORCE RLS on all four private tables; found %', v_count;
  END IF;

  IF has_table_privilege('anon', 'economy_private.wallets', 'SELECT')
     OR has_table_privilege('authenticated', 'economy_private.wallets', 'SELECT')
     OR has_table_privilege('service_role', 'economy_private.wallets', 'SELECT')
     OR has_table_privilege('anon', 'economy_private.wallet_ledger', 'INSERT')
     OR has_table_privilege('authenticated', 'economy_private.wallet_ledger', 'INSERT')
     OR has_table_privilege('service_role', 'economy_private.wallet_ledger', 'INSERT')
     OR has_table_privilege('authenticated', 'economy_private.wallet_ledger', 'UPDATE')
     OR has_table_privilege('authenticated', 'economy_private.wallet_ledger', 'DELETE') THEN
    RAISE EXCEPTION 'Direct table access must remain revoked for all API roles';
  END IF;

  IF has_function_privilege(
       'anon',
       'public.economy_post_wallet_transaction(uuid,bigint,text,text,text,uuid,text,smallint,jsonb)',
       'EXECUTE'
     )
     OR has_function_privilege(
       'authenticated',
       'public.economy_post_wallet_transaction(uuid,bigint,text,text,text,uuid,text,smallint,jsonb)',
       'EXECUTE'
     )
     OR NOT has_function_privilege(
       'service_role',
       'public.economy_post_wallet_transaction(uuid,bigint,text,text,text,uuid,text,smallint,jsonb)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'Wallet writer must be callable only by service_role';
  END IF;

  IF has_function_privilege('anon', 'public.economy_get_wallet_snapshot(uuid)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.economy_get_wallet_snapshot(uuid)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.economy_get_wallet_snapshot(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Wallet snapshot must be callable only by service_role';
  END IF;

  IF has_function_privilege('anon', 'public.economy_reconcile_wallets()', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.economy_reconcile_wallets()', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.economy_reconcile_wallets()', 'EXECUTE') THEN
    RAISE EXCEPTION 'Wallet reconciliation must be callable only by service_role';
  END IF;

  IF to_regclass('public.wallets') IS NOT NULL
     OR to_regclass('public.wallet_ledger') IS NOT NULL THEN
    RAISE EXCEPTION 'Wallet tables must not be created in the exposed public schema';
  END IF;

  IF (SELECT economy_enabled FROM economy_private.economy_settings WHERE singleton)
     IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Economy must start disabled';
  END IF;
  IF (SELECT count(*) FROM economy_private.economy_config_versions) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one initial immutable config version';
  END IF;
  IF (SELECT count(*) FROM economy_private.wallets) <> 0
     OR (SELECT count(*) FROM economy_private.wallet_ledger) <> 0 THEN
    RAISE EXCEPTION 'Phase 1 must not create player wallets or balances automatically';
  END IF;

  SELECT count(*) INTO v_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'economy_private'
    AND NOT t.tgisinternal
    AND (
      (c.relname = 'wallet_ledger' AND t.tgname = 'wallet_ledger_append_only')
      OR (c.relname = 'economy_config_versions' AND t.tgname = 'economy_config_versions_immutable')
    );
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'Append-only protections are missing';
  END IF;
END;
$$;

-- A synthetic Auth identity is used only inside this rolled-back test transaction.
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  'f1000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'velorn-phase1-test@example.invalid',
  '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
);

SELECT set_config('request.jwt.claim.role', 'service_role', true);

DO $$
DECLARE
  v_user_id constant uuid := 'f1000000-0000-4000-8000-000000000001';
  v_balance bigint;
  v_count integer;
  v_first_entry uuid;
  v_replay_entry uuid;
BEGIN
  -- Disabled economy rejects writes before even creating an empty wallet.
  BEGIN
    PERFORM 1 FROM public.economy_post_wallet_transaction(
      v_user_id, 100, 'credit', 'test', 'disabled-write',
      'f1000000-0000-4000-8000-000000000011', 'disabled test', NULL, '{}'::jsonb
    );
    RAISE EXCEPTION 'Expected disabled wallet operation to fail' USING ERRCODE = 'P0001';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  IF (SELECT count(*) FROM economy_private.wallets WHERE user_id = v_user_id) <> 0 THEN
    RAISE EXCEPTION 'Disabled operation created a wallet';
  END IF;

  UPDATE economy_private.economy_settings
  SET economy_enabled = true, updated_at = clock_timestamp()
  WHERE singleton = true;

  SELECT p.entry_id, p.balance_after INTO v_first_entry, v_balance
  FROM public.economy_post_wallet_transaction(
    v_user_id, 100, 'credit', 'test', 'phase1-credit',
    'f1000000-0000-4000-8000-000000000012', 'Phase 1 credit test', NULL, '{"test":true}'::jsonb
  ) AS p;

  IF v_balance <> 100 THEN
    RAISE EXCEPTION 'Credit should produce 100 Velorn, got %', v_balance;
  END IF;

  SELECT p.entry_id, p.balance_after INTO v_replay_entry, v_balance
  FROM public.economy_post_wallet_transaction(
    v_user_id, 100, 'credit', 'test', 'phase1-credit',
    'f1000000-0000-4000-8000-000000000012', 'Phase 1 credit test', NULL, '{"test":true}'::jsonb
  ) AS p;

  IF v_balance <> 100 OR v_replay_entry <> v_first_entry THEN
    RAISE EXCEPTION 'Idempotent replay must return the original ledger entry and balance';
  END IF;

  BEGIN
    PERFORM 1 FROM public.economy_post_wallet_transaction(
      v_user_id, 101, 'credit', 'test', 'phase1-credit',
      'f1000000-0000-4000-8000-000000000012', 'Phase 1 credit test', NULL, '{"test":true}'::jsonb
    );
    RAISE EXCEPTION 'Expected mismatched idempotency payload to fail' USING ERRCODE = 'P0001';
  EXCEPTION WHEN SQLSTATE '22023' THEN
    NULL;
  END;

  SELECT p.balance_after INTO v_balance
  FROM public.economy_post_wallet_transaction(
    v_user_id, -40, 'debit', 'test', 'phase1-debit',
    'f1000000-0000-4000-8000-000000000013', 'Phase 1 debit test', NULL, '{}'::jsonb
  ) AS p;

  IF v_balance <> 60 THEN
    RAISE EXCEPTION 'Debit should leave 60 Velorn, got %', v_balance;
  END IF;

  SELECT p.balance_after INTO v_balance
  FROM public.economy_post_wallet_transaction(
    v_user_id, -40, 'debit', 'test', 'phase1-debit',
    'f1000000-0000-4000-8000-000000000013', 'Phase 1 debit test', NULL, '{}'::jsonb
  ) AS p;

  IF v_balance <> 60 THEN
    RAISE EXCEPTION 'Repeated debit must not debit twice';
  END IF;

  BEGIN
    PERFORM 1 FROM public.economy_post_wallet_transaction(
      v_user_id, -61, 'debit', 'test', 'insufficient-debit',
      'f1000000-0000-4000-8000-000000000014', 'Insufficient debit test', NULL, '{}'::jsonb
    );
    RAISE EXCEPTION 'Expected insufficient balance to fail' USING ERRCODE = 'P0001';
  EXCEPTION WHEN SQLSTATE '23514' THEN
    NULL;
  END;

  SELECT s.balance INTO v_balance
  FROM public.economy_get_wallet_snapshot(v_user_id) AS s;
  IF v_balance <> 60 THEN
    RAISE EXCEPTION 'Failed debit changed the wallet balance';
  END IF;

  SELECT count(*) INTO v_count
  FROM economy_private.wallet_ledger
  WHERE user_id = v_user_id;
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'Expected exactly two committed ledger entries, got %', v_count;
  END IF;

  SELECT count(*) INTO v_count FROM public.economy_reconcile_wallets();
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'Wallet reconciliation found % mismatch(es)', v_count;
  END IF;

  BEGIN
    UPDATE economy_private.wallet_ledger
    SET reason = 'tampered'
    WHERE entry_id = v_first_entry;
    RAISE EXCEPTION 'Expected ledger UPDATE to be blocked' USING ERRCODE = 'P0001';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  BEGIN
    DELETE FROM economy_private.wallet_ledger WHERE entry_id = v_first_entry;
    RAISE EXCEPTION 'Expected ledger DELETE to be blocked' USING ERRCODE = 'P0001';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  UPDATE economy_private.economy_settings
  SET economy_enabled = false, updated_at = clock_timestamp()
  WHERE singleton = true;

  BEGIN
    PERFORM 1 FROM public.economy_post_wallet_transaction(
      v_user_id, 25, 'credit', 'test', 'disabled-after-write',
      'f1000000-0000-4000-8000-000000000015', 'Disabled after write test', NULL, '{}'::jsonb
    );
    RAISE EXCEPTION 'Expected disabled economy to reject a new transaction' USING ERRCODE = 'P0001';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  SELECT s.balance INTO v_balance
  FROM public.economy_get_wallet_snapshot(v_user_id) AS s;
  IF v_balance <> 60 THEN
    RAISE EXCEPTION 'Disabled economy changed the wallet balance';
  END IF;
END;
$$;

ROLLBACK;
