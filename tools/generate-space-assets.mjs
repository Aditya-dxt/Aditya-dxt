// ---------------------------------------------------------------------------
// Profile README asset generator — "mission operations" editorial system.
//
// A restrained, systems-engineering visual language: near-black canvas,
// fine engineering grid, hairline rules, uppercase structural type, monospace
// telemetry labels, one cool accent + one warm accent. Stars are a subtle,
// constant-speed 3D depth field — never confetti.
//
// Self-contained SVGs (no external fonts/scripts) that animate correctly when
// GitHub renders them through <img>.
//
// Run:  node tools/generate-space-assets.mjs
// Out:  assets/profile/*.svg
// ---------------------------------------------------------------------------
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'profile');
fs.mkdirSync(OUT, { recursive: true });

// ---- deterministic RNG ------------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- design tokens ----------------------------------------------------------
const C = {
  bg: '#05070c',
  panel: '#090e17',
  panelHi: '#0b1220',
  hair: '#16202e',
  grid: '#0e1826',
  gridHi: '#131f2e',
  text: '#e6edf3',
  muted: '#8b98a9',
  faint: '#55637a',
  accent: '#4aa8ff',
  warm: '#e8a33d',
  ok: '#4ade80',
};
const MONO = "'SFMono-Regular','JetBrains Mono','Roboto Mono',Consolas,'Liberation Mono',monospace";
const SANS = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- shared defs ------------------------------------------------------------
function defs() {
  return `<defs>
  <linearGradient id="vign" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.bg}"/>
    <stop offset="0.6" stop-color="#060910"/>
    <stop offset="1" stop-color="#04060b"/>
  </linearGradient>
  <radialGradient id="gCool" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.accent}" stop-opacity="0.10"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="gWarm" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.warm}" stop-opacity="0.07"/>
    <stop offset="1" stop-color="${C.warm}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="radarGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.accent}" stop-opacity="0.22"/>
    <stop offset="0.7" stop-color="${C.accent}" stop-opacity="0.05"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="body" cx="0.38" cy="0.34" r="0.8">
    <stop offset="0" stop-color="#9ec5ff"/>
    <stop offset="0.5" stop-color="#2f6fd0"/>
    <stop offset="1" stop-color="#0d1c33"/>
  </radialGradient>
  <linearGradient id="imgFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.5" stop-color="#05070c" stop-opacity="0"/>
    <stop offset="1" stop-color="#05070c" stop-opacity="0.94"/>
  </linearGradient>
  <linearGradient id="ruleFade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${C.accent}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M40 0H0V40" fill="none" stroke="${C.grid}" stroke-width="1"/>
  </pattern>
  <pattern id="gridHi" width="200" height="200" patternUnits="userSpaceOnUse">
    <path d="M200 0H0V200" fill="none" stroke="${C.gridHi}" stroke-width="1"/>
  </pattern>
  <style><![CDATA[
    .pf-blink { animation: pf-blink 1.1s steps(1,end) infinite; }
    @keyframes pf-blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
    .pf-pulse { animation: pf-pulse 2.6s ease-in-out infinite; }
    @keyframes pf-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    .pf-rise { animation: pf-rise 1.05s cubic-bezier(.22,.61,.36,1) both; }
    @keyframes pf-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    .pf-fade { animation: pf-fade 1.2s ease-out both; }
    @keyframes pf-fade { from { opacity: 0; } to { opacity: 1; } }
    .pf-role { animation: pf-role 13s linear infinite; }
    .pf-role-1 { animation-delay: -9.75s; }
    .pf-role-2 { animation-delay: -6.5s; }
    .pf-role-3 { animation-delay: -3.25s; }
    @keyframes pf-role { 0% { opacity: 1; } 23% { opacity: 1; } 25%,100% { opacity: 0; } }
  ]]></style>
</defs>`;
}

function gridLayer(w, h) {
  return `<rect width="${w}" height="${h}" fill="url(#grid)"/><rect width="${w}" height="${h}" fill="url(#gridHi)"/>`;
}

// ---- constant-speed 3D star depth field ------------------------------------
// Each layer drifts linearly (constant speed) and wraps seamlessly because the
// point distribution is duplicated one full height above. Bigger + brighter +
// faster == nearer, which is what reads as depth.
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
      const tw = L.twinkle && rng() < 0.4 ? 3.4 + rng() * 4 : 0;
      const dot = (yy) =>
        tw
          ? `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${r.toFixed(2)}" fill="${c}" opacity="${o.toFixed(2)}"><animate attributeName="opacity" values="${o.toFixed(2)};${(o * 0.3).toFixed(2)};${o.toFixed(2)}" dur="${tw.toFixed(1)}s" repeatCount="indefinite"/></circle>`
          : `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${r.toFixed(2)}" fill="${c}" opacity="${o.toFixed(2)}"/>`;
      inner += dot(y) + dot(y - h);
    }
    out += `<g opacity="${L.alpha ?? 1}"><animateTransform attributeName="transform" type="translate" values="0 0;0 ${h}" dur="${L.dur}s" repeatCount="indefinite"/>${inner}</g>`;
  }
  return out;
}
const FIELD = (n, dur, seed) => ({ count: n, rMin: 0.4, rMax: 0.9, opMin: 0.08, opMax: 0.28, colors: ['#c9d9ee', '#ffffff', '#a9c4e6'], dur, alpha: 0.9 });
const MID = (n, dur) => ({ count: n, rMin: 0.6, rMax: 1.2, opMin: 0.14, opMax: 0.42, colors: ['#ffffff', '#bcd7f5', '#ffe0a8'], dur, twinkle: true });
const NEAR = (n, dur) => ({ count: n, rMin: 0.9, rMax: 1.5, opMin: 0.28, opMax: 0.7, colors: ['#ffffff', '#cfe6ff'], dur, twinkle: true });

// ============================================================================
// MASTHEAD
// ============================================================================
function masthead() {
  const w = 1200, h = 600;
  const roles = [
    ['Full-Stack Engineer', 0],
    ['Machine-Intelligence Engineer', 1],
    ['React / Node Systems', 2],
    ['RAG & LLM Pipelines', 3],
  ];
  const roleMarkup = roles
    .map(([t, i]) => `<text x="54" y="248" class="pf-role pf-role-${i}" font-family="${MONO}" font-size="14.5" letter-spacing="0.6" fill="${C.accent}">${esc(t)}</text>`)
    .join('');

  const meta = [
    ['B.TECH CSE, PSIT KANPUR', 40],
    ['7+ PRODUCTS SHIPPED', 259],
    ['NATIONAL FINALIST 2026', 439],
  ];
  const metaMarkup = meta
    .map(([t, x], i) => `${i ? `<line x1="${x - 22}" y1="330" x2="${x - 22}" y2="342" stroke="${C.hair}" stroke-width="1"/>` : ''}<text x="${x}" y="340" font-family="${MONO}" font-size="10.5" letter-spacing="1.4" fill="${C.muted}">${esc(t)}</text>`)
    .join('');

  // ---- radar / system-map geometry ----
  const DEG = Math.PI / 180;
  const ocx = 925, ocy = 290, RR = 104;
  const wedge = (a1, a2, op) => {
    const x1 = (ocx + RR * Math.cos(a1)).toFixed(1), y1 = (ocy + RR * Math.sin(a1)).toFixed(1);
    const x2 = (ocx + RR * Math.cos(a2)).toFixed(1), y2 = (ocy + RR * Math.sin(a2)).toFixed(1);
    return `<path d="M${ocx},${ocy} L${x1},${y1} A${RR},${RR} 0 0 1 ${x2},${y2} Z" fill="${C.accent}" opacity="${op}"/>`;
  };
  const sweepSlices = [0, 9, 18, 27, 36, 45]
    .map((d, i) => wedge(d * DEG, (d + 9) * DEG, [0.34, 0.25, 0.17, 0.11, 0.06, 0.03][i]))
    .join('');
  const radarTicks = Array.from({ length: 72 }, (_, i) => {
    const a = i * 5 * DEG, major = i % 6 === 0;
    const r1 = RR + 3, r2 = RR + (major ? 12 : 6);
    return `<line x1="${(ocx + Math.cos(a) * r1).toFixed(1)}" y1="${(ocy + Math.sin(a) * r1).toFixed(1)}" x2="${(ocx + Math.cos(a) * r2).toFixed(1)}" y2="${(ocy + Math.sin(a) * r2).toFixed(1)}" stroke="${major ? '#41709b' : '#22374f'}" stroke-width="${major ? 1.2 : 1}"/>`;
  }).join('');
  const blips = [[0.5, -0.34, C.ok], [-0.45, 0.42, C.ok], [0.18, 0.6, C.warm], [-0.62, -0.2, C.ok]]
    .map(([u, v, col], i) => {
      const bx = (ocx + u * RR).toFixed(1), by = (ocy + v * RR).toFixed(1), dur = (3 + i * 0.8).toFixed(1), beg = (i * 0.7).toFixed(1);
      return `<g><circle cx="${bx}" cy="${by}" r="2.4" fill="${col}"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.55;1" dur="${dur}s" begin="${beg}s" repeatCount="indefinite"/></circle><circle cx="${bx}" cy="${by}" r="2.4" fill="none" stroke="${col}"><animate attributeName="r" values="2;12;2" dur="${dur}s" begin="${beg}s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="${dur}s" begin="${beg}s" repeatCount="indefinite"/></circle></g>`;
    }).join('');
  let wpath = '';
  for (let x = 0; x <= 420; x += 6) wpath += `${x === 0 ? 'M' : 'L'}${x} ${(16 + Math.sin(x / 22) * 6 + Math.sin(x / 7) * 2.4).toFixed(1)} `;

  const stats = [
    ['300+', 'DSA PROBLEMS'],
    ['7+', 'PROJECTS SHIPPED'],
    ['12×', 'HACKATHONS LED'],
    ['1.0K', 'CONTRIBUTIONS'],
    ['48', 'STARS EARNED'],
  ];
  const statsMarkup = stats
    .map(([v, l], i) => {
      const x = 84 + i * 220;
      return `${i ? `<line x1="${x - 40}" y1="462" x2="${x - 40}" y2="516" stroke="#1d2b3d" stroke-width="1"/>` : ''}
      <text x="${x}" y="492" font-family="${MONO}" font-size="30" font-weight="700" fill="${C.text}">${esc(v)}</text>
      <text x="${x}" y="512" font-family="${MONO}" font-size="9.5" letter-spacing="1.3" fill="${C.muted}">${esc(l)}</text>
      <rect x="${x}" y="524" width="42" height="2" fill="${C.accent}" opacity="0.55"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Aditya Dixit — profile masthead">
${defs()}
  <rect width="${w}" height="${h}" fill="url(#vign)"/>
  ${gridLayer(w, h)}
  <ellipse cx="960" cy="150" rx="460" ry="320" fill="url(#gCool)"/>
  <ellipse cx="150" cy="560" rx="420" ry="280" fill="url(#gWarm)"/>
  <g>${starfield(w, h, 20260101, [FIELD(70, 110), MID(30, 58), NEAR(12, 30)])}</g>

  <!-- masthead bar -->
  <g class="pf-fade">
    <rect x="40" y="28" width="32" height="32" rx="7" fill="${C.panel}" stroke="${C.hair}"/>
    <text x="56" y="49" text-anchor="middle" font-family="${MONO}" font-size="12" font-weight="700" fill="${C.accent}">AD</text>
    <text x="86" y="43" font-family="${SANS}" font-size="12.5" font-weight="700" letter-spacing="2.2" fill="${C.text}">ADITYA DIXIT</text>
    <text x="86" y="57" font-family="${MONO}" font-size="9" letter-spacing="1.6" fill="${C.faint}">FULL-STACK &amp; MACHINE-INTELLIGENCE ENGINEERING</text>

    <text x="1160" y="43" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1" fill="${C.muted}">26.44°N / 80.33°E — KANPUR, IN</text>
    <circle cx="1076" cy="54" r="3.2" fill="${C.ok}" class="pf-pulse"/>
    <text x="1160" y="57" text-anchor="end" font-family="${MONO}" font-size="9.5" letter-spacing="1.4" fill="${C.muted}">AVAILABLE FOR WORK</text>
    <line x1="40" y1="76" x2="1160" y2="76" stroke="${C.hair}" stroke-width="1"/>
  </g>

  <!-- identity -->
  <g class="pf-rise" style="animation-delay:.15s">
    <text x="40" y="146" font-family="${MONO}" font-size="11" letter-spacing="2.6" fill="${C.muted}">SOFTWARE ENGINEER — FULL-STACK &amp; MACHINE INTELLIGENCE</text>
    <text x="38" y="208" font-family="${SANS}" font-size="58" font-weight="700" letter-spacing="-1.2" fill="${C.text}">Aditya Dixit</text>
    <rect x="40" y="232" width="2" height="16" fill="${C.accent}" class="pf-blink"/>
    ${roleMarkup}
    <text x="40" y="284" font-family="${SANS}" font-size="14" fill="${C.muted}">I design and ship production software — full-stack systems with rigorous auth,</text>
    <text x="40" y="305" font-family="${SANS}" font-size="14" fill="${C.muted}">payments and data layers, plus machine-intelligence features that hold up live.</text>
    ${metaMarkup}
  </g>

  <!-- systems panel: live radar scope -->
  <g class="pf-fade" style="animation-delay:.35s">
    <rect x="690" y="118" width="470" height="300" rx="10" fill="${C.panel}" stroke="#1d2b3d"/>
    <text x="714" y="146" font-family="${MONO}" font-size="10" letter-spacing="2" fill="${C.muted}">SYSTEM MAP</text>
    <text x="1136" y="146" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.4" fill="${C.faint}">FIG. 01 · LIVE</text>
    <line x1="690" y1="158" x2="1160" y2="158" stroke="${C.gridHi}"/>

    <circle cx="${ocx}" cy="${ocy}" r="${RR + 16}" fill="url(#radarGlow)"/>
    <g fill="none" stroke="#22374f" stroke-width="1">
      <circle cx="${ocx}" cy="${ocy}" r="${RR}" stroke="#325a80"/>
      <circle cx="${ocx}" cy="${ocy}" r="78" stroke-dasharray="2 6"/>
      <circle cx="${ocx}" cy="${ocy}" r="52"/>
      <circle cx="${ocx}" cy="${ocy}" r="26" stroke-dasharray="2 6"/>
    </g>
    <line x1="${ocx - RR}" y1="${ocy}" x2="${ocx + RR}" y2="${ocy}" stroke="#1c3450"/>
    <line x1="${ocx}" y1="${ocy - RR}" x2="${ocx}" y2="${ocy + RR}" stroke="#1c3450"/>
    <line x1="${(ocx - RR * 0.71).toFixed(1)}" y1="${(ocy - RR * 0.71).toFixed(1)}" x2="${(ocx + RR * 0.71).toFixed(1)}" y2="${(ocy + RR * 0.71).toFixed(1)}" stroke="#16283e"/>
    <line x1="${(ocx - RR * 0.71).toFixed(1)}" y1="${(ocy + RR * 0.71).toFixed(1)}" x2="${(ocx + RR * 0.71).toFixed(1)}" y2="${(ocy - RR * 0.71).toFixed(1)}" stroke="#16283e"/>
    ${radarTicks}

    <!-- rotating sweep with fading tail -->
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${ocx} ${ocy}" to="360 ${ocx} ${ocy}" dur="3.8s" repeatCount="indefinite"/>
      ${sweepSlices}
      <line x1="${ocx}" y1="${ocy}" x2="${ocx + RR}" y2="${ocy}" stroke="#9ed7ff" stroke-width="1.6"/>
      <circle cx="${ocx + RR}" cy="${ocy}" r="3" fill="#dcefff"/>
    </g>
    <!-- sonar pulse -->
    <circle cx="${ocx}" cy="${ocy}" r="6" fill="none" stroke="${C.accent}">
      <animate attributeName="r" values="6;${RR}" dur="3.8s" repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.5;0" dur="3.8s" repeatCount="indefinite"/>
    </circle>

    <!-- contacts -->
    ${blips}

    <!-- core -->
    <circle cx="${ocx}" cy="${ocy}" r="13" fill="none" stroke="#3a607f"/>
    <circle cx="${ocx}" cy="${ocy}" r="9" fill="none" stroke="${C.accent}" stroke-opacity="0.4" class="pf-pulse"/>
    <circle cx="${ocx}" cy="${ocy}" r="5.5" fill="url(#body)"/>

    <!-- orbiting bodies -->
    <g><animateTransform attributeName="transform" type="rotate" from="0 ${ocx} ${ocy}" to="360 ${ocx} ${ocy}" dur="6.5s" repeatCount="indefinite"/>
      <circle cx="${ocx + RR}" cy="${ocy}" r="2.6" fill="${C.accent}"/></g>
    <g><animateTransform attributeName="transform" type="rotate" from="360 ${ocx} ${ocy}" to="0 ${ocx} ${ocy}" dur="10s" repeatCount="indefinite"/>
      <circle cx="${ocx}" cy="${ocy - 52}" r="2.2" fill="${C.warm}"/></g>
    <g><animateTransform attributeName="transform" type="rotate" from="0 ${ocx} ${ocy}" to="360 ${ocx} ${ocy}" dur="4.2s" repeatCount="indefinite"/>
      <circle cx="${ocx + 26}" cy="${ocy}" r="1.8" fill="#a5f3fc"/></g>

    <!-- readouts -->
    <g font-family="${MONO}" font-size="8.5" letter-spacing="1.2">
      <text x="714" y="196" fill="${C.faint}">MODE</text><text x="714" y="212" fill="${C.text}">ACTIVE SCAN</text>
      <text x="714" y="244" fill="${C.faint}">AZIMUTH</text><text x="714" y="260" fill="${C.text}">000°</text>
      <text x="714" y="292" fill="${C.faint}">RANGE</text><text x="714" y="308" fill="${C.text}">104 NM</text>
      <text x="714" y="340" fill="${C.faint}">SWEEP</text><text x="714" y="356" fill="${C.accent}">3.8 S</text>
      <text x="1136" y="196" text-anchor="end" fill="${C.faint}">CONTACTS</text><text x="1136" y="212" text-anchor="end" fill="${C.text}">04</text>
      <text x="1136" y="244" text-anchor="end" fill="${C.faint}">STATUS</text><text x="1136" y="260" text-anchor="end" fill="${C.ok}">NOMINAL</text>
      <text x="1136" y="292" text-anchor="end" fill="${C.faint}">FRAME</text><text x="1136" y="308" text-anchor="end" fill="${C.text}">REF 01</text>
      <text x="1136" y="340" text-anchor="end" fill="${C.faint}">FEED</text><text x="1136" y="356" text-anchor="end" fill="${C.accent}">LIVE</text>
    </g>
    <circle cx="1126" cy="353" r="2.2" fill="${C.ok}"><animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/></circle>

    <!-- footer waveform -->
    <line x1="690" y1="378" x2="1160" y2="378" stroke="${C.gridHi}"/>
    <g transform="translate(714,390)">
      <path d="${wpath}" fill="none" stroke="${C.accent}" stroke-width="1" opacity="0.6" stroke-dasharray="7 5">
        <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.1s" repeatCount="indefinite"/>
      </path>
    </g>
  </g>

  <!-- telemetry band -->
  <g class="pf-rise" style="animation-delay:.6s">
    <rect x="40" y="440" width="1120" height="92" rx="10" fill="${C.panel}" stroke="#1d2b3d"/>
    <text x="40" y="432" font-family="${MONO}" font-size="9" letter-spacing="2" fill="${C.faint}">TELEMETRY</text>
    ${statsMarkup}
  </g>

  <g class="pf-fade" style="animation-delay:.9s">
    <line x1="40" y1="560" x2="1160" y2="560" stroke="${C.hair}" stroke-width="1"/>
    <text x="40" y="580" font-family="${MONO}" font-size="9" letter-spacing="1.6" fill="${C.faint}">ADITYA-DXT · PROFILE README</text>
    <text x="1160" y="580" text-anchor="end" font-family="${MONO}" font-size="9" letter-spacing="1.6" fill="${C.faint}">REV 2026.10 · GENERATED FROM SOURCE</text>
  </g>

  <!-- scan line -->
  <rect x="40" y="0" width="1120" height="1.5" fill="url(#ruleFade)" opacity="0">
    <animate attributeName="y" values="30;560;30" dur="14s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.5;0.5;0" dur="14s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

// ============================================================================
// SECTION HEADERS
// ============================================================================
const SECTIONS = [
  { id: 'profile', n: '01', title: 'PROFILE', desc: 'PURPOSE & OPERATING PRINCIPLES' },
  { id: 'education', n: '02', title: 'EDUCATION', desc: 'ACADEMIC FOUNDATIONS' },
  { id: 'systems', n: '03', title: 'TECHNICAL SYSTEMS', desc: 'LANGUAGES, FRAMEWORKS, INFRASTRUCTURE' },
  { id: 'intelligence', n: '04', title: 'MACHINE INTELLIGENCE', desc: 'APPLIED AI / ML CAPABILITY' },
  { id: 'work', n: '05', title: 'SELECTED WORK', desc: 'PRODUCTION SYSTEMS IN OPERATION' },
  { id: 'experience', n: '06', title: 'EXPERIENCE', desc: 'PROFESSIONAL ENGAGEMENTS & HACKATHONS' },
  { id: 'recognition', n: '07', title: 'RECOGNITION', desc: 'AWARDS & DISTINCTIONS' },
  { id: 'credentials', n: '08', title: 'CREDENTIALS', desc: 'CERTIFICATIONS & COURSEWORK' },
  { id: 'telemetry', n: '09', title: 'TELEMETRY', desc: 'ENGINEERING SIGNALS & ACTIVITY' },
  { id: 'contact', n: '10', title: 'CONTACT', desc: 'OPEN A CHANNEL' },
];

function sectionHeader({ n, title, desc, total = '10' }) {
  const w = 1200, h = 60;
  const ocx = 1120, ocy = 30;
  const arcs = [30, 22, 14].map((r) => `<circle cx="${ocx}" cy="${ocy}" r="${r}" fill="none" stroke="#16283e" stroke-width="1"/>`).join('');
  const dotX = 58 + desc.length * 9 + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
${defs()}
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <rect x="40" y="21" width="3" height="18" rx="1.5" fill="${C.accent}"/>
  <text x="58" y="39" font-family="${MONO}" font-size="11" letter-spacing="2.4" fill="${C.muted}">${esc(desc)}</text>
  <circle cx="${dotX}" cy="30" r="2.4" fill="${C.ok}" class="pf-pulse"/>
  ${arcs}
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 ${ocx} ${ocy}" to="360 ${ocx} ${ocy}" dur="16s" repeatCount="indefinite"/>
    <circle cx="${ocx + 30}" cy="${ocy}" r="2.2" fill="${C.accent}"/>
  </g>
  <line x1="40" y1="56" x2="1160" y2="56" stroke="${C.hair}" stroke-width="1"/>
  <rect x="0" y="55" width="150" height="2.5" fill="url(#ruleFade)" opacity="0.9">
    <animateTransform attributeName="transform" type="translate" values="40 0;1010 0;40 0" dur="11s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

// ============================================================================
// STAR BAND (constant-speed parallax depth field)
// ============================================================================
function band(seed) {
  const w = 1200, h = 132;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="starfield">
${defs()}
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  ${gridLayer(w, h)}
  <ellipse cx="380" cy="20" rx="420" ry="180" fill="url(#gCool)"/>
  <ellipse cx="900" cy="140" rx="420" ry="190" fill="url(#gWarm)"/>
  <g>${starfield(w, h, seed, [FIELD(80, 120), MID(34, 62), NEAR(12, 32)])}</g>
  <line x1="0" y1="0.5" x2="${w}" y2="0.5" stroke="${C.hair}" stroke-width="1"/>
  <line x1="0" y1="${h - 0.5}" x2="${w}" y2="${h - 0.5}" stroke="${C.hair}" stroke-width="1"/>
</svg>`;
}

// ============================================================================
// RULE / DIVIDER
// ============================================================================
function rule() {
  const w = 1200, h = 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="divider">
${defs()}
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <line x1="40" y1="14" x2="1160" y2="14" stroke="${C.hair}" stroke-width="1"/>
  <rect x="-240" y="13" width="240" height="2" fill="url(#ruleFade)">
    <animateTransform attributeName="transform" type="translate" values="-260 0;${w} 0" dur="7.5s" repeatCount="indefinite"/>
  </rect>
  <line x1="594" y1="8" x2="594" y2="20" stroke="${C.faint}" stroke-width="1"/>
  <line x1="588" y1="14" x2="600" y2="14" stroke="${C.faint}" stroke-width="1"/>
  <text x="40" y="17" font-family="${MONO}" font-size="8" letter-spacing="2" fill="${C.faint}">DATA</text>
  <text x="1160" y="17" text-anchor="end" font-family="${MONO}" font-size="8" letter-spacing="2" fill="${C.faint}">FLOW</text>
</svg>`;
}

// ============================================================================
// FOOTER
// ============================================================================
function footer() {
  const w = 1200, h = 280;
  // telemetry carrier waveform
  let d = '';
  for (let x = 0; x <= w; x += 4) {
    const env = 0.35 + 0.65 * Math.abs(Math.sin(x / 190));
    const y = 108 + (Math.sin(x / 26) * 9 + Math.sin(x / 11) * 3.2) * env;
    d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="footer">
${defs()}
  <rect width="${w}" height="${h}" fill="url(#vign)"/>
  ${gridLayer(w, h)}
  <ellipse cx="600" cy="70" rx="620" ry="150" fill="url(#gCool)"/>
  <ellipse cx="1040" cy="230" rx="360" ry="150" fill="url(#gWarm)"/>
  <g>${starfield(w, h, 777, [FIELD(60, 100), MID(24, 54)])}</g>

  <g class="pf-fade">
    <line x1="40" y1="30" x2="1160" y2="30" stroke="${C.hair}" stroke-width="1"/>
    <text x="40" y="20" font-family="${MONO}" font-size="9" letter-spacing="2" fill="${C.faint}">CARRIER SIGNAL</text>
    <text x="1160" y="20" text-anchor="end" font-family="${MONO}" font-size="9" letter-spacing="1.4" fill="${C.faint}">LIVE</text>
  </g>
  <path d="${d}" fill="none" stroke="${C.accent}" stroke-width="1.4" opacity="0.75"/>
  <circle r="3" fill="${C.accent}">
    <animateMotion dur="9s" repeatCount="indefinite" path="${d}"/>
  </circle>
  <circle r="7" fill="none" stroke="${C.accent}" stroke-opacity="0.3">
    <animateMotion dur="9s" repeatCount="indefinite" path="${d}"/>
  </circle>

  <g class="pf-fade" style="animation-delay:.2s">
    <text x="64" y="188" font-family="${SANS}" font-size="17" font-weight="700" letter-spacing="0.4" fill="${C.text}">Aditya Dixit</text>
    <text x="64" y="208" font-family="${MONO}" font-size="10" letter-spacing="1.4" fill="${C.faint}">FULL-STACK &amp; MACHINE-INTELLIGENCE ENGINEERING</text>
    <text x="1136" y="182" text-anchor="end" font-family="${MONO}" font-size="10.5" fill="${C.muted}">adityadxt1910@gmail.com</text>
    <text x="1136" y="199" text-anchor="end" font-family="${MONO}" font-size="10.5" fill="${C.muted}">github.com/Aditya-dxt</text>
    <text x="1136" y="216" text-anchor="end" font-family="${MONO}" font-size="10.5" fill="${C.muted}">linkedin.com/in/aditya-dixit-085862333</text>
  </g>
  <line x1="40" y1="242" x2="1160" y2="242" stroke="${C.hair}" stroke-width="1"/>
  <text x="40" y="262" font-family="${MONO}" font-size="9" letter-spacing="1.8" fill="${C.faint}">END OF TRANSMISSION</text>
  <text x="1160" y="262" text-anchor="end" font-family="${MONO}" font-size="9" letter-spacing="1.6" fill="${C.faint}">© 2026 · KANPUR, INDIA</text>
</svg>`;
}

// ============================================================================
// VARSHA-DRISHTI ARCHITECTURE SCHEMATIC
// ============================================================================
function varshadrishti() {
  const w = 1200, h = 430;
  const nodes = [
    ['INSAT-3DR · MOSDAC', 'satellite imager', '#4aa8ff'],
    ['TEMPORAL 3D-CNN', 'spatio-temporal model', '#4aa8ff'],
    ['RISK CLASSIFIER', '4-class output', '#4aa8ff'],
    ['GRAD-CAM', 'explainability layer', '#e8a33d'],
  ];
  const color = '#4aa8ff';
  const cardW = 240, cardH = 104, y = 96, xs = [60, 340, 620, 900];
  const cards = nodes.map(([t, s, c], i) => {
    const x = xs[i];
    return `<g>
      <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="9" fill="${C.panel}" stroke="#1d2b3d"/>
      <rect x="${x}" y="${y}" width="3" height="${cardH}" rx="1.5" fill="${c}"/>
      <text x="${x + 18}" y="${y + 30}" font-family="${MONO}" font-size="8.5" letter-spacing="1.6" fill="${C.faint}">STAGE 0${i + 1}</text>
      <text x="${x + 18}" y="${y + 58}" font-family="${SANS}" font-size="14.5" font-weight="700" fill="${C.text}">${esc(t)}</text>
      <text x="${x + 18}" y="${y + 80}" font-family="${MONO}" font-size="9.5" fill="${C.muted}">${esc(s)}</text>
    </g>`;
  }).join('');
  const arrows = [0, 1, 2].map((i) => {
    const x1 = xs[i] + cardW, x2 = xs[i + 1], ay = y + cardH / 2;
    return `<line x1="${x1 + 4}" y1="${ay}" x2="${x2 - 10}" y2="${ay}" stroke="${color}" stroke-width="1.4" stroke-dasharray="4 5" opacity="0.7">
      <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite"/>
    </line>
    <path d="M${x2 - 12},${ay - 4} L${x2 - 4},${ay} L${x2 - 12},${ay + 4}" fill="none" stroke="${color}" stroke-width="1.4" opacity="0.8"/>`;
  }).join('');
  // class distribution bars
  const classes = [['LOW', 46, '#4aa8ff'], ['MODERATE', 92, '#4aa8ff'], ['HIGH', 138, '#e8a33d'], ['CRITICAL', 74, '#e86a3d']];
  const bars = classes.map(([label, val, c], i) => {
    const bx = 150 + i * 250, by = 372;
    return `<g>
      <text x="${bx}" y="${by - 12}" font-family="${MONO}" font-size="9.5" letter-spacing="1" fill="${C.muted}">${label}</text>
      <rect x="${bx}" y="${by}" width="180" height="7" rx="3.5" fill="#101c2c"/>
      <rect x="${bx}" y="${by}" width="${val}" height="7" rx="3.5" fill="${c}">
        <animate attributeName="width" values="0;${val};${val}" dur="${2 + i * 0.3}s" fill="freeze"/>
      </rect>
      <text x="${bx + val + 8}" y="${by + 7}" font-family="${MONO}" font-size="9" fill="${C.faint}">${val}</text>
    </g>`;
  }).join('');
  const path = `M${xs[0] + cardW / 2},${y + cardH / 2} L${xs[3] + cardW / 2},${y + cardH / 2}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="VarshaDrishti architecture">
${defs()}
  <rect width="${w}" height="${h}" fill="${C.panel}" stroke="#1d2b3d" rx="10"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10" fill="none" stroke="#1d2b3d"/>
  <text x="34" y="42" font-family="${MONO}" font-size="10.5" letter-spacing="2" fill="${C.muted}">SYSTEM ARCHITECTURE</text>
  <text x="34" y="64" font-family="${SANS}" font-size="15" font-weight="700" fill="${C.text}">VarshaDrishti — rainfall-risk inference pipeline</text>
  <text x="${w - 34}" y="44" text-anchor="end" font-family="${MONO}" font-size="9.5" letter-spacing="1.2" fill="${C.faint}">SCHEMATIC · NOT A SCREENSHOT</text>
  <text x="${w - 34}" y="62" text-anchor="end" font-family="${MONO}" font-size="9.5" letter-spacing="1.2" fill="${C.faint}">TEAM PROJECT</text>
  <line x1="34" y1="76" x2="${w - 34}" y2="76" stroke="${C.gridHi}"/>
  ${cards}
  ${arrows}
  <circle r="3.2" fill="#c9e2ff">
    <animateMotion dur="3.4s" repeatCount="indefinite" path="${path}"/>
  </circle>
  <text x="60" y="252" font-family="${MONO}" font-size="9.5" letter-spacing="1.6" fill="${C.faint}">RISK DISTRIBUTION — MODEL OUTPUT</text>
  <line x1="60" y1="262" x2="${w - 60}" y2="262" stroke="${C.gridHi}"/>
  ${bars}
</svg>`;
}

// ---- write ------------------------------------------------------------------
const files = {
  'masthead.svg': masthead(),
  'band.svg': band(31415),
  'rule.svg': rule(),
  'proj-varshadrishti.svg': varshadrishti(),
  'footer.svg': footer(),
};
for (const s of SECTIONS) files[`sec-${s.id}.svg`] = sectionHeader(s);

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), content, 'utf8');
  console.log(`wrote ${name}  (${(content.length / 1024).toFixed(1)} KB)`);
}
console.log('\nDone -> ' + OUT);
