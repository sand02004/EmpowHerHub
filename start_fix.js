const { spawn } = require('child_process');
const path = require('path');

const mainPath = path.join(__dirname, 'src', 'main.ts');
const tsNodePath = path.join(__dirname, 'node_modules', '.bin', 'ts-node');

console.log('Starting backend with ts-node (transpile-only mode)...');
console.log('Main file:', mainPath);

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
  'ts-node',
  '--transpile-only',
  '--skip-project',
  mainPath
], {
  stdio: 'inherit',
  shell: true,
  env: { 
    ...process.env,
    DATABASE_URL: "postgresql://postgres:admin123@localhost:5432/EmpowHerHub?schema=public"
  }
});

child.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});
