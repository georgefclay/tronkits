// ─────────────────────────────────────────────────────────────
// Home page — hero, featured tutorials, utilities, latest blog
// ─────────────────────────────────────────────────────────────

function HomePage({ accent = TK.orange, density = 24 }) {
  return (
    <GraphPaper density={density} style={{ flex: 1, overflow: 'auto' }}>
      <TKNav current="home" accent={accent} />
      <HomeHero accent={accent} />
      <FeaturedTutorialsSection accent={accent} />
      <UtilitiesPreview accent={accent} />
      <LatestPostsSection accent={accent} />
      <TKFooter accent={accent} />
    </GraphPaper>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero — friendly intro w/ schematic illustration
// ─────────────────────────────────────────────────────────────
function HomeHero({ accent }) {
  return (
    <section style={{ padding: '56px 56px 80px', position: 'relative' }}>
      {/* Top status strip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 36, fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        <span>// FILE · home.tron · last updated 2026-05-18</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, background: TK.green, borderRadius: '50%', boxShadow: `0 0 0 3px ${TK.green}33` }} />
          STATUS: SOLDERING_HOT
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
        {/* Left: copy */}
        <div style={{ position: 'relative' }}>
          <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
            <TKTag color={accent}>● Beginner-friendly</TKTag>
            <TKTag>Hands-on</TKTag>
            <TKTag>Pet projects</TKTag>
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 84, fontWeight: 700, lineHeight: 0.95,
            margin: 0, letterSpacing: '-0.04em',
            color: TK.ink,
          }}>
            Solder.<br/>
            <span style={{ color: accent }}>Sketch.</span><br/>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              Ship.
              <svg width="240" height="20" style={{ position: 'absolute', left: 0, bottom: -10 }}>
                <path d="M 4 14 Q 60 4 120 10 T 236 8" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 19, lineHeight: 1.55,
            color: TK.inkSoft, marginTop: 36, marginBottom: 36, maxWidth: 480,
          }}>
            A workbench for total beginners. Friendly tutorials in <strong style={{ color: TK.ink }}>OpenSCAD</strong>, Raspberry Pi, and basic electronics — plus the calculators you actually need on your bench.
          </p>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <TKButton variant="accent">Browse Tutorials →</TKButton>
            <TKButton variant="ghost">Open the toolbox</TKButton>
          </div>

          {/* Stats row */}
          <div style={{
            marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
            borderTop: `1.5px solid ${TK.ink}`,
            paddingTop: 18,
          }}>
            <HeroStat n="24" label="Tutorials" />
            <HeroStat n="06" label="Calculators" />
            <HeroStat n="∞" label="Side quests" />
          </div>
        </div>

        {/* Right: schematic illustration */}
        <HeroSchematic accent={accent} />
      </div>
    </section>
  );
}

function HeroStat({ n, label }) {
  return (
    <div style={{ position: 'relative', paddingRight: 24 }}>
      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 42, fontWeight: 700, lineHeight: 1,
        color: TK.ink, letterSpacing: '-0.03em',
      }}>{n}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: TK.inkSoft, marginTop: 6,
      }}>{label}</div>
    </div>
  );
}

// Big circuit illustration on the right side of hero
function HeroSchematic({ accent }) {
  return (
    <div style={{ position: 'relative', height: 480 }}>
      <svg viewBox="0 0 560 480" width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* Outer dashed frame */}
        <rect x="6" y="6" width="548" height="468" fill={TK.white} stroke={TK.ink} strokeWidth="1.5" strokeDasharray="6 4" />
        {/* Title strip top-right */}
        <g>
          <rect x="320" y="6" width="234" height="40" fill={TK.ink} />
          <text x="335" y="32" fontFamily="JetBrains Mono, monospace" fontSize="12" fill={TK.paper} letterSpacing="0.15em">SCHEMATIC · FIG. 01</text>
        </g>

        {/* Title block bottom */}
        <g transform="translate(6, 408)">
          <rect x="0" y="0" width="548" height="66" fill="none" stroke={TK.ink} strokeWidth="1.5" />
          <line x1="0" y1="22" x2="548" y2="22" stroke={TK.ink} strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="66" stroke={TK.ink} strokeWidth="1" />
          <line x1="380" y1="0" x2="380" y2="66" stroke={TK.ink} strokeWidth="1" />
          <text x="10" y="15" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={TK.inkSoft} letterSpacing="0.15em">PROJECT</text>
          <text x="10" y="44" fontFamily="Space Grotesk, sans-serif" fontSize="18" fill={TK.ink} fontWeight="600">Blink an LED</text>
          <text x="10" y="60" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>your first circuit</text>
          <text x="210" y="15" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={TK.inkSoft} letterSpacing="0.15em">DIFFICULTY</text>
          <text x="210" y="44" fontFamily="JetBrains Mono, monospace" fontSize="22" fill={accent} fontWeight="700">★ ☆ ☆</text>
          <text x="210" y="60" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>~ 10 min</text>
          <text x="390" y="15" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={TK.inkSoft} letterSpacing="0.15em">REV</text>
          <text x="390" y="44" fontFamily="Space Grotesk, sans-serif" fontSize="18" fill={TK.ink} fontWeight="600">02</text>
          <text x="390" y="60" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>2026-05-18</text>
        </g>

        {/* Actual circuit: battery → resistor → LED → back */}
        {/* Wires (paths) */}
        <g stroke={TK.ink} strokeWidth="2" fill="none">
          {/* top wire */}
          <path d="M 100 130 L 460 130" />
          {/* right wire down */}
          <path d="M 460 130 L 460 260" />
          {/* bottom wire */}
          <path d="M 460 320 L 460 360 L 100 360" />
          {/* left wire up */}
          <path d="M 100 360 L 100 130" />
        </g>

        {/* Battery on the left (vertical) */}
        <g transform="translate(80, 220)">
          <line x1="20" y1="-60" x2="20" y2="-30" stroke={TK.ink} strokeWidth="2" />
          <line x1="20" y1="30" x2="20" y2="60" stroke={TK.ink} strokeWidth="2" />
          {/* Long plate (positive) */}
          <line x1="0" y1="-30" x2="40" y2="-30" stroke={TK.ink} strokeWidth="3" />
          {/* short plate (negative) */}
          <line x1="8" y1="-12" x2="32" y2="-12" stroke={TK.ink} strokeWidth="2" />
          <line x1="0" y1="6" x2="40" y2="6" stroke={TK.ink} strokeWidth="3" />
          <line x1="8" y1="24" x2="32" y2="24" stroke={TK.ink} strokeWidth="2" />
          <text x="55" y="-22" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.ink}>+</text>
          <text x="55" y="14" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.ink}>−</text>
          <text x="-32" y="0" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>9V</text>
        </g>

        {/* Resistor on top wire */}
        <g transform="translate(230, 130)">
          <line x1="-60" y1="0" x2="-30" y2="0" stroke={TK.paper} strokeWidth="4" />
          <polyline points="-30,0 -22,-10 -14,10 -6,-10 2,10 10,-10 18,10 26,-10 30,0" fill="none" stroke={TK.ink} strokeWidth="2" strokeLinejoin="round" />
          <text x="-30" y="-22" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.ink}>R1</text>
          <text x="-30" y="36" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>330Ω</text>
        </g>

        {/* LED on right wire (vertical, triangle pointing down) */}
        <g transform="translate(460, 290)">
          {/* gap in wire */}
          <line x1="0" y1="-30" x2="0" y2="-22" stroke={TK.ink} strokeWidth="2" />
          <line x1="0" y1="22" x2="0" y2="30" stroke={TK.ink} strokeWidth="2" />
          {/* triangle */}
          <polygon points="-12,-22 12,-22 0,2" fill={accent} stroke={TK.ink} strokeWidth="2" strokeLinejoin="round" />
          {/* cathode line */}
          <line x1="-12" y1="2" x2="12" y2="2" stroke={TK.ink} strokeWidth="2" />
          {/* light rays */}
          <path d="M 14 -16 L 22 -22 M 16 -12 L 24 -16" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M 14 -8 L 24 -8 M 16 -4 L 24 -2" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <text x="20" y="22" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.ink}>LED1</text>
        </g>

        {/* Annotation callouts */}
        {/* "current flows ↻" near top */}
        <g>
          <path d="M 270 70 Q 280 50 320 60" fill="none" stroke={TK.inkSoft} strokeWidth="1" strokeDasharray="3 3" />
          <text x="200" y="60" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.inkSoft} fontStyle="italic">→ current flows here</text>
        </g>

        {/* Annotation: "← you change this" pointing at R1 */}
        <g>
          <path d="M 220 195 Q 215 160 230 145" fill="none" stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="220" cy="195" r="3" fill={accent} />
          <text x="160" y="220" fontFamily="Space Grotesk, sans-serif" fontSize="13" fill={accent} fontWeight="600" fontStyle="italic">tweak this</text>
          <text x="160" y="236" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>to dim the LED</text>
        </g>

        {/* Annotation: "this glows!" */}
        <g>
          <path d="M 420 280 Q 380 260 360 290" fill="none" stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="290" y="296" fontFamily="Space Grotesk, sans-serif" fontSize="13" fill={accent} fontWeight="600" fontStyle="italic">this glows 🎉</text>
        </g>
      </svg>

      {/* Stamp overlay */}
      <div style={{ position: 'absolute', top: 24, right: -20 }}>
        <Stamp text="WELCOME · BENCH · 2026" color={TK.green} rotate={8} size={104} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Featured tutorials section
// ─────────────────────────────────────────────────────────────
function FeaturedTutorialsSection({ accent }) {
  return (
    <section style={{ padding: '40px 56px 80px', position: 'relative' }}>
      <SectionHead n="01" kicker="Latest builds" title="Tutorials worth your weekend" accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
        <TutorialCard
          tag="OPENSCAD"
          tagColor={accent}
          title="Build a parametric box"
          desc="The hello-world of OpenSCAD. Walls, lids, and a couple of variables you can poke."
          steps={6}
          minutes={15}
          accent={accent}
          visual="box"
        />
        <TutorialCard
          tag="RASPBERRY PI"
          tagColor={TK.green}
          title="Pi → Node → Nginx, end to end"
          desc="From SD-card image to public website. Includes the firewall bits people forget."
          steps={11}
          minutes={45}
          accent={accent}
          visual="pi"
        />
        <TutorialCard
          tag="ELECTRONICS"
          tagColor={TK.blue}
          title="Blink an LED, properly"
          desc="Why you need a resistor. How to pick one. And why your LED keeps dying."
          steps={4}
          minutes={10}
          accent={accent}
          visual="led"
        />
      </div>
    </section>
  );
}

function TutorialCard({ tag, tagColor, title, desc, steps, minutes, accent, visual }) {
  return (
    <article style={{
      background: TK.white,
      border: `1.5px solid ${TK.ink}`,
      position: 'relative',
      boxShadow: `6px 6px 0 0 ${TK.ink}1A`,
    }}>
      {/* Visual top */}
      <div style={{ height: 180, background: TK.paperDeep, borderBottom: `1.5px solid ${TK.ink}`, position: 'relative', overflow: 'hidden' }}>
        <GraphPaper density={16} style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <CardVisual kind={visual} accent={accent} />
          </div>
        </GraphPaper>
        {/* corner ticks */}
        <svg style={{ position: 'absolute', left: 6, top: 6 }} width="10" height="10"><path d="M0 0 L 10 0 M 0 0 L 0 10" stroke={TK.ink} /></svg>
        <svg style={{ position: 'absolute', right: 6, top: 6 }} width="10" height="10"><path d="M10 0 L 0 0 M 10 0 L 10 10" stroke={TK.ink} /></svg>
      </div>
      <div style={{ padding: '22px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <TKTag color={tagColor}>{tag}</TKTag>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: TK.inkSoft, letterSpacing: '0.08em' }}>
            {steps} STEPS · ~{minutes} MIN
          </span>
        </div>
        <h3 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 22,
          fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em',
          textWrap: 'pretty', color: TK.ink,
        }}>{title}</h3>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
          lineHeight: 1.55, color: TK.inkSoft, margin: '0 0 20px',
          textWrap: 'pretty',
        }}>{desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: TK.ink, fontWeight: 600, letterSpacing: '0.06em' }}>
          <span>READ →</span>
        </div>
      </div>
    </article>
  );
}

// Tiny illustrations inside cards
function CardVisual({ kind, accent }) {
  if (kind === 'box') {
    return (
      <svg width="160" height="120" viewBox="0 0 160 120">
        {/* Isometric box */}
        <g stroke={TK.ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
          <path d="M 30 70 L 80 50 L 130 70 L 130 100 L 80 120 L 30 100 Z" fill={TK.paperDeep} />
          <path d="M 30 70 L 80 90 L 130 70 M 80 90 L 80 120" />
          <path d="M 50 60 L 100 40 L 150 60 L 150 90" fill={TK.paper} opacity="0.8" />
          <path d="M 30 70 L 50 60 M 130 70 L 150 60" strokeDasharray="3 2" />
        </g>
        <text x="80" y="20" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>w × l × h</text>
      </svg>
    );
  }
  if (kind === 'pi') {
    return (
      <svg width="160" height="120" viewBox="0 0 160 120">
        {/* PCB rectangle */}
        <rect x="20" y="25" width="120" height="80" rx="4" fill="#2D8F60" stroke={TK.ink} strokeWidth="1.5" />
        {/* SoC chip */}
        <rect x="60" y="50" width="40" height="40" fill={TK.ink} />
        <text x="80" y="74" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={TK.paper}>BCM</text>
        {/* GPIO pins */}
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={26 + i * 5.5} y="32" width="3" height="8" fill={TK.yellow} stroke={TK.ink} strokeWidth="0.5" />
        ))}
        {/* USB blocks */}
        <rect x="120" y="60" width="14" height="12" fill="#888" stroke={TK.ink} />
        <rect x="120" y="78" width="14" height="12" fill="#888" stroke={TK.ink} />
        {/* mounting holes */}
        <circle cx="28" cy="98" r="3" fill={TK.paper} stroke={TK.ink} />
        <circle cx="132" cy="98" r="3" fill={TK.paper} stroke={TK.ink} />
      </svg>
    );
  }
  if (kind === 'led') {
    return (
      <svg width="170" height="120" viewBox="0 0 170 120">
        {/* Wire */}
        <path d="M 20 60 L 50 60" stroke={TK.ink} strokeWidth="1.5" fill="none" />
        <path d="M 110 60 L 150 60" stroke={TK.ink} strokeWidth="1.5" fill="none" />
        {/* Resistor */}
        <polyline points="50,60 56,52 64,68 72,52 80,68 88,52 96,68 104,52 110,60" fill="none" stroke={TK.ink} strokeWidth="1.5" />
        <text x="80" y="44" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={TK.inkSoft}>R1</text>
        {/* LED on right */}
        <g transform="translate(150 60)">
          <polygon points="-2,-12 -2,12 14,0" fill={accent} stroke={TK.ink} strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="14" y1="-12" x2="14" y2="12" stroke={TK.ink} strokeWidth="1.5" />
          <path d="M 16 -10 L 22 -16 M 18 -6 L 24 -12 M 20 -2 L 26 -8" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <text x="85" y="100" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontStyle="italic" fontSize="13" fill={TK.inkSoft}>"hello, world."</text>
      </svg>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Utilities preview — pictographic grid
// ─────────────────────────────────────────────────────────────
function UtilitiesPreview({ accent }) {
  const utils = [
    { name: 'Resistor', sub: '4·5·6 band decoder', icon: 'resistor', color: accent },
    { name: '555 Timer', sub: 'Astable / Monostable', icon: 'ic', color: TK.violet },
    { name: 'Voltage Divider', sub: 'with load option', icon: 'divider', color: TK.blue },
    { name: 'LED Resistor', sub: 'E-series rounding', icon: 'led', color: TK.red },
    { name: 'Passphrase', sub: 'Memorable + secure', icon: 'lock', color: TK.green },
    { name: 'CSV Viewer', sub: 'Preview · filter · export', icon: 'csv', color: TK.copper },
  ];
  return (
    <section style={{
      padding: '40px 56px 80px',
      background: TK.paperDeep,
      borderTop: `1.5px solid ${TK.ink}`,
      borderBottom: `1.5px solid ${TK.ink}`,
    }}>
      <SectionHead n="02" kicker="The toolbox" title="Calculators that earn their drawer space" accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {utils.map((u, i) => (
          <UtilTile key={u.name} util={u} idx={i} accent={accent} />
        ))}
      </div>
    </section>
  );
}

function UtilTile({ util, idx, accent }) {
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  return (
    <div style={{
      padding: '32px 28px',
      borderLeft: col === 0 ? `1.5px solid ${TK.ink}` : 'none',
      borderRight: `1.5px solid ${TK.ink}`,
      borderTop: row === 0 ? `1.5px solid ${TK.ink}` : 'none',
      borderBottom: `1.5px solid ${TK.ink}`,
      background: TK.white,
      position: 'relative',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <UtilIcon kind={util.icon} color={util.color} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: TK.inkFaint, letterSpacing: '0.1em',
        }}>0{idx + 1}</span>
      </div>
      <h3 style={{
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 22,
        fontWeight: 700, margin: '0 0 4px', color: TK.ink, letterSpacing: '-0.01em',
      }}>{util.name}</h3>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
        color: TK.inkSoft, letterSpacing: '0.04em',
      }}>{util.sub}</div>
      <div style={{
        marginTop: 18,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: util.color, fontWeight: 700, letterSpacing: '0.1em',
      }}>OPEN TOOL →</div>
    </div>
  );
}

function UtilIcon({ kind, color }) {
  const s = 56;
  if (kind === 'resistor') return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <line x1="2" y1="28" x2="12" y2="28" stroke={TK.ink} strokeWidth="2" />
      <line x1="44" y1="28" x2="54" y2="28" stroke={TK.ink} strokeWidth="2" />
      <rect x="12" y="20" width="32" height="16" rx="4" fill="#D9A36A" stroke={TK.ink} strokeWidth="1.5" />
      <rect x="16" y="20" width="3" height="16" fill={TK.red} />
      <rect x="22" y="20" width="3" height="16" fill={color} />
      <rect x="28" y="20" width="3" height="16" fill={TK.yellow} />
      <rect x="36" y="20" width="3" height="16" fill={TK.copper} />
    </svg>
  );
  if (kind === 'ic') return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <rect x="14" y="14" width="28" height="28" fill={TK.ink} />
      <circle cx="19" cy="19" r="1.5" fill={TK.paper} />
      <path d="M 24 14 a 4 4 0 0 0 8 0" fill="none" stroke={TK.paper} strokeWidth="1" />
      {[18, 24, 30, 36].map((y, i) => (
        <g key={i}>
          <rect x="8" y={y - 2} width="6" height="4" fill={TK.ink} />
          <rect x="42" y={y - 2} width="6" height="4" fill={TK.ink} />
        </g>
      ))}
      <text x="28" y="32" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill={color} fontWeight="700">555</text>
    </svg>
  );
  if (kind === 'divider') return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <line x1="28" y1="4" x2="28" y2="14" stroke={TK.ink} strokeWidth="2" />
      <polyline points="28,14 24,18 32,22 24,26 28,30" fill="none" stroke={TK.ink} strokeWidth="2" strokeLinejoin="round" />
      <polyline points="28,30 24,34 32,38 24,42 28,46" fill="none" stroke={TK.ink} strokeWidth="2" strokeLinejoin="round" />
      <line x1="28" y1="46" x2="28" y2="54" stroke={TK.ink} strokeWidth="2" />
      <circle cx="28" cy="30" r="3" fill={color} stroke={TK.ink} strokeWidth="1.5" />
      <text x="40" y="33" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={TK.inkSoft}>Vout</text>
    </svg>
  );
  if (kind === 'led') return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <polygon points="14,14 14,42 38,28" fill={color} stroke={TK.ink} strokeWidth="2" strokeLinejoin="round" />
      <line x1="38" y1="14" x2="38" y2="42" stroke={TK.ink} strokeWidth="2" />
      <line x1="6" y1="28" x2="14" y2="28" stroke={TK.ink} strokeWidth="2" />
      <line x1="38" y1="28" x2="50" y2="28" stroke={TK.ink} strokeWidth="2" />
      <path d="M 42 10 L 50 4 M 44 6 L 48 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 46 14 L 54 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  if (kind === 'lock') return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <rect x="14" y="26" width="28" height="22" rx="2" fill={color} stroke={TK.ink} strokeWidth="2" />
      <path d="M 19 26 V 18 a 9 9 0 0 1 18 0 V 26" fill="none" stroke={TK.ink} strokeWidth="2" />
      <circle cx="28" cy="36" r="3" fill={TK.ink} />
      <line x1="28" y1="36" x2="28" y2="42" stroke={TK.ink} strokeWidth="2" />
    </svg>
  );
  if (kind === 'csv') return (
    <svg width={s} height={s} viewBox="0 0 56 56">
      <rect x="8" y="10" width="40" height="36" fill={TK.white} stroke={TK.ink} strokeWidth="2" />
      <line x1="8" y1="20" x2="48" y2="20" stroke={TK.ink} strokeWidth="1" />
      <line x1="8" y1="28" x2="48" y2="28" stroke={TK.ink} strokeWidth="1" />
      <line x1="8" y1="36" x2="48" y2="36" stroke={TK.ink} strokeWidth="1" />
      <line x1="22" y1="10" x2="22" y2="46" stroke={TK.ink} strokeWidth="1" />
      <line x1="36" y1="10" x2="36" y2="46" stroke={TK.ink} strokeWidth="1" />
      <rect x="8" y="10" width="40" height="10" fill={color} />
    </svg>
  );
  return null;
}

// ─────────────────────────────────────────────────────────────
// Latest blog posts
// ─────────────────────────────────────────────────────────────
function LatestPostsSection({ accent }) {
  const posts = [
    { date: '2026-05-12', tag: 'NOTES', title: 'Why my 3D-printed lid kept warping (and the fix)', read: 4 },
    { date: '2026-04-29', tag: 'BUILD', title: 'Colocating a Raspberry Pi: lessons from a week of uptime', read: 8 },
    { date: '2026-04-14', tag: 'FIELD', title: "A Saturday with the 555 — it's the duck tape of chips", read: 6 },
  ];
  return (
    <section style={{ padding: '40px 56px 80px' }}>
      <SectionHead n="03" kicker="From the workbench" title="Latest field notes" accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, border: `1.5px solid ${TK.ink}`, background: TK.white }}>
        {posts.map((p, i) => (
          <a key={i} href="#" style={{
            display: 'grid', gridTemplateColumns: '180px 100px 1fr 100px', gap: 24,
            padding: '22px 28px', alignItems: 'center',
            borderBottom: i < posts.length - 1 ? `1px dashed ${TK.ink}55` : 'none',
            textDecoration: 'none', color: TK.ink,
          }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: TK.inkSoft, letterSpacing: '0.06em' }}>
              {p.date}
            </span>
            <TKTag color={accent}>{p.tag}</TKTag>
            <h3 style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 19,
              fontWeight: 600, margin: 0, letterSpacing: '-0.01em', textWrap: 'pretty',
            }}>{p.title}</h3>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              color: TK.inkSoft, letterSpacing: '0.08em', textAlign: 'right',
            }}>{p.read} MIN READ →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { HomePage });
