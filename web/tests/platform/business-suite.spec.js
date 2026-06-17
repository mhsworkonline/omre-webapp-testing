// TC-BIZSUITE — Business Suite Launcher (rewritten from live crawl: single-page hub linking to other apps)
import { test, expect } from '@playwright/test';
import { AUTH_FILE, goto, pageHeading } from '../helpers/nav.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

test.describe('TC-BIZSUITE — Hub Landing', () => {
  test('TC-BIZSUITE-01: Given I am authenticated, When I navigate to /app/business-suite, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/business-suite');
    expect(page.url()).toContain('/app/business-suite');
    await expect(pageHeading(page, 'Business Suite')).toBeVisible();
  });

  for (const [name, href] of [
    ['Social', '/app/home'],
    ['Orbit', '/app/orbit/home'],
    ['News', '/app/news/home'],
    ['Biz', '/biz'],
    ['Jobs', '/jobs/home'],
    ['Learn', '/learn/home'],
    ['Games', '/app/games'],
    ['Studio', '/studio/overview'],
  ]) {
    test(`TC-BIZSUITE-CARD-${name}: Given I am on the hub, When I inspect the "${name}" launcher card, Then it links to ${href}`, async ({ page }) => {
      await goto(page, '/app/business-suite');
      const link = page.getByRole('link', { name: new RegExp(name) }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }

  test('TC-BIZSUITE-02: Given I am on the hub, Then "Ask Omre AI" and "View analytics" shortcuts are shown', async ({ page }) => {
    await goto(page, '/app/business-suite');
    await expect(page.getByRole('link', { name: /ask omre ai/i })).toHaveAttribute('href', '/app/omni-ai');
    await expect(page.getByRole('link', { name: /view analytics/i })).toHaveAttribute('href', '/app/reputation');
  });
});
