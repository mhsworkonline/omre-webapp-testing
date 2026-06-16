OMRE WEBAPP — PLAYWRIGHT TEST SUITE
=====================================
A plain-English guide for running the automated tests on omre.ai.
No technical background needed — just follow the steps in order.


BEFORE YOU START (one-time setup)
-----------------------------------
Make sure you have a file called ".env" in this folder with these two lines:

  TEST_EMAIL=w4f01@web-library.net
  TEST_PASSWORD=H@ppy7878

If the file is missing, create it. Without it, the tests cannot log in.


STEP 1 — CHECK THE SERVER IS UP
---------------------------------
Before running any tests, confirm the website is responding:

  curl.exe https://omre.ai --max-time 10

If you see a wall of HTML text, the server is up — proceed to Step 2.
If you see "502 Bad Gateway" or a Cloudflare error, stop and wait.
The server being down will cause tests to fail — it is not a test problem.


STEP 2 — LOG IN (auth setup)
------------------------------
Run this once before every fresh test session, or whenever you get
"session expired" errors:

  npx playwright test tests/auth/auth.setup.js --project=auth

Wait for it to finish. It should print "1 passed". If it fails, check
that the server is up (Step 1) and the .env file exists.


STEP 3 — RUN ALL TESTS
------------------------
This runs the full test suite (~1900 tests) across all modules:

  npx playwright test --project=chromium --workers=8

On a 12-core machine this takes about 1 hour.
On a slower machine, reduce workers: --workers=4 (about 1.5 hours).

You will see tests scrolling by. At the end it prints a summary like:
  1504 passed, 19 failed, 409 skipped


STEP 4 — RE-RUN ONLY THE FAILED TESTS
----------------------------------------
After the full run finishes, run this to retry only what failed:

  powershell -File run-failing-tests.ps1

This is much faster (a few minutes). Most failures caused by the server
being briefly slow will pass on the second try.

Run this a second time if some still fail — transient failures clear up
within 2-3 attempts. If the same tests keep failing every time, they are
real bugs that need investigation.


STEP 5 — GENERATE THE EXCEL REPORT
-------------------------------------
After you are happy with the results (Steps 3 + 4 both done), run:

  node merge-results.js

This combines the full run and the re-run into a single Excel file saved at:

  test-results\<timestamp>_merged.xlsx

Open that file in Excel. It has two tabs:
  - Summary   : pass/fail/skip count per module
  - All Tests : every individual test with its result and any error message


WHAT THE RESULTS MEAN
----------------------
  PASS  — test completed successfully
  FAIL  — test found a problem (see Remarks column in Excel for details)
  SKIP  — feature was not visible on this test account (not a failure)

A small number of failures (~5-10) after re-runs are normal if the server
is having a bad day. Anything above that warrants investigation.


COMMON PROBLEMS
----------------
Problem : Auth setup fails immediately
Fix     : Check server is up (Step 1). Check .env file exists.

Problem : 50+ tests fail in the full run
Fix     : Almost always means the server was down. Wait and re-run.

Problem : Same test fails every single run
Fix     : Likely a real bug. Note the test ID (e.g. TC-PROFILE-01)
          and report it for investigation.

Problem : "session expired" mid-run
Fix     : Re-run Step 2 (auth setup), then re-run the failed tests.

Problem : run-failing-tests.ps1 says "no previous run found"
Fix     : The full suite (Step 3) must complete at least once first
          before the retry script can work.


FILE LOCATIONS
---------------
  .env                          Login credentials
  run-failing-tests.ps1         Script to retry only failed tests
  merge-results.js              Script to merge runs and generate Excel
  generate-report.js            Script to generate Excel from latest run only
  test-results\*.json           Raw results from each run (auto-timestamped)
  test-results\*_merged.xlsx    Final combined Excel report
  playwright-report\*\          Detailed HTML report (open index.html)
  blob-report\                  Internal data used by the retry script


SPEED REFERENCE
----------------
  --workers=4   Slower machines / safe default (~1.5 hours)
  --workers=8   12-core machines — recommended (~1 hour)
  --workers=12  Not recommended — leaves no headroom for browser processes
