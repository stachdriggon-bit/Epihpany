const { test } = require('node:test');
const assert = require('node:assert/strict');
const Fluentia = require('../fluentia-engine.js');

function fixture() {
  let tick = 0;
  let randomValue = 0;
  const progress = [];
  const engine = Fluentia.createEngine({ clock: () => 1794000000000 + tick++, random: () => randomValue });
  const makeItems = (prefix, levels = ['A1', 'A1', 'A2']) => levels.map((level, i) => ({
    id: prefix + '-' + i, level, prompt: 'Prompt ' + i, skill: 'reading'
  }));
  engine.registerActivity({
    id: 'word-pick', domain: 'wordcraft', interactionType: 'choice', skills: ['vocabulary'],
    getItems: ({ level }) => makeItems('word', ['A1', 'A1', 'A2']).filter(item => item.level === level),
    evaluate: (item, answer) => ({ correct: answer === item.id, errorType: answer === item.id ? null : 'meaning' }),
    getFeedback: (item, answer, result) => ({ explanation: result.correct ? 'Correct' : 'Try again' }),
    onProgress: event => progress.push(event)
  });
  engine.registerActivity({
    id: 'word-type', domain: 'wordcraft', interactionType: 'typed', skills: ['spelling'],
    getItems: ({ level }) => makeItems('typed', ['A1', 'A1']).filter(item => item.level === level),
    evaluate: (item, answer) => ({ correct: String(answer).trim().toLowerCase() === item.id })
  });
  engine.registerActivity({
    id: 'text-read', domain: 'textwise', interactionType: 'choice', skills: ['reading'],
    getItems: ({ level }) => makeItems('text', ['A1', 'A1']).filter(item => item.level === level),
    evaluate: (item, answer) => ({ correct: answer === item.id })
  });
  return { engine, progress };
}

test('exports stable domains, CEFR levels and interaction contracts', () => {
  assert.deepEqual(Fluentia.domains, ['wordcraft', 'sentence-studio', 'textwise', 'soundscape', 'real-world', 'fine-sense']);
  assert.deepEqual(Fluentia.levels, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  assert.ok(Fluentia.interactionTypes.includes('map'));
  assert.ok(Fluentia.interactionTypes.includes('speech'));
});

test('registers valid adapters and rejects malformed or duplicate definitions', () => {
  const { engine } = fixture();
  assert.equal(engine.listActivities().length, 3);
  assert.throws(() => engine.registerActivity({ id: 'bad', domain: 'unknown', interactionType: 'choice', getItems() {}, evaluate() {} }),
    error => error.code === Fluentia.errorCodes.INVALID_ADAPTER);
  assert.throws(() => engine.registerActivity({ id: 'word-pick', domain: 'wordcraft', interactionType: 'choice', getItems() {}, evaluate() {} }),
    error => error.code === Fluentia.errorCodes.INVALID_ADAPTER);
});

test('single activity sessions filter strictly by CEFR and preserve interaction identity', () => {
  const { engine } = fixture();
  const session = engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'A2', itemCount: 1 });
  assert.deepEqual(session.activityIds, ['word-pick']);
  const next = engine.selectNext(session);
  assert.equal(next.item.level, 'A2');
  assert.equal(next.interactionType, 'choice');
  assert.equal(next.domain, 'wordcraft');
});

test('Section Mixed is domain-scoped and Fluentia Mix spans registered domains', () => {
  const { engine } = fixture();
  const section = engine.createSession({ mode: 'section-mixed', domain: 'wordcraft', level: 'A1' });
  assert.deepEqual(new Set(section.activityIds), new Set(['word-pick', 'word-type']));
  const global = engine.createSession({ mode: 'fluentia-mix', level: 'A1' });
  assert.deepEqual(new Set(global.activityIds), new Set(['word-pick', 'word-type', 'text-read']));
});

test('mixed selection balances eligible activity types and avoids consecutive same activity where possible', () => {
  const { engine } = fixture();
  const session = engine.createSession({ mode: 'section-mixed', domain: 'wordcraft', level: 'A1', itemCount: 4 });
  const first = engine.selectNext(session);
  engine.submitAnswer(session, first.item.id);
  const second = engine.selectNext(session);
  assert.notEqual(second.activityId, first.activityId);
  engine.submitAnswer(session, second.item.id);
  const third = engine.selectNext(session);
  assert.ok(third);
  assert.equal(session.completedCount, 2);
});

test('answer events retain domain, skill, activity, CEFR and error attribution', () => {
  const { engine, progress } = fixture();
  const session = engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'A1', itemCount: 1 });
  const current = engine.selectNext(session);
  const event = engine.submitAnswer(session, 'wrong');
  assert.equal(event.activityId, 'word-pick');
  assert.equal(event.domain, 'wordcraft');
  assert.equal(event.skill, 'reading');
  assert.equal(event.level, 'A1');
  assert.equal(event.correct, false);
  assert.equal(event.errorType, 'meaning');
  assert.equal(progress.length, 1);
  assert.equal(session.status, 'completed');
});

test('session lifecycle supports pause, resume, completion and abandon', () => {
  const { engine } = fixture();
  const session = engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'A1', itemCount: 2 });
  engine.selectNext(session);
  engine.pauseSession(session);
  assert.equal(session.status, 'paused');
  engine.resumeSession(session);
  assert.equal(session.status, 'active');
  engine.submitAnswer(session, 'wrong');
  engine.pauseSession(session);
  engine.resumeSession(session);
  assert.equal(session.status, 'ready');
  engine.abandonSession(session);
  assert.equal(session.status, 'abandoned');
});

test('serializes and restores an active session without losing its current item or history', () => {
  const { engine } = fixture();
  const session = engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'A1', itemCount: 3 });
  const current = engine.selectNext(session);
  engine.submitAnswer(session, 'wrong');
  engine.selectNext(session);
  const restored = engine.restoreSession(engine.serializeSession(session));
  assert.equal(restored.id, session.id);
  assert.equal(restored.completedCount, 1);
  assert.equal(restored.current.item.id, session.current.item.id);
  assert.equal(restored.answers.length, 1);
});

test('no eligible pool and exhausted content finish safely without inventing items', () => {
  const { engine } = fixture();
  assert.throws(() => engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'C2' }),
    error => error.code === Fluentia.errorCodes.NO_ELIGIBLE_ITEMS);
  const session = engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'A1', itemCount: 10 });
  let count = 0;
  while (session.status !== 'completed') {
    const current = engine.selectNext(session);
    if (!current) break;
    engine.submitAnswer(session, current.item.id);
    count++;
  }
  assert.equal(count, 2);
  assert.equal(session.status, 'completed');
});

test('rejects invalid item levels and invalid evaluator results with explicit error codes', () => {
  const engine = Fluentia.createEngine();
  engine.registerActivity({
    id: 'untagged-item', domain: 'textwise', interactionType: 'choice',
    getItems: () => [{ id: 'legacy', prompt: 'No CEFR tag' }],
    evaluate: () => ({ correct: true })
  });
  assert.throws(() => engine.createSession({ mode: 'single', activityId: 'untagged-item', level: 'A1' }),
    error => error.code === Fluentia.errorCodes.NO_ELIGIBLE_ITEMS);
  const malformed = Fluentia.createEngine();
  malformed.registerActivity({
    id: 'bad-item', domain: 'textwise', interactionType: 'choice',
    getItems: () => [{ level: 'A1', prompt: 'Missing stable id' }],
    evaluate: () => ({ correct: true })
  });
  assert.throws(() => malformed.createSession({ mode: 'single', activityId: 'bad-item', level: 'A1' }),
    error => error.code === Fluentia.errorCodes.INVALID_ITEM);
  const other = Fluentia.createEngine();
  other.registerActivity({
    id: 'bad-eval', domain: 'textwise', interactionType: 'choice',
    getItems: () => [{ id: 'x', level: 'A1' }],
    evaluate: () => ({ result: 'correct' })
  });
  const s = other.createSession({ mode: 'single', activityId: 'bad-eval', level: 'A1' });
  other.selectNext(s);
  assert.throws(() => other.submitAnswer(s, 'x'), error => error.code === 'FLUENTIA_INVALID_EVALUATION');
});

test('rejects malformed session snapshots and prevents answers without an active prompt', () => {
  const { engine } = fixture();
  assert.throws(() => engine.restoreSession('{bad json'), error => error.code === Fluentia.errorCodes.INVALID_SNAPSHOT);
  const session = engine.createSession({ mode: 'single', activityId: 'word-pick', level: 'A1' });
  assert.throws(() => engine.submitAnswer(session, 'x'), error => error.code === Fluentia.errorCodes.SESSION_NOT_ACTIVE);
});


function balancedFixture() {
  let randomValue = 0;
  const engine = Fluentia.createEngine({ random: () => randomValue });
  const domains = Fluentia.domains;
  domains.forEach((domain, domainIndex) => {
    const activityCount = domain === 'wordcraft' ? 3 : 1;
    for (let activityIndex = 0; activityIndex < activityCount; activityIndex++) {
      const id = domain + '-activity-' + activityIndex;
      engine.registerActivity({
        id, domain, interactionType: activityIndex % 2 ? 'typed' : 'choice',
        getItems: ({level}) => Array.from({length: 12}, (_, index) => ({
          id: id + '-item-' + index, level, sourceActivityId: id
        })),
        evaluate: () => ({correct:true})
      });
    }
  });
  return engine;
}

test('Fluentia Mix balances all eligible domains before balancing activities within a domain', () => {
  const engine = balancedFixture();
  const session = engine.createSession({mode:'fluentia-mix',level:'B1',itemCount:12});
  const domains = {};
  const activities = {};
  while (session.status !== 'completed') {
    const current = engine.selectNext(session);
    if (!current) break;
    domains[current.domain] = (domains[current.domain] || 0) + 1;
    activities[current.activityId] = (activities[current.activityId] || 0) + 1;
    engine.submitAnswer(session, current.item.id);
  }
  assert.deepEqual(Object.values(domains).sort((a,b)=>a-b), [2,2,2,2,2,2]);
  const wordcraftCounts = Object.entries(activities).filter(([id])=>id.startsWith('wordcraft-')).map(([,count])=>count);
  assert.ok(Math.max(...wordcraftCounts) - Math.min(...wordcraftCounts) <= 1);
});

test('Section Mixed balances activities inside its domain and never leaks another domain', () => {
  const engine = balancedFixture();
  const session = engine.createSession({mode:'section-mixed',domain:'wordcraft',level:'A2',itemCount:9});
  const counts = {};
  while (session.status !== 'completed') {
    const current = engine.selectNext(session);
    if (!current) break;
    assert.equal(current.domain,'wordcraft');
    assert.equal(current.item.level,'A2');
    counts[current.activityId] = (counts[current.activityId] || 0) + 1;
    engine.submitAnswer(session,current.item.id);
  }
  assert.deepEqual(Object.values(counts).sort((a,b)=>a-b),[3,3,3]);
});

test('mixed sessions deduplicate the same source item exposed by multiple adapters', () => {
  const engine = Fluentia.createEngine({random:()=>0});
  const shared = {id:'shared-question',level:'A1',sourceActivityId:'one-canonical-bank'};
  ['shared-a','shared-b'].forEach(id=>engine.registerActivity({
    id,domain:'textwise',interactionType:'choice',
    getItems:()=>[shared],evaluate:()=>({correct:true})
  }));
  const session = engine.createSession({mode:'section-mixed',domain:'textwise',level:'A1',itemCount:5});
  const first = engine.selectNext(session);
  engine.submitAnswer(session,first.item.id);
  assert.equal(engine.selectNext(session),null);
  assert.equal(session.status,'completed');
  assert.equal(session.completedCount,1);
});

test('Fluentia Mix falls back to remaining domains when a sparse domain is exhausted', () => {
  const engine = Fluentia.createEngine({random:()=>0});
  engine.registerActivity({
    id:'sparse-word',domain:'wordcraft',interactionType:'choice',
    getItems:()=>[{id:'only-word',level:'C1'}],evaluate:()=>({correct:true})
  });
  engine.registerActivity({
    id:'rich-text',domain:'textwise',interactionType:'choice',
    getItems:()=>Array.from({length:3},(_,i)=>({id:'text-'+i,level:'C1'})),
    evaluate:()=>({correct:true})
  });
  const session=engine.createSession({mode:'fluentia-mix',level:'C1',itemCount:4});
  let count=0;
  while(session.status!=='completed'){
    const current=engine.selectNext(session);
    if(!current) break;
    assert.equal(current.item.level,'C1');
    engine.submitAnswer(session,current.item.id);
    count++;
  }
  assert.equal(count,4);
  assert.equal(session.status,'completed');
  assert.equal(session.domainUse.wordcraft,1);
  assert.equal(session.domainUse.textwise,3);
});
