import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class AIStudioPage extends BasePage {
  constructor(page) {
    super(page);
    this.aiStudioLink = page.getByRole('link', { name: 'AI Studio AI features,' });
  }

  async gotoFromNav() {
    await this.aiStudioLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/ai.?studio/i);
  }
}
