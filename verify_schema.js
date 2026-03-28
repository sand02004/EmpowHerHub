const { execSync } = require('child_process');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe', encoding: 'utf-8' });
  console.log('Valid!');
} catch (e) {
  console.log('STDERR:');
  console.log(e.stderr);
  console.log('STDOUT:');
  console.log(e.stdout);
}
  console.log(e.stdout);
}
