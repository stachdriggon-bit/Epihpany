# Sound & Picture Match — rebuild

Date: 2026-11-09
Status: implementation batch

## Approved scope

- 216 authored picture-word items: exactly 36 each for A1, A2, B1, B2, C1 and C2.
- Every item has a stable ID, CEFR tag, English target word, Arabic word support and a dedicated vector illustration URL.
- The 216 words and illustration URLs are unique.
- Four answer images are selected from the same CEFR level. Every question has exactly one correct picture and three distinct distractors.
- The listening target is spoken through EPIPHANY's existing speech layer; Fluentia picture choices do not display the answer word.
- The legacy Arcade Sound & Picture Match also uses the expanded bank and same-level distractors.
- Artwork is loaded on demand from a pinned OpenMoji revision. jsDelivr is already an approved, runtime-cached vendor origin in the service worker; only images requested by the learner are fetched and cached.

## Content progression

- A1: familiar food, animals, household objects and simple everyday nouns.
- A2: transport, travel, personal devices, weather and household items.
- B1: tools, health equipment, navigation, safety and practical objects.
- B2: musical, scientific, media and technical objects.
- C1: less-common animal names and species.
- C2: specialist zoological and taxonomic vocabulary, represented by a relevant example animal.

The C2 set intentionally moves into specialist terminology rather than presenting common animal names as advanced vocabulary.

## Quality safeguards

- 36 items at every CEFR level; no duplicate English target words, art IDs, illustration URLs or art indices.
- Four unique picture choices per question, all from the selected CEFR level.
- Tests validate the full 216-item bank and adapter output for every level.
- Images use one consistent vector-art family instead of operating-system emoji glyphs.
- External artwork is pinned to an immutable OpenMoji commit and attribution is included alongside the app assets.

## Verification boundary

Automated checks validate item structure, balance, image URLs and distractor construction. They cannot guarantee the final CDN response or visual rendering on every device; browser smoke and deployed-device review remain necessary.
