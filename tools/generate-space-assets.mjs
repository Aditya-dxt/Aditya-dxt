// ---------------------------------------------------------------------------
// Space-Tech Profile README asset generator
// Produces animated, self-contained SVGs (no external fonts/scripts) that work
// when GitHub renders them through <img>.
//
// Run:  node tools/generate-space-assets.mjs
// Out:  assets/space/*.svg
// ---------------------------------------------------------------------------
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'space');
fs.mkdirSync(OUT, { recursive: true });

// ---- deterministic RNG so every rebuild looks identical --------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";
const SANS = "Inter, 'Segoe UI', system-ui, -apple-system, Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- shared gradient / filter definitions ----------------------------------
function baseDefs() {
  return `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#03040c"/>
    <stop offset="0.55" stop-color="#070a18"/>
    <stop offset="1" stop-color="#0a0724"/>
  </linearGradient>
  <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7dd3fc"/>
    <stop offset="0.5" stop-color="#c4b5fd"/>
    <stop offset="1" stop-color="#f0abfc"/>
  </linearGradient>
  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#22d3ee" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#22d3ee" stop-opacity="1"/>
    <stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#22d3ee"/>
    <stop offset="0.5" stop-color="#a78bfa"/>
    <stop offset="1" stop-color="#f472b6"/>
  </linearGradient>
  <radialGradient id="nebCyan" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#22d3ee" stop-opacity="0.20"/>
    <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nebViolet" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#a78bfa" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nebPink" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#f472b6" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#f472b6" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="planetBody" cx="0.35" cy="0.3" r="0.85">
    <stop offset="0" stop-color="#7dd3fc"/>
    <stop offset="0.35" stop-color="#2563eb"/>
    <stop offset="0.75" stop-color="#14204a"/>
    <stop offset="1" stop-color="#070b1c"/>
  </radialGradient>
  <radialGradient id="planetShade" cx="0.78" cy="0.72" r="0.9">
    <stop offset="0" stop-color="#03040c" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#03040c" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0b1020" stop-opacity="0.94"/>
    <stop offset="1" stop-color="#060913" stop-opacity="0.94"/>
  </linearGradient>
  <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="3.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="soft" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="10" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <style><![CDATA[
    .pulse { animation: sp-pulse 2.4s ease-in-out infinite; }
    @keyframes sp-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.32; } }
    .blink { animation: sp-blink 1.15s step-end infinite; }
    @keyframes sp-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    .hover { animation: sp-hover 3.6s ease-in-out infinite; }
    @keyframes sp-hover { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
    .rise { animation: sp-rise 1.1s cubic-bezier(.4,0,.2,1) both; }
    @keyframes sp-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .slide { animation: sp-slide .9s cubic-bezier(.4,0,.2,1) both; }
    @keyframes sp-slide { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }
    .hero-role { animation: sp-role 12s linear infinite; }
    .hero-role-1 { animation-delay: -9s; }
    .hero-role-2 { animation-delay: -6s; }
    .hero-role-3 { animation-delay: -3s; }
    @keyframes sp-role { 0% { opacity: 1; } 24% { opacity: 1; } 25% { opacity: 0; } 100% { opacity: 0; } }
  ]]></style>
</defs>`;
}

// ---- stars ------------------------------------------------------------------
function star(x, y, r, o, c, tw) {
  const cx = x.toFixed(1), cy = y.toFixed(1), rr = r.toFixed(2), oo = o.toFixed(2);
  if (tw) {
    return `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${c}" opacity="${oo}">` +
      `<animate attributeName="opacity" values="${oo};${(o * 0.22).toFixed(2)};${oo}" dur="${tw.toFixed(1)}s" repeatCount="indefinite"/></circle>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${c}" opacity="${oo}"/>`;
}

// Three parallax layers = perceived 3D depth. Each layer drifts downward at a
// constant linear speed and loops seamlessly (pattern is periodic in H).
function starfield(w, h, seed, layers) {
  const rng = mulberry32(seed);
  let out = '';
  for (const L of layers) {
    let inner = '';
    for (let i = 0; i < L.count; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const r = L.rMin + rng() * (L.rMax - L.rMin);
      const o = L.opMin + rng() * (L.opMax - L.opMin);
      const c = L.colors[(rng() * L.colors.length) | 0];
      const tw = L.twinkle && rng() < 0.45 ? 2.6 + rng() * 4.5 : 0;
      inner += star(x, y, r, o, c, tw);
      inner += star(x, y - h, r, o, c, tw); // duplicate above for seamless wrap
    }
    out += `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${h}" dur="${L.dur}s" repeatCount="indefinite"/>${inner}</g>`;
  }
  return out;
}

const FAR = (n, seed) => ({ count: n, rMin: 0.35, rMax: 0.95, opMin: 0.12, opMax: 0.4, colors: ['#cfe3ff', '#c7d2fe', '#ffffff'], dur: 90 });
const MID = (n) => ({ count: n, rMin: 0.7, rMax: 1.5, opMin: 0.25, opMax: 0.65, colors: ['#ffffff', '#a5f3fc', '#dbeafe', '#fde68a'], dur: 46, twinkle: true });
const NEAR = (n) => ({ count: n, rMin: 1.2, rMax: 2.3, opMin: 0.45, opMax: 0.95, colors: ['#ffffff', '#a5f3fc', '#fde68a'], dur: 22, twinkle: true });

function shootingStars(w, h, seed) {
  const rng = mulberry32(seed);
  const specs = [
    { x: -260, y: 60, dx: w + 320, dy: 150, begin: 1.5, dur: 6.5 },
    { x: -300, y: h - 40, dx: w + 360, dy: -170, begin: 6, dur: 8 },
    { x: 0, y: -40, dx: 240, dy: h + 120, begin: 11, dur: 7 },
  ];
  return specs.map((s, i) => {
    const len = 110 + rng() * 70;
    const id = `shoot${i}`;
    return `<g opacity="0">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#22d3ee" stop-opacity="0"/>
        <stop offset="0.7" stop-color="#a5f3fc" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#ffffff"/>
      </linearGradient></defs>
      <line x1="0" y1="0" x2="${len.toFixed(0)}" y2="${(len * 0.18).toFixed(0)}" stroke="url(#${id})" stroke-width="1.7" stroke-linecap="round" filter="url(#glow)"/>
      <animateTransform attributeName="transform" type="translate" values="${s.x} ${s.y};${s.x + s.dx} ${s.y + s.dy}" dur="${s.dur}s" begin="${s.begin}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.75;1" dur="${s.dur}s" begin="${s.begin}s" repeatCount="indefinite"/>
    </g>`;
  }).join('');
}

// ---- section icons (drawn around 0,0) --------------------------------------
const ICONS = {
  rocket: (c) => `<path d="M0,-15 C7,-9 9,-1 8,8 L0,5 L-8,8 C-9,-1 -7,-9 0,-15 Z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-3" r="3.1" fill="${c}"/><path d="M-7.5,8 L-11,15 M7.5,8 L11,15 M0,6.5 L0,14" fill="none" stroke="${c}" stroke-width="1.8" opacity="0.75" stroke-linecap="round"/>`,
  planet: (c, c2) => `<circle cx="1" cy="1" r="8" fill="none" stroke="${c}" stroke-width="2"/><ellipse cx="1" cy="1" rx="15.5" ry="5.2" fill="none" stroke="${c2}" stroke-width="2" transform="rotate(-24 1 1)" opacity="0.9"/><circle cx="10" cy="-7" r="2" fill="${c2}"/>`,
  chip: (c) => `<rect x="-9" y="-9" width="18" height="18" rx="3.5" fill="none" stroke="${c}" stroke-width="2"/><rect x="-4" y="-4" width="8" height="8" rx="1.6" fill="${c}" opacity="0.55"/><path d="M-5,-9 L-5,-14 M0,-9 L0,-14 M5,-9 L5,-14 M-5,9 L-5,14 M0,9 L0,14 M5,9 L5,14 M-9,-5 L-14,-5 M-9,0 L-14,0 M-9,5 L-14,5 M9,-5 L14,-5 M9,0 L14,0 M9,5 L14,5" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`,
  neural: (c, c2) => `<path d="M-9,-8 L0,9 L9,-8 M-9,-8 L9,-8 M0,-2 L-9,-8 M0,-2 L9,-8 M0,-2 L0,9" stroke="${c}" stroke-width="1.6" opacity="0.7" fill="none"/><circle cx="-9" cy="-8" r="3.2" fill="${c}"/><circle cx="9" cy="-8" r="3.2" fill="${c}"/><circle cx="0" cy="9" r="3.2" fill="${c}"/><circle cx="0" cy="-2" r="2.6" fill="${c2}" filter="url(#glow)"/>`,
  satellite: (c, c2) => `<rect x="-5" y="-7" width="10" height="14" rx="2" fill="none" stroke="${c}" stroke-width="2"/><rect x="-17" y="-5" width="9" height="10" rx="1.4" fill="${c}" opacity="0.45"/><rect x="8" y="-5" width="9" height="10" rx="1.4" fill="${c}" opacity="0.45"/><path d="M0,7 L0,14 M-4,14 L4,14" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="0" cy="-11" r="2" fill="${c2}" filter="url(#glow)"/>`,
  route: (c, c2) => `<path d="M-12,9 C-6,-9 6,-9 12,7" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="3 3"/><circle cx="-12" cy="9" r="3.4" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="7" r="3.4" fill="${c2}" filter="url(#glow)"/>`,
  trophy: (c, c2) => `<path d="M-8,-10 h16 v4 a8,8 0 0 1 -16,0 z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M-8,-8 h-4.5 a4.5,4.5 0 0 0 4.5,4.5 M8,-8 h4.5 a4.5,4.5 0 0 1 -4.5,4.5" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M0,2 v4 M-5.5,10 h11" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M0,-4 l1.2,2.4 2.6,.4 -1.9,1.8 .5,2.6 -2.4,-1.3 -2.4,1.3 .5,-2.6 -1.9,-1.8 2.6,-.4 z" fill="${c2}"/>`,
  telemetry: (c, c2) => `<rect x="-11" y="3" width="4.4" height="8" rx="1.4" fill="${c}" opacity="0.8"/><rect x="-3.2" y="-3" width="4.4" height="14" rx="1.4" fill="${c}"/><rect x="4.6" y="-10" width="4.4" height="21" rx="1.4" fill="${c2}"/><circle cx="12" cy="-9" r="2.2" fill="${c2}" filter="url(#glow)"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite"/></circle><path d="M-11,-11 h9" stroke="${c}" stroke-width="1.6" opacity="0.5"/>`,
  uplink: (c, c2) => `<circle cx="0" cy="7" r="2.8" fill="${c}"/><path d="M-6.5,1.5 a9.5,9.5 0 0 1 13,0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M-11,-3.5 a15.5,15.5 0 0 1 22,0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity="0.7"/><path d="M-15,-8 a21.5,21.5 0 0 1 30,0" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`,
};

// ---- HUD section banner -----------------------------------------------------
function sectionHeader({ node, title, subtitle, icon, seed }) {
  const w = 1200, h = 100;
  const stars = starfield(w, h, seed, [FAR(24), MID(12)]);
  const bars = [0, 1, 2, 3, 4].map((i) => {
    const bh = [10, 17, 24, 14, 20][i];
    return `<rect x="${i * 11}" y="${-bh}" width="5" height="${bh}" rx="1.6" fill="${i === 2 ? '#f0abfc' : '#22d3ee'}" opacity="${0.45 + i * 0.1}"><animate attributeName="opacity" values="${0.3 + i * 0.1};${0.9 - i * 0.05};${0.3 + i * 0.1}" dur="${1.6 + i * 0.5}s" repeatCount="indefinite"/></rect>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${baseDefs()}
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" fill="url(#card)"/>
  <g opacity="0.95">${stars}</g>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="14" fill="none" stroke="#16324f" stroke-width="1"/>
  <g fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.85">
    <path d="M14,18 L14,10 L30,10"/><path d="M${w - 14},18 L${w - 14},10 L${w - 30},10"/>
    <path d="M14,${h - 18} L14,${h - 10} L30,${h - 10}"/><path d="M${w - 14},${h - 18} L${w - 14},${h - 10} L${w - 30},${h - 10}"/>
  </g>
  <g transform="translate(60,50)">
    <path d="M26,0 L13,22 L-13,22 L-26,0 L-13,-22 L13,-22 Z" fill="#081527" stroke="#1e3a5f" stroke-width="1.4"/>
    <g transform="scale(1.12)" filter="url(#glow)">${ICONS[icon]('#5eead4', '#c4b5fd')}</g>
  </g>
  <text x="112" y="46" font-family="${SANS}" font-size="25" font-weight="800" letter-spacing="2.4" fill="url(#nameGrad)">${esc(title)}</text>
  <text x="114" y="70" font-family="${MONO}" font-size="11.5" letter-spacing="1.4" fill="#7f93b3">${esc(subtitle)}</text>
  <g transform="translate(995,84)">${bars}</g>
  <text x="${w - 30}" y="34" text-anchor="end" font-family="${MONO}" font-size="10.5" letter-spacing="2" fill="#4b6b91">${esc(node)}</text>
  <line x1="26" y1="${h - 15}" x2="${w - 26}" y2="${h - 15}" stroke="#12233d" stroke-width="1"/>
  <rect x="26" y="${h - 14}" width="240" height="2" fill="url(#lineGrad)" opacity="0.9">
    <animateTransform attributeName="transform" type="translate" values="-260 0;${w} 0" dur="7s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

// ---- hero -------------------------------------------------------------------
function hero() {
  const w = 1200, h = 640;
  const stars = starfield(w, h, 1337, [FAR(80), MID(46), NEAR(22)]);
  const roles = [
    ['Full-Stack Developer & AI Engineer', 0],
    ['RAG · LangChain · LLM Systems', 1],
    ['React · Node · Production MERN', 2],
    ['National Finalist — India Innovates', 3],
  ];
  const roleMarkup = roles.map(([t, i]) => {
    const cls = `hero-role hero-role-${i}`;
    return `<text x="66" y="238" class="${cls}" font-family="${MONO}" font-size="16.5" font-weight="600" fill="${['#5eead4', '#c4b5fd', '#f0abfc', '#7dd3fc'][i]}">&#x25B8; ${esc(t)}</text>`;
  }).join('');
  const chips = [
    ['Kanpur, India', '#5eead4'],
    ['PSIT Kanpur · B.Tech CSE', '#c4b5fd'],
    ['7+ Products Shipped', '#f0abfc'],
  ].map((c, i) => `<g transform="translate(${66 + i * 232},330)">
    <rect x="0" y="0" width="14" height="14" rx="4" fill="${c[1]}" opacity="0.16" stroke="${c[1]}" stroke-opacity="0.55"/>
    <circle cx="7" cy="7" r="2.4" fill="${c[1]}"/>
    <text x="24" y="11" font-family="${MONO}" font-size="12" fill="#9fb0cc">${esc(c[0])}</text>
  </g>`).join('');
  const stats = [
    ['300+', 'DSA Problems', '#5eead4'],
    ['7+', 'Projects Shipped', '#c4b5fd'],
    ['6x', 'Hackathons Led', '#f0abfc'],
    ['1014', 'Commits', '#7dd3fc'],
    ['48', 'Stars Earned', '#5eead4'],
  ].map((s, i) => {
    const x = 118 + i * 212;
    return `${i ? `<line x1="${x - 34}" y1="452" x2="${x - 34}" y2="552" stroke="#152943" stroke-width="1"/>` : ''}
    <g transform="translate(${x},482)">
      <text x="0" y="0" font-family="${SANS}" font-size="40" font-weight="800" fill="${s[2]}">${esc(s[0])}</text>
      <text x="0" y="26" font-family="${MONO}" font-size="11.5" fill="#8296b4" letter-spacing="1">${esc(s[1])}</text>
      <rect x="0" y="40" width="56" height="3" rx="1.5" fill="${s[2]}" opacity="0.35"/>
    </g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${baseDefs()}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <ellipse cx="210" cy="120" rx="380" ry="250" fill="url(#nebCyan)"/>
  <ellipse cx="1050" cy="540" rx="440" ry="320" fill="url(#nebViolet)"/>
  <ellipse cx="620" cy="330" rx="320" ry="230" fill="url(#nebPink)" opacity="0.75"/>
  <g>${stars}</g>
  ${shootingStars(w, h, 7)}

  <!-- planet + orbit -->
  <g>
    <circle cx="972" cy="228" r="150" fill="url(#nebCyan)" opacity="0.55"/>
    <ellipse cx="972" cy="228" rx="160" ry="40" fill="none" stroke="url(#ringGrad)" stroke-width="1.6" opacity="0.5" transform="rotate(-18 972 228)"/>
    <circle cx="972" cy="228" r="92" fill="url(#planetBody)"/>
    <circle cx="972" cy="228" r="92" fill="url(#planetShade)"/>
    <ellipse cx="972" cy="228" rx="150" ry="36" fill="none" stroke="url(#ringGrad)" stroke-width="2.2" opacity="0.75" transform="rotate(-18 972 228)"/>
    <g class="hover">
      <circle cx="972" cy="228" r="118" fill="none" stroke="#1d4ed8" stroke-width="1" opacity="0.35" stroke-dasharray="4 8"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 972 228" to="360 972 228" dur="26s" repeatCount="indefinite"/>
      <circle cx="1118" cy="228" r="6" fill="#fde68a" filter="url(#glow)"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="360 972 228" to="0 972 228" dur="42s" repeatCount="indefinite"/>
      <circle cx="972" cy="100" r="4" fill="#a5f3fc" filter="url(#glow)"/>
    </g>
  </g>

  <!-- HUD frame -->
  <g fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.85">
    <path d="M24,64 L24,26 L62,26"/><path d="M${w - 24},64 L${w - 24},26 L${w - 62},26"/>
    <path d="M24,${h - 64} L24,${h - 26} L62,${h - 26}"/><path d="M${w - 24},${h - 64} L${w - 24},${h - 26} L${w - 62},${h - 26}"/>
  </g>
  <rect x="24" y="0" width="${w - 48}" height="2" fill="#5eead4" opacity="0.35">
    <animate attributeName="y" values="30;${h - 30};30" dur="11s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.5;0.5;0" dur="11s" repeatCount="indefinite"/>
  </rect>

  <!-- left content -->
  <g class="slide" style="animation-delay:.15s">
    <rect x="66" y="60" width="214" height="32" rx="16" fill="#0c2036" stroke="#22d3ee" stroke-opacity="0.35"/>
    <circle cx="86" cy="76" r="4.5" fill="#5eead4" class="pulse"/>
    <text x="100" y="81" font-family="${MONO}" font-size="12" font-weight="600" fill="#5eead4" letter-spacing="1.5">MISSION CONTROL // LIVE</text>
  </g>
  <g class="rise" style="animation-delay:.35s">
    <text x="66" y="150" font-family="${MONO}" font-size="15" fill="#8ea3c4" letter-spacing="3">HELLO, EARTH &#x2014; I&apos;M</text>
  </g>
  <g class="rise" style="animation-delay:.5s">
    <text x="108" y="196" font-family="${SANS}" font-size="64" font-weight="800" letter-spacing="-1" fill="url(#nameGrad)">ADITYA DIXIT</text>
    <text x="66" y="196" font-family="${MONO}" font-size="22" fill="#5eead4" opacity="0.9">&#x2039;</text>
  </g>
  ${roleMarkup}
  <g class="rise" style="animation-delay:.9s">
    <text x="66" y="278" font-family="${SANS}" font-size="14.5" fill="#93a6c2">I craft production-grade apps with AI at the core &#x2014; MERN systems,</text>
    <text x="66" y="300" font-family="${SANS}" font-size="14.5" fill="#93a6c2">secure auth &amp; payments, and RAG / LLM pipelines shipped to production.</text>
  </g>
  <g class="rise" style="animation-delay:1.1s">${chips}</g>
  <g class="rise" style="animation-delay:1.3s">
    <rect x="66" y="400" width="${w - 132}" height="184" rx="16" fill="url(#card)" stroke="#16324f"/>
    <text x="66" y="392" font-family="${MONO}" font-size="11" fill="#4b6b91" letter-spacing="2">TELEMETRY</text>
    ${stats}
  </g>
</svg>`;
}

// ---- divider ----------------------------------------------------------------
function divider(seed) {
  const w = 1200, h = 40;
  const stars = starfield(w, h, seed, [FAR(26)]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${baseDefs()}
  <g opacity="0.85">${stars}</g>
  <line x1="0" y1="20" x2="${w}" y2="20" stroke="#0f1f36" stroke-width="1.5"/>
  <rect x="-260" y="18.5" width="260" height="3" rx="1.5" fill="url(#lineGrad)" opacity="0.95">
    <animateTransform attributeName="transform" type="translate" values="-280 0;${w} 0" dur="6s" repeatCount="indefinite"/>
  </rect>
  <g fill="#22d3ee" opacity="0.6">
    <circle cx="200" cy="20" r="1.6"/><circle cx="420" cy="20" r="1.6"/><circle cx="640" cy="20" r="1.6"/>
    <circle cx="860" cy="20" r="1.6"/><circle cx="1040" cy="20" r="1.6"/>
  </g>
</svg>`;
}

// ---- full star band ---------------------------------------------------------
function starBand(seed) {
  const w = 1200, h = 150;
  const stars = starfield(w, h, seed, [FAR(70), MID(34), NEAR(14)]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${baseDefs()}
  <rect width="${w}" height="${h}" fill="#040611"/>
  <ellipse cx="300" cy="40" rx="420" ry="160" fill="url(#nebCyan)"/>
  <ellipse cx="920" cy="130" rx="420" ry="170" fill="url(#nebViolet)"/>
  <g>${stars}</g>
  ${shootingStars(w, h, seed + 3)}
  <rect y="0" width="${w}" height="1" fill="#0f1f36"/>
  <rect y="${h - 1}" width="${w}" height="1" fill="#0f1f36"/>
</svg>`;
}

// ---- footer -----------------------------------------------------------------
function footer() {
  const w = 1200, h = 320;
  const stars = starfield(w, h, 4242, [FAR(80), MID(40), NEAR(16)]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${baseDefs()}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <ellipse cx="600" cy="360" rx="760" ry="230" fill="url(#nebCyan)" opacity="0.7"/>
  <ellipse cx="980" cy="120" rx="360" ry="200" fill="url(#nebViolet)"/>
  <g>${stars}</g>
  ${shootingStars(w, h, 21)}
  <!-- horizon planet -->
  <g>
    <circle cx="600" cy="560" r="300" fill="url(#planetBody)"/>
    <circle cx="600" cy="560" r="300" fill="url(#planetShade)"/>
    <path d="M300,560 A300,300 0 0 1 900,560" fill="none" stroke="url(#ringGrad)" stroke-width="2" opacity="0.55"/>
    <path d="M360,470 A300,300 0 0 1 840,470" fill="none" stroke="#1d4ed8" stroke-width="1" opacity="0.3" stroke-dasharray="5 9"/>
  </g>
  <!-- little rocket -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="-160 230;1320 90" dur="16s" repeatCount="indefinite"/>
    <g transform="rotate(18)">
      <path d="M0,-22 C9,-12 11,0 9,12 L0,7 L-9,12 C-11,0 -9,-12 0,-22 Z" fill="#0d1b33" stroke="#5eead4" stroke-width="1.6"/>
      <circle cx="0" cy="-5" r="3.4" fill="#a5f3fc"/>
      <path d="M-6,12 L-9,20 M6,12 L9,20" stroke="#f0abfc" stroke-width="2" stroke-linecap="round"/>
      <path d="M0,9 L0,22" stroke="#fde68a" stroke-width="2.6" stroke-linecap="round" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="0.5s" repeatCount="indefinite"/>
      </path>
    </g>
  </g>
  <g class="rise">
    <text x="600" y="120" text-anchor="middle" font-family="${MONO}" font-size="13" letter-spacing="4" fill="#5eead4">TRANSMISSION COMPLETE</text>
    <text x="600" y="176" text-anchor="middle" font-family="${SANS}" font-size="34" font-weight="800" fill="url(#nameGrad)">Let&apos;s build the next mission.</text>
    <text x="600" y="208" text-anchor="middle" font-family="${MONO}" font-size="13" fill="#93a6c2">adityadxt1910@gmail.com &#x2022; Kanpur, Uttar Pradesh, India</text>
  </g>
  <g fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.7">
    <path d="M40,60 L40,30 L78,30"/><path d="M${w - 40},60 L${w - 40},30 L${w - 78},30"/>
  </g>
</svg>`;
}

// ---- write files ------------------------------------------------------------
const files = {
  'hero.svg': hero(),
  'starfield.svg': starBand(50),
  'divider.svg': divider(9),
  'footer.svg': footer(),
  'sec-brief.svg': sectionHeader({ node: 'NODE 01', title: 'MISSION BRIEF', subtitle: 'WHO IS FLYING THIS SHIP', icon: 'rocket', seed: 101 }),
  'sec-education.svg': sectionHeader({ node: 'NODE 02', title: 'CREW TRAINING', subtitle: 'EDUCATION & FOUNDATIONS', icon: 'planet', seed: 202 }),
  'sec-systems.svg': sectionHeader({ node: 'NODE 03', title: 'ONBOARD SYSTEMS', subtitle: 'TECH STACK & TOOLING', icon: 'chip', seed: 303 }),
  'sec-ai.svg': sectionHeader({ node: 'NODE 04', title: 'NEURAL CORE', subtitle: 'AI / ML PROFICIENCY', icon: 'neural', seed: 404 }),
  'sec-missions.svg': sectionHeader({ node: 'NODE 05', title: 'DEPLOYED MISSIONS', subtitle: 'FEATURED PROJECTS IN ORBIT', icon: 'satellite', seed: 505 }),
  'sec-flightlog.svg': sectionHeader({ node: 'NODE 06', title: 'FLIGHT LOG', subtitle: 'EXPERIENCE & HACKATHONS', icon: 'route', seed: 606 }),
  'sec-patches.svg': sectionHeader({ node: 'NODE 07', title: 'MISSION PATCHES', subtitle: 'ACHIEVEMENTS & CERTIFICATIONS', icon: 'trophy', seed: 707 }),
  'sec-telemetry.svg': sectionHeader({ node: 'NODE 08', title: 'TELEMETRY', subtitle: 'GITHUB SIGNALS & STATS', icon: 'telemetry', seed: 808 }),
  'sec-uplink.svg': sectionHeader({ node: 'NODE 09', title: 'ESTABLISH UPLINK', subtitle: 'OPEN A CHANNEL', icon: 'uplink', seed: 909 }),
};

for (const [name, content] of Object.entries(files)) {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, content, 'utf8');
  console.log(`wrote ${name}  (${(content.length / 1024).toFixed(1)} KB)`);
}
console.log('\nDone -> ' + OUT);
