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

test('Fluentia UI is wired into desktop and mobile navigation and offline core assets', () => {
  const html = read('index.html');
  const worker = read('service-worker.js');
  assert.match(html, /data-view="fluentia"/);
  assert.match(html, /id="fluentia-view"/);
  assert.match(html, /fluentia-ui\.js/);
  assert.match(html, /fluentia-ui\.css/);
  assert.match(worker, /\.\/fluentia-ui\.js/);
  assert.match(worker, /\.\/fluentia-ui\.css/);
});
