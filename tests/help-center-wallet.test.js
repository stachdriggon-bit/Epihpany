const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Help & Guide is available at the end of Me on desktop and mobile without becoming a route', () => {
  const html = read('index.html');
  const meGroup = html.match(/<span>Me<\/span>[\s\S]*?<\/details>/);
  assert.ok(meGroup, 'desktop Me navigation group exists');
  assert.match(meGroup[0], /data-help-open/);
  assert.match(meGroup[0], /data-view="profile"[\s\S]*?data-help-open/);
  const mobileMe = html.match(/<span class="mobile-nav-label">ME<\/span>[\s\S]*?<\/details>/);
  assert.ok(mobileMe, 'mobile Me navigation group exists');
  assert.match(mobileMe[0], /data-view="profile"[\s\S]*?data-help-open/);
  assert.doesNotMatch(html.match(/data-help-open[^>]*>/)?.[0] || '', /data-view=/);
});

test('Help Center is bilingual, preserves context, supports replay and accessible dismissal', () => {
  const html = read('index.html');
  const js = read('help-center.js');
  assert.match(html, /id="help-center-dialog"/);
  assert.match(html, /data-help-en/);
  assert.match(html, /data-help-ar/);
  assert.match(html, /data-help-replay/);
  assert.match(js, /window\.EPIPHANY_GUIDANCE\.start\(\)/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.match(js, /aria-label/);
  assert.match(js, /returnFocus\.focus/);
  assert.match(js, /close\(false\)/);
});

test('Help Center links to the established sections and does not replace navigation logic', () => {
  const html = read('index.html');
  const js = read('help-center.js');
  for (const view of ['stories','words','lifeskills','mytools','arcade','thinklab','summon','collection','world','chronicle','resonance','progress','trophies','profile']) {
    assert.match(html, new RegExp('data-help-view="' + view + '"'));
  }
  assert.match(js, /document\.querySelector\('\[data-view=/);
});

test('XP is removed from the top bar, shown beside mobile Home, and included in Profile', () => {
  const html = read('index.html');
  const app = read('app.js');
  const header = html.slice(html.indexOf('<div class="top-right">'), html.indexOf('</div>', html.indexOf('<div class="top-right">')));
  assert.doesNotMatch(header, /chip-xp|chip-tokens/);
  assert.match(html, /id="mobile-home-xp"/);
  assert.match(html, /id="player-profile-xp"/);
  assert.match(app, /id="mobile-home-xp"/);
  assert.match(app, /id="player-profile-xp"/);
  assert.match(app, /epiphany:progress-saved/);
});

test('Coins are displayed only in Card Portal while collection resources and wallet logic remain intact', () => {
  const html = read('index.html');
  const cards = read('cards.js');
  assert.doesNotMatch(html, /chip-tokens-value|cards-token-count/);
  assert.match(html, /id="cards-summon-token-count"/);
  assert.match(cards, /cards-summon-token-count/);
  assert.match(cards, /state\.tokens/);
  assert.doesNotMatch(cards, /chip-tokens-value/);
});

test('new Help Center assets are versioned and included in the offline shell', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.match(html, /help-center\.css\?v=help-center-wallet-20261031-1/);
  assert.match(html, /help-center\.js\?v=help-center-wallet-20261031-1/);
  assert.match(sw, /epiphany-shell-help-center-wallet-20261031-1/);
  assert.match(sw, /\.\/help-center\.css/);
  assert.match(sw, /\.\/help-center\.js/);
});
