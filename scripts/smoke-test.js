const fs = require('fs');
const path = require('path');

const required = [
  'index.html',
  'src/App.jsx',
  'src/main.jsx',
  'src/styles.css',
  'src/main.js',
  'docs/guide/api-spec.md',
  'docs/plan/iteration/iteration-01-plan.md'
];

for (const file of required) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const js = fs.readFileSync(path.join(process.cwd(), 'src/main.js'), 'utf8');
if (!js.includes('credentials: "include"')) {
  throw new Error('API client must include credentials for session auth.');
}

console.log('smoke-test:ok');
