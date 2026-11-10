-- Velorn Phase 1: private wallet and append-only ledger foundation.
-- No player-facing API, automatic grants, or enabled economy is introduced here.
-- The economy remains disabled until a later, explicitly approved rollout.

CREATE SCHEMA IF NOT EXISTS economy_private AUTHORIZATION postgres;
COMMENT ON SCHEMA economy_private IS
  'Private server-side economy data. Keep this schema out of Supabase Data API exposed schemas.';

REVOKE ALL ON SCHEMA economy_private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA economy_private TO service_role;

CREATE TABLE economy_private.economy_config_versions (
  config_version smallint PRIMARY KEY CHECK (config_version > 0),
  config jsonb NOT NULL CHECK (
    jsonb_typeof(config) = 'object'
    AND octet_length(config::text) <= 16384
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE economy_private.economy_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  economy_enabled boolean NOT NULL DEFAULT false,
  active_config_version smallint NOT NULL
    REFERENCES economy_private.economy_config_versions(config_version),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO economy_private.economy_config_versions (config_version, config)
VALUES (
  1,
  '{
    "currency": "Velorn",
    "wallet_enabled": false,
    "rewards_enabled": false,
    "card_portal_enabled": false,
    "daily_mission": {
      "per_mission": 10,
      "completion_bonus": 10,
      "rewarded_mission_limit": 3,
      "board_size": 4
    },
    "weekly_mission": {
      "per_mission": 20,
      "completion_bonus": 40,
      "board_size": 3
    },
    "card_portal_prices": {
      "ordinary_draw": 50,
      "premium_draw": 150
    }
  }'::jsonb
);

INSERT INTO economy_private.economy_settings (
  singleton, economy_enabled, active_config_version
)
VALUES (true, false, 1);

CREATE TABLE economy_private.wallets (
  wallet_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE
    REFERENCES auth.users(id) ON DELETE RESTRICT,
  balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
  version bigint NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE economy_private.wallet_ledger (
  entry_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL
    REFERENCES economy_private.wallets(wallet_id) ON DELETE RESTRICT,
  user_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount bigint NOT NULL CHECK (amount <> 0),
  balance_after bigint NOT NULL CHECK (balance_after >= 0),
  transaction_type text NOT NULL
    CHECK (transaction_type IN ('credit', 'debit', 'adjustment')),
  source_type text NOT NULL
    CHECK (source_type ~ '^[a-z][a-z0-9_]{1,39}$'),
  source_reference text NOT NULL
    CHECK (char_length(source_reference) BETWEEN 1 AND 200),
  idempotency_key uuid NOT NULL,
  config_version smallint NOT NULL
    REFERENCES economy_private.economy_config_versions(config_version),
  reason text NOT NULL
    CHECK (char_length(reason) BETWEEN 1 AND 240),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (
      jsonb_typeof(metadata) = 'object'
      AND octet_length(metadata::text) <= 8192
    ),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wallet_ledger_transaction_direction_check CHECK (
    (transaction_type = 'credit' AND amount > 0)
    OR (transaction_type = 'debit' AND amount < 0)
    OR (transaction_type = 'adjustment' AND amount <> 0)
  ),
  CONSTRAINT wallet_ledger_user_idempotency_key UNIQUE (user_id, idempotency_key)
);

CREATE INDEX wallet_ledger_user_created_idx
  ON economy_private.wallet_ledger (user_id, created_at DESC, entry_id DESC);
CREATE INDEX wallet_ledger_source_reference_idx
  ON economy_private.wallet_ledger (source_type, source_reference);

ALTER TABLE economy_private.economy_config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.economy_config_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.economy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.economy_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.wallets FORCE ROW LEVEL SECURITY;
ALTER TABLE economy_private.wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_private.wallet_ledger FORCE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA economy_private
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION economy_private.reject_immutable_row_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'This economy record is immutable; append a compensating record instead.'
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER wallet_ledger_append_only
  BEFORE UPDATE OR DELETE ON economy_private.wallet_ledger
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();

CREATE TRIGGER economy_config_versions_immutable
  BEFORE UPDATE OR DELETE ON economy_private.economy_config_versions
  FOR EACH ROW EXECUTE FUNCTION economy_private.reject_immutable_row_change();

CREATE OR REPLACE FUNCTION economy_private.post_wallet_transaction(
  p_user_id uuid,
  p_amount bigint,
  p_transaction_type text,
  p_source_type text,
  p_source_reference text,
  p_idempotency_key uuid,
  p_reason text,
  p_config_version smallint DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  entry_id uuid,
  wallet_id uuid,
  user_id uuid,
  amount bigint,
  balance_after bigint,
  transaction_type text,
  source_type text,
  source_reference text,
  idempotency_key uuid,
  config_version smallint,
  reason text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_existing economy_private.wallet_ledger%ROWTYPE;
  v_settings economy_private.economy_settings%ROWTYPE;
  v_wallet_id uuid;
  v_balance bigint;
  v_new_balance bigint;
  v_config_version smallint;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Wallet transactions require the trusted server role.'
      USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'A player and idempotency key are required.'
      USING ERRCODE = '22023';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Wallet transaction amount must be non-zero.'
      USING ERRCODE = '22023';
  END IF;
  IF p_transaction_type NOT IN ('credit', 'debit', 'adjustment')
     OR (p_transaction_type = 'credit' AND p_amount < 0)
     OR (p_transaction_type = 'debit' AND p_amount > 0) THEN
    RAISE EXCEPTION 'Transaction type and signed amount do not agree.'
      USING ERRCODE = '22023';
  END IF;
  IF p_source_type IS NULL OR p_source_type !~ '^[a-z][a-z0-9_]{1,39}$'
     OR p_source_reference IS NULL
     OR char_length(p_source_reference) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'A valid source type and stable source reference are required.'
      USING ERRCODE = '22023';
  END IF;
  IF p_reason IS NULL OR char_length(p_reason) NOT BETWEEN 1 AND 240
     OR p_metadata IS NULL OR jsonb_typeof(p_metadata) <> 'object'
     OR octet_length(p_metadata::text) > 8192 THEN
    RAISE EXCEPTION 'Transaction reason or metadata is invalid.'
      USING ERRCODE = '22023';
  END IF;

  -- Fast idempotent replay path. A reused key with a different payload is rejected.
  SELECT l.* INTO v_existing
  FROM economy_private.wallet_ledger AS l
  WHERE l.user_id = p_user_id
    AND l.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    IF v_existing.amount <> p_amount
       OR v_existing.transaction_type <> p_transaction_type
       OR v_existing.source_type <> p_source_type
       OR v_existing.source_reference <> p_source_reference
       OR v_existing.reason <> p_reason
       OR v_existing.metadata <> p_metadata
       OR (p_config_version IS NOT NULL AND v_existing.config_version <> p_config_version) THEN
      RAISE EXCEPTION 'Idempotency key was already used for a different transaction.'
        USING ERRCODE = '22023';
    END IF;
    RETURN QUERY
      SELECT l.entry_id, l.wallet_id, l.user_id, l.amount, l.balance_after,
             l.transaction_type, l.source_type, l.source_reference,
             l.idempotency_key, l.config_version, l.reason, l.metadata, l.created_at
      FROM economy_private.wallet_ledger AS l
      WHERE l.entry_id = v_existing.entry_id;
    RETURN;
  END IF;

  -- Serialize against an administrative feature-flag change.
  SELECT s.* INTO v_settings
  FROM economy_private.economy_settings AS s
  WHERE s.singleton = true
  FOR SHARE;

  IF NOT FOUND OR NOT v_settings.economy_enabled THEN
    RAISE EXCEPTION 'Velorn economy is disabled.'
      USING ERRCODE = '55000';
  END IF;

  v_config_version := COALESCE(p_config_version, v_settings.active_config_version);
  IF NOT EXISTS (
    SELECT 1
    FROM economy_private.economy_config_versions AS c
    WHERE c.config_version = v_config_version
  ) THEN
    RAISE EXCEPTION 'Unknown economy configuration version.'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO economy_private.wallets (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT w.wallet_id, w.balance
    INTO v_wallet_id, v_balance
  FROM economy_private.wallets AS w
  WHERE w.user_id = p_user_id
  FOR UPDATE;

  -- The wallet lock serializes same-player requests, including identical concurrent keys.
  SELECT l.* INTO v_existing
  FROM economy_private.wallet_ledger AS l
  WHERE l.user_id = p_user_id
    AND l.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    IF v_existing.amount <> p_amount
       OR v_existing.transaction_type <> p_transaction_type
       OR v_existing.source_type <> p_source_type
       OR v_existing.source_reference <> p_source_reference
       OR v_existing.reason <> p_reason
       OR v_existing.metadata <> p_metadata
       OR (p_config_version IS NOT NULL AND v_existing.config_version <> p_config_version) THEN
      RAISE EXCEPTION 'Idempotency key was already used for a different transaction.'
        USING ERRCODE = '22023';
    END IF;
    RETURN QUERY
      SELECT l.entry_id, l.wallet_id, l.user_id, l.amount, l.balance_after,
             l.transaction_type, l.source_type, l.source_reference,
             l.idempotency_key, l.config_version, l.reason, l.metadata, l.created_at
      FROM economy_private.wallet_ledger AS l
      WHERE l.entry_id = v_existing.entry_id;
    RETURN;
  END IF;

  v_new_balance := v_balance + p_amount;
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient Velorn balance.'
      USING ERRCODE = '23514';
  END IF;

  UPDATE economy_private.wallets AS w
  SET balance = v_new_balance,
      version = w.version + 1,
      updated_at = clock_timestamp()
  WHERE w.wallet_id = v_wallet_id;

  INSERT INTO economy_private.wallet_ledger (
    wallet_id, user_id, amount, balance_after, transaction_type,
    source_type, source_reference, idempotency_key, config_version,
    reason, metadata
  )
  VALUES (
    v_wallet_id, p_user_id, p_amount, v_new_balance, p_transaction_type,
    p_source_type, p_source_reference, p_idempotency_key, v_config_version,
    p_reason, p_metadata
  )
  RETURNING wallet_ledger.entry_id INTO entry_id;

  RETURN QUERY
    SELECT l.entry_id, l.wallet_id, l.user_id, l.amount, l.balance_after,
           l.transaction_type, l.source_type, l.source_reference,
           l.idempotency_key, l.config_version, l.reason, l.metadata, l.created_at
    FROM economy_private.wallet_ledger AS l
    WHERE l.entry_id = post_wallet_transaction.entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION economy_private.get_wallet_snapshot(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  balance bigint,
  version bigint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Wallet reads require the trusted server role.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT w.user_id, w.balance, w.version, w.created_at, w.updated_at
    FROM economy_private.wallets AS w
    WHERE w.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION economy_private.reconcile_wallets()
RETURNS TABLE (
  wallet_id uuid,
  user_id uuid,
  stored_balance bigint,
  ledger_balance bigint,
  difference bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Wallet reconciliation requires the trusted server role.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT w.wallet_id,
           w.user_id,
           w.balance,
           COALESCE(SUM(l.amount), 0)::bigint,
           w.balance - COALESCE(SUM(l.amount), 0)::bigint
    FROM economy_private.wallets AS w
    LEFT JOIN economy_private.wallet_ledger AS l
      ON l.wallet_id = w.wallet_id
     AND l.user_id = w.user_id
    GROUP BY w.wallet_id, w.user_id, w.balance
    HAVING w.balance <> COALESCE(SUM(l.amount), 0)::bigint;
END;
$$;

-- Public-schema wrappers are SECURITY INVOKER and callable only with the server role.
-- They do not expose wallet tables or grant players a balance/read path.
CREATE OR REPLACE FUNCTION public.economy_post_wallet_transaction(
  p_user_id uuid,
  p_amount bigint,
  p_transaction_type text,
  p_source_type text,
  p_source_reference text,
  p_idempotency_key uuid,
  p_reason text,
  p_config_version smallint DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  entry_id uuid,
  wallet_id uuid,
  user_id uuid,
  amount bigint,
  balance_after bigint,
  transaction_type text,
  source_type text,
  source_reference text,
  idempotency_key uuid,
  config_version smallint,
  reason text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT *
  FROM economy_private.post_wallet_transaction(
    p_user_id, p_amount, p_transaction_type, p_source_type,
    p_source_reference, p_idempotency_key, p_reason,
    p_config_version, p_metadata
  );
$$;

CREATE OR REPLACE FUNCTION public.economy_get_wallet_snapshot(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  balance bigint,
  version bigint,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT *
  FROM economy_private.get_wallet_snapshot(p_user_id);
$$;

CREATE OR REPLACE FUNCTION public.economy_reconcile_wallets()
RETURNS TABLE (
  wallet_id uuid,
  user_id uuid,
  stored_balance bigint,
  ledger_balance bigint,
  difference bigint
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT *
  FROM economy_private.reconcile_wallets();
$$;

-- Remove PostgreSQL's default PUBLIC function execution, then grant only the
-- three narrow server-side operations. service_role has no direct table rights.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA economy_private
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION economy_private.post_wallet_transaction(
  uuid, bigint, text, text, text, uuid, text, smallint, jsonb
) TO service_role;
GRANT EXECUTE ON FUNCTION economy_private.get_wallet_snapshot(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION economy_private.reconcile_wallets() TO service_role;

REVOKE ALL ON FUNCTION public.economy_post_wallet_transaction(
  uuid, bigint, text, text, text, uuid, text, smallint, jsonb
) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.economy_get_wallet_snapshot(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.economy_reconcile_wallets()
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.economy_post_wallet_transaction(
  uuid, bigint, text, text, text, uuid, text, smallint, jsonb
) TO service_role;
GRANT EXECUTE ON FUNCTION public.economy_get_wallet_snapshot(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.economy_reconcile_wallets() TO service_role;
