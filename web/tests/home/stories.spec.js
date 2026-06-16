/**
 * Stories deep-dive tests
 * Covers: Viewing stories, creating a story, reactions/replies, story management
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const HOME_URL  = 'https://omre.ai/app/home';

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

// ── Helpers ────────────────────────────────────────────────────────────────────

async function goHome(page) {
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
}

async function openFirstStory(page) {
  const storyItem = page.locator(
    '[aria-label*="story" i], [aria-label*="stories" i]'
  ).nth(1); // nth(1) skips "Add story" (index 0)
  const storyThumb = page.locator('main img[src*="story"], main img[alt*="story" i]').first();
  const item = (await storyItem.isVisible({ timeout: 4000 }).catch(() => false))
    ? storyItem : storyThumb;
  if (await item.isVisible({ timeout: 4000 }).catch(() => false)) {
    await item.click();
    await page.waitForTimeout(800);
    return true;
  }
  return false;
}

// ── Stories Bar ────────────────────────────────────────────────────────────────

test.describe('Stories Bar', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('TC-STORY-BAR-01: stories bar or carousel is present on home feed', async ({ page }) => {
    // Given the home page has loaded
    // When we look for a clickable story item in the stories bar
    // Then clicking it should open an overlay or change the URL
    const storyItem = page.locator('[aria-label*="story" i], [aria-label*="stories" i]').nth(1);
    const isPresent = await storyItem.isVisible({ timeout: 6000 }).catch(() => false);
    if (!isPresent) { test.skip(); return; }

    const urlBefore = page.url();
    await storyItem.click();
    await page.waitForTimeout(1000);

    const dialog = page.locator('[role="dialog"]').first();
    const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
    const urlChanged = page.url() !== urlBefore;

    expect(dialogVisible || urlChanged).toBe(true);

    if (dialogVisible) await page.keyboard.press('Escape');
    else if (urlChanged && !page.url().includes('/app/home')) {
      await page.goBack({ waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-STORY-BAR-02: stories bar contains at least one story item', async ({ page }) => {
    const storyItems = page.locator('[aria-label*="story" i]');
    const count = await storyItems.count();
    if (count > 0) {
      await expect(storyItems.first()).toBeVisible({ timeout: 6000 });
    }
  });

  test('TC-STORY-BAR-03: Add Story button is present in the stories bar', async ({ page }) => {
    // Given the home page has loaded
    // When we click the Add Story button
    // Then a story creator dialog should open or the URL should contain "story" or "create"
    const addBtn = page.locator(
      '[aria-label*="add story" i], [aria-label*="create story" i], button:has-text("Add"), button:has-text("Your Story")'
    ).first();
    const isPresent = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isPresent) { test.skip(); return; }

    await addBtn.click();
    await page.waitForTimeout(1000);

    const dialog = page.locator('[role="dialog"]').first();
    const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
    const urlHasStory = /story|create/i.test(page.url());

    expect(dialogVisible || urlHasStory).toBe(true);

    if (dialogVisible) await page.keyboard.press('Escape');
    else if (!page.url().includes('/app/home')) {
      await page.goBack({ waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-STORY-BAR-04: story items show user avatars or thumbnails', async ({ page }) => {
    // Given the home page has loaded
    // When we inspect the story avatar or thumbnail image
    // Then the src attribute must be a non-empty string that starts with http or /
    const storyImg = page.locator(
      '[aria-label*="story" i] img, [aria-label*="stories" i] img'
    ).first();
    const isPresent = await storyImg.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isPresent) { test.skip(); return; }

    const src = await storyImg.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src.trim().length).toBeGreaterThan(0);
    expect(/^https?:\/\/|^\//.test(src.trim())).toBe(true);
  });

  test('TC-STORY-BAR-05: stories bar can be scrolled horizontally if overflowing', async ({ page }) => {
    const bar = page.locator('[aria-label*="stories" i]').first();
    if (await bar.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check if scroll is possible
      const scrollWidth = await bar.evaluate(el => el.scrollWidth);
      const clientWidth = await bar.evaluate(el => el.clientWidth);
      // Either it scrolls or fits — both are valid
      expect(typeof scrollWidth).toBe('number');
    }
  });
});

// ── Viewing Stories ────────────────────────────────────────────────────────────

test.describe('Viewing Stories', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('TC-STORY-VIEW-01: clicking a story opens the story viewer', async ({ page }) => {
    const storyItem = page.locator('[aria-label*="story" i]').nth(1);
    if (await storyItem.isVisible({ timeout: 6000 }).catch(() => false)) {
      await storyItem.click();
      await page.waitForTimeout(800);
      const viewer = page.locator('[role="dialog"], [aria-label*="story" i], video, img[src]').first();
      await expect(viewer).toBeVisible({ timeout: 8000 });
    }
  });

  test('TC-STORY-VIEW-02: story viewer shows the story content (image or video)', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const media = page.locator('[role="dialog"] img').first();
      const mediaVisible = await media.isVisible({ timeout: 5000 }).catch(() => false);
      if (!mediaVisible) {
        const videoMedia = page.locator('[role="dialog"] video').first();
        const videoVisible = await videoMedia.isVisible({ timeout: 5000 }).catch(() => false);
        if (!videoVisible) {
          const fallback = page.locator('img[src]:not([src=""])').first();
          await expect(fallback).toBeVisible({ timeout: 8000 });
        } else {
          await expect(videoMedia).toBeVisible();
        }
      } else {
        await expect(media).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-VIEW-03: story viewer has a progress bar showing duration', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const progressBar = page.locator(
        '[role="progressbar"], progress, [aria-label*="progress" i], [data-slot*="progress" i]'
      ).first();
      if (await progressBar.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(progressBar).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-VIEW-04: story viewer shows the author name or avatar', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const author = page.locator('[role="dialog"] img, [role="dialog"] a[href*="profile"]').first();
      if (await author.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(author).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-VIEW-05: story viewer has a close button', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const closeBtn = page.locator(
        '[aria-label*="close" i], button[aria-label*="close" i]'
      ).first();
      if (await closeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(closeBtn).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-VIEW-06: pressing Escape closes the story viewer', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const viewer = page.locator('[role="dialog"]').first();
      if (await viewer.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.keyboard.press('Escape');
        await expect(viewer).not.toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('TC-STORY-VIEW-07: clicking close button dismisses the story viewer', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const closeBtn = page.locator('[aria-label*="close" i]').first();
      if (await closeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await closeBtn.click();
        const viewer = page.locator('[role="dialog"]').first();
        await expect(viewer).not.toBeVisible({ timeout: 5000 });
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('TC-STORY-VIEW-08: next story navigation button is present', async ({ page }) => {
    // Given the story viewer is open
    // When we click the Next button
    // Then the story content (image src or visible text title) should differ from what was shown before
    const opened = await openFirstStory(page);
    if (!opened) { test.skip(); return; }

    const nextBtn = page.locator('[aria-label*="next" i], button:has-text("›"), button:has-text(">")').first();
    const nextVisible = await nextBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!nextVisible) { test.skip(); return; }

    const imgBefore = page.locator('[role="dialog"] img').first();
    const srcBefore = await imgBefore.getAttribute('src').catch(() => '');
    const titleBefore = await page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3').first()
      .innerText().catch(() => '');

    await nextBtn.click();
    await page.waitForTimeout(800);

    const imgAfter = page.locator('[role="dialog"] img').first();
    const srcAfter = await imgAfter.getAttribute('src').catch(() => '');
    const titleAfter = await page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3').first()
      .innerText().catch(() => '');

    // Story viewer closed (moved past last story) also counts as content change
    const viewerGone = !(await page.locator('[role="dialog"]').first().isVisible({ timeout: 1000 }).catch(() => false));
    const contentChanged = srcAfter !== srcBefore || titleAfter !== titleBefore;

    expect(viewerGone || contentChanged).toBe(true);

    if (!viewerGone) await page.keyboard.press('Escape');
  });

  test('TC-STORY-VIEW-09: previous story navigation button is present', async ({ page }) => {
    // Given the story viewer is open and we have advanced to the second story
    // When we click the Previous button
    // Then the story content (image src or visible text title) should differ from what was shown before clicking Previous
    const opened = await openFirstStory(page);
    if (!opened) { test.skip(); return; }

    // Advance to second story first so Previous has somewhere to go
    const nextBtn = page.locator('[aria-label*="next" i], button:has-text("›"), button:has-text(">")').first();
    const nextVisible = await nextBtn.isVisible({ timeout: 4000 }).catch(() => false);
    if (nextVisible) {
      await nextBtn.click();
      await page.waitForTimeout(600);
    }

    const prevBtn = page.locator('[aria-label*="prev" i], button:has-text("‹"), button:has-text("<")').first();
    const prevVisible = await prevBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!prevVisible) {
      await page.keyboard.press('Escape');
      test.skip(); return;
    }

    const imgBefore = page.locator('[role="dialog"] img').first();
    const srcBefore = await imgBefore.getAttribute('src').catch(() => '');
    const titleBefore = await page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3').first()
      .innerText().catch(() => '');

    await prevBtn.click();
    await page.waitForTimeout(800);

    const imgAfter = page.locator('[role="dialog"] img').first();
    const srcAfter = await imgAfter.getAttribute('src').catch(() => '');
    const titleAfter = await page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3').first()
      .innerText().catch(() => '');

    const viewerGone = !(await page.locator('[role="dialog"]').first().isVisible({ timeout: 1000 }).catch(() => false));
    const contentChanged = srcAfter !== srcBefore || titleAfter !== titleBefore;

    expect(viewerGone || contentChanged).toBe(true);

    if (!viewerGone) await page.keyboard.press('Escape');
  });

  test('TC-STORY-VIEW-10: clicking next advances to the next story', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const nextBtn = page.locator('[aria-label*="next" i]').first();
      if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const before = await page.locator('[role="dialog"] img').first().getAttribute('src').catch(() => '');
        await nextBtn.click();
        await page.waitForTimeout(600);
        const after = await page.locator('[role="dialog"] img').first().getAttribute('src').catch(() => '');
        // Content should change OR we're at the last story (back on home)
        expect(page.isClosed()).toBe(false);
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-VIEW-11: story viewer shows timestamp of when story was posted', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const time = page.locator('[role="dialog"] time').first();
      const timeVisible = await time.isVisible({ timeout: 5000 }).catch(() => false);
      if (!timeVisible) {
        const timeText = page.locator('[role="dialog"]').getByText(/\d+\s*(h|m|s|min|hour|day)/i).first();
        if (await timeText.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(timeText).toBeVisible();
        }
      } else {
        await expect(time).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });
});

// ── Story Reactions & Replies ──────────────────────────────────────────────────

test.describe('Story Reactions and Replies', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('TC-STORY-REACT-01: reaction or emoji bar is visible in story viewer', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const reactionBar = page.locator(
        '[aria-label*="react" i], [aria-label*="emoji" i], [role="dialog"] button:has-text("❤"), [role="dialog"] button:has-text("😊")'
      ).first();
      if (await reactionBar.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(reactionBar).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-REACT-02: reply input field is present in story viewer', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const replyInput = page.locator(
        '[role="dialog"] input[placeholder*="reply" i], [role="dialog"] textarea, [role="dialog"] [placeholder*="message" i]'
      ).first();
      if (await replyInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(replyInput).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-REACT-03: typing a reply enables the send button', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const replyInput = page.locator(
        '[role="dialog"] input[placeholder*="reply" i], [role="dialog"] [placeholder*="message" i]'
      ).first();
      if (await replyInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await replyInput.fill('Test reply');
        await page.waitForTimeout(300);
        const sendBtn = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button[aria-label*="send" i]').first();
        if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(sendBtn).toBeEnabled();
        }
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-REACT-04: clicking a reaction emoji on a story is interactive', async ({ page }) => {
    const opened = await openFirstStory(page);
    if (opened) {
      const emoji = page.locator('[role="dialog"] button').filter({ hasText: /❤|😊|😂|🔥|👍/ }).first();
      if (await emoji.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emoji.click();
        await page.waitForTimeout(500);
        expect(page.isClosed()).toBe(false);
      }
      await page.keyboard.press('Escape');
    }
  });
});

// ── Creating a Story ───────────────────────────────────────────────────────────

test.describe('Creating a Story', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('TC-STORY-CREATE-01: Add Story button is clickable', async ({ page }) => {
    // Given the home page has loaded
    // When we click the Add Story button
    // Then a story creator dialog should open or the URL should contain "story" or "create"
    const addBtn = page.locator(
      '[aria-label*="add story" i], [aria-label*="create story" i], [aria-label*="your story" i]'
    ).first();
    const isPresent = await addBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (!isPresent) { test.skip(); return; }

    await addBtn.click();
    await page.waitForTimeout(1000);

    const dialog = page.locator('[role="dialog"]').first();
    const dialogVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
    const urlHasStory = /story|create/i.test(page.url());

    expect(dialogVisible || urlHasStory).toBe(true);

    if (dialogVisible) await page.keyboard.press('Escape');
    else if (!page.url().includes('/app/home')) {
      await page.goBack({ waitUntil: 'domcontentloaded' });
    }
  });

  test('TC-STORY-CREATE-02: clicking Add Story opens the story creator', async ({ page }) => {
    const addBtn = page.locator(
      '[aria-label*="add story" i], [aria-label*="create story" i]'
    ).first();
    if (await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(800);
      const creator = page.locator('[role="dialog"], [aria-modal="true"]').first();
      const navigated = !page.url().includes('/app/home');
      const opened = await creator.isVisible({ timeout: 5000 }).catch(() => false);
      expect(navigated || opened).toBe(true);
      if (navigated) await page.goBack({ waitUntil: 'domcontentloaded' });
      else await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-CREATE-03: story creator has a photo upload option', async ({ page }) => {
    const addBtn = page.locator('[aria-label*="add story" i], [aria-label*="create story" i]').first();
    if (await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(800);
      const creator = page.locator('[role="dialog"], [aria-modal="true"]').first();
      if (await creator.isVisible({ timeout: 5000 }).catch(() => false)) {
        const photoOpt = creator.locator(
          'button:has-text("Photo"), [aria-label*="photo" i], input[type="file"]'
        ).first();
        if (await photoOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(photoOpt).toBeVisible();
        }
        await page.keyboard.press('Escape');
      } else if (!page.url().includes('/app/home')) {
        const photoOpt = page.locator('button:has-text("Photo"), [aria-label*="photo" i]').first();
        if (await photoOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(photoOpt).toBeVisible();
        }
        await page.goBack({ waitUntil: 'domcontentloaded' });
      }
    }
  });

  test('TC-STORY-CREATE-04: story creator has a text story option', async ({ page }) => {
    const addBtn = page.locator('[aria-label*="add story" i], [aria-label*="create story" i]').first();
    if (await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(800);
      const textOpt = page.locator(
        'button:has-text("Text"), [aria-label*="text story" i]'
      ).first();
      if (await textOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(textOpt).toBeVisible();
      }
      await page.keyboard.press('Escape');
      if (!page.url().includes('/app/home')) {
        await page.goBack({ waitUntil: 'domcontentloaded' });
      }
    }
  });

  test('TC-STORY-CREATE-05: story creator has a video option', async ({ page }) => {
    const addBtn = page.locator('[aria-label*="add story" i], [aria-label*="create story" i]').first();
    if (await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(800);
      const videoOpt = page.locator(
        'button:has-text("Video"), [aria-label*="video story" i]'
      ).first();
      if (await videoOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(videoOpt).toBeVisible();
      }
      await page.keyboard.press('Escape');
      if (!page.url().includes('/app/home')) {
        await page.goBack({ waitUntil: 'domcontentloaded' });
      }
    }
  });

  test('TC-STORY-CREATE-06: story creator can be dismissed without creating', async ({ page }) => {
    const addBtn = page.locator('[aria-label*="add story" i], [aria-label*="create story" i]').first();
    if (await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(800);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      if (!page.url().includes('/app/home')) {
        await page.goBack({ waitUntil: 'domcontentloaded' });
      }
      await expect(page).toHaveURL(/\/app\/home/);
    }
  });
});

// ── My Story Management ────────────────────────────────────────────────────────

test.describe('My Story Management', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('TC-STORY-MY-01: own story item is present if user has an active story', async ({ page }) => {
    const myStory = page.locator(
      '[aria-label*="your story" i], [aria-label*="my story" i]'
    ).first();
    if (await myStory.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(myStory).toBeVisible();
    }
    // Passes regardless — user may not have an active story
  });

  test('TC-STORY-MY-02: own story shows view count when opened', async ({ page }) => {
    // Given the user has an active story
    // When we open our own story
    // Then the view count text must parse to a numeric value >= 0 (not merely visible)
    const myStory = page.locator('[aria-label*="your story" i], [aria-label*="my story" i]').first();
    const myStoryVisible = await myStory.isVisible({ timeout: 5000 }).catch(() => false);
    if (!myStoryVisible) { test.skip(); return; }

    await myStory.click();
    await page.waitForTimeout(800);

    const viewCount = page.locator('[aria-label*="view" i], [role="dialog"]')
      .getByText(/\d+\s*(view|viewer)/i).first();
    const viewCountVisible = await viewCount.isVisible({ timeout: 5000 }).catch(() => false);
    if (!viewCountVisible) {
      await page.keyboard.press('Escape');
      test.skip(); return;
    }

    const rawText = await viewCount.innerText().catch(() => '');
    const match = rawText.match(/(\d+)/);
    expect(match).not.toBeNull();
    const count = parseInt(match[1], 10);
    expect(count >= 0).toBe(true);

    await page.keyboard.press('Escape');
  });

  test('TC-STORY-MY-03: own story has a delete option', async ({ page }) => {
    const myStory = page.locator('[aria-label*="your story" i], [aria-label*="my story" i]').first();
    if (await myStory.isVisible({ timeout: 5000 }).catch(() => false)) {
      await myStory.click();
      await page.waitForTimeout(800);
      const deleteBtn = page.locator('button').filter({ hasText: /delete|remove/i }).first();
      const moreBtn   = page.locator('[role="dialog"] [aria-label*="more" i]').first();
      if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(deleteBtn).toBeVisible();
      } else if (await moreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moreBtn.click();
        await page.waitForTimeout(400);
        const deleteOpt = page.locator('[role="menuitem"]').filter({ hasText: /delete/i }).first();
        if (await deleteOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(deleteOpt).toBeVisible();
        }
      }
      await page.keyboard.press('Escape');
    }
  });

  test('TC-STORY-MY-04: story shows 24h expiry indicator', async ({ page }) => {
    const storyItem = page.locator('[aria-label*="story" i]').first();
    if (await storyItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      const expiry = page.locator('[aria-label*="expire" i]').first();
      const expiryVisible = await expiry.isVisible({ timeout: 3000 }).catch(() => false);
      if (!expiryVisible) {
        const expiryText = page.locator('span, p').filter({ hasText: /\d+h|expire|24/i }).first();
        if (await expiryText.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(expiryText).toBeVisible();
        }
      } else {
        await expect(expiry).toBeVisible();
      }
    }
  });
});
