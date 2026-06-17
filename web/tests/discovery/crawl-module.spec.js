import { test } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(600_000);

const BASE = 'https://omre.ai';
const MODULE = process.env.CRAWL_MODULE;
const START_PATHS = process.env.CRAWL_START ? process.env.CRAWL_START.split(',') : [];
const SCOPE_PREFIXES = process.env.CRAWL_SCOPE ? process.env.CRAWL_SCOPE.split(',') : [];
const MAX_DEPTH = 5;
const MAX_PAGES = 60;
const OUT_DIR = 'discovery-output';

const SKIP_TEXT_PATTERN = /log.?out|sign.?out|delete|remove|cancel/i;
const NAV_BUTTONS = new Set(['SOCIAL','NEWS','VIDEO','CHAT','BIZ','LINK','LEARN','STUDIO','ORBIT','GAMES','MART','MEETINGS','WALLET','Toggle theme']);

function normalizeTemplate(pathname) {
  return pathname
    .replace(/\/[0-9a-fA-F-]{6,}(?=\/|$)/g, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

function inScope(href) {
  if (!href) return false;
  try {
    const u = new URL(href, BASE);
    if (u.origin !== BASE) return false;
    return SCOPE_PREFIXES.some(p => u.pathname.startsWith(p));
  } catch { return false; }
}

test(`recursively crawl ${MODULE}`, async ({ page }) => {
  if (!MODULE || !START_PATHS.length || !SCOPE_PREFIXES.length) {
    test.skip(true, 'CRAWL_MODULE/CRAWL_START/CRAWL_SCOPE env vars not set');
    return;
  }
  page.setDefaultNavigationTimeout(15000);
  page.setDefaultTimeout(15000);
  mkdirSync(OUT_DIR, { recursive: true });
  const visited = new Set();
  const seenTemplates = new Set();
  const pages = [];
  const queue = START_PATHS.map(p => ({ path: p, depth: 0 }));

  while (queue.length && pages.length < MAX_PAGES) {
    const { path: pathToVisit, depth } = queue.shift();
    const url = new URL(pathToVisit, BASE).toString();
    const u = new URL(url);
    const template = normalizeTemplate(u.pathname);

    if (visited.has(u.pathname)) continue;
    visited.add(u.pathname);

    if (depth > 0 && seenTemplates.has(template)) {
      pages.push({ url, path: u.pathname, depth, skipped: true, reason: `duplicate template "${template}"` });
      continue;
    }
    seenTemplates.add(template);

    await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1500);

    const heading = await page.locator('h1, h2').first().innerText().catch(() => '(none)');
    const links = await page.getByRole('link').all();
    const buttons = await page.getByRole('button').all();
    const inputs = await page.locator('input, textarea, select').all();

    const linkInfo = [];
    for (const l of links) {
      const text = (await l.innerText().catch(() => '')).trim().replace(/\s+/g, ' ');
      const href = await l.getAttribute('href').catch(() => null);
      if (!text && !href) continue;
      linkInfo.push({ text, href });
      if (href && inScope(href) && !SKIP_TEXT_PATTERN.test(text)) {
        const absPath = new URL(href, BASE).pathname;
        if (!visited.has(absPath) && depth < MAX_DEPTH) queue.push({ path: absPath, depth: depth + 1 });
      }
    }

    const buttonInfo = [...new Set((await Promise.all(buttons.map(b => b.innerText().catch(() => ''))))
      .map(t => t.trim().replace(/\s+/g, ' ')).filter(Boolean))];

    const inputInfo = [];
    for (const i of inputs) {
      inputInfo.push({
        type: (await i.getAttribute('type').catch(() => '')) || 'text',
        name: await i.getAttribute('name').catch(() => ''),
        placeholder: await i.getAttribute('placeholder').catch(() => ''),
      });
    }

    // SPA buttons (no href) that look navigational — click and see where they lead
    for (const btnText of buttonInfo) {
      if (NAV_BUTTONS.has(btnText) || SKIP_TEXT_PATTERN.test(btnText)) continue;
      const btn = page.getByRole('button', { name: btnText, exact: true }).first();
      const visible = await btn.isVisible().catch(() => false);
      if (!visible) continue;
      await btn.click().catch(() => {});
      await page.waitForTimeout(1200);
      const newPath = new URL(page.url()).pathname;
      if (newPath !== u.pathname) {
        if (inScope(page.url()) && !visited.has(newPath)) {
          linkInfo.push({ text: `[button] ${btnText}`, href: newPath });
          if (depth < MAX_DEPTH) queue.push({ path: newPath, depth: depth + 1 });
        }
        await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(1200);
      }
    }

    pages.push({ url, path: u.pathname, depth, heading, links: linkInfo, buttons: buttonInfo, inputs: inputInfo });
    writeFileSync(`${OUT_DIR}/${MODULE}-crawl.json`, JSON.stringify(pages, null, 2));
  }

  const visitedPages = pages.filter(p => !p.skipped);
  const skippedPages = pages.filter(p => p.skipped);
  const md = [`# ${MODULE} Module — Recursive Crawl Report\n`, `Pages visited: ${visitedPages.length} | Skipped: ${skippedPages.length}\n`];
  for (const p of pages) {
    if (p.skipped) { md.push(`## [depth ${p.depth}] ${p.path} — SKIPPED\n${p.reason}\n`); continue; }
    md.push(`## [depth ${p.depth}] ${p.path} — "${p.heading}"\n`);
    md.push(`**Links (${p.links.length}):**`);
    md.push(p.links.map(l => `- "${l.text}" → ${l.href}`).join('\n') || '(none)');
    md.push(`\n**Buttons (${p.buttons.length}):** ${p.buttons.join(', ') || '(none)'}`);
    md.push(`**Inputs (${p.inputs.length}):** ${p.inputs.map(i => `${i.type}${i.name ? '/' + i.name : ''}${i.placeholder ? ` "${i.placeholder}"` : ''}`).join(', ') || '(none)'}\n`);
  }
  writeFileSync(`${OUT_DIR}/${MODULE}-crawl.md`, md.join('\n'));
  console.log(`Done: ${MODULE} — ${pages.length} pages`);
});
