import { existsSync,readFileSync } from 'node:fs';

const required = ['dist/index.html', 'dist/assets'];
for (const path of required) {
  if (!existsSync(path)) throw new Error(`Missing production output: ${path}`);
}
const html = readFileSync('dist/index.html', 'utf8');
if (!html.includes('/AgriSmart/assets/')) throw new Error('GitHub Pages asset base is not configured.');
console.log('AgriSmart production bundle verification passed.');
