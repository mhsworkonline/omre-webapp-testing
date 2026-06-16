import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ChannelPage extends BasePage {
  constructor(page) {
    super(page);
    this.myChannelLink = page.getByRole('link', { name: 'My Channel My Channel' });
    this.subscriptionsLink = page.getByRole('link', { name: 'Subscriptions Subscriptions' });
  }

  async gotoMyChannel() {
    await this.myChannelLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoSubscriptions() {
    await this.subscriptionsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectChannelLoaded() {
    await expect(this.page).toHaveURL(/channel|profile|my-channel/i);
  }

  async expectSubscriptionsLoaded() {
    await expect(this.page).toHaveURL(/subscriptions/i);
  }
}
