# EPIPHANY — Content Development Roadmap
**خارطة طريق تطوير المحتوى التعليمي**  
**Roadmap ID:** CDR  
**Status:** Active  
**Repository:** `stachdriggon-bit/Epihpany`

---

## 1. Purpose and scope

This roadmap is the source of truth for the current EPIPHANY educational-content improvement effort. Its purpose is to prevent scope drift, keep decisions visible, and track progress from the initial content audit through content redesign and verification.

The work begins with the existing educational content—not with new story or character expansion. Stories and characters return to focus after the foundational learning activities have been reviewed and improved.

**Working rule:** Do not implement content or code changes for a phase until its audit and design have been discussed and agreed. Update this roadmap whenever a milestone is genuinely completed.

## 2. Agreed design principles

- **Learning quality over raw quantity.** More questions are useful only when they add meaningful practice, variety, progression, or depth.
- **Curiosity over perfection.** Accept clear, natural meaning; do not turn every minor wording difference into a failure.
- **English first, Arabic support optional.** Arabic is a support layer, not a replacement for the English learning task.
- **Real progression.** A higher level must change the language, vocabulary, grammar, context, reasoning, or task complexity—not merely the number of hints.
- **Clear explanations.** Feedback should teach why an answer works, not only reveal the correct option.
- **Avoid repetitive short sessions.** Review round length, question variety, and meaningful continuation options.
- Preserve existing user progress and unrelated application behavior when implementation eventually begins.

## 3. Agreed two-axis learning model

Think Lab (and other activities where it makes pedagogical sense) will distinguish two independent dimensions:

### A. English proficiency — CEFR

- A1
- A2
- B1
- B2
- C1
- C2

Content should be genuinely appropriate to each level.

### B. Training approach

- **Guided:** supported practice with progressive hints and fuller explanations.
- **Steady:** independent practice with less assistance and varied tasks.
- **Challenge:** more demanding contexts, stronger distractors, and deeper reasoning.

These dimensions must not be conflated: CEFR describes the learner's language proficiency; Guided / Steady / Challenge describes the training approach.

**Still to be designed:** how learners select a training approach, how adaptive recommendations interact with that choice, and how performance is tracked without silently changing the learner's selected CEFR level.

## 4. Phases and checklist

Status legend: `[x]` completed · `[~]` in progress · `[ ]` not started

### Phase 0 — Initial content inventory
- [x] Identify the main content banks and activity areas.
- [x] Record initial counts and structural observations.
- [x] Identify the first review sequence: Think Lab → Life Skills → core games.
- [ ] Revisit counts where deeper inspection shows the initial inventory was incomplete.

### Phase 1 — Think Lab: full audit and redesign
**Scope:** all nine Think Lab activities.

- [x] Identify the nine activities and inspect the current data structures.
- [x] Record the initial question-pool sizes and difficulty-variation gaps.
- [x] Identify that some activities reuse the same pool across training approaches or CEFR levels.
- [x] Agree on the two-axis model: CEFR A1–C2 × Guided / Steady / Challenge.
- [x] Inspect the current difficulty-selection and adaptive-performance logic in full.
- [ ] Define the learning objective and task types for each of the nine activities.
- [ ] Define what changes across all six CEFR levels for each activity.
- [ ] Define what changes across Guided, Steady, and Challenge for each activity.
- [ ] Decide appropriate pool sizes, round length, variety, explanations, and repetition controls.
- [ ] Review and approve the complete Think Lab content specification before implementation.
- [ ] Implement the approved changes.
- [ ] Run relevant automated tests and manually review representative sessions across levels and approaches.

### Approved activity specification — Odd One Out

**Status:** Design approved; implementation not started.

- **Learning objective:** develop the ability to recognize and reason about relationships between words, rather than relying only on simple category labels.
- **Question format:** present four words; the learner selects the one that does not belong. No written justification or reason-selection step is required.
- **Feedback:** after the selection, explain why the other three words form a coherent group and why the selected word does not belong. Questions must avoid multiple defensible answers unless context establishes one clear criterion.
- **Relationship coverage:** include all ten planned relationship types, introduced and revisited with increasing depth: Category; Function; Synonyms & Antonyms; Part & Whole; Word Class; Cause & Effect; Contextual Meaning; Collocations; Register & Tone; Connotation. These are progressive starting points, not exclusive CEFR boundaries.
- **CEFR progression:** A1 begins with concrete, familiar categories and functions; A2 adds everyday places, occupations, activities, common synonyms/antonyms, parts/whole, and word classes; B1 develops semantic, functional, contextual, cause/effect, and common collocation relationships; B2 introduces finer meaning, collocations, register, tone, and figurative/context-sensitive distinctions; C1 develops implication, nuance, advanced collocations, and abstract relationships; C2 uses closely related meanings, subtle connotations, register, context, and precise usage distinctions. Relationship types may recur at higher levels with greater depth.
- **Training approach:** Guided provides progressive hints and fuller explanations; Steady expects independent selection with clear feedback and varied relationships; Challenge uses more convincing distractors, less obvious relationships, and context where needed. The selected CEFR level remains independent of the training approach.
- **Target round length:** Guided 8 questions; Steady 10; Challenge 12. These are adaptive targets, not hard caps. A round may be shorter when too few high-quality unseen questions are available; it must not be padded with weak or repeated items. More content may be added to any CEFR level later as quality material becomes available.
- **Content-volume rule:** these round targets do not establish a fixed question-bank size. Bank expansion should follow quality, variety, and level coverage rather than a quota.

Activities in scope:
1. Odd One Out
2. The Language Detective
3. The Bold Translator
4. Word Ladder
5. The Sound Maze
6. Word Connections
7. Sentence Scramble
8. Word Forge
9. Chain Reaction

### Phase 2 — Life Skills: content audit and redesign
- [ ] Inventory all Life Skills activities and their actual content pools.
- [ ] Identify short, repetitive, shallow, or insufficiently contextualized exercises.
- [ ] Define practical communication goals and level progression.
- [ ] Review activity variety, realistic scenarios, feedback, and optional Arabic support.
- [ ] Agree on the content specification before implementation.
- [ ] Implement and verify the approved improvements.

### Phase 3 — Core games: content audit and redesign
- [ ] Inventory the core games, their question banks, round selection, and level coverage.
- [ ] Identify activities that feel too short despite larger underlying banks.
- [ ] Check whether difficulty changes the actual task and language, not just hints or labels.
- [ ] Define appropriate question volume, variety, explanations, and progression.
- [ ] Agree on the content specification before implementation.
- [ ] Implement and verify the approved improvements.

### Phase 4 — Remaining exercises, challenges, and question banks
- [ ] Review other learning activities and standalone question banks.
- [ ] Find duplicated, overly easy, underdeveloped, or inconsistent content.
- [ ] Check level alignment, answer quality, explanations, and translation behavior.
- [ ] Prioritize improvements by educational impact.
- [ ] Implement and verify each approved group of changes.

### Phase 5 — Cross-content quality assurance
- [ ] Check consistency of CEFR progression across the reviewed activities.
- [ ] Check that Guided / Steady / Challenge remain meaningfully distinct where used.
- [ ] Check that answers, distractors, and explanations are accurate and unambiguous.
- [ ] Check that Arabic support does not reveal answers or undermine English tasks.
- [ ] Check round length, variety, repetition, and feedback quality.
- [ ] Run `npm run stamp` followed by `npm test` before handing off code changes.
- [ ] Record any remaining limitations instead of marking incomplete work as finished.

### Phase 6 — Return to stories and characters
**Deferred until the foundational educational-content work above is sufficiently complete.**

- [ ] Resume story-content review and improvement.
- [ ] Review comprehension questions, options, explanations, and decision branches.
- [ ] Resume character-related content work in the agreed project sequence.

## 5. Quality and completion rules

A content group is not complete merely because its question count increased. Before marking it complete, confirm that:

1. Its learning objective is clear.
2. Its content is appropriate to the intended CEFR level.
3. Its training approaches are meaningfully differentiated where applicable.
4. Questions and answers are correct, natural, and unambiguous.
5. Feedback explains the learning point.
6. Repetition and round length are intentional.
7. Translation support preserves the English task.
8. Relevant automated tests pass and representative content has been reviewed.

A target such as **30–50 questions per level** may be considered during design, but it is not a fixed requirement until the relevant activity's specification is reviewed and approved. Generated or path-based activities may need a different content-volume measure.

## 6. Change control and progress updates

- This document is the canonical checklist for the CDR effort.
- Work should follow the phases in order unless the user explicitly agrees to reprioritize.
- Do not silently add unrelated UI, navigation, story, character, or infrastructure work to this roadmap.
- If inspection reveals a new issue, record it under the relevant phase or as an open decision; do not automatically expand scope.
- Update checkboxes only when the stated completion criteria are met.
- Keep agreed decisions separate from proposals and unresolved questions.
- At the start of each continuation, use this roadmap to identify the current phase and next unchecked task.

---

**Current checkpoint:** Phase 0 initial inventory is complete. Phase 1 (Think Lab) is active. The current difficulty-selection and adaptive-performance logic has been inspected. The Odd One Out design is approved and recorded above; implementation has not started. Next: define the content specification for The Language Detective, then continue through the remaining Think Lab activities. No content implementation is authorized by this roadmap alone; each phase's design must first be reviewed and agreed.
