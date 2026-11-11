# Fluentia — comprehensive review follow-up

Date: 2026-11-09
Branch: \`main\`
Scope: shared translation integration, activity identity, content contracts, mixed-session quality and verification boundaries.

## Confirmed findings addressed in this batch

1. **Arabic translation preference:** Fluentia previously maintained a private feedback-only toggle, separate from EPIPHANY's \`state.translationEnabled\`. The question screen now registers translatable text with the shared \`EPIPHANY_TRANSLATION_ENHANCE\` bridge. It keeps English as the initial language, uses authored Arabic fields when present, and swaps text in place through the established translation controls. The shared settings synchronizer now includes \`#fluentia-content\`. This does not enable translation by default and does not translate answer options.
2. **Practice Lab Dictation label:** the registered adapter ID is \`soundscape-dictation\`, while the UI had an unused display key \`soundscape-practice-dictation\`. Both Dictation activities therefore appeared with the same generic label. The display mapping now uses the actual registered ID and calls it **Practice Dictation**, while the six-level bank remains **Dictation**.
3. **Content contracts:** added tests for unique Textwise contexts/titles, non-repeating ordered steps, unique CEFR-tagged dictation transcripts, learner instructions and explanations.

## Coverage and product boundaries retained

- All six canonical domains and all six CEFR levels remain in the matrix test.
- Sound Maze remains 36 items per CEFR level; the dictation bank remains six items per level.
- Practice Lab speaking/dictation retains only its authored A1–B2 sample coverage. No C1/C2 content has been invented or inferred.
- Sound & Picture Match retains its existing 9 A1 and 4-per-level A2–C2 inventory.
- Section Mixed and Fluentia Mix retain their balancing and no-repeat rules.
- The Stories corpus, legacy Arcade mechanics/rewards, XP rules, and other EPIPHANY areas are outside this change.

## Verification status

The new unit/content/UI contracts and the complete GitHub Actions run are pending for this commit. Do not treat source edits as verified until both **EPIPHANY checks** and **Content quality** complete successfully.

## Manual verification still required

After Vercel builds are available again:
- visually verify shared translation buttons and the English/Arabic in-place swap on each interaction family;
- test TTS and real microphone permissions/transcription on supported devices;
- perform keyboard-only and screen-reader walkthroughs;
- check long-session memory/performance on lower-powered phones.

The automated 36-combination browser matrix verifies interaction and feedback, but does not certify microphone quality, pronunciation assessment, screen-reader behavior, or final deployed visuals.
