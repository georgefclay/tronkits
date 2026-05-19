// ─────────────────────────────────────────────────────────────
// Utilities index — "the toolbox drawer"
// ─────────────────────────────────────────────────────────────

function UtilitiesPage({ accent = TK.orange, density = 24 }) {
  return (
    <GraphPaper density={density} style={{ flex: 1, overflow: 'auto' }}>
      <TKNav current="utilities" accent={accent} />
      <UtilHero accent={accent} />
      <UtilGrid accent={accent} />
      <UtilFooterNote accent={accent} />
      <TKFooter accent={accent} />
    </GraphPaper>
  );
}

function UtilHero({ accent }) {
  return (
    <section style={{ padding: '56px 56px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40 }}>
      <div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 18,
        }}>// HOME / TOOLBOX</div>
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 76,
          fontWeight: 700, margin: 0, lineHeight: 0.96,
          letterSpacing: '-0.035em', color: TK.ink,
        }}>
          The toolbox.<br/>
          <span style={{ color: TK.inkSoft, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Six calculators that earn their drawer space.
          </span>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <Stamp text="OPEN-SOURCE · FREE · NO LOGIN" color={TK.green} rotate={-4} size={108} />
      </div>
    </section>
  );
}

function UtilGrid({ accent }) {
  const utils = [
    {
      name: 'Resistor Color Code',
      sub: '4 / 5 / 6 band decoder',
      desc: 'Pick band colors, get resistance, tolerance, and tempco. Reverse-lookup also works.',
      icon: 'resistor', color: accent, popular: true,
      meta: ['● BAND COLORS', '● TOLERANCE', '● TEMPCO'],
    },
    {
      name: '555 Timer Calculator',
      sub: 'Astable / Monostable',
      desc: 'Enter any three values, solve for the fourth. Duty cycle, frequency, and component values.',
      icon: 'ic', color: TK.violet,
      meta: ['● f, T, DUTY', '● R1, R2, C', '● ASTABLE/MONO'],
    },
    {
      name: 'Voltage Divider',
      sub: 'with load option',
      desc: 'Solve Vin, Vout, R1, R2 (and RL). Currents and power dissipation included.',
      icon: 'divider', color: TK.blue,
      meta: ['● Vin → Vout', '● LOAD-AWARE', '● POWER'],
    },
    {
      name: 'LED Series Resistor',
      sub: 'E-series rounding',
      desc: 'Resistor for 1 to N LEDs in series. Power rating suggestion baked in.',
      icon: 'led', color: TK.red,
      meta: ['● E12/E24/E96', '● POWER', '● MULTI-LED'],
    },
    {
      name: 'Passphrase Generator',
      sub: 'Length / exact / bulk',
      desc: 'Generate memorable passphrases with digits + symbols. One-click copy.',
      icon: 'lock', color: TK.green,
      meta: ['● MEMORABLE', '● + DIGITS', '● BULK MODE'],
    },
    {
      name: 'CSV Viewer',
      sub: 'Preview · filter · export',
      desc: 'Drop a CSV, preview rows, filter columns, export the slice you actually wanted.',
      icon: 'csv', color: TK.copper,
      meta: ['● DRAG & DROP', '● FILTER', '● RE-EXPORT'],
    },
  ];
  return (
    <section style={{ padding: '0 56px 56px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        {utils.map(u => <UtilCard key={u.name} u={u} accent={accent} />)}
      </div>
    </section>
  );
}

function UtilCard({ u, accent }) {
  return (
    <article style={{
      background: TK.white, border: `1.5px solid ${TK.ink}`,
      boxShadow: `5px 5px 0 0 ${TK.ink}1A`,
      display: 'grid', gridTemplateColumns: '120px 1fr',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* icon panel */}
      <div style={{
        background: TK.paperDeep, borderRight: `1.5px solid ${TK.ink}`,
        display: 'grid', placeItems: 'center', position: 'relative',
      }}>
        <GraphPaper density={12} style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <UtilIcon kind={u.icon} color={u.color} />
          </div>
        </GraphPaper>
      </div>
      <div style={{ padding: '22px 24px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h3 style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 22,
              fontWeight: 700, margin: '0 0 2px',
              letterSpacing: '-0.015em', color: TK.ink,
            }}>{u.name}</h3>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
              color: TK.inkSoft, letterSpacing: '0.04em',
            }}>{u.sub}</div>
          </div>
          {u.popular && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: u.color, fontWeight: 700, letterSpacing: '0.1em',
              padding: '4px 8px', border: `1px solid ${u.color}`,
              background: TK.paper,
            }}>★ POPULAR</span>
          )}
        </div>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
          lineHeight: 1.55, color: TK.inkSoft, margin: '12px 0 16px',
          textWrap: 'pretty',
        }}>{u.desc}</p>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 12, borderTop: `1px dashed ${TK.ink}40`,
        }}>
          <div style={{
            display: 'flex', gap: 12,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: TK.inkSoft, letterSpacing: '0.06em',
          }}>
            {u.meta.map((m, i) => <span key={i}>{m}</span>)}
          </div>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: u.color, fontWeight: 700, letterSpacing: '0.08em',
          }}>OPEN →</span>
        </div>
      </div>
    </article>
  );
}

function UtilFooterNote({ accent }) {
  return (
    <section style={{ padding: '0 56px 80px' }}>
      <div style={{
        background: TK.ink, color: TK.paper,
        padding: '32px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: TK.yellow, letterSpacing: '0.15em', marginBottom: 8,
          }}>// SUGGEST A TOOL</div>
          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 28,
            fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em',
            color: TK.paper,
          }}>Missing the calculator you reach for every day?</h3>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 15,
            color: '#B8C2D0', margin: 0, maxWidth: 580, textWrap: 'pretty',
          }}>Drop a note. If three people ask for the same thing, I build it.</p>
        </div>
        <TKButton variant="accent" style={{ flexShrink: 0 }}>Suggest a tool →</TKButton>
      </div>
    </section>
  );
}

Object.assign(window, { UtilitiesPage });
