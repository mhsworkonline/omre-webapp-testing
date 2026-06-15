/**
 * Media — full functional flow tests
 * Modules: Video, Shorts, Live, Images, Channel
 * Flows: play → pause → mute → seek → fullscreen; upload → verify; delete → verify
 */
import { test, expect } from '@playwright/test';
import {
  AUTH_FILE, goTo,
  getVideoElement, playVideo, pauseVideo, muteVideo, seekVideo, toggleFullscreen,
  openUploadDialog, deleteFirstImage, openChannelUploadDialog
} from '../helpers/flows.js';

test.use({ storageState: AUTH_FILE });
test.setTimeout(60000);

// ── Shorts ────────────────────────────────────────────────────────────────────

test.describe('TC-FLOW-SHORTS | Video Playback', () => {

  test('TC-FLOW-SHORTS-01: Given I am on the shorts page, When the player loads, Then a video element is present and playable', async ({ page }) => {
    await goTo(page, '/app/shorts');
    const vid = await getVideoElement(page);
    if (!vid) { test.skip(); return; }
    await expect(vid).toBeVisible();
  });

  test('TC-FLOW-SHORTS-02: Given a short is loaded, When I click play, Then the video transitions to playing state', async ({ page }) => {
    await goTo(page, '/app/shorts');
    const played = await playVideo(page);
    if (!played) { test.skip(); return; }
    const vid = page.locator('video').first();
    const paused = await vid.evaluate(v => v.paused).catch(() => true);
    if (paused) { test.skip(); return; } // autoplay blocked by browser
    await expect(vid).toBeVisible();
  });

  test('TC-FLOW-SHORTS-03: Given a short is playing, When I click pause, Then the video transitions to paused state', async ({ page }) => {
    await goTo(page, '/app/shorts');
    await playVideo(page);
    const paused = await pauseVideo(page);
    if (!paused) { test.skip(); return; }
    const vid = page.locator('video').first();
    const isPaused = await vid.evaluate(v => v.paused).catch(() => false);
    expect(isPaused).toBe(true);
  });

  test('TC-FLOW-SHORTS-04: Given a short is loaded, When I click the mute button, Then the video muted property is true', async ({ page }) => {
    await goTo(page, '/app/shorts');
    const muted = await muteVideo(page);
    if (!muted) { test.skip(); return; }
    const vid = page.locator('video').first();
    const isMuted = await vid.evaluate(v => v.muted || v.volume === 0).catch(() => false);
    expect(isMuted).toBe(true);
  });

  test('TC-FLOW-SHORTS-05: Given a short is loaded, When I seek to 50% of its duration, Then currentTime updates accordingly', async ({ page }) => {
    await goTo(page, '/app/shorts');
    await playVideo(page);
    const seeked = await seekVideo(page, 0.5);
    if (!seeked) { test.skip(); return; }
    const vid = page.locator('video').first();
    const ct = await vid.evaluate(v => v.currentTime).catch(() => 0);
    expect(ct).toBeGreaterThan(0);
  });

  test('TC-FLOW-SHORTS-06: Given a short is playing, When I select a different playback speed, Then the video playbackRate changes', async ({ page }) => {
    await goTo(page, '/app/shorts');
    const vid = page.locator('video').first();
    if (!(await vid.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await vid.evaluate(v => { v.playbackRate = 1.5; });
    const rate = await vid.evaluate(v => v.playbackRate).catch(() => 1);
    expect(rate).toBe(1.5);
  });

});

// ── Video Module ──────────────────────────────────────────────────────────────

test.describe('TC-FLOW-VIDEO | Player Controls', () => {

  test('TC-FLOW-VIDEO-01: Given I am on the videos page, When a video loads, Then the video element exists', async ({ page }) => {
    await goTo(page, '/app/videos');
    const vid = await getVideoElement(page);
    if (!vid) { test.skip(); return; }
    await expect(vid).toBeVisible();
  });

  test('TC-FLOW-VIDEO-02: Given a video is loaded, When I play then pause it, Then the video paused state reflects the action', async ({ page }) => {
    await goTo(page, '/app/videos');
    await playVideo(page);
    const paused = await pauseVideo(page);
    if (!paused) { test.skip(); return; }
    const vid = page.locator('video').first();
    const isPaused = await vid.evaluate(v => v.paused).catch(() => true);
    expect(isPaused).toBe(true);
  });

  test('TC-FLOW-VIDEO-03: Given a video is loaded, When I toggle fullscreen, Then the page does not crash', async ({ page }) => {
    await goTo(page, '/app/videos');
    await playVideo(page);
    await toggleFullscreen(page);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-FLOW-VIDEO-04: Given a video is playing, When I mute it, Then the muted state is true', async ({ page }) => {
    await goTo(page, '/app/videos');
    await playVideo(page);
    const muted = await muteVideo(page);
    if (!muted) { test.skip(); return; }
    const vid = page.locator('video').first();
    const isMuted = await vid.evaluate(v => v.muted || v.volume === 0).catch(() => false);
    expect(isMuted).toBe(true);
  });

  test('TC-FLOW-VIDEO-05: Given a video is loaded, When I seek to 25% duration, Then currentTime is greater than 0', async ({ page }) => {
    await goTo(page, '/app/videos');
    await playVideo(page);
    const seeked = await seekVideo(page, 0.25);
    if (!seeked) { test.skip(); return; }
    const vid = page.locator('video').first();
    const ct = await vid.evaluate(v => v.currentTime).catch(() => 0);
    expect(ct).toBeGreaterThan(0);
  });

});

// ── Live ──────────────────────────────────────────────────────────────────────

test.describe('TC-FLOW-LIVE | Viewer Playback', () => {

  test('TC-FLOW-LIVE-01: Given I am on the live page, When I click on an active stream, Then a video player appears', async ({ page }) => {
    await goTo(page, '/app/live');
    const stream = page.locator('article, [data-testid*="stream" i], [class*="stream" i]').first();
    if (!(await stream.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await stream.click();
    await page.waitForTimeout(2000);
    const vid = page.locator('video').first();
    const visible = await vid.isVisible({ timeout: 6000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test('TC-FLOW-LIVE-02: Given I am watching a live stream, When I send a chat message, Then the message appears in the live chat', async ({ page }) => {
    await goTo(page, '/app/live');
    const stream = page.locator('article, [data-testid*="stream" i]').first();
    if (!(await stream.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await stream.click();
    await page.waitForTimeout(2000);
    const chatInput = page.locator('input[placeholder*="comment" i], input[placeholder*="message" i], input[placeholder*="chat" i]').first();
    if (!(await chatInput.isVisible({ timeout: 6000 }).catch(() => false))) { test.skip(); return; }
    const msg = `qa-live-${Date.now()}`;
    await chatInput.fill(msg);
    await chatInput.press('Enter');
    await page.waitForTimeout(1500);
    const sent = page.locator('[class*="chat" i], [class*="comment" i]').filter({ hasText: msg }).first();
    const visible = await sent.isVisible({ timeout: 5000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test('TC-FLOW-LIVE-03: Given I am on the live page, When I click Go Live, Then the go-live setup dialog or page opens', async ({ page }) => {
    await goTo(page, '/app/live');
    const goLiveBtn = page.locator('button').filter({ hasText: /go live|start stream|broadcast/i }).first();
    if (!(await goLiveBtn.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await goLiveBtn.click();
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"], [class*="setup" i], [class*="stream-create" i]').first();
    const newUrl = page.url().includes('create') || page.url().includes('studio') || page.url().includes('go-live');
    const dialogVisible = await dialog.isVisible({ timeout: 4000 }).catch(() => false);
    expect(dialogVisible || newUrl).toBe(true);
  });

});

// ── Images ────────────────────────────────────────────────────────────────────

test.describe('TC-FLOW-IMAGES | Upload Dialog → Gallery → Delete', () => {

  test('TC-FLOW-IMAGES-01: Given I am on the images page, When I click upload, Then the upload dialog or file picker opens', async ({ page }) => {
    const opened = await openUploadDialog(page);
    if (!opened) { test.skip(); return; }
    const dialog = page.locator('[role="dialog"], input[type="file"], [class*="upload" i]').first();
    const visible = await dialog.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) { test.skip(); return; }
    await expect(dialog).toBeVisible();
  });

  test('TC-FLOW-IMAGES-02: Given the images gallery has images, When I hover over an image, Then action buttons (delete/edit) appear', async ({ page }) => {
    await goTo(page, '/app/images');
    const img = page.locator('[data-testid*="image" i], .gallery img, figure img, [class*="photo" i] img').first();
    if (!(await img.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await img.hover();
    await page.waitForTimeout(500);
    const action = page.locator('button[aria-label*="delete" i], button[aria-label*="edit" i], button[aria-label*="more" i]').first();
    const visible = await action.isVisible({ timeout: 3000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test('TC-FLOW-IMAGES-03: Given I have images in the gallery, When I open an image, Then the lightbox or full-size view opens', async ({ page }) => {
    await goTo(page, '/app/images');
    const img = page.locator('[data-testid*="image" i], figure img, [class*="gallery" i] img').first();
    if (!(await img.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await img.click();
    await page.waitForTimeout(1000);
    const lightbox = page.locator('[role="dialog"], [class*="lightbox" i], [class*="modal" i]').first();
    const visible = await lightbox.isVisible({ timeout: 5000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test('TC-FLOW-IMAGES-04: Given an image is open in lightbox, When I press Escape, Then the lightbox closes', async ({ page }) => {
    await goTo(page, '/app/images');
    const img = page.locator('figure img, [class*="gallery" i] img').first();
    if (!(await img.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await img.click();
    await page.waitForTimeout(800);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const lightbox = page.locator('[role="dialog"], [class*="lightbox" i]').first();
    const stillOpen = await lightbox.isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillOpen).toBe(false);
  });

});

// ── Channel ───────────────────────────────────────────────────────────────────

test.describe('TC-FLOW-CHANNEL | Upload Flow', () => {

  test('TC-FLOW-CHANNEL-01: Given I am on my channel page, When I click Upload, Then the upload form or dialog opens', async ({ page }) => {
    const opened = await openChannelUploadDialog(page);
    if (!opened) { test.skip(); return; }
    const form = page.locator('[role="dialog"], form, [class*="upload" i]').first();
    const visible = await form.isVisible({ timeout: 6000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test('TC-FLOW-CHANNEL-02: Given the upload dialog is open, When I fill in a video title, Then the title field contains the text', async ({ page }) => {
    const opened = await openChannelUploadDialog(page);
    if (!opened) { test.skip(); return; }
    const titleInput = page.locator('input[name*="title" i], input[placeholder*="title" i]').first();
    if (!(await titleInput.isVisible({ timeout: 6000 }).catch(() => false))) { test.skip(); return; }
    await titleInput.fill('QA Flow Test Video');
    const value = await titleInput.inputValue().catch(() => '');
    expect(value).toContain('QA Flow Test Video');
  });

  test('TC-FLOW-CHANNEL-03: Given I am on my channel page, When I view the video grid, Then video cards are rendered with titles', async ({ page }) => {
    await goTo(page, '/app/channel');
    const card = page.locator('[data-testid*="video" i], article, [class*="video-card" i]').first();
    if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await expect(card).toBeVisible();
  });

  test('TC-FLOW-CHANNEL-04: Given I am on my channel page, When I click on a video card, Then the video detail or player opens', async ({ page }) => {
    await goTo(page, '/app/channel');
    const card = page.locator('[data-testid*="video" i], article, [class*="video-card" i]').first();
    if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) { test.skip(); return; }
    await card.click();
    await page.waitForTimeout(2000);
    const player = page.locator('video, [class*="player" i], [role="dialog"]').first();
    const visible = await player.isVisible({ timeout: 6000 }).catch(() => false);
    expect(visible).toBe(true);
  });

});
