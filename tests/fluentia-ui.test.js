const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Fluentia UI exposes all six canonical domains and both mixed-session entry points', () => {
  const ui = read('fluentia-ui.js');
  for (const id of ['wordcraft','sentence-studio','textwise','soundscape','real-world','fine-sense']) {
    assert.match(ui, new RegExp("id:'" + id + "'"));
  }
  assert.match(ui, /data-mode=/);
  assert.match(ui, /section-mixed/);
  assert.match(ui, /fluentia-mix/);
  assert.match(ui, /engine\.createSession\(config\)/);
});

test('Fluentia UI delegates selection and evaluation to the shared engine', () => {
  const ui = read('fluentia-ui.js');
  assert.match(ui, /engine\.listActivities\(\)/);
  assert.match(ui, /engine\.getActivity\(info\.id\)/);
  assert.match(ui, /engine\.selectNext\(currentSession\)/);
  assert.match(ui, /engine\.submitAnswer\(currentSession,answer\)/);
  assert.match(ui, /engine\.abandonSession\(currentSession\)/);
});

test('Fluentia UI keeps review-only adapters out of mixed sessions and provides a dedicated review entry', () => {
  const ui = read('fluentia-ui.js');
  assert.match(ui, /reviewOnly/);
  assert.match(ui, /function reviewPanel\(\)/);
  assert.match(ui, /data-activity=/);
  assert.match(ui, /Review activities stay outside ordinary mixed sessions/);
});

test('Fluentia speaking uses browser speech recognition with permission and unsupported-browser fallbacks', () => {
  const ui = read('fluentia-ui.js');
  assert.match(ui, /window\.SpeechRecognition \|\| window\.webkitSpeechRecognition/);
  assert.match(ui, /data-speech-start/);
  assert.match(ui, /data-speech-stop/);
  assert.match(ui, /Microphone permission was denied/);
  assert.match(ui, /Speech recognition is not supported in this browser or context/);
  assert.match(ui, /fluentia-speech-transcript/);
  assert.match(ui, /does not assess pronunciation quality/);
});

test('Fluentia reports source readiness and offers an explicit retry state', () => {
  const ui = read('fluentia-ui.js');
  const app = read('app.js');
  const loader = read('lazy-data.js');
  assert.match(app, /EPIPHANY_LAZY_LOAD\('fluentia'\)/);
  assert.match(app, /epiphany:fluentia-sources-ready/);
  assert.match(ui, /epiphany:fluentia-sources-failed/);
  assert.match(ui, /data-fluentia-retry/);
  assert.match(loader, /fluentia: \['sound-maze-bank\.js/);
  assert.match(loader, /practice-lab\.js/);
});

test('Fluentia UI is wired into desktop and mobile navigation and offline core assets', () => {
  const html = read('index.html');
  const worker = read('service-worker.js');
  assert.match(html, /id="fluentia-view"/);
  const desktopLearnStart = html.indexOf('<span>Learn</span>');
  const desktopPlayStart = html.indexOf('<span>Play</span>');
  const mobileLearnStart = html.indexOf('mobile-nav-label">LEARN');
  const mobilePlayStart = html.indexOf('mobile-nav-label">PLAY');
  assert.ok(desktopLearnStart >= 0 && desktopPlayStart > desktopLearnStart);
  assert.ok(mobileLearnStart >= 0 && mobilePlayStart > mobileLearnStart);
  const desktopLearn = html.slice(desktopLearnStart, html.indexOf('</details>', desktopLearnStart));
  const desktopPlay = html.slice(desktopPlayStart, html.indexOf('</details>', desktopPlayStart));
  const mobileLearn = html.slice(mobileLearnStart, html.indexOf('</details>', mobileLearnStart));
  const mobilePlay = html.slice(mobilePlayStart, html.indexOf('</details>', mobilePlayStart));
  assert.doesNotMatch(desktopLearn, /data-view="fluentia"/);
  assert.doesNotMatch(mobileLearn, /data-view="fluentia"/);
  assert.match(desktopPlay, /data-view="fluentia"/);
  assert.match(mobilePlay, /data-view="fluentia"/);
  assert.doesNotMatch(html, /data-view="arcade"/);
  assert.match(html, /fluentia-ui\.js/);
  assert.match(html, /fluentia-ui\.css/);
  assert.match(worker, /\.\/fluentia-ui\.js/);
  assert.match(worker, /\.\/fluentia-ui\.css/);
});
