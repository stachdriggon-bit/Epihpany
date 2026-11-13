'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Home recommendations and category shortcuts use canonical Fluentia activity IDs', () => {
  const app = read('app.js');
  const routes = ['textwise-sequence','wordcraft-word-match','real-world-directions','wordcraft-speed-round','sentence-studio-sentence-builder'];
  for (const id of routes) {
    assert.ok(app.includes("'" + id + "':{label:"), id + ' must be a direct Home activity');
  }
  for (const id of ['textwise-sequence','wordcraft-word-match','real-world-directions']) {
    assert.ok(app.includes("['" + id + "'"), id + ' must be used by its Home category');
  }
  assert.match(app, /function launchFluentiaActivity\(activityId\)/);
  assert.match(app, /window\.EPIPHANY_LAZY_LOAD\('fluentia'\)\.then\(\(\) =>/);
  assert.match(app, /launch\(activityId, activity\.label\)/);
  assert.match(app, /FLUENTIA_HOME_ACTIVITIES\[type\]\) \{ launchFluentiaActivity\(type\); return; \}/);
  assert.match(app, /FLUENTIA_HOME_ACTIVITIES\[recommendation\.game\]/);
  assert.match(app, /game:'wordcraft-speed-round'/);
  assert.match(app, /game:'sentence-studio-sentence-builder'/);
  assert.doesNotMatch(app, /FLUENTIA_SHORTCUTS|launchFluentiaShortcut/);
  assert.doesNotMatch(app, /game:'speed'|game:'sentenceOrder'/);
});

test('the retired mini-game runtime, translation branch and stylesheet are absent', () => {
  const app = read('app.js'), worker = read('service-worker.js'), loader = read('lazy-data.js');
  assert.doesNotMatch(app, /\bMINI\b|\bMG\b|miniSessionId|miniTimer|startMini|miniClick|miniFinish|miniOrder|miniMatch|miniDir|miniSpeed|miniSentence|txMiniGame|txApplyRememberedMini|txInMini/);
  assert.doesNotMatch(app, /mini-games\.css|mini-picture-grid|mini-sentence-bank|data-mini-/);
  assert.doesNotMatch(worker, /mini-games\.css/);
  assert.doesNotMatch(loader, /mini-games\.css/);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'mini-games.css')), false);
});

test('Fluentia Home destinations are registered adapters using the shared session engine', () => {
  const adapters = read('fluentia-adapters.js'), ui = read('fluentia-ui.js');
  for (const id of ['textwise-sequence','wordcraft-word-match','real-world-directions','wordcraft-speed-round','sentence-studio-sentence-builder']) {
    assert.ok(adapters.includes("id: '" + id + "'") || adapters.includes("id:'" + id + "'"), id);
  }
  assert.match(ui, /window\.EPIPHANY_FLUENTIA_START_ACTIVITY/);
  assert.match(ui, /engine\.createSession\(config\)/);
  assert.match(ui, /engine\.submitAnswer\(currentSession,answer\)/);
});

test('changed Home launcher and shell use fresh cache-busting versions', () => {
  const html = read('index.html');
  const worker = read('service-worker.js');
  const appVersion = html.match(/app\.js\?v=([^'"]+)/)?.[1];
  assert.ok(appVersion, 'the Home shell must reference a versioned app.js');
  assert.ok(worker.includes(appVersion), 'the service-worker cache must be refreshed for the current app.js version');
});

test('the public site no longer ships Arcade or mini-game presentation rules', () => {
  const css = read('style.css'), html = read('index.html'), ui = read('fluentia-ui.js');
  assert.doesNotMatch(css, /arcade|mini-game|mini-answer|\.mg-|\.mini-/i);
  assert.doesNotMatch(html, /arcade-view|data-view="arcade"|mini-games/i);
  assert.doesNotMatch(ui, /legacy Arcade|Arcade XP/i);
});

test('navigation and contextual guidance contain no retired Arcade destination', () => {
  const navigation = read('navigation-enhancements.js'), guidance = read('guidance.js');
  assert.doesNotMatch(navigation, /arcade/i);
  assert.doesNotMatch(guidance, /arcade/i);
});
