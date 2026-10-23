# Epiphany — English quests

Static site, no build step. Serve the folder over http(s) (needed for the offline service worker) or just open `index.html`.

Files: `index.html`, `style.css`, `app.js` (logic), `service-worker.js` + `manifest.webmanifest` (installable/offline), and data files: `data.js` (levels, core quests), `data-mistakes.js`, `data-spot.js`, `data-typing.js`, `data-wotd.js`, `data-aha.js`, `data-stories.js`, `data-world.js`.

Progress: localStorage key `epiphany-progress` (export/import available in settings).
When you change any file, bump `CACHE_NAME` in `service-worker.js`.

World: story missions (fixed) + endless Practice runs (random layout, generated missions, bounded XP). Regions: Village, Market, Station, Home, Park, School.

## v5 changes
- Reader voice: smarter English voice choice (handles Android `en_US`), sentence chunking, ⚙ → Reader voice (voice + speed, saved locally).
- World: tap anywhere on the map to auto-walk, rounded pond with lily pads, bigger props, player ring, talk/pick-up hints, optional name tags (🏷 Names), vignette.
- Mobile header no longer overflows with large XP (shows 12.9k).
- World art: `data-world-sprites.js` holds ~40 vector (SVG) sprites — houses, trees, people with roles, stalls, park and school props. Edit the builder functions there to restyle the whole world; the old canvas drawing remains as a fallback.
- Animation: NPC breathing/hopping, swaying trees, swinging swing, floating kite, walking hop + facing for the player (idle ≈10 fps; off with prefers-reduced-motion).
