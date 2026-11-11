# Velorn Phase 4H — Word Forge server validator

Word Forge retains its approved 72-question bank (24 questions per Guided, Steady and Challenge mode). Canonical answer, explanation and skill fields are bundled only with the server Edge Function. The browser bank contains prompt metadata only.

## Security contract
- The server creates a fixed 24-question ordered session and stores complete canonical question objects in a private RLS + FORCE RLS table.
- Start accepts only action and trainingMode. Answer accepts session ID, question index and submitted word; guest answer calls also carry a random 256-bit bearer token.
- User identity is derived from a verified Supabase access token. The client cannot supply identity, score, answer key, completion flag or reward.
- Guest bearer token SHA-256 and IP HMAC hashes are stored, never the raw token or IP address. Authenticated and guest sessions use distinct ownership predicates and independent rate limits.
- Answers must arrive in order, at least 650 ms apart, with at most three attempts per question. Canonical answer and feedback are revealed only after a correct answer or final failed attempt.
- Authenticated completion emits one trusted Think Lab activity event. Guest completion emits no event and can never create a wallet, claim, award or Velorn balance.
- Session and answer RPCs are service-role-only. Sessions expire after 40 minutes.

## Economy gate
Word Forge is not mapped to an assignable mission in this phase. No template is verified, no reward is claimable, and economy_enabled remains false.

## Verification
Unit tests cover the 72-question server bank, public projection, request contracts and strict feedback projection. The rollback-only SQL assertions cover ownership, ordered answers, retries, authenticated event creation, guest no-event isolation, grants and the disabled economy.
