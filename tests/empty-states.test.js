const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('empty Words vault keeps its existing vocabulary action', () => {
  const app = read('app.js');
  assert.match(app, /Your vault is empty, for now/);
  assert.match(app, /data-game="vocabulary"/);
  assert.match(app, /Find your first word/);
});

test('My Tools empty state points directly to the first encountered-word field', () => {
  const app = read('app.js');
  assert.match(app, /Your real-life vocabulary starts here/);
  assert.match(app, /href="#encountered-word"/);
  assert.match(app, /Add your first word/);
});

test('Progress empty state offers a real first learning action', () => {
  const app = read('app.js');
  assert.match(app, /Your map starts with your first session/);
  assert.match(app, /learning-insights-empty[\s\S]*?data-game="vocabulary"/);
});

test('empty story exchange lists link back to the Story Library', () => {
  const app = read('app.js');
  assert.match(app, /No stories saved to your account yet/);
  assert.match(app, /No community stories have been shared yet/);
  assert.match(app, /data-story-mode="library"/);
});

test('empty profile post lists guide the learner to the post composer without changing privacy rules', () => {
  const account = read('account.js');
  assert.match(account, /Your English corner is ready[\s\S]*?href="#player-post-text"/);
  assert.match(account, /No community posts yet[\s\S]*?href="#player-post-text"/);
  assert.match(account, /No public posts yet\. Private players stay private/);
});

test('empty card discovery history points to the daily discovery action', () => {
  const cards = read('cards.js');
  assert.match(cards, /Your discoveries and upgrades will appear here after your first card pull/);
  assert.match(cards, /href="#cards-daily-pull"/);
});

test('changed scripts are versioned and the offline shell cache is refreshed', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  const appVersion = html.match(/app\.js\?v=([^'"]+)/)?.[1];
  assert.ok(appVersion, 'app.js must use a cache-busting version');
  assert.ok(sw.includes(appVersion), 'the offline shell cache must include the current app.js version');
  assert.match(html, /lazy-data\.js\?v=word-forge-validator-20261111-1/);
  assert.match(html, /cards\.js\?v=account-wallet-isolation-20261111-1/);
  assert.match(html, /account\.js\?v=velorn-auth-20261114-1/);
  assert.match(html, /style\.css\?v=velorn-6lm-20261114-2/);
  assert.match(read('style.css'), /Helpful empty-state actions/);
  assert.match(read('lazy-data.js'), /think-lab\.js\?v=sentence-scramble-unified-validator-20261112-1/);
  assert.match(read('lazy-data.js'), /think-lab-progression\.js\?v=[^'"]+/);
  assert.match(read('lazy-data.js'), /word-hunt\.js\?v=word-hunt-engine-20261109-2/);
  assert.match(read('lazy-data.js'), /codebreaker\.js\?v=codebreaker-engine-20261109-2/);
  assert.match(read('lazy-data.js'), /letter-grid\.js\?v=letter-grid-engine-20261109-2/);
  assert.match(sw, /epiphany-stability-gallery-identity-20261105-1[\s\S]*think-lab-eleven-games-20261108-1[\s\S]*offline-translation-20261108-1/);
  assert.match(sw, /CARD_ART_CACHE = 'epiphany-card-art-cloud-only-20261030-1-fluentia-picture-bank-20261109-1'/);
});
