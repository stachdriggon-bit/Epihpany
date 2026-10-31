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

test('Collection is a standalone destination and Profile keeps its own overview', () => {
  const html = read('index.html');
  const cards = read('cards.js');
  assert.match(html, /<section class="view[^"]*" id="collection-view"/);
  assert.match(html, /<section class="view" id="profile-view"/);
  assert.match(html, /<button class="tab nav-collection" data-view="collection"/);
  const collectionStart = html.indexOf('id="collection-view"');
  const collectionContent = html.indexOf('id="cards-hub"', collectionStart);
  const profileStart = html.indexOf('id="profile-view"');
  assert.ok(collectionStart >= 0 && collectionContent > collectionStart && profileStart > collectionContent,
    'the card gallery should live in its own view before Profile');
  assert.doesNotMatch(cards, /Start the profile on its Overview instead of placing the collection first/);
  assert.doesNotMatch(cards, /profileOverview\.before\(profileNav\)/);
});


test('compact header moves Help and Sound access into app settings', () => {
  const html = read('index.html');
  const css = read('style.css');
  const nav = read('navigation-enhancements.js');
  assert.match(html, /id="sound-toggle-mobile"/);
  assert.match(html, /id="ar-toggle"/);
  assert.match(nav, /function setupResponsiveHeaderTools/);
  assert.match(nav, /matchMedia\('\(max-width: 1180px\)'\)/);
  assert.match(nav, /setupResponsiveHeaderTools\(\)/);
  assert.match(css, /@media \(max-width:1180px\)\{\s*\.top-right>#sound-toggle\{display:none\}/);
});


test('desktop and mobile navigation share the approved six-group destination map', () => {
  const html = read('index.html');
  const nav = read('navigation-enhancements.js');
  const app = read('app.js');
  const desktop = html.match(/<nav class="tabs" aria-label="Main navigation">([\s\S]*?)<\/nav>/);
  const mobile = html.match(/<nav id="mobile-navigation-panel" aria-label="Mobile navigation">([\s\S]*?)<\/nav>/);
  assert.ok(desktop && mobile, 'both navigation surfaces must exist');
  const destinations = source => [...source.matchAll(/data-view="([^"]+)"/g)].map(match => match[1]).sort();
  assert.deepEqual(destinations(desktop[1]), destinations(mobile[1]));
  assert.deepEqual(destinations(desktop[1]), ['home','arcade','chronicle','collection','lifeskills','mytools','profile','progress','resonance','stories','summon','thinklab','trophies','words','world'].sort());
  for (const label of ['Home','Learn','Play','Collect','Discover','Me']) {
    assert.ok(desktop[1].includes('>' + label + '<'), 'desktop navigation is missing ' + label);
    assert.ok(mobile[1].includes('>' + label.toUpperCase() + '<') || mobile[1].includes('>' + label + '<'), 'mobile navigation is missing ' + label);
  }
  assert.match(desktop[1], /data-view="chronicle">📚 Codex/);
  assert.match(mobile[1], /data-view="chronicle">📚 <span>Codex<\/span>/);
  assert.match(desktop[1], /data-view="world"/);
  assert.match(mobile[1], /data-view="world"/);
  assert.match(nav, /chronicle: 'Codex'/);
  assert.ok(app.includes("mobile-nav-group[open]"));
  assert.ok(app.includes("document.querySelectorAll('.nav-group[open], .mobile-nav-group[open]')"));
  assert.ok(app.includes("mobileMenu.removeAttribute('open')"));
  assert.ok(desktop[1].includes('data-view="lifeskills">✳ Life Skills <small>Everyday English and practical skills'));
  assert.equal((desktop[1].match(/class="nav-group"/g) || []).length, 5);
  assert.equal((mobile[1].match(/class="mobile-nav-group"/g) || []).length, 5);
  assert.match(nav, /mobile-nav-group\[open\]/);
});

test('legacy bottom dock behavior is not left active after adopting the mobile drawer', () => {
  const html = read('index.html');
  const css = read('style.css');
  const app = read('app.js');
  assert.doesNotMatch(html, /class="bottom-nav"/);
  assert.doesNotMatch(css, /\.bottom-nav|\.dock-more|\.dock-item|\.dock\{/);
  assert.doesNotMatch(app, /dock-more-panel|dock-more-toggle|closeDockMore/);
});
