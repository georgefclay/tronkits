# Handoff: TronKits v2 Reskin

## Overview
A full visual reskin of **tronkits.com** — a hub for tutorials on programming and basic electronics, aimed at total beginners and hobbyists. The new direction is **"playful blueprint"**: graph-paper backgrounds, hand-drawn schematic illustrations, friendly monospace, and engineering-notebook touches like rubber stamps, registration marks, and dimension lines.

The reskin covers six screens: Home, Tutorials index, Tutorial detail, Blog index, Utilities index, and the flagship Resistor Color Code calculator.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing the intended look and behavior. They are **not production code to copy directly**. The task is to **recreate these designs in the target codebase's environment**, using its established patterns, routing, state management, and component conventions.

The existing TronKits site appears to be a Node + Nginx setup on a Raspberry Pi (see `tk-blog.jsx` featured post — that's the actual deploy stack the owner blogged about). Implementation can be in whatever framework fits — vanilla HTML/CSS, server-rendered templates, or a JS framework. The designs are framework-agnostic.

## Fidelity
**High-fidelity (hifi).** The prototypes have:
- Final colors (exact hex values listed below)
- Final typography (Space Grotesk + JetBrains Mono — both Google Fonts)
- Final layouts, spacing, and component composition
- Final copy on all sample content

The developer should recreate the UI pixel-perfectly. Sample content (tutorial titles, blog posts, etc.) can be replaced with real content from the existing site.

---

## Design Tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#F5EFDD` | Primary background — warm cream "paper" |
| `--paper-deep` | `#EDE5CD` | Card wells, alternate sections, icon panels |
| `--paper-edge` | `#E0D6B5` | Edge tints |
| `--ink` | `#15263A` | Primary text, borders, "fineliner" lines |
| `--ink-soft` | `#4A5B72` | Secondary text |
| `--ink-faint` | `#8A95A6` | Captions, placeholder text |
| `--accent` | `#E25C2C` | Primary accent (solder orange) — tweakable |
| `--orange` | `#E25C2C` | Same as accent (default) |
| `--green` | `#2D8F60` | Success, LED green, "active" states |
| `--blue` | `#2E6DA4` | Blueprint cyan — also used for graph grid lines |
| `--yellow` | `#E5B043` | Resistor band yellow, highlight notes |
| `--red` | `#C9442C` | Alerts, "stop" indicators |
| `--violet` | `#6B47B8` | Secondary accent |
| `--copper` | `#B87333` | Electronics-themed accent |
| `--white` | `#FFFCF2` | Card backgrounds (slightly warm white) |

**Graph paper background:** SVG pattern with cyan (`rgb(46, 109, 164)`) lines at `0.07` opacity on every 24px grid cell, and `0.18` opacity bold lines every 5 cells (120px). See `tk-system.jsx` → `GraphPaper` for the exact pattern.

**Accent is tweakable** — the live design exposes a Tweaks panel with these accent options: `#E25C2C`, `#2E6DA4`, `#2D8F60`, `#6B47B8`, `#C9442C`. Recommend exposing the same in implementation (or pick one as final).

### Typography

Both fonts are **Google Fonts**, loaded with weights 400/500/600/700:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

| Use | Family | Weight | Size range |
|---|---|---|---|
| Display / page titles (h1) | Space Grotesk | 700 | 56–84px |
| Section headings (h2) | Space Grotesk | 700 | 38–40px |
| Card titles (h3) | Space Grotesk | 700 | 19–22px |
| Body | Space Grotesk | 400–500 | 14–19px |
| Labels, nav, tags, breadcrumbs, code | JetBrains Mono | 500–700 | 10–13px |
| Metadata, dates, kicker labels | JetBrains Mono | 400–600 | 10–12px |
| Code blocks | JetBrains Mono | 400 | 13px |

**Letter spacing:** Display headings use `-0.035em` to `-0.04em` (tight). Mono labels use `+0.06em` to `+0.15em` (open, uppercase).

**Line-height:** Body `1.5–1.6`. Display `0.95–1.0`. Use `text-wrap: pretty` on all paragraphs and headings.

### Spacing scale
Standard 4-based scale, used liberally:
- Tight: `4 · 6 · 8 · 10 · 12` (component internals)
- Medium: `14 · 18 · 22 · 24 · 28` (card padding, gaps)
- Large: `32 · 36 · 40 · 56 · 80` (section padding, page margins)

Page outer padding: **56px horizontal** on desktop.

### Borders, shadows, corners

- Borders: solid `1.5px solid var(--ink)` for primary card edges
- **Dashed borders** (`1.5px dashed`) are used liberally for "engineering-sketch" feel — most cards, separator lines (`1px dashed` with `40%` ink alpha)
- **Corner radius: 0** everywhere except some interactive demos. The aesthetic is hard rectangles.
- **Drop shadows:** offset solid shadows, NOT blurred. `5px 5px 0 0 rgba(21, 38, 58, 0.1)` for cards. Primary buttons use `4px 4px 0 0 var(--accent)` for the "stamped" feel.

---

## Screens / Views

All screens share a common shell: site nav at the top, page content on graph-paper background, footer at the bottom.

### Shared shell components

#### `<TKNav>` — site-wide top navigation
- **Height:** 84px
- **Background:** paper cream
- **Border-bottom:** `1.5px solid ink`
- **Padding:** `0 56px`
- **Left:** TronKits wordmark (chip icon + "Tron/Kits" — slash colored with accent)
- **Right:** 5 nav items, then a primary "Start Learning →" CTA
- Each nav item: JetBrains Mono uppercase, format is `<faint number> <LABEL>` (e.g. `01 HOME`). Active item has a small accent square dot to its left and an underline in accent color.
- Cross-marks at top-left and top-right corners (12px L-shaped registration marks, ink color)

#### `<TKFooter>`
- **Background:** ink navy (`#15263A`)
- **Text:** paper cream (`#F5EFDD`) with dimmer tones (`#B8C2D0`) for body
- **Padding:** `40px 56px 28px`
- 4-column grid: wordmark + tagline, "Learn", "Tools", "More"
- Column headings: JetBrains Mono yellow (`#E5B043`) `// Section` prefix
- Decorative circuit trace at the top edge: horizontal line with 5 dots evenly spaced
- Bottom strip: copyright on left, version on right, both JetBrains Mono 11px

#### Site-wide patterns
- Every page is wrapped in a `GraphPaper` background (cream paper + SVG cyan grid pattern)
- Section transitions: ink-colored `1.5px` horizontal rules, never gradients
- Section headers use a `<SectionHead>` pattern: huge accent-colored 2-digit number (`01`, `02`...) + `// KICKER` label + h2 + a short right-aligned rule

---

### Screen 1: Home (`/`)

**Purpose:** First impression, route to tutorials/utilities/blog.

**Layout sections (top to bottom):**

1. **Hero** (`padding: 56px 56px 80px`)
   - Status strip at top: `// FILE · home.tron · last updated 2026-05-18` on the left, `STATUS: SOLDERING_HOT` with a pulsing green dot on the right
   - 2-column grid (1.1fr / 1fr), 56px gap:
     - **Left:** Three pill tags (Beginner-friendly, Hands-on, Pet projects), then the headline "Solder. / Sketch. / Ship." (Space Grotesk 700, 84px, line-height 0.95). "Sketch." is colored with accent. "Ship." has a hand-drawn accent-colored underline (SVG path). Body paragraph (19px, ink-soft), then a row of two buttons: accent-styled "Browse Tutorials →" and ghost "Open the toolbox". Below: 3-up stats grid separated by a top border — `24 Tutorials`, `06 Calculators`, `∞ Side quests`.
     - **Right:** A complete schematic diagram in SVG of a 9V → resistor → LED circuit, rendered as if drawn on engineering paper. Includes:
       - Dashed outer frame
       - Title strip top-right: ink-filled bar saying "SCHEMATIC · FIG. 01"
       - Title block at bottom: 3-column blueprint title block with Project / Difficulty / Rev fields
       - Hand-drawn-style annotation arrows in accent and dashed-ink colors with handwritten-italic labels: "→ current flows here", "tweak this · to dim the LED", "this glows 🎉"
       - "WELCOME · BENCH · 2026" rubber stamp (rotated +8°, green, on top-right corner)

2. **Featured tutorials** (section #01)
   - 3-up card grid (`gap: 28px`)
   - Each card: 180px-tall visual panel (graph-paper inset with a per-tutorial SVG illustration: isometric box, Pi PCB, LED circuit) → content area: tag pill, "{steps} STEPS · ~{minutes} MIN" meta, h3 title, body, "READ →" link

3. **Utilities preview** (section #02)
   - Section has its own deeper cream background (`paper-deep`) bordered top and bottom
   - 3×2 grid of utility tiles, each a flush bordered cell (no gap — borders form a unified table)
   - Each tile: icon (per-utility SVG), small index `01..06` in top-right, name (h3), subtitle (JetBrains Mono), "OPEN TOOL →" link colored per-utility

4. **Latest field notes** (section #03)
   - Single bordered card containing rows
   - Row layout: date · tag pill · title · "MIN READ →"
   - Rows separated by `1px dashed ink/55` lines

---

### Screen 2: Tutorials index (`/tutorials`)

**Purpose:** Browse all tutorials.

1. **Header:** breadcrumb `// HOME / TUTORIALS`, h1 "Tutorials. / Read once, ship forever." (the subtitle is 36px ink-soft, set on the same h1), rubber stamp "SHELF · 01 · 2026" on the right.

2. **Filter bar:** a single horizontal bar bordered ink, containing a "FILTER" label cell, then filter buttons (All / OpenSCAD / Raspberry Pi / Electronics / Linux). Active filter is ink background with paper text. Buttons separated by `1px dashed ink/55`. Search hint on the far right with a 🔍 icon.

3. **Tutorials grid:** 2-column grid of tutorial cards. Each card:
   - 160px-wide visual panel on the left with graph-paper inset and per-tutorial SVG, plus a "#01" tag badge in the top-left corner
   - Right side: category tag, date, h3 title, body, footer row with steps/minutes/difficulty stars on the left and "READ →" on the right

---

### Screen 3: Tutorial detail (`/tutorials/{slug}`)

**Purpose:** Read a tutorial step-by-step. Sample content is the OpenSCAD Parametric Box tutorial.

1. **Header** (`padding: 40px 56px 36px`)
   - Breadcrumb
   - 2-column grid (1.5fr / 1fr):
     - **Left:** 3 tag pills (`● OPENSCAD`, `3D MODELING`, `★ ☆ ☆  BEGINNER` in green), h1 "Build a parametric box in OpenSCAD" (56px Space Grotesk 700), body intro with inline `<code>` styling.
     - **Right (title block):** White card with ink header bar saying "TUTORIAL · TITLE BLOCK · REV 02 (yellow)". Inside: 2×2 grid of meta cells (Steps · Time · Difficulty · Updated). Below: "YOU'LL NEED" section with bulleted list using accent ▸ markers.

2. **Steps body**
   - Layout: 3-column grid (`64px / 1fr / 1fr` per row)
   - Each step has its big number badge (56px circle, dashed border on the badge has an accent offset shadow) in the gutter, then a 2-up content area:
     - **h2 step title** spans both columns
     - 2-column row: text + code block on the left, second cell on the right (preview or another code block)
   - **CodeBlock component:** dark ink background, "📄 box.scad" filename header bar with `· SCAD ·` indicator on the right (accent), code body with line numbers in a faint column and the lines themselves
   - **PreviewBox:** white card with dashed ink border, "PREVIEW · {label}" kicker, then centered SVG of the resulting 3D shape (isometric)
   - **Callout:** vertical accent border on the left, paper-deep background, paragraph with **bold** lead and inline `<code>`

3. **Next/prev nav** at the bottom: 2 cards side-by-side, prev on the left ("← PREV · CATEGORY") and next on the right ("NEXT → · CATEGORY") with the title below the kicker.

---

### Screen 4: Blog (`/blog`)

**Purpose:** Field-notes-style blog with one featured post and a chronological list.

1. **Hero:** "Field notes / from the bench." (the second line is italic accent-colored). Right side has a counter: "SCRATCH-PAD ENTRIES · 23 · ↻ updated weekly-ish"

2. **Featured post:** wide bordered card, 2-column grid:
   - **Left:** tags, date · read time, h2 (38px), excerpt, accent CTA button "Read the full write-up →"
   - **Right:** ink-navy panel containing an inline network diagram in SVG — boxes for "🥧 PI", "NGINX :80", "NODE :8080", "WWW" circle, with arrows between them and address labels

3. **Chronological list:** bordered card, rows separated by dashed lines. Row layout: 5-column grid `70px / 120px / 140px / 1fr / 100px`:
   - Number index (accent, JetBrains Mono 700)
   - Date (mono, ink-soft)
   - Category tag pill (color varies per category)
   - Title + 1-sentence excerpt (stacked, h3 + body)
   - "{N} MIN →" right-aligned

---

### Screen 5: Utilities (`/utility`)

**Purpose:** Toolbox drawer of calculators.

1. **Hero:** "The toolbox. / Six calculators that earn their drawer space." with "OPEN-SOURCE · FREE · NO LOGIN" stamp (green, rotated -4°)

2. **2-column grid of 6 utility cards.** Each card:
   - 120px-wide icon panel on the left with graph-paper inset + utility SVG icon
   - Right content: h3 + subtitle in a left block, optional "★ POPULAR" badge top-right (border + paper bg)
   - Body description (14px ink-soft)
   - Footer row: 3 small bullet meta items on the left ("● BAND COLORS", etc.), "OPEN →" link on the right (colored to match the utility)

3. **CTA strip** at the bottom of the page: ink-navy bar with "// SUGGEST A TOOL" kicker (yellow), h3 prompt, body, and an accent button.

---

### Screen 6: Resistor Color Code calculator (`/resistor`)

**Purpose:** Interactive utility — pick resistor band colors, see decoded resistance.

1. **Header:** breadcrumb, h1 "Resistor decoder." (64px), body intro, then 3 mode buttons on the right: `4-BAND`, `5-BAND`, `6-BAND`. Currently visual-only — only 4-band wired in the prototype. Buttons styled as paper-background with offset accent shadow.

2. **Main 2-column grid (1.4fr / 1fr):**
   - **Left card (Input):** white card with ink header bar "INPUT · COLOR BANDS · 4-BAND MODE". Inside, each band has its own color picker row:
     - Label "BAND 1 · DIGIT" (mono kicker)
     - Row of color swatches (36×36 squares filled with the canonical resistor-color hex). Selected swatch gets a 2px ink border + offset solid shadow + the digit/multiplier value as a white overlay number
     - Footer line: `→ ORANGE · digit 3` (live)
   - **Right card (Result):** ink-navy panel with **accent-colored shadow offset** (different from other cards). Header: "// COMPUTED · RESISTANCE · ↻ LIVE" (yellow). Inside:
     - "NOMINAL VALUE" kicker → giant value `330 Ω` (Space Grotesk 700, 56px, paper white)
     - Tolerance line: `± 5% tolerance` in accent
     - 2-up MIN / MAX section (dashed top border)
     - "Terminal" code block at the bottom: very dark navy bg, accent prompt `$ ` followed by the color names, then `→ 330 Ω ± 5%` result

3. **Pictorial resistor preview (full-width card):** Big white card. SVG of a horizontal resistor: tan body, 2 leads, vertical bands matching the user's color choices, dashed callout lines above with "B1, B2, B3, B4" labels and the color names below. Dimension line below showing "~ 9.5 mm".

4. **Education section** (uses `<SectionHead n="04">`): 3-up cards of explainer copy: "Read left to right", "Digits, then multiplier", "Last band is tolerance".

5. **Full color reference table:** Bordered card with ink header bar. Standard HTML table with columns: COLOR (swatch + name), DIGIT, MULTIPLIER, TOLERANCE, TEMPCO. Rows separated by dashed lines, tolerance values colored accent if applicable.

---

## Interactions & Behavior

### Interactive in the prototype
- **Resistor calculator:** clicking a color swatch in any band updates that band's state. The displayed nominal value, min, max, tolerance, terminal command, and the pictorial resistor diagram all update live.
- **Tweaks panel:** accent color and grid density can be changed live and persist via the panel's protocol.

### Not interactive in the prototype, but intended for real implementation
- **All nav links:** route to the respective pages
- **Filter buttons on Tutorials index:** filter the visible list
- **Search hint:** open a search input
- **Mode buttons (4/5/6 band) on Resistor:** switch the picker to that many bands. The code already supports `mode === 5` and `mode === 6` shapes in `tk-resistor.jsx` — wiring the buttons is the remaining work.
- **All "READ →" / "OPEN TOOL →" links:** navigate to the detail/utility
- **Featured post CTA + tutorial step buttons:** navigate
- **CSV viewer / passphrase / 555 timer / voltage divider / LED resistor utilities:** not designed in this pass — the design system in `tk-system.jsx` plus the resistor prototype should give the developer enough vocabulary to extend.

### Hover states (recommended, not in prototype)
- **Buttons:** slight scale or shadow shift
- **Cards:** lift the offset shadow slightly (e.g., `5px 5px → 6px 7px`)
- **Nav links:** underline appears in accent

### Responsive
The prototype is desktop-only (1280px design width). For mobile:
- Stack 2- and 3-column grids vertically
- Reduce h1 sizes (84px → 48px, 64px → 36px)
- Reduce horizontal padding (`56px → 20px`)
- Nav collapses to a hamburger (the existing site already has a hamburger pattern — reuse)
- The schematic on the Home hero is the trickiest to scale — recommend swapping for a simpler graphic at narrow widths, or scaling the SVG to fit.

---

## Component inventory

These are the reusable building blocks defined in `tk-system.jsx`. When recreating in the target framework, build these as components first:

| Component | Description |
|---|---|
| `GraphPaper` | Container with cream paper + SVG cyan-grid background pattern |
| `RegMarks` | Corner registration / crop marks (decorative) |
| `Stamp` | Circular rotated rubber-stamp text |
| `Pin` | Pushpin / thumbtack circular SVG |
| `Tape` | Washi-tape strip |
| `Annotation` | Numbered badge in a circle |
| `DimensionLine` | Engineering dimension line with arrows + label |
| `HandArrow` | Hand-drawn-style SVG arrow |
| `Resistor` / `LED` / `Capacitor` / `ChipDIP` | Schematic component SVGs |
| `TKButton` | Button (variants: `primary`, `accent`, `ghost`, `link`) with offset shadow |
| `TKCard` | Dashed-border blueprint card with lift shadow |
| `TKTag` | Uppercase mono pill / tag |
| `CodeBlock` | Code with line numbers and filename header |
| `TronKitsMark` | Wordmark — chip icon + "Tron/Kits" |
| `TKNav` (in `tk-shell.jsx`) | Site nav bar |
| `TKFooter` (in `tk-shell.jsx`) | Site footer |
| `SectionHead` (in `tk-shell.jsx`) | Big numbered section header |

---

## Assets

- **No raster images** — every illustration in the prototype is inline SVG.
- **Fonts:** Space Grotesk + JetBrains Mono, loaded from Google Fonts.
- **No icon library** — all icons are inline SVG defined alongside their use site (see `UtilIcon`, `CardVisual`, `TutVisual`).
- The existing site has tutorial step images under `https://tronkits.com/images/tutorials/` — those continue to be used in real tutorial content, not in the design chrome.

---

## Files

The HTML prototype is structured as one entry HTML file + several JSX modules that attach React components to `window`. To open: open `TronKits Reskin.html` in a modern browser — everything loads from CDN.

| File | Contains |
|---|---|
| `TronKits Reskin.html` | Entry. Boots React, loads all JSX, mounts the `DesignCanvas` with 6 artboards + Tweaks panel |
| `tk-system.jsx` | **Design tokens (`TK` color object) + all primitive components** — start here when implementing |
| `tk-shell.jsx` | Page shell — `TKBrowserFrame` (only used in the prototype canvas, can be discarded for real impl), `TKNav`, `TKFooter`, `SectionHead` |
| `tk-home.jsx` | Home page composition |
| `tk-tutorials.jsx` | Tutorials index |
| `tk-detail.jsx` | Tutorial detail (OpenSCAD parametric box sample) |
| `tk-blog.jsx` | Blog index |
| `tk-utilities.jsx` | Utilities index |
| `tk-resistor.jsx` | Resistor color code calculator (includes the `RESISTOR_COLORS` reference data) |
| `design-canvas.jsx` | Prototype-only — pan/zoom canvas wrapper for displaying all 6 artboards side-by-side. **Not needed in real implementation.** |
| `browser-window.jsx` | Prototype-only — was not used in the final design. **Discard.** |
| `tweaks-panel.jsx` | Prototype-only — live tweak controls. **Not needed in real implementation** unless you want a theme switcher. |

### Suggested implementation order
1. Set up design tokens (colors + fonts) as CSS variables or a theme object in your codebase's idiom
2. Build the GraphPaper background + the shared shell (Nav, Footer)
3. Build the primitive components (Button, Card, Tag, CodeBlock, Stamp, etc.)
4. Build the schematic SVG illustrations as reusable components
5. Implement screens in order: Home → Utilities → Resistor (highest-impact pages first) → Tutorials index → Tutorial detail → Blog
6. Wire interactivity on the Resistor calculator
7. Add responsive breakpoints for mobile

### Things to verify with the project owner
- Whether the existing CMS for tutorials/blog posts stays as-is or gets restructured. The new design uses structured metadata (steps, time, difficulty stars, tags) that may require new fields.
- The remaining utilities (555 Timer, Voltage Divider, LED Resistor, Passphrase, CSV Viewer) — design them using the resistor utility as a template.
- A Contact page and a 404 — not in this design pass but obviously needed for the full site.
