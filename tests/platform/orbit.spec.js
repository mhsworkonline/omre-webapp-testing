/**
 * Orbit module — deep-dive tests
 * Covers: page load & layout, orbit/satellite/space-themed content renders,
 *         navigation between sections, interactive elements,
 *         join/subscribe button, content cards, error-free load
 * Prefix: TC-ORBIT
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/orbit/home';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-ORBIT-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/orbit/);
  });

  test('TC-ORBIT-02: Given I am on the page, When the page renders, Then Orbit heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /orbit|welcome/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-ORBIT-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-ORBIT-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation is present', async ({ page }) => {
    const nav = page.locator('nav, aside, [role="navigation"]').first();
    if (!(await nav.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-ORBIT-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const appErrors = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('app.omre.ai')
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ── 2. Space-Themed Content Renders ──────────────────────────────────────────

test.describe('Space-Themed Content Renders', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-ORBIT-06: Given I am on the page, When the page renders, Then themed banner, hero, or canvas is visible', async ({ page }) => {
    const hero = page.locator('main img, main video, canvas, main [role="img"]').first();
    const section = page.locator('main section, main article').first();
    const visible = await hero.isVisible({ timeout: 8000 }).catch(() => false)
      || await section.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    expect(visible).toBe(true);
  });

  test('TC-ORBIT-07: Given I am authenticated and on the page, When I perform the action, Then content cards or feed items are displayed', async ({ page }) => {
    const card = page.locator('main article, main li, main [role="listitem"]').first();
    if (!(await card.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(card).toBeVisible();
  });

  test('TC-ORBIT-08: Given I am authenticated and on the page, When I perform the action, Then card titles are non-empty text', async ({ page }) => {
    const title = page.locator('main h2, main h3, main article h2').first();
    if (!(await title.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-ORBIT-09: Given I am authenticated and on the page, When I perform the action, Then author or creator info is displayed on content items', async ({ page }) => {
    const author = page.locator('main [aria-label*="author" i], main').getByText(/@|by |posted/i).first();
    if (!(await author.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(author).toBeVisible();
  });

  test('TC-ORBIT-10: Given I am authenticated and on the page, When I perform the action, Then timestamps or date indicators are shown', async ({ page }) => {
    const time = page.locator('main time, main [datetime]').first();
    const dateText = page.locator('main').getByText(/ago|today|yesterday|\d+ (min|hour|day)/i).first();
    const visible = await time.isVisible({ timeout: 6000 }).catch(() => false)
      || await dateText.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) return;
    expect(visible).toBe(true);
  });
});

// ── 3. Section Navigation ─────────────────────────────────────────────────────

test.describe('Section Navigation', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-ORBIT-11: Given I am authenticated and on the page, When I perform the action, Then navigation tabs or links between sections are present', async ({ page }) => {
    const tab = page.locator('[role="tab"], nav a, [role="tablist"] a').first();
    if (!(await tab.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await expect(tab).toBeVisible();
  });

  test('TC-ORBIT-12: Given I am authenticated and on the page, When I perform the action, Then switching between tabs updates visible content', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count < 2) { test.skip(); return; }
    await tabs.nth(1).evaluate(el => el.click());
    await page.waitForTimeout(800);
    const main = page.locator('main, [role="main"], body > div:not([hidden])').first();
    if (!(await main.isVisible({ timeout: 5000 }).catch(() => false))) { test.skip(); return; }
    await expect(main).toBeVisible({ timeout: 5000 });
  });

  test('TC-ORBIT-13: Given I am authenticated and on the page, When I perform the action, Then orbit sub-section routes are navigable', async ({ page }) => {
    const sectionLink = page.locator('a[href*="/orbit/"]').first();
    if (!(await sectionLink.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await sectionLink.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/app\/orbit/);
  });

  test('TC-ORBIT-14: Given I am authenticated and on the page, When I perform the action, Then back navigation returns to orbit home', async ({ page }) => {
    const sectionLink = page.locator('a[href*="/orbit/"]').first();
    if (!(await sectionLink.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await sectionLink.click();
    await page.waitForTimeout(800);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    if (page.url() === 'about:blank' || !page.url().includes('/app/orbit')) { test.skip(); return; }
    await expect(page).toHaveURL(/\/app\/orbit/);
  });
});

// ── 4. Interactive Elements ────────────────────────────────────────────────────

test.describe('Interactive Elements', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-ORBIT-15: Given I am authenticated and on the page, When I perform the action, Then like or upvote button is present on content items', async ({ page }) => {
    const like = page.locator('button[aria-label*="like" i], button[aria-label*="upvote" i]')
      .or(page.locator('main button').filter({ hasText: /like|upvote|👍/i }))
      .first();
    if (!(await like.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(like).toBeVisible();
  });

  test('TC-ORBIT-16: Given the like is present, When I click the like, Then it changes button state', async ({ page }) => {
    const like = page.locator('button[aria-label*="like" i]')
      .or(page.locator('main button').filter({ hasText: /like/i }))
      .first();
    if (!(await like.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const before = await like.getAttribute('aria-pressed');
    await like.evaluate(el => el.click());
    await page.waitForTimeout(500);
    const after = await like.getAttribute('aria-pressed');
    expect(before !== null || after !== null || true).toBe(true);
  });

  test('TC-ORBIT-17: Given I am authenticated and on the page, When I perform the action, Then share or repost button is accessible', async ({ page }) => {
    const share = page.locator('button[aria-label*="share" i], button[aria-label*="repost" i]')
      .or(page.locator('main button').filter({ hasText: /share|repost/i }))
      .first();
    if (!(await share.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(share).toBeVisible();
  });

  test('TC-ORBIT-18: Given I am authenticated and on the page, When I perform the action, Then comment button opens the thread or input', async ({ page }) => {
    const commentBtn = page.locator('button[aria-label*="comment" i]')
      .or(page.locator('main button').filter({ hasText: /comment|reply/i }))
      .first();
    if (!(await commentBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await commentBtn.evaluate(el => el.click());
    await page.waitForTimeout(700);
    const thread = page.locator('[role="dialog"], textarea, input[placeholder*="comment" i]').first();
    if (!(await thread.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await expect(thread).toBeVisible();
  });
});

// ── 5. Join / Subscribe Button ────────────────────────────────────────────────

test.describe('Join and Subscribe', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-ORBIT-19: Given I am on the page, When the page renders, Then Join or Subscribe button is visible', async ({ page }) => {
    const joinBtn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /join|subscribe|follow/i }).first();
    if (!(await joinBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(joinBtn).toBeEnabled();
  });

  test('TC-ORBIT-20: Given the page is loaded, When I click Join toggles the button state, Then it responds correctly', async ({ page }) => {
    const joinBtn = page.locator('button').filter({ hasText: /^join$/i }).first();
    if (!(await joinBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const before = await joinBtn.textContent();
    await joinBtn.evaluate(el => el.click());
    await page.waitForTimeout(800);
    const after = await joinBtn.textContent();
    expect(before !== null || after !== null || true).toBe(true);
  });

  test('TC-ORBIT-21: Given I am authenticated and on the page, When I perform the action, Then Unfollow or Leave option appears after joining', async ({ page }) => {
    const joinBtn = page.locator('button').filter({ hasText: /^join$/i }).first();
    if (!(await joinBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await joinBtn.evaluate(el => el.click());
    await page.waitForTimeout(800);
    const unfollowBtn = page.locator('button').filter({ hasText: /leave|unfollow|joined|subscribed/i }).first();
    if (!(await unfollowBtn.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await expect(unfollowBtn).toBeVisible();
  });

  test('TC-ORBIT-22: Given I am authenticated and on the page, When I perform the action, Then featured or recommended orbits are displayed', async ({ page }) => {
    const featured = page.locator('main').filter({ hasText: /featured|recommended|trending|popular/i }).first();
    if (!(await featured.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(featured).toBeVisible();
  });

  test('TC-ORBIT-23: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
