# Expansion data architecture

The combined data-expansion.js payload has been replaced by six independent CEFR banks: vocabulary, spelling, grammar, story, listening and advanced. A game request loads only that game's bank plus the shared expansion layer; it does not fetch the other five banks.

The expansionShared group contains authored Arabic translations, the shared registration runtime and 60 Word of the Day additions. The runtime exposes window.EPIPHANY_REGISTER_EXPANSION_BANK(game, entries) and tracks registration in window.EPIPHANY_EXPANSION_BANKS. Each module contains only its own game's tuples. Registration validates the payload before mutation, preserves sequential question IDs, applies the authored translations, runs the existing duplicate policy and refreshes window.EpiphanyExpansion diagnostics.

The WOTD extension remains shared and loads once with the common layer on the first expansion-game request. Every game waits for its own expansion<Game> group. Shared and game groups validate readiness instead of trusting a script load event. Failed initialization clears the relevant script/cache entries and allows retry. All expansion modules remain optional service-worker assets and are excluded from the initial HTML and core cache.

Future content rules:
1. Add questions only to the owning game's module.
2. Keep shared translations and WOTD content in the shared layer, never duplicated across game banks.
3. Add readiness checks and tests for every new module or registry.
4. Test game isolation, CEFR coverage, answer structure, Arabic option alignment, deduplication and offline allowlisting.
5. Never restore a combined expansion script or add optional banks to index.html or CORE_ASSETS.
