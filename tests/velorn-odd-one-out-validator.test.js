import test from "node:test";
import assert from "node:assert/strict";
import { publicQuestion, safeSessionQuestions, validateAnswerRequest } from "../supabase/functions/_shared/odd-one-out-validator.mjs";

test("public question payload never includes the answer key or explanation", () => {
  const question = { id:"A1-CAT-01", words:["apple","pear","banana","pencil"], answer:3, explain:"A pencil is not food.", challengeExplain:"Different options.", hint:"Find the foods." };
  assert.deepEqual(publicQuestion(question), { id:"A1-CAT-01", words:["apple","pear","banana","pencil"], hint:"Find the foods." });
});

test("safe session question list is bounded and strips all answer keys", () => {
  const safe = safeSessionQuestions([{ id:"q1", words:["a","b","c","d"], answer:2, explain:"why" }]);
  assert.equal(safe.length, 1);
  assert.equal("answer" in safe[0], false);
  assert.equal("explain" in safe[0], false);
  assert.throws(() => safeSessionQuestions([]), /Invalid question set/);
  assert.throws(() => safeSessionQuestions(Array(13).fill({})), /Invalid question set/);
});

test("answer requests accept only bounded UUID, question index and option index", () => {
  const valid = { sessionId:"9f8b2a10-1b2c-4d3e-8f90-123456789abc", questionIndex:11, selectedIndex:3 };
  assert.equal(validateAnswerRequest(valid), true);
  assert.equal(validateAnswerRequest({...valid, selectedIndex:4}), false);
  assert.equal(validateAnswerRequest({...valid, questionIndex:12}), false);
  assert.equal(validateAnswerRequest({...valid, sessionId:"not-a-uuid"}), false);
  assert.equal(validateAnswerRequest({...valid, userId:"attacker"}), true);
});
