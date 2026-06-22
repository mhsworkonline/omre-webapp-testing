const fs   = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, 'test-results');

// full run = largest recent JSON (1943 tests)
const fullJson  = path.join(resultsDir, '2026-06-22_19-28-44.json');
// re-run = latest JSON (180 tests from 5 failing files)
const rerunJson = path.join(resultsDir, '2026-06-22_21-46-50.json');
const outJson   = path.join(resultsDir, '2026-06-22_merged.json');

const full  = JSON.parse(fs.readFileSync(fullJson,  'utf8'));
const rerun = JSON.parse(fs.readFileSync(rerunJson, 'utf8'));

// Build map of file -> suites from the re-run
const rerunByFile = {};
for (const s of rerun.suites || []) {
  if (s.file) rerunByFile[s.file] = s;
}

// Replace matching suites in the full run with re-run results
const merged = (full.suites || []).map(s => rerunByFile[s.file] || s);

// Add any re-run suites not present in full run (edge case)
for (const [file, suite] of Object.entries(rerunByFile)) {
  if (!full.suites.some(s => s.file === file)) merged.push(suite);
}

fs.writeFileSync(outJson, JSON.stringify({ suites: merged }, null, 0));
console.log('Merged JSON written to', outJson);
console.log('Full run suites:', full.suites.length);
console.log('Re-run replacements:', Object.keys(rerunByFile).length);
