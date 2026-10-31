const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('anonymous telemetry is opt-in and uses only coarse learning events', () => {
  const script = fs.readFileSync(path.join(root, 'telemetry.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotThrow(() => new vm.Script(script, { filename: 'telemetry.js' }));
  assert.match(script, /localStorage\.getItem\(CONSENT_KEY\) === 'yes'/);
  assert.match(script, /window\.addEventListener\('unhandledrejection'/);
  assert.match(script, /'return_day_2'/);
  assert.match(script, /'first_session_complete'/);
  assert.match(script, /'return_day_7'/);
  assert.match(script, /'section_open'/);
  assert.match(script, /startVitals\(\)/);
  assert.match(script, /observe\('largest-contentful-paint'/);
  assert.match(script, /observe\('layout-shift'/);
  assert.match(script, /observe\('event'/);
  assert.match(script, /durationThreshold: 40/);
  assert.match(script, /clsSessionValue/);
  assert.match(script, /send\('web_vital', 'performance'/);
  assert.match(script, /\['LCP', 'CLS', 'INP'\]/);
  assert.match(script, /window\.addEventListener\('pagehide', reportVitals\)/);
  const telemetrySql = fs.readFileSync(path.join(root, 'supabase-telemetry.sql'), 'utf8');
  assert.match(telemetrySql, /'web_vital'/);
  assert.match(telemetrySql, /drop constraint if exists epiphany_telemetry_event_name_check/i);
  assert.match(html, /id="anonymous-telemetry"/);
  assert.doesNotMatch(script, /\.from\(['"]player_progress['"]\)/);
  assert.doesNotMatch(script, /safeDetails\.message = String\(details\.message/);
  assert.doesNotMatch(script, /details:\s*\{[^}]*answer/i);
});
