import { test as setup } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import path from 'path';
import { LoginPage } from '../../pages/LoginPage.js';

const authFile = 'playwright/.auth/user.json';
const SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Routes with different path prefixes — visit them before saving storageState
// so their session cookies are captured alongside /app/* cookies.
const WARM_UP_ROUTES = [
  'https://omre.ai/app/reputation',
  'https://omre.ai/app/digital-citizen',
  'https://omre.ai/jobs/home',
  'https://omre.ai/learn/home',
];

setup.setTimeout(120000);

setup('authenticate', async ({ page }) => {
  if (existsSync(authFile)) {
    const age = Date.now() - statSync(authFile).mtimeMs;
    if (age < SESSION_TTL_MS) {
      console.log(`Auth session valid (${Math.round(age / 60000)}m old) — skipping re-login`);
      return;
    }
  }

  const { TEST_EMAIL, TEST_PASSWORD } = process.env;
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error(
      'TEST_EMAIL and/or TEST_PASSWORD are not set. Create a .env file in the web/ ' +
      'directory (see .env.example) before running the auth setup.'
    );
  }

  await mkdir(path.dirname(authFile), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_EMAIL, TEST_PASSWORD);

  // Confirm we landed in the app
  await page.waitForURL(/\/app\//, { timeout: 90000, waitUntil: 'domcontentloaded' });

  // Warm up sub-path routes to capture their cookies
  for (const route of WARM_UP_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
  }

  await page.context().storageState({ path: authFile });
});
