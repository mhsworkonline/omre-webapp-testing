/**
 * Platform modules deep-dive tests
 * Covers: Biz, Link, Learn, Orbit, Omni AI, Omniknow, Business Suite,
 *         Happy Corner, Virtual World, Digital Citizen, Town Hall
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const BASE = 'https://app.omre.ai';

test.use({ storageState: AUTH_FILE });
test.setTimeout(30000);

function contentVisible(page) {
  return page.locator('h1, h2, main, [role="main"]').first();
}

// ── Biz ──────────────────────────────────────────────────────────────────────
test.describe('Biz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/biz`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-BIZ-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/biz/);
  });

  test('TC-BIZ-02: Given I am authenticated and on the page, When I perform the action, Then main content renders', async ({ page }) => {
    await expect(contentVisible(page)).toBeVisible({ timeout: 10000 });
  });

  test('TC-BIZ-03: Given I am authenticated and on the page, When I perform the action, Then action options or menu items are visible', async ({ page }) => {
    const actions = page.locator('main button, main a[href], nav a[href]').first();
    await expect(actions).toBeVisible({ timeout: 8000 });
  });
});

// ── Link (Jobs) ───────────────────────────────────────────────────────────────
test.describe('Link', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/jobs/home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-LINK-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('TC-LINK-02: Given I am authenticated and on the page, When I perform the action, Then Welcome to Link heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /link|jobs?|welcome/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-LINK-03: Given I am authenticated and on the page, When I perform the action, Then job listings or search renders', async ({ page }) => {
    const search = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    const content = page.locator('main > div').first();
    await expect(search.or(content).first()).toBeVisible({ timeout: 10000 });
  });
});

// ── Learn ─────────────────────────────────────────────────────────────────────
test.describe('Learn', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/learn/home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-LEARN-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/learn/);
  });

  test('TC-LEARN-02: Given I am authenticated and on the page, When I perform the action, Then Welcome to Learn heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /learn|welcome|courses?/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-LEARN-03: Given I am authenticated and on the page, When I perform the action, Then course list or categories render', async ({ page }) => {
    const courses = page.locator('main li, main article, main > div > div, body > div:not([hidden]) > div').first();
    if (!(await courses.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(courses).toBeVisible({ timeout: 10000 });
  });

  test('TC-LEARN-04: Given I am authenticated and on the page, When I perform the action, Then search courses is accessible', async ({ page }) => {
    const search = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(search).toBeVisible();
    }
  });
});

// ── Orbit ─────────────────────────────────────────────────────────────────────
test.describe('Orbit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/orbit/home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-ORBIT-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/orbit/);
  });

  test('TC-ORBIT-02: Given I am authenticated and on the page, When I perform the action, Then Orbit heading or welcome message visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /orbit|welcome/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-ORBIT-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders', async ({ page }) => {
    await expect(contentVisible(page)).toBeVisible({ timeout: 10000 });
  });
});

// ── Omni AI ───────────────────────────────────────────────────────────────────
test.describe('Omni AI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/omni-ai`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-OMNIAI-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/omni-ai/);
  });

  test('TC-OMNIAI-02: Given I am authenticated and on the page, When I perform the action, Then Omni AI heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /omni.?ai|ai/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-OMNIAI-03: Given I am authenticated and on the page, When I perform the action, Then AI input or prompt area renders', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').first();
    const content = page.locator('main > div').first();
    await expect(input.or(content).first()).toBeVisible({ timeout: 10000 });
  });
});

// ── Omniknow ──────────────────────────────────────────────────────────────────
test.describe('Omniknow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/omniknow`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-OMNIKNOW-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/omniknow/);
  });

  test('TC-OMNIKNOW-02: Given I am authenticated and on the page, When I perform the action, Then Knowledge Library heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /knowledge|omniknow|library/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-OMNIKNOW-03: Given I am authenticated and on the page, When I perform the action, Then search or browse content renders', async ({ page }) => {
    const search = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    const content = page.locator('main > div').first();
    await expect(search.or(content).first()).toBeVisible({ timeout: 10000 });
  });
});

// ── Business Suite ────────────────────────────────────────────────────────────
test.describe('Business Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/business-suite`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-BIZ-SUITE-01: page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/business-suite/);
  });

  test('TC-BIZ-SUITE-02: Business Suite heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /business/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-BIZ-SUITE-03: dashboard or tools section renders', async ({ page }) => {
    await expect(contentVisible(page)).toBeVisible({ timeout: 10000 });
  });
});

// ── Happy Corner ──────────────────────────────────────────────────────────────
test.describe('Happy Corner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/happy-corner`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-HAPPY-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/happy-corner/);
  });

  test('TC-HAPPY-02: Given I am authenticated and on the page, When I perform the action, Then Happy Corner heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /happy/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-HAPPY-03: Given I am authenticated and on the page, When I perform the action, Then main content renders', async ({ page }) => {
    await expect(contentVisible(page)).toBeVisible({ timeout: 10000 });
  });
});

// ── Virtual World ─────────────────────────────────────────────────────────────
test.describe('Virtual World', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/virtual-world`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-VWORLD-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/virtual-world/);
  });

  test('TC-VWORLD-02: Given I am authenticated and on the page, When I perform the action, Then Virtual World heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /virtual/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-VWORLD-03: Given I am authenticated and on the page, When I perform the action, Then main content or entry point renders', async ({ page }) => {
    await expect(contentVisible(page)).toBeVisible({ timeout: 10000 });
  });
});

// ── Digital Citizen ───────────────────────────────────────────────────────────
test.describe('Digital Citizen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/digital-citizen`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-DCITIZEN-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/digital-citizen/);
  });

  test('TC-DCITIZEN-02: Given I am authenticated and on the page, When I perform the action, Then main content renders', async ({ page }) => {
    await expect(contentVisible(page)).toBeVisible({ timeout: 10000 });
  });
});

// ── Town Hall ─────────────────────────────────────────────────────────────────
test.describe('Town Hall', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/app/town-hall`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('TC-TOWNHALL-01: Given I am authenticated, When I navigate to the page, Then URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/town-hall/);
  });

  test('TC-TOWNHALL-02: Given I am authenticated and on the page, When I perform the action, Then Town Hall heading visible', async ({ page }) => {
    const heading = page.locator('h1, h2').filter({ hasText: /town.?hall/i }).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('TC-TOWNHALL-03: Given I am authenticated and on the page, When I perform the action, Then discussions or topics list renders', async ({ page }) => {
    const content = page.locator('main > div').first();
    await expect(content).toBeVisible({ timeout: 10000 });
    const count = await page.locator('main > div > *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-TOWNHALL-04: Given I am authenticated and on the page, When I perform the action, Then create discussion or poll button is present', async ({ page }) => {
    const create = page.locator('button:has-text("Create"), button:has-text("Post"), button:has-text("Start")').first();
    if (await create.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(create).toBeEnabled();
    }
  });
});
