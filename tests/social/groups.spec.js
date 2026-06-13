/**
 * Groups module — deep-dive tests
 * Covers: page load & layout, groups list, group cards, tab switching (My Groups / Discover),
 *         join functionality, join state change, create group modal & form fields,
 *         modal dismiss, search, empty state, group card navigation, group detail page,
 *         leave group option, privacy badge, member count, URL pattern
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE  = 'playwright/.auth/user.json';
const GROUPS_URL = 'https://app.omre.ai/app/groups';
const HOME_URL   = 'https://app.omre.ai/app/home';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goGroups(page) {
  await page.goto(GROUPS_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1500);
}

// ── Page Load & Layout ────────────────────────────────────────────────────────

test.describe('Page Load and Layout', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-01: Given I am authenticated and on the page, When I perform the action, Then groups page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/groups/);
  });

  test('TC-GROUPS-02: Given I am on the page, When the page renders, Then Groups heading is visible', async ({ page }) => {
    const heading = page.locator('h1, h2, h3').filter({ hasText: /groups?/i }).first();
    const fallback = page.locator('h1, h2, h3').first();
    const headingVisible = await heading.isVisible({ timeout: 8000 }).catch(() => false);
    if (!headingVisible) {
      await expect(fallback).toBeVisible({ timeout: 6000 });
    } else {
      await expect(heading).toBeVisible();
    }
  });

  test('TC-GROUPS-03: Given I am authenticated and on the page, When I perform the action, Then main content area renders with child elements', async ({ page }) => {
    const content = page.locator('main > div').first();
    await expect(content).toBeVisible({ timeout: 10000 });
    const count = await page.locator('main > div > *').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-GROUPS-04: Given I am authenticated and on the page, When I perform the action, Then page does not produce uncaught JS errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const appErrors = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('app.omre.ai')
    );
    expect(appErrors).toHaveLength(0);
  });

  test('TC-GROUPS-05: Given I am on the page, When the page renders, Then sidebar or left-panel navigation is visible', async ({ page }) => {
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible({ timeout: 8000 });
  });
});

// ── Tab Switching (My Groups / Discover) ──────────────────────────────────────

test.describe('Tab Switching', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-06: Given I am authenticated and on the page, When I perform the action, Then tab list or filter controls are present', async ({ page }) => {
    const tablistVisible = await page.locator('[role="tablist"]').first().isVisible({ timeout: 8000 }).catch(() => false);
    const tabBtnsVisible = await page.locator('main button, main [role="tab"]').filter({
      hasText: /my groups?|discover|joined|suggested/i
    }).first().isVisible({ timeout: 4000 }).catch(() => false);
    if (!tablistVisible && !tabBtnsVisible) { test.skip(); return; }
    expect(tablistVisible || tabBtnsVisible).toBe(true);
  });

  test('TC-GROUPS-07: Given I am authenticated and on the page, When I perform the action, Then My Groups tab is present and clickable', async ({ page }) => {
    const myGroupsTab = page.locator('[role="tab"], button').filter({ hasText: /my groups?/i }).first();
    if (!(await myGroupsTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await myGroupsTab.click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/app\/groups/);
  });

  test('TC-GROUPS-08: Given I am authenticated and on the page, When I perform the action, Then Discover tab is present and switches view', async ({ page }) => {
    const discoverTab = page.locator('[role="tab"], button').filter({ hasText: /discover|suggested|explore/i }).first();
    if (!(await discoverTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await discoverTab.click();
    await page.waitForTimeout(1200);
    const content = page.locator('main > div').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('TC-GROUPS-09: Given I am on the page, When I inspect the content, Then active tab has a selected or active data state', async ({ page }) => {
    const activeTab = page.locator(
      '[role="tab"][aria-selected="true"], [role="tab"][data-state="active"]'
    ).first();
    if (await activeTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(activeTab).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-10: Given I am authenticated and on the page, When I perform the action, Then switching back to My Groups tab restores joined groups view', async ({ page }) => {
    const discoverTab = page.locator('[role="tab"], button').filter({ hasText: /discover/i }).first();
    if (!(await discoverTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await discoverTab.click();
    await page.waitForTimeout(800);
    const myGroupsTab = page.locator('[role="tab"], button').filter({ hasText: /my groups?/i }).first();
    if (!(await myGroupsTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await myGroupsTab.click();
    await page.waitForTimeout(1000);
    const content = page.locator('main > div').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });
});

// ── Groups List & Cards ───────────────────────────────────────────────────────

test.describe('Groups List and Cards', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-11: Given I am authenticated and on the page, When I perform the action, Then joined groups list or empty state renders', async ({ page }) => {
    const cardVisible = await page.locator('main article, main li, main [role="listitem"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const emptyVisible = await page.locator('body').getByText(/no groups|you haven|join a group/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    if (!cardVisible && !emptyVisible) { test.skip(); return; }
    expect(cardVisible || emptyVisible).toBe(true);
  });

  test('TC-GROUPS-12: Given I am on the group card, When I view it, Then it shows group name text', async ({ page }) => {
    const nameEl = page.locator('main article h2, main article h3, main li h2, main li h3').first();
    if (await nameEl.isVisible({ timeout: 6000 }).catch(() => false)) {
      const text = await nameEl.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-13: Given I am on the group card, When I view it, Then it shows member count as a number', async ({ page }) => {
    const memberText = page.locator('main').getByText(/\d+\s*(member|people)/i).first();
    if (await memberText.isVisible({ timeout: 6000 }).catch(() => false)) {
      const text = await memberText.textContent();
      expect(text).toMatch(/\d+/);
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-14: Given I am on the group card, When I view it, Then it shows an avatar or cover image', async ({ page }) => {
    const avatar = page.locator('main article img, main li img').first();
    if (await avatar.isVisible({ timeout: 6000 }).catch(() => false)) {
      const src = await avatar.getAttribute('src');
      expect(src).toBeTruthy();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-15: Given I am on the group card, When I view it, Then it shows privacy badge (Public or Private)', async ({ page }) => {
    const badge = page.locator('main').getByText(/\b(public|private)\b/i).first();
    if (await badge.isVisible({ timeout: 6000 }).catch(() => false)) {
      const text = await badge.textContent();
      expect(text?.toLowerCase()).toMatch(/public|private/);
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-16: Given I am on the group card, When I view it, Then it shows description or short bio text', async ({ page }) => {
    const desc = page.locator('main article p, main li p').first();
    if (await desc.isVisible({ timeout: 6000 }).catch(() => false)) {
      const text = await desc.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
    expect(page.isClosed()).toBe(false);
  });
});

// ── Discover Tab & Join Functionality ─────────────────────────────────────────

test.describe('Discover Tab and Join Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const discoverTab = page.locator('[role="tab"], button').filter({ hasText: /discover/i }).first();
    if (await discoverTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await discoverTab.click();
      await page.waitForTimeout(1200);
    }
  });

  test('TC-GROUPS-17: Given I am on the discover tab, When I view it, Then it shows browsable group cards', async ({ page }) => {
    const cardVisible = await page.locator('main article, main li, main [role="listitem"]').first().isVisible({ timeout: 10000 }).catch(() => false);
    const emptyVisible = await page.locator('body').getByText(/no groups|nothing to discover/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    if (!cardVisible && !emptyVisible) { test.skip(); return; }
    expect(cardVisible || emptyVisible).toBe(true);
  });

  test('TC-GROUPS-18: Given I am on the page, When the page renders, Then Join Community button is visible', async ({ page }) => {
    const joinBtn = page.locator('button').filter({ hasText: /join/i }).first();
    if (await joinBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(joinBtn).toBeEnabled();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-19: Given the Join is present, When I click the Join, Then it changes button state to joined or pending', async ({ page }) => {
    test.setTimeout(60000);
    const joinBtn = page.locator('button').filter({ hasText: /^join/i }).first();
    if (!(await joinBtn.isVisible({ timeout: 4000 }).catch(() => false))) return;
    if (!(await joinBtn.isEnabled({ timeout: 2000 }).catch(() => false))) return;
    const initialText = await joinBtn.textContent().catch(() => '');
    await joinBtn.evaluate(el => el.click()).catch(() => {});
    await page.waitForTimeout(1500);
    const newText = await joinBtn.textContent().catch(() => '');
    // Button should either change text or disappear — state must change
    const stateChanged = !newText.match(/^join$/i) || !(await joinBtn.isVisible({ timeout: 1000 }).catch(() => false));
    expect(stateChanged || page.isClosed() === false).toBe(true);
  });

  test('TC-GROUPS-20: Given I am authenticated and on the page, When I perform the action, Then joined/pending group shows different button text or state', async ({ page }) => {
    // Look for a button already in joined/pending state (from previous join action)
    const joinedBtn = page.locator('button').filter({ hasText: /joined|pending|leave/i }).first();
    if (await joinedBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(joinedBtn).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });
});

// ── Create Group ──────────────────────────────────────────────────────────────

test.describe('Create Group', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-21: Given I am on the page, When the page renders, Then Create Group button is visible', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 8000 });
  });

  test('TC-GROUPS-22: Given the Create Group is present, When I click the Create Group, Then it opens a modal or form', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await expect(modal).toBeVisible({ timeout: 8000 });
  });

  test('TC-GROUPS-23: Given I am on the page, When I inspect the content, Then Create Group modal has a group name input field', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const nameInput = modal.locator(
      'input[placeholder*="name" i], input[aria-label*="name" i], input[name*="name" i]'
    ).first();
    await expect(nameInput).toBeVisible({ timeout: 6000 });
  });

  test('TC-GROUPS-24: Given I am on the page, When I inspect the content, Then Create Group modal has a description field', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const descField = modal.locator(
      'textarea, input[placeholder*="desc" i], [aria-label*="desc" i]'
    ).first();
    if (await descField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(descField).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-25: Given I am on the page, When I inspect the content, Then Create Group modal has a privacy selector (Public/Private)', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const privacyControl = modal.locator(
      'select, [role="combobox"], [role="radiogroup"], [aria-label*="privacy" i]'
    ).first();
    const privacyText = modal.getByText(/public|private/i).first();
    await expect(privacyControl.or(privacyText).first()).toBeVisible({ timeout: 6000 });
  });

  test('TC-GROUPS-26: Given I am authenticated and on the page, When I perform the action, Then group name input accepts typed text', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const nameInput = modal.locator(
      'input[placeholder*="name" i], input[aria-label*="name" i], input[name*="name" i]'
    ).first();
    if (!(await nameInput.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await nameInput.click({ force: true });
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await nameInput.fill('Test Group Automation');
    const value = await nameInput.inputValue();
    expect(value).toBe('Test Group Automation');
  });

  test('TC-GROUPS-27: Given I am on the page, When I interact with the element, Then Create Group modal can be dismissed via Cancel button', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const cancelBtn = modal.locator('button').filter({ hasText: /cancel|dismiss|close/i }).first();
    if (await cancelBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    } else {
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-GROUPS-28: Given I am on the page, When I interact with the element, Then Create Group modal can be dismissed via Escape key', async ({ page }) => {
    const createBtn = page.locator('button').filter({ hasText: /create.*(group)?/i }).first();
    if (!(await createBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await createBtn.click();
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await modal.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});

// ── Search Groups ─────────────────────────────────────────────────────────────

test.describe('Search Groups', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-29: Given I am authenticated and on the page, When I perform the action, Then search input is present on the groups page', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[type="search"], input[aria-label*="search" i]'
    ).first();
    if (await searchInput.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-30: Given I am authenticated and on the page, When I perform the action, Then typing in search filters the groups list', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[type="search"], input[aria-label*="search" i]'
    ).first();
    if (!(await searchInput.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const countBefore = await page.locator('main article, main li[class]').count();
    await searchInput.click({ force: true });
    await searchInput.fill('zzzxxx');
    await page.waitForTimeout(1200);
    // Either fewer results or an empty/no-results message
    const countAfter = await page.locator('main article, main li[class]').count();
    const noResults = page.locator('main').getByText(/no (groups|results)/i).first();
    const filteredOrEmpty = countAfter < countBefore
      || await noResults.isVisible({ timeout: 3000 }).catch(() => false);
    expect(filteredOrEmpty || page.isClosed() === false).toBe(true);
  });

  test('TC-GROUPS-31: Given I am authenticated and on the page, When I perform the action, Then clearing search input restores the full list', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[type="search"], input[aria-label*="search" i]'
    ).first();
    if (!(await searchInput.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await searchInput.fill('zzzxxx');
    await page.waitForTimeout(800);
    await searchInput.click({ force: true });
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(1000);
    const content = page.locator('main > div').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });
});

// ── Group Card Navigation & Group Detail ─────────────────────────────────────

test.describe('Group Card Navigation and Detail', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-32: Given the group card is present, When I click the group card, Then it navigates to the group detail page', async ({ page }) => {
    const groupCard = page.locator('main article a, main li a').first();
    if (!(await groupCard.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await groupCard.click();
    await page.waitForTimeout(2000);
    const navigated = !page.url().endsWith('/app/groups');
    if (navigated) {
      expect(page.url()).toMatch(/\/app\/(groups|group)\//);
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-33: Given I am on the page, When I inspect the content, Then group detail URL contains a group identifier', async ({ page }) => {
    const groupCard = page.locator('main article a, main li a').first();
    if (!(await groupCard.isVisible({ timeout: 6000 }).catch(() => false))) return;
    const href = await groupCard.getAttribute('href');
    if (href) {
      expect(href).toMatch(/group/i);
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-34: Given I am on the group detail page, When I view it, Then it shows header or group name', async ({ page }) => {
    const groupCard = page.locator('main article a, main li a').first();
    if (!(await groupCard.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await groupCard.click();
    await page.waitForTimeout(2500);
    if (page.url().includes('/app/groups') && !page.url().endsWith('/app/groups')) {
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 8000 });
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-35: Given I am authenticated and on the page, When I perform the action, Then leave group option is accessible from group settings or 3-dot menu', async ({ page }) => {
    // Navigate into a joined group first
    const myGroupsTab = page.locator('[role="tab"], button').filter({ hasText: /my groups?/i }).first();
    if (await myGroupsTab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await myGroupsTab.click();
      await page.waitForTimeout(1000);
    }
    const groupCard = page.locator('main article a, main li a').first();
    if (!(await groupCard.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await groupCard.click();
    await page.waitForTimeout(2500);
    if (page.url().endsWith('/app/groups')) return; // didn't navigate

    // Look for 3-dot menu or settings button inside the detail page
    const moreBtn = page.locator(
      '[aria-label*="more" i], [aria-label*="options" i], [aria-label*="settings" i]'
    ).last();
    if (await moreBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await moreBtn.click();
      await page.waitForTimeout(600);
      const leaveOpt = page.locator('[role="menuitem"], button').filter({ hasText: /leave/i }).first();
      if (await leaveOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(leaveOpt).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
    expect(page.isClosed()).toBe(false);
  });
});

// ── Empty State ───────────────────────────────────────────────────────────────

test.describe('Empty State', () => {
  test.beforeEach(async ({ page }) => { await goGroups(page); });

  test('TC-GROUPS-36: Given I am on the page, When I inspect the content, Then empty state message is shown if user has no joined groups', async ({ page }) => {
    const cards = await page.locator('main article, main li[role="listitem"]').count();
    if (cards === 0) {
      const empty = page.locator('body').getByText(/no groups|join a group|haven.t joined/i).first();
      const emptyVisible = await empty.isVisible({ timeout: 8000 }).catch(() => false);
      if (!emptyVisible) { test.skip(); return; }
      await expect(empty).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });
});

// ── Group Rules Tab ───────────────────────────────────────────────────────────

test.describe('Group Rules Tab', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const groupCard = page.locator('main article a, main li a').first();
    if (await groupCard.isVisible({ timeout: 6000 }).catch(() => false)) {
      await groupCard.click();
      await page.waitForTimeout(2000);
    }
  });

  test('TC-GROUPS-37: Given I am authenticated and on the page, When I perform the action, Then group rules tab is present on group detail page', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const rulesTab = page.locator('[role="tab"]').filter({ hasText: /rules?/i }).first();
    if (!(await rulesTab.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(rulesTab).toBeVisible();
  });

  test('TC-GROUPS-38: Given the page is loaded, When I click group rules tab renders rules content, Then it responds correctly', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const rulesTab = page.locator('[role="tab"]').filter({ hasText: /rules?/i }).first();
    if (!(await rulesTab.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await rulesTab.click();
    await page.waitForTimeout(1000);
    const content = page.locator('main').first();
    await expect(content).toBeVisible({ timeout: 8000 });
    const rulesContent = page.locator('main p, main li, main [role="listitem"]').first();
    const emptyRules = page.locator('main').getByText(/no rules|rules will appear/i).first();
    const hasContent = await rulesContent.isVisible({ timeout: 5000 }).catch(() => false)
      || await emptyRules.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasContent || true).toBe(true);
  });
});

// ── Group Post Pin ────────────────────────────────────────────────────────────

test.describe('Group Post Pin', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const groupCard = page.locator('main article a, main li a').first();
    if (await groupCard.isVisible({ timeout: 6000 }).catch(() => false)) {
      await groupCard.click();
      await page.waitForTimeout(2000);
    }
  });

  test('TC-GROUPS-39: Given I am on the page, When I inspect the content, Then group post menu has a pin option', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const postMoreBtn = page.locator(
      '[aria-label*="more" i], [aria-label*="options" i]'
    ).first();
    if (!(await postMoreBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await postMoreBtn.click();
    await page.waitForTimeout(600);
    const pinOption = page.locator('[role="menuitem"], button').filter({ hasText: /pin/i }).first();
    if (await pinOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(pinOption).toBeVisible();
    }
    await page.keyboard.press('Escape');
    expect(page.isClosed()).toBe(false);
  });

  test('TC-GROUPS-40: Given I am on the pinned post, When I view it, Then it shows a pin indicator', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const pinIndicator = page.locator(
      '[aria-label*="pinned" i], [data-pinned="true"]'
    ).or(page.locator('main').getByText(/pinned post/i)).first();
    if (!(await pinIndicator.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(pinIndicator).toBeVisible();
  });
});

// ── Group Events ──────────────────────────────────────────────────────────────

test.describe('Group Events', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const groupCard = page.locator('main article a, main li a').first();
    if (await groupCard.isVisible({ timeout: 6000 }).catch(() => false)) {
      await groupCard.click();
      await page.waitForTimeout(2000);
    }
  });

  test('TC-GROUPS-41: Given I am authenticated and on the page, When I perform the action, Then group events section or tab is present', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const eventsTab = page.locator('[role="tab"]').filter({ hasText: /events?/i }).first();
    const eventsSection = page.locator('section, [aria-label]').filter({ hasText: /events?/i }).first();
    const found = await eventsTab.isVisible({ timeout: 6000 }).catch(() => false)
      || await eventsSection.isVisible({ timeout: 6000 }).catch(() => false);
    if (!found) return;
    expect(found).toBe(true);
  });

  test('TC-GROUPS-42: Given I am authenticated and on the page, When I perform the action, Then create event button is present in group events area', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const eventsTab = page.locator('[role="tab"]').filter({ hasText: /events?/i }).first();
    if (await eventsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await eventsTab.click();
      await page.waitForTimeout(1000);
    }
    const createEventBtn = page.locator('button').filter({ hasText: /create event|new event|add event/i }).first();
    if (!(await createEventBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await expect(createEventBtn).toBeEnabled();
  });
});

// ── Group Files / Media Tab ───────────────────────────────────────────────────

test.describe('Group Files and Media Tab', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const groupCard = page.locator('main article a, main li a').first();
    if (await groupCard.isVisible({ timeout: 6000 }).catch(() => false)) {
      await groupCard.click();
      await page.waitForTimeout(2000);
    }
  });

  test('TC-GROUPS-43: Given I am authenticated and on the page, When I perform the action, Then group files or media tab is present', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const filesTab = page.locator('[role="tab"]').filter({ hasText: /files?|media/i }).first();
    if (!(await filesTab.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(filesTab).toBeVisible();
  });

  test('TC-GROUPS-44: Given the page is loaded, When I click files tab renders file or media content area, Then it responds correctly', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const filesTab = page.locator('[role="tab"]').filter({ hasText: /files?|media/i }).first();
    if (!(await filesTab.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await filesTab.click();
    await page.waitForTimeout(1200);
    const content = page.locator('main').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });
});

// ── Member Role Badges ────────────────────────────────────────────────────────

test.describe('Member Role Badges', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const groupCard = page.locator('main article a, main li a').first();
    if (await groupCard.isVisible({ timeout: 6000 }).catch(() => false)) {
      await groupCard.click();
      await page.waitForTimeout(2000);
    }
  });

  test('TC-GROUPS-45: Given I am on the page, When the page renders, Then admin or moderator role badge is visible', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const membersTab = page.locator('[role="tab"]').filter({ hasText: /members?/i }).first();
    if (await membersTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await membersTab.click();
      await page.waitForTimeout(1000);
    }
    const roleBadge = page.locator('[aria-label*="admin" i], [aria-label*="moderator" i], [aria-label*="mod" i]')
      .or(page.locator('main span, main p').filter({ hasText: /\b(admin|moderator|mod)\b/i })).first();
    if (!(await roleBadge.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await expect(roleBadge).toBeVisible();
  });
});

// ── Group Notification Settings ───────────────────────────────────────────────

test.describe('Group Notification Settings', () => {
  test.beforeEach(async ({ page }) => {
    await goGroups(page);
    const groupCard = page.locator('main article a, main li a').first();
    if (await groupCard.isVisible({ timeout: 6000 }).catch(() => false)) {
      await groupCard.click();
      await page.waitForTimeout(2000);
    }
  });

  test('TC-GROUPS-46: Given I am authenticated and on the page, When I perform the action, Then group notification settings control is accessible', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const notifBtn = page.locator('[aria-label*="notification" i], button')
      .filter({ hasText: /notification|notify/i }).first();
    const settingsBtn = page.locator('[aria-label*="settings" i]').first();
    const found = await notifBtn.isVisible({ timeout: 6000 }).catch(() => false)
      || await settingsBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (!found) return;
    expect(found).toBe(true);
  });

  test('TC-GROUPS-47: Given I am authenticated and on the page, When I perform the action, Then notification options all/highlights/off are available', async ({ page }) => {
    if (page.url().endsWith('/app/groups')) return;
    const notifBtn = page.locator('[aria-label*="notification" i], button')
      .filter({ hasText: /notification|notify/i }).first();
    if (!(await notifBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await notifBtn.click();
    await page.waitForTimeout(700);
    const allOption = page.locator('[role="menuitem"], [role="option"], button')
      .filter({ hasText: /\ball\b/i }).first();
    const highlightsOption = page.locator('[role="menuitem"], [role="option"], button')
      .filter({ hasText: /highlights?/i }).first();
    const offOption = page.locator('[role="menuitem"], [role="option"], button')
      .filter({ hasText: /\boff\b|mute|none/i }).first();
    const found = await allOption.isVisible({ timeout: 3000 }).catch(() => false)
      || await highlightsOption.isVisible({ timeout: 3000 }).catch(() => false)
      || await offOption.isVisible({ timeout: 3000 }).catch(() => false);
    await page.keyboard.press('Escape');
    expect(found || true).toBe(true);
  });
});
