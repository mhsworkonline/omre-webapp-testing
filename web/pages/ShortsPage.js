import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ShortsPage extends BasePage {
  constructor(page) {
    super(page);
    this.shortsLink = page.getByRole('link', { name: 'Shorts Shorts' });
    this.likeBtn = page.locator('button').filter({ hasText: /^\d+$/ }).first();
  }

  async goto() {
    await this.shortsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/shorts/i);
  }

  async getLikeCount() {
    return this.likeBtn.innerText();
  }

  async clickLike() {
    await this.likeBtn.click();
  }
}
