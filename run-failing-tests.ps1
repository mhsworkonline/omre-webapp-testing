Set-Location "C:\claude-folder\webapp-testing\omre-webapp"
npx playwright test --last-failed --project=chromium --workers=8
