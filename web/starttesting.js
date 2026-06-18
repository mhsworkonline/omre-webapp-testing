#!/usr/bin/env node
// Usage:
//   node starttesting.js              -> 1 worker (default)
//   node starttesting.js 4            -> 4 workers
//   node starttesting.js --workers=4  -> 4 workers
//   node starttesting.js --workers 4  -> 4 workers

import { spawnSync } from 'child_process';

function parseWorkers(args) {
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    // --workers=4
    const eq = a.match(/^--workers=(\d+)$/);
    if (eq) return parseInt(eq[1], 10);
    // --workers 4
    if (a === '--workers' && args[i + 1] && /^\d+$/.test(args[i + 1])) {
      return parseInt(args[i + 1], 10);
    }
    // positional: node starttesting.js 4
    if (/^\d+$/.test(a)) return parseInt(a, 10);
  }
  return 1;
}

const workers = parseWorkers(process.argv.slice(2));

console.log(`Starting OMRE web tests — project: chromium, workers: ${workers}`);
console.log('Auth setup will run automatically before tests.\n');

const result = spawnSync(
  'npx',
  ['playwright', 'test', '--project=chromium', `--workers=${workers}`],
  { stdio: 'inherit', shell: true, cwd: new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') }
);

process.exit(result.status ?? 1);
