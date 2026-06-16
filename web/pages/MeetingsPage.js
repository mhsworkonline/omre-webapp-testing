import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class MeetingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.meetingsBtn = page.getByRole('button', { name: 'Meetings Meetings' });
    this.createBtn = page.getByRole('button', { name: /create|schedule|new meeting/i });
  }

  async open() {
    await this.meetingsBtn.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/meetings/i);
  }
}
