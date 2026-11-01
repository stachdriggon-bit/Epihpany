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
