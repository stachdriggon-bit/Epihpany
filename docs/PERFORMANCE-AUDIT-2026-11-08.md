# EPIPHANY Performance Audit — 2026-11-08

## Scope

Static review of the current `main` branch, focused on initial loading, deferred feature loading, long-lived browser work, World rendering, and offline asset delivery. The latest GitHub Actions run for the pre-audit commit passed unit/static checks, JavaScript syntax checks, Chromium installation, Browser Smoke, and content-quality checks.

## Findings

- The application is a no-build static PWA. The initial document references 32 script tags and six stylesheet files; scripts are deferred. Feature data and several feature styles are already loaded on demand through `lazy-data.js`.
- The largest inspected source files are `app.js` (about 668 KB of UTF-8 text), `style.css` (about 340 KB), and the Arabic translation catalogue (about 586 KB). The translation catalogue is already lazy-loaded.
- `app.js` remains a large monolithic file. Splitting it into modules would affect many global contracts and script-order assumptions, so it is not a safe one-commit optimization without a separate migration plan and dedicated browser coverage.
- `style.css` contains many repeated selector blocks and responsive sections. These appear to include intentional late overrides; automatic deduplication could change cascade behavior. No mass CSS rewrite was made.
- World has a continuous ambient redraw loop while animation is enabled. The adaptive engine already detects low-memory devices and runtime long-task pressure, but World previously considered only the operating-system reduced-motion preference.

## Change applied

World ambient motion now also respects the adaptive engine's `lowResources` and `runtimePressure` signals. On constrained devices or during a reduced-motion preference, the World renderer avoids scheduling its recurring idle redraw loop; movement redraws still run when needed. Idle character breathing, animated scenery, speech-bubble bobbing, and the pulsing target marker use the same motion decision.

The app script cache-busting reference and service-worker shell cache name were advanced together.

## Deliberately not changed

- No broad split of `app.js`.
- No automatic CSS selector consolidation.
- No changes to image quality, world artwork, or gameplay timing.
- No changes to the Arabic translation loading strategy.

These changes need profiling and regression tests in a dedicated batch before they are safe.

## Validation

The new regression contract test checks that World uses the adaptive motion policy and that the idle redraw scheduler is gated by the resulting animation flag. GitHub Actions is the authoritative runtime validation for this commit. No Lighthouse, real-device CPU, memory, or network-throttling measurements were available during this repository-only audit; the report does not claim measured percentage improvements.
