-- Velorn Phases 6L/6M: authenticated player dashboard read model.
CREATE OR REPLACE FUNCTION economy_private.get_player_dashboard(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_enabled boolean := false;
  v_config jsonb := '{}'::jsonb;
  v_balance bigint := 0;
  v_daily jsonb;
  v_weekly jsonb;
  v_ledger jsonb := '[]'::jsonb;
  v_role text;
BEGIN
  v_role := COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role');
  IF v_role IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Player dashboard reads require the trusted server role.' USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'A verified player is required.' USING ERRCODE = '22023'; END IF;

  SELECT s.economy_enabled, c.config INTO v_enabled, v_config
  FROM economy_private.economy_settings s
  JOIN economy_private.economy_config_versions c ON c.config_version=s.active_config_version
  WHERE s.singleton=true;

  IF NOT FOUND OR v_enabled IS DISTINCT FROM true THEN
    RETURN jsonb_build_object('enabled',false,'currency','Velorn','asOf',clock_timestamp());
  END IF;

  SELECT COALESCE((SELECT w.balance FROM economy_private.wallets w WHERE w.user_id=p_user_id),0)::bigint
    INTO v_balance;

  SELECT jsonb_build_object(
    'boardId',b.board_id::text,'periodStart',b.period_start,'periodEnd',b.period_end,'timezone',b.timezone_name,
    'paidCount',(SELECT count(*)::integer FROM economy_private.mission_reward_claims paid
      JOIN economy_private.mission_assignments pa ON pa.assignment_id=paid.assignment_id
      WHERE pa.board_id=b.board_id AND paid.claim_status='paid'),
    'bonusReward',COALESCE(v_config #>> '{daily_mission,completion_bonus}','0'),
    'bonusClaimStatus',(SELECT bc.claim_status FROM economy_private.mission_reward_claims bc WHERE bc.board_id=b.board_id LIMIT 1),
    'bonusClaimedAt',(SELECT bc.paid_at FROM economy_private.mission_reward_claims bc WHERE bc.board_id=b.board_id LIMIT 1),
    'canClaimBonus',(
      (SELECT count(*)::integer FROM economy_private.mission_reward_claims paid
       JOIN economy_private.mission_assignments pa ON pa.assignment_id=paid.assignment_id
       WHERE pa.board_id=b.board_id AND paid.claim_status='paid')
       >= COALESCE((v_config #>> '{daily_mission,rewarded_mission_limit}')::integer,2147483647)
      AND (SELECT count(*) FROM economy_private.mission_assignments board_rows WHERE board_rows.board_id=b.board_id)
        = COALESCE((v_config #>> '{daily_mission,board_size}')::integer,0)
      AND (SELECT count(*) FROM economy_private.mission_assignments board_rows WHERE board_rows.board_id=b.board_id)
        = COALESCE((v_config #>> '{weekly_mission,board_size}')::integer,0)
      AND NOT EXISTS(SELECT 1 FROM economy_private.mission_reward_claims bc WHERE bc.board_id=b.board_id)),
    'assignments',COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'assignmentId',a.assignment_id::text,'slot',a.slot_number,'templateId',a.template_id,
        'family',t.mission_family,
        'summary',COALESCE(a.objective_snapshot->>'summary',t.objective_definition->>'summary',a.template_id),
        'progress',a.progress_value::text,
        'target',COALESCE(NULLIF(a.objective_snapshot->>'target_count',''),'1'),
        'status',a.assignment_status,'rewardAmount',a.reward_snapshot::text,
        'completedAt',a.completed_at,'claimStatus',c.claim_status,'claimedAt',c.paid_at,
        'canClaim',(
          a.assignment_status='completed'
          AND c.claim_id IS NULL
          AND t.is_assignable
          AND t.validator_mapping_status='verified'
          AND t.period_type=b.period_type
          AND a.reward_snapshot=t.reward_amount
          AND a.reward_snapshot=CASE b.period_type
            WHEN 'daily' THEN COALESCE((v_config #>> '{daily_mission,per_mission}')::bigint,0)
            ELSE COALESCE((v_config #>> '{weekly_mission,per_mission}')::bigint,0)
          END
          AND (SELECT count(*) FROM economy_private.mission_assignments board_rows
               WHERE board_rows.board_id=b.board_id)=CASE b.period_type
            WHEN 'daily' THEN COALESCE((v_config #>> '{daily_mission,board_size}')::integer,0)
            ELSE COALESCE((v_config #>> '{weekly_mission,board_size}')::integer,0)
          END
          AND (SELECT count(*) FROM economy_private.mission_reward_claims paid
               JOIN economy_private.mission_assignments pa ON pa.assignment_id=paid.assignment_id
               WHERE pa.board_id=b.board_id AND paid.claim_status='paid')<CASE b.period_type
            WHEN 'daily' THEN COALESCE((v_config #>> '{daily_mission,rewarded_mission_limit}')::integer,0)
            ELSE COALESCE((v_config #>> '{weekly_mission,board_size}')::integer,0)
          END
        )
      ) ORDER BY a.slot_number)
      FROM economy_private.mission_assignments a
      JOIN economy_private.mission_template_versions t ON t.template_id=a.template_id AND t.template_version=a.template_version
      LEFT JOIN economy_private.mission_reward_claims c ON c.assignment_id=a.assignment_id
      WHERE a.board_id=b.board_id AND a.user_id=p_user_id
    ),'[]'::jsonb)
  ) INTO v_daily
  FROM economy_private.mission_boards b
  WHERE b.user_id=p_user_id AND b.period_type='daily'
    AND b.period_start<=clock_timestamp() AND b.period_end>clock_timestamp()
  ORDER BY b.period_start DESC LIMIT 1;

  SELECT jsonb_build_object(
    'boardId',b.board_id::text,'periodStart',b.period_start,'periodEnd',b.period_end,'timezone',b.timezone_name,
    'paidCount',(SELECT count(*)::integer FROM economy_private.mission_reward_claims paid
      JOIN economy_private.mission_assignments pa ON pa.assignment_id=paid.assignment_id
      WHERE pa.board_id=b.board_id AND paid.claim_status='paid'),
    'bonusReward',COALESCE(v_config #>> '{weekly_mission,completion_bonus}','0'),
    'bonusClaimStatus',(SELECT bc.claim_status FROM economy_private.mission_reward_claims bc WHERE bc.board_id=b.board_id LIMIT 1),
    'bonusClaimedAt',(SELECT bc.paid_at FROM economy_private.mission_reward_claims bc WHERE bc.board_id=b.board_id LIMIT 1),
    'canClaimBonus',(
      (SELECT count(*)::integer FROM economy_private.mission_reward_claims paid
       JOIN economy_private.mission_assignments pa ON pa.assignment_id=paid.assignment_id
       WHERE pa.board_id=b.board_id AND paid.claim_status='paid')
       >= COALESCE((v_config #>> '{weekly_mission,board_size}')::integer,2147483647)
      AND NOT EXISTS(SELECT 1 FROM economy_private.mission_reward_claims bc WHERE bc.board_id=b.board_id)),
    'assignments',COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'assignmentId',a.assignment_id::text,'slot',a.slot_number,'templateId',a.template_id,
        'family',t.mission_family,
        'summary',COALESCE(a.objective_snapshot->>'summary',t.objective_definition->>'summary',a.template_id),
        'progress',a.progress_value::text,
        'target',COALESCE(NULLIF(a.objective_snapshot->>'target_count',''),'1'),
        'status',a.assignment_status,'rewardAmount',a.reward_snapshot::text,
        'completedAt',a.completed_at,'claimStatus',c.claim_status,'claimedAt',c.paid_at,
        'canClaim',(
          a.assignment_status='completed'
          AND c.claim_id IS NULL
          AND t.is_assignable
          AND t.validator_mapping_status='verified'
          AND t.period_type=b.period_type
          AND a.reward_snapshot=t.reward_amount
          AND a.reward_snapshot=CASE b.period_type
            WHEN 'daily' THEN COALESCE((v_config #>> '{daily_mission,per_mission}')::bigint,0)
            ELSE COALESCE((v_config #>> '{weekly_mission,per_mission}')::bigint,0)
          END
          AND (SELECT count(*) FROM economy_private.mission_assignments board_rows
               WHERE board_rows.board_id=b.board_id)=CASE b.period_type
            WHEN 'daily' THEN COALESCE((v_config #>> '{daily_mission,board_size}')::integer,0)
            ELSE COALESCE((v_config #>> '{weekly_mission,board_size}')::integer,0)
          END
          AND (SELECT count(*) FROM economy_private.mission_reward_claims paid
               JOIN economy_private.mission_assignments pa ON pa.assignment_id=paid.assignment_id
               WHERE pa.board_id=b.board_id AND paid.claim_status='paid')<CASE b.period_type
            WHEN 'daily' THEN COALESCE((v_config #>> '{daily_mission,rewarded_mission_limit}')::integer,0)
            ELSE COALESCE((v_config #>> '{weekly_mission,board_size}')::integer,0)
          END
        )
      ) ORDER BY a.slot_number)
      FROM economy_private.mission_assignments a
      JOIN economy_private.mission_template_versions t ON t.template_id=a.template_id AND t.template_version=a.template_version
      LEFT JOIN economy_private.mission_reward_claims c ON c.assignment_id=a.assignment_id
      WHERE a.board_id=b.board_id AND a.user_id=p_user_id
    ),'[]'::jsonb)
  ) INTO v_weekly
  FROM economy_private.mission_boards b
  WHERE b.user_id=p_user_id AND b.period_type='weekly'
    AND b.period_start<=clock_timestamp() AND b.period_end>clock_timestamp()
  ORDER BY b.period_start DESC LIMIT 1;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'entryId',recent.entry_id::text,'amount',recent.amount::text,
    'transactionType',recent.transaction_type,'reason',recent.reason,'createdAt',recent.created_at
  ) ORDER BY recent.created_at DESC,recent.entry_id DESC),'[]'::jsonb) INTO v_ledger
  FROM (
    SELECT l.entry_id,l.amount,l.transaction_type,l.reason,l.created_at
    FROM economy_private.wallet_ledger l WHERE l.user_id=p_user_id
    ORDER BY l.created_at DESC,l.entry_id DESC LIMIT 5
  ) recent;

  RETURN jsonb_build_object('enabled',true,'currency','Velorn','balance',v_balance::text,
    'ledger',v_ledger,'daily',v_daily,'weekly',v_weekly,'asOf',clock_timestamp());
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_get_player_dashboard(p_user_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path = ''
AS $$ SELECT economy_private.get_player_dashboard(p_user_id); $$;

REVOKE ALL ON FUNCTION economy_private.get_player_dashboard(uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION economy_private.get_player_dashboard(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.economy_get_player_dashboard(uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.economy_get_player_dashboard(uuid) TO service_role;

COMMENT ON FUNCTION public.economy_get_player_dashboard(uuid) IS
  'Service-role-only player dashboard read model. The Edge Function derives p_user_id from verified Auth. Disabled economy returns no wallet or mission data.';
