# Fluentia — Integration Remediation Report

Date: 2026-11-08  
Branch: `main`  
Implementation commit under verification: `9220f70ff8668d768deb9d31c05c505ec3355e44`

## Executive result

**The three functional blockers from the final integration audit have been implemented.** Fluentia now loads its own optional banks when opened, provides a real microphone-based Speaking & Shadowing interaction with explicit fallback states, and turns incorrect Fluentia answers into activity-specific Your Review queues.

The old Arcade shell and shared legacy code have been retained for compatibility. No Vercel deployment was triggered.

## F-01 — First-open activity source readiness

<badge color="success">Implemented</badge>

- Added a dedicated `fluentia` lazy-load group containing only Sound Maze's bank/content modules and the Practice Lab source module.
- Fluentia does not load the full Think Lab or Life Skills bundles to obtain its practice content.
- The app opens Fluentia in a clear loading state, then refreshes the activity inventory only after the lazy group resolves.
- The loader verifies that Sound Maze, Practice Dictation and Speaking & Shadowing adapters registered successfully. Failed or partially initialized source loads clear their script cache and show a retry action.
- Practice Lab's legacy standalone UI no longer mounts invisibly inside the retired Arcade view when its source is loaded for Fluentia.
- Added lazy-loader and browser-smoke coverage for loading the optional sources on Fluentia's first open.

## F-02 — Speaking & Shadowing microphone interaction

<badge color="success">Implemented</badge>

- Replaced the generic speech text input with a microphone control backed by the browser's `SpeechRecognition` / `webkitSpeechRecognition` API.
- Added start and stop controls, live editable transcript capture, and explicit states for unsupported browser/context, denied microphone permission, missing microphone, no detected speech and other recognition failures.
- Kept a manual transcript entry fallback when speech recognition is unavailable.
- The activity evaluates recognised-word matching only. The interface explicitly says it does not assess pronunciation quality.
- The original eight reviewed A1–B2 Practice Lab sample sentences remain the source; no invented C1/C2 content was added.

Manual microphone testing across supported browsers and real devices remains necessary; CI cannot grant or verify a user's microphone permission.

## F-03 — Fluentia-history-driven Your Review

<badge color="success">Implemented</badge>

- Added activity-specific history review adapters for every registered non-review activity. Each adapter retains the source activity's domain, interaction type, skill, evaluator and original question identity.
- Your Review now reads incorrect events from `epiphany-progress.fluentiaHistory` and resolves them back to their canonical source-bank items.
- Review-only adapters remain excluded from ordinary Section Mixed and Fluentia Mix sessions.
- Added `fluentiaReviewState`, keyed by `sourceActivityId:itemId`, to track attempts and mastery without mutating legacy spaced-repetition schedules or XP.
- A correct review answer marks that source question mastered and removes it from the active queue. A later incorrect answer reopens it. Duplicate events do not inflate attempts.
- Existing saved-vocabulary and legacy grammar-review feeds remain available alongside the new history-driven queues.

## F-04 — Legacy Arcade shell

<badge color="warning">Retained intentionally</badge>

The old Arcade DOM, renderer and lazy-load group remain in the repository for compatibility. Arcade is still absent from learner navigation. Practice Lab's old UI mount now checks that the Arcade view is actually active, so loading its data for Fluentia does not mount a hidden duplicate. Removal of the remaining legacy shell is deferred until a separate reference audit proves that no compatibility or shared runtime path depends on it.

## Regression coverage added

- Adapter tests verify history-derived review items preserve source IDs and original interaction semantics, and leave the queue after mastery.
- Progress-bridge tests verify review-state snapshot isolation, mastery transitions and duplicate-event idempotency.
- Fluentia UI tests cover microphone support, permission/unsupported states, editable transcript fallback and source-load retry behavior.
- Lazy-data tests verify Fluentia first-open loads only its own source files, without requesting the full Think Lab/Life Skills bundle.
- Browser smoke now verifies Sound Maze and Practice Lab adapters are registered after opening Fluentia directly.

## CI and release status

The implementation is on `main`. The first run against the implementation found one stale UI-copy assertion; it was corrected. The latest verification run for commit `9220f70ff8668d768deb9d31c05c505ec3355e44` was pending/in progress at the time this report was updated:

- [EPIPHANY checks](https://github.com/stachdriggon-bit/Epihpany/actions/runs/42472780307)
- [Content quality](https://github.com/stachdriggon-bit/Epihpany/actions/runs/42472780395)

Do not treat the migration as release-signed until the latest CI runs are green. After CI, manually verify microphone permission prompts, successful capture, denied permission, unsupported browsers, audio playback, accessibility and lower-powered phone performance. Do not trigger a Vercel deployment while its deployment rate limit is active.
