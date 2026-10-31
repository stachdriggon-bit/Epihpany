'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

test('home welcome panel is exempt from the shared 760px intro width', () => {
  assert.match(css, /\.view \.intro\s*\{\s*max-width:760px;\s*\}/);
  assert.match(css, /#home-view \.home-intro\s*\{\s*max-width:none;\s*\}/);
});

test('mobile Home does not reserve space for the retired bottom dock', () => {
  assert.match(css, /@media\s*\(max-width:760px\)\s*\{\s*#home-view \.page\s*\{\s*padding-bottom:calc\(28px \+ env\(safe-area-inset-bottom\)\);\s*\}\s*\}/);
});
