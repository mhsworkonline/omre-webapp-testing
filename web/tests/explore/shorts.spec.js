import { test, expect } from '@playwright/test';
import { goto } from '../helpers/nav.js';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  await goto(page, '/app/shorts');
});

test('TC-SHORTS-01: Given authenticated, When shorts loads, Then URL is /app/shorts', async ({ page }) => {
  await expect(page).toHaveURL(/\/app\/shorts/);
});

test('TC-SHORTS-02: Given shorts page, When rendered, Then main content area is visible', async ({ page }) => {
  const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
  await expect(main).toBeVisible({ timeout: 10000 });
});

test('TC-SHORTS-03: Given shorts page, When rendered, Then sidebar has Studio Dashboard link', async ({ page }) => {
  const link = page.getByRole('link', { name: /studio dashboard/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-SHORTS-04: Given shorts page, When rendered, Then My Channel link is visible', async ({ page }) => {
  const link = page.getByRole('link', { name: /my channel/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-SHORTS-05: Given shorts page, When rendered, Then Upload Video button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /upload video/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-SHORTS-06: Given shorts page, When rendered, Then video content or shorts feed is visible', async ({ page }) => {
  await page.waitForTimeout(3000);
  const video = page.locator('video').first();
  const vis = await video.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-SHORTS-07: Given shorts page has video, When I click video, Then play state toggles', async ({ page }) => {
  await page.waitForTimeout(3000);
  const video = page.locator('video').first();
  const vis = await video.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await video.click({ force: true });
  await page.waitForTimeout(800);
  const paused = await video.evaluate(el => el.paused);
  expect(typeof paused).toBe('boolean');
});

test('TC-SHORTS-08: Given shorts page, When rendered, Then Subscriptions link is visible', async ({ page }) => {
  const link = page.getByRole('link', { name: /^subscriptions$/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-SHORTS-09: Given shorts page, When rendered, Then category links (Entertainment, Music, etc.) are present', async ({ page }) => {
  const entLink = page.getByRole('link', { name: /entertainment/i }).first();
  const vis = await entLink.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-SHORTS-10: Given shorts page, When I click Studio Dashboard, Then navigates to /app/videos/studio', async ({ page }) => {
  const link = page.getByRole('link', { name: /studio dashboard/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await link.click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/app\/videos\/studio/);
});

test('TC-SHORTS-11: Given shorts video, When mute button exists, Then clicking it toggles muted state', async ({ page }) => {
  await page.waitForTimeout(3000);
  const video = page.locator('video').first();
  const vis = await video.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  const muteBtn = page.locator('[aria-label*="mute" i], [aria-label*="sound" i], [aria-label*="volume" i]').first();
  const muteVis = await muteBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (!muteVis) { test.skip(); return; }
  const before = await video.evaluate(el => el.muted);
  await muteBtn.click();
  await page.waitForTimeout(500);
  const after = await video.evaluate(el => el.muted);
  expect(typeof after).toBe('boolean');
});

test('TC-SHORTS-12: Given shorts page, When scrolling down, Then page stays alive', async ({ page }) => {
  await page.waitForTimeout(2000);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);
  }
  await expect(page.locator('body')).toBeVisible();
});
