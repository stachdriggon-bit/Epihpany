const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Vercel deployment excludes project-only files and sends baseline security headers', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const headers = config.headers?.find(entry => entry.source === '/(.*)')?.headers || [];
  const values = Object.fromEntries(headers.map(header => [header.key.toLowerCase(), header.value]));

  assert.equal(values['x-content-type-options'], 'nosniff');
  assert.equal(values['x-frame-options'], 'DENY');
  assert.equal(values['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(values['strict-transport-security'], 'max-age=31536000');
  assert.match(values['content-security-policy'] || '', /frame-ancestors 'none'/);
  assert.match(values['content-security-policy'] || '', /object-src 'none'/);
  assert.match(values['content-security-policy'] || '', /base-uri 'self'/);

  const ignore = fs.readFileSync(path.join(root, '.vercelignore'), 'utf8');
  for (const pattern of ['tests', '.github', 'node_modules', '*.test.js', '*.md', '*.sql', 'browser-smoke.js']) {
    assert.ok(ignore.split(/\r?\n/).includes(pattern), 'deployment ignore list should include ' + pattern);
  }

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\.119\.0/);
  assert.doesNotMatch(html, /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2(["/])/);
});
