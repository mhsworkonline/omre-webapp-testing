import { test } from '@playwright/test';
test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(60000);

test('probe town hall new topic', async ({ page }) => {
  await page.goto('https://omre.ai/app/town-hall/forums', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: /new topic/i }).click();
  await page.waitForTimeout(1500);
  const dialog = page.locator('[role="dialog"]').first();
  const dialogVisible = await dialog.isVisible().catch(() => false);
  const inputs = dialogVisible ? await dialog.locator('input, textarea').all() : [];
  const inputInfo = [];
  for (const i of inputs) inputInfo.push({ placeholder: await i.getAttribute('placeholder').catch(()=>''), type: await i.getAttribute('type').catch(()=>'') });
  console.log('NEW TOPIC dialog', { dialogVisible, inputInfo });
});
