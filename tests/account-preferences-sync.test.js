import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const account = readFileSync(new URL('../account.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const mergeSource = account.match(/const PREFERENCE_KEYS = (\[[^\]]+\]);\s*(function mergeProgress\(local, cloud, root = true\) \{[\s\S]*?\n  \})\n  async function writeCloud/);
assert.ok(mergeSource, 'account sync must expose the preference keys and progress merge implementation');
const mergeProgress = vm.runInNewContext(
  '(() => { const PREFERENCE_KEYS = ' + mergeSource[1] + '; return (' + mergeSource[2] + '); })()'
);

test('newer local false preference overrides stale cloud true', () => {
  const merged = mergeProgress(
    {helpArabic:false, _preferencesUpdatedAt:200},
    {helpArabic:true, _preferencesUpdatedAt:100}
  );
  assert.equal(merged.helpArabic, false);
});

test('newer cloud preference wins across devices', () => {
  const merged = mergeProgress(
    {theme:'light', _preferencesUpdatedAt:100},
    {theme:'dark', _preferencesUpdatedAt:200}
  );
  assert.equal(merged.theme, 'dark');
});

test('preference objects are selected atomically by timestamp', () => {
  const merged = mergeProgress(
    {storyReaderSettings:{fontScale:1.2,lineSpacing:1.8,nightMode:false}, _preferencesUpdatedAt:300},
    {storyReaderSettings:{fontScale:1,lineSpacing:1.75,nightMode:true}, _preferencesUpdatedAt:200}
  );
  assert.deepEqual({...merged.storyReaderSettings}, {fontScale:1.2,lineSpacing:1.8,nightMode:false});
});

test('cumulative progress booleans and numeric totals retain their merge rules', () => {
  const merged = mergeProgress(
    {achievementUnlocked:false, xp:120, _preferencesUpdatedAt:10},
    {achievementUnlocked:true, xp:90, _preferencesUpdatedAt:5}
  );
  assert.equal(merged.achievementUnlocked, true);
  assert.equal(merged.xp, 120);
});

test('all user preference changes stamp their update time before saving', () => {
  assert.match(app, /function markPreferencesUpdated\(\)/);
  for (const fragment of [
    'state.helpArabic = !state.helpArabic;\n    markPreferencesUpdated();',
    'state.translationEnabled = !state.translationEnabled; markPreferencesUpdated();',
    'state.sound = !state.sound; markPreferencesUpdated();',
    'state.theme = state.theme === \'dark\' ? \'light\' : \'dark\';\n    markPreferencesUpdated();',
    'state.helpArabic = choice === \'ar\';\n      markPreferencesUpdated();'
  ]) assert.ok(app.includes(fragment), 'Missing preference timestamp update: ' + fragment);
});
