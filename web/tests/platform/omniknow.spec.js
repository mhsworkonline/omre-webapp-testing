// TC-OMNIKNOW — World Knowledge Library (rewritten from live crawl)
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goto(page, path) {
  await page.goto(`https://omre.ai${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-OMNIKNOW — Hub Landing', () => {
  test('TC-OMNIKNOW-01: Given I am authenticated, When I navigate to /app/omniknow, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/omniknow');
    expect(page.url()).toContain('/app/omniknow');
    await expect(page.getByRole('heading', { name: /world knowledge library/i })).toBeVisible();
  });

  test('TC-OMNIKNOW-02: Given I am on the hub, Then the OmniSearch box and explore CTAs are shown', async ({ page }) => {
    await goto(page, '/app/omniknow');
    await expect(page.getByPlaceholder(/ask the omnisearch engine/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start exploring/i })).toBeVisible();
  });

  test('TC-OMNIKNOW-03: Given the hub, When I click Start Exploring, Then I land on the World Wisdom Explorer', async ({ page }) => {
    await goto(page, '/app/omniknow');
    await page.getByRole('button', { name: /start exploring/i }).click();
    await page.waitForURL(/\/app\/omniknow\/explorer/, { timeout: 10000 });
    expect(page.url()).toContain('/app/omniknow/explorer');
  });
});

test.describe('TC-OMNIKNOW — Explorer', () => {
  test('TC-OMNIKNOW-EXPLORER-01: Given I open the Explorer, Then a domain search box and Filters control are shown', async ({ page }) => {
    await goto(page, '/app/omniknow/explorer');
    await expect(page.getByRole('heading', { name: /world wisdom explorer/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search domains, topics, or creators/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();
  });

  test('TC-OMNIKNOW-EXPLORER-02: Given the Explorer, When I click Explore Topic on a card, Then I land on its topic detail page', async ({ page }) => {
    await goto(page, '/app/omniknow/explorer');
    await page.getByRole('button', { name: /explore topic/i }).first().click();
    await page.waitForURL(/\/app\/omniknow\/topic\//, { timeout: 10000 });
    expect(page.url()).toContain('/app/omniknow/topic/');
  });
});

test.describe('TC-OMNIKNOW — Topic Detail', () => {
  test('TC-OMNIKNOW-TOPIC-01: Given I open a topic detail page, Then the title and Start Learning Now control are shown', async ({ page }) => {
    await goto(page, '/app/omniknow/topic/334923b1-3ad6-48da-91ff-79843dd31eb2');
    await expect(page.getByRole('heading').first()).not.toBeEmpty();
    await expect(page.getByRole('button', { name: /start learning now/i })).toBeVisible();
  });
});
