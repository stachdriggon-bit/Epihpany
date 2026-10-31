const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('browser history closes World before changing the underlying view', () => {
  const nav = read('navigation-enhancements.js');
  assert.match(nav, /window\.addEventListener\('popstate',\s*\(\)\s*=>\s*routeFromHash\(\)\)/);
  assert.match(nav, /window\.addEventListener\('hashchange',\s*\(\)\s*=>\s*routeFromHash\(\)\)/);
  assert.match(nav, /document\.body\.classList\.contains\('world-fullscreen'\)/);
  assert.match(nav, /#world-game \[data-world-exit\]/);
  assert.match(nav, /#game-close/);
});

test('Escape can dismiss World, games and the notification panel', () => {
  const nav = read('navigation-enhancements.js');
  const notifications = read('notifications.js');
  assert.match(nav, /event\.key !== 'Escape'/);
  assert.match(nav, /#game-close/);
  assert.match(nav, /#notification-close/);
  assert.match(notifications, /event\.key === 'Escape'.*close\(\)/);
});

test('notification bell remains visible on narrow screens', () => {
  const css = read('style.css');
  assert.match(css, /Mobile notification access: keep the notification centre reachable on touch screens/);
  assert.match(css, /\.top-right \.notification-bell\s*\{[^}]*display:inline-flex!important/s);
});

test('mobile profile tabs scroll horizontally and keep touch-sized targets', () => {
  const css = read('style.css');
  assert.match(css, /\.profile-nav\s*\{[^}]*overflow-x:auto/s);
  assert.match(css, /\.profile-nav a\s*\{[^}]*min-height:44px/s);
  assert.match(css, /\.bottom-nav button\s*\{[^}]*font-size:12px!important/s);
});
