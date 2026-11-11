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

  assert.match(app, /window\.EPIPHANY_MAYBE_SHOW_ACCOUNT_PROMPT = maybeShowAccountPrompt/);
  const fluentia = fs.readFileSync(path.join(root, 'fluentia-ui.js'), 'utf8');
  const fluentiaResult = section(fluentia, 'function renderSummary()', 'function stopFluentiaMedia(');
  assert.match(fluentiaResult, /EPIPHANY_MAYBE_SHOW_ACCOUNT_PROMPT\?\.\('fluentia'/,
    'Fluentia completion is an eligible first-result screen for guest account invitation');

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


test('first entry offers account access or guest play, and settings open directly from the tools dropdown', () => {
  assert.match(html, /id="landing-signup"/);
  assert.match(html, /id="landing-signin"/);
  assert.match(html, /id="landing-start"[^>]*>Continue as guest/);
  assert.match(html, /id="auth-dialog"/);
  assert.doesNotMatch(html.slice(html.indexOf('id="profile-view"'),html.indexOf('id="trophies-view"')), /class="block account-block"/, "Profile must not contain sign-in or account-creation forms");
  assert.doesNotMatch(html, /class="landing-preview"/, "landing must not show a sample quiz");
  assert.match(html, /epiphany-auth-gate-v1/);
  assert.match(html, /epiphany-guest-mode-v2/);
  assert.match(html, /id="settings-dialog"/);
  for (const page of ['appearance','learning','account','data','notifications','app']) {
    assert.match(html, new RegExp('data-settings-open="'+page+'"'));
    assert.match(html, new RegExp('data-settings-page="'+page+'"'));
  }
  assert.doesNotMatch(html, /id="open-settings"/, 'there must not be an intermediate settings hub button');
  assert.match(html, /id="settings-data-title">Data &amp; privacy/);
  assert.match(html, /id="account-signout"[^>]*hidden/);
  assert.match(account, /localStorage\.setItem\('epiphany-auth-gate-v1','1'\)/);
  assert.match(account, /function enforceSignedOutEntry\(\)/, 'session restoration failure must resolve into guest or account entry');
  assert.match(account, /localStorage\.getItem\('epiphany-guest-mode-v2'\) === '1'/, 'only a newly confirmed guest session may bypass the auth gate');
  assert.doesNotMatch(account, /localStorage\.getItem\('epiphany-guest-mode-v1'/, 'legacy guest markers must not silently bypass the new sign-in gate');
  assert.match(account, /localStorage\.removeItem\('epiphany-guest-mode-v2'\)/, 'authenticated and signed-out transitions clear guest mode');
  assert.match(account, /status\('Not signed in\. Sign in, create an account, or continue as a guest\.'/, 'a stale landing-seen flag cannot silently bypass sign-in after session restoration');
  assert.match(account, /openAccountFromWelcome\('signin'\)/,
    'a visitor without an authenticated session or explicit guest choice must see the sign-in dialog immediately');
  assert.match(html, /id="auth-continue-guest"/,
    'the automatic sign-in dialog must retain a direct guest option');
  assert.ok(account.includes("function openAccountFromWelcome(mode)"));
  assert.ok(account.includes("const dialog = $('auth-dialog')"));
  assert.doesNotMatch(account, /profileButton/, 'authentication must not navigate to Profile');
  assert.match(account, /document\.body\.classList\.add\('epiphany-auth-gate'\)/);
  assert.match(account, /window\.EpiphanyConfirm\(\{title:'Sign out\?',message:'Your account progress will remain safely saved online\./, 'sign out must use the EPIPHANY-branded confirmation dialog');
  assert.match(account, /confirmText:'Sign out',cancelText:'Stay signed in',danger:true/);
  assert.match(account, /function syncSettingsSignOutVisibility\(\)/);
  assert.match(account, /settingsMenu\?\.addEventListener\('toggle'/);
  assert.match(account, /if \(settingsMenu\.open\) syncSettingsSignOutVisibility\(\)/);
  assert.match(account, /button\.hidden = !currentUser/);
});


test('accessibility and notification settings have working focused preference windows', () => {
  assert.match(html, /id="reduced-motion-toggle"/);
  assert.match(html, /id="text-size-setting"/);
  assert.match(html, /epiphany-reduced-motion-v1/);
  assert.match(html, /epiphany-text-size-v1/);
  assert.match(html, /id="settings-notifications-title"/);
  assert.match(html, /id="open-notification-settings"/);
  assert.match(html, /notification-settings/);
  assert.match(html, /settingsPages\.forEach\(page=>\{page\.hidden=page\.dataset\.settingsPage!==key;\}\)/);
});


test('consequential confirmations use EPIPHANY branded dialogs instead of browser prompts', () => {
  assert.match(html, /id="app-confirm-dialog"/);
  assert.match(html, /role="alertdialog"/);
  assert.match(html, /window\.EpiphanyConfirm=options=>new Promise/);
  assert.match(html, /data-confirm-cancel/);
  assert.match(html, /confirm-accept/);
  assert.doesNotMatch(account, /window\.confirm\(/);
  assert.match(account, /title:'Sign out\?'/);
  assert.match(account, /title:'Delete this post\?'/);
  assert.doesNotMatch(app, /window\.confirm\(/);
  assert.match(app, /title:'Publish your story\?'/);
  assert.match(app, /title:'Share your continuation\?'/);
  assert.match(app, /title:'Replace saved progress\?'/);
});
