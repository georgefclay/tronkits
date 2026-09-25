---
title: "Reading SMD Resistor Codes: 3-Digit, 4-Digit and EIA-96"
slug: "reading-smd-resistor-codes"
date: "2026-09-26"
description: "How to read the tiny numbers on SMD resistors: 3-digit codes like 472, 4-digit codes like 4702, EIA-96 codes like 01C, and what R and 000 mean."
tags: ["electronics", "resistors", "smd", "utilities"]
---

Through-hole resistors have color bands. Surface-mount resistors are far too small for paint, so they get a few printed characters instead, and the first time you look at one under a magnifier it can be a puzzle. **472**. **4702**. **01C**. **4R7**. They're all resistor values, written in three different schemes.

The good news is that two of the three work exactly like the color code you may already know, and the third just needs a lookup table. Here's how I read them at the bench.

## The one rule that covers most of them

For both the 3-digit and 4-digit codes, **the last digit is the number of zeros**. Everything in front of it is the value. That's it. Burn that into your head and you can read most SMD resistors on sight.

## 3-digit codes (usually 5% parts)

Two digits of value, then the number of zeros:

- **472** — 47, then two zeros: 4,700 Ω, or 4.7 kΩ
- **103** — 10, then three zeros: 10,000 Ω, or 10 kΩ
- **221** — 22, then one zero: 220 Ω
- **100** — 10, then no zeros: just 10 Ω (not 100!)

That last one catches people. A resistor marked 100 is 10 Ω, because the final 0 means "add no zeros."

## 4-digit codes (usually 1% parts)

Precision parts need a third significant digit, so they get one more character. Same rule: the last digit is the zeros.

- **4702** — 470, then two zeros: 47,000 Ω, or 47 kΩ
- **1001** — 100, then one zero: 1,000 Ω, or 1 kΩ
- **4991** — 499, then one zero: 4,990 Ω, or 4.99 kΩ

That extra digit is what lets a 1% part be 4.99 kΩ instead of "about 5k."

## R is the decimal point

For values under 10 Ω (or under 100 Ω on 4-digit parts) there aren't enough zeros to work with, so the letter **R** marks where the decimal point goes:

- **4R7** — 4.7 Ω
- **R47** — 0.47 Ω
- **R10** — 0.1 Ω (you'll see these on current-sense resistors)
- **4R70** — 4.70 Ω on a 1% part

Read R out loud as "point" and you'll get it right every time: "four point seven."

## EIA-96: the one that needs a table

Here's the problem EIA-96 solves. A 1% resistor needs three significant digits, but a tiny 0603 chip really only has room for three characters in total. So instead of printing the digits, the code prints an **index**.

The E96 series has exactly 96 standard values per decade (100, 102, 105, 107 and so on up to 976). EIA-96 numbers them 01 to 96, and adds a letter for the multiplier. Two digits plus one letter, three characters, and you've got a 1% value.

The letters I remember as **A-B-C-D, one-ten-hundred-thousand**:

- **A** — ×1
- **B** — ×10
- **C** — ×100
- **D** — ×1,000

(There are more — X is ×0.1, Y is ×0.01, E and F go up to ×100,000 — but A through D cover most of what you'll find.)

Let's do a few:

- **01C** — code 01 is 100, C is ×100: 10,000 Ω, or 10 kΩ
- **22B** — code 22 is 165, B is ×10: 1,650 Ω, or 1.65 kΩ
- **68X** — code 68 is 499, X is ×0.1: 49.9 Ω

You can't do this one in your head unless you've memorized the table, and I haven't. The one anchor worth keeping is **01 = 100**. After that, I look it up.

## Watch out for these

**000 isn't missing.** A resistor marked **0** or **000** is a zero-ohm jumper. It's just a link in a resistor-shaped package, used to hop a trace over another one or to set a configuration option. It'll measure a few tens of milliohms at most.

**Upside down is a real problem.** There's no "this way up" on a chip resistor, and some codes read as a different valid code when flipped. **601** turned around reads **109**. If the value doesn't make sense in the circuit, rotate the board and try again. Some makers underline the code to help.

**R can mean two things.** In EIA-96, R is an alternate letter for ×0.01, so **47R** could be EIA-96 (code 47 is 301, so 3.01 Ω) or plain 47 Ω with R as the decimal point. Context is your friend here: look at what's around it on the board.

**Tiny parts often have no marking.** 0402 and smaller resistors are usually blank, and some 0603 parts are too. At that point the code isn't there to read, and the only honest answer is to measure the part out of circuit with a multimeter.

Even when there is a marking, I treat it as a strong hint rather than gospel. If it matters, I measure.

## Or skip the table

If you've got a part under the magnifier and don't want to count zeros or hunt through the E96 list, the calculator figures out which scheme you've typed, decodes it, and has the full EIA-96 table on the page. It also works backwards, from a value to all three codes.

[**TronKits SMD Resistor Code Calculator →**](/smd-resistor-code)

*This blog post was written by AI using the voice of George Clay's writings. Edited by George Clay.*
