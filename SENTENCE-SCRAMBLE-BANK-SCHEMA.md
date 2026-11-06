# Sentence Scramble — Bank Schema

**Status:** Approved content; schema specification  
**Schema version:** 1  
**Target feature:** Think Lab → Sentence Scramble

## 1. Repository integration

- The bank is a data-only script: `sentence-scramble-bank.js`.
- It exposes `window.EPIPHANY_SENTENCE_SCRAMBLE_BANK`.
- It is loaded with the Think Lab feature group in `lazy-data.js`, not in the initial page shell.
- Game rendering, scoring, session selection, and interaction remain in the Think Lab runtime. The bank must not contain DOM or gameplay code.

## 2. Top-level shape

```js
window.EPIPHANY_SENTENCE_SCRAMBLE_BANK = {
  schemaVersion: 1,
  gameId: 'sentence-scramble',
  totalChallenges: 72,
  modes: {
    guided: [ /* 24 challenge records */ ],
    steady: [ /* 24 challenge records */ ],
    challenge: [ /* 24 challenge records */ ]
  }
};
```

## 3. Challenge record

```js
{
  id: 'SS-G-001',
  prompt: 'Build the sentence in the correct order.',
  sentence: 'My sister reads a book every evening.',
  acceptedAnswers: [],
  skill: 'Basic sentence order: subject, verb, object, and time phrase.',
  explanation: 'A statement usually begins with its subject, followed by the verb and object. A time phrase commonly comes at the end.'
}
```

### Field rules

- `id`: permanent unique ID. Prefixes: `SS-G-`, `SS-S-`, and `SS-C-`; use three-digit numbering within each mode.
- `prompt`: shared instruction text; may be omitted from an individual record when supplied by the game UI.
- `sentence`: canonical target sentence, with its intended capitalization and punctuation.
- `acceptedAnswers`: zero or more explicitly reviewed alternative sentence orders. The canonical `sentence` is always accepted automatically and must not be repeated in this array.
- `skill`: the specific language skill being practised.
- `explanation`: a concise teaching explanation that explains why the construction works, not merely a restatement of the answer.

No CEFR label is added: the approved bank defines three game modes, not CEFR assignments.

## 4. Tile generation and answer checking

1. Generate movable tiles from the canonical sentence at runtime by splitting on whitespace. Do not store a second manually maintained tile list.
2. Preserve every occurrence. Repeated words are separate tile instances with separate runtime IDs, even when their visible text is identical.
3. Do not add distractor tiles, omit words, or silently alter the target sentence.
4. Shuffle tile instances, not their text values; selecting one repeated word must not select or remove another occurrence.
5. Compare the assembled word sequence against the canonical sentence and every `acceptedAnswers` entry. Normalize case, repeated whitespace, and punctuation for comparison, while preserving the authored sentence for display.
6. An alternative is valid only when it uses exactly the same word occurrences as the canonical sentence and forms a natural, grammatically correct sentence in context. Do not accept a merely possible but unnatural order.
7. Keep punctuation attached to its authored token in the tile display; punctuation differences alone must not cause a grammatically correct word order to be rejected.

## 5. Bank invariants

The data-quality tests must assert:

- Exactly 72 records overall.
- Exactly 24 records in each mode.
- IDs are unique and follow their mode prefix.
- Every record has a non-empty sentence, skill, and explanation.
- Every sentence produces at least one tile.
- Every accepted alternative has the same normalized word multiset as its canonical sentence.
- No exact duplicate challenge sentence within the bank.
- No repeated challenge is served within one session until the eligible pool is exhausted.
- The bank contains no answer-choice distractors; the task is to assemble the sentence.

## 6. Content allocation

| Mode | Count | Intended focus |
| --- | ---: | --- |
| Guided | 24 | Core sentence order, common tenses, negatives, questions, commands, and simple adverbs |
| Steady | 24 | Perfect and continuous tenses, clauses, comparisons, conditionals, relative clauses, and passive voice |
| Challenge | 24 | Inversion, advanced conditionals, complex passive structures, participle clauses, emphasis, and parallelism |

## 7. Scope boundary

This specification does not authorize changing other Think Lab games, shared navigation, icons, global styling, translation behavior, or unrelated performance code. Implementation should replace only the existing Sentence Scramble content and its directly required loading, validation, and gameplay integration.
