// One-off asset optimisation. Run with `node tools/convert-assets.js`.
// Converts the three heavy PNGs to WebP and re-encodes the loader's inline
// base64 PNG as base64 WebP (kept as a data URI to avoid canvas-taint on file://).
const fs    = require('fs');
const path  = require('path');
const sharp = require('sharp');

async function pngToWebp(src, dst, opts) {
  opts = opts || {};
  var pipeline = sharp(src);
  if (opts.width) pipeline = pipeline.resize({ width: opts.width });
  await pipeline.webp({ quality: opts.quality || 80 }).toFile(dst);
  var inB  = fs.statSync(src).size;
  var outB = fs.statSync(dst).size;
  console.log(
    path.basename(src) + ' → ' + path.basename(dst) +
    '  ' + (inB / 1024).toFixed(0) + 'kB → ' + (outB / 1024).toFixed(0) + 'kB' +
    '  (-' + Math.round((1 - outB / inB) * 100) + '%)'
  );
}

async function convertLoaderEmblem() {
  var emblemPath = 'assets/loader/emblem.html';
  var html       = fs.readFileSync(emblemPath, 'utf8');
  var m = html.match(/var LOGO_SRC = 'data:image\/png;base64,([^']+)';/);
  if (!m) throw new Error('LOGO_SRC line not found in emblem.html');

  var pngBuf  = Buffer.from(m[1], 'base64');
  var webpBuf = await sharp(pngBuf).webp({ quality: 90 }).toBuffer();
  var newSrc  = 'data:image/webp;base64,' + webpBuf.toString('base64');
  var newHtml = html.replace(m[0], "var LOGO_SRC = '" + newSrc + "';");

  fs.writeFileSync(emblemPath, newHtml);
  console.log(
    'emblem.html  ' +
    (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0) + 'kB → ' +
    (Buffer.byteLength(newHtml, 'utf8') / 1024).toFixed(0) + 'kB' +
    '  (logo: ' + (pngBuf.length / 1024).toFixed(0) + 'kB PNG → ' +
    (webpBuf.length / 1024).toFixed(0) + 'kB WebP)'
  );
}

(async () => {
  await pngToWebp('assets/calculator-bg.png', 'assets/calculator-bg.webp', { quality: 78 });
  await pngToWebp('assets/contact-bg.png',    'assets/contact-bg.webp',    { quality: 78 });
  // Logo is displayed at width:min(280px,40%) @ opacity:0.05 — decorative watermark.
  // 600px wide handles 2x DPR on the 280px slot comfortably.
  await pngToWebp('assets/logo/logo-refined.png', 'assets/logo/logo-refined.webp', { quality: 85, width: 600 });
  await convertLoaderEmblem();
})().catch(function (e) { console.error(e); process.exit(1); });
