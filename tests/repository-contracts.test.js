const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const localPath = value => {
  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('#')) return null;
  const clean = value.split(/[?#]/, 1)[0];
  return clean ? path.resolve(root, clean.replace(/^\.\//, '')) : null;
};
const parseArray = (source, name) => {
  const match = source.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\];'));
  assert.ok(match, 'service worker must define ' + name);
  return [...match[1].matchAll(/['"]\.\/([^'"]+)['"]/g)].map(item => item[1]);
};

test('every local script and stylesheet referenced by the app exists', () => {
  const html = read('index.html');
  const references = [];
  for (const match of html.matchAll(/<script\\b[^>]*\\bsrc=["']([^"']+)["'][^>]*>/gi)) references.push(match[1]);
  for (const match of html.matchAll(/<link\\b(?=[^>]*\\brel=["'][^"']*stylesheet)(?=[^>]*\\bhref=["']([^"']+)["'])[^>]*>/gi)) references.push(match[1]);
  const missing = references
    .map(value => ({ value, file: localPath(value) }))
    .filter(item => item.file && !fs.existsSync(item.file))
    .map(item => item.value);
  assert.deepEqual(missing, [], 'Missing local app assets: ' + missing.join(', '));
});

test('every navigation destination has exactly one matching view container', () => {
  const html = read('index.html');
  const destinations = new Set([...html.matchAll(/\\bdata-view=["']([^"']+)["']/g)].map(match => match[1]));
  const ids = [...html.matchAll(/\\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const errors = [];
  for (const destination of destinations) {
    const target = destination === 'world' ? 'world-game' : destination + '-view';
    const count = ids.filter(id => id === target).length;
    if (count !== 1) errors.push(destination + ' must resolve to exactly one #' + target + ' (found ' + count + ')');
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('every lazy-loaded feature file exists and is included in the offline cache', () => {
  const lazy = read('lazy-data.js');
  const sw = read('service-worker.js');
  const lazyAssets = new Set(parseArray(sw, 'LAZY_ASSETS'));
  const groupsMatch = lazy.match(/const\\s+groups\\s*=\\s*\\{([\\s\\S]*?)\\n\\s*\\};/);
  assert.ok(groupsMatch, 'lazy-data.js must expose its feature groups');
  const groups = [...groupsMatch[1].matchAll(/([a-z][a-z0-9]*):\\s*\\[([^\\]]*)\\]/g)];
  assert.ok(groups.length, 'at least one lazy feature group should be registered');
  const errors = [];
  for (const [, group, entries] of groups) {
    const files = [...entries.matchAll(/['"]([^'"]+\\.js)(?:\\?[^'"]*)?['"]/g)].map(match => match[1]);
    if (!files.length) errors.push(group + ': has no JavaScript files');
    for (const file of files) {
      if (!fs.existsSync(path.join(root, file))) errors.push(group + ': missing ' + file);
      // Arabic help data is intentionally fetched only on demand and not precached.
      else if (group !== 'arabic' && !lazyAssets.has(file)) errors.push(group + ': ' + file + ' is missing from LAZY_ASSETS');
    }
  }
  assert.deepEqual(errors, [], errors.join('\\n'));
});

test('offline cache entries all point to files that exist in the repository', () => {
  const sw = read('service-worker.js');
  const assets = [...parseArray(sw, 'CORE_ASSETS'), ...parseArray(sw, 'LAZY_ASSETS')];
  const missing = assets.filter(asset => asset !== '' && !fs.existsSync(path.join(root, asset)));
  assert.deepEqual(missing, [], 'Missing offline assets: ' + missing.join(', '));
});
