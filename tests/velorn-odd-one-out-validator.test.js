import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicQuestion, safeSessionQuestions, validateAnswerRequest } from "../supabase/functions/velorn-odd-one-out/odd-one-out-validator.mjs";

test("public question payload never includes the answer key or explanation", () => {
  const question = { id:"A1-CAT-01", prompt:"Which word does not belong?", why:"Find the shared category.", words:["apple","pear","banana","pencil"], answer:3, explain:"A pencil is not food.", challengeExplain:"Different options.", hint:"Find the foods.", answerText:"secret answer", internalNotes:"private" };
  assert.deepEqual(publicQuestion(question), { id:"A1-CAT-01", prompt:"Which word does not belong?", why:"Find the shared category.", words:["apple","pear","banana","pencil"], hint:"Find the foods." });
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
  assert.equal(validateAnswerRequest({...valid, action:"answer", userId:"attacker"}), false);
});

test("Edge Function authenticates the bearer token and never trusts a client user ID", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const edge = fs.readFileSync(path.join(root, "supabase/functions/velorn-odd-one-out/index.ts"), "utf8");
  assert.match(edge, /auth\.getUser\(token\)/);
  assert.match(edge, /const userId = authData\.user\.id/);
  assert.match(edge, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(edge, /npm:@supabase\/supabase-js@2\.119\.0/);
  assert.match(edge, /p_cefr_level: level/);
  assert.doesNotMatch(edge, /body\.userId|body\.rewardAmount|body\.correctCount/);
});

test("server challenge uses the exact reviewed canonical Odd One Out bank", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const canonical = fs.readFileSync(path.join(root, "odd-one-out-bank.js"), "utf8");
  const deployed = fs.readFileSync(path.join(root, "supabase/functions/velorn-odd-one-out/odd-one-out-bank.js"), "utf8");
  assert.equal(deployed, canonical);
});

test("database validator serializes answers and records completion atomically", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261110193000_velorn_odd_one_out_validator.sql"), "utf8");
  assert.match(sql, /FOR UPDATE/);
  assert.match(sql, /700 milliseconds/);
  assert.match(sql, /15 minutes/);
  assert.match(sql, /challenge_level/);
  assert.match(sql, /p_question_index <> v_session\.current_index/);
  assert.match(sql, /public\.economy_record_validated_activity_event/);
  assert.match(sql, /REVOKE ALL ON TABLE economy_private\.game_validator_sessions FROM PUBLIC, anon, authenticated, service_role/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.velorn_submit_odd_one_out_answer/);
  assert.doesNotMatch(sql, /wallets\s*\(|wallet_ledger\s*\(|economy_enabled\s*=\s*true/i);
});
