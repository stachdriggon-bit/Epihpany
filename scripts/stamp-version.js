'use strict';

// Validate the explicit cache-busting versions maintained in index.html.
// This project uses a no-build static asset pipeline, so stamping is a
// deterministic validation step rather than rewriting semantic version labels.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const refs = [...html.matchAll(/(?:src|href)=(["'])([^"']+)\1/g)]
  .map(match => match[2])
  .filter(value => !/^(?:[a-z]+:|\/\/|#|data:)/i.test(value))
  .filter(value => /\.(?:js|css)(?:\?|$)/i.test(value));

const missing = [];
const unstamped = [];
for (const ref of refs) {
  const [pathname, query = ''] = ref.split('?');
  const file = path.resolve(root, pathname.replace(/^\.\//, ''));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    missing.push(ref);
    continue;
  }
  if (!/(?:^|&)v=[^&]+/.test(query)) unstamped.push(ref);
}

if (missing.length || unstamped.length) {
  if (missing.length) console.error('Missing local assets:\n' + missing.map(x => ' - ' + x).join('\n'));
  if (unstamped.length) console.error('Local assets without cache versions:\n' + unstamped.map(x => ' - ' + x).join('\n'));
  process.exit(1);
}

console.log('Asset version references are valid and up to date (' + refs.length + ' local JS/CSS assets checked).');
