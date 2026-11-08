import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('World fullscreen layer sits above the site header', () => {
  assert.ok(css.includes('body.world-fullscreen #world-game{position:fixed;z-index:10001;inset:0;'));
  assert.ok(!css.includes(`body.world-fullscreen 
body.world-fullscreen #world-game`));
});

test('World fullscreen control uses a fullscreen icon on desktop and rotate icon on mobile', () => {
  assert.ok(app.includes('class="world-rotate-desktop-icon" aria-hidden="true">⛶'));
  assert.ok(app.includes('class="world-rotate-mobile-icon" aria-hidden="true">↻'));
  assert.ok(css.includes('@media(max-width:820px){.world-rotate-desktop-icon{display:none}.world-rotate-mobile-icon{display:inline}}'));
  assert.ok(css.includes('body.world-fullscreen #world-game .world-top-actions button.world-rotate{display:inline-flex}'));
});

test('World fullscreen control toggles off and stays synchronized with browser Escape', () => {
  assert.ok(app.includes("if(document.fullscreenElement){"));
  assert.ok(app.includes("await document.exitFullscreen()"));
  assert.ok(app.includes("document.addEventListener('fullscreenchange'"));
  assert.ok(app.includes("root?.requestFullscreen"));
  assert.ok(app.includes("button.setAttribute('aria-pressed',String(active))"));
});


test('World ambient animation yields to reduced-motion and constrained-device policies', () => {
  assert.ok(app.includes('function worldMotionRestricted(){'));
  assert.ok(app.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"));
  assert.ok(app.includes('capabilities.lowResources||capabilities.runtimePressure'));
  assert.ok(app.includes('const anim=WORLD.anim!==false&&!worldMotionRestricted()'));
  assert.ok(app.includes('function worldOverlayObjects(animate)'));
  assert.ok(app.includes('worldOverlayObjects(anim)'));
  assert.ok(app.includes('else if(anim&&!document.hidden&&window.WORLD_SPRITES)'));
  assert.ok(app.includes('WORLD.anim=!worldMotionRestricted()'));
});
