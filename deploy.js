/**
 * deploy.js
 * Stages all changes, commits with a timestamp message, and pushes to GitHub.
 * Usage: node deploy.js
 *        node deploy.js "your custom commit message"
 */
const { execSync } = require('child_process');

const message = process.argv[2] || `Update tests: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\nDeployed successfully.');
} catch (e) {
  console.error('\nDeploy failed:', e.message);
  process.exit(1);
}
