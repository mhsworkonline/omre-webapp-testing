/**
 * Shared selector helpers for the crawl-first module test pattern (see CLAUDE.md /
 * feedback-test-methodology memory). Bakes in fixes for recurring app-wide quirks
 * found across Biz/Link/Learn/Orbit/Town Hall so new module specs don't re-discover
 * and re-fix the same bugs:
 *   - Sidebar/nav icons give links a duplicated accessible name (e.g. "Discover Discover")
 *     -> match by substring, never exact.
 *   - Module sidebars can collide with identically-named global header icons
 *     (e.g. Orbit's own "Notifications" link vs. the header bell) -> scope to <nav>.
 *   - Page h1 titles often collide in strict mode with an h2/h3 widget containing the
 *     same word -> default to level:1.
 */

export const BASE = 'https://omre.ai';
export const AUTH_FILE = 'playwright/.auth/user.json';

export async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/** A sidebar/nav link by visible text — scoped to <nav> to avoid header-icon collisions, substring-matched to survive icon-duplicated accessible names. */
export function navLink(page, name) {
  return page.getByRole('navigation').getByRole('link', { name }).first();
}

/** A page's main h1 title — avoids strict-mode collisions with h2/h3 widgets sharing the same word. */
export function pageHeading(page, name, opts = {}) {
  return page.getByRole('heading', { name, level: 1, ...opts });
}

/** A button by visible text, tolerant of multiple matches (icon-only + full-text variants of the same action). */
export function button(page, name) {
  return page.getByRole('button', { name }).first();
}
