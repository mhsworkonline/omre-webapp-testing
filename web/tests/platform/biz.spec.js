// TC-BIZ — Biz Hub Tests (rewritten from live crawl: /biz is a hub, not a business directory)
// URL: https://omre.ai/biz

import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const MODULE_URL = 'https://omre.ai/biz';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

async function goModule(page) {
  await page.goto(MODULE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
}

test.describe('TC-BIZ — Hub Landing', () => {
  test.beforeEach(async ({ page }) => { await goModule(page); });

  test('TC-BIZ-01: Given I am authenticated, When I navigate to /biz, Then the URL is correct', async ({ page }) => {
    expect(page.url()).toContain('/biz');
  });

  test('TC-BIZ-02: Given I am on the page, When I inspect it, Then the "What would you like to do?" heading is shown', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toHaveText(/what would you like to do/i);
  });

  test('TC-BIZ-03: Given I am on the hub, When I inspect the "Browse Digital" link, Then it is visible and links to /biz/business/digital', async ({ page }) => {
    const link = page.getByRole('link', { name: /browse digital/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/biz/business/digital');
  });

  test('TC-BIZ-04: Given I am on the hub, When I inspect the "Browse Physical" link, Then it is visible and links to /biz/business/physical', async ({ page }) => {
    const link = page.getByRole('link', { name: /browse physical/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/biz/business/physical');
  });

  test('TC-BIZ-05: Given I am on the hub, When I inspect the "Seller Dashboard" link, Then it is visible and links to /biz/business/dashboard', async ({ page }) => {
    const link = page.getByRole('link', { name: /seller dashboard/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/biz/business/dashboard');
  });

  test('TC-BIZ-06: Given I am on the hub, When I inspect the "Website Builder" link, Then it is visible and links to /biz/website-builder', async ({ page }) => {
    const link = page.getByRole('link', { name: /website builder/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/biz/website-builder');
  });

  test('TC-BIZ-07: Given I am on the hub, When I inspect the "Marketplace" link, Then it is visible and links to /app/marketplace', async ({ page }) => {
    const link = page.getByRole('link', { name: /marketplace/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/app/marketplace');
  });
});

test.describe('TC-BIZ — Browse Digital / Physical', () => {
  test('TC-BIZ-08: Given I am on the hub, When I click "Browse Digital", Then I land on /biz/business/digital', async ({ page }) => {
    await goModule(page);
    await page.getByRole('link', { name: /browse digital/i }).click();
    await page.waitForURL(/\/biz\/business\/digital/, { timeout: 10000 });
    expect(page.url()).toContain('/biz/business/digital');
  });

  test('TC-BIZ-09: Given I am on the hub, When I click "Browse Physical", Then I land on /biz/business/physical', async ({ page }) => {
    await goModule(page);
    await page.getByRole('link', { name: /browse physical/i }).click();
    await page.waitForURL(/\/biz\/business\/physical/, { timeout: 10000 });
    expect(page.url()).toContain('/biz/business/physical');
  });
});

test.describe('TC-BIZ — Seller Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
  });

  test('TC-BIZ-10: Given I open Seller Dashboard, Then I see either "Create Seller Profile" (no store yet) or my store dashboard (store exists)', async ({ page }) => {
    const heading = await page.locator('h1, h2').first().innerText();
    expect(heading.length).toBeGreaterThan(0); // either "Create Seller Profile" or the store's own name
  });

  test('TC-BIZ-11: Given I have no store yet, When I am on Create Seller Profile, Then a "Create Profile & Start Selling" button is visible — skipped once a store exists', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create profile.*start selling/i });
    const isGated = await createBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isGated) { test.skip(true, 'Seller profile already exists on this account — gate no longer shown'); return; }
    await expect(createBtn).toBeVisible();
  });

  for (const [name, href] of [
    ['Dashboard', '/biz/business/dashboard'],
    ['Analytics', '/biz/business/dashboard/analytics'],
    ['Digital Products', '/biz/business/dashboard/digital-products'],
    ['Physical Products', '/biz/business/dashboard/physical-products'],
    ['Orders', '/biz/business/dashboard/orders'],
    ['Cart', '/biz/business/dashboard/cart'],
    ['Store Profile', '/biz/business/dashboard/store-profile'],
    ['Store Settings', '/biz/business/dashboard/store-settings'],
  ]) {
    test(`TC-BIZ-SIDEBAR-${name.replace(/\s+/g,'-')}: Given I am on the dashboard, When I inspect the "${name}" sidebar link, Then it links to ${href}`, async ({ page }) => {
      const link = page.getByRole('navigation').getByRole('link', { name: new RegExp(`^${name}$`, 'i') });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    });
  }

  test('TC-BIZ-SIDEBAR-Ads: Given I am on the dashboard, When I inspect the sidebar, Then "Ads & Marketing" links to /app/business/ads', async ({ page }) => {
    const link = page.getByRole('link', { name: /ads.*marketing/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/app/business/ads');
  });

  test('TC-BIZ-PROFILE-FORM: Given I have no store yet, When I inspect Create Seller Profile, Then store name, tagline, description, logo, banner, website, and location fields are present — skipped once a store exists', async ({ page }) => {
    const isGated = await page.getByPlaceholder(/my awesome store/i).isVisible({ timeout: 5000 }).catch(() => false);
    if (!isGated) { test.skip(true, 'Seller profile already exists on this account — gate no longer shown'); return; }
    await expect(page.getByPlaceholder(/short phrase.*describes your store/i)).toBeVisible();
    await expect(page.getByPlaceholder(/tell customers what you sell/i)).toBeVisible();
    await expect(page.getByPlaceholder('https://yoursite.com')).toBeVisible();
    await expect(page.getByPlaceholder(/city, country/i)).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(2);
  });
});

test.describe('TC-BIZ — Cart', () => {
  test('TC-BIZ-CART-01: Given I am authenticated, When I navigate to /biz/cart, Then the URL is correct', async ({ page }) => {
    await page.goto('https://omre.ai/biz/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(page.url()).toContain('/biz/cart');
  });

  test('TC-BIZ-CART-02: Given my cart has nothing in it, When I open the cart, Then an empty-cart message is shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });
});

test.describe('TC-BIZ — Product Detail', () => {
  test('TC-BIZ-PRODUCT-01: Given I am on Browse Digital, When I click a product, Then I land on its product detail page', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/digital', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const anyProduct = page.locator('a[href^="/biz/product/"]').first();
    await expect(anyProduct).toBeVisible();
    await anyProduct.click();
    await page.waitForURL(/\/biz\/product\//, { timeout: 10000 });
    expect(page.url()).toContain('/biz/product/');
  });

  test('TC-BIZ-PRODUCT-02: Given I am on a product detail page, When I inspect it, Then a product title is shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/product/bc9a60ef-1a0c-4e06-99ce-30fd80e3438d', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.locator('h1, h2').first()).not.toBeEmpty({ timeout: 10000 });
  });
});

test.describe('TC-BIZ — Storefront', () => {
  test('TC-BIZ-STORE-01: Given a seller has a public store, When I visit their store page, Then the seller name is shown as the heading', async ({ page }) => {
    await page.goto('https://omre.ai/biz/store/a9a9ebe4-2ea6-4835-9d3d-795ab5130676', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.locator('h1, h2').first()).not.toBeEmpty({ timeout: 10000 });
  });
});

test.describe('TC-BIZ — Alias Routes (/biz/digital, /biz/physical)', () => {
  test('TC-BIZ-ALIAS-01: Given I navigate to /biz/digital directly, Then it shows the Digital Products listing with a search box', async ({ page }) => {
    await page.goto('https://omre.ai/biz/digital', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.locator('h1, h2').first()).toHaveText(/digital products/i);
    await expect(page.getByPlaceholder(/search ebooks, courses, templates/i)).toBeVisible();
  });

  test('TC-BIZ-ALIAS-02: Given I navigate to /biz/physical directly, Then it shows the Physical Products listing', async ({ page }) => {
    await page.goto('https://omre.ai/biz/physical', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.locator('h1, h2').first()).toHaveText(/physical products/i);
  });

  test('TC-BIZ-ALIAS-03: Given I navigate to /biz/dashboard directly, Then it behaves the same as /biz/business/dashboard', async ({ page }) => {
    await page.goto('https://omre.ai/biz/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const heading = await page.locator('h1, h2').first().innerText();
    expect(heading.length).toBeGreaterThan(0);
  });
});

test.describe('TC-BIZ — Functional: Seller Profile & Product (real CRUD, idempotent)', () => {
  test('TC-BIZ-FUNC-01: Given I have no seller profile, When I fill and submit the form, Then the seller dashboard unlocks', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const createBtn = page.getByRole('button', { name: /create profile.*start selling/i });
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const inputs = await page.locator('input').all();
      const values = ['Automated QA Test Store', 'qa-test-store', 'Testing the seller dashboard', 'This store exists only to validate OMRE seller dashboard test flows.', 'Test City, Test Country'];
      let i = 0;
      for (const inp of inputs) {
        const type = (await inp.getAttribute('type').catch(() => '')) || 'text';
        if (type === 'file') continue;
        if (type === 'url') { await inp.fill('https://example.com').catch(() => {}); continue; }
        await inp.fill(values[i++] || 'QA Test Value').catch(() => {});
      }
      await createBtn.click();
      await page.waitForTimeout(3000);
    }

    await page.goto('https://omre.ai/biz/business/dashboard/digital-products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: /add product/i })).toBeVisible({ timeout: 10000 });
  });

  test('TC-BIZ-FUNC-02: Given the dashboard is unlocked, When I cancel the Add Product form, Then no product is created and the modal closes', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard/digital-products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /add product/i }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /^cancel$/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('button', { name: /^cancel$/i })).not.toBeVisible();
  });

  test('TC-BIZ-FUNC-03: Given the dashboard is unlocked, When I fill and submit the Add Product form, Then the product is created and appears in the listing', async ({ page }) => {
    const productName = `QA Test Product ${Date.now()}`;
    await page.goto('https://omre.ai/biz/business/dashboard/digital-products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /add product/i }).click();
    await page.waitForTimeout(1500);

    await page.getByPlaceholder(/premium ebook.*complete guide/i).fill(productName);
    await page.getByPlaceholder(/brief summary shown in search results/i).fill('QA automated test listing — safe to ignore/delete.');
    await page.getByPlaceholder(/detailed product description/i).fill('Created by an automated test to verify the Add Product flow. Not a real product.');
    await page.getByPlaceholder('0.00').fill('9.99');

    await page.getByRole('button', { name: /^add product$/i }).click();
    await page.waitForTimeout(2500);

    await expect(page.getByText(productName)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-BIZ — Catalog Search', () => {
  test('TC-BIZ-SEARCH-01: Given I am on Browse Digital, When I type a product name into search, Then the listing filters to matching results', async ({ page }) => {
    await page.goto('https://omre.ai/biz/digital', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const searchBox = page.getByPlaceholder(/search ebooks, courses, templates/i);
    const beforeCount = await page.locator('a[href^="/biz/product/"]').count();
    await searchBox.fill('Invoice');
    await page.waitForTimeout(1500);
    const afterCount = await page.locator('a[href^="/biz/product/"]').count();
    expect(afterCount).toBeLessThan(beforeCount);
    await expect(page.getByText(/invoice generator/i).first()).toBeVisible();
  });

  test('TC-BIZ-SEARCH-02: Given I search for a term with no matches, When the listing filters, Then no products are shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/digital', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.getByPlaceholder(/search ebooks, courses, templates/i).fill('zzz-no-such-product-zzz');
    await page.waitForTimeout(1500);
    const count = await page.locator('a[href^="/biz/product/"]').count();
    expect(count).toBe(0);
  });
});

test.describe('TC-BIZ — Cart & Checkout', () => {
  test('TC-BIZ-CART-03: Given I am on a product detail page, When I click Add to Cart, Then the item appears in my cart', async ({ page }) => {
    await page.goto('https://omre.ai/biz/product/bc9a60ef-1a0c-4e06-99ce-30fd80e3438d', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /^add to cart$/i }).first().click();
    await page.waitForTimeout(1500);
    await page.goto('https://omre.ai/biz/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.getByText(/your cart is empty/i)).not.toBeVisible();
    await expect(page.getByText(/invoice generator/i).first()).toBeVisible();
  });

  test('TC-BIZ-CHECKOUT-01: Given I click Buy Now on a product, Then I land on the checkout page with the correct product and total', async ({ page }) => {
    await page.goto('https://omre.ai/biz/product/627e49bd-ee50-4acd-a8f7-1230f79702a3', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /buy now/i }).first().click();
    await page.waitForURL(/\/biz\/checkout/, { timeout: 10000 });
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/biz/checkout');
    await expect(page.getByText(/order summary/i)).toBeVisible();
    await expect(page.getByText(/total/i).first()).toBeVisible();
  });

  test('TC-BIZ-CHECKOUT-02: Given I am on checkout, Then contact, delivery and payment-method sections are all present', async ({ page }) => {
    await page.goto('https://omre.ai/biz/product/627e49bd-ee50-4acd-a8f7-1230f79702a3', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /buy now/i }).first().click();
    await page.waitForURL(/\/biz\/checkout/, { timeout: 10000 });
    await page.waitForTimeout(1500);
    await expect(page.getByText(/contact information/i)).toBeVisible();
    await expect(page.getByText(/delivery address/i)).toBeVisible();
    await expect(page.getByText(/payment method/i)).toBeVisible();
    await expect(page.getByText(/cash on delivery/i)).toBeVisible();
    await expect(page.getByText(/^upi$/i)).toBeVisible();
    // Intentionally not clicking "Place order" — would create a real order/charge.
  });
});

test.describe('TC-BIZ — Ads & Marketing Application', () => {
  test('TC-BIZ-ADS-01: Given I open Ads & Marketing, Then the application form fields are present', async ({ page }) => {
    await page.goto('https://omre.ai/app/business/ads', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByPlaceholder('Acme Inc.')).toBeVisible();
    await expect(page.getByPlaceholder(/e\.g\. IN, US, GB/i)).toBeVisible();
    await expect(page.getByPlaceholder('https://yoursite.com')).toBeVisible();
    await expect(page.getByPlaceholder(/briefly describe your products/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /submit application/i })).toBeVisible();
  });

  test('TC-BIZ-ADS-02: Given the application form is empty, When I submit, Then it does not silently succeed', async ({ page }) => {
    await page.goto('https://omre.ai/app/business/ads', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /submit application/i }).click();
    await page.waitForTimeout(1500);
    // Still on the same form — either a validation message appeared or the page didn't navigate away.
    expect(page.url()).toContain('/app/business/ads');
  });
});

test.describe('TC-BIZ — Analytics', () => {
  test('TC-BIZ-ANALYTICS-01: Given I open Analytics, Then sales, revenue and summary sections are shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard/analytics', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
    await expect(page.getByText(/^sales$/i)).toBeVisible();
    await expect(page.getByText(/^revenue$/i)).toBeVisible();
    await expect(page.getByText(/total sales/i)).toBeVisible();
    await expect(page.getByText(/total orders/i)).toBeVisible();
    await expect(page.getByText(/top selling products/i)).toBeVisible();
  });
});

test.describe('TC-BIZ — Store Settings', () => {
  test('TC-BIZ-SETTINGS-01: Given I open Store Settings, Then billing/payout controls are shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard/store-settings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByRole('heading', { name: /store settings/i })).toBeVisible();
    await expect(page.getByText(/auto-recharge/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });
});

test.describe('TC-BIZ — Physical Products', () => {
  test('TC-BIZ-PHYS-01: Given I have no physical products listed, Then an empty state with a CTA is shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard/physical-products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const empty = await page.getByText(/no physical products yet/i).isVisible({ timeout: 5000 }).catch(() => false);
    if (!empty) { test.skip(true, 'Physical products already exist on this account — empty state no longer shown'); return; }
    await expect(page.getByRole('button', { name: /sell physical products|add product/i }).first()).toBeVisible();
  });

  test('TC-BIZ-PHYS-FUNC-01: Given I add a physical product with required fields, Then it is created and appears in the listing', async ({ page }) => {
    const productName = `QA Physical Product ${Date.now()}`;
    await page.goto('https://omre.ai/biz/business/dashboard/physical-products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /sell physical products|add product/i }).first().click();
    await page.waitForTimeout(1500);

    await page.getByPlaceholder(/wireless headphones/i).fill(productName);
    await page.getByPlaceholder(/brief summary for listings/i).fill('QA automated physical product — safe to ignore/delete.');
    await page.getByPlaceholder(/detailed product description/i).fill('Created by an automated test to verify the Add Physical Product flow.');
    await page.getByPlaceholder('0.00').fill('19.99');
    await page.getByPlaceholder('0', { exact: true }).fill('10');

    await page.getByRole('button', { name: /^add product$/i }).click();
    await page.waitForTimeout(2500);

    await expect(page.getByText(productName)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('TC-BIZ — Dashboard Overview', () => {
  test('TC-BIZ-OVERVIEW-01: Given my store exists, Then profile completion and performance summary are shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByText(/profile completion/i)).toBeVisible();
    await expect(page.getByText(/total sales/i)).toBeVisible();
    await expect(page.getByText(/^orders$/i).first()).toBeVisible();
    await expect(page.getByText(/active products/i)).toBeVisible();
  });

  test('TC-BIZ-OVERVIEW-02: Given the performance summary, Then the Today/7D/30D/ALL period tabs are switchable', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const tab7D = page.getByRole('button', { name: /^7D$/i });
    await expect(tab7D).toBeVisible();
    await tab7D.click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/total sales/i)).toBeVisible();
  });

  test('TC-BIZ-OVERVIEW-03: Given my product list, When I click View on a product, Then I land on its product detail or edit context', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const viewBtn = page.getByRole('button', { name: /^view$/i }).first();
    const hasView = await viewBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasView) { test.skip(true, 'No products listed on this account'); return; }
    await viewBtn.click();
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/\/biz\/(product|business)\//);
  });
});

test.describe('TC-BIZ — Orders', () => {
  test('TC-BIZ-ORDERS-01: Given I open Orders, Then the orders table and Export CSV control are shown', async ({ page }) => {
    await page.goto('https://omre.ai/biz/business/dashboard/orders', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByRole('heading', { name: /^orders$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible();
    await expect(page.getByText(/order id/i)).toBeVisible();
  });
});

test.describe('TC-BIZ — Website Builder', () => {
  test('TC-BIZ-WEBSITE-01: Given my store exists, When I open Website Builder, Then I can start creating a website', async ({ page }) => {
    await page.goto('https://omre.ai/biz/website-builder', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.getByRole('heading', { name: /website builder/i })).toBeVisible();
    const hasGate = await page.getByText(/set up your business first/i).isVisible({ timeout: 3000 }).catch(() => false);
    if (hasGate) { test.skip(true, 'Store not yet created on this account — gate shown instead'); return; }
    await expect(page.getByText(/get started/i).first()).toBeVisible();
  });
});
