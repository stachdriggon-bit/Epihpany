const test = require('node:test');
const assert = require('node:assert/strict');
const Bridge = require('../fluentia-progress-bridge.js');

test('legacy review snapshot preserves saved words and mistake signals without exposing mutable state', () => {
  const state = {
    review:[{word:'borrow',errors:2}],
    words:[['borrow','to use and return']],
    mistakeTrapErrors:{articles:3},
    mistakeQuestionErrors:{'q-1':2},
    adaptiveSignals:{vocabulary:{attempts:4,errors:1}}
  };
  const bridge = Bridge.createBridge(() => state);
  const snapshot = bridge.getReviewSnapshot();
  assert.deepEqual(snapshot.review, state.review);
  assert.deepEqual(snapshot.words, state.words);
  assert.deepEqual(snapshot.mistakeTrapErrors, state.mistakeTrapErrors);
  snapshot.review[0].word = 'changed';
  snapshot.mistakeTrapErrors.articles = 99;
  assert.equal(state.review[0].word, 'borrow');
  assert.equal(state.mistakeTrapErrors.articles, 3);
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
