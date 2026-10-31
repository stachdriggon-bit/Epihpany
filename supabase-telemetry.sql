-- EPIPHANY anonymous, opt-in telemetry. No names, emails, answers, or story text.
create table if not exists public.epiphany_telemetry (
 id bigint generated always as identity primary key,
 session_id uuid not null,
 event_name text not null check (event_name in ('session_start','first_session_complete','return_day_2','return_day_7','section_open','section_exit','client_error','web_vital')),
 section text check (section is null or length(section) <= 40),
 app_version text not null default '20261024k',
 details jsonb not null default '{}'::jsonb check (pg_column_size(details) <= 1024),
 created_at timestamptz not null default now()
);
-- Keep existing installations in sync with the expanded event allowlist.
alter table public.epiphany_telemetry drop constraint if exists epiphany_telemetry_event_name_check;
alter table public.epiphany_telemetry add constraint epiphany_telemetry_event_name_check
 check (event_name in ('session_start','first_session_complete','return_day_2','return_day_7','section_open','section_exit','client_error','web_vital'));
create index if not exists epiphany_telemetry_created_at_idx on public.epiphany_telemetry (created_at desc);
create index if not exists epiphany_telemetry_event_created_idx on public.epiphany_telemetry (event_name, created_at desc);
alter table public.epiphany_telemetry enable row level security;
revoke all on public.epiphany_telemetry from anon, authenticated;
grant insert on public.epiphany_telemetry to anon, authenticated;
grant usage, select on sequence public.epiphany_telemetry_id_seq to anon, authenticated;
drop policy if exists "Allow constrained anonymous telemetry inserts" on public.epiphany_telemetry;
create policy "Allow constrained anonymous telemetry inserts" on public.epiphany_telemetry for insert to anon, authenticated with check (session_id is not null);
