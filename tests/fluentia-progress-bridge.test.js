const test = require('node:test');
const assert = require('node:assert/strict');
const Bridge = require('../fluentia-progress-bridge.js');

test('legacy review snapshot preserves saved words and mistake signals without exposing mutable state', () => {
  const state = {
    review:[{word:'borrow',errors:2}],
    words:[['borrow','to use and return']],
    mistakeTrapErrors:{articles:3},
    mistakeQuestionErrors:{'q-1':2},
    adaptiveSignals:{vocabulary:{attempts:4,errors:1}},
    fluentiaHistory:[{eventId:'s:0',correct:false}],
    fluentiaReviewState:{'vocabulary:q-1':{mastered:false}}
  };
  const bridge = Bridge.createBridge(() => state);
  const snapshot = bridge.getReviewSnapshot();
  assert.deepEqual(snapshot.review, state.review);
  assert.deepEqual(snapshot.words, state.words);
  assert.deepEqual(snapshot.mistakeTrapErrors, state.mistakeTrapErrors);
  assert.deepEqual(snapshot.fluentiaHistory, state.fluentiaHistory);
  assert.deepEqual(snapshot.fluentiaReviewState, state.fluentiaReviewState);
  snapshot.review[0].word = 'changed';
  snapshot.mistakeTrapErrors.articles = 99;
  snapshot.fluentiaHistory[0].eventId = 'changed';
  snapshot.fluentiaReviewState['vocabulary:q-1'].mastered = true;
  assert.equal(state.review[0].word, 'borrow');
  assert.equal(state.mistakeTrapErrors.articles, 3);
  assert.equal(state.fluentiaHistory[0].eventId, 's:0');
  assert.equal(state.fluentiaReviewState['vocabulary:q-1'].mastered, false);
});

test('Fluentia result projection retains legacy activity, item, level and error attribution', () => {
  const bridge = Bridge.createBridge(() => ({}));
  const projected = bridge.toLegacyResult({
    eventId:'session-1:0',sessionId:'session-1',itemId:'item-7',
    activityId:'sentence-studio-common-mistakes',sourceActivityId:'mistakes',
    level:'B1',correct:false,errorType:'articles',skill:'error-recognition',
    domain:'sentence-studio',answeredAt:'2026-11-07T10:00:00.000Z'
  });
  assert.deepEqual(projected, {
    source:'fluentia',game:'mistakes',questionId:'item-7',level:'B1',
    correct:false,trap:'articles',skill:'error-recognition',domain:'sentence-studio',
    activityId:'sentence-studio-common-mistakes',sessionId:'session-1',
    eventId:'session-1:0',answeredAt:'2026-11-07T10:00:00.000Z'
  });
});

test('bridge rejects incomplete result events instead of fabricating progress', () => {
  const bridge = Bridge.createBridge(() => ({}));
  assert.throws(() => bridge.toLegacyResult({correct:1}), /normalized Fluentia result event/);
});

test('bridge persists normalized events idempotently without changing XP or legacy review state', () => {
  const state = {xp:125,review:[{word:'borrow',errors:2}],fluentiaHistory:[]};
  let writes=0;
  const bridge=Bridge.createBridge(()=>state,history=>{state.fluentiaHistory=history;writes++;});
  const event={
    eventId:'session-2:1',sessionId:'session-2',itemId:'q-2',
    activityId:'soundscape-dictation-bank',sourceActivityId:'soundscape-dictation',
    level:'C1',correct:false,errorType:'dictation-transcription',skill:'listening-transcription',
    domain:'soundscape',answeredAt:'2026-11-07T11:00:00.000Z'
  };
  const first=bridge.recordEvent(event);
  assert.equal(first.stored,true);
  assert.equal(writes,1);
  assert.equal(state.fluentiaHistory[0].game,'soundscape-dictation');
  assert.equal(state.fluentiaHistory[0].questionId,'q-2');
  assert.equal(state.xp,125);
  assert.deepEqual(state.review,[{word:'borrow',errors:2}]);
  const second=bridge.recordEvent(event);
  assert.equal(second.stored,false);
  assert.equal(second.duplicate,true);
  assert.equal(writes,1);
  assert.equal(bridge.getHistory().length,1);
});

test('bridge history is bounded and rejects events without stable attribution', () => {
  const state={fluentiaHistory:[]};
  const bridge=Bridge.createBridge(()=>state,history=>{state.fluentiaHistory=history;});
  assert.throws(()=>bridge.recordEvent({correct:true}),/stable attribution fields/);
  for(let i=0;i<510;i++) bridge.recordEvent({
    eventId:'bounded:'+i,sessionId:'bounded',itemId:'item-'+i,
    activityId:'wordcraft-vocabulary',sourceActivityId:'vocabulary',
    level:'A1',correct:true,domain:'wordcraft',answeredAt:'2026-11-07T11:00:00.000Z'
  });
  assert.equal(bridge.getHistory().length,500);
  assert.equal(bridge.getHistory()[0].eventId,'bounded:10');
});
