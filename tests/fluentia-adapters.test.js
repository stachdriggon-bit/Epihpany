const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../fluentia-engine.js');
const AdapterFactory = require('../fluentia-adapters.js');
const fs = require('node:fs');
const path = require('node:path');

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
    directions: [{id:'dir-a1', level:'A1', answer:[2,3], steps:[['go',2]]}], directionBlocks: [[['🏦','bank','مصرف']]]
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

test('Directions adapter reads map data that becomes available after adapter registration', () => {
  const sources = fixture();
  let liveItems = [];
  let liveBlocks = [[['🏦','bank','مصرف']]];
  sources.getDirections = () => liveItems;
  sources.getDirectionBlocks = () => liveBlocks;
  const adapter = AdapterFactory.createAdapters(sources).find(item => item.id === 'real-world-directions');
  assert.equal(adapter.getItems({level:'A1'}).length,0);
  liveItems = [{id:'dir-late',level:'A1',answer:[0,0],steps:[]}];
  liveBlocks = [[['📚','library','مكتبة']]];
  const [item] = adapter.getItems({level:'A1'});
  assert.equal(item.id,'dir-late');
  assert.deepEqual(item.mapBlocks,liveBlocks);
});

test('Directions adapter carries landmark map data into each eligible item', () => {
  const adapter = AdapterFactory.createAdapters(fixture()).find(item => item.id === 'real-world-directions');
  const [item] = adapter.getItems({level:'A1'});
  assert.deepEqual(item.mapBlocks, [[['🏦','bank','مصرف']]]);
  assert.equal(item.answer[0],2);
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

  const session = engine.createSession({mode:'single', activityId:'wordcraft-vocabulary', level:'A1', itemCount:1});
  const selected = engine.selectNext(session);
  assert.equal(selected.item.id, 'v-a1');
  const event = engine.submitAnswer(session, 1);
  assert.equal(event.correct, true);
  assert.equal(event.domain, 'wordcraft');
  assert.equal(event.activityId, 'wordcraft-vocabulary');
  assert.equal(event.sourceActivityId, 'vocabulary');
});

test('legacy source banks remain unchanged after adapter creation and evaluation', () => {
  const sources = fixture();
  const before = JSON.stringify(sources);
  const adapters = AdapterFactory.createAdapters(sources);
  adapters.forEach(adapter => adapter.getItems({level:'A1'}));
  assert.equal(JSON.stringify(sources), before);
});

function expandedFixture() {
  const sources = fixture();
  sources.games.vocabulary.questions[0].word = 'apple';
  sources.audioItems = [
    {id:'SP-A1-01',level:'A1',word:'apple',meaning:'a round fruit',icon:'🍎',image:'assets/fluentia/soundscape-pictograms.svg#apple'},
    {id:'SP-A1-02',level:'A1',word:'book',meaning:'something you read',icon:'📘',image:'assets/fluentia/soundscape-pictograms.svg#book'},
    {id:'SP-A1-03',level:'A1',word:'umbrella',meaning:'keeps you dry in rain',icon:'☂️',image:'assets/fluentia/soundscape-pictograms.svg#umbrella'},
    {id:'SP-A1-04',level:'A1',word:'key',meaning:'opens a lock',icon:'🔑',image:'assets/fluentia/soundscape-pictograms.svg#key'},
    {id:'SP-A2-01',level:'A2',word:'train',icon:'🚆',image:'assets/fluentia/soundscape-pictograms.svg#train'},
    {id:'SP-A2-02',level:'A2',word:'chair',icon:'🪑',image:'assets/fluentia/soundscape-pictograms.svg#chair'},
    {id:'SP-A2-03',level:'A2',word:'phone',icon:'📱',image:'assets/fluentia/soundscape-pictograms.svg#phone'},
    {id:'SP-A2-04',level:'A2',word:'bus',icon:'🚌',image:'assets/fluentia/soundscape-pictograms.svg#bus'},
    {id:'SP-B1-01',level:'B1',word:'suitcase',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#suitcase'},
    {id:'SP-B1-02',level:'B1',word:'camera',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#camera'},
    {id:'SP-B1-03',level:'B1',word:'bicycle',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#bicycle'},
    {id:'SP-B1-04',level:'B1',word:'headphones',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#headphones'},
    {id:'SP-B2-01',level:'B2',word:'microscope',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#microscope'},
    {id:'SP-B2-02',level:'B2',word:'telescope',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#telescope'},
    {id:'SP-B2-03',level:'B2',word:'binoculars',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#binoculars'},
    {id:'SP-B2-04',level:'B2',word:'compass',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#compass'},
    {id:'SP-C1-01',level:'C1',word:'hourglass',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#hourglass'},
    {id:'SP-C1-02',level:'C1',word:'magnifier',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#magnifier'},
    {id:'SP-C1-03',level:'C1',word:'globe',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#globe'},
    {id:'SP-C1-04',level:'C1',word:'typewriter',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#typewriter'},
    {id:'SP-C2-01',level:'C2',word:'sextant',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#sextant'},
    {id:'SP-C2-02',level:'C2',word:'astrolabe',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#astrolabe'},
    {id:'SP-C2-03',level:'C2',word:'metronome',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#metronome'},
    {id:'SP-C2-04',level:'C2',word:'abacus',icon:'🔎',image:'assets/fluentia/soundscape-pictograms.svg#abacus'}
  ];
  sources.wordOfDayItems = [{id:'WM-A1-01',level:'A1',word:'apple',meaning:'a round fruit'},{id:'WM-A1-02',level:'A1',word:'banana',meaning:'a long yellow fruit'}];
  sources.soundscapeDictationBank = [{id:'SD-A1-01',level:'A1',text:'I like fresh bread.'}];
  sources.sentenceItems = [{id:'SB-A1-01',level:'A1',text:'I drink water every morning.'}];
  sources.practiceSamples = [{id:'PL-A1-01',level:'A1',text:'I would like water.'}];
  sources.textwiseSequenceBank = [{id:'TW-A1-01',level:'A1',title:'A notice',steps:['Read the notice.','Check the date.','Follow the instructions.']}];
  sources.soundMazeBank = {levels:{A1:{guided:[{id:'SM-A1-01',target:'cat',options:['cat','cut','kit','cot'],explain:'Cat has /æ/.'}],steady:[],challenge:[]}}};
  sources.reviewState = {
    fluentiaHistory:[{eventId:'session-a:0',sessionId:'session-a',activityId:'soundscape-sound-maze',sourceActivityId:'sound-maze',itemId:'SM-A1-01',level:'A1',domain:'soundscape',correct:false,errorType:'sound-discrimination'},{eventId:'session-a:1',sessionId:'session-a',activityId:'wordcraft-speed-round',sourceActivityId:'word-of-the-day',itemId:'WM-A1-02',level:'A1',domain:'wordcraft',correct:false,errorType:'rapid-vocabulary-retrieval'}],
    fluentiaReviewState:{'sound-maze:SM-A1-01':{mastered:false,attempts:1},'word-of-the-day:WM-A1-02':{mastered:false,attempts:1}},
    review:[{word:'apple',meaning:'a round fruit',errors:3}],
    words:[['apple','a round fruit']],
    mistakeTrapErrors:{articles:2},
    mistakeQuestionErrors:{'mi-a1':1}
  };
  return sources;
}

test('extended sources register matching, listening, speech, sequencing and review adapters', () => {
  const adapters = AdapterFactory.createAdapters(expandedFixture());
  const ids = new Set(adapters.map(item => item.id));
  for (const id of [
    'wordcraft-word-match','soundscape-sound-picture-match','soundscape-sound-maze','soundscape-dictation',
    'real-world-speaking-shadowing','textwise-sequence','sentence-studio-sentence-builder',
    'wordcraft-personal-review','sentence-studio-personal-review'
  ]) assert.ok(ids.has(id), id);
  assert.equal(adapters.length, 40);
});

test('Sound Maze, dictation, shadowing and Word Match keep distinct evaluation semantics', () => {
  const adapters = AdapterFactory.createAdapters(expandedFixture());
  const get = id => adapters.find(item => item.id === id);
  const [sound] = get('soundscape-sound-maze').getItems({level:'A1'});
  assert.equal(get('soundscape-sound-maze').evaluate(sound, 'cat').correct, true);
  assert.equal(get('soundscape-sound-maze').evaluate(sound, 1).correct, false);

  const [dictation] = get('soundscape-dictation').getItems({level:'A1'});
  assert.equal(get('soundscape-dictation').evaluate(dictation, 'I would like water!').correct, true);
  assert.equal(get('soundscape-dictation').evaluate(dictation, 'I like water').correct, false);

  const [speech] = get('real-world-speaking-shadowing').getItems({level:'A1'});
  const partial = get('real-world-speaking-shadowing').evaluate(speech, 'I would like');
  assert.equal(partial.correct, false);
  assert.equal(partial.accuracy, 75);
  assert.equal(get('real-world-speaking-shadowing').evaluate(speech, 'I would like water').correct, true);

  const pictureAdapter = get('soundscape-sound-picture-match');
  const pictureItems = pictureAdapter.getItems({level:'A1'});
  assert.equal(pictureItems.length, 4);
  const [picture] = pictureItems;
  assert.equal(picture.pictureOptions.length, 4, 'each Sound & Picture question should offer exactly four picture choices');
  assert.ok(picture.pictureOptions.some(option => option.word === picture.word), 'the correct picture must be present');
  assert.ok(picture.pictureOptions.every(option => option.icon || option.image), 'every choice must have visual artwork');
  assert.equal(new Set(picture.pictureOptions.map(option => option.word)).size, 4, 'picture choices must be unique');
  assert.deepEqual(picture.pictureOptions, pictureAdapter.getItems({level:'A1'})[0].pictureOptions, 'picture choice order should remain stable for the same item');
  const a2Picture = pictureAdapter.getItems({level:'A2'})[0];
  assert.equal(a2Picture.pictureOptions.length, 4, 'A2 must also have four same-level picture choices');
  assert.ok(a2Picture.pictureOptions.some(option => option.word === a2Picture.word));
  assert.ok(a2Picture.pictureOptions.every(option => option.image), 'A2 picture options should use actual SVG artwork');
  const expectedPictureCounts = {A1:4,A2:4,B1:4,B2:4,C1:4,C2:4};
  for (const [level, minimum] of Object.entries(expectedPictureCounts)) {
    const levelItems = pictureAdapter.getItems({level});
    assert.ok(levelItems.length >= minimum, level + ' must have enough picture prompts to play');
    for (const row of levelItems) {
      assert.equal(row.pictureOptions.length, 4, level + ' questions must show exactly four pictures');
      assert.equal(new Set(row.pictureOptions.map(option => option.word)).size, 4, level + ' choices must be unique');
      assert.ok(row.pictureOptions.some(option => option.word === row.word), level + ' choices must include the answer');
      assert.ok(row.pictureOptions.every(option => option.image), level + ' choices must use SVG artwork');
    }
  }
  assert.equal(pictureAdapter.evaluate(picture, picture.word).correct, true);
  assert.equal(pictureAdapter.evaluate(picture, picture.pictureOptions.find(option => option.word !== picture.word).word).correct, false);
  const [match] = get('wordcraft-word-match').getItems({level:'A1'});
  assert.equal(match.pairs.length, 2);
  assert.equal(get('wordcraft-word-match').evaluate(match, match.pairs.map(pair=>({word:pair.word,meaning:pair.meaning}))).correct, true);
  assert.equal(get('wordcraft-word-match').evaluate(match, [{word:'apple',meaning:'something you read'},{word:'banana',meaning:'a round fruit'}]).correct, false);
  assert.equal(get('wordcraft-word-match').evaluate(match, [{word:'apple',meaning:'a round fruit'}]).correct, false);
  assert.equal(match.sourceActivityId, 'word-of-the-day');
});

test('history review can recover items excluded by an activity’s normal prioritised feed', () => {
  const sources = expandedFixture();
  const adapters = AdapterFactory.createAdapters(sources);
  const speed = adapters.find(item => item.id === 'wordcraft-speed-round');
  const review = adapters.find(item => item.id === 'wordcraft-speed-round-history-review');
  assert.deepEqual(speed.getItems({level:'A1'}).map(item=>item.word), ['apple'], 'normal Speed Round should retain its saved-word priority');
  assert.deepEqual(review.getItems({level:'A1'}).map(item=>item.word), ['banana'], 'history review must still recover a missed non-prioritised source item');
});

test('Textwise sequencing is independent and order-sensitive', () => {
  const adapters = AdapterFactory.createAdapters(expandedFixture());
  const sequence = adapters.find(item => item.id === 'textwise-sequence');
  const [item] = sequence.getItems({level:'A1'});
  assert.equal(sequence.evaluate(item, item.steps).correct, true);
  assert.equal(sequence.evaluate(item, item.steps.slice().reverse()).correct, false);
});

test('Your Review adapters use only level-tagged source questions and existing learner signals', () => {
  const adapters = AdapterFactory.createAdapters(expandedFixture());
  const wordReview = adapters.find(item => item.id === 'wordcraft-personal-review');
  const grammarReview = adapters.find(item => item.id === 'sentence-studio-personal-review');
  assert.equal(wordReview.getItems({level:'A1'}).length, 1);
  assert.equal(wordReview.getItems({level:'B1'}).length, 0);
  assert.equal(grammarReview.getItems({level:'A1'}).length, 1);
  assert.equal(grammarReview.getItems({level:'C2'}).length, 0);
  assert.equal(wordReview.evaluate(wordReview.getItems({level:'A1'})[0], 'a round fruit').correct, true);
  assert.equal(wordReview.getItems({level:'A1'})[0].sourceActivityId, 'vocabulary');
  assert.equal(grammarReview.getItems({level:'A1'})[0].sourceActivityId, 'mistakes');
  assert.equal(wordReview.interactionType, 'dynamic');
});

test('incremental source registration adds lazy sources without replacing existing activities', () => {
  const engine = Engine.createEngine();
  AdapterFactory.registerAll(engine, fixture());
  const added = AdapterFactory.registerSources(engine, {
    practiceSamples: [{id:'PL-A1-01',level:'A1',text:'Hello there.'}]
  });
  assert.deepEqual(added, ['soundscape-dictation','real-world-speaking-shadowing']);
  assert.equal(engine.listActivities().length, 12);
  assert.deepEqual(AdapterFactory.registerSources(engine, {
    practiceSamples: [{id:'PL-A1-01',level:'A1',text:'Hello there.'}]
  }), []);
});

test('Sentence Builder preserves ordering interaction and exact token order', () => {
  const adapters = AdapterFactory.createAdapters(expandedFixture());
  const builder = adapters.find(item => item.id === 'sentence-studio-sentence-builder');
  const [item] = builder.getItems({level:'A1'});
  assert.equal(builder.interactionType, 'ordering');
  assert.equal(builder.evaluate(item, ['I','drink','water','every','morning.']).correct, true);
  assert.equal(builder.evaluate(item, ['I','water','drink','every','morning.']).correct, false);
});

test('personal review adapters read the latest learner state after account-state replacement', () => {
  const sources = expandedFixture();
  sources.games.vocabulary.questions.push({
    id:'v-a1-banana',level:'A1',word:['banana','a long yellow fruit'],
    answers:['a long yellow fruit','a round fruit'],correct:0
  });
  let currentState = {words:[['apple','a round fruit']],review:[],mistakeTrapErrors:{},mistakeQuestionErrors:{}};
  sources.reviewState = () => currentState;
  const adapters = AdapterFactory.createAdapters(sources);
  const review = adapters.find(item => item.id === 'wordcraft-personal-review');
  assert.deepEqual(review.getItems({level:'A1'}).map(item => item.reviewPrompt), ['apple']);
  currentState = {words:[['banana','a long yellow fruit']],review:[],mistakeTrapErrors:{},mistakeQuestionErrors:{}};
  assert.deepEqual(review.getItems({level:'A1'}).map(item => item.reviewPrompt), ['banana']);
});

test('Your Review feeds stay out of ordinary mixed sessions but remain individually selectable', () => {
  const engine = Engine.createEngine();
  AdapterFactory.registerAll(engine, expandedFixture());
  const mixed = engine.createSession({mode:'fluentia-mix',level:'A1',itemCount:5});
  assert.ok(!mixed.activityIds.includes('wordcraft-personal-review'));
  assert.ok(!mixed.activityIds.includes('sentence-studio-personal-review'));
  const review = engine.createSession({mode:'single',activityId:'wordcraft-personal-review',level:'A1',itemCount:1});
  assert.deepEqual(review.activityIds, ['wordcraft-personal-review']);
});

test('Your Review includes missed Fluentia items with their original interaction and mastery state', () => {
  const sources = expandedFixture();
  const adapters = AdapterFactory.createAdapters(sources);
  const review = adapters.find(item => item.id === 'soundscape-sound-maze-history-review');
  assert.ok(review, 'Sound Maze should have a history review adapter');
  assert.equal(review.reviewOnly, true);
  assert.equal(review.interactionType, 'listening');
  const [missed] = review.getItems({level:'A1'});
  assert.equal(missed.id, 'SM-A1-01');
  assert.equal(missed.sourceActivityId, 'sound-maze');
  assert.equal(missed.reviewErrorType, 'sound-discrimination');
  assert.equal(review.evaluate(missed, 'cat').correct, true);
  sources.reviewState.fluentiaReviewState['sound-maze:SM-A1-01'].mastered = true;
  assert.deepEqual(review.getItems({level:'A1'}), [], 'a correctly reviewed item should leave the active review queue');
  sources.reviewState.fluentiaReviewState['sound-maze:SM-A1-01'].mastered = false;
  assert.equal(review.getItems({level:'A1'}).length, 1, 'a later mistake should make the item eligible again');
});

test('Soundscape dictation bank and Wordcraft Speed Round preserve CEFR and answer semantics', () => {
  const sources = expandedFixture();
  sources.soundscapeDictationBank = [
    {id:'SD-A1-01',level:'A1',text:'I like fresh bread.'},
    {id:'SD-B2-01',level:'B2',text:'The report was revised.'}
  ];
  const adapters = AdapterFactory.createAdapters(sources);
  const dictation = adapters.find(item => item.id === 'soundscape-dictation-bank');
  const speed = adapters.find(item => item.id === 'wordcraft-speed-round');
  assert.deepEqual(dictation.getItems({level:'A1'}).map(item=>item.id), ['SD-A1-01']);
  assert.equal(dictation.evaluate(dictation.getItems({level:'A1'})[0], 'I like fresh bread!').correct, true);
  assert.equal(dictation.getItems({level:'C1'}).length, 0);
  assert.ok(speed);
  assert.equal(speed.interactionType, 'typed');
  assert.equal(speed.getItems({level:'A1'})[0].sourceActivityId, 'word-of-the-day');
  assert.equal(speed.evaluate(speed.getItems({level:'A1'})[0], 'apple').correct, true);
});

test('adapter progress callback is carried into the engine and receives normalized events', () => {
  const events = [];
  const sources = fixture();
  sources.onProgress = event => events.push(event);
  const engine = Engine.createEngine();
  AdapterFactory.registerAll(engine, sources);
  const session = engine.createSession({mode:'single',activityId:'wordcraft-vocabulary',level:'A1',itemCount:1});
  engine.selectNext(session);
  engine.submitAnswer(session, 1);
  assert.equal(events.length, 1);
  assert.equal(events[0].sourceActivityId, 'vocabulary');
  assert.equal(events[0].domain, 'wordcraft');
});

test('Fluentia picture content does not expand the legacy Arcade audio pool', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const legacy = app.match(/const MINI_AUDIO_ITEMS=\[([\s\S]*?)\];\s*const FLUENTIA_AUDIO_ITEMS=/);
  assert.ok(legacy, 'legacy audio pool and Fluentia CEFR pool should remain separate');
  assert.doesNotMatch(legacy[1], /SP-B1-|SP-B2-|SP-C1-|SP-C2-/);
  assert.match(app, /const FLUENTIA_AUDIO_ITEMS=MINI_AUDIO_ITEMS\.concat\(\[/);
  assert.match(app, /EPIPHANY_FLUENTIA_REGISTER_SOURCES\(\{audioItems: FLUENTIA_AUDIO_ITEMS\}\)/);
  for (const level of ['B1','B2','C1','C2']) {
    assert.equal((app.match(new RegExp("id:'SP-" + level + "-\\d{2}'", 'g')) || []).length, 4, level + ' should have four dedicated prompts');
  }
});


test('Word Match creates balanced multi-pair rounds without changing source vocabulary or CEFR levels', () => {
  const sources = expandedFixture();
  sources.wordOfDayItems = Array.from({length:10},(_,index)=>({id:'WM-B2-'+index,level:'B2',word:'word'+index,meaning:'meaning '+index}));
  const adapter = AdapterFactory.createAdapters(sources).find(item=>item.id==='wordcraft-word-match');
  const rounds = adapter.getItems({level:'B2'});
  assert.deepEqual(rounds.map(round=>round.pairs.length),[4,3,3]);
  assert.equal(adapter.getItems({level:'A1'}).length,1);
  assert.equal(adapter.getItems({level:'A2'}).length,0);
  assert.ok(rounds.every(round=>round.pairs.every(pair=>pair.word&&pair.meaning)));
  const wrong = rounds[0].pairs.map((pair,index,all)=>({word:pair.word,meaning:all[(index+1)%all.length].meaning}));
  assert.equal(adapter.evaluate(rounds[0],wrong).correct,false);
});
