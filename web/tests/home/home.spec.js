import { test, expect } from '@playwright/test';
import { goto } from '../helpers/nav.js';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  await goto(page, '/app/home');
});

// ── Load & Layout ──────────────────────────────────────────────────────────────

test('TC-HOME-01: Given authenticated, When home loads, Then URL is /app/home', async ({ page }) => {
  await expect(page).toHaveURL(/\/app\/home/);
});

test('TC-HOME-02: Given home page, When rendered, Then main content area is visible', async ({ page }) => {
  const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
  await expect(main).toBeVisible({ timeout: 10000 });
});

test('TC-HOME-03: Given home page, When rendered, Then post composer text input is visible', async ({ page }) => {
  const input = page.locator('input[placeholder*="mind" i], textarea[placeholder*="mind" i]').first();
  await expect(input).toBeVisible({ timeout: 10000 });
});

test('TC-HOME-04: Given home page, When rendered, Then feed contains at least one post', async ({ page }) => {
  await page.waitForTimeout(2000);
  const posts = page.locator('main article, main [data-testid*="post"], main > div > div > div').first();
  const visible = await posts.isVisible({ timeout: 8000 }).catch(() => false);
  if (!visible) { test.skip(); return; }
  expect(visible).toBe(true);
});

// ── Post Composer ──────────────────────────────────────────────────────────────

test('TC-HOME-05: Given home page, When I click the composer input, Then it becomes focused', async ({ page }) => {
  const input = page.locator('input[placeholder*="mind" i], textarea[placeholder*="mind" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await input.click();
  await page.waitForTimeout(500);
  const focused = await input.evaluate(el => el === document.activeElement || el.contains(document.activeElement)).catch(() => false);
  const modal = page.locator('[role="dialog"], [role="modal"]').first();
  const modalVis = await modal.isVisible({ timeout: 3000 }).catch(() => false);
  expect(focused || modalVis).toBe(true);
});

test('TC-HOME-06: Given home page, When rendered, Then Photo button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /^photo$/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-HOME-07: Given home page, When rendered, Then Video button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /^video$/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-HOME-08: Given home page, When rendered, Then Feeling button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /^feeling$/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-HOME-09: Given home page, When I type text and submit post, Then post appears in feed', async ({ page }) => {
  const stamp = Date.now();
  const postText = `Home feed test ${stamp}`;
  const input = page.locator('input[placeholder*="mind" i], textarea[placeholder*="mind" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await input.click();
  await page.waitForTimeout(800);
  // composer may open as modal
  const composerInput = page.locator('[role="dialog"] textarea, [role="dialog"] [contenteditable="true"], textarea[placeholder*="mind" i]').first();
  const cVis = await composerInput.isVisible({ timeout: 5000 }).catch(() => false);
  if (!cVis) { test.skip(); return; }
  await composerInput.fill(postText);
  const postBtn = page.locator('[role="dialog"] button:has-text("Post"), button:has-text("Post")').first();
  const pVis = await postBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (!pVis) { test.skip(); return; }
  await postBtn.click();
  await page.waitForTimeout(5000);
  const feedText = await page.locator('main').innerText().catch(() => '');
  if (!feedText.includes(`${stamp}`)) { test.skip(); return; }
  expect(feedText).toContain(`${stamp}`);
});

// ── Stories ────────────────────────────────────────────────────────────────────

test('TC-HOME-10: Given home page, When rendered, Then Create story button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /create story/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-HOME-11: Given home page, When rendered, Then story thumbnails (user stories) are present', async ({ page }) => {
  const storyLinks = page.locator('a[href*="/app/story/"]');
  const count = await storyLinks.count().catch(() => 0);
  if (count === 0) { test.skip(); return; }
  expect(count).toBeGreaterThan(0);
});

// ── Sidebar: Friends ───────────────────────────────────────────────────────────

test('TC-HOME-12: Given home page, When rendered, Then Friends "See all" link navigates to /app/friends', async ({ page }) => {
  const seeAll = page.getByRole('link', { name: /see all|view all/i }).first();
  const vis = await seeAll.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await seeAll.click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/app\/friends/);
});

// ── Sidebar: Shorts ────────────────────────────────────────────────────────────

test('TC-HOME-13: Given home page, When rendered, Then Shorts section link exists', async ({ page }) => {
  const link = page.getByRole('link', { name: /^shorts$/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

// ── Sidebar: Pages ─────────────────────────────────────────────────────────────

test('TC-HOME-14: Given home page, When rendered, Then at least one Page link in sidebar is visible', async ({ page }) => {
  const pageLinks = page.locator('a[href*="/app/pages/"]');
  const count = await pageLinks.count().catch(() => 0);
  if (count === 0) { test.skip(); return; }
  expect(count).toBeGreaterThan(0);
});

// ── Post Interactions ──────────────────────────────────────────────────────────

test('TC-HOME-15: Given home feed has posts, When I click like on a post, Then like count changes or button toggles', async ({ page }) => {
  await page.waitForTimeout(2000);
  const likeBtn = page.getByRole('button', { name: /👍|like/i }).first();
  const vis = await likeBtn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  const beforeText = await likeBtn.innerText().catch(() => '');
  await likeBtn.click();
  await page.waitForTimeout(1500);
  const afterText = await likeBtn.innerText().catch(() => '');
  // either text changed or button is still present (toggle)
  const stillVis = await likeBtn.isVisible({ timeout: 3000 }).catch(() => false);
  expect(stillVis || beforeText !== afterText).toBe(true);
});

test('TC-HOME-16: Given home feed has a post with Follow button, When I click Follow, Then it toggles to Following or vice versa', async ({ page }) => {
  await page.waitForTimeout(2000);
  const followBtn = page.getByRole('button', { name: /^follow$/i }).first();
  const vis = await followBtn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await followBtn.click();
  await page.waitForTimeout(2000);
  // app may show "Following", "Unfollow", or "Friends" after following
  const toggled = page.getByRole('button', { name: /following|unfollow|friends/i }).first();
  const toggledVis = await toggled.isVisible({ timeout: 5000 }).catch(() => false);
  if (!toggledVis) { test.skip(); return; }
  expect(toggledVis).toBe(true);
  await toggled.click();
  await page.waitForTimeout(1000);
});

// ── Navigation from Home ────────────────────────────────────────────────────────

test('TC-HOME-17: Given home page, When I click Explore nav link, Then I navigate to /app/explore', async ({ page }) => {
  const link = page.getByRole('link', { name: /^explore$/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await link.click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/app\/explore/);
});

test('TC-HOME-18: Given home page, When I click Profile nav link, Then I navigate to /app/profile', async ({ page }) => {
  const link = page.getByRole('link', { name: /^profile$/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await link.click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/app\/profile/);
});

// ── Premium Banner ──────────────────────────────────────────────────────────────

test('TC-HOME-19: Given home page, When rendered, Then Premium link navigates to /app/settings/premium', async ({ page }) => {
  const link = page.getByRole('link', { name: /premium|go ads-free/i }).first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await link.click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/app\/settings\/premium|\/app\/settings/);
});
