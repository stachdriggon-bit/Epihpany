# EPIPHANY Supabase Schema Reconciliation — Velorn Phase 0

> **Audit date:** 2026-11-10  
> **Status:** The three missing migration files are reconstructed and labelled; a local-only legacy foundation, pinned Supabase CLI configuration, and clean-room GitHub Actions test have now been added. Phase 0 remains gated on the clean-room workflow passing and final live/catalog comparison. Do not create or apply the first Velorn migration yet.  
> **Scope:** EPIPHANY's connected Supabase project and the repository's current `main` branch.

## 1. Executive result

The live database is healthy and contains the expected EPIPHANY player, community, telemetry, card-image, and Asset Manager structures. It does not contain any Velorn/economy objects.

The main blocker is not a live database failure. It is **source-of-truth drift between the live migration history and the Git repository**:

- Supabase records nine applied application migrations.
- The repository initially tracked only six files in `supabase/migrations/`; all nine hosted versions now have matching files, with three marked as reconstructed.
- Several foundational SQL objects were historically created through root-level manual scripts rather than the timestamped migration sequence. Their safe local reconstruction is now centralized in `supabase/bootstrap/legacy_foundation.sql`.
- The former `supabase-player-profile.sql` body was corrupted (508 lines, repeated statements, truncated CHECK expressions and obsolete permissive read policies); it is now an archived do-not-run pointer. Its prior content remains in Git history.
- The former profile-customization script would have changed the avatar bucket limit from 3 MiB to 5 MiB; it is now an archived pointer to the safe versioned migration.

The three files restore the version-to-file mapping but remain explicitly reconstructed rather than recovered originals. A local-only bootstrap now recreates the legacy manual foundation (including player_progress, profiles/posts, telemetry, card-image views and pre-existing buckets) before the nine timestamped migrations are replayed. A CI workflow validates the chain on a disposable local Supabase stack; production remains untouched.

## 2. Live project inventory

Verified through the connected Supabase project:

| Item | Observed state |
|---|---|
| Project | EPIPHANY |
| Project ref | `pqxkmtowialpjwehvuyb` |
| Region | `eu-west-1` |
| Project status | `ACTIVE_HEALTHY` |
| PostgreSQL | 17.11 |
| Auth users | 6 |
| Public application tables | 9 |
| Public tables with RLS enabled | 9 of 9 |
| Public tables with FORCE RLS | 0 |
| Custom functions in `public` | None found |
| Deployed Edge Functions | None |
| Economy schema/tables | None found |

### 2.1 Public application tables

Approximate row counts are those reported by the database table inventory.

| Table | Approx. rows | RLS |
|---|---:|---|
| `player_progress` | 4 | Enabled |
| `player_profiles` | 2 | Enabled |
| `player_posts` | 1 | Enabled |
| `player_stories` | 0 | Enabled |
| `epiphany_telemetry` | 0 | Enabled |
| `epiphany_card_image_views` | 9 | Enabled |
| `epiphany_assets` | 82 | Enabled |
| `epiphany_asset_files` | 164 | Enabled |
| `epiphany_asset_usages` | 76 | Enabled |

The existing account flow uses `player_progress(user_id, progress jsonb, updated_at)` as a general learning-progress snapshot. It must not be repurposed as a wallet or transaction ledger.

No table or object was found for wallets, Velorn transactions, mission boards/claims, achievement awards, card inventory, or paid card draws.

### 2.2 Existing storage buckets

| Bucket | Public | Current file limit |
|---|---:|---:|
| `character-art` | Yes | 12 MiB |
| `epiphany-assets` | Yes | 12 MiB |
| `epiphany-assets-private` | No | 12 MiB |
| `player-avatars` | Yes | 3 MiB |

The economy does not need new storage buckets. Card artwork should continue using the existing asset catalog and storage system.

## 3. Hosted migration history versus repository

### 3.1 Hosted migration records

The live `supabase_migrations.schema_migrations` table reports these nine application migrations:

| Version | Name |
|---|---|
| `20261023233115` | `epiphany_player_privacy_v2` |
| `20261024122251` | `add_private_and_shared_player_stories` |
| `20261030091511` | `restrict_character_art_storage_uploads` |
| `20261030101059` | `complete_player_profile_columns` |
| `20261030201651` | `asset_manager_foundation` |
| `20261030201953` | `asset_manager_public_reference_columns` |
| `20261030202518` | `asset_manager_common_image_formats` |
| `20261030202723` | `asset_manager_pending_replacement_links` |
| `20261030221913` | `restore_asset_usage_read_grants` |

### 3.2 Repository migration files

The repository now tracks all nine files corresponding to the nine hosted application migration versions:

- `20261023233115_epiphany_player_privacy_v2.sql` — reconstructed
- `20261024122251_add_private_and_shared_player_stories.sql`
- `20261030091511_restrict_character_art_storage_uploads.sql` — reconstructed
- `20261030101059_complete_player_profile_columns.sql` — reconstructed
- `20261030201651_asset_manager_foundation.sql`
- `20261030201953_asset_manager_public_reference_columns.sql`
- `20261030202518_asset_manager_common_image_formats.sql`
- `20261030202723_asset_manager_pending_replacement_links.sql`
- `20261030221913_restore_asset_usage_read_grants.sql`

The three reconstructed files were added to `main` under the exact versions recorded by Supabase:

1. [`20261023233115_epiphany_player_privacy_v2.sql`](../supabase/migrations/20261023233115_epiphany_player_privacy_v2.sql) — rebuilt from the root privacy-v2 script and confirmed live profile/post SELECT policies.
2. [`20261030091511_restrict_character_art_storage_uploads.sql`](../supabase/migrations/20261030091511_restrict_character_art_storage_uploads.sql) — rebuilt from the live four developer-only Storage policies for `character-art`; it deliberately does not change bucket visibility, size, MIME types, or objects.
3. [`20261030101059_complete_player_profile_columns.sql`](../supabase/migrations/20261030101059_complete_player_profile_columns.sql) — rebuilt from live columns/constraints and the repository's profile-customization script/commit; it adds the visibility and appearance fields but deliberately excludes the root script's 5 MiB bucket update.

**Important provenance:** each file begins with a `RECONSTRUCTED` warning. GitHub history did not contain the original SQL, so none of these files is represented as a byte-for-byte historical recovery. Their SQL is a best-evidence reconstruction of the live outcome and repository history.

## 4. Root-level SQL drift and safety findings

These files are not part of the tracked `supabase/migrations/` sequence:

- `supabase-player-profile.sql`
- `supabase-privacy-migration.sql`
- `supabase-profile-customization-migration.sql`
- `supabase-card-image-views.sql`
- `supabase-telemetry.sql`

They appear to be manual setup/migration scripts from earlier project stages. Some live changes match them, but they are not a reproducible migration baseline.

### 4.1 `supabase-player-profile.sql` — unsafe; do not run

Current file facts:

- 508 lines.
- One `player_profiles` table creation block but 12 repeated `player_posts` creation blocks.
- 12 repeated profile-public-read policy creations and 12 repeated post-public-read policy creations.
- Repeated storage bucket and Storage policy statements.
- Multiple CHECK expressions for hex colors are split across lines before the closing quote and regex terminator.
- Contains the obsolete policies `Profiles are publicly viewable` and `Posts are publicly viewable` with `USING (true)`.

The file's earlier 2026-10-23 revision at commit `c3e03e7823b58821e6efe2d47d8d096822c5893e` was a 51-line setup script. The later file revision at commit `820d2999f590eeb998114a61f6650f5d40ba7273` is the corrupted 508-line version. This confirms that the corruption is in repository history, not merely a rendering issue in the current fetch.

Even if its syntax were repaired, rerunning this old script could reintroduce permissive public-read policies and undermine the live privacy policy. Treat it as archival evidence only.

### 4.2 `supabase-profile-customization-migration.sql` — do not rerun against the current project

This standalone script upserts the `player-avatars` bucket with a 5 MiB limit. The live bucket is currently configured for 3 MiB. Rerunning the script would change that live setting.

Its profile columns overlap with the hosted `complete_player_profile_columns` migration, whose exact original SQL is absent from the repository. Do not use the root script as a substitute for the missing migration source.

### 4.3 Other root-level SQL files

The former `supabase-privacy-migration.sql`, `supabase-card-image-views.sql`, and `supabase-telemetry.sql` bodies are now archived as do-not-run pointers. Their historical contents remain in Git history. The privacy-v2 behavior is represented by the reconstructed timestamped migration; telemetry and card-image framing are represented in the local-only legacy foundation. The CI contract assertions compare their resulting policy and grant boundaries with the captured live catalog. A complete redacted reference snapshot of all nine application tables, columns, constraints, indexes, public policies, Storage policies, relevant grants, RLS flags, and four Storage buckets is stored in `supabase/tests/phase0_expected_catalog.json`; CI regenerates the same snapshot locally and diffs it byte-for-byte after canonical JSON formatting.

## 5. Current access-control shape

- All nine public application tables have RLS enabled.
- Neither `anon` nor `authenticated` has the PostgreSQL `BYPASSRLS` attribute. The `service_role` does, as expected for Supabase's privileged server role.
- The existing player-progress policies scope read/write access to the authenticated owner.
- The current profile and story policies implement public/private visibility rules; the former permissive root SQL body is preserved only in Git history and the working root file is now a do-not-run pointer.
- Asset Manager and card-image-view writes are limited by existing developer-account policies.
- There are no application RPC functions in `public` and no deployed Edge Functions at the time of this audit.

The economy should therefore be implemented in a new non-exposed schema, not by adding wallet columns to `player_progress` or placing directly writable wallet tables in `public`. RLS remains defense in depth, while all balance changes must go through narrowly granted atomic server/database entry points.

### 5.1 Supabase Data API change

Supabase's automatic Data API exposure behavior changed for existing projects on **2026-10-30**. New public-schema tables/functions now require explicit grants to be reachable through the Data API; RLS and grants are separate controls. The economy design must not rely on implicit exposure or default grants.

Reference: [Supabase breaking change — tables are no longer exposed automatically](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).

## 6. Existing Supabase advisor baseline

The read-only advisor checks returned:

### Security

- **Warning:** Leaked Password Protection is disabled in Supabase Auth. This is an existing Auth configuration finding, not a Velorn-specific issue.

Reference: [Supabase Auth password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### Performance

- **3 unindexed foreign keys:** `epiphany_asset_usages.created_by`, `epiphany_assets.created_by`, and `player_stories.reply_to`.
- **14 Auth RLS initialization-plan warnings:** existing policies call `auth.uid()` or `auth.jwt()` in forms that may be evaluated per row; Supabase recommends scalar subselect wrapping where appropriate.
- **6 unused-index notices:** these are observations, not an instruction to drop indexes without workload review.
- **1 multiple-permissive-policy notice:** `epiphany_asset_usages` has more than one permissive SELECT policy for authenticated users.

### Health

- No health lints were returned.

These existing findings were not changed during this audit. They should be tracked separately and must not be mixed into the Velorn migration work without a scoped review.

## 7. Repository configuration and deployment workflow

- No `supabase/config.toml` exists in the repository tree.
- No tracked local Supabase project configuration was found.
- Supabase CLI v3 became the default CLI line in November 2026 and changed database commands to target the local stack by default. Hosted operations require explicit remote targeting and confirmation. Any future CLI-based reconciliation must pin/check the CLI version, explicitly identify the target project, and inspect the reported target before proceeding.

Reference: [Supabase CLI v3 breaking change](https://supabase.com/changelog).

## 8. Required reconciliation actions before Velorn implementation

These actions are ordered to preserve the current live data and prevent false migration history:

1. **Preserve the live schema as the reference.** Obtain a full schema-only snapshot/dump of the connected project, including tables, constraints, indexes, policies, grants, functions, triggers, storage policies, and bucket configuration. Keep secrets and user data out of the snapshot.
2. **Validate the reconstructed migrations in isolation.** The new `.github/workflows/supabase-schema.yml` starts a disposable local Supabase stack, applies `supabase/bootstrap/legacy_foundation.sql`, replays all nine migrations, runs `supabase/tests/phase0_schema_assertions.sql`, then compares the full local catalog against the redacted live reference snapshot. Do not apply the historical versions to the hosted project; they are already recorded as applied.
3. **Canonical bootstrap baseline — implemented.** `supabase/bootstrap/legacy_foundation.sql` captures the pre-migration tables, RLS, grants, telemetry, card-image metadata, and pre-existing bucket settings. It is intentionally local/disposable only and is never applied to production. The clean-room assertions compare exact table/column/constraint/index/policy counts and critical grants against the live inventory.
4. **Quarantine obsolete setup scripts — implemented.** The five unsafe or superseded root-level SQL entry points are now do-not-run pointers; their previous contents remain in Git history. The live 3 MiB avatar limit and privacy policies were not changed.
5. **Local project configuration and repeatable workflow — implemented.** `supabase/config.toml` pins PostgreSQL 17 and `.github/workflows/supabase-schema.yml` pins Supabase CLI 3.1.0. The workflow explicitly starts a disposable local stack and never links or targets the hosted project.
6. **Complete clean-room run and live/catalog comparison.** The CI workflow must pass all assertions and the full redacted catalog snapshot diff. Any unexplained difference must be resolved before the economy migration is created.

### Phase 0 exit criteria

Phase 0 is complete only when:

- Every applied hosted migration version has a matching repository file; reconstructed files are explicitly labelled and are not misrepresented as original historical SQL.
- The reconstructed files pass isolated execution and catalog-equivalence checks against a clean bootstrap baseline.
- No active setup file can silently reopen private player data or overwrite current Storage bucket settings.
- A clean schema snapshot/diff is reproducible from the repository workflow.
- The live project and local migration history agree, or all known differences are explicitly approved and documented.
- No production schema mutation has been used to conceal missing source history.

## 9. What was and was not changed

**Completed:** read-only inspection of the live project, application schema, RLS policies, grants, indexes, constraints, storage buckets/policies, hosted migration versions, Edge Functions, repository migration files, root SQL scripts, and Supabase advisor output. Reconstructed and committed the three missing migration files under their hosted version IDs, with provenance warnings and evidence notes.

**Not performed:**

- No SQL DDL or DML was executed against the project.
- No migration was applied, created in the live database, or marked as applied.
- No Supabase policy, grant, bucket, function, or setting was changed.
- No user or player data was read beyond aggregate inventory/count metadata.
- No hosted database schema, policy, grant, bucket, setting, or player data was changed.
- The first clean-room workflow run is still in progress; no SQL runtime test is claimed until its GitHub Actions run reports success.
- The app fast-check run exposed one test that still read the archived telemetry script; the test now targets the canonical bootstrap and will be re-run.
- Five unsafe/legacy root SQL entry points were replaced with explicit do-not-run pointers; their prior contents remain in Git history.
- No hosted database schema, policy, grant, bucket, setting, or player data was changed.
- No deployment was requested or triggered by this work.

**Conclusion:** The repository now contains all nine hosted migration versions, an explicit local-only legacy foundation, and automated clean-room schema assertions. The historical SQL of three migrations remains unavailable, and the bootstrap is reconstructed from live catalog evidence. Phase 0 remains open until the new GitHub Actions clean-room workflow passes and its resulting catalog is compared with the live schema. No Velorn implementation should begin before that gate is green.
