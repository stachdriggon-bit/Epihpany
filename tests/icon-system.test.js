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


test('icon observer scopes DOM work to changed nodes instead of rescanning the document', () => {
  assert.match(source, /function apply\(root = document\)/);
  assert.match(source, /const all = selector =>/);
  assert.match(source, /const relevantAncestors =/);
  assert.match(source, /scopes\.forEach\(scope => apply\(scope\)\)/);
  assert.doesNotMatch(source, /new MutationObserver\(\(\) => apply\(\)\)/);
});


test('scoped icon scans retain local Think Lab and Arcade selectors', () => {
  assert.match(source, /root === document \? '#think-lab-content \.tl-case\[data-think-game\]' : '\.tl-case\[data-think-game\]'/);
  assert.ok(source.includes("const arcadeSelector = '#arcade-mini-games [class*=\"game\"], #arcade-library [class*=\"game\"]';"));
  assert.doesNotMatch(source, /const arcadeSelector = root === document/);
  assert.doesNotMatch(source, /: '\\[class\\*="game"\\]'/);
});
