const fs   = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// â”€â”€ Find latest JSON in test-results/ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const resultsDir = path.join(__dirname, 'test-results');
const reportsDir = path.join(__dirname, '..', 'reports', 'web');
const jsonFiles  = fs.readdirSync(resultsDir)
  .filter(f => f.endsWith('.json') && /^\d{4}-\d{2}-\d{2}/.test(f))
  .sort()
  .reverse();

if (!jsonFiles.length) {
  console.error('No JSON result files found in test-results/');
  process.exit(1);
}

// If MERGE_JSON env var is set, merge that file with the newest JSON
const newestFile = path.join(resultsDir, jsonFiles[0]);
const mergeFile  = process.env.MERGE_JSON;

let data;
if (mergeFile && fs.existsSync(mergeFile)) {
  console.log('Merging:', newestFile, '+', mergeFile);
  const d1 = JSON.parse(fs.readFileSync(newestFile, 'utf8'));
  const d2 = JSON.parse(fs.readFileSync(mergeFile,  'utf8'));
  data = { suites: [...(d1.suites || []), ...(d2.suites || [])] };
} else {
  console.log('Reading:', newestFile);
  data = JSON.parse(fs.readFileSync(newestFile, 'utf8'));
}

// â”€â”€ Module name from file path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function moduleFromFile(file) {
  const f = file.replace(/\\/g, '/');
  const map = {
    'home/home':               'Home',
    'home/post-creation':      'Home',
    'home/stories':            'Home',
    'home/interactions':       'Home',
    'explore/explore':         'Explore',
    'explore/shorts':          'Shorts',
    'content/live':            'Live',
    'social/messages':         'Messages / Chat',
    'social/notifications':    'Notifications',
    'profile/profile':         'Profile',
    'profile/reputation':      'Reputation',
    'platform/business-suite': 'Business Suite',
    'features/settings':       'Settings',
    'platform/omniknow':       'OmniKnow',
    'platform/happy-corner':   'Happy Corner',
    'platform/virtual-world':  'Virtual World',
    'platform/digital-citizen':'Digital Citizen',
    'platform/omni-ai':        'Omni AI',
    'social/pages':            'Pages',
    'social/groups':           'Groups',
    'platform/town-hall':      'Town Hall',
    'content/birthday':        'Birthday',
    'content/weather':         'Weather',
    'content/images':          'Images',
    'social/friends':          'Friends',
    'content/news':            'News',
    'features/video':          'Video',
    'platform/biz':            'Biz',
    'platform/link':           'Link (Jobs)',
    'platform/learn':          'Learn',
    'features/studio':         'Studio',
    'platform/orbit':          'Orbit',
    'features/games':          'Games',
    'features/mart':           'Mart',
    'features/meetings':       'Meetings',
    'features/wallet':         'Wallet',
    'features/ai-studio':      'AI Studio',
    'channel/my-channel':      'Channel',
    'channel/subscriptions':   'Subscriptions',
    'social/posts':            'Posts',
    'auth/login':              'Auth',
    'errors/error-states':     'Error States',
    'responsive/mobile':       'Mobile / Responsive',
    'navigation/cross-module': 'Navigation',
    'performance/performance': 'Performance',
    'security/security':       'Security',
    'accessibility/a11y':      'Accessibility',
    'platform/platform':       'Platform',
    'social/notifications':    'Notifications',
  };
  for (const [key, val] of Object.entries(map)) {
    if (f.includes(key)) return val;
  }
  // fallback: derive from folder/file name
  const parts = f.split('/tests/')[1]?.replace('.spec.js','').split('/') || [];
  return parts.map(p => p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(' â€º ');
}

// â”€â”€ Flatten all tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function flatten(suites, file) {
  const rows = [];
  for (const suite of suites || []) {
    const f = file || suite.file || '';
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.[0] || {};
        const status = result.status === 'passed'  ? 'PASS'
                     : result.status === 'failed'  ? 'FAIL'
                     : result.status === 'skipped' ? 'SKIP'
                     : result.status?.toUpperCase() || 'UNKNOWN';
        const duration = result.duration ? `${(result.duration / 1000).toFixed(1)}s` : '-';
        const title = spec.title || test.title || '';
        const idMatch = title.match(/TC-[\w-]+/);
        const gwt = title.replace(/^TC-[\w-]+[:\s]+/i, '').trim();
        // Split "Given X, When Y, Then Z" â†’ action = "Given X, When Y", expected = "Z"
        const thenMatch = gwt.match(/^(.*?),?\s*Then\s+(.+)$/i);
        const action   = thenMatch ? thenMatch[1].trim() : gwt;
        const expected = thenMatch ? thenMatch[2].trim() : '(see test name)';
        const rawError = (result.errors?.[0]?.message || result.error?.message || '')
          .replace(/\x1b\[[0-9;]*m/g, ''); // strip ANSI color codes
        const nameMatch = rawError.match(/name:\s*\/(.+?)\/i?\s*}\)/) || rawError.match(/getByRole\([^,]+,\s*{\s*name:\s*'([^']+)'/);
        const elementDesc = nameMatch ? `"${nameMatch[1].replace(/\.\*/g, ' ').replace(/\s+/g, ' ').trim()}"` : 'the expected element';
        const plainError = /not found/i.test(rawError) ? `Element not found: ${elementDesc}`
                          : /timeout/i.test(rawError) ? `Timed out waiting for ${elementDesc}`
                          : rawError.split('\n')[0].trim().slice(0, 150);
        const actual = status === 'PASS' ? 'As expected'
                     : status === 'FAIL' ? (plainError || 'Did not match expectation')
                     : status === 'SKIP' ? 'Optional UI not present on this account'
                     : 'Unknown';

        // Remarks: human-readable reason for FAIL / SKIP
        let remarks = '';
        if (status === 'FAIL') {
          const bugMatch = rawError.match(/BUG:\s*(.+?)(?:\n|$)/i);
          if (bugMatch) {
            remarks = `App bug: ${bugMatch[1].trim()}`;
          } else if (/net::ERR_NETWORK_CHANGED|net::ERR_INTERNET_DISCONNECTED/i.test(rawError)) {
            remarks = 'Transient network error during test run — re-run to confirm.';
          } else if (/429|rate.?limit/i.test(rawError)) {
            remarks = 'Server rate-limited (HTTP 429) — reduce parallel workers and re-run.';
          } else if (/timeout.*exceeded|exceeded.*timeout/i.test(rawError)) {
            remarks = 'Test timed out — element was not interactive or app response was too slow.';
          } else if (/element.*not found|locator.*resolved to/i.test(rawError)) {
            remarks = 'UI element not found — selector may not match current app version.';
          } else if (/intercepts pointer events/i.test(rawError)) {
            remarks = 'App bug: an overlapping element intercepts click — pointer events blocked.';
          } else if (/Target page.*closed|browser has been closed/i.test(rawError)) {
            remarks = 'Browser context closed unexpectedly — likely caused by upstream rate limiting.';
          } else {
            remarks = plainError || 'Assertion did not match expected value.';
          }
        } else if (status === 'SKIP') {
          remarks = 'Feature or UI element not available on this test account / environment — test skipped gracefully.';
        }

        rows.push({
          module:   moduleFromFile(f),
          id:       idMatch ? idMatch[0] : '-',
          name:     gwt,
          action,
          expected,
          actual,
          status,
          duration,
          remarks,
        });
      }
    }
    rows.push(...flatten(suite.suites || [], f));
  }
  return rows;
}

const rows = flatten(data.suites || []);

// â”€â”€ Group by module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const grouped = {};
for (const row of rows) {
  if (!grouped[row.module]) grouped[row.module] = [];
  grouped[row.module].push(row);
}

// â”€â”€ Build Excel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const wb = new ExcelJS.Workbook();
wb.creator = 'OMRE QA Suite';
wb.created = new Date();

// Summary sheet
const summary = wb.addWorksheet('Summary');
summary.columns = [
  { header: 'Module',  key: 'module',  width: 28 },
  { header: 'Total',   key: 'total',   width: 8  },
  { header: 'PASS',    key: 'pass',    width: 8  },
  { header: 'FAIL',    key: 'fail',    width: 8  },
  { header: 'SKIP',    key: 'skip',    width: 8  },
];
summary.getRow(1).font = { bold: true };

for (const [mod, tests] of Object.entries(grouped).sort()) {
  summary.addRow({
    module: mod,
    total:  tests.length,
    pass:   tests.filter(t => t.status === 'PASS').length,
    fail:   tests.filter(t => t.status === 'FAIL').length,
    skip:   tests.filter(t => t.status === 'SKIP').length,
  });
}

// Totals row
const allTests = rows;
summary.addRow({});
const totals = summary.addRow({
  module: 'TOTAL',
  total:  allTests.length,
  pass:   allTests.filter(t => t.status === 'PASS').length,
  fail:   allTests.filter(t => t.status === 'FAIL').length,
  skip:   allTests.filter(t => t.status === 'SKIP').length,
});
totals.font = { bold: true };

// Details sheet (for laymen: Action / Expected / Actual, not raw GWT/error text)
const details = wb.addWorksheet('Test Details');
details.columns = [
  { header: 'Module',          key: 'module',   width: 22 },
  { header: 'Test ID',         key: 'id',       width: 16 },
  { header: 'Action Performed',key: 'action',   width: 45 },
  { header: 'Expected Result', key: 'expected', width: 45 },
  { header: 'Actual Result',   key: 'actual',   width: 45 },
  { header: 'Status',          key: 'status',   width: 10 },
  { header: 'Duration',        key: 'duration', width: 10 },
  { header: 'Remarks',         key: 'remarks',  width: 55 },
];
details.getRow(1).font = { bold: true };

const PASS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
const FAIL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };

for (const [mod, tests] of Object.entries(grouped).sort()) {
  for (const t of tests) {
    const row = details.addRow(t);
    const statusCell = row.getCell(6);
    statusCell.fill = t.status === 'PASS' ? PASS_FILL : t.status === 'FAIL' ? FAIL_FILL : {};
    statusCell.font = { bold: true, color: { argb: t.status === 'PASS' ? 'FF166534' : t.status === 'FAIL' ? 'FF991B1B' : 'FF555555' } };
    statusCell.alignment = { horizontal: 'center' };
    row.eachCell(c => { c.alignment = { ...(c.alignment || {}), wrapText: true, vertical: 'top' }; });
  }
}

// â”€â”€ Coverage sheets: cross-reference each module's crawl output against what's actually tested â”€â”€
const CRAWL_MODULE_TO_GROUP = {
  biz: 'Biz', link: 'Link (Jobs)', learn: 'Learn', orbit: 'Orbit',
  townhall: 'Town Hall', happycorner: 'Happy Corner', virtualworld: 'Virtual World',
  omniknow: 'OmniKnow', digitalcitizen: 'Digital Citizen', omniai: 'Omni AI',
  businesssuite: 'Business Suite', pages: 'Pages', settings: 'Settings',
  groups: 'Groups', friends: 'Friends', notifications: 'Notifications',
};
const discoveryDir = path.join(__dirname, 'discovery-output');
const crawlFiles = fs.existsSync(discoveryDir)
  ? fs.readdirSync(discoveryDir).filter(f => f.endsWith('-crawl.json'))
  : [];

for (const file of crawlFiles) {
  const prefix = file.replace('-crawl.json', '');
  const groupKey = CRAWL_MODULE_TO_GROUP[prefix]
    || Object.keys(grouped).find(k => k.toLowerCase() === prefix);
  if (!groupKey || !grouped[groupKey]) continue;

  const crawl = JSON.parse(fs.readFileSync(path.join(discoveryDir, file), 'utf8')).filter(p => !p.skipped);
  const testedText = grouped[groupKey].map(t => `${t.action} ${t.expected} ${t.name || ''}`.toLowerCase()).join(' | ');

  const cov = wb.addWorksheet(`Coverage â€” ${groupKey}`.slice(0, 31));
  cov.columns = [
    { header: 'Page Path',        key: 'path',    width: 38 },
    { header: 'Heading',          key: 'heading', width: 30 },
    { header: 'Found By',         key: 'found',   width: 16 },
    { header: 'Currently Tested?',key: 'tested',  width: 18 },
  ];
  cov.getRow(1).font = { bold: true };

  for (const p of crawl) {
    const generic = p.path.replace(/\/[0-9a-f-]{6,}$/i, ''); // e.g. /biz/product/:id -> /biz/product
    const tested = (testedText.includes(p.path.toLowerCase()) || testedText.includes(generic.toLowerCase())
      || (generic.endsWith('/product') && testedText.includes('product detail'))
      || (generic.endsWith('/store') && testedText.includes('store page'))
      || (generic.endsWith('/view') && testedText.includes('job detail'))
      || (generic.endsWith('/companies') && testedText.includes('company detail'))
      || (generic.endsWith('/courses') && testedText.includes('course detail'))
      || (generic.endsWith('/profile') && testedText.includes('profile'))) ? 'YES' : 'NO â€” gap';
    const row = cov.addRow({ path: p.path, heading: p.heading, found: 'Recursive crawl', tested });
    const cell = row.getCell(4);
    cell.fill = tested === 'YES' ? PASS_FILL : FAIL_FILL;
    cell.font = { bold: true, color: { argb: tested === 'YES' ? 'FF166534' : 'FF991B1B' } };
  }
}

// â”€â”€ Save with same timestamp as JSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ts      = jsonFiles[0].replace('.json', '');
require('fs').mkdirSync(reportsDir, { recursive: true });
let outFile = path.join(reportsDir, `${ts}.xlsx`);
if (fs.existsSync(outFile)) {
  outFile = path.join(reportsDir, `${ts}-${Date.now()}.xlsx`);
}
wb.xlsx.writeFile(outFile).then(() => {
  console.log('Excel report saved:', outFile);
});

