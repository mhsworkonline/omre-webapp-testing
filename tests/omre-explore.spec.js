import { test } from '@playwright/test';

test('Explore Omre app after login', async ({ page }) => {

    await page.goto('https://app.omre.ai/');

    await page.pause();

});