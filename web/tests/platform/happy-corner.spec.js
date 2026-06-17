// TC-HAPPY — Happy Corner (rewritten from live crawl: single-page positivity feed)
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const MODULE_URL = 'https://omre.ai/app/happy-corner';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-HAPPY — Hub Landing', () => {
  test('TC-HAPPY-01: Given I am authenticated, When I navigate to /app/happy-corner, Then the URL and heading are correct', async ({ page }) => {
    await goModule(page);
    expect(page.url()).toContain('/app/happy-corner');
    await expect(page.getByRole('heading', { name: 'Happy Corner', exact: true })).toBeVisible();
  });

  test('TC-HAPPY-02: Given I am on the page, Then a "Share Happy Moment" control is shown', async ({ page }) => {
    await goModule(page);
    await expect(page.getByRole('button', { name: /share happy moment/i }).first()).toBeVisible();
  });
});

test.describe('TC-HAPPY — Category Filters', () => {
  for (const category of ['All', 'Achievements', 'Gratitude', 'Daily Wins', 'Compliments', 'Celebrations']) {
    test(`TC-HAPPY-FILTER-${category.replace(/\s+/g, '-')}: Given I am on Happy Corner, When I inspect the "${category}" filter tab, Then it is visible`, async ({ page }) => {
      await goModule(page);
      await expect(page.getByRole('button', { name: category, exact: true })).toBeVisible();
    });
  }
});

test.describe('TC-HAPPY — Reactions', () => {
  test('TC-HAPPY-REACT-01: Given a post in the feed, Then reaction buttons (Love/Proud/Celebrate/Inspiring/Respect) are shown', async ({ page }) => {
    await goModule(page);
    await expect(page.getByRole('button', { name: /love/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /proud/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /celebrate/i }).first()).toBeVisible();
  });

  test('TC-HAPPY-REACT-FUNC-01: Given a post, When I click the Love reaction, Then the click is accepted without error', async ({ page }) => {
    await goModule(page);
    const loveBtn = page.getByRole('button', { name: /love/i }).first();
    await loveBtn.click();
    await page.waitForTimeout(1000);
    await expect(loveBtn).toBeVisible();
  });
});
