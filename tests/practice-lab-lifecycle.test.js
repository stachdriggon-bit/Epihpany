const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const practice = fs.readFileSync(path.join(__dirname, '..', 'practice-lab.js'), 'utf8');

test('Practice Lab releases microphone and shared speech when its view is left or hidden', () => {
  assert.match(practice, /const abortRecognition = \(\) =>/);
  assert.match(practice, /active\.onresult = null/);
  assert.match(practice, /active\.onerror = null/);
  assert.match(practice, /active\.onend = null/);
  assert.match(practice, /active\.abort\(\)/);
  assert.match(practice, /window\.EpiphanySpeech\?\.stop\?\.\(\)/);
  assert.match(practice, /event\.detail\?\.view==='arcade'\) mount\(\);\s*else stopPracticeMedia\(\)/);
  assert.match(practice, /document\.addEventListener\('visibilitychange',\(\)=>\{if\(document\.hidden\)stopPracticeMedia\(\);\}\)/);
  assert.match(practice, /window\.addEventListener\('pagehide',stopPracticeMedia\)/);
});

test('Practice Lab ignores late events from replaced or aborted recognition sessions', () => {
  assert.match(practice, /const activeRecognition = new SR\(\)/);
  assert.match(practice, /if\(recognition!==activeRecognition\)return/g);
  assert.match(practice, /if \(mode !== currentMode\) stopPracticeMedia\(\)/);
  assert.doesNotMatch(practice, /recognition\.onresult=/);
  assert.doesNotMatch(practice, /recognition\.onend=/);
});
