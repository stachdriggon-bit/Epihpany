# EPIPHANY — Lore Inventory and Canon Audit

**Audit date:** 2026-10-28  
**Scope:** Existing worldbuilding documentation, geographic registries, chronology, character records, story drafts, and the in-app World Archive.  
**Purpose:** Establish what the project already says before adding dates, events, relationships, or new story canon.

## Executive finding

EPIPHANY already has a substantial worldbuilding foundation. The next step is **not** to invent a replacement lore bible or start assigning dates. The existing `MASTER-CONTENT-BIBLE.md`, Atlas, Geographic Foundation, regional settlement registries, Timeline, Character Canon, Mysteries and Evidence, Decision Log, and story drafts should remain the working source material. This audit connects them and identifies what can safely be developed next.

The app's archive is an index of selected events and stories; it is not, by itself, proof that every linked detail is final canon.

## 1. Source-of-truth hierarchy

When documents differ or a detail is uncertain, use this order:

1. **Explicit project-owner decisions**, recorded in `DECISIONS-LOG.md`.
2. **`MASTER-CONTENT-BIBLE.md`** for global principles and continuity rules.
3. **Source registries** for specific records: the five `CITIES-*.md` files for settlement identities; `CHARACTERS.md` and individual character records for characters; `TIMELINE.md` and `EVENT-REGISTRY.md` for chronology and events.
4. **Atlas and Geographic Foundation** for current spatial proposals, respecting their stated status and limitations.
5. **Story drafts and app data** for what a particular draft depicts. A draft scene is not automatically a world-wide historical fact.
6. **In-world reports, legends, character beliefs, and hypotheses** remain claims until the evidence or an explicit decision supports them.

If two source documents conflict, record the conflict and resolve it explicitly. Do not silently choose one.

## 2. What is established at the framework level

These are current governing principles in the existing documentation:

- The world's ultimate origin remains unresolved; the earliest surviving record is not necessarily the beginning.
- Myths, official histories, oral traditions, archaeological interpretations, and character beliefs are not automatically objective truth.
- Stories can focus on ordinary life as well as unusual phenomena. Not every story or mystery needs to connect to one central plot.
- History should have local, regional/connected, and broad world scales. Distant consequences need a plausible route or causal mechanism.
- Stable IDs should survive renaming where possible. Names, aliases, and different place records must not be duplicated casually.
- The existing English-learning story library should not be retroactively forced into the fictional setting. Lore-linked stories should be connected selectively and continuity-checked.
- Event time, in-world knowledge time, and player discovery/release time are separate.
- Character-card rarity is separate from narrative importance; collectible progression should not require real-money purchases.

These are rules for developing the setting, not evidence that a particular empire, event, mystery, or character exists.

## 3. Geography and settlements

### Current working map

The current mapped inventory contains four named continents — **Ilmar, Orath, Tharima, and Nirvan** — plus the **Azmar archipelagos**. This does not establish that the entire world has exactly four continents. The relative arrangement is Nirvan north, Ilmar west, Orath east, and Tharima south; Azmar consists of separated island groups around maritime passages. The map is schematic, not to scale.

The Atlas and Geographic Foundation contain more detailed working proposals for relief, drainage, seas, routes, and settlement placement. Their exact coastlines, scale, distances, travel times, fine river courses, and some drainage decisions remain open or provisional.

### Approved names versus fully fixed geography

The naming documentation says the project owner approved six settlement names in each of the five regional registries (30 names total), with stable IDs and spellings. This approval does **not** automatically make every precise placement, cultural association, or anchor relationship final.

### Anchor locations

`ANCHOR-LOCATIONS.md` defines ten story-design locations, two for each principal mapped region. The document explicitly marks them as provisional concepts. Their local tensions and story hooks are prompts, not a finalized history of the whole world.

### Required reconciliation: Low-Water Shore and Ambrin

- `OR-LOC-02 — The Low-Water Shore` is the current anchor reference for the six-episode pilot.
- `OR-CITY-04 — Ambrin` may be the settlement-name/registry match for that same place.
- The documents explicitly say this relationship is unresolved.
- Until an owner decision is recorded, do **not** treat them as two separate towns, and do not invent a separate route or history for each.
- The archive currently links the six pilot event records to `OR-LOC-02`, not to Ambrin.

## 4. History and chronology

`TIMELINE.md` is a framework, not a completed world chronology. It lists five possible broad period labels — Scattered Times, First Cities, Interwoven Routes, Age of Rebalancing, and Age of Contested Exploration — but explicitly warns that these are not finalized universal eras and need not begin or end at the same time in every region.

The archive registry currently has six pilot event records for the Low-Water Shore. All six:
- have provisional status;
- have no established calendar date or global era;
- use `period-unassigned`;
- use `relativeOrder` only for the six-episode sequence;
- describe scenes or developments within the draft story, not six dated world-history milestones.

**Do not add years, universal eras, synchronization between regions, ancient causes, or a world-scale event unless supported by a source or explicitly approved.** When a story only establishes that one scene follows another, preserve that local order without converting it into a calendar.

## 5. Current lore-linked story pilot

The only clearly identified world-story pilot in the reviewed materials is **The Two Records at the Low-Water Shore**, a six-episode B1-target series.

Its current draft supports these limited statements:
- Tarin Vell is a practical boat repairer concerned with safe use of the landing.
- Sella Orin maintains and compares local records.
- A dock log and a family garden notebook were made for different purposes and are not direct measurements of the same thing.
- The characters investigate physical marks and plan repeat observations before drawing a stronger conclusion.
- The long-term cause of the lake's changing shoreline remains unresolved.

The draft does **not** establish a conspiracy, supernatural lake, ancient civilization, world-scale mystery, or definitive long-term cause. Tarin and Sella's records remain provisional, story-specific character canon; they are not yet globally finalized or automatically collectible-card canon.

Most other learner stories remain learning-first or setting-neutral. The Story Roadmap explicitly says not to attach them to EPIPHANY's history without a clear, continuity-safe reason.

## 6. Character and society coverage

- `CHARACTERS.md` provides the recurring-character record template and continuity rules; it does not finalize a complete cast.
- Tarin Vell and Sella Orin have separate provisional records for the pilot.
- `CIVILIZATIONS.md` is a design framework with broad regional prompts, not a list of finalized states, peoples, languages, religions, or political borders.
- The naming framework specifically warns against assigning real-world language or cultural analogues based only on geography or a few names.
- Existing project character/card material from elsewhere should be inventoried and reconciled before claiming that the current documentation contains the complete character canon.

## 7. Status vocabulary to preserve

Use the project's existing labels consistently:

- **Accepted:** approved as the current reference or rule.
- **Provisional:** a working proposal that can change with a recorded reason.
- **Open:** deliberately undecided.
- **In-world claim:** something believed, reported, or recorded by a person or institution; not automatically objective truth.
- **Disputed:** accounts or interpretations conflict.
- **Superseded:** replaced by a later recorded decision.

For editorial clarity, a new story can also be described as a **derived story**: it may fit established canon, but its new events do not automatically change the canon. This is a production label, not a replacement for the project's existing status vocabulary.

## 8. Priority gaps — in safe working order

### Priority 1 — Reconcile existing records
1. Decide whether Ambrin is the registered name of the Low-Water Shore settlement, an alias, or a distinct nearby place. Keep the issue open until decided.
2. Review the 30 approved settlement records against the anchor locations and current map; record matches or distinct-place decisions by stable ID.
3. Inventory recurring characters, character-card material, and existing lore references from the wider project before making a claim that the cast list is complete.

### Priority 2 — Build a usable world overview
4. Write a concise author-facing overview of what the world is like, what people generally know, how regions connect, and which principles must not be contradicted. Every statement should be labelled accepted, provisional, or open.
5. Develop regional societies from specific communities and institutions, not stereotypes. Avoid inventing a single unified culture for an entire region.
6. Establish only the minimum geographic facts needed for the next stories; leave exact scale and distances open until the map supports them.

### Priority 3 — Develop history from causes, not arbitrary dates
7. Choose a small number of consequential local histories first: who needed what, what changed, what evidence survives, and what later communities misunderstand.
8. Connect local histories only where a credible route, migration, trade, institution, conflict, or environmental process exists.
9. Add calendar dates only after a usable calendar or dating convention exists and the event's evidence supports the precision.
10. Keep unresolved mysteries independent unless evidence connects them.

### Priority 4 — Expand stories and archive together
11. Treat story drafts as sources for what those scenes establish, not as automatic authority for global history.
12. Give every lore-linked story stable place and character IDs, chronology confidence, knowledge boundaries, and explicit unresolved questions.
13. Add an archive event only when it points to a source-supported scene or record; preserve uncertainty in the event itself.
14. Create side stories that fit canon without changing major history unless a deliberate canon revision is recorded.

## 9. Change-control checklist

Before promoting a new lore detail:
- [ ] Is it supported by an existing source, an explicit owner decision, or clearly labelled as a proposal?
- [ ] Does it duplicate an existing place, person, event, alias, or mystery?
- [ ] Is the stable ID correct?
- [ ] Is the statement an objective fact, an in-world claim, an interpretation, or a rumor?
- [ ] Does the chronology claim more precision than the evidence supports?
- [ ] Have location, character knowledge, travel, technology, and cause-and-effect been checked?
- [ ] Do affected source registries, story drafts, archive entries, maps, cards, and translations need updating?
- [ ] Has the decision and reason been recorded in `DECISIONS-LOG.md` where appropriate?

## 10. Primary references

- [Worldbuilding index](README.md)
- [Master Content Bible](MASTER-CONTENT-BIBLE.md)
- [Atlas](ATLAS.md)
- [Geographic Foundation](GEOGRAPHIC-FOUNDATION.md)
- [Anchor Locations](ANCHOR-LOCATIONS.md)
- [Regional settlement registries](CITIES-ILMAR.md), [Orath](CITIES-ORATH.md), [Tharima](CITIES-THARIMA.md), [Nirvan](CITIES-NIRVAN.md), [Azmar](CITIES-AZMAR.md)
- [Timeline](TIMELINE.md)
- [Event Registry](EVENT-REGISTRY.md)
- [Character Canon](CHARACTERS.md)
- [Civilizations](CIVILIZATIONS.md)
- [Mysteries and Evidence](MYSTERIES-AND-EVIDENCE.md)
- [Decision Log](DECISIONS-LOG.md)
- [Story Roadmap](STORY-ROADMAP.md)
- [Low-Water Shore story drafts](stories/README.md)
