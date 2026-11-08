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


## Long-session lifecycle review — 2026-11-08

### Confirmed issue fixed

The Arcade Practice Lab could leave the browser's speech-recognition session running when the learner navigated to another view, hid the page, or closed the tab. A delayed `onresult`, `onerror`, or `onend` callback from a replaced recognition instance could also update the current UI.

The Practice Lab now:
- aborts microphone recognition when leaving Arcade, when the page becomes hidden, and on `pagehide`;
- stops shared generated speech at the same lifecycle boundaries;
- stops active media when switching between Speaking and Dictation;
- detaches callbacks before aborting and checks the active recognition instance before accepting events.

A regression test covers the cleanup hooks and stale-callback guards.

### Other lifecycle findings

- **World:** movement, auto-walk, hold-repeat, idle timeout, and animation-frame work are explicitly cancelled when returning to regions or closing World. Its document/window listeners are installed once at application startup and are gated by the current World session.
- **Fluentia:** speech recognition is stopped on answer submission, when leaving a session, when the view changes away from Fluentia, and when the page becomes hidden. Leaving or re-entering the view abandons any unfinished session rather than retaining it invisibly. Recognition callbacks are detached before aborting and stale callbacks from replaced instances are ignored. Its delegated listeners are installed once on the persistent Fluentia root/document.
- **Think Lab and its small game modules:** event handlers are delegated from persistent roots; no per-round timer or observer accumulation was found in the inspected entry points.
- **Adaptive engine:** owns its PerformanceObserver and browser listeners and exposes a `destroy()` cleanup path. It is instantiated as a page singleton.
- **Translation observers, icon observer, and navigation observers:** these are page-lifetime observers attached once to stable application roots. They are not created per game entry. Their broad observation scopes and callback costs remain candidates for future profiling, but the current inspection did not establish a per-navigation leak.
- **Cards:** the gallery IntersectionObserver disconnects before refreshing its observed card set. The 60-second daily-count interval and global pointer/resize listeners are page-lifetime singletons; they are low-frequency/global work, not per-session accumulation. The particle animation loop is demand-driven and stops when no particles, spawner, or ambient effect remains.

### Limits

This was a source-level lifecycle review. It did not include heap snapshots, detached-DOM profiling, microphone hardware testing, or repeated long-session profiling in a real browser. Those remain necessary before making quantitative memory/performance claims.


### Additional confirmed issue fixed — Fluentia

The lifecycle review found that leaving Fluentia through the main navigation did not dispose of an unfinished session or abort its speech-recognition instance. The in-view Back action also cleared the session reference without asking the shared engine to abandon it. Re-entering Fluentia could therefore replace the visible UI while retaining stale session state.

The fix now:
- abandons unfinished sessions on view exit and on the in-view Back action;
- clears the active session state when the learner reopens Fluentia;
- aborts microphone recognition and stops shared generated speech when leaving Fluentia, submitting an answer, when the document becomes hidden, and on `pagehide`;
- detaches recognition callbacks before aborting and ignores late events from obsolete recognition instances.

Regression contracts cover navigation exit/re-entry, Back cleanup, hidden-page microphone cleanup, and stale recognition callbacks.


## Runtime lifecycle profiling — 2026-11-08

### Automated same-tab profiling

A dedicated Playwright/Chromium test now warms Fluentia, Think Lab, and World, then enters and exits each feature six additional times in the same browser tab. It records Chromium DevTools Protocol measurements after forced garbage collection at the warm baseline and after cycles 2, 4, and 6:

- JavaScript heap used (MB)
- DOM node count and page element count
- JavaScript event-listener count
- document/frame counts
- World container child count

The test is included in `npm run test:browser`, so the normal EPIPHANY checks execute it after the existing browser smoke suite. It also fails on uncaught page errors and missing core CDP metrics.

### Interpretation and limits

The measurements are diagnostic, not a pass/fail leak threshold. Chromium heap size and listener/node counts vary with browser version, lazy-loaded content, garbage collection, and CI machine pressure; a single CI run cannot establish a production leak or a real-device performance improvement. Compare the full baseline and later samples, and investigate sustained growth rather than a one-off increase.

This automation does **not** yet provide heap-snapshot dominator analysis, reliable detached-DOM attribution, microphone hardware validation, or representative mobile-device CPU/memory measurements. Those require a headed browser session and/or real devices. The report deliberately makes no quantitative improvement claim. The repeatable same-tab route is now available for future before/after comparisons.


## Follow-up lifecycle investigation — 2026-11-08

### Confirmed navigation-listener accumulation fixed

The first same-tab runtime profile showed a repeatable increase in Chromium's JavaScript event-listener count during feature navigation. Source inspection identified a concrete cause in `openView()`: every visit attached a one-shot `keydown` listener to the destination heading, but the listener was only removed if a key was pressed while that heading retained focus. Normal navigation did not guarantee that event, so listeners accumulated on persistent headings.

The cleanup is now handled by one delegated document-level `keydown` listener installed once at startup. `openView()` only applies the focus class and focuses the heading; it no longer creates a per-entry listener. A regression contract test protects this boundary.

### More precise DOM-node diagnostics

The runtime profile now records attached text-node count alongside element count. Chromium's CDP `Nodes` metric includes more than elements, so this helps distinguish growth in attached text nodes from growth in detached/otherwise retained nodes. It remains a diagnostic measure, not proof of a leak. The next post-fix CI profile should be compared against the previous baseline before drawing conclusions about the remaining DOM-node increase.


## Detached-DOM retention profiling — follow-up

The same-tab Chromium profile now installs a test-only `MutationObserver` before application scripts run. When elements are removed, it records weak references and compact element labels (tag, id, and a few classes). At each forced-GC checkpoint it dereferences those weak references and counts only nodes that remain alive **and** are still detached; nodes reinserted into the document are excluded.

This is a diagnostic probe, not a production observer and not a strict leak assertion. The report includes the number of tracked removals, live detached elements, and the most common retained element labels at baseline and each checkpoint. A rising count with repeatable labels provides a starting point for targeted retaining-path analysis. Weak references can be affected by GC scheduling, and the probe is capped to avoid unbounded test overhead.
