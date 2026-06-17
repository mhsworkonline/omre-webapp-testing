// TC-FRIENDS — People directory (rewritten from live crawl)
import { test, expect } from '@playwright/test';
import { AUTH_FILE, goto, pageHeading, button } from '../helpers/nav.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

test.describe('TC-FRIENDS — Hub Landing', () => {
  test('TC-FRIENDS-01: Given I am authenticated, When I navigate to /app/friends, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/friends');
    expect(page.url()).toContain('/app/friends');
    await expect(pageHeading(page, /people/i)).toBeVisible();
  });

  test('TC-FRIENDS-02: Given I am on the page, Then a friends search box is shown', async ({ page }) => {
    await goto(page, '/app/friends');
    await expect(page.getByPlaceholder(/search friends/i)).toBeVisible();
  });

  test('TC-FRIENDS-03: Given the page, Then "All people" and "Following" filter tabs are shown', async ({ page }) => {
    await goto(page, '/app/friends');
    await expect(button(page, /all people/i)).toBeVisible();
    await expect(button(page, /^following/i).first()).toBeVisible();
  });

  test('TC-FRIENDS-04: Given the people list, Then Follow controls are shown on each card', async ({ page }) => {
    await goto(page, '/app/friends');
    await expect(button(page, /^follow$/i).first()).toBeVisible();
  });

  test('TC-FRIENDS-05: Given the people list, When I click a person card, Then I land on their profile', async ({ page }) => {
    await goto(page, '/app/friends');
    const card = page.locator('a[href^="/app/profile/"]').first();
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForURL(/\/app\/profile\//, { timeout: 10000 });
    expect(page.url()).toContain('/app/profile/');
  });
});
