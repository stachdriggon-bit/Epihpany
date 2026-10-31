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
