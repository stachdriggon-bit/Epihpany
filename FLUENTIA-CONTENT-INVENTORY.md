# Fluentia — Phase 1 Repository Inventory and Content Map

Audit date: 2026-11-07
Branch inspected: `main`
Related plan: [FLUENTIA-IMPLEMENTATION-PLAN.md](./FLUENTIA-IMPLEMENTATION-PLAN.md)
Phase status: **Completed as a source audit and documentation deliverable**
Implementation status: **No Arcade/Fluentia product code was changed in this phase**

## 1. Executive findings

The current Arcade has a useful content base, but its structure is fragmented across:
- six core question banks in `data.js` and `data-expansion.js`;
- three independent learner-error banks (`data-mistakes.js`, `data-spot.js`, `data-typing.js`);
- six mini-game modes in `app.js`, with Directions data in `data-minigames.js`;
- a separately lazy-loaded Speaking & Listening Lab in `practice-lab.js`;
- dynamic learner vocabulary and Word of the Day sources.

The current Arcade landing view exposes **15 activity entries** in five legacy groups (Words, Grammar, Reading & Listening, Challenge and Mini-games). Your Weak Spots is additionally reachable through the personalized recommendation/review surface, and Speaking & Listening Lab is mounted separately when Arcade is opened.

The approved six-domain Fluentia structure can absorb these activities without deleting their useful mechanics. The main integration risks are:
1. Meaning Detective is internally keyed as `listening`, but is a reading/comprehension exercise with no audio playback.
2. Directions is a text-instruction/map task, not an audio-listening activity.
3. Order the Story currently loads and reuses the separate Stories library. Its sequencing mechanic can be retained, but its Fluentia content source must be decoupled from Stories.
4. Speaking & Listening Lab has only eight sample sentences (A1–B2), stores statistics separately, and does not measure pronunciation quality.
5. Mini-game completion awards global XP/quest progress, but its results are not currently represented as a common, detailed domain/skill performance record.
6. The main content-quality suite does not currently load all three independent learner-error banks, Directions data or the Speaking & Listening Lab.

## 2. Current Arcade structure

### Legacy groups and their visible activities

The current category registry in `app.js` is:

| Existing group | Current activities | Count |
|---|---|---:|
| Words | Word Collector, Word Detective, Word Match | 3 |
| Grammar | Sentence Shaper, Common Mistakes, Spot the Mistake, Type It | 4 |
| Reading & Listening | Lost in London, Meaning Detective, Order the Story, Directions | 4 |
| Challenge | Nuance Navigator | 1 |
| Mini-games | Speed Round, Sound & Picture Match, Sentence Builder | 3 |
| **Total visible entries** |  | **15** |

The six mini-game implementations are `speed`, `audioImage`, `sentenceOrder`, `match`, `order` and `directions`. Three appear in the legacy Mini-games group; Word Match, Order the Story and Directions appear in other legacy groups.

### Runtime and loading

- `index.html` loads `data.js`, `data-mistakes.js`, `data-spot.js`, `data-typing.js`, `data-minigames.js`, `data-expansion.js`, `lazy-data.js` and `app.js` as core scripts.
- `lazy-data.js` places `practice-lab.js` in the `arcade` lazy-load group.
- Stories data is lazy-loaded separately. The current Order the Story activity requests the Stories group when it starts.
- Consequently, most Arcade question banks are currently part of initial core data loading; only the Practice Lab is deferred as an Arcade-specific script. Phase 3/5 should preserve or improve the existing adaptive/lazy-loading behavior rather than add more eager startup work.

## 3. Verified bank inventory

Counts below were derived from the current source data after the existing merge/deduplication logic where applicable. They are inventory facts, not a claim that CI or browser tests were run.

### Six core question banks

The six core banks are assembled from:
- five seed questions per bank in `data.js`;
- three additional hand-authored questions per bank;
- 214 entries in `LEVEL_QUESTION_BANK`;
- 324 entries in `EPIPHANY_EXPANSION`;
- 744 authored tuples across the expansion passes in `data-expansion.js), followed by its in-file duplicate guard;
- two additional C2 questions (Grammar and Meaning Detective).

Final loaded counts after the existing data expansion and duplicate filtering:

| Current activity | Internal key | Fluentia destination | Total | A1 | A2 | B1 | B2 | C1 | C2 | Untagged |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Word Collector | `vocabulary` | Wordcraft | 230 | 37 | 37 | 37 | 37 | 37 | 37 | 8 |
| Sentence Shaper | `grammar` | Sentence Studio | 230 | 37 | 37 | 37 | 37 | 37 | 37 | 8 |
| Lost in London | `story` | Real World | 218 | 35 | 35 | 35 | 35 | 35 | 35 | 8 |
| Meaning Detective | `listening` | Textwise | 218 | 35 | 35 | 35 | 35 | 35 | 35 | 8 |
| Word Detective | `spelling` | Wordcraft | 185 | 28 | 29 | 28 | 27 | 33 | 32 | 8 |
| Nuance Navigator | `advanced` | Fine Sense | 218 | 35 | 35 | 35 | 35 | 35 | 35 | 8 |
| **Total** |  |  | **1,299** |  |  |  |  |  |  | **48** |

Notes:
- The eight untagged entries in each core bank are retained in the source, but ordinary `startGame` selection uses the selected CEFR-level pool. They should not silently leak into a level-specific Fluentia session.
- Word Detective's lower total reflects duplicate filtering in the existing expansion process; do not pad or copy items merely to make its count match the other banks.
- Meaning Detective's `listening` key is a legacy identifier. Its learner-facing prompt explicitly asks the player to read a message and identify details/meaning; it does not currently play audio.

### Independent banks

| Current activity | Source | Verified content | CEFR coverage | Notes |
|---|---|---:|---|---|
| Common Mistakes | `data-mistakes.js` → `MISTAKE_QUESTIONS` | 120 | 20 per level, A1–C2 | Structured error patterns, explanations and identifiers; feeds adaptive grammar-error tracking. |
| Spot the Mistake | `data-spot.js` → `SPOT_QUESTIONS` | 120 | 20 per level, A1–C2 | Learner identifies a wrong word in a sentence; one correction/fix is supplied. |
| Type It | `data-typing.js` → `TYPING_QUESTIONS` | 120 | 20 per level, A1–C2 | Type the missing/correct word from accepted forms; not unrestricted free writing. |
| Directions | `data-minigames.js` → `DIRECTION_ITEMS` | 120 | 20 per level, A1–C2 | Structured route instructions and a town-map target; five items per session. |
| Sound & Picture Match | `app.js` → `MINI_AUDIO_ITEMS` | 12 fixed items | No explicit CEFR tags | Ten rounds per session; the word is spoken through the app's speech/TTS path, then the learner chooses an image/icon. |
| Sentence Builder | `app.js` → `MINI_SENTENCES` | 10 fixed sentences | No explicit CEFR tags | Eight rounds per session; reorder word tokens to form a sentence. |
| Speaking & Shadowing | `practice-lab.js` → `samples` | 8 sample sentences | A1–B2 (2 per level) | Browser SpeechRecognition transcribes the learner; displayed score is a word-match estimate, explicitly not a pronunciation score. |
| Dictation | `practice-lab.js` → same `samples` | Same 8 sentences | A1–B2 (2 per level) | TTS plays a sentence and learner types it. Current comparison is character-position based, so one insertion/deletion can misalign later characters and distort the score. |

### Dynamic/personalized activities

| Activity | Current source and behavior | Fluentia destination |
|---|---|---|
| Word Match | Builds up to six word/meaning pairs dynamically from saved learner words and the 60-entry Word of the Day bank; it has no independent fixed question bank. | Wordcraft |
| Speed Round | A 60-second vocabulary round. Prioritizes saved review words and learner words; uses six fallback words when the personal pool is too small. | Wordcraft as a quick-practice mode, not a separate domain or duplicate bank |
| Your Weak Spots | `GAMES.personalized` is currently a shallow copy of `GAMES.mistakes.questions`; adaptive selection prioritizes grammar/mistake patterns. It is not yet a cross-domain review engine. | Your Review, expanded to use eligible errors and vocabulary/skill history from all Fluentia domains |
| Word of the Day | `data-wotd.js` contains 60 words, ten per CEFR level. It is a supporting content source for dynamic review/matching, not an Arcade domain/activity. | Reusable Wordcraft/Your Review source; retain one canonical bank |

## 4. Stories boundary and Textwise decision

The current Stories system is a separate narrative product:
- 58 loaded stories across A1–C2 (A1: 8, A2: 8, B1: 15, B2: 9, C1: 9, C2: 9);
- all 58 have comprehension questions, 181 questions in total;
- story pages, choices/decisions and narrative progression belong to Stories.

The current Order the Story mini-game:
- selects three stories from `STORIES`;
- takes a sequence of page snippets from each selected story;
- lazy-loads the Stories data group when launched.

**Phase 3 requirement:** preserve the ordering/sequencing interaction, but do not expose or copy the existing Stories library as Textwise question content. Textwise must have its own short informational/practical texts and independent sequencing/comprehension items. The existing Stories bank, decisions, progress and presentation remain untouched. The exact learner-facing label for the adapted sequencing activity can be finalized during the integration phase; this inventory does not rename it.

Textwise's Meaning Detective activity can remain based on non-fiction/practical messages and passages. It should not be renamed or presented as audio listening merely because its internal key is `listening`.

## 5. Final canonical mapping

| Fluentia destination | Canonical activities/modes | Integration notes |
|---|---|---|
| **Wordcraft** | Word Collector, Word Detective, Word Match, Speed Round | Keep vocabulary and spelling as distinct selectable modes. Word Match and Speed Round are dynamic modes, not copied banks. |
| **Sentence Studio** | Sentence Shaper, Common Mistakes, Spot the Mistake, Type It, Sentence Builder | Preserve their different answer mechanics: multiple choice/grammar flow, error diagnosis, tap-to-correct, typed accepted forms and token ordering. |
| **Textwise** | Meaning Detective, Order the Story sequencing mechanic | Meaning Detective is reading comprehension. Rebuild the sequencing content source independently of Stories before exposing it inside Fluentia. |
| **Soundscape** | Sound & Picture Match, Dictation | Add level tags/content for C1–C2 and grow the very small sample set. Fix dictation comparison before using it for reliable performance analytics. |
| **Real World** | Lost in London, Directions, Speaking & Shadowing | Directions is currently map-based text instruction, not audio. Speaking is transcript/word-recognition feedback, not pronunciation assessment. |
| **Fine Sense** | Nuance Navigator | The 218-item advanced bank is the canonical starting point. Additional nuance material should be tagged and assigned one canonical home rather than duplicated. |
| **Your Review** (separate utility) | Current Your Weak Spots plus future cross-domain review | Replace the mistakes-only clone with a unified review selector that retains source domain, activity, level and error type. It is not a seventh domain. |

## 6. Progress, scoring and translation audit

### Existing learner state

- The main learner profile is stored under `epiphany-progress` in localStorage and includes shared progress such as CEFR placement, XP, review words, saved words, recent question history, mistake question/trap statistics, SRS state, stories and other product progress.
- Main question sessions keep recent question history by activity key and level. Grammar/error activities use trap/question error and correctness records; grammar SRS uses intervals of 1, 3, 7, 14 and 30 days.
- Main account synchronization is handled outside the Arcade activity modules; the existing data-readiness tests assert merge/retry behavior for cloud progress.
- Mini-game completion uses the shared activity reward path for XP, quests, daily/weekly progress and streaks. The current mini-game result screen does not provide a normalized per-domain/per-skill/per-item history equivalent to the core question/error records.
- Practice Lab uses a separate localStorage key, `epiphany-practice-lab-v1`, for speaking/dictation attempt and best-score counters. Its statistics are not part of the shared `epiphany-progress` shape in `practice-lab.js`.

**Migration rule:** do not replace the main progress key or discard old activity identifiers. Introduce a compatibility mapping/adapter so existing history remains available while new domain/skill events are added. Decide explicitly whether Practice Lab's local counters are migrated or retained as legacy statistics.

### Translation and language behavior

- The shared learner translation preference is `state.translationEnabled`; the established UI pattern swaps the same text slot between English and Arabic rather than showing duplicate bilingual copies.
- Mini-games use a screen-level translation control and existing Arabic metadata where available.
- Core banks include a mix of `ar`, `q_ar`, `answers_ar`, `explain_ar` and related translation fields. Existing answer-safety rules must be preserved so translation does not reveal spelling, error-identification or personalized answers.
- Practice Lab's eight sentence samples and its standalone markup are English-only in the current implementation; no shared screen translation control is present there.

## 7. Test coverage and known gaps

The repository currently contains 59 files in `tests/`. Relevant existing coverage includes:
- `content-quality.test.js`: loads `data.js`, `data-wotd.js`, `data-expansion.js`, `data-stories.js` and `data-stories-expansion.js`; checks core question validity/duplicates/translations and story structure/comprehension.
- `expansion-translation-safety.test.js`, `comprehension-translation-safety.test.js`, `listening-translation-safety.test.js`, `spot-translation-safety.test.js`, `blank-translation-safety.test.js`, `translation-safety.test.js`, `translation-targets.test.js`, `translation-blank-preservation.test.js`: targeted translation and answer-safety coverage.
- `data-readiness.test.js`: missing core-data recovery and several progress/adaptive behavior contracts.
- `lazy-data.test.js`: lazy-loading and recovery contracts.
- `speech-voice-contract.test.js`: shared speech/voice contracts.
- `browser-smoke.js`: browser-level smoke coverage.

Gaps identified for Fluentia:
1. `content-quality.test.js` does not load `data-mistakes.js`, `data-spot.js`, `data-typing.js` or `data-minigames.js`; those banks need their own validation or must be included in an expanded content audit.
2. No dedicated bank-quality tests were found for Common Mistakes, Type It or Directions.
3. Sound & Picture Match and Sentence Builder need explicit content/level/answer tests.
4. Practice Lab needs tests for sample coverage, scoring alignment, empty input, unsupported SpeechRecognition and its local-stat behavior.
5. No Fluentia domain registry, activity adapter, mixed-session balancing, cross-domain eligibility, no-repeat or result-attribution tests exist yet.
6. The Stories dependency in Order the Story needs a regression test proving Textwise sequencing no longer loads or consumes the Stories corpus.

**Execution note:** this phase inspected source and derived static/loaded data counts. It did not run `npm test`, `npm run test:unit`, `npm run test:browser` or GitHub Actions. No test result is claimed.

## 8. Phase 1 conclusions and handoff to Phase 2

Phase 1 inventory is complete. The canonical mapping is:

- Wordcraft: vocabulary + spelling + dynamic word matching + timed word review.
- Sentence Studio: grammar + common errors + spotting + typed completion + sentence construction.
- Textwise: message/passage comprehension + an independent sequencing mode.
- Soundscape: auditory word recognition + dictation.
- Real World: practical conversation + map directions + speaking/shadowing.
- Fine Sense: precise meaning, nuance and pragmatic interpretation.
- Your Review: cross-domain personalized revision.

Before Phase 3 integration, Phase 2 should define stable adapters for:
- multiple-choice banks;
- one-correction/tap-the-error items;
- typed-answer/accepted-answer items;
- word-token ordering;
- matching-pair rounds;
- map/direction tasks;
- TTS/listening tasks;
- speech-recognition/transcript tasks;
- dynamic personalized pools.

The common session layer must not flatten these into one generic multiple-choice renderer. It should standardize identity, CEFR eligibility, answer/result events, feedback, progress attribution and session lifecycle while leaving each interaction type's renderer/evaluator intact.

The next phase is **Phase 2 — Shared practice/session architecture**. Do not change the live Arcade landing page or migrate content as part of this inventory document.
