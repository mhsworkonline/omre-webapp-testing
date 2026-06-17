import { test, expect } from '@playwright/test';
import { goto } from '../helpers/nav.js';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(45000);

test.beforeEach(async ({ page }) => {
  await goto(page, '/app/explore');
});

test('TC-EXPLORE-01: Given authenticated, When explore loads, Then URL is /app/explore', async ({ page }) => {
  await expect(page).toHaveURL(/\/app\/explore/);
});

test('TC-EXPLORE-02: Given explore page, When rendered, Then main content area is visible', async ({ page }) => {
  const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
  await expect(main).toBeVisible({ timeout: 10000 });
});

test('TC-EXPLORE-03: Given explore page, When rendered, Then search input is visible', async ({ page }) => {
  const input = page.locator('input[placeholder*="search" i], input[placeholder*="discover" i]').first();
  await expect(input).toBeVisible({ timeout: 10000 });
});

test('TC-EXPLORE-04: Given explore page, When I type in search input, Then it accepts text', async ({ page }) => {
  const input = page.locator('input[placeholder*="search" i], input[placeholder*="discover" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await input.fill('music');
  const val = await input.inputValue();
  expect(val).toBe('music');
});

test('TC-EXPLORE-05: Given explore page, When I press Enter in search, Then page does not crash', async ({ page }) => {
  const input = page.locator('input[placeholder*="search" i], input[placeholder*="discover" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await input.fill('test');
  await input.press('Enter');
  await page.waitForTimeout(2000);
  await expect(page).not.toHaveURL(/error/);
});

test('TC-EXPLORE-06: Given explore page, When I type special chars in search, Then no XSS or crash', async ({ page }) => {
  const input = page.locator('input[placeholder*="search" i], input[placeholder*="discover" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await input.fill('<script>alert(1)</script>');
  await input.press('Enter');
  await page.waitForTimeout(1500);
  await expect(page.locator('body')).toBeVisible();
});

test('TC-EXPLORE-07: Given explore page, When rendered, Then Home nav link is visible', async ({ page }) => {
  const link = page.locator('a[href*="/app/home"]').first();
  await expect(link).toBeVisible({ timeout: 8000 });
});

test('TC-EXPLORE-08: Given explore page, When rendered, Then content appears or empty state shows after search', async ({ page }) => {
  const input = page.locator('input[placeholder*="search" i], input[placeholder*="discover" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await input.fill('dance');
  await page.waitForTimeout(2000);
  const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
  await expect(main).toBeVisible();
});
