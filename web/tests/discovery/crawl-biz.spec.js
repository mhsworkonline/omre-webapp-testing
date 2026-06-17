import { test } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

test.use({ storageState: 'playwright/.auth/user.json' });
test.setTimeout(600_000);

const BASE = 'https://omre.ai';
const START_PATHS = ['/biz'];
const IN_SCOPE_PREFIXES = ['/biz', '/app/business'];
const MAX_DEPTH = 5;
const MAX_PAGES = 60; // safety cap against runaway crawls
const OUT_DIR = 'discovery-output';

// Never follow links whose text suggests a destructive/account-level action
const SKIP_TEXT_PATTERN = /log.?out|sign.?out|delete|remove|cancel/i;

// Collapse dynamic-ID segments (e.g. /orders/12345 or /orders/9f1c...) into a template,
// so we sample one instance of a repeated detail-page pattern instead of crawling every row.
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
    return IN_SCOPE_PREFIXES.some(p => u.pathname.startsWith(p));
  } catch { return false; }
}

test('recursively crawl the Biz module', async ({ page }) => {
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
      pages.push({ url, path: u.pathname, depth, skipped: true, reason: `duplicate template "${template}" — sampled an earlier instance instead` });
      console.log(`[depth ${depth}] SKIP ${u.pathname} (duplicate template)`);
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
        if (!visited.has(absPath) && depth < MAX_DEPTH) {
          queue.push({ path: absPath, depth: depth + 1 });
        }
      }
    }

    const buttonInfo = [...new Set(
      (await Promise.all(buttons.map(b => b.innerText().catch(() => ''))))
        .map(t => t.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
    )];

    const inputInfo = [];
    for (const i of inputs) {
      const type = (await i.getAttribute('type').catch(() => '')) || 'text';
      const name = await i.getAttribute('name').catch(() => '');
      const placeholder = await i.getAttribute('placeholder').catch(() => '');
      inputInfo.push({ type, name, placeholder });
    }

    pages.push({ url, path: u.pathname, depth, heading, links: linkInfo, buttons: buttonInfo, inputs: inputInfo });
    console.log(`[depth ${depth}] ${u.pathname} — "${heading}" — ${linkInfo.length} links, ${buttonInfo.length} buttons, ${inputInfo.length} inputs`);
  }

  writeFileSync(`${OUT_DIR}/biz-crawl.json`, JSON.stringify(pages, null, 2));

  const visitedPages = pages.filter(p => !p.skipped);
  const skippedPages = pages.filter(p => p.skipped);
  const md = [
    '# Biz Module — Recursive Crawl Report\n',
    `Pages visited: ${visitedPages.length} | Skipped (duplicate templates): ${skippedPages.length}\n`,
  ];
  for (const p of pages) {
    if (p.skipped) {
      md.push(`## [depth ${p.depth}] ${p.path} — SKIPPED\n${p.reason}\n`);
      continue;
    }
    md.push(`## [depth ${p.depth}] ${p.path} — "${p.heading}"\n`);
    md.push(`**Links (${p.links.length}):**`);
    md.push(p.links.map(l => `- "${l.text}" → ${l.href}`).join('\n') || '(none)');
    md.push(`\n**Buttons (${p.buttons.length}):** ${p.buttons.join(', ') || '(none)'}`);
    md.push(`**Inputs (${p.inputs.length}):** ${p.inputs.map(i => `${i.type}${i.name ? '/' + i.name : ''}${i.placeholder ? ` "${i.placeholder}"` : ''}`).join(', ') || '(none)'}\n`);
  }
  writeFileSync(`${OUT_DIR}/biz-crawl.md`, md.join('\n'));
  console.log(`\nDone. ${pages.length} entries (${visitedPages.length} visited, ${skippedPages.length} skipped) written to ${OUT_DIR}/biz-crawl.md`);
});
