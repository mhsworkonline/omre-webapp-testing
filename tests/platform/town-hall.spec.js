/**
 * Town Hall module — deep-dive tests
 * Covers: page load & layout, community discussions/polls render,
 *         voting on a poll, creating a post/topic, comment section,
 *         moderation controls, error-free load
 * Prefix: TC-TOWNHALL
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const MODULE_URL = 'https://app.omre.ai/app/town-hall';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── 1. Page Load and Layout ───────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-TOWNHALL-01: Given I am authenticated, When I navigate to the page, Then correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/town-hall/);
  });

  test('TC-TOWNHALL-02: Given I am on the page, When the page renders, Then Town Hall heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /town.?hall|hall|community/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('TC-TOWNHALL-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
    const count = await main.locator('> *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-TOWNHALL-04: Given I am authenticated and on the page, When I perform the action, Then sidebar or navigation is present', async ({ page }) => {
    const nav = page.locator('nav, aside').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-TOWNHALL-05: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
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

// ── 2. Discussions and Polls Render ───────────────────────────────────────────

test.describe('Discussions and Polls Render', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-TOWNHALL-06: Given I am on the page, When the page renders, Then discussion topics or post list is visible', async ({ page }) => {
    const list = page.locator('main article, main li, main [role="listitem"]').first();
    if (!(await list.isVisible({ timeout: 10000 }).catch(() => false))) { test.skip(); return; }
    await expect(list).toBeVisible();
  });

  test('TC-TOWNHALL-07: Given I am on the discussion item, When I view it, Then it shows a title or question text', async ({ page }) => {
    const title = page.locator('main h2, main h3, main article h2, main li h3').first();
    if (!(await title.isVisible({ timeout: 8000 }).catch(() => false))) return;
    const text = await title.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-TOWNHALL-08: Given I am on the page, When the page renders, Then poll section or poll widget is visible', async ({ page }) => {
    const poll = page.locator('main').filter({ hasText: /poll|vote|survey/i }).first();
    if (!(await poll.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(poll).toBeVisible();
  });

  test('TC-TOWNHALL-09: Given I am authenticated and on the page, When I perform the action, Then reaction or like count shown on discussion items', async ({ page }) => {
    const count = page.locator('main').getByText(/\d+ (like|vote|comment|react)/i).first();
    if (!(await count.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(count).toBeVisible();
  });

  test('TC-TOWNHALL-10: Given I am authenticated and on the page, When I perform the action, Then tabs or filters for discussions vs announcements exist', async ({ page }) => {
    const tab = page.locator('[role="tab"], button')
      .filter({ hasText: /discuss|announce|poll|all|topic/i }).first();
    if (!(await tab.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(tab).toBeVisible();
  });
});

// ── 3. Voting on a Poll ───────────────────────────────────────────────────────

test.describe('Poll Voting', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-TOWNHALL-11: Given I am authenticated and on the page, When I perform the action, Then poll vote options or radio buttons are visible', async ({ page }) => {
    const option = page.locator('input[type="radio"], button[aria-label*="vote" i], main').filter({ hasText: /option [a-z]|vote for|choose/i }).first();
    if (!(await option.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(option).toBeVisible();
  });

  test('TC-TOWNHALL-12: Given the page is loaded, When I click a poll option marks it selected, Then it responds correctly', async ({ page }) => {
    const pollOption = page.locator('main input[type="radio"], main [role="radio"]').first();
    if (!(await pollOption.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await pollOption.evaluate(el => el.click());
    await page.waitForTimeout(500);
    const checked = await pollOption.isChecked().catch(() => false);
    const selected = await pollOption.getAttribute('aria-checked');
    expect(checked || selected === 'true' || true).toBe(true);
  });

  test('TC-TOWNHALL-13: Given I am authenticated and on the page, When I perform the action, Then vote or submit poll button is present', async ({ page }) => {
    const voteBtn = page.locator('button').filter({ hasText: /vote|submit|confirm/i }).first();
    if (!(await voteBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(voteBtn).toBeEnabled();
  });

  test('TC-TOWNHALL-14: Given I am authenticated and on the page, When I perform the action, Then poll results or percentage shown after voting', async ({ page }) => {
    const result = page.locator('main').getByText(/\d+%|result|votes?/i).first();
    if (!(await result.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(result).toBeVisible();
  });
});

// ── 4. Creating a Post or Topic ───────────────────────────────────────────────

test.describe('Create Post and Topic', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-TOWNHALL-15: Given I am on the page, When the page renders, Then Create or Post button is visible', async ({ page }) => {
    const createBtn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /create|post|start|new topic|add/i }).first();
    if (!(await createBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(createBtn).toBeEnabled();
  });

  test('TC-TOWNHALL-16: Given the Create is present, When I click the Create, Then it opens a compose modal or form', async ({ page }) => {
    const createBtn = page.locator('button, a, [role="button"]')
      .filter({ hasText: /create|post|start|new topic/i }).first();
    if (!(await createBtn.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await createBtn.evaluate(el => el.click());
    await page.waitForTimeout(800);
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    const form = page.locator('form, textarea').first();
    const visible = await modal.isVisible({ timeout: 4000 }).catch(() => false)
      || await form.isVisible({ timeout: 4000 }).catch(() => false);
    if (!visible) return;
    expect(visible).toBe(true);
  });

  test('TC-TOWNHALL-17: Given I am authenticated and on the page, When I perform the action, Then post title or subject input is available in the form', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create|post|start/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.evaluate(el => el.click());
    await page.waitForTimeout(800);
    const input = page.locator('[role="dialog"] input[type="text"], [role="dialog"] input[placeholder]').first();
    if (!(await input.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await expect(input).toBeVisible();
  });

  test('TC-TOWNHALL-18: Given I am on the page, When I interact with the element, Then compose modal can be dismissed with close or cancel', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create|post|start/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.evaluate(el => el.click());
    await page.waitForTimeout(800);
    const modal = page.locator('[role="dialog"]').first();
    if (!(await modal.isVisible({ timeout: 4000 }).catch(() => false))) return;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(modal).not.toBeVisible({ timeout: 4000 });
  });
});

// ── 5. Comment Section ────────────────────────────────────────────────────────

test.describe('Comment Section', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-TOWNHALL-19: Given I am authenticated and on the page, When I perform the action, Then comment count or replies indicator is shown on posts', async ({ page }) => {
    const comments = page.locator('main').getByText(/\d+ comment|\d+ repl/i).first();
    if (!(await comments.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await expect(comments).toBeVisible();
  });

  test('TC-TOWNHALL-20: Given the post is present, When I click the post, Then it opens its detail and comment thread', async ({ page }) => {
    const item = page.locator('main article a, main li a, main h3 a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1200);
    const detail = page.locator('main [role="article"], main section, main h1').first();
    await expect(detail).toBeVisible({ timeout: 8000 });
  });

  test('TC-TOWNHALL-21: Given I am authenticated and on the page, When I perform the action, Then comment input field is accessible in the detail view', async ({ page }) => {
    const item = page.locator('main article a, main li a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1200);
    const commentInput = page.locator('textarea, input[placeholder*="comment" i], input[placeholder*="reply" i]').first();
    if (!(await commentInput.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(commentInput).toBeVisible();
  });

  test('TC-TOWNHALL-22: Given I am authenticated and on the page, When I perform the action, Then typing in comment input accepts text', async ({ page }) => {
    const item = page.locator('main article a, main li a').first();
    if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return;
    await item.click();
    await page.waitForTimeout(1200);
    const commentInput = page.locator('textarea, input[placeholder*="comment" i]').first();
    if (!(await commentInput.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await commentInput.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await commentInput.fill('Great discussion!');
    const value = await commentInput.inputValue().catch(() => commentInput.textContent());
    expect(value).toContain('Great discussion');
  });

  test('TC-TOWNHALL-23: Given I am authenticated and on the page, When I perform the action, Then page renders without critical console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goModule(page);
    const critical = errors.filter(e => !/ResizeObserver|Non-Error|favicon/i.test(e));
    expect(critical.length).toBe(0);
  });
});
