# Adding to Epiphany without breaking it

## The 3-step routine (every change)
1. Make your change.
2. `npm run stamp` — refreshes the `?v=` hashes in `index.html` and `CACHE_NAME` in `service-worker.js`
   (no more bumping versions by hand; users always get the new files).
3. `npm test` — must be green before you publish.
   `npm run test:fast` runs only the instant checks (no browser, < 1 s) while you work.
   `npm run check` does 2 + 3 together.

First time only: `npm install` then `npm run test:install`.

## What the tests protect
| Test | Stops this from happening again |
|---|---|
| `static.test.js` → parse | a typo that kills a whole script |
| `static.test.js` → `$`/`$$` | `$('…').forEach` (one element has no `forEach`) — the bug that threw on every load |
| `static.test.js` → data-view | a menu button pointing at a page that doesn't exist |
| `static.test.js` → duplicate ids | two elements with the same `id` |
| `static.test.js` → offline | a new `.js`/`.css` file missing from `CORE_ASSETS` (works online, breaks offline) |
| `static.test.js` → stamps | forgetting to bump versions |
| `static.test.js` → navigation CSS | navigation layout rules scattered around `style.css` |
| `first-visit.test.js` | landing page, language choice and welcome dialog stacked on each other; returning visitors forced through the landing page again |
| `smoke.test.js` | service worker / offline / Arabic lazy-loading regressions |
| `repository-contracts.test.js` | broken local script/style references, navigation buttons without a matching view, missing lazy files, and offline-cache entries that point to missing files |
| `navigation.test.js` | any menu button that can't be clicked or doesn't open its page, at 4 screen widths, plus any runtime error |

## Rules of thumb
- **New page/view:** add `<section class="view" id="NAME-view">` and a button with `data-view="NAME"`. Nothing else is needed for navigation.
- **New menu/dock/sidebar with `data-view` buttons:** register its container in `ENTRY_POINTS` in `tests/navigation.test.js`
  (a test fails until you do, so it can never ship untested).
- **Navigation CSS:** only inside the `NAVIGATION (single source of truth)` section at the end of `style.css`.
  Never put `overflow:auto/hidden` on `.tabs` or `.top-in` — it clips the dropdowns.
- **Don't use `!important` to win a CSS fight.** Find the older rule and delete it instead.
- **Helpers:** `$('sel')` = one element, `$$('sel')` = array.
- **New data/script file:** add it to `index.html` *and* `CORE_ASSETS` in `service-worker.js`, then `npm run stamp`.
- **Fonts/libraries from a CDN** don't work offline. Prefer hosting them in the repo.
- Keep new code in small, readable functions (one statement per line) in a new file per feature rather than extending `app.js`.

## Lazy-loaded files (lazy-data.js)
`npm run stamp` also refreshes the `?v=` hashes inside `lazy-data.js` and regenerates `LAZY_ASSETS` in `service-worker.js`
(background offline cache for Stories, World, Think Lab…). To add a lazy file, list it in a group in `lazy-data.js`, then run `npm run stamp`.
The Arabic catalogue is deliberately never precached (it loads only when Arabic help is on).

## Browser history
Page changes are tracked by watching `.view.is-active` in `navigation-enhancements.js`, not by click handlers
(`app.js` stops the click for the top tabs). Anything that switches page therefore gets a Back-button entry automatically.
