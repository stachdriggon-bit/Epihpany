# Adding to EPIPHANY without breaking it

## The development check routine

1. Make a focused batch of related changes.
2. Run `npm run test:fast` while iterating. It runs the fast Node-based structural, content, lazy-loading, readiness, telemetry and diagnostics checks; it does not launch a browser.
3. Before considering the batch complete, run:
   ```bash
   npm run check
   ```
   This validates local asset references with `npm run stamp`, then runs the complete unit/static and browser test suites. GitHub Actions on `main` is the final CI confirmation.

First time only: run `npm install` and `npm run test:install` to install Chromium for browser tests.

### Asset versions and offline registration

The `stamp` script is a validator, not a file generator: it checks that local JavaScript and CSS assets referenced by `index.html` exist and have a `?v=` cache-busting value. It does not generate hashes, edit version strings, or rewrite the service-worker lists.

When changing an existing core asset, update its `?v=` value in `index.html`. When changing a lazy-loaded asset, update the matching versioned URL in `lazy-data.js`. If the offline shell or cache contents change, update `CACHE_NAME` in `service-worker.js`. Keep the service-worker `CORE_ASSETS` and `LAZY_ASSETS` allowlists aligned with the loading architecture.

## What the current tests cover

| Test | Main contract |
|---|---|
| `tests/repository-contracts.test.js` | Local script/style references, navigation destinations, lazy-file registration and offline-cache entries |
| `tests/content-quality.test.js` | Authored learning-content structure and quality rules |
| `tests/lazy-data.test.js` and `tests/data-readiness.test.js` | Deferred loading, feature readiness and retry behavior |
| `tests/diagnostics.test.js` | Developer-only diagnostics authorization, sanitization and in-memory behavior |
| `tests/service-worker-cache.test.js` | Service-worker cache behavior and diagnostic-session boundaries |
| `tests/browser-smoke.js` | Real Chromium application smoke coverage |
| `tests/runtime-profile.js` | Repeated same-tab feature navigation and runtime-retention measurements |

The complete unit command also runs the remaining focused tests in `tests/`. The browser suite is separate so fast checks can be used during development.

## Rules of thumb

- **New page/view:** add the matching view container and a navigation control using the established `data-view` contract; cover the route in the relevant navigation/browser tests.
- **New core script or stylesheet:** add the reference to `index.html` and the file to `CORE_ASSETS` in `service-worker.js`.
- **New lazy feature asset:** register it in the appropriate group in `lazy-data.js` and in `LAZY_ASSETS` in `service-worker.js`. Do not add optional feature banks to the initial HTML or core cache.
- **Navigation CSS:** keep navigation rules in the designated navigation section at the end of `style.css`; avoid scattering competing overrides.
- **Avoid CSS escalation:** do not use `!important` to win a cascade conflict without first checking the existing rule.
- **Helpers:** `$('sel')` returns one element; `$$('sel')` returns an array.
- **CDN resources:** do not assume they are available on a first offline visit. The service worker can cache selected resources after a successful online fetch; critical first-install assets should be hosted locally.
- Keep new code in small, readable functions and prefer a focused feature module over extending the already large `app.js`.

## Lazy-loaded files

Feature data and styles are grouped in `lazy-data.js`. Each feature should load only its own required assets and shared dependencies. The service worker caches optional files only after actual use or intentional prefetch; the `LAZY_ASSETS` list is an allowlist, not a precache list.

The Arabic translation catalogue is intentionally loaded on demand rather than included in the initial shell.

## Browser history

Page changes are tracked by `navigation-enhancements.js` observing the active view, rather than relying only on navigation click handlers. Preserve this behavior when adding or changing navigation routes.
