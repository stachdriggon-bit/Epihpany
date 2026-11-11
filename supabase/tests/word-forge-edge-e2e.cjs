/* Local end-to-end contract test for the deployed Word Forge Edge Function.
 * Runs only against the disposable Supabase stack in CI. It creates one temporary
 * Auth user and one guest session; no production account or reward is touched.
 */
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const { writeFileSync } = require('node:fs');

require('../functions/velorn-word-forge/word-forge-bank.js');
const bank = globalThis.EPIPHANY_WORD_FORGE_BANK;

const baseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const resultFile = process.env.WORD_FORGE_E2E_RESULT_FILE || '/tmp/word-forge-e2e.json';
const functionUrl = baseUrl + '/functions/v1/velorn-word-forge';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let body;
  try { body = raw ? JSON.parse(raw) : {}; }
  catch { throw new Error('Expected JSON from ' + url + ', received HTTP ' + response.status); }
  return { status: response.status, body };
}

async function invoke(payload, { accessToken = null, guestIp = null } = {}) {
  const headers = {
    apikey: anonKey,
    'content-type': 'application/json'
  };
  if (accessToken) headers.Authorization = 'Bearer ' + accessToken;
  if (guestIp) headers['x-real-ip'] = guestIp;
  return requestJson(functionUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
}

async function createTemporaryUser() {
  const email = 'word-forge-e2e-' + randomUUID() + '@example.invalid';
  const password = randomBytes(24).toString('base64url');
  const created = await requestJson(baseUrl + '/auth/v1/admin/users', {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: 'Bearer ' + serviceKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ email, password, email_confirm: true })
  });
  assert.ok(created.status >= 200 && created.status < 300,
    'Local Auth admin user creation failed: ' + JSON.stringify(created.body));
  const userId = created.body.id;
  assert.match(userId || '', /^[0-9a-f-]{36}$/i, 'Auth did not return a user ID');

  const signedIn = await requestJson(baseUrl + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  assert.ok(signedIn.status >= 200 && signedIn.status < 300 && signedIn.body.access_token,
    'Local Auth password sign-in failed: ' + JSON.stringify(signedIn.body));
  return { userId, accessToken: signedIn.body.access_token };
}

function answerMap(mode) {
  const rounds = bank.getRounds(mode);
  assert.equal(rounds.length, 24, 'Private canonical bank must contain 24 questions per mode');
  return new Map(rounds.map(question => [question.id, question.answerWord]));
}

async function completeSession({ mode, accessToken = null, guestIp = null, isGuest = false }) {
  const started = await invoke({ action: 'start', trainingMode: mode }, { accessToken, guestIp });
  assert.equal(started.status, 200, 'Word Forge start failed: ' + JSON.stringify(started.body));
  const session = started.body;
  assert.match(session.sessionId || '', /^[0-9a-f-]{36}$/i);
  assert.equal(session.validatorVersion, 'word-forge-reviewed-72-20261111-v1');
  assert.equal(session.trainingMode, mode);
  assert.equal(session.questions.length, 24);
  for (const question of session.questions) {
    assert.equal(Object.hasOwn(question, 'answerWord'), false, 'Answer key leaked in session response');
    assert.equal(Object.hasOwn(question, 'explain'), false, 'Explanation leaked in session response');
    assert.equal(Object.hasOwn(question, 'skill'), false, 'Skill label leaked in session response');
  }
  if (isGuest) assert.match(session.guestToken || '', /^[0-9a-f]{64}$/);
  else assert.equal(session.guestToken, null, 'Authenticated session must not receive a guest token');

  const answers = answerMap(mode);
  const submit = async (index, answerWord) => invoke({
    action: 'answer',
    sessionId: session.sessionId,
    questionIndex: index,
    answerWord,
    ...(isGuest ? { guestToken: session.guestToken } : {})
  }, { accessToken, guestIp });

  // Exercise a retry without advancing, then the correct answer.
  await sleep(700);
  const wrong = await submit(0, 'zzzz');
  assert.equal(wrong.status, 200, 'First wrong answer should be accepted for retry');
  assert.equal(wrong.body.correct, false);
  assert.equal(wrong.body.advance, false);
  assert.equal(wrong.body.attemptsRemaining, 2);

  await sleep(700);
  const firstCorrect = await submit(0, answers.get(session.questions[0].id));
  assert.equal(firstCorrect.status, 200);
  assert.equal(firstCorrect.body.correct, true);
  assert.equal(firstCorrect.body.advance, true);

  // A replayed index must not be accepted, even with a fresh timing interval.
  await sleep(700);
  const replay = await submit(0, answers.get(session.questions[0].id));
  assert.equal(replay.status, 400, 'Replayed question index must be rejected');
  assert.equal(replay.body.error, 'answer_rejected');

  let last = firstCorrect;
  for (let index = 1; index < 24; index++) {
    await sleep(700);
    last = await submit(index, answers.get(session.questions[index].id));
    assert.equal(last.status, 200, 'Answer ' + index + ' failed: ' + JSON.stringify(last.body));
    assert.equal(last.body.correct, true);
    assert.equal(last.body.advance, true);
    assert.equal(last.body.completed, index === 23);
  }
  assert.equal(last.body.completed, true, 'The server must complete the full 24-question session');
  assert.equal(last.body.nextIndex, 24);
  assert.equal(last.body.correctCount, 24);
  return { sessionId: session.sessionId };
}

async function main() {
  assert.ok(baseUrl && anonKey && serviceKey, 'Local Supabase environment is incomplete');
  assert.equal(bank.validateBank().valid, true, 'Canonical private Word Forge bank is invalid');

  const guest = await completeSession({
    mode: 'guided',
    guestIp: '198.51.100.42',
    isGuest: true
  });
  const user = await createTemporaryUser();
  const authenticated = await completeSession({
    mode: 'steady',
    accessToken: user.accessToken,
    isGuest: false
  });

  const result = {
    userId: user.userId,
    guestSessionId: guest.sessionId,
    authenticatedSessionId: authenticated.sessionId
  };
  writeFileSync(resultFile, JSON.stringify(result), { mode: 0o600 });
  process.stdout.write('Word Forge Edge Function guest + authenticated end-to-end tests passed.\n');
  process.stdout.write('WORD_FORGE_E2E_RESULT_FILE=' + resultFile + '\n');
}

main().catch(error => {
  process.stderr.write((error && error.stack) || String(error));
  process.exitCode = 1;
});
