-- Epiphany player profiles, avatars and short English posts
-- Run once in Supabase SQL Editor for project pqxkmtowialpjwehvuyb.

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'English learner' check (char_length(display_name) between 1 and 32),
  bio text not null default '' check (char_length(bio) <= 180),
  avatar_url text,
  avatar_emoji text not null default '🦊',
  avatar_color text not null default '#FFE08A' check (avatar_color ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles add column if not exists avatar_color_2 text not null default '#F0EDFF' check (avatar_color_2 ~ '^#[0-9A-Fa-f]{6}
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  avatar_color_2 text not null default '#F0EDFF' check (avatar_color_2 ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  banner_style text not null default 'aurora' check (banner_style in ('aurora','sunset','ocean','pattern')),
  banner_url text,
  avatar_frame text not null default 'none' check (avatar_frame in ('none','gold','stars')),
  accent_color text not null default '#7c6cff' check (accent_color ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
);
alter table public.player_profiles add column if not exists banner_style text not null default 'aurora' check (banner_style in ('aurora','sunset','ocean','pattern'));
alter table public.player_profiles add column if not exists banner_url text;
alter table public.player_profiles add column if not exists avatar_frame text not null default 'none' check (avatar_frame in ('none','gold','stars'));
alter table public.player_profiles add column if not exists accent_color text not null default '#7c6cff' check (accent_color ~ '^#[0-9A-Fa-f]{6}
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  avatar_color_2 text not null default '#F0EDFF' check (avatar_color_2 ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  banner_style text not null default 'aurora' check (banner_style in ('aurora','sunset','ocean','pattern')),
  banner_url text,
  avatar_frame text not null default 'none' check (avatar_frame in ('none','gold','stars')),
  accent_color text not null default '#7c6cff' check (accent_color ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  avatar_color_2 text not null default '#F0EDFF' check (avatar_color_2 ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  banner_style text not null default 'aurora' check (banner_style in ('aurora','sunset','ocean','pattern')),
  banner_url text,
  avatar_frame text not null default 'none' check (avatar_frame in ('none','gold','stars')),
  accent_color text not null default '#7c6cff' check (accent_color ~ '^#[0-9A-Fa-f]{6}
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
),
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
drop policy if exists "Profiles are publicly viewable" on public.player_profiles;
create policy "Profiles are publicly viewable" on public.player_profiles for select using (true);
drop policy if exists "Players create their own profile" on public.player_profiles;
create policy "Players create their own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update their own profile" on public.player_profiles;
create policy "Players update their own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.player_profiles to authenticated;

create table if not exists public.player_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists player_posts_user_created_idx on public.player_posts(user_id, created_at desc);
alter table public.player_posts enable row level security;
drop policy if exists "Posts are publicly viewable" on public.player_posts;
create policy "Posts are publicly viewable" on public.player_posts for select using (true);
drop policy if exists "Players create their own posts" on public.player_posts;
create policy "Players create their own posts" on public.player_posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players delete their own posts" on public.player_posts;
create policy "Players delete their own posts" on public.player_posts for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.player_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable" on storage.objects for select using (bucket_id = 'player-avatars');
drop policy if exists "Players upload their own avatar" on storage.objects;
create policy "Players upload their own avatar" on storage.objects for insert to authenticated with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update their own avatar" on storage.objects;
create policy "Players update their own avatar" on storage.objects for update to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete their own avatar" on storage.objects;
create policy "Players delete their own avatar" on storage.objects for delete to authenticated using (bucket_id = 'player-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
