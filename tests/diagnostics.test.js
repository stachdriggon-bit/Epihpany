const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'diagnostics.js'), 'utf8');

function createDiagnostics({ developer = true } = {}) {
  const listeners = {};
  const workerListeners = {};
  const messages = [];
  const downloads = [];
  const classes = {};
  const window = {
    EpiphanyAuth: { isDeveloper: () => developer },
    navigator: {
      serviceWorker: {
        controller: { postMessage: message => messages.push(message) },
        addEventListener: (name, fn) => { workerListeners[name] = fn; }
      }
    },
    addEventListener: (name, fn) => { listeners[name] = fn; },
    URL: {
      createObjectURL: () => 'blob:diagnostics',
      revokeObjectURL: url => downloads.push(['revoke', url])
    }
  };
  const document = {
    body: { appendChild: node => downloads.push(['append', node]), },
    createElement: tag => ({
      tagName: tag,
      click: () => downloads.push(['click']),
      remove: () => downloads.push(['remove'])
    })
  };
  const context = vm.createContext({
    window, document, Object, Set, Date, Number, String, Math, JSON, Blob,
    Promise
  });
  vm.runInContext(source, context);
  return { api: window.EPIPHANY_DIAGNOSTICS, window, listeners, workerListeners, messages, downloads, setDeveloper: value => { developer = value; } };
}

test('diagnostics is dormant by default and does not persist or transmit logs', () => {
  const result = createDiagnostics();
  assert.ok(result.api);
  assert.equal(result.api.isActive(), false);
  assert.equal(result.api.record('load_failed', { asset: 'secret.js' }), false);
  assert.equal(result.api.getSnapshot().count, 0);
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|fetch|XMLHttpRequest|sendBeacon|supabase)\b/i);
  assert.equal(result.messages.length, 0);
});

test('diagnostics requires developer authorization and starts an explicit local session', () => {
  const denied = createDiagnostics({ developer: false });
  assert.equal(denied.api.start(), false);
  assert.equal(denied.api.isActive(), false);
  assert.equal(denied.messages.length, 0);

  const allowed = createDiagnostics();
  assert.equal(allowed.api.start(), true);
  assert.equal(allowed.api.isActive(), true);
  assert.equal(allowed.messages[0].type, 'EPIPHANY_DIAGNOSTICS_START');
  assert.equal(allowed.api.getSnapshot().events[0].type, 'session_started');
});

test('diagnostics allowlists fields, strips query strings and never stores raw error details', () => {
  const { api } = createDiagnostics();
  api.start();
  api.record('load_failed', {
    group: 'expansionGrammar',
    asset: '/data-expansion-grammar.js?v=secret-token',
    outcome: 'network_error',
    message: 'private learner answer',
    stack: 'private stack trace',
    email: 'person@example.com'
  });
  const event = api.getSnapshot().events.at(-1);
  assert.equal(event.asset, 'data-expansion-grammar.js');
  assert.equal(event.group, 'expansionGrammar');
  assert.equal(event.outcome, 'network_error');
  assert.equal('message' in event, false);
  assert.equal('stack' in event, false);
  assert.equal('email' in event, false);
  assert.doesNotMatch(JSON.stringify(event), /secret-token|private learner answer|person@example/);
});

test('diagnostics receives service-worker cache outcomes only during an active session', () => {
  const { api, workerListeners } = createDiagnostics();
  workerListeners.message({ data: { type: 'EPIPHANY_DIAGNOSTIC_EVENT', event: { asset: 'file.js', outcome: 'offline_miss' } } });
  assert.equal(api.getSnapshot().count, 0);
  api.start();
  workerListeners.message({ data: { type: 'EPIPHANY_DIAGNOSTIC_EVENT', event: { asset: '/file.js?v=1', outcome: 'cache_fallback_exact' } } });
  const event = api.getSnapshot().events.at(-1);
  assert.equal(event.type, 'cache_result');
  assert.equal(event.asset, 'file.js');
  assert.equal(event.outcome, 'cache_fallback_exact');
});

test('diagnostics keeps at most 200 events and stops collection immediately', () => {
  const { api, messages } = createDiagnostics();
  api.start();
  for (let i = 0; i < 240; i++) api.record('load_succeeded', { asset: 'bank-' + i + '.js', durationMs: i });
  const snapshot = api.getSnapshot();
  assert.equal(snapshot.count, 200);
  assert.equal(snapshot.events[0].asset, 'bank-40.js');
  assert.equal(api.stop(), true);
  assert.equal(messages.at(-1).type, 'EPIPHANY_DIAGNOSTICS_STOP');
  assert.equal(api.record('load_succeeded', { asset: 'after-stop.js' }), false);
  assert.equal(api.getSnapshot().count, 200);
});

test('diagnostics clear and export only sanitized in-memory events', () => {
  const { api, downloads } = createDiagnostics();
  api.start();
  api.record('retry_started', { group: 'data-group:world', attempt: 2 });
  assert.equal(api.exportJson(), true);
  assert.ok(downloads.some(item => item[0] === 'click'));
  assert.equal(api.clear(), true);
  assert.equal(api.getSnapshot().count, 0);
});


test('diagnostics immediately stops and unregisters its worker client when developer access is revoked', () => {
  const { api, messages, setDeveloper } = createDiagnostics();
  api.start();
  setDeveloper(false);
  assert.equal(api.record('load_failed', { asset: 'secret.js' }), false);
  assert.equal(api.isActive(), false);
  assert.equal(messages.at(-1).type, 'EPIPHANY_DIAGNOSTICS_STOP');
  assert.equal(api.getSnapshot().events.some(event => event.asset === 'secret.js'), false);
});
