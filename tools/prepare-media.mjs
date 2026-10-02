// Downscale source images with headless Chrome into web-ready assets.
// Rasters are served as standalone files (referenced with <img> in the README),
// never embedded inside SVGs — GitHub serves SVGs with `default-src 'none'`,
// which blocks data: images inside them.
//
// Run: node tools/prepare-media.mjs
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = 'C:/Users/adity/OneDrive/Desktop/portfolio/public/images';
const MEDIA = path.join(ROOT, 'assets', 'profile');
const CERTS = path.join(MEDIA, 'certs');
const PROJ = path.join(MEDIA, 'projects');
const TMP = path.join(__dirname, '.media');
for (const d of [MEDIA, CERTS, PROJ, TMP]) fs.mkdirSync(d, { recursive: true });

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if (!CHROME) { console.error('No Chrome/Edge found'); process.exit(1); }

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function render({ src, out, w, h, bg = '#05070c', pos = 'center', fit = 'cover' }) {
  const tmpHtml = path.join(TMP, 'tmp.html');
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden;background:${bg}}
    img{width:100%;height:100%;object-fit:${fit};object-position:${pos};display:block}
  </style></head><body><img src="file:///${src.replace(/\\/g, '/')}"></body></html>`;
  fs.writeFileSync(tmpHtml, doc, 'utf8');
  if (fs.existsSync(out)) fs.unlinkSync(out);
  spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${w},${h}`, '--virtual-time-budget=3000', `--screenshot=${out}`, 'file:///' + tmpHtml.replace(/\\/g, '/')], { stdio: 'ignore' });
  for (let i = 0; i < 40 && !fs.existsSync(out); i++) sleep(200);
  if (!fs.existsSync(out)) { console.error('  FAILED ' + out); return false; }
  console.log(`  ${path.relative(ROOT, out)}  ${w}x${h}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  return true;
}

console.log('avatar:');
render({ src: `${SRC}/aditya-hero-3d.png`, out: path.join(MEDIA, 'avatar.jpg'), w: 520, h: 600, bg: '#0a0f18', pos: 'center 16%' });

console.log('certificates:');
const certs = [
  ['cert-jpmorgan.jpg', 'certifications/8.png', 977, 682],
  ['cert-deloitte.jpg', 'certifications/7.png', 1038, 759],
  ['cert-oracle.jpg', 'certifications/3.png', 923, 650],
  ['cert-mern.jpg', 'certifications/2.png', 906, 702],
];
for (const [out, src, sw, sh] of certs) {
  const w = 560, h = Math.round((w * sh) / sw);
  render({ src: `${SRC}/${src}`, out: path.join(CERTS, out), w, h, bg: '#ffffff', fit: 'contain' });
}

console.log('project thumbnails:');
const projects = [
  ['civicsentinel.jpg', 'projects/project1.png'],
  ['sneakervault.jpg', 'projects/project2.png'],
  ['campusiq.jpg', 'projects/project3.png'],
  ['brewco.jpg', 'projects/project4.png'],
];
for (const [out, src] of projects) {
  render({ src: `${SRC}/${src}`, out: path.join(PROJ, out), w: 1000, h: 500, bg: '#05070c', pos: 'center top' });
}

console.log('done.');
