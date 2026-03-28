const cp = require('child_process');
const fs = require('fs');
try {
  cp.execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
  fs.writeFileSync('ts.log', 'OK');
} catch(e) {
  fs.writeFileSync('ts.log', (e.stdout || '') + '\n' + (e.stderr || ''));
}
