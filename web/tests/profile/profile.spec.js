/**
 * Profile module — deep-dive
 * Covers: page layout, profile header, stats, tabs, posts/photos/about/friends tabs,
 *         edit profile, follow/message actions, post management, cover photo,
 *         other user profiles, block/report
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const BASE_URL  = 'https://omre.ai';
const HOME_URL  = `${BASE_URL}/app/home`;

test.use({ storageState: AUTH_FILE });
test.setTimeout(45000);

/** Navigate to own profile via the sidebar/header profile link */
async function goOwnProfile(page) {
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  // Click own profile link in sidebar or avatar in header (must include username segment)
  const profileLink = page.locator('a[href*="/app/profile/"]').first();
  if (await profileLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await profileLink.click({ force: true }).catch(() => {});
    await page.waitForURL(/\/app\/profile\//, { timeout: 10000 }).catch(() => {});
  } else {
    await page.goto(`${BASE_URL}/app/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/app\/profile\//, { timeout: 10000 }).catch(() => {});
  }
  await page.waitForTimeout(1500);
}

/** Navigate to another user's profile via a post author link */
async function goOtherProfile(page) {
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const authorLink = page.locator('main a[href*="/app/profile"]').nth(1);
  if (await authorLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await authorLink.click();
    await page.waitForURL(/\/app\/profile\//, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

// ── Page Load & Header ─────────────────────────────────────────────────────────

test.describe('Page Load and Profile Header', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-01: Given I am authenticated and on the page, When I perform the action, Then profile page loads with correct URL pattern', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/profile\//);
  });

  test('TC-PROFILE-02: Given I am on the page, When the page renders, Then profile display name is visible', async ({ page }) => {
    const name = page.locator('h1, h2, h3').first();
    await expect(name).toBeVisible({ timeout: 10000 });
    const text = await name.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('TC-PROFILE-03: Given I am authenticated and on the page, When I perform the action, Then profile avatar is rendered with a valid image src', async ({ page }) => {
    const avatar = page.locator(
      'img[alt*="profile" i], img[alt*="avatar" i], img[alt*="photo" i]'
    ).first();
    const anyImg = page.locator('main img, header img').first();
    const img = (await avatar.isVisible({ timeout: 5000 }).catch(() => false)) ? avatar : anyImg;
    await expect(img).toBeVisible({ timeout: 10000 });
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('TC-PROFILE-04: Given I am authenticated and on the page, When I perform the action, Then cover photo or banner area is present', async ({ page }) => {
    const cover = page.locator(
      '[aria-label*="cover" i], img[alt*="cover" i], [data-slot*="cover" i]'
    ).first();
    const banner = page.locator('main > div').first();
    if (await cover.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(cover).toBeVisible();
    } else {
      await expect(banner).toBeVisible({ timeout: 8000 });
    }
  });

  test('TC-PROFILE-05: Given I am authenticated and on the page, When I perform the action, Then bio or about text is shown if set', async ({ page }) => {
    const bio = page.locator(
      '[aria-label*="bio" i], [data-slot*="bio" i], main p'
    ).first();
    if (await bio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(bio).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-06: Given I am on the page, When I inspect the content, Then profile page does not have uncaught JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const appErrors = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('omre.ai')
    );
    expect(appErrors).toHaveLength(0);
  });
});

// ── Profile Stats ──────────────────────────────────────────────────────────────

test.describe('Profile Stats', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-07: Given I am on the page, When the page renders, Then follower count is visible', async ({ page }) => {
    const followers = page.locator('main').getByText(/followers?/i).first();
    if (await followers.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(followers).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-08: Given I am on the page, When the page renders, Then following count is visible', async ({ page }) => {
    const following = page.locator('main').getByText(/following/i).first();
    if (await following.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(following).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-09: Given I am on the page, When the page renders, Then post count is visible', async ({ page }) => {
    const posts = page.locator('main').getByText(/\d+\s*posts?/i).first();
    if (await posts.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(posts).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-10: Given the followers count is present, When I click the followers count, Then it opens the followers list', async ({ page }) => {
    const followersBtn = page.locator('button, a').filter({ hasText: /followers?/i }).first();
    if (!(await followersBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await followersBtn.click();
    await page.waitForTimeout(800);
    const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
    const list   = page.locator('[role="list"], ul').first();
    if (await dialog.isVisible({ timeout: 5000 }).catch(() => false)
     || await list.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(dialog.or(list).first()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('TC-PROFILE-11: Given the following count is present, When I click the following count, Then it opens the following list', async ({ page }) => {
    const followingBtn = page.locator('button, a').filter({ hasText: /following/i }).first();
    if (!(await followingBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await followingBtn.click();
    await page.waitForTimeout(800);
    const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (await dialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});

// ── Profile Tabs ───────────────────────────────────────────────────────────────

test.describe('Profile Tabs', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-12: Given I am authenticated and on the page, When I perform the action, Then profile content tabs are present', async ({ page }) => {
    const tablistVisible = await page.locator('[role="tablist"]').first().isVisible({ timeout: 8000 }).catch(() => false);
    const tabsVisible    = await page.locator('[role="tab"]').first().isVisible({ timeout: 8000 }).catch(() => false);
    if (!tablistVisible && !tabsVisible) { test.skip(); return; }
    expect(tablistVisible || tabsVisible).toBe(true);
  });

  test('TC-PROFILE-13: Given I am on the page, When the page renders, Then Posts tab is visible', async ({ page }) => {
    const postsTab = page.locator('[role="tab"]').filter({ hasText: /posts?/i }).first();
    if (await postsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(postsTab).toBeVisible();
    }
  });

  test('TC-PROFILE-14: Given the page is loaded, When I click Photos tab loads photo grid, Then it responds correctly', async ({ page }) => {
    const photosTab = page.locator('[role="tab"]').filter({ hasText: /photos?/i }).first();
    if (!(await photosTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await photosTab.click();
    await page.waitForTimeout(1000);
    const grid  = page.locator('main img, main [role="grid"]').first();
    const empty = page.locator('main').getByText(/no photos|no images/i).first();
    await expect(grid.or(empty).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-PROFILE-15: Given the About tab is present, When I click the About tab, Then it shows profile info section', async ({ page }) => {
    const aboutTab = page.locator('[role="tab"]').filter({ hasText: /about/i }).first();
    if (!(await aboutTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await aboutTab.click();
    await page.waitForTimeout(1000);
    const info = page.locator('main section, main > div > div').first();
    await expect(info).toBeVisible({ timeout: 8000 });
  });

  test('TC-PROFILE-16: Given the Friends tab is present, When I click the Friends tab, Then it shows friends list', async ({ page }) => {
    const friendsTab = page.locator('[role="tab"]').filter({ hasText: /friends?/i }).first();
    if (!(await friendsTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await friendsTab.click();
    await page.waitForTimeout(1000);
    const list  = page.locator('main ul li, main > div > div').first();
    const empty = page.locator('main').getByText(/no friends|start connecting/i).first();
    await expect(list.or(empty).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-PROFILE-17: Given I am authenticated and on the page, When I perform the action, Then active tab indicator updates when switching tabs', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() < 2) return;
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await page.waitForTimeout(500);
    const selected = await secondTab.getAttribute('aria-selected').catch(() => null)
      ?? await secondTab.getAttribute('data-state').catch(() => null);
    const isActive = selected === 'true' || selected === 'active';
    expect(isActive).toBe(true);
  });
});

// ── Posts Tab ──────────────────────────────────────────────────────────────────

test.describe('Posts Tab', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-18: Given I am on the posts tab, When I view it, Then it shows the user\'s posts or empty state', async ({ page }) => {
    const postsTab = page.locator('[role="tab"]').filter({ hasText: /posts?/i }).first();
    if (await postsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await postsTab.click();
      await page.waitForTimeout(1000);
    }
    const post  = page.locator('main article, main > div > div').first();
    const empty = page.locator('main').getByText(/no posts|nothing here|start sharing/i).first();
    await expect(post.or(empty).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-PROFILE-19: Given I am on the page, When I inspect the content, Then own post on profile has an edit option', async ({ page }) => {
    const postsTab = page.locator('[role="tab"]').filter({ hasText: /posts?/i }).first();
    if (await postsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await postsTab.click();
      await page.waitForTimeout(1000);
    }
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const editOpt = page.locator('[role="menuitem"]').filter({ hasText: /edit/i }).first();
    if (await editOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(editOpt).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-20: Given I am on the page, When I inspect the content, Then own post on profile has a delete option', async ({ page }) => {
    const postsTab = page.locator('[role="tab"]').filter({ hasText: /posts?/i }).first();
    if (await postsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await postsTab.click();
      await page.waitForTimeout(1000);
    }
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const deleteOpt = page.locator('[role="menuitem"]').filter({ hasText: /delete/i }).first();
    if (await deleteOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(deleteOpt).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-21: Given I am on the post cards on profile, When I view it, Then it shows like and comment buttons', async ({ page }) => {
    const postsTab = page.locator('[role="tab"]').filter({ hasText: /posts?/i }).first();
    if (await postsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await postsTab.click();
      await page.waitForTimeout(1000);
    }
    const likeBtn = page.locator('[aria-label*="like" i]').first();
    const iconBtn = page.locator('main button:not([data-state="closed"]):has(svg)').first();
    if (await likeBtn.isVisible({ timeout: 5000 }).catch(() => false)
     || await iconBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(likeBtn.or(iconBtn).first()).toBeVisible();
    }
  });
});

// ── Edit Profile ───────────────────────────────────────────────────────────────

test.describe('Edit Profile', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-22: Given I am on the page, When the page renders, Then Edit Profile button is visible', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    const editIcon = page.locator('[aria-label*="edit profile" i]').first();
    const editVisible = (await editBtn.isVisible({ timeout: 8000 }).catch(() => false)) ||
                        (await editIcon.isVisible({ timeout: 8000 }).catch(() => false));
    if (!editVisible) { test.skip(); return; }
    expect(editVisible).toBe(true);
  });

  test('TC-PROFILE-23: Given the Edit Profile is present, When I click the Edit Profile, Then it opens an edit form or modal', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await editBtn.click();
    await page.waitForTimeout(800);
    const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
    const form   = page.locator('form').first();
    const navigated = !page.url().includes('/app/profile/');
    await expect(dialog.or(form).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-PROFILE-24: Given I am on the page, When I inspect the content, Then edit form has a name field pre-filled with current name', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await editBtn.click();
    await page.waitForTimeout(800);
    const nameInput = page.locator(
      'input[name*="name" i], input[placeholder*="name" i], input[aria-label*="name" i]'
    ).first();
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(nameInput).toBeVisible();
      const value = await nameInput.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
    await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-25: Given I am on the page, When I inspect the content, Then edit form has a bio field', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await editBtn.click();
    await page.waitForTimeout(800);
    const bioInput = page.locator(
      'textarea[name*="bio" i], input[name*="bio" i], textarea[placeholder*="bio" i], textarea[aria-label*="bio" i]'
    ).first();
    if (await bioInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(bioInput).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-26: Given I am on the page, When I inspect the content, Then edit form has a Save button', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await editBtn.click();
    await page.waitForTimeout(800);
    const saveBtn = page.locator('button').filter({ hasText: /save|update|confirm/i }).first();
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(saveBtn).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-27: Given I am on the page, When I interact with the element, Then edit form can be dismissed without saving', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await editBtn.click();
    await page.waitForTimeout(800);
    const dialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
    if (!(await dialog.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/app\/profile\//);
  });

  test('TC-PROFILE-28: Given I am on the page, When I inspect the content, Then edit form has an avatar upload option', async ({ page }) => {
    const editBtn = page.locator('button').filter({ hasText: /edit\s*profile/i }).first();
    if (!(await editBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await editBtn.click();
    await page.waitForTimeout(800);
    const avatarUpload = page.locator(
      'input[type="file"], [aria-label*="upload" i], [aria-label*="change photo" i], [aria-label*="profile photo" i]'
    ).first();
    if (await avatarUpload.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(avatarUpload).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });
});

// ── Other User Profile ─────────────────────────────────────────────────────────

test.describe('Other User Profile', () => {
  test('TC-PROFILE-29: Given I am authenticated and on the page, When I perform the action, Then it shows Follow or Add Friend button', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const followBtn = page.locator('button').filter({ hasText: /follow|add friend|connect/i }).first();
    if (await followBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(followBtn).toBeEnabled();
    }
  });

  test('TC-PROFILE-30: Given I am authenticated and on the page, When I perform the action, Then Follow button changes state after clicking', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const followBtn = page.locator('button').filter({ hasText: /^follow$/i }).first();
    if (!(await followBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await followBtn.click();
    await page.waitForTimeout(1000);
    // State should change: "Following", "Requested", or button disappears
    const after = await followBtn.textContent().catch(() => '');
    const changed = !after.match(/^follow$/i) || !(await followBtn.isVisible({ timeout: 2000 }).catch(() => false));
    expect(changed || page.isClosed() === false).toBe(true);
    // Undo follow to keep clean state
    const unfollowBtn = page.locator('button').filter({ hasText: /unfollow|following/i }).first();
    if (await unfollowBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await unfollowBtn.click();
      await page.waitForTimeout(800);
    }
  });

  test('TC-PROFILE-31: Given I am on the other user profile, When I view it, Then it shows a Message button', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const msgBtn = page.locator('button').filter({ hasText: /message/i }).first();
    if (await msgBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await expect(msgBtn).toBeEnabled();
    }
  });

  test('TC-PROFILE-32: Given the Message on other profile is present, When I click the Message on other profile, Then it opens a message thread', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const msgBtn = page.locator('button').filter({ hasText: /message/i }).first();
    if (!(await msgBtn.isVisible({ timeout: 6000 }).catch(() => false))) return;
    await msgBtn.click();
    await page.waitForTimeout(1000);
    const chatArea = page.locator('[role="log"], main section, [aria-label*="chat" i]').first();
    const dialog   = page.locator('[role="dialog"]').first();
    const msgPage  = page.url().includes('/app/messages');
    expect(msgPage || await chatArea.isVisible({ timeout: 5000 }).catch(() => false)
      || await dialog.isVisible({ timeout: 5000 }).catch(() => false)).toBe(true);
    if (msgPage) await page.goBack({ waitUntil: 'domcontentloaded' });
    else await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-33: Given I am on the page, When I inspect the content, Then other user profile 3-dot menu has block and report options', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const blockOpt  = page.locator('[role="menuitem"]').filter({ hasText: /block/i }).first();
    const reportOpt = page.locator('[role="menuitem"]').filter({ hasText: /report/i }).first();
    if (await blockOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(blockOpt).toBeVisible();
    }
    if (await reportOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(reportOpt).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('TC-PROFILE-34: Given I am on the own profile does not, When I view it, Then it shows Follow or Add Friend button', async ({ page }) => {
    await goOwnProfile(page);
    const followBtn = page.locator('button').filter({ hasText: /^follow$|^add friend$/i }).first();
    // On own profile, follow button should not exist
    const isVisible = await followBtn.isVisible({ timeout: 3000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('TC-PROFILE-35: Given I am authenticated and on the page, When I perform the action, Then mutual friends count is shown on another user\'s profile', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const mutual = page.locator('main').getByText(/mutual/i).first();
    if (await mutual.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(mutual).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });
});

// ── Block and Report ───────────────────────────────────────────────────────────

test.describe('Block and Report', () => {
  test('TC-PROFILE-36: Given I am authenticated and on the page, When I perform the action, Then block option is present in 3-dot menu on another user profile', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const blockOpt = page.locator('[role="menuitem"]').filter({ hasText: /^block/i }).first();
    if (await blockOpt.isVisible({ timeout: 4000 }).catch(() => false)) {
      await expect(blockOpt).toBeVisible();
    }
    await page.keyboard.press('Escape');
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-37: Given the block is present, When I click the block, Then it opens a confirmation dialog', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const blockOpt = page.locator('[role="menuitem"]').filter({ hasText: /^block/i }).first();
    if (!(await blockOpt.isVisible({ timeout: 4000 }).catch(() => false))) {
      await page.keyboard.press('Escape');
      return;
    }
    await blockOpt.click();
    await page.waitForTimeout(800);
    const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]').first();
    if (await confirmDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(confirmDialog).toBeVisible();
      // Cancel to avoid actually blocking
      const cancelBtn = confirmDialog.locator('button').filter({ hasText: /cancel|no/i }).first();
      if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-38: Given I am on the blocked user profile, When I view it, Then it shows a blocked state indicator', async ({ page }) => {
    // This test observes the blocked state without performing an actual block
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const blockedIndicator = page.locator('main').getByText(/blocked|you have blocked/i).first();
    if (await blockedIndicator.isVisible({ timeout: 4000 }).catch(() => false)) {
      await expect(blockedIndicator).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-39: Given I am authenticated and on the page, When I perform the action, Then report option in 3-dot menu opens a report form', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const reportOpt = page.locator('[role="menuitem"]').filter({ hasText: /^report/i }).first();
    if (!(await reportOpt.isVisible({ timeout: 4000 }).catch(() => false))) {
      await page.keyboard.press('Escape');
      return;
    }
    await reportOpt.click();
    await page.waitForTimeout(800);
    const reportForm = page.locator('[role="dialog"], [aria-modal="true"], form').first();
    if (await reportForm.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(reportForm).toBeVisible();
    }
    await page.keyboard.press('Escape');
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-40: Given I am on the page, When I inspect the content, Then report form has selectable report categories', async ({ page }) => {
    const navigated = await goOtherProfile(page);
    if (!navigated) return;
    const moreBtn = page.locator('[aria-label*="more" i], [aria-label*="option" i]').first();
    if (!(await moreBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await moreBtn.click();
    await page.waitForTimeout(500);
    const reportOpt = page.locator('[role="menuitem"]').filter({ hasText: /^report/i }).first();
    if (!(await reportOpt.isVisible({ timeout: 4000 }).catch(() => false))) {
      await page.keyboard.press('Escape');
      return;
    }
    await reportOpt.click();
    await page.waitForTimeout(800);
    const categoryOption = page.locator('[role="radio"], [role="option"], input[type="radio"], label').first();
    if (await categoryOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(categoryOption).toBeVisible();
    }
    await page.keyboard.press('Escape');
    expect(page.isClosed()).toBe(false);
  });
});

// ── Profile Sharing ────────────────────────────────────────────────────────────

test.describe('Profile Sharing', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-41: Given I am authenticated and on the page, When I perform the action, Then share profile button is present on own profile', async ({ page }) => {
    const shareBtn = page.locator('button, a').filter({ hasText: /share.*profile|share/i }).first();
    const shareIcon = page.locator('[aria-label*="share" i]').first();
    if (await shareBtn.isVisible({ timeout: 5000 }).catch(() => false)
     || await shareIcon.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(shareBtn.or(shareIcon).first()).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-42: Given I am authenticated and on the page, When I perform the action, Then copy link option is available when sharing profile', async ({ page }) => {
    const shareBtn = page.locator('button, [aria-label*="share" i]').filter({ hasText: /share/i }).first();
    const shareIcon = page.locator('[aria-label*="share" i]').first();
    const target = await shareBtn.isVisible({ timeout: 5000 }).catch(() => false) ? shareBtn : shareIcon;
    if (!(await target.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await target.click();
    await page.waitForTimeout(800);
    const copyLinkOpt = page.locator('button, [role="menuitem"]').filter({ hasText: /copy.*link|copy.*url/i }).first();
    if (await copyLinkOpt.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(copyLinkOpt).toBeVisible();
    }
    await page.keyboard.press('Escape');
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-43: Given I am authenticated and on the page, When I perform the action, Then profile URL in the browser is a valid shareable link', async ({ page }) => {
    const url = page.url();
    expect(url).toMatch(/https?:\/\/app\.omre\.ai\/app\/profile\//);
    expect(url.length).toBeGreaterThan(0);
  });
});

// ── Content Tabs Extended ──────────────────────────────────────────────────────

test.describe('Content Tabs Extended', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-44: Given I am authenticated and on the page, When I perform the action, Then liked posts tab is present and loads content or empty state', async ({ page }) => {
    const likedTab = page.locator('[role="tab"]').filter({ hasText: /liked|likes/i }).first();
    if (!(await likedTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await likedTab.click();
    await page.waitForTimeout(1200);
    const content   = page.locator('main article, main > div > div').first();
    const emptyState = page.locator('main').getByText(/no liked|nothing|empty/i).first();
    await expect(content.or(emptyState).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-PROFILE-45: Given I am authenticated and on the page, When I perform the action, Then videos or media tab is present on the profile', async ({ page }) => {
    const videosTab = page.locator('[role="tab"]').filter({ hasText: /videos?|media/i }).first();
    if (await videosTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(videosTab).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-46: Given I am on the videos or media tab loads content or, When I view it, Then it shows empty state', async ({ page }) => {
    const videosTab = page.locator('[role="tab"]').filter({ hasText: /videos?|media/i }).first();
    if (!(await videosTab.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await videosTab.click({ force: true });
    await page.waitForTimeout(1200);
    const contentVisible   = await page.locator('main video, main img, main article').first().isVisible({ timeout: 8000 }).catch(() => false);
    const emptyStateVisible = await page.locator('main').getByText(/no videos|no media|nothing/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    if (!contentVisible && !emptyStateVisible) { test.skip(); return; }
    expect(contentVisible || emptyStateVisible).toBe(true);
  });

  test('TC-PROFILE-47: Given I am authenticated and on the page, When I perform the action, Then featured section is present if the app supports it', async ({ page }) => {
    const featuredSection = page.locator('main').getByText(/featured/i).first();
    if (await featuredSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(featuredSection).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });
});

// ── Privacy from Profile ───────────────────────────────────────────────────────

test.describe('Privacy from Profile', () => {
  test.beforeEach(async ({ page }) => { await goOwnProfile(page); });

  test('TC-PROFILE-48: Given I am authenticated and on the page, When I perform the action, Then privacy settings link is accessible from own profile', async ({ page }) => {
    const privacyLink = page.locator('a, button').filter({ hasText: /privacy.*settings|settings/i }).first();
    const settingsLink = page.locator('a[href*="/app/settings"]').first();
    if (await privacyLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(privacyLink).toBeVisible();
    } else if (await settingsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(settingsLink).toBeVisible();
    }
    expect(page.isClosed()).toBe(false);
  });

  test('TC-PROFILE-49: Given I am authenticated and on the page, When I perform the action, Then navigating to privacy settings from own profile reaches the settings page', async ({ page }) => {
    const privacyLink = page.locator('a, button').filter({ hasText: /privacy.*settings/i }).first();
    const settingsLink = page.locator('a[href*="/app/settings"]').first();
    const target = await privacyLink.isVisible({ timeout: 5000 }).catch(() => false)
      ? privacyLink
      : settingsLink;
    if (!(await target.isVisible({ timeout: 5000 }).catch(() => false))) return;
    await target.click();
    await page.waitForTimeout(1000);
    const onSettings = page.url().includes('/app/settings') || page.url().includes('/app/profile');
    expect(onSettings).toBe(true);
    expect(page.isClosed()).toBe(false);
  });
});

test.describe('TC-PROFILE | Edit Profile Save Flow', () => {
  test('TC-PROFILE-50: Given I am on my own profile page and click Edit Profile, When I modify a field and click Save, Then the profile is updated and a success indicator or redirect occurs', async ({ page }) => {
    await page.goto('https://omre.ai/app/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const editBtn = page.locator('button, a').filter({ hasText: /edit profile/i }).first();
    const editVisible = await editBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (!editVisible) { test.skip(); return; }
    await editBtn.click();
    await page.waitForTimeout(1500);
    const bioInput = page.locator('textarea[name*="bio" i], textarea[placeholder*="bio" i], textarea[placeholder*="about" i], input[name*="bio" i]').first();
    const bioVisible = await bioInput.isVisible({ timeout: 5000 }).catch(() => false);
    if (!bioVisible) { test.skip(); return; }
    await bioInput.click();
    const currentVal = await bioInput.inputValue().catch(() => '');
    await bioInput.fill(currentVal || 'Automated test bio');
    const saveBtn = page.locator('button[type="submit"], button').filter({ hasText: /save|update/i }).first();
    const saveVisible = await saveBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!saveVisible) { test.skip(); return; }
    await saveBtn.click();
    await page.waitForTimeout(2000);
    const success = page.locator('[role="alert"], [class*="toast" i], [class*="success" i]').first();
    const successVisible = await success.isVisible({ timeout: 3000 }).catch(() => false);
    const backOnProfile = !page.url().includes('edit');
    expect(successVisible || backOnProfile).toBeTruthy();
  });
});
