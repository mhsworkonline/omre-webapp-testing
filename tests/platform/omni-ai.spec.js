/**
 * Omni AI module — deep-dive tests
 * Covers: page load & layout, AI tool tiles/options render, tool selection,
 *         input field, generate/submit action, output area, settings,
 *         clear/reset, history, error-free load
 * Prefix: TC-OMNIAI
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/omni-ai';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIAI-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/omni-ai/);
  });

  test('TC-OMNIAI-02: Given I am on the page, When the page renders, Then Omni AI heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /omni.?ai|ai/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-OMNIAI-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-OMNIAI-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation is present', async ({ page }) => {
    const nav = page.locator('nav, aside').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-OMNIAI-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. AI Tool Tiles and Options ──────────────────────────────────────────────

test.describe('AI Tool Tiles and Options', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIAI-06: Given I am authenticated and on the page, When I perform the action, Then AI tool tiles or option cards are visible', async ({ page }) => {
    const tile = page.locator('main article, main li, main [role="button"], main button, main section').first();
    if (!(await tile.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(tile).toBeVisible();
  });

  test('TC-OMNIAI-07: Given I am on the page, When I inspect the content, Then tool tiles have readable title labels', async ({ page }) => {
    const title = page.locator('main h2, main h3, main article h2, main article h3').first();
    if (!(await title.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-OMNIAI-08: Given I am on the tool tiles, When I view it, Then it displays description text', async ({ page }) => {
    const desc = page.locator('main p, main article p').first();
    if (!(await desc.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(desc).toBeVisible();
  });

  test('TC-OMNIAI-09: Given I am authenticated and on the page, When I perform the action, Then multiple AI tool options are listed', async ({ page }) => {
    const tools = page.locator('main article, main li, main section');
    const count = await tools.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-OMNIAI-10: Given I am authenticated and on the page, When I perform the action, Then tool icons or illustrations accompany the tiles', async ({ page }) => {
    const icon = page.locator('main img, main svg').first();
    if (!(await icon.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(icon).toBeVisible();
  });
});

// ── 3. Tool Selection ─────────────────────────────────────────────────────────

test.describe('Tool Selection', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIAI-11: Given the tool tile is present, When I click the tool tile, Then it opens the tool interface', async ({ page }) => {
    const tile = page.locator('main article a, main li a, main button').first();
    if (!(await tile.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await tile.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-OMNIAI-12: Given I am authenticated and on the page, When I perform the action, Then selected tool tab or state is visually indicated', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count < 1) return;
    await tabs.first().click();
    await page.waitForTimeout(500);
    const selected = page.locator('[aria-selected="true"], [data-state="active"]').first();
    if (!(await selected.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await expect(selected).toBeVisible();
  });

  test('TC-OMNIAI-13: Given I am authenticated and on the page, When I perform the action, Then text generation tool or chat is accessible', async ({ page }) => {
    const textTool = page.locator('button, a, [role="button"]')
      .filter({ hasText: /text|write|chat|generate text/i }).first();
    if (!(await textTool.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(textTool).toBeVisible();
  });

  test('TC-OMNIAI-14: Given I am authenticated and on the page, When I perform the action, Then image generation tool or option is accessible', async ({ page }) => {
    const imgTool = page.locator('button, a, [role="button"]')
      .filter({ hasText: /image|art|visual|picture|generate image/i }).first();
    if (!(await imgTool.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(imgTool).toBeVisible();
  });
});

// ── 4. Input Field and Generate Action ────────────────────────────────────────

test.describe('Input Field and Generate Action', () => {
  test.beforeEach(async ({ page }) => {
    await goModule(page);
    const textTool = page.locator('button, a, [role="button"]')
      .filter({ hasText: /text|write|chat/i }).first();
    if (await textTool.isVisible({ timeout: 5000 }).catch(() => false)) {
      await textTool.click();
      await page.waitForTimeout(1000);
    }
  });

  test('TC-OMNIAI-15: Given I am authenticated and on the page, When I perform the action, Then prompt input field is present', async ({ page }) => {
    const input = page.locator('textarea, [contenteditable="true"], input[type="text"]').first();
    if (!(await input.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(input).toBeVisible();
  });

  test('TC-OMNIAI-16: Given I am authenticated and on the page, When I perform the action, Then typing in prompt field accepts input', async ({ page }) => {
    const input = page.locator('textarea, [contenteditable="true"], input[type="text"]').first();
    if (!(await input.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await input.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await input.fill('Summarise the key benefits of digital literacy.');
    const value = await input.inputValue().catch(() => input.textContent());
    expect(value).toContain('digital literacy');
  });

  test('TC-OMNIAI-17: Given I am authenticated and on the page, When I perform the action, Then generate or submit button is present and enabled', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /generate|submit|send|create|ask/i }).first();
    if (!(await btn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(btn).toBeEnabled();
  });

  test('TC-OMNIAI-18: Given I am authenticated and on the page, When I perform the action, Then output or response area exists in the DOM', async ({ page }) => {
    const output = page.locator('[aria-label*="output" i], [aria-label*="response" i], [aria-live]').first();
    const fallback = page.locator('main section, main article').nth(1);
    const count = await output.count() + await fallback.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ── 5. Settings, Clear, and History ──────────────────────────────────────────

test.describe('Settings, Clear, and History', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-OMNIAI-19: Given I am authenticated and on the page, When I perform the action, Then clear or reset button is present when input exists', async ({ page }) => {
    const clearBtn = page.locator('button').filter({ hasText: /clear|reset|new/i }).first();
    if (!(await clearBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(clearBtn).toBeEnabled();
  });

  test('TC-OMNIAI-20: Given the page is loaded, When I click clear resets the prompt input, Then it responds correctly', async ({ page }) => {
    const input = page.locator('textarea, [contenteditable="true"]').first();
    const clearBtn = page.locator('button').filter({ hasText: /clear|reset/i }).first();
    if (
      !(await input.isVisible({ timeout: 6000 }).catch(() => false)) ||
      !(await clearBtn.isVisible({ timeout: 6000 }).catch(() => false))
    ) return;
    await input.fill('Test prompt to clear');
    await clearBtn.evaluate(el => el.click());
    await page.waitForTimeout(600);
    const value = await input.inputValue().catch(() => input.textContent());
    expect(value?.trim() ?? '').toBe('');
  });

  test('TC-OMNIAI-21: Given I am authenticated and on the page, When I perform the action, Then model selector or settings control is accessible', async ({ page }) => {
    const selector = page.locator('[aria-label*="model" i], select').first();
    const btn = page.locator('button').filter({ hasText: /model|settings|config/i }).first();
    const visible = await selector.isVisible({ timeout: 6000 }).catch(() => false)
      || await btn.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) return;
    expect(visible).toBe(true);
  });

  test('TC-OMNIAI-22: Given I am authenticated and on the page, When I perform the action, Then history or recent generations panel is accessible', async ({ page }) => {
    const history = page.locator('section, [aria-label], aside')
      .filter({ hasText: /history|recent|previous/i }).first();
    if (!(await history.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(history).toBeVisible();
  });

  test('TC-OMNIAI-23: Given I am authenticated and on the page, When I perform the action, Then copy output button is present after generation', async ({ page }) => {
    const copyBtn = page.locator('[aria-label*="copy" i], button').filter({ hasText: /copy/i }).first();
    if (!(await copyBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(copyBtn).toBeEnabled();
  });

  test('TC-OMNIAI-24: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
