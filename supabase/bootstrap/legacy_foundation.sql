-- EPIPHANY legacy foundation bootstrap.
-- RECONSTRUCTED on 2026-11-10 from live catalog + historical root SQL evidence.
-- LOCAL / DISPOSABLE DATABASES ONLY. NEVER RUN AGAINST HOSTED PRODUCTION.
-- These tables predate the tracked migration sequence and were created manually.
-- player_progress has no source SQL in Git history; its live schema, RLS and grants
-- were reconstructed from the live catalog. It remains learning progress only.

CREATE TABLE IF NOT EXISTS public.player_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players can read their own progress" ON public.player_progress;
CREATE POLICY "Players can read their own progress" ON public.player_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Players can save their own progress" ON public.player_progress;
CREATE POLICY "Players can save their own progress" ON public.player_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Players can update their own progress" ON public.player_progress;
CREATE POLICY "Players can update their own progress" ON public.player_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE ON public.player_progress TO authenticated;

CREATE TABLE IF NOT EXISTS public.player_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'English learner' CHECK (char_length(display_name) BETWEEN 1 AND 32),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 180),
  avatar_url text,
  avatar_emoji text NOT NULL DEFAULT '🦊',
  avatar_color text NOT NULL DEFAULT '#FFE08A' CHECK (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players create their own profile" ON public.player_profiles;
CREATE POLICY "Players create their own profile" ON public.player_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Players update their own profile" ON public.player_profiles;
CREATE POLICY "Players update their own profile" ON public.player_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE ON public.player_profiles TO authenticated;

CREATE TABLE IF NOT EXISTS public.player_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS player_posts_user_created_idx ON public.player_posts(user_id, created_at DESC);
ALTER TABLE public.player_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players create their own posts" ON public.player_posts;
CREATE POLICY "Players create their own posts" ON public.player_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Players delete their own posts" ON public.player_posts;
CREATE POLICY "Players delete their own posts" ON public.player_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, DELETE ON public.player_posts TO authenticated;

-- Pre-existing buckets before Asset Manager.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES
 ('player-avatars','player-avatars',true,3145728,ARRAY['image/png','image/jpeg','image/webp']::text[]),
 ('character-art','character-art',true,12582912,ARRAY['image/png','image/jpeg','image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,public=EXCLUDED.public,
 file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatar images are publicly viewable" ON storage.objects;
CREATE POLICY "Avatar images are publicly viewable" ON storage.objects
 FOR SELECT USING (bucket_id='player-avatars');
DROP POLICY IF EXISTS "Players upload their own avatar" ON storage.objects;
CREATE POLICY "Players upload their own avatar" ON storage.objects
 FOR INSERT TO authenticated WITH CHECK (
  bucket_id='player-avatars' AND (storage.foldername(name))[1]=auth.uid()::text
 );
DROP POLICY IF EXISTS "Players update their own avatar" ON storage.objects;
CREATE POLICY "Players update their own avatar" ON storage.objects
 FOR UPDATE TO authenticated USING (
  bucket_id='player-avatars' AND (storage.foldername(name))[1]=auth.uid()::text
 ) WITH CHECK (
  bucket_id='player-avatars' AND (storage.foldername(name))[1]=auth.uid()::text
 );
DROP POLICY IF EXISTS "Players delete their own avatar" ON storage.objects;
CREATE POLICY "Players delete their own avatar" ON storage.objects
 FOR DELETE TO authenticated USING (
  bucket_id='player-avatars' AND (storage.foldername(name))[1]=auth.uid()::text
 );

-- Anonymous, privacy-minimized telemetry.
CREATE TABLE IF NOT EXISTS public.epiphany_telemetry (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 session_id uuid NOT NULL,
 event_name text NOT NULL CHECK (event_name IN (
  'session_start','first_session_complete','return_day_2','return_day_7',
  'section_open','section_exit','client_error','web_vital'
 )),
 section text CONSTRAINT epiphany_telemetry_section_length CHECK (section IS NULL OR length(section)<=40),
 app_version text NOT NULL DEFAULT '20261024k',
 details jsonb NOT NULL DEFAULT '{}'::jsonb CONSTRAINT epiphany_telemetry_details_size CHECK (pg_column_size(details)<=1024),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS epiphany_telemetry_created_at_idx ON public.epiphany_telemetry(created_at DESC);
CREATE INDEX IF NOT EXISTS epiphany_telemetry_event_created_idx ON public.epiphany_telemetry(event_name,created_at DESC);
ALTER TABLE public.epiphany_telemetry ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.epiphany_telemetry FROM anon,authenticated;
GRANT INSERT ON public.epiphany_telemetry TO anon,authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.epiphany_telemetry_id_seq TO anon,authenticated;
DROP POLICY IF EXISTS "Allow constrained anonymous telemetry inserts" ON public.epiphany_telemetry;
CREATE POLICY "Allow constrained anonymous telemetry inserts" ON public.epiphany_telemetry
 FOR INSERT TO anon,authenticated WITH CHECK (session_id IS NOT NULL);

-- Shared card portrait framing metadata.
CREATE TABLE IF NOT EXISTS public.epiphany_card_image_views (
 character_id text PRIMARY KEY,
 position_x numeric(5,2) NOT NULL DEFAULT 50 CHECK (position_x BETWEEN 0 AND 100),
 position_y numeric(5,2) NOT NULL DEFAULT 32 CHECK (position_y BETWEEN 0 AND 100),
 zoom numeric(4,3) NOT NULL DEFAULT 1 CHECK (zoom BETWEEN 0.5 AND 2.5),
 updated_at timestamptz NOT NULL DEFAULT now(),
 fit text NOT NULL DEFAULT 'cover' CHECK (fit IN ('cover','contain'))
);
ALTER TABLE public.epiphany_card_image_views ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.epiphany_card_image_views FROM anon,authenticated;
GRANT SELECT ON TABLE public.epiphany_card_image_views TO anon,authenticated;
GRANT INSERT,UPDATE ON TABLE public.epiphany_card_image_views TO authenticated;
DROP POLICY IF EXISTS "Card image views are readable by everyone" ON public.epiphany_card_image_views;
CREATE POLICY "Card image views are readable by everyone" ON public.epiphany_card_image_views
 FOR SELECT TO anon,authenticated USING (true);
DROP POLICY IF EXISTS "Developers can insert card image views" ON public.epiphany_card_image_views;
CREATE POLICY "Developers can insert card image views" ON public.epiphany_card_image_views
 FOR INSERT TO authenticated WITH CHECK ((SELECT lower(coalesce(auth.jwt()->>'email','')) IN (
  'abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com'
 )));
DROP POLICY IF EXISTS "Developers can update card image views" ON public.epiphany_card_image_views;
CREATE POLICY "Developers can update card image views" ON public.epiphany_card_image_views
 FOR UPDATE TO authenticated
 USING ((SELECT lower(coalesce(auth.jwt()->>'email','')) IN (
  'abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com'
 )))
 WITH CHECK ((SELECT lower(coalesce(auth.jwt()->>'email','')) IN (
  'abdulrahimaouadi@gmail.com','crboy952@gmail.com','girl32761@gmail.com'
 )));
