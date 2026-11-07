# Fluentia — Implementation Plan

Status: **Approved plan; implementation not yet started**
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

Design and implement the shared orchestration layer based on Phase 1 findings. Define stable activity adapters/contracts, question selection, CEFR filtering, session state, answer evaluation/feedback hooks, progress events, error taxonomy and resume behavior. Preserve activity-specific mechanics where needed. Add unit tests for the contracts and selection rules.

### Phase 3 — Domain integration and content consolidation

Integrate existing activities under the six approved domains. Preserve useful banks and distinctive question types, consolidate duplicate flows without duplicating source content, and make all eligible content available through the shared architecture. Retain compatibility with existing progress and saved review data.

### Phase 4 — Section Mixed and Fluentia Mix

Implement both modes over the canonical activity sources. Add deterministic test seams for randomness, level constraints, balancing, no-repeat behavior, sparse-bank fallbacks, cross-domain eligibility and result attribution. Ensure Fluentia Mix can draw from all six domains while Section Mixed remains domain-scoped.

### Phase 5 — Fluentia UI and Your Review

Build the landing page, six domain entry points, in-domain activity chooser, Section Mixed entry, global Fluentia Mix entry and Your Review. Follow EPIPHANY's visual direction: warm neutral surfaces, navy text, purple navigation/links, yellow primary actions, restrained section accents, balanced density and one clear primary action per screen. Keep Stories and Think Lab navigation/identity separate.

### Phase 6 — Quality, regression and documentation

Run and resolve relevant unit, content-quality, syntax/static, browser-smoke and accessibility checks. Verify mobile and desktop flows, translation behavior, saved progress, audio/speech limitations, offline/lazy-loading behavior and performance. Document architecture, activity mapping, content counts and known limitations. Do not claim release readiness until CI is green and the relevant experience has been manually exercised when available.

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
- This document records the plan only. No Fluentia product code or existing Arcade activities have been migrated by creating this plan.
- **Next: execute Phase 1 as one complete repository audit and commit its inventory/mapping document before starting Phase 2.**
