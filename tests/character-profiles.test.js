const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Mira canonical profile overrides the legacy summary and is bilingual', () => {
  const context = {window:{}};
  vm.runInNewContext(read('data-cards.js'), context);
  vm.runInNewContext(read('data-character-profiles.js'), context);
  const profile = context.window.EPIPHANY_CARD_PROFILES['CHR-001'];
  assert.equal(profile.name.en, 'Mira');
  assert.equal(profile.facts.find(f => f.label.en === 'Species').value.en, 'Human');
  assert.equal(profile.facts.find(f => f.label.en === 'Homeland').value.en, 'Darsen · Orath');
  assert.equal(profile.facts.find(f => f.label.en === 'Current residence').value.en, 'Velisar · Orath');
  for (const section of profile.sections) {
    assert.ok(section.title.en && section.title.ar);
    const entries = Array.isArray(section.text) ? section.text : [section.text];
    for (const entry of entries) assert.ok(entry.en || entry.text?.en, section.id + ' needs English content');
    for (const entry of entries) assert.ok(entry.ar || entry.text?.ar, section.id + ' needs Arabic content');
  }
  assert.ok(profile.sections.some(s => s.id === 'personality'));
  assert.ok(profile.sections.some(s => s.id === 'motivation'));
  assert.ok(profile.sections.some(s => s.id === 'quote'));
});

test('canonical character profile override loads after card catalog and is cached offline', () => {
  const html = read('index.html');
  const sw = read('service-worker.js');
  assert.match(html, /data-cards\.js[^\n]*defer/);
  assert.match(html, /data-character-profiles\.js[^\n]*defer/);
  assert.ok(html.indexOf('data-cards.js') < html.indexOf('data-character-profiles.js'));
  assert.ok(html.indexOf('data-character-profiles.js') < html.indexOf('cards.js'));
  assert.match(sw, /\.\/data-character-profiles\.js/);
});
