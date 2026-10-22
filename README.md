# Epiphany — redesigned interface

Static site, no build step. Open `index.html`.

Files: `index.html` (structure), `style.css` (design system), `app.js` (logic), `data.js` (levels, quests, Arabic explanations — unchanged content).

Progress is stored in localStorage key `epiphany-progress` (same format as before, so existing progress carries over).

Structure: Play (one recommended quest + daily goal + level path + all quests), Words, Trophies. Quests open full-screen with a bottom feedback sheet.
