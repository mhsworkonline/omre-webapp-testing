import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ExplorePage extends BasePage {
  constructor(page) {
    super(page);
    this.reelsTab = page.getByRole('tab', { name: 'Reels' });
    this.laterBtn = page.getByRole('button', { name: 'Later' });
  }

  async goto() {
    await this.navigate('/app/explore');
  }

  async clickReelsTab() {
    await this.reelsTab.click();
  }

  async dismissLaterPromptIfPresent() {
    if (await this.laterBtn.isVisible({ timeout: 3000 }).catch(() => false))
      await this.laterBtn.click();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/app\/explore/);
    await expect(this.reelsTab).toBeVisible();
  }

  async expectReelsActive() {
    await expect(this.reelsTab).toHaveAttribute('aria-selected', 'true');
  }
}
