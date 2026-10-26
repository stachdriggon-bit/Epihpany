const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('Spot the Mistake keeps the English target sentence and clickable words intact', () => {
  const spotMarkup = app.match(/<div class="spot-text" id="spot-text"[^>]*>/);
  assert.ok(spotMarkup, 'Spot the Mistake word container should exist');
  assert.match(
    spotMarkup[0],
    /data-tx-skip/,
    'the interactive word container must be excluded from whole-element translation'
  );
  assert.doesNotMatch(
    spotMarkup[0],
    /arAttr\(q\.q_ar\)/,
    'a translated replacement sentence must not overwrite the incorrect English sentence'
  );
  assert.match(
    app,
    /class="spot-word" data-spot-index=/,
    'the words must remain individual clickable targets'
  );
});
