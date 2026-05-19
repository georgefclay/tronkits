// ─────────────────────────────────────────────────────────────
// Resistor calculator — the flagship utility, deep dive
// ─────────────────────────────────────────────────────────────

// Color codes (digit → band color & label)
const RESISTOR_COLORS = [
  { name: 'BLACK',  hex: '#1a1a1a', digit: 0, mult: 1,        tol: null,  pcc: null },
  { name: 'BROWN',  hex: '#7A4012', digit: 1, mult: 10,       tol: 1,     pcc: 100 },
  { name: 'RED',    hex: '#C9442C', digit: 2, mult: 100,      tol: 2,     pcc: 50  },
  { name: 'ORANGE', hex: '#E25C2C', digit: 3, mult: 1e3,      tol: null,  pcc: 15  },
  { name: 'YELLOW', hex: '#E5B043', digit: 4, mult: 1e4,      tol: null,  pcc: 25  },
  { name: 'GREEN',  hex: '#2D8F60', digit: 5, mult: 1e5,      tol: 0.5,   pcc: null },
  { name: 'BLUE',   hex: '#2E6DA4', digit: 6, mult: 1e6,      tol: 0.25,  pcc: 10  },
  { name: 'VIOLET', hex: '#6B47B8', digit: 7, mult: 1e7,      tol: 0.1,   pcc: 5   },
  { name: 'GREY',   hex: '#888888', digit: 8, mult: 1e8,      tol: 0.05,  pcc: null },
  { name: 'WHITE',  hex: '#F0EAD9', digit: 9, mult: 1e9,      tol: null,  pcc: null },
  { name: 'GOLD',   hex: '#C9A227', digit: null, mult: 0.1,   tol: 5,     pcc: null },
  { name: 'SILVER', hex: '#B8B8B8', digit: null, mult: 0.01,  tol: 10,    pcc: null },
];

function ResistorPage({ accent = TK.orange, density = 24 }) {
  // demo state — a 4-band 330Ω 5% resistor: orange, orange, brown, gold
  const [bands, setBands] = React.useState([3, 3, 1, 10]);
  const [mode, setMode] = React.useState(4); // 4, 5, or 6 band

  const d1 = RESISTOR_COLORS[bands[0]].digit;
  const d2 = RESISTOR_COLORS[bands[1]].digit;
  const d3 = mode >= 5 ? RESISTOR_COLORS[bands[2]].digit : 0;
  const multIdx = mode === 4 ? 2 : 3;
  const tolIdx = mode === 4 ? 3 : 4;
  const mult = RESISTOR_COLORS[bands[multIdx]].mult;
  const tol = RESISTOR_COLORS[bands[tolIdx]].tol;
  const baseValue = mode >= 5
    ? (d1 * 100 + d2 * 10 + d3) * mult
    : (d1 * 10 + d2) * mult;
  const fmt = (v) => {
    if (v >= 1e6) return (v / 1e6).toFixed(2).replace(/\.?0+$/, '') + ' MΩ';
    if (v >= 1e3) return (v / 1e3).toFixed(2).replace(/\.?0+$/, '') + ' kΩ';
    return v.toFixed(2).replace(/\.?0+$/, '') + ' Ω';
  };
  const minV = baseValue * (1 - (tol || 0) / 100);
  const maxV = baseValue * (1 + (tol || 0) / 100);

  return (
    <GraphPaper density={density} style={{ flex: 1, overflow: 'auto' }}>
      <TKNav current="utilities" accent={accent} />
      <ResistorHeader accent={accent} />
      <section style={{ padding: '0 56px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36 }}>
          <ResistorControls bands={bands} setBands={setBands} mode={mode} setMode={setMode} accent={accent} />
          <ResistorResult value={baseValue} tol={tol} fmt={fmt} minV={minV} maxV={maxV} accent={accent} bands={bands} mode={mode} />
        </div>

        <ResistorPreview bands={bands} mode={mode} accent={accent} />

        <ResistorEducation accent={accent} />
      </section>
      <TKFooter accent={accent} />
    </GraphPaper>
  );
}

function ResistorHeader({ accent }) {
  return (
    <section style={{ padding: '48px 56px 28px' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 14,
      }}>// HOME / TOOLBOX / RESISTOR COLOR CODE</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 64,
            fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: '-0.035em',
            color: TK.ink,
          }}>Resistor decoder.</h1>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 18,
            color: TK.inkSoft, marginTop: 12, marginBottom: 0, maxWidth: 600,
          }}>Pick band colors, get resistance. Or work backwards from a target value.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[4, 5, 6].map(b => (
            <button key={b} style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
              padding: '12px 18px', cursor: 'pointer',
              border: `1.5px solid ${TK.ink}`,
              background: TK.paper, color: TK.ink,
              boxShadow: `3px 3px 0 0 ${accent}`,
              letterSpacing: '0.08em',
            }}>{b}-BAND</button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResistorControls({ bands, setBands, mode, setMode, accent }) {
  const bandLabels = mode === 4
    ? ['BAND 1 · DIGIT', 'BAND 2 · DIGIT', 'BAND 3 · MULTIPLIER', 'BAND 4 · TOLERANCE']
    : mode === 5
    ? ['BAND 1 · DIGIT', 'BAND 2 · DIGIT', 'BAND 3 · DIGIT', 'BAND 4 · MULTIPLIER', 'BAND 5 · TOLERANCE']
    : ['BAND 1', 'BAND 2', 'BAND 3', 'MULTIPLIER', 'TOLERANCE', 'TEMPCO'];
  const nBands = mode;
  return (
    <div style={{
      background: TK.white, border: `1.5px solid ${TK.ink}`,
      boxShadow: `5px 5px 0 0 ${TK.ink}1A`, padding: 0,
    }}>
      <div style={{
        padding: '12px 18px', background: TK.ink, color: TK.paper,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        letterSpacing: '0.12em', display: 'flex', justifyContent: 'space-between',
      }}>
        <span>INPUT · COLOR BANDS</span>
        <span style={{ color: TK.yellow }}>4-BAND MODE</span>
      </div>
      <div style={{ padding: '20px 22px' }}>
        {Array.from({ length: nBands }).map((_, i) => (
          <ColorPicker
            key={i}
            label={bandLabels[i]}
            value={bands[i]}
            mode={mode}
            bandIdx={i}
            onChange={(v) => {
              const next = [...bands];
              next[i] = v;
              setBands(next);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange, mode, bandIdx }) {
  // For digit bands (first 2 or 3), only 0-9 colors allowed.
  // For mult band, all colors with mult allowed (most).
  // For tol band, only those with tol.
  const isDigit = (mode === 4 && bandIdx < 2) || (mode >= 5 && bandIdx < 3);
  const multBand = (mode === 4 && bandIdx === 2) || (mode >= 5 && bandIdx === 3);
  const tolBand = (mode === 4 && bandIdx === 3) || (mode >= 5 && bandIdx === 4);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        letterSpacing: '0.15em', color: TK.inkSoft, marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {RESISTOR_COLORS.map((c, idx) => {
          const valid = isDigit ? c.digit !== null : tolBand ? c.tol !== null : true;
          if (!valid) return null;
          const selected = idx === value;
          return (
            <button key={c.name} onClick={() => onChange(idx)} style={{
              width: 36, height: 36, padding: 0, cursor: 'pointer',
              background: c.hex, border: `2px solid ${selected ? TK.ink : 'transparent'}`,
              boxShadow: selected ? `2px 2px 0 0 ${TK.ink}` : `inset 0 0 0 1px ${TK.ink}33`,
              position: 'relative',
            }} title={c.name}>
              {selected && <span style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                color: '#fff', fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, fontWeight: 700,
                textShadow: '0 0 4px rgba(0,0,0,0.6)',
              }}>{c.digit ?? (c.tol ? `±${c.tol}` : c.mult >= 1 ? 'M' : '/')}</span>}
            </button>
          );
        })}
      </div>
      <div style={{
        marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft,
      }}>
        → {RESISTOR_COLORS[value].name}
        {isDigit && ` · digit ${RESISTOR_COLORS[value].digit}`}
        {multBand && ` · ×${RESISTOR_COLORS[value].mult.toExponential(0).replace('e+', 'e')}`}
        {tolBand && ` · ±${RESISTOR_COLORS[value].tol}%`}
      </div>
    </div>
  );
}

function ResistorResult({ value, tol, fmt, minV, maxV, accent, bands, mode }) {
  return (
    <div style={{
      background: TK.ink, color: TK.paper,
      border: `1.5px solid ${TK.ink}`,
      boxShadow: `5px 5px 0 0 ${accent}`,
      padding: 0, alignSelf: 'start',
      position: 'relative',
    }}>
      <div style={{
        padding: '12px 18px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        letterSpacing: '0.12em', color: TK.yellow,
        borderBottom: `1px solid ${TK.paper}22`,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>// COMPUTED · RESISTANCE</span>
        <span>↻ LIVE</span>
      </div>
      <div style={{ padding: '28px 24px 24px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: '#B8C2D0', letterSpacing: '0.1em', marginBottom: 4,
        }}>NOMINAL VALUE</div>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 56,
          fontWeight: 700, lineHeight: 1, color: TK.paper,
          letterSpacing: '-0.03em',
        }}>{fmt(value)}</div>
        <div style={{
          marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
          color: accent, fontWeight: 600,
        }}>± {tol || 0}% tolerance</div>

        <div style={{
          marginTop: 24, paddingTop: 18,
          borderTop: `1px dashed ${TK.paper}33`,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#B8C2D0', letterSpacing: '0.1em' }}>MIN</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 600 }}>{fmt(minV)}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#B8C2D0', letterSpacing: '0.1em' }}>MAX</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 600 }}>{fmt(maxV)}</div>
          </div>
        </div>

        <div style={{
          marginTop: 22, padding: '12px 14px',
          background: '#0c1828', border: `1px solid ${accent}55`,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          color: TK.paper, lineHeight: 1.6,
        }}>
          <span style={{ color: accent }}>$ </span>
          {bands.slice(0, mode === 4 ? 2 : 3).map(b => RESISTOR_COLORS[b].name.toLowerCase()).join(', ')}
          <br/>
          <span style={{ color: '#B8C2D0' }}>→ </span>
          {fmt(value)} ± {tol || 0}%
        </div>
      </div>
    </div>
  );
}

// The pictorial resistor preview at full-width
function ResistorPreview({ bands, mode, accent }) {
  const bandColors = bands.slice(0, mode).map(b => RESISTOR_COLORS[b].hex);
  return (
    <section style={{
      marginTop: 32,
      background: TK.white, border: `1.5px solid ${TK.ink}`,
      boxShadow: `5px 5px 0 0 ${TK.ink}1A`,
      padding: '32px 40px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 12, left: 12,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        letterSpacing: '0.15em', color: TK.inkSoft,
      }}>FIG. 02 · YOUR RESISTOR · 1:5</div>
      <div style={{ display: 'grid', placeItems: 'center', padding: '20px 0' }}>
        <svg viewBox="0 0 700 200" width="100%" style={{ maxWidth: 760 }}>
          {/* Leads */}
          <line x1="20" y1="100" x2="180" y2="100" stroke={TK.ink} strokeWidth="3" />
          <line x1="520" y1="100" x2="680" y2="100" stroke={TK.ink} strokeWidth="3" />
          {/* Body */}
          <rect x="180" y="60" width="340" height="80" rx="40" fill="#D9A36A" stroke={TK.ink} strokeWidth="2" />
          {/* Bands — distribute evenly across body */}
          {bandColors.map((c, i) => {
            const padding = mode === 4 ? 60 : 50;
            const usableW = 340 - padding * 2;
            const gap = mode === 4 ? 50 : mode === 5 ? 38 : 30;
            const bandW = 18;
            const start = 180 + padding;
            // Last band a bit further right (tolerance traditionally sits at end)
            const x = i === mode - 1
              ? 180 + 340 - padding - bandW
              : start + i * (bandW + gap);
            return (
              <g key={i}>
                <rect x={x} y="60" width={bandW} height="80" fill={c} />
                <line x1={x + bandW / 2} y1="50" x2={x + bandW / 2} y2="20" stroke={TK.inkSoft} strokeWidth="1" strokeDasharray="2 2" />
                <text x={x + bandW / 2} y="16" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.ink} fontWeight="700">B{i + 1}</text>
                <text x={x + bandW / 2} y={170} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={TK.inkSoft}>
                  {RESISTOR_COLORS[bands[i]].name}
                </text>
              </g>
            );
          })}
          {/* Dimension line at bottom */}
          <g>
            <line x1="180" y1="190" x2="520" y2="190" stroke={TK.ink} strokeWidth="1" />
            <path d="M 180 190 L 188 184 M 180 190 L 188 196" stroke={TK.ink} strokeWidth="1" />
            <path d="M 520 190 L 512 184 M 520 190 L 512 196" stroke={TK.ink} strokeWidth="1" />
            <text x="350" y="194" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.ink} style={{ background: TK.white }}>~ 9.5 mm</text>
          </g>
        </svg>
      </div>
    </section>
  );
}

function ResistorEducation({ accent }) {
  return (
    <section style={{ marginTop: 56 }}>
      <SectionHead n="04" kicker="Cheat sheet" title="How resistor color codes actually work" accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <EduCard num="01" title="Read left to right" desc="The end with bands packed closer is the start. The lone band at the other end is usually tolerance." accent={accent} />
        <EduCard num="02" title="Digits, then multiplier" desc="The first 2 (or 3) bands are digits 0-9. The next band is the multiplier — how many zeros to add." accent={accent} />
        <EduCard num="03" title="Last band is tolerance" desc="Gold = ±5%, silver = ±10%, brown = ±1%. Most modern resistors are 5% or 1%." accent={accent} />
      </div>

      {/* color table */}
      <div style={{
        marginTop: 36, background: TK.white,
        border: `1.5px solid ${TK.ink}`, overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 22px', background: TK.ink, color: TK.paper,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          letterSpacing: '0.15em', display: 'flex', justifyContent: 'space-between',
        }}>
          <span>// FULL COLOR TABLE</span>
          <span style={{ color: TK.yellow }}>REFERENCE</span>
        </div>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
        }}>
          <thead>
            <tr style={{ background: TK.paperDeep, borderBottom: `1.5px solid ${TK.ink}` }}>
              {['COLOR', 'DIGIT', 'MULTIPLIER', 'TOLERANCE', 'TEMPCO (ppm/K)'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 18px',
                  fontSize: 10, letterSpacing: '0.15em', color: TK.inkSoft, fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESISTOR_COLORS.map((c, i) => (
              <tr key={c.name} style={{ borderBottom: i < RESISTOR_COLORS.length - 1 ? `1px dashed ${TK.ink}30` : 'none' }}>
                <td style={{ padding: '10px 18px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 18, height: 18, background: c.hex, border: `1px solid ${TK.ink}` }} />
                    <span style={{ color: TK.ink, fontWeight: 600 }}>{c.name}</span>
                  </span>
                </td>
                <td style={{ padding: '10px 18px', color: TK.ink }}>{c.digit ?? '—'}</td>
                <td style={{ padding: '10px 18px', color: TK.ink }}>×{c.mult >= 1 ? c.mult.toExponential(0).replace('e+0', '').replace('e+', 'e') : c.mult}</td>
                <td style={{ padding: '10px 18px', color: c.tol ? accent : TK.inkFaint, fontWeight: c.tol ? 700 : 400 }}>{c.tol ? `±${c.tol}%` : '—'}</td>
                <td style={{ padding: '10px 18px', color: TK.inkSoft }}>{c.pcc ? `${c.pcc}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EduCard({ num, title, desc, accent }) {
  return (
    <div style={{
      background: TK.white, border: `1.5px dashed ${TK.ink}`,
      padding: '22px 24px', position: 'relative',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 38,
        fontWeight: 700, color: accent, lineHeight: 1,
        marginBottom: 10, letterSpacing: '-0.03em',
      }}>{num}</div>
      <h4 style={{
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 19,
        fontWeight: 700, margin: '0 0 6px', color: TK.ink, letterSpacing: '-0.01em',
      }}>{title}</h4>
      <p style={{
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
        lineHeight: 1.55, color: TK.inkSoft, margin: 0,
        textWrap: 'pretty',
      }}>{desc}</p>
    </div>
  );
}

Object.assign(window, { ResistorPage });
