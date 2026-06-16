import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class NewsPage extends BasePage {
  constructor(page) {
    super(page);
    this.newsBtn = page.getByRole('button', { name: 'News News' });
    this.feedItems = page.locator('article, [class*="news-item"], [class*="post-card"]');
  }

  async goto() {
    await this.navigate('/app/news/home');
  }

  async openFromNav() {
    await this.newsBtn.click();
    await this.page.waitForURL(/news/);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/news/);
  }

  async expectFeedVisible() {
    await expect(this.feedItems.first()).toBeVisible({ timeout: 8000 });
  }
}
