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
  assert.ok(html.indexOf('data-character-profiles.js') < html.indexOf('src="cards.js'));
  assert.match(sw, /\.\/data-character-profiles\.js/);
});


test('Veyra canonical profile follows the shared bilingual Character Details structure', () => {
  const context = {window:{}};
  vm.runInNewContext(read('data-cards.js'), context);
  vm.runInNewContext(read('data-character-profiles.js'), context);
  const profile = context.window.EPIPHANY_CARD_PROFILES['CHR-039'];
  assert.ok(profile, 'Veyra profile should exist');
  assert.equal(profile.name.en, 'Veyra');
  assert.equal(profile.name.ar, 'فييرا');
  assert.equal(profile.title.en, 'Pattern Detective');
  assert.equal(profile.facts.find(f => f.label.en === 'Species').value.en, 'Not documented yet');
  assert.equal(profile.facts.find(f => f.label.en === 'Age').value.en, 'Not documented yet');
  assert.equal(profile.facts.find(f => f.label.en === 'Homeland').value.en, 'Willowmere · Eiraven · Ilmar');
  assert.equal(profile.facts.find(f => f.label.en === 'Current residence').value.en, 'Not documented yet');
  const expected = ['overview','personality','motivation','abilities','limits','backstory','story-role','relationships','places','quote'];
  assert.equal(profile.sections.map(section => section.id).join(','), expected.join(','));
  for (const section of profile.sections) {
    assert.ok(section.title.en && section.title.ar, section.id + ' needs bilingual titles');
    const entries = Array.isArray(section.text) ? section.text : [section.text];
    for (const entry of entries) {
      const text = entry.text || entry;
      assert.ok(text.en, section.id + ' needs English content');
      assert.ok(text.ar, section.id + ' needs Arabic content');
    }
  }
  const card = context.window.EPIPHANY_CARD_DATA.find(item => item.id === 'CHR-039');
  assert.equal(card.rarity, 'Common');
  assert.equal(card.title, 'Pattern Detective');
});


test('Evren canonical profile is bilingual and preserves his established identity details', () => {
  const context = {window:{}};
  vm.runInNewContext(read('data-cards.js'), context);
  vm.runInNewContext(read('data-character-profiles.js'), context);
  const profile = context.window.EPIPHANY_CARD_PROFILES['CHR-002'];
  assert.ok(profile, 'Evren profile should exist');
  assert.equal(profile.name.en, 'Evren');
  assert.equal(profile.name.ar, 'إيفرن');
  assert.equal(profile.title.en, 'Resonance Tinkerer');
  assert.equal(profile.facts.find(f => f.label.en === 'Age').value.en, '28 years');
  assert.equal(profile.facts.find(f => f.label.en === 'Homeland').value.en, 'Dornwick · Orath');
  assert.equal(profile.facts.find(f => f.label.en === 'Era').value.en, "The current era (the latest era in the world's era division)");
  const expected = ['overview','personality','motivation','abilities','limits','backstory','story-role','relationships','places','quote'];
  assert.equal(profile.sections.map(section => section.id).join(','), expected.join(','));
  for (const section of profile.sections) {
    assert.ok(section.title.en && section.title.ar, section.id + ' needs bilingual titles');
    const entries = Array.isArray(section.text) ? section.text : [section.text];
    for (const entry of entries) {
      if (entry.characterId) {
        assert.ok(entry.label.en && entry.label.ar, section.id + ' character link needs bilingual labels');
        continue;
      }
      const text = entry.text || entry;
      assert.ok(text.en, section.id + ' needs English content');
      assert.ok(text.ar, section.id + ' needs Arabic content');
    }
  }
  assert.ok(profile.sections.find(s => s.id === 'limits').text.some(entry =>
    (entry.text || entry).en.includes('Prohibition')
  ));
  const card = context.window.EPIPHANY_CARD_DATA.find(item => item.id === 'CHR-002');
  assert.equal(card.rarity, 'Uncommon');
  assert.equal(card.image, 'idris.PNG', 'preserve the legacy portrait asset mapping');
});


test('Elaris canonical profile records Reshaping, Magnitude, Epic rarity and reciprocal Evren relationship', () => {
  const context = {window:{}};
  vm.runInNewContext(read('data-cards.js'), context);
  vm.runInNewContext(read('data-character-profiles.js'), context);
  const profile = context.window.EPIPHANY_CARD_PROFILES['CHR-003'];
  assert.ok(profile, 'Elaris profile should exist');
  assert.equal(profile.name.en, 'Elaris');
  assert.equal(profile.name.ar, 'إيلاريس');
  assert.equal(profile.facts.find(f => f.label.en === 'Homeland').value.en, 'Eiraven · Ilmar');
  assert.equal(profile.facts.find(f => f.label.en === 'Current residence').value.en, 'Avelorn · Orath');
  const expected = ['overview','personality','motivation','abilities','limits','backstory','relationships','places','quote'];
  assert.equal(profile.sections.map(section => section.id).join(','), expected.join(','));
  for (const section of profile.sections) {
    assert.ok(section.title.en && section.title.ar, section.id + ' needs bilingual titles');
    const entries = Array.isArray(section.text) ? section.text : [section.text];
    for (const entry of entries) {
      if (entry.characterId) {
        assert.ok(entry.label.en && entry.label.ar, section.id + ' character link needs bilingual labels');
        continue;
      }
      const value = entry.text || entry;
      assert.ok(value.en, section.id + ' needs English content');
      assert.ok(value.ar, section.id + ' needs Arabic content');
    }
  }
  const relationship = profile.sections.find(section => section.id === 'relationships');
  assert.equal(relationship.text[0].characterId, 'CHR-002');
  assert.ok(relationship.text[1].text.en.includes("at the age of five"));
  const abilities = profile.sections.find(section => section.id === 'abilities');
  assert.ok(abilities.title.en.includes('Reshaping'), 'the canonical ability name belongs in the section title');
  assert.ok(abilities.text.some(entry =>
    (entry.text || entry).en.includes('Elaris can reshape her own magical formations')
  ), 'the ability description should preserve the approved reshaping capability');
  assert.ok(profile.sections.find(section => section.id === 'limits').text.some(entry =>
    entry.text.en.includes('Magnitude')
  ));
  const card = context.window.EPIPHANY_CARD_DATA.find(item => item.id === 'CHR-003');
  assert.equal(card.rarity, 'Epic');
  assert.equal(card.image, 'salma.PNG', 'preserve the existing portrait asset mapping');
});

test('Evren relationship now links reciprocally to Elaris in Character Details', () => {
  const context = {window:{}};
  vm.runInNewContext(read('data-cards.js'), context);
  vm.runInNewContext(read('data-character-profiles.js'), context);
  const profile = context.window.EPIPHANY_CARD_PROFILES['CHR-002'];
  const relationship = profile.sections.find(section => section.id === 'relationships');
  assert.equal(relationship.text[0].characterId, 'CHR-003');
  assert.equal(relationship.text[0].label.en, 'Elaris');
  assert.ok(relationship.text[1].text.en.includes('Aelora Energy'));
  assert.match(read('cards.js'), /data-profile-character/);
});
