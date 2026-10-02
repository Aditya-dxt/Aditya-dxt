// Build a hanging, swinging ID-badge GIF for the profile README.
//
// Why a GIF: GitHub serves SVGs with `default-src 'none'`, which blocks any
// raster (the avatar) from being embedded inside an SVG. A GIF is the only
// format that carries a photo AND animates. Frames are captured with headless
// Chrome from a CSS pendulum animation, then encoded (with 1-bit transparency)
// using gifenc.
//
// Run: npm install   (in tools/)   then:   node build-id-card.mjs
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'profile', 'id-card.gif');
const FRAMES = path.join(__dirname, '.media', 'frames');
const AVATAR = path.join(ROOT, 'assets', 'profile', 'avatar.jpg');
fs.mkdirSync(FRAMES, { recursive: true });

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if (!CHROME) { console.error('No Chrome/Edge found'); process.exit(1); }

const W = 460, H = 740, N = 28, T = 3.2; // 28 frames over a 3.2s loop
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function page(t) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:transparent}
  *{box-sizing:border-box}
  .mono{font-family:'SFMono-Regular','JetBrains Mono',Consolas,'Courier New',monospace}
  .sans{font-family:Inter,'Segoe UI',Arial,sans-serif}
  .swing{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:230px 0px;
         animation:swing ${T}s ease-in-out infinite;animation-delay:${t}s;animation-play-state:paused}
  .strap{position:absolute;left:216px;top:0;width:28px;height:132px;border-radius:0 0 6px 6px;
         background:
           repeating-linear-gradient(62deg,rgba(255,255,255,.06) 0 3px,transparent 3px 6px),
           repeating-linear-gradient(-62deg,rgba(0,0,0,.30) 0 3px,transparent 3px 6px),
           linear-gradient(180deg,#22374f,#0d1622);
         border-left:1px solid #33506f;border-right:1px solid #16283e;
         box-shadow:inset 4px 0 0 rgba(74,168,255,.18), inset -4px 0 0 rgba(0,0,0,.4)}
  .strap:after{content:'';position:absolute;left:12px;top:0;bottom:10px;width:4px;border-radius:2px;background:linear-gradient(180deg,rgba(74,168,255,.6),rgba(74,168,255,.12))}
  .clip{position:absolute;left:188px;top:122px;width:84px;height:48px;border-radius:12px;
        background:linear-gradient(180deg,#93a9c1,#41546b 44%,#22303f 62%,#6f8499);border:1px solid #9db2c8;
        box-shadow:0 4px 8px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.65), inset 0 -4px 8px rgba(0,0,0,.55)}
  .clip:before{content:'';position:absolute;left:31px;top:-12px;width:20px;height:15px;border:3px solid #a6bad0;border-bottom:none;border-radius:10px 10px 0 0}
  .clip:after{content:'';position:absolute;left:11px;right:11px;top:12px;height:6px;border-radius:3px;background:linear-gradient(180deg,rgba(255,255,255,.4),rgba(255,255,255,0))}
  .thick{position:absolute;left:47px;top:181px;width:380px;height:540px;border-radius:22px;
         background:linear-gradient(160deg,#03050b,#070f18)}
  .card{position:absolute;left:40px;top:172px;width:380px;height:540px;border-radius:22px;overflow:hidden;
        background:linear-gradient(155deg,#111b2c,#0a0f1a 55%,#0b1220);border:1px solid rgba(150,178,210,.3);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.10), inset 0 -20px 40px rgba(0,0,0,.24);
        transform-origin:190px 6px;animation:cs ${T}s ease-in-out infinite;animation-delay:${t}s;animation-play-state:paused}
  .topline{position:absolute;left:0;top:0;width:380px;height:5px;background:linear-gradient(90deg,#4aa8ff,#a78bfa,#e8a33d)}
  .hdr{position:absolute;left:28px;right:28px;top:26px;display:flex;justify-content:space-between;align-items:center}
  .hdr .l{font-size:10px;letter-spacing:2.6px;color:#a9b8cc}
  .chip{display:flex;align-items:center;gap:6px;border:1px solid #23364d;border-radius:6px;padding:3px 8px;background:#0b1420}
  .dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:dot ${T}s ease-in-out infinite;animation-delay:${t}s;animation-play-state:paused}
  .chip span{font-size:9px;letter-spacing:1.4px;color:#b7c6da}
  .rule{position:absolute;left:28px;right:28px;top:60px;height:1px;background:linear-gradient(90deg,rgba(74,168,255,.55),rgba(74,168,255,0))}
  .photo{position:absolute;left:28px;top:78px;width:156px;height:156px;border-radius:14px;overflow:hidden;border:1px solid #2a4665;background:#0a1018;
         box-shadow:0 6px 14px rgba(0,0,0,.5), 0 0 0 4px rgba(74,168,255,.08)}
  .photo img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
  .idb{position:absolute;left:196px;top:98px;width:158px}
  .idb .nm{font-size:24px;font-weight:800;color:#f2f6fb;letter-spacing:-.4px;line-height:1.05}
  .idb .rl{font-size:10.5px;letter-spacing:1.1px;color:#9fb0c4;margin-top:7px;line-height:1.5}
  .idb .tag{display:inline-block;margin-top:11px;font-size:9.5px;letter-spacing:1.3px;color:#79c0ff;border:1px solid #24507d;border-radius:5px;padding:3px 8px;background:#0b1b2e}
  .div{position:absolute;left:28px;right:28px;top:262px;height:1px;background:#1a2739}
  .bio{position:absolute;left:28px;right:28px;top:282px}
  .bio .row{display:flex;align-items:center;gap:11px;margin-bottom:19px}
  .bio .tk{width:4px;height:17px;border-radius:2px;background:#4aa8ff;opacity:.9}
  .bio .tx{font-size:12.5px;letter-spacing:1px;color:#dbe6f3}
  .holo{position:absolute;right:30px;top:346px;width:52px;height:52px;border-radius:13px;
        background:conic-gradient(from 0deg,#4aa8ff,#a78bfa,#f0abfc,#e8a33d,#4aa8ff);opacity:.55;
        animation:holo ${T}s linear infinite;animation-delay:${t}s;animation-play-state:paused}
  .fdiv{position:absolute;left:28px;right:28px;bottom:72px;height:1px;background:#1a2739}
  .foot{position:absolute;left:28px;right:28px;bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}
  .bar{width:168px;height:38px;opacity:.82;
       background-image:repeating-linear-gradient(90deg,#aab8c9 0 2px,transparent 2px 3px,#aab8c9 3px 4px,transparent 4px 8px,#aab8c9 8px 9px,transparent 9px 12px,#aab8c9 12px 15px,transparent 15px 16px)}
  .fid{text-align:right}
  .fid .a{font-size:12px;letter-spacing:2px;color:#dbe6f3}
  .fid .b{font-size:9.5px;letter-spacing:1.5px;color:#6b7c93;margin-top:4px}
  @keyframes swing{0%,100%{transform:rotate(-3.1deg)}50%{transform:rotate(3.1deg)}}
  @keyframes cs{0%,100%{transform:rotate(1deg)}50%{transform:rotate(-1deg)}}
  @keyframes dot{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes holo{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
  </style></head><body>
  <div class="swing">
    <div class="strap"></div>
    <div class="clip"></div>
    <div class="thick"></div>
    <div class="card">
      <div class="topline"></div>
      <div class="hdr"><div class="l mono">IDENTITY CARD</div><div class="chip"><div class="dot"></div><span class="mono">ACTIVE</span></div></div>
      <div class="rule"></div>
      <div class="photo"><img src="file:///${AVATAR.replace(/\\/g, '/')}"></div>
      <div class="idb">
        <div class="nm sans">Aditya Dixit</div>
        <div class="rl mono">FULL-STACK &amp; AI ENGINEER</div>
        <div class="tag mono">AI · RAG · MERN</div>
      </div>
      <div class="div"></div>
      <div class="bio">
        <div class="row"><div class="tk"></div><div class="tx mono">B.TECH CSE · PSIT KANPUR</div></div>
        <div class="row"><div class="tk"></div><div class="tx mono">7+ PRODUCTS SHIPPED</div></div>
        <div class="row"><div class="tk"></div><div class="tx mono">NATIONAL FINALIST 2026</div></div>
        <div class="row"><div class="tk"></div><div class="tx mono">OPEN TO SDE · AI-ML ROLES</div></div>
      </div>
      <div class="holo"></div>
      <div class="fdiv"></div>
      <div class="foot">
        <div class="bar"></div>
        <div class="fid"><div class="a mono">ADX-2026</div><div class="b mono">26.44°N · 80.33°E</div></div>
      </div>
    </div>
  </div>
  </body></html>`;
}

// ---- PNG (8-bit, non-interlaced) -> RGBA ----------------------------------
function decodePNG(buf) {
  let p = 8, w = 0, h = 0, bd = 0, ct = 0, inter = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p); const type = buf.toString('ascii', p + 4, p + 8); const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; inter = data[12]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break; p += 12 + len;
  }
  if (bd !== 8 || inter !== 0) throw new Error('unsupported png');
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : ct === 4 ? 2 : 0;
  const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * ch; const out = Buffer.alloc(h * stride);
  const paeth = (a, b, c) => { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)]; const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)); const o = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? out[o + x - ch] : 0; const b = y > 0 ? out[o - stride + x] : 0; const c = x >= ch && y > 0 ? out[o - stride + x - ch] : 0;
      let v = line[x]; if (ft === 1) v += a; else if (ft === 2) v += b; else if (ft === 3) v += (a + b) >> 1; else if (ft === 4) v += paeth(a, b, c); out[o + x] = v & 255;
    }
  }
  // normalise to RGBA
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    if (ch === 4) { rgba[i * 4] = out[i * 4]; rgba[i * 4 + 1] = out[i * 4 + 1]; rgba[i * 4 + 2] = out[i * 4 + 2]; rgba[i * 4 + 3] = out[i * 4 + 3]; }
    else if (ch === 3) { rgba[i * 4] = out[i * 3]; rgba[i * 4 + 1] = out[i * 3 + 1]; rgba[i * 4 + 2] = out[i * 3 + 2]; rgba[i * 4 + 3] = 255; }
    else if (ch === 1) { const g = out[i]; rgba[i * 4] = g; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = g; rgba[i * 4 + 3] = 255; }
    else { rgba[i * 4] = 0; rgba[i * 4 + 1] = 0; rgba[i * 4 + 2] = 0; rgba[i * 4 + 3] = 255; }
  }
  return { rgba, w, h };
}

// ---- capture frames --------------------------------------------------------
console.log(`rendering ${N} frames @ ${W}x${H}...`);
const html = path.join(FRAMES, 'frame.html');
const files = [];
for (let i = 0; i < N; i++) {
  const t = -(i * T) / N;
  fs.writeFileSync(html, page(t), 'utf8');
  const png = path.join(FRAMES, `f${String(i).padStart(3, '0')}.png`);
  if (fs.existsSync(png)) fs.unlinkSync(png);
  spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--default-background-color=00000000', `--window-size=${W},${H}`, '--virtual-time-budget=500',
    `--screenshot=${png}`, 'file:///' + html.replace(/\\/g, '/')], { stdio: 'ignore' });
  for (let k = 0; k < 30 && !fs.existsSync(png); k++) sleep(150);
  if (!fs.existsSync(png)) { console.error('frame failed ' + i); process.exit(1); }
  files.push(png);
}
console.log('frames captured');

// ---- quantize (shared palette from all frames) + encode --------------------
const frames = files.map((f) => decodePNG(fs.readFileSync(f)));
const sample = [];
for (const fr of frames) {
  for (let i = 0; i < fr.w * fr.h; i += 3) {
    if (fr.rgba[i * 4 + 3] >= 128) sample.push(fr.rgba[i * 4], fr.rgba[i * 4 + 1], fr.rgba[i * 4 + 2], 255);
  }
}
const palette = quantize(Uint8Array.from(sample), 160, { format: 'rgb444' });
palette.push([0, 0, 0]);            // transparent slot
const tIndex = palette.length - 1;

const gif = GIFEncoder();
for (const fr of frames) {
  const idx = applyPalette(fr.rgba, palette, 'rgb444');
  for (let i = 0; i < fr.w * fr.h; i++) if (fr.rgba[i * 4 + 3] < 128) idx[i] = tIndex;
  gif.writeFrame(idx, fr.w, fr.h, { palette, delay: Math.round((T * 1000) / N), transparent: true, transparentIndex: tIndex, dispose: 2 });
}
gif.finish();
fs.writeFileSync(OUT, gif.bytes());
console.log(`wrote ${path.relative(ROOT, OUT)}  (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);

if (!process.env.KEEP_FRAMES) fs.rmSync(FRAMES, { recursive: true, force: true });
