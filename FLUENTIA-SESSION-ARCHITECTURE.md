# Fluentia — Phase 2 Shared Practice and Session Architecture

Implementation date: 2026-11-07
Branch: `main`
Status: **Phase 2 verified; Phase 3 adapter integration in progress**
Related documents: [Implementation plan](./FLUENTIA-IMPLEMENTATION-PLAN.md), [Phase 1 inventory](./FLUENTIA-CONTENT-INVENTORY.md)

## 1. Scope delivered

Phase 2 adds a standalone orchestration foundation in `fluentia-engine.js` and a dedicated contract suite in `tests/fluentia-engine.test.js`.

The engine is deliberately independent of the legacy Arcade UI and its question banks. It does not move content, render questions, award XP, write localStorage, call Supabase, or change the existing progress schema. Those integrations belong to later phases and must use explicit compatibility bridges.

The engine is loaded before `app.js` by `index.html`, making the API available as `window.EPIPHANY_FLUENTIA_ENGINE`. It also exports a CommonJS API for isolated Node tests.

## 2. Stable domain and level identifiers

Canonical domains:

- `wordcraft`
- `sentence-studio`
- `textwise`
- `soundscape`
- `real-world`
- `fine-sense`

CEFR levels are restricted to `A1`, `A2`, `B1`, `B2`, `C1`, and `C2`. An item without an explicit valid level is rejected; it is never silently treated as belonging to the learner's selected level. This preserves the Phase 1 rule for the 48 untagged core-bank items.

## 3. Activity adapter contract

Register an activity with:

```js
engine.registerActivity({
  id: 'stable-activity-id',
  domain: 'wordcraft',
  interactionType: 'choice',
  skills: ['vocabulary'],
  getItems({ level, domain, activityId }) {
    return itemsForThisActivity;
  },
  evaluate(item, answer, context) {
    return { correct: true, errorType: null };
  },
  getFeedback(item, answer, evaluation) {
    return feedbackForThisActivity;
  },
  onProgress(progressEvent) {
    // Optional compatibility bridge; owner decides how to persist it.
  }
});
```

Required adapter fields are `id`, `domain`, `interactionType`, `getItems` and `evaluate`. Activity IDs are unique. The interaction type describes the renderer/evaluator contract; it does not force all activities into a shared multiple-choice format.

Supported interaction families are:

| Interaction type | Intended activity mechanics |
|---|---|
| `choice` | Multiple-choice and recognition |
| `correction` | Identify/fix an error |
| `typed` | Typed response and accepted forms |
| `ordering` | Token, sentence or event ordering |
| `matching` | Pair and matching rounds |
| `map` | Directions and spatial/map tasks |
| `listening` | TTS/audio comprehension and dictation |
| `speech` | Speech recognition and transcript comparison |
| `dynamic` | Personalized or generated-at-runtime pools |

The adapter retains full ownership of answer semantics, accepted forms, answer-safety rules, and explanation content. The engine only standardizes lifecycle and attribution.

## 4. Session modes and selection

- `single`: one registered activity, selected by `activityId`.
- `section-mixed`: requires one canonical domain and selects eligible adapters in that domain only.
- `fluentia-mix`: draws from eligible adapters across all registered domains; it cannot be pinned to one domain.

Every session requires a valid CEFR level. Activity sources receive that level and the engine independently filters returned items by explicit item level. Optional activity ID, interaction type and skill filters narrow eligibility.

Selection rules:

1. Only registered adapters and valid items can enter a session.
2. An item is keyed by canonical activity ID plus stable item ID.
3. A session never repeats an item.
4. Selection first balances activity usage, then domain usage.
5. Consecutive repeats of the same activity are avoided when another eligible activity is available.
6. Randomness is injectable for deterministic tests; it cannot bypass eligibility or validation.
7. If all eligible content is exhausted before the requested length, the session ends cleanly instead of fabricating or repeating questions.

Default session length is 10; configured lengths are bounded to 1–100.

## 5. Answer and progress events

Each successful answer emits a normalized event containing:

- stable event and session IDs;
- item, activity and canonical domain IDs;
- interaction type and CEFR level;
- correctness and optional error type;
- skill attribution;
- answer timestamp;
- activity-specific evaluation payload and optional feedback.

The activity's optional `onProgress` callback receives this event. It is intentionally a bridge, not a storage implementation: later integration must map events into existing `epiphany-progress`, preserve legacy activity identifiers, and decide explicitly how Practice Lab's separate `epiphany-practice-lab-v1` counters coexist or migrate. The engine itself does not write progress.

## 6. Session lifecycle and resume

Supported states:

- `ready`: session created or waiting for the next item;
- `active`: an item is currently presented;
- `paused`: session is suspended;
- `completed`: requested count reached or eligible items exhausted;
- `abandoned`: learner ended the session early.

The API provides `selectNext`, `submitAnswer`, `pauseSession`, `resumeSession`, `abandonSession`, `serializeSession` and `restoreSession`.

Snapshots use schema version 1 and preserve the current item, completed answers, no-repeat history and balancing counters. Restore rejects unknown activity references and malformed snapshots. This is a serialization/resume contract; durable local/cloud persistence and account synchronization are intentionally deferred to the integration phase.

## 7. Error taxonomy

The engine exposes stable codes for invalid configuration, invalid adapters, invalid items, no eligible items, inactive sessions, duplicate-answer protection and invalid snapshots. Evaluator exceptions and invalid evaluator return values are isolated as explicit Fluentia errors. Activity source failures are recorded on the session and do not silently inject content.

## 8. Tests added

The dedicated test file covers:

- canonical domains, CEFR levels and interaction families;
- adapter validation and duplicate IDs;
- strict CEFR filtering;
- single, Section Mixed and Fluentia Mix scope;
- balanced activity selection and avoiding consecutive activity repeats;
- domain/skill/activity/error attribution in progress events;
- pause, resume, completion and abandon transitions;
- serialization and restoration of an active session;
- sparse/exhausted pools and invalid content/evaluator/snapshot behavior.

The user confirmed that all required repository checks passed before Phase 3 began. Phase 2 is therefore recorded as verified.

## 9. Explicitly deferred

- Migrating or rewriting any existing Arcade activity.
- Building Fluentia landing/domain screens or changing navigation.
- Implementing Section Mixed or Fluentia Mix UI.
- Persisting events into the legacy profile/cloud schema.
- Migrating Practice Lab statistics.
- Creating Textwise sequencing content or modifying Stories.
- Changing XP, quests, streaks, translation preferences or answer-safety behavior.

These are integration/product phases, not responsibilities of the shared orchestration engine.


## 10. Phase 3 adapter integration (initial batch)

The additive adapter registry is implemented in `fluentia-adapters.js` and loaded before `app.js`. The app creates a separate Fluentia engine instance and registers ten canonical adapters over existing sources:

- Wordcraft: Word Collector and Word Detective.
- Sentence Studio: Sentence Shaper, Common Mistakes, Spot the Mistake and Type It.
- Textwise: Meaning Detective (reading comprehension; legacy internal key remains unchanged).
- Real World: Lost in London and Directions.
- Fine Sense: Nuance Navigator.

The adapters retain source records and existing renderers. They use explicit CEFR tags only, deterministic content-derived IDs when an eligible legacy record has no ID, and activity-specific evaluators for choice, error identification, typed answers and map coordinates. Registration failure is isolated so the legacy Arcade continues to work. The new contract suite is `tests/fluentia-adapters.test.js`.

Not yet registered: Soundscape's currently untagged Sound & Picture Match bank and lazy Practice Lab sources; Textwise's independent sequencing bank (the Stories corpus must not be reused); dynamic Wordcraft pools; and the cross-domain Your Review selector. These require source-level CEFR/identity and compatibility work before they can safely enter mixed sessions. No UI migration, progress writes, XP changes or Practice Lab statistics migration is part of this batch.


## 11. Phase 3 integration — expanded source coverage

The next integration batch adds the following sources without replacing their current interfaces:

- **Wordcraft — Word Match:** the twelve existing picture/meaning pairs are given explicit A1/A2 metadata in the adapter source and exposed as a matching interaction. The dynamic personal vocabulary adapter reads only saved terms that can be matched to an explicitly level-tagged legacy vocabulary item.
- **Sentence Studio — Your Review:** a personalized adapter ranks existing Common Mistakes items using the learner's saved trap and question-error counters. It does not create synthetic questions.
- **Textwise — sequencing:** `fluentia-textwise-bank.js` contains 18 independently authored short informational/practical sequence tasks, three per CEFR level. It does not import or reuse `STORIES`.
- **Soundscape — Sound Maze:** the reviewed 216-item bank is registered when its existing lazy-loaded content script becomes available; 36 items are exposed per CEFR level across Guided, Steady and Challenge.
- **Soundscape — Dictation:** Practice Lab's eight A1–B2 sentences are registered when Practice Lab is lazy-loaded. Exact normalized transcription is the adapter's correctness rule.
- **Real World — Speaking & Shadowing:** the same eight Practice Lab sentences are exposed as speech tasks. The score is explicitly a recognized-word coverage estimate, not a pronunciation-quality score.
- **Real World — Directions:** existing map-coordinate answer semantics remain intact.

### Lazy source registration

`EPIPHANY_FLUENTIA_REGISTER_SOURCES` incrementally registers sources when their existing lazy modules load. This avoids eagerly downloading Practice Lab or Sound Maze content at app startup. The service worker caches the small Textwise bank as a core asset; the existing optional asset policy remains in place for large lazy modules.

### Legacy progress compatibility

`fluentia-progress-bridge.js` provides a read-only snapshot of saved vocabulary, review records, grammar trap counters and adaptive skill signals. It also projects normalized Fluentia result events back to the legacy source activity, question ID, CEFR level, skill and error/trap fields. The engine result event now carries `sourceActivityId`.

This bridge intentionally does **not** write to localStorage/Supabase, change review schedules, or award XP. Legacy renderers remain responsible for their current progress and rewards until the new Fluentia UI is implemented and its result-writing behavior is tested. This prevents double-counting while both systems coexist.

### Remaining content boundaries

- User-entered/saved words without a verified CEFR match remain outside mixed sessions; the adapter will not guess a level.
- Speed Round's timer/reward loop remains a legacy renderer. The new dynamic Wordcraft review source supplies tagged personalized retrieval candidates, but does not claim to reproduce the 60-second timer.
- Practice Lab currently supplies A1–B2 samples only; it does not fabricate C1/C2 speaking or dictation items.
- The new sequencing bank is an independent first content batch; expanding its volume is separate from the adapter contract.
- No mixed-session UI, progress writes, XP changes, or visual redesign is enabled by this integration batch.
