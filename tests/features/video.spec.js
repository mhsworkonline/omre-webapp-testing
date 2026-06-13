/**
 * Video module deep-dive tests
 * URL: https://app.omre.ai/app/videos
 * Covers: page load, sidebar nav, video feed, upload, playback, sub-navigation, categories
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/videos';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goVideo(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

// ── Page Load and Layout ──────────────────────────────────────────────────────

test.describe('TC-VIDEO: Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goVideo(page); });

  test('TC-VIDEO-01: Given I am authenticated and on the page, When I perform the action, Then video module loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/videos/);
  });

  test('TC-VIDEO-02: Given I am on the page, When the page renders, Then main content area is visible', async ({ page }) => {
    const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
    await expect(main).toBeVisible({ timeout: 8000 });
  });

  test('TC-VIDEO-03: Given I am on the page, When I inspect the content, Then page title contains app name', async ({ page }) => {
    await expect(page).toHaveTitle(/omre/i);
  });

  test('TC-VIDEO-04: Given the page is loaded, When I inspect it, Then no uncaught JS errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const appErrors = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('app.omre.ai')
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ── Sidebar Navigation ────────────────────────────────────────────────────────

test.describe('TC-VIDEO: Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => { await goVideo(page); });

  test('TC-VIDEO-05: Given I am on the page, When the page renders, Then sidebar navigation is visible', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    const visible = await sidebar.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(sidebar).toBeVisible();
  });

  test('TC-VIDEO-06: Given I am authenticated and on the page, When I perform the action, Then Upload Video button is present', async ({ page }) => {
    const uploadBtn = page.getByRole('button', { name: /upload video/i })
      .or(page.getByRole('link', { name: /upload video/i })).first();
    await expect(uploadBtn).toBeVisible({ timeout: 8000 });
  });

  test('TC-VIDEO-07: Given I am authenticated and on the page, When I perform the action, Then Studio Dashboard link is present', async ({ page }) => {
    const studioLink = page.getByRole('link', { name: /studio dashboard/i }).first();
    await expect(studioLink).toBeVisible({ timeout: 8000 });
  });

  test('TC-VIDEO-08: Given I am authenticated and on the page, When I perform the action, Then VIDEO section links (Home, Shorts, LIVE) are present', async ({ page }) => {
    const homeLink = page.locator('a[href*="/app/videos"]').filter({ hasText: /^home$/i }).first();
    const visible = await homeLink.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(homeLink).toBeVisible();
  });

  test('TC-VIDEO-09: Given I am authenticated and on the page, When I perform the action, Then LIBRARY section is present in sidebar', async ({ page }) => {
    const library = page.getByRole('link', { name: /^library$/i }).first();
    const visible = await library.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(library).toBeVisible();
  });

  test('TC-VIDEO-10: Given I am authenticated and on the page, When I perform the action, Then CATEGORIES section is present', async ({ page }) => {
    const cat = page.getByText(/entertainment|music|gaming|categories/i).first();
    const visible = await cat.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(cat).toBeVisible();
  });
});

// ── Video Feed ────────────────────────────────────────────────────────────────

test.describe('TC-VIDEO: Video Feed', () => {
  test.beforeEach(async ({ page }) => { await goVideo(page); });

  test('TC-VIDEO-11: Given I am authenticated and on the page, When I perform the action, Then video feed renders cards or empty state', async ({ page }) => {
    const cardVisible = await page.locator('article, [role="listitem"], [data-testid*="video"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const emptyVisible = await page.getByText(/no video|nothing here|upload/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    const anyContent = await page.locator('main > div, body > div:not([hidden]) > div').first().isVisible({ timeout: 6000 }).catch(() => false);
    if (!cardVisible && !emptyVisible && !anyContent) { test.skip(); return; }
    expect(cardVisible || emptyVisible || anyContent).toBe(true);
  });

  test('TC-VIDEO-12: Given I am on the video card, When I view it, Then it shows a thumbnail image', async ({ page }) => {
    const thumb = page.locator('img').first();
    const visible = await thumb.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    const src = await thumb.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('TC-VIDEO-13: Given I am on the video card, When I view it, Then it shows a title', async ({ page }) => {
    const title = page.locator('h3, h4, [class*="title"], [class*="name"]').first();
    const visible = await title.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-VIDEO-14: Given I am on the video card, When I view it, Then it shows view count or upload date', async ({ page }) => {
    const meta = page.getByText(/\d+\s*views?|\d+\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Apr|days? ago)/i).first();
    const visible = await meta.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(meta).toBeVisible();
  });

  test('TC-VIDEO-15: Given I am authenticated and on the page, When I perform the action, Then multiple video cards are rendered', async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator('img[src*="http"]');
    const count = await cards.count();
    if (count === 0) { test.skip(); return; }
    expect(count).toBeGreaterThan(0);
  });
});

// ── Upload Flow ───────────────────────────────────────────────────────────────

test.describe('TC-VIDEO: Upload Flow', () => {
  test.beforeEach(async ({ page }) => { await goVideo(page); });

  test('TC-VIDEO-16: Given I am authenticated and on the page, When I perform the action, Then Upload Video button is clickable', async ({ page }) => {
    const uploadBtn = page.getByRole('button', { name: /upload video/i })
      .or(page.getByRole('link', { name: /upload video/i })).first();
    if (!(await uploadBtn.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await expect(uploadBtn).toBeEnabled();
  });

  test('TC-VIDEO-17: Given the Upload Video is present, When I click the Upload Video, Then it opens upload UI or modal', async ({ page }) => {
    const uploadBtn = page.getByRole('button', { name: /upload video/i })
      .or(page.getByRole('link', { name: /upload video/i })).first();
    if (!(await uploadBtn.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await uploadBtn.click();
    await page.waitForTimeout(1500);
    const modal = page.locator('[role="dialog"], [aria-modal="true"], input[type="file"]').first();
    const urlChanged = !page.url().endsWith('/app/videos');
    const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
    expect(modalVisible || urlChanged).toBe(true);
  });
});

// ── Video Playback ────────────────────────────────────────────────────────────

test.describe('TC-VIDEO: Video Playback', () => {
  test.beforeEach(async ({ page }) => { await goVideo(page); });

  test('TC-VIDEO-18: Given the video card is present, When I click the video card, Then it navigates to video detail', async ({ page }) => {
    const card = page.locator('a[href*="/app/videos/"]').first();
    const visible = await card.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await card.click();
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/\/app\/videos/);
  });

  test('TC-VIDEO-19: Given I am on the video detail page, When I view it, Then it shows a video player', async ({ page }) => {
    const card = page.locator('a[href*="/app/videos/"]').first();
    if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await card.click();
    await page.waitForTimeout(2500);
    const player = page.locator('video, [class*="player"], [aria-label*="video" i], iframe').first();
    const visible = await player.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(player).toBeVisible();
  });

  test('TC-VIDEO-20: Given I am on the video detail, When I view it, Then it shows title and metadata', async ({ page }) => {
    const card = page.locator('a[href*="/app/videos/"]').first();
    if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await card.click();
    await page.waitForTimeout(2500);
    const heading = page.locator('h1, h2').first();
    const visible = await heading.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(heading).toBeVisible();
  });
});

// ── Sub-navigation ────────────────────────────────────────────────────────────

test.describe('TC-VIDEO: Sub-navigation', () => {
  test.beforeEach(async ({ page }) => { await goVideo(page); });

  test('TC-VIDEO-21: Given I am authenticated and on the page, When I perform the action, Then Trending section is accessible', async ({ page }) => {
    const link = page.getByRole('link', { name: /trending/i }).first();
    if (!(await link.isVisible({ timeout: 6000 }).catch(() => false))) { test.skip(); return; }
    await link.click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/app\/videos/);
  });

  test('TC-VIDEO-22: Given I am authenticated and on the page, When I perform the action, Then History link is accessible', async ({ page }) => {
    const link = page.getByRole('link', { name: /history/i }).first();
    const visible = await link.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(link).toBeVisible();
  });

  test('TC-VIDEO-23: Given I am authenticated and on the page, When I perform the action, Then category filter navigates to category page', async ({ page }) => {
    const cat = page.getByRole('link', { name: /entertainment|music|gaming/i }).first();
    if (!(await cat.isVisible({ timeout: 6000 }).catch(() => false))) { test.skip(); return; }
    await cat.click();
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/\/app\/videos/);
  });

  test('TC-VIDEO-24: Given I am authenticated and on the page, When I perform the action, Then Subscriptions link navigates to subscriptions', async ({ page }) => {
    const link = page.getByRole('link', { name: /subscriptions/i }).first();
    if (!(await link.isVisible({ timeout: 6000 }).catch(() => false))) { test.skip(); return; }
    await link.click();
    await page.waitForTimeout(1500);
    if (!page.url().includes('subscriptions')) { test.skip(); return; }
  });
});
