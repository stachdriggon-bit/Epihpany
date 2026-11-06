const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const GEORGE_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

function applicationScripts(directory, found = []) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'tests') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) applicationScripts(full, found);
    else if (/\.(?:js|mjs)$/i.test(entry.name)) found.push(full);
  }
  return found;
}

test('all generated English speech is routed through the shared George voice', () => {
  const app = read('app.js');
  const thinkLab = read('think-lab.js');
  const practiceLab = read('practice-lab.js');
  const tts = read('api/tts.js');
  const audition = read('api/tts-test.js');

  assert.match(tts, new RegExp(GEORGE_VOICE_ID));
  assert.match(audition, new RegExp(GEORGE_VOICE_ID));
  assert.match(app, /window\.EpiphanySpeech\s*=\s*Object\.freeze\(\{\s*speak,\s*stop:/);
  assert.match(app, /fetch\('\/api\/tts'/);
  assert.match(app, /elevenlabs-george\|/);
  assert.match(thinkLab, /window\.EpiphanySpeech/);
  assert.match(practiceLab, /window\.EpiphanySpeech/);

  for (const [name, source] of [['app.js', app], ['think-lab.js', thinkLab], ['practice-lab.js', practiceLab]]) {
    assert.doesNotMatch(source, /new\s+SpeechSynthesisUtterance|speechSynthesis\s*\.\s*speak\s*\(/, name + ' must not synthesize speech with a device voice');
  }
});

test('no application script contains a native text-to-speech implementation', () => {
  const offenders = applicationScripts(root)
    .map(file => ({file:path.relative(root, file), source:fs.readFileSync(file, 'utf8')}))
    .filter(item => /new\s+SpeechSynthesisUtterance|speechSynthesis\s*\.\s*speak\s*\(/.test(item.source))
    .map(item => item.file);
  assert.deepEqual(offenders, [], 'Native device TTS must not bypass the shared George voice: ' + offenders.join(', '));
});

test('the voice audition page offers George only', () => {
  const page = read('voice-test.html');
  assert.match(page, /George\s*·\s*British English\s*·\s*ElevenLabs/);
  assert.doesNotMatch(page, /Rachel|female|value="female"|voice:\s*voice\.value/i);
  assert.match(page, /JSON\.stringify\(\{sample:\s*button\.dataset\.sample\}\)/);
});
