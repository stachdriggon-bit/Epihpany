# Expansion data loading architecture

## Current migration boundary

The expanded CEFR content is currently a shared dataset. data-expansion.js adds questions to Vocabulary, Spelling, Grammar, Story, Listening and Advanced; extends WOTD_WORDS; applies authored Arabic translations to original and expansion questions; calculates diagnostics; and performs a cross-game duplicate pass.

Moving this file behind the expansion lazy-data group is the first safe boundary. It is not requested during initial HTML parsing or service-worker installation. It loads on the first request for any of the six affected core games. The loader validates the diagnostics and all six question banks before resolving, then refreshes Fluentia adapters.

## Runtime contract

- lazy-data.js is the authoritative manifest for optional data groups.
- A feature must await window.EPIPHANY_LAZY_LOAD(group) before reading data supplied by that group.
- A group is not ready merely because its script emitted a load event. Add a readiness check for required globals and data shape in loadGroup().
- If readiness fails, remove the failed script, clear loaded/pending cache entries, reject the request and allow retry.
- Keep optional data out of index.html and CORE_ASSETS; list it in LAZY_ASSETS for on-demand offline caching.
- Refresh dependent registries such as Fluentia after the group is loaded and validated.

## Rules for future expansion content

1. Do not add large expansion datasets to data.js, index.html, or the service-worker core list.
2. Add new expansion scripts to the relevant lazy-data manifest group and the service-worker lazy allowlist.
3. Give independently requested features their own group rather than loading unrelated content together.
4. Add tests proving absence from initial HTML/core cache, on-demand loading, single loading, and readiness validation.
5. Add content tests for CEFR coverage, question shape, Arabic answer alignment, and duplicate behavior.
6. When the content is split into per-game files, use a shared registration/normalization contract; content modules should register only their own game payload, while cross-bank operations stay outside content files.

## Next migration

The current 265 KB file is now a lazy payload, but it remains one shared payload. The next step is to extract six game banks into per-game modules and isolate shared translation and word-of-the-day data behind explicit registries. That extraction must preserve baseline question counts, answer/translation semantics and duplicate behavior before replacing the transitional shared group with per-game groups.