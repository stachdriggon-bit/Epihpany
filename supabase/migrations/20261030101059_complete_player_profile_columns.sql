-- RECONSTRUCTED — original SQL unavailable.
-- Rebuilt on 2026-11-10 from live player_profiles columns/constraints and repository evidence.
-- This is NOT an original historical copy. See docs/VELORN-PHASE-0-SCHEMA-RECONCILIATION.md.
-- Evidence: live information_schema/pg_constraint inspection,
-- supabase-profile-customization-migration.sql, and commit
-- b822c10d010df377b757be344703d905c507735c.
--
-- The original root script also changed player-avatars to 5 MiB. That behavior is
-- deliberately excluded: the live bucket is 3 MiB and this migration is column-only.

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'friends', 'private'));

-- Preserve the existing privacy choice when introducing the three-way visibility field.
UPDATE public.player_profiles
SET visibility = CASE
  WHEN is_private = false THEN 'public'
  ELSE 'private'
END
WHERE visibility = 'private';

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS avatar_color_2 text NOT NULL DEFAULT '#F0EDFF'
    CHECK (avatar_color_2 ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS banner_style text NOT NULL DEFAULT 'aurora'
    CHECK (banner_style IN ('aurora', 'sunset', 'ocean', 'pattern'));

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS banner_url text;

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS avatar_frame text NOT NULL DEFAULT 'none'
    CHECK (avatar_frame IN ('none', 'gold', 'stars'));

ALTER TABLE public.player_profiles
  ADD COLUMN IF NOT EXISTS accent_color text NOT NULL DEFAULT '#7c6cff'
    CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$');
