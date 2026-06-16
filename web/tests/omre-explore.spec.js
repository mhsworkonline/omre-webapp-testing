import { test } from '@playwright/test';

test('Explore Omre app after login', async ({ page }) => {

    await page.goto('https://omre.ai/');

    await page.pause();

});