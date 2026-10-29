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

test('Mira and Mirelle use their distinct approved portrait files', () => {
  const context = { window: {} };
  vm.runInNewContext(read('data-cards.js'), context);
  const cards = context.window.EPIPHANY_CARD_DATA;
  const mira = cards.find(card => card.id === 'CHR-001');
  const mirelle = cards.find(card => card.id === 'CHR-036');
  assert.equal(mira.image, 'mira99.png');
  assert.equal(mirelle.image, 'mirya.PNG');
  assert.notEqual(mira.image, mirelle.image, 'Mira and Mirelle must not accidentally share a portrait file');
});

test('card prototype is linked from profile and cached offline', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.match(html, /id="cards-hub"/);
  assert.match(html, /data-cards\.js\?v=card-codex-20261029-1/);
  assert.match(html, /cards\.js\?v=card-codex-20261029-1/);
  assert.match(html, /cards\.css\?v=card-codex-20261029-1/);
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
  const html = read('index.html');
  assert.match(html, /cards-history-list/);
  assert.match(html, /cards-upgrade-balance/);
  assert.match(js, /state\.sinceLegendary>=LEGENDARY_PITY-1/);
  assert.match(js, /selectedPack/);
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
  // Stable IDs identify characters; display names may change as the world is renamed.
  for (const [id, art] of [['CHR-025','aster'],['CHR-067','zujjaj'],['CHR-070','hams'],['CHR-073','layla'],['CHR-075','shadow'],['CHR-005','nibras'],['CHR-006','yara'],['CHR-020','kaser'],['CHR-027','nima'],['CHR-029','veya'],['CHR-001','mira'],['CHR-007','zayn']]) {
    const cardLine = cards.split(String.fromCharCode(10)).find(line => line.includes('id:"' + id + '",'));
    assert.ok(cardLine && cardLine.includes('art:"' + art + '"'), id + ' must link to its original portrait');
    assert.match(portraits, new RegExp('<symbol id="' + art + '"'));
  }
  assert.match(revealCss, /cards-legendary-sheen/);
  assert.match(revealCss, /prefers-reduced-motion:reduce/);
});

test('Card Portal is a separate gacha view, while the collection stays in the profile', () => {
  const html = read('index.html');
  const js = read('cards.js');
  const css = read('cards.css');
  assert.match(html, /data-view="summon"/);
  assert.match(html, /id="summon-view"/);
  assert.match(html, /id="cards-hub"/);
  assert.match(html, /id="cards-summon-token-count"/);
  assert.match(html, /id="cards-daily-pull"/);
  assert.match(html, /id="cards-pull-ten"/);
  assert.match(html, /id="cards-pity-progress"/);
  assert.match(js, /cards-summon-token-count/);
  assert.match(js, /cards-pity-progress/);
  assert.match(js, /modal\.dataset\.resultCount=String\(cards\.length\)/);
  assert.match(css, /data-result-count="1"/);
  assert.match(css, /\.summon-stage/);
  assert.match(css, /\.summon-pack-art/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(html, /data-cards-tab="summon"/);
});

test('summoning uses shared sound preferences and respects reduced motion', () => {
  const app = read('app.js');
  const cards = read('cards.js');
  const css = read('cards.css');
  const html = read('index.html');
  assert.match(app, /window\.EpiphanyPlaySfx = sfx/);
  assert.match(app, /summon: \[\[392/);
  assert.match(app, /legendary: \[\[392/);
  assert.match(app, /if \(!state\.sound\) return/);
  assert.match(cards, /const beginPull =/);
  assert.match(cards, /playCardCue\('summon'\)/);
  assert.match(cards, /playCardCue\('legendary'\)/);
  assert.match(cards, /prefers-reduced-motion: reduce/);
  assert.match(css, /summon-stage\.is-summoning/);
  assert.match(css, /legendary-halo/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(html, /id="summon-ritual-status"/);
  assert.match(html, /app\.js\?v=[^"&]+/);
  assert.match(html, /cards\.js\?v=card-codex-20261029-1/);
});

test('every character card points to an image file that exists in the repository', () => {
  const context = { window: {} };
  vm.runInNewContext(read('data-cards.js'), context);
  const cards = context.window.EPIPHANY_CARD_DATA;
  for (const card of cards.filter(item => item.category === 'characters')) {
    assert.ok(card.image, card.id + ' must declare a portrait file');
    assert.ok(
      fs.existsSync(path.join(root, card.image)),
      card.id + ' (' + card.name + ') references missing image: ' + card.image
    );
  }
});


test('card portal filters, profiles, and detail dialog are wired accessibly', () => {
  const html = read('index.html');
  const js = read('cards.js');
  const dataContext = { window: {} };
  vm.runInNewContext(read('data-cards.js'), dataContext);
  const profiles = dataContext.window.EPIPHANY_CARD_PROFILES;
  for (const id of ['CHR-001','CHR-002','CHR-004','CHR-039']) {
    assert.ok(profiles[id], id + ' should have profile notes');
    assert.ok(profiles[id].title.en && profiles[id].title.ar);
    assert.ok(profiles[id].summary.en && profiles[id].summary.ar);
    for (const section of profiles[id].sections) {
      assert.ok(section.title.en && section.title.ar);
      assert.ok(section.text.en && section.text.ar);
    }
  }
  assert.match(html, /id="cards-rarity-filters"/);
  assert.match(html, /id="cards-type-filters"/);
  assert.match(html, /id="cards-filter-result-count" aria-live="polite"/);
  assert.match(js, /epiphany-card-gallery-filters-v1/);
  assert.match(js, /data-gallery-rarity/);
  assert.match(js, /data-gallery-type/);
  assert.match(js, /role="dialog" aria-modal="true"/);
  assert.match(js, /cards-detail-translate/);
  assert.match(js, /Not documented yet/);
  assert.match(js, /data-archive-place/);
  assert.match(js, /EPIPHANY_OPEN_ARCHIVE_PLACE/);
});


test('character dossiers preserve the complete reviewed ability records without inventing open canon', () => {
  const context = { window: {} };
  vm.runInNewContext(read('data-cards.js'), context);
  const profiles = context.window.EPIPHANY_CARD_PROFILES;
  for (const id of ['CHR-001','CHR-002','CHR-004','CHR-039']) {
    assert.ok(profiles[id], id + ' should have a dossier');
    assert.ok(profiles[id].name.en && profiles[id].name.ar);
    assert.ok(profiles[id].summary.en && profiles[id].summary.ar);
    assert.ok(profiles[id].sections.length > 0);
    for (const section of profiles[id].sections) {
      assert.ok(section.title.en && section.title.ar);
      assert.ok(section.text.en && section.text.ar);
    }
    for (const fact of profiles[id].facts || []) {
      assert.ok(fact.label.en && fact.label.ar);
      assert.ok(fact.value.en && fact.value.ar);
    }
  }
  const mira = profiles['CHR-001'];
  assert.ok(mira.sections.length > 1, 'Mira should show multiple distinct dossier sections');
  assert.ok(mira.sections.every(section => section.text.en !== mira.summary.en), 'Mira overview must not repeat the summary');
  assert.match(mira.sections.find(section => section.id === 'restriction').text.en, /Magnitude/);
  assert.match(profiles['CHR-002'].sections.find(section => section.id === 'restriction').text.en, /test hypothesis only/);
  assert.match(profiles['CHR-039'].sections.find(section => section.id === 'restriction').text.en, /Scope/);
});

test('card detail uses the real full card face and keeps gallery card nodes across filters', () => {
  const js = read('cards.js');
  const css = read('cards.css');
  assert.match(js, /cardFace\\(card,\\{level:levelOf\\(card\\),fullImage:true\\}\\)/);
  assert.match(js, /galleryNodeCache/);
  assert.match(js, /renderGallery\(true\)/);
  assert.match(js, /root\.replaceChildren\(fragment\)/);
  assert.match(js, /opts\.fullImage \? card\.image : \(card\.thumb \|\| card\.image\)/);
  assert.match(js, /loading="\x27\+\(opts\.fullImage\?'eager':'lazy'\)/);
  assert.match(css, /\.cards-detail-art \.fcard/);
  assert.match(css, /@media\(max-width:720px\)/);
  assert.match(css, /body\[data-theme="light"\] \.cards-detail-dialog/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('card art thumbnail tooling is available without adding a runtime dependency', () => {
  const script = read('tools/make-card-thumbs.py');
  const docs = read('docs/card-art-prompts.md');
  assert.match(script, /Image\.Resampling\.LANCZOS/);
  assert.match(script, /quality=78/);
  assert.match(script, /assets\/cards\/art\/thumb/);
  assert.match(docs, /python tools\/make-card-thumbs\.py/);
  assert.match(docs, /detail dossier and reveal experience use this full image/);
});
