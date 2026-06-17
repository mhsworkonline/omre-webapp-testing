// TC-VWORLD — Virtual World (rewritten from live crawl: stub/placeholder page, no sub-routes)
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const MODULE_URL = 'https://omre.ai/app/virtual-world';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-VWORLD — Hub Landing', () => {
  test('TC-VWORLD-01: Given I am authenticated, When I navigate to /app/virtual-world, Then the URL and heading are correct', async ({ page }) => {
    await goModule(page);
    expect(page.url()).toContain('/app/virtual-world');
    await expect(page.getByRole('heading', { name: 'Virtual World', exact: true })).toBeVisible();
  });

  test('TC-VWORLD-02: Given I am on the page, When I click Back to Home, Then I land on the main home feed', async ({ page }) => {
    await goModule(page);
    await page.getByRole('link', { name: /back to home/i }).click();
    await page.waitForURL(/\/app\/home/, { timeout: 10000 });
    expect(page.url()).toContain('/app/home');
  });
});
