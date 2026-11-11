-- Allow a private replacement candidate to coexist with the currently published asset.
alter table public.epiphany_asset_usages
  drop constraint if exists epiphany_asset_usages_owner_type_owner_id_role_key;

create unique index if not exists epiphany_asset_usages_one_published_role_idx
  on public.epiphany_asset_usages (owner_type, owner_id, role)
  where is_published = true;
