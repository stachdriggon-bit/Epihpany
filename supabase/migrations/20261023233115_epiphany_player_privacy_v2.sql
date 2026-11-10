-- RECONSTRUCTED — original SQL unavailable.
-- Rebuilt on 2026-11-10 from the live Supabase catalog and repository evidence.
-- This is NOT an original historical copy. See docs/VELORN-PHASE-0-SCHEMA-RECONCILIATION.md.
-- Evidence: supabase-privacy-migration.sql and live pg_policies/catalog inspection.
--
-- The legacy player profile/post tables are created by the earlier manual bootstrap
-- script (supabase-player-profile.sql); this migration intentionally alters those tables
-- and does not attempt to recreate that separate bootstrap baseline.

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT true;

ALTER TABLE public.player_profiles
  ALTER COLUMN is_private SET DEFAULT true;

ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_posts ENABLE ROW LEVEL SECURITY;

-- Remove the legacy permissive policies and any prior visibility-policy variants.
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.player_profiles;
DROP POLICY IF EXISTS "Posts are publicly viewable" ON public.player_posts;
DROP POLICY IF EXISTS player_profiles_select_visible ON public.player_profiles;
DROP POLICY IF EXISTS player_posts_select_visible ON public.player_posts;

-- A profile is readable only by its owner or when explicitly public.
CREATE POLICY player_profiles_select_visible
  ON public.player_profiles
  FOR SELECT TO anon, authenticated
  USING (is_private = false OR (SELECT auth.uid()) = user_id);

-- Posts follow the author's profile privacy setting; owners can always read their own.
CREATE POLICY player_posts_select_visible
  ON public.player_posts
  FOR SELECT TO anon, authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1
      FROM public.player_profiles AS profile
      WHERE profile.user_id = player_posts.user_id
        AND profile.is_private = false
    )
  );

-- Keep the existing owner-only write policies intact (created by the profile bootstrap).
