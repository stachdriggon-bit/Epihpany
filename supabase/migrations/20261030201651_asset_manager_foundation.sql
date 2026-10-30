-- EPIPHANY Asset Manager foundation.
-- Additive only: existing character-art objects and URLs are not modified.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('epiphany-assets-private','epiphany-assets-private',false,12582912,array['image/png','image/jpeg','image/webp']::text[])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('epiphany-assets','epiphany-assets',true,12582912,array['image/png','image/jpeg','image/webp']::text[])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create table if not exists public.epiphany_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null default 'image',
  category text not null check (category in ('characters','stories','world','cards','interface','other')),
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 12582912),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  status text not null default 'unassigned' check (status in ('unassigned','linked','published','issue','archived')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.epiphany_asset_files (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.epiphany_assets(id) on delete cascade,
  variant text not null check (variant in ('original','thumbnail','preview')),
  bucket_id text not null,
  object_path text not null check (char_length(object_path) between 1 and 1024),
  visibility text not null check (visibility in ('private','public')),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  size_bytes bigint not null check (size_bytes > 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);

create index if not exists epiphany_assets_category_status_created_idx on public.epiphany_assets (category, status, created_at desc);
create index if not exists epiphany_asset_files_asset_variant_idx on public.epiphany_asset_files (asset_id, variant);
create index if not exists epiphany_asset_files_bucket_path_idx on public.epiphany_asset_files (bucket_id, object_path);

create table if not exists public.epiphany_asset_usages (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.epiphany_assets(id) on delete restrict,
  owner_type text not null check (char_length(owner_type) between 1 and 40),
  owner_id text not null check (char_length(owner_id) between 1 and 120),
  role text not null check (char_length(role) between 1 and 60),
  is_published boolean not null default false,
  published_bucket text,
  published_original_path text,
  published_thumbnail_path text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_type, owner_id, role),
  check (not is_published or (published_bucket is not null and published_original_path is not null))
);

create index if not exists epiphany_asset_usages_asset_idx on public.epiphany_asset_usages (asset_id);
create index if not exists epiphany_asset_usages_published_owner_idx on public.epiphany_asset_usages (owner_type, owner_id, role) where is_published = true;

alter table public.epiphany_assets enable row level security;
alter table public.epiphany_asset_files enable row level security;
alter table public.epiphany_asset_usages enable row level security;

drop policy if exists "EPIPHANY developers manage assets" on public.epiphany_assets;
create policy "EPIPHANY developers manage assets" on public.epiphany_assets for all to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]))
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers manage asset files" on public.epiphany_asset_files;
create policy "EPIPHANY developers manage asset files" on public.epiphany_asset_files for all to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]))
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "Published EPIPHANY asset usages are readable" on public.epiphany_asset_usages;
create policy "Published EPIPHANY asset usages are readable" on public.epiphany_asset_usages for select to anon, authenticated using (is_published = true);

drop policy if exists "EPIPHANY developers manage asset usages" on public.epiphany_asset_usages;
create policy "EPIPHANY developers manage asset usages" on public.epiphany_asset_usages for all to authenticated
using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]))
with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

-- Explicit grants are required for new public-schema tables after the 2026-10-30 Data API rollout.
revoke all on table public.epiphany_assets from anon, authenticated;
revoke all on table public.epiphany_asset_files from anon, authenticated;
revoke all on table public.epiphany_asset_usages from anon, authenticated;
grant select, insert, update, delete on table public.epiphany_assets to authenticated;
grant select, insert, update, delete on table public.epiphany_asset_files to authenticated;
grant select, insert, update, delete on table public.epiphany_asset_usages to authenticated;
grant select on table public.epiphany_asset_usages to anon;

drop policy if exists "EPIPHANY developers read private assets" on storage.objects;
create policy "EPIPHANY developers read private assets" on storage.objects for select to authenticated
using (bucket_id = 'epiphany-assets-private' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers upload private assets" on storage.objects;
create policy "EPIPHANY developers upload private assets" on storage.objects for insert to authenticated
with check (bucket_id = 'epiphany-assets-private' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers update private assets" on storage.objects;
create policy "EPIPHANY developers update private assets" on storage.objects for update to authenticated
using (bucket_id = 'epiphany-assets-private' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]))
with check (bucket_id = 'epiphany-assets-private' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers delete private assets" on storage.objects;
create policy "EPIPHANY developers delete private assets" on storage.objects for delete to authenticated
using (bucket_id = 'epiphany-assets-private' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers list published assets" on storage.objects;
create policy "EPIPHANY developers list published assets" on storage.objects for select to authenticated
using (bucket_id = 'epiphany-assets' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers upload published assets" on storage.objects;
create policy "EPIPHANY developers upload published assets" on storage.objects for insert to authenticated
with check (bucket_id = 'epiphany-assets' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers update published assets" on storage.objects;
create policy "EPIPHANY developers update published assets" on storage.objects for update to authenticated
using (bucket_id = 'epiphany-assets' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]))
with check (bucket_id = 'epiphany-assets' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers delete published assets" on storage.objects;
create policy "EPIPHANY developers delete published assets" on storage.objects for delete to authenticated
using (bucket_id = 'epiphany-assets' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));

drop policy if exists "EPIPHANY developers delete character art" on storage.objects;
create policy "EPIPHANY developers delete character art" on storage.objects for delete to authenticated
using (bucket_id = 'character-art' and lower(coalesce((select auth.jwt() ->> 'email'), '')) = any (array['abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com']::text[]));
