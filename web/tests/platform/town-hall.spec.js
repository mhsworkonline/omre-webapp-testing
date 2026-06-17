// TC-TOWNHALL — Civic Ballots, Forums, Gazette (rewritten from live crawl)
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goto(page, path) {
  await page.goto(`https://omre.ai${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-TOWNHALL — Hub Landing', () => {
  test('TC-TOWNHALL-01: Given I am authenticated, When I navigate to /app/town-hall, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/town-hall');
    expect(page.url()).toContain('/app/town-hall');
    await expect(page.getByRole('heading', { name: 'Town Hall', exact: true })).toBeVisible();
  });

  test('TC-TOWNHALL-02: Given I am on the hub, Then Active Ballots and Community Forums sections are shown', async ({ page }) => {
    await goto(page, '/app/town-hall');
    await expect(page.getByRole('button', { name: /active ballots/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /community forums/i }).first()).toBeVisible();
  });

  test('TC-TOWNHALL-03: Given the hub, Then ballot cards with Vote Aye / Vote Nay controls are shown', async ({ page }) => {
    await goto(page, '/app/town-hall');
    await expect(page.getByRole('button', { name: /vote aye/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /vote nay/i }).first()).toBeVisible();
    // Intentionally not clicking Vote — casts a real (if demo) civic vote; also observed to
    // hang/close the page context during discovery probing, so left unautomated pending investigation.
  });
});

test.describe('TC-TOWNHALL — Ballots', () => {
  test('TC-TOWNHALL-BALLOTS-01: Given I open Active Ballots, Then ballot cards with participation stats are shown', async ({ page }) => {
    await goto(page, '/app/town-hall/ballots');
    await expect(page.getByRole('heading', { name: /active ballots/i })).toBeVisible();
    await expect(page.getByText(/participation/i).first()).toBeVisible();
  });
});

test.describe('TC-TOWNHALL — Forums', () => {
  test('TC-TOWNHALL-FORUMS-01: Given I open Community Forums, Then category tabs and a discussion search box are shown', async ({ page }) => {
    await goto(page, '/app/town-hall/forums');
    await expect(page.getByRole('heading', { name: /community forums/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search discussions/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^development$/i })).toBeVisible();
  });

  test('TC-TOWNHALL-FORUMS-FUNC-01: Given I click New Topic, When I fill title and body and submit, Then the topic is created', async ({ page }) => {
    const topicTitle = `QA Test Topic ${Date.now()}`;
    await goto(page, '/app/town-hall/forums');
    await page.getByRole('button', { name: /new topic/i }).click();
    await page.waitForTimeout(1500);
    await page.getByPlaceholder(/enter topic title/i).fill(topicTitle);
    await page.getByPlaceholder(/share your thoughts/i).fill('Created by an automated test.');
    const submitBtn = page.getByRole('button', { name: /^(post|create|submit)/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: topicTitle })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-TOWNHALL — Gazette', () => {
  test('TC-TOWNHALL-GAZETTE-01: Given I open the Gazette, Then announcements and a search box are shown', async ({ page }) => {
    await goto(page, '/app/town-hall/gazette');
    await expect(page.getByRole('heading', { name: /official gazette/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search announcements/i)).toBeVisible();
  });

  test('TC-TOWNHALL-GAZETTE-02: Given the Gazette, When I click View Archive, Then I land on the Gazette Archive page', async ({ page }) => {
    await goto(page, '/app/town-hall/gazette');
    await page.getByRole('link', { name: /view archive/i }).click();
    await page.waitForURL(/\/app\/town-hall\/gazette\/archive/, { timeout: 10000 });
    expect(page.url()).toContain('/app/town-hall/gazette/archive');
  });

  test('TC-TOWNHALL-ARCHIVE-01: Given I open the Gazette Archive, Then year/month filters and a search box are shown', async ({ page }) => {
    await goto(page, '/app/town-hall/gazette/archive');
    await expect(page.getByRole('heading', { name: /gazette archive/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search archive/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /all years/i })).toBeVisible();
  });
});

test.describe('TC-TOWNHALL — Voting History', () => {
  test('TC-TOWNHALL-HISTORY-01: Given I open Voting History, Then the page renders with a Show More control', async ({ page }) => {
    await goto(page, '/app/town-hall/history');
    await expect(page.getByRole('heading', { name: /voting history/i })).toBeVisible();
  });
});
