'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'language-detective-ui.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

test('Casebound reuses EPIPHANY shared translation preference and translator', () => {
  assert.match(app, /window\.EPIPHANY_TRANSLATION_ENHANCE\s*=\s*root\s*=>/);
  assert.match(app, /translationObserver\.observe\(\$\('#casebound-content'\)/);
  assert.match(app, /enhanceTranslationControls\(\$\('\.casebound-page'\)\)/);
  assert.match(ui, /window\.EPIPHANY_TRANSLATION_ENHANCE\?\.\(page\)/);
  assert.match(ui, /window\.EPIPHANY_TRANSLATION_ENHANCE\?\.\(drawer\)/);
});

test('Casebound marks authored Arabic units after every screen render, including its notebook', () => {
  assert.match(ui, /const CASEBOUND_ARABIC = Object\.freeze\(/);
  assert.match(ui, /function markCaseboundTranslations\(container\)/);
  assert.match(ui, /function enhanceCaseboundTranslations\(\)/);
  assert.match(ui, /markCaseboundTranslations\(page\)/);
  assert.match(ui, /markCaseboundTranslations\(drawer\)/);
  assert.ok((ui.match(/enhanceCaseboundTranslations\(\);/g) || []).length >= 4);
  assert.match(ui, /'The Missing Package':'الحزمة المفقودة'/);
  assert.match(ui, /'Conflicting Accounts':'إفادات متعارضة'/);
  assert.match(ui, /'The Uncertain Evidence':'الأدلة غير الحاسمة'/);
  assert.match(ui, /'The Blue Scarf':'الوشاح الأزرق'/);
  assert.match(ui, /'The Missing Bag':'الحقيبة المفقودة'/);
  assert.match(ui, /'The station seating log places Lina[\s\S]*?':'يضع سجل مقاعد المحطة/);
  assert.match(ui, /'R-4 recorded an unusual signal increase.':'سجل R-4 ارتفاعًا غير مألوف في الإشارة.'/);
  assert.doesNotMatch(ui, /'The green canvas bag most likely belongs to Lina\.'/);
  assert.doesNotMatch(ui, /'The scarf is at the lost-property desk\.'/);
  assert.match(ui, /'I waited near the timetable board[\s\S]*?':'انتظرت بالقرب من لوحة مواعيد القطارات/);
});

test('Final conclusion options remain excluded from Casebound translation controls', () => {
  const markerStart = ui.indexOf('function markCaseboundTranslations');
  const markerEnd = ui.indexOf('function enhanceCaseboundTranslations', markerStart);
  assert.notEqual(markerStart, -1);
  assert.notEqual(markerEnd, -1);
  const marker = ui.slice(markerStart, markerEnd);
  assert.match(marker, /\[data-ld-conclusion-option\]/);
  assert.match(marker, /\.ld-conclusion-locked/);
  const optionsStart = ui.indexOf('const answerFields');
  const optionsEnd = ui.indexOf('const answerPanel', optionsStart);
  const conclusionMarkup = ui.slice(optionsStart, optionsEnd);
  assert.match(conclusionMarkup, /data-ld-conclusion-option/);
  assert.doesNotMatch(conclusionMarkup, /data-tx/);
});

test('Casebound translation controls are compact icons with accessible names and tooltips', () => {
  assert.match(app, /button\.closest\('\.casebound-page, \.ld-notebook-drawer'\)/);
  assert.match(app, /button\.setAttribute\('aria-label',actionLabel\)/);
  assert.match(app, /button\.title=actionLabel/);
  assert.match(app, /txSetButtonState\(button,false,label\)/);
  assert.match(app, /\(ar\?'EN':'文A'\)/);
  assert.match(ui, /span\.dataset\.txLabel = label/);
  assert.match(css, /\.ld-notebook-drawer \.translate-btn\{width:32px/);
  assert.match(css, /\.casebound-page \.translate-btn\{width:32px;min-width:32px;min-height:30px/);
  assert.match(css, /\.casebound-translation-row\{display:inline-flex/);
});
