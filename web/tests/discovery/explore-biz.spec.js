import { test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(120_000);

test('explore Biz module structure', async ({ page }) => {
  await page.goto('https://omre.ai/biz', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('\n=== Biz landing page ===');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const heading = await page.locator('h1, h2').first().innerText().catch(() => '(none)');
  console.log('Heading:', heading);

  // Enumerate all visible interactive elements on the landing page
  const buttons = await page.getByRole('button').all();
  const links = await page.getByRole('link').all();

  console.log(`\n-- Buttons (${buttons.length}) --`);
  for (const b of buttons) {
    const text = await b.innerText().catch(() => '');
    if (text.trim()) console.log('  •', text.trim().replace(/\s+/g, ' '));
  }

  console.log(`\n-- Links (${links.length}) --`);
  for (const l of links) {
    const text = await l.innerText().catch(() => '');
    const href = await l.getAttribute('href').catch(() => '');
    if (text.trim()) console.log(`  • "${text.trim().replace(/\s+/g, ' ')}" → ${href}`);
  }

  await page.screenshot({ path: 'discovery-output/biz_landing.png', fullPage: true });

  // One level deeper: Seller Dashboard
  console.log('\n\n=== Biz > Seller Dashboard ===');
  await page.goto('https://omre.ai/biz/business/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('URL:', page.url());
  const dashHeading = await page.locator('h1, h2').first().innerText().catch(() => '(none)');
  console.log('Heading:', dashHeading);

  const dashButtons = await page.getByRole('button').all();
  const dashLinks = await page.getByRole('link').all();
  const dashTabs = await page.getByRole('tab').all();

  console.log(`\n-- Tabs (${dashTabs.length}) --`);
  for (const t of dashTabs) {
    const text = await t.innerText().catch(() => '');
    if (text.trim()) console.log('  •', text.trim().replace(/\s+/g, ' '));
  }

  console.log(`\n-- Buttons (${dashButtons.length}) --`);
  for (const b of dashButtons) {
    const text = await b.innerText().catch(() => '');
    if (text.trim() && !['SOCIAL','NEWS','VIDEO','CHAT','BIZ','LINK','LEARN','STUDIO','ORBIT','GAMES','MART','MEETINGS','WALLET','Toggle theme'].includes(text.trim()))
      console.log('  •', text.trim().replace(/\s+/g, ' '));
  }

  console.log(`\n-- Links (${dashLinks.length}) --`);
  for (const l of dashLinks) {
    const text = await l.innerText().catch(() => '');
    const href = await l.getAttribute('href').catch(() => '');
    if (text.trim()) console.log(`  • "${text.trim().replace(/\s+/g, ' ')}" → ${href}`);
  }

  await page.screenshot({ path: 'discovery-output/biz_dashboard.png', fullPage: true });
});
