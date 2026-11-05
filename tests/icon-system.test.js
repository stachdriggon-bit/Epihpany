const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'icon-system.js'), 'utf8');

test('Think Lab icon rendering is idempotent under the document MutationObserver without relying on SVG serialization', () => {
  assert.match(source, /const iconMarkup = svg\(iconName\);/);
  assert.match(source, /if \(slot\.dataset\.epIcon !== iconName\) \{/);
  assert.match(source, /slot\.dataset\.epIcon = iconName;/);
  assert.doesNotMatch(source, /slot\.innerHTML !== iconMarkup/);
  assert.doesNotMatch(source, /slot\.innerHTML = svg\(iconName\);/);
});

test('Think Lab icon observer writes the accessibility attribute only when it changes', () => {
  assert.match(source, /if \(slot\.getAttribute\('aria-hidden'\) !== 'true'\) slot\.setAttribute\('aria-hidden','true'\);/);
});
