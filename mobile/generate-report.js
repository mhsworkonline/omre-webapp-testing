'use strict';
// Reads Maestro debug JSON files and generates: JSON, JUnit XML, HTML, Excel reports.
// Usage: node generate-report.js [--dir <maestro-tests-dir>] [--since <YYYY-MM-DD_HHmmss>]

const fs = require('fs');
const path = require('path');
const os = require('os');
const ExcelJS = require('exceljs');

// ─── Config ────────────────────────────────────────────────────────────────────
const MAESTRO_TESTS_DIR = path.join(os.homedir(), '.maestro', 'tests');
const REPORTS_DIR = path.join(__dirname, 'reports');
const RUN_INPUT = process.argv[2]; // optional: path to run-manifest.json written by run-all.ps1

// ─── Parse command object into a human-readable step name ──────────────────────
function stepName(cmd) {
  if (!cmd) return 'Unknown';
  const c = cmd;

  if (c.assertConditionCommand) {
    const cond = c.assertConditionCommand.condition;
    if (cond?.visible)    return `Assert visible: "${cond.visible.textRegex}"`;
    if (cond?.notVisible) return `Assert not visible: "${cond.notVisible.textRegex}"`;
    return 'Assert condition';
  }
  if (c.tapOnElementCommand) {
    const s = c.tapOnElementCommand.selector;
    if (s?.textRegex) return `Tap on "${s.textRegex}"`;
    if (s?.point)     return `Tap at ${s.point}`;
    return 'Tap on element';
  }
  if (c.launchAppCommand)  return `Launch app "${c.launchAppCommand.appId}"`;
  if (c.inputTextCommand)  return `Input text: "${c.inputTextCommand.text}"`;
  if (c.eraseTextCommand)  return `Erase ${c.eraseTextCommand.charactersToErase} characters`;
  if (c.hideKeyboardCommand) return 'Hide keyboard';
  if (c.scrollCommand)     return `Scroll ${c.scrollCommand.direction || ''}`.trim();
  if (c.pressKeyCommand)   return `Press key: ${c.pressKeyCommand.code}`;
  if (c.swipeCommand)      return `Swipe ${c.swipeCommand.direction || ''}`.trim();
  if (c.waitForAnimationToEndCommand) return 'Wait for animation';
  if (c.waitCommand)       return `Wait ${c.waitCommand.ms}ms`;
  // Fallback: use first key minus "Command" suffix
  const key = Object.keys(c)[0] || 'unknown';
  return key.replace(/Command$/, '');
}

// ─── Load flows from run manifest or by scanning .maestro/tests ───────────────
function loadFlows() {
  if (RUN_INPUT && fs.existsSync(RUN_INPUT)) {
    const manifest = JSON.parse(fs.readFileSync(RUN_INPUT, 'utf8'));
    return manifest.map(entry => {
      const steps = readCommandsJson(entry.debugDir);
      return buildFlow(entry.name, entry.status, entry.debugDir, steps);
    });
  }

  // No manifest — scan the most-recent test folders
  if (!fs.existsSync(MAESTRO_TESTS_DIR)) {
    console.error('No Maestro test results found at:', MAESTRO_TESTS_DIR);
    process.exit(1);
  }
  const dirs = fs.readdirSync(MAESTRO_TESTS_DIR)
    .filter(d => /^\d{4}-\d{2}-\d{2}/.test(d))
    .sort()
    .reverse()
    .slice(0, 20); // last 20 runs

  const flowMap = new Map();
  for (const dir of dirs) {
    const full = path.join(MAESTRO_TESTS_DIR, dir);
    const files = fs.readdirSync(full).filter(f => f.startsWith('commands-') && f.endsWith('.json'));
    for (const file of files) {
      const name = file.replace(/^commands-\(/, '').replace(/\)\.json$/, '').replace(/\.yaml$/, '');
      if (!flowMap.has(name)) {
        const steps = readCommandsJson(full, file);
        const hasFail = steps.some(s => s.status === 'FAILED');
        flowMap.set(name, buildFlow(name, hasFail ? 'FAILED' : 'PASSED', full, steps));
      }
    }
  }
  return [...flowMap.values()];
}

function readCommandsJson(dir, filename) {
  if (!dir || !fs.existsSync(dir)) return [];
  const file = filename || fs.readdirSync(dir).find(f => f.startsWith('commands-') && f.endsWith('.json'));
  if (!file) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file || ''), 'utf8'));
    return raw
      .map(entry => ({
        name: stepName(entry.command),
        status: entry.metadata?.status || 'UNKNOWN',
        duration: entry.metadata?.duration || 0,
        seq: entry.metadata?.sequenceNumber ?? 0
      }))
      .sort((a, b) => a.seq - b.seq);
  } catch { return []; }
}

function buildFlow(name, status, debugDir, steps) {
  const screenshot = debugDir ? findScreenshot(debugDir) : null;
  return {
    name,
    status,
    debugDir,
    steps,
    failedStep: steps.find(s => s.status === 'FAILED')?.name || null,
    stepsPassed: steps.filter(s => s.status === 'COMPLETED').length,
    stepsFailed: steps.filter(s => s.status === 'FAILED').length,
    durationMs: steps.reduce((s, c) => s + c.duration, 0),
    screenshot
  };
}

function findScreenshot(dir) {
  const f = fs.readdirSync(dir).find(n => n.startsWith('screenshot-') && n.endsWith('.png'));
  return f ? path.join(dir, f) : null;
}

// ─── 1. JSON ───────────────────────────────────────────────────────────────────
function writeJson(flows, outDir, ts) {
  const report = {
    runDate: ts,
    platform: 'Android',
    app: 'com.omre.app.posh',
    totalFlows: flows.length,
    passed: flows.filter(f => f.status === 'PASSED').length,
    failed: flows.filter(f => f.status === 'FAILED').length,
    flows: flows.map(f => ({
      name: f.name,
      status: f.status,
      stepsPassed: f.stepsPassed,
      stepsFailed: f.stepsFailed,
      failedStep: f.failedStep,
      durationMs: f.durationMs,
      steps: f.steps
    }))
  };
  const out = path.join(outDir, `results-${ts}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('  JSON  →', out);
}

// ─── 2. JUnit XML ──────────────────────────────────────────────────────────────
function writeJunit(flows, outDir, ts) {
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  const totalTests = flows.reduce((s, f) => s + Math.max(f.steps.length, 1), 0);
  const totalFail  = flows.filter(f => f.status === 'FAILED').length;
  const totalTime  = (flows.reduce((s, f) => s + f.durationMs, 0) / 1000).toFixed(3);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<testsuites name="OMRE Mobile (Android)" tests="${totalTests}" failures="${totalFail}" time="${totalTime}">\n`;

  for (const flow of flows) {
    const t = (flow.durationMs / 1000).toFixed(3);
    const fl = flow.status === 'FAILED' ? 1 : 0;
    xml += `  <testsuite name="${esc(flow.name)}" tests="${Math.max(flow.steps.length,1)}" failures="${fl}" time="${t}">\n`;

    if (flow.steps.length === 0) {
      xml += `    <testcase name="${esc(flow.name)}" time="${t}"`;
      if (flow.status === 'FAILED') {
        xml += `>\n      <failure message="Flow failed with no step detail"/>\n    </testcase>\n`;
      } else {
        xml += `/>\n`;
      }
    } else {
      for (const step of flow.steps) {
        const st = (step.duration / 1000).toFixed(3);
        if (step.status === 'FAILED') {
          xml += `    <testcase name="${esc(step.name)}" time="${st}">\n`;
          xml += `      <failure message="${esc(step.name)} did not complete"/>\n`;
          xml += `    </testcase>\n`;
        } else {
          xml += `    <testcase name="${esc(step.name)}" time="${st}"/>\n`;
        }
      }
    }
    xml += `  </testsuite>\n`;
  }
  xml += `</testsuites>`;

  const out = path.join(outDir, `results-${ts}.xml`);
  fs.writeFileSync(out, xml);
  console.log('  XML   →', out);
}

// ─── 3. HTML ───────────────────────────────────────────────────────────────────
function writeHtml(flows, outDir, ts) {
  const passed = flows.filter(f => f.status === 'PASSED').length;
  const failed = flows.filter(f => f.status === 'FAILED').length;
  const totalMs = flows.reduce((s, f) => s + f.durationMs, 0);

  const flowRows = flows.map(f => {
    const badge = f.status === 'PASSED'
      ? '<span class="badge pass">PASSED</span>'
      : '<span class="badge fail">FAILED</span>';
    const failCell = f.failedStep ? `<code>${esc(f.failedStep)}</code>` : '—';
    const dur = (f.durationMs / 1000).toFixed(1) + 's';
    const detail = f.steps.map(s => {
      const cls = s.status === 'COMPLETED' ? 'step-ok' : s.status === 'FAILED' ? 'step-fail' : 'step-skip';
      const icon = s.status === 'COMPLETED' ? '✓' : s.status === 'FAILED' ? '✗' : '—';
      return `<div class="step ${cls}">${icon} ${esc(s.name)} <span class="ms">${s.duration}ms</span></div>`;
    }).join('');

    return `
    <tr>
      <td><strong>${esc(f.name)}</strong>
        <div class="steps-wrap">${detail}</div>
      </td>
      <td>${badge}</td>
      <td>${f.stepsPassed}/${f.steps.length}</td>
      <td>${failCell}</td>
      <td>${dur}</td>
    </tr>`;
  }).join('');

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OMRE Mobile Test Report — ${ts}</title>
<style>
  body{font-family:system-ui,sans-serif;margin:0;background:#f5f5f5;color:#222}
  header{background:#1a1a2e;color:#fff;padding:24px 32px}
  header h1{margin:0 0 4px;font-size:22px}
  header p{margin:0;opacity:.7;font-size:13px}
  .stats{display:flex;gap:16px;padding:20px 32px}
  .stat{background:#fff;border-radius:8px;padding:16px 24px;min-width:120px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
  .stat .n{font-size:32px;font-weight:700}
  .stat .n.pass{color:#22c55e}.stat .n.fail{color:#ef4444}.stat .n.total{color:#3b82f6}
  .stat .l{font-size:12px;color:#666;margin-top:4px}
  table{width:calc(100% - 64px);margin:0 32px 32px;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
  th{background:#1a1a2e;color:#fff;padding:12px 16px;text-align:left;font-size:13px}
  td{padding:10px 16px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#fafafa}
  .badge{display:inline-block;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:600}
  .badge.pass{background:#dcfce7;color:#166534}.badge.fail{background:#fee2e2;color:#991b1b}
  code{font-size:12px;background:#f3f4f6;padding:2px 6px;border-radius:3px}
  .steps-wrap{margin-top:6px}
  .step{font-size:11px;padding:2px 0;color:#555}
  .step-ok{color:#16a34a}.step-fail{color:#dc2626;font-weight:600}.step-skip{color:#9ca3af}
  .ms{font-size:10px;color:#9ca3af;margin-left:6px}
</style>
</head>
<body>
<header>
  <h1>OMRE Mobile Test Report</h1>
  <p>Platform: Android &nbsp;|&nbsp; App: com.omre.app.posh &nbsp;|&nbsp; Run: ${ts}</p>
</header>
<div class="stats">
  <div class="stat"><div class="n total">${flows.length}</div><div class="l">Total Flows</div></div>
  <div class="stat"><div class="n pass">${passed}</div><div class="l">Passed</div></div>
  <div class="stat"><div class="n fail">${failed}</div><div class="l">Failed</div></div>
  <div class="stat"><div class="n total">${(totalMs/1000).toFixed(1)}s</div><div class="l">Total Duration</div></div>
</div>
<table>
  <thead><tr><th>Flow</th><th>Status</th><th>Steps</th><th>Failed Step</th><th>Duration</th></tr></thead>
  <tbody>${flowRows}</tbody>
</table>
</body>
</html>`;

  const out = path.join(outDir, `results-${ts}.html`);
  fs.writeFileSync(out, html);
  console.log('  HTML  →', out);
}

// ─── 4. Excel ──────────────────────────────────────────────────────────────────
async function writeExcel(flows, outDir, ts) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'OMRE Mobile Test Suite';
  wb.created = new Date();

  const passed = flows.filter(f => f.status === 'PASSED').length;
  const failed = flows.filter(f => f.status === 'FAILED').length;

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet('Summary');
  ws1.views = [{ state: 'frozen', ySplit: 4 }];

  // Title block
  ws1.mergeCells('A1:F1');
  ws1.getCell('A1').value = 'OMRE Mobile Test Report — Android';
  ws1.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  ws1.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
  ws1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(1).height = 32;

  ws1.mergeCells('A2:F2');
  ws1.getCell('A2').value = `Run: ${ts}   |   Total: ${flows.length}   |   Passed: ${passed}   |   Failed: ${failed}   |   App: com.omre.app.posh`;
  ws1.getCell('A2').font = { size: 11, color: { argb: 'FFFFFFFF' } };
  ws1.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16213E' } };
  ws1.getCell('A2').alignment = { horizontal: 'center' };
  ws1.getRow(2).height = 22;

  ws1.getRow(3).height = 6;

  // Header row
  const PASS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  const FAIL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
  const HDR_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
  const HDR_FONT  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

  const headers = ['Flow Name', 'Status', 'Steps Passed', 'Steps Failed', 'Failed Step', 'Duration (s)'];
  const widths  = [30, 12, 14, 14, 45, 14];
  const hdrRow = ws1.addRow(headers);
  hdrRow.eachCell(c => { c.fill = HDR_FILL; c.font = HDR_FONT; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
  hdrRow.height = 22;
  widths.forEach((w, i) => { ws1.getColumn(i + 1).width = w; });

  // Data rows
  for (const f of flows) {
    const row = ws1.addRow([
      f.name,
      f.status,
      f.stepsPassed,
      f.stepsFailed,
      f.failedStep || '—',
      (f.durationMs / 1000).toFixed(2)
    ]);
    const statusCell = row.getCell(2);
    statusCell.fill = f.status === 'PASSED' ? PASS_FILL : FAIL_FILL;
    statusCell.font = { bold: true, color: { argb: f.status === 'PASSED' ? 'FF166534' : 'FF991B1B' } };
    statusCell.alignment = { horizontal: 'center' };
    row.getCell(3).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'center' };
    row.height = 18;
  }

  // ── Sheet 2: Step Detail ───────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Step Detail');
  ws2.views = [{ state: 'frozen', ySplit: 1 }];

  const hdrs2 = ['Flow', 'Step #', 'Step Name', 'Status', 'Duration (ms)'];
  const wds2  = [25, 8, 60, 12, 14];
  const hRow2 = ws2.addRow(hdrs2);
  hRow2.eachCell(c => { c.fill = HDR_FILL; c.font = HDR_FONT; c.alignment = { horizontal: 'center' }; });
  hRow2.height = 22;
  wds2.forEach((w, i) => { ws2.getColumn(i + 1).width = w; });

  for (const f of flows) {
    for (const step of f.steps) {
      const row = ws2.addRow([f.name, step.seq, step.name, step.status, step.duration]);
      if (step.status === 'COMPLETED') {
        row.getCell(4).fill = PASS_FILL;
        row.getCell(4).font = { color: { argb: 'FF166534' } };
      } else if (step.status === 'FAILED') {
        row.getCell(4).fill = FAIL_FILL;
        row.getCell(4).font = { bold: true, color: { argb: 'FF991B1B' } };
      }
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'right' };
    }
  }

  const out = path.join(outDir, `results-${ts}.xlsx`);
  await wb.xlsx.writeFile(out);
  console.log('  Excel →', out);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  console.log('Loading test results...');
  const flows = loadFlows();
  if (flows.length === 0) {
    console.error('No test results found. Run the tests first.');
    process.exit(1);
  }
  console.log(`Found ${flows.length} flow(s) — generating reports:\n`);

  writeJson(flows, REPORTS_DIR, ts);
  writeJunit(flows, REPORTS_DIR, ts);
  writeHtml(flows, REPORTS_DIR, ts);
  await writeExcel(flows, REPORTS_DIR, ts);

  const p = flows.filter(f => f.status === 'PASSED').length;
  const fa = flows.filter(f => f.status === 'FAILED').length;
  console.log(`\nDone. ${p} passed, ${fa} failed.`);
  console.log(`Reports saved to: ${REPORTS_DIR}`);
})();
