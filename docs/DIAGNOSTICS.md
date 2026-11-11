# EPIPHANY Diagnostics

## Purpose

The Diagnostics panel is a developer-only troubleshooting tool for loading, adaptive policy, retry, and service-worker cache behavior. It is separate from learner analytics and the opt-in Supabase telemetry in `telemetry.js`.

## Activation and privacy

- The diagnostics script is loaded only when an authorized developer opens Developer Mode > Diagnostics.
- Recording is off by default and must be started manually.
- Authorization is checked again when a recording starts and when events are accepted.
- Events remain in page memory only. The ring buffer is capped at 200 events.
- No diagnostics event is written to localStorage, sessionStorage, IndexedDB, Supabase, or another remote endpoint.
- The service worker sends cache outcomes only to the specific page client that explicitly started diagnostics. It stops when that client sends the stop message.
- Reloading or closing the page ends the session. Export is an explicit local JSON download.
- The collector uses an event and field allowlist. It stores asset basenames without query strings, and never stores raw error messages, stack traces, learner answers, account identifiers, or arbitrary event payloads.

## Recorded events

| Event | Meaning |
| --- | --- |
| `session_started` / `session_stopped` | Manual recording lifecycle |
| `load_queued` | A feature group or optional asset entered the scheduler |
| `load_started` | A scheduled asset began loading, including queue wait and active optional load count |
| `load_succeeded` / `load_failed` | Asset or feature group completion |
| `retry_scheduled` / `retry_started` | Bounded optional-load recovery lifecycle |
| `adaptive_policy` | Coarse online, resource, bandwidth, pressure, and loading-policy state |
| `cache_result` | Network success, exact cache fallback, unversioned fallback, or offline miss |

## Developer workflow

1. Open Developer Mode and choose Diagnostics.
2. Select **Start recording**.
3. Reproduce the slow load or failure in the app. The recording continues while the developer panel is closed.
4. Return to Diagnostics to inspect the latest events.
5. Stop recording when you have captured the issue.
6. Export the current sanitized buffer when a local diagnostic artifact is needed; clearing the buffer is also available during a session.

The panel shows the latest 60 events while the in-memory buffer retains up to 200. Export includes the sanitized events currently in memory.

## Performance boundaries

The collector is dormant unless explicitly activated. Instrumentation calls are guarded and fail closed. It does not add polling, timers, observers, network requests, or persistent storage. The service worker only sends cache events to an explicitly registered client. No diagnostic data is sent to Supabase; existing learner telemetry behavior and consent remain unchanged.

## Validation

Automated tests cover default-off behavior, developer authorization, event and field allowlists, query-string removal, bounded memory, stop/clear/export behavior, service-worker client opt-in, and integration hooks in the lazy loader and adaptive engine.
