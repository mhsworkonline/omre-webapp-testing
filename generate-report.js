const fs   = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// ── Find latest JSON in test-results/ ────────────────────────────────────────
const resultsDir = path.join(__dirname, 'test-results');
const jsonFiles  = fs.readdirSync(resultsDir)
  .filter(f => f.endsWith('.json') && /^\d{4}-\d{2}-\d{2}/.test(f))
  .sort()
  .reverse();

if (!jsonFiles.length) {
  console.error('No JSON result files found in test-results/');
  process.exit(1);
}

const jsonFile = path.join(resultsDir, jsonFiles[0]);
console.log('Reading:', jsonFile);
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// ── Module name from file path ────────────────────────────────────────────────
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
  return parts.map(p => p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(' › ');
}

// ── Flatten all tests ─────────────────────────────────────────────────────────
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
        const errorMsg = result.errors?.[0]?.message || result.error?.message || '';
        const remarks = status === 'FAIL' ? errorMsg.split('\n')[0].replace(/\s+/g, ' ').trim().slice(0, 200)
                      : status === 'SKIP' ? 'Optional UI not present on this account'
                      : '';
        rows.push({
          module:   moduleFromFile(f),
          id:       idMatch ? idMatch[0] : '-',
          name:     title.replace(/^TC-[\w-]+[:\s]+/i, '').trim(),
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

// ── Group by module ───────────────────────────────────────────────────────────
const grouped = {};
for (const row of rows) {
  if (!grouped[row.module]) grouped[row.module] = [];
  grouped[row.module].push(row);
}

// ── Build Excel ───────────────────────────────────────────────────────────────
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

// Details sheet
const details = wb.addWorksheet('All Tests');
details.columns = [
  { header: 'Module',    key: 'module',   width: 28 },
  { header: 'Test ID',   key: 'id',       width: 18 },
  { header: 'Test Name', key: 'name',     width: 60 },
  { header: 'Status',    key: 'status',   width: 10 },
  { header: 'Duration',  key: 'duration', width: 10 },
  { header: 'Remarks',   key: 'remarks',  width: 60 },
];
details.getRow(1).font = { bold: true };

for (const [mod, tests] of Object.entries(grouped).sort()) {
  for (const t of tests) {
    details.addRow(t);
  }
}

// ── Save with same timestamp as JSON ─────────────────────────────────────────
const ts      = jsonFiles[0].replace('.json', '');
const outFile = path.join(resultsDir, `${ts}.xlsx`);
wb.xlsx.writeFile(outFile).then(() => {
  console.log('Excel report saved:', outFile);
});
