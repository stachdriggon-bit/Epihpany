/* End-to-end parity test for the shared Think Lab Edge Function.
 * Runs only against disposable local Supabase in CI. */
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const { writeFileSync } = require('node:fs');
require('../functions/velorn-word-forge/word-forge-bank.js');
require('../functions/velorn-odd-one-out/odd-one-out-bank.js');

const wordBank = globalThis.EPIPHANY_WORD_FORGE_BANK;
const oddBank = globalThis.EPIPHANY_ODD_ONE_OUT_BANK;
const baseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const functionUrl = baseUrl + '/functions/v1/velorn-think-lab-validator';
const resultFile = process.env.THINK_LAB_E2E_RESULT_FILE || '/tmp/think-lab-unified-e2e.json';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let body;
  try { body = raw ? JSON.parse(raw) : {}; }
  catch { throw new Error('Expected JSON, received HTTP ' + response.status); }
  return { status: response.status, body };
}

async function invoke(payload, { accessToken = null, guestIp = null } = {}) {
  const headers = { apikey: anonKey, 'content-type': 'application/json' };
  if (accessToken) headers.Authorization = 'Bearer ' + accessToken;
  if (guestIp) headers['x-real-ip'] = guestIp;
  return requestJson(functionUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
}

async function createTemporaryUser() {
  const email = 'think-lab-unified-' + randomUUID() + '@example.invalid';
  const password = randomBytes(24).toString('base64url');
  const created = await requestJson(baseUrl + '/auth/v1/admin/users', {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  assert.ok(created.status >= 200 && created.status < 300, 'Temporary local user creation failed');
  const signedIn = await requestJson(baseUrl + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.ok(signedIn.status >= 200 && signedIn.status < 300 && signedIn.body.access_token,
    'Temporary local user sign-in failed');
  return { userId: created.body.id, accessToken: signedIn.body.access_token };
}

function wordForgeAnswerMap(mode) {
  const questions = wordBank.getRounds(mode);
  assert.equal(questions.length, 24);
  return new Map(questions.map(q => [q.id, q.answerWord]));
}

function oddOneOutAnswerMap(level) {
  return new Map(oddBank.banks[level].map(q => [q.id, q.words[q.answer]]));
}

async function complete({ gameId, accessToken = null, guestIp = null, level = 'A1', mode = 'guided' }) {
  const started = await invoke({
    action: 'start', gameId,
    ...(gameId === 'word_forge' ? { trainingMode: mode } : { level, trainingMode: mode }),
  }, { accessToken, guestIp });
  assert.equal(started.status, 200, gameId + ' unified start failed: ' + JSON.stringify(started.body));
  const session = started.body;
  assert.match(session.sessionId || '', /^[0-9a-f-]{36}$/i);
  assert.ok(Array.isArray(session.questions) && session.questions.length > 0);
  assert.equal(session.validatorVersion,
    gameId === 'word_forge' ? 'word-forge-reviewed-72-20261111-v1' : 'odd-one-out-rotated-20261110-v2');
  if (accessToken) assert.equal(session.guestToken, null);
  else assert.match(session.guestToken || '', /^[0-9a-f]{64}$/);

  const answers = gameId === 'word_forge' ? wordForgeAnswerMap(mode) : oddOneOutAnswerMap(level);
  let last;
  for (let index = 0; index < session.questions.length; index++) {
    const question = session.questions[index];
    let answer;
    if (gameId === 'word_forge') {
      answer = { answerWord: answers.get(question.id) };
      assert.equal(Object.hasOwn(question, 'answerWord'), false, 'Word Forge answer key leaked');
      assert.equal(Object.hasOwn(question, 'explain'), false, 'Word Forge explanation leaked');
    } else {
      const correctWord = answers.get(question.id);
      answer = { selectedIndex: question.words.indexOf(correctWord) };
      assert.ok(answer.selectedIndex >= 0, 'Odd One Out correct option missing from projected choices');
      assert.equal(Object.hasOwn(question, 'answer'), false, 'Odd One Out answer index leaked');
    }
    await sleep(750);
    last = await invoke({
      action: 'answer', gameId, sessionId: session.sessionId, questionIndex: index,
      ...answer,
      ...(!accessToken ? { guestToken: session.guestToken } : {}),
    }, { accessToken, guestIp });
    assert.equal(last.status, 200,
      gameId + ' answer ' + index + ' failed: ' + JSON.stringify(last.body));
    assert.equal(last.body.correct, true);
    assert.equal(last.body.completed, index === session.questions.length - 1);
    assert.equal(last.body.nextIndex, index + 1);
  }
  assert.equal(last.body.completed, true);
  return session.sessionId;
}

async function main() {
  assert.ok(baseUrl && anonKey && serviceKey, 'Local Supabase environment is incomplete');
  assert.equal(wordBank.validateBank().valid, true, 'Word Forge bank invalid');
  assert.equal(oddBank.validateBank().valid, true, 'Odd One Out bank invalid');

  const unknown = await invoke({ action: 'start', gameId: 'client_selected_module', trainingMode: 'guided' },
    { guestIp: '198.51.100.61' });
  assert.equal(unknown.status, 400, 'Unknown adapter must fail closed');

  const forged = await invoke({
    action: 'start', gameId: 'word_forge', trainingMode: 'guided', userId: '00000000-0000-4000-8000-000000000001',
  }, { guestIp: '198.51.100.62' });
  assert.equal(forged.status, 400, 'Client-supplied identity must be rejected');

  const user = await createTemporaryUser();
  const guestWordForge = await complete({
    gameId: 'word_forge', guestIp: '198.51.100.63',
  });
  const authWordForge = await complete({
    gameId: 'word_forge', accessToken: user.accessToken, mode: 'steady',
  });
  const guestOddOneOut = await complete({
    gameId: 'odd_one_out', guestIp: '198.51.100.64',
  });
  const authOddOneOut = await complete({
    gameId: 'odd_one_out', accessToken: user.accessToken,
  });

  const result = {
    userId: user.userId,
    guestWordForge,
    authWordForge,
    guestOddOneOut,
    authOddOneOut,
  };
  writeFileSync(resultFile, JSON.stringify(result), { mode: 0o600 });
  process.stdout.write('Unified Think Lab Edge Function guest/auth parity tests passed.\n');
  process.stdout.write('THINK_LAB_E2E_RESULT_FILE=' + resultFile + '\n');
}

main().catch(error => {
  process.stderr.write((error && error.stack) || String(error));
  process.exitCode = 1;
});
