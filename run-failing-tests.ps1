Set-Location $PSScriptRoot
npx playwright test --last-failed --project=chromium --workers=8
