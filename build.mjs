import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root = dirname(fileURLToPath(import.meta.url));
const out = resolve(root, 'dist');
// Publish an explicit allowlist. Development files and .git never enter the upload.
if (dirname(out) !== root || !out.endsWith('dist')) throw new Error('Unexpected build path');
await mkdir(out, { recursive: true });
for (const child of await readdir(out)) {
  const target = resolve(out, child);
  if (dirname(target) !== out) throw new Error('Unexpected output entry');
  await rm(target, { recursive: true, force: true });
}
const entries = ['index.html', '404.html', 'style.css', 'refresh.css', 'fonts.css', 'app.js', 'review-demo.js', '_headers', 'robots.txt', 'sitemap.xml', 'assets/favicon.svg', 'assets/logo.webp', 'assets/hero-demo.webp', 'assets/review.png', 'assets/split.png', 'assets/fonts', 'media'];
for (const entry of entries) {
  await stat(resolve(root, entry));
  await mkdir(dirname(resolve(out, entry)), { recursive: true });
  await cp(resolve(root, entry), resolve(out, entry), { recursive: true });
}
console.log('Static site built in dist/');
