import { test } from '@playwright/test';
import { writeFileSync } from 'fs';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(300_000);

const BASE = 'https://omre.ai';
const out = [];

function log(label, data) {
  out.push(`\n## ${label}\n`);
  out.push(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  writeFileSync('discovery-output/biz-gap-discovery.md', out.join('\n'));
}

async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    log(name, `STEP FAILED: ${e.message}`);
  }
}

test('probe Biz gaps', async ({ page, context }) => {
  page.setDefaultNavigationTimeout(15000);
  page.setDefaultTimeout(15000);

  await step('SEARCH FILTER /biz/digital', async () => {
    await page.goto(`${BASE}/biz/digital`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const searchBox = page.getByPlaceholder(/search ebooks, courses, templates/i);
    const beforeCount = await page.locator('a[href^="/biz/product/"]').count();
    await searchBox.fill('Invoice');
    await page.waitForTimeout(1500);
    const afterCount = await page.locator('a[href^="/biz/product/"]').count();
    log('SEARCH FILTER /biz/digital', { beforeCount, afterCount, url: page.url() });
  });

  await step('ADD TO CART', async () => {
    await page.goto(`${BASE}/biz/product/bc9a60ef-1a0c-4e06-99ce-30fd80e3438d`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    const hasAddToCart = await addToCartBtn.isVisible().catch(() => false);
    if (hasAddToCart) {
      await addToCartBtn.click();
      await page.waitForTimeout(1500);
    }
    const bodyTextAfterAdd = await page.locator('body').innerText().catch(() => '');
    log('ADD TO CART click result', { hasAddToCart, url: page.url(), snippet: bodyTextAfterAdd.slice(0, 500) });
  });

  await step('CART PAGE after add', async () => {
    await page.goto(`${BASE}/biz/cart`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const cartBody = await page.locator('main, body').first().innerText().catch(() => '');
    log('CART PAGE after add', cartBody.slice(0, 1500));
  });

  await step('BUY NOW', async () => {
    await page.goto(`${BASE}/biz/product/627e49bd-ee50-4acd-a8f7-1230f79702a3`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const buyNowBtn = page.getByRole('button', { name: /buy now/i });
    const hasBuyNow = await buyNowBtn.isVisible().catch(() => false);
    if (hasBuyNow) {
      const popupPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
      await Promise.race([
        buyNowBtn.click(),
        new Promise(r => setTimeout(r, 5000)),
      ]);
      const popup = await popupPromise;
      if (popup) {
        log('BUY NOW click result', { hasBuyNow, openedNewTab: true, popupUrl: popup.url() });
        await popup.close().catch(() => {});
        return;
      }
    }
    log('BUY NOW click result', { hasBuyNow, openedNewTab: false, urlAfter: page.url() });
  });

  await step('WRITE A REVIEW', async () => {
    await page.goto(`${BASE}/biz/product/bc9a60ef-1a0c-4e06-99ce-30fd80e3438d`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const reviewBtn = page.getByRole('button', { name: /write a review/i });
    const hasReviewBtn = await reviewBtn.isVisible().catch(() => false);
    if (hasReviewBtn) {
      await reviewBtn.click();
      await page.waitForTimeout(1000);
    }
    const reviewModalText = await page.locator('[role="dialog"]').first().innerText().catch(() => '(no dialog found)');
    log('WRITE A REVIEW click result', { hasReviewBtn, reviewModalText });
  });

  await step('ADS APPLICATION FORM', async () => {
    await page.goto(`${BASE}/app/business/ads`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const adsInputs = await page.locator('input, textarea').all();
    const adsInputInfo = [];
    for (const i of adsInputs) {
      adsInputInfo.push({
        type: await i.getAttribute('type').catch(() => ''),
        placeholder: await i.getAttribute('placeholder').catch(() => ''),
      });
    }
    log('ADS APPLICATION FORM fields', adsInputInfo);
  });

  await step('ANALYTICS PAGE', async () => {
    await page.goto(`${BASE}/biz/business/dashboard/analytics`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const analyticsText = await page.locator('main, body').first().innerText().catch(() => '');
    log('ANALYTICS PAGE content', analyticsText.slice(0, 1500));
  });

  await step('STORE SETTINGS PAGE', async () => {
    await page.goto(`${BASE}/biz/business/dashboard/store-settings`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const settingsText = await page.locator('main, body').first().innerText().catch(() => '');
    const settingsInputs = await page.locator('input, textarea, select').all();
    const settingsInputInfo = [];
    for (const i of settingsInputs) {
      settingsInputInfo.push({
        type: await i.getAttribute('type').catch(() => ''),
        placeholder: await i.getAttribute('placeholder').catch(() => ''),
      });
    }
    log('STORE SETTINGS PAGE', { textSnippet: settingsText.slice(0, 1000), inputs: settingsInputInfo });
  });

  await step('PHYSICAL PRODUCTS LISTING', async () => {
    await page.goto(`${BASE}/biz/physical`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const physicalText = await page.locator('main, body').first().innerText().catch(() => '');
    const physicalProductLinks = await page.locator('a[href^="/biz/product/"]').count();
    log('PHYSICAL PRODUCTS LISTING', { textSnippet: physicalText.slice(0, 800), productLinkCount: physicalProductLinks });
  });

  await step('OFFERS & DISCOUNTS', async () => {
    await page.goto(`${BASE}/biz/business/dashboard#offers`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const offersText = await page.locator('main, body').first().innerText().catch(() => '');
    log('OFFERS & DISCOUNTS section', offersText.slice(0, 800));
  });

  await step('WEBSITE BUILDER', async () => {
    await page.goto(`${BASE}/biz/website-builder`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const wbText = await page.locator('main, body').first().innerText().catch(() => '');
    log('WEBSITE BUILDER page', wbText.slice(0, 1000));
  });

  await step('DIGITAL PRODUCTS DASHBOARD row actions', async () => {
    await page.goto(`${BASE}/biz/business/dashboard/digital-products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const dashButtons = [...new Set((await Promise.all((await page.getByRole('button').all()).map(b => b.innerText().catch(() => '')))).map(t => t.trim()).filter(Boolean))];
    log('DIGITAL PRODUCTS DASHBOARD buttons (row actions?)', dashButtons);
  });

  await step('ORDERS PAGE', async () => {
    await page.goto(`${BASE}/biz/business/dashboard/orders`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const ordersText = await page.locator('main, body').first().innerText().catch(() => '');
    log('ORDERS PAGE', ordersText.slice(0, 800));
  });

  await step('CHECKOUT PAGE content', async () => {
    await page.goto(`${BASE}/biz/product/627e49bd-ee50-4acd-a8f7-1230f79702a3`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /buy now/i }).first().click();
    await page.waitForTimeout(2000);
    const checkoutText = await page.locator('main, body').first().innerText().catch(() => '');
    const checkoutButtons = [...new Set((await Promise.all((await page.getByRole('button').all()).map(b => b.innerText().catch(() => '')))).map(t => t.trim()).filter(Boolean))];
    log('CHECKOUT PAGE', { url: page.url(), textSnippet: checkoutText.slice(0, 1200), buttons: checkoutButtons });
  });

  await step('ADD TO CART selector check', async () => {
    await page.goto(`${BASE}/biz/product/bc9a60ef-1a0c-4e06-99ce-30fd80e3438d`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const matches = await page.getByRole('button', { name: /add to cart/i }).count();
    const allButtonTexts = [...new Set((await Promise.all((await page.getByRole('button').all()).map(b => b.innerText().catch(() => '')))).map(t => t.trim()).filter(Boolean))];
    log('ADD TO CART selector check', { matchCount: matches, allButtonTexts });
  });

  await step('EDIT PRODUCT modal fields', async () => {
    await page.goto(`${BASE}/biz/business/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const editBtn = page.getByRole('button', { name: /^edit$/i }).first();
    const hasEdit = await editBtn.isVisible().catch(() => false);
    if (hasEdit) {
      await editBtn.click();
      await page.waitForTimeout(1500);
    }
    const dialog = page.locator('[role="dialog"]').first();
    const dialogVisible = await dialog.isVisible().catch(() => false);
    const dialogInputs = dialogVisible ? await dialog.locator('input, textarea').all() : [];
    const dialogInputInfo = [];
    for (const i of dialogInputs) {
      dialogInputInfo.push({
        type: await i.getAttribute('type').catch(() => ''),
        value: await i.inputValue().catch(() => ''),
        placeholder: await i.getAttribute('placeholder').catch(() => ''),
      });
    }
    const dialogButtons = dialogVisible ? [...new Set((await Promise.all((await dialog.getByRole('button').all()).map(b => b.innerText().catch(() => '')))).map(t => t.trim()).filter(Boolean))] : [];
    log('EDIT PRODUCT modal', { hasEdit, dialogVisible, dialogInputInfo, dialogButtons });
  });

  await step('ADD PHYSICAL PRODUCT form fields', async () => {
    await page.goto(`${BASE}/biz/business/dashboard/physical-products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const addBtn = page.getByRole('button', { name: /sell physical products|add product/i }).first();
    const hasAddBtn = await addBtn.isVisible().catch(() => false);
    if (hasAddBtn) {
      await addBtn.click();
      await page.waitForTimeout(1500);
    }
    const dialog = page.locator('[role="dialog"]').first();
    const dialogVisible = await dialog.isVisible().catch(() => false);
    const dialogInputs = dialogVisible ? await dialog.locator('input, textarea').all() : [];
    const dialogInputInfo = [];
    for (const i of dialogInputs) {
      dialogInputInfo.push({
        type: await i.getAttribute('type').catch(() => ''),
        placeholder: await i.getAttribute('placeholder').catch(() => ''),
      });
    }
    log('ADD PHYSICAL PRODUCT form', { hasAddBtn, dialogVisible, dialogInputInfo });
  });

  console.log('Done. Written to discovery-output/biz-gap-discovery.md');
});
