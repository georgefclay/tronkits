// ─────────────────────────────────────────────────────────────
// TronKits design system — "Playful Blueprint"
// Graph paper, hand-drawn schematics, friendly mono.
// ─────────────────────────────────────────────────────────────

// Color tokens. Cream paper + ink navy + solder orange + LED green.
// Accent is intentionally a swatch the user can swap via Tweaks.
const TK = {
  paper:     '#F5EFDD',    // base cream paper
  paperDeep: '#EDE5CD',    // slightly darker for cards/wells
  paperEdge: '#E0D6B5',    // edge tint
  ink:       '#15263A',    // primary text — dark navy fineliner
  inkSoft:   '#4A5B72',    // secondary text
  inkFaint:  '#8A95A6',    // captions
  rule:      '#15263A',    // hard rules
  grid:      'rgba(46, 109, 164, 0.10)',   // blueprint cyan — every-5
  gridMinor: 'rgba(46, 109, 164, 0.04)',   // every-1
  orange:    '#E25C2C',    // solder iron / resistor body
  yellow:    '#E5B043',    // resistor band
  green:     '#2D8F60',    // LED green
  red:       '#C9442C',    // alarm red
  blue:      '#2E6DA4',    // blueprint cyan
  violet:    '#6B47B8',
  copper:    '#B87333',
  white:     '#FFFCF2',
};

// ─────────────────────────────────────────────────────────────
// GraphPaper — the cream background w/ grid
// ─────────────────────────────────────────────────────────────
function GraphPaper({ density = 24, children, style = {}, showAxis = false }) {
  const major = density;
  const bold = density * 5;
  // SVG pattern data URL — renders correctly in both real browsers and html-to-image.
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${bold}' height='${bold}'>
    <defs>
      <pattern id='minor' width='${major}' height='${major}' patternUnits='userSpaceOnUse'>
        <path d='M ${major} 0 L 0 0 0 ${major}' fill='none' stroke='rgb(46,109,164)' stroke-opacity='0.07' stroke-width='1'/>
      </pattern>
    </defs>
    <rect width='${bold}' height='${bold}' fill='url(%23minor)'/>
    <path d='M ${bold} 0 L 0 0 0 ${bold}' fill='none' stroke='rgb(46,109,164)' stroke-opacity='0.18' stroke-width='1'/>
  </svg>`;
  const url = `url("data:image/svg+xml;utf8,${svg.replace(/\n/g, '').replace(/\s+/g, ' ').replace(/#/g, '%23')}")`;
  return (
    <div style={{
      position: 'relative',
      background: TK.paper,
      backgroundImage: url,
      backgroundSize: `${bold}px ${bold}px`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RegMarks — corner registration / crop marks. Pure decoration.
// ─────────────────────────────────────────────────────────────
function RegMarks({ inset = 16, size = 14, color = TK.ink, opacity = 0.5 }) {
  const stroke = { stroke: color, strokeWidth: 1, fill: 'none', opacity };
  const corner = (x, y, sx, sy) => (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <line x1="0" y1="0" x2={size} y2="0" {...stroke} />
      <line x1="0" y1="0" x2="0" y2={size} {...stroke} />
    </g>
  );
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <g transform={`translate(${inset},${inset})`}>{corner(0, 0, 1, 1)}</g>
      <svg x="100%" y="0" overflow="visible">
        <g transform={`translate(-${inset},${inset})`}>{corner(0, 0, -1, 1)}</g>
      </svg>
      <svg x="0" y="100%" overflow="visible">
        <g transform={`translate(${inset},-${inset})`}>{corner(0, 0, 1, -1)}</g>
      </svg>
      <svg x="100%" y="100%" overflow="visible">
        <g transform={`translate(-${inset},-${inset})`}>{corner(0, 0, -1, -1)}</g>
      </svg>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Stamp — circular rotated stamp like "REV 01" or "DRAFT"
// ─────────────────────────────────────────────────────────────
function Stamp({ text = 'REV · 02 · 2026', color = TK.red, rotate = -8, size = 92, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}`,
      color,
      display: 'grid', placeItems: 'center',
      transform: `rotate(${rotate}deg)`,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.1em', textAlign: 'center',
      padding: 8, opacity: 0.85,
      boxShadow: `inset 0 0 0 1px ${color}33`,
      ...style,
    }}>{text}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pin — pushpin / thumbtack
// ─────────────────────────────────────────────────────────────
function Pin({ color = TK.red, size = 18, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <circle cx="12" cy="12" r="7" fill={color} />
      <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.5)" />
      <circle cx="12" cy="12" r="7" fill="none" stroke={TK.ink} strokeOpacity="0.3" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Tape — washi-tape strip
// ─────────────────────────────────────────────────────────────
function Tape({ width = 120, color = '#E5B04388', rotate = -3, style = {}, children }) {
  return (
    <div style={{
      width, height: 28, background: color,
      transform: `rotate(${rotate}deg)`,
      borderTop: '1px dashed rgba(0,0,0,0.15)',
      borderBottom: '1px dashed rgba(0,0,0,0.15)',
      display: 'grid', placeItems: 'center',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
      color: TK.ink, letterSpacing: '0.05em',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Annotation — number badge for blueprint callouts
// ─────────────────────────────────────────────────────────────
function Annotation({ n, color = TK.ink, size = 28, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${color}`, background: TK.paper,
      color, fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12, fontWeight: 700,
      display: 'grid', placeItems: 'center',
      ...style,
    }}>{n}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// DimensionLine — blueprint dimension line ↔ with label
// Horizontal only. Useful for hero stat callouts.
// ─────────────────────────────────────────────────────────────
function DimensionLine({ length = 240, label = '∞', color = TK.ink, style = {} }) {
  return (
    <div style={{ position: 'relative', width: length, height: 32, ...style }}>
      <svg width={length} height={32} style={{ position: 'absolute', inset: 0 }}>
        <line x1="0" y1="16" x2={length} y2="16" stroke={color} strokeWidth="1" />
        <path d={`M 0 16 L 8 10 M 0 16 L 8 22`} stroke={color} strokeWidth="1" fill="none" />
        <path d={`M ${length} 16 L ${length - 8} 10 M ${length} 16 L ${length - 8} 22`} stroke={color} strokeWidth="1" fill="none" />
        <line x1="0" y1="6" x2="0" y2="26" stroke={color} strokeWidth="1" />
        <line x1={length} y1="6" x2={length} y2="26" stroke={color} strokeWidth="1" />
      </svg>
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        background: TK.paper, padding: '0 8px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color, letterSpacing: '0.06em',
      }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Arrow — hand-drawn-ish arrow between two points (SVG)
// ─────────────────────────────────────────────────────────────
function HandArrow({ d, color = TK.ink, width = 1.5, style = {}, w = 200, h = 80 }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${w-12} ${h-12} L ${w-2} ${h-2} L ${w-14} ${h-4}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Resistor — schematic resistor (zigzag) with optional bands
// ─────────────────────────────────────────────────────────────
function Resistor({ width = 120, color = TK.ink, bands = null, style = {} }) {
  const h = 36;
  if (bands) {
    // Pictorial (cylinder + colored bands)
    return (
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={style}>
        <line x1="0" y1={h/2} x2={width*0.18} y2={h/2} stroke={color} strokeWidth="1.5" />
        <line x1={width*0.82} y1={h/2} x2={width} y2={h/2} stroke={color} strokeWidth="1.5" />
        <rect x={width*0.18} y={h*0.25} width={width*0.64} height={h*0.5} rx="6" fill="#D9A36A" stroke={color} strokeWidth="1.2" />
        {bands.map((b, i) => (
          <rect key={i} x={width*0.22 + i*(width*0.13)} y={h*0.26} width={width*0.06} height={h*0.48} fill={b} />
        ))}
      </svg>
    );
  }
  // Schematic zigzag
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={style}>
      <polyline
        points={`0,${h/2} ${width*0.2},${h/2} ${width*0.25},${h*0.25} ${width*0.32},${h*0.75} ${width*0.39},${h*0.25} ${width*0.46},${h*0.75} ${width*0.53},${h*0.25} ${width*0.6},${h*0.75} ${width*0.67},${h*0.25} ${width*0.74},${h*0.75} ${width*0.8},${h/2} ${width},${h/2}`}
        fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// LED — schematic LED
// ─────────────────────────────────────────────────────────────
function LED({ size = 36, color = TK.ink, lit = true, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={style}>
      <line x1="2" y1="18" x2="12" y2="18" stroke={color} strokeWidth="1.5" />
      <line x1="24" y1="18" x2="34" y2="18" stroke={color} strokeWidth="1.5" />
      <polygon points="12,8 12,28 24,18" fill={lit ? TK.orange : 'none'} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="24" y1="8" x2="24" y2="28" stroke={color} strokeWidth="1.5" />
      <path d="M 28 6 L 32 2 M 30 6 L 32 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 32 10 L 36 6 M 34 10 L 36 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Capacitor — schematic cap
// ─────────────────────────────────────────────────────────────
function Capacitor({ width = 60, color = TK.ink, style = {} }) {
  const h = 36;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={style}>
      <line x1="0" y1={h/2} x2={width*0.43} y2={h/2} stroke={color} strokeWidth="1.5" />
      <line x1={width*0.57} y1={h/2} x2={width} y2={h/2} stroke={color} strokeWidth="1.5" />
      <line x1={width*0.43} y1={h*0.2} x2={width*0.43} y2={h*0.8} stroke={color} strokeWidth="1.5" />
      <line x1={width*0.57} y1={h*0.2} x2={width*0.57} y2={h*0.8} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// IC chip — DIP package with pins
// ─────────────────────────────────────────────────────────────
function ChipDIP({ width = 200, label = 'NE555', pins = 8, color = TK.ink, style = {} }) {
  const h = 96;
  const sidePins = pins / 2;
  const pinW = (width - 24) / sidePins;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={style}>
      <rect x="12" y="14" width={width - 24} height={h - 28} rx="3" fill={TK.ink} stroke={color} />
      <circle cx="22" cy="22" r="2" fill={TK.paper} />
      <path d={`M ${width/2 - 8} 14 a 8 8 0 0 0 16 0`} fill="none" stroke={TK.paper} strokeWidth="1.2" />
      {Array.from({ length: sidePins }).map((_, i) => (
        <g key={`t${i}`}>
          <rect x={12 + i * pinW + pinW * 0.25} y="4" width={pinW * 0.5} height="14" fill={color} />
          <rect x={12 + i * pinW + pinW * 0.25} y={h - 18} width={pinW * 0.5} height="14" fill={color} />
        </g>
      ))}
      <text x={width/2} y={h/2 + 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.paper} letterSpacing="0.1em">{label}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Button — primary / ghost / link styles
// ─────────────────────────────────────────────────────────────
function TKButton({ children, variant = 'primary', size = 'md', style = {}, onClick }) {
  const base = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: size === 'sm' ? 12 : 13,
    fontWeight: 600,
    letterSpacing: '0.04em',
    padding: size === 'sm' ? '8px 14px' : '12px 22px',
    border: `1.5px solid ${TK.ink}`,
    borderRadius: 0,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    textTransform: 'uppercase',
    transition: 'transform 0.1s',
    position: 'relative',
  };
  const variants = {
    primary: { background: TK.ink, color: TK.paper, boxShadow: `4px 4px 0 0 ${TK.orange}` },
    accent:  { background: TK.orange, color: TK.paper, boxShadow: `4px 4px 0 0 ${TK.ink}`, borderColor: TK.ink },
    ghost:   { background: 'transparent', color: TK.ink, boxShadow: `4px 4px 0 0 ${TK.ink}22` },
    link:    { background: 'transparent', color: TK.ink, border: 'none', boxShadow: 'none', padding: 0, textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 4 },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Card — dashed-border blueprint card
// ─────────────────────────────────────────────────────────────
function TKCard({ children, style = {}, dashed = true, lift = true }) {
  return (
    <div style={{
      background: TK.white,
      border: dashed ? `1.5px dashed ${TK.ink}` : `1.5px solid ${TK.ink}`,
      padding: 24,
      position: 'relative',
      boxShadow: lift ? `5px 5px 0 0 ${TK.ink}1A` : 'none',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tag / pill — uppercase mono label in brackets
// ─────────────────────────────────────────────────────────────
function TKTag({ children, color = TK.ink, style = {} }) {
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11, fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color,
      padding: '4px 10px',
      border: `1px solid ${color}`,
      background: 'rgba(255,255,255,0.4)',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...style,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// CodeBlock — code w/ line numbers + filename header
// ─────────────────────────────────────────────────────────────
function CodeBlock({ code, lang = 'scad', file = null, style = {} }) {
  const lines = code.split('\n');
  return (
    <div style={{
      background: TK.ink,
      color: TK.paper,
      border: `1.5px solid ${TK.ink}`,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 13, lineHeight: 1.6,
      position: 'relative',
      ...style,
    }}>
      {file && (
        <div style={{
          background: '#0c1828', color: TK.paper,
          padding: '8px 14px', fontSize: 11, letterSpacing: '0.1em',
          borderBottom: `1px solid ${TK.orange}66`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>📄 {file}</span>
          <span style={{ color: TK.orange }}>· {lang.toUpperCase()} ·</span>
        </div>
      )}
      <div style={{ padding: '14px 0' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', whiteSpace: 'pre' }}>
            <span style={{ display: 'inline-block', width: 44, textAlign: 'right', paddingRight: 14, color: TK.inkFaint, userSelect: 'none' }}>{i + 1}</span>
            <span style={{ flex: 1 }}>{l || '\u00A0'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Wordmark — the TronKits logo
// "TronKits" with a circuit-trace underline + little component
// ─────────────────────────────────────────────────────────────
function TronKitsMark({ size = 24, color = TK.ink, accent = TK.orange, style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...style }}>
      {/* little IC chip mark */}
      <svg width={size * 1.1} height={size} viewBox="0 0 28 24">
        <rect x="4" y="4" width="20" height="16" rx="1.5" fill={color} />
        <circle cx="8" cy="8" r="1.2" fill={TK.paper} />
        <rect x="6" y="0" width="2" height="6" fill={color} />
        <rect x="13" y="0" width="2" height="6" fill={color} />
        <rect x="20" y="0" width="2" height="6" fill={color} />
        <rect x="6" y="18" width="2" height="6" fill={color} />
        <rect x="13" y="18" width="2" height="6" fill={color} />
        <rect x="20" y="18" width="2" height="6" fill={color} />
        <circle cx="22" cy="16" r="2" fill={accent} />
      </svg>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700, fontSize: size * 0.78,
        color, letterSpacing: '-0.02em',
      }}>
        Tron<span style={{ color: accent }}>/</span>Kits
      </span>
    </div>
  );
}

// Export everything to window so other JSX files can use them.
Object.assign(window, {
  TK,
  GraphPaper, RegMarks, Stamp, Pin, Tape, Annotation, DimensionLine, HandArrow,
  Resistor, LED, Capacitor, ChipDIP,
  TKButton, TKCard, TKTag, CodeBlock, TronKitsMark,
});
