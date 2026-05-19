// ─────────────────────────────────────────────────────────────
// TronKits shell — browser frame, navbar, footer
// Light, blueprint-styled "browser" wrapper that matches the system
// ─────────────────────────────────────────────────────────────

function TKBrowserFrame({ url = 'tronkits.com', width = 1280, height = 920, children, currentPage = 'home' }) {
  return (
    <div style={{
      width, height,
      background: TK.paperDeep,
      border: `1px solid ${TK.ink}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'Space Grotesk, sans-serif',
      color: TK.ink,
    }}>
      {/* Browser chrome — light themed */}
      <div style={{
        height: 44, background: '#EFE7CC',
        borderBottom: `1px solid ${TK.ink}`,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', border: `1px solid ${TK.ink}`, background: TK.red }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', border: `1px solid ${TK.ink}`, background: TK.yellow }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', border: `1px solid ${TK.ink}`, background: TK.green }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 12, color: TK.inkSoft }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>←</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>→</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>↻</span>
        </div>
        <div style={{
          flex: 1, height: 26, background: TK.paper,
          border: `1px solid ${TK.ink}`,
          display: 'flex', alignItems: 'center', padding: '0 12px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          color: TK.inkSoft, marginLeft: 8, gap: 8,
        }}>
          <span style={{ color: TK.green }}>●</span>
          <span style={{ color: TK.inkFaint }}>https://</span>
          <span style={{ color: TK.ink }}>{url}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: TK.inkSoft }}>
          <span>★</span><span>⌄</span>
        </div>
      </div>

      {/* Actual page content */}
      <div style={{ flex: 1, overflow: 'hidden', background: TK.paper, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NavBar — site-wide top nav with TronKits wordmark + links
// ─────────────────────────────────────────────────────────────
function TKNav({ current = 'home', accent = TK.orange }) {
  const links = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'tutorials', label: 'Tutorials', path: '/tutorials' },
    { id: 'blog', label: 'Blog', path: '/blog' },
    { id: 'utilities', label: 'Utilities', path: '/utility' },
    { id: 'contact', label: 'Contact', path: '/contact' },
  ];
  return (
    <header style={{
      height: 84, padding: '0 56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1.5px solid ${TK.ink}`,
      background: TK.paper,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* corner crop marks for blueprint feel */}
      <svg style={{ position: 'absolute', left: 8, top: 8 }} width="14" height="14">
        <line x1="0" y1="0" x2="14" y2="0" stroke={TK.ink} strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="14" stroke={TK.ink} strokeWidth="1" />
      </svg>
      <svg style={{ position: 'absolute', right: 8, top: 8 }} width="14" height="14">
        <line x1="14" y1="0" x2="0" y2="0" stroke={TK.ink} strokeWidth="1" />
        <line x1="14" y1="0" x2="14" y2="14" stroke={TK.ink} strokeWidth="1" />
      </svg>

      <TronKitsMark size={26} accent={accent} />

      <nav style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {links.map((l, i) => (
          <a key={l.id} href="#" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13, fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: TK.ink,
            padding: '10px 18px',
            textDecoration: 'none',
            position: 'relative',
          }}>
            {current === l.id && (
              <span style={{
                position: 'absolute', left: 6, top: '50%',
                width: 5, height: 5, background: accent,
                transform: 'translateY(-50%)',
              }} />
            )}
            <span style={{ color: TK.inkFaint, marginRight: 8, fontWeight: 400 }}>0{i + 1}</span>
            <span style={{ textDecoration: current === l.id ? 'underline' : 'none', textUnderlineOffset: 4, textDecorationThickness: 2, textDecorationColor: accent }}>
              {l.label}
            </span>
          </a>
        ))}
        <TKButton size="sm" variant="accent" style={{ marginLeft: 14 }}>
          Start Learning →
        </TKButton>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer — circuit trace at top, copyright + sitemap below
// ─────────────────────────────────────────────────────────────
function TKFooter({ accent = TK.orange }) {
  return (
    <footer style={{
      background: TK.ink, color: TK.paper,
      padding: '40px 56px 28px',
      position: 'relative',
      borderTop: `1.5px solid ${TK.ink}`,
    }}>
      {/* Decorative circuit trace at top edge */}
      <svg width="100%" height="20" style={{ position: 'absolute', top: -10, left: 0 }}>
        <line x1="0" y1="10" x2="100%" y2="10" stroke={TK.ink} strokeWidth="1.5" />
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((p, i) => (
          <g key={i}>
            <circle cx={`${p * 100}%`} cy="10" r="4" fill={TK.paper} stroke={TK.ink} strokeWidth="1.5" />
          </g>
        ))}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <TronKitsMark size={24} color={TK.paper} accent={accent} />
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7, marginTop: 18, color: '#B8C2D0', maxWidth: 320 }}>
            A workbench for tinkerers. Tutorials, calculators &amp; field notes from the breadboard.
          </p>
        </div>
        <FooterCol title="Learn" items={['Tutorials', 'Blog', 'Glossary', 'Cheat sheets']} />
        <FooterCol title="Tools" items={['Resistor', '555 Timer', 'Voltage Divider', 'LED Resistor']} />
        <FooterCol title="More" items={['Contact', 'RSS', 'About', 'Newsletter']} />
      </div>
      <div style={{
        marginTop: 32, paddingTop: 16, borderTop: `1px dashed ${TK.paper}33`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: '#B8C2D0', letterSpacing: '0.05em',
      }}>
        <span>© 2026 TRONKITS · ALL RIGHTS RESERVED</span>
        <span>BUILT WITH SOLDER &amp; CURIOSITY · v2.0.1</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: TK.yellow, marginBottom: 14,
      }}>// {title}</div>
      {items.map((it, i) => (
        <a key={i} href="#" style={{
          display: 'block', padding: '4px 0',
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
          color: TK.paper, textDecoration: 'none',
        }}>{it}</a>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section heading — big number + label + h2
// ─────────────────────────────────────────────────────────────
function SectionHead({ n = '01', kicker = 'Section', title = 'Heading', accent = TK.orange, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, ...style }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 56, fontWeight: 700,
        color: accent, lineHeight: 1, letterSpacing: '-0.02em',
      }}>{n}</div>
      <div style={{ flex: 1, paddingBottom: 6 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: TK.inkSoft, marginBottom: 4,
        }}>// {kicker}</div>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 40, fontWeight: 700, margin: 0,
          letterSpacing: '-0.02em', color: TK.ink,
        }}>{title}</h2>
      </div>
      <div style={{ flexShrink: 0, paddingBottom: 12, borderBottom: `1.5px solid ${TK.ink}`, minWidth: 80 }} />
    </div>
  );
}

Object.assign(window, {
  TKBrowserFrame, TKNav, TKFooter, SectionHead,
});
