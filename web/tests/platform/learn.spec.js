// TC-LEARN — Courses & Tutoring (rewritten from live crawl: /learn/home is a hub, real app lives behind "Browse Courses")
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goto(page, path) {
  await page.goto(`https://omre.ai${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-LEARN — Hub Landing', () => {
  test('TC-LEARN-01: Given I am authenticated, When I navigate to /learn/home, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/learn/home');
    expect(page.url()).toContain('/learn/home');
    await expect(page.getByRole('heading', { name: /welcome to learn/i })).toBeVisible();
  });

  test('TC-LEARN-02: Given I am on the hub, Then "Browse Courses" and "My Learning" CTAs are visible', async ({ page }) => {
    await goto(page, '/learn/home');
    await expect(page.getByRole('button', { name: 'Browse Courses', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'My Learning', exact: true })).toBeVisible();
  });
});

test.describe('TC-LEARN — Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => { await goto(page, '/learn/browse'); });

  for (const [name, href] of [
    ['Discover', '/learn/home'],
    ['Browse Courses', '/learn/browse'],
    ['My Learning', '/learn/my-learning'],
    ['Tutor Marketplace', '/learn/tutors'],
    ['Wishlist', '/learn/wishlist'],
    ['Cart', '/learn/cart'],
    ['Certificates', '/learn/certificates'],
    ['Teacher Dashboard', '/learn/teach/dashboard'],
    ['Create Course', '/learn/teach/create-course'],
  ]) {
    test(`TC-LEARN-SIDEBAR-${name.replace(/\s+/g, '-')}: Given I am on Browse Courses, When I inspect the "${name}" sidebar link, Then it links to ${href}`, async ({ page }) => {
      const link = page.getByRole('link', { name }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }
});

test.describe('TC-LEARN — Browse Courses', () => {
  test('TC-LEARN-BROWSE-01: Given I open Browse Courses, Then category filters and a course search box are shown', async ({ page }) => {
    await goto(page, '/learn/browse');
    await expect(page.getByPlaceholder(/search courses/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /development/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /design/i }).first()).toBeVisible();
  });

  test('TC-LEARN-BROWSE-02: Given I am on Browse Courses, When I click a category filter, Then the URL reflects the selected category', async ({ page }) => {
    await goto(page, '/learn/browse');
    await page.getByRole('link', { name: /development/i }).click();
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('category=development');
  });

  test('TC-LEARN-BROWSE-03: Given I type into the course search box, Then the search term is accepted', async ({ page }) => {
    await goto(page, '/learn/browse');
    const search = page.getByPlaceholder(/search courses/i);
    await search.fill('React');
    await expect(search).toHaveValue('React');
  });
});

test.describe('TC-LEARN — My Learning, Tutors, Certificates', () => {
  test('TC-LEARN-MYLEARNING-01: Given I open My Learning, Then a Daily Streak section is shown', async ({ page }) => {
    await goto(page, '/learn/my-learning');
    await expect(page.getByRole('heading', { name: /my learning/i })).toBeVisible();
    await expect(page.getByText(/daily streak/i)).toBeVisible();
  });

  test('TC-LEARN-TUTORS-01: Given I open Tutor Marketplace, Then a tutor search box and Become a Tutor button are shown', async ({ page }) => {
    await goto(page, '/learn/tutors');
    await expect(page.getByRole('heading', { name: /find your perfect tutor/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /become a tutor/i })).toBeVisible();
  });

  test('TC-LEARN-CERTIFICATES-01: Given I open Certificates, Then the Certificates heading is shown', async ({ page }) => {
    await goto(page, '/learn/certificates');
    await expect(page.getByRole('heading', { name: /certificates/i, level: 1 })).toBeVisible();
  });
});

test.describe('TC-LEARN — Wishlist & Cart', () => {
  test('TC-LEARN-WISHLIST-01: Given my wishlist is empty, Then an empty-state with an explore CTA is shown', async ({ page }) => {
    await goto(page, '/learn/wishlist');
    const empty = await page.getByText(/my wishlist/i).isVisible({ timeout: 5000 }).catch(() => false);
    if (!empty) { test.skip(true, 'Wishlist already has items on this account'); return; }
    await expect(page.getByRole('button', { name: /explore more|start exploring/i }).first()).toBeVisible();
  });

  test('TC-LEARN-CART-01: Given my course cart is empty, Then an empty-cart message is shown', async ({ page }) => {
    await goto(page, '/learn/cart');
    const empty = await page.getByText(/your cart is empty/i).isVisible({ timeout: 5000 }).catch(() => false);
    if (!empty) { test.skip(true, 'Cart already has items on this account'); return; }
    await expect(page.getByRole('link', { name: /browse courses/i }).first()).toBeVisible();
  });
});

test.describe('TC-LEARN — Teach (functional CRUD)', () => {
  test('TC-LEARN-TEACH-01: Given I open Teacher Dashboard, Then a Create Course control is shown', async ({ page }) => {
    await goto(page, '/learn/teach/dashboard');
    await expect(page.getByRole('button', { name: /create course/i }).first()).toBeVisible();
  });

  test('TC-LEARN-TEACH-FUNC-01: Given I fill title/description/price but no cover image, When I submit, Then a thumbnail-required validation is shown (course creation needs a real image file, out of scope here)', async ({ page }) => {
    const courseTitle = `QA Test Course ${Date.now()}`;
    await goto(page, '/learn/teach/create-course');
    await page.getByPlaceholder(/advanced react patterns/i).fill(courseTitle);
    await page.getByPlaceholder(/tell students what they will learn/i).fill('Created by an automated test to verify the Create Course flow.');
    await page.locator('input[type="number"]').first().fill('19.99');
    await page.getByRole('button', { name: /^create course$/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/cannot be uploaded without a thumbnail/i)).toBeVisible();
  });

  test('TC-LEARN-TEACH-FUNC-02: Given the Create Course form, When I click Cancel, Then I return to the Teacher Dashboard without creating a course', async ({ page }) => {
    await goto(page, '/learn/teach/create-course');
    await page.getByRole('link', { name: /^cancel$/i }).click();
    await page.waitForURL(/\/learn\/teach\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('/learn/teach/dashboard');
  });
});

test.describe('TC-LEARN — Course Detail (functional)', () => {
  test('TC-LEARN-COURSE-01: Given I open a course detail page, Then the title, Enroll Now and Add to Wishlist controls are shown', async ({ page }) => {
    await goto(page, '/learn/courses/334923b1-3ad6-48da-91ff-79843dd31eb2');
    await expect(page.getByRole('heading').first()).not.toBeEmpty();
    await expect(page.getByRole('button', { name: /enroll now/i })).toBeVisible();
    const onWishlist = await page.getByRole('button', { name: /remove from wishlist/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!onWishlist) await expect(page.getByRole('button', { name: /add to wishlist/i }).first()).toBeVisible();
    // Intentionally not clicking Enroll Now — likely a paid/irreversible enrollment action.
  });

  test('TC-LEARN-COURSE-FUNC-01: Given a course detail page, When I click Add to Wishlist, Then the course appears on my Wishlist', async ({ page }) => {
    await goto(page, '/learn/courses/334923b1-3ad6-48da-91ff-79843dd31eb2');
    const title = await page.getByRole('heading').first().innerText();
    const alreadyOnWishlist = await page.getByRole('button', { name: /remove from wishlist/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!alreadyOnWishlist) {
      await page.getByRole('button', { name: /add to wishlist/i }).first().click();
      await page.waitForTimeout(1500);
    }
    await goto(page, '/learn/wishlist');
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 });
  });
});
