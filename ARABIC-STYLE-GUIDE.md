# Arabic translation style guide

Epiphany uses **simple Modern Standard Arabic (الفصحى المبسطة)** as its default Arabic support language.

## Voice and tone
- Explain meanings, grammar, feedback, hints, instructions, and learning tips in clear, modern standard Arabic.
- Prefer familiar words and short sentences over formal academic phrasing.
- Keep the tone kind, encouraging, and non-judgmental. Correct the idea, not the learner.
- Natural dialogue may sound conversational, but do not switch unpredictably between regional dialects.
- Do not use dialect-specific slang when a widely understood phrase is available.

## Translation quality
- Translate the intended meaning, not the English word order.
- Keep the Arabic answer choices aligned one-to-one with the English choices and in the same order.
- Preserve meaningful distinctions between options; do not make the correct answer obvious through translation alone.
- Story choices are decisions, not quiz questions: explain likely consequences rather than labelling one branch as universally correct.
- Arabic translations are optional support; English remains the main language of practice.

## Automated checks
Run `npm test:fast` before publishing. The content quality tests check:
- valid correct-answer indexes and non-empty answer options;
- duplicate questions within each game;
- empty Arabic fields that are explicitly authored in story decisions;
- answer-translation arrays that do not match the English option count;
- missing Arabic meanings/examples in the Word of the Day library.

A test failure should identify the affected game, question, story, or word so the content can be corrected at its source. These checks are structural safeguards; they do not replace a human review of whether a translation is natural and accurate.
