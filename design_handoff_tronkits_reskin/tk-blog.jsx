// ─────────────────────────────────────────────────────────────
// Blog index — engineering notebook style listing
// ─────────────────────────────────────────────────────────────

function BlogPage({ accent = TK.orange, density = 24 }) {
  return (
    <GraphPaper density={density} style={{ flex: 1, overflow: 'auto' }}>
      <TKNav current="blog" accent={accent} />
      <BlogHero accent={accent} />
      <FeaturedPost accent={accent} />
      <BlogList accent={accent} />
      <TKFooter accent={accent} />
    </GraphPaper>
  );
}

function BlogHero({ accent }) {
  return (
    <section style={{ padding: '56px 56px 32px' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 18,
      }}>// HOME / FIELD NOTES</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40 }}>
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 76,
          fontWeight: 700, margin: 0, lineHeight: 0.96,
          letterSpacing: '-0.035em', color: TK.ink,
        }}>
          Field notes<br/>
          <span style={{ color: accent, fontStyle: 'italic', fontWeight: 600, fontSize: 56 }}>from the bench.</span>
        </h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: TK.inkSoft, letterSpacing: '0.12em', marginBottom: 6,
          }}>SCRATCH-PAD ENTRIES</div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 42,
            fontWeight: 700, color: TK.ink, lineHeight: 1,
          }}>23</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: TK.inkSoft, marginTop: 6,
          }}>↻ updated weekly-ish</div>
        </div>
      </div>
    </section>
  );
}

function FeaturedPost({ accent }) {
  return (
    <section style={{ padding: '0 56px 56px' }}>
      <article style={{
        background: TK.white, border: `1.5px solid ${TK.ink}`,
        boxShadow: `6px 6px 0 0 ${TK.ink}1A`,
        display: 'grid', gridTemplateColumns: '1.2fr 1fr',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '36px 40px 36px 40px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <TKTag color={accent}>● FEATURED</TKTag>
            <TKTag>BUILD LOG</TKTag>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: TK.inkSoft, letterSpacing: '0.06em', marginBottom: 12,
          }}>2026-05-12 · 8 MIN READ</div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 38,
            fontWeight: 700, margin: '0 0 16px',
            letterSpacing: '-0.02em', lineHeight: 1.05, color: TK.ink,
            textWrap: 'pretty',
          }}>
            Colocating a Raspberry Pi: lessons from a week of uptime
          </h2>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 16,
            lineHeight: 1.55, color: TK.inkSoft, margin: '0 0 24px',
            textWrap: 'pretty',
          }}>
            I shipped a Pi to a datacenter. Turns out the boring parts — power, static IP, the firewall config — are 90% of the work. Here's what I'd do differently next time.
          </p>
          <TKButton variant="accent">Read the full write-up →</TKButton>
        </div>
        <div style={{
          background: TK.ink, position: 'relative',
          display: 'grid', placeItems: 'center', minHeight: 320,
          padding: 32,
        }}>
          <svg viewBox="0 0 320 280" width="100%" style={{ maxWidth: 360 }}>
            {/* Network diagram */}
            <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.paper}>
              {/* Pi */}
              <rect x="20" y="120" width="80" height="50" rx="3" fill="#2D8F60" stroke={TK.paper} strokeWidth="1.5" />
              <text x="60" y="142" textAnchor="middle" fill={TK.ink} fontWeight="700">🥧 PI</text>
              <text x="60" y="158" textAnchor="middle" fill={TK.ink}>node + nginx</text>
              {/* nginx */}
              <rect x="140" y="60" width="80" height="30" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="180" y="80" textAnchor="middle" fill={accent}>NGINX :80</text>
              {/* node */}
              <rect x="140" y="180" width="80" height="30" fill="none" stroke={TK.yellow} strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="180" y="200" textAnchor="middle" fill={TK.yellow}>NODE :8080</text>
              {/* internet */}
              <circle cx="280" cy="140" r="26" fill="none" stroke={TK.paper} strokeWidth="1.5" />
              <text x="280" y="145" textAnchor="middle" fill={TK.paper}>WWW</text>
              {/* arrows */}
              <path d="M 100 140 L 140 80 M 100 150 L 140 195" stroke={TK.paper} strokeWidth="1" fill="none" markerEnd="url(#a)" />
              <path d="M 220 75 L 256 130" stroke={TK.paper} strokeWidth="1" fill="none" />
              <text x="240" y="100" fill={TK.paper}>:443</text>
              {/* labels */}
              <text x="60" y="195" textAnchor="middle" fill="#B8C2D0">eth0 static</text>
              <text x="60" y="210" textAnchor="middle" fill="#B8C2D0">154.9.0.34</text>
            </g>
          </svg>
        </div>
      </article>
    </section>
  );
}

function BlogList({ accent }) {
  const posts = [
    { date: '2026-04-29', tag: 'NOTES', tagC: TK.blue, title: 'Why my 3D-printed lid kept warping (and the fix)', desc: "Spoiler: it was the bed temperature, not the slicer settings. A small tale of an embarrassingly long debugging session.", read: 4, n: '02' },
    { date: '2026-04-14', tag: 'FIELD', tagC: TK.green, title: "A Saturday with the 555 — it's the duck tape of chips", desc: "I built four things with one chip in an afternoon: an LED blinker, a tone generator, a button debouncer, and a panic button. Worth your $0.30.", read: 6, n: '03' },
    { date: '2026-03-30', tag: 'BUILD', tagC: accent, title: "Soldering for total beginners: my honest first attempt", desc: "Sixty-seven cold joints later, I get it. Here's the gear I bought, what worked, and the mistakes you don't have to repeat.", read: 7, n: '04' },
    { date: '2026-03-12', tag: 'IDEAS', tagC: TK.violet, title: "Why I keep a paper notebook next to the keyboard", desc: "Schematics, pinouts, and 'wait what was that command?'. The 7-day rule for archiving paper notes that finally made it stick.", read: 5, n: '05' },
    { date: '2026-02-26', tag: 'NOTES', tagC: TK.blue, title: "systemd is good, actually — once it stops fighting you", desc: "After years of nohup, screen, and tmux abuse, I finally bothered to learn unit files. Three patterns that cover 90% of needs.", read: 8, n: '06' },
    { date: '2026-02-08', tag: 'FIELD', tagC: TK.green, title: "Resistor color codes: why I trust my eyes about 60%", desc: "I built a calculator because I kept misreading bands under warm light. Now I trust the calculator about 95%.", read: 3, n: '07' },
  ];
  return (
    <section style={{ padding: '0 56px 80px' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.15em',
        textTransform: 'uppercase', marginBottom: 18,
      }}>// ALL ENTRIES · CHRONOLOGICAL</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr',
        background: TK.white,
        border: `1.5px solid ${TK.ink}`,
        boxShadow: `5px 5px 0 0 ${TK.ink}1A`,
      }}>
        {posts.map((p, i) => (
          <a key={i} href="#" style={{
            display: 'grid',
            gridTemplateColumns: '70px 120px 140px 1fr 100px',
            gap: 24, padding: '22px 28px', alignItems: 'center',
            borderBottom: i < posts.length - 1 ? `1px dashed ${TK.ink}40` : 'none',
            textDecoration: 'none', color: TK.ink,
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
              color: accent, fontWeight: 700,
            }}>{p.n}</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
              color: TK.inkSoft, letterSpacing: '0.04em',
            }}>{p.date}</span>
            <TKTag color={p.tagC}>{p.tag}</TKTag>
            <div>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 19,
                fontWeight: 700, margin: '0 0 4px',
                letterSpacing: '-0.01em', textWrap: 'pretty',
              }}>{p.title}</h3>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
                lineHeight: 1.5, color: TK.inkSoft, margin: 0,
                textWrap: 'pretty',
              }}>{p.desc}</p>
            </div>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              color: TK.inkSoft, letterSpacing: '0.08em', textAlign: 'right',
            }}>{p.read} MIN →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { BlogPage });
