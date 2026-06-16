import { test as setup } from '@playwright/test';
import { mkdir } from 'fs/promises';
import path from 'path';
import { LoginPage } from '../../pages/LoginPage.js';

const authFile = 'playwright/.auth/user.json';

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
  await mkdir(path.dirname(authFile), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    process.env.TEST_EMAIL || '',
    process.env.TEST_PASSWORD || ''
  );

  // Confirm we landed in the app
  await page.waitForURL(/\/app\//, { timeout: 90000, waitUntil: 'domcontentloaded' });

  // Warm up sub-path routes to capture their cookies
  for (const route of WARM_UP_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
  }

  await page.context().storageState({ path: authFile });
});
