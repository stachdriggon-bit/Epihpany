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
    assert.match(card.id, /^(CHR|WRD|PHR|ART|SCN|LOC)-\d{3}$/);
    assert.ok(['characters','words','artifacts','mixed'].includes(card.category));
    assert.ok(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].includes(card.rarity));
    assert.ok(card.name && card.title && card.description);
  }
});

test('card prototype is linked from profile and cached offline', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.match(html, /id="cards-hub"/);
  assert.match(html, /data-cards\.js\?v=portraits-reveal-2/);
  assert.match(html, /cards\.js\?v=portraits-reveal-2/);
  assert.match(html, /cards\.css\?v=portraits-reveal-2/);
  assert.match(html, /chip-tokens-value/);
  assert.match(sw, /\.\/data-cards\.js/);
  assert.match(sw, /\.\/cards\.js/);
  assert.match(sw, /\.\/cards\.css/);
});

test('collection rules keep card rewards separate from learning XP', () => {
  const js = read('cards.js');
  assert.match(js, /const STARTER_TOKENS = 15/);
  assert.match(js, /const ADMIN_TEST_TOKENS = 100000/);
  assert.match(js, /grantAdminTestTokens/);
  assert.match(js, /state\.adminGrantFor===normalized/);
  assert.match(js, /modal\.dataset\.revealTier/);
  assert.match(js, /const DAILY_COST = 5/);
  assert.match(js, /const THREE_COST = 14/);
  assert.match(js, /const FIVE_COST = 22/);
  assert.match(js, /const LEGENDARY_PITY = 50/);
  assert.match(js, /const UPGRADE_COST = 5/);
  assert.match(js, /const MAX_CARD_LEVEL = 5/);
  assert.match(js, /const ACHIEVEMENT_REWARDS/);
  assert.match(js, /checkAchievementRewards/);
  assert.match(js, /addHistory/);
  assert.match(js, /upgradeCard/);
  assert.match(html, /cards-history-list/);
  assert.match(html, /cards-upgrade-balance/);
  assert.match(js, /state\.sinceLegendary>=LEGENDARY_PITY-1/);
  assert.match(js, /selectedPack/);
  const html = read('index.html');
  for (const pack of ['characters','words','artifacts','mixed']) assert.match(html, new RegExp('data-card-pack="'+pack+'"'));
  for (const id of ['cards-pull-three','cards-pull-five','cards-pull-ten']) assert.match(html, new RegExp('id="'+id+'"'));
  assert.match(js, /const TEN_COST = 45/);
  assert.match(js, /state\.shards\+=2/);
  assert.match(js, /state\.dailyDate===today\(\)/);
  assert.match(js, /const rarityWeight = \{Common:58,Uncommon:25,Rare:12,Epic:4,Legendary:1\}/);
  assert.match(js, /const groups = new Map\(\)/, 'rarity must be selected before the card within that rarity');
  assert.match(js, /groups\.get\(rarity\)/);
  assert.match(js, /awardAchievementTokens/);
  assert.doesNotMatch(js, /state\.xp\s*[+]=/);
});

test('original portraits cover the full character roster and legendary reveals respect reduced motion', () => {
  const cards = read('data-cards.js');
  const portraits = read('assets/cards/epiphany-portraits.svg');
  const revealCss = read('cards.css');
  for (const [name, art] of [['Aster','aster'],['Zujjaj','zujjaj'],['Hams','hams'],['Layla','layla'],['The Upward Shadow','shadow'],['Nibras','nibras'],['Yara','yara'],['Kaser','kaser'],['Nima','nima'],['Veya','veya'],['Mira','mira'],['Zayn','zayn']]) {
    const cardLine = cards.split(String.fromCharCode(10)).find(line => line.includes('name:"' + name + '"'));
    assert.ok(cardLine && cardLine.includes('art:"' + art + '"'), name + ' must link to its original portrait');
    assert.match(portraits, new RegExp('<symbol id="' + art + '"'));
  }
  assert.match(revealCss, /cards-legendary-sheen/);
  assert.match(revealCss, /prefers-reduced-motion:reduce/);
});
