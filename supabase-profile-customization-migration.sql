-- EPIPHANY profile customization migration
-- Run in Supabase SQL Editor once before using the new profile appearance controls.
alter table public.player_profiles add column if not exists avatar_color_2 text not null default '#F0EDFF' check (avatar_color_2 ~ '^#[0-9A-Fa-f]{6}$');
alter table public.player_profiles add column if not exists banner_style text not null default 'aurora' check (banner_style in ('aurora','sunset','ocean','pattern'));
alter table public.player_profiles add column if not exists banner_url text;
alter table public.player_profiles add column if not exists avatar_frame text not null default 'none' check (avatar_frame in ('none','gold','stars'));
alter table public.player_profiles add column if not exists accent_color text not null default '#7c6cff' check (accent_color ~ '^#[0-9A-Fa-f]{6}$');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/png','image/jpeg','image/webp'];

-- Three-way profile visibility. "friends" stays hidden until friend relationships are implemented.
alter table public.player_profiles add column if not exists visibility text not null default 'private' check (visibility in ('public','friends','private'));
update public.player_profiles set visibility = case when is_private = false then 'public' else 'private' end where visibility = 'private';
