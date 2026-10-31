-- Shared per-character collectible-card portrait framing.
-- The table stores display settings only; original image objects are never modified.
create table if not exists public.epiphany_card_image_views (
  character_id text primary key,
  position_x numeric(5,2) not null default 50 check (position_x between 0 and 100),
  position_y numeric(5,2) not null default 32 check (position_y between 0 and 100),
  zoom numeric(4,3) not null default 1 check (zoom between 0.5 and 2.5),
  fit text not null default 'cover' check (fit in ('cover','contain')),
  updated_at timestamptz not null default now()
);
alter table public.epiphany_card_image_views add column if not exists fit text not null default 'cover' check (fit in ('cover','contain'));
alter table public.epiphany_card_image_views enable row level security;
revoke all on table public.epiphany_card_image_views from anon, authenticated;
grant select on table public.epiphany_card_image_views to anon, authenticated;
grant insert, update on table public.epiphany_card_image_views to authenticated;
drop policy if exists "Card image views are readable by everyone" on public.epiphany_card_image_views;
create policy "Card image views are readable by everyone"
  on public.epiphany_card_image_views for select to anon, authenticated using (true);
drop policy if exists "Developers can insert card image views" on public.epiphany_card_image_views;
create policy "Developers can insert card image views"
  on public.epiphany_card_image_views for insert to authenticated
  with check (lower(coalesce(auth.jwt()->>'email','')) in ('abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com'));
drop policy if exists "Developers can update card image views" on public.epiphany_card_image_views;
create policy "Developers can update card image views"
  on public.epiphany_card_image_views for update to authenticated
  using (lower(coalesce(auth.jwt()->>'email','')) in ('abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com'))
  with check (lower(coalesce(auth.jwt()->>'email','')) in ('abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com'));
