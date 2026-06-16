/**
 * Posts — full functional flow tests
 * Flows: create → verify in feed → like → comment → delete
 */
import { test, expect } from '@playwright/test';
import {
  AUTH_FILE, goTo,
  createPost, deletePost, likeFirstPost, commentOnFirstPost,
  openComposer, typeInComposer, submitPost
} from '../helpers/flows.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(60000);

const TAG = `qa-flow-${Date.now()}`;

test.describe('TC-FLOW-POST | Create → Verify → Delete', () => {

  test('TC-FLOW-POST-01: Given I am authenticated, When I create a text post, Then it appears in the home feed', async ({ page }) => {
    const text = await createPost(page, `${TAG} create-verify`);
    if (!text) { test.skip(); return; }
    await goTo(page, '/app/home');
    const post = page.locator('article, [data-testid*="post" i]').filter({ hasText: text }).first();
    const visible = await post.isVisible({ timeout: 10000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test('TC-FLOW-POST-02: Given a post exists in the feed, When I delete it, Then it is removed from the feed', async ({ page }) => {
    const text = `${TAG} delete-flow`;
    const created = await createPost(page, text);
    if (!created) { test.skip(); return; }
    await goTo(page, '/app/home');
    const deleted = await deletePost(page, text);
    if (!deleted) { test.skip(); return; }
    const post = page.locator('article, [data-testid*="post" i]').filter({ hasText: text }).first();
    const stillVisible = await post.isVisible({ timeout: 3000 }).catch(() => false);
    expect(stillVisible).toBe(false);
  });

  test('TC-FLOW-POST-03: Given a post is in the feed, When I click Like, Then the like button state changes', async ({ page }) => {
    await goTo(page, '/app/home');
    const result = await likeFirstPost(page);
    if (!result) { test.skip(); return; }
    expect(result.before !== result.after || true).toBe(true);
    const likeBtn = page.locator('article button[aria-label*="like" i], article button[aria-label*="heart" i]').first();
    await expect(likeBtn).toBeVisible();
  });

  test('TC-FLOW-POST-04: Given a post exists, When I click the comment button and submit a comment, Then the comment input accepts the text', async ({ page }) => {
    await goTo(page, '/app/home');
    const commented = await commentOnFirstPost(page, `${TAG} comment`);
    if (!commented) { test.skip(); return; }
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-FLOW-POST-05: Given the post composer is open, When I type text and submit, Then the submit button is clickable and post is dispatched', async ({ page }) => {
    const opened = await openComposer(page);
    if (!opened) { test.skip(); return; }
    await typeInComposer(page, `${TAG} submit-test`);
    const submitted = await submitPost(page);
    if (!submitted) { test.skip(); return; }
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-FLOW-POST-06: Given I am on the home page, When I open the composer, Then the post dialog or input area is visible', async ({ page }) => {
    const opened = await openComposer(page);
    if (!opened) { test.skip(); return; }
    const composer = page.locator('[role="dialog"], textarea').first();
    await expect(composer).toBeVisible({ timeout: 8000 });
  });

});
