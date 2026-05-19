// ─────────────────────────────────────────────────────────────
// Tutorial detail — single article view (OpenSCAD box)
// ─────────────────────────────────────────────────────────────

function TutorialDetailPage({ accent = TK.orange, density = 24 }) {
  return (
    <GraphPaper density={density} style={{ flex: 1, overflow: 'auto' }}>
      <TKNav current="tutorials" accent={accent} />
      <DetailHeader accent={accent} />
      <DetailBody accent={accent} />
      <DetailNext accent={accent} />
      <TKFooter accent={accent} />
    </GraphPaper>
  );
}

function DetailHeader({ accent }) {
  return (
    <section style={{ padding: '40px 56px 36px' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 22,
      }}>// HOME / TUTORIALS / OPENSCAD-PARAMETRIC-BOX</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 56 }}>
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <TKTag color={accent}>● OPENSCAD</TKTag>
            <TKTag>3D MODELING</TKTag>
            <TKTag color={TK.green}>★ ☆ ☆ &nbsp; BEGINNER</TKTag>
          </div>
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 56,
            fontWeight: 700, margin: 0, letterSpacing: '-0.035em',
            lineHeight: 1.0, color: TK.ink,
          }}>Build a parametric box in OpenSCAD</h1>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 19,
            lineHeight: 1.55, color: TK.inkSoft, marginTop: 22, marginBottom: 0,
            maxWidth: 620, textWrap: 'pretty',
          }}>
            The hello-world of OpenSCAD. We'll set up dimensions as variables, hollow out the body with <code style={{ fontFamily: 'JetBrains Mono, monospace', background: TK.paperDeep, padding: '2px 6px', border: `1px solid ${TK.ink}33` }}>difference()</code>, wrap it in a module, and pop a lid on the side.
          </p>
        </div>

        {/* Title block / metadata */}
        <div style={{
          background: TK.white, border: `1.5px solid ${TK.ink}`,
          boxShadow: `5px 5px 0 0 ${TK.ink}1A`,
          padding: 0, alignSelf: 'start',
        }}>
          <div style={{
            background: TK.ink, color: TK.paper, padding: '10px 16px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            letterSpacing: '0.15em', display: 'flex', justifyContent: 'space-between',
          }}>
            <span>TUTORIAL · TITLE BLOCK</span>
            <span style={{ color: TK.yellow }}>REV 02</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${TK.ink}` }}>
            <MetaCell label="STEPS" v="6" />
            <MetaCell label="TIME" v="~15 min" border />
            <MetaCell label="DIFFICULTY" v="★ ☆ ☆" top />
            <MetaCell label="UPDATED" v="2026-04-18" top border />
          </div>
          <div style={{ padding: 16, borderTop: `1px solid ${TK.ink}` }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.12em', color: TK.inkSoft, marginBottom: 10,
            }}>YOU'LL NEED</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, lineHeight: 1.7 }}>
              <li><span style={{ color: accent, marginRight: 8 }}>▸</span>OpenSCAD installed (free)</li>
              <li><span style={{ color: accent, marginRight: 8 }}>▸</span>A text editor you like</li>
              <li><span style={{ color: accent, marginRight: 8 }}>▸</span>10 quiet minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaCell({ label, v, border = false, top = false }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderLeft: border ? `1px solid ${TK.ink}` : 'none',
      borderTop: top ? `1px solid ${TK.ink}` : 'none',
    }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', color: TK.inkSoft }}>{label}</div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 600, color: TK.ink, marginTop: 4 }}>{v}</div>
    </div>
  );
}

// Steps
function DetailBody({ accent }) {
  return (
    <section style={{ padding: '0 56px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 1fr', gap: 28 }}>
        <Step n="01" title="Set up your parameters" accent={accent}>
          <p style={stepText}>
            We define variables for the box's size and wall thickness so we can easily tweak it later.
          </p>
          <CodeBlock
            file="box.scad"
            lang="scad"
            code={`w = 25;     // outer width
d = 15;     // outer depth
h = 10;     // outer height
wall = 2;   // wall thickness`}
          />
          <Callout color={accent}>
            <strong>Heads up:</strong> every statement ends with a semicolon (<code>;</code>). OpenSCAD is strict about it.
          </Callout>
        </Step>

        <Step n="02" title="Create the outer shell" accent={accent}>
          <p style={stepText}>
            Start with a solid cube. Three numbers in brackets = width, depth, height.
          </p>
          <CodeBlock file="box.scad" lang="scad" code={`cube([w, d, h]);`} />
          <PreviewBox label="Solid cube · 25 × 15 × 10mm">
            <svg viewBox="0 0 220 140" width="220" height="140">
              <g stroke={TK.ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
                <path d="M 50 90 L 110 60 L 170 90 L 170 120 L 110 150 L 50 120 Z" fill={TK.paperDeep} />
                <path d="M 50 90 L 110 120 L 170 90 M 110 120 L 110 150" />
                <path d="M 70 80 L 130 50 L 190 80 L 190 110" fill={TK.paper} />
                <path d="M 50 90 L 70 80 M 170 90 L 190 80" strokeDasharray="3 2" />
              </g>
              <text x="110" y="30" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={TK.inkSoft}>25 × 15 × 10</text>
            </svg>
          </PreviewBox>
        </Step>

        <Step n="03" title="Hollow it out" accent={accent}>
          <p style={stepText}>
            <code style={inline}>difference()</code> subtracts the second shape from the first. We translate a slightly-smaller cube inside.
          </p>
          <CodeBlock file="box.scad" lang="scad" code={`difference() {
  cube([w, d, h]);
  translate([wall, wall, wall])
  cube([w - 2*wall, d - 2*wall, h]);
}`} />
          <PreviewBox label="Hollow box · 2mm walls">
            <svg viewBox="0 0 220 140" width="220" height="140">
              <g stroke={TK.ink} strokeWidth="1.5" fill="none" strokeLinejoin="round">
                <path d="M 50 90 L 110 60 L 170 90 L 170 120 L 110 150 L 50 120 Z" fill={TK.paperDeep} />
                <path d="M 70 80 L 110 64 L 150 80 L 150 96 L 110 112 L 70 96 Z" fill={TK.paper} />
                <path d="M 70 80 L 110 96 L 150 80 M 110 96 L 110 112" strokeDasharray="2 2" opacity="0.6" />
                <path d="M 50 90 L 110 120 L 170 90 M 110 120 L 110 150" />
              </g>
            </svg>
          </PreviewBox>
        </Step>

        <Step n="04" title="Wrap it in a module" accent={accent}>
          <p style={stepText}>
            A <code style={inline}>module</code> is like a function — define once, call by name. Now we have a reusable <code style={inline}>box()</code>.
          </p>
          <CodeBlock file="box.scad" lang="scad" code={`module box() {
  difference() {
    cube([w, d, h]);
    translate([wall, wall, wall])
    cube([w - 2*wall, d - 2*wall, h]);
  }
}
box();`} />
          <Callout color={TK.green}>
            <strong>Why bother?</strong> Now you can drop <code>box();</code> anywhere — translated, rotated, even inside a loop.
          </Callout>
        </Step>
      </div>

      {/* Continue link */}
      <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center' }}>
        <TKButton variant="accent">Continue to step 05 →</TKButton>
      </div>
    </section>
  );
}

const stepText = {
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 15, lineHeight: 1.6,
  color: TK.ink, margin: '0 0 14px',
  textWrap: 'pretty',
};
const inline = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 13, background: TK.paperDeep,
  padding: '1px 6px', border: `1px solid ${TK.ink}33`,
};

function Step({ n, title, accent, children }) {
  return (
    <React.Fragment>
      {/* Big number in left gutter */}
      <div style={{ gridColumn: '1 / 2', position: 'sticky', top: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          border: `1.5px solid ${TK.ink}`, background: TK.paper,
          display: 'grid', placeItems: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 16,
          fontWeight: 700, color: TK.ink,
          boxShadow: `3px 3px 0 0 ${accent}`,
        }}>{n}</div>
      </div>
      <div style={{ gridColumn: '2 / 4', marginBottom: 36 }}>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 28,
          fontWeight: 700, margin: '0 0 18px',
          letterSpacing: '-0.02em', color: TK.ink,
        }}>{title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {children}
        </div>
      </div>
    </React.Fragment>
  );
}

function Callout({ children, color = TK.orange }) {
  return (
    <div style={{
      borderLeft: `4px solid ${color}`,
      background: TK.paperDeep,
      padding: '12px 16px',
      fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
      lineHeight: 1.55, color: TK.ink, marginTop: 14,
      textWrap: 'pretty',
    }}>
      {children}
    </div>
  );
}

function PreviewBox({ label, children }) {
  return (
    <div style={{
      background: TK.white, border: `1.5px dashed ${TK.ink}`,
      padding: '12px', position: 'relative',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: TK.inkSoft, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: 6,
      }}>PREVIEW · {label}</div>
      <div style={{ display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

function DetailNext({ accent }) {
  return (
    <section style={{ padding: '20px 56px 80px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        marginTop: 0,
      }}>
        <NavCard direction="prev" cat="OPENSCAD" title="Intro: installing the toolchain" accent={accent} />
        <NavCard direction="next" cat="OPENSCAD" title="Rounded corners with offset()" accent={accent} />
      </div>
    </section>
  );
}

function NavCard({ direction, cat, title, accent }) {
  const isNext = direction === 'next';
  return (
    <a href="#" style={{
      background: TK.white, border: `1.5px solid ${TK.ink}`,
      padding: '20px 24px', textDecoration: 'none', color: TK.ink,
      boxShadow: `5px 5px 0 0 ${TK.ink}1A`, display: 'block',
      textAlign: isNext ? 'right' : 'left',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: TK.inkSoft, letterSpacing: '0.12em', marginBottom: 8,
      }}>{isNext ? 'NEXT →' : '← PREV'} · {cat}</div>
      <h3 style={{
        fontFamily: 'Space Grotesk, sans-serif', fontSize: 22,
        fontWeight: 700, margin: 0, letterSpacing: '-0.02em',
        textWrap: 'pretty',
      }}>{title}</h3>
    </a>
  );
}

Object.assign(window, { TutorialDetailPage });
