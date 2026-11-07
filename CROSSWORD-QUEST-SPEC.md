# Crossword Quest — Game Specification

**Status:** Core direction approved; implementation may begin.  
**Branch:** `main`

## Product direction

Crossword Quest is a classic crossword puzzle presented through a modern, responsive interface. The player solves a numbered grid of across and down words. The grid is the primary focus; clues are shown only when requested.

## Approved decisions

- Use manually designed, individually reviewed crossword grids for the first release.
- Defer automatic puzzle generation to a later phase.
- Release target: **96 distinct puzzles**, 24 in each level: Easy, Medium, Hard, Expert.
- The content may be expanded later without changing the core game model.
- Distribute themes and vocabulary across all levels; difficulty must remain balanced through vocabulary familiarity, clue directness, crossing support, and reasoning demand—not grid size alone.
- Crossword Quest has its own four-level difficulty selection. It does not replace or reuse Guided / Steady / Challenge as its level system.
- The grid is the main focus of the play screen.
- The player selects a cell/word; **Show Clue** reveals the clue for that selected word only when requested.
- No mandatory timer, countdown, or time pressure.
- A wrong attempt must not reveal the answer. The player may correct or clear entered letters.

## Working technical defaults

These are implementation defaults, subject to review during the first puzzle-bank review:

| Level | Working grid size | Puzzle count |
|---|---:|---:|
| Easy | 5×5 | 24 |
| Medium | 7×7 | 24 |
| Hard | 9×9 | 24 |
| Expert | 11×11 | 24 |

- Minimum word length: 3 letters.
- Use classic black and white cells and standard clue numbering.
- Every open cell must participate in both an across and a down answer.
- Every answer must be a real, level-appropriate English word with a clear clue.
- Every crossing letter must agree.
- Avoid obscure abbreviations, arbitrary filler entries, ambiguous clues, and multiple plausible answers.
- Every puzzle must have a complete, internally consistent solution before it enters the approved bank.

## First-release gameplay model

- A player chooses one of the four Crossword Quest levels.
- Puzzles are presented as a reviewed sequence within that level.
- Selecting a cell selects its across/down entry; selecting the same crossing cell again may switch direction.
- Letters can be entered, replaced, or erased. The interface should support touch, mouse, and keyboard navigation.
- **Show Clue** reveals the selected entry's clue on demand; clues are not permanently listed beside the grid.
- A check action validates the current grid without exposing the solution. An incorrect grid receives neutral corrective feedback, not the answer.
- A completed puzzle receives a clear completion state and allows the player to continue to the next puzzle.

## Icon

Use a dedicated Crossword Quest icon in the existing Think Lab icon system. It should match the approved light outline treatment, consistent size, alignment, and stroke weight. Do not add a duplicate glyph beside the SVG icon.

## Content distribution

The 96-puzzle bank should mix familiar and progressively more demanding themes across all four levels. Candidate themes include everyday life, home, food, nature, animals, travel, places, work, science, technology, culture, arts, and language expressions. Theme choice is flexible; vocabulary and clue difficulty must remain appropriate to the selected level.

## Still to define during implementation and content review

- Final scoring and reward integration with shared EPIPHANY progression.
- Exact persistence/resume behavior for puzzle progress.
- Final content-bank entries and all 96 reviewed grids.
- Any optional assistance beyond the approved on-demand clue.

Do not invent scoring or reward changes while implementing the grid interaction. Preserve existing shared progression behavior until its integration is explicitly reviewed.
