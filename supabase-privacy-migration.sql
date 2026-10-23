-- Epiphany account privacy migration
-- Run this script in Supabase Dashboard > SQL Editor before using the privacy switch.
-- Existing profiles default to private for safety.

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT true;

ALTER TABLE public.player_profiles
  ALTER COLUMN is_private SET DEFAULT true;

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_posts ENABLE ROW LEVEL SECURITY;

-- Restrictive policies are intentional: they apply alongside existing policies,
-- so an older permissive SELECT policy cannot bypass privacy.
DROP POLICY IF EXISTS player_profiles_select_visible ON public.player_profiles;
DROP POLICY IF EXISTS player_posts_select_visible ON public.player_posts;

CREATE POLICY player_profiles_select_visible
  ON public.player_profiles
  AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_private = false);

CREATE POLICY player_posts_select_visible
  ON public.player_posts
  AS RESTRICTIVE
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
