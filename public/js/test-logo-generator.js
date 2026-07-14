/* Headless check for the logo generator.
 *
 *   npm run test:logo          (needs the opentype.js devDependency)
 *
 * Across every font x shape x layout x style x rule-combination x sample text:
 *   - the artboard is finite and sane
 *   - no NaN / Infinity leaks into the geometry
 *   - the exported SVG has NO font reference — every glyph is a real <path>
 *   - for the "inside" layout, the shape genuinely contains the text: we test every
 *     actual glyph vertex against the real shape (point-in-polygon / in-circle /
 *     in-rounded-rect), not bounding boxes, which would happily pass a hexagon that
 *     clips its own corners.
 */
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const TK = require('./logo-generator.js');

const FONT_DIR = path.join(__dirname, '..', 'fonts');

// every family x every weight it actually ships
const CUTS = [];
for (const [family, meta] of Object.entries(TK.FONTS)) {
  for (const weight of Object.keys(meta.weights)) CUTS.push([family, Number(weight)]);
}

const fonts = {};
for (const [family, weight] of CUTS) {
  const file = TK.fontFile(family, weight);
  const buf = fs.readFileSync(path.join(FONT_DIR, path.basename(file)));
  fonts[family + '@' + weight] = opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  );
}

let checks = 0;
const failures = [];
const fail = (m) => failures.push(m);
const ok = () => checks++;
const EPS = 0.01;

function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > pt[1]) !== (yj > pt[1])) &&
        (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

/** Every glyph vertex in the emitted SVG, in artboard coordinates. */
function glyphPoints(svg) {
  const g = svg.match(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)">/);
  const tp = svg.match(/<path d="([^"]+)" fill="[^"]*" transform="translate\(([-\d.]+) ([-\d.]+)\)"/);
  if (!g || !tp) return null;
  const ox = parseFloat(g[1]), oy = parseFloat(g[2]);
  const tx = parseFloat(tp[2]), ty = parseFloat(tp[3]);
  const pts = [];
  for (const cmd of (tp[1].match(/[MLCQZ][^MLCQZ]*/g) || [])) {
    const v = (cmd.slice(1).match(/-?[\d.]+/g) || []).map(Number);
    for (let i = 0; i + 1 < v.length; i += 2) pts.push([v[i] + tx + ox, v[i + 1] + ty + oy]);
  }
  return pts;
}

/** A predicate for "is this artboard point inside the drawn shape?" */
function shapeContains(svg) {
  const g = svg.match(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)">/);
  const ox = parseFloat(g[1]), oy = parseFloat(g[2]);

  const poly = svg.match(/<polygon points="([^"]+)"/);
  if (poly) {
    const P = poly[1].trim().split(/\s+/)
      .map((p) => p.split(',').map(Number))
      .map((p) => [p[0] + ox, p[1] + oy]);
    return (pt) => pointInPoly(pt, P);
  }

  const circ = svg.match(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([-\d.]+)"/);
  if (circ) {
    const cx = +circ[1] + ox, cy = +circ[2] + oy, r = +circ[3];
    return (pt) => Math.hypot(pt[0] - cx, pt[1] - cy) <= r + EPS;
  }

  const rect = svg.match(/<rect x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"(?:\s+rx="([-\d.]+)")?/);
  if (rect) {
    const x = +rect[1] + ox, y = +rect[2] + oy, w = +rect[3], h = +rect[4];
    const rx = rect[5] ? +rect[5] : 0;
    return (pt) => {
      if (pt[0] < x - EPS || pt[0] > x + w + EPS || pt[1] < y - EPS || pt[1] > y + h + EPS) return false;
      if (!rx) return true;
      const dx = Math.max(x + rx - pt[0], 0, pt[0] - (x + w - rx));
      const dy = Math.max(y + rx - pt[1], 0, pt[1] - (y + h - rx));
      return Math.hypot(dx, dy) <= rx + EPS;
    };
  }
  return null;
}

const TEXTS = [
  'TRONKITS', 'A', 'MM', 'gjpqy', 'Ω12',
  'Wide Company Name Ltd',
  'Illinois Widget Manufacturing Co',
  'WWWWWWWWWWWW'
];
const RULES = [[false, false], [true, false], [false, true], [true, true]];

for (const [font, weight] of CUTS) {
  for (const shape of TK.SHAPES) {
    for (const layout of TK.LAYOUTS) {
      for (const shapeStyle of ['fill', 'outline']) {
        for (const [rulesH, rulesV] of RULES) {
          for (const text of TEXTS) {
            const opts = { text, font, weight, layout, shape, shapeStyle, rulesH, rulesV, uppercase: false };
            const tag = `${font}@${weight}/${shape}/${layout}/${shapeStyle}/h${rulesH}v${rulesV}/"${text}"`;

            let out;
            try {
              out = TK.buildLogo(opts, fonts[font + '@' + weight]);
            } catch (e) {
              fail(`threw — ${tag} — ${e.message}`);
              continue;
            }

            if (!isFinite(out.width) || !isFinite(out.height) || out.width <= 0 || out.height <= 0) {
              fail(`bad artboard ${out.width}x${out.height} — ${tag}`);
            } else ok();

            if (/NaN|Infinity|undefined/.test(out.svg)) fail(`NaN/Infinity in geometry — ${tag}`);
            else ok();

            // the entire point of the tool: no font dependency in the exported file
            if (/font-family|font-size|<text/i.test(out.svg)) fail(`font reference leaked — ${tag}`);
            else ok();

            if (!/<path d="M/.test(out.svg)) fail(`no glyph path emitted — ${tag}`);
            else ok();

            if (out.width > 6000 || out.height > 6000) {
              fail(`artboard blew up ${Math.round(out.width)}x${Math.round(out.height)} — ${tag}`);
            } else ok();

            // true containment — no shape may ever clip a glyph
            if (layout === 'inside' && shape !== 'none') {
              const inside = shapeContains(out.svg);
              const pts = glyphPoints(out.svg);
              if (!inside || !pts) { fail(`could not parse geometry — ${tag}`); continue; }
              const escaped = pts.filter((p) => !inside(p));
              if (escaped.length) {
                fail(`shape clips text — ${tag} — ${escaped.length}/${pts.length} glyph points outside`);
              } else ok();
            }
          }
        }
      }
    }
  }
}

// bold must actually differ from regular — a silently-ignored weight would be worse
// than no weight control at all, so prove the two cuts produce different geometry
for (const family of Object.keys(TK.FONTS)) {
  if (!TK.hasBold(family)) continue;
  const reg = TK.buildLogo({ font: family, weight: 400, shape: 'none' }, fonts[family + '@400']);
  const bold = TK.buildLogo({ font: family, weight: 700, shape: 'none' }, fonts[family + '@700']);
  if (reg.svg === bold.svg) fail(`weight 400 and 700 render identically — ${family}`);
  else ok();
  if (bold.width <= reg.width) {
    fail(`bold is not wider than regular — ${family} (${reg.width} -> ${bold.width})`);
  } else ok();
}

const sample = TK.buildLogo({}, fonts['space-grotesk@700']);

console.log(`\n${checks} assertions passed, ${failures.length} failed`);
if (failures.length) {
  failures.slice(0, 25).forEach((f) => console.log('  FAIL ' + f));
  if (failures.length > 25) console.log(`  ...and ${failures.length - 25} more`);
  process.exit(1);
}
console.log(`Default logo artboard: ${Math.round(sample.width)} x ${Math.round(sample.height)}`);
