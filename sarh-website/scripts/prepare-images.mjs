// Builds the web-ready images in src/assets/images from the full-resolution sources in assets-source/.
// Run with: npm run images
// next/image then serves AVIF/WebP at responsive sizes from these files at request time.
// Every source and what was done to it is listed in docs/ASSETS.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = name => path.join(root, 'assets-source', name);
const out = name => path.join(root, 'src/assets/images', name);
const jpeg = { quality: 90, mozjpeg: true };

fs.mkdirSync(out(''), { recursive: true });

// ── Hero poster (provided by the client) ────────────────────────────────────────────────────────
{
  const file = source('hero-poster-source.png');
  const { width: W, height: H } = await sharp(file).metadata();

  // Desktop: the full 16:9 frame. The building sits in the left ~63%; the right side stays empty for HTML text.
  await sharp(file).jpeg({ ...jpeg, chromaSubsampling: '4:4:4' }).toFile(out('hero-poster.jpg'));

  // Mobile: an independent, closer crop that keeps the whole building and drops the empty text area.
  await sharp(file)
    .extract({
      left: Math.round(W * 0.105),
      top: Math.round(H * 0.045),
      width: Math.round(W * 0.565),
      height: Math.round(H * 0.925)
    })
    .jpeg({ ...jpeg, chromaSubsampling: '4:4:4' })
    .toFile(out('hero-poster-mobile.jpg'));
}

// ── Generated illustrative images ───────────────────────────────────────────────────────────────
const generated = fs.readdirSync(source('generated')).filter(name => name.endsWith('.jpg'));

for (const name of generated) {
  const file = source(`generated/${name}`);

  if (name === 'service-design.jpg') {
    // The generator drew pseudo-lettering on the drawings. Soften those areas so no words are legible.
    const { width: W, height: H } = await sharp(file).metadata();
    const areas = [
      [650, 722, 200, 105],
      [230, 545, 160, 75],
      [388, 655, 100, 50],
      [330, 455, 95, 40],
      [430, 610, 70, 40]
    ];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="black"/>${areas
      .map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white"/>`)
      .join('')}</svg>`;
    const mask = await sharp(Buffer.from(svg)).blur(14).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
    const blurred = await sharp(file).blur(2.6).raw().toBuffer({ resolveWithObject: true });
    const softened = await sharp(blurred.data, { raw: blurred.info })
      .joinChannel(mask.data, { raw: mask.info })
      .png()
      .toBuffer();
    await sharp(file).composite([{ input: softened }]).jpeg(jpeg).toFile(out(name));
    continue;
  }

  if (name === 'project-residential.jpg') {
    // Crop out the parked cars on the right edge (one carries a recognisable brand emblem).
    await sharp(file).extract({ left: 0, top: 0, width: 962, height: 848 }).jpeg(jpeg).toFile(out(name));
    continue;
  }

  fs.copyFileSync(file, out(name));
}

for (const name of fs.readdirSync(out('')).sort()) {
  const meta = await sharp(out(name)).metadata();
  const kb = (fs.statSync(out(name)).size / 1024).toFixed(0);
  console.log(`${name.padEnd(30)} ${`${meta.width}x${meta.height}`.padEnd(10)} ${kb} KB`);
}
