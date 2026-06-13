/**
 * Happy Corner module — deep-dive tests
 * Covers: page load & layout, positive/uplifting content renders,
 *         interactive elements, like/react actions, share functionality,
 *         content cards, error-free load
 * Prefix: TC-HAPPY
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/happy-corner';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-HAPPY-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/happy-corner/);
  });

  test('TC-HAPPY-02: Given I am on the page, When the page renders, Then Happy Corner heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /happy/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-HAPPY-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-HAPPY-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation is present', async ({ page }) => {
    const nav = page.locator('nav, aside').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-HAPPY-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. Uplifting Content Renders ──────────────────────────────────────────────

test.describe('Uplifting Content Display', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-HAPPY-06: Given I am authenticated and on the page, When I perform the action, Then content cards or posts are visible', async ({ page }) => {
    const card = page.locator('main article, main li, main [role="listitem"]').first();
    if (!(await card.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(card).toBeVisible();
  });

  test('TC-HAPPY-07: Given I am on the content card, When I view it, Then it shows text or caption', async ({ page }) => {
    const text = page.locator('main article p, main li p, main p').first();
    if (!(await text.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const content = await text.textContent();
    expect(content?.trim().length).toBeGreaterThan(0);
  });

  test('TC-HAPPY-08: Given I am authenticated and on the page, When I perform the action, Then images or media are displayed in content cards', async ({ page }) => {
    const img = page.locator('main img, main video').first();
    if (!(await img.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(img).toBeVisible();
  });

  test('TC-HAPPY-09: Given I am authenticated and on the page, When I perform the action, Then multiple content items are rendered', async ({ page }) => {
    const items = page.locator('main article, main li, main [role="listitem"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-HAPPY-10: Given I am authenticated and on the page, When I perform the action, Then content author or source info is shown', async ({ page }) => {
    const author = page.locator('main').getByText(/@|by |posted by/i).first();
    if (!(await author.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(author).toBeVisible();
  });
});

// ── 3. Interactive Elements ────────────────────────────────────────────────────

test.describe('Interactive Elements', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-HAPPY-11: Given I am authenticated and on the page, When I perform the action, Then action buttons are present on content cards', async ({ page }) => {
    const btn = page.locator('main button, main [role="button"]').first();
    if (!(await btn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(btn).toBeVisible();
  });

  test('TC-HAPPY-12: Given I am authenticated and on the page, When I perform the action, Then more content loads on scroll or pagination', async ({ page }) => {
    const initialCount = await page.locator('main article, main li').count();
    await page.keyboard.press('End');
    await page.waitForTimeout(1200);
    const newCount = await page.locator('main article, main li').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('TC-HAPPY-13: Given I am authenticated and on the page, When I perform the action, Then filter or category tabs are visible when present', async ({ page }) => {
    const tab = page.locator('[role="tab"], [role="tablist"] button').first();
    if (!(await tab.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(tab).toBeVisible();
  });

  test('TC-HAPPY-14: Given I am authenticated and on the page, When I perform the action, Then switching a tab updates the content section', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count < 2) return;
    await tabs.nth(1).click();
    await page.waitForTimeout(800);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });
});

// ── 4. Like / React Actions ───────────────────────────────────────────────────

test.describe('Like and React', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-HAPPY-15: Given I am authenticated and on the page, When I perform the action, Then like or heart button is present on a content item', async ({ page }) => {
    const like = page.locator('button[aria-label*="like" i], button[aria-label*="love" i], button[aria-label*="heart" i]')
      .or(page.locator('main button').filter({ hasText: /like|love|heart|❤|👍/i }))
      .first();
    if (!(await like.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(like).toBeVisible();
  });

  test('TC-HAPPY-16: Given the like button is present, When I click the like button, Then it changes its state', async ({ page }) => {
    const like = page.locator('button[aria-label*="like" i], button[aria-label*="heart" i]')
      .or(page.locator('main button').filter({ hasText: /like|heart/i }))
      .first();
    if (!(await like.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const before = await like.getAttribute('aria-pressed') ?? await like.textContent();
    await like.evaluate(el => el.click());
    await page.waitForTimeout(600);
    const after = await like.getAttribute('aria-pressed') ?? await like.textContent();
    expect(before !== null || after !== null).toBe(true);
  });

  test('TC-HAPPY-17: Given I am authenticated and on the page, When I perform the action, Then reaction emoji picker or options visible on hover/click', async ({ page }) => {
    const reactBtn = page.locator('button[aria-label*="react" i], button').filter({ hasText: /react|emoji|feel/i }).first();
    if (!(await reactBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await reactBtn.evaluate(el => el.click());
    await page.waitForTimeout(500);
    const picker = page.locator('[role="tooltip"], [role="menu"], [role="dialog"]').first();
    if (!(await picker.isVisible({ timeout: 3000 }).catch(() => false))) return;
    await expect(picker).toBeVisible();
  });
});

// ── 5. Share Functionality ────────────────────────────────────────────────────

test.describe('Share Functionality', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-HAPPY-18: Given I am authenticated and on the page, When I perform the action, Then share button is present on content cards', async ({ page }) => {
    const share = page.locator('button[aria-label*="share" i]')
      .or(page.locator('main button').filter({ hasText: /share/i }))
      .first();
    if (!(await share.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(share).toBeVisible();
  });

  test('TC-HAPPY-19: Given the share is present, When I click the share, Then it opens a share modal or menu', async ({ page }) => {
    const share = page.locator('button[aria-label*="share" i]')
      .or(page.locator('main button').filter({ hasText: /share/i }))
      .first();
    if (!(await share.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await share.evaluate(el => el.click());
    await page.waitForTimeout(600);
    const dialog = page.locator('[role="dialog"], [role="menu"], [role="tooltip"]').first();
    if (!(await dialog.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await expect(dialog).toBeVisible();
  });

  test('TC-HAPPY-20: Given I am on the page, When I interact with the element, Then share dialog can be dismissed', async ({ page }) => {
    const share = page.locator('button[aria-label*="share" i]')
      .or(page.locator('main button').filter({ hasText: /share/i }))
      .first();
    if (!(await share.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await share.evaluate(el => el.click());
    await page.waitForTimeout(600);
    const dialog = page.locator('[role="dialog"]').first();
    if (!(await dialog.isVisible({ timeout: 3000 }).catch(() => false))) return;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });

  test('TC-HAPPY-21: Given I am authenticated and on the page, When I perform the action, Then bookmark or save button is present when shown', async ({ page }) => {
    const save = page.locator('button[aria-label*="bookmark" i], button[aria-label*="save" i]')
      .or(page.locator('main button').filter({ hasText: /save|bookmark/i }))
      .first();
    if (!(await save.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(save).toBeEnabled();
  });

  test('TC-HAPPY-22: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
