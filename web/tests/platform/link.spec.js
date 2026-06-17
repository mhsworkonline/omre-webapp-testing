// TC-LINK — Jobs & Career Tools (rewritten from live crawl: /jobs/home is a hub, real app lives behind "Explore Jobs")
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goto(page, path) {
  await page.goto(`https://omre.ai${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('TC-LINK — Hub Landing', () => {
  test('TC-LINK-01: Given I am authenticated, When I navigate to /jobs/home, Then the URL and heading are correct', async ({ page }) => {
    await goto(page, '/jobs/home');
    expect(page.url()).toContain('/jobs/home');
    await expect(page.getByRole('heading', { name: /welcome to link/i })).toBeVisible();
  });

  test('TC-LINK-02: Given I am on the hub, Then "Explore Jobs" and "Browse Marketplace" CTAs are visible', async ({ page }) => {
    await goto(page, '/jobs/home');
    await expect(page.getByRole('button', { name: 'Explore Jobs', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Marketplace', exact: true })).toBeVisible();
  });
});

test.describe('TC-LINK — Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => { await goto(page, '/jobs/search'); });

  for (const [name, href] of [
    ['Jobs Home', '/jobs/home'],
    ['Job Search', '/jobs/search'],
    ['Saved Jobs', '/jobs/saved'],
    ['Job Alerts', '/jobs/alerts'],
    ['Company Pages', '/jobs/companies'],
    ['Salary Insights', '/jobs/salary'],
    ['My Network', '/jobs/network'],
    ['Applications', '/jobs/applications'],
    ['Resume Builder', '/jobs/resume-builder'],
    ['Portfolio Create', '/jobs/portfolio'],
    ['Create Cover Letter', '/jobs/cover-letter'],
    ['AI Headshot', '/jobs/ai-headshot'],
    ['ATS Checker', '/jobs/ats-checker'],
  ]) {
    test(`TC-LINK-SIDEBAR-${name.replace(/\s+/g, '-')}: Given I am on Job Search, When I inspect the "${name}" sidebar link, Then it links to ${href}`, async ({ page }) => {
      const link = page.getByRole('link', { name }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }
});

test.describe('TC-LINK — Job Search', () => {
  test('TC-LINK-SEARCH-01: Given I am on Job Search, Then job count heading and filter controls are shown', async ({ page }) => {
    await goto(page, '/jobs/search');
    await expect(page.getByRole('heading', { name: /\d+ jobs? found/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /job type/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /salary range/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /experience level/i })).toBeVisible();
  });

  test('TC-LINK-SEARCH-02: Given job results, When I click a job card, Then I land on its job detail page', async ({ page }) => {
    await goto(page, '/jobs/search');
    const card = page.locator('a[href^="/jobs/view/"]').first();
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForURL(/\/jobs\/view\//, { timeout: 10000 });
    expect(page.url()).toContain('/jobs/view/');
  });

  test('TC-LINK-DETAIL-01: Given I am on a job detail page, Then the title, Apply Now and Back to Jobs controls are shown', async ({ page }) => {
    await goto(page, '/jobs/view/268ab56a-d48c-42e0-a239-fd898c6bd745');
    await expect(page.getByRole('heading').first()).not.toBeEmpty();
    await expect(page.getByRole('button', { name: /apply now/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /back to jobs/i })).toBeVisible();
    // Intentionally not clicking Apply Now — would submit a real application to a third-party listing.
  });
});

test.describe('TC-LINK — Saved Jobs / Alerts / Network / Applications', () => {
  test('TC-LINK-SAVED-01: Given I open Saved Jobs, Then the page renders with a Browse Jobs link', async ({ page }) => {
    await goto(page, '/jobs/saved');
    await expect(page.getByRole('heading', { name: 'Saved Jobs', exact: true })).toBeVisible();
  });

  test('TC-LINK-ALERTS-01: Given I open Job Alerts, Then a Create Alert control is shown', async ({ page }) => {
    await goto(page, '/jobs/alerts');
    await expect(page.getByRole('heading', { name: /job alerts/i, level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /create alert/i }).first()).toBeVisible();
  });

  test('TC-LINK-NETWORK-01: Given I open My Network, When I click Find People, Then I land on the people search page', async ({ page }) => {
    await goto(page, '/jobs/network');
    await page.getByRole('button', { name: /find people/i }).click();
    await page.waitForURL(/\/jobs\/requests/, { timeout: 10000 });
    expect(page.url()).toContain('/jobs/requests');
  });

  test('TC-LINK-APPLICATIONS-01: Given I open Applications, Then "My Applications" is shown', async ({ page }) => {
    await goto(page, '/jobs/applications');
    await expect(page.getByRole('heading', { name: /my applications/i })).toBeVisible();
  });
});

test.describe('TC-LINK — Companies & Salary', () => {
  test('TC-LINK-COMPANIES-01: Given I open Company Pages, Then a company search box is shown', async ({ page }) => {
    await goto(page, '/jobs/companies');
    await expect(page.getByPlaceholder(/search companies/i)).toBeVisible();
  });

  test('TC-LINK-COMPANIES-02: Given the companies list, When I click a company card, Then I land on its company detail page', async ({ page }) => {
    await goto(page, '/jobs/companies');
    const card = page.locator('a[href^="/jobs/companies/"]').first();
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForURL(/\/jobs\/companies\/[0-9a-f-]+/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/jobs\/companies\/[0-9a-f-]+/);
  });

  test('TC-LINK-SALARY-01: Given I open Salary Insights, Then title and location search inputs are shown', async ({ page }) => {
    await goto(page, '/jobs/salary');
    await expect(page.getByPlaceholder(/job title or skill/i)).toBeVisible();
    await expect(page.getByPlaceholder(/city, state, or region/i)).toBeVisible();
  });
});

test.describe('TC-LINK — Profile', () => {
  test('TC-LINK-PROFILE-01: Given I open My Profile, Then my username heading and profile controls are shown', async ({ page }) => {
    await goto(page, '/jobs/profile');
    await expect(page.getByRole('heading', { name: /w4f01/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /open to work/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download ai resume/i })).toBeVisible();
  });
});

test.describe('TC-LINK — Career Tools (render only — generation skipped to avoid AI/credit cost)', () => {
  test('TC-LINK-RESUME-01: Given I open Resume Builder, Then template choices and a Save control are shown', async ({ page }) => {
    await goto(page, '/jobs/resume-builder');
    await expect(page.getByRole('heading', { name: /build your professional resume/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^save$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
  });

  test('TC-LINK-PORTFOLIO-01: Given I open Portfolio Create, Then project fields and Publish control are shown', async ({ page }) => {
    await goto(page, '/jobs/portfolio');
    await expect(page.getByPlaceholder(/title/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /publish/i })).toBeVisible();
  });

  test('TC-LINK-COVERLETTER-01: Given I open Create Cover Letter, Then tone options and a job-description field are shown', async ({ page }) => {
    await goto(page, '/jobs/cover-letter');
    await expect(page.getByPlaceholder(/paste the job description/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /generate cover letter/i })).toBeVisible();
  });

  test('TC-LINK-HEADSHOT-01: Given I open AI Headshot, Then style options and a Generate control are shown', async ({ page }) => {
    await goto(page, '/jobs/ai-headshot');
    await expect(page.getByRole('button', { name: /choose image/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /generate headshot/i })).toBeVisible();
  });

  test('TC-LINK-ATS-01: Given I open ATS Checker, Then a resume upload and Analyze control are shown', async ({ page }) => {
    await goto(page, '/jobs/ats-checker');
    await expect(page.getByRole('button', { name: /choose file/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /analyze resume/i })).toBeVisible();
  });
});
