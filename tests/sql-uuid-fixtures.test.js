const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sqlTestsRoot = path.join(root, 'supabase', 'tests');

function collectSqlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSqlFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.sql') ? [fullPath] : [];
  });
}

test('SQL test fixtures contain only valid hexadecimal UUID literals', () => {
  const candidatePattern = /['"]([A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12})['"]/g;
  const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  const failures = [];

  for (const file of collectSqlFiles(sqlTestsRoot)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(candidatePattern)) {
      if (!uuidPattern.test(match[1])) {
        const line = source.slice(0, match.index).split('\\n').length;
        failures.push(`${path.relative(root, file)}:${line} contains invalid UUID "${match[1]}"`);
      }
    }
  }

  assert.deepEqual(failures, [], failures.join('\\n'));
});
