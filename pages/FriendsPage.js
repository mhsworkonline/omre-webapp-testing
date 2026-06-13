import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class FriendsPage extends BasePage {
  constructor(page) {
    super(page);
    this.messagesBtn = page.getByRole('button', { name: 'Messages' });
  }

  async goto() {
    await this.navigate('/app/friends');
  }

  async openMessages() {
    await this.messagesBtn.click();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/app\/friends/);
  }
}
