import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class WalletPage extends BasePage {
  constructor(page) {
    super(page);
    this.walletBtn = page.getByRole('button', { name: 'Wallet Wallet' });
  }

  async open() {
    await this.walletBtn.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/wallet/i);
  }
}
