// ─────────────────────────────────────────────────────────────
// Tutorials index page
// ─────────────────────────────────────────────────────────────

function TutorialsPage({ accent = TK.orange, density = 24 }) {
  return (
    <GraphPaper density={density} style={{ flex: 1, overflow: 'auto' }}>
      <TKNav current="tutorials" accent={accent} />
      <TutorialsHero accent={accent} />
      <TutorialsList accent={accent} />
      <TKFooter accent={accent} />
    </GraphPaper>
  );
}

function TutorialsHero({ accent }) {
  return (
    <section style={{ padding: '56px 56px 32px' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 18,
      }}>// HOME / TUTORIALS</div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 76,
            fontWeight: 700, margin: 0, lineHeight: 0.96,
            letterSpacing: '-0.035em', color: TK.ink,
          }}>
            Tutorials.<br/>
            <span style={{ color: TK.inkSoft, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Read once, ship forever.
            </span>
          </h1>
        </div>
        <Stamp text="SHELF · 01 · 2026" color={accent} rotate={-6} size={88} />
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        border: `1.5px solid ${TK.ink}`, background: TK.white,
        padding: '0 0 0 0', marginTop: 12,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '14px 20px', borderRight: `1.5px solid ${TK.ink}`,
        }}>FILTER</div>
        {['All', 'OpenSCAD', 'Raspberry Pi', 'Electronics', 'Linux'].map((f, i) => (
          <button key={f} style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '14px 20px',
            border: 'none', cursor: 'pointer',
            background: i === 0 ? TK.ink : 'transparent',
            color: i === 0 ? TK.paper : TK.ink,
            borderRight: i < 4 ? `1px dashed ${TK.ink}55` : 'none',
          }}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          padding: '14px 20px', borderLeft: `1.5px solid ${TK.ink}`,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: TK.inkSoft,
        }}>
          <span style={{ marginRight: 8 }}>🔍</span>
          <span>search...</span>
        </div>
      </div>
    </section>
  );
}

function TutorialsList({ accent }) {
  const tutorials = [
    { num: '01', cat: 'OPENSCAD', catColor: accent, title: 'Build a parametric box', desc: 'The hello-world of OpenSCAD. Walls, lids, and a couple of variables you can poke.', steps: 6, mins: 15, difficulty: 1, visual: 'box', date: '2026-04-18' },
    { num: '02', cat: 'OPENSCAD', catColor: accent, title: 'Rounded corners with offset()', desc: 'Two-pass offset trick: expand then contract. Cleaner than minkowski(), no slow renders.', steps: 4, mins: 12, difficulty: 1, visual: 'rounded', date: '2026-04-21' },
    { num: '03', cat: 'RASPBERRY PI', catColor: TK.green, title: 'Pi → Node → Nginx, end to end', desc: 'From SD-card image to public website. Includes the firewall bits people forget.', steps: 11, mins: 45, difficulty: 3, visual: 'pi', date: '2026-04-04' },
    { num: '04', cat: 'ELECTRONICS', catColor: TK.blue, title: 'Blink an LED, properly', desc: 'Why you need a resistor. How to pick one. And why your LED keeps dying when you forget.', steps: 4, mins: 10, difficulty: 1, visual: 'led', date: '2026-03-22' },
    { num: '05', cat: 'ELECTRONICS', catColor: TK.blue, title: 'Your first breadboard project', desc: 'How rails work, where to put the chip, and the five mistakes everyone makes on day one.', steps: 7, mins: 20, difficulty: 1, visual: 'breadboard', date: '2026-03-08' },
    { num: '06', cat: 'LINUX', catColor: TK.violet, title: 'A nice systemd service for your script', desc: "Stop using nohup. Real services restart cleanly and log where you'd expect.", steps: 5, mins: 18, difficulty: 2, visual: 'terminal', date: '2026-02-26' },
  ];
  return (
    <section style={{ padding: '12px 56px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
        {tutorials.map(t => <TutorialRow key={t.num} t={t} accent={accent} />)}
      </div>
    </section>
  );
}

function TutorialRow({ t, accent }) {
  const stars = '★★★'.slice(0, t.difficulty) + '☆☆☆'.slice(0, 3 - t.difficulty);
  return (
    <article style={{
      display: 'grid', gridTemplateColumns: '160px 1fr',
      gap: 0,
      background: TK.white,
      border: `1.5px solid ${TK.ink}`,
      boxShadow: `5px 5px 0 0 ${TK.ink}1A`,
    }}>
      {/* visual */}
      <div style={{
        background: TK.paperDeep, borderRight: `1.5px solid ${TK.ink}`,
        display: 'grid', placeItems: 'center', position: 'relative',
        padding: 14,
      }}>
        <GraphPaper density={12} style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <TutVisual kind={t.visual} accent={accent} />
          </div>
        </GraphPaper>
        <div style={{
          position: 'absolute', top: 6, left: 6,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: TK.ink, fontWeight: 700, letterSpacing: '0.08em',
          background: TK.paper, padding: '2px 6px',
          border: `1px solid ${TK.ink}`,
        }}>#{t.num}</div>
      </div>
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <TKTag color={t.catColor}>{t.cat}</TKTag>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: TK.inkFaint }}>
            {t.date}
          </span>
        </div>
        <h3 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 21,
          fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em',
          color: TK.ink, textWrap: 'pretty',
        }}>{t.title}</h3>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
          lineHeight: 1.5, color: TK.inkSoft, margin: '0 0 14px',
          textWrap: 'pretty',
        }}>{t.desc}</p>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 10, borderTop: `1px dashed ${TK.ink}40`,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: TK.inkSoft, letterSpacing: '0.06em',
        }}>
          <span>{t.steps} STEPS · ~{t.mins} MIN · <span style={{ color: t.catColor, fontWeight: 700 }}>{stars}</span></span>
          <span style={{ color: TK.ink, fontWeight: 700 }}>READ →</span>
        </div>
      </div>
    </article>
  );
}

function TutVisual({ kind, accent }) {
  if (kind === 'box' || kind === 'rounded') {
    const r = kind === 'rounded' ? 12 : 0;
    return (
      <svg width="110" height="80" viewBox="0 0 110 80">
        <g stroke={TK.ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
          <path d={`M 20 50 L 55 32 L 90 50 L 90 70 L 55 88 L 20 70 Z`.replace(/88/g,'70').replace(/50 L 55/, '50 L 55').replace(/Z/, ' L 20 50 Z')} fill={TK.paperDeep} />
          <rect x="20" y="30" width="70" height="40" rx={r} fill={TK.paperDeep} />
          <line x1="20" y1="42" x2="90" y2="42" strokeDasharray="2 2" />
        </g>
      </svg>
    );
  }
  if (kind === 'pi') {
    return <CardVisual kind="pi" accent={accent} />;
  }
  if (kind === 'led') {
    return <CardVisual kind="led" accent={accent} />;
  }
  if (kind === 'breadboard') {
    return (
      <svg width="120" height="90" viewBox="0 0 120 90">
        <rect x="6" y="10" width="108" height="70" rx="4" fill="#F5EBD0" stroke={TK.ink} strokeWidth="1.5" />
        <line x1="6" y1="22" x2="114" y2="22" stroke={TK.red} strokeWidth="0.8" />
        <line x1="6" y1="68" x2="114" y2="68" stroke={TK.blue} strokeWidth="0.8" />
        {Array.from({ length: 12 }).map((_, c) => (
          <g key={c}>
            {Array.from({ length: 5 }).map((_, r) => (
              <rect key={r} x={12 + c * 8} y={28 + r * 6} width="3" height="3" fill={TK.ink} opacity="0.7" />
            ))}
          </g>
        ))}
        <line x1="60" y1="48" x2="60" y2="50" stroke={TK.ink} strokeWidth="0.5" />
      </svg>
    );
  }
  if (kind === 'terminal') {
    return (
      <svg width="120" height="90" viewBox="0 0 120 90">
        <rect x="6" y="10" width="108" height="70" rx="2" fill={TK.ink} stroke={TK.ink} strokeWidth="1.5" />
        <rect x="6" y="10" width="108" height="14" fill="#0c1828" />
        <circle cx="13" cy="17" r="2" fill={TK.red} />
        <circle cx="20" cy="17" r="2" fill={TK.yellow} />
        <circle cx="27" cy="17" r="2" fill={TK.green} />
        <text x="12" y="36" fontFamily="JetBrains Mono, monospace" fontSize="7" fill={TK.green}>$ systemctl status</text>
        <text x="12" y="48" fontFamily="JetBrains Mono, monospace" fontSize="7" fill={TK.paper}>● tronkits.service</text>
        <text x="12" y="60" fontFamily="JetBrains Mono, monospace" fontSize="7" fill={accent}>  active (running)</text>
        <text x="12" y="72" fontFamily="JetBrains Mono, monospace" fontSize="7" fill={TK.paper}>$ _</text>
      </svg>
    );
  }
  return null;
}

Object.assign(window, { TutorialsPage });
