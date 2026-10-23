-- Epiphany account privacy migration (v2)
-- Run in Supabase Dashboard > SQL Editor. Safe to run more than once.
--
-- Why v2: the first version added RESTRICTIVE policies only for the `authenticated` role.
-- Visitors who are NOT signed in use the `anon` role, so the old "publicly viewable"
-- policy (using (true)) still let them read PRIVATE profiles and their posts.
-- This version removes those permissive policies and replaces them with one rule for everyone.

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT true;
ALTER TABLE public.player_profiles ALTER COLUMN is_private SET DEFAULT true;

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_posts    ENABLE ROW LEVEL SECURITY;

-- Remove every older SELECT policy (permissive "viewable" ones and the v1 restrictive ones).
DROP POLICY IF EXISTS "Profiles are publicly viewable"  ON public.player_profiles;
DROP POLICY IF EXISTS "Posts are publicly viewable"     ON public.player_posts;
DROP POLICY IF EXISTS player_profiles_select_visible    ON public.player_profiles;
DROP POLICY IF EXISTS player_posts_select_visible       ON public.player_posts;

-- A profile is readable if it is public, or if it is yours.
CREATE POLICY player_profiles_select_visible
  ON public.player_profiles
  FOR SELECT TO anon, authenticated
  USING (is_private = false OR auth.uid() = user_id);

-- A post is readable if it is yours, or if its author's profile is public.
CREATE POLICY player_posts_select_visible
  ON public.player_posts
  FOR SELECT TO anon, authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.player_profiles AS profile
      WHERE profile.user_id = player_posts.user_id AND profile.is_private = false
    )
  );

-- Quick check (run as a separate query; both should return only public rows when signed out):
--   select count(*) from public.player_profiles where is_private = true;   -- as anon => 0
-- Note: the avatar bucket is public by design; a private user's avatar image is only reachable
-- if someone already knows its exact URL.
