import { test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(120_000);

test('create seller profile and explore what unlocks', async ({ page }) => {
  await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const createBtn = page.getByRole('button', { name: /create profile.*start selling/i });
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    const allInputs = await page.locator('input').all();
    console.log('Total inputs found:', allInputs.length);
    const labels = ['Automated QA Test Store', 'qa-test-store', 'Testing the seller dashboard', 'This store exists only to validate the OMRE seller dashboard test flows.', 'Test City, Test Country'];
    let labelIdx = 0;
    for (const inp of allInputs) {
      const type = (await inp.getAttribute('type').catch(() => '')) || 'text';
      if (type === 'file') continue;
      if (type === 'url') { await inp.fill('https://example.com').catch(() => {}); continue; }
      await inp.fill(labels[labelIdx++] || 'QA Test Value').catch(() => {});
    }
    await createBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('Profile already exists — skipping creation');
  }

  console.log('\nAfter submit — URL:', page.url());
  console.log('Heading:', await page.locator('h1,h2').first().innerText().catch(() => '?'));
  await page.screenshot({ path: 'discovery-output/biz_after_profile_create.png', fullPage: true });

  // Now check Digital Products page (Add Product flow)
  await page.goto('https://omre.ai/biz/business/dashboard/digital-products', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('\n=== Digital Products page ===');
  console.log('Heading:', await page.locator('h1,h2').first().innerText().catch(() => '?'));
  const buttons = await page.getByRole('button').all();
  for (const b of buttons) { const t = await b.innerText().catch(() => ''); if (t.trim()) console.log(' btn:', t.trim()); }
  await page.screenshot({ path: 'discovery-output/biz_digital_products.png', fullPage: true });

  // Explore Add Product
  await page.getByRole('button', { name: /add product/i }).click();
  await page.waitForTimeout(2000);
  console.log('\n=== Add Product form ===');
  console.log('URL:', page.url());
  console.log('Heading:', await page.locator('h1,h2,h3').first().innerText().catch(() => '?'));
  const formInputs = await page.locator('input, textarea, select').all();
  for (const i of formInputs) {
    const type = (await i.getAttribute('type').catch(() => '')) || (await i.evaluate(el => el.tagName).catch(() => ''));
    const name = await i.getAttribute('name').catch(() => '');
    const placeholder = await i.getAttribute('placeholder').catch(() => '');
    console.log(` input: type=${type} name=${name} placeholder=${placeholder}`);
  }
  const addButtons = await page.getByRole('button').all();
  for (const b of addButtons) { const t = await b.innerText().catch(() => ''); if (t.trim() && !t.match(/SOCIAL|NEWS|VIDEO|CHAT|BIZ|LINK|LEARN|STUDIO|ORBIT|GAMES|MART|MEETINGS|WALLET|Toggle theme/)) console.log(' btn:', t.trim()); }
  await page.screenshot({ path: 'discovery-output/biz_add_product_form.png', fullPage: true });
});
