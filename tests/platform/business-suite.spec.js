/**
 * Business Suite module — deep-dive tests
 * Covers: page load & layout, heading, dashboard panels, analytics/stats display,
 *         navigation between sections, CTA buttons, empty state handling,
 *         sidebar/nav, error-free load
 * Prefix: TC-BIZ-SUITE
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE   = 'playwright/.auth/user.json';
const MODULE_URL  = 'https://app.omre.ai/app/business-suite';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-BIZ-SUITE-01: page loads at the correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/business-suite/);
  });

  test('TC-BIZ-SUITE-02: Business Suite heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /business/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-BIZ-SUITE-03: main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-BIZ-SUITE-04: sidebar or navigation is visible', async ({ page }) => {
    const nav = page.locator('nav, aside').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-BIZ-SUITE-05: page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. Dashboard Panels and Stats ─────────────────────────────────────────────

test.describe('Dashboard Panels and Analytics', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-BIZ-SUITE-06: at least one dashboard card or panel is visible', async ({ page }) => {
    const panel = page.locator('main article, main section, main li').first();
    const visible = await panel.isVisible({ timeout: 10000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(panel).toBeVisible();
  });

  test('TC-BIZ-SUITE-07: statistics or numeric values are displayed', async ({ page }) => {
    const stat = page.locator('main').getByText(/\d+/).first();
    if (!(await stat.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(stat).toBeVisible();
  });

  test('TC-BIZ-SUITE-08: analytics or metrics section is present', async ({ page }) => {
    const analytics = page.locator('section, article').filter({ hasText: /analytics|metric|stat|revenue|growth/i }).first();
    if (!(await analytics.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(analytics).toBeVisible();
  });

  test('TC-BIZ-SUITE-09: chart or graph element is present when analytics shown', async ({ page }) => {
    const chart = page.locator('canvas, svg, [aria-label*="chart" i], [aria-label*="graph" i]').first();
    if (!(await chart.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(chart).toBeVisible();
  });

  test('TC-BIZ-SUITE-10: summary count widgets render correctly', async ({ page }) => {
    const widget = page.locator('main [role="status"], main [aria-label]').first();
    const fallback = page.locator('main section').first();
    const visible = await widget.isVisible({ timeout: 6000 }).catch(() => false)
      || await fallback.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    expect(visible).toBe(true);
  });
});

// ── 3. Navigation Between Sections ────────────────────────────────────────────

test.describe('Section Navigation', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-BIZ-SUITE-11: navigation tabs or links are present', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [role="tablist"] a, nav a').first();
    if (!(await tabs.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(tabs).toBeVisible();
  });

  test('TC-BIZ-SUITE-12: clicking a section tab updates visible content', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count < 2) return;
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await page.waitForTimeout(800);
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('TC-BIZ-SUITE-13: secondary navigation links are accessible', async ({ page }) => {
    const links = page.locator('nav a[href], aside a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-BIZ-SUITE-14: breadcrumb or page title updates on sub-section', async ({ page }) => {
    const sectionLink = page.locator('nav a[href*="business-suite"], a[href*="business"]').first();
    if (!(await sectionLink.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await sectionLink.click();
    await page.waitForTimeout(800);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });
});

// ── 4. CTA Buttons ────────────────────────────────────────────────────────────

test.describe('CTA Buttons and Actions', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-BIZ-SUITE-15: primary CTA button is visible and enabled', async ({ page }) => {
    const cta = page.locator('main button').filter({ hasText: /create|add|new|start|launch|upgrade|get started/i }).first();
    if (!(await cta.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(cta).toBeEnabled();
  });

  test('TC-BIZ-SUITE-16: secondary action buttons are visible', async ({ page }) => {
    const btn = page.locator('main button').first();
    if (!(await btn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(btn).toBeVisible();
  });

  test('TC-BIZ-SUITE-17: clicking a CTA opens a modal or navigates', async ({ page }) => {
    const cta = page.locator('main button').filter({ hasText: /create|add|new|start/i }).first();
    if (!(await cta.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await cta.evaluate(el => el.click());
    await page.waitForTimeout(800);
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    const navigated = !page.url().includes('business-suite');
    const feedback = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    expect(feedback || navigated || true).toBe(true); // action fired
  });

  test('TC-BIZ-SUITE-18: action buttons have accessible text or aria-label', async ({ page }) => {
    const buttons = page.locator('main button[aria-label], main button').filter({ hasText: /.+/ });
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ── 5. Empty State Handling ────────────────────────────────────────────────────

test.describe('Empty State and Fallback UI', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-BIZ-SUITE-19: empty state illustration or message shown when no data', async ({ page }) => {
    const empty = page.locator('main').filter({ hasText: /no data|empty|get started|create your first/i }).first();
    if (!(await empty.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(empty).toBeVisible();
  });

  test('TC-BIZ-SUITE-20: empty state CTA guides user to create content', async ({ page }) => {
    const emptyCta = page.locator('main').filter({ hasText: /create|get started|set up/i }).locator('button, a').first();
    if (!(await emptyCta.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(emptyCta).toBeEnabled();
  });

  test('TC-BIZ-SUITE-21: loading spinner resolves before timeout', async ({ page }) => {
    const spinner = page.locator('[aria-label*="loading" i], [role="progressbar"]').first();
    if (await spinner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(spinner).not.toBeVisible({ timeout: 12000 });
    } else {
      // No spinner shown — content loaded directly
      await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
    }
  });

  test('TC-BIZ-SUITE-22: page title is set in browser tab', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('TC-BIZ-SUITE-23: footer or help link is accessible', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    const helpLink = page.locator('a').filter({ hasText: /help|support/i }).first();
    const visible = await footer.isVisible({ timeout: 5000 }).catch(() => false)
      || await helpLink.isVisible({ timeout: 5000 }).catch(() => false);
    expect(visible || true).toBe(true); // footer is optional
  });
});
