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
  <radialGradient id="body" cx="0.38" cy="0.34" r="0.8">
    <stop offset="0" stop-color="#9ec5ff"/>
    <stop offset="0.5" stop-color="#2f6fd0"/>
    <stop offset="1" stop-color="#0d1c33"/>
  </radialGradient>
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

  // orbital schematic
  const ocx = 925, ocy = 292;
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * Math.PI * 2) / 36;
    const r1 = 105, r2 = i % 3 === 0 ? 114 : 110;
    return `<line x1="${(ocx + Math.cos(a) * r1).toFixed(1)}" y1="${(ocy + Math.sin(a) * r1).toFixed(1)}" x2="${(ocx + Math.cos(a) * r2).toFixed(1)}" y2="${(ocy + Math.sin(a) * r2).toFixed(1)}" stroke="#1b2f45" stroke-width="1" opacity="0.8"/>`;
  }).join('');

  const stats = [
    ['300+', 'DSA PROBLEMS'],
    ['7+', 'PROJECTS SHIPPED'],
    ['6×', 'HACKATHONS LED'],
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

  <!-- systems panel -->
  <g class="pf-fade" style="animation-delay:.35s">
    <rect x="690" y="118" width="470" height="300" rx="10" fill="${C.panel}" stroke="#1d2b3d"/>
    <text x="714" y="146" font-family="${MONO}" font-size="10" letter-spacing="2" fill="${C.muted}">SYSTEM MAP</text>
    <text x="1136" y="146" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.4" fill="${C.faint}">FIG. 01</text>
    <line x1="690" y1="158" x2="1160" y2="158" stroke="${C.gridHi}"/>

    <g stroke="#2f5478" stroke-width="1">
      <circle cx="${ocx}" cy="${ocy}" r="105" fill="none"/>
      <circle cx="${ocx}" cy="${ocy}" r="78" fill="none" stroke-dasharray="3 5"/>
      <circle cx="${ocx}" cy="${ocy}" r="52" fill="none"/>
    </g>
    <line x1="${ocx - 105}" y1="${ocy}" x2="${ocx + 105}" y2="${ocy}" stroke="#1c3450" stroke-width="1"/>
    <line x1="${ocx}" y1="${ocy - 105}" x2="${ocx}" y2="${ocy + 105}" stroke="#1c3450" stroke-width="1"/>
    ${ticks}
    <circle cx="${ocx}" cy="${ocy}" r="15" fill="none" stroke="#3a607f"/>
    <circle cx="${ocx}" cy="${ocy}" r="7" fill="url(#body)"/>
    <circle cx="${ocx - 22}" cy="${ocy - 22}" r="1.4" fill="${C.faint}"/>

    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${ocx} ${ocy}" to="360 ${ocx} ${ocy}" dur="30s" repeatCount="indefinite"/>
      <circle cx="${ocx + 105}" cy="${ocy}" r="3.4" fill="${C.accent}"/>
      <circle cx="${ocx + 105}" cy="${ocy}" r="8" fill="none" stroke="${C.accent}" stroke-opacity="0.35"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="360 ${ocx} ${ocy}" to="0 ${ocx} ${ocy}" dur="19s" repeatCount="indefinite"/>
      <circle cx="${ocx}" cy="${ocy - 52}" r="2.6" fill="${C.warm}"/>
    </g>
    <text x="${ocx + 116}" y="${ocy - 96}" font-family="${MONO}" font-size="8" fill="${C.muted}">r=105</text>
    <text x="${ocx - 128}" y="${ocy + 100}" font-family="${MONO}" font-size="8" fill="${C.muted}">REF FRAME 01</text>
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
  { id: 'recognition', n: '07', title: 'RECOGNITION', desc: 'AWARDS, CERTIFICATIONS & DISTINCTIONS' },
  { id: 'telemetry', n: '08', title: 'TELEMETRY', desc: 'ENGINEERING SIGNALS & ACTIVITY' },
  { id: 'contact', n: '09', title: 'CONTACT', desc: 'OPEN A CHANNEL' },
];

function sectionHeader({ n, title, desc, total = '09' }) {
  const w = 1200, h = 78;
  const titleWidth = title.length * 16.6;
  const descX = Math.round(92 + titleWidth + 20);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">
${defs()}
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <line x1="0" y1="0.5" x2="${w}" y2="0.5" stroke="${C.hair}" stroke-width="1"/>
  <rect x="40" y="20" width="34" height="34" rx="8" fill="${C.panel}" stroke="#1d2b3d"/>
  <text x="57" y="43" text-anchor="middle" font-family="${MONO}" font-size="12.5" font-weight="700" fill="${C.accent}">${n}</text>
  <text x="92" y="46" font-family="${SANS}" font-size="19" font-weight="700" letter-spacing="3.4" fill="${C.text}">${esc(title)}</text>
  <text x="${descX}" y="45" font-family="${MONO}" font-size="10.5" letter-spacing="1.2" fill="${C.muted}">— ${esc(desc)}</text>
  <text x="1160" y="45" text-anchor="end" font-family="${MONO}" font-size="10" letter-spacing="1.4" fill="${C.faint}">${n} / ${total}</text>
  <line x1="40" y1="72" x2="1160" y2="72" stroke="${C.hair}" stroke-width="1"/>
  <rect x="40" y="70" width="58" height="2" fill="${C.accent}"/>
  <rect x="98" y="70" width="22" height="2" fill="${C.accent}" opacity="0.4"/>
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

// ---- write ------------------------------------------------------------------
const files = {
  'masthead.svg': masthead(),
  'band.svg': band(31415),
  'rule.svg': rule(),
  'footer.svg': footer(),
};
for (const s of SECTIONS) files[`sec-${s.id}.svg`] = sectionHeader(s);

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), content, 'utf8');
  console.log(`wrote ${name}  (${(content.length / 1024).toFixed(1)} KB)`);
}
console.log('\nDone -> ' + OUT);
