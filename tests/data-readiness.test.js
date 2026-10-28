const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('app shows a readable recovery message when core lesson data is missing', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const panels = [];
  const document = {
    createElement(tag) {
      assert.equal(tag, 'div');
      return { attributes: {}, style: {}, textContent: '', setAttribute(key, value) { this.attributes[key] = value; } };
    },
    body: { appendChild(panel) { panels.push(panel); } }
  };

  const guardStart = app.indexOf('const coreDataReady');
  const setupStart = app.indexOf('const $ = s => document.querySelector(s)');
  assert.ok(guardStart >= 0 && setupStart > guardStart, 'guard should precede app setup');
  const guardSource = '(() => { \'use strict\';\n' + app.slice(guardStart, setupStart) + '\n})();';
  vm.runInNewContext(guardSource, { document }, { filename: 'app-data-readiness-guard.js', timeout: 1000 });

  assert.equal(panels.length, 1);
  assert.equal(panels[0].attributes.role, 'alert');
  assert.match(panels[0].textContent, /could not load its lesson data/i);
  assert.match(panels[0].textContent, /reload/i);
  assert.match(panels[0].style.cssText, /position:fixed/);
});

test('the core-data guard runs before app initialization', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const guard = app.indexOf('const coreDataReady');
  const selectors = app.indexOf('const $ = s => document.querySelector(s)');
  assert.ok(guard >= 0, 'core-data guard should exist');
  assert.ok(selectors > guard, 'core-data guard should run before DOM-dependent app setup');
});


test('Advanced English quiz results feed the reading/nuance adaptive skill, not vocabulary', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(
    app,
    /G\.type==='story'\?'conversation':G\.type==='advanced'\?'reading':'vocabulary'/,
    'Advanced questions assess nuance and comprehension, so they should inform reading adaptation.'
  );
  assert.match(app, /const allowed = \['vocabulary','grammar','listening','conversation','reading','spelling'\]/);
});
