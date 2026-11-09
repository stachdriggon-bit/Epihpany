const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Fluentia UI exposes six domains, global mix, and domain-scoped section mix', () => {
  const ui = read('fluentia-ui.js');
  for (const id of ['wordcraft','sentence-studio','textwise','soundscape','real-world','fine-sense']) {
    assert.match(ui, new RegExp("id:'" + id + "'"));
  }
  assert.match(ui, /data-mode=/);
  assert.match(ui, /section-mixed/);
  assert.match(ui, /fluentia-mix/);
  assert.match(ui, /fluentia-domain-modes/);
  assert.match(ui, /closest\('\.tab\[data-view="fluentia"\]'\)/);
  const home = ui.slice(ui.indexOf('function renderHome'), ui.indexOf('function reviewPanel'));
  const domain = ui.slice(ui.indexOf('function renderDomain'), ui.indexOf('function activityCard'));
  assert.doesNotMatch(home, /modeCard\('section-mixed'\)/, 'Section Mixed must not be shown on the Fluentia landing page');
  assert.match(domain, /modeCard\('section-mixed'\)/, 'Section Mixed must be available inside every domain');
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
  assert.match(ui, /A question leaves the active review queue after you answer it correctly here/);
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

test('Fluentia releases active sessions and microphone recognition on navigation and back actions', () => {
  const ui = read('fluentia-ui.js');
  assert.match(ui, /function leaveSession\(\{ render = true \} = \{\}\)/);
  assert.match(ui, /engine\.abandonSession\(currentSession\)/);
  assert.match(ui, /if \(render\) renderHome\(\)/);
  assert.match(ui, /if\(event\.detail\?\.view!=='fluentia'\)leaveSession\(\{render:false\}\)/);
  assert.match(ui, /if\(nav\)\{leaveSession\(\{render:false\}\);selectedLevel=currentLevel\(\);renderLoading\(\);\}/);
  assert.match(ui, /if\(event\.target\.closest\('\[data-back\]'\)\)\{leaveSession\(\);return;\}/);
  assert.match(ui, /if\(document\.hidden\)stopFluentiaMedia\(\)/);
  assert.match(ui, /window\.addEventListener\('pagehide',stopFluentiaMedia\)/);
  assert.match(ui, /window\.EpiphanySpeech\?\.stop\?\.\(\)/);
  assert.match(ui, /function stopFluentiaMedia\(\)/);
});

test('Fluentia ignores stale speech-recognition callbacks after an abort or replacement', () => {
  const ui = read('fluentia-ui.js');
  assert.match(ui, /const recognition = new Recognition\(\)/);
  assert.equal((ui.match(/if \(speechRecognition !== recognition\) return;/g) || []).length, 3);
  assert.match(ui, /active\.onresult = null/);
  assert.match(ui, /active\.onerror = null/);
  assert.match(ui, /active\.onend = null/);
  assert.match(ui, /active\.abort\(\)/);
});

test('Fluentia progress refresh preserves the current domain and Section Mixed picker', () => {
  const ui = read('fluentia-ui.js');
  assert.match(ui, /if\(currentDomain\)\{\s*if\(choosingSectionMixed\)renderSectionMixedDomainPicker\(\);\s*else renderDomain\(currentDomain\);/);
  assert.match(ui, /function renderSectionMixedDomainPicker\(\)/);
  const refresh = ui.slice(ui.indexOf("window.addEventListener('epiphany:progress-saved'"));
  assert.match(refresh, /if\(!root\.closest\('\.view'\)\?\.classList\.contains\('is-active'\)\|\|currentSession\)return;/);
  assert.match(refresh, /if\(currentDomain\)\{[\s\S]*?renderDomain\(currentDomain\);[\s\S]*?return;/);
  assert.match(refresh, /selectedLevel=currentLevel\(\);\s*renderHome\(\);/);
});
