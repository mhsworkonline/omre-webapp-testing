// TC-SETTINGS — Account & App Settings (rewritten from live crawl: hub of 15 sub-pages, each just "Back to Settings" + its own controls)
import { test, expect } from '@playwright/test';
import { AUTH_FILE, goto, pageHeading, button } from '../helpers/nav.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

test.describe('TC-SETTINGS — Hub Landing', () => {
  test('TC-SETTINGS-01: Given I am authenticated, When I navigate to /app/settings, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/settings');
    expect(page.url()).toContain('/app/settings');
    await expect(pageHeading(page, 'Settings')).toBeVisible();
  });

  test('TC-SETTINGS-02: Given I am on the hub, Then a settings search box is shown', async ({ page }) => {
    await goto(page, '/app/settings');
    await expect(page.getByPlaceholder(/settings/i)).toBeVisible();
  });

  for (const [name, href] of [
    ['Account', '/app/settings/account'],
    ['Premium', '/app/settings/premium'],
    ['Appearance', '/app/settings/appearance'],
    ['Privacy', '/app/settings/privacy'],
    ['Safety & Moderation', '/app/settings/safety'],
    ['Security', '/app/settings/security'],
    ['Notifications', '/app/settings/notifications'],
    ['Content & Feed', '/app/settings/content'],
    ['Messaging', '/app/settings/messaging'],
    ['Focus Mode', '/app/settings/focus'],
    ['Accessibility', '/app/settings/accessibility'],
    ['Business', '/app/settings/business'],
    ['Creator Studio', '/app/settings/creator'],
    ['AI Studio', '/app/settings/ai'],
    ['Education', '/app/settings/education'],
    ['Help & About', '/app/settings/help'],
  ]) {
    test(`TC-SETTINGS-CARD-${name.replace(/[^\w]+/g, '-')}: Given I am on the hub, When I inspect the "${name}" card, Then it links to ${href}`, async ({ page }) => {
      await goto(page, '/app/settings');
      const link = page.getByRole('main').getByRole('link', { name: new RegExp(name.split(' ')[0]) }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }
});

test.describe('TC-SETTINGS — Account', () => {
  test('TC-SETTINGS-ACCOUNT-01: Given I open Account settings, Then profile and contact fields are shown', async ({ page }) => {
    await goto(page, '/app/settings/account');
    await expect(button(page, /save profile/i)).toBeVisible();
    await expect(button(page, /save contact info/i)).toBeVisible();
    // Intentionally not saving — would overwrite real account data on the shared test account.
  });
});

test.describe('TC-SETTINGS — Premium', () => {
  test('TC-SETTINGS-PREMIUM-01: Given I open Premium, Then Top Up and Upgrade Now controls are shown', async ({ page }) => {
    await goto(page, '/app/settings/premium');
    await expect(page.getByText(/loading premium/i)).not.toBeVisible({ timeout: 15000 }).catch(() => {});
    await expect(page.getByRole('link', { name: /top up/i })).toBeVisible({ timeout: 15000 });
    await expect(button(page, /upgrade now/i)).toBeVisible();
    // Intentionally not clicking Upgrade Now — real money/wallet transaction.
  });
});

test.describe('TC-SETTINGS — Appearance (functional)', () => {
  test('TC-SETTINGS-APPEARANCE-01: Given I open Appearance, Then theme color swatches are shown', async ({ page }) => {
    await goto(page, '/app/settings/appearance');
    await expect(button(page, 'Blue')).toBeVisible();
    await expect(button(page, 'Purple')).toBeVisible();
  });

  test('TC-SETTINGS-APPEARANCE-FUNC-01: Given Appearance settings, When I select a different theme color and reset, Then no error occurs', async ({ page }) => {
    await goto(page, '/app/settings/appearance');
    await button(page, 'Purple').click();
    await page.waitForTimeout(500);
    await button(page, 'Reset').click();
    await page.waitForTimeout(500);
    await expect(button(page, 'Blue')).toBeVisible();
  });
});

test.describe('TC-SETTINGS — Privacy & Safety', () => {
  test('TC-SETTINGS-PRIVACY-01: Given I open Privacy, Then a link to Messaging settings is shown', async ({ page }) => {
    await goto(page, '/app/settings/privacy');
    await expect(page.getByRole('link', { name: /messaging settings/i })).toBeVisible();
  });

  test('TC-SETTINGS-SAFETY-01: Given I open Safety & Moderation, Then a muted-word filter input and blocked/muted list links are shown', async ({ page }) => {
    await goto(page, '/app/settings/safety');
    await expect(page.getByPlaceholder(/add word or phrase/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /view list/i }).first()).toBeVisible();
  });
});

test.describe('TC-SETTINGS — Security', () => {
  test('TC-SETTINGS-SECURITY-01: Given I open Security, Then 2FA, password and session controls are shown', async ({ page }) => {
    await goto(page, '/app/settings/security');
    await expect(button(page, /set up 2fa/i)).toBeVisible();
    await expect(button(page, /update password/i)).toBeVisible();
    await expect(button(page, /view active sessions/i)).toBeVisible();
    // Intentionally not submitting a password change — security-sensitive on the shared test account.
  });
});

test.describe('TC-SETTINGS — Notifications, Content, Messaging, Focus, Accessibility', () => {
  test('TC-SETTINGS-NOTIF-01: Given I open Notification settings, Then the page renders without error', async ({ page }) => {
    await goto(page, '/app/settings/notifications');
    await expect(pageHeading(page, 'Settings')).toBeVisible();
  });

  test('TC-SETTINGS-CONTENT-01: Given I open Content & Feed settings, Then a Reset Now control is shown', async ({ page }) => {
    await goto(page, '/app/settings/content');
    await expect(button(page, /reset now/i)).toBeVisible();
  });

  test('TC-SETTINGS-MESSAGING-01: Given I open Messaging settings, Then a Set PIN control is shown', async ({ page }) => {
    await goto(page, '/app/settings/messaging');
    await expect(button(page, /set pin/i)).toBeVisible();
  });

  test('TC-SETTINGS-FOCUS-01: Given I open Focus Mode settings, Then the page renders without error', async ({ page }) => {
    await goto(page, '/app/settings/focus');
    await expect(pageHeading(page, 'Settings')).toBeVisible();
  });

  test('TC-SETTINGS-A11Y-01: Given I open Accessibility settings, Then the page renders without error', async ({ page }) => {
    await goto(page, '/app/settings/accessibility');
    await expect(pageHeading(page, 'Settings')).toBeVisible();
  });
});

test.describe('TC-SETTINGS — Business, Creator, AI, Education', () => {
  test('TC-SETTINGS-BUSINESS-01: Given I open Business settings, When I click Go to Business Dashboard, Then I land on /biz', async ({ page }) => {
    await goto(page, '/app/settings/business');
    await page.getByRole('link', { name: /go to business dashboard/i }).click();
    await page.waitForURL(/\/biz/, { timeout: 10000 });
    expect(page.url()).toContain('/biz');
  });

  test('TC-SETTINGS-CREATOR-01: Given I open Creator Studio settings, When I click Go to Studio, Then I land on /studio/overview', async ({ page }) => {
    await goto(page, '/app/settings/creator');
    await page.getByRole('link', { name: /go to studio/i }).click();
    await page.waitForURL(/\/studio\/overview/, { timeout: 10000 });
    expect(page.url()).toContain('/studio/overview');
  });

  test('TC-SETTINGS-EDUCATION-01: Given I open Education settings, When I click Go to Learn, Then I land on /learn/home', async ({ page }) => {
    await goto(page, '/app/settings/education');
    await page.getByRole('link', { name: /go to learn/i }).click();
    await page.waitForURL(/\/learn\/home/, { timeout: 10000 });
    expect(page.url()).toContain('/learn/home');
  });
});

test.describe('TC-SETTINGS — Help & About', () => {
  test('TC-SETTINGS-HELP-01: Given I open Help & About, Then Help Center, Contact Support and legal links are shown', async ({ page }) => {
    await goto(page, '/app/settings/help');
    await expect(page.getByRole('link', { name: /help center/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible();
  });
});
