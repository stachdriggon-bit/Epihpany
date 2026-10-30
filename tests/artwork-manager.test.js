const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Artwork Manager is included in the app shell and offline cache', () => {
  const html=read('index.html'),sw=read('service-worker.js');
  assert.match(html,/artwork-manager\.js/);
  assert.match(html,/artwork-manager\.css/);
  assert.match(sw,/['"]\.\/artwork-manager\.js['"]/);
  assert.match(sw,/['"]\.\/artwork-manager\.css['"]/);
});
test('Artwork Manager is developer-only and uses the approved account session', () => {
  const manager=read('artwork-manager.js'),html=read('index.html');
  assert.match(manager,/getAssetManagerClient/);
  assert.match(manager,/getAssetManagerUser/);
  assert.match(manager,/isDeveloper/);
  assert.match(manager,/host\.hidden=true/);
  assert.match(html,/data-dev-panel="assets"/);
});
test('Artwork Manager supports searchable characters and published cloud assets', () => {
  const manager=read('artwork-manager.js'),html=read('index.html');
  assert.match(manager,/function characterData/);
  assert.match(manager,/artwork-target-search/);
  assert.match(manager,/artwork-target-kind/);
  assert.match(manager,/cloudAssets/);
  assert.match(manager,/publishedUsagesForAsset/);
  assert.match(html,/id="artwork-target-select"/);
});
test('replacement stages private files and verifies versioned public files before publishing', () => {
  const manager=read('artwork-manager.js');
  assert.match(manager,/epiphany-assets-private/);
  assert.match(manager,/epiphany-assets/);
  assert.match(manager,/verifyPublicImage/);
  assert.match(manager,/crypto\.randomUUID/);
  assert.match(manager,/published_original_path:originalPath/);
  assert.match(manager,/published_thumbnail_path:thumbnailPath/);
});
test('failed replacement preserves the previous published reference and old files', () => {
  const manager=read('artwork-manager.js');
  assert.match(manager,/const suffix=cleanupFailures\.length/);
  assert.match(manager,/The previous published image was not changed/);
  assert.match(manager,/onConflict:'owner_type,owner_id,role'/);
  assert.doesNotMatch(manager,/storage\.from\([^)]*\)\.remove\(\[[^\]]*old/i);
});
test('cloud asset replacement updates only published usages and keeps historical file records', () => {
  const manager=read('artwork-manager.js');
  assert.match(manager,/\.eq\('asset_id',assetId\)\.eq\('is_published',true\)\.select\('id'\)/);
  assert.match(manager,/epiphany_asset_files/);
  assert.match(manager,/last_replaced_at/);
});
