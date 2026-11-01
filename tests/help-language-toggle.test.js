import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('Arabic help ignores stale catalogue loads after a later language toggle', () => {
  assert.ok(app.includes('let helpLanguageToggleVersion = 0;'));
  assert.ok(app.includes('const toggleVersion = ++helpLanguageToggleVersion;'));
  assert.ok(app.includes('toggleVersion !== helpLanguageToggleVersion || !state.helpArabic'));
  assert.ok(app.includes("localStorage.setItem('epiphany-help-language-choice', state.helpArabic ? 'ar' : 'en')"));
});
test('startup and first-visit language catalogue loads cannot override a newer choice', () => {
  assert.ok(app.includes('startupHelpLanguageVersion === helpLanguageToggleVersion && state.helpArabic'));
  assert.ok(app.includes('const choiceVersion = ++helpLanguageToggleVersion;'));
  assert.ok(app.includes('choiceVersion !== helpLanguageToggleVersion || !state.helpArabic'));
});

test('switching Arabic help off re-renders language-dependent content', () => {
  assert.match(app, /} else \{\s*\/\/ Re-render language-dependent home\/help content[\s\S]*?renderAll\(\);\s*syncCurrentQuestion\(\);/);
});
