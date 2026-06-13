/**
 * rename-tests.js
 * Transforms test descriptions to Given-When-Then format across all spec files.
 */
const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, 'tests');

function findSpecFiles(dir) {
  const results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) results.push(...findSpecFiles(full));
    else if (item.endsWith('.spec.js')) results.push(full);
  }
  return results;
}

function toGWT(desc) {
  // Already GWT
  if (/^TC-[A-Z]+-\d+.*given\b/i.test(desc)) return desc;

  const m = desc.match(/^(TC-[A-Z]+-\d+)\s*[:\-|]?\s*(.*)/);
  if (!m) return desc;
  const id  = m[1];
  const raw = m[2].trim();
  const lo  = raw.toLowerCase();

  let given, when, then;

  // ── navigates / loads at URL ───────────────────────────────────────────────
  if (/^navigates? to .* (url|page|route)/.test(lo) || /^page loads? at (correct|the)/.test(lo)) {
    given = 'I am authenticated';
    when  = 'I navigate to the page';
    then  = raw.replace(/^(navigates? to \S+\s*|page loads? at (correct|the)\s*)/i, '') || 'the URL is correct';
  }

  // ── clicking X opens/closes/navigates ─────────────────────────────────────
  else if (/^clicking/.test(lo)) {
    const p = raw.match(/^clicking\s+(.+?)\s+(opens?|closes?|navigates?|shows?|triggers?|redirects?|changes?|updates?|removes?|adds?|reveals?|dismisses?)(.*)$/i);
    if (p) {
      const subject = p[1].replace(/^(a|an|the)\s+/i, '');
      given = `the ${subject} is present`;
      when  = `I click the ${subject}`;
      then  = `it ${p[2].toLowerCase()}${p[3]}`;
    } else {
      given = 'the page is loaded';
      when  = raw.replace(/^clicking\s+/i, 'I click ');
      then  = 'it responds correctly';
    }
  }

  // ── X fires within N ms (performance) ─────────────────────────────────────
  else if (/fires? within/.test(lo)) {
    const page = raw.replace(/\s+(dom\w*|fires?).*/i, '');
    given = `I navigate to ${page.replace(/page$/i,'').trim().toLowerCase()} page`;
    when  = 'the browser processes the request';
    then  = raw;
  }

  // ── X is visible ──────────────────────────────────────────────────────────
  else if (/\bis visible\b/.test(lo)) {
    const el = raw.replace(/\s+is visible.*/i, '');
    given = 'I am on the page';
    when  = 'the page renders';
    then  = `${el} is visible`;
  }

  // ── X shows / displays Y ──────────────────────────────────────────────────
  else if (/^(the\s+)?(?!\w+ing\b)[\w\s]+ (shows?|displays?)\b/.test(lo)) {
    const p = raw.match(/^(.+?)\s+(shows?|displays?)\s+(.+)$/i);
    if (p) {
      given = `I am on the ${p[1].toLowerCase()}`;
      when  = 'I view it';
      then  = `it ${p[2].toLowerCase()} ${p[3]}`;
    } else {
      given = 'I am on the page'; when = 'I view it'; then = raw;
    }
  }

  // ── X has / contains Y ────────────────────────────────────────────────────
  else if (/\b(has|have|contains?)\b/.test(lo)) {
    given = 'I am on the page';
    when  = 'I inspect the content';
    then  = raw;
  }

  // ── logout / log out ──────────────────────────────────────────────────────
  else if (/\blog\s*out\b/.test(lo)) {
    given = 'I am logged in';
    when  = 'I log out';
    then  = raw.replace(/^.*log\s*out[s]?\s*/i, '') || 'I am redirected to the login page';
  }

  // ── session / auth ────────────────────────────────────────────────────────
  else if (/\bsession\b/.test(lo)) {
    given = 'I am authenticated';
    when  = 'a session action occurs';
    then  = raw;
  }

  // ── page reload ───────────────────────────────────────────────────────────
  else if (/\breload\b/.test(lo)) {
    given = 'I am on the page';
    when  = 'I reload the page';
    then  = raw.replace(/.*reload[s]?\s*/i, '') || 'content remains intact';
  }

  // ── no / zero / empty ─────────────────────────────────────────────────────
  else if (/^(no |zero |page has no )/.test(lo)) {
    given = 'the page is loaded';
    when  = 'I inspect it';
    then  = raw;
  }

  // ── can be / is able to ───────────────────────────────────────────────────
  else if (/\bcan be\b/.test(lo)) {
    given = 'I am on the page';
    when  = 'I interact with the element';
    then  = raw;
  }

  // ── default ───────────────────────────────────────────────────────────────
  else {
    given = 'I am authenticated and on the page';
    when  = 'I perform the action';
    then  = raw;
  }

  return `${id}: Given ${given}, When ${when}, Then ${then}`;
}

let totalFiles = 0, totalTests = 0;

for (const file of findSpecFiles(TESTS_DIR)) {
  const original = fs.readFileSync(file, 'utf8');
  let count = 0;

  const updated = original.replace(
    /\btest\s*\(\s*(['"`])(TC-[A-Z]+-\d+[^'"`]*?)\1/g,
    (match, q, desc) => {
      const transformed = toGWT(desc);
      if (transformed !== desc) count++;
      return `test(${q}${transformed}${q}`;
    }
  );

  if (count > 0) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✓ ${path.relative(__dirname, file)} — ${count} renamed`);
    totalFiles++;
    totalTests += count;
  }
}

console.log(`\nDone: ${totalTests} tests renamed across ${totalFiles} files`);
