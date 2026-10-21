# Epiphany ✦

**An interactive English-learning adventure — from A1 to C2.**

Epiphany is a responsive, game-inspired English learning website designed around short quests, immediate feedback, vocabulary discovery, and a visible journey through the CEFR levels.

## Current prototype

- Adventure dashboard with XP, quests, vocabulary, streak, and level progress
- Six CEFR worlds: A1, A2, B1, B2, C1, and C2
- Multiple playable activities: vocabulary, grammar, real-life dialogue, comprehension, spelling, and advanced nuance
- Immediate answer feedback with explanations
- Optional Arabic task guidance and question-specific explanations for all 30 sample questions, with English kept as the learning language
- Daily quest counter resets using the learner’s local calendar day
- Streak dates use local time, and completed worlds are tracked before XP-level changes
- XP and progress saved locally in the browser
- Personal word vault and achievement collection
- Responsive layout for desktop and mobile
- No build step or framework required

## Run locally

Open `index.html` in a browser, or serve the folder with any static web server.

## Important notes

This is an early, front-end-only prototype. Progress is saved in the current browser using localStorage; it is not yet synchronized between devices or user accounts. The sample activities demonstrate the interaction model and are not yet a complete CEFR-aligned curriculum. A production release should add a much larger reviewed question bank, skill-based placement and progression, spaced repetition, listening audio, speaking practice, accessibility testing, and persistent accounts if cross-device progress is desired.

## Files

- `index.html` — app structure
- `style.css` — responsive visual system
- `app.js` — sample content, game logic, and local progress
