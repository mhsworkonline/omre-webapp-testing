#!/bin/bash
# Usage: bash debug-failures.sh

npx playwright test \
  tests/flows/social.flow.spec.js \
  tests/platform/omni-ai.spec.js \
  tests/social/messages.spec.js \
  --project=chromium \
  --workers=1 \
  --reporter=json \
  2>/dev/null \
  | node -e "
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  const r = JSON.parse(Buffer.concat(chunks));
  const failed = r.suites.flatMap(s => s.specs || [])
    .flatMap(sp => sp.tests || [])
    .filter(t => t.results.some(res => res.status === 'failed'));
  console.log('TOTAL passed:', r.stats.expected, '| failed:', r.stats.unexpected, '| skipped:', r.stats.skipped);
  console.log('');
  failed.forEach(t => {
    console.log('FAIL:', t.title);
    const err = t.results.find(r => r.status === 'failed');
    if (err && err.error) {
      const msg = err.error.message || '';
      console.log('  ', msg.split('\n').slice(0,3).join(' | '));
    }
    console.log('');
  });
});
"
