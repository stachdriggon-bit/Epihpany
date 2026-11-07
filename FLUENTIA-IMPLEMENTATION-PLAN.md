# Fluentia — Implementation Plan

Status: **Phases 1–5 implemented and verified; Phase 6 automated QA passed; manual device/audio review remains**
Target branch: `main`
Product area: former Arcade / English practice activities
Working principle: complete each phase as one coherent unit rather than scattering work across many small edits. Do not begin the next phase until the current phase has a documented outcome and its required checks are accounted for.

## 1. Product identity and purpose

**Fluentia** is EPIPHANY's unified English practice and assessment experience.

- Fluentia focuses on testing, applying, and strengthening English knowledge through varied practice activities.
- Think Lab remains the separate destination for genuine puzzle/gameplay experiences where English learning happens through play.
- Fluentia is not a second Stories library and must not duplicate Think Lab.
- Suggested tagline: **Discover how much you know.**

## 2. Approved information architecture

Fluentia has six main domains:

| Domain | Scope | Existing activity/content families to assess |
|---|---|---|
| **Wordcraft** | Vocabulary, meaning, spelling, word recognition and matching | Word Collector, Word Detective, Word Match, vocabulary portions of Speed Round |
| **Sentence Studio** | Grammar, sentence construction, completion, error detection and correction | Sentence Shaper, Common Mistakes, Spot the Mistake, Type It, Sentence Builder |
| **Textwise** | Reading comprehension, inference, text understanding and event/order comprehension | Meaning Detective, Order the Story |
| **Soundscape** | Listening comprehension and transcription of heard language | Sound & Picture Match, listening portion of Directions, Dictation |
| **Real World** | Practical communication and English in everyday situations | Lost in London, practical/direction-following activities, speaking/shadowing where appropriate |
| **Fine Sense** | Nuance, precise meaning, natural expression, tone and implied meaning | Nuance Navigator and suitable advanced items currently found in other banks |

The exact placement of cross-domain activities must be resolved in Phase 1. Do not duplicate a question bank or the same activity in multiple domains. Where an activity genuinely spans skills, give it one canonical home and use skill/domain metadata for reporting or mixed-session eligibility.

### Stories boundary

The existing **Stories** section remains an independent narrative experience: story worlds, characters, events, choices and story progression remain there.

**Textwise** is a practice domain, not a story library. It uses purpose-built short informational and practical texts (for example messages, notices, conversations, short articles and passages) followed by comprehension, inference, information-retrieval or sequencing questions. Do not copy EPIPHANY narrative stories into Textwise or make the two sections compete.

### Your Review

**Your Review** is a dedicated cross-domain personalized review destination, not a seventh domain. It draws on the learner's saved vocabulary, mistakes and skill-performance history, while retaining the source domain/activity and error type.

## 3. Two Mixed Practice modes

Mixed is available at two distinct scopes and must not be confused:

### A. Section Mixed

Available inside each of the six domains. It starts a session that mixes eligible activity types and questions **from that domain only**.

Example: Sentence Studio may rotate through grammar selection, error correction, sentence completion and sentence construction.

### B. Fluentia Mix

Available from the Fluentia landing page. It starts a comprehensive session that draws eligible activities and questions from **all six domains**. Each stage may come from a different domain and activity.

### Shared Mixed rules

- Select an activity type first, then select a valid question/item from its bank.
- Respect the learner's selected or established CEFR level (A1–C2); do not mix incompatible levels.
- Balance domains/activity types so one large bank cannot dominate a session.
- Avoid repeating a question within a session; avoid consecutive repeats of the same activity type where possible.
- Keep randomization bounded, valid and reproducible in tests; randomness must never bypass content validation.
- Provide useful feedback and an educational explanation after answering, following each activity's answer-safety rules.
- Preserve detailed performance by domain, skill, activity type and error type; do not reduce the result to one percentage only.
- Keep the learner's progress, review history and existing records compatible during migration.
- Mixed is a session/orchestration mode over canonical activity banks, not a separate duplicate question bank.

Session length, distribution weights, fallback behavior for sparse levels and resume semantics are to be specified against the actual inventory in Phase 1/2, not guessed in advance.

## 4. Fluentia landing and activity navigation

The Fluentia landing page should be calm and easy to scan:

1. Fluentia identity and short tagline.
2. A prominent **Fluentia Mix** entry for cross-domain practice.
3. Six domain cards: Wordcraft, Sentence Studio, Textwise, Soundscape, Real World and Fine Sense.
4. A distinct **Your Review** entry.

When a learner opens a domain, show the activities available inside it. The learner can either:
- choose a specific activity and play it, then return and choose another; or
- start **Section Mixed** to receive a varied session from that domain.

Avoid a long list of top-level activity cards. Avoid unnecessary setup steps; remember useful learner choices (such as the last CEFR level) where safe and appropriate. Preserve EPIPHANY's existing responsive navigation conventions: mobile drawer navigation and desktop top/header navigation.

## 5. Implementation phases

### Phase 1 — Final repository inventory and content map

Audit the current `main` branch and produce a verified inventory of every current Arcade/practice activity, module, question bank and relevant test.

For each activity, record:
- canonical source file/module and lazy-loading/registration path;
- current visible name and learner-facing purpose;
- content bank(s), verified item count and CEFR distribution (do not infer counts or levels);
- interaction/answer format and scoring/evaluation behavior;
- explanation/feedback behavior and Arabic translation behavior;
- dependencies such as audio, speech recognition, maps, saved vocabulary or personalized data;
- current progress/error storage and compatibility implications;
- test coverage and known limitations.

Then create a canonical mapping to exactly one of the six domains (or document why an item is not a learner-facing activity). Identify:
- merged activity families and their distinct modes;
- cross-domain activities that need one canonical home plus skill metadata;
- duplicate/overlapping content and any content that should remain separate;
- sparse or missing CEFR levels and content-quality gaps;
- risks to existing progress, translation preferences, lazy loading, offline behavior and performance.

Deliverables: a repository-grounded inventory and final activity-to-domain mapping committed to the repository. Phase 1 is an audit/documentation phase: do not redesign the UI or perform broad migrations before the map is complete.

### Phase 2 — Shared practice/session architecture

**Verified complete.** The shared engine is in `fluentia-engine.js`, loaded before `app.js`, with its API and contract documented in [FLUENTIA-SESSION-ARCHITECTURE.md](./FLUENTIA-SESSION-ARCHITECTURE.md). It defines canonical domains, CEFR validation, distinct interaction types, activity adapters, single/Section Mixed/Fluentia Mix session scopes, balanced no-repeat selection, answer/feedback hooks, normalized progress events, lifecycle states, serialization/restore and explicit error codes. Dedicated tests are in `tests/fluentia-engine.test.js`. Existing activities, UI, banks and progress storage remain untouched until integration phases. The user confirmed all required checks passed before Phase 3 began.

### Phase 3 — Domain integration and content consolidation

**Verified complete.** Both `EPIPHANY checks` and `Content quality` passed on commit `aa5008876a1d6876253971e768371742cd0e3fb7`. The canonical adapter registry now covers 21 activities when optional sources are present: the initial ten core adapters; Word Match and Speed Round; Sentence Builder; Sound & Picture Match; Sound Maze; the six-level Soundscape dictation bank; Practice Lab Dictation and Speaking & Shadowing; independent Textwise sequencing; and vocabulary/grammar Your Review feeds. The 36-item Textwise sequence bank is independently authored (six per CEFR level) and does not reuse Stories. Sound Maze registers lazily with 216 reviewed items (36 per level). The authored Soundscape dictation bank adds 36 transcription prompts (six per level); Practice Lab retains its eight existing A1–B2 samples and lazy registration. Word Match uses CEFR-tagged Word of the Day pairs; Sentence Builder uses ten explicitly level-tagged prompts; Sound & Picture Match uses its twelve A1/A2 listening prompts. Your Review reads saved vocabulary and grammar error signals but includes only source questions with verified CEFR tags; its two adapters are excluded from ordinary mixed sessions and remain individually selectable for the dedicated review flow. `fluentia-progress-bridge.js` now appends normalized, deduplicated Fluentia answer history to the existing `epiphany-progress` profile (bounded to the latest 500 events), preserving legacy source/question/level/error attribution. It does not award XP or alter legacy review schedules/reward counters. Existing renderers and reward paths remain authoritative. Untagged saved words, invented C1/C2 Practice Lab samples, and the 60-second Speed Round timer/reward loop are deliberately not simulated. No learner-facing Fluentia UI or Mixed mode is enabled in this phase.

### Phase 4 — Section Mixed and Fluentia Mix

**Implemented; CI verification pending.** The engine now balances Section Mixed by activity within its single domain and Fluentia Mix by domain first, then activity within the selected domain. Canonical source identity prevents the same question from repeating across adapters. Sparse domains are skipped without cross-level fallback. Deterministic tests cover six-domain balance despite unequal adapter counts, activity balance within a section, cross-adapter duplicate suppression, strict CEFR matching and sparse-domain continuation. No UI or new question bank was added.

### Phase 5 — Fluentia UI and Your Review

**Implemented; CI verification pending.** Added a dedicated Fluentia view and Learn navigation entry on desktop and mobile; the six canonical domain cards; an in-domain activity chooser; a CEFR selector; Section Mixed domain selection; one-click Fluentia Mix; and dedicated Your Review entries for review-only adapters. The session screen delegates item selection and evaluation to the shared engine, supports the current choice, correction, typed, ordering, matching, map, listening and speech adapter shapes, and shows a completion summary. Fluentia answer events continue through the Phase 3 progress bridge; this UI does not award legacy Arcade XP or duplicate rewards. New assets are included in the service worker's core cache. Static integration tests were added in tests/fluentia-ui.test.js. Keep Stories and Think Lab navigation/identity separate.

### Phase 6 — Quality, regression and documentation

**Automated verification passed on `main` at commit `1fd56a5ec0f01e5ac4e745fbbcf5c6c45978869c`.** Both `EPIPHANY checks` and `Content quality` are green. The unit/static suite passed 474/474 tests; JavaScript syntax checks passed for the Fluentia engine, adapters, progress bridge and UI. Chromium browser smoke passed 1/1 and exercised Fluentia desktop navigation, all six domain cards, single-activity answering, progress-bridge history, Arabic explanation replacement when available, Section Mixed domain confinement, Fluentia Mix startup, narrow-phone layout and mobile-drawer entry. The same browser run also passed the existing app navigation, card portal/dossier and offline service-worker checks.

Remaining sign-off is device/manual verification of speech and microphone permissions, audio playback quality/latency, assistive-technology navigation and performance on a lower-powered phone/long session. These are not claimed as verified by the CI browser run. Keep release readiness distinct from automated CI success.

## 6. Preservation and scope guardrails

- Work directly on `main`, as requested, after fetching the latest file version/SHA before each edit.
- Complete each phase as one coherent implementation/review batch; avoid unnecessary incremental edits and repeated deploys.
- Do not delete valid content merely because its activity is being folded into a domain.
- Do not duplicate question banks across domains or Mixed modes.
- Do not change the existing Stories narrative experience.
- Do not change Think Lab as part of Fluentia work.
- Do not alter Cards, World or The Resonance artwork/identity.
- Keep the current EPIPHANY translation policy: English remains the default; Arabic help replaces the same text slot rather than appearing as a duplicate alongside it; preserve answer-safety exclusions.
- Preserve the existing responsive navigation distinction: mobile drawer, desktop top/header.
- Account for the current Vercel deployment rate limit: prioritize repository-level checks and CI; do not trigger unnecessary deployments.
- Report separately what was changed, what was inspected, which checks actually ran, and what still requires CI or manual verification. Never claim a test passed unless its result is available.

## 7. Current status and next action

- Fluentia name: **approved**.
- Six domains and names: **approved**, including **Textwise** replacing Storyline.
- Two-scope Mixed model: **approved**.
- Stories separation and Your Review placement: **approved**.
- The approved plan is recorded in this document. Phase 1's repository audit and canonical activity mapping are documented in [FLUENTIA-CONTENT-INVENTORY.md](./FLUENTIA-CONTENT-INVENTORY.md).
- Phase 1 was documentation-only: no live Arcade/Fluentia product code or existing activity banks were migrated or modified.
- Phase 2 is verified complete; see [FLUENTIA-SESSION-ARCHITECTURE.md](./FLUENTIA-SESSION-ARCHITECTURE.md).
- Phase 3 source integration, content banks, adapters and progress bridge are implemented and verified by green repository CI on `aa5008876a1d6876253971e768371742cd0e3fb7`.
- Phase 4 mixed-session orchestration is implemented; its CI verification status must be confirmed separately.
- Phase 5 Fluentia learner UI is implemented; both required CI workflows passed on `6cdeb263a942d7b476d3e6c8ef37e0b33621b0f1`.
- Phase 6 automated QA is green on `1fd56a5ec0f01e5ac4e745fbbcf5c6c45978869c`; 474/474 unit/static tests and the Chromium browser smoke test passed. Manual device/audio/accessibility/performance sign-off remains.
