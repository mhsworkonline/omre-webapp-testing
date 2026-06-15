// @ts-check
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

// Timestamp appended to every output file so runs are never overwritten.
// Format: YYYY-MM-DD_HH-MM-SS in local time  e.g. 2026-06-12_01-14-00
const _d = new Date();
const ts = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}_${String(_d.getHours()).padStart(2,'0')}-${String(_d.getMinutes()).padStart(2,'0')}-${String(_d.getSeconds()).padStart(2,'0')}`;

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/example.spec.js', '**/discover-modules.spec.js', '**/omre-recording.spec.js', '**/omre-explore.spec.js'],
  outputDir: `test-results/${ts}/artifacts`,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html',  { outputFolder: `playwright-report/${ts}`, open: 'never' }],
    ['list'],
    ['json',  { outputFile: `test-results/${ts}.json` }],
    ['junit', { outputFile: `test-results/${ts}.xml` }],
    ['blob',  { outputDir: 'blob-report' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'https://app.omre.ai',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // auth project: only the login/setup specs (no storageState needed)
    {
      name: 'auth',
      testMatch: /tests[\\/]auth[\\/].*/,
    },
    // Default browser projects — pick up everything else (smoke, home, social, etc.)
    // Tests that need a session include test.use({ storageState }) themselves.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

