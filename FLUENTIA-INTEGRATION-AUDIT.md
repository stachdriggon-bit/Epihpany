# Fluentia — Final Integration Audit

Date: 2026-11-08  
Branch: `main`  
Audited commit: `b2b24de74ebf8b7acf1011a5ee717c44d3f27e00`  
Scope: learner-facing Arcade → Fluentia migration, source registration, progress/review integration, and regression coverage.

## Executive result

**Navigation migration: passed. Full functional migration: not yet complete.**

Fluentia is the only learner-facing English-practice destination in the Play navigation on desktop and mobile. The old Arcade destination is absent from navigation, and the existing browser smoke test asserts that state. However, several source modules still register their activities only when legacy destinations are opened. As a result, a learner who opens Fluentia directly does not receive the complete planned activity inventory.

No learner-facing code was changed during this audit. The findings below are recorded as the next implementation batch so the remaining work can be completed coherently without deleting legacy content or breaking existing behavior.

## Verified areas

### 1. Navigation and information architecture

- Desktop Play contains Fluentia, Think Lab and Casebound.
- Mobile Play contains the same three destinations.
- Fluentia is not in Learn.
- No `data-view="arcade"` navigation entry remains.
- Think Lab and Casebound remain separate destinations.
- Stories remains a separate narrative destination; Textwise sequencing uses its own bank.

### 2. Fluentia foundation

- The six approved domains are present: Wordcraft, Sentence Studio, Textwise, Soundscape, Real World and Fine Sense.
- Fluentia Mix and Section Mixed are distinct entry points.
- Section Mixed is configured with a single selected domain; Fluentia Mix spans eligible domains.
- The engine enforces exact CEFR matching, stable item identity and no-repeat selection.
- The progress bridge appends deduplicated Fluentia events to `epiphany-progress.fluentiaHistory`, bounded to the latest 500 events, without duplicating XP or legacy rewards.
- Your Review is a separate destination and its adapters are excluded from ordinary mixed sessions.

### 3. Existing activity/content preservation

The canonical adapter registry covers the original core activity families and the additional Word Match, Speed Round, Sentence Builder, Sound & Picture Match, Textwise sequencing, Sound Maze, dictation and review feeds when their optional sources have registered. The legacy Arcade DOM, renderer and data remain in the repository; they have not been deleted.

## Findings requiring implementation

### F-01 — Fluentia does not load all of its optional activity sources

**Severity: High**

The app registers Practice Lab samples only when `practice-lab.js` executes. That file belongs to the `arcade` lazy-load group, and `openView('arcade')` is the only route that requests that group. Since Arcade is no longer in navigation, opening Fluentia directly does not register the Practice Lab dictation and Speaking & Shadowing adapters.

Sound Maze has the same class of issue: `sound-maze-content.js` registers its bank when it executes, but it is loaded through the Think Lab / Life Skills lazy groups, not through Fluentia. Fluentia itself does not request either source group.

**Required fix:** give Fluentia an explicit, bounded source-readiness step for the specific optional banks it owns. Do not load the full Think Lab or Life Skills feature bundles just to obtain Sound Maze content; separate the content asset from unrelated game UI where appropriate. Re-render the Fluentia activity inventory after registration and provide a clear retry/error state if a source fails to load.

### F-02 — Speaking & Shadowing is not currently a speaking interaction in Fluentia

**Severity: High**

The Speaking & Shadowing adapter is conditionally registered from the Practice Lab samples and is labelled with interaction type `speech`. However, Fluentia's `inputFor()` renders a normal text input for this type. The old microphone / SpeechRecognition interface is mounted by `practice-lab.js` inside `#arcade-view .arcade-page`, which is the retired learner-facing shell.

Consequently, the current Fluentia session can accept a typed transcript and compare words, but it does not provide the microphone-based speaking workflow implied by the activity name. It must not be described as a pronunciation assessment; the original Practice Lab correctly describes its score as recognised-word matching, not pronunciation quality.

**Required fix:** integrate the actual speaking workflow into Fluentia's Real World activity experience (including unsupported-browser and microphone-permission states), or explicitly keep it unavailable until that integration is complete. Do not silently present a text field as a working microphone activity.

### F-03 — Fluentia mistakes are stored but do not feed Your Review

**Severity: High**

The progress bridge stores normalized events in `fluentiaHistory`. The current vocabulary review adapter reads saved words and legacy review rows; the grammar review adapter reads `mistakeTrapErrors` and `mistakeQuestionErrors`. Neither adapter reads Fluentia history.

Therefore, wrong answers made inside Fluentia are preserved in the history log, but are not themselves eligible signals for the dedicated Your Review feeds. The current Your Review panel can still use qualifying legacy saved-word and grammar-error signals, but it is not yet a fully cross-domain review of Fluentia's own answer history.

**Required fix:** extend the review selection layer to consume Fluentia history with stable source activity, domain, CEFR level, skill and error-type attribution. Keep review-only items out of ordinary Mixed sessions, preserve source-question identity, and avoid repeating items already mastered or already reviewed according to a documented policy. Do not mutate legacy SRS schedules or duplicate XP.

### F-04 — Legacy Arcade shell remains in runtime code

**Severity: Medium / intentional compatibility**

The old `#arcade-view`, Arcade renderer and the `arcade` lazy group remain. Keeping legacy code during migration is reasonable, but the old shell is also still the only mounting target for Practice Lab's standalone UI. This dependency contributes directly to F-01 and F-02.

**Required fix:** after the replacement experiences are integrated and tested, remove or retire only obsolete learner-facing Arcade shell behavior. Retain shared activity logic, content banks, progress compatibility and any renderer still used by other parts of EPIPHANY.

## Test coverage gaps

The current Fluentia UI and browser smoke tests verify navigation, the six domain cards, one Wordcraft activity, history recording, Arabic feedback replacement, both Mixed entry points, mobile layout and mobile navigation. They do not currently prove:

- that Fluentia opened first loads every activity source promised by its inventory;
- that Sound Maze is available without first opening Think Lab or Life Skills;
- that Practice Lab dictation and Speaking & Shadowing are available without opening Arcade;
- that microphone permissions and SpeechRecognition work from Fluentia;
- that a wrong Fluentia answer later appears in the appropriate Your Review feed;
- that the review feed preserves source/domain/skill/error attribution and avoids duplicate or mastered items.

These should be added to automated tests where deterministic, with microphone/audio quality and assistive-technology checks retained as manual device sign-off.

## Current CI status

At the audited commit `b2b24de74ebf8b7acf1011a5ee717c44d3f27e00`:

- **EPIPHANY checks:** passed — [workflow run](https://github.com/stachdriggon-bit/Epihpany/actions/runs/42469445229)
- **Content quality:** passed — [workflow run](https://github.com/stachdriggon-bit/Epihpany/actions/runs/42469445203)

These are genuine green CI results for the audited commit. They do not close the functional gaps listed above.

## Recommended next batch

Implement F-01, F-02 and F-03 together as one Fluentia integration batch, with tests for first-open source readiness, speaking interaction behavior and history-driven personalized review. Then reassess F-04 and retire only the now-unused Arcade shell. Keep the manual device/audio/accessibility/performance sign-off separate from automated CI. Do not trigger a Vercel deployment while the deployment rate limit is active.
