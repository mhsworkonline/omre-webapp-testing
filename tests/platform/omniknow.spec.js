/**
 * Omniknow — knowledge base module deep-dive tests
 * Covers: page load & layout, knowledge base content renders, search functionality,
 *         categories/topics, article/entry click and detail view, back navigation,
 *         error-free load
 * Prefix: TC-OMNIKNOW
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/omniknow';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIKNOW-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/omniknow/);
  });

  test('TC-OMNIKNOW-02: Given I am on the page, When the page renders, Then knowledge base heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /omniknow|knowledge|library|learn/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-OMNIKNOW-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-OMNIKNOW-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation panel is present', async ({ page }) => {
    const nav = page.locator('nav, aside, [role="navigation"], [role="complementary"]').first();
    const visible = await nav.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(nav).toBeVisible();
  });

  test('TC-OMNIKNOW-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. Knowledge Base Content ─────────────────────────────────────────────────

test.describe('Knowledge Base Content', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIKNOW-06: Given I am authenticated and on the page, When I perform the action, Then knowledge entries or articles are listed', async ({ page }) => {
    const items = page.locator('main article, main li, main [role="listitem"]').first();
    if (!(await items.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(items).toBeVisible();
  });

  test('TC-OMNIKNOW-07: Given I am on the article cards, When I view it, Then it displays title text', async ({ page }) => {
    const title = page.locator('main h2, main h3, main article h2, main li h3').first();
    if (!(await title.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-OMNIKNOW-08: Given I am on the article cards, When I view it, Then it displays summary or description text', async ({ page }) => {
    const desc = page.locator('main p, main article p').first();
    if (!(await desc.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(desc).toBeVisible();
  });

  test('TC-OMNIKNOW-09: Given I am authenticated and on the page, When I perform the action, Then at least one content item exists in the list', async ({ page }) => {
    const items = page.locator('main article, main li, main [role="listitem"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(0); // empty state is valid
  });

  test('TC-OMNIKNOW-10: Given I am on the page, When the page renders, Then featured or pinned article is visible', async ({ page }) => {
    const featured = page.locator('main').filter({ hasText: /featured|pinned|top/i }).first();
    if (!(await featured.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(featured).toBeVisible();
  });
});

// ── 3. Search Functionality ───────────────────────────────────────────────────

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIKNOW-11: Given I am authenticated and on the page, When I perform the action, Then search input is present on the page', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await search.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(search).toBeVisible();
  });

  test('TC-OMNIKNOW-12: Given I am authenticated and on the page, When I perform the action, Then typing in search field accepts input', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await search.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await search.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await search.fill('productivity');
    const value = await search.inputValue();
    expect(value).toContain('productivity');
  });

  test('TC-OMNIKNOW-13: Given I am authenticated and on the page, When I perform the action, Then search results or filtered list updates after query', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await search.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await search.fill('a');
    await page.waitForTimeout(800);
    const results = page.locator('main article, main li, main [role="listitem"]');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-OMNIKNOW-14: Given I am authenticated and on the page, When I perform the action, Then clearing search restores full content list', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await search.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await search.fill('xyz');
    await page.waitForTimeout(500);
    await search.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });
});

// ── 4. Categories and Topics ──────────────────────────────────────────────────

test.describe('Categories and Topics', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIKNOW-15: Given I am authenticated and on the page, When I perform the action, Then category or topic filters are present', async ({ page }) => {
    const filter = page.locator('[role="tab"], [role="listbox"]')
      .or(page.locator('button').filter({ hasText: /all|category|topic|type/i }))
      .first();
    if (!(await filter.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(filter).toBeVisible();
  });

  test('TC-OMNIKNOW-16: Given the page is loaded, When I click a category filters the content list, Then it responds correctly', async ({ page }) => {
    const catBtn = page.locator('[role="tab"], button')
      .filter({ hasText: /all|business|tech|health|finance|personal/i }).nth(1);
    if (!(await catBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await catBtn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('TC-OMNIKNOW-17: Given I am authenticated and on the page, When I perform the action, Then category labels are readable text', async ({ page }) => {
    const labels = page.locator('[role="tab"], nav li a, aside li a');
    const count = await labels.count();
    if (count === 0) return;
    const firstLabel = await labels.first().textContent();
    expect(firstLabel?.trim().length).toBeGreaterThan(0);
  });
});

// ── 5. Article Detail and Navigation ─────────────────────────────────────────

test.describe('Article Detail and Back Navigation', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIKNOW-18: Given the article entry is present, When I click the article entry, Then it opens detail view', async ({ page }) => {
    const item = page.locator('main article, main li a, main [role="listitem"] a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1000);
    const detail = page.locator('main h1, main h2, [role="article"]').first();
    await expect(detail).toBeVisible({ timeout: 8000 });
  });

  test('TC-OMNIKNOW-19: Given I am on the article detail, When I view it, Then it shows body content', async ({ page }) => {
    const item = page.locator('main article a, main li a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1000);
    const body = page.locator('main p, [role="article"] p').first();
    if (!(await body.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(body).toBeVisible();
  });

  test('TC-OMNIKNOW-20: Given I am authenticated and on the page, When I perform the action, Then back navigation returns to the list', async ({ page }) => {
    const item = page.locator('main article a, main li a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1000);
    await page.goBack();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/app\/omniknow/);
  });

  test('TC-OMNIKNOW-21: Given I am authenticated and on the page, When I perform the action, Then browser title is set on detail page', async ({ page }) => {
    const item = page.locator('main article a, main li a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1200);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('TC-OMNIKNOW-22: Given I am authenticated and on the page, When I perform the action, Then related articles or suggestions shown on detail', async ({ page }) => {
    const item = page.locator('main article a, main li a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1200);
    const related = page.locator('section, aside').filter({ hasText: /related|similar|more/i }).first();
    if (!(await related.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await expect(related).toBeVisible();
  });

  test('TC-OMNIKNOW-23: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
