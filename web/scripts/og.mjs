// Renders scripts/og.html to public/og.png (the 1200×630 social preview image) with headless
// Chrome. The PNG is committed, so builds don't need Chrome; rerun after changing og.html.
// Set CHROME to the Chrome binary if it isn't in the default macOS location.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const page = new URL('./og.html', import.meta.url).href;
const out = fileURLToPath(new URL('../public/og.png', import.meta.url));

execFileSync(chrome, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000', // let the font load
  `--screenshot=${out}`,
  page,
]);
console.log('wrote', out);
