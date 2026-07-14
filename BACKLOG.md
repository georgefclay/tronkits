# Tronkits Backlog

Ideas for new utilities and blog posts. Check off as completed.

---

## Utilities

### Electronics calculators (highest fit with existing tools)

- [x] **Ohm's Law & Power Calculator** — `/ohms-law` (E, I, R, P from any two)
- [ ] **Capacitor code decoder** — read 3-digit codes (104 → 100nF), tantalum/electrolytic markings
- [ ] **SMD resistor code decoder** — 3-digit, 4-digit, and EIA-96
- [ ] **RC / RL filter designer** — cutoff frequency, time constant for debouncing/filtering
- [ ] **Wire gauge (AWG)** — current capacity, resistance, voltage drop over distance
- [ ] **PCB trace width** — IPC-2221 current capacity for trace width and copper weight
- [ ] **Battery life estimator** — capacity (mAh/Wh) vs. average current draw
- [ ] **Op-amp gain calculator** — inverting / non-inverting / differential

### Maker / 3D printing (pair with OpenSCAD page)

- [ ] **Stepper driver current calculator** — VREF for A4988 / DRV8825 / TMC drivers
- [ ] **GT2 belt length** — for printer/CNC builds given pulley sizes and center distance
- [ ] **Filament cost & weight** — by length and density

### General dev utilities (similar to CSV viewer / passphrase generator)

- [x] **Logo generator** — `/logo-generator` (wordmark + geometric shape + rules → SVG, glyphs outlined to paths)
- [ ] **Base converter** — bin/dec/hex/octal, with bitwise ops (useful for embedded work)
- [ ] **QR code generator** — links, Wi-Fi credentials
- [ ] **Regex tester** with live highlighting
- [ ] **JSON formatter / validator**

### Top 3 to build next (biggest audience pull, cheapest to build)

1. Ohm's Law (done)
2. Capacitor code decoder
3. SMD resistor code decoder

---

## Blog posts

### Companion posts to existing calculators (highest leverage)

- [x] **Reading Resistor Color Codes** — `/blog/reading-resistor-color-code`
- [ ] Picking the right LED current-limiting resistor — with worked examples → `/led-resistor`
- [ ] Voltage dividers under load: why your output sags and how to fix it → `/voltage-divider`
- [ ] 555 astable vs monostable: which one do you actually need? → `/555`
- [ ] Ohm's law in 5 minutes with the Eagle mnemonic → `/ohms-law`

### Beginner electronics (broad search volume, evergreen)

- [ ] Your first breadboard circuit: a blinking LED, properly explained
- [ ] Decoding capacitor markings (104 ≠ 104 farads)
- [ ] Pull-up vs pull-down resistors — what they do and when to use which
- [ ] How to read a schematic without panicking
- [ ] The 5 most common multimeter mistakes (and how to avoid them)

### Component deep dives (long-tail SEO)

- [ ] Why the 555 timer is still everywhere in 2026
- [ ] Op-amps without the math: 4 circuits that cover 90% of use cases
- [ ] Decoupling capacitors: where to put them and why
- [ ] MOSFET vs BJT for switching loads — a practical comparison
- [ ] Zener diodes 101: voltage references on the cheap

### Project / build posts (personality and originality)

- [ ] I built my own project tracker because every SaaS tool was overkill
- [ ] Designing a custom enclosure in OpenSCAD: from sketch to STL
- [ ] Logging garden soil moisture with an ESP32 and a $2 sensor
- [ ] Reverse-engineering a $5 thrift-store toy

### Behind-the-scenes / web dev (timely with the upcoming rebuild)

- [ ] Why I'm rebuilding tronkits.com with Node, EJS, and Tailwind in 2026
- [ ] Generating STL files from a web app with OpenSCAD and Express
- [ ] From JSON files to Postgres: when a hobby site needs to graduate

### Top 3 to write next (SEO leverage × ease of writing)

1. Reading Resistor Color Codes (done)
2. Decoding capacitor markings — sets up future capacitor decoder utility
3. Ohm's law in 5 minutes with the Eagle mnemonic — drives traffic to the new calculator
