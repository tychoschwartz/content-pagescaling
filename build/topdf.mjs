import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IN = pathToFileURL(path.join(ROOT, 'teardown', 'explodingsuccess.html')).href;
const OUT = path.join(ROOT, 'teardown', 'explodingsuccess.pdf');

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1040, height: 1400 }, deviceScaleFactor: 2 });
await page.goto(IN, { waitUntil: 'networkidle' });
// make sure webfonts are actually rendered before measuring/printing
await page.evaluate(() => document.fonts.ready);
// keep the on-screen (dark) look instead of print styles, and pin the fixed
// background layers so they cover the full tall page
await page.emulateMedia({ media: 'screen' });
await page.addStyleTag({ content: 'body::before,body::after{position:absolute!important;}' });
const height = await page.evaluate(() => document.documentElement.scrollHeight);

await page.pdf({
  path: OUT,
  width: '1040px',
  height: `${height}px`,
  printBackground: true,
  pageRanges: '1',
});
await browser.close();
console.log('wrote', OUT, 'height', height);
