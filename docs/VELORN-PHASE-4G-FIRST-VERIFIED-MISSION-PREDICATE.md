# Velorn Phase 4G — First Verified Mission Predicate

## Status

The first real mission predicate is now versioned as verified and assignable, without enabling the economy or creating player boards.

## Verified contract

- Mission: `solve_a_challenge`
- Assignable template version: 3 (versions 1 and 2 remain immutable historical records)
- Verified predicate mapping version: 2
- Predicate key: `solve_a_challenge_odd_one_out_v1`
- Source / experience / activity: `think_lab` / `think_lab` / `odd_one_out`
- Event type: `game_session_completed`
- Validator: `odd-one-out-rotated-20261110-v2`
- Required mode: `challenge`
- Accepted challenge tiers: A1–C2
- Completed question count: 1–12
- Correct + incorrect answers must equal the question count
- No accuracy threshold: a fully completed session with zero correct answers qualifies

The event is emitted only after the authenticated, server-owned Odd One Out session has been completed. The browser does not submit the answer key, score, user ID, or event evidence to the mission processor.

## Verification

The Phase 4G clean-room test uses the actual verified template and mapping rather than creating a substitute predicate fixture. It checks:

- service-role-only evaluator execution;
- the exact validator event contract and successful Challenge-mode progress;
- completion with zero correct answers;
- rejection of a trusted Steady-mode event;
- idempotent event replay;
- no partial daily or weekly board when the verified pool is insufficient;
- no wallet, ledger, claim, or achievement writes;
- economy remains disabled after the test.

All test data and the temporary economy-gate change are enclosed in a transaction that rolls back.

## Remaining catalogue gap

This verifies one daily mission only. The production catalogue still has only one verified daily template and no verified weekly templates. The board generator therefore returns `not_ready` and cannot create a partial board.

The deployed Edge Function inventory contains the authenticated Odd One Out validator, its separate guest validator, and the mission-claims endpoint. The guest validator intentionally does not create trusted activity events and is not a source of Velorn eligibility. No other game currently has a deployed trusted validator contract. The other approved mission templates and all achievements remain non-assignable until their own server-owned evidence and predicates are implemented and tested.

## Deliberately not enabled

- No PWA wallet, board, or claim integration.
- No user-facing balance or mission board.
- No real claim or Velorn issuance.
- No guest-to-account conversion or local balance import.
- `economy_enabled` remains `false`.

## Next phase

Implement trusted server-side validators for additional eligible EPIPHANY activities, then map only objectives that their evidence can prove fairly. A board must not be enabled until at least four distinct verified daily templates and three distinct verified weekly templates exist.
