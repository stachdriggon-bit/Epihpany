# Think Lab Progression and Daily Challenge — Integration Plan

**Status:** Audit complete; implementation not yet started.
**Branch:** `main`
**Scope:** Existing Think Lab games and their shared learner-progress integration.

## Why this phase exists

Think Lab already has a shared learner-profile bridge, adaptive skill signals, an idempotent reward ledger, a skill map, and a next-challenge recommendation. EPIPHANY also already has a separate Arcade Daily Challenge. This phase must strengthen those existing systems rather than create parallel progress, recommendation, or reward systems.

The current review found these integration gaps:

1. The skill insight map still contains a `reading → detective` recommendation target, while `detective` is not one of the eleven currently displayed Think Lab game IDs. Older saved reading signals could therefore produce an invalid launch target.
2. The recommendation is skill-to-fixed-game based. It does not use a consistent per-game history across the current eleven games, so it cannot reliably avoid repeatedly recommending the same game or recognize which games the learner has recently completed.
3. Shared learner progress and XP are saved, but several puzzle modules reset their level/puzzle index and in-progress interaction state when opened again. Durable learner results are not equivalent to session resume.
4. A daily challenge exists in Arcade, but Think Lab has no distinct daily puzzle/session entry point. The two experiences must remain clearly separated unless a later product decision explicitly unifies them.

## Approved guardrails

- Preserve all approved question/puzzle banks and their content.
- Preserve CEFR eligibility and never fall back to a different level or invent content.
- Preserve existing XP, quest, reward, and duplicate-reward rules. Do not introduce a second reward path.
- Keep stable source/game IDs and existing profile compatibility.
- Reuse the existing `epiphany-progress` profile and its established save/sync path; do not add an independent storage database.
- Keep each game's mechanics and renderer independent. Shared progress contracts must not force all games into one interaction format.
- Do not redesign Cards, World, The Resonance, navigation, or the overall Think Lab visual identity.
- Do not remove the legacy Arcade compatibility shell as part of this phase.
- Do not trigger a Vercel deployment. Require repository CI before considering implementation complete.

## Implementation sequence

### 1. Progress contract and game registry

Create one canonical registry for the currently playable Think Lab games, including stable ID, supported skill attribution, level model, and progress capabilities. Add a shared progress contract for recording game starts, meaningful progress, puzzle/round completion, and best-known position. Keep game-specific snapshots versioned and validate them before restoration.

### 2. Save and resume integration

Integrate the contract with each playable game without changing its content or rules. Restore only valid snapshots for the same game, bank/version, and eligible level. Completed puzzles must not be replayed as unfinished; corrupted or stale snapshots must fail safely to the level picker. Preserve the current result/reward ledger so restoring a session cannot award duplicate XP or quests.

### 3. Recommendation reconciliation

Use the canonical game registry and saved game history to ensure every recommendation points to a currently playable destination. Combine reliable skill signals with recent game usage and completion state. Avoid unsupported skill-to-game mappings, repeated recommendations where alternatives exist, and recommendations for locked/unavailable content. Retain a sensible starter recommendation when there is insufficient evidence.

### 4. Think Lab Daily Challenge

Add a distinct Think Lab daily entry point using only approved existing content. Select the daily game and challenge deterministically for the date, respect the learner's unlocked CEFR level, and enforce one completed attempt per day. Keep it separate from Arcade Daily Challenge. Reuse existing reward/idempotency rules; do not create bonus XP or a parallel reward ledger without an explicit product decision.

### 5. Verification and documentation

Add unit tests for registry integrity, progress schema validation, save/restore, corrupted/stale snapshots, duplicate reward prevention, recommendation target validity, recommendation rotation, deterministic daily selection, date boundaries, CEFR eligibility, and one-attempt enforcement. Extend browser smoke coverage for the learner-facing flows. Run the fast, unit, browser, syntax, and content-quality checks through GitHub Actions.

## Exit criteria

This phase is complete only when:
- all eleven current Think Lab game entries resolve to valid adapters and progress metadata;
- progress survives a reload and resumes only when its snapshot is valid;
- all recommendations resolve to playable destinations and respect learner eligibility;
- the Think Lab daily challenge is stable for a date, uses approved content, and cannot be completed twice that day;
- existing XP/reward totals, CEFR access, and content banks remain unchanged apart from the intended progress records;
- required CI workflows pass.

Manual phone/desktop and real-device accessibility checks remain separate release sign-off items; CI must not be described as replacing them.
