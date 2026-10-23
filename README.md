# Epiphany — English quests

Static site, no build step. Serve the folder over http(s) (needed for the offline service worker) or just open `index.html`.

Files: `index.html`, `style.css`, `app.js` (logic), `service-worker.js` + `manifest.webmanifest` (installable/offline), and data files: `data.js` (levels, core quests), `data-mistakes.js`, `data-spot.js`, `data-typing.js`, `data-wotd.js`, `data-aha.js`, `data-stories.js`, `data-world.js`, `data-minigames.js` (Directions town map).

Progress: localStorage key `epiphany-progress` (export/import available in settings).
When you change any file, bump `CACHE_NAME` in `service-worker.js`.

Mini-games: Order the Story (built from the stories), Word Match (your saved words + Word of the Day), Directions (town map, route text generated from structured steps).
