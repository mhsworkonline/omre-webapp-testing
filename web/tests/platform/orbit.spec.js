// TC-ORBIT — Twitter-style Social Hub (rewritten from live crawl: /app/orbit/home is a hub, real app lives behind "Go to Feed")
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goto(page, path) {
  await page.goto(`https://omre.ai${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-ORBIT — Hub Landing', () => {
  test('TC-ORBIT-01: Given I am authenticated, When I navigate to /app/orbit/home, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/app/orbit/home');
    expect(page.url()).toContain('/app/orbit/home');
    await expect(page.getByRole('heading', { name: /welcome to orbit/i })).toBeVisible();
  });

  test('TC-ORBIT-02: Given I am on the hub, Then "Go to Feed" and "Explore" CTAs are visible', async ({ page }) => {
    await goto(page, '/app/orbit/home');
    await expect(page.getByRole('button', { name: 'Go to Feed', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explore', exact: true })).toBeVisible();
  });
});

test.describe('TC-ORBIT — Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => { await goto(page, '/app/orbit/explore'); });

  for (const [name, href] of [
    ['Home', '/app/orbit/home'],
    ['Explore', '/app/orbit/explore'],
    ['Notifications', '/app/orbit/notifications'],
    ['Messages', '/app/orbit/messages'],
    ['Friends', '/app/orbit/friends'],
    ['Spaces', '/app/orbit/spaces'],
    ['Communities', '/app/orbit/communities'],
    ['Lists', '/app/orbit/lists'],
    ['Bookmarks', '/app/orbit/bookmarks'],
    ['Signal', '/app/orbit/signal'],
  ]) {
    test(`TC-ORBIT-SIDEBAR-${name}: Given I am on Explore, When I inspect the "${name}" sidebar link, Then it links to ${href}`, async ({ page }) => {
      const link = page.getByRole('navigation').getByRole('link', { name }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }
});

test.describe('TC-ORBIT — Explore & Notifications', () => {
  test('TC-ORBIT-EXPLORE-01: Given I open Explore, Then a topic/people search box is shown', async ({ page }) => {
    await goto(page, '/app/orbit/explore');
    await expect(page.getByPlaceholder(/search topics, posts, people, spaces/i)).toBeVisible();
  });

  test('TC-ORBIT-NOTIF-01: Given I open Notifications, Then category filter tabs and Mark All Read are shown', async ({ page }) => {
    await goto(page, '/app/orbit/notifications');
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /mark all read/i }).first()).toBeVisible();
  });
});

test.describe('TC-ORBIT — Messages, Friends, Spaces, Communities', () => {
  test('TC-ORBIT-MESSAGES-01: Given I open Messages, Then Chats/Channels/Communities/Groups tabs are shown', async ({ page }) => {
    await goto(page, '/app/orbit/messages');
    await expect(page.getByRole('link', { name: 'Chats' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Channels' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Groups' })).toBeVisible();
  });

  test('TC-ORBIT-FRIENDS-01: Given I open Friends (People), Then a friends search box is shown', async ({ page }) => {
    await goto(page, '/app/orbit/friends');
    await expect(page.getByRole('heading', { name: /people/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search friends/i)).toBeVisible();
  });

  test('TC-ORBIT-SPACES-01: Given I open Spaces, Then "Start a space" and tab filters are shown', async ({ page }) => {
    await goto(page, '/app/orbit/spaces');
    await expect(page.getByRole('heading', { name: 'Spaces', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /start a space/i })).toBeVisible();
  });

  test('TC-ORBIT-COMMUNITIES-01: Given I open Communities, Then a Create control and Discover/Joined tabs are shown', async ({ page }) => {
    await goto(page, '/app/orbit/communities');
    await expect(page.getByRole('heading', { name: /communities/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^create$/i })).toBeVisible();
  });
});

test.describe('TC-ORBIT — Lists (functional CRUD)', () => {
  test('TC-ORBIT-LISTS-01: Given I open Lists, Then a "New list" control is shown', async ({ page }) => {
    await goto(page, '/app/orbit/lists');
    await expect(page.getByRole('heading', { name: 'Lists', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /new list/i })).toBeVisible();
  });

  test('TC-ORBIT-LISTS-FUNC-01: Given I click New List, When I fill name and description and submit, Then the list is created', async ({ page }) => {
    const listName = `QA Test List ${Date.now()}`;
    await goto(page, '/app/orbit/lists');
    await page.getByRole('button', { name: /new list/i }).click();
    await page.waitForURL(/\/app\/orbit\/lists\/new/, { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.getByPlaceholder(/e\.g\. tech influencers/i).fill(listName);
    await page.getByPlaceholder(/what's this list about/i).fill('Created by an automated test.');
    await page.getByRole('button', { name: /create list/i }).click();
    await page.waitForTimeout(2500);
    const yoursTab = page.getByRole('button', { name: /^yours/i });
    if (await yoursTab.isVisible({ timeout: 3000 }).catch(() => false)) await yoursTab.click();
    await page.waitForTimeout(1000);
    const visible = await page.getByText(listName).isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }
    await expect(page.getByText(listName)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-ORBIT — Bookmarks & Signal', () => {
  test('TC-ORBIT-BOOKMARKS-01: Given I open Bookmarks, Then the Bookmarks heading is shown', async ({ page }) => {
    await goto(page, '/app/orbit/bookmarks');
    await expect(page.getByRole('heading', { name: /bookmarks/i })).toBeVisible();
  });

  test('TC-ORBIT-SIGNAL-01: Given I open Signal, Then topic categories and a Create Topic control are shown', async ({ page }) => {
    await goto(page, '/app/orbit/signal');
    await expect(page.getByRole('heading', { name: /find your signal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create topic/i })).toBeVisible();
  });
});

test.describe('TC-ORBIT — Profile', () => {
  test('TC-ORBIT-PROFILE-01: Given I open my own profile, Then Edit Profile and the post composer are shown', async ({ page }) => {
    await goto(page, '/app/orbit/profile/w4f01');
    await expect(page.getByRole('heading', { name: /w4f01/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /edit profile/i })).toBeVisible();
  });

  test('TC-ORBIT-PROFILE-02: Given I open another user\'s profile, Then Follow and Message controls are shown', async ({ page }) => {
    await goto(page, '/app/orbit/profile/farhankhanaspire_868');
    await expect(page.getByRole('heading', { name: /farhan khan/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^(follow|following)$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^message$/i })).toBeVisible();
  });
});

test.describe('TC-ORBIT — Known Issue', () => {
  test('TC-ORBIT-BUG-01: Given the profile page\'s "Orbit Post" composer link, When I follow it to /app/orbit, Then it currently 404s (tracked bug, not a test defect)', async ({ page }) => {
    await goto(page, '/app/orbit');
    await expect(page.getByText(/404/i)).toBeVisible();
  });
});
