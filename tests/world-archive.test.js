const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
function loadData(file) {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), { window });
  return window;
}

test('World Archive registry uses stable unique place and period IDs', () => {
  const data = loadData('data-world-registry.js');
  const places = data.EPIPHANY_WORLD_PLACES;
  const periods = data.EPIPHANY_WORLD_PERIODS;
  assert.equal(places.length, 10);
  assert.equal(new Set(places.map(place => place.id)).size, places.length, 'place IDs must be unique');
  assert.equal(new Set(periods.map(period => period.id)).size, periods.length, 'period IDs must be unique');
  assert.ok(places.every(place => place.id && place.name && place.region && place.description));
  assert.ok(periods.some(period => period.id === 'period-unassigned' && period.kind === 'unknown'));
  assert.ok(periods.filter(period => period.kind === 'relative').every(period => period.scope === 'local'));
});

test('pilot events link only to the established Low-Water Shore reference and keep dates unknown', () => {
  const registry = loadData('data-world-registry.js');
  const events = loadData('data-world-events.js').EPIPHANY_WORLD_EVENTS;
  const placeIds = new Set(registry.EPIPHANY_WORLD_PLACES.map(place => place.id));
  assert.equal(events.length, 6);
  assert.ok(events.every(event => placeIds.has(event.placeId)), 'each event must reference a registered place');
  assert.ok(events.every(event => event.placeId === 'OR-LOC-02'));
  assert.ok(events.every(event => event.periodId === 'period-unassigned'));
  assert.ok(events.every(event => event.date && event.date.kind === 'unknown'));
  assert.ok(!registry.EPIPHANY_WORLD_PLACES.some(place => place.id === 'OR-CITY-04'), 'an unresolved candidate must not be silently merged into the place registry');
});

test('World Archive UI exposes place, period, and calendar-date filters', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.match(app, /window\.EPIPHANY_WORLD_PLACES/);
  assert.match(app, /window\.EPIPHANY_WORLD_PERIODS/);
  assert.match(app, /id="archive-period"/);
  assert.match(app, /id="archive-from" type="date"/);
  assert.match(app, /id="archive-to" type="date"/);
  assert.match(app, /archive-clear-filters/);
});


test('story lore metadata links only registered places and preserves unknown chronology', () => {
  const context = vm.createContext({ window: {} });
  for (const file of ['data-stories.js', 'data-stories-expansion.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file, timeout: 5000 });
  }
  const stories = vm.runInContext('STORIES', context);
  const registry = loadData('data-world-registry.js');
  const events = loadData('data-world-events.js').EPIPHANY_WORLD_EVENTS;
  const placeById = new Map(registry.EPIPHANY_WORLD_PLACES.map(place => [place.id, place]));
  const loreStories = stories.filter(story => story.lore);
  assert.equal(loreStories.length, 6, 'only the six explicitly authored Low-Water Shore episodes currently carry archive lore');
  for (const story of loreStories) {
    assert.ok(placeById.has(story.lore.placeId), story.id + ' must point to a registered place');
    assert.equal(story.lore.periodId, 'period-unassigned', story.id + ' must not invent a historical period');
    assert.deepEqual(JSON.parse(JSON.stringify(story.lore.date)), { kind: 'unknown', label: 'Date not established' });
    assert.equal(story.lore.dateLabel, 'Date not established');
    const event = events.find(item => (item.storyIds || []).includes(story.id));
    assert.ok(event, story.id + ' should have a corresponding archive event');
    assert.equal(event.placeId, story.lore.placeId);
    assert.equal(event.periodId, story.lore.periodId);
    assert.equal(event.date.kind, story.lore.date.kind);
  }
});
