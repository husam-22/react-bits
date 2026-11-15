// Captures the image-sequence fallback of the scroll story from the live 3D scene.
//
// The frames in public/story/{desktop,compact}/ are pictures of the real procedural model, used on devices
// that cannot run WebGL. Run this again whenever the model, its materials or the camera change.
//
// Requirements (not project dependencies, to keep the install light):
//   - puppeteer-core, resolvable from this project or from the folder given in PUPPETEER_FROM
//   - a Chrome/Chromium binary: CHROME_PATH=/path/to/chrome   (extra flags: CHROME_ARGS="--flag --flag")
//   - the site running: npm run build && npm run start
//
// Usage: CHROME_PATH=... node scripts/capture-story-frames.mjs [http://localhost:3000]
//
// Keep FRAMES in sync with STORY_FRAMES in src/components/hero/StorySequence.tsx.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const FRAMES = { count: 41, from: 0.04, to: 1 };
const VARIANTS = [
  // The wide stage. The clip is the visible part of the poster box at this size (see .story__frames in globals.css).
  { name: 'desktop', viewport: { width: 1440, height: 900, deviceScaleFactor: 1.25 }, dpr: 1.25, clip: { x: 0, y: 171, width: 1231, height: 729 } },
  // Phones and tablets: a tall window so the whole stage is on screen without scrolling. The clip is the stage.
  { name: 'compact', viewport: { width: 390, height: 1000, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, dpr: 2, clip: null }
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || 'http://localhost:3000';
const require = createRequire(process.env.PUPPETEER_FROM ? pathToFileURL(path.join(process.env.PUPPETEER_FROM, 'x.js')) : import.meta.url);
const puppeteer = require('puppeteer-core');

if (!process.env.CHROME_PATH) throw new Error('Set CHROME_PATH to a Chrome or Chromium binary.');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: 'shell',
  args: (process.env.CHROME_ARGS || '--hide-scrollbars').split(' ').filter(Boolean)
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

for (const variant of VARIANTS) {
  const page = await browser.newPage();
  await page.setViewport(variant.viewport);
  await page.goto(`${base}/?3d=force&dpr=${variant.dpr}`, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__sarhStory && document.querySelector('.story__canvas canvas'), { timeout: 30000 });
  await sleep(1500);
  // Only the scene on the page colour: no text, no poster.
  await page.addStyleTag({
    content: `header, .story__copy, .story__captions, .story__hint, .story__poster { visibility: hidden !important; }
              .story__canvas { opacity: 1 !important; }`
  });
  const clip =
    variant.clip ??
    (await page.evaluate(() => {
      const box = document.querySelector('.story__stage').getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
    }));

  const directory = path.join(root, 'public/story', variant.name);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });

  let bytes = 0;
  for (let index = 0; index < FRAMES.count; index++) {
    const progress = FRAMES.from + ((FRAMES.to - FRAMES.from) * index) / (FRAMES.count - 1);
    await page.evaluate(
      value =>
        new Promise(resolve => {
          window.__sarhStory.set(value);
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)));
        }),
      progress
    );
    await sleep(120);
    const png = await page.screenshot({ type: 'png', clip, captureBeyondViewport: false });
    const file = path.join(directory, `${String(index).padStart(2, '0')}.webp`);
    await sharp(png).webp({ quality: 78, effort: 5, smartSubsample: true }).toFile(file);
    bytes += fs.statSync(file).size;
  }
  const meta = await sharp(path.join(directory, '00.webp')).metadata();
  console.log(`${variant.name}: ${FRAMES.count} frames, ${meta.width}×${meta.height}, ${(bytes / 1024).toFixed(0)} KB in total`);
  await page.close();
}

await browser.close();
