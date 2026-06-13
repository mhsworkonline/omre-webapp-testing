import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // Feed container — app may omit <main>; fall back to body > div
    this.feedContainer = page.locator('main, [role="main"], body > div:not([hidden])').first();

    // Post cards — structural selectors, no class reliance
    this.postItems = page.locator('main article, main > div > div > div').first();

    // Create post
    this.createPostTrigger = page.locator(
      '[placeholder*="mind" i], [placeholder*="post" i], [placeholder*="share" i], [placeholder*="what" i]'
    ).first();
    this.createPostBtn = page.locator(
      'button[aria-label*="create post" i], button[aria-label*="new post" i]'
    ).first();

    // Post action buttons (aria-label preferred; SVG icon buttons as fallback)
    this.likeButtons    = page.locator('[aria-label*="like" i], [aria-label*="react" i]');
    this.commentButtons = page.locator('[aria-label*="comment" i]');
    this.shareButtons   = page.locator('[aria-label*="share" i]');
    this.bookmarkButtons = page.locator('[aria-label*="save" i], [aria-label*="bookmark" i]');
    this.moreMenuButtons = page.locator('[aria-label*="more" i], [aria-label*="option" i], [aria-label*="menu" i]');

    // Sidebar / navigation
    this.sidebarNav = page.locator('nav, aside, [role="navigation"]').first();
    this.pageHeader = page.locator('header').first();

    // Stories row
    this.storiesRow = page.locator('[aria-label*="stories" i], [aria-label*="story" i]').first();

    // Composer (opened via create-post)
    this.composerDialog  = page.locator('[role="dialog"], [aria-modal="true"]').first();
    this.composerTextbox = page.locator('[role="dialog"] textarea, [role="dialog"] [contenteditable="true"]').first();
    this.composerSubmit  = page.locator('[role="dialog"] button[type="submit"]')
      .or(page.locator('[role="dialog"] button').filter({ hasText: /^post$|^share$|^publish$/i })).first();
  }

  async goto() {
    await this.page.goto('https://app.omre.ai/app/home', { waitUntil: 'domcontentloaded' });
    // waitForURL can timeout on slow networks; soft-catch so beforeEach doesn't kill the test
    await this.page.waitForURL(/\/app\/home/, { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async waitForFeed() {
    await this.feedContainer.waitFor({ state: 'visible', timeout: 15000 });
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1500);
  }

  async openCreatePost() {
    if (await this.createPostTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      // JS click bypasses overflow/pointer-events issues on Tailwind-styled inputs
      await this.createPostTrigger.click({ timeout: 5000 }).catch(() =>
        this.createPostTrigger.evaluate(el => el.click()).catch(() => {})
      );
    } else {
      await this.createPostBtn.evaluate(el => el.click()).catch(() => {});
    }
    await this.composerDialog.waitFor({ state: 'visible', timeout: 10000 });
  }

  async likeFirstPost() {
    const btn = this.likeButtons.first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    const before = await btn.getAttribute('aria-pressed').catch(() => null)
      || await btn.getAttribute('data-state')
      || await btn.getAttribute('class');
    await btn.click();
    return before;
  }
}
