import test from "node:test";
import assert from "node:assert/strict";
import {
  getThinkLabAdapter,
  listThinkLabAdapterIds,
  resolveThinkLabAdapter,
  validateThinkLabAdapter,
} from "../supabase/functions/_shared/think-lab-validator-adapters.mjs";

test("adapter registry is a fixed allowlist and rejects client-selected unknown games", () => {
  assert.deepEqual(listThinkLabAdapterIds().sort(), ["odd_one_out", "word_forge"]);
  assert.equal(getThinkLabAdapter("word_forge").id, "word_forge");
  assert.equal(getThinkLabAdapter("odd_one_out").id, "odd_one_out");
  assert.equal(getThinkLabAdapter("chain_reaction"), null);
  assert.equal(getThinkLabAdapter("../word-forge"), null);
  assert.throws(() => resolveThinkLabAdapter("chain_reaction"), /Unsupported Think Lab game/);
});

test("registered adapters satisfy the same server-side contract", () => {
  for (const gameId of listThinkLabAdapterIds()) {
    const adapter = resolveThinkLabAdapter(gameId);
    assert.deepEqual(validateThinkLabAdapter(adapter), { valid: true, missing: [] });
    assert.ok(adapter.validatorVersion.length > 0);
    assert.ok(adapter.sessionLifetimeMs >= 60_000);
  }
});

test("Word Forge adapter preserves its 24-question retry answer contract", () => {
  const adapter = resolveThinkLabAdapter("word_forge");
  const body = { action: "start", trainingMode: "challenge" };
  assert.equal(adapter.validateStartRequest(body), true);
  assert.equal(adapter.validateStartRequest({ ...body, userId: "forged" }), false);
  assert.equal(adapter.validateAnswerRequest({
    action: "answer",
    sessionId: "f4100000-0000-4000-8000-000000000051",
    questionIndex: 0,
    answerWord: "planet",
  }, false), true);
  assert.equal(adapter.validateAnswerRequest({
    action: "answer",
    sessionId: "f4100000-0000-4000-8000-000000000051",
    questionIndex: 0,
    answerWord: "planet",
    userId: "forged",
  }, false), false);
  const canonical = Array.from({ length: 24 }, (_, index) => ({
    id: `WF-C-${String(index + 1).padStart(3, "0")}`,
    clue: "A sufficiently long clue for a word.",
    letters: "PLANET",
    answerWord: "planet",
    explain: "A sufficiently detailed explanation.",
    skill: "vocabulary",
    prompt: "Forge the word from the letter tiles.",
  }));
  assert.equal(adapter.buildCanonicalQuestions(canonical).length, 24);
  assert.throws(() => adapter.buildCanonicalQuestions(canonical.slice(0, 23)), /24-question/);
  const projected = adapter.projectQuestions(canonical);
  assert.equal(projected.length, 24);
  assert.equal("answerWord" in projected[0], false);
  assert.equal("explain" in projected[0], false);
  assert.equal("skill" in projected[0], false);
  assert.deepEqual(adapter.answerRpcArguments({
    userId: null,
    guestTokenHash: "a".repeat(64),
    body: { sessionId: "f4100000-0000-4000-8000-000000000051", questionIndex: 2, answerWord: "planet" },
  }), {
    p_user_id: null,
    p_guest_token_hash: "a".repeat(64),
    p_session_id: "f4100000-0000-4000-8000-000000000051",
    p_game_id: "word_forge",
    p_question_index: 2,
    p_answer: { answerWord: "planet" },
  });
});

test("Odd One Out adapter preserves level/mode selection and index-answer contract", () => {
  const adapter = resolveThinkLabAdapter("odd_one_out");
  assert.equal(adapter.validateStartRequest({ action: "start", level: "B2", trainingMode: "steady" }), true);
  assert.equal(adapter.validateStartRequest({ action: "start", level: "B2", trainingMode: "steady", userId: "forged" }), false);
  const body = {
    action: "start",
    level: "B2",
    trainingMode: "challenge",
  };
  const round = { target: "word", shortened: false, questions: [{
    id: "OOO-001",
    prompt: "Choose the word that does not belong.",
    words: ["apple", "pear", "carrot", "plum"],
    answer: 2,
    explain: "A carrot is a vegetable.",
    relationship: "food category",
    hint: "Think about plant parts.",
  }] };
  const canonical = adapter.buildCanonicalQuestions(round, body);
  assert.equal(canonical[0].cefrLevel, "B2");
  assert.equal(canonical[0].trainingMode, "challenge");
  const projected = adapter.projectQuestions(canonical);
  assert.equal(projected.length, 1);
  assert.equal("answer" in projected[0], false);
  assert.equal(adapter.validateAnswerRequest({
    action: "answer",
    sessionId: "f4100000-0000-4000-8000-000000000051",
    questionIndex: 0,
    selectedIndex: 2,
  }), true);
  assert.deepEqual(adapter.answerRpcArguments({
    userId: "trusted-user",
    body: { sessionId: "f4100000-0000-4000-8000-000000000051", questionIndex: 0, selectedIndex: 2 },
  }), {
    p_user_id: "trusted-user",
    p_guest_token_hash: null,
    p_session_id: "f4100000-0000-4000-8000-000000000051",
    p_game_id: "odd_one_out",
    p_question_index: 0,
    p_answer: { selectedIndex: 2 },
  });
});
