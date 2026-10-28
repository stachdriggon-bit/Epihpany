# EPIPHANY World Archive — event registry

**Status:** Event registry with six provisional Low-Water Shore pilot records and three accepted, undated local fantasy story-scene records. Accepted story-scene canon is not presented as independently verified history.

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

## Location-history integration

Use [Local History Register](LOCAL-HISTORIES.md) to build the history of each place from its existing stable location ID. A location history summarizes supported changes and open questions; it must reference event IDs from this registry rather than invent parallel event IDs or copy event records. The [Timeline Framework](TIMELINE.md) is a view and method, not a substitute for these source records.

## Canon boundary for the pilot

The six Low-Water Shore entries remain provisional and follow only the episode sequence. They do not establish a calendar date, a universal era, the lake's ultimate cause, a world-scale mystery, or an identity decision about Ambrin. If an episode draft changes, update the corresponding registry entry and check the location history and any dependent archive views.


## Six pilot event records

These IDs describe the current six episode drafts. They are **story-scene records**, not independently verified history. Keep the episode order as the relative sequence for this pilot only. Event dates remain unknown except that Episode 5 occurs after the first measurement period. Do not turn that sequence into a world-era chronology.

### EVT-OR-001 — The Records Appear to Disagree

- **Title:** The Mismatch
- **Place ID:** OR-LOC-02
- **Date:** `kind: unknown`; unassigned relative period
- **Relative order:** 1 of 6
- **Status:** provisional
- **Evidence type:** story-scene
- **Story ID:** `world-low-water-ep1`
- **Participants:** Tarin Vell (OR-CHAR-001), Sella Orin (OR-CHAR-002)
- **Summary:** The lake has receded from the old landing steps. A dock log records that water reached the third step during the previous spring, while a family notebook marks a garden edge after several dry seasons. Tarin is considering moving a small storehouse, but the records do not yet explain the long-term pattern.
- **What is established in this episode:** The records serve different purposes and do not directly measure the same thing at the same time.
- **What is not established:** A long-term lake trend, dishonesty, or the ultimate cause of shoreline variation.
- **Knowledge boundary:** The characters begin without knowing why the records differ.
- **Source:** `stories/THE-TWO-RECORDS-EPISODE-01-DRAFT.md`.

### EVT-OR-002 — The Records' Original Purposes Are Clarified

- **Title:** Who Wrote It?
- **Place ID:** OR-LOC-02
- **Date:** `kind: relative`; follows EVT-OR-001, described as the next morning
- **Relative order:** 2 of 6
- **Status:** provisional
- **Evidence type:** story-scene
- **Story ID:** `world-low-water-ep2`
- **Participants:** Tarin Vell (OR-CHAR-001), Sella Orin (OR-CHAR-002)
- **Summary:** A note inside the dock log explains that water was recorded at loading time when the landing crew needed a safety decision. The family notebook marks the garden edge after dry seasons to track useful planting soil. The records answer different questions.
- **What is established in this episode:** The dock log is intermittent by design; the garden boundary is not a direct water-level measurement.
- **What is not established:** Either writer was dishonest or either record alone establishes a long-term lake trend.
- **Knowledge boundary:** The characters understand the purpose and limits of the two records more clearly.
- **Source:** `stories/THE-TWO-RECORDS-EPISODES-02-06-DRAFT.md`, Episode 2.

### EVT-OR-003 — The Garden Marker Is Compared with the Shoreline

- **Title:** The Shoreline
- **Place ID:** OR-LOC-02
- **Date:** `kind: relative`; follows EVT-OR-002, exact interval unknown
- **Relative order:** 3 of 6
- **Status:** provisional
- **Evidence type:** story-scene
- **Story ID:** `world-low-water-ep3`
- **Participants:** Tarin Vell (OR-CHAR-001), Sella Orin (OR-CHAR-002)
- **Summary:** The characters inspect an old garden marker and a low stone line that may have supported a fence. Sella measures from the marker to the current waterline and records the method so it can be repeated.
- **What is established in this episode:** A physical marker and a repeatable measurement method are available for comparison.
- **What is not established:** The garden boundary and shoreline moved by the same distance, or that one clue proves a larger theory.
- **Knowledge boundary:** The characters begin distinguishing evidence about land use from evidence about lake level.
- **Source:** `stories/THE-TWO-RECORDS-EPISODES-02-06-DRAFT.md`, Episode 3.

### EVT-OR-004 — Competing Explanations Are Compared

- **Title:** Another Explanation
- **Place ID:** OR-LOC-02
- **Date:** `kind: relative`; follows EVT-OR-003, exact interval unknown
- **Relative order:** 4 of 6
- **Status:** provisional
- **Evidence type:** story-scene
- **Story ID:** `world-low-water-ep4`
- **Participants:** Tarin Vell (OR-CHAR-001), Sella Orin (OR-CHAR-002)
- **Summary:** The characters compare three plausible possibilities: seasonal variation in lake level, differences in what the records describe, and a changed garden boundary. They consider what evidence would help distinguish these possibilities.
- **What is established in this episode:** Multiple explanations remain plausible and may coexist.
- **What is not established:** One definitive cause for the lake's behavior.
- **Knowledge boundary:** The characters identify the need for comparable observations rather than selecting the most satisfying explanation.
- **Source:** `stories/THE-TWO-RECORDS-EPISODES-02-06-DRAFT.md`, Episode 4.

### EVT-OR-005 — A Second Comparable Measurement Is Recorded

- **Title:** One More Observation
- **Place ID:** OR-LOC-02
- **Date:** `kind: relative`; after the next season, compared with the first measurement
- **Relative order:** 5 of 6
- **Status:** provisional
- **Evidence type:** story-scene
- **Story ID:** `world-low-water-ep5`
- **Participants:** Tarin Vell (OR-CHAR-001), Sella Orin (OR-CHAR-002)
- **Summary:** The characters return to the same landing step after the next season. The water is at a different height. They record the date, recent weather, and exact point where water meets the stone, then compare this observation with the earlier measurement and older records.
- **What is established in this episode:** The two measurements describe different moments; the observed level is lower than at the first measurement.
- **What is not established:** A reliable long-term trend or ultimate cause. Two observations alone are insufficient for that conclusion.
- **Knowledge boundary:** The characters have a more comparable record but remain cautious about extrapolation.
- **Source:** `stories/THE-TWO-RECORDS-EPISODES-02-06-DRAFT.md`, Episode 5.

### EVT-OR-006 — The Community Chooses a Practical, Reversible Response

- **Title:** A Careful Decision
- **Place ID:** OR-LOC-02
- **Date:** `kind: relative`; follows the additional observation; exact date unknown
- **Relative order:** 6 of 6
- **Status:** provisional
- **Evidence type:** story-scene
- **Story ID:** `world-low-water-ep6`
- **Participants:** Tarin Vell (OR-CHAR-001), Sella Orin (OR-CHAR-002), residents of the settlement
- **Summary:** At a town meeting, residents discuss the incomplete evidence and practical risks. They agree to move the most valuable tools to higher shelves and place a clear marker at the measurement step while continuing observations.
- **What is established in this episode:** The community adopts a limited protective action that does not require a definitive theory of the lake.
- **What is not established:** The lake's ultimate cause, a permanent settlement-wide relocation, or a world-scale consequence.
- **Knowledge boundary:** The characters and residents distinguish a practical decision from a proven explanation.
- **Source:** `stories/THE-TWO-RECORDS-EPISODES-02-06-DRAFT.md`, Episode 6.

## Registry maintenance note

If an episode changes, update its event record without recycling the ID. If the story is removed or materially rewritten, mark the affected record superseded or revise its status and source references. A later accepted historical event may reuse this event's evidence only after an explicit canon decision; a story-scene record does not become accepted history automatically.


## Approved local fantasy story events

These three records were explicitly approved by the project owner as **local story-scene canon**. They remain undated; approval does not make them independently verified history. Each is confined to its listed anchor and phenomenon. No shared origin, wider geographic effect, or common era is implied.

### EVT-IL-001 — Seven Breaths Beneath the Middle Arch

- **Title:** Seven Breaths Beneath the Middle Arch
- **Place ID:** IL-LOC-01
- **Date:** `kind: unknown`; no calendar date or era assigned
- **Status:** accepted
- **Evidence type:** story-scene
- **Story ID:** `world-seven-breaths-beneath-middle-arch`
- **Phenomenon ID:** MP-IL-001 — The Returning Current
- **Summary:** During a dangerous ferry crossing, a narrow ribbon of river water briefly flows upstream beneath the middle arch and pulls the ferry rope sideways. Mira helps bring the crossing under control. The event prompts a dispute over maintenance costs; a time-limited levy on loaded commercial carts is proposed with public accounting and review.
- **What is established in this story:** The local reverse-flow occurs and can make the crossing dangerous; the community considers a bounded, reviewable response to repair costs.
- **What is not established:** The phenomenon's cause or frequency, any exact date, a wider river effect, or a universal magical rule.
- **Knowledge boundary:** The characters respond to the observed hazard; they do not discover its ultimate cause.
- **Source:** `stories/THREE-LOCAL-FANTASY-STORY-TESTS.md`, “Seven Breaths Beneath the Middle Arch”.

### EVT-TH-001 — The Thread That Climbed

- **Title:** The Thread That Climbed
- **Place ID:** TH-LOC-02
- **Date:** `kind: unknown`; no calendar date or era assigned
- **Status:** accepted
- **Evidence type:** story-scene
- **Story ID:** `world-the-thread-that-climbed`
- **Phenomenon ID:** MP-TH-001 — The Climbing Thread
- **Summary:** During a period of reduced spring flow, Evin investigates accusations around the brief uphill movement of a thread-thin line of water. He and local residents find roots and silt obstructing a side passage, improving flow without fully explaining the spring's shortage. The community agrees to record flow and rotate water shares and repair duties.
- **What is established in this story:** The brief climbing-water effect is observed; a physical obstruction affects one channel; the obstruction does not fully explain the weak supply.
- **What is not established:** The phenomenon's cause, the complete cause of the spring shortage, or a universal diagnostic power.
- **Knowledge boundary:** Evin records both findings and uncertainty; the phenomenon is not treated as a precise gauge or proof of guilt.
- **Source:** `stories/THREE-LOCAL-FANTASY-STORY-TESTS.md`, “The Thread That Climbed”.

### EVT-AZ-001 — When the Stormglass Fell Silent

- **Title:** When the Stormglass Fell Silent
- **Place ID:** AZ-LOC-02
- **Date:** `kind: unknown`; no calendar date or era assigned
- **Status:** accepted
- **Evidence type:** story-scene
- **Story ID:** `world-when-the-stormglass-fell-silent`
- **Phenomenon ID:** MP-AZ-001 — The Stormglass Echo
- **Summary:** When a cracked resonant stone fitting falls silent, residents fear their communal cistern is empty. A marked measuring rod shows that water remains, while inspection reveals an ordinary leak. The community repairs the leak and adopts transparent rationing that prioritizes drinking and cooking, reduces garden shares, and allows a limited sale to visiting crews only after household allotments.
- **What is established in this story:** The maintained fitting can provide a rough acoustic clue but is not an exact measure; its silence does not mean the cistern is empty; direct measurement, inspection, and collective rationing remain necessary.
- **What is not established:** The fitting's origin, exact accuracy, future weather, or any wider magical mechanism.
- **Knowledge boundary:** The characters do not treat the echo as a purity test, exact volume reading, or forecast.
- **Source:** `stories/THREE-LOCAL-FANTASY-STORY-TESTS.md`, “When the Stormglass Fell Silent”.
