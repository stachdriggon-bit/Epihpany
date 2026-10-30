-- Restore the read privileges expected by the published-usage RLS policies.
-- RLS still limits anon to published rows and authenticated users to published rows
-- unless the existing developer-management policy grants broader access.
grant select on table public.epiphany_asset_usages to anon, authenticated;
