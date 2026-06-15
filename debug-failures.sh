#!/bin/bash
# Runs the 3 problem files and prints compact failure details.
# Usage: bash debug-failures.sh

OUTPUT=$(npx playwright test \
  tests/flows/social.flow.spec.js \
  tests/platform/omni-ai.spec.js \
  tests/social/messages.spec.js \
  --project=chromium \
  --workers=1 \
  --reporter=line \
  2>&1)

echo "=== SUMMARY ==="
echo "$OUTPUT" | grep -E "^\s*[0-9]+ (passed|failed|skipped)"

echo ""
echo "=== FAILURES (test name + first error line) ==="
echo "$OUTPUT" | awk '
  /^  [0-9]+\) / { block=1; printf "\n--- "; print; next }
  block && /Error:|expect\(|received|Target page|browser has been closed|isClosed|test\.skip|beforeEach failed/ {
    print "    "$0; block=0
  }
  block && /^  [0-9]+\) / { block=1; printf "\n--- "; print; next }
'
