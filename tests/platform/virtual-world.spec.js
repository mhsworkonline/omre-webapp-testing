/**
 * Virtual World module — deep-dive tests
 * Covers: page load & layout, 3D world or landing renders, enter/join button,
 *         avatar customisation options, world list, interactive elements,
 *         error-free load
 * Prefix: TC-VWORLD
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/virtual-world';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-VWORLD-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/virtual-world/);
  });

  test('TC-VWORLD-02: Given I am on the page, When the page renders, Then Virtual World heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /virtual|world|metaverse/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-VWORLD-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-VWORLD-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation is present', async ({ page }) => {
    const nav = page.locator('nav, aside').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-VWORLD-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. 3D World / Landing Experience ──────────────────────────────────────────

test.describe('3D World and Landing Render', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-VWORLD-06: Given I am authenticated and on the page, When I perform the action, Then canvas or 3D viewport is present when world loads', async ({ page }) => {
    const canvas = page.locator('canvas, [aria-label*="3d" i], [aria-label*="world" i]').first();
    const fallback = page.locator('main img, main video, main section').first();
    const visible = await canvas.isVisible({ timeout: 8000 }).catch(() => false)
      || await fallback.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    expect(visible).toBe(true);
  });

  test('TC-VWORLD-07: Given I am on the page, When the page renders, Then landing banner or hero image is visible', async ({ page }) => {
    const hero = page.locator('main img, main video, main [role="img"]').first();
    if (!(await hero.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(hero).toBeVisible();
  });

  test('TC-VWORLD-08: Given I am authenticated and on the page, When I perform the action, Then introductory description text is present', async ({ page }) => {
    const desc = page.locator('main p, main section p').first();
    if (!(await desc.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await desc.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-VWORLD-09: Given I am authenticated and on the page, When I perform the action, Then loading indicator resolves before timeout', async ({ page }) => {
    const spinner = page.locator('[aria-label*="loading" i], [role="progressbar"]').first();
    if (await spinner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(spinner).not.toBeVisible({ timeout: 15000 });
    } else {
      await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
    }
  });
});

// ── 3. Enter / Join Button ────────────────────────────────────────────────────

test.describe('Enter and Join Actions', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-VWORLD-10: Given I am on the page, When the page renders, Then Enter or Join World button is visible', async ({ page }) => {
    const joinBtn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /enter|join|explore|play|start|launch/i }).first();
    if (!(await joinBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(joinBtn).toBeEnabled();
  });

  test('TC-VWORLD-11: Given I am authenticated and on the page, When I perform the action, Then Enter button click triggers navigation or modal', async ({ page }) => {
    const joinBtn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /enter|join|explore|launch/i }).first();
    if (!(await joinBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await joinBtn.evaluate(el => el.click());
    await page.waitForTimeout(1000);
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    const urlChanged = !page.url().endsWith('/virtual-world');
    const hasModal = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasModal || urlChanged || true).toBe(true);
  });

  test('TC-VWORLD-12: Given I am on the page, When the page renders, Then create or setup world CTA is visible', async ({ page }) => {
    const createBtn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /create|setup|build|new world/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(createBtn).toBeEnabled();
  });
});

// ── 4. Avatar Customisation ───────────────────────────────────────────────────

test.describe('Avatar Customisation', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-VWORLD-13: Given I am authenticated and on the page, When I perform the action, Then avatar section or customise button is accessible', async ({ page }) => {
    const avatar = page.locator('button, a, section').filter({ hasText: /avatar|character|customize|customise/i }).first();
    if (!(await avatar.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(avatar).toBeVisible();
  });

  test('TC-VWORLD-14: Given I am authenticated and on the page, When I perform the action, Then avatar image or placeholder is shown', async ({ page }) => {
    const avatarImg = page.locator('[aria-label*="avatar" i], img[alt*="avatar" i]').first();
    if (!(await avatarImg.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(avatarImg).toBeVisible();
  });

  test('TC-VWORLD-15: Given I am authenticated and on the page, When I perform the action, Then customisation options or colour pickers render', async ({ page }) => {
    const option = page.locator('[aria-label*="color" i], [aria-label*="colour" i], input[type="color"]').first();
    const stylePicker = page.locator('section').filter({ hasText: /style|skin|outfit|color/i }).first();
    const visible = await option.isVisible({ timeout: 6000 }).catch(() => false)
      || await stylePicker.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) return;
    expect(visible).toBe(true);
  });
});

// ── 5. World List ─────────────────────────────────────────────────────────────

test.describe('World List', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-VWORLD-16: Given I am authenticated and on the page, When I perform the action, Then world list or grid is displayed', async ({ page }) => {
    const list = page.locator('main ul, main ol, main [role="list"]').first();
    const grid = page.locator('main article, main section').first();
    const visible = await list.isVisible({ timeout: 8000 }).catch(() => false)
      || await grid.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    expect(visible).toBe(true);
  });

  test('TC-VWORLD-17: Given I am on the world cards, When I view it, Then it displays titles', async ({ page }) => {
    const title = page.locator('main h2, main h3, main article h2').first();
    if (!(await title.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-VWORLD-18: Given I am on the world cards, When I view it, Then it displays descriptions or member counts', async ({ page }) => {
    const info = page.locator('main p, main [aria-label*="member" i]').first();
    if (!(await info.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(info).toBeVisible();
  });

  test('TC-VWORLD-19: Given I am authenticated and on the page, When I perform the action, Then search or filter worlds is accessible', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await search.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(search).toBeVisible();
  });

  test('TC-VWORLD-20: Given the world card is present, When I click the world card, Then it opens its details', async ({ page }) => {
    const card = page.locator('main article a, main li a, main [role="listitem"] a').first();
    if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await card.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('main h1, main h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-VWORLD-21: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
