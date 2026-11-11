const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('view focus cleanup uses one delegated listener instead of per-entry heading listeners', () => {
  const openViewStart = app.indexOf('function openView(name)');
  assert.notEqual(openViewStart, -1, 'openView must exist');
  const openViewEnd = app.indexOf('\n  }', openViewStart);
  assert.notEqual(openViewEnd, -1, 'openView must have a closing boundary');
  const openViewSource = app.slice(openViewStart, openViewEnd);

  assert.match(openViewSource, /programmatic-view-focus/);
  assert.doesNotMatch(openViewSource, /addEventListener\s*\(\s*['"]keydown['"]/,
    'opening a view must not attach a new keyboard listener to its heading');

  assert.match(app, /document\.addEventListener\s*\(\s*['"]keydown['"]\s*,\s*event\s*=>\s*\{[\s\S]{0,260}programmatic-view-focus/,
    'one persistent delegated listener must clear the focus class');
});
