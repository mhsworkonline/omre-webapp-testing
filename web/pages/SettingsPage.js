import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class SettingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.accountMenuBtn = page.getByRole('button', { name: 'Account menu' });
    this.settingsItem = page.getByLabel('', { exact: true }).getByText('Settings');
    this.aiStudioLink = page.getByRole('link', { name: 'AI Studio AI features,' });
  }

  async open() {
    await this.accountMenuBtn.click();
    await this.settingsItem.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoAIStudio() {
    await this.aiStudioLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/settings/i);
  }
}
