const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const account = fs.readFileSync(path.join(root, 'account.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

function section(source, start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, 'missing source section: ' + start);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(to, -1, 'missing end marker: ' + end);
  return source.slice(from, to);
}

test('first-time visitors can choose an approximate level and start learning without an account', () => {
  assert.match(html, /Question 1 of 15/, 'the full placement assessment count must match its 15 questions');
  assert.match(html, /Take the full level assessment/, 'the full assessment remains accessible from Progress');
  assert.match(app, /function showLevelChoice\s*\(/);
  assert.match(app, /data-start-level=/);
  assert.match(app, /function chooseStartingLevel\s*\(/);
  assert.match(app, /startGame\('vocabulary'\)/, 'choosing a level should start a real activity');
  assert.match(app, /window\.__epiphanyShowPlacement\s*=\s*showPlacement/, 'the complete assessment remains available');
  assert.match(app, /placement-retake/, 'Progress keeps an entry point to the complete assessment');
  assert.match(account, /whenReady:\s*\(\)\s*=>\s*authReadyPromise/);
  assert.doesNotMatch(account, /showWelcomeModalIfNeeded/, 'the account welcome modal must not interrupt onboarding');
  assert.doesNotMatch(account, /__epiphanyShowPlacement/, 'authentication must not unexpectedly launch the full assessment');
  assert.match(html, /id="account-google-signin"/);
  assert.match(html, /id="account-facebook-signin"/);
  assert.match(account, /account-google-signin.*signInWithProvider\('google'\)/s);
  assert.match(account, /account-facebook-signin.*signInWithProvider\('facebook'\)/s);
  assert.match(css, /\.level-choice-grid/);
});

test('account invitation is session-limited, optional, and only attached to eligible result screens', () => {
  assert.match(app, /ACCOUNT_PROMPT_SESSION_KEY\s*=\s*'epiphany-account-prompt-shown-v1'/);
  assert.match(app, /sessionStorage\.setItem\(ACCOUNT_PROMPT_SESSION_KEY,'1'\)/);
  assert.match(app, /auth\?\.isSignedIn\?\.\(\)/, 'signed-in learners must not see the invitation');
  assert.match(app, /DEV_MODE\.active/, 'developer sessions must be excluded');
  assert.match(app, /data-account-prompt-dismiss/, 'the guest option must remain available');
  assert.match(app, /data-account-prompt-signup/, 'the account action must be available inside the result card');
  assert.match(css, /\.account-save-prompt/);

  const lesson = section(app, 'function showResults()', 'function showChallengeResults(');
  assert.match(lesson, /G\.dailySession === true/, 'only an explicitly started daily-session lesson is treated as part of that path');
  assert.match(lesson, /if\s*\(isDailySessionLesson\)\s*\{\s*state\.dailySessionStep = 'story'/, 'an independent lesson must not advance the daily session');
  assert.match(lesson, /if\s*\(!isDailySessionLesson\)\s*maybeShowAccountPrompt\('lesson'/,
    'a daily-session lesson must not trigger the invitation before the story finishes');
  assert.match(lesson, /G\.mode === 'daily' \|\| G\.mode === 'oneLife'/,
    'daily challenge and One Life results remain separate from the invitation flow');

  const challenge = section(app, 'function showChallengeResults(', 'async function shareResult(');
  assert.doesNotMatch(challenge, /maybeShowAccountPrompt/);

  const miniGame = section(app, 'function miniFinish(', '/* Order the Story */');
  assert.match(miniGame, /maybeShowAccountPrompt\('mini-game'/);

  const dailySession = section(app, 'function startDailySession(', 'function renderHome(');
  assert.match(dailySession, /if \(G\) G\.dailySession = true/);
  assert.match(dailySession, /if \(ST\) ST\.dailySession = true/);

  const story = section(app, 'function finishStory(', '/* ---------- navigation ---------- */');
  assert.match(story, /ST\.dailySession===true/);
  assert.match(story, /maybeShowAccountPrompt\('story'/,
    'story completion, including the final daily-session story, is eligible');

  const world = section(app, 'function worldNext(', 'function closeWorld(');
  assert.match(world, /maybeShowAccountPrompt\('world'/,
    'World only invites after the full run or area ends');
});

test('the prompt action preserves guest progress and opens the existing account flow', () => {
  assert.match(app, /dismiss\.closest\('\.account-save-prompt'\)\?\.remove\(\)/);
  assert.match(app, /auth\.openAccountMode\('signup'\)/);
  assert.match(account, /isSignedIn:\s*\(\)\s*=>\s*!!currentUser/);
});
