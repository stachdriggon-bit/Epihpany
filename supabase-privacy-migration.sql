-- Epiphany account privacy migration
-- Run this script in Supabase Dashboard > SQL Editor before using the privacy switch.
-- Existing profiles default to private for safety.

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT true;

ALTER TABLE public.player_profiles
  ALTER COLUMN is_private SET DEFAULT true;

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_posts ENABLE ROW LEVEL SECURITY;

-- Remove existing SELECT policies on these two tables so an older permissive
-- policy cannot accidentally override the privacy rules below.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('player_profiles', 'player_posts')
      AND cmd IN ('SELECT', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
  END LOOP;
END $$;

CREATE POLICY player_profiles_select_visible
  ON public.player_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_private = false);

CREATE POLICY player_posts_select_visible
  ON public.player_posts
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.player_profiles AS profile
      WHERE profile.user_id = player_posts.user_id
        AND profile.is_private = false
    )
  );
