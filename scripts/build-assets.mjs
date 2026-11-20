import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';

const out = 'public/assets';
await mkdir(out, { recursive: true });

// Emblem only: excludes the ZEDVORA wordmark below it.
const mark = sharp('logo.png').extract({ left: 400, top: 140, width: 730, height: 470 });

for (const width of [96, 192, 384, 768]) {
  await mark.clone().resize({ width }).webp({ quality: 84 }).toFile(`${out}/logo-mark-${width}.webp`);
  await mark.clone().resize({ width }).avif({ quality: 55 }).toFile(`${out}/logo-mark-${width}.avif`);
}

const faviconSvg = await readFile('public/favicon.svg');
await sharp(faviconSvg).resize(32, 32).png().toFile(`${out}/favicon-32.png`);
await sharp(faviconSvg).resize(180, 180).png().toFile(`${out}/apple-touch-icon.png`);

const profile = sharp('profile.png');
for (const size of [480, 768, 1024]) {
  await profile.clone().resize(size, size).webp({ quality: 80 }).toFile(`${out}/profile-${size}.webp`);
  await profile.clone().resize(size, size).avif({ quality: 52 }).toFile(`${out}/profile-${size}.avif`);
}

const W = 1200;
const H = 630;

const ogBackground = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="58%">
      <stop offset="0" stop-color="#ff2438" stop-opacity=".26"/>
      <stop offset=".55" stop-color="#7d0d18" stop-opacity=".12"/>
      <stop offset="1" stop-color="#070709" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".05"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#070709"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity=".6"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="600" y="472" text-anchor="middle" fill="#f4f4f6"
    font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="600"
    letter-spacing="14">ZEDVORA</text>
  <text x="600" y="524" text-anchor="middle" fill="#a8a8b2"
    font-family="Arial, Helvetica, sans-serif" font-size="23"
    letter-spacing="3">Ideas into Digital Experiences.</text>
  <rect x="520" y="556" width="160" height="2" rx="1" fill="#d9192b"/>
</svg>`);

const markForOg = await mark.clone().resize({ width: 330 }).png().toBuffer();

await sharp(ogBackground)
  .composite([{ input: markForOg, top: 74, left: Math.round((W - 330) / 2), blend: 'screen' }])
  .jpeg({ quality: 88 })
  .toFile(`${out}/og.jpg`);

// Work covers and case-study galleries. Masters live in assets/work.
// Tall UI captures crop from the top; the Budget Desk tour frames carry a
// burned-in caption strip, so those are trimmed before the cover crop.
const workOut = `${out}/work`;
await mkdir(workOut, { recursive: true });

async function workImage(file, name, { trimBottom = 0, gravity = 'north' } = {}) {
  const src = `assets/work/${file}`;
  let base = sharp(src);

  if (trimBottom) {
    const { width, height } = await sharp(src).metadata();
    base = sharp(src).extract({ left: 0, top: 0, width, height: height - trimBottom });
  }

  for (const [width, height] of [
    [1600, 1000],
    [800, 500]
  ]) {
    const crop = { width, height, fit: 'cover', position: gravity };
    await base.clone().resize(crop).avif({ quality: 50 }).toFile(`${workOut}/${name}-${width}.avif`);
    await base.clone().resize(crop).webp({ quality: 80 }).toFile(`${workOut}/${name}-${width}.webp`);
  }
}

const workImages = [
  ['smr-dashboard.png', 'smr-dashboard'],
  ['smr-uploads.png', 'smr-uploads'],
  ['smr-viewer-dashboard.png', 'smr-viewer'],
  ['smr-report.png', 'smr-report'],
  ['uco-admin-dashboard.png', 'uco-admin-dashboard'],
  ['uco-landing.png', 'uco-landing'],
  ['uco-request-form.png', 'uco-request-form'],
  ['uco-track.png', 'uco-track'],
  ['budget-desk-dashboard.png', 'budget-desk-dashboard', { trimBottom: 240, gravity: 'northwest' }],
  ['budget-expenses.png', 'budget-expenses', { trimBottom: 240, gravity: 'northwest' }],
  ['budget-bills.png', 'budget-bills', { trimBottom: 240, gravity: 'northwest' }],
  ['budget-savings.png', 'budget-savings', { trimBottom: 240, gravity: 'northwest' }],
  ['budget-reports.png', 'budget-reports', { trimBottom: 240, gravity: 'northwest' }]
];

for (const [file, name, opts] of workImages) {
  await workImage(file, name, opts);
}

// Video poster: a clean 16:9 crop of the dashboard frame, caption strip removed.
await sharp('assets/work/budget-desk-dashboard.png')
  .extract({ left: 0, top: 0, width: 3840, height: 1920 })
  .resize({ width: 1280, height: 720, fit: 'cover', position: 'top' })
  .jpeg({ quality: 82 })
  .toFile(`${workOut}/budget-desk-tour-poster.jpg`);

console.log('Assets written to', out);
