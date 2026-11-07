const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../fluentia-engine.js');
const AdapterFactory = require('../fluentia-adapters.js');

function fixture() {
  return {
    games: {
      vocabulary: {questions: [
        {id:'v-a1', level:'A1', q:'Meaning?', answers:['A','B'], correct:1, explain:'Because B.'},
        {id:'v-b1', level:'B1', q:'Meaning?', answers:['A','B'], correct:0}
      ]},
      spelling: {questions:[{id:'sp-a1', level:'A1', answers:['wrong','right'], correct:1}]},
      grammar: {questions:[{id:'gr-a1', level:'A1', answers:['wrong','right'], correct:1}]},
      listening: {questions:[{id:'tx-a1', level:'A1', answers:['wrong','right'], correct:1}]},
      story: {questions:[{id:'rw-a1', level:'A1', answers:['wrong','right'], correct:1}]},
      advanced: {questions:[{id:'fs-a1', level:'A1', answers:['wrong','right'], correct:1}]},
      mistakes: {questions:[{id:'mi-a1', level:'A1', answers:['wrong','right'], correct:1, trap:'articles'}]}
    },
    spot: [{id:'spot-a1', level:'A1', text:'She go home.', wrongIndex:1, fix:'goes', why_en:'Use goes.'}],
    typing: [{id:'type-a1', level:'A1', prompt:'She ___ home.', accept:['goes','goes home'], answer:'goes', why_en:'Third-person singular.'}],
    directions: [{id:'dir-a1', level:'A1', answer:[2,3], steps:[['go',2]]}]
  };
}

test('Fluentia adapters expose canonical activity IDs and domain assignments', () => {
  const adapters = AdapterFactory.createAdapters(fixture());
  assert.equal(adapters.length, 10);
  assert.deepEqual(new Set(adapters.map(item => item.domain)), new Set([
    'wordcraft', 'sentence-studio', 'textwise', 'real-world', 'fine-sense'
  ]));
  assert.equal(new Set(adapters.map(item => item.id)).size, adapters.length);
});

test('legacy banks are filtered strictly by CEFR and receive stable item IDs', () => {
  const adapters = AdapterFactory.createAdapters(fixture());
  const vocabulary = adapters.find(item => item.id === 'wordcraft-vocabulary');
  const first = vocabulary.getItems({level:'A1'});
  const second = vocabulary.getItems({level:'A1'});
  assert.equal(first.length, 1);
  assert.equal(first[0].id, 'v-a1');
  assert.equal(first[0].id, second[0].id);
  assert.equal(vocabulary.getItems({level:'C2'}).length, 0);
});

test('missing legacy IDs receive deterministic IDs without mutating source records', () => {
  const sources = fixture();
  const item = {level:'A1', q:'Stable prompt', answers:['A','B'], correct:0};
  sources.games.vocabulary.questions.push(item);
  const adapter = AdapterFactory.createAdapters(sources).find(row => row.id === 'wordcraft-vocabulary');
  const first = adapter.getItems({level:'A1'}).at(-1).id;
  const second = adapter.getItems({level:'A1'}).at(-1).id;
  assert.match(first, /^wordcraft-vocabulary-/);
  assert.equal(first, second);
  assert.equal(Object.hasOwn(item, 'id'), false);
});

test('choice, error-identification, typed and map evaluators preserve native answer semantics', () => {
  const adapters = AdapterFactory.createAdapters(fixture());
  const get = id => adapters.find(item => item.id === id);
  const [vocab] = get('wordcraft-vocabulary').getItems({level:'A1'});
  assert.equal(get('wordcraft-vocabulary').evaluate(vocab, 1).correct, true);
  assert.equal(get('wordcraft-vocabulary').evaluate(vocab, 0).correct, false);

  const [spot] = get('sentence-studio-spot-the-mistake').getItems({level:'A1'});
  assert.equal(get('sentence-studio-spot-the-mistake').evaluate(spot, 1).correct, true);
  assert.equal(get('sentence-studio-spot-the-mistake').evaluate(spot, 0).correct, false);

  const [typed] = get('sentence-studio-type-it').getItems({level:'A1'});
  assert.equal(get('sentence-studio-type-it').evaluate(typed, 'GOES!').correct, true);
  assert.equal(get('sentence-studio-type-it').evaluate(typed, 'go').correct, false);

  const [direction] = get('real-world-directions').getItems({level:'A1'});
  assert.equal(get('real-world-directions').evaluate(direction, [2,3]).correct, true);
  assert.equal(get('real-world-directions').evaluate(direction, '2,3').correct, true);
  assert.equal(get('real-world-directions').evaluate(direction, [3,2]).correct, false);
});

test('adapter registration is idempotent and works with the shared session engine', () => {
  const engine = Engine.createEngine();
  const ids = AdapterFactory.registerAll(engine, fixture());
  const repeated = AdapterFactory.registerAll(engine, fixture());
  assert.deepEqual(repeated, ids);
  assert.equal(engine.listActivities().length, 10);

  const session = engine.createSession({mode:'single', activityId:'wordcraft-vocabulary', level:'A1', length:1});
  const item = engine.selectNext(session);
  assert.equal(item.id, 'v-a1');
  const event = engine.submitAnswer(session, 1);
  assert.equal(event.correct, true);
  assert.equal(event.domain, 'wordcraft');
  assert.equal(event.activityId, 'wordcraft-vocabulary');
});

test('legacy source banks remain unchanged after adapter creation and evaluation', () => {
  const sources = fixture();
  const before = JSON.stringify(sources);
  const adapters = AdapterFactory.createAdapters(sources);
  adapters.forEach(adapter => adapter.getItems({level:'A1'}));
  assert.equal(JSON.stringify(sources), before);
});
