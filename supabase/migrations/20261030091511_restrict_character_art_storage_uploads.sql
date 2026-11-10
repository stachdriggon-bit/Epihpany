-- RECONSTRUCTED — original SQL unavailable.
-- Rebuilt on 2026-11-10 from live storage.objects policies and repository evidence.
-- This is NOT an original historical copy. See docs/VELORN-PHASE-0-SCHEMA-RECONCILIATION.md.
-- Evidence: live pg_policies rows for storage.objects, Asset Manager foundation commit
-- 68aedd448ce1e6954a29697d3e20f13f271d7e19, and the later explicit delete policy.
--
-- Preserve the public-read nature of character-art URLs, but restrict listing,
-- uploading, replacing, and deleting objects through the Storage API to the
-- established EPIPHANY developer accounts. This migration does not change the bucket
-- visibility, file-size limit, MIME types, or existing objects.

-- Remove any earlier policy that references this bucket. Storage policies are
-- permissive by default, so leaving a broad legacy policy would bypass these rules.
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') ILIKE '%character-art%'
        OR COALESCE(with_check, '') ILIKE '%character-art%'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      policy_row.policyname
    );
  END LOOP;
END
$$;

CREATE POLICY "Developer accounts can inspect character art objects"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'character-art'
    AND lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = ANY (
      ARRAY[
        'abdulrahimaouadi@gmail.com',
        'crboy952@gmail.com',
        'girl32761@gmail.com'
      ]::text[]
    )
  );

CREATE POLICY "Developer accounts can upload character art"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'character-art'
    AND lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = ANY (
      ARRAY[
        'abdulrahimaouadi@gmail.com',
        'crboy952@gmail.com',
        'girl32761@gmail.com'
      ]::text[]
    )
  );

CREATE POLICY "Developer accounts can replace character art"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'character-art'
    AND lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = ANY (
      ARRAY[
        'abdulrahimaouadi@gmail.com',
        'crboy952@gmail.com',
        'girl32761@gmail.com'
      ]::text[]
    )
  )
  WITH CHECK (
    bucket_id = 'character-art'
    AND lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = ANY (
      ARRAY[
        'abdulrahimaouadi@gmail.com',
        'crboy952@gmail.com',
        'girl32761@gmail.com'
      ]::text[]
    )
  );

CREATE POLICY "EPIPHANY developers delete character art"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'character-art'
    AND lower(COALESCE((SELECT auth.jwt() ->> 'email'), '')) = ANY (
      ARRAY[
        'abdulrahimaouadi@gmail.com',
        'crboy952@gmail.com',
        'girl32761@gmail.com'
      ]::text[]
    )
  );
