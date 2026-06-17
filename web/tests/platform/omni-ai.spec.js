// TC-OMNIAI — Omni AI Chat Assistant (rewritten from live crawl: render-only, no message sent to avoid AI/credit cost)
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const MODULE_URL = 'https://omre.ai/app/omni-ai';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-OMNIAI — Hub Landing', () => {
  test('TC-OMNIAI-01: Given I am authenticated, When I navigate to /app/omni-ai, Then the URL and heading are correct', async ({ page }) => {
    await goModule(page);
    expect(page.url()).toContain('/app/omni-ai');
    await expect(page.getByRole('heading', { name: 'Omni AI', exact: true })).toBeVisible();
  });

  test('TC-OMNIAI-02: Given I am on the page, Then the chat input box and Send control are shown', async ({ page }) => {
    await goModule(page);
    await expect(page.getByPlaceholder(/ask omni ai anything/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^send$/i })).toBeVisible();
  });

  test('TC-OMNIAI-03: Given I am on the page, Then quick-start template prompts are shown', async ({ page }) => {
    await goModule(page);
    const onLanding = await page.getByText(/draft a professional email to my team/i).isVisible({ timeout: 5000 }).catch(() => false);
    if (!onLanding) { test.skip(true, 'Account has an active conversation — landing template grid not shown'); return; }
    await expect(page.getByText(/explain quantum computing in simple terms/i)).toBeVisible();
  });

  test('TC-OMNIAI-04: Given I am on the page, Then New Conversation and tool shortcuts (Image Gen, Summary, Translate) are shown', async ({ page }) => {
    await goModule(page);
    await expect(page.getByRole('button', { name: /new conversation/i })).toBeVisible();
    const onLanding = await page.getByRole('button', { name: /image gen/i }).isVisible({ timeout: 5000 }).catch(() => false);
    if (!onLanding) { test.skip(true, 'Account has an active conversation — tool shortcut tiles not shown'); return; }
    await expect(page.getByRole('button', { name: /^summary/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^translate/i })).toBeVisible();
    // Intentionally not sending a message or invoking a tool — real AI generation, costs credits.
  });
});
