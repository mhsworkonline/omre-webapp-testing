import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class WeatherPage extends BasePage {
  constructor(page) {
    super(page);
    this.widget = page.locator('[class*="weather"], [data-testid*="weather"]').first();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/weather/i);
  }

  async expectWidgetVisible() {
    await expect(this.widget).toBeVisible({ timeout: 8000 });
  }
}
