const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Asset Manager files are loaded and cached for offline use', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.match(html, /asset-manager\.js/);
  assert.match(html, /asset-manager\.css/);
  assert.match(sw, /['"]\.\/asset-manager\.js['"]/);
  assert.match(sw, /['"]\.\/asset-manager\.css['"]/);
});

test('new image uploads are restricted to common formats and private staging', () => {
  const manager = read('asset-manager.js');
  const migration = read('supabase/migrations/20261030201651_asset_manager_foundation.sql');
  assert.match(manager, /const PRIVATE_BUCKET = 'epiphany-assets-private'/);
  assert.match(manager, /async function createThumbnail/);
  assert.match(manager, /variant: 'thumbnail'/);
  assert.match(manager, /image\/png/);
  assert.match(manager, /image\/jpeg/);
  assert.match(manager, /image\/webp/);
  assert.doesNotMatch(manager, /image\/avif|image\/gif/);
  assert.match(migration, /'epiphany-assets-private','epiphany-assets-private',false/);
  assert.match(read('supabase/migrations/20261030202518_asset_manager_common_image_formats.sql'), /array\['image\/png','image\/jpeg','image\/webp'\]/);
});

test('asset tables use row-level security and explicit Data API grants', () => {
  const migration = read('supabase/migrations/20261030201651_asset_manager_foundation.sql');
  for (const table of ['epiphany_assets','epiphany_asset_files','epiphany_asset_usages']) {
    assert.match(migration, new RegExp('alter table public\\.' + table + ' enable row level security'));
    assert.match(migration, new RegExp('grant select, insert, update, delete on table public\\.' + table + ' to authenticated'));
  }
  assert.match(migration, /grant select on table public\.epiphany_asset_usages to anon/);
});

test('developer-only asset access is exposed through the existing account session', () => {
  const account = read('account.js');
  const manager = read('asset-manager.js');
  assert.match(account, /getAssetManagerClient: \(\) => isDeveloperAccount\(\) \? client : null/);
  assert.match(account, /getAssetManagerUser: \(\) => isDeveloperAccount\(\) && currentUser/);
  assert.match(manager, /window\.EpiphanyAuth\?\.getAssetManagerClient/);
});

test('legacy character artwork indexing is additive and repeatable', () => {
  const manager = read('asset-manager.js');
  const html = read('index.html');
  assert.match(html, /id="asset-import-legacy"/);
  assert.match(manager, /legacy_key/);
  assert.match(manager, /existingFiles/);
  assert.match(manager, /existingUsages/);
  const importer = manager.slice(manager.indexOf('async function importLegacyCharacterArt'), manager.indexOf('function init()'));
  assert.doesNotMatch(importer, /\.remove\s*\(/);
  assert.doesNotMatch(importer, /\.move\s*\(/);
});

test('published character asset references override static artwork without removing the fallback', () => {
  const account = read('account.js');
  const cards = read('cards.js');
  assert.match(account, /loadPublishedCharacterAssets/);
  assert.match(cards, /EPIPHANY_CARD_ASSET_MAP/);
  assert.match(cards, /publishedAssetUrl/);
  assert.match(cards, /characterArtUrl\(storagePath, folder\)/);
});

test('unassigned assets can be linked privately without publishing', () => {
  const manager = read('asset-manager.js');
  const html = read('index.html');
  assert.match(html, /id="asset-link-panel"/);
  assert.match(manager, /async function saveAssetLink/);
  assert.match(manager, /is_published:false/);
  assert.match(manager, /status:'linked'/);
});
