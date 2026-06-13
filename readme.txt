OMRE WEBAPP — PLAYWRIGHT TEST SUITE
=====================================

COMMANDS
--------

1. Auth setup (run first if session expired)
   npx playwright test tests/auth/auth.setup.js --project=auth

2. Full suite
   npx playwright test --project=chromium --workers=4

3. Single file
   npx playwright test tests/auth/login.spec.js --project=chromium

4. View HTML report
   npx playwright show-report

5. Rename test descriptions to Given-When-Then format
   node rename-tests.js

6. Fix grammar bugs in test descriptions
   node fix-grammar.js


OUTPUT FILES
------------

HTML Report:
  playwright-report\index.html

Excel Report (generated after each full run):
  test-results\<timestamp>.xlsx

JSON / JUnit Results:
  test-results\


NOTES
-----
- Workers: use --workers=4 for ~75% speed improvement
- If session expires mid-run, re-run auth setup then retry
- TC-AUTH-10 and TC-AUTH-26 are intentionally skipped (app does not implement those flows)
