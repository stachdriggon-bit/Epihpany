import test from "node:test";
import assert from "node:assert/strict";
import "../supabase/functions/velorn-sentence-scramble/sentence-scramble-bank.js";
import {
  getThinkLabAdapter,
  listThinkLabAdapterIds,
  resolveThinkLabAdapter,
  validateThinkLabAdapter,
} from "../supabase/functions/_shared/think-lab-validator-adapters.mjs";

test("adapter registry is a fixed allowlist and rejects client-selected unknown games", () => {
  assert.deepEqual(listThinkLabAdapterIds().sort(), ["chain_reaction", "odd_one_out", "sentence_scramble", "word_forge"]);
  assert.equal(getThinkLabAdapter("word_forge").id, "word_forge");
  assert.equal(getThinkLabAdapter("odd_one_out").id, "odd_one_out");
  assert.equal(getThinkLabAdapter("chain_reaction").id, "chain_reaction");
  assert.equal(getThinkLabAdapter("sentence_scramble").id, "sentence_scramble");

  assert.equal(getThinkLabAdapter("../word-forge"), null);

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
  const startResponse = adapter.buildStartResponse({
    sessionId: "f4100000-0000-4000-8000-000000000051",
    guestToken: "a".repeat(64),
    questions: canonical,
    body: { trainingMode: "challenge" },
  });
  assert.equal(startResponse.questions.length, 24);
  assert.equal(startResponse.trainingMode, "challenge");
  assert.equal("answerWord" in startResponse.questions[0], false);
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
  const answerBody = {
    action: "answer",
    sessionId: "f4100000-0000-4000-8000-000000000051",
    questionIndex: 0,
    selectedIndex: 2,
  };
  assert.equal(adapter.validateAnswerRequest(answerBody, false), true);
  assert.equal(adapter.validateAnswerRequest({ ...answerBody, guestToken: "b".repeat(64) }, true), true);
  assert.equal(adapter.validateAnswerRequest({ ...answerBody, guestToken: "invalid" }, true), false);
  assert.deepEqual(adapter.answerRpcArguments({
    userId: "trusted-user",
    guestTokenHash: null,
    body: answerBody,
  }), {
    p_user_id: "trusted-user",
    p_guest_token_hash: null,
    p_session_id: "f4100000-0000-4000-8000-000000000051",
    p_game_id: "odd_one_out",
    p_question_index: 0,
    p_answer: { selectedIndex: 2 },
  });
  const guestAnswerBody = { ...answerBody, guestToken: "b".repeat(64) };
  assert.deepEqual(adapter.answerRpcArguments({
    userId: null,
    guestTokenHash: "c".repeat(64),
    body: guestAnswerBody,
  }), {
    p_user_id: null,
    p_guest_token_hash: "c".repeat(64),
    p_session_id: answerBody.sessionId,
    p_game_id: "odd_one_out",
    p_question_index: 0,
    p_answer: { selectedIndex: 2 },
  });
  const response = adapter.buildStartResponse({
    sessionId: answerBody.sessionId,
    guestToken: "b".repeat(64),
    questions: canonical,
    body,
    round: { target: "word", shortened: false },
  });
  assert.equal(response.level, "B2");
  assert.equal(response.questions.length, 1);
  assert.equal("answer" in response.questions[0], false);
});

test("Chain Reaction adapter keeps 24 challenges as units and projects no answer material", () => {
  const adapter = resolveThinkLabAdapter("chain_reaction");
  const makeChallenge = (n) => ({
    id: `CR-G-${String(n).padStart(3, "0")}`,
    title: "A valid chain",
    start: "BEE",
    links: [
      { from: "BEE", to: "HONEY", options: ["HONEY", "MILK", "BREAD"], answer: 0, explanation: "Bees produce honey." },
      { from: "HONEY", to: "JAR", options: ["BOX", "JAR", "PLATE"], answer: 1, explanation: "Honey is stored in a jar." },
      { from: "JAR", to: "LID", options: ["LID", "HANDLE", "WHEEL"], answer: 0, explanation: "A jar has a lid." },
    ],
  });
  const round = Array.from({length:24},(_,i)=>makeChallenge(i+1));
  assert.equal(adapter.validateStartRequest({action:"start",trainingMode:"guided"}),true);
  assert.equal(adapter.validateStartRequest({action:"start",trainingMode:"guided",daily:true,dailySeed:123}),true);
  assert.equal(adapter.validateStartRequest({action:"start",trainingMode:"guided",daily:true}),false);
  assert.equal(adapter.validateStartRequest({action:"start",trainingMode:"guided",daily:"yes"}),false);
  const canonical = adapter.buildCanonicalQuestions(round,{trainingMode:"guided"});
  assert.equal(canonical.length,24);
  const projected = adapter.projectQuestions(canonical);
  assert.equal(projected.length,24);
  assert.equal(projected[0].links.length,3);
  assert.equal("to" in projected[0].links[0],false);
  assert.equal("answer" in projected[0].links[0],false);
  assert.equal("explanation" in projected[0].links[0],false);
  const daily = adapter.buildCanonicalQuestions(round.slice(0,1),{trainingMode:"guided",daily:true,dailySeed:123});
  assert.equal(daily.length,1);
  const dailyBank = { selectRound: (mode, random) => {
    assert.equal(mode,"guided");
    const order = Array.from({length:24},(_,i)=>i);
    for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    return order.map(i=>round[i]);
  }};
  const dailyA = adapter.selectRound(dailyBank,{trainingMode:"guided",daily:true,dailySeed:123},Math.random);
  const dailyB = adapter.selectRound(dailyBank,{trainingMode:"guided",daily:true,dailySeed:123},Math.random);
  assert.equal(dailyA.length,1);
  assert.equal(dailyA[0].id,dailyB[0].id,"daily challenge selection must remain deterministic");
  assert.equal(adapter.validateAnswerRequest({
    action:"answer",sessionId:"f4100000-0000-4000-8000-000000000051",
    questionIndex:0,linkIndex:1,selectedIndex:2,
  },false),true);
  assert.equal(adapter.validateAnswerRequest({
    action:"answer",sessionId:"f4100000-0000-4000-8000-000000000051",
    questionIndex:0,linkIndex:3,selectedIndex:2,
  },false),false);
  assert.deepEqual(adapter.answerRpcArguments({
    userId:null,guestTokenHash:"a".repeat(64),
    body:{sessionId:"f4100000-0000-4000-8000-000000000051",questionIndex:4,linkIndex:2,selectedIndex:1},
  }),{
    p_user_id:null,p_guest_token_hash:"a".repeat(64),
    p_session_id:"f4100000-0000-4000-8000-000000000051",
    p_game_id:"chain_reaction",p_question_index:4,
    p_answer:{linkIndex:2,selectedIndex:1},
  });
  assert.equal(adapter.projectAnswer({
    correct:true,question_index:4,link_index:2,next_link_index:0,next_index:5,
    challenge_completed:true,completed:false,next_word:"LID",explanation:"A jar has a lid.",
  }).nextWord,"LID");
  assert.equal(adapter.buildStartResponse({
    sessionId:"f4100000-0000-4000-8000-000000000051",guestToken:null,
    questions:canonical,body:{trainingMode:"guided"},
  }).questions.length,24);
});

test("Sentence Scramble adapter keeps canonical sentences private and verifies tile permutations", () => {
  const adapter = resolveThinkLabAdapter("sentence_scramble");
  const bank = globalThis.EPIPHANY_SENTENCE_SCRAMBLE_BANK;
  assert.deepEqual(adapter.validateBank(bank), { valid: true, count: 72 });
  const body = { action: "start", trainingMode: "guided" };
  assert.equal(adapter.validateStartRequest(body), true);
  assert.equal(adapter.validateStartRequest({ ...body, userId: "forged" }), false);
  assert.equal(adapter.validateStartRequest({ ...body, daily: true, dailySeed: 123 }), true);
  assert.equal(adapter.validateStartRequest({ ...body, daily: true }), false);

  const round = adapter.selectRound(bank, body, () => 0.5);
  assert.equal(round.length, 24);
  const canonical = adapter.buildCanonicalQuestions(round, body);
  assert.equal(canonical.length, 24);
  const projected = adapter.projectQuestions(canonical);
  assert.equal(projected.length, 24);
  assert.deepEqual(Object.keys(projected[0]).sort(), ["id", "prompt", "words"]);
  assert.equal("sentence" in projected[0], false);
  assert.equal("acceptedAnswers" in projected[0], false);
  assert.equal("explanation" in projected[0], false);
  assert.equal("skill" in projected[0], false);

  const dailyBody = { action: "start", trainingMode: "challenge", daily: true, dailySeed: 123 };
  const dailyA = adapter.selectRound(bank, dailyBody, Math.random);
  const dailyB = adapter.selectRound(bank, dailyBody, Math.random);
  assert.equal(dailyA.length, 1);
  assert.equal(dailyA[0].id, dailyB[0].id, "daily sentence selection and tile shuffle must be deterministic");
  assert.equal(adapter.buildCanonicalQuestions(dailyA, dailyBody).length, 1);

  const sessionId = "f4100000-0000-4000-8000-000000000051";
  const answerBody = { action: "answer", sessionId, questionIndex: 0, tileOrder: [2, 0, 1, 3, 4] };
  assert.equal(adapter.validateAnswerRequest(answerBody, false), true);
  assert.equal(adapter.validateAnswerRequest({ ...answerBody, tileOrder: [2, 0, 1, 1, 4] }, false), false);
  assert.equal(adapter.validateAnswerRequest({ ...answerBody, userId: "forged" }, false), false);
  assert.equal(adapter.validateAnswerRequest({ ...answerBody, guestToken: "b".repeat(64) }, true), true);
  assert.deepEqual(adapter.answerRpcArguments({
    userId: null,
    guestTokenHash: "c".repeat(64),
    body: { ...answerBody, guestToken: "b".repeat(64) },
  }), {
    p_user_id: null,
    p_guest_token_hash: "c".repeat(64),
    p_session_id: sessionId,
    p_game_id: "sentence_scramble",
    p_question_index: 0,
    p_answer: { tileOrder: [2, 0, 1, 3, 4] },
  });
  const response = adapter.projectAnswer({
    correct: true,
    question_index: 0,
    next_index: 1,
    completed: false,
    sentence: "My sister reads a book every evening.",
    explanation: "A sufficiently detailed explanation.",
    skill: "word order",
  });
  assert.equal(response.sentence, "My sister reads a book every evening.");
  assert.equal(adapter.normalizeAnswer("My sister reads a book every evening."), "my sister reads a book every evening");
});
