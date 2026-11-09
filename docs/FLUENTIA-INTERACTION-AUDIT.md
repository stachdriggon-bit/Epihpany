# Fluentia Interaction Audit

Date: 2026-11-09
Branch: `main`

## Soundscape — Sound & Picture Match

**Finding:** The previous Fluentia presentation exposed the object name beside its pictogram and built the choices from every word in the activity bank. That changed a listening-to-picture task into a visible word-recognition task and produced an oversized answer list.

**Implemented correction:**
- Each question now receives exactly four visual choices from the same CEFR level. The source bank covers all six levels: A1 has 9 prompts; A2, B1, B2, C1 and C2 each have 4 prompts.
- The correct choice is always included; distractors are unique and selected in a stable, deterministic order.
- The answer tiles render pictogram artwork only. Object names are kept in the answer value for evaluation and are not rendered in the tile.
- Tiles use neutral accessible labels ("Picture option 1" etc.) rather than announcing the object name.
- Existing audio playback and the adapter's word-based evaluation are preserved.

**Asset note:** The existing emoji symbols remain as a fallback, and the activity now uses original, locally stored SVG object illustrations through the `image` field. The SVG sprite is served from the repository and its images are cached by the service worker after first use; no external image URLs are required. Dedicated pictograms are provided for the higher-level vocabulary instead of reusing beginner words.

## Review of the remaining activities

| Domain / activity | Current response format | Audit result |
|---|---|---|
| Wordcraft — Word Collector / Word Detective | Multiple-choice answers | Appropriate: the player is identifying vocabulary/spelling forms. |
| Wordcraft — Speed Round | Typed word recall from a meaning prompt | Appropriate: it tests active retrieval rather than recognition. |
| Wordcraft — Word Match | Types a meaning for a supplied word | Functional, but the name suggests a pair-matching interaction; consider a true two-sided matching UI in a separate improvement. |
| Sentence Studio — Sentence Shaper / Common Mistakes | Multiple-choice answers | Appropriate for selecting a grammatical form or correction. |
| Sentence Studio — Spot the Mistake | Selects a word token from the sentence | Appropriate: the selectable words are the target of the error-identification task. |
| Sentence Studio — Type It | Typed response | Appropriate: it tests production without multiple-choice hints. |
| Sentence Studio — Sentence Builder | Types the ordered words separated by `>` | Interaction mismatch: the activity is a word-order builder, but Fluentia currently uses a plain text field instead of movable/selectable word tiles. |
| Textwise — Meaning Detective | Multiple-choice comprehension | Appropriate for a comprehension question. |
| Textwise — Text Sequencing | Types the ordered steps separated by `>` | Interaction mismatch: sequencing should be a reorderable sequence, not a free-text transcription task. |
| Soundscape — Sound Maze | Word choices for phonological contrasts | Appropriate: the task distinguishes spoken sound patterns/phonemes; visible word forms are meaningful answer choices, unlike Sound & Picture Match. |
| Soundscape — Dictation / Practice Dictation | Types the sentence heard | Appropriate: transcription is the intended skill. |
| Real World — Lost in London | Multiple-choice practical communication | Appropriate for the supplied scenario questions. |
| Real World — Directions | Types map coordinates | Interaction mismatch: the content is spatial/map-based, but the Fluentia control asks for coordinates instead of allowing a map location to be selected. |
| Real World — Speaking & Shadowing | Speech recognition with editable transcript fallback | Partially appropriate: it captures words and compares the transcript, but does not assess pronunciation quality. The current UI explicitly discloses this limitation. |
| Fine Sense — Nuance Navigator | Multiple-choice interpretation | Appropriate for comparing subtle meanings and pragmatic nuance. |

## Follow-up work identified

The following are separate interaction improvements, not regressions in Sound & Picture Match:
1. Replace Sentence Builder and Text Sequencing text fields with accessible reorderable word/step tiles.
2. Replace Directions coordinate entry with selectable map locations, preserving the existing direction data and evaluator contract.
3. Decide whether Word Match should become a true pair-matching interface or retain its current typed-meaning retrieval format and be renamed accordingly.

Do not change Sound Maze to picture choices: its visible word options serve its phonological discrimination objective. Do not convert Dictation into a multiple-choice activity.
