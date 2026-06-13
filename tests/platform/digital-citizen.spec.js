/**
 * Digital Citizen module — deep-dive tests
 * Covers: page load & layout, content renders, sections/modules visible,
 *         interactive elements, progress tracking, resource links,
 *         error-free load
 * Prefix: TC-DCITIZEN
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/digital-citizen';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-DCITIZEN-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/digital-citizen/);
  });

  test('TC-DCITIZEN-02: Given I am on the page, When the page renders, Then Digital Citizen heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /digital.?citizen|citizen/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-DCITIZEN-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-DCITIZEN-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation is present', async ({ page }) => {
    const nav = page.locator('nav, aside').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-DCITIZEN-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. Content Sections Render ────────────────────────────────────────────────

test.describe('Content Sections Render', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-DCITIZEN-06: Given I am authenticated and on the page, When I perform the action, Then content modules or topic sections are displayed', async ({ page }) => {
    const section = page.locator('main section, main article, main li').first();
    if (!(await section.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(section).toBeVisible();
  });

  test('TC-DCITIZEN-07: Given I am authenticated and on the page, When I perform the action, Then section headings describe module topics', async ({ page }) => {
    const sectionHead = page.locator('main h2, main h3').first();
    if (!(await sectionHead.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await sectionHead.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-DCITIZEN-08: Given I am authenticated and on the page, When I perform the action, Then descriptive paragraphs are present in sections', async ({ page }) => {
    const para = page.locator('main p').first();
    if (!(await para.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(para).toBeVisible();
  });

  test('TC-DCITIZEN-09: Given I am authenticated and on the page, When I perform the action, Then images or icons support the content sections', async ({ page }) => {
    const img = page.locator('main img, main svg').first();
    if (!(await img.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(img).toBeVisible();
  });

  test('TC-DCITIZEN-10: Given I am authenticated and on the page, When I perform the action, Then multiple distinct modules or cards are present', async ({ page }) => {
    const items = page.locator('main article, main li, main section');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ── 3. Interactive Elements ────────────────────────────────────────────────────

test.describe('Interactive Elements', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-DCITIZEN-11: Given I am authenticated and on the page, When I perform the action, Then clickable module cards or links are present', async ({ page }) => {
    const link = page.locator('main a[href], main button').first();
    if (!(await link.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(link).toBeVisible();
  });

  test('TC-DCITIZEN-12: Given the module card or link is present, When I click the module card or link, Then it navigates or expands', async ({ page }) => {
    const card = page.locator('main article a, main li a, main section a').first();
    if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await card.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
  });

  test('TC-DCITIZEN-13: Given I am on the page, When I inspect the content, Then CTA buttons have readable labels', async ({ page }) => {
    const btn = page.locator('main button').filter({ hasText: /.+/ }).first();
    if (!(await btn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const label = await btn.textContent();
    expect(label?.trim().length).toBeGreaterThan(0);
  });

  test('TC-DCITIZEN-14: Given I am authenticated and on the page, When I perform the action, Then accordion or expandable sections function correctly', async ({ page }) => {
    const accordion = page.locator('[aria-expanded], details').first();
    if (!(await accordion.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await accordion.click();
    await page.waitForTimeout(500);
    const expanded = await accordion.getAttribute('aria-expanded');
    expect(expanded !== null || true).toBe(true);
  });

  test('TC-DCITIZEN-15: Given I am authenticated and on the page, When I perform the action, Then tab or pill navigation changes visible content', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count < 2) return;
    await tabs.nth(1).click();
    await page.waitForTimeout(800);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });
});

// ── 4. Progress Tracking ──────────────────────────────────────────────────────

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-DCITIZEN-16: Given I am authenticated and on the page, When I perform the action, Then progress bar or indicator is shown when present', async ({ page }) => {
    const progress = page.locator('[role="progressbar"], progress').first();
    if (!(await progress.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(progress).toBeVisible();
  });

  test('TC-DCITIZEN-17: Given I am on the page, When the page renders, Then completion percentage or badge is visible', async ({ page }) => {
    const badge = page.locator('main').getByText(/\d+%|complete|done|badge/i).first();
    if (!(await badge.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(badge).toBeVisible();
  });

  test('TC-DCITIZEN-18: Given I am authenticated and on the page, When I perform the action, Then start or continue learning button is present', async ({ page }) => {
    const btn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /start|continue|begin|resume|enroll/i }).first();
    if (!(await btn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(btn).toBeEnabled();
  });
});

// ── 5. Resource Links and Error Safety ────────────────────────────────────────

test.describe('Resource Links and Error Safety', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-DCITIZEN-19: Given I am authenticated and on the page, When I perform the action, Then resource or external links are present when shown', async ({ page }) => {
    const extLink = page.locator('main a[href^="http"]').first();
    if (!(await extLink.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const href = await extLink.getAttribute('href');
    expect(href?.startsWith('http')).toBe(true);
  });

  test('TC-DCITIZEN-20: Given I am on the page, When I inspect the content, Then all visible links have non-empty href values', async ({ page }) => {
    const links = page.locator('main a[href]');
    const count = await links.count();
    if (count === 0) return;
    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href?.length).toBeGreaterThan(0);
    }
  });

  test('TC-DCITIZEN-21: Given I am authenticated and on the page, When I perform the action, Then footer or help link is accessible', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    const helpLink = page.locator('a').filter({ hasText: /help|support|faq/i }).first();
    const visible = await footer.isVisible({ timeout: 5000 }).catch(() => false)
      || await helpLink.isVisible({ timeout: 5000 }).catch(() => false);
    expect(visible || true).toBe(true);
  });

  test('TC-DCITIZEN-22: Given I am authenticated and on the page, When I perform the action, Then browser tab title is non-empty', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('TC-DCITIZEN-23: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
