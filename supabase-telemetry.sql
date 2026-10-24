-- EPIPHANY anonymous, opt-in telemetry. No names, emails, answers, or story text.
create table if not exists public.epiphany_telemetry (
 id bigint generated always as identity primary key,
 session_id uuid not null,
 event_name text not null check (event_name in ('session_start','first_quest_complete','return_day_2','return_day_7','section_open','section_exit','client_error')),
 section text check (section is null or length(section) <= 40),
 app_version text not null default '20261024k',
 details jsonb not null default '{}'::jsonb check (pg_column_size(details) <= 1024),
 created_at timestamptz not null default now()
);
create index if not exists epiphany_telemetry_created_at_idx on public.epiphany_telemetry (created_at desc);
alter table public.epiphany_telemetry enable row level security;
revoke all on public.epiphany_telemetry from anon, authenticated;
grant insert on public.epiphany_telemetry to anon, authenticated;
grant usage, select on sequence public.epiphany_telemetry_id_seq to anon, authenticated;
create policy "Allow constrained anonymous telemetry inserts" on public.epiphany_telemetry for insert to anon, authenticated with check (session_id is not null);
