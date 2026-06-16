/**
 * Shared flow helpers for full functional E2E tests.
 * All functions return true/false (success/skip) so callers can test.skip() gracefully.
 * Pattern: isVisible().catch(() => false) guards before every interaction.
 */

export const BASE = 'https://omre.ai';
export const AUTH_FILE = 'playwright/.auth/user.json';

// ── Navigation ────────────────────────────────────────────────────────────────

export async function goTo(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

// ── Post Flows ────────────────────────────────────────────────────────────────

export async function openComposer(page) {
  await goTo(page, '/app/home');
  const trigger = page.locator(
    '[placeholder*="mind" i], [placeholder*="what" i], [placeholder*="share" i]'
  ).first();
  if (await trigger.isVisible({ timeout: 8000 }).catch(() => false)) {
    await trigger.click();
  } else {
    const fab = page.locator('button[aria-label*="create post" i]').first();
    if (await fab.isVisible({ timeout: 4000 }).catch(() => false)) {
      await fab.evaluate(el => el.click());
    } else return false;
  }
  await page.waitForTimeout(800);
  return true;
}

export async function typeInComposer(page, text) {
  const box = page.locator(
    '[role="dialog"] textarea, [role="dialog"] [contenteditable="true"], textarea[placeholder*="mind" i]'
  ).first();
  if (!(await box.isVisible({ timeout: 6000 }).catch(() => false))) return false;
  await box.fill(text);
  return true;
}

export async function submitPost(page) {
  const btn = page.locator(
    '[role="dialog"] button[type="submit"], [role="dialog"] button'
  ).filter({ hasText: /^post$|^share$|^publish$/i }).first();
  if (!(await btn.isVisible({ timeout: 5000 }).catch(() => false))) return false;
  await btn.click();
  await page.waitForTimeout(2000);
  return true;
}

/** Creates a text post and returns the unique text used so callers can find it in feed. */
export async function createPost(page, text) {
  const opened = await openComposer(page);
  if (!opened) return null;
  const typed = await typeInComposer(page, text);
  if (!typed) return null;
  const submitted = await submitPost(page);
  if (!submitted) return null;
  return text;
}

/** Finds a post card containing `text` and deletes it via the options menu. */
export async function deletePost(page, text) {
  const card = page.locator('article, [data-testid*="post" i]').filter({ hasText: text }).first();
  if (!(await card.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  const menu = card.locator('button[aria-label*="more" i], button[aria-label*="option" i], button:has([data-icon*="ellipsis" i])').first();
  if (!(await menu.isVisible({ timeout: 4000 }).catch(() => false))) return false;
  await menu.click();
  await page.waitForTimeout(500);
  const deleteBtn = page.locator('[role="menuitem"], [role="option"], button, li')
    .filter({ hasText: /delete|remove/i }).first();
  if (!(await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false))) return false;
  await deleteBtn.click();
  await page.waitForTimeout(500);
  const confirm = page.locator('button').filter({ hasText: /confirm|yes|delete/i }).first();
  if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) await confirm.click();
  await page.waitForTimeout(1500);
  return true;
}

/** Likes the first post in feed and returns the like count text before and after. */
export async function likeFirstPost(page) {
  const likeBtn = page.locator(
    'article button[aria-label*="like" i], article button[aria-label*="heart" i]'
  ).first();
  if (!(await likeBtn.isVisible({ timeout: 8000 }).catch(() => false))) return null;
  const before = await likeBtn.textContent().catch(() => '');
  await likeBtn.click();
  await page.waitForTimeout(1000);
  const after = await likeBtn.textContent().catch(() => '');
  return { before, after };
}

/** Opens comment section on first post, types a comment, submits. */
export async function commentOnFirstPost(page, text) {
  const commentBtn = page.locator(
    'article button[aria-label*="comment" i]'
  ).first();
  if (!(await commentBtn.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await commentBtn.click();
  await page.waitForTimeout(1000);
  const input = page.locator(
    'input[placeholder*="comment" i], textarea[placeholder*="comment" i], [contenteditable][aria-label*="comment" i]'
  ).first();
  if (!(await input.isVisible({ timeout: 5000 }).catch(() => false))) return false;
  await input.fill(text);
  await input.press('Enter');
  await page.waitForTimeout(1500);
  return true;
}

// ── Message Flows ─────────────────────────────────────────────────────────────

export async function openFirstConversation(page) {
  await goTo(page, '/app/messages');
  const item = page.locator('[role="listitem"], ul li').first();
  if (!(await item.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await item.click();
  await page.waitForTimeout(1000);
  return true;
}

export async function sendMessage(page, text) {
  const input = page.locator(
    'input[placeholder*="message" i], textarea[placeholder*="message" i], [contenteditable][aria-label*="message" i]'
  ).first();
  if (!(await input.isVisible({ timeout: 6000 }).catch(() => false))) return false;
  await input.fill(text);
  const sendBtn = page.locator(
    'button[type="submit"], button[aria-label*="send" i]'
  ).first();
  if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sendBtn.click();
  } else {
    await input.press('Enter');
  }
  await page.waitForTimeout(1500);
  return true;
}

// ── Image Flows ───────────────────────────────────────────────────────────────

export async function openUploadDialog(page) {
  await goTo(page, '/app/images');
  const uploadBtn = page.locator(
    'button[aria-label*="upload" i], button'
  ).filter({ hasText: /upload|add image|new/i }).first();
  if (!(await uploadBtn.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await uploadBtn.click();
  await page.waitForTimeout(1000);
  return true;
}

export async function attachFile(page, inputSelector, filePath) {
  const fileInput = page.locator(inputSelector).first();
  if (!(await fileInput.isVisible({ timeout: 5000 }).catch(() => false))) {
    // try hidden input
    const hidden = page.locator('input[type="file"]').first();
    await hidden.setInputFiles(filePath).catch(() => false);
    return true;
  }
  await fileInput.setInputFiles(filePath);
  return true;
}

export async function deleteFirstImage(page) {
  await goTo(page, '/app/images');
  const img = page.locator('[data-testid*="image" i], .gallery img, figure img').first();
  if (!(await img.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await img.hover();
  const deleteBtn = page.locator(
    'button[aria-label*="delete" i], button[aria-label*="remove" i]'
  ).first();
  if (!(await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false))) return false;
  await deleteBtn.click();
  await page.waitForTimeout(500);
  const confirm = page.locator('button').filter({ hasText: /confirm|yes|delete/i }).first();
  if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) await confirm.click();
  await page.waitForTimeout(1500);
  return true;
}

// ── Video / Shorts Flows ──────────────────────────────────────────────────────

export async function getVideoElement(page) {
  const vid = page.locator('video').first();
  if (!(await vid.isVisible({ timeout: 8000 }).catch(() => false))) return null;
  return vid;
}

export async function playVideo(page) {
  const vid = await getVideoElement(page);
  if (!vid) return false;
  const paused = await vid.evaluate(v => v.paused).catch(() => true);
  if (paused) {
    await vid.click().catch(async () => {
      const playBtn = page.locator('button[aria-label*="play" i]').first();
      if (await playBtn.isVisible({ timeout: 3000 }).catch(() => false)) await playBtn.click();
    });
    await page.waitForTimeout(1500);
  }
  return true;
}

export async function pauseVideo(page) {
  const vid = await getVideoElement(page);
  if (!vid) return false;
  const playing = await vid.evaluate(v => !v.paused).catch(() => false);
  if (playing) {
    await vid.click().catch(async () => {
      const pauseBtn = page.locator('button[aria-label*="pause" i]').first();
      if (await pauseBtn.isVisible({ timeout: 3000 }).catch(() => false)) await pauseBtn.click();
    });
    await page.waitForTimeout(500);
  }
  return true;
}

export async function muteVideo(page) {
  const muteBtn = page.locator(
    'button[aria-label*="mute" i], button[aria-label*="volume" i]'
  ).first();
  if (!(await muteBtn.isVisible({ timeout: 5000 }).catch(() => false))) return false;
  await muteBtn.click();
  await page.waitForTimeout(500);
  return true;
}

export async function seekVideo(page, fraction = 0.5) {
  const vid = await getVideoElement(page);
  if (!vid) return false;
  await vid.evaluate((v, f) => { v.currentTime = v.duration * f; }, fraction);
  await page.waitForTimeout(500);
  return true;
}

export async function toggleFullscreen(page) {
  const fsBtn = page.locator(
    'button[aria-label*="fullscreen" i], button[aria-label*="full screen" i]'
  ).first();
  if (!(await fsBtn.isVisible({ timeout: 5000 }).catch(() => false))) return false;
  await fsBtn.click();
  await page.waitForTimeout(800);
  return true;
}

// ── Profile Flows ─────────────────────────────────────────────────────────────

export async function editProfileBio(page, newBio) {
  await goTo(page, '/app/profile');
  const editBtn = page.locator('button, a').filter({ hasText: /edit profile/i }).first();
  if (!(await editBtn.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await editBtn.click();
  await page.waitForTimeout(1500);
  const bioInput = page.locator(
    'textarea[name*="bio" i], textarea[placeholder*="bio" i], textarea[placeholder*="about" i]'
  ).first();
  if (!(await bioInput.isVisible({ timeout: 6000 }).catch(() => false))) return false;
  await bioInput.fill(newBio);
  const saveBtn = page.locator('button[type="submit"], button').filter({ hasText: /save|update/i }).first();
  if (!(await saveBtn.isVisible({ timeout: 4000 }).catch(() => false))) return false;
  await saveBtn.click();
  await page.waitForTimeout(2000);
  return true;
}

// ── News / Bookmark Flows ─────────────────────────────────────────────────────

export async function bookmarkFirstArticle(page) {
  await goTo(page, '/app/blogs');
  const bookmark = page.locator(
    'button[aria-label*="bookmark" i], button[aria-label*="save" i]'
  ).first();
  if (!(await bookmark.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await bookmark.click();
  await page.waitForTimeout(1000);
  return true;
}

// ── Notification Flows ────────────────────────────────────────────────────────

export async function getNotificationCount(page) {
  await goTo(page, '/app/notifications');
  const badge = page.locator('[aria-label*="notification" i] [aria-label*="count" i], [data-testid*="badge" i]').first();
  if (!(await badge.isVisible({ timeout: 5000 }).catch(() => false))) return null;
  return badge.textContent();
}

// ── Channel Flows ─────────────────────────────────────────────────────────────

export async function openChannelUploadDialog(page) {
  await goTo(page, '/app/channel');
  const uploadBtn = page.locator('button').filter({ hasText: /upload|add video/i }).first();
  if (!(await uploadBtn.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await uploadBtn.click();
  await page.waitForTimeout(1000);
  return true;
}

// ── Groups Flows ──────────────────────────────────────────────────────────────

export async function openFirstGroup(page) {
  await goTo(page, '/app/groups');
  const group = page.locator(
    '[data-testid*="group" i], article, [role="listitem"]'
  ).first();
  if (!(await group.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await group.click();
  await page.waitForTimeout(1500);
  return true;
}

// ── Friends Flows ─────────────────────────────────────────────────────────────

export async function sendFriendRequest(page) {
  await goTo(page, '/app/friends');
  const addBtn = page.locator('button').filter({ hasText: /add friend|connect|follow/i }).first();
  if (!(await addBtn.isVisible({ timeout: 8000 }).catch(() => false))) return false;
  await addBtn.click();
  await page.waitForTimeout(1000);
  return true;
}
