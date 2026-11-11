create table if not exists public.player_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My story' check (char_length(title) between 1 and 100),
  genre text not null default 'adventure' check (char_length(genre) <= 40),
  level text not null default 'A1' check (level in ('A1','A2','B1','B2','C1','C2')),
  pages jsonb not null default '[]'::jsonb check (jsonb_typeof(pages) = 'array'),
  word_count integer not null default 0 check (word_count >= 0 and word_count <= 10000),
  problem text not null default '' check (char_length(problem) <= 300),
  visibility text not null default 'private' check (visibility in ('private','public')),
  reply_to uuid references public.player_stories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_stories enable row level security;
create index if not exists player_stories_owner_updated_idx on public.player_stories (user_id, updated_at desc);
create index if not exists player_stories_public_created_idx on public.player_stories (created_at desc) where visibility = 'public';

drop policy if exists "Players can read own or public stories" on public.player_stories;
create policy "Players can read own or public stories" on public.player_stories
  for select to authenticated using ((select auth.uid()) = user_id or visibility = 'public');

drop policy if exists "Players can create own stories" on public.player_stories;
create policy "Players can create own stories" on public.player_stories
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update own stories" on public.player_stories;
create policy "Players can update own stories" on public.player_stories
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Players can delete own stories" on public.player_stories;
create policy "Players can delete own stories" on public.player_stories
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.player_stories to authenticated;
revoke all on public.player_stories from anon;
