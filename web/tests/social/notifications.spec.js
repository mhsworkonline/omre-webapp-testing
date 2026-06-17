// TC-NOTIF — Notifications (rewritten from live crawl)
import { test, expect } from '@playwright/test';
import { AUTH_FILE, goto, pageHeading, button } from '../helpers/nav.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

test.describe('TC-NOTIF — Hub Landing', () => {
  test('TC-NOTIF-01: Given I am authenticated, When I navigate to /app/notifications, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/notifications');
    expect(page.url()).toContain('/app/notifications');
    await expect(pageHeading(page, /notifications/i)).toBeVisible();
  });

  test('TC-NOTIF-02: Given I am on the page, Then a notifications search box is shown', async ({ page }) => {
    await goto(page, '/app/notifications');
    await expect(page.getByPlaceholder(/search notifications/i)).toBeVisible();
  });

  test('TC-NOTIF-03: Given the page, Then category filter tabs (All/Social/Orbit/Business/Marketplace/Jobs/Studio) are shown', async ({ page }) => {
    await goto(page, '/app/notifications');
    await expect(button(page, /^all$/i).first()).toBeVisible();
    await expect(button(page, /^social$/i)).toBeVisible();
    await expect(button(page, /^jobs$/i)).toBeVisible();
  });

  test('TC-NOTIF-04: Given the page, Then Mark All Read and Clear controls are shown', async ({ page }) => {
    await goto(page, '/app/notifications');
    await expect(button(page, /mark all read/i).first()).toBeVisible();
    await expect(button(page, /^clear$/i)).toBeVisible();
  });

  test('TC-NOTIF-05: Given the page, Then read-state filters (All Updates/Unread Only/Priority) are shown', async ({ page }) => {
    await goto(page, '/app/notifications');
    await expect(button(page, /all updates/i)).toBeVisible();
    await expect(button(page, /unread only/i)).toBeVisible();
    await expect(button(page, /^priority$/i)).toBeVisible();
  });
});
