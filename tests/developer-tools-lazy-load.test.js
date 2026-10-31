const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const developerMode = fs.readFileSync(path.join(root, 'developer-mode.js'), 'utf8');

test('developer-only asset tools are not requested during the initial page load', () => {
  for (const resource of [
    'asset-manager.css',
    'artwork-manager.css',
    'card-image-editor.css',
    'asset-manager.js',
    'artwork-manager.js',
    'card-image-editor.js'
  ]) {
    assert.doesNotMatch(html, new RegExp(resource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('developer-only assets load in dependency order only after authorized developer mode opens', () => {
  const styles = developerMode.indexOf('const developerStyles = [');
  const scripts = developerMode.indexOf('const developerScripts = [');
  const loader = developerMode.indexOf('function loadDeveloperTools()');
  const open = developerMode.indexOf('async function open()');
  assert.ok(styles >= 0 && scripts > styles && loader > scripts && open > loader);
  assert.ok(developerMode.indexOf("if(!allowed())return;", open) < developerMode.indexOf('await loadDeveloperTools();', open));
  assert.ok(developerMode.indexOf("'asset-manager.js?", scripts) < developerMode.indexOf("'artwork-manager.js?", scripts));
  assert.ok(developerMode.indexOf("'artwork-manager.js?", scripts) < developerMode.indexOf("'card-image-editor.js?", scripts));
  assert.match(developerMode, /script\.async=false/);
  assert.match(developerMode, /developerToolsPromise=null;throw error/);
});
