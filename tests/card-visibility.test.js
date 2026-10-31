const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('offscreen collection cards pause decorative animations without affecting summon sequences', () => {
  const cards = fs.readFileSync(path.join(root, 'cards.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'cards.css'), 'utf8');
  assert.match(cards, /new IntersectionObserver\(entries =>/);
  assert.match(cards, /rootMargin:\s*'120px 0px'/);
  assert.match(cards, /#cards-gallery \.fcard, #cards-featured-card \.fcard/);
  assert.match(cards, /cardVisibilityObserver\.disconnect\(\)/);
  assert.match(cards, /refreshCardVisibility\(\)/);
  assert.match(css, /\.fcard\.is-offscreen[\s\S]*?animation-play-state:\s*paused!important/);
  assert.match(cards, /summon|reveal/i);
});
