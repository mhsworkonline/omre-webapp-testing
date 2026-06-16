import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class SocialPage extends BasePage {
  constructor(page) {
    super(page);
    this.socialBtn = page.getByRole('button', { name: 'Social Social' });
    this.pagesLink = page.getByRole('link', { name: 'Pages Pages' });
    this.groupsLink = page.getByRole('link', { name: 'Groups Groups' });
    this.weatherLink = page.getByRole('link', { name: 'Weather Weather' });
    this.postLink = page.getByRole('link', { name: 'Social Post Share with your' });
    this.createPageBtn = page.getByRole('button', { name: 'Create page' });
    this.closeModalBtn = page.getByRole('button', { name: 'Close' });
    this.discoverLink = page.getByRole('link', { name: 'Discover' });
    this.joinCommunityBtn = page.getByRole('button', { name: 'Join Community' });
  }

  async openSocialNav() {
    await this.socialBtn.click();
  }

  async gotoPages() {
    await this.openSocialNav();
    await this.pagesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async gotoGroups() {
    await this.openSocialNav();
    await this.groupsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoWeather() {
    await this.openSocialNav();
    await this.weatherLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoPost() {
    await this.postLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openCreatePageModal() {
    await this.createPageBtn.click();
  }

  async closeModal() {
    await this.closeModalBtn.click();
  }

  async gotoDiscover() {
    await this.discoverLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async joinFirstCommunity() {
    await this.joinCommunityBtn.first().click();
  }

  async expectModalVisible() {
    await expect(this.page.locator('[role="dialog"]')).toBeVisible();
  }

  async expectModalClosed() {
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
  }
}
