-- Run only against disposable local Supabase after bootstrap + migrations.
DO $$
DECLARE n integer; actual_count integer; expected record;
BEGIN
 SELECT count(*) INTO n FROM supabase_migrations.schema_migrations
 WHERE version IN ('20261023233115','20261024122251','20261030091511',
 '20261030101059','20261030201651','20261030201953','20261030202518',
 '20261030202723','20261030221913');
 IF n<>9 THEN RAISE EXCEPTION 'Expected 9 migration versions, got %',n; END IF;

 SELECT count(*) INTO n FROM information_schema.tables
 WHERE table_schema='public' AND table_name IN (
 'player_progress','player_profiles','player_posts','player_stories',
 'epiphany_telemetry','epiphany_card_image_views','epiphany_assets',
 'epiphany_asset_files','epiphany_asset_usages');
 IF n<>9 THEN RAISE EXCEPTION 'Expected 9 EPIPHANY public tables, got %',n; END IF;

 SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace s ON s.oid=c.relnamespace
 WHERE s.nspname='public' AND c.relname IN (
 'player_progress','player_profiles','player_posts','player_stories',
 'epiphany_telemetry','epiphany_card_image_views','epiphany_assets',
 'epiphany_asset_files','epiphany_asset_usages') AND c.relrowsecurity;
 IF n<>9 THEN RAISE EXCEPTION 'RLS not enabled on all 9 tables; got %',n; END IF;


  -- Compare table shape and catalog object counts with the live Phase 0 inventory.
  FOR expected IN
    SELECT * FROM (VALUES
      ('player_progress',3),('player_profiles',14),('player_posts',4),
      ('player_stories',12),('epiphany_telemetry',7),('epiphany_card_image_views',6),
      ('epiphany_assets',13),('epiphany_asset_files',11),('epiphany_asset_usages',12)
    ) AS expected(table_name, expected_columns)
  LOOP
    SELECT count(*) INTO actual_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name=expected.table_name;
    IF actual_count <> expected.expected_columns THEN
      RAISE EXCEPTION 'Column count mismatch for %: expected %, got %',
        expected.table_name, expected.expected_columns, actual_count;
    END IF;
  END LOOP;

  FOR expected IN
    SELECT * FROM (VALUES
      ('player_progress',2),('player_profiles',10),('player_posts',3),
      ('player_stories',10),('epiphany_telemetry',4),('epiphany_card_image_views',5),
      ('epiphany_assets',10),('epiphany_asset_files',10),('epiphany_asset_usages',7)
    ) AS expected(table_name, expected_constraints)
  LOOP
    SELECT count(*) INTO actual_count
    FROM pg_constraint
    WHERE conrelid = format('public.%I', expected.table_name)::regclass;
    IF actual_count <> expected.expected_constraints THEN
      RAISE EXCEPTION 'Constraint count mismatch for %: expected %, got %',
        expected.table_name, expected.expected_constraints, actual_count;
    END IF;
  END LOOP;

  FOR expected IN
    SELECT * FROM (VALUES
      ('player_progress',1),('player_profiles',1),('player_posts',2),
      ('player_stories',3),('epiphany_telemetry',3),('epiphany_card_image_views',1),
      ('epiphany_assets',2),('epiphany_asset_files',4),('epiphany_asset_usages',4)
    ) AS expected(table_name, expected_indexes)
  LOOP
    SELECT count(*) INTO actual_count FROM pg_indexes
    WHERE schemaname='public' AND tablename=expected.table_name;
    IF actual_count <> expected.expected_indexes THEN
      RAISE EXCEPTION 'Index count mismatch for %: expected %, got %',
        expected.table_name, expected.expected_indexes, actual_count;
    END IF;
  END LOOP;

 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public'
 AND table_name='player_profiles' AND column_name='is_private' AND column_default LIKE '%true%')
 THEN RAISE EXCEPTION 'is_private default must be true'; END IF;
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public'
 AND table_name='player_profiles' AND column_name='visibility' AND column_default LIKE '%private%')
 THEN RAISE EXCEPTION 'visibility default must be private'; END IF;

 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename='player_profiles';
 IF n<>3 THEN RAISE EXCEPTION 'Expected 3 profile policies, got %',n; END IF;
 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename='player_posts';
 IF n<>3 THEN RAISE EXCEPTION 'Expected 3 post policies, got %',n; END IF;
 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename='player_stories';
 IF n<>4 THEN RAISE EXCEPTION 'Expected 4 story policies, got %',n; END IF;
 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename='player_progress';
 IF n<>3 THEN RAISE EXCEPTION 'Expected 3 progress policies, got %',n; END IF;

 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
 AND (coalesce(qual,'') ILIKE '%character-art%' OR coalesce(with_check,'') ILIKE '%character-art%');
 IF n<>4 THEN RAISE EXCEPTION 'Expected 4 final character-art policies, got %',n; END IF;
 SELECT count(*) INTO n FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
 AND (coalesce(qual,'') ILIKE '%player-avatars%' OR coalesce(with_check,'') ILIKE '%player-avatars%');
 IF n<>4 THEN RAISE EXCEPTION 'Expected 4 avatar Storage policies, got %',n; END IF;

 IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='player-avatars' AND public AND file_size_limit=3145728)
 THEN RAISE EXCEPTION 'player-avatars must be public with 3 MiB limit'; END IF;
 IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='character-art' AND public AND file_size_limit=12582912)
 THEN RAISE EXCEPTION 'character-art must be public with 12 MiB limit'; END IF;
 IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='epiphany-assets' AND public AND file_size_limit=12582912)
 THEN RAISE EXCEPTION 'epiphany-assets bucket mismatch'; END IF;
 IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='epiphany-assets-private' AND NOT public AND file_size_limit=12582912)
 THEN RAISE EXCEPTION 'epiphany-assets-private bucket mismatch'; END IF;

 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.epiphany_telemetry'::regclass AND conname='epiphany_telemetry_details_size')
 THEN RAISE EXCEPTION 'Telemetry details size constraint name/definition missing'; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.epiphany_telemetry'::regclass AND conname='epiphany_telemetry_section_length')
 THEN RAISE EXCEPTION 'Telemetry section length constraint name/definition missing'; END IF;

 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='player_profiles'
 AND policyname='player_profiles_select_visible' AND qual ILIKE '%is_private%')
 THEN RAISE EXCEPTION 'Private profile SELECT policy missing'; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='player_posts'
 AND policyname='player_posts_select_visible' AND qual ILIKE '%player_profiles%')
 THEN RAISE EXCEPTION 'Post visibility SELECT policy missing'; END IF;

 RAISE NOTICE 'EPIPHANY Phase 0 clean-room assertions passed.';
END $$;
