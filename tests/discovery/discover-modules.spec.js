import { test } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

test.setTimeout(600_000); // 10 minutes

const BASE = 'https://app.omre.ai';
const OUT_DIR = 'discovery-output';
const results = [];

const SIDEBAR = [
  'Home', 'Explore', 'Shorts', 'Live', 'Messages', 'Notifications',
  'Profile', 'Reputation', 'Business Suite', 'Settings', 'Omniknow',
  'Happy Corner', 'Virtual World', 'Digital Citizen', 'Omni AI',
  'Pages', 'Groups', 'Town Hall', 'Birthday', 'Weather', 'Images', 'Friends',
];

const HEADER = [
  'News', 'Video', 'Chat', 'Biz', 'Link', 'Learn',
  'Studio', 'Orbit', 'Games', 'Mart', 'Meetings', 'Wallet',
];

async function login(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Fill email if visible
  const email = page.getByPlaceholder(/email or username/i);
  if (await email.isVisible({ timeout: 5000 }).catch(() => false))
    await email.fill(process.env.TEST_EMAIL || '');

  // Fill password
  const pwd = page.getByRole('textbox', { name: 'Password' });
  await pwd.waitFor({ timeout: 10000 });
  await pwd.fill(process.env.TEST_PASSWORD || '');

  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for redirect away from auth pages
  await page.waitForURL(/\/app\//, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

async function findNavItem(page, name) {
  const strategies = [
    () => page.getByRole('link', { name: new RegExp(`^${name}$`, 'i') }),
    () => page.getByRole('link', { name: new RegExp(name, 'i') }).first(),
    () => page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }),
    () => page.getByRole('button', { name: new RegExp(name, 'i') }).first(),
    () => page.locator(`nav a, aside a, [role="navigation"] a`).filter({ hasText: new RegExp(`^${name}$`, 'i') }).first(),
    () => page.locator(`nav, aside, header`).getByText(new RegExp(`^${name}$`, 'i')).first(),
  ];

  for (const strategy of strategies) {
    try {
      const el = strategy();
      if (await el.isVisible({ timeout: 1500 })) return el;
    } catch { /* try next */ }
  }
  return null;
}

async function captureModule(page, name, section) {
  const url = page.url();
  const title = await page.title().catch(() => '');
  const heading = await page.locator('h1, h2').first().innerText({ timeout: 2000 }).catch(() => '');
  const file = `${OUT_DIR}/${section}_${name.replace(/\s+/g, '_')}.png`;
  await page.screenshot({ path: file, fullPage: false });
  const entry = { section, name, url, title, heading, screenshot: file };
  results.push(entry);
  console.log(`  ✓  ${name.padEnd(20)} → ${url}`);
  return entry;
}

async function visitModule(page, name, section) {
  await page.goto(`${BASE}/app/home`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const el = await findNavItem(page, name);
  if (!el) {
    console.log(`  ✗  ${name.padEnd(20)} → nav item not found`);
    results.push({ section, name, url: null, error: 'nav item not found' });
    return;
  }

  await el.click();
  await page.waitForTimeout(2500);
  await captureModule(page, name, section);
}

test('discover all 34 modules', async ({ page }) => {
  mkdirSync(OUT_DIR, { recursive: true });

  // Login
  await login(page);
  console.log(`\nLogged in → ${page.url()}\n`);

  // ── Left Sidebar ──
  console.log('─── LEFT SIDEBAR ───────────────────────────');
  for (const name of SIDEBAR) {
    await visitModule(page, name, 'sidebar');
  }

  // ── Top Header ──
  console.log('\n─── TOP HEADER ─────────────────────────────');
  for (const name of HEADER) {
    await visitModule(page, name, 'header');
  }

  // ── Write reports ──
  writeFileSync(`${OUT_DIR}/modules.json`, JSON.stringify(results, null, 2));

  const found = results.filter(r => r.url);
  const missed = results.filter(r => !r.url);

  const md = [
    '# App Module Discovery Report\n',
    `**Found:** ${found.length}  |  **Not found:** ${missed.length}  |  **Total:** ${results.length}\n`,
    '## Found Modules\n',
    '| # | Section | Module | URL | Heading |',
    '|---|---------|--------|-----|---------|',
    ...found.map((m, i) =>
      `| ${i + 1} | ${m.section} | **${m.name}** | \`${m.url}\` | ${m.heading || m.title || '-'} |`
    ),
    '\n## Not Found\n',
    missed.map(m => `- ${m.section} → **${m.name}**`).join('\n'),
  ].join('\n');

  writeFileSync(`${OUT_DIR}/modules.md`, md);

  console.log(`\n✅ Done — ${found.length}/${results.length} modules found`);
  console.log(`   Report saved → ${OUT_DIR}/modules.md`);
});
