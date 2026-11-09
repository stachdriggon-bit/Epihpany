'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Home and legacy category IDs route to canonical Fluentia activities', () => {
  const app = read('app.js');
  const routes = {
    order:'textwise-sequence',
    match:'wordcraft-word-match',
    directions:'real-world-directions',
    speed:'wordcraft-speed-round',
    sentenceOrder:'sentence-studio-sentence-builder'
  };
  for (const [legacyId, activityId] of Object.entries(routes)) {
    assert.ok(app.includes(legacyId+":{activityId:'"+activityId+"'"), legacyId);
  }
  assert.match(app, /function launchFluentiaShortcut\(shortcutKey\)/);
  assert.match(app, /window\.EPIPHANY_LAZY_LOAD\('fluentia'\)\.then\(\(\) =>/);
  assert.match(app, /launch\(shortcut\.activityId, shortcut\.label\)/);
  assert.match(app, /FLUENTIA_SHORTCUTS\[type\]\) \{ launchFluentiaShortcut\(type\); return; \}/);
  assert.match(app, /FLUENTIA_SHORTCUTS\[recommendation\.game\]/);
  assert.match(app, /FLUENTIA_SHORTCUTS\[id\]/);
});

test('the retired mini-game runtime, translation branch and stylesheet are absent', () => {
  const app = read('app.js'), worker = read('service-worker.js'), loader = read('lazy-data.js');
  assert.doesNotMatch(app, /\bMINI\b|\bMG\b|miniSessionId|miniTimer|startMini|miniClick|miniFinish|miniOrder|miniMatch|miniDir|miniSpeed|miniSentence|txMiniGame|txApplyRememberedMini|txInMini/);
  assert.doesNotMatch(app, /mini-games\.css|mini-picture-grid|mini-sentence-bank|data-mini-/);
  assert.doesNotMatch(worker, /mini-games\.css/);
  assert.doesNotMatch(loader, /mini-games\.css/);
  assert.equal(fs.existsSync(path.join(__dirname, '..', 'mini-games.css')), false);
});

test('Fluentia shortcut destinations are registered adapters using the shared session engine', () => {
  const adapters = read('fluentia-adapters.js'), ui = read('fluentia-ui.js');
  for (const id of ['textwise-sequence','wordcraft-word-match','real-world-directions','wordcraft-speed-round','sentence-studio-sentence-builder']) {
    assert.ok(adapters.includes("id: '"+id+"'") || adapters.includes("id:'"+id+"'"), id);
  }
  assert.match(ui, /window\.EPIPHANY_FLUENTIA_START_ACTIVITY/);
  assert.match(ui, /engine\.createSession\(config\)/);
  assert.match(ui, /engine\.submitAnswer\(currentSession,answer\)/);
});

test('changed Fluentia launcher and lazy loader scripts use fresh cache-busting URLs', () => {
  const html = read('index.html');
  assert.match(html, /lazy-data\.js\?v=fluentia-shortcut-migration-20261109-1/);
  assert.match(html, /fluentia-ui\.js\?v=fluentia-shortcut-launch-20261109-1/);
  assert.match(html, /app\.js\?v=fluentia-shortcut-migration-20261109-3/);
});

test('the public site no longer ships Arcade or mini-game presentation rules', () => {
  const css = read('style.css');
  const html = read('index.html');
  const ui = read('fluentia-ui.js');
  assert.doesNotMatch(css, /arcade|mini-game|mini-answer|\\.mg-|\\.mini-/i);
  assert.doesNotMatch(html, /arcade-view|data-view="arcade"|mini-games/i);
  assert.doesNotMatch(ui, /legacy Arcade|Arcade XP/i);
});

test('navigation and contextual guidance contain no retired Arcade destination', () => {
  const navigation = read('navigation-enhancements.js');
  const guidance = read('guidance.js');
  assert.doesNotMatch(navigation, /arcade/i);
  assert.doesNotMatch(guidance, /arcade/i);
});
