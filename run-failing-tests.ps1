Set-Location "C:\claude-folder\webapp-testing\omre-webapp"
npx playwright test --project=chromium --grep "TC-MOBILE-007|TC-MOBILE-008|TC-MOBILE-009" tests/responsive/mobile.spec.js
