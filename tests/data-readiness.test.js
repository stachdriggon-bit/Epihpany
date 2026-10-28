const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('app shows a readable recovery message when core lesson data is missing', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const panels = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'div');
      return { attributes: {}, style: {}, textContent: '', setAttribute(key, value) { this.attributes[key] = value; } };
    },
    body: { appendChild(panel) { panels.push(panel); } }
  };

  const guardStart = app.indexOf('const coreDataReady');
  const setupStart = app.indexOf('const $ = s => document.querySelector(s)');
  assert.ok(guardStart >= 0 && setupStart > guardStart, 'guard should precede app setup');
  const guardSource = '(() => { \'use strict\';\n' + app.slice(guardStart, setupStart) + '\n})();';
  vm.runInNewContext(guardSource, { document }, { filename: 'app-data-readiness-guard.js', timeout: 1000 });

  assert.equal(panels.length, 1);
  assert.equal(panels[0].attributes.role, 'alert');
  assert.match(panels[0].textContent, /could not load its lesson data/i);
  assert.match(panels[0].textContent, /reload/i);
  assert.match(panels[0].style.cssText, /position:fixed/);
});

test('the core-data guard runs before app initialization', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const guard = app.indexOf('const coreDataReady');
  const selectors = app.indexOf('const $ = s => document.querySelector(s)');
  assert.ok(guard >= 0, 'core-data guard should exist');
  assert.ok(selectors > guard, 'core-data guard should run before DOM-dependent app setup');
});


test('Advanced English quiz results feed the reading/nuance adaptive skill, not vocabulary', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(
    app,
    /G\.type==='story'\?'conversation':G\.type==='advanced'\?'reading':'vocabulary'/,
    'Advanced questions assess nuance and comprehension, so they should inform reading adaptation.'
  );
  assert.match(app, /const allowed = \['vocabulary','grammar','listening','conversation','reading','spelling'\]/);
});


test('mastered words leave difficult-word recommendations without deleting their review history', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(app, /review\.filter\(w=>!w\.mastered&&\(Number\(w\.errors\)\|\|0\)>=2\)/,
    'Adaptive recommendations should stop prioritising mastered words.');
  assert.match(app, /state\.review\.filter\(w=>!w\.mastered&&\(Number\(w\.errors\)\|\|0\)>=2\)/,
    'The difficult-word list should hide mastered words while preserving saved review records.');
  assert.match(app, /state\.review\|\|\[\]\)\.filter\(w=>w&&!w\.mastered&&\(Number\(w\.errors\)\|\|0\)>=2\)/,
    'Progress insights should stop surfacing words after mastery.');
});


test('failed word dictation resets the review interval and returns the word to today', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const handler = app.slice(
    app.indexOf("if(e.target && e.target.matches('[data-word-dictation]'))"),
    app.indexOf("if(e.target && e.target.matches('[data-grammar-own-form]'))")
  );
  assert.match(handler, /recordReviewOutcome\(item,false\)/);
  assert.match(handler, /item\.box=1;item\.interval=0;item\.streak=0;item\.exerciseStage=0;item\.mastered=false;item\.due=dayKey\(\)/,
    'A miss must reset the box, clear mastery and schedule another review today.');
});

test('word mastery requires repeated demonstrated success, high confidence and the final box', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const scheduler = app.slice(app.indexOf('function scheduleReviewFromPerformance'), app.indexOf('const WORD_COLLOCATIONS'));
  assert.match(app, /const REVIEW_INTERVALS=\[1,3,7,14,30\]/);
  assert.match(scheduler, /item\.mastered=targetBox>=5&&item\.confidence==='high'&&history\.length>=2&&accuracy>=0\.8/,
    'One confident response must never mark a word as mastered.');
  assert.match(scheduler, /if\(accuracy<0\.6\) targetBox=1/);
});


test('cloud progress saves retain failed snapshots for online recovery and merge remote progress before writing', () => {
  const account = fs.readFileSync(path.join(root, 'account.js'), 'utf8');
  assert.match(account, /let pendingCloudProgress = null/);
  assert.match(account, /pendingCloudProgress = snapshot;\s*saveTimer = setTimeout\(\(\) => flushSave\(snapshot\), 900\)/,
    'Queueing a local snapshot should keep it available for a later retry.');
  assert.match(account, /window\.addEventListener\('online',[\s\S]*?pendingCloudProgress\) flushSave\(pendingCloudProgress\)/,
    'A restored connection should retry a retained snapshot.');
  assert.match(account, /\.select\('progress'\)[\s\S]*?const latest = data && data\.progress[\s\S]*?mergeProgress\(snapshot, data\.progress\)/,
    'Before a write, merge with the latest remote progress to reduce lost updates across devices.');
  assert.match(account, /pendingCloudProgress === snapshot\) pendingCloudProgress = null/);
});

test('cloud account sync retries after an in-flight sync and ignores stale account responses', () => {
  const account = fs.readFileSync(path.join(root, 'account.js'), 'utf8');
  assert.match(account, /if \(syncing\) \{[\s\S]*?setTimeout\(\(\) => \{\s*if \(currentUser\?\.id === user\.id\) syncUserProgress\(user\);\s*\}, 400\);/,
    'A new account sync must not be dropped while another user is syncing.');
  assert.match(account, /\.maybeSingle\(\);\s*if \(error\) throw error;\s*\/\/ Ignore stale responses[\s\S]*?if \(currentUser\?\.id !== user\.id\) return;/,
    'A late response for a previous account must not replace the current user’s local progress.');
});

test('cloud progress saves are queued rather than dropped during an active sync', () => {
  const account = fs.readFileSync(path.join(root, 'account.js'), 'utf8');
  assert.match(account, /async function flushSave\(progress\) \{\s*if \(!client \|\| !currentUser\) return;\s*(?:if \(progress\) pendingCloudProgress = progress;\s*)?if \(syncing\) \{\s*clearTimeout\(saveTimer\);\s*saveTimer = setTimeout\(\(\) => flushSave\(pendingCloudProgress\), 400\);/,
    'A pending progress snapshot should retry after the current sync finishes.');
  assert.match(account, /queueSave\(progress\) \{\s*if \(!client \|\| !currentUser\) return;/,
    'New snapshots should be queued even when another cloud operation is active.');
});
