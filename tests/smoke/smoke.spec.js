/**
 * Smoke tests � all 34 modules
 * Validates: page loads, correct URL reached, main content rendered.
 * Uses saved auth session � no UI login needed.
 */
import { test, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';
const BASE = 'https://omre.ai';

test.use({ storageState: AUTH_FILE });
test.setTimeout(30000);

/**
 * id        � TC number suffix
 * name      � human label
 * url       � full URL to navigate to
 * urlMatch  � regex the final URL must satisfy (handles redirects)
 * heading   � expected h1/h2 text from discovery (optional, used when stable)
 */
const MODULES = [
  // -- Sidebar ----------------------------------------------------------------
  { id: '01', name: 'Home',           url: `${BASE}/app/home`,            urlMatch: /\/app\/home/ },
  { id: '02', name: 'Explore',        url: `${BASE}/app/explore`,         urlMatch: /\/app\/explore/ },
  { id: '03', name: 'Shorts',         url: `${BASE}/app/shorts`,          urlMatch: /\/app\/shorts/ },
  { id: '04', name: 'Live',           url: `${BASE}/app/live`,            urlMatch: /\/app\/live/ },
  { id: '05', name: 'Messages',       url: `${BASE}/app/messages`,        urlMatch: /\/app\/messages/ },
  { id: '06', name: 'Notifications',  url: `${BASE}/app/notifications`,   urlMatch: /\/app\/notifications/ },
  { id: '07', name: 'Profile',        url: `${BASE}/app/profile/${(process.env.TEST_EMAIL||'').split('@')[0]}`, urlMatch: /\/app\/profile/ },
  { id: '08', name: 'Reputation',     url: `${BASE}/app/reputation`,      urlMatch: /\/app\/reputation/ },
  { id: '09', name: 'Business Suite', url: `${BASE}/app/business-suite`,  urlMatch: /\/app\/business-suite/ },
  { id: '10', name: 'Settings',       url: `${BASE}/app/settings`,        urlMatch: /\/app\/settings/ },
  { id: '11', name: 'Omniknow',       url: `${BASE}/app/omniknow`,        urlMatch: /\/app\/omniknow/ },
  { id: '12', name: 'Happy Corner',   url: `${BASE}/app/happy-corner`,    urlMatch: /\/app\/happy-corner/ },
  { id: '13', name: 'Virtual World',  url: `${BASE}/app/virtual-world`,   urlMatch: /\/app\/virtual-world/ },
  { id: '14', name: 'Digital Citizen',url: `${BASE}/app/digital-citizen`, urlMatch: /\/app\/digital-citizen/ },
  { id: '15', name: 'Omni AI',        url: `${BASE}/app/omni-ai`,         urlMatch: /\/app\/omni-ai/ },
  { id: '16', name: 'Pages',          url: `${BASE}/app/pages`,           urlMatch: /\/app\/pages/ },
  { id: '17', name: 'Groups',         url: `${BASE}/app/groups`,          urlMatch: /\/app\/groups/ },
  { id: '18', name: 'Town Hall',      url: `${BASE}/app/town-hall`,       urlMatch: /\/app\/town-hall/ },
  { id: '19', name: 'Birthday',       url: `${BASE}/app/birthday`,        urlMatch: /\/app\/birthday/ },
  { id: '20', name: 'Weather',        url: `${BASE}/app/weather`,         urlMatch: /\/app\/weather/ },
  { id: '21', name: 'Images',         url: `${BASE}/app/images`,          urlMatch: /\/app\/images/ },
  { id: '22', name: 'Friends',        url: `${BASE}/app/friends`,         urlMatch: /\/app\/friends/ },

  // -- Top Header -------------------------------------------------------------
  { id: '23', name: 'News',           url: `${BASE}/app/news/home`,       urlMatch: /\/app\/news/ },
  { id: '24', name: 'Video (Create)', url: `${BASE}/app/live/create`,     urlMatch: /\/app\/live/ },
  { id: '25', name: 'Chat',           url: `${BASE}/app/messages`,        urlMatch: /\/app\/messages/ },
  { id: '26', name: 'Biz',            url: `${BASE}/biz`,                 urlMatch: /\/biz/ },
  { id: '27', name: 'Link',           url: `${BASE}/jobs/home`,           urlMatch: /\/jobs/ },
  { id: '28', name: 'Learn',          url: `${BASE}/learn/home`,          urlMatch: /\/learn/ },
  { id: '29', name: 'Orbit',          url: `${BASE}/app/orbit/home`,      urlMatch: /\/app\/orbit/ },
  { id: '30', name: 'Games',          url: `${BASE}/app/games`,           urlMatch: /\/app\/games/ },
  { id: '31', name: 'Mart',           url: `${BASE}/app/marketplace`,     urlMatch: /\/app\/marketplace/ },
  { id: '32', name: 'Meetings',       url: `${BASE}/app/meet/home`,       urlMatch: /\/app\/meet/ },
  { id: '33', name: 'Wallet',         url: `${BASE}/app/wallet`,          urlMatch: /\/app\/wallet/ },
  { id: '34', name: 'Studio',         url: `${BASE}/app/home`,            urlMatch: /\/app\/home/ },
];

// -- Helpers -------------------------------------------------------------------

/** Returns true if the page shows a recognisable "access denied / login" screen */
async function isAuthWall(page) {
  const url = page.url();
  return /\/auth\/login|\/login|\/signin/i.test(url);
}

/** Visible content check � at least one of these must be present */
function mainContent(page) {
  return page.locator('h1, h2, main, [role="main"]').first();
}

// -- Tests (data-driven) -------------------------------------------------------

for (const mod of MODULES) {
  test(`TC-SMOKE-${mod.id}: ${mod.name} loads`, async ({ page }) => {
    await page.goto(mod.url, { waitUntil: 'domcontentloaded' });

    // Allow SPA to settle
    await page.waitForTimeout(1500);

    // Must not have bounced to login (session expired / access denied)
    if (await isAuthWall(page)) {
      throw new Error(`${mod.name} redirected to login � session may be expired or route requires different auth`);
    }

    // URL must match expected pattern
    await expect(page).toHaveURL(mod.urlMatch, { timeout: 10000 });

    // Page must render some content (not a blank/broken page)
    await expect(mainContent(page)).toBeVisible({ timeout: 10000 });
  });
}
