import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('World fullscreen layer sits above the site header', () => {
  assert.match(css, /body\\.world-fullscreen #world-game\\{position:fixed;z-index:10001;inset:0;/);
  assert.doesNotMatch(css, /body\\.world-fullscreen\\s+body\\.world-fullscreen #world-game/);
});

test('World fullscreen control uses a fullscreen icon on desktop and rotate icon on mobile', () => {
  assert.match(app, /class="world-rotate-desktop-icon"[^>]*>⛶/);
  assert.match(app, /class="world-rotate-mobile-icon"[^>]*>↻/);
  assert.match(css, /@media\\(max-width:820px\\)\\{\\.world-rotate-desktop-icon\\{display:none\\}\\.world-rotate-mobile-icon\\{display:inline\\}\\}/);
  assert.match(css, /button\\.world-rotate\\{display:inline-flex\\}/);
});
