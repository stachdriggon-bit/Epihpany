# Crossword Quest — Easy Lexicon Sourcing

**Status:** Source policy approved for content production; no third-party word list has been copied into the game.
**Branch:** `main`

## Purpose

The Easy bank needs enough ordinary, cross-compatible English vocabulary to build 24 manually reviewed 7×7 grids. A candidate word is not playable content until its meaning, learner suitability, clue, and every crossing have been checked.

## Preferred discovery source

Use the English Speller Database (ESDB), the successor to SCOWL, as a *discovery and spelling-validation reference*:

- Project: https://github.com/en-wl/wordlist
- Documentation: https://github.com/en-wl/wordlist/blob/v2/README.md
- The project describes the combined database as available under an MIT-like license and identifies size 35 as its recommended small vocabulary set.
- For candidate discovery, prefer common entries, ordinary parts of speech, and standard spelling. Exclude abbreviations, proper names, Roman numerals, offensive/vulgar entries, archaic forms, unusual variants, and technical or specialist vocabulary unsuitable for Easy.

The project itself notes that larger size bands contain unusual or less-current words. Do not treat dictionary acceptance as proof that a word is appropriate for a beginner crossword.

## Content rules

1. Every retained answer must be a real, ordinary English word suitable for beginner learners.
2. Write original, concise clues for EPIPHANY; do not copy dictionary definitions or source descriptions.
3. Check the intended sense and part of speech manually.
4. Avoid proper nouns, abbreviations, inflected oddities, obscure spellings, and words that need specialist knowledge.
5. Do not add a word solely because it helps a crossing. It must remain a fair answer to its own clue.
6. Candidate words stay outside the playable bank until they form part of a complete, validated puzzle.
7. Every 7×7 puzzle must have complete across/down entries, matching crossing letters, distinct clear clues, and one connected open grid. All open cells must belong to both an across and a down answer.
8. Review the full 24-puzzle set for repeated answers, clue ambiguity, vocabulary balance, and theme coverage before unlocking Easy.

## Licensing and attribution

- Keep the source project's MIT-like license and copyright notice with any redistributed material derived from its database.
- Do not import or redistribute data from wordfreq as a shortcut: its data files are distributed under CC BY-SA 4.0 and carry additional attribution requirements.
- This document records the source-selection policy only. It does not claim that ESDB data has been downloaded, imported, or used to create the existing 144 manually curated candidates.

## Current status

- Existing Easy candidate lexicon: 144 entries across eight approved themes.
- Existing candidates remain manually authored; the source above is a controlled reference for expanding and checking the pool.
- Playable Easy puzzles: 0 of 24. The level must remain locked until all 24 reviewed grids pass the repository validator and content review.
