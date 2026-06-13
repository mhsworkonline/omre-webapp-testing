import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput      = page.locator('input[type="email"], input[name*="email" i], input[id*="email" i]').first();
    // Stable ref: does NOT use type="password" because type toggles to "text" on show
    this.passwordInput   = page.locator(
      'input[autocomplete="current-password"], input[name*="pass" i], input[id*="pass" i], input[type="password"]'
    ).first();
    this.showPasswordBtn = page.getByRole('button', { name: /show password|hide password/i });
    this.loginBtn        = page.getByRole('button', { name: 'Log In' });
    this.errorMsg        = page.locator('[class*="error"], [class*="invalid"], [role="alert"]').first();
  }

  async goto() {
    await this.navigate('/', { waitUntil: 'domcontentloaded' });
    await this.passwordInput.waitFor({ state: 'visible', timeout: 30000 });
  }

  async login(email, password) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginBtn.click();
    await this.page.waitForURL(/\/app\//, { timeout: 60000 }).catch(() => {});
  }

  async logout() {
    // Try to find and click a logout link/button directly first
    const directLogout = this.page.getByRole('link', { name: /log.?out|sign.?out/i })
      .or(this.page.getByRole('button', { name: /log.?out|sign.?out/i }));

    if (await directLogout.isVisible({ timeout: 3000 }).catch(() => false)) {
      await directLogout.first().click();
    } else {
      // Open an account/profile menu first, then click logout
      const menuTriggers = [
        this.page.getByRole('button', { name: /account|profile|user menu|avatar/i }),
        this.page.locator('[aria-label*="account" i], [aria-label*="profile" i], [aria-label*="avatar" i]').first(),
        this.page.locator('[class*="avatar" i], [class*="profile-pic" i], [class*="user-menu" i]').first(),
        this.page.locator('nav img, aside img, header img').first(),
      ];
      for (const trigger of menuTriggers) {
        if (await trigger.isVisible({ timeout: 2000 }).catch(() => false)) {
          await trigger.click();
          break;
        }
      }
      await this.page.waitForTimeout(500);
      await this.page.getByText(/log.?out|sign.?out/i).first().click();
    }

    await this.page.waitForURL(/\/auth\/login/, { timeout: 15000 }).catch(() => {});
  }

  async togglePasswordVisibility() {
    await this.showPasswordBtn.click();
  }

  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/\/app\/home/, { timeout: 10000 });
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  }

  async expectErrorVisible() {
    await expect(this.errorMsg).toBeVisible({ timeout: 10000 });
  }

  async expectPasswordTypeIs(type) {
    // After toggling, type="password" becomes type="text", so locate by any stable attr or position
    const stable = this.page.locator(
      'input[autocomplete="current-password"], input[name*="pass" i], input[id*="pass" i]'
    );
    const locator = (await stable.count() > 0) ? stable.first() : this.page.locator('input').nth(1);
    await expect(locator).toHaveAttribute('type', type, { timeout: 5000 });
  }
}
