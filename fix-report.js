// Strip all non-ASCII characters from generate-report.js
// Replace common Unicode sequences with ASCII equivalents
const fs = require('fs');
const file = 'c:/claude-folder/webapp-testing/omre-app/mobile/generate-report.js';
let c = fs.readFileSync(file, 'utf8');

// Replace known patterns first (in strings/template literals that matter)
// em-dash variants -> ' - '
c = c.replace(/[–—―]/g, ' - ');
// arrows -> '->'
c = c.replace(/[→⇒➡]/g, '->');
// box-drawing chars (separator lines in comments) -> '-'
c = c.replace(/[─-╿]/g, '-');
// left/right quotes -> straight quotes
c = c.replace(/[‘’]/g, "'");
c = c.replace(/[“”]/g, '"');
// Any remaining non-ASCII: strip
c = c.replace(/[^\x00-\x7f]/g, '');

fs.writeFileSync(file, c, 'utf8');

// Verify
const remaining = c.match(/[^\x00-\x7f]/g);
console.log('Non-ASCII chars remaining:', remaining ? remaining.length : 0);
console.log('done');
