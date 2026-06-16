#!/bin/bash
# Usage: bash debug-failures.sh

# Step 1: check auth file exists
if [ ! -f "playwright/.auth/user.json" ]; then
  echo "ERROR: Auth file missing — run: npx playwright test tests/auth/auth.setup.js --project=auth"
  exit 1
fi
echo "Auth file found."

# Step 2: run tests with json reporter, save raw json
npx playwright test \
  tests/flows/social.flow.spec.js \
  tests/platform/omni-ai.spec.js \
  tests/social/messages.spec.js \
  --project=chromium \
  --workers=1 \
  --reporter=json \
  2>/dev/null > /tmp/pw-results.json

echo "Exit code: $?"

# Step 3: parse with node — flatten nested suites recursively
node -e "
const r = JSON.parse(require('fs').readFileSync('/tmp/pw-results.json'));
const s = r.stats;
console.log('passed:', s.expected, '| failed:', s.unexpected, '| skipped:', s.skipped);

function getTests(suite) {
  const tests = (suite.specs || []).flatMap(sp => (sp.tests || []).map(t => ({
    title: sp.title,
    file: suite.title,
    results: t.results
  })));
  return tests.concat((suite.suites || []).flatMap(getTests));
}

const all = (r.suites || []).flatMap(getTests);
const failed = all.filter(t => t.results.some(res => res.status === 'failed'));
console.log('');
failed.slice(0, 30).forEach(t => {
  const err = t.results.find(res => res.status === 'failed');
  const msg = (err && err.error && err.error.message || 'no message').split('\n').slice(0,2).join(' | ');
  console.log('FAIL [' + t.file + '] ' + t.title);
  console.log('  ERR:', msg);
  console.log('');
});
if (failed.length > 30) console.log('... and', failed.length - 30, 'more failures');
"
