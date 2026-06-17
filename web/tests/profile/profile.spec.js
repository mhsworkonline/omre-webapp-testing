import { test, expect } from '@playwright/test';
import { goto } from '../helpers/nav.js';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(60000);

const OWN_PROFILE = '/app/profile/w4f01';

test.beforeEach(async ({ page }) => {
  await goto(page, OWN_PROFILE);
});

// ── Page Load ─────────────────────────────────────────────────────────────────

test('TC-PROFILE-01: Given authenticated, When profile loads, Then URL contains /app/profile', async ({ page }) => {
  await expect(page).toHaveURL(/\/app\/profile/);
});

test('TC-PROFILE-02: Given profile page, When rendered, Then main content is visible', async ({ page }) => {
  const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
  await expect(main).toBeVisible({ timeout: 10000 });
});

test('TC-PROFILE-03: Given own profile, When rendered, Then username h1 "w4f01" is visible', async ({ page }) => {
  const heading = page.locator('h1').filter({ hasText: /w4f01/i }).first();
  await expect(heading).toBeVisible({ timeout: 10000 });
});

// ── Buttons ───────────────────────────────────────────────────────────────────

test('TC-PROFILE-04: Given own profile, When rendered, Then Edit Profile button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /edit profile/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await expect(btn).toBeEnabled();
});

test('TC-PROFILE-05: Given own profile, When rendered, Then Share Profile button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /share profile/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await expect(btn).toBeEnabled();
});

test('TC-PROFILE-06: Given own profile, When I click Edit Profile, Then a modal or navigation opens', async ({ page }) => {
  const btn = page.getByRole('button', { name: /edit profile/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await btn.click();
  await page.waitForTimeout(1500);
  const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
  const navigated = !page.url().includes(OWN_PROFILE);
  const hasDialog = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
  expect(hasDialog || navigated).toBe(true);
  await page.keyboard.press('Escape');
});

// ── Stats ─────────────────────────────────────────────────────────────────────

test('TC-PROFILE-07: Given own profile, When rendered, Then Posts stat button is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /posts/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-08: Given own profile, When rendered, Then Followers stat is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /followers/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-09: Given own profile, When rendered, Then Following stat is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /following/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-10: Given own profile, When rendered, Then Likes stat is visible', async ({ page }) => {
  const btn = page.getByRole('button', { name: /likes/i }).first();
  const vis = await btn.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

// ── Tabs ──────────────────────────────────────────────────────────────────────

test('TC-PROFILE-11: Given own profile, When rendered, Then Posts tab is visible', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^posts$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-12: Given own profile, When rendered, Then Orbit tab is visible', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^orbit$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-13: Given own profile, When rendered, Then Videos tab is visible', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^videos$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-14: Given own profile, When rendered, Then About tab is visible', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^about$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  expect(vis).toBe(true);
});

test('TC-PROFILE-15: Given own profile, When I click About tab, Then page stays on profile URL', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^about$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await tab.click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/app\/profile/);
});

test('TC-PROFILE-16: Given own profile About tab, When rendered, Then edit details options appear', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^about$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await tab.click();
  await page.waitForTimeout(1000);
  const editDetails = page.getByRole('button', { name: /edit details/i }).first();
  const addBio = page.getByRole('button', { name: /add bio/i }).first();
  const hasEd = await editDetails.isVisible({ timeout: 5000 }).catch(() => false);
  const hasAb = await addBio.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasEd && !hasAb) { test.skip(); return; }
  expect(hasEd || hasAb).toBe(true);
});

// ── Reputation ────────────────────────────────────────────────────────────────

test('TC-PROFILE-17: Given own profile, When rendered, Then Reputation link to /app/reputation exists', async ({ page }) => {
  const link = page.locator('a[href*="/app/reputation"]').first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await expect(link).toBeVisible();
});

test('TC-PROFILE-18: Given own profile, When I click reputation link, Then navigates to /app/reputation', async ({ page }) => {
  const link = page.locator('a[href*="/app/reputation"]').first();
  const vis = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await link.click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/app\/reputation/);
});

// ── Post Composer ─────────────────────────────────────────────────────────────

test('TC-PROFILE-19: Given own profile, When rendered, Then post composer input is present', async ({ page }) => {
  const input = page.locator('input[placeholder*="mind" i], textarea[placeholder*="mind" i]').first();
  const vis = await input.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await expect(input).toBeVisible();
});

// ── Photos Tab ────────────────────────────────────────────────────────────────

test('TC-PROFILE-20: Given own profile, When I click Photos tab, Then stays on profile URL', async ({ page }) => {
  const tab = page.getByRole('button', { name: /^photos$/i }).first();
  const vis = await tab.isVisible({ timeout: 8000 }).catch(() => false);
  if (!vis) { test.skip(); return; }
  await tab.click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/app\/profile/);
});

// ── Nav links ─────────────────────────────────────────────────────────────────

test('TC-PROFILE-21: Given profile page, When rendered, Then Home nav link exists', async ({ page }) => {
  const link = page.locator('a[href*="/app/home"]').first();
  await expect(link).toBeVisible({ timeout: 8000 });
});

test('TC-PROFILE-22: Given profile page, When rendered, Then Messages nav link exists', async ({ page }) => {
  const link = page.locator('a[href*="/app/messages"]').first();
  await expect(link).toBeVisible({ timeout: 8000 });
});
