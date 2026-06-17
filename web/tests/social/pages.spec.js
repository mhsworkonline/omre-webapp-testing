// TC-PAGES — Pages directory & detail (rewritten from live crawl)
import { test, expect } from '@playwright/test';
import { AUTH_FILE, goto, pageHeading, button } from '../helpers/nav.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

test.describe('TC-PAGES — Hub Landing', () => {
  test('TC-PAGES-01: Given I am authenticated, When I navigate to /app/pages, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/pages');
    expect(page.url()).toContain('/app/pages');
    await expect(pageHeading(page, 'Pages')).toBeVisible();
  });

  test('TC-PAGES-02: Given I am on the directory, Then a search box and category filter tabs are shown', async ({ page }) => {
    await goto(page, '/app/pages');
    await expect(page.getByPlaceholder(/search pages by name/i)).toBeVisible();
    await expect(button(page, /^business$/i)).toBeVisible();
    await expect(button(page, /^communities$/i)).toBeVisible();
  });

  test('TC-PAGES-03: Given the directory, Then a Create Page control is shown', async ({ page }) => {
    await goto(page, '/app/pages');
    await expect(button(page, /create page/i)).toBeVisible();
  });

  test('TC-PAGES-04: Given the directory, When I click a page card, Then I land on its detail page', async ({ page }) => {
    await goto(page, '/app/pages');
    const card = page.locator('a[href^="/app/pages/"]').first();
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForURL(/\/app\/pages\/[0-9a-f-]+/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/app\/pages\/[0-9a-f-]+/);
  });
});

test.describe('TC-PAGES — Page Detail (functional)', () => {
  test('TC-PAGES-DETAIL-01: Given I open a page detail, Then the page name and a Follow control are shown', async ({ page }) => {
    await goto(page, '/app/pages/24334f0b-4282-4f9e-bf52-9c652b13a34d');
    await expect(pageHeading(page, /worldnoor/i)).toBeVisible();
    await expect(button(page, /^(follow page|following)$/i)).toBeVisible();
  });

  test('TC-PAGES-DETAIL-FUNC-01: Given a page detail, When I click the Follow/Following control, Then the click is accepted without error', async ({ page }) => {
    await goto(page, '/app/pages/24334f0b-4282-4f9e-bf52-9c652b13a34d');
    const followBtn = button(page, /^(follow page|following)$/i);
    await followBtn.click();
    await page.waitForTimeout(1500);
    // Following accounts show an "Unfollow Worldnoor?" confirmation — dismiss without changing state.
    const confirmHeading = page.getByRole('heading', { name: /unfollow worldnoor/i });
    if (await confirmHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    await expect(pageHeading(page, /worldnoor/i)).toBeVisible();
  });
});
