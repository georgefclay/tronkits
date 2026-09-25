---
title: "Decoding Capacitor Markings (104 Is Not 104 Farads)"
slug: "decoding-capacitor-markings"
date: "2026-09-25"
description: "What 104, 473J, 4n7 and 2u2 mean on a capacitor, why it's always picofarads, and the last-digit trick I use to read ceramic caps at a glance."
tags: ["electronics", "capacitors", "beginner", "utilities"]
---

The first time I pulled a little blue ceramic capacitor out of a parts bin and saw **104** printed on it, I figured it was 104 of something. Microfarads, maybe. It isn't. It's 100 nanofarads, and once you know why, you'll never read it wrong again.

Small capacitors don't have room to print "100 nF" on them, so they use a three-digit code. It's the same idea as the multiplier band on a resistor: a couple of digits, then a number that tells you how many zeros to tack on. If you can read resistor color codes, you're most of the way there already. (If you can't yet, the [resistor color code calculator](/resistor) will get you started.)

## The rule: two digits, then zeros, in picofarads

Here's the whole thing:

1. The first two digits are the value.
2. The third digit is how many zeros to add.
3. The answer is **always in picofarads** (pF).

So **104** is 1, 0, then four zeros: **100,000 pF**. That's the same as 100 nF, or 0.1 µF. Every step from pico to nano to micro is a factor of 1,000, so you just slide the comma three places each time.

A few more you'll see all the time:

| Code | Picofarads | Also known as |
|------|-----------|---------------|
| 101  | 100 pF     | 0.1 nF        |
| 222  | 2,200 pF   | 2.2 nF        |
| 103  | 10,000 pF  | 10 nF         |
| 473  | 47,000 pF  | 47 nF         |
| 104  | 100,000 pF | 100 nF        |
| 474  | 470,000 pF | 470 nF        |
| 105  | 1,000,000 pF | 1 µF        |

Why isn't 104 just 104 farads? Because a hundred-farad capacitor is a supercapacitor the size of a battery, not a blob the size of a lentil. If the number looks absurd for the size of the part, it's a code.

## The trick I actually use: the last digit is the drawer

I don't do the zero-counting in my head most days. I look at the last digit, because it tells me which drawer the value lives in:

- Ends in **2** — a few nanofarads (222 is 2.2 nF)
- Ends in **3** — tens of nanofarads (103 is 10 nF, 473 is 47 nF)
- Ends in **4** — hundreds of nanofarads (104 is 100 nF)
- Ends in **5** — microfarads (105 is 1 µF)

Then the first two digits fill in the rest. A 474 ends in 4, so it's hundreds of nano, and 47 makes it 470 nF.

## The letter after the code is tolerance

Lots of caps have a letter tacked on the end, like **473J** or **104K**. That letter is not part of the value. It's the tolerance:

- **J** — ±5%
- **K** — ±10%
- **M** — ±20%
- **Z** — +80% / −20% (you'll see this on cheap decoupling caps)

Let's decode a yellow film cap marked **473J**. The 47 and three zeros make 47,000 pF, which is 47 nF. The J says ±5%, so the real part could be anywhere from 44.65 nF to 49.35 nF. A **104K** is 100 nF ±10%, so 90 nF to 110 nF. Small caps under 10 pF sometimes use B, C or D instead, which are fixed amounts in picofarads (±0.1, ±0.25 and ±0.5 pF) rather than a percentage.

## When there's no code at all

Two other formats show up on small parts:

**One or two digits.** A cap marked **47** is just 47 pF. No multiplier, nothing to decode.

**A letter as the decimal point.** Some parts put the unit right where the decimal point goes. **4R7** is 4.7 pF (R stands in for the point, and it's picofarads). **4n7** is 4.7 nF, **n47** is 0.47 nF (470 pF), and **2u2** is 2.2 µF. Read the letter as both "decimal point" and "unit" and they make sense.

## Watch out for these

**Electrolytics don't use the code.** Big aluminium cans have room to print the real value, like **100µF 25V**, and a stripe down one side marking the negative lead. So a can that says **100** means 100 µF, while a tiny ceramic that says **100** is 10 pF. That's the same number, a factor of ten million apart. Size and shape tell you which world you're in.

**The 8 and 9 multipliers go the other way.** A third digit of 9 means ×0.1 and 8 means ×0.01, for the really small values. **229** is 2.2 pF and **228** is 0.22 pF. You won't see them often, but they'll throw you the first time. And 7 isn't used at all.

**A second line is usually voltage.** Film caps often carry a second marking like **2A** or **100V**. That's the voltage rating, not the value.

When I'm tired, the thing that bites me is mixing up nano and micro. If a circuit calls for 0.1 µF, that's a 104. If it calls for 1 µF, that's a 105. One digit apart, ten times the capacitance.

## Or let the calculator do it

Type in whatever is printed on the part, with or without the tolerance letter, and it gives you the value in pF, nF and µF at once, plus the min and max. It works backwards too, if you know the value and need the code to search for.

[**TronKits Capacitor Code Calculator →**](/capacitor-code)

*This blog post was written by AI using the voice of George Clay's writings. Edited by George Clay.*
