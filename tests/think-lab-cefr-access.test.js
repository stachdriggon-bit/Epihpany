const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Think Lab exposes only CEFR levels reached by the learner, unless developer access is active', () => {
  const thinkLab = read('think-lab.js');
  assert.match(thinkLab, /const THINK_LAB_CEFR_LEVELS = \['A1','A2','B1','B2','C1','C2'\]/);
  assert.match(thinkLab, /function hasThinkLabDeveloperAccess\(\)[\s\S]*?EpiphanyAuth[\s\S]*?isDeveloper\(\)/);
  assert.match(thinkLab, /function availableThinkLabCEFRLevels\(\)[\s\S]*?hasThinkLabDeveloperAccess\(\)[\s\S]*?return THINK_LAB_CEFR_LEVELS\.slice\(\)/);
  assert.match(thinkLab, /return THINK_LAB_CEFR_LEVELS\.slice\(0, THINK_LAB_CEFR_LEVELS\.indexOf\(currentThinkLabCEFR\(\)\) \+ 1\)/);
});

test('Sound Maze and The Bold Translator visibly disable locked CEFR levels', () => {
  const thinkLab = read('think-lab.js');
  assert.equal((thinkLab.match(/disabled aria-disabled="true"/g) || []).length, 2,
    'both level pickers should disable unavailable CEFR choices');
  assert.match(thinkLab, /Locked · progress to unlock/);
});

test('CEFR level restrictions are checked again before starting a game and saving Sound Maze preference', () => {
  const thinkLab = read('think-lab.js');
  const app = read('app.js');
  assert.match(thinkLab, /if \(id === 'maze' && !canChooseThinkLabCEFR\(selectedMazeCEFR\)\)/);
  assert.match(thinkLab, /if \(id === 'translator' && selectedTranslatorCEFR !== 'adaptive' && !canChooseThinkLabCEFR\(selectedTranslatorCEFR\)\)/);
  assert.match(thinkLab, /if \(!canChooseThinkLabCEFR\(mazeLevel\.dataset\.soundMazeLevel\)\)return/);
  assert.match(thinkLab, /requestedLevel!=='adaptive'&&!canChooseThinkLabCEFR\(requestedLevel\)/);
  assert.match(app, /requestedIndex < 0 \|\| \(!hasDeveloperAccess\(\) && requestedIndex > levelIndex\(\)\)/);
});
