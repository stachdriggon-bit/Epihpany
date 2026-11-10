# Velorn Phase 3 — Trusted Game Validator Registry

> **Status (2026-11-10):** Phase 3A inventory and trust contract. This document records the current browser-side evidence model and the server-validation boundary. It does not enable event ingestion, missions, claims, rewards, or economy access.

## 1. Objective

Build a server-owned validation layer between EPIPHANY learning experiences and the private Velorn event ledger. The browser may provide answers and interaction requests, but it must never be the authority for user identity, completion, score, distinctness, reward eligibility, or reward amount.

Phase 1 and Phase 2 are deployed. The economy remains disabled. This phase must not change that state.

## 2. Current trust finding

The current application is a static Vanilla-JS PWA. The inspected game engines, answer evaluators, session counters, case progress and most progress snapshots execute in the browser. Learning progress is stored locally and synchronized through `player_progress`; that record is mutable player progress, not authoritative evidence.

Consequently, **no current browser-generated completion event is eligible to earn Velorn yet**. A client-side boolean, score, completed session object, local-storage counter, XP value, or case status is not sufficient proof. A signed-in user ID alone does not make a browser result trustworthy.

The Phase 2 RPC accepts only evidence already validated by a trusted server caller. It is not a validator and must not be called directly from the PWA.

## 3. Experience inventory and initial eligibility

### 3.1 Fluentia

Fluentia has a shared session engine and adapters across six learning domains. The current adapter registry includes:

- Wordcraft: Vocabulary, Spelling, Word Match, Speed Round, Personal Review.
- Sentence Studio: Grammar, Common Mistakes, Spot the Mistake, Type It, Sentence Builder, Personal Review.
- Textwise: Meaning Detective and Text Sequencing.
- Soundscape: Sound & Picture Match, Sound Maze, Dictation Bank, Dictation.
- Real World: Lost in London, Directions, Speaking & Shadowing.
- Fine Sense: Nuance Navigator.

The shared engine creates browser session IDs, selects bank items, evaluates submitted answers and emits per-answer events in browser memory. The answer keys and evaluation functions are delivered to the browser. Therefore all current Fluentia adapters are **unverified for economy purposes**.

Potential future route: issue a server-owned session challenge, select/record eligible item IDs server-side, validate submitted answers against server-owned canonical bank/evaluation versions, enforce item/session uniqueness and timing limits, then derive completion on the server. Never trust the browser's `correct`, `completedCount`, `targetCount`, `accuracy`, or score fields.

Speaking & Shadowing and other speech-recognition-dependent interactions need a separate constrained-result policy; browser speech recognition is not authoritative proof of pronunciation quality.

### 3.2 Think Lab

The current Think Lab experiences include Odd One Out, Word Ladder, Sound Maze, Word Connections, Sentence Scramble, Word Forge, Chain Reaction, Word Hunt, Codebreaker and Letter Grid, with Crossword Quest also maintained as a separate experience.

Their current content banks, evaluators and game/session state run in the browser. The user can inspect or modify those assets and state. Thus all current Think Lab completion signals are **unverified for economy purposes**.

Potential future route: server-issued challenge/session identifiers and server-side selection/evaluation using versioned canonical content. Each game requires a specific validator contract; do not assume all games share a score or round structure. For games where content is fully public, the server still needs to own the authoritative expected result and enforce valid item selection, answer count, retry policy and session lifecycle.

### 3.3 Casebound / Language Detective

Casebound has the strongest existing domain model: stable case IDs, investigation sessions, evidence discovery, interview selections, witness choices, conclusion paths, and a deterministic assessment engine. However, the current case fixtures, session state and final assessment execute in the browser. The player can alter local session state or submit directly to the client-side evaluator.

Current Casebound results are therefore **unverified for economy purposes**, despite the quality of the client-side assessment and its test coverage.

Potential future route: move the canonical case fixture/version and evaluation into a server-owned validator; persist server-issued investigation sessions and accepted actions; verify required evidence/interview/witness path server-side; evaluate the final response on the server; derive a single stable completion event from the accepted result. Do not send raw conclusion/reasoning text to the economy event table. Keep answer text in the assessment boundary only if operationally required, with an explicit retention/privacy policy; the economy event should contain only case ID/version, validated outcome class, and minimal stable references.

Case Closed must be keyed by a stable distinct case ID and qualifying case version. Retrying or replaying the same case cannot produce a second award.

### 3.4 Other progress and navigation signals

The following are not qualifying evidence: opening a page or game, starting or abandoning a session, a local completion counter, a progress snapshot, an XP change, a streak/login marker, a browser telemetry event, a card action, or an arbitrary `player_progress` JSON field.

## 4. Validation classes

Use these classes in the registry:

| Class | Meaning | Economy eligibility |
|---|---|---|
| Server-verified | Server owns the challenge and authoritative content/rules, verifies the interaction/result, identity, replay and timing, and derives completion | Eligible only after tests and explicit mapping verification |
| Constrained result | Server can independently verify a narrow claim but cannot prove the full learning quality or interaction path | Only the explicitly approved narrow predicate; never a general completion reward |
| Unverified | Browser/local state or browser-side evaluator is the only evidence | No Velorn, mission progress or achievement progress |

**Initial registry state:** all existing Fluentia, Think Lab and Casebound browser completions are Unverified. No template mapping may be marked `verified` on the basis of current client code alone.

## 5. Canonical event contract

The trusted validator should derive a minimal normalized event with:

- `source_event_key`: server-generated stable idempotency key, unique per user.
- `source_system`: stable experience family, not a display label.
- `experience_id`: registered canonical game/experience ID.
- `activity_id`: registered activity or objective ID.
- `event_type`: allow-listed semantic outcome such as `activity_completed`, `challenge_completed`, `case_completed`, or `validated_improvement`.
- `occurred_at`: server-controlled time or a bounded, validated time derived from a server-issued session.
- `validator_version`: immutable server validator version.
- `evidence`: minimal bounded JSON containing only the fields required by a mapped predicate.

The authenticated user ID must be taken from verified Auth context inside the trusted server boundary. Ignore/reject a client-supplied user ID, reward amount, mission ID, period ID, completion flag, score, correct count, or achievement ID. Event payloads must not contain answer text, interview responses, story content, email, profile data, or arbitrary client metadata.

## 6. Required validator controls

Every validator must demonstrate:

1. Authenticated identity is derived server-side; user A cannot submit for user B.
2. Server-issued session/challenge identity, with expiry and explicit lifecycle.
3. Canonical content/rules and validator version are server-owned.
4. Allowed activity, level, mode and item IDs are checked against that server-owned version.
5. Answer evaluation or constrained claim verification is performed server-side.
6. Item/session replay, duplicate submission and cross-session reuse are rejected or idempotently resolved.
7. Rate, timing, attempt and completion bounds prevent farming without punishing legitimate retries.
8. Completion is derived by the server from accepted evidence; the client cannot assert it.
9. Event ingestion and any session state transition are atomic or safely idempotent.
10. Logs and stored evidence exclude raw learning answers and personal content.

## 7. Implementation sequence

- **Phase 3A — Inventory and contract:** this document; all current browser-side signals remain ineligible.
- **Phase 3B — Shared validator service:** implement a server-owned session/challenge and event contract, authentication checks, rate/replay controls, and automated tests.
- **Phase 3C — First production-quality validator:** select one suitable experience with deterministic, bounded content; keep it isolated behind an explicit allow-list and leave all other games ineligible.
- **Phase 3D — Expand validators:** add game-specific validators only after the first implementation passes security, replay, concurrency and clean-room tests.
- **Phase 3E — Verify mission/achievement predicates:** map approved templates only to proven event facts. No mission or achievement is assignable until every required predicate is verified.

## 8. Explicit non-goals and gates

This phase does not create mission boards, assign missions, issue Velorn, expose balances, migrate local token balances, alter XP or Shards, or enable the Card Portal economy.

The timezone source/fallback, reset hour, week-start day, daylight-saving behavior and future-boundary timezone-change policy remain a separate product/configuration decision. Do not infer these settings from the device clock.

The daily/weekly reward values and achievement reward values remain those already approved in `WORLD_CURRENCY_VELORN.md`. Validators prove activity facts; they do not choose rewards.

## 9. Acceptance tests

- A browser-forged completion flag or score cannot create a validated event.
- A client-supplied user ID cannot attribute an event to another account.
- Unknown or retired activity/content/validator versions are rejected.
- A valid event retry returns the original event identity and never increments progress twice.
- A changed payload under the same idempotency key is rejected.
- Expired, abandoned, malformed or already-consumed sessions cannot complete.
- Concurrent final submissions create at most one completion event.
- A valid session can complete without relying on mutable local storage.
- Stored evidence is bounded and contains no raw answer/story/profile content.
- With `economy_enabled = false`, no wallet, ledger, claim or award write can occur.
