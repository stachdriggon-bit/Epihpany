const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('progressive guidance is loaded after the app and its local assets are versioned', () => {
  const html = read('index.html');
  assert.match(html, /guidance\.css\?v=[^"\s]+/);
  assert.match(html, /app\.js\?v=[^"\s]+[\s\S]*?guidance\.js\?v=[^"\s]+/);
});

test('guidance uses an independent versioned storage record and tolerates storage failures', () => {
  const source = read('guidance.js');
  assert.match(source, /const STORAGE_KEY = 'epiphany-guidance-v1'/);
  assert.match(source, /const VERSION = 1/);
  assert.match(source, /JSON\.parse\(raw\)/);
  assert.match(source, /catch \(_\) \{ return \{ version:VERSION, activityCompleted:false/);
  assert.match(source, /try \{ localStorage\.setItem\(STORAGE_KEY/);
  assert.doesNotMatch(source, /epiphany-progress/);
});

test('the tour waits for a completed real activity and a return to Home', () => {
  const source = read('guidance.js');
  const app = read('app.js');
  assert.match(app, /dispatchEvent\(new CustomEvent\('epiphany:activity-completed'/);
  assert.match(app, /if\(firstCompletion\)\{document\.dispatchEvent\(new CustomEvent\('epiphany:activity-completed'/);
  assert.match(source, /document\.addEventListener\('epiphany:activity-completed'/);
  assert.match(source, /event\.target\.closest\('\[data-view="home"\], #logo'\)/);
  assert.match(source, /state\.activityCompleted && state\.status === 'not-started' && activeHome\(\)/);
  assert.match(app, /if \(DEV_MODE\.active && hasDeveloperAccess\(\)\) return/);
});

test('the six tour steps mirror the established navigation groups', () => {
  const source = read('guidance.js');
  for (const name of ['Home', 'Learn', 'Play', 'Collect', 'Discover', 'Me']) {
    assert.ok(source.includes(name), 'missing tour step: ' + name);
  }
  assert.match(source, /ar: \['الرئيسية'/);
  assert.match(source, /ar: \['تعلّم'/);
  assert.match(source, /ar: \['العب'/);
  assert.match(source, /ar: \['اجمع'/);
  assert.match(source, /ar: \['اكتشف'/);
  assert.match(source, /ar: \['مساحتي'/);
});

test('the tour can be skipped, resumed, or completed and supports keyboard dismissal', () => {
  const source = read('guidance.js');
  assert.match(source, /status === 'skipped'/);
  assert.match(source, /resume: \(\) => start\(\)/);
  assert.match(source, /start: \(\) => start\(\{restart:true\}\)/);
  assert.match(source, /status === 'completed'/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /aria-modal','true'/);
  assert.match(source, /returnFocus\.focus\(\{preventScroll:true\}\)/);
});

test('guidance assets are included in the offline shell and cache version is refreshed', () => {
  const sw = read('service-worker.js');
  assert.match(sw, /epiphany-shell-progressive-guidance/);
  assert.match(sw, /'\.\/guidance\.js'/);
  assert.match(sw, /'\.\/guidance\.css'/);
});
