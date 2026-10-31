const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('story recording resources are released when the reader session ends', () => {
  assert.match(app, /function releaseStoryPronunciationResources\(\)/);
  assert.match(app, /storyPronunciationSession\+\+/);
  assert.match(app, /storyPronunciationStream\?\.getTracks\(\)\.forEach\(track=>track\.stop\(\)\)/);
  assert.match(app, /URL\.revokeObjectURL\(storyPronunciationUrl\)/);
  assert.match(app, /storyPronunciationAudio\.pause\(\)/);
  assert.match(app, /function closeGame\(\)\s*\{\s*releaseStoryPronunciationResources\(\)/);
  assert.match(app, /function finishStory\(\)\{releaseStoryPronunciationResources\(\)/);
});

test('late microphone permission responses cannot revive a closed story recording', () => {
  assert.match(app, /const session=storyPronunciationSession/);
  assert.match(app, /if\(session!==storyPronunciationSession\|\|!ST\|\|ST\.mode!=='read'\)\{stream\.getTracks\(\)\.forEach\(track=>track\.stop\(\)\);return;\}/);
  assert.match(app, /if\(session!==storyPronunciationSession\)return;/);
});

test('story recording playback replaces and releases the previous audio element', () => {
  assert.match(app, /if\(storyPronunciationAudio\)\{storyPronunciationAudio\.pause\(\)/);
  assert.match(app, /storyPronunciationAudio===audio/);
});

test('story narration stops when the reader closes, navigation leaves it, or the page is hidden', () => {
  assert.match(app, /function stopSpeechPlayback\(\)/);
  assert.match(app, /function closeGame\(\)\s*\{\s*stopSpeechPlayback\(\)/);
  assert.match(app, /function finishStory\(\)\{stopSpeechPlayback\(\)/);
  assert.match(app, /function openView\(name\)\s*\{\s*if\(ST\)\{stopSpeechPlayback\(\);releaseStoryPronunciationResources\(\);\}/);
  assert.match(app, /window\.addEventListener\('pagehide',\(\)=>\{stopSpeechPlayback\(\);releaseStoryPronunciationResources\(\);\}\)/);
  assert.match(app, /window\.addEventListener\('beforeunload',\(\)=>\{stopSpeechPlayback\(\);releaseStoryPronunciationResources\(\);\}\)/);
  assert.match(app, /speechRequest\+\+/);
  assert.match(app, /naturalAudioPlayer\.pause\(\); naturalAudioPlayer\.src = ''/);
});
