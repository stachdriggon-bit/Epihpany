const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Think Lab introduction reflects the complete eleven-game collection', () => {
  const root = path.resolve(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'think-lab.js'), 'utf8');
  const games = source.match(/const games = \[([\s\S]*?)\n  \];/);
  assert.ok(games, 'Think Lab should define its game collection');
  assert.equal((games[1].match(/\{id:'/g) || []).length, 11);
  assert.match(source, /11 challenges\. One sharper mind\./);
  assert.match(source, /THINK LAB<br><b>11 GAMES<\/b>/);
  assert.doesNotMatch(source, /Three ways to think in English|CASE FILE<br><b>001—003<\/b>/);
});
