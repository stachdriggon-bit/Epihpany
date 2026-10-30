-- Keep published references readable by the public app without exposing internal audit fields.
revoke all on table public.epiphany_asset_usages from anon, authenticated;
grant select (
  asset_id,
  owner_type,
  owner_id,
  role,
  is_published,
  published_bucket,
  published_original_path,
  published_thumbnail_path
) on table public.epiphany_asset_usages to anon, authenticated;
grant insert, update, delete on table public.epiphany_asset_usages to authenticated;
