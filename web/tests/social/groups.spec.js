// TC-GROUPS — Communities/Groups (rewritten from live crawl)
import { test, expect } from '@playwright/test';
import { AUTH_FILE, goto, pageHeading, button } from '../helpers/nav.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

test.describe('TC-GROUPS — Hub Landing', () => {
  test('TC-GROUPS-01: Given I am authenticated, When I navigate to /app/groups, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/groups');
    expect(page.url()).toContain('/app/groups');
    await expect(pageHeading(page, /all communities/i, { level: 2 })).toBeVisible();
  });

  test('TC-GROUPS-02: Given I am on the hub, Then a community search box and Create Group control are shown', async ({ page }) => {
    await goto(page, '/app/groups');
    await expect(page.getByPlaceholder(/search all communities/i)).toBeVisible();
    await expect(button(page, /create group/i)).toBeVisible();
  });

  for (const [name, href] of [
    ['Feed', '/app/groups?tab=feed'],
    ['Discover', '/app/groups'],
    ['Your Groups', '/app/groups?tab=mine'],
    ['Invites', '/app/groups?tab=invites'],
  ]) {
    test(`TC-GROUPS-TAB-${name.replace(/\s+/g, '-')}: Given I am on the hub, When I inspect the "${name}" tab, Then it links to ${href}`, async ({ page }) => {
      await goto(page, '/app/groups');
      const link = page.getByRole('link', { name, exact: true }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }

  test('TC-GROUPS-03: Given the hub, When I click a group card, Then I land on its group detail page', async ({ page }) => {
    await goto(page, '/app/groups');
    const card = page.locator('a[href^="/app/groups/"]').first();
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForURL(/\/app\/groups\/[0-9a-f-]+/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/app\/groups\/[0-9a-f-]+/);
  });
});

test.describe('TC-GROUPS — Group Detail', () => {
  test('TC-GROUPS-DETAIL-01: Given I open a group detail page, Then the group name, Invite and a join/joined control are shown', async ({ page }) => {
    await goto(page, '/app/groups/3506b62f-a5cd-43f6-a787-37b5bc8fec8b');
    await expect(pageHeading(page, /worldnoor/i)).toBeVisible();
    await expect(button(page, /invite/i)).toBeVisible();
    await expect(button(page, /joined|join/i)).toBeVisible();
  });

  test('TC-GROUPS-DETAIL-02: Given a group detail page, Then a post composer is shown', async ({ page }) => {
    await goto(page, '/app/groups/3506b62f-a5cd-43f6-a787-37b5bc8fec8b');
    await expect(page.getByPlaceholder(/what's on your mind/i)).toBeVisible();
    await expect(button(page, /^post$/i)).toBeVisible();
  });
});
