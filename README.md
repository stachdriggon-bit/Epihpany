# Epiphany — English quests

Static site, no build step. Serve the folder over http(s) (needed for the offline service worker) or just open `index.html`.

Files: `index.html`, `style.css`, `app.js` (logic), `service-worker.js` + `manifest.webmanifest` (installable/offline), and data files: `data.js` (levels, core quests), `data-mistakes.js`, `data-spot.js`, `data-typing.js`, `data-wotd.js`, `data-aha.js`, `data-stories.js`, `data-world.js`.

Progress: localStorage key `epiphany-progress` (export/import available in settings).
After changing any file run `npm run stamp` (updates cache versions automatically) and `npm test`. See `CONTRIBUTING.md`.

World: story missions (fixed) + endless Practice runs (random layout, generated missions, bounded XP). Regions: Village, Market, Station, Home, Park, School.

## v5 changes
- Reader voice: smarter English voice choice (handles Android `en_US`), sentence chunking, ⚙ → Reader voice (voice + speed, saved locally).
- World: tap anywhere on the map to auto-walk, rounded pond with lily pads, bigger props, player ring, talk/pick-up hints, optional name tags (🏷 Names), vignette.
- Mobile header no longer overflows with large XP (shows 12.9k).
- World art: `data-world-sprites.js` holds ~40 vector (SVG) sprites — houses, trees, people with roles, stalls, park and school props. Edit the builder functions there to restyle the whole world; the old canvas drawing remains as a fallback.
- Animation: NPC breathing/hopping, swaying trees, swinging swing, floating kite, walking hop + facing for the player (idle ≈10 fps; off with prefers-reduced-motion).

## v7 review fixes
- Stories: fixed a crash that stopped every story from opening (`page is not iterable`). All 52 stories now play to the result screen.
- World: picked-up items are restored after every mission (previously 4 story missions became impossible after a fetch mission). Scene backgrounds (SVG) for all six regions.
- Data: repaired one malformed Mistakes item, removed repeated questions, fixed a duplicate answer and a duplicate Spot sentence, rewrote three very short C1/C2 stories.
- Account: callback URLs work on sub-folder hosting, `auth-callback.html` now reads errors from the URL fragment (`#error=...`) and shows clear messages.
- `supabase-privacy-migration.sql` v2: v1 only restricted signed-in users, so anonymous visitors could still read private profiles/posts. Re-run v2.

## v9 review fixes
- openView / story search used $ instead of $$ (navigation threw errors).
- Profile page horizontal overflow (hidden privacy checkbox).
- Create Your Story: word-bank count on result screen; coach checks for was/were and past negatives.
- Story search now searches all levels; heading focus outline removed.

## Performance and offline behavior
- Stories, World data/art, Arcade practice tools, Think Lab, Life Skills, and the expanded Arabic translation catalogue load on first use rather than on every initial page visit.
- The app shell and core learning data are cached separately from deferred features. A deferred feature is available offline after it has loaded successfully once while online.
- Google Fonts stylesheets/font files and the Supabase CDN library use a cache-first service-worker strategy after their first successful online load. If a font has not been cached yet, the site falls back to system fonts; fonts are cached for offline reuse, not bundled as local font binaries.
- Optional anonymous usage/error telemetry remains disabled until the learner opts in.

## Content quality and discovery
- `npm test:fast` runs structural checks for question duplicates, answer indexes, story-choice translations, and Word of the Day translations.
- GitHub Actions runs the content quality tests on pushes to `main` and on pull requests.
- `ARABIC-STYLE-GUIDE.md` defines the consistent simple-Modern-Standard-Arabic policy.
- The landing screen lets visitors preview Epiphany before entering the app; `wotd-card.html` generates a daily Word of the Day PNG for sharing.
