/**
 * fix-grammar.js
 * Fixes grammar bugs left by rename-tests.js in GWT test descriptions.
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

let totalFiles = 0, totalFixes = 0;

for (const file of findSpecFiles(TESTS_DIR)) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;

  // Fix 1: "showss" → "shows"
  updated = updated.replace(/\bshowss\b/g, 'shows');

  // Fix 2: "Given the a/an " or "When I click the a/an " → strip article
  updated = updated.replace(/Given the (a|an) /g, 'Given the ');
  updated = updated.replace(/When I click the (a|an) /g, 'When I click the ');

  // Fix 3: "Given I am on the <gerund>..." → "Given I am authenticated and on the page..."
  updated = updated.replace(
    /Given I am on the (\w+ing\b[^,]*), When I view it,/g,
    'Given I am authenticated and on the page, When I perform the action,'
  );

  if (updated !== original) {
    const fixes = (original.split('showss').length - 1)
      + (original.match(/Given the (a|an) /g) || []).length
      + (original.match(/When I click the (a|an) /g) || []).length
      + (original.match(/Given I am on the \w+ing\b[^,]*, When I view it,/g) || []).length;
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✓ ${path.relative(__dirname, file)} — ${fixes} fix(es)`);
    totalFiles++;
    totalFixes += fixes;
  }
}

console.log(`\nDone: ${totalFixes} fixes across ${totalFiles} files`);
