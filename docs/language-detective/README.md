# Language Detective — Case Library

This folder contains the authoring standard, implemented cases, and provisional case drafts for Language Detective.

## Design standard

- [Language Detective Case Design Standard](../LANGUAGE-DETECTIVE-CASE-DESIGN-STANDARD.md) — approved rules for task clarity, evidence, answer models, CEFR progression, modes, and case validation.

## Case library

Cases may be **everyday mysteries** or stories set in the site's wider fictional world. They do not all need to connect to the story-world lore. Implementation status is tracked per case. Story-world proposals remain non-canon until explicitly reviewed; everyday mysteries are independent of the story world.

### Everyday mysteries

- [A1-002 — The Blue Scarf](./cases/A1-002-the-blue-scarf.md) — a self-contained station mystery about tracing a lost item through three short records. Implemented everyday A1 investigation (runtime `CASE-004`).

### Story-world cases

- [A1-001 — The Mark on the Traveler's Hand](./cases/A1-001-the-mark-on-the-travelers-hand.md) — an early lore-comprehension pilot about the meaning and limits of the restraint mark. Retained as an exploratory draft; it is not the model for every A1 case and is not yet approved for implementation.

## Workflow

1. Review the case truth, evidence, task wording, answer model, and CEFR fit.
2. Review story-world additions separately; an implemented case does not automatically make proposed lore canon.
3. Keep learner-facing presentation and assessment data in the same case registry.
4. Add regression checks for evidence boundaries, accepted answers, distractors, and mode invariants.
5. Build independent cases for each CEFR level; do not reuse a solved case as a harder-level case.
