# EPIPHANY legacy foundation bootstrap

This directory captures the pre-migration schema that historically existed outside the tracked migration sequence.

For a **fresh local/disposable database only**:
1. Start the local stack using the pinned CLI in `.github/workflows/supabase-schema.yml`.
2. Apply `legacy_foundation.sql` as the local database owner.
3. Run `supabase migration up` to replay the nine timestamped migrations.
4. Run `supabase/tests/phase0_schema_assertions.sql`.

The bootstrap recreates player_progress, player_profiles, player_posts, telemetry,
card-image views, and the two pre-existing Storage buckets/policies.

**Never run this bootstrap against production.** Production already has these objects
and live player data. The script is for clean-room reconstruction and CI only.
The root-level SQL files are archived do-not-run pointers.

The player_progress definition is reconstructed from the live catalog because no
original creation SQL was found in repository history. It remains learning progress,
not a wallet or Velorn ledger.
