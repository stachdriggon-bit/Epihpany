const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('card catalog has unique stable IDs and supported rarities', () => {
  const context = { window: {} };
  vm.runInNewContext(read('data-cards.js'), context);
  const cards = context.window.EPIPHANY_CARD_DATA;
  assert.ok(Array.isArray(cards));
  assert.ok(cards.length >= 10);
  assert.equal(new Set(cards.map(card => card.id)).size, cards.length, 'card IDs must be unique');
  for (const card of cards) {
    assert.match(card.id, /^CHR-\d{3}$/);
    assert.ok(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].includes(card.rarity));
    assert.ok(card.name && card.title && card.description);
  }
});

test('card prototype is linked from profile and cached offline', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.match(html, /id="cards-hub"/);
  assert.match(html, /data-cards\.js\?v=prototype-1/);
  assert.match(html, /cards\.js\?v=prototype-1/);
  assert.match(html, /cards\.css\?v=prototype-1/);
  assert.match(html, /chip-tokens-value/);
  assert.match(sw, /\.\/data-cards\.js/);
  assert.match(sw, /\.\/cards\.js/);
  assert.match(sw, /\.\/cards\.css/);
});

test('collection rules keep card rewards separate from learning XP', () => {
  const js = read('cards.js');
  assert.match(js, /const STARTER_TOKENS = 15/);
  assert.match(js, /const DAILY_COST = 5/);
  assert.match(js, /const TEN_COST = 45/);
  assert.match(js, /state\.shards\+=2/);
  assert.match(js, /state\.dailyDate===today\(\)/);
  assert.match(js, /const rarityWeight = \{Common:58,Uncommon:25,Rare:12,Epic:4,Legendary:1\}/);
  assert.match(js, /const groups = new Map\(\)/, 'rarity must be selected before the card within that rarity');
  assert.match(js, /groups\.get\(rarity\)/);
  assert.match(js, /awardAchievementTokens/);
  assert.doesNotMatch(js, /state\.xp\s*[+]=/);
});
