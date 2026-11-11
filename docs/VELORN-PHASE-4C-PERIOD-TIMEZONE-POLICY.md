# Velorn Phase 4C — Account Timezone and Period Boundaries

## Approved product policy

- A daily period begins at midnight in the player's account timezone.
- A weekly period begins Saturday at midnight in the player's account timezone and ends at the next Saturday midnight.
- If the account has no valid IANA timezone, the server uses UTC.
- The exact UTC start/end instants are calculated independently from local calendar boundaries. The system never assumes that a local day is always 24 hours or a local week is always 168 hours.

## Timezone source and trust

The account timezone is stored as `timezone_name` in Supabase Auth user metadata. The PWA may suggest the device's IANA timezone after authentication; it preserves other user metadata. This is a preference hint, not a trusted value: the server checks it against PostgreSQL's `pg_timezone_names` catalog and falls back to UTC when it is missing or invalid.

Guest sessions do not have a Velorn account timezone and remain outside the reward economy.

## Server contract

`public.economy_resolve_mission_period(user_id, period_type, reference_time)` is service-role-only. It returns the validated timezone, a stable local period key, and exact UTC period boundaries. Daily keys use `daily:YYYY-MM-DD`; weekly keys use `weekly:YYYY-MM-DD`, where the date is the local Saturday anchor.

The resolver does not create boards, assign templates, change validator mapping, process claims, or enable the economy. Board generation must persist the returned timezone and UTC boundaries into the immutable board record. The current economy remains disabled until the remaining validator, board, claim, and operational gates are completed.

## DST verification

The clean-room SQL contract covers a 23-hour spring-forward day and a 167-hour Saturday-to-Saturday week in `America/New_York`, as well as invalid-timezone fallback to UTC and service-role-only permissions.
