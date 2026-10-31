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
});

test('mobile navigation is a left-side drawer and replaces the bottom quick bar', () => {
  const html = read('index.html');
  const css = read('style.css');
  const app = read('app.js');
  const nav = read('navigation-enhancements.js');
  assert.match(html, /class="mobile-menu-backdrop"/);
  assert.match(html, /id="mobile-navigation-panel"/);
  assert.doesNotMatch(html, /class="bottom-nav"/);
  assert.match(css, /\.mobile-menu nav\{[^}]*left:0;right:auto/s);
  assert.match(css, /\.mobile-menu nav\{[^}]*transform:translateX\(-105%\)/s);
  assert.match(css, /\.mobile-menu\[open\] nav\{transform:translateX\(0\)\}/);
  assert.doesNotMatch(css, /\.bottom-nav/);
  assert.doesNotMatch(app, /\.bottom-nav/);
  assert.match(nav, /mobile-menu-backdrop/);
  assert.doesNotMatch(nav, /QUICK_NAV_OPTIONS|renderQuickNav|quick-nav-customize/);
});

test('mark-all notification action stays outside the independently scrolling list', () => {
  const css = read('style.css');
  assert.match(css, /Keep bulk notification actions independent from the scrolling message list/);
  assert.match(css, /\.notification-list\s*\{[^}]*overflow-y:auto/s);
  assert.match(css, /\.notification-panel-actions\s*\{[^}]*position:sticky/s);
  assert.match(css, /\.notification-panel-actions \.btn\s*\{[^}]*min-height:42px/s);
});

test('Resonance mobile hotspots sit above the narration panel', () => {
  const css = read('resonance.css');
  assert.match(css, /\.res-hotspot\.radio\s*\{[^}]*bottom:39%[^}]*z-index:2/s);
  assert.match(css, /\.res-hotspot\.note\s*\{[^}]*bottom:34%[^}]*z-index:2/s);
});

test('World map control has a visible text label', () => {
  const app = read('app.js');
  assert.match(app, /class="world-home" data-world-regions aria-label="Open map" title="Open map">⌖ Map/);
});

test('profile Overview is placed before the collection in the initial profile layout', () => {
  const cards = read('cards.js');
  assert.match(cards, /Start the profile on its Overview instead of placing the collection first/);
  assert.match(cards, /profileOverview\.before\(profileNav\)/);
  assert.match(cards, /profileOverview\.after\(collectionHub\)/);
  assert.match(cards, /getAttribute\('href'\)==='#player-profile-title'/);
});
