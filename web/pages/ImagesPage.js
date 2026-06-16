import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ImagesPage extends BasePage {
  constructor(page) {
    super(page);
    this.gallery = page.locator('img[src], [role="img"]').first();
  }

  async goto() {
    await this.navigate('/app/images');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/app\/images/);
  }

  async expectGalleryVisible() {
    await expect(this.gallery).toBeVisible({ timeout: 8000 });
  }
}
