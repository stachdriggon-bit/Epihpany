# EPIPHANY World Archive — event registry

**Status:** Initial schema and pilot data; all six entries are provisional, not final canon.

The archive separates **events** from **stories**. Events have stable IDs and can be referenced by multiple stories or collections; stories can point to multiple events. Collections reference IDs rather than copying records.

## Event fields
- `id`: permanent event identifier; never recycle IDs.
- `title`, `summary`: source-supported display text.
- `placeId`: stable place registry ID.
- `date.kind`: `exact`, `range`, `era`, `relative`, or `unknown`.
- `date.label`: date or uncertainty label.
- `relativeOrder`: source-established local sequence, not a calendar date.
- `seriesId`, `storyIds`: links to existing content.
- `status`: `provisional`, `accepted`, `disputed`, or `open`.
- `evidenceType`: for example `documented-event`, `testimony`, `story-scene`, or `disputed-account`.

## Pilot: The Two Records at the Low-Water Shore

The six entries correspond to the provisional B1 story episodes and use **OR-LOC-02 — The Low-Water Shore**. No exact date, era, or calendar system has been assigned. The relative order is only the episode sequence and must not be presented as a dated historical chronology.

The relationship between **OR-LOC-02** and **OR-CITY-04 — Ambrin** remains unresolved. This pilot deliberately does not claim that the events occurred in Ambrin.

## Chronology rules
1. Sort exact dates/ranges only when their precision supports comparison.
2. Keep undated events visibly undated; never manufacture a year or era.
3. Use relative order only within a source-established sequence.
4. Distinguish an event from a later account of it.
5. Keep event time, in-world knowledge time, and player discovery time separate.
6. Link every archive claim to a story or other evidence record.
